import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Asset, Rights, Source } from '../src/core/types';
import type { GenerationDefinition } from '../src/core/generators/definition';
import { autumn2015CommonFigure, autumn2015StandardRows } from '../src/core/generators/legacy-2015-autumn-am-common';
import { legacy2017AutumnAmCommonPremise } from '../src/core/generators/legacy-2017-autumn-am-common';
import { stage3Autumn2015MorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2015-autumn-am-official-answers.json';
import review from './source-evidence/legacy-2015-autumn-am-source-review.json';
import { makeStage3MorningRecords, stage3MorningSourceRef, type Stage3MorningFact } from './stage3-morning-records';
import { writeStage3CollectionCandidate } from './stage3-collection-transport';

const collection = '2015h27a-fe-am';
const publisher = '独立行政法人情報処理推進機構';
const title = '平成27年度 秋期 基本情報技術者試験 午前';
const rightsId = `rights-ipa-${collection}`;
const sourcePrefix = `source-ipa-${collection}-`;
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const held = review.held.map(row => row.number);
const accepted = official.records.filter(row => !held.includes(row.number));

type Crop = Stage3MorningFact['crop'] & { physicalPage: number; sourcePageSHA256: string };
type CandidateCrops = {
  status: string;
  heldNumbers: number[];
  sourcePaperSHA256: string;
  sourceAnswerSHA256: string;
  questionCrops: Record<number, Crop>;
  commonCrops: Record<number, Crop>;
};
type EvidenceRef = { path: string; sha256: string; byteLength: number };
type Alt = { page?: number; physicalPage?: number; fullAlt?: string; alt?: string };

function readInputs(root: string) {
  const read = (relative: string, sha256: string) => {
    assert(!path.isAbsolute(relative) && !relative.split('/').includes('..'), 'source file must be in the reviewed input');
    const bytes = fs.readFileSync(path.join(root, relative));
    assert.equal(hash(bytes), sha256, relative);
    return bytes;
  };
  for (const [name, item] of [
    ['question.pdf', review.questionPaper], ['answer.pdf', review.answerPaper], ['listing.html', review.officialListing],
    ['faq.html', review.faq], ['siteinfo.html', review.sitePolicy],
  ] as const) read(`source/${name}`, item.sha256);
  const preflight = JSON.parse(read('PREFLIGHT-REVIEW.json', review.sourcePreflightSHA256).toString('utf8')) as {
    verifiedRecords: { number: number; page: number; key: string }[];
    accessibleSourceTranscription: { references: EvidenceRef[] };
  };
  assert.deepEqual(preflight.verifiedRecords, official.records.map(row => ({ number: row.number, page: row.physicalPage, key: row.officialKey })));
  const crops = JSON.parse(read('source/crop-candidates.json', review.cropCandidatesSHA256).toString('utf8')) as CandidateCrops;
  assert.equal(crops.status, 'source_candidates_only');
  assert.deepEqual(crops.heldNumbers, held);
  assert.equal(crops.sourcePaperSHA256, official.questionPaperSHA256);
  assert.equal(crops.sourceAnswerSHA256, official.answerPaperSHA256);
  assert.deepEqual(Object.keys(crops.questionCrops).map(Number), accepted.map(row => row.number));
  const alts = new Map<number, Alt>();
  for (const item of preflight.accessibleSourceTranscription.references) {
    const bytes = read(item.path, item.sha256);
    assert.equal(bytes.length, item.byteLength);
    const data = JSON.parse(bytes.toString('utf8')) as { questions?: (Alt & { number: number })[] } & Record<string, Alt>;
    const rows = data.questions?.map(row => [row.number, row] as const) ?? Object.entries(data)
      .filter(([key]) => /^\d+$/.test(key)).map(([key, row]) => [Number(key), row] as const);
    for (const [n, row] of rows) {
      assert(!alts.has(n));
      alts.set(n, row);
    }
  }
  assert.equal(alts.size, official.officialQuestionCount);
  for (const n of held) assert(alts.has(n) && !alts.get(n)!.fullAlt && !alts.get(n)!.alt, 'held body absent');
  const verifiedCrop = (crop: Crop, name: string, physicalPage: number) => {
    assert.equal(crop.path, `source/crops/${name}.png`);
    assert.equal(crop.physicalPage, physicalPage);
    const original = read(`source/pages/page-${String(physicalPage).padStart(2, '0')}.png`, crop.sourcePageSHA256);
    const bytes = read(crop.path, crop.sha256);
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    assert.deepEqual(bytes.subarray(0, 8), signature);
    assert.deepEqual(original.subarray(0, 8), signature);
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20), bytes.length], [crop.width, crop.height, crop.byteLength]);
    const [left, top, right, bottom] = crop.cropBox;
    assert(left >= 0 && top >= 0 && right <= original.readUInt32BE(16) && bottom <= original.readUInt32BE(20));
    assert.deepEqual([right - left, bottom - top], [crop.width, crop.height]);
    return { ...crop, path: path.resolve(root, crop.path) };
  };
  const facts: Stage3MorningFact[] = accepted.map(row => {
    const alt = alts.get(row.number)!;
    assert.equal(alt.page ?? alt.physicalPage, row.physicalPage);
    const text = alt.fullAlt ?? alt.alt;
    assert(text?.startsWith(`問${row.number}`) && text.length > 40);
    return { number: row.number, page: row.physicalPage, source: `${collection}-${row.number}`,
      officialKey: row.officialKey, area: row.officialArea as Stage3MorningFact['area'], alt: text,
      choiceShuffleAllowed: false, crop: verifiedCrop(crops.questionCrops[row.number], `q${String(row.number).padStart(2, '0')}`, row.physicalPage) };
  });
  const files = new Map(facts.map(fact => [`asset-ipa-${fact.source}`, fact.crop.path]));
  const commonAssets: Asset[] = review.commonPages.map(page => {
    const image = verifiedCrop(crops.commonCrops[page], `common-${page}`, page), id = `asset-ipa-${collection}-common-${page}`;
    files.set(id, image.path);
    const { width, height, sha256, byteLength } = image;
    const alt = page === 2 ? legacy2017AutumnAmCommonPremise + ' 1. 規格・標準。試験問題での表記と規格・標準の名称。' +
      autumn2015StandardRows.map(([name, version]) => `${name}：${version}`).join('。') : autumn2015CommonFigure.alt([0]);
    return { schemaVersion: '3.0.0', id, path: `assets/stage3-${collection}-common-${page}.png`, mediaType: 'image/png',
      width, height, sha256, byteLength, alt, attribution: { origin: 'official',
        sourceRefs: [stage3MorningSourceRef(collection, undefined, page)], rightsRefs: [rightsId], creatorIds: ['ipa'] } };
  });
  return { facts, files, commonAssets };
}

function sourceMetadata() {
  const base = { schemaVersion: '3.0.0' as const, publisher, checkedOn: review.checkedOn, availability: 'officially_published' as const };
  const sources: Source[] = [
    { ...base, id: sourcePrefix + 'qs', title: title + ' 問題冊子', ...review.questionPaper, type: 'official_problem',
      scope: '全80問、原問番号と共通表記を確認した公式冊子。', sections: ['p.1 全80問・150分', 'p.2–3 共通表記', 'p.4–35 問1–80'],
      facts: ['2015年10月18日実施の秋期試験。掲載範囲と公式問数を区別する。'], supports: ['annual-sets', 'random-mix', 'attribution'],
      dateNote: '試験年度と資料の確認日を区別する。', limits: '第三者表現の利用条件の確認待ちを掲載しない。' },
    { ...base, id: sourcePrefix + 'ans', title: title + ' 解答例', ...review.answerPaper, type: 'official_answer',
      scope: '公式の全80問の正答と分野。', sections: ['p.1 問1–80'], facts: ['原問番号に対応する正答を照合する。'],
      supports: ['answer-validation'], dateNote: '試験年度と資料の確認日を区別する。', limits: '可変問題の正答には独立した検算を行う。' },
    { ...base, id: sourcePrefix + 'faq', title: 'IPA 試験FAQ（過去問題の使用）', ...review.faq, type: 'policy',
      scope: '公表過去問題を教材として使用する条件。', sections: ['その他／過去問題の使用方法と留意点'],
      facts: ['教育目的の使用に際し、出典と改変の有無を表示する。'], supports: ['ingestion', 'attribution'],
      dateNote: '確認日と公開日を区別する。', limits: '個別の第三者素材の利用可否は別途確認する。' },
    { ...base, id: sourcePrefix + 'siteinfo', title: 'IPA ウェブサイトのご利用について', ...review.sitePolicy, type: 'policy',
      scope: 'IPAウェブサイトの著作権・商標の条件。', sections: ['著作権について', '商標について'],
      facts: ['出所を示し、掲載されている個別の利用条件と権利を保持する。'], supports: ['ingestion', 'attribution'],
      dateNote: '確認日と公開日を区別する。', limits: '規格書・第三者素材の転載の根拠には用いない。' },
  ];
  const rights: Rights[] = [{ schemaVersion: '3.0.0', id: rightsId, holders: [publisher], basis: 'official_policy',
    evidence: [{ sourceId: sourcePrefix + 'faq', locator: { section: 'その他／過去問題の使用方法と留意点' } },
      { sourceId: sourcePrefix + 'siteinfo', locator: { section: '著作権について・商標について' } }],
    scope: `${title}の問${held.join('・')}を除く${accepted.length}問のIPA作問部分、正答、共通表記p.2–3。`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Past-Exam', modificationNoticeRequired: true, checkedOn: review.checkedOn,
    attributionText: `出典：${title}。©2015 ${publisher}。`,
    thirdParty: { status: 'none_identified', notes: review.materialFindings.join(' '), rightsRefs: [] },
    assessmentNotes: 'IPAの過去問題の利用条件を教材への同梱・表示・改変に適用する。出典、権利留保、改変表示、商標表記を維持する。' }];
  return { sources, rights };
}

/** Produce a fresh review candidate; admission and app verification are separate. */
export async function prepareAutumn2015Morning(inputRoot: string, destination: string, definitions: readonly GenerationDefinition[], baselineRoot = 'public/data') {
  assert.equal(official.collectionId, collection);
  assert.equal(review.collectionId, collection);
  assert.equal(review.officialCount, official.officialQuestionCount);
  assert.equal(review.timeLimitSeconds, official.officialTimeLimitSeconds);
  const { facts, commonAssets, files } = readInputs(inputRoot);
  assert.deepEqual(definitions.map(definition => definition.source), facts.map(fact => fact.source));
  const records = await makeStage3MorningRecords({ collectionId: collection, facts, definitions, commonAssets,
    ...sourceMetadata(), checkedOn: review.checkedOn });
  const explanation = records.questions.find(q => q.id === `question-ipa-${collection}-15`)?.explanation.blocks[0];
  assert(explanation?.type === 'paragraph');
  explanation.text = '原問題には2台の独立性が明記されていない。公式正答に対応する独立な故障モデルで求める。' + explanation.text;
  return writeStage3CollectionCandidate(path.resolve(baselineRoot), records, files, path.resolve(destination));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [inputRoot, destination, baselineRoot] = process.argv.slice(2);
  assert(inputRoot && destination && process.argv.length <= 5,
    'usage: tsx scripts/prepare-legacy-2015-autumn-am.ts <reviewed-input> <fresh-output> [baseline]');
  const result = await prepareAutumn2015Morning(inputRoot, destination, stage3Autumn2015MorningDefinitions, baselineRoot);
  console.log(JSON.stringify({ candidate: destination, official: official.officialQuestionCount,
    added: result.added.templates.length, actualAdmission: false }));
}
