import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { catalogFileRecords, catalogKinds, CATALOG_MAX_BYTES } from '../src/core/catalog-files';
import { contentHash } from '../src/core/hash';
import { validateBundle } from '../src/core/validation';
import { labels, type Asset, type Question, type SetRecord } from '../src/core/types';
import { encodeRecordPacks, readDistributionBundle } from './distribution-files';
import { makeAfternoonBookletRecords, type Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2008Pm01To05Specs } from './legacy-2008-autumn-pm-01-05-specs';
import { autumn2008Pm06To09Specs } from './legacy-2008-autumn-pm-06-09-specs';
import { autumn2008Pm10To13Specs } from './legacy-2008-autumn-pm-10-13-specs';
import { autumn2008PmAssetPath, autumn2008PmBooklet, autumn2008PmCommentaryRef,
  autumn2008PmMetadata, autumn2008PmSets } from './legacy-2008-autumn-pm-metadata';
import evidence from './source-evidence/legacy-2008-autumn-pm-source-review.json';
import commonAlt from './source-evidence/legacy-2008-autumn-pm-common-page-alt.json';
import inventory from './source-inventory-extensions.json';

const [reviewRoot, candidateRoot, baselineRoot = 'public/data'] = process.argv.slice(2);
assert(reviewRoot && candidateRoot, 'usage: tsx scripts/legacy-2008-autumn-pm-prepare.ts <review-directory> <fresh-output> [baseline]');
assert(!fs.existsSync(candidateRoot), 'fresh output required');
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const input = (name: string) => fs.readFileSync(path.join(reviewRoot, 'source', name));
assert.equal(evidence.status, 'verified_source_and_rights');
assert.equal(digest(fs.readFileSync(path.join(reviewRoot, 'ROOT-SOURCE-ACCEPTANCE.json'))), evidence.sourceAcceptanceSHA256);
for (const [file, proof] of Object.entries(evidence.sourceInputs)) {
  const bytes = input(file);
  assert.deepEqual([bytes.length, digest(bytes)], [proof.byteLength, proof.sha256], file);
}
const materialsBytes = input('material-candidates.json');
assert.equal(digest(materialsBytes), evidence.materialEvidenceSHA256);
const materials = JSON.parse(materialsBytes.toString('utf8')) as {
  collectionId: string; originalPDFSHA256: string; materials: {
    page: number; path: string; sha256: string; byteLength: number; width: number; height: number; crop: number[] | null;
  }[];
};
assert.equal(materials.collectionId, evidence.collectionId);
assert.equal(materials.originalPDFSHA256, evidence.sourceInputs['questions.pdf'].sha256);
assert.deepEqual(materials.materials.filter(item => item.crop).map(item => [item.page, item.crop]),
  [[evidence.caslExcerpt.page, evidence.caslExcerpt.box]]);

const declaration = inventory.collections.find(row => row.collectionId === evidence.collectionId);
assert(declaration, 'declare the independent release inventory');
const held = new Set(declaration.excluded.map(row => row.number));
assert.deepEqual([...held], evidence.held.map((item: { number: number }) => item.number));
const specs: Stage3AfternoonQuestionSpec[] = [...autumn2008Pm01To05Specs, ...autumn2008Pm06To09Specs, ...autumn2008Pm10To13Specs]
  .filter(spec => !held.has(spec.number));
const numbers = specs.map(spec => spec.number);
assert.deepEqual(numbers, evidence.questions.map(q => q.number).filter(number => !held.has(number)));
const approvedPages = Object.keys(evidence.assetSHA256ByPage).map(Number);
const materialPages = [...evidence.commonPages, ...specs.flatMap(spec => spec.pages)].sort((a, b) => a - b);
assert.equal(new Set(materialPages).size, materialPages.length);
assert.deepEqual(approvedPages, materialPages);
const images: Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>> = {};
const imageBytes = new Map<string, Buffer>();
for (const page of materialPages) {
  const proof = materials.materials.find(item => item.page === page);
  assert(proof);
  const relative = `material-candidates/${evidence.collectionId}-page-${String(page).padStart(3, '0')}.webp`;
  assert.equal(proof.path, 'source/' + relative);
  const bytes = input(relative);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 16), 'WEBPVP8L');
  assert.equal(bytes[20], 0x2f);
  const dimensions = bytes.readUInt32LE(21);
  const image = { sha256: digest(bytes), byteLength: bytes.length,
    width: (dimensions & 0x3fff) + 1, height: ((dimensions >>> 14) & 0x3fff) + 1 };
  assert.deepEqual(image, { sha256: proof.sha256, byteLength: proof.byteLength, width: proof.width, height: proof.height });
  images[page] = image;
  imageBytes.set(autumn2008PmAssetPath(page), bytes);
}

for (const spec of specs) {
  const official = evidence.questions.find(question => question.number === spec.number);
  const { answerParts: parts, partAnswers: answers } = spec.original;
  assert(official && official.materialDecision.status === 'allowed' && parts && answers);
  assert.deepEqual(spec.pages, official.pages);
  assert.equal(parts.length, official.selectionMarks, `問${spec.number} の選択マーク数`);
  assert.equal(answers.length, official.answerSlots, `問${spec.number} の採点欄数`);
  let offset = 0;
  for (const field of official.fields) {
    const bank = parts.slice(offset, offset + field.key.length);
    offset += field.key.length;
    const ids = bank.map(part => part.id);
    const answer = answers.find(item => item.kind === 'unordered'
      ? ids.length > 1 && JSON.stringify(item.partIds) === JSON.stringify(ids)
      : item.kind === 'choice' && ids.length === 1 && item.partId === ids[0]);
    assert(answer && answer.kind !== 'no_correct_answer', `問${spec.number} ${field.locator}`);
    if (answer.kind === 'choice') {
      assert.equal(field.scoring, 'one_choice');
      assert.deepEqual([labels[bank[0].choiceIds.indexOf(answer.choiceId)]], field.key);
    } else {
      assert.equal(field.scoring, 'unordered_one_field');
      assert.equal(answer.presentation, 'checklist');
      assert(bank.every(part => JSON.stringify(part.choiceIds) === JSON.stringify(bank[0].choiceIds)));
      assert.deepEqual(answer.choiceIds.map(id => labels[bank[0].choiceIds.indexOf(id)]).sort(), [...field.key].sort());
    }
  }
  assert.equal(offset, parts.length);
}

const meta = autumn2008PmMetadata({ specs, commonAlt, images });
const reviews: Record<number, Question['review']> = Object.fromEntries(specs.map(spec => [spec.number, {
  checkedOn: evidence.checkedOn, reviewerIds: ['codex'],
  checks: { publication: 'pass', terms: 'pass', thirdParty: 'pass', transcription: 'pass', answer: 'pass', explanation: 'pass' },
  notes: spec.definition.notes + ' 原冊子の本文・図表、公式解答例、付属資料を個別に照合した。',
}]));
const records = await makeAfternoonBookletRecords(autumn2008PmBooklet, { specs, ...meta, reviews, checkedOn: evidence.checkedOn });
assert.equal(records.assets.length, materialPages.length, '配布素材は使用する頁と一対一');
for (const question of records.questions) {
  const number = Number(question.origin.sourceRefs[0].locator.questionNumber);
  assert(numbers.includes(number));
  question.explanation.attribution.sourceRefs.push(autumn2008PmCommentaryRef(number));
}
Object.assign(records, autumn2008PmSets(numbers));
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
