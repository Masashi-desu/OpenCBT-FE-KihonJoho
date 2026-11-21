import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import type { Attribution, Rights, Source } from '../src/core/types';
import official from '../tests/fixtures/legacy-2014-autumn-am-official-answers.json';
import review from './source-evidence/legacy-2014-autumn-am-55-source-review.json';
import { readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords } from './stage3-morning-records';
import { installMorningSupplement } from './stage3-supplement-transport';

async function install(cropPath: string, dataDir: string) {
  const { collectionId, number, page, checkedOn, classification } = review;
  const source = collectionId + '-' + number;
  const bundle = readDistributionBundle(dataDir);
  const crop = fs.readFileSync(cropPath);
  assert.equal(createHash('sha256').update(crop).digest('hex'), review.cropSHA256);
  for (const [suffix, sha256] of [['qs', review.questionSHA256], ['ans', review.answerSHA256]]) {
    assert.equal(bundle.sources.find(row => row.id === 'source-ipa-' + collectionId + '-' + suffix)?.sha256, sha256);
  }
  assert.deepEqual(official.records.find(row => row.number === number),
    { number, source, physicalPage: page, officialKey: review.answer, officialArea: review.area });
  const definition = stage3AllMorningDefinitions.find(row => row.source === source);
  assert(definition);
  const commonAssets = [2, 3].map(p => {
    const asset = bundle.assets.find(row => row.id === 'asset-ipa-' + collectionId + '-common-' + p);
    assert(asset);
    return asset;
  });
  const classificationSource: Source = {
    schemaVersion: '3.0.0', id: 'source-pmi-risk-response-2014-autumn-am-55',
    title: classification.title, publisher: 'Project Management Institute',
    url: classification.url, checkedOn, availability: 'officially_published', type: 'independent_note',
    scope: '脅威への対応と好機への対応に用いる戦略名の事実照合。',
    dateNote: '2001年11月の発表。出題時に刊行済みのPMBOK第4版・第5版と区別して参照する。',
    sections: classification.sections,
    facts: ['活用・強化・共有は好機への対応。脅威への対応には受容・回避・転嫁・軽減がある。'],
    supports: ['原問の全4肢と、生成問題の脅威事例の査読'], limits: review.rightsBoundary,
  };
  const edition: Source = {
    schemaVersion: '3.0.0', id: 'source-pmi-pmbok-fourth-edition-2014-autumn-am-55',
    title: 'A Guide to the Project Management Body of Knowledge, Fourth Edition', publisher: 'Project Management Institute',
    url: 'https://www.um.edu.mt/courses/studyunit/MGT5825', checkedOn, availability: 'officially_published',
    type: 'independent_note', scope: 'ISBN 9781933890517（第4版）の書誌。本文の見出しと対応分類の照合。',
    dateNote: '2008年刊。リンクは大学の参考文献一覧にある当該版の書誌。',
    sections: ['第4版 pp.303–305 §§11.5.2.1–2'],
    facts: ['受容は好機及び脅威のいずれにも用いる。'],
    supports: ['原問の選択肢の出題当時の分類'], limits: review.rightsBoundary,
  };
  const references = [
    { sourceId: classificationSource.id, locator: { section: '脅威と好機への対応戦略' } },
    { sourceId: edition.id, locator: { section: '第4版 §§11.5.2.1–2（pp.303–305）' } },
  ];
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
    collectionId, checkedOn, commonAssets, definitions: [definition], reviewedCommonPages: [2, 3], rights: [right], sources: [classificationSource, edition],
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
    item.explanation.attribution.sourceRefs.push(...references);
    item.review.notes = review.rightsBoundary + review.generationReview;
  }
  records.templates[0].attribution.sourceRefs.push(...references);
  return installMorningSupplement(dataDir, bundle, collectionId, { ...records, assets: [asset] }, new Map([[asset.path, cropPath]]));
}

const [crop, data] = process.argv.slice(2);
assert(crop && data && process.argv.length === 4, 'usage: tsx scripts/legacy-2014-autumn-am-55-prepare.ts <reviewed-crop> <data-directory>');
console.log(JSON.stringify(await install(crop, data)));
