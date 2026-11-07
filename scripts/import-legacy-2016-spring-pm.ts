import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { encodeRecordPacks, readDistributionBundle } from './distribution-files';
import { makeAfternoonBookletRecords } from './legacy-afternoon-booklet-records';
import { spring2016Pm01To04Specs } from './legacy-2016-spring-pm-01-04-specs';
import { spring2016Pm05To08Specs } from './legacy-2016-spring-pm-05-08-specs';
import { spring2016Pm09To13Specs } from './legacy-2016-spring-pm-09-13-specs';
import { spring2016PmAssetPath, spring2016PmBooklet, spring2016PmJavaRefs, spring2016PmMetadata, spring2016PmSets } from './legacy-2016-spring-pm-metadata';
import commonAlt2016Autumn from './source-evidence/legacy-2016-autumn-pm-common-page-alt.json';
import evidence from './source-evidence/legacy-2016-spring-pm-source-review.json';
import { validateBundle } from '../src/core/validation';
import { contentHash } from '../src/core/hash';
import type { Asset, Question } from '../src/core/types';

const [inputRoot, distributionRoot = 'public/data'] = process.argv.slice(2);
assert(inputRoot, 'usage: tsx scripts/import-legacy-2016-spring-pm.ts <source-directory> [distribution-directory]');
const source = (name: string) => fs.readFileSync(path.join(inputRoot, name));
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
for (const [file, expected] of [
  ['question.pdf', evidence.questionPaper], ['answer.pdf', evidence.answerPaper],
  ['faq.html', evidence.rights], ['listing.html', evidence.officialListing],
] as const) assert.equal(sha256(source(file)), expected.sha256, file);

const specs = [...spring2016Pm01To04Specs, ...spring2016Pm05To08Specs, ...spring2016Pm09To13Specs];
const numbers = specs.map(s => s.number);
assert.deepEqual(numbers, evidence.questions.map(q => q.number));
const java = specs.find(s => s.number === 11)!;
assert.equal(java.editorialContextTitles?.length, 1, 'the separately written Java API reference is required');
java.editorialContextSources = { [java.editorialContextTitles![0]]: spring2016PmJavaRefs };
// The matching 2016 autumn tables were compared page by page against the spring
// originals. Use their transcriptions only for the matching exam-owned sheets.
const commonAlt = {
  ...commonAlt2016Autumn,
  2: '平成28年4月17日実施、基本情報技術者試験午後、問7の正誤表。冊子32頁、表2の上から3行目。誤「1,240人」を正「1,240回」に訂正する。画像の向きを90度回転して表示している。',
};
const images: Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>> = {};
const imageBytes = new Map<string, Buffer>();
for (const page of [2, 4, 5, ...specs.flatMap(s => s.pages), ...Array.from({ length: 12 }, (_, i) => 71 + i)]) {
  const name = spring2016PmAssetPath(page);
  const bytes = source(name);
  const digest = sha256(bytes);
  assert.equal(digest, (evidence.assetSHA256ByPage as Record<number, string>)[page], `reviewed bytes for PDF p.${page}`);
  // Only lossless VP8L is admitted, so dimensions can be read directly from
  // the image header and compared with the reviewed source page or crop.
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 16), 'WEBPVP8L');
  assert.equal(bytes[20], 0x2f);
  const dimensions = bytes.readUInt32LE(21);
  images[page] = { sha256: digest, byteLength: bytes.length,
    width: (dimensions & 0x3fff) + 1, height: ((dimensions >>> 14) & 0x3fff) + 1 };
  imageBytes.set(name, bytes);
}
const meta = spring2016PmMetadata({ specs, commonAlt, images });
const reviews: Record<number, Question['review']> = Object.fromEntries(specs.map(spec => [spec.number, {
  checkedOn: evidence.checkedOn, reviewerIds: ['codex'],
  checks: { publication: 'pass', terms: 'pass', thirdParty: 'pass', transcription: 'pass', answer: 'pass', explanation: 'pass' },
  notes: spec.definition.notes + ' 公式冊子の対象ページ・解答例の全欄・素材条件と照合。第三者文書に近いJava付属資料の原画像およびJIS文字の符号表は配布外。',
}]));
const records = await makeAfternoonBookletRecords(spring2016PmBooklet, { specs, ...meta, reviews, checkedOn: evidence.checkedOn });
Object.assign(records, spring2016PmSets(numbers));
for (const kind of ['questions', 'templates', 'sets'] as const) {
  for (const record of records[kind]) record.distribution = 'included';
}
for (const template of records.templates) {
  const base = records.questions.find(q => q.id === template.baseQuestionRef.questionId);
  assert(base);
  template.originalContentSha256 = await contentHash(base);
}
const root = path.resolve(distributionRoot);
const before = readDistributionBundle(root);
const bundle = structuredClone(before);
const kinds = ['questions', 'templates', 'assets', 'sources', 'rights', 'sets', 'exams'] as const;
for (const kind of kinds) {
  const retained = bundle[kind] as { id: string }[];
  const added = records[kind] as { id: string }[];
  assert(!added.some(row => retained.some(prior => prior.id === row.id)), `existing ${kind} must stay untouched`);
  retained.push(...added);
}
const mix = bundle.sets.find(s => s.id === 'set-mix-b');
assert(mix);
mix.revision++;
for (const t of records.templates) {
  mix.questionRefs.push(t.baseQuestionRef);
  mix.generationBindings.push({ questionRef: t.baseQuestionRef, templateRef: { id: t.id, revision: t.revision } });
}
await validateBundle(bundle);

const keep = new Set<string>();
const writeNew = (name: string, bytes: Buffer) => {
  const destination = path.join(root, name);
  if (fs.existsSync(destination)) {
    assert.deepEqual(fs.readFileSync(destination), bytes, name);
    return;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes, { flag: 'wx' });
};
for (const asset of records.assets) {
  const bytes = imageBytes.get(asset.path);
  assert(bytes);
  writeNew(asset.path, bytes);
}
for (const kind of kinds) {
  const packs = encodeRecordPacks(kind, bundle[kind]);
  for (const pack of packs) {
    writeNew(pack.entry.path, pack.bytes);
    keep.add(pack.entry.path);
  }
  bundle.catalog.files[kind] = packs.map(pack => pack.entry);
}
bundle.catalog.revision++;
const catalogNext = path.join(root, '.catalog-next.json');
fs.writeFileSync(catalogNext, JSON.stringify(bundle.catalog, null, 2) + '\n', { flag: 'wx' });
fs.renameSync(catalogNext, path.join(root, 'catalog.json'));
for (const prior of Object.values(before.catalog.files).flat()) {
  if (keep.has(prior.path)) continue;
  const file = path.join(root, prior.path);
  assert.equal(sha256(fs.readFileSync(file)), prior.sha256);
  fs.unlinkSync(file);
}
const installed = readDistributionBundle(root);
for (const kind of kinds) assert.deepEqual(installed[kind], bundle[kind]);
console.log(`S3-004 candidate: ${specs.length} originals and generators, ${records.assets.length} individually reviewed assets. Release checks remain required.`);
