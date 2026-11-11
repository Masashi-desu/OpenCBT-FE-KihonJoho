import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Attribution, Rights, Source } from '../src/core/types';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2009-autumn-am-official-answers.json';
import review from './source-evidence/legacy-2009-autumn-am-source-review.json';
import { contentHash } from '../src/core/hash';
import { makeStage3MorningRecords, type Stage3MorningFact, type Stage3MorningRecords } from './stage3-morning-records';
import { writeStage3CollectionCandidate } from './stage3-collection-transport';

const collection = '2009h21a-fe-am';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const title = '平成21年度 秋期 基本情報技術者試験 午前';
const rightsId = `rights-ipa-${collection}`;
const sourcePrefix = `source-ipa-${collection}-`;
const metiRight = `rights-meti-${collection}-66`;
const metiDocument = sourcePrefix + 'meti-66-standard';
const metiPolicy = sourcePrefix + 'meti-66-policy';
const publicDataLicense = sourcePrefix + 'meti-66-pdl';
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const held = review.held.map((row: { number: number }) => row.number);
const eligible = official.records.filter(row => !held.includes(row.number));

type EvidencePin = { path: string; sha256: string; byteLength: number };
type Crop = Stage3MorningFact['crop'] & { physicalPage: number; sourcePageSHA256: string };
type CandidateCrops = {
  status: string; heldNumbers: number[]; sourcePaperSHA256: string; sourceAnswerSHA256: string;
  questionCrops: Record<number, Crop>; commonCrops: Record<number, Crop>;
};
type Preflight = {
  status: string; collectionId: string; candidateCount: number; officialQuestionCount: number;
  officialTimeLimitSeconds: number; verifiedRecords: { number: number; page: number; key: string }[];
  accessibleSourceTranscription: { references: EvidencePin[] }; cropCandidates: EvidencePin;
};

function reviewInputs(root: string) {
  const read = (relative: string, sha256: string, length?: number) => {
    assert(!path.isAbsolute(relative) && relative.split('/').every(part => part && part !== '..' && part !== '.'), 'relative reviewed input');
    const bytes = fs.readFileSync(path.join(root, relative));
    assert.equal(hash(bytes), sha256, relative);
    if (length !== undefined) assert.equal(bytes.length, length, relative);
    return bytes;
  };
  for (const [name, item] of Object.entries(review.sourceInputs)) read(`source/${name}`, item.sha256, item.byteLength);
  const preflight: Preflight = JSON.parse(read('PREFLIGHT-REVIEW.json', review.sourcePreflightSHA256).toString('utf8'));
  assert.deepEqual([preflight.status, preflight.collectionId, preflight.candidateCount, preflight.officialQuestionCount, preflight.officialTimeLimitSeconds],
    ['source_preflight_only', collection, eligible.length, official.officialQuestionCount, official.officialTimeLimitSeconds]);
  assert.deepEqual(preflight.verifiedRecords, official.records.map(row => ({ number: row.number, page: row.physicalPage, key: row.officialKey })));
  assert.equal(preflight.cropCandidates.path, 'source/crop-candidates.json');
  assert.equal(preflight.cropCandidates.sha256, review.cropCandidatesSHA256);
  const crops: CandidateCrops = JSON.parse(read(preflight.cropCandidates.path, preflight.cropCandidates.sha256, preflight.cropCandidates.byteLength).toString('utf8'));
  assert.equal(crops.status, 'source_material_reviewed_application_admission_pending');
  assert.deepEqual(crops.heldNumbers, held);
  assert.deepEqual([crops.sourcePaperSHA256, crops.sourceAnswerSHA256], [official.questionPaperSHA256, official.answerPaperSHA256]);
  assert.deepEqual(Object.keys(crops.questionCrops).map(Number), eligible.map(row => row.number));
  assert.deepEqual(Object.keys(crops.commonCrops).map(Number), review.commonPages);
  const allAlts = preflight.accessibleSourceTranscription.references.flatMap(pin => {
    const file = JSON.parse(read(pin.path, pin.sha256, pin.byteLength).toString('utf8')) as {
      collectionId: string; questions: { number: number; printedPage: number; officialAnswer: string; fullAlt?: string }[];
    };
    assert.equal(file.collectionId, collection);
    return file.questions;
  });
  assert.deepEqual(allAlts.map(row => [row.number, row.printedPage, row.officialAnswer]),
    official.records.map(row => [row.number, row.physicalPage, row.officialKey]));
  assert(allAlts.filter(row => held.includes(row.number)).every(row => !row.fullAlt));
  const verifyPNG = (bytes: Buffer) => assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137,80,78,71,13,10,26,10]));
  const verifiedCrop = (crop: Crop, stem: string, page: number) => {
    assert.equal(crop.path, `source/crops/${stem}.png`);
    assert.equal(crop.physicalPage, page);
    const original = read(`source/pages/page-${String(page).padStart(2, '0')}.png`, crop.sourcePageSHA256);
    const bytes = read(crop.path, crop.sha256, crop.byteLength);
    verifyPNG(original);
    verifyPNG(bytes);
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [crop.width, crop.height]);
    const [left, top, right, bottom] = crop.cropBox;
    assert(left >= 0 && top >= 0 && right <= original.readUInt32BE(16) && bottom <= original.readUInt32BE(20));
    assert.deepEqual([right - left, bottom - top], [crop.width, crop.height]);
    return { ...crop, path: path.resolve(root, crop.path) };
  };
  const facts: Stage3MorningFact[] = eligible.map(row => {
    const alt = allAlts[row.number - 1].fullAlt;
    assert(alt?.startsWith(`問${row.number}`) && alt.length > 30);
    return { number: row.number, page: row.physicalPage, source: row.source, officialKey: row.officialKey,
      area: row.officialArea as Stage3MorningFact['area'], alt, choiceShuffleAllowed: false,
      crop: verifiedCrop(crops.questionCrops[row.number], `q${String(row.number).padStart(2, '0')}`, row.physicalPage) };
  });
  const files = new Map(facts.map(fact => [`asset-ipa-${fact.source}`, fact.crop.path]));
  assert.deepEqual(Object.keys(crops.commonCrops), [], 'the source has no common notation page');
  return { facts, files };
}

function sourceMetadata() {
  const base = { schemaVersion: '3.0.0' as const, publisher, checkedOn: review.checkedOn, availability: 'officially_published' as const };
  const { officialAppendix, publisherTerms, pdl } = review.metiQuestion66;
  const meti = '経済産業省';
  const sources: Source[] = [
    { ...base, id: metiDocument, title: 'システム管理基準 追補版', publisher: meti, url: officialAppendix.url,
      type: 'policy', scope: '問66の開発計画と4項目の対応。', sections: [officialAppendix.locator],
      facts: ['開発計画における費用、スケジュール、開発体制、投資効果の位置付けを照合した。'],
      supports: ['answer-validation', 'attribution'], dateNote: '2007年公表の追補版に掲載された平成16年基準の管理項目。', limits: officialAppendix.limits },
    { ...base, id: metiPolicy, title: '経済産業省ウェブサイトの利用規約', publisher: meti, url: publisherTerms.url,
      type: 'policy', scope: '経済産業省が公表した資料の出典と改変の表示。', sections: [publisherTerms.locator],
      facts: ['対象コンテンツに公共データ利用規約（第1.0版）を適用する。'], supports: ['attribution'],
      dateNote: '利用規約の確認日を記録。', limits: publisherTerms.limits },
    { ...base, id: publicDataLicense, title: '公共データ利用規約（第1.0版）', publisher: 'デジタル庁', url: pdl.url,
      sha256: pdl.sha256, type: 'policy', scope: '複製、公衆送信、翻案及び出典・第三者権利の条件。', sections: [pdl.locator],
      facts: ['出典と編集の有無を表示する。'], supports: ['attribution'], dateNote: '第1.0版の原文を確認。',
      limits: '公表主体の個別条件と第三者権利の条件に従う。' },
    { ...base, id: sourcePrefix + 'qs', title: title + ' 問題冊子', url: review.sourceInputs['question.pdf'].url, sha256: official.questionPaperSHA256,
      type: 'official_problem', scope: '公式冊子の問題・試験時間。保留問の素材は同梱しない。',
      sections: ['p.1 全80問・150分', 'p.3–32 問1–80'],
      facts: ['2009年度秋期試験。テクノロジ50問、マネジメント10問、ストラテジ20問。'],
      supports: ['annual-sets', 'random-mix', 'attribution'], dateNote: `${review.examDate}実施。IPAの試験実施日一覧で照合。`, limits: '第三者表現の確認待ちは配布範囲外。' },
    { ...base, id: sourcePrefix + 'ans', title: title + ' 解答例', url: review.sourceInputs['answer.pdf'].url, sha256: official.answerPaperSHA256,
      type: 'official_answer', scope: '公式の全80問の正答。', sections: ['p.1 問1–80'],
      facts: ['元の問番号と解答記号を照合した。'], supports: ['answer-validation'], dateNote: '試験日と資料の確認日を区別する。', limits: '生成問題は独立検算する。' },
    { ...base, id: sourcePrefix + 'faq', title: 'IPA 試験FAQ（過去問題の使用）', url: review.sourceInputs['faq.html'].url, sha256: review.sourceInputs['faq.html'].sha256,
      type: 'policy', scope: '公表された過去問題の教育目的での使用条件。', sections: ['その他／過去問題の使用方法と留意点'],
      facts: ['出典と改変の有無を表示する。'], supports: ['ingestion', 'attribution'], dateNote: '確認日と公開日を区別する。', limits: '第三者素材は別途確認。' },
    { ...base, id: sourcePrefix + 'siteinfo', title: 'IPA ウェブサイトのご利用について', url: review.sourceInputs['siteinfo.html'].url, sha256: review.sourceInputs['siteinfo.html'].sha256,
      type: 'policy', scope: 'IPAサイトの著作権と商標。', sections: ['著作権について', '商標について'],
      facts: ['個別条件と出所の明示を保持する。'], supports: ['ingestion', 'attribution'], dateNote: '確認日と公開日を区別する。', limits: '第三者の規格書・商標の利用可否とは別。' },
  ];
  const rights: Rights[] = [{ schemaVersion: '3.0.0', id: rightsId, holders: [publisher], basis: 'official_policy',
    evidence: [{ sourceId: sourcePrefix + 'faq', locator: { section: 'その他／過去問題の使用方法と留意点' } },
      { sourceId: sourcePrefix + 'siteinfo', locator: { section: '著作権について・商標について' } }],
    scope: `${title}の収録${eligible.length}問のIPA作問部分と正答。`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Past-Exam', modificationNoticeRequired: true, checkedOn: review.checkedOn,
    attributionText: `出典：${title}。©2009 ${publisher}。`,
    thirdParty: { status: 'none_identified', notes: review.materialFindings.join(' '), rightsRefs: [] },
    assessmentNotes: '教育用の同梱・ブラウザ表示・改変。年度・期・試験区分・時間区分・問番号、権利留保と改変の表示を維持する。' },
  { schemaVersion: '3.0.0', id: metiRight, holders: [meti], basis: 'official_policy', checkedOn: review.checkedOn,
    evidence: [{ sourceId: metiDocument, locator: { section: officialAppendix.locator } },
      { sourceId: metiPolicy, locator: { section: publisherTerms.locator } },
      { sourceId: publicDataLicense, locator: { section: pdl.locator } }],
    scope: '問66の開発計画と原問が参照する4項目の対応。',
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'PDL-1.0', modificationNoticeRequired: true,
    attributionText: '出典：経済産業省「システム管理基準 追補版」付録2-1 印刷p.7。公共データ利用規約（第1.0版）。',
    thirdParty: { status: 'none_identified', notes: '使用した管理項目に第三者帰属の記載を確認しなかった。', rightsRefs: [] },
    assessmentNotes: review.metiQuestion66.boundary }];
  return { sources, rights };
}

async function attributeQuestion66Reference(records: Stage3MorningRecords) {
  const source = `${collection}-66`;
  const original = records.questions.find(question => question.id === `question-ipa-${source}`);
  const base = records.questions.find(question => question.id === `question-template-source-${source}`);
  const asset = records.assets.find(item => item.id === `asset-ipa-${source}`);
  const template = records.templates.find(item => item.id === `template-source-${source}`);
  assert(original && base && asset && template, 'reviewed METI attribution target');
  const attribute = (attribution: Attribution): Attribution => ({
    ...attribution,
    sourceRefs: [...attribution.sourceRefs, { sourceId: metiDocument, locator: { section: review.metiQuestion66.officialAppendix.locator } }],
    rightsRefs: [...attribution.rightsRefs, metiRight],
  });
  original.prompt.attribution = attribute(original.prompt.attribution);
  base.prompt.attribution = attribute(base.prompt.attribution);
  asset.attribution = attribute(asset.attribution);
  template.attribution = attribute(template.attribution);
  template.originalContentSha256 = await contentHash(base);
}

export async function prepareAutumn2009Morning(inputRoot: string, destination: string, baselineRoot = 'public/data') {
  assert.deepEqual([official.collectionId, review.collectionId], [collection, collection]);
  assert.deepEqual([review.officialCount, review.timeLimitSeconds], [official.officialQuestionCount, official.officialTimeLimitSeconds]);
  assert.deepEqual([review.sourceInputs['question.pdf'].sha256, review.sourceInputs['answer.pdf'].sha256],
    [official.questionPaperSHA256, official.answerPaperSHA256]);
  const { facts, files } = reviewInputs(inputRoot);
  const definitions = stage3AllMorningDefinitions.filter(definition => definition.source.startsWith(`${collection}-`));
  assert.deepEqual(definitions.map(definition => definition.source), facts.map(fact => fact.source));
  const records = await makeStage3MorningRecords({ collectionId: collection, facts, definitions, commonAssets: [], reviewedCommonPages: review.commonPages,
    ...sourceMetadata(), checkedOn: review.checkedOn });
  // full_exam is reserved by the distribution schema for current 60-question
  // Subject A practice. The historical configuration issues all admitted questions.
  const practice = records.exams.find(exam => exam.mode === 'practice');
  assert(practice && practice.questionCount === eligible.length && practice.timeLimitSeconds === 9000);
  practice.practiceScope = 'public_subset';
  for (const question of records.questions.filter(row => row.origin.kind === 'official_adaptation')) {
    const number = Number(question.id.split('-').at(-1));
    const definition = definitions.find(row => row.source === `${collection}-${number}`);
    assert(definition);
    question.review.notes += ' ' + definition.notes;
  }
  await attributeQuestion66Reference(records);
  return writeStage3CollectionCandidate(path.resolve(baselineRoot), records, files, path.resolve(destination));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [inputRoot, destination, baselineRoot] = process.argv.slice(2);
  assert(inputRoot && destination && process.argv.length <= 5,
    'usage: tsx scripts/legacy-2009-autumn-am-prepare.ts <reviewed-input> <fresh-output> [baseline]');
  const candidate = await prepareAutumn2009Morning(inputRoot, destination, baselineRoot);
  console.log(JSON.stringify({ originals: candidate.added.questions.length / 2, templates: candidate.added.templates.length,
    assets: candidate.added.assets.length, catalogRevision: candidate.catalog.revision }));
}
