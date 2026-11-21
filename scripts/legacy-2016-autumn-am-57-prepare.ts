import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { stage3AutumnMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import type { Attribution, Rights, Source } from '../src/core/types';
import official from '../tests/fixtures/legacy-2016-autumn-am-official-answers.json';
import review from './source-evidence/legacy-2016-autumn-am-57-source-review.json';
import { readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords } from './stage3-morning-records';
import { installMorningSupplement } from './stage3-supplement-transport';

async function install(cropPath: string, dataDir: string) {
  const { collectionId, number, page, checkedOn, glossary } = review;
  const source = collectionId + '-' + number;
  const bundle = readDistributionBundle(dataDir);
  const crop = fs.readFileSync(cropPath);
  assert.equal(createHash('sha256').update(crop).digest('hex'), review.cropSHA256);
  for (const [suffix, sha256] of [['qs', review.questionSHA256], ['ans', review.answerSHA256]]) {
    assert.equal(bundle.sources.find(row => row.id === 'source-ipa-' + collectionId + '-' + suffix)?.sha256, sha256);
  }
  assert.equal(official.records.find(row => row.number === number)?.officialKey, review.answer);
  const definition = stage3AutumnMorningDefinitions.find(row => row.source === source);
  assert(definition);
  const commonAssets = [2, 3].map(p => {
    const asset = bundle.assets.find(row => row.id === 'asset-ipa-' + collectionId + '-common-' + p);
    assert(asset);
    return asset;
  });
  const glossarySource: Source = {
    schemaVersion: '3.0.0', id: 'source-itil-2011-availability-metrics-2016-autumn-am-57',
    title: 'ITIL 2011 glossary and abbreviations（指標名と計測区間の照合）', publisher: 'AXELOS Limited',
    url: glossary.url, sha256: glossary.sha256, checkedOn, availability: 'officially_published', type: 'independent_note',
    scope: 'pp.' + glossary.page + ' の指標名と測定対象の事実確認。', dateNote: '2011年版。',
    sections: ['p.47 MTBF', 'p.48 MTBSI・MTRS'],
    facts: ['故障間隔、障害の発生間隔、復旧にかかる時間は測定区間が異なる。'],
    supports: ['原問の全4肢と、生成問題の観測区間の査読'], limits: review.rightsBoundary,
  };
  const existingRight = bundle.rights.find(row => row.id === 'rights-ipa-' + collectionId);
  assert(existingRight);
  const right: Rights = {
    ...structuredClone(existingRight), id: 'rights-ipa-' + source, checkedOn,
    scope: '問' + number + 'のIPA作問部分、短い選択肢名、正答と原画像。',
    attributionText: existingRight.attributionText.replace('午前。', '午前 問' + number + '。'),
    thirdParty: { status: 'none_identified', notes: review.rightsBoundary, rightsRefs: [] },
    assessmentNotes: review.rightsBoundary,
  };
  const records = await makeStage3MorningRecords({
    collectionId, checkedOn, commonAssets, definitions: [definition], reviewedCommonPages: [2, 3], rights: [right], sources: [glossarySource],
    facts: [{
      number, page, source, officialKey: review.answer, area: 'management', choiceShuffleAllowed: false,
      alt: [review.prompt, ...review.choices.map((choice, index) => 'アイウエ'[index] + '　' + choice)].join('\n'),
      crop: { path: cropPath, sha256: review.cropSHA256, byteLength: crop.length, width: crop.readUInt32BE(16),
        height: crop.readUInt32BE(20), cropBox: review.cropBox },
    }],
  });
  const asset = records.assets.find(row => row.id === 'asset-ipa-' + source);
  assert(asset);
  const retag = (attribution: Attribution) => {
    attribution.rightsRefs = attribution.rightsRefs.map(id => id === existingRight.id ? right.id : id);
  };
  retag(asset.attribution);
  retag(records.templates[0].attribution);
  const base = records.questions[1];
  assert.equal(base.contexts.length, commonAssets.length);
  for (const [index, context] of base.contexts.entries()) {
    const attribution: Attribution = { ...commonAssets[index].attribution, origin: 'adapted', creatorIds: ['codex'] };
    context.content.attribution = attribution;
    for (const block of context.content.blocks) if (block.type === 'diagram') block.attribution = attribution;
  }
  for (const item of records.questions) {
    retag(item.prompt.attribution);
    retag(item.correctAnswer.attribution);
    item.choices.forEach(choice => retag(choice.content.attribution));
    item.explanation.attribution.sourceRefs.push({ sourceId: glossarySource.id, locator: { page: 47, section: 'pp.47–48 指標の測定対象' } });
    item.review.notes = review.rightsBoundary + review.generationReview;
  }
  records.templates[0].attribution.sourceRefs.push({ sourceId: glossarySource.id, locator: { page: 47, section: 'pp.47–48 指標の測定対象' } });
  return installMorningSupplement(dataDir, bundle, collectionId, { ...records, assets: [asset] }, new Map([[asset.path, cropPath]]));
}

const [crop, data] = process.argv.slice(2);
assert(crop && data && process.argv.length === 4, 'usage: tsx scripts/legacy-2016-autumn-am-57-prepare.ts <reviewed-crop> <data-directory>');
console.log(JSON.stringify(await install(crop, data)));
