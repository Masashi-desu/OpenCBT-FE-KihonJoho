import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fixture } from '../fixtures';
import { bookmarkPreview } from '../../src/core/bookmarks';
import { questionSearchDocuments } from '../../src/core/search';
import { refOf } from '../../src/core/types';
import boundaries from '../../scripts/source-evidence/december-a-question-boundaries.json';

const digest = (v: Uint8Array | string) => createHash('sha256').update(v).digest('hex');
const compact = (v: string) => v.normalize('NFKC').replace(/\s+/gu, '');
const headings = (v: string) => [...v.matchAll(/(?:^|\n)\s*問\s*([0-9０-９]+)(?=\s|$)/gu)].map(m => Number(m[1].normalize('NFKC')));

test('every distributed original keeps question-local image references and text, without sharing another question image in the same source', () => {
  const b = fixture(), seen = new Map<string, string>();
  const originals = b.questions.filter(q => q.origin.kind === 'official_reprint');
  assert(originals.length > 0);
  for (const q of originals) {
    const number = Number(q.origin.sourceRefs[0].locator.questionNumber);
    let questionImage = false;
    for (const block of q.prompt.blocks) {
      if (block.type === 'image') {
        const asset = b.assets.find(a => a.id === block.assetId)!;
        const ref = asset.attribution.sourceRefs.find(r => r.locator.questionNumber);
        // Shared notation/appendices have no question number and are explicit
        // separate materials. PM can share appendices but not its body pages.
        questionImage = Boolean(ref);
        if (!ref) continue;
        assert.equal(Number(ref.locator.questionNumber), number, `${q.id}: ${asset.id}`);
        if (!q.answerParts?.length) {
          const paper = b.sources.find(s => s.id === ref.sourceId)?.sha256 ?? ref.sourceId;
          const key = paper + ':' + asset.sha256;
          assert(!seen.has(key) || seen.get(key) === q.id, `${q.id}: page reused from ${seen.get(key)}`);
          seen.set(key, q.id);
        }
      } else if (questionImage && block.type === 'code' && block.language === 'text') {
        for (const found of headings(block.text)) assert.equal(found, number, `${q.id}: adjacent question in extracted text`);
      }
    }
  }
});

test('all sixty December A captures and extracts match reviewed source rectangles, including complete adjacent question separation', () => {
  const b = fixture();
  assert.equal(b.sources.find(s => s.id === boundaries.sourceId)!.sha256, boundaries.sourceSha256);
  assert.deepEqual(boundaries.questions.map(q => q.number), Array.from({ length: 60 }, (_, i) => i + 1));
  for (const item of boundaries.questions) {
    const q = b.questions.find(q => q.id === `question-ipa-sample-2022-dec-a-${item.number}`)!;
    const image = q.prompt.blocks[0], text = q.prompt.blocks[1];
    assert(image.type === 'image' && text.type === 'code' && text.language === 'text');
    const asset = b.assets.find(a => a.id === image.assetId)!;
    assert.equal(digest(fs.readFileSync('public/data/' + asset.path)), item.imageSha256, q.id);
    assert.equal(asset.sha256, item.imageSha256, q.id);
    assert.equal(asset.width, item.pixelCrop[2] - item.pixelCrop[0], q.id);
    assert.equal(asset.height, item.pixelCrop[3] - item.pixelCrop[1], q.id);
    assert.equal(digest(text.text), item.textSha256, q.id);
    assert.deepEqual(headings(text.text), [item.number], q.id);
    assert.equal(asset.attribution.sourceRefs[0].locator.page, item.page, q.id);
    // Rectangles on a shared page never overlap or cross the next heading.
    const next = boundaries.questions.find(n => n.number === item.number + 1);
    if (next?.page === item.page) assert(item.pixelCrop[3] < next.pixelCrop[1], q.id);
  }
});

test('December A bookmark previews and search excerpts identify the actual source question rather than its page first question', () => {
  const b = fixture(), documents = questionSearchDocuments(b);
  for (const item of boundaries.questions) {
    const q = b.questions.find(q => q.id === `question-ipa-sample-2022-dec-a-${item.number}`)!;
    const base = b.questions.find(q => q.id === `question-template-source-sample-2022-dec-a-${item.number}`)!;
    assert.equal(compact(bookmarkPreview(b, refOf(q))), compact(item.opening), q.id);
    assert.equal(bookmarkPreview(b, refOf(base)), bookmarkPreview(b, refOf(q)), q.id);
    const document = documents.find(d => d.question.id === q.id)!;
    assert(compact(document.summary).startsWith(`問${item.number}${compact(item.opening)}`), q.id);
    assert.deepEqual(headings(document.summary), [item.number], q.id);
  }
});

test('December A re-import refuses conflicting reviewed metadata before replacing its existing image', () => {
  const b = fixture(), root = path.resolve('public/data');
  const image = b.assets.find(a => a.id === 'asset-ipa-sample-2022-dec-a-1-p4')!;
  const other = b.assets.find(a => a.id === 'asset-ipa-sample-2022-dec-a-2-p4')!;
  const priorBytes = fs.readFileSync(path.join(root, other.path));
  const nextBytes = fs.readFileSync(path.join(root, image.path));
  assert(!priorBytes.equals(nextBytes));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'opencbt-dec-a-reimport-'));
  try {
    const target = path.join(tmp, 'public/data'), input = path.join(tmp, 'rendered');
    fs.mkdirSync(target, { recursive: true }); fs.mkdirSync(input);
    const catalog = structuredClone(b.catalog);
    // Keep the complete real catalog. This rejected path only touches Q1's
    // bytes; no old question bodies or reduced publication pools are fixtures.
    for (const files of Object.values(catalog.files)) for (const file of files) {
      const destination = path.join(target, file.path);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(root, file.path), destination);
    }
    for (const file of catalog.files.assets) {
      const destination = path.join(target, file.path), raw = fs.readFileSync(destination);
      const value = JSON.parse(raw.toString()), records = Array.isArray(value) ? value : [value];
      const existing = records.find(a => a.id === image.id);
      if (!existing) continue;
      Object.assign(existing, { sha256: other.sha256, byteLength: other.byteLength, width: other.width, height: other.height });
      const changed = Buffer.from(JSON.stringify(value) + '\n');
      fs.writeFileSync(destination, changed); file.sha256 = digest(changed);
    }
    const catalogBytes = Buffer.from(JSON.stringify(catalog) + '\n');
    fs.writeFileSync(path.join(target, 'catalog.json'), catalogBytes);
    fs.writeFileSync(path.join(target, image.path), priorBytes);
    const pin = boundaries.questions[0], q = b.questions.find(q => q.id === 'question-ipa-sample-2022-dec-a-1')!;
    const text = q.prompt.blocks[1]; assert(text.type === 'code');
    const name = path.basename(image.path);
    fs.writeFileSync(path.join(input, name), nextBytes);
    fs.writeFileSync(path.join(input, 'pages.json'), JSON.stringify([{
      number: 1, page: 4, name, width: image.width, height: image.height,
      byteLength: nextBytes.length, sha256: digest(nextBytes), text: text.text, pixelCrop: pin.pixelCrop,
    }]));
    const result = spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'),
      path.resolve('scripts/import-december-a-sample.ts'), input], { cwd: tmp, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Existing reviewed record differs: asset-ipa-sample-2022-dec-a-1-p4/);
    assert.deepEqual(fs.readFileSync(path.join(target, image.path)), priorBytes);
    assert.deepEqual(fs.readFileSync(path.join(target, 'catalog.json')), catalogBytes);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
