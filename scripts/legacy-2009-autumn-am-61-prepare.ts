import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import type { Attribution, Source, SourceRef } from '../src/core/types';
import { enterpriseArchitectureReference } from '../src/core/generators/legacy-2009-autumn-am-54-80';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2009-autumn-am-official-answers.json';
import review from './source-evidence/legacy-2009-autumn-am-61-source-review.json';
import { readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords } from './stage3-morning-records';
import { installMorningSupplement } from './stage3-supplement-transport';

const { collectionId, checkedOn, question, guide, comparison } = review;
const source = collectionId + '-' + question.number;
const guideId = 'source-meti-2009-autumn-am-61-ea-guideline';
const comparisonId = 'source-meti-2009-autumn-am-61-ea-reference';
const references: SourceRef[] = [
  { sourceId: guideId, locator: { page: guide.page, section: '印刷p.13 EAの四体系' } },
  { sourceId: comparisonId, locator: { page: comparison.page, section: 'スライド8 EAのフレームワーク' } },
];
const credit: Attribution = { origin: 'original', sourceRefs: references, rightsRefs: ['rights-original'], creatorIds: ['codex'] };
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

async function install(cropPath: string, dataDir: string) {
  const bundle = readDistributionBundle(dataDir);
  const crop = fs.readFileSync(cropPath);
  assert.equal(sha256(crop), question.cropSHA256);
  assert.equal(official.collectionId, collectionId);
  assert.equal(official.questionPaperSHA256, question.questionPaperSHA256);
  assert.equal(official.answerPaperSHA256, question.answerPaperSHA256);
  assert.deepEqual(official.records.find(row => row.number === question.number),
    { number: question.number, source, physicalPage: question.page, officialKey: question.answer, officialArea: question.area });
  for (const [kind, hash] of [['qs', question.questionPaperSHA256], ['ans', question.answerPaperSHA256]]) {
    assert.equal(bundle.sources.find(entry => entry.id === 'source-ipa-' + collectionId + '-' + kind)?.sha256, hash);
  }
  const sources: Source[] = [
    [guideId, '業務・システム最適化計画について／EA策定ガイドライン第I部', guide, '印刷p.13'],
    [comparisonId, 'Enterprise Architectureについて／経済産業省説明資料', comparison, 'スライド8'],
  ].map(([id, title, raw, label]) => {
    const paper = raw as typeof guide;
    return {
      schemaVersion: '3.0.0', id: String(id), title: String(title), publisher: '経済産業省',
      url: paper.url, sha256: paper.sha256, checkedOn, availability: 'officially_published', type: 'independent_note',
      scope: '四体系の名称と役割の事実の照合。', sections: [String(label) + ' EAの四体系'],
      dateNote: '資料の日付と確認日を区別し、現行制度の標準には読み替えない。',
      facts: ['EAの四体系は業務、データ、適用処理及び技術。'],
      supports: ['問61の独立参考図、全択の検算'], limits: review.rightsBoundary,
    };
  });
  const definition = stage3AllMorningDefinitions.find(entry => entry.source === source);
  assert(definition);
  const records = await makeStage3MorningRecords({
    collectionId, checkedOn, commonAssets: [], reviewedCommonPages: [], definitions: [definition], sources, rights: [],
    facts: [{
      source, number: question.number, page: question.page, officialKey: question.answer, area: 'strategy',
      alt: question.alt, choiceShuffleAllowed: false,
      crop: { path: cropPath, sha256: question.cropSHA256, width: crop.readUInt32BE(16), height: crop.readUInt32BE(20),
        byteLength: crop.length, cropBox: question.cropBox },
    }],
  });
  const [original, base] = records.questions;
  const [asset] = records.assets;
  const [template] = records.templates;
  original.prompt.blocks.push(...question.choices.map((text, index) =>
    ({ type: 'paragraph' as const, text: 'アイウエ'[index] + '　' + text })));
  const { id, title, presentation, blocks } = enterpriseArchitectureReference(0);
  original.contexts = [{ id, title, presentation, content: { attribution: credit, blocks } }];
  original.contextRefs = [id];
  original.origin.isModified = true;
  original.origin.changes[0] = { ...original.origin.changes[0], kind: 'diagram',
    summary: 'IPAの原本文・選択肢と、四体系の独立参考図', details: review.rightsBoundary };
  assert.equal(base.contexts.length, 1);
  base.contexts[0].content.attribution = credit;
  template.attribution.sourceRefs.push(...references);
  for (const item of [original, base]) item.review.notes = review.generationReview;
  return installMorningSupplement(dataDir, bundle, collectionId, records, new Map([[asset.path, cropPath]]));
}

const [cropPath, dataDir] = process.argv.slice(2);
assert(cropPath && dataDir && process.argv.length === 4, 'usage: tsx scripts/legacy-2009-autumn-am-61-prepare.ts <reviewed-stem> <data-directory>');
console.log(JSON.stringify(await install(cropPath, dataDir)));
