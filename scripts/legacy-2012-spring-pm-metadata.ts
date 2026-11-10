import assert from 'node:assert/strict';
import type { Asset, Exam, Rights, SetRecord, Source, SourceRef } from '../src/core/types';
import { spring2012PmPageAssetId } from '../src/core/generators/legacy-2012-spring-pm-materials';
import type { AfternoonBookletRecordSource, Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import evidence from './source-evidence/legacy-2012-spring-pm-source-review.json';

const book = evidence.collectionId;
const scope = '2012-spring-pm';
const title = '平成24年度 春期 基本情報技術者試験 午後';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const policyId = `source-ipa-${book}-usage`;
const commonId = `source-ipa-${book}-common-qs`;
const commonRightsId = `rights-ipa-${book}-common`;
const commonPages = evidence.commonPages;
const supports = ['annual-sets', 'random-mix', 'answer-validation'];

export const spring2012PmBooklet: AfternoonBookletRecordSource = {
  collectionId: book,
  year: 2012,
  period: '春期',
  officialTitle: title,
  questionPages: [5, 70],
  printedPageNumber: page => page,
  pageAssetId: spring2012PmPageAssetId,
  area: number => number === 6 ? 'management'
    : number === 7 ? 'strategy' : number >= 8 ? 'algorithm' : 'technology',
  learningTag: 'legacy-2012-spring',
};

export const spring2012PmAssetPath = (page: number) =>
  `assets/${book}-page-${String(page).padStart(3, '0')}${page === evidence.caslExcerpt.page ? '-casl-excerpt' : ''}.webp`;

function commonRef(page: number, section: string): SourceRef {
  return {
    sourceId: commonId,
    locator: { year: 2012, period: '春期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', page, section },
  };
}

const javaReferences = [
  { api: 'Map', methods: ['get', 'keySet', 'put', 'remove', 'size'],
    facts: '一つのキーに一つの値を結び付ける。putで値を登録または更新し、getで値を調べる。keySetでキー集合を得る。' },
  { api: 'HashMap', methods: ['HashMap()', 'get', 'put', 'remove', 'size'],
    facts: 'ハッシュを用いるMap。キーの反復順は保証されない。' },
  { api: 'TreeMap', methods: ['TreeMap()', 'TreeMap(Comparator)', 'get', 'keySet', 'put', 'remove'],
    facts: 'キーを自然順序またはComparatorの順序で管理する。比較結果が0のキーは同一の位置に対応する。' },
  { api: 'List', methods: ['add', 'remove(Object)', 'isEmpty', 'iterator'],
    facts: '要素の順序を持ち、addで末尾へ追加する。remove(Object)で最初に一致した要素を除く。' },
  { api: 'ArrayList', methods: ['ArrayList()', 'add', 'remove(Object)', 'isEmpty', 'iterator'],
    facts: '配列を用いるListの実装。並びは追加した順序を保つ。' },
  { api: 'Set', methods: ['add', 'remove', 'isEmpty', 'iterator'],
    facts: '同じ要素の重複を許さない集合。追加や削除が行われたかは戻り値で分かる。' },
  { api: 'TreeSet', methods: ['TreeSet()', 'add', 'remove', 'isEmpty', 'iterator'],
    facts: '自然順序または指定された比較順で要素を管理し、その順序で反復できる集合。' },
  { api: 'Comparator', methods: ['compare'],
    facts: 'compareの戻り値の符号で、第1引数が第2引数より前・同じ位置・後のいずれかを表す。' },
  { api: 'Iterator', methods: ['hasNext', 'next', 'remove'],
    facts: 'hasNextで次の要素があるかを調べ、nextで取り出す。実装が対応している場合、removeで直前に取り出した要素を削除できる。' },
] as const;
const javaSourceId = (api: string) => `source-java-se7-${book}-${api.toLowerCase()}`;
const javaOriginalPages = [71, 72, 73, 74, 75];
const digitSourceId = `source-fact-${book}-digit-encoding`;
export const spring2012PmJavaRefs: SourceRef[] = [
  ...javaOriginalPages.map(page => commonRef(page, '原冊子のJava API説明への参照')),
  ...javaReferences.map(({ api, methods }) => ({ sourceId: javaSourceId(api), locator: { section: methods.join('、') } })),
];
export const spring2012PmDigitRefs: SourceRef[] = [
  commonRef(78, '原冊子の文字の符号表への参照'),
  { sourceId: digitSourceId, locator: { section: '0x30〜0x39とU+0030〜U+0039の対応' } },
];

function paperSource(id: string, label: string, pages: readonly number[], answer = false): Source {
  const { url, sha256 } = evidence.sourceInputs[answer ? 'answer.pdf' : 'question.pdf'];
  return {
    schemaVersion: '3.0.0', id, title: `${title} ${label}`, publisher, url, sha256,
    type: answer ? 'official_answer' : 'official_problem', scope: label,
    sections: pages.map(page => `PDF p.${page} ${label}`),
    facts: [answer ? '公式解答例の対応する解答欄と順不同の指定。' : '問題本文、図表、注意書き、選択肢と指定の付属資料。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports,
    dateNote: '試験日・取得日と資料固有の公開日を区別する。',
    limits: '当該冊子の指定箇所の出典。Java API付属資料の原画像とJIS文字の符号表は配布範囲外。',
  };
}

function paperRights(id: string, label: string, refs: SourceRef[]): Rights {
  return {
    schemaVersion: '3.0.0', id, holders: [publisher], basis: 'official_policy', checkedOn: evidence.checkedOn,
    evidence: [{ sourceId: policyId, locator: { section: evidence.rightsTerms } }, ...refs],
    scope: `${title} ${label}の確認済みIPA部分`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Public-Questions', modificationNoticeRequired: true,
    attributionText: `出典：${title} ${label}／©2012 ${publisher}`,
    thirdParty: { status: 'none_identified', rightsRefs: [], notes: '対象頁・図表の用途別確認。Java API付属資料の原画像とJIS文字の符号表・規格文言は配布範囲外。' },
    assessmentNotes: evidence.rightsScope,
  };
}

export function spring2012PmMetadata(input: {
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
  }, paperSource(commonId, '表紙の試験時間・問題選択方法、問題一覧と付属資料', [1, 2, ...javaOriginalPages, ...commonPages].sort((a,b) => a-b)),
  ...javaReferences.filter(() => specs.some(spec => spec.number === 11)).map(({api, methods, facts}): Source => {
    const ref = evidence.sourceInputs[`reference/java-${api}.html` as const];
    return {
      schemaVersion: '3.0.0', id: javaSourceId(api), title: `Java SE 7 API — ${api}`, publisher: 'Oracle',
      url: ref.url, sha256: ref.sha256, checkedOn: evidence.checkedOn, availability: 'officially_published', type: 'independent_note',
      scope: '問11の解答に必要なAPIの動作。', sections: [...methods], facts: [facts],
      supports: ['answer-validation'], dateNote: 'Java SE 7のAPI仕様。',
      limits: '仕様の事実を参照し、原文・用例・ページ画像を配布しない。',
    };
  })];
  if (specs.some(spec => spec.number === 12)) {
    const ref = evidence.sourceInputs['reference/jis0201-mapping.txt'];
    sources.push({
      schemaVersion: '3.0.0', id: digitSourceId, title: 'Unicode公開アーカイブの数字文字対応', publisher: 'Unicode, Inc.',
      url: ref.url, sha256: ref.sha256, checkedOn: evidence.checkedOn, availability: 'officially_published', type: 'independent_note',
      scope: '問12の加算に使う10個の数字文字の符号値。', sections: ['0x30〜0x39とU+0030〜U+0039の対応'],
      facts: ['0の符号値は16進30で、数字の順に1ずつ増え、9は16進39になる。'],
      supports: ['answer-validation'], dateNote: '歴史的な文字対応を確認するためのアーカイブ。',
      limits: '出題に必要な数値関係のみを独自記述。規格の本文・配列・画像を配布しない。',
    });
  }
  const rights = [paperRights(commonRightsId, '共通擬似言語・CASL IIの必要箇所・表計算の付属資料',
    commonPages.map(page => commonRef(page, page === 78 ? 'CASL II命令・注記の上部抜粋' : `原資料 PDF p.${page}`)))];
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
    assert(image && image.width === 1432 && image.height === (crop ? evidence.caslExcerpt.height : 2026), `source p.${page}`);
    assert.equal(image.sha256, (evidence.assetSHA256ByPage as Record<number, string>)[page]);
    const alt = (owner?.originalPageAlt ?? commonAlt)[page];
    assert(alt && alt.trim().length > 100 && alt.length <= 2000, `source transcription p.${page}`);
    const ref = commonRef(page, crop ? 'CASL II命令・注記の上部抜粋' : `原資料 PDF p.${page}`);
    if (owner) {
      ref.sourceId = `source-ipa-${book}-${owner.number}-qs`;
      ref.locator.questionNumber = String(owner.number);
    }
    return {
      schemaVersion: '3.0.0', id: spring2012PmPageAssetId(page), path: spring2012PmAssetPath(page),
      mediaType: 'image/webp', ...image, alt,
      attribution: { origin: crop ? 'adapted' : 'official', sourceRefs: [ref],
        rightsRefs: [owner ? `rights-ipa-${book}-${owner.number}` : commonRightsId], creatorIds: crop ? ['ipa', 'codex'] : ['ipa'] },
    };
  });
  return { assets, sources, rights };
}

export function spring2012PmSets(numbers: readonly number[]): { sets: SetRecord[]; exams: Exam[] } {
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
    const title = `2012年度 春期・旧午後${kind === 'mix' ? ' ランダムミックス' : ''}`;
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
