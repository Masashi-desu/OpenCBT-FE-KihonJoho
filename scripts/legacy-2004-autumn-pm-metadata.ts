import assert from 'node:assert/strict';
import type { Asset, Exam, Rights, SetRecord, Source, SourceRef } from '../src/core/types';
import { autumn2004PmPageAssetId } from '../src/core/generators/legacy-2004-autumn-pm-materials';
import type { AfternoonBookletRecordSource, Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import evidence from './source-evidence/legacy-2004-autumn-pm-source-review.json';

const book = evidence.collectionId;
const scope = '2004-autumn-pm';
const title = '平成16年度 秋期 基本情報技術者試験 午後';
const publisher = '独立行政法人情報処理推進機構（IPA）';
const commonId = `source-ipa-${book}-qs`;
const commonRightsId = `rights-ipa-${book}-common`;
const policyId = `source-ipa-${book}-usage`;
const siteId = `source-ipa-${book}-siteinfo`;
const archiveTermsId = `source-ipa-${book}-warp-help`;

export const autumn2004PmBooklet: AfternoonBookletRecordSource = {
  collectionId: book,
  year: 2004,
  period: '秋期',
  officialTitle: title,
  questionPages: [3, 57],
  printedPageNumber: page => page,
  pageAssetId: autumn2004PmPageAssetId,
  area: number => number <= 2 ? 'technology' : 'algorithm',
  learningTag: 'legacy-2004-autumn',
};

export function autumn2004PmAssetPath(page: number) {
  const suffix = page === evidence.caslExcerpt.page ? '-casl-excerpt' : '';
  return `assets/${book}-page-${String(page).padStart(3, '0')}${suffix}.webp`;
}

function commonRef(page: number, section: string): SourceRef {
  return {
    sourceId: commonId,
    locator: { year: 2004, period: '秋期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', page, section },
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
    limits: '参照する箇所を頁と問番号で特定する。',
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
    attributionText: `出典：${title} ${label}。©2004 ${publisher}。国立国会図書館WARP保存版。`,
    thirdParty: { status: 'none_identified', rightsRefs: [], notes: materialNote },
    assessmentNotes: evidence.rightsScope,
  };
}

export function autumn2004PmMetadata(input: {
  specs: readonly Stage3AfternoonQuestionSpec[];
  commonAlt: Readonly<Record<number, string>>;
  images: Readonly<Record<number, Pick<Asset, 'width' | 'height' | 'sha256' | 'byteLength'>>>;
}) {
  const { specs, commonAlt, images } = input;
  const referenceLabel = '共通擬似言語とCASL IIの必要資料';
  const sources = [
    policySource(policyId, 'IPA 試験の過去問題の使用方法・留意点', publisher, 'faq.html',
      evidence.rightsTerms, '教育目的での利用、出典の表示及び改変時の表示。'),
    policySource(siteId, 'IPA ウェブサイトのご利用について', publisher, 'siteinfo.html',
      '著作権について・商標について', '特別な利用条件と第三者の素材・商標を区別する。'),
    policySource(archiveTermsId, '国立国会図書館WARP 保存資料の著作権について', '国立国会図書館', 'warp-help.html',
      '5-4. 著作権について', '保存資料の二次利用では原権利者の利用条件に従う。'),
    paperSource(commonId, '表紙の問題選択方法・' + referenceLabel, [1, ...evidence.commonPages], 'questions.pdf'),
  ];
  const rights = [
    paperRights(commonRightsId, referenceLabel,
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
      schemaVersion: '3.0.0', id: autumn2004PmPageAssetId(page), path: autumn2004PmAssetPath(page),
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

export function autumn2004PmSets(numbers: readonly number[]): { sets: SetRecord[]; exams: Exam[] } {
  const ref = (n: number, base = false) => ({
    questionId: `${base ? 'question-template-source-' : 'question-ipa-'}${book}-${n}`, revision: 1,
  });
  const { required, groups, coverPage, durationSeconds } = evidence.selection;
  const availableRequired = required.filter(number => numbers.includes(number));
  const optionalGroups = groups.map(({ first, last, choose }) => {
    const available = numbers.filter(number => number >= first && number <= last);
    const range = available.length === last - first + 1 ? `問${first}〜${last}` : available.map(number => `問${number}`).join('・');
    return { id: `group-${first}-${last}`, label: `${range}から${choose}問`, questionRefs: available.map(number => ref(number)), choose };
  });
  assert(availableRequired.length > 0 && optionalGroups.every(group => group.questionRefs.length >= group.choose),
    '掲載済み大問で必須・選択区分を構成できる');
  const practiceCount = availableRequired.length + optionalGroups.reduce((count, group) => count + group.choose, 0);
  const sets: SetRecord[] = [];
  const exams: Exam[] = [];
  const modes = ['study', 'practice'] as const;
  for (const kind of ['annual', 'mix'] as const) {
    const name = `2004年度 秋期・旧午後${kind === 'mix' ? ' ランダムミックス' : ''}`;
    const examConfigRefs = modes.map(mode => ({ id: `exam-${kind}-${scope}-${mode}`, revision: 1 }));
    const set: SetRecord = {
      schemaVersion: '3.0.0', id: `set-${kind}-${scope}`, revision: 1, title: name, subject: 'B',
      questionRefs: numbers.map(number => ref(number, kind === 'mix')), examConfigRefs, distribution: 'excluded',
      generationBindings: kind === 'annual' ? [] : numbers.map(number => ({
        questionRef: ref(number, true), templateRef: { id: `template-source-${book}-${number}`, revision: 1 },
      })),
    };
    if (kind === 'annual') set.questionSelection = {
      requiredQuestionRefs: availableRequired.map(number => ref(number)), optionalGroups,
      sourceRefs: [commonRef(coverPage, '表紙の試験時間と問題選択方法。練習の出題対象は掲載分。')], excessPolicy: 'paper_order',
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
