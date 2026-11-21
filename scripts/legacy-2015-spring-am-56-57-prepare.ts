import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Attribution, Rights } from '../src/core/types';
import { spring2015MorningBooklet } from '../src/core/generators/legacy-2015-spring-am';
import { spring2015Am5480Source } from '../src/core/generators/legacy-2015-spring-am-54-80-source';
import official from '../tests/fixtures/legacy-2015-spring-am-official-answers.json';
import review from './source-evidence/legacy-2015-spring-am-56-57-source-review.json';
import { readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords, type Stage3MorningFact } from './stage3-morning-records';
import { installMorningSupplement } from './stage3-supplement-transport';

const { collectionId, checkedOn } = review;
const publisher = '独立行政法人情報処理推進機構（IPA）';

async function install(cropDirectory: string, dataDir: string) {
  const bundle = readDistributionBundle(dataDir);
  assert.equal(official.collectionId, collectionId);
  for (const [kind, hash, expected] of [
    ['qs', review.questionPaperSHA256, official.questionPaperSHA256],
    ['ans', review.answerPaperSHA256, official.answerPaperSHA256],
  ]) {
    assert.equal(hash, expected);
    assert.equal(bundle.sources.find(source => source.id === `source-ipa-${collectionId}-${kind}`)?.sha256, hash);
  }

  const existingRight = bundle.rights.find(right => right.id === `rights-ipa-${collectionId}`);
  assert(existingRight);
  const examRights: Rights[] = review.questions.map(question => ({
    ...structuredClone(existingRight),
    id: `rights-ipa-${collectionId}-${question.number}`,
    checkedOn,
    scope: `平成27年度 春期 基本情報技術者試験 午前 問${question.number}のIPA作問部分・選択肢の用語・公式解答。`,
    attributionText: `出典：平成27年度 春期 基本情報技術者試験 午前 問${question.number}。©2015 ${publisher}。`,
    thirdParty: { status: 'none_identified', notes: question.rightsBoundary, rightsRefs: [] },
    assessmentNotes: '教育用の同梱・ブラウザ表示・改変。元の試験区分・問番号・出典・改変を表示する。解説は独自作成。',
  }));

  const commonAssets = [2, 3].map(page => {
    const asset = bundle.assets.find(item => item.id === `asset-ipa-${collectionId}-common-${page}`);
    assert(asset);
    return asset;
  });
  const facts: Stage3MorningFact[] = review.questions.map(question => {
    const source = `${collectionId}-${question.number}`;
    const answer = official.records.find(row => row.number === question.number);
    assert(answer);
    assert.deepEqual([answer.source, answer.physicalPage, answer.officialKey, answer.officialArea],
      [source, question.page, question.answer, question.area]);
    const input = path.join(cropDirectory, question.filename);
    const bytes = fs.readFileSync(input);
    assert.deepEqual([
      createHash('sha256').update(bytes).digest('hex'), bytes.length, bytes.readUInt32BE(16), bytes.readUInt32BE(20),
    ], [question.cropSHA256, question.byteLength, question.width, question.height]);
    const { prompt, choices } = spring2015Am5480Source[question.number];
    return {
      source, number: question.number, page: question.page, officialKey: question.answer, area: 'management',
      alt: [`問${question.number}`, prompt, ...choices.map((choice, i) => `${'アイウエ'[i]}　${choice}`)].join('\n'),
      choiceShuffleAllowed: false,
      crop: { path: input, sha256: question.cropSHA256, width: question.width, height: question.height,
        byteLength: question.byteLength, cropBox: question.cropBox },
    };
  });
  const definitions = spring2015MorningBooklet.definitions.filter(definition => facts.some(fact => definition.source === fact.source));
  const records = await makeStage3MorningRecords({
    collectionId, checkedOn, facts, commonAssets, rights: examRights, sources: [], reviewedCommonPages: [2, 3], definitions,
  });

  const assetFiles = new Map<string, string>();
  const assets = review.questions.map((question, index) => {
    const [original, base] = records.questions.slice(index * 2, index * 2 + 2);
    const template = records.templates[index];
    const fact = facts[index];
    const asset = records.assets.find(item => item.id === `asset-ipa-${fact.source}`);
    assert(asset);
    const right = examRights[index].id;
    const retag = (attribution: Attribution) => {
      attribution.rightsRefs = attribution.rightsRefs.map(id => id === existingRight.id ? right : id);
    };
    retag(asset.attribution);
    retag(template.attribution);
    for (const item of [original, base]) {
      retag(item.prompt.attribution);
      retag(item.correctAnswer.attribution);
      item.choices.forEach(choice => retag(choice.content.attribution));
      item.review.notes = [question.rightsBoundary, question.independentSemantics, question.generationReview,
        '確認主体はCodex AI。別の意味分類は旧午前54〜80の内容検査で照合する。'].join(' ');
    }
    assert.equal(base.contexts.length, commonAssets.length);
    base.contexts.forEach((context, i) => {
      const attribution: Attribution = { ...commonAssets[i].attribution, origin: 'adapted', creatorIds: ['codex'] };
      context.content.attribution = attribution;
      for (const block of context.content.blocks) {
        if (block.type === 'diagram') block.attribution = attribution;
      }
    });
    assetFiles.set(asset.path, fact.crop.path);
    return asset;
  });
  return installMorningSupplement(dataDir, bundle, collectionId, { ...records, assets }, assetFiles);
}

const [cropDirectory, dataDir] = process.argv.slice(2);
assert(cropDirectory && dataDir && process.argv.length === 4,
  'usage: tsx scripts/legacy-2015-spring-am-56-57-prepare.ts <reviewed-crop-directory> <data-directory>');
console.log(JSON.stringify(await install(cropDirectory, dataDir)));
