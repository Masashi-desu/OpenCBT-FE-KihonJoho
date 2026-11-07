import assert from 'node:assert/strict';
import type { Asset, Attribution, Exam, Rights, SetRecord, Source, SourceRef } from '../src/core/types';
import { spring2016PmPageAssetId } from '../src/core/generators/legacy-2016-spring-pm-materials';
import type { AfternoonBookletRecordSource, Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import evidence from './source-evidence/legacy-2016-spring-pm-source-review.json';

const book = evidence.collectionId;
const scope = '2016-spring-pm';
const title = '平成28年度 春期 基本情報技術者試験 午後';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const policyId = `source-ipa-${book}-usage`;
const commonId = `source-ipa-${book}-common-qs`;
const commonRightsId = `rights-ipa-${book}-common`;
const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, i) => first + i);
const commonAssetPages = [2, 4, 5, ...range(71, 82)];
export const spring2016PmBooklet: AfternoonBookletRecordSource = {
  collectionId: book,
  year: 2016,
  period: '春期',
  officialTitle: title,
  questionPages: [6, 68],
  pageAssetId: spring2016PmPageAssetId,
  area: n => n === 1 ? 'security' : n === 6 ? 'management' : n === 7 ? 'strategy' : n >= 8 ? 'algorithm' : 'technology',
  learningTag: 'legacy-2016-spring',
};

export const spring2016PmAssetPath = (page: number) =>
  `assets/${book}-page-${String(page).padStart(3, '0')}${page === 73 ? '-casl-excerpt' : ''}.webp`;

const commonRef = (page: number, section: string): SourceRef => ({
  sourceId: commonId,
  locator: { year: 2016, period: '春期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', page, section },
});
export const spring2016PmJavaRefs = [69, 70].map(page => commonRef(page, 'Javaプログラムで使用するAPIの説明（原資料への参照）'));

function makeSource(id: string, label: string, pages: readonly number[], answer = false): Source {
  const { url, sha256 } = answer ? evidence.answerPaper : evidence.questionPaper;
  return {
    schemaVersion: '3.0.0', id, title: `${title} ${label}`, publisher, url, sha256,
    type: answer ? 'official_answer' : 'official_problem',
    scope: label, sections: pages.map(page => `PDF p.${page} ${label}`),
    facts: [answer ? '公式解答例の全欄と順不同の指定を照合。' : '原問題・必要な注意書き・資料の該当箇所を確認。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published',
    dateNote: '資料固有の公開日・更新日は未確認。試験日や取得日と区別する。',
    supports: ['annual-sets', 'random-mix', 'answer-validation'],
    limits: '指定箇所の出典。Java API付属資料とJIS文字の符号表の画像は配布しない。',
  };
}

function makeRights(id: string, label: string): Rights {
  return {
    schemaVersion: '3.0.0', id, holders: [publisher], basis: 'official_policy', checkedOn: evidence.checkedOn,
    evidence: [{ sourceId: policyId, locator: { section: evidence.rights.terms } }],
    scope: `${title} ${label}の確認済みIPA部分`,
    uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    licenseId: 'LicenseRef-IPA-Public-Questions', modificationNoticeRequired: true,
    attributionText: `出典：${title} ${label}／©2016 ${publisher}`,
    thirdParty: { status: 'none_identified', rightsRefs: [], notes: '掲載部分を個別に確認。JISの文字の符号表とJava API付属資料の原画像を配布範囲に含めない。' },
    assessmentNotes: evidence.rights.scope,
  };
}

export function spring2016PmMetadata(input: {
  specs: readonly Stage3AfternoonQuestionSpec[];
  commonAlt: Readonly<Record<number, string>>;
  images: Readonly<Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>>>;
}) {
  const { specs, commonAlt, images } = input;
  const sources: Source[] = [{
    schemaVersion: '3.0.0', id: policyId, title: 'IPA 試験の過去問題の使用方法・留意点', publisher,
    url: evidence.rights.url, sha256: evidence.rights.sha256, type: 'policy', scope: evidence.rights.scope,
    sections: [evidence.rights.terms], facts: ['公表問題の出典・改変を明示して教材に利用する条件を確認。'],
    checkedOn: evidence.checkedOn, availability: 'officially_published',
    dateNote: '確認日と公開日を区別する。', supports: ['annual-sets', 'random-mix', 'answer-validation'],
    limits: '第三者の著作物・規格文言に包括適用しない。',
  }, makeSource(commonId, '試験の選択方法・正誤表・付属資料', [1, ...commonAssetPages, 69, 70].sort((a, b) => a - b))];
  const rights = [makeRights(commonRightsId, '正誤表・共通擬似言語・CASL IIの必要箇所・表計算の付属資料')];
  for (const spec of specs) {
    const row = evidence.questions.find(q => q.number === spec.number);
    assert(row);
    assert.deepEqual(spec.pages, row.pages, `original page boundaries for Q${spec.number}`);
    const key = `${book}-${spec.number}`;
    const label = `問${spec.number}`;
    sources.push(makeSource(`source-ipa-${key}-qs`, label, spec.pages),
      makeSource(`source-ipa-${key}-ans`, `${label} 解答例`, [evidence.answerPaper.keyPage], true));
    rights.push(makeRights(`rights-ipa-${key}`, label));
  }
  const assets: Asset[] = [...commonAssetPages, ...specs.flatMap(spec => spec.pages)].sort((a, b) => a - b).map(page => {
    const owner = specs.find(spec => spec.pages.includes(page));
    const image = images[page];
    const crop = page === 73;
    assert(image && image.width === (page === 2 ? 2026 : 1432) && image.height === (crop ? 1230 : page === 2 ? 1432 : 2026));
    assert.match(image.sha256, /^[a-f0-9]{64}$/);
    const alt = (owner?.originalPageAlt ?? commonAlt)[page];
    assert(alt && alt.trim().length > 80, `reviewed transcription of PDF p.${page}`);
    const ref = commonRef(page, crop ? 'CASL II命令の上部抜粋。下部の文字の符号表を除外。'
      : page === 2 ? '問7の公式正誤表。表示方向を90度回転。' : `原資料 PDF p.${page}`);
    if (owner) {
      ref.sourceId = `source-ipa-${book}-${owner.number}-qs`;
      ref.locator.questionNumber = String(owner.number);
    }
    const attribution: Attribution = {
      origin: crop ? 'adapted' : 'official', sourceRefs: [ref],
      rightsRefs: [owner ? `rights-ipa-${book}-${owner.number}` : commonRightsId],
      creatorIds: crop ? ['ipa', 'codex'] : ['ipa'],
    };
    return {
      schemaVersion: '3.0.0', id: spring2016PmPageAssetId(page, crop), path: spring2016PmAssetPath(page),
      mediaType: 'image/webp', ...image, alt, attribution,
    };
  });
  return { assets, sources, rights };
}

export function spring2016PmSets(numbers: readonly number[]): { sets: SetRecord[]; exams: Exam[] } {
  const ref = (n: number, base = false) => ({
    questionId: `${base ? 'question-template-source-' : 'question-ipa-'}${book}-${n}`, revision: 1,
  });
  const { required, groups, coverPage, durationSeconds } = evidence.selection;
  const optionalGroups = groups.map(({ first, last, choose }) => ({
    id: `group-${first}-${last}`, label: `問${first}〜${last}から${choose}問`,
    questionRefs: numbers.filter(n => n >= first && n <= last).map(n => ref(n)), choose,
  }));
  const completeSelection = required.every(n => numbers.includes(n)) && optionalGroups.every(g => g.questionRefs.length >= g.choose);
  const questionCount = completeSelection ? required.length + groups.reduce((n, group) => n + group.choose, 0) : numbers.length;
  const sets: SetRecord[] = [];
  const exams: Exam[] = [];
  for (const kind of ['annual', 'mix'] as const) {
    const setTitle = `2016年度 春期・旧午後${kind === 'mix' ? ' ランダムミックス' : ''}`;
    const examConfigRefs = (['study', 'practice'] as const).map(mode => ({ id: `exam-${kind}-${scope}-${mode}`, revision: 1 }));
    const set: SetRecord = {
      schemaVersion: '3.0.0', id: `set-${kind}-${scope}`, revision: 1, title: setTitle, subject: 'B',
      questionRefs: numbers.map(n => ref(n, kind === 'mix')), examConfigRefs, distribution: 'excluded',
      generationBindings: kind === 'annual' ? [] : numbers.map(n => ({
        questionRef: ref(n, true), templateRef: { id: `template-source-${book}-${n}`, revision: 1 },
      })),
    };
    if (kind === 'annual' && completeSelection) set.questionSelection = {
      requiredQuestionRefs: required.map(n => ref(n)), optionalGroups,
      sourceRefs: [commonRef(coverPage, '表紙の試験時間と問題選択方法')], excessPolicy: 'paper_order',
    };
    sets.push(set);
    for (const [i, mode] of (['study', 'practice'] as const).entries()) exams.push({
      schemaVersion: '3.0.0', ...examConfigRefs[i], title: `${setTitle} ${mode === 'study' ? '学習' : '時間付き練習'}`,
      subject: 'B', mode, questionCount: mode === 'study' ? numbers.length : questionCount,
      ...(mode === 'practice' ? { timeLimitSeconds: durationSeconds, practiceScope: 'learning_set' as const } : {}),
      questionOrder: 'set', choiceOrder: 'fixed', duplicatePolicy: 'lineage_unique', shortagePolicy: 'block',
    });
  }
  return { sets, exams };
}
