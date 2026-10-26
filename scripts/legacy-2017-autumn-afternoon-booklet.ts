/** Source facts and selection metadata, not an admission or release receipt.
 * Root and the independent page audit read QS1/3 and ANS1 separately.
 * The autumn booklet has an errata insert at physical p2: spring page numbers
 * and its 78 answer fields cannot be reused for this booklet's 75 fields.
 */
import assert from "node:assert/strict";
import type { Exam, Question, QuestionSelectionPolicy, Ref, SourceRef } from "../src/core/types";

export const autumn2017Afternoon = {
  id: "2017h29a-fe-pm",
  questionPaper: {
    url: "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf",
    sha256: "787ad5492b60949988e7e39ca532ac7c1c78ebfe5b3cbd9af4e6f621793ddd9a",
    byteLength: 14044358, physicalPages: 93,
  },
  answerPaper: {
    url: "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_ans.pdf",
    sha256: "7bbf8eff0464a05ae1f65c9ecff1ee978c946fb1bd28ef13858e710b9d3678c1",
    byteLength: 190582, physicalPages: 4,
  },
  majorNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  answerFieldCounts: [5, 4, 4, 4, 6, 7, 6, 6, 7, 7, 7, 6, 6],
  answerFieldTotal: 75,
  instructionPages: [1, 3],
  practiceMajorCount: 7,
  practiceSeconds: 9000,
} as const;

// Fixed from ANS physical p1, not from a generated question's answers.
export const autumn2017OfficialAnswerLabels = [
  "エイオアア", "ウウエエ", "イイオア", "イエクウ", "カイイイオイ",
  "カオエエアウエ", "ウイエイウイ", "エウエオウカ", "オカウオエオイ",
  "アイウアアイカ", "ウウエアウイイ", "オエウイイオ", "カウイウイア",
] as const;

// Choice counts are per answer field, including references to a shared bank.
// Multiple visible holes answered by one tuple remain one field.
export const autumn2017OfficialChoiceCounts = [
  [5, 5, 5, 4, 4], [4, 4, 4, 5], [4, 4, 6, 4], [5, 10, 10, 5],
  [6, 4, 6, 5, 6, 6], [6, 6, 6, 4, 3, 5, 6], [4, 4, 5, 4, 4, 4],
  [4, 4, 4, 6, 4, 6], [5, 6, 6, 5, 4, 6, 5], [3, 4, 4, 4, 4, 6, 6],
  [4, 4, 4, 4, 4, 5, 5], [5, 6, 6, 5, 5, 6], [6, 6, 6, 6, 5, 6],
] as const;

// Each row maps answer fields to their printed answer bank. Repeated bank
// numbers are shared, not copies or a restriction on choosing the same answer.
export const autumn2017OfficialAnswerBanks = [
  [0, 0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 1, 2],
  [0, 1, 2, 3, 4, 4], [0, 1, 2, 3, 4, 5, 6], [0, 0, 1, 2, 3, 4],
  [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5, 5],
  [0, 1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5],
] as const;

function majorIndex(number: number) {
  assert(Number.isSafeInteger(number) && number >= 1 && number <= 13, "unexpected_autumn_major");
  return number - 1;
}
export const autumn2017OriginalId = (number: number) => {
  majorIndex(number);
  return `question-ipa-2017h29a-fe-pm-${number}`;
};

type OriginalAnswers = Pick<Question, "id" | "origin" | "answerParts" | "choices" | "correctAnswer" | "choiceShuffleAllowed">;
/** This verifies source answer structure only. Independent semantic solvers,
 * material review, whole-booklet admission and normal-app checks are separate.
 */
export function assertAutumn2017OriginalAnswers(question: OriginalAnswers, number: number) {
  const index = majorIndex(number), parts = question.answerParts;
  assert.equal(question.id, autumn2017OriginalId(number), "autumn_original_id");
  assert.equal(question.origin.kind, "official_reprint", "autumn_original_kind");
  assert.equal(question.choiceShuffleAllowed, false, "autumn_original_choice_order");
  assert(parts && parts.length === autumn2017Afternoon.answerFieldCounts[index], "autumn_original_answer_field_count");
  assert.equal(new Set(parts.map(part => part.id)).size, parts.length, "autumn_duplicate_answer_field");
  assert.equal(new Set(question.choices.map(choice => choice.id)).size, question.choices.length, "autumn_duplicate_choice");
  const answers = question.correctAnswer.parts;
  assert(answers && answers.length === parts.length && question.correctAnswer.choiceId === undefined,
    "autumn_original_answer_count");
  assert(answers.every(answer => answer.kind === "choice"), "autumn_original_single_choice_fields");
  const choiceIds = new Set(question.choices.map(choice => choice.id));
  assert.equal(new Set(parts.flatMap(part => part.choiceIds)).size, choiceIds.size,
    "autumn_unused_choice");
  for (let left = 0; left < parts.length; left++) for (let right = left + 1; right < parts.length; right++) {
    if (autumn2017OfficialAnswerBanks[index][left] === autumn2017OfficialAnswerBanks[index][right])
      assert.deepEqual(parts[left].choiceIds, parts[right].choiceIds, "autumn_shared_answer_bank");
    else assert(parts[left].choiceIds.every(id => !parts[right].choiceIds.includes(id)),
      "autumn_distinct_answer_banks");
  }
  const letters = parts.map((part, partIndex) => {
    assert.equal(part.choiceIds.length, autumn2017OfficialChoiceCounts[index][partIndex], "autumn_original_choice_count");
    assert.equal(new Set(part.choiceIds).size, part.choiceIds.length, "autumn_duplicate_field_choice");
    assert(part.choiceIds.every(id => choiceIds.has(id)), "autumn_missing_field_choice");
    const matched = answers.filter(answer => answer.kind === "choice" && answer.partId === part.id);
    assert.equal(matched.length, 1, "autumn_original_answer_field_mapping");
    const answer = matched[0];
    assert(answer.kind === "choice");
    const choiceIndex = part.choiceIds.indexOf(answer.choiceId);
    assert(choiceIndex >= 0, "autumn_answer_outside_field");
    return "アイウエオカキクケコサシスセソ"[choiceIndex];
  }).join("");
  assert.equal(letters, autumn2017OfficialAnswerLabels[index], "autumn_official_answer_labels");
}

function policyRef(page: 1 | 3): SourceRef {
  return { sourceId: "source-ipa-2017h29a-fe-pm-booklet", locator: {
    section: "平成29年度 秋期 基本情報技術者試験 午後 表紙・問題選択方法",
    page, year: 2017, period: "秋期", exam: "基本情報技術者試験",
    subject: "旧制度・午後", timeSlot: "午後",
  } };
}

export function autumn2017QuestionSelection(originalRefs: readonly Ref[]): QuestionSelectionPolicy {
  assert.equal(originalRefs.length, 13, "autumn_complete_booklet_refs_required");
  originalRefs.forEach((ref, index) => {
    assert.equal(ref.questionId, autumn2017OriginalId(index + 1), "autumn_original_paper_order");
    assert(Number.isSafeInteger(ref.revision) && ref.revision >= 1, "autumn_original_revision");
  });
  // New objects keep menu selections from mutating the source policy/refs.
  const refs = originalRefs.map(ref => ({ questionId: ref.questionId, revision: ref.revision }));
  return {
    requiredQuestionRefs: [refs[0], refs[7]],
    optionalGroups: [
      { id: "general", label: "問2〜7から4問", questionRefs: refs.slice(1, 7), choose: 4 },
      { id: "language", label: "問9〜13から1問", questionRefs: refs.slice(8), choose: 1 },
    ],
    sourceRefs: [policyRef(1), policyRef(3)],
    excessPolicy: "paper_order",
  };
}

export function autumn2017Exam(mode: "study" | "practice", mix: boolean): Exam {
  return {
    schemaVersion: "3.0.0", id: `exam-2017-autumn-pm-${mix ? "mix-" : ""}${mode}`,
    revision: 1,
    title: `2017年度 秋期・旧午後 ${mix ? "ランダムミックス " : ""}${mode === "study" ? "学習・復習" : "時間付き練習"}`,
    subject: "B", mode,
    questionCount: mode === "study" ? autumn2017Afternoon.majorNumbers.length : autumn2017Afternoon.practiceMajorCount,
    ...(mode === "practice" ? { timeLimitSeconds: autumn2017Afternoon.practiceSeconds, practiceScope: "public_subset" as const } : {}),
    questionOrder: "set", choiceOrder: "fixed",
    duplicatePolicy: mix ? "instance_unique" : "lineage_unique", shortagePolicy: "block",
  };
}
