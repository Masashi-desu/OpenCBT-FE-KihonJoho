import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import type { Attribution, Rights, Source, SourceRef } from '../src/core/types';
import { jisCodeReference } from '../src/core/generators/legacy-2006-spring-am-01-26-calculations';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2006-spring-am-official-answers.json';
import review from './source-evidence/legacy-2006-spring-am-8-source-review.json';
import { readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords } from './stage3-morning-records';
import { installMorningSupplement } from './stage3-supplement-transport';

const { collectionId, checkedOn, question, reference } = review;
const source = collectionId + '-' + question.number;
const unicodeSource = 'source-unicode-2006-spring-am-8';
const unicodeRight = 'rights-unicode-2006-spring-am-8';
const licenseSource = 'source-unicode-v3-2006-spring-am-8';
const unicodeRef: SourceRef = {
  sourceId: unicodeSource,
  locator: { section: 'JIS0201 table 2.0の0x31〜0x33・0x41〜0x43' },
};
const referenceCredit: Attribution = {
  origin: 'adapted', sourceRefs: [unicodeRef], rightsRefs: [unicodeRight, 'rights-original'], creatorIds: ['unicode', 'codex'],
};

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

async function install(cropPath: string, dataDir: string) {
  const bundle = readDistributionBundle(dataDir);
  const crop = fs.readFileSync(cropPath);
  assert.equal(sha256(crop), question.cropSHA256);
  assert.equal(official.collectionId, collectionId);
  assert.equal(official.questionPaperSHA256, question.questionPaperSHA256);
  assert.equal(official.answerPaperSHA256, question.answerPaperSHA256);
  const officialQuestion = official.records.find(row => row.number === question.number);
  assert.equal(officialQuestion?.physicalPage, question.page);
  assert.equal(officialQuestion?.officialKey, question.answer);
  assert.equal(officialQuestion?.officialArea, question.area);
  for (const [kind, hash] of [['qs', question.questionPaperSHA256], ['ans', question.answerPaperSHA256]]) {
    assert.equal(bundle.sources.find(entry => entry.id === 'source-ipa-' + collectionId + '-' + kind)?.sha256, hash);
  }

  const existingRight = bundle.rights.find(entry => entry.id === 'rights-unicode-17-q12');
  const existingLicense = bundle.sources.find(entry => entry.id === 'source-unicode-v3-q12');
  const notice = fs.readFileSync(reference.notice);
  assert(existingRight && existingLicense);
  assert.equal(existingRight.licenseId, reference.license);
  assert.equal(existingLicense.url, reference.licenseUrl);
  assert.equal(existingLicense.sha256, reference.licenseSHA256);
  assert.equal(sha256(notice), reference.licenseSHA256);
  assert.equal(existingRight.attributionText, notice.toString('utf8'));
  const table = jisCodeReference().blocks[0];
  assert(table.type === 'table');
  const byCode = new Map(reference.rows.map(row => [row.code, row.character]));
  assert.equal(byCode.size, 6);
  assert.deepEqual(table.rows.map(([, , , left, right]) => [left, right]), Array.from({ length: 3 }, (_, i) => [
    byCode.get((0x31 + i).toString(16)),
    byCode.get((0x41 + i).toString(16)),
  ]));
  const rights: Rights[] = [{
    ...structuredClone(existingRight), id: unicodeRight, checkedOn,
    evidence: [{ sourceId: licenseSource, locator: { section: 'Unicode License V3 全文' } }],
    scope: 'Unicode公開マッピングJIS0201 table 2.0の6文字の符号値を使い、問8のために独立編集した参考表。',
    thirdParty: { status: 'none_identified', notes: '公開マッピングの6事実に限定する。旧規格表の画像と組版、Unicodeのコード図表・フォントは含めない。', rightsRefs: [] },
    assessmentNotes: 'JIS0201 table 2.0とCP932 table 2.01の6件を照合。Unicode License V3全文を配布物で保持し、試験冊子の出典と独立した参考の出典を表示する。',
  }];
  const sources: Source[] = [{
    schemaVersion: '3.0.0', id: unicodeSource, title: 'Unicode公開JIS0201 table 2.0／問8の6文字',
    publisher: 'Unicode, Inc.', url: reference.url, sha256: reference.sha256, checkedOn,
    type: 'independent_note', availability: 'officially_published',
    scope: 'JISの0x31〜0x33と0x41〜0x43の文字と符号値。上位・下位の4ビットで検索できる独立参考表。',
    sections: reference.rows.map(row => '0x' + row.code + ' ' + row.character + '／line ' + row.line),
    dateNote: '使用したデータはtable 2.0の2015-12-02ヘッダ版。',
    facts: ['抽出した6の符号値は公開CP932 table 2.01の値と一致する。'],
    supports: ['年度別・ランダムミックスの解答前参考'],
    limits: 'UnicodeのライセンスはIPA問題、JIS規格の本文・原表、照合資料の本文へ広げない。',
  }, {
    ...structuredClone(existingLicense), id: licenseSource, checkedOn,
    scope: 'この参考表のために照合し、配布物に同梱するUnicode License V3の全文。',
    supports: ['rights-validation'],
    limits: '独立参考表のUnicode文字データに適用する。',
  }];

  const definition = stage3AllMorningDefinitions.find(entry => entry.source === source);
  assert(definition);
  const records = await makeStage3MorningRecords({
    collectionId, checkedOn, commonAssets: [], reviewedCommonPages: [], definitions: [definition], sources, rights,
    facts: [{
      source, number: question.number, page: question.page, officialKey: question.answer, area: 'technology',
      alt: question.alt, choiceShuffleAllowed: false,
      crop: { path: cropPath, sha256: question.cropSHA256, width: crop.readUInt32BE(16), height: crop.readUInt32BE(20),
        byteLength: crop.length, cropBox: question.cropBox },
    }],
  });
  const [original, base] = records.questions;
  const [asset] = records.assets;
  original.prompt.blocks.push(...question.choices.map((text, index) =>
    ({ type: 'paragraph' as const, text: 'アイウエ'[index] + '　' + text })));
  const { id, title, presentation, blocks } = jisCodeReference();
  original.contexts = [{ id, title, presentation, content: { attribution: referenceCredit, blocks } }];
  original.contextRefs = [id];
  original.origin.isModified = true;
  original.origin.changes[0].summary = '原本文の切り出しと元の全選択肢の転記';
  original.origin.changes.push({
    at: checkedOn + 'T00:00:00Z', actorId: 'codex', kind: 'diagram',
    summary: '独立に編集したJISコード参考表を追加',
    details: 'Unicode公開マッピングの6事実に入れ替えた参考を別資料として表示する。元の表の画像・組版を除き、原本文・全選択肢・公式正答を維持する。',
    affectsAnswer: false,
  });
  assert.equal(base.contexts.length, 1);
  base.contexts[0].content.attribution = referenceCredit;
  const [template] = records.templates;
  // The common additional generator carries its aggregate attribution into the
  // generated material. The Unicode right explicitly limits it to the reference table.
  template.attribution.sourceRefs.push(unicodeRef);
  template.attribution.rightsRefs.push(unicodeRight);
  for (const item of [original, base]) {
    item.origin.sourceRefs.push(unicodeRef);
    item.review.notes = review.generationReview;
  }
  return installMorningSupplement(dataDir, bundle, collectionId, records, new Map([[asset.path, cropPath]]));
}

const [cropPath, dataDir] = process.argv.slice(2);
assert(cropPath && dataDir && process.argv.length === 4, 'usage: tsx scripts/legacy-2006-spring-am-8-prepare.ts <reviewed-stem> <data-directory>');
console.log(JSON.stringify(await install(cropPath, dataDir)));
