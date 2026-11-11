import assert from 'node:assert/strict';
import type { Asset, Exam, Rights, SetRecord, Source, SourceRef } from '../src/core/types';
import { autumn2009PmPageAssetId } from '../src/core/generators/legacy-2009-autumn-pm-materials';
import type { AfternoonBookletRecordSource, Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import evidence from './source-evidence/legacy-2009-autumn-pm-source-review.json';

const book = evidence.collectionId;
const scope = '2009-autumn-pm';
const title = '平成21年度 秋期 基本情報技術者試験 午後';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const policyId = `source-ipa-${book}-usage`;
const commonId = `source-ipa-${book}-common-qs`;
const commonRightsId = `rights-ipa-${book}-common`;
const commonPages = evidence.commonPages;
const commentaryId = `source-ipa-${book}-commentary`;
const officialWeightsId = `source-ipa-${book}-official-weights`;
export const autumn2009PmErratumSourceId = `source-ipa-${book}-erratum`;
export const autumn2009PmErratumLocator = {
  year: 2009, period: '秋期', timeSlot: '午後', exam: '基本情報技術者試験', subject: '旧制度・午後',
  page: 1, questionNumber: '8', section: '項目（2） 問8の表記訂正とc・dの採点',
} as const;
const supports = ['annual-sets', 'random-mix', 'answer-validation'];
export const autumn2009PmBooklet: AfternoonBookletRecordSource = {
  collectionId: book,
  year: 2009,
  period: '秋期',
  officialTitle: title,
  questionPages: [6, 65],
  printedPageNumber: page => page,
  pageAssetId: autumn2009PmPageAssetId,
  area: number => number === 6 ? 'management'
    : number === 7 ? 'strategy' : number >= 8 ? 'algorithm' : 'technology',
  learningTag: 'legacy-2009-autumn',
};

export const autumn2009PmAssetPath = (page: number) =>
  `assets/${book}-page-${String(page).padStart(3, '0')}${page === evidence.caslExcerpt.page ? '-casl-excerpt' : ''}.webp`;

function commonRef(page: number, section: string): SourceRef {
  return {
    sourceId: commonId,
    locator: { year: 2009, period: '秋期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', page, section },
  };
}

function paperSource(id: string, label: string, pages: readonly number[], answer = false): Source {
  const { url, sha256 } = evidence.sourceInputs[answer ? 'answer.pdf' : 'question.pdf'];
  return {
    schemaVersion: '3.0.0', id, title: `${title} ${label}`, publisher, url, sha256,
    type: answer ? 'official_answer' : 'official_problem', scope: label,
    sections: pages.map(page => `PDF p.${page} ${label}`),
    facts: [answer ? '公式解答例の対応する解答欄と正答。' : '問題本文、図表、注意書き、選択肢と指定の付属資料。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports,
    dateNote: '試験日・取得日と資料固有の公開日を区別する。',
    limits: '当該冊子の指定箇所の出典。CASL IIの文字の符号表は配布範囲外。',
  };
}

function paperRights(id: string, label: string, refs: SourceRef[]): Rights {
  return {
    schemaVersion: '3.0.0', id, holders: [publisher], basis: 'official_policy', checkedOn: evidence.checkedOn,
    evidence: [{ sourceId: policyId, locator: { section: evidence.rightsTerms } }, ...refs],
    scope: `${title} ${label}の確認済みIPA部分`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Public-Questions', modificationNoticeRequired: true,
    attributionText: `出典：${title} ${label}／©2009 ${publisher}`,
    thirdParty: { status: 'none_identified', rightsRefs: [], notes: '対象頁・図表の用途別確認。CASL IIの文字の符号表とその規格文言は配布範囲外。' },
    assessmentNotes: evidence.rightsScope,
  };
}

export function autumn2009PmMetadata(input: {
  specs: readonly Stage3AfternoonQuestionSpec[];
  commonAlt: Readonly<Record<number, string>>;
  images: Readonly<Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>>>;
}) {
  const { specs, commonAlt, images } = input;
  const sources: Source[] = [{
    schemaVersion: '3.0.0', id: policyId, title: 'IPA 試験の過去問題の使用方法・留意点', publisher,
    url: evidence.sourceInputs['faq.html'].url, sha256: evidence.sourceInputs['faq.html'].sha256, type: 'policy', scope: evidence.rightsScope,
    sections: [evidence.rightsTerms], facts: ['教育目的の利用に関する出典・改変表示の条件。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports,
    dateNote: '確認日と公開日を区別する。', limits: '第三者の著作物・規格文言は個別に扱う。',
  }, paperSource(commonId, '表紙の試験時間・問題選択方法、問題一覧と付属資料', [1, 2, ...commonPages]), {
    schemaVersion: '3.0.0', id: autumn2009PmErratumSourceId, title: 'IPA 2009年10月22日掲載の訂正通知',
    publisher, url: evidence.sourceInputs['errata.pdf'].url, sha256: evidence.sourceInputs['errata.pdf'].sha256,
    type: 'official_answer', scope: '問8の紙面上の訂正と当日の採点。',
    sections: [autumn2009PmErratumLocator.section],
    facts: ['p.36のプログラム注釈を訂正した。設問c・dは受験者全員を正解とする。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports: ['answer-validation'],
    dateNote: '2009年10月22日掲載。', limits: '問8の2欄だけを対象とする。',
  }, {
    schemaVersion: '3.0.0', id: commentaryId, title: `${title} 採点講評`,
    publisher, url: evidence.sourceInputs['commentary.pdf'].url, sha256: evidence.sourceInputs['commentary.pdf'].sha256,
    type: 'policy', scope: '各大問の出題意図と典型的な誤り。', sections: ['p.1〜3 問1〜13'],
    facts: ['全13大問の設問別の意味と条件を照合するための資料。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports: ['answer-validation'],
    dateNote: '試験日と資料確認日を区別する。', limits: '講評の本文は同梱しない。',
  }, {
    schemaVersion: '3.0.0', id: officialWeightsId, title: 'IPA 試験区分ごとの問題別配点割合',
    publisher, url: evidence.sourceInputs['scoring.pdf'].url, sha256: evidence.sourceInputs['scoring.pdf'].sha256,
    type: 'policy', scope: '基本情報技術者試験の当時の問題選択と公式の大問別配点。',
    sections: ['p.1 基本情報技術者試験・午後'],
    facts: ['問1〜7の選択5問は各12点、問8と問9〜13の選択1問は各20点。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports: ['annual-sets'],
    dateNote: '2008年12月16日資料。', limits: 'アプリの集計は解答欄の学習正答率。',
  }];
  const rights = [paperRights(commonRightsId, '共通擬似言語・E-R表記・CASL IIの必要箇所・表計算の付属資料',
    commonPages.map(page => commonRef(page, page === evidence.caslExcerpt.page ? 'CASL II命令・注記の上部抜粋' : `原資料 PDF p.${page}`)))];
  for (const spec of specs) {
    const row = evidence.questions.find(q => q.number === spec.number);
    assert(row);
    assert.deepEqual(spec.pages, row.pages);
    const questionId = `source-ipa-${book}-${spec.number}-qs`;
    const answerId = `source-ipa-${book}-${spec.number}-ans`;
    const label = `問${spec.number}`;
    sources.push(paperSource(questionId, label, spec.pages), paperSource(answerId, `${label} 解答例`, [1], true));
    const ref = (sourceId: string, page: number, section: string): SourceRef => ({
      sourceId, locator: { ...commonRef(page, section).locator, questionNumber: String(spec.number) },
    });
    rights.push(paperRights(`rights-ipa-${book}-${spec.number}`, label, [
      ...spec.pages.map(page => ref(questionId, page, label)), ref(answerId, 1, `${label} 解答例`),
    ]));
  }
  const assets: Asset[] = [...commonPages, ...specs.flatMap(spec => spec.pages)].sort((a, b) => a - b).map(page => {
    const owner = specs.find(spec => spec.pages.includes(page));
    const crop = page === evidence.caslExcerpt.page;
    const image = images[page];
    assert(image && image.width > 0 && image.height > 0, `source p.${page}`);
    if (crop) assert.deepEqual([image.width, image.height], evidence.caslExcerpt.box.slice(2));
    assert.equal(image.sha256, (evidence.assetSHA256ByPage as Record<number, string>)[page]);
    const alt = (owner?.originalPageAlt ?? commonAlt)[page];
    assert(alt && alt.trim().length > 100 && alt.length <= 2000, `source transcription p.${page}`);
    const ref = commonRef(page, crop ? 'CASL II命令・注記の上部抜粋' : `原資料 PDF p.${page}`);
    if (owner) {
      ref.sourceId = `source-ipa-${book}-${owner.number}-qs`;
      ref.locator.questionNumber = String(owner.number);
    }
    return {
      schemaVersion: '3.0.0', id: autumn2009PmPageAssetId(page), path: autumn2009PmAssetPath(page),
      mediaType: 'image/webp', ...image, alt,
      attribution: { origin: crop ? 'adapted' : 'official', sourceRefs: [ref],
        rightsRefs: [owner ? `rights-ipa-${book}-${owner.number}` : commonRightsId], creatorIds: crop ? ['ipa', 'codex'] : ['ipa'] },
    };
  });
  return { assets, sources, rights };
}

export function autumn2009PmCommentaryRef(number: number): SourceRef {
  assert(Number.isInteger(number) && number >= 1 && number <= 13);
  return {
    sourceId: commentaryId,
    locator: { ...commonRef(number <= 4 ? 1 : number <= 9 ? 2 : 3, `採点講評 問${number}`).locator, questionNumber: String(number) },
  };
}

export function autumn2009PmSets(numbers: readonly number[]): { sets: SetRecord[]; exams: Exam[] } {
  const ref = (n: number, base = false) => ({ questionId: `${base ? 'question-template-source-' : 'question-ipa-'}${book}-${n}`, revision: 1 });
  const { required, groups, coverPage, durationSeconds } = evidence.selection;
  const optionalGroups = groups.map(({ first, last, choose }) => ({
    id: `group-${first}-${last}`, label: `問${first}〜${last}から${choose}問`,
    questionRefs: numbers.filter(n => n >= first && n <= last).map(n => ref(n)), choose,
  }));
  const followsPaper = required.every(n => numbers.includes(n)) && optionalGroups.every(group => group.questionRefs.length >= group.choose);
  const practiceCount = followsPaper ? required.length + groups.reduce((n, group) => n + group.choose, 0) : numbers.length;
  const sets: SetRecord[] = [];
  const exams: Exam[] = [];
  for (const kind of ['annual', 'mix'] as const) {
    const title = `2009年度 秋期・旧午後${kind === 'mix' ? ' ランダムミックス' : ''}`;
    const modes = ['study', 'practice'] as const;
    const examConfigRefs = modes.map(mode => ({ id: `exam-${kind}-${scope}-${mode}`, revision: 1 }));
    const set: SetRecord = {
      schemaVersion: '3.0.0', id: `set-${kind}-${scope}`, revision: 1, title, subject: 'B',
      questionRefs: numbers.map(n => ref(n, kind === 'mix')), examConfigRefs, distribution: 'excluded',
      generationBindings: kind === 'annual' ? [] : numbers.map(n => ({
        questionRef: ref(n, true), templateRef: { id: `template-source-${book}-${n}`, revision: 1 },
      })),
    };
    if (kind === 'annual' && followsPaper) set.questionSelection = {
      requiredQuestionRefs: required.map(n => ref(n)), optionalGroups,
      sourceRefs: [commonRef(coverPage, '表紙の試験時間と問題選択方法'), {
        sourceId: officialWeightsId,
        locator: commonRef(1, '基本情報技術者試験・午後の配点割合').locator,
      }], excessPolicy: 'paper_order',
    };
    sets.push(set);
    for (const [index, mode] of modes.entries()) exams.push({
      schemaVersion: '3.0.0', ...examConfigRefs[index], title: `${title} ${mode === 'study' ? '学習' : '時間付き練習'}`,
      subject: 'B', mode, questionCount: mode === 'study' ? numbers.length : practiceCount,
      ...(mode === 'practice' ? { timeLimitSeconds: durationSeconds, practiceScope: 'learning_set' as const } : {}),
      questionOrder: 'set', choiceOrder: 'fixed', duplicatePolicy: 'lineage_unique', shortagePolicy: 'block',
    });
  }
  return { sets, exams };
}
