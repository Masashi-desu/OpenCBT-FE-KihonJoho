import assert from 'node:assert/strict';
import type { Asset, Exam, Rights, SetRecord, Source, SourceRef } from '../src/core/types';
import { spring2015PmPageAssetId } from '../src/core/generators/legacy-2015-spring-pm-materials';
import type { AfternoonBookletRecordSource, Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import evidence from './source-evidence/legacy-2015-spring-pm-source-review.json';

const book = evidence.collectionId;
const scope = '2015-spring-pm';
const title = '平成27年度 春期 基本情報技術者試験 午後';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const policyId = `source-ipa-${book}-usage`;
const commonId = `source-ipa-${book}-common-qs`;
const commonRightsId = `rights-ipa-${book}-common`;
const commonPages = [2, 4, 5, ...Array.from({ length: 12 }, (_, index) => 69 + index)];
const supports = ['annual-sets', 'random-mix', 'answer-validation'];

export const spring2015PmBooklet: AfternoonBookletRecordSource = {
  collectionId: book,
  year: 2015,
  period: '春期',
  officialTitle: title,
  questionPages: [6, 66],
  pageAssetId: spring2015PmPageAssetId,
  area: number => number === 1 ? 'security' : number === 6 ? 'management'
    : number === 7 ? 'strategy' : number >= 8 ? 'algorithm' : 'technology',
  learningTag: 'legacy-2015-spring',
};

export const spring2015PmAssetPath = (page: number) =>
  `assets/${book}-page-${String(page).padStart(3, '0')}${page === 71 ? '-casl-excerpt' : ''}.webp`;

function commonRef(page: number, section: string): SourceRef {
  return {
    sourceId: commonId,
    locator: { year: 2015, period: '春期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', page, section },
  };
}

const javaDocs = [
  { id: 'string', name: 'String', url: 'https://docs.oracle.com/javase/8/docs/api/java/lang/String.html',
    sections: ['format(String, Object...)', 'indexOf(int)', 'length()', 'toCharArray()', 'toLowerCase()', 'valueOf(char)'],
    fact: '書式化、検索、UTF-16の長さと配列への変換、英字の小文字化と一文字の文字列化。' },
  { id: 'map', name: 'Map', url: 'https://docs.oracle.com/javase/8/docs/api/java/util/Map.html',
    sections: ['clear()', 'get(Object)', 'keySet()', 'put(K, V)', 'remove(Object)'],
    fact: '登録、取得と未登録、削除、全解除、キー集合。' },
  { id: 'hash-map', name: 'HashMap', url: 'https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html',
    sections: ['HashMap()'], fact: '引数のないコンストラクタが空のマップを作る。' },
  { id: 'set', name: 'Set', url: 'https://docs.oracle.com/javase/8/docs/api/java/util/Set.html',
    sections: ['iterator()'], fact: 'キー集合の要素を拡張for文で列挙できる。' },
  { id: 'formatter', name: 'Formatter', url: 'https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html',
    sections: ['Numeric formatting', 'Integral conversion'], fact: '大文字の16進表記、先頭ゼロ、指定した最小桁数。' },
];
const javaSourceId = (id: string) => `source-java-se8-${book}-${id}`;
export const spring2015PmJavaRefs: SourceRef[] = [
  ...[67, 68].map(page => commonRef(page, '原冊子のJava API説明の参照先')),
  ...javaDocs.map(doc => ({ sourceId: javaSourceId(doc.id), locator: { section: doc.sections.join('、') } })),
];

function paperSource(id: string, label: string, pages: readonly number[], answer = false): Source {
  const { url, sha256 } = answer ? evidence.answerPaper : evidence.questionPaper;
  return {
    schemaVersion: '3.0.0', id, title: `${title} ${label}`, publisher, url, sha256,
    type: answer ? 'official_answer' : 'official_problem', scope: label,
    sections: pages.map(page => `PDF p.${page} ${label}`),
    facts: [answer ? '公式解答例の対応する単独解答欄。' : '問題本文、図表、注意書き、選択肢と指定の付属資料。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports,
    dateNote: '試験日・取得日と資料固有の公開日を区別する。',
    limits: '当該冊子の指定箇所の出典。Java API付属資料の原画像とJIS文字の符号表は配布範囲外。',
  };
}

function paperRights(id: string, label: string, refs: SourceRef[]): Rights {
  return {
    schemaVersion: '3.0.0', id, holders: [publisher], basis: 'official_policy', checkedOn: evidence.checkedOn,
    evidence: [{ sourceId: policyId, locator: { section: evidence.rights.terms } }, ...refs],
    scope: `${title} ${label}の確認済みIPA部分`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Public-Questions', modificationNoticeRequired: true,
    attributionText: `出典：${title} ${label}／©2015 ${publisher}`,
    thirdParty: { status: 'none_identified', rightsRefs: [], notes: '対象頁・図表の用途別確認。Java API付属資料の原画像とJIS文字の符号表・規格文言は配布範囲外。' },
    assessmentNotes: evidence.rights.scope,
  };
}

export function spring2015PmMetadata(input: {
  specs: readonly Stage3AfternoonQuestionSpec[];
  commonAlt: Readonly<Record<number, string>>;
  images: Readonly<Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>>>;
}) {
  const { specs, commonAlt, images } = input;
  const sources: Source[] = [{
    schemaVersion: '3.0.0', id: policyId, title: 'IPA 試験の過去問題の使用方法・留意点', publisher,
    url: evidence.rights.url, sha256: evidence.rights.sha256, type: 'policy', scope: evidence.rights.scope,
    sections: [evidence.rights.terms], facts: ['教育目的の利用に関する出典・改変表示の条件。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published', supports,
    dateNote: '確認日と公開日を区別する。', limits: '第三者の著作物・規格文言は個別に扱う。',
  }, paperSource(commonId, '表紙の試験時間・問題選択方法、問13の正誤表及び付属資料', [1, ...commonPages, 67, 68].sort((a, b) => a - b)),
  ...javaDocs.map(doc => ({
    schemaVersion: '3.0.0', id: javaSourceId(doc.id), title: `Java SE 8 API — ${doc.name}`,
    publisher: 'Oracle', url: doc.url, checkedOn: evidence.checkedOn, availability: 'officially_published',
    type: 'independent_note', scope: '問11で使うJava SE 8のAPIの動作を独自に説明するための参照。',
    sections: doc.sections, facts: [doc.fact], supports: ['answer-validation'],
    dateNote: 'Java SE 8の資料。参照日を資料の更新日と区別する。', limits: 'API仕様の事実のみ。説明文・例・資料画像は転載範囲外。',
  }))];
  const rights = [paperRights(commonRightsId, '問13の正誤表・共通擬似言語・CASL IIの必要箇所・表計算の付属資料',
    commonPages.map(page => commonRef(page, page === 71 ? 'CASL II命令・注記の上部抜粋' : page === 2 ? '問13の正誤表' : `原資料 PDF p.${page}`)))];
  for (const spec of specs) {
    const row = evidence.questions.find(q => q.number === spec.number);
    assert(row);
    assert.deepEqual(spec.pages, row.pages);
    const questionId = `source-ipa-${book}-${spec.number}-qs`;
    const answerId = `source-ipa-${book}-${spec.number}-ans`;
    const label = `問${spec.number}`;
    sources.push(paperSource(questionId, label, spec.pages), paperSource(answerId, `${label} 解答例`, [evidence.answerPaper.keyPage], true));
    const ref = (sourceId: string, page: number, section: string): SourceRef => ({
      sourceId, locator: { ...commonRef(page, section).locator, questionNumber: String(spec.number) },
    });
    rights.push(paperRights(`rights-ipa-${book}-${spec.number}`, label, [
      ...spec.pages.map(page => ref(questionId, page, label)), ref(answerId, evidence.answerPaper.keyPage, `${label} 解答例`),
    ]));
  }
  const assets: Asset[] = [...commonPages, ...specs.flatMap(spec => spec.pages)].sort((a, b) => a - b).map(page => {
    const owner = specs.find(spec => spec.pages.includes(page));
    const crop = page === evidence.caslExcerpt.page;
    const adapted = crop || page === 2;
    const image = images[page];
    assert(image && image.width === (page === 2 ? 2026 : 1433) &&
      image.height === (crop ? evidence.caslExcerpt.height : page === 2 ? 1433 : 2026), `source p.${page}`);
    assert.equal(image.sha256, (evidence.assetSHA256ByPage as Record<number, string>)[page]);
    const alt = (owner?.originalPageAlt ?? commonAlt)[page];
    assert(alt && alt.trim().length > 100 && alt.length <= 2000, `source transcription p.${page}`);
    const ref = commonRef(page, crop ? 'CASL II命令・注記の上部抜粋'
      : page === 2 ? '問13の公式正誤表。表示方向を90度回転。' : `原資料 PDF p.${page}`);
    if (owner) {
      ref.sourceId = `source-ipa-${book}-${owner.number}-qs`;
      ref.locator.questionNumber = String(owner.number);
    }
    return {
      schemaVersion: '3.0.0', id: spring2015PmPageAssetId(page), path: spring2015PmAssetPath(page),
      mediaType: 'image/webp', ...image, alt,
      attribution: { origin: adapted ? 'adapted' : 'official', sourceRefs: [ref],
        rightsRefs: [owner ? `rights-ipa-${book}-${owner.number}` : commonRightsId], creatorIds: adapted ? ['ipa', 'codex'] : ['ipa'] },
    };
  });
  return { assets, sources, rights };
}

export function spring2015PmSets(numbers: readonly number[]): { sets: SetRecord[]; exams: Exam[] } {
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
    const title = `2015年度 春期・旧午後${kind === 'mix' ? ' ランダムミックス' : ''}`;
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
