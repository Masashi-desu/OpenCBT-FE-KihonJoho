import assert from 'node:assert/strict';
import type { Asset, Exam, Rights, SetRecord, Source, SourceRef } from '../src/core/types';
import { autumn2008PmPageAssetId } from '../src/core/generators/legacy-2008-autumn-pm-materials';
import type { AfternoonBookletRecordSource, Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import evidence from './source-evidence/legacy-2008-autumn-pm-source-review.json';

const book = evidence.collectionId;
const scope = '2008-autumn-pm';
const title = '平成20年度 秋期 基本情報技術者試験 午後';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const commonId = `source-ipa-${book}-common-qs`;
const commonRightsId = `rights-ipa-${book}-common`;
const commentaryId = `source-ipa-${book}-commentary`;
const policyId = `source-ipa-${book}-usage`;
const siteId = `source-ipa-${book}-siteinfo`;
const archiveTermsId = `source-ipa-${book}-warp-help`;

export const autumn2008PmBooklet: AfternoonBookletRecordSource = {
  collectionId: book,
  year: 2008,
  period: '秋期',
  officialTitle: title,
  questionPages: [4, 59],
  printedPageNumber: page => page,
  pageAssetId: autumn2008PmPageAssetId,
  area: number => number === 1 || number === 3 || number === 5 ? 'technology' : 'algorithm',
  learningTag: 'legacy-2008-autumn',
};

export function autumn2008PmAssetPath(page: number) {
  const suffix = page === evidence.caslExcerpt.page ? '-casl-excerpt' : '';
  return `assets/${book}-page-${String(page).padStart(3, '0')}${suffix}.webp`;
}

function commonRef(page: number, section: string): SourceRef {
  return {
    sourceId: commonId,
    locator: { year: 2008, period: '秋期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', page, section },
  };
}

function paperSource(id: string, label: string, pages: readonly number[], input: 'questions.pdf' | 'answers.pdf'): Source {
  return {
    schemaVersion: '3.0.0', id, title: `${title} ${label}（国立国会図書館WARP保存版）`, publisher,
    url: evidence.sourceInputs[input].url, sha256: evidence.sourceInputs[input].sha256,
    type: input === 'questions.pdf' ? 'official_problem' : 'official_answer', scope: label,
    sections: pages.map(page => `PDF p.${page} ${label}`),
    facts: ['IPAの公式公表資料をWARP保存版で確認した。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published',
    supports: input === 'questions.pdf' ? ['annual-sets', 'random-mix', 'attribution'] : ['answer-validation', 'attribution'],
    dateNote: '試験の年度・期と、WARPの保存日・資料確認日を区別する。',
    limits: '原冊子の指定箇所の出典。CASL IIの文字の符号表と対応する規格説明は配布範囲外。',
  };
}

function policySource(
  id: string,
  label: string,
  author: string,
  input: 'faq.html' | 'siteinfo.html' | 'warp-help.html',
  section: string,
  description: string,
): Source {
  return {
    schemaVersion: '3.0.0', id, title: label, publisher: author,
    url: evidence.sourceInputs[input].url, sha256: evidence.sourceInputs[input].sha256,
    type: 'policy', scope: description, sections: [section], facts: [description],
    checkedOn: evidence.checkedOn, availability: 'officially_published',
    supports: ['ingestion', 'attribution'], dateNote: '現行の利用条件を確認した日を記録する。',
    limits: '第三者の素材を利用する権利は個別に確認する。',
  };
}

function paperRights(id: string, label: string, sourceRefs: SourceRef[], materialNote: string): Rights {
  return {
    schemaVersion: '3.0.0', id, holders: [publisher], basis: 'official_policy', checkedOn: evidence.checkedOn,
    evidence: [
      { sourceId: policyId, locator: { section: evidence.rightsTerms } },
      { sourceId: siteId, locator: { section: '著作権について・商標について' } },
      { sourceId: archiveTermsId, locator: { section: '5-4. 著作権について' } },
      ...sourceRefs,
    ],
    scope: `${title} ${label}の個別査読済みIPA部分`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Public-Questions', modificationNoticeRequired: true,
    attributionText: `出典：${title} ${label}。©2008 ${publisher}。国立国会図書館WARP保存版。`,
    thirdParty: { status: 'none_identified', rightsRefs: [], notes: materialNote },
    assessmentNotes: evidence.rightsScope,
  };
}

export function autumn2008PmCommentaryRef(number: number): SourceRef {
  const question = evidence.questions.find(row => row.number === number);
  assert(question);
  return {
    sourceId: commentaryId,
    locator: { ...commonRef(question.commentaryPage, `出題趣旨 問${number}`).locator, questionNumber: String(number) },
  };
}

export function autumn2008PmMetadata(input: {
  specs: readonly Stage3AfternoonQuestionSpec[];
  commonAlt: Readonly<Record<number, string>>;
  images: Readonly<Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>>>;
}) {
  const { specs, commonAlt, images } = input;
  const sources = [
    policySource(policyId, 'IPA 試験の過去問題の使用方法・留意点', publisher, 'faq.html',
      evidence.rightsTerms, '教育目的での利用、出典の表示及び改変時の表示。'),
    policySource(siteId, 'IPA ウェブサイトのご利用について', publisher, 'siteinfo.html',
      '著作権について・商標について', '特別な利用条件と第三者の素材・商標を区別する。'),
    policySource(archiveTermsId, '国立国会図書館WARP 保存資料の著作権について', '国立国会図書館', 'warp-help.html',
      '5-4. 著作権について', '保存資料の二次利用では原権利者の利用条件に従う。'),
    paperSource(commonId, '表紙の問題選択方法と付属資料', [1, ...evidence.commonPages, 72], 'questions.pdf'),
    paperSource(commentaryId, '解答例の出題趣旨', [2, 3, 4], 'answers.pdf'),
  ];
  const rights = [
    paperRights(commonRightsId, '共通擬似言語・Java APIの試験用説明・CASL IIの必要資料',
      evidence.commonPages.map(page => commonRef(page, page === evidence.caslExcerpt.page
        ? '命令・FR注記の上部抜粋' : `原資料 PDF p.${page}`)), evidence.appendixRightsNotes),
  ];
  for (const spec of specs) {
    const row = evidence.questions.find(question => question.number === spec.number);
    assert(row && row.materialDecision.status === 'allowed');
    assert.deepEqual(spec.pages, row.pages);
    const questionId = `source-ipa-${book}-${spec.number}-qs`;
    const answerId = `source-ipa-${book}-${spec.number}-ans`;
    const label = `問${spec.number}`;
    sources.push(paperSource(questionId, label, spec.pages, 'questions.pdf'),
      paperSource(answerId, `${label} 解答例`, [1], 'answers.pdf'));
    const loc = (sourceId: string, page: number, section: string): SourceRef => ({
      sourceId, locator: { ...commonRef(page, section).locator, questionNumber: String(spec.number) },
    });
    rights.push(paperRights(`rights-ipa-${book}-${spec.number}`, label,
      [...spec.pages.map(page => loc(questionId, page, label)), loc(answerId, 1, `${label} 解答例`)],
      row.materialDecision.notes));
  }

  const approvedHashes: Record<string, string> = evidence.assetSHA256ByPage;
  const assets: Asset[] = [...evidence.commonPages, ...specs.flatMap(spec => spec.pages)].sort((a, b) => a - b).map(page => {
    const owner = specs.find(spec => spec.pages.includes(page));
    const crop = page === evidence.caslExcerpt.page;
    const image = images[page];
    assert(image && image.width > 0 && image.height > 0, `原資料 p.${page}`);
    if (crop) assert.deepEqual([image.width, image.height], evidence.caslExcerpt.box.slice(2));
    assert.equal(image.sha256, approvedHashes[String(page)]);
    const alt = (owner?.originalPageAlt ?? commonAlt)[page];
    assert(alt && alt.trim().length > 100 && alt.length <= 2000, `原資料 p.${page} の代替テキスト`);
    const ref = commonRef(page, crop ? 'CASL IIの命令・FR注記の上部抜粋' : `原資料 PDF p.${page}`);
    if (owner) {
      ref.sourceId = `source-ipa-${book}-${owner.number}-qs`;
      ref.locator.questionNumber = String(owner.number);
    }
    return {
      schemaVersion: '3.0.0', id: autumn2008PmPageAssetId(page), path: autumn2008PmAssetPath(page),
      mediaType: 'image/webp', ...image, alt,
      attribution: {
        origin: crop ? 'adapted' : 'official', sourceRefs: [ref],
        rightsRefs: [owner ? `rights-ipa-${book}-${owner.number}` : commonRightsId],
        creatorIds: crop ? ['ipa', 'codex'] : ['ipa'],
      },
    };
  });
  return { assets, sources, rights };
}

export function autumn2008PmSets(numbers: readonly number[]): { sets: SetRecord[]; exams: Exam[] } {
  const ref = (n: number, base = false) => ({
    questionId: `${base ? 'question-template-source-' : 'question-ipa-'}${book}-${n}`, revision: 1,
  });
  const { required, groups, coverPage, durationSeconds } = evidence.selection;
  const optionalGroups = groups.map(({ first, last, choose }) => ({
    id: `group-${first}-${last}`, label: `問${first}〜${last}から${choose}問`,
    questionRefs: numbers.filter(number => number >= first && number <= last).map(number => ref(number)), choose,
  }));
  const followsPaper = required.every(number => numbers.includes(number))
    && optionalGroups.every(group => group.questionRefs.length >= group.choose);
  const practiceCount = followsPaper ? required.length + groups.reduce((count, group) => count + group.choose, 0) : numbers.length;
  const sets: SetRecord[] = [];
  const exams: Exam[] = [];
  const modes = ['study', 'practice'] as const;
  for (const kind of ['annual', 'mix'] as const) {
    const name = `2008年度 秋期・旧午後${kind === 'mix' ? ' ランダムミックス' : ''}`;
    const examConfigRefs = modes.map(mode => ({ id: `exam-${kind}-${scope}-${mode}`, revision: 1 }));
    const set: SetRecord = {
      schemaVersion: '3.0.0', id: `set-${kind}-${scope}`, revision: 1, title: name, subject: 'B',
      questionRefs: numbers.map(number => ref(number, kind === 'mix')), examConfigRefs, distribution: 'excluded',
      generationBindings: kind === 'annual' ? [] : numbers.map(number => ({
        questionRef: ref(number, true), templateRef: { id: `template-source-${book}-${number}`, revision: 1 },
      })),
    };
    if (kind === 'annual' && followsPaper) set.questionSelection = {
      requiredQuestionRefs: required.map(number => ref(number)), optionalGroups,
      sourceRefs: [commonRef(coverPage, '表紙の試験時間と問題選択方法')], excessPolicy: 'paper_order',
    };
    sets.push(set);
    for (const [index, mode] of modes.entries()) exams.push({
      schemaVersion: '3.0.0', ...examConfigRefs[index], title: `${name} ${mode === 'study' ? '学習' : '時間付き練習'}`,
      subject: 'B', mode, questionCount: mode === 'study' ? numbers.length : practiceCount,
      ...(mode === 'practice' ? { timeLimitSeconds: durationSeconds, practiceScope: 'learning_set' as const } : {}),
      questionOrder: 'set', choiceOrder: 'fixed', duplicatePolicy: 'lineage_unique', shortagePolicy: 'block',
    });
  }
  return { sets, exams };
}
