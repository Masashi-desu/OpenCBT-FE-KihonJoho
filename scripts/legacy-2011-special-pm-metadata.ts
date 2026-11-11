import assert from 'node:assert/strict';
import type { Asset, Exam, Rights, SetRecord, Source, SourceRef } from '../src/core/types';
import { special2011PmPageAssetId } from '../src/core/generators/legacy-2011-special-pm-materials';
import type { AfternoonBookletRecordSource, Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import evidence from './source-evidence/legacy-2011-special-pm-source-review.json';

const book = evidence.collectionId;
const scope = '2011-special-pm';
const title = '平成23年度 特別 基本情報技術者試験 午後';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const policyId = `source-ipa-${book}-usage`;
const commonId = `source-ipa-${book}-common-qs`;
const commonRightsId = `rights-ipa-${book}-common`;
const commonPages = evidence.commonPages;
const supports = ['annual-sets', 'random-mix', 'answer-validation'];
const javaReferences = [
  { api: 'CharSequence', sections: ['charAt(int)', 'length()', 'toString()'],
    fact: '指定位置のcharを0始まりで読む。長さはcharの個数で、toStringは同じ順序の文字列を返す。' },
  { api: 'Appendable', sections: ['append(char)'], fact: '指定のcharを追加し、追加先を返す。' },
] as const;
const javaSourceId = (api: string) => `source-java-se6-${book}-${api.toLowerCase()}`;
export const special2011PmJavaRefs: SourceRef[] = javaReferences.map(({ api, sections }) => ({
  sourceId: javaSourceId(api), locator: { section: sections.join('、') },
}));

export const special2011PmBooklet: AfternoonBookletRecordSource = {
  collectionId: book,
  year: 2011,
  period: '特別',
  officialTitle: title,
  questionPages: [5, 69],
  printedPageNumber: page => page,
  pageAssetId: special2011PmPageAssetId,
  area: number => number === 6 ? 'management'
    : number === 7 ? 'strategy' : number >= 8 ? 'algorithm' : 'technology',
  learningTag: 'legacy-2011-special',
};

export const special2011PmAssetPath = (page: number) =>
  `assets/${book}-page-${String(page).padStart(3, '0')}${page === evidence.caslExcerpt.page ? '-casl-excerpt' : ''}.webp`;

function commonRef(page: number, section: string): SourceRef {
  return {
    sourceId: commonId,
    locator: { year: 2011, period: '特別', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', page, section },
  };
}

function paperSource(id: string, label: string, pages: readonly number[], answer = false): Source {
  const { url, sha256 } = evidence.sourceInputs[answer ? 'answer.pdf' : 'question.pdf'];
  return {
    schemaVersion: '3.0.0', id, title: `${title} ${label}`, publisher, url, sha256,
    type: answer ? 'official_answer' : 'official_problem', scope: label,
    sections: pages.map(page => `PDF p.${page} ${label}`),
    facts: [answer ? '公式解答例の対応する解答欄と順不同の正答。' : '問題本文、図表、注意書き、選択肢と指定の付属資料。'],
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
    attributionText: `出典：${title} ${label}／©2011 ${publisher}`,
    thirdParty: { status: 'none_identified', rightsRefs: [], notes: '対象頁・図表の用途別確認。CASL IIの文字の符号表とその規格文言は配布範囲外。' },
    assessmentNotes: evidence.rightsScope,
  };
}

export function special2011PmMetadata(input: {
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
  }, paperSource(commonId, '表紙の試験時間・問題選択方法、問題一覧と付属資料', [1, 2, ...commonPages])];
  if (specs.some(spec => spec.number === 11)) {
    for (const { api, sections, fact } of javaReferences) {
      const ref = evidence.sourceInputs[`reference/java6-${api}.html` as const];
      sources.push({
        schemaVersion: '3.0.0', id: javaSourceId(api), title: `Java SE 6 API — ${api}`, publisher: 'Oracle',
        url: ref.url, sha256: ref.sha256, checkedOn: evidence.checkedOn, availability: 'officially_published',
        type: 'independent_note', scope: '問11のメソッドの動作を照合する参照。', sections: [...sections], facts: [fact],
        supports: ['answer-validation'], dateNote: '出題当時のJava SE 6 API仕様。', limits: '動作の事実を参照する。原文・用例・画像は配布対象外。',
      });
    }
  }
  const rights = [paperRights(commonRightsId, '共通擬似言語・CASL IIの必要箇所・表計算の付属資料',
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
      schemaVersion: '3.0.0', id: special2011PmPageAssetId(page), path: special2011PmAssetPath(page),
      mediaType: 'image/webp', ...image, alt,
      attribution: { origin: crop ? 'adapted' : 'official', sourceRefs: [ref],
        rightsRefs: [owner ? `rights-ipa-${book}-${owner.number}` : commonRightsId], creatorIds: crop ? ['ipa', 'codex'] : ['ipa'] },
    };
  });
  return { assets, sources, rights };
}

export function special2011PmSets(numbers: readonly number[]): { sets: SetRecord[]; exams: Exam[] } {
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
    const title = `2011年度 特別・旧午後${kind === 'mix' ? ' ランダムミックス' : ''}`;
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
      sourceRefs: [commonRef(coverPage, '表紙の試験時間と問題選択方法')], excessPolicy: 'paper_order',
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
