import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import type { Bundle, Question } from '../src/core/types';
import { catalogFileRecords, catalogKinds, CATALOG_MAX_BYTES } from '../src/core/catalog-files';
import { hasAssetSignature } from '../src/core/asset-signature';
import { contentHash } from '../src/core/hash';
import { isOfficialBookletQuestion } from '../src/core/official-booklet';
import { encodeRecordPacks, readDistributionBundle } from './distribution-files';
import type { Stage3MorningRecords } from './stage3-morning-records';

type AddedRecords = Pick<Stage3MorningRecords, 'questions' | 'templates' | 'assets' | 'rights' | 'sources'>;
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const ref = (q: Question) => ({ questionId: q.id, revision: q.revision });
const originalNumber = (id: string) => Number(id.split('-').at(-1));

/** Update one already distributed booklet. Preserve the old question records,
 * add the new originals in paper order and append only proven mix bindings. */
export async function installMorningSupplement(dataDir: string, bundle: Bundle, collection: string,
    additions: AddedRecords, assetFiles: ReadonlyMap<string, string>) {
  const catalogPath = path.join(dataDir, 'catalog.json');
  assert.equal(sha256(fs.readFileSync(catalogPath)), bundle.catalogHash);
  const annual = bundle.sets.find(set => set.id === 'set-annual-' + collection);
  const mix = bundle.sets.find(set => set.id === 'set-mix-a');
  assert(annual?.distribution === 'included' && mix?.distribution === 'included' && annual.subject === 'A');
  const next = structuredClone(additions);
  const originals = next.questions.filter(isOfficialBookletQuestion);
  assert(originals.length && next.questions.length === originals.length * 2 && next.templates.length === originals.length &&
    assetFiles.size === next.assets.length);
  const count = annual.questionRefs.length + originals.length;
  assert(count <= 80);
  for (const q of next.questions) {
    assert(q.subject === 'A' && q.revision === 1 && Object.values(q.review.checks).every(value => value === 'pass'));
    q.distribution = 'included';
  }
  for (const template of next.templates) {
    const base = next.questions.find(q => q.id === template.baseQuestionRef.questionId);
    assert(base?.origin.kind === 'official_adaptation' && base.revision === template.baseQuestionRef.revision);
    const number = originalNumber(base.id), source = collection + '-' + number;
    assert(Number.isInteger(number) && number >= 1 && number <= 80);
    assert.equal(base.id, 'question-template-source-' + source);
    assert.equal(template.id, 'template-source-' + source);
    assert.equal(template.generatorRef.id, 'generator-source-' + source);
    const original = originals.find(q => q.id === 'question-ipa-' + source);
    assert(original && isDeepStrictEqual(base.origin.derivedFrom, [ref(original)]));
    if (original.origin.kind === 'official_reprint') {
      const asset = next.assets.find(a => a.id === 'asset-ipa-' + source);
      assert(asset && original.assetRefs.includes(asset.id) && assetFiles.has(asset.path));
    }
    template.distribution = 'included';
    template.originalContentSha256 = await contentHash(base);
  }
  assert(new Set(next.templates.map(t => t.baseQuestionRef.questionId)).size === originals.length);
  assert(next.rights.every(right => Object.values(right.uses).every(use => use === 'allowed')));
  const bindings = next.templates.map(template => ({
    questionRef: template.baseQuestionRef, templateRef: { id: template.id, revision: template.revision },
  }));
  const examConfigRefs = annual.examConfigRefs.map(config => ({ ...config, revision: config.revision + 1 }));
  const exams = bundle.exams.filter(exam => annual.examConfigRefs.some(config => config.id === exam.id && config.revision === exam.revision));
  assert.equal(exams.length, 2);
  assert(exams.every(exam => exam.questionCount === annual.questionRefs.length && exam.subject === 'A'));
  const successors = new Map<string, unknown>([
    [annual.id, { ...annual, revision: annual.revision + 1, examConfigRefs,
      questionRefs: [...annual.questionRefs, ...originals.map(ref)].sort((a, b) => originalNumber(a.questionId) - originalNumber(b.questionId)) }],
    [mix.id, { ...mix, revision: mix.revision + 1, questionRefs: [...mix.questionRefs, ...bindings.map(binding => binding.questionRef)],
      generationBindings: [...mix.generationBindings, ...bindings] }],
    ...exams.map(exam => [exam.id, { ...exam, revision: exam.revision + 1, questionCount: count,
      ...(exam.mode === 'practice' ? { practiceScope: count === 80 ? 'full_exam' : 'public_subset' } : {}) }] as const),
  ]);
  const catalog = structuredClone(bundle.catalog), writes = new Map<string, Uint8Array>();
  catalog.revision++;
  const addRecords = { ...next, exams: [], sets: [] };
  const obsolete = [];
  for (const kind of catalogKinds) {
    const known = new Map(bundle[kind].map(row => [row.id, row] as const));
    const records = addRecords[kind].filter(row => {
      const prior = known.get(row.id);
      if (!prior) return true;
      assert(['rights', 'sources'].includes(kind) && isDeepStrictEqual(prior, row), 'existing record collision: ' + row.id);
      return false;
    });
    assert.equal(new Set(records.map(row => row.id)).size, records.length);
    const upcoming = [];
    for (const entry of catalog.files[kind]) {
      const previous = fs.readFileSync(path.join(dataDir, entry.path));
      assert.equal(sha256(previous), entry.sha256);
      const pack = catalogFileRecords(entry, JSON.parse(previous.toString('utf8'))) as { id: string }[];
      if (pack.every(row => !successors.has(row.id))) upcoming.push(entry);
      else {
        obsolete.push(entry.path);
        for (const { entry: replacement, bytes } of encodeRecordPacks(kind, pack.map(row => successors.get(row.id) ?? row))) {
          upcoming.push(replacement);
          writes.set(replacement.path, bytes);
        }
      }
    }
    for (const { entry, bytes } of encodeRecordPacks(kind, records)) {
      upcoming.push(entry);
      writes.set(entry.path, bytes);
    }
    assert.equal(new Set(upcoming.map(entry => entry.path)).size, upcoming.length);
    assert(upcoming.length <= 500);
    catalog.files[kind] = upcoming;
  }
  for (const asset of next.assets) {
    assert(next.questions.some(question => question.assetRefs.includes(asset.id)), 'unreferenced supplementary asset');
    assert(/^assets\/[a-z0-9/_-]+\.png$/.test(asset.path) && !asset.path.includes('//'));
    const filename = assetFiles.get(asset.path);
    assert(filename);
    const bytes = fs.readFileSync(filename);
    assert(sha256(bytes) === asset.sha256 && bytes.length === asset.byteLength && hasAssetSignature(asset, bytes));
    writes.set(asset.path, bytes);
  }
  const catalogBytes = Buffer.from(JSON.stringify(catalog, null, 2) + '\n');
  assert(catalogBytes.length <= CATALOG_MAX_BYTES);
  const temporary = path.join(dataDir, '.supplement-catalog.json');
  assert(!fs.existsSync(temporary));
  assert([...writes.keys()].every(relative => !fs.existsSync(path.join(dataDir, relative))));
  const written = [];
  try {
    for (const [relative, bytes] of writes) {
      const target = path.join(dataDir, relative);
      fs.writeFileSync(target, bytes, { flag: 'wx' });
      written.push(target);
    }
    fs.writeFileSync(temporary, catalogBytes, { flag: 'wx' });
    written.push(temporary);
    fs.renameSync(temporary, catalogPath);
  } catch (error) {
    for (const file of written) fs.unlinkSync(file);
    throw error;
  }
  for (const file of obsolete) fs.unlinkSync(path.join(dataDir, file));
  const installed = readDistributionBundle(dataDir);
  assert.equal(installed.questions.length, bundle.questions.length + originals.length * 2);
  return { count, newQuestions: originals.map(q => q.id), catalogSHA256: installed.catalogHash };
}
