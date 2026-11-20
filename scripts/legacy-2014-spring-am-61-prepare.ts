import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import type { Attribution, Rights, Source, SourceRef } from '../src/core/types';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2014-spring-am-official-answers.json';
import review from './source-evidence/legacy-2014-spring-am-61-source-review.json';
import { readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords, stage3MorningSourceRef } from './stage3-morning-records';
import { installMorningSupplement } from './stage3-supplement-transport';

const { collectionId, checkedOn, question, guidance } = review;
const source = `${collectionId}-${question.number}`;
const guideSource = 'source-ipa-cf2013-guidance-2014-spring-am-61';
const guideRight = 'rights-ipa-cf2013-guidance-2014-spring-am-61-cc-by-sa-21jp';
const guideRefs: SourceRef[] = [
  { sourceId: guideSource, locator: { page: 9, section: '2.1.1.2.6 業務の全体像' } },
  { sourceId: guideSource, locator: { page: 12, section: '2.2.3.1項1(1)(a) 業務要件' } },
];
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
  assert.deepEqual(officialQuestion, { number: question.number, source, physicalPage: question.page, officialKey: question.answer, officialArea: question.area });
  for (const [kind, hash] of [['qs', question.questionPaperSHA256], ['ans', question.answerPaperSHA256]]) {
    assert.equal(bundle.sources.find(entry => entry.id === `source-ipa-${collectionId}-${kind}`)?.sha256, hash);
  }
  const existingExam = bundle.rights.find(entry => entry.id === 'rights-ipa-' + collectionId);
  const existingGuide = bundle.rights.find(entry => entry.id === 'rights-ipa-cf2013-guidance-q65-cc-by-sa-21jp-20261025');
  assert(existingExam && existingGuide);
  const rights: Rights[] = [
    {
      ...structuredClone(existingGuide), id: guideRight, checkedOn,
      scope: '平成26年度春期午前問61のアとイ、原画像と代替文の該当部分及び生成版の対応表現。IPAガイダンスp.9第2.1.1.2.6項とp.12第2.2.3.1項1(1)(a)。',
      attributionText: '©2013 IPA『共通フレーム2013』第3部 ガイダンス pp.9・12 §2.1.1.2.6・§2.2.3.1。CC BY-SA 2.1 日本。教材の具体例と表現はOpenCBT-FE-KihonJohoが編集し、該当部分に同じ条件を適用します。',
      thirdParty: { status: 'none_identified', notes: '対象はIPAの業務の全体像と業務要件の説明。規格本文、別章、図版を利用しない。', rightsRefs: [] },
      assessmentNotes: guidance.licensedExpression,
    },
    {
      ...structuredClone(existingExam), id: examRight, checkedOn,
      scope: '平成26年度 春期 基本情報技術者試験 午前 問61のIPA作問部分、組版、公式正答。',
      attributionText: '出典：平成26年度 春期 基本情報技術者試験 午前 問61。©2014 ' + publisher + '。',
      thirdParty: { status: 'present_cleared', notes: 'ガイダンス由来表現の条件を当該選択肢の素材に併記する。', rightsRefs: [guideRight] },
    },
  ];
  const sources: Source[] = [{
    schemaVersion: '3.0.0', id: guideSource, title: '共通フレーム2013 第3部 共通フレームとガイダンス（公開抜粋）',
    publisher, url: guidance.url, sha256: guidance.sha256, checkedOn, availability: 'officially_published', type: 'policy',
    dateNote: 'IPAが2013年に発行した書籍のガイダンス公開抜粋。', scope: '業務全体像の構想、要件、方式設計、業務の移行準備の照合。',
    sections: ['p.9 2.1.1.2.6 業務の全体像', 'p.12 2.2.3.1 業務要件', 'p.15 2.3.2.2 次段階の方式設計', 'p.20 3.1.3 業務の移行'],
    facts: ['構想、要件定義、運用準備、設計の成果物を区別する。'],
    supports: ['問61の正答と生成問題の確認', '出典・権利表示'], limits: guidance.editionBoundary,
  }];
  const commonAssets = [2, 3].map(page => {
    const asset = bundle.assets.find(entry => entry.id === `asset-ipa-${collectionId}-common-${page}`);
    assert(asset);
    return asset;
  });
  const definition = stage3AllMorningDefinitions.find(entry => entry.source === source);
  assert(definition);
  const records = await makeStage3MorningRecords({
    collectionId, checkedOn, commonAssets, rights, sources, reviewedCommonPages: [2, 3], definitions: [definition],
    facts: [{
      source, number: question.number, page: question.page, officialKey: question.answer, area: 'strategy',
      alt: [`問${question.number}`, question.prompt, ...question.choices.map((choice, i) => `${'アイウエ'[i]}　${choice}`)].join('\n'), choiceShuffleAllowed: false,
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
  const officialPrompt: Attribution = { ...officialAttribution, sourceRefs: [exam, ...guideRefs], rightsRefs: [examRight, guideRight] };
  const adaptedPrompt: Attribution = { ...officialPrompt, origin: 'adapted', creatorIds: ['codex'] };
  original.prompt.attribution = officialPrompt;
  original.correctAnswer.attribution = { ...officialAttribution, sourceRefs: [answer] };
  original.choices.forEach((choice, index) => {
    choice.content.attribution = index < 2
      ? { ...officialPrompt, sourceRefs: [exam, guideRefs[index]] }
      : officialAttribution;
  });
  asset.attribution = officialPrompt;
  const adaptedExam: Attribution = { ...officialAttribution, origin: 'adapted', creatorIds: ['codex'] };
  base.prompt.attribution = adaptedPrompt;
  base.choices.forEach((choice, index) => {
    choice.content.attribution = index < 2
      ? { ...adaptedPrompt, sourceRefs: [exam, guideRefs[index]] }
      : adaptedExam;
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
    item.origin.sourceRefs.push(...guideRefs);
    item.review.notes = review.generationReview;
  }
  return installMorningSupplement(dataDir, bundle, collectionId, { ...records, assets: [asset] }, new Map([[asset.path, cropPath]]));
}

const [cropPath, dataDir] = process.argv.slice(2);
assert(cropPath && dataDir && process.argv.length === 4, 'usage: tsx scripts/legacy-2014-spring-am-61-prepare.ts <reviewed-crop> <data-directory>');
console.log(JSON.stringify(await install(cropPath, dataDir)));
