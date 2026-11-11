import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Asset, Attribution, Rights, Source, SourceRef } from '../src/core/types';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2009-spring-am-official-answers.json';
import { spring2009CommonAlt } from '../src/core/generators/legacy-2009-spring-am-common';
import review from './source-evidence/legacy-2009-spring-am-source-review.json';
import { contentHash } from '../src/core/hash';
import { makeStage3MorningRecords, stage3MorningSourceRef, type Stage3MorningFact, type Stage3MorningRecords } from './stage3-morning-records';
import { writeStage3CollectionCandidate } from './stage3-collection-transport';

const collection = '2009h21h-fe-am';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const title = '平成21年度 春期 基本情報技術者試験 午前';
const rightsId = `rights-ipa-${collection}`;
const sourcePrefix = `source-ipa-${collection}-`;
const metiRight = `rights-meti-${collection}-59-80`;
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
  assert.deepEqual(Object.keys(crops.commonCrops), ['2']);
  const crop = verifiedCrop(crops.commonCrops[2], 'p02', 2);
  const id = `asset-ipa-${collection}-common-2`;
  files.set(id, crop.path);
  const { width, height, byteLength, sha256 } = crop;
  const common: Asset = {
    schemaVersion: '3.0.0', id, path: `assets/stage3-${collection}-common-2.png`,
    mediaType: 'image/png', width, height, byteLength, sha256, alt: spring2009CommonAlt(),
    attribution: { origin: 'official', sourceRefs: [stage3MorningSourceRef(collection, undefined, 2)],
      rightsRefs: [rightsId], creatorIds: ['ipa'] },
  };
  return { facts, files, commonAssets: [common] };
}

function sourceMetadata() {
  const base = { schemaVersion: '3.0.0' as const, publisher, checkedOn: review.checkedOn, availability: 'officially_published' as const };
  const sources: Source[] = [
    ...review.references.map(reference => ({
      ...base, id: sourcePrefix + reference.id, title: reference.title, publisher: reference.publisher,
      url: reference.url, type: 'policy' as const, scope: reference.scope, sections: [reference.section],
      facts: [reference.scope], supports: ['answer-validation', 'attribution'],
      dateNote: '試験日と資料の確認日を区別する。', limits: reference.limits,
    })),
    { ...base, id: sourcePrefix + 'qs', title: title + ' 問題冊子', url: review.sourceInputs['questions.pdf'].url, sha256: official.questionPaperSHA256,
      type: 'official_problem', scope: '公式冊子の問題・試験時間。保留問の素材は同梱しない。',
      sections: ['p.1 全80問・150分', 'p.2 論理回路の共通表記', 'p.3–31 問1–80'],
      facts: ['2009年度春期試験。テクノロジ50問、マネジメント10問、ストラテジ20問。'],
      supports: ['annual-sets', 'random-mix', 'attribution'], dateNote: `${review.examDate}実施。IPAの試験実施日一覧で照合。`, limits: '第三者表現の確認待ちは配布範囲外。' },
    { ...base, id: sourcePrefix + 'ans', title: title + ' 解答例', url: review.sourceInputs['answers.pdf'].url, sha256: official.answerPaperSHA256,
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
  { schemaVersion: '3.0.0', id: metiRight, holders: ['経済産業省'], basis: 'official_policy', checkedOn: review.checkedOn,
    evidence: review.references.filter(reference => reference.id.startsWith('meti-')).map(reference => ({
      sourceId: sourcePrefix + reference.id, locator: { section: reference.section },
    })),
    scope: '問59の経済産業省が公開した基準・ガイドラインと問80の告示。出典の文言に対応する範囲。',
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'PDL-1.0', modificationNoticeRequired: true,
    attributionText: '出典：経済産業省のシステム管理基準・ウイルス対策基準・不正アクセス対策基準・ソフトウェア管理ガイドライン。公共データ利用規約（第1.0版）。',
    thirdParty: { status: 'none_identified', notes: '対象の基準、告示及びガイドラインに第三者帰属の記載は確認されない。', rightsRefs: [] },
    assessmentNotes: '原問題の紙面では基準名と選択肢の範囲を維持し、生成版は独立に記述する。' }];
  return { sources, rights };
}

async function addSupplementaryAttribution(records: Stage3MorningRecords) {
  for (const [key, referenceIds] of Object.entries(review.referencesByQuestion)) {
    const number = Number(key);
    const source = `${collection}-${number}`;
    const original = records.questions.find(question => question.id === `question-ipa-${source}`);
    const base = records.questions.find(question => question.id === `question-template-source-${source}`);
    const asset = records.assets.find(item => item.id === `asset-ipa-${source}`);
    const template = records.templates.find(item => item.id === `template-source-${source}`);
    assert(original && base && asset && template, 'reviewed supplementary source target');
    const refs: SourceRef[] = referenceIds.map(id => {
      const entry = review.references.find(row => row.id === id);
      assert(entry, id);
      return { sourceId: sourcePrefix + entry.id, locator: { section: entry.section } };
    });
    const markRights = number === 59 || number === 80;
    const attribute = (attribution: Attribution): Attribution => ({
      ...attribution,
      sourceRefs: [...attribution.sourceRefs, ...refs],
      rightsRefs: markRights ? [...attribution.rightsRefs, metiRight] : attribution.rightsRefs,
    });
    original.explanation.attribution.sourceRefs.push(...refs);
    base.explanation.attribution.sourceRefs.push(...refs);
    if (markRights) {
      original.prompt.attribution = attribute(original.prompt.attribution);
      asset.attribution = attribute(asset.attribution);
    }
    base.prompt.attribution = attribute(base.prompt.attribution);
    template.attribution = attribute(template.attribution);
    template.originalContentSha256 = await contentHash(base);
  }
}

export async function prepareSpring2009Morning(inputRoot: string, destination: string, baselineRoot = 'public/data') {
  assert.deepEqual([official.collectionId, review.collectionId], [collection, collection]);
  assert.deepEqual([review.officialCount, review.timeLimitSeconds], [official.officialQuestionCount, official.officialTimeLimitSeconds]);
  assert.deepEqual([review.sourceInputs['questions.pdf'].sha256, review.sourceInputs['answers.pdf'].sha256],
    [official.questionPaperSHA256, official.answerPaperSHA256]);
  const { facts, files, commonAssets } = reviewInputs(inputRoot);
  const definitions = stage3AllMorningDefinitions.filter(definition => definition.source.startsWith(`${collection}-`));
  assert.deepEqual(definitions.map(definition => definition.source), facts.map(fact => fact.source));
  const records = await makeStage3MorningRecords({ collectionId: collection, facts, definitions, commonAssets, reviewedCommonPages: review.commonPages,
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
  await addSupplementaryAttribution(records);
  return writeStage3CollectionCandidate(path.resolve(baselineRoot), records, files, path.resolve(destination));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [inputRoot, destination, baselineRoot] = process.argv.slice(2);
  assert(inputRoot && destination && process.argv.length <= 5,
    'usage: tsx scripts/legacy-2009-spring-am-prepare.ts <reviewed-input> <fresh-output> [baseline]');
  const candidate = await prepareSpring2009Morning(inputRoot, destination, baselineRoot);
  console.log(JSON.stringify({ originals: candidate.added.questions.length / 2, templates: candidate.added.templates.length,
    assets: candidate.added.assets.length, catalogRevision: candidate.catalog.revision }));
}
