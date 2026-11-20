import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import type { Attribution, Rights, Source, SourceRef } from '../src/core/types';
import { stage3Autumn2015MorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2015-autumn-am-official-answers.json';
import review from './source-evidence/legacy-2015-autumn-am-50-source-review.json';
import { readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords, stage3MorningSourceRef } from './stage3-morning-records';
import { installMorningSupplement } from './stage3-supplement-transport';

const { collectionId, checkedOn, question, guidance } = review;
const source = `${collectionId}-${question.number}`;
const guideSource = 'source-ipa-cf2013-guidance-2015-autumn-am-50';
const guideRight = 'rights-ipa-cf2013-guidance-2015-autumn-am-50-cc-by-sa-21jp';
const guideRef: SourceRef = { sourceId: guideSource, locator: { page: 28, section: '4.4.2.2 意図された用途と利用者の視点' } };
const examRight = 'rights-ipa-' + source;
const publisher = '独立行政法人情報処理推進機構（IPA）';

async function install(cropPath: string, dataDir: string) {
  const bundle = readDistributionBundle(dataDir);
  const crop = fs.readFileSync(cropPath);
  assert.equal(createHash('sha256').update(crop).digest('hex'), question.cropSHA256);
  assert.equal(official.collectionId, collectionId);
  assert.equal(official.questionPaperSHA256, question.questionPaperSHA256);
  assert.equal(official.answerPaperSHA256, question.answerPaperSHA256);
  const officialQuestion = official.records.find(row => row.number === question.number);
  assert.deepEqual(officialQuestion, { number: question.number, physicalPage: question.page, officialKey: question.answer, officialArea: question.area });
  for (const [kind, hash] of [['qs', question.questionPaperSHA256], ['ans', question.answerPaperSHA256]]) {
    assert.equal(bundle.sources.find(entry => entry.id === `source-ipa-${collectionId}-${kind}`)?.sha256, hash);
  }
  const existingExam = bundle.rights.find(entry => entry.id === 'rights-ipa-' + collectionId);
  const existingGuide = bundle.rights.find(entry => entry.id === 'rights-ipa-cf2013-guidance-q65-cc-by-sa-21jp-20261025');
  assert(existingExam && existingGuide);
  const rights: Rights[] = [
    {
      ...structuredClone(existingGuide), id: guideRight, checkedOn,
      scope: '平成27年度秋期午前問50の本文と生成版における、IPAガイダンスp.28第4.4.2.2項に対応する利用者の視点と意図された用途の表現。',
      attributionText: '©2013 IPA『共通フレーム2013』第3部 ガイダンス p.28 §4.4.2.2。CC BY-SA 2.1 日本。教材の具体例と表現はOpenCBT-FE-KihonJohoが編集し、該当部分に同じ条件を適用します。',
      thirdParty: { status: 'none_identified', notes: '対象はIPAが書いた利用者視点の補足。規格本文、別章、図版を利用しない。', rightsRefs: [] },
      assessmentNotes: guidance.licensedExpression,
    },
    {
      ...structuredClone(existingExam), id: examRight, checkedOn,
      scope: '平成27年度 秋期 基本情報技術者試験 午前 問50のIPA作問部分、組版、公式正答。',
      attributionText: '出典：平成27年度 秋期 基本情報技術者試験 午前 問50。©2015 ' + publisher + '。',
      thirdParty: { status: 'present_cleared', notes: 'ガイダンス由来表現の条件を当該本文に併記する。', rightsRefs: [guideRight] },
    },
  ];
  const sources: Source[] = [{
    schemaVersion: '3.0.0', id: guideSource, title: '共通フレーム2013 第3部 共通フレームとガイダンス（公開抜粋）',
    publisher, url: guidance.url, sha256: guidance.sha256, checkedOn, availability: 'officially_published', type: 'policy',
    dateNote: 'IPAが2013年に発行した書籍のガイダンス公開抜粋。', scope: '利用者の視点と意図された用途の補足、及び隣接プロセスの照合。',
    sections: ['p.27 4.3 検証', 'p.28 4.4.2.2 妥当性確認', 'p.30 4.6 監査'],
    facts: ['確認する対象と目的により検証・妥当性確認・監査を区別する。'],
    supports: ['問50の正答と生成問題の確認', '出典・権利表示'], limits: guidance.editionBoundary,
  }];
  const commonAssets = [2, 3].map(page => {
    const asset = bundle.assets.find(entry => entry.id === `asset-ipa-${collectionId}-common-${page}`);
    assert(asset);
    return asset;
  });
  const definition = stage3Autumn2015MorningDefinitions.find(entry => entry.source === source);
  assert(definition);
  const records = await makeStage3MorningRecords({
    collectionId, checkedOn, commonAssets, rights, sources, reviewedCommonPages: [2, 3], definitions: [definition],
    facts: [{
      source, number: question.number, page: question.page, officialKey: question.answer, area: 'technology',
      alt: question.alt, choiceShuffleAllowed: false,
      crop: { path: cropPath, sha256: question.cropSHA256, width: crop.readUInt32BE(16), height: crop.readUInt32BE(20),
        byteLength: crop.length, cropBox: question.cropBox },
    }],
  });
  const [original, base] = records.questions;
  const [template] = records.templates;
  const asset = records.assets.find(entry => entry.id === 'asset-ipa-' + source);
  assert(asset);
  const exam = stage3MorningSourceRef(collectionId, question.number, question.page);
  const answer = stage3MorningSourceRef(collectionId, question.number, 1, true);
  const officialAttribution: Attribution = { origin: 'official', sourceRefs: [exam], rightsRefs: [examRight], creatorIds: ['ipa'] };
  const officialPrompt: Attribution = { ...officialAttribution, sourceRefs: [exam, guideRef], rightsRefs: [examRight, guideRight] };
  const adaptedPrompt: Attribution = { ...officialPrompt, origin: 'adapted', creatorIds: ['codex'] };
  original.prompt.attribution = officialPrompt;
  original.correctAnswer.attribution = { ...officialAttribution, sourceRefs: [answer] };
  original.choices.forEach(choice => { choice.content.attribution = officialAttribution; });
  asset.attribution = officialPrompt;
  base.prompt.attribution = adaptedPrompt;
  base.choices.forEach(choice => {
    choice.content.attribution = { ...officialAttribution, origin: 'adapted', creatorIds: ['codex'] };
  });
  assert.equal(base.contexts.length, commonAssets.length);
  base.contexts.forEach((context, index) => {
    const attribution: Attribution = { ...commonAssets[index].attribution, origin: 'adapted', creatorIds: ['codex'] };
    context.content.attribution = attribution;
    for (const block of context.content.blocks) {
      if (block.type === 'diagram') block.attribution = attribution;
    }
  });
  template.attribution = adaptedPrompt;
  for (const item of records.questions) {
    item.origin.sourceRefs.push(guideRef);
    item.review.notes = review.generationReview;
  }
  return installMorningSupplement(dataDir, bundle, collectionId, { ...records, assets: [asset] }, new Map([[asset.path, cropPath]]));
}

const [cropPath, dataDir] = process.argv.slice(2);
assert(cropPath && dataDir && process.argv.length === 4, 'usage: tsx scripts/legacy-2015-autumn-am-50-prepare.ts <reviewed-crop> <data-directory>');
console.log(JSON.stringify(await install(cropPath, dataDir)));
