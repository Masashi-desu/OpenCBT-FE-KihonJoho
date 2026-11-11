import assert from 'node:assert/strict';
import test from 'node:test';
import { makeStage3MorningRecords, spring2016SourceRef } from '../../scripts/stage3-morning-records';
import { stage3AllMorningDefinitions } from '../../src/core/generators/stage3-morning-install';
import type { Asset } from '../../src/core/types';

const originalDefinition = stage3AllMorningDefinitions.find(definition => definition.source === '2016h28h-fe-am-1');
assert(originalDefinition);

const input = {
  facts: [{
    source: originalDefinition.source,
    number: 1,
    page: 4,
    officialKey: originalDefinition.sourceAnswer,
    alt: '問1。共通表記の有無を検証するための原問題素材メタデータ。配布は行わない。',
    crop: { path: 'synthetic.png', sha256: '0'.repeat(64), width: 200, height: 100, byteLength: 100, cropBox: [0, 0, 200, 100] },
  }],
  definitions: [{
    ...originalDefinition,
    build: (values: number[]) => ({ ...originalDefinition.build(values), contexts: [] }),
  }],
  sources: [],
  rights: [],
  checkedOn: '2026-11-12',
};

function commonAsset(page: number): Asset {
  return {
    schemaVersion: '3.0.0',
    id: `asset-synthetic-common-${page}`,
    path: `assets/synthetic-common-${page}.png`,
    mediaType: 'image/png',
    sha256: '0'.repeat(64),
    width: 200,
    height: 100,
    byteLength: 100,
    alt: '共通表記素材の頁照合用。配布は行わない。',
    attribution: {
      origin: 'official',
      sourceRefs: [spring2016SourceRef(undefined, page)],
      rightsRefs: ['rights-ipa-2016h28h-fe-am'],
      creatorIds: ['ipa'],
    },
  };
}

test('a reviewed empty common-page list issues records without appendix assets or references', async () => {
  const records = await makeStage3MorningRecords({ ...input, commonAssets: [], reviewedCommonPages: [] });
  const original = records.questions[0];
  assert.equal(records.assets.length, 1);
  assert.deepEqual(original.assetRefs, [records.assets[0].id]);
  assert.deepEqual(original.contexts, []);
  assert.deepEqual(original.contextRefs, []);
  assert.deepEqual(original.origin.sourceRefs, [spring2016SourceRef(1, 4)]);
  assert.equal(original.origin.changes[0].summary, '原画像・原問番号・全選択肢・注記を保持');
});

test('omitting or contradicting a common-page review cannot remove or invent source materials', async () => {
  await assert.rejects(makeStage3MorningRecords({ ...input, commonAssets: [] }), /source review/);
  await assert.rejects(makeStage3MorningRecords({ ...input, commonAssets: [commonAsset(2)], reviewedCommonPages: [] }), /reviewed source/);
  await assert.rejects(makeStage3MorningRecords({ ...input, commonAssets: [commonAsset(3)], reviewedCommonPages: [2] }), /page and source/);
});

test('existing one- and two-page common notation keeps its source locators and asset order', async () => {
  for (const pages of [[2], [2, 3]]) {
    const commonAssets = pages.map(commonAsset);
    const records = await makeStage3MorningRecords({ ...input, commonAssets });
    const original = records.questions[0];
    assert.deepEqual(original.contexts.map(context => context.content.attribution.sourceRefs[0].locator.page), pages);
    assert.deepEqual(original.assetRefs.slice(1), commonAssets.map(asset => asset.id));
    assert.equal(original.origin.changes[0].summary, '原画像・原問番号・全選択肢・注記と共通表記を保持');
  }
});
