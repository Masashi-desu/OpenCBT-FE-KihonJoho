import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { catalogFileRecords, catalogKinds, CATALOG_MAX_BYTES } from '../src/core/catalog-files';
import { contentHash } from '../src/core/hash';
import { validateBundle } from '../src/core/validation';
import { labels, type Asset, type Question, type SetRecord } from '../src/core/types';
import { spring2015PmJavaTitle } from '../src/core/generators/legacy-2015-spring-pm-09-13-java-reference';
import { encodeRecordPacks, readDistributionBundle } from './distribution-files';
import { makeAfternoonBookletRecords } from './legacy-afternoon-booklet-records';
import { spring2015Pm01To04Specs } from './legacy-2015-spring-pm-01-04-specs';
import { spring2015Pm05To08Specs } from './legacy-2015-spring-pm-05-08-specs';
import { spring2015Pm09To13Specs } from './legacy-2015-spring-pm-09-13-specs';
import { spring2015PmAssetPath, spring2015PmBooklet, spring2015PmJavaRefs, spring2015PmMetadata, spring2015PmSets } from './legacy-2015-spring-pm-metadata';
import evidence from './source-evidence/legacy-2015-spring-pm-source-review.json';
import commonAlt from './source-evidence/legacy-2015-spring-pm-common-page-alt.json';
import inventory from './source-inventory-extensions.json';

const [reviewRoot, candidateRoot, baselineRoot = 'public/data'] = process.argv.slice(2);
assert(reviewRoot && candidateRoot, 'usage: tsx scripts/legacy-2015-spring-pm-prepare.ts <review-directory> <fresh-output> [baseline]');
assert(!fs.existsSync(candidateRoot), 'fresh output required');
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const input = (name: string) => fs.readFileSync(path.join(reviewRoot, 'source', name));
for (const [file, proof] of [['question.pdf', evidence.questionPaper], ['answer.pdf', evidence.answerPaper],
  ['commentary.pdf', evidence.commentary], ['listing.html', evidence.officialListing], ['faq.html', evidence.rights]] as const)
  assert.equal(digest(input(file)), proof.sha256, file);

const declaration = inventory.collections.find(row => row.collectionId === evidence.collectionId);
assert(declaration, 'declare the independent release inventory');
const held = new Set(declaration.excluded.map(row => row.number));
const specs = [...spring2015Pm01To04Specs, ...spring2015Pm05To08Specs, ...spring2015Pm09To13Specs]
  .filter(spec => !held.has(spec.number)).map(spec => ({ ...spec }));
const numbers = specs.map(spec => spec.number);
assert.deepEqual(numbers, evidence.questions.map(q => q.number).filter(number => !held.has(number)));
const java = specs.find(spec => spec.number === 11);
if (java) {
  assert.deepEqual(java.editorialContextTitles, [spring2015PmJavaTitle]);
  java.editorialContextSources = { [spring2015PmJavaTitle]: spring2015PmJavaRefs };
}

const images: Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>> = {};
const imageBytes = new Map<string, Buffer>();
for (const page of [2, 4, 5, ...specs.flatMap(spec => spec.pages), ...Array.from({ length: 12 }, (_, index) => 69 + index)]) {
  const assetPath = spring2015PmAssetPath(page);
  const bytes = input(`material-candidates/${path.basename(assetPath)}`);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 16), 'WEBPVP8L');
  assert.equal(bytes[20], 0x2f);
  const dimensions = bytes.readUInt32LE(21);
  images[page] = { sha256: digest(bytes), byteLength: bytes.length,
    width: (dimensions & 0x3fff) + 1, height: ((dimensions >>> 14) & 0x3fff) + 1 };
  imageBytes.set(assetPath, bytes);
}
const meta = spring2015PmMetadata({ specs, commonAlt, images });
for (const spec of specs) {
  const row = evidence.questions.find(question => question.number === spec.number);
  assert(row && spec.original.answerParts && spec.original.partAnswers);
  assert.equal(spec.original.answerParts.length, row.selectionSlots, `Q${spec.number} answer fields`);
  assert.equal(spec.original.partAnswers.length, row.answerRows, `Q${spec.number} official key rows`);
  const marks = spec.original.answerParts.map(part => {
    const answer = spec.original.partAnswers!.find(value => value.kind === 'choice' && value.partId === part.id);
    assert(answer?.kind === 'choice');
    return labels[part.choiceIds.indexOf(answer.choiceId)];
  }).join('');
  assert.equal(marks, row.keys, `Q${spec.number} official answer labels`);
}
const reviews: Record<number, Question['review']> = Object.fromEntries(specs.map(spec => [spec.number, {
  checkedOn: evidence.checkedOn, reviewerIds: ['codex'],
  checks: { publication: 'pass', terms: 'pass', thirdParty: 'pass', transcription: 'pass', answer: 'pass', explanation: 'pass' },
  notes: spec.definition.notes + ' 原冊子の本文、図表、全解答欄、必要な付属資料の用途を確認。Javaの編集資料とCASL II抜粋は個別の出典を持つ。',
}]));
const records = await makeAfternoonBookletRecords(spring2015PmBooklet, { specs, ...meta, reviews, checkedOn: evidence.checkedOn });
Object.assign(records, spring2015PmSets(numbers));
for (const kind of ['questions', 'templates', 'sets'] as const)
  for (const record of records[kind]) record.distribution = 'included';
for (const template of records.templates) {
  const base = records.questions.find(q => q.id === template.baseQuestionRef.questionId);
  assert(base);
  template.originalContentSha256 = await contentHash(base);
}

const before = readDistributionBundle(baselineRoot);
const candidate = structuredClone(before);
const retainedIds = new Set(catalogKinds.flatMap(kind => before[kind].map(record => record.id)));
const additions = catalogKinds.flatMap(kind => records[kind].map(record => record.id));
assert(new Set(additions).size === additions.length && additions.every(id => !retainedIds.has(id)));
const oldMix = candidate.sets.find(set => set.id === 'set-mix-b');
assert(oldMix);
oldMix.revision++;
for (const template of records.templates) {
  oldMix.questionRefs.push(template.baseQuestionRef);
  oldMix.generationBindings.push({ questionRef: template.baseQuestionRef, templateRef: { id: template.id, revision: template.revision } });
}
for (const kind of catalogKinds) {
  const group = candidate[kind] as { id: string }[];
  group.push(...records[kind]);
}
await validateBundle(candidate);

const write = (relative: string, bytes: Uint8Array) => {
  const destination = path.join(candidateRoot, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes, { flag: 'wx' });
};
let replacedMixPack = false;
for (const kind of catalogKinds) {
  const files = [];
  for (const entry of before.catalog.files[kind]) {
    const bytes = fs.readFileSync(path.join(baselineRoot, entry.path));
    assert.equal(digest(bytes), entry.sha256);
    const setRows = kind === 'sets' ? catalogFileRecords(entry, JSON.parse(bytes.toString('utf8'))) as SetRecord[] : [];
    if (setRows.some(set => set.id === oldMix.id)) {
      assert(!replacedMixPack);
      for (const pack of encodeRecordPacks(kind, setRows.map(set => set.id === oldMix.id ? oldMix : set))) {
        write(pack.entry.path, pack.bytes);
        files.push(pack.entry);
      }
      replacedMixPack = true;
    } else {
      write(entry.path, bytes);
      files.push(entry);
    }
  }
  for (const pack of encodeRecordPacks(kind, records[kind])) {
    write(pack.entry.path, pack.bytes);
    files.push(pack.entry);
  }
  assert(files.length <= 500);
  candidate.catalog.files[kind] = files;
}
assert(replacedMixPack);
const retainedAssets = new Set(before.assets.map(asset => asset.path));
assert(records.assets.every(asset => !retainedAssets.has(asset.path)), 'new material paths must be distinct');
const writtenAssets = new Map<string, string>();
for (const asset of candidate.assets) {
  const prior = writtenAssets.get(asset.path);
  if (prior) {
    assert.equal(prior, asset.sha256, `shared material ${asset.path}`);
    continue;
  }
  const bytes = retainedAssets.has(asset.path) ? fs.readFileSync(path.join(baselineRoot, asset.path)) : imageBytes.get(asset.path);
  assert(bytes && bytes.length === asset.byteLength && digest(bytes) === asset.sha256, asset.id);
  write(asset.path, bytes);
  writtenAssets.set(asset.path, asset.sha256);
}
candidate.catalog.revision++;
const catalogBytes = Buffer.from(JSON.stringify(candidate.catalog, null, 2) + '\n');
assert(catalogBytes.length <= CATALOG_MAX_BYTES);
write('catalog.json', catalogBytes);
const packed = readDistributionBundle(candidateRoot);
for (const kind of catalogKinds) assert.deepEqual(packed[kind], candidate[kind]);
console.log(JSON.stringify({ candidateRoot, originals: numbers, generated: records.templates.length,
  assets: records.assets.length, revision: candidate.catalog.revision, catalogSHA256: digest(catalogBytes) }));
