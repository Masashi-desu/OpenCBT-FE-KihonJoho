import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Rights, Source, SourceRef } from '../src/core/types';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import official from '../tests/fixtures/legacy-2008-spring-am-official-answers.json';
import review from './source-evidence/legacy-2008-spring-am-source-review.json';
import { contentHash } from '../src/core/hash';
import { makeStage3MorningRecords, type Stage3MorningFact, type Stage3MorningRecords } from './stage3-morning-records';
import { writeStage3CollectionCandidate } from './stage3-collection-transport';

const collection = '2008h20h-fe-am';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const title = '平成20年度 春期 基本情報技術者試験 午前';
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
  return { facts, files };
}

type ReviewedReference = {
  id: string; title: string; publisher: string; url: string;
  type: 'law' | 'policy' | 'independent_note'; section: string; scope: string; limits: string;
};

function sourceMetadata() {
  const base = { schemaVersion: '3.0.0' as const, publisher, checkedOn: review.checkedOn, availability: 'officially_published' as const };
  const policy = (suffix: 'faq' | 'siteinfo' | 'warp-help', title: string, publisher: string, section: string, scope: string, limits: string): Source => {
    const input = review.sourceInputs[suffix + '.html' as 'faq.html' | 'siteinfo.html' | 'warp-help.html'];
    return { ...base, id: sourcePrefix + suffix, title, publisher, url: input.url, sha256: input.sha256,
      type: 'policy', scope, sections: [section], facts: [scope], supports: ['ingestion', 'attribution'],
      dateNote: '確認日を記録し、試験日や資料の公開日と区別する。', limits };
  };
  const sources: Source[] = [
    { ...base, id: sourcePrefix + 'qs', title: title + ' 問題冊子（国立国会図書館WARP保存版）',
      url: review.sourceInputs['questions.pdf'].url, sha256: official.questionPaperSHA256,
      type: 'official_problem', scope: 'IPAの公式冊子の問題と試験時間。',
      sections: ['p.1 全80問・150分', 'p.2・35 白紙', 'p.3–34 問1–80', 'p.36 裏表紙の注意事項'],
      facts: ['物理ページと印刷ページが一致する。', '出題時の分野は設問内容から分類する。'],
      supports: ['annual-sets', 'random-mix', 'attribution'],
      dateNote: '平成20年度春期の公表資料。WARPの保存日時は試験日・原公表日と区別する。',
      limits: '素材の個別査読に基づいて問題単位で収録する。' },
    { ...base, id: sourcePrefix + 'ans', title: title + ' 解答例（国立国会図書館WARP保存版）',
      url: review.sourceInputs['answers.pdf'].url, sha256: official.answerPaperSHA256,
      type: 'official_answer', scope: '公式の問1〜80の正答。', sections: ['p.1 問1–80'],
      facts: ['公式解答表を独立に読み取り、冊子の原問番号と照合した。'],
      supports: ['answer-validation'], dateNote: '平成20年度春期の公表資料。', limits: '生成問題の正答は独立に検算する。' },
    policy('faq', 'IPA 試験FAQ（過去問題の使用）', publisher, 'その他／過去問題の使用方法と留意点',
      '公表された過去問題の教育用問題集での使用、出典及び改変の表示。', '第三者の素材は別に確認する。'),
    policy('siteinfo', 'IPA ウェブサイトのご利用について', publisher, '著作権について・商標について',
      '公開資料の著作権の帰属と商標の取扱い。', '名称の参照と図・文章等の転載を区別する。'),
    policy('warp-help', '国立国会図書館インターネット資料収集保存事業（WARP）のヘルプ', '国立国会図書館', '5-4. 著作権について',
      '収集保存した資料の著作権は原権利者に帰属し、二次利用は原権利者の条件に従う。', 'WARPの表示画面・ロゴを原問題に含めない。'),
    ...(review.references as ReviewedReference[]).map(reference => ({
      ...base, id: sourcePrefix + reference.id, title: reference.title, publisher: reference.publisher,
      url: reference.url, type: reference.type, scope: reference.scope, sections: [reference.section],
      facts: [reference.scope], supports: ['answer-validation', 'attribution'],
      dateNote: '歴史的な設問は当時の条件で解説する。', limits: reference.limits,
    })),
  ];
  const rights: Rights[] = [{
    schemaVersion: '3.0.0', id: rightsId, holders: [publisher], basis: 'official_policy', checkedOn: review.checkedOn,
    evidence: [
      { sourceId: sourcePrefix + 'faq', locator: { section: 'その他／過去問題の使用方法と留意点' } },
      { sourceId: sourcePrefix + 'siteinfo', locator: { section: '著作権について・商標について' } },
      { sourceId: sourcePrefix + 'warp-help', locator: { section: '5-4. 著作権について' } },
    ],
    scope: `${title}の収録${eligible.length}問と解答例のIPA作問部分。`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Past-Exam', modificationNoticeRequired: true,
    attributionText: `出典：${title}。©2008 ${publisher}。取得元は国立国会図書館インターネット資料収集保存事業（WARP）。`,
    thirdParty: { status: 'none_identified', notes: review.materialFindings.join(' '), rightsRefs: [] },
    assessmentNotes: '元の公表者と保存機関を区別し、教育用の同梱・表示・改変にIPAの出典・改変表示条件を適用する。',
  }];
  return { sources, rights };
}

async function addReviewedReferences(records: Stage3MorningRecords) {
  const references = review.references as ReviewedReference[];
  const referencesByQuestion: Record<string, string[]> = review.referencesByQuestion;
  for (const [number, ids] of Object.entries(referencesByQuestion)) {
    const source = `${collection}-${number}`;
    const original = records.questions.find(question => question.id === `question-ipa-${source}`);
    const base = records.questions.find(question => question.id === `question-template-source-${source}`);
    const template = records.templates.find(item => item.id === `template-source-${source}`);
    assert(original && base && template, 'reviewed reference target');
    const refs: SourceRef[] = ids.map(id => {
      const reference = references.find(item => item.id === id);
      assert(reference, id);
      return { sourceId: sourcePrefix + id, locator: { section: reference.section } };
    });
    original.explanation.attribution.sourceRefs.push(...refs);
    base.explanation.attribution.sourceRefs.push(...refs);
    template.originalContentSha256 = await contentHash(base);
  }
}

export async function prepareSpring2008Morning(inputRoot: string, destination: string, baselineRoot = 'public/data') {
  assert.deepEqual([official.collectionId, review.collectionId], [collection, collection]);
  assert.deepEqual([review.officialCount, review.timeLimitSeconds], [official.officialQuestionCount, official.officialTimeLimitSeconds]);
  const { facts, files } = reviewInputs(inputRoot);
  const definitions = stage3AllMorningDefinitions.filter(definition => definition.source.startsWith(`${collection}-`));
  assert.deepEqual(definitions.map(definition => definition.source), facts.map(fact => fact.source));
  const records = await makeStage3MorningRecords({ collectionId: collection, facts, definitions, commonAssets: [],
    reviewedCommonPages: review.commonPages, ...sourceMetadata(), checkedOn: review.checkedOn });
  const practice = records.exams.find(exam => exam.mode === 'practice');
  assert(practice && practice.questionCount === eligible.length && practice.timeLimitSeconds === 9000);
  // The schema uses full_exam for the current 60-question Subject A configuration.
  practice.practiceScope = 'public_subset';
  await addReviewedReferences(records);
  return writeStage3CollectionCandidate(path.resolve(baselineRoot), records, files, path.resolve(destination));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [inputRoot, destination, baselineRoot] = process.argv.slice(2);
  assert(inputRoot && destination && process.argv.length <= 5,
    'usage: tsx scripts/legacy-2008-spring-am-prepare.ts <reviewed-input> <fresh-output> [baseline]');
  const candidate = await prepareSpring2008Morning(inputRoot, destination, baselineRoot);
  console.log(JSON.stringify({ originals: candidate.added.questions.length / 2, templates: candidate.added.templates.length,
    assets: candidate.added.assets.length, catalogRevision: candidate.catalog.revision }));
}
