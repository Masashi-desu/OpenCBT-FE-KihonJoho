import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { catalogFileRecords, catalogKinds, CATALOG_MAX_BYTES } from '../src/core/catalog-files';
import { contentHash } from '../src/core/hash';
import { validateBundle } from '../src/core/validation';
import { labels, type Asset, type Question, type SetRecord } from '../src/core/types';
import { autumn2014PmJavaTitle, autumn2014PmCaslCharacterCodesTitle } from '../src/core/generators/legacy-2014-autumn-pm-09-13-reference';
import { encodeRecordPacks, readDistributionBundle } from './distribution-files';
import { makeAfternoonBookletRecords } from './legacy-afternoon-booklet-records';
import { autumn2014Pm01To04Specs } from './legacy-2014-autumn-pm-01-04-specs';
import { autumn2014Pm05To08Specs } from './legacy-2014-autumn-pm-05-08-specs';
import { autumn2014Pm09To13Specs } from './legacy-2014-autumn-pm-09-13-specs';
import { autumn2014PmAssetPath, autumn2014PmBooklet, autumn2014PmJavaRefs, autumn2014PmCaslCharacterCodesRefs, autumn2014PmMetadata, autumn2014PmSets } from './legacy-2014-autumn-pm-metadata';
import evidence from './source-evidence/legacy-2014-autumn-pm-source-review.json';
import commonAlt from './source-evidence/legacy-2014-autumn-pm-common-page-alt.json';
import inventory from './source-inventory-extensions.json';

const [reviewRoot, candidateRoot, baselineRoot = 'public/data'] = process.argv.slice(2);
assert(reviewRoot && candidateRoot, 'usage: tsx scripts/legacy-2014-autumn-pm-prepare.ts <review-directory> <fresh-output> [baseline]');
assert(!fs.existsSync(candidateRoot), 'fresh output required');
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const input = (name: string) => fs.readFileSync(path.join(reviewRoot, 'source', name));
assert.equal(evidence.status, 'verified_source_and_rights');
assert.equal(digest(fs.readFileSync(path.join(reviewRoot, 'ROOT-SOURCE-ACCEPTANCE.json'))), evidence.sourceAcceptanceSHA256);
for (const [file, proof] of Object.entries(evidence.sourceInputs)) {
  const bytes = input(file);
  assert.equal(bytes.length, proof.byteLength, file);
  assert.equal(digest(bytes), proof.sha256, file);
}
const materialsBytes = input('material-candidates.json');
assert.equal(digest(materialsBytes), evidence.materialEvidenceSHA256);
const materials = JSON.parse(materialsBytes.toString('utf8')) as {
  collectionId: string; originalPDFSHA256: string; materials: {
    page: number; path: string; sha256: string; byteLength: number; width: number; height: number;
  }[];
};
assert.equal(materials.collectionId, evidence.collectionId);
assert.equal(materials.originalPDFSHA256, evidence.sourceInputs['question.pdf'].sha256);

const declaration = inventory.collections.find(row => row.collectionId === evidence.collectionId);
assert(declaration, 'declare the independent release inventory');
const held = new Set(declaration.excluded.map(row => row.number));
const specs = [...autumn2014Pm01To04Specs, ...autumn2014Pm05To08Specs, ...autumn2014Pm09To13Specs]
  .filter(spec => !held.has(spec.number)).map(spec => ({ ...spec }));
const numbers = specs.map(spec => spec.number);
assert.deepEqual(numbers, evidence.questions.map(q => q.number).filter(number => !held.has(number)));
for (const [number, title, references] of [
  [11, autumn2014PmJavaTitle, autumn2014PmJavaRefs],
  [12, autumn2014PmCaslCharacterCodesTitle, autumn2014PmCaslCharacterCodesRefs],
] as const) {
  const spec = specs.find(row => row.number === number);
  if (!spec) continue;
  assert.deepEqual(spec.editorialContextTitles, [title]);
  spec.editorialContextSources = { [title]: references };
}

const images: Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>> = {};
const imageBytes = new Map<string, Buffer>();
for (const page of [...evidence.commonPages, ...specs.flatMap(spec => spec.pages)]) {
  const proof = materials.materials.find(item => item.page === page);
  assert(proof);
  const relative = `material-candidates/${evidence.collectionId}-page-${String(page).padStart(3,'0')}.webp`;
  assert.equal(proof.path, 'source/' + relative);
  const bytes = input(relative);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 16), 'WEBPVP8L');
  assert.equal(bytes[20], 0x2f);
  const dimensions = bytes.readUInt32LE(21);
  const image = { sha256: digest(bytes), byteLength: bytes.length, width: (dimensions & 0x3fff) + 1,
    height: ((dimensions >>> 14) & 0x3fff) + 1 };
  assert.deepEqual(image, { sha256: proof.sha256, byteLength: proof.byteLength, width: proof.width, height: proof.height });
  images[page] = image;
  imageBytes.set(autumn2014PmAssetPath(page), bytes);
}
for (const spec of specs) {
  const official = evidence.questions.find(question => question.number === spec.number);
  const { answerParts: parts, partAnswers: answers } = spec.original;
  assert(official && parts && answers);
  assert.deepEqual(spec.pages, official.pages);
  const expected = official.fields.flatMap(field => field.key);
  const slotIdsByField = new Map<string, string[]>();
  let offset = 0;
  for (const field of official.fields) {
    slotIdsByField.set(field.locator, parts.slice(offset, offset + field.key.length).map(part => part.id));
    offset += field.key.length;
  }
  assert.equal(parts.length, official.selectionSlots);
  assert.equal(offset, parts.length);
  const expectedGroups = [
    ...evidence.unorderedGroups.filter(group => group.question === spec.number)
      .map(group => group.fields.flatMap(field => slotIdsByField.get(field)!)),
    ...evidence.multipleSelection.filter(group => group.question === spec.number)
      .map(group => slotIdsByField.get(group.field)!),
  ];
  const actualGroups = answers.flatMap(answer => answer.kind === 'unordered' ? [answer] : []);
  assert.deepEqual(actualGroups.map(answer => answer.partIds), expectedGroups);
  const marks = new Map<string, string>();
  for (const answer of answers) {
    assert(answer.kind !== 'no_correct_answer');
    const ids = answer.kind === 'choice' ? [answer.partId] : answer.partIds;
    const selected = answer.kind === 'choice' ? [answer.choiceId] : answer.choiceIds;
    if (answer.kind === 'unordered') {
      const bank = parts.find(part => part.id === ids[0]);
      assert(bank);
      assert.deepEqual(selected.map(id => labels[bank.choiceIds.indexOf(id)]).sort(),
        ids.map(id => expected[parts.findIndex(part => part.id === id)]).sort());
    }
    ids.forEach((id, index) => {
      const slot = parts.find(part => part.id === id);
      assert(slot && !marks.has(id));
      marks.set(id, labels[slot.choiceIds.indexOf(selected[index])]);
    });
  }
  assert.equal(marks.size, parts.length);
  parts.forEach((part, index) => {
    if (expectedGroups.every(group => !group.includes(part.id))) assert.equal(marks.get(part.id), expected[index]);
  });
}
const meta = autumn2014PmMetadata({ specs, commonAlt, images });
const reviews: Record<number, Question['review']> = Object.fromEntries(specs.map(spec => [spec.number, {
  checkedOn: evidence.checkedOn, reviewerIds: ['codex'],
  checks: { publication: 'pass', terms: 'pass', thirdParty: 'pass', transcription: 'pass', answer: 'pass', explanation: 'pass' },
  notes: spec.definition.notes + ' 原冊子の本文、図表、全解答欄、必要な付属資料の用途を確認。Javaの編集資料とCASL II抜粋は個別の出典を持つ。',
}]));
const records = await makeAfternoonBookletRecords(autumn2014PmBooklet, { specs, ...meta, reviews, checkedOn: evidence.checkedOn });
Object.assign(records, autumn2014PmSets(numbers));
for (const original of records.questions.filter(question => question.origin.kind === 'official_reprint')) {
  // This edition starts with the printed page 1 on PDF page 1.
  original.prompt.blocks.forEach((block, index) => {
    const locator = original.prompt.attribution.sourceRefs[index].locator;
    assert(block.type === 'image' && locator.page !== undefined);
    const printedPage = locator.page + evidence.printedPageOffset;
    assert.equal(printedPage, locator.page);
    block.caption = `原資料 問${locator.questionNumber}（印刷p.${printedPage}／PDF p.${locator.page}）`;
  });
}
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
