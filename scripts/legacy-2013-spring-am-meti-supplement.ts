import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { catalogKinds } from '../src/core/catalog-files';
import { contentHash } from '../src/core/hash';
import type { Attribution, Block, Bundle, Rights, Source, SourceRef } from '../src/core/types';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import answers2011 from '../tests/fixtures/legacy-2011-autumn-am-official-answers.json';
import answers2012 from '../tests/fixtures/legacy-2012-autumn-am-official-answers.json';
import answers2013 from '../tests/fixtures/legacy-2013-spring-am-official-answers.json';
import review2011 from './source-evidence/legacy-2011-autumn-am-source-review.json';
import review2012 from './source-evidence/legacy-2012-autumn-am-source-review.json';
import review2013 from './source-evidence/legacy-2013-spring-am-source-review.json';
import { makeStage3MorningRecords, stage3MorningSourceRef, type Stage3MorningFact } from './stage3-morning-records';

const booklets = {
  '2013h25h-fe-am': {
    number: 62, answers: answers2013, review: review2013, keys: 'ウアイエ',
    statementHash: '5a32e8d15134fc22897233b7ef6d75478dc83a15e23f11236279336cb146edfd',
  },
  '2012h24a-fe-am': {
    number: 61, answers: answers2012, review: review2012, keys: 'ウアイエ',
    statementHash: 'b64ff81c3b42fa0df3a94ae16caa0aef37d2d322080788c5d0c6a3ba8d90d7d5',
  },
  '2011h23a-fe-am': {
    number: 67, answers: answers2011, review: review2011, keys: 'イアウエ',
    statementHash: '73f2100563ab5e0a0a1b3774b1a481a2aee7e594816ad7de559a12aea867d028',
  },
} as const;

export type MetiSupplementBooklet = keyof typeof booklets;
const sharedReviewPath = 'priority1-2013-spring-am/meti-2004-review.json';
const sharedReviewHash = '8224555d69fecf79156a487331d7235305502d6f1f2754139134341b1e1a67e0';
const licenseUrl = 'https://creativecommons.org/licenses/by/4.0/legalcode.ja';
const sourcePrefix = 'source-meti-system-management-2004-';
const letters = 'アイウエ';

type FileEvidence = { url: string; sha256: string };
type Crop = Stage3MorningFact['crop'] & { inputRoot?: string; alt?: string; physicalPage: number };
type ReviewedQuestion = {
  collectionId: string; number: number; page: number; pdf: string; officialKey: string; asset?: Crop;
  choices: { label: string; sections: string[]; match: string }[];
};
type MetiReview = {
  edition: {
    title: string; publisher: string; publishedOn: string; checkedOn: string; legalCode: string;
    archiveSources: Record<'officialPDF' | 'firstOfficialPDF' | 'officialListing' | 'terms' | 'exceptions', FileEvidence>;
    evidence: string; uses: Rights['uses']; limits: string;
  };
  questions: ReviewedQuestion[];
};

const digest = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
function sealedJson<T>(file: string, sha256: string): T {
  const bytes = fs.readFileSync(file);
  assert.equal(digest(bytes), sha256, file);
  return JSON.parse(bytes.toString('utf8')) as T;
}

function reviewedCrop(root: string, question: ReviewedQuestion): { crop: Crop; alt: string } {
  if (question.collectionId === '2013h25h-fe-am') {
    const crop = question.asset;
    assert(crop?.inputRoot && crop.alt);
    return { crop: { ...crop, path: path.resolve(root, 'priority1-2013-spring-am', crop.inputRoot, crop.path) }, alt: crop.alt };
  }
  if (question.collectionId === '2012h24a-fe-am') {
    const directory = path.join(root, 'priority1-2012-autumn-am');
    const { fact, referenceSources } = sealedJson<{
      fact: Stage3MorningFact & { crop: Crop };
      referenceSources: FileEvidence[];
    }>(path.join(directory, 'source-review.json'), '81dd0bf9f3ae5eb7316f133e88ad6dcb224b4fa985675df0985c1f58a5e97903');
    assert.equal(fact.source, `${question.collectionId}-${question.number}`);
    assert.equal(fact.page, question.page);
    assert.equal(fact.officialKey, question.officialKey);
    assert.deepEqual(referenceSources.map(s => s.sha256), [
      '43a944ea78e26081bffa5d381b648db2e70574897d66c3f4f1d948d1302ae9f7',
      'e8200320686b5c343876a768c853549b36b8392e4e36a839b7475830db1b97ea',
    ]);
    return { crop: { ...fact.crop, path: path.resolve(directory, fact.crop.path) }, alt: fact.alt };
  }
  const directory = path.join(root, 'priority1-2011-autumn-am');
  const { crop, reviewRef } = sealedJson<{ crop: Crop; reviewRef: { sha256: string; pointer: string } }>(
    path.join(directory, 'integration-material.json'), 'f6390a276f88e4fe878d8f30263560f6060e49080b912c0287b6ffc6efd94b48',
  );
  assert.deepEqual(reviewRef, {
    path: '../' + sharedReviewPath, pointer: '/questions/2', sha256: sharedReviewHash,
  });
  assert(crop.inputRoot && crop.alt);
  return { crop: { ...crop, path: path.resolve(directory, crop.inputRoot, crop.path) }, alt: crop.alt };
}

function createMetiSources(review: MetiReview): Source[] {
  const { edition } = review;
  const { officialPDF, firstOfficialPDF, officialListing, terms, exceptions } = edition.archiveSources;
  assert.equal(edition.legalCode, licenseUrl);
  assert.equal(edition.publishedOn, '2004-10-08');
  assert.equal(officialPDF.sha256, firstOfficialPDF.sha256);
  const source = (key: string, file: FileEvidence, fields: Pick<Source, 'title'> & Record<string, unknown>): Source => ({
    schemaVersion: '3.0.0', id: sourcePrefix + key, publisher: edition.publisher, checkedOn: edition.checkedOn,
    url: file.url, sha256: file.sha256, type: 'policy', availability: 'officially_published',
    supports: ['出典・権利の確認'], ...fields,
  });
  return [
    source('pdf', officialPDF, {
      title: edition.title, dateNote: '平成16年10月8日策定。2004年12月収集版と2016年12月収集版のPDFは同一。', scope: '平成16年10月8日策定版。',
      sections: [...new Set(review.questions.flatMap(question => question.choices.flatMap(choice => choice.sections)))],
      facts: ['全体最適化計画と目標、開発計画、運用計画、事業継続、調達、保守、人的資源管理に関する管理事項を定める。'],
      limits: edition.limits,
    }),
    source('listing', officialListing, {
      title: '経済産業省「システム監査」', dateNote: '2016年12月16日のWARP収集日時を確認。ページ自体の公開日は未確認。',
      scope: '平成16年10月策定版の公式掲載案内。', sections: ['システム管理基準（平成16年10月策定）'],
      facts: ['平成16年10月策定版を明示し、資料PDFへのリンクを掲載している。'],
      limits: '平成16年版が経済産業省の公表資料であることを確認する。個別素材の利用条件は別途公表規約と別紙を参照する。',
    }),
    source('terms', terms, {
      title: '経済産業省ウェブサイトの利用規約', dateNote: '平成28年1月29日制定。2016年12月7日のWARP収集版。',
      scope: '政府標準利用規約（第2.0版）に準拠する当時の経済産業省公表情報の利用条件。',
      sections: ['著作権について 1）・2）・4）・7）ウ'],
      facts: ['複製、公衆送信、商用、翻案を認める。出典と編集・加工の表示を求め、第三者権利と別紙の対象を留保する。7）ウはCC BY 4.0の選択も認める。'],
      limits: '第三者が権利を保有するコンテンツと別規約の適用対象は個別に確認する。',
    }),
    source('exceptions', exceptions, {
      title: '経済産業省ウェブサイトの利用規約 別紙', dateNote: '2016年12月7日のWARP収集版。別紙の公開日は未確認。',
      scope: '別の利用ルールを適用するコンテンツの一覧。', sections: ['別紙'],
      facts: ['平成16年10月策定のシステム管理基準は個別利用ルールの一覧に記載されていない。'],
      limits: '同じ経済産業省の別刊行物や後年版の利用条件は範囲外とする。',
    }),
  ];
}

function refsForQuestion(question: ReviewedQuestion): SourceRef[] {
  const byPage = new Map<number, Set<string>>();
  for (const choice of question.choices) {
    for (const value of choice.sections) {
      const match = /^(.*) p\.(\d+)$/.exec(value);
      assert(match, value);
      const page = Number(match[2]);
      const sections = byPage.get(page) ?? new Set();
      sections.add(match[1]);
      byPage.set(page, sections);
    }
  }
  return [...byPage].sort(([a], [b]) => a - b).map(([page, sections]) => ({
    sourceId: sourcePrefix + 'pdf',
    locator: { section: '平成16年10月8日策定版 ' + [...sections].join('、'), page },
  }));
}

function paragraphText(blocks: readonly Block[]): string {
  assert.equal(blocks.length, 1);
  const [block] = blocks;
  assert(block.type === 'paragraph');
  return block.text;
}

export async function prepareMeti2004MorningSupplement(
  bundle: Bundle,
  collectionId: MetiSupplementBooklet,
  sourceReviewRoot: string,
) {
  assert(Object.hasOwn(booklets, collectionId), 'reviewed booklet only');
  const booklet = booklets[collectionId];
  const review = sealedJson<MetiReview>(path.join(sourceReviewRoot, sharedReviewPath), sharedReviewHash);
  assert.deepEqual(review.questions.map(question => question.collectionId), Object.keys(booklets));
  const question = review.questions.find(row => row.collectionId === collectionId);
  assert(question && question.number === booklet.number);
  assert.deepEqual(question.choices.map(choice => choice.label), [...letters]);

  const source = `${collectionId}-${question.number}`;
  const official = booklet.answers.records.filter(record => record.number === question.number);
  assert.deepEqual(official, [{
    number: question.number, source, physicalPage: question.page, officialArea: 'strategy', officialKey: question.officialKey,
  }]);
  for (const [suffix, filename] of [['qs', 'question.pdf'], ['ans', 'answer.pdf']] as const) {
    const confirmed = booklet.review.sourceInputs[filename];
    const existing = bundle.sources.find(record => record.id === `source-ipa-${collectionId}-${suffix}`);
    assert(existing && existing.availability === 'officially_published');
    assert.equal(existing.sha256, confirmed.sha256);
    assert.equal(existing.url, confirmed.url);
  }
  assert.equal(question.pdf, booklet.review.sourceInputs['question.pdf'].url + '#page=' + question.page);

  const { crop, alt } = reviewedCrop(sourceReviewRoot, question);
  const bytes = fs.readFileSync(crop.path);
  assert.equal(crop.physicalPage, question.page);
  assert.equal(digest(bytes), crop.sha256);
  assert.equal(bytes.length, crop.byteLength);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR');
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [crop.width, crop.height]);

  const definitions = stage3AllMorningDefinitions.filter(definition => definition.source === source);
  assert.equal(definitions.length, 1);
  const [definition] = definitions;
  assert.equal(definition.sourceAnswer, question.officialKey);
  assert.deepEqual(definition.reference, [0]);
  assert.equal(definition.fields.length, 1);
  assert.equal(definition.fields[0].minimum, 0);
  assert.equal(definition.fields[0].maximum, 3);
  const bodies = [...booklet.keys].map((_, input) => definition.build([input]));
  assert.equal(bodies.map(body => letters[body.correctIndex!]).join(''), booklet.keys);
  const stem = paragraphText(bodies[0].prompt);
  const choices = bodies[0].choices.map(paragraphText);
  assert.equal(digest(JSON.stringify([stem, choices])), booklet.statementHash);
  let offset = alt.indexOf(stem);
  assert(offset >= 0);
  for (const choice of choices) {
    offset = alt.indexOf(choice, offset + 1);
    assert(offset >= 0);
  }
  assert.equal(new Set(bodies.map(body => paragraphText(body.prompt))).size, bodies.length);
  assert(bodies.every(body => body.choices.length === letters.length && new Set(body.choices.map(paragraphText)).size === letters.length));

  const existingIpaRight = bundle.rights.find(right => right.id === 'rights-ipa-' + collectionId);
  assert(existingIpaRight && existingIpaRight.licenseId === 'LicenseRef-IPA-Past-Exam');
  assert.equal(existingIpaRight.basis, 'official_policy');
  assert(Object.values(existingIpaRight.uses).every(use => use === 'allowed'));
  assert(existingIpaRight.evidence.every(e => bundle.sources.some(r => r.id === e.sourceId)));
  const commonAssets = booklet.review.commonPages.map(page => {
    const asset = bundle.assets.find(record => record.id === `asset-ipa-${collectionId}-common-${page}`);
    assert(asset);
    assert.deepEqual(asset.attribution.sourceRefs, [stage3MorningSourceRef(collectionId, undefined, page)]);
    assert.deepEqual(asset.attribution.rightsRefs, [existingIpaRight.id]);
    return asset;
  });

  const { edition } = review;
  assert.deepEqual(edition.uses, { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' });
  const standardRefs = refsForQuestion(question);
  const exam = stage3MorningSourceRef(collectionId, question.number, question.page);
  const metiRight: Rights = {
    schemaVersion: '3.0.0', id: 'rights-meti-' + source + '-2004', checkedOn: edition.checkedOn,
    holders: [edition.publisher], basis: 'official_policy', licenseId: 'CC-BY-4.0',
    scope: `${exam.locator.section}の各肢に対応する平成16年10月8日策定版の管理事項。原紙・代替テキストの対応表現と、基準・生成問題で改変した対応表現。`,
    evidence: [
      ...standardRefs,
      { sourceId: sourcePrefix + 'listing', locator: { section: 'システム管理基準（平成16年10月策定）' } },
      { sourceId: sourcePrefix + 'terms', locator: { section: '著作権について 1）・2）・4）・7）ウ' } },
      { sourceId: sourcePrefix + 'exceptions', locator: { section: '別紙' } },
    ],
    uses: { ...edition.uses }, modificationNoticeRequired: true,
    attributionText: `出典：${edition.publisher}「${edition.title}」。CC BY 4.0（${edition.legalCode}）。基準問題・生成問題の事例と表現の変更はOpenCBT-FE-KihonJoho。`,
    thirdParty: { status: 'none_identified', notes: '利用対象の管理事項に第三者帰属の記載を確認しなかった。', rightsRefs: [] },
    assessmentNotes: edition.evidence + ' ' + edition.limits,
  };
  const ipaRight: Rights = {
    ...structuredClone(existingIpaRight), id: 'rights-ipa-' + source, checkedOn: edition.checkedOn,
    scope: exam.locator.section + 'のIPA作問部分、組版と公式正答。',
    attributionText: `出典：${exam.locator.section}。©${exam.locator.year} 独立行政法人情報処理推進機構（IPA）。`,
    thirdParty: {
      status: 'present_cleared', notes: '各肢と対応する経済産業省資料は平成16年10月8日策定版を特定し、当該問に限って別の条件と出典を併記する。',
      rightsRefs: [metiRight.id],
    },
  };
  const sources = createMetiSources(review).filter(record => {
    const existing = bundle.sources.find(source => source.id === record.id);
    if (existing) assert.deepEqual(existing, record, 'existing METI source must match the confirmed edition and terms');
    return !existing;
  });
  const selected = await makeStage3MorningRecords({
    collectionId, checkedOn: edition.checkedOn, definitions, commonAssets, reviewedCommonPages: booklet.review.commonPages,
    sources, rights: [ipaRight, metiRight],
    facts: [{ source, number: question.number, page: question.page, officialKey: question.officialKey, alt, crop,
      area: 'strategy', choiceShuffleAllowed: false }],
  });
  const [original, base] = selected.questions;
  const [template] = selected.templates;
  const image = selected.assets.find(asset => asset.id === 'asset-ipa-' + source);
  assert(image);
  const officialAttr: Attribution = {
    origin: 'official', sourceRefs: [exam, ...standardRefs], rightsRefs: [ipaRight.id, metiRight.id], creatorIds: ['ipa'],
  };
  const adaptedAttr: Attribution = { ...officialAttr, origin: 'adapted', creatorIds: ['codex'] };
  for (const [record, attribution] of [[original, officialAttr], [base, adaptedAttr]] as const) {
    record.prompt.attribution = attribution;
    record.choices.forEach(choice => { choice.content.attribution = structuredClone(attribution); });
    record.origin.sourceRefs.push(...standardRefs);
    record.distribution = 'included';
    record.review.notes = `原冊子p.${question.page}と公式解答p.1、各肢の平成16年10月8日策定版の該当節を照合。`
      + '原問と基準問題の対応、生成4条件と正答・全肢は独立内容テストで確認。IPAと経済産業省の権利表示を問の出典に併記し、共通表記は冊子既存の条件を使う。';
  }
  original.correctAnswer.attribution.rightsRefs = [ipaRight.id];
  image.attribution = officialAttr;
  assert.equal(base.contexts.length, commonAssets.length);
  base.contexts.forEach((context, index) => {
    const common = commonAssets[index];
    const attribution: Attribution = { ...structuredClone(common.attribution), origin: 'adapted', creatorIds: ['codex'] };
    context.content.attribution = attribution;
    const [diagram] = context.content.blocks;
    assert(context.content.blocks.length === 1 && diagram.type === 'diagram');
    diagram.attribution = structuredClone(attribution);
  });
  template.attribution = adaptedAttr;
  template.distribution = 'included';
  template.originalContentSha256 = await contentHash(base);

  const additions = { questions: [original, base], templates: [template], assets: [image], rights: selected.rights, sources, exams: [], sets: [] };
  for (const kind of catalogKinds) {
    const existing = new Set(bundle[kind].map(record => record.id));
    assert(additions[kind].every(record => !existing.has(record.id)), `published ${kind} record already exists`);
  }
  assert(!bundle.assets.some(asset => asset.path.toLowerCase() === image.path.toLowerCase()));
  return { additions, assetFiles: new Map([[image.path, crop.path]]) };
}
