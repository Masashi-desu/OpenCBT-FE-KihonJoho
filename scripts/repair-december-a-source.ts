// Apply only reviewed question crops. Re-running on corrected data is a no-op.
// No historical question bodies are retained; old runs use revision checks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readDistributionBundle, encodeRecordPacks } from './distribution-files';
import { catalogKinds } from '../src/core/catalog-files';
import { contentHash } from '../src/core/hash';
import { refOf, type Ref } from '../src/core/types';

const input = path.resolve(process.argv[2] ?? 'output/source-import/dec-a');
const root = path.resolve(process.argv[3] ?? 'public/data');
const b = readDistributionBundle(root), before = structuredClone(b);
const boundary = JSON.parse(fs.readFileSync(new URL('./source-evidence/december-a-question-boundaries.json', import.meta.url), 'utf8'));
const pages = JSON.parse(fs.readFileSync(path.join(input, 'pages.json'), 'utf8'));
const digest = (v: Uint8Array | string) => createHash('sha256').update(v).digest('hex');
const references = new Map<string, Ref>();
const replacements: { path: string; bytes: Buffer }[] = [];
const at = '2026-11-03T00:00:00Z';
assert.equal(b.sources.find(s => s.id === boundary.sourceId)!.sha256, boundary.sourceSha256);
for (const item of boundary.questions) {
  const q = b.questions.find(q => q.id === `question-ipa-sample-2022-dec-a-${item.number}`)!;
  const rendered = pages.find((p: { number: number; page: number }) => p.number === item.number && p.page === item.page);
  assert(rendered, q.id);
  assert.deepEqual(rendered.pixelCrop, item.pixelCrop);
  assert.equal(digest(rendered.text), item.textSha256);
  assert.deepEqual([...rendered.text.matchAll(/(?:^|\n)\s*問\s*([0-9０-９]+)(?=\s|$)/gu)].map(m => Number(m[1].normalize('NFKC'))), [item.number]);
  const bytes = fs.readFileSync(path.join(input, rendered.name));
  assert.equal(digest(bytes), rendered.sha256);
  assert.equal(rendered.sha256, item.imageSha256);
  assert.equal(bytes.length, rendered.byteLength);
  assert.equal(rendered.width, item.pixelCrop[2] - item.pixelCrop[0]);
  assert.equal(rendered.height, item.pixelCrop[3] - item.pixelCrop[1]);
  const image = q.prompt.blocks[0], text = q.prompt.blocks[1];
  assert(image.type === 'image' && text.type === 'code' && text.language === 'text');
  const asset = b.assets.find(a => a.id === image.assetId)!;
  if (asset.sha256 === rendered.sha256 && text.text === rendered.text) continue;
  // Common notation blocks and their shared assets are deliberately untouched.
  assert.equal(asset.attribution.sourceRefs[0].locator.questionNumber, String(item.number));
  Object.assign(asset, { sha256: rendered.sha256, width: rendered.width, height: rendered.height, byteLength: rendered.byteLength,
    alt: `2022年12月公表FE科目Aサンプル問題 問${item.number} 原資料p.${item.page}。該当問題の本文・前提・図表・解答群だけを切り出し、隣接問題を含めない。補助文字と出典PDFも参照できる。` });
  text.text = rendered.text;
  q.revision++;
  q.origin.changes.push({ at, actorId: 'codex', kind: 'layout', summary: '原画像と補助文字の範囲を問題単位へ訂正',
    details: '査読済みの同一矩形で画像化・文字抽出し、同一ページにある別問題の混入を除去。本文・前提・図表・全選択肢を保持。共通表記は別ページに保持。', affectsAnswer: false });
  q.review.checkedOn = '2026-11-03';
  q.review.notes = '公式PDFの問題別矩形と全60問の画像を照合。画像と補助文字を同じ範囲へ限定し、別問題の見出し・本文・選択肢の不在、該当問題の全内容・注記の保持、プレビューと検索の対応を検査。共通表記p.2〜3と出典・権利・全正答・独自解説は保持。同一AIの査読であり第三者の独立査読ではない。';
  references.set(q.id, refOf(q));
  replacements.push({ path: path.join(root, asset.path), bytes });
}
if (!references.size) {
  console.log('Question crops and text are already current; revisions preserved.');
  process.exit(0);
}
// Only provenance changes in generated bases; their bodies and generator
// versions stay byte-for-byte identical. Keep live references and hashes valid.
for (const q of b.questions) {
  if (!q.origin.derivedFrom.some(ref => references.has(ref.questionId))) continue;
  q.origin.derivedFrom = q.origin.derivedFrom.map(ref => references.get(ref.questionId) ?? ref);
  q.revision++;
  references.set(q.id, refOf(q));
}
const templateRevisions = new Map<string, number>();
for (const t of b.templates) {
  const ref = references.get(t.baseQuestionRef.questionId);
  if (!ref) continue;
  t.baseQuestionRef = ref;
  t.revision++;
  t.originalContentSha256 = await contentHash(b.questions.find(q => q.id === ref.questionId)!);
  templateRevisions.set(t.id, t.revision);
}
for (const s of b.sets) {
  if (!s.questionRefs.some(ref => references.has(ref.questionId))) continue;
  s.questionRefs = s.questionRefs.map(ref => references.get(ref.questionId) ?? ref);
  s.generationBindings = s.generationBindings.map(binding => ({
    questionRef: references.get(binding.questionRef.questionId) ?? binding.questionRef,
    templateRef: { ...binding.templateRef, revision: templateRevisions.get(binding.templateRef.id) ?? binding.templateRef.revision },
  }));
  s.revision++;
}
// Prepare all record packs before replacing any file or the catalog.
const removed: string[] = [];
for (const kind of catalogKinds) {
  if (JSON.stringify(before[kind]) === JSON.stringify(b[kind])) continue;
  const packs = encodeRecordPacks(kind, b[kind]);
  removed.push(...b.catalog.files[kind].map(f => f.path));
  b.catalog.files[kind] = packs.map(p => p.entry);
  replacements.push(...packs.map(p => ({ path: path.join(root, p.entry.path), bytes: p.bytes })));
}
for (const replacement of replacements) fs.writeFileSync(replacement.path, replacement.bytes);
b.catalog.revision++;
fs.writeFileSync(path.join(root, '.catalog-next.json'), JSON.stringify(b.catalog, null, 2) + '\n');
fs.renameSync(path.join(root, '.catalog-next.json'), path.join(root, 'catalog.json'));
const retained = new Set(Object.values(b.catalog.files).flat().map(f => f.path));
for (const file of removed) if (!retained.has(file)) fs.unlinkSync(path.join(root, file));
console.log(`Corrected ${replacements.filter(p => p.path.endsWith('.webp')).length} question images and extracts, with current revision references.`);
