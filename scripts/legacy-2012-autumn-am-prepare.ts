import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Asset, Rights, Source } from '../src/core/types';
import { autumn2012CommonFigure } from '../src/core/generators/legacy-2012-autumn-am-common';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2012-autumn-am-official-answers.json';
import review from './source-evidence/legacy-2012-autumn-am-source-review.json';
import { makeStage3MorningRecords, stage3MorningSourceRef, type Stage3MorningFact } from './stage3-morning-records';
import { writeStage3CollectionCandidate } from './stage3-collection-transport';

const collection = '2012h24a-fe-am';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const title = '平成24年度 秋期 基本情報技術者試験 午前';
const rightsId = `rights-ipa-${collection}`;
const sourcePrefix = `source-ipa-${collection}-`;
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
  const commonAssets: Asset[] = review.commonPages.map(page => {
    const image = verifiedCrop(crops.commonCrops[page], `common-${page}`, page);
    const id = `asset-ipa-${collection}-common-${page}`;
    files.set(id, image.path);
    const { width, height, sha256, byteLength } = image;
    const alt = autumn2012CommonFigure.alt([0]);
    return { schemaVersion: '3.0.0', id, path: `assets/stage3-${collection}-common-${page}.png`,
      mediaType: 'image/png', width, height, sha256, byteLength, alt,
      attribution: { origin: 'official', sourceRefs: [stage3MorningSourceRef(collection, undefined, page)], rightsRefs: [rightsId], creatorIds: ['ipa'] } };
  });
  return { facts, files, commonAssets };
}

function sourceMetadata() {
  const base = { schemaVersion: '3.0.0' as const, publisher, checkedOn: review.checkedOn, availability: 'officially_published' as const };
  const sources: Source[] = [
    { ...base, id: sourcePrefix + 'qs', title: title + ' 問題冊子', url: review.sourceInputs['question.pdf'].url, sha256: official.questionPaperSHA256,
      type: 'official_problem', scope: '公式冊子の問題・共通表記・試験時間。保留問の素材は同梱しない。',
      sections: ['p.1 全80問・150分', 'p.2 共通表記', 'p.3–35 問1–80'],
      facts: ['2012年度秋期。テクノロジ50問、マネジメント10問、ストラテジ20問。'],
      supports: ['annual-sets', 'random-mix', 'attribution'], dateNote: `${review.examDate}実施。年度別のIPA公式一覧は2013年1月11日最終更新。`, limits: '第三者表現の確認待ちは配布範囲外。' },
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
    scope: `${title}の収録${eligible.length}問のIPA作問部分、正答、共通表記p.2。`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Past-Exam', modificationNoticeRequired: true, checkedOn: review.checkedOn,
    attributionText: `出典：${title}。©2012 ${publisher}。`,
    thirdParty: { status: 'none_identified', notes: review.materialFindings.join(' '), rightsRefs: [] },
    assessmentNotes: '教育用の同梱・ブラウザ表示・改変。年度・期・試験区分・時間区分・問番号、権利留保と改変の表示を維持する。' }];
  return { sources, rights };
}

export async function prepareAutumn2012Morning(inputRoot: string, destination: string, baselineRoot = 'public/data') {
  assert.deepEqual([official.collectionId, review.collectionId], [collection, collection]);
  assert.deepEqual([review.officialCount, review.timeLimitSeconds], [official.officialQuestionCount, official.officialTimeLimitSeconds]);
  assert.deepEqual([review.sourceInputs['question.pdf'].sha256, review.sourceInputs['answer.pdf'].sha256],
    [official.questionPaperSHA256, official.answerPaperSHA256]);
  const { facts, commonAssets, files } = reviewInputs(inputRoot);
  const definitions = stage3AllMorningDefinitions.filter(definition => definition.source.startsWith(`${collection}-`));
  assert.deepEqual(definitions.map(definition => definition.source), facts.map(fact => fact.source));
  const records = await makeStage3MorningRecords({ collectionId: collection, facts, definitions, commonAssets,
    ...sourceMetadata(), checkedOn: review.checkedOn });
  // full_exam is reserved by the distribution schema for current 60-question
  // Subject A practice. The historical configuration still issues all 80.
  const practice = records.exams.find(exam => exam.mode === 'practice');
  assert(practice && practice.questionCount === eligible.length && practice.timeLimitSeconds === 9000);
  practice.practiceScope = 'public_subset';
  for (const question of records.questions.filter(row => row.origin.kind === 'official_adaptation')) {
    const number = Number(question.id.split('-').at(-1));
    const definition = definitions.find(row => row.source === `${collection}-${number}`);
    assert(definition);
    question.review.notes += ' ' + definition.notes;
  }
  return writeStage3CollectionCandidate(path.resolve(baselineRoot), records, files, path.resolve(destination));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [inputRoot, destination, baselineRoot] = process.argv.slice(2);
  assert(inputRoot && destination && process.argv.length <= 5,
    'usage: tsx scripts/legacy-2012-autumn-am-prepare.ts <reviewed-input> <fresh-output> [baseline]');
  const candidate = await prepareAutumn2012Morning(inputRoot, destination, baselineRoot);
  console.log(JSON.stringify({ originals: candidate.added.questions.length / 2, templates: candidate.added.templates.length,
    assets: candidate.added.assets.length, catalogRevision: candidate.catalog.revision }));
}
