/** Source facts only: these checks do not admit material or approve release.
 * QS physical p1/p3 and ANS physical p1 were read independently of the
 * prepared factories. Q4 has five operation/result fields but four answer
 * definitions, because its final two fields form one unordered group.
 */
import assert from "node:assert/strict";
import type { Exam, PartAnswer, Question, QuestionSelectionPolicy, Ref, SourceRef } from "../src/core/types";
import { labels } from "../src/core/types";

export const spring2018Afternoon = {
  id: "2018h30h-fe-pm",
  questionPaper: {
    url: "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf",
    sha256: "bb172e6225037b05e18aec455f7aec8ec66f3e82838c92a27bb50d2d203dbfb9",
    byteLength: 20020715, physicalPages: 89,
  },
  answerPaper: {
    url: "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_ans.pdf",
    sha256: "50c0b5defdb6a579048671d6a371e1ecf982ad59d370c08d1909e16d0f7b0777",
    byteLength: 200776, physicalPages: 4,
  },
  majorNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  answerFieldCounts: [5, 5, 4, 5, 5, 6, 8, 5, 6, 6, 7, 6, 6],
  answerFieldTotal: 74,
  answerDefinitionCounts: [5, 5, 4, 4, 5, 6, 8, 5, 6, 6, 7, 6, 6],
  answerDefinitionTotal: 73,
  instructionPages: [1, 3],
  practiceMajorCount: 7,
  practiceSeconds: 9000,
} as const;

// Fixed from ANS p1. Q4's last two letters are an unordered multiset;
// their order in this string is merely the printed canonical presentation.
export const spring2018OfficialAnswerLabels = [
  "エイイエエ", "エオアオア", "ウエイエ", "イイウアウ", "キウウアエ",
  "ウクアカオイ", "エイエイイイイア", "イエエイイ", "イウイカアイ",
  "イオアエイウ", "アカアイアアイ", "オウイエオオ", "イオエオウア",
] as const;

// Per operation field, including each reference to a shared printed bank.
// Q6's unnamed 設問2 and e1/e2/e3 tuple are each ONE operation field.
export const spring2018OfficialChoiceCounts = [
  [5, 4, 4, 4, 4], [4, 5, 5, 6, 6], [4, 4, 4, 4], [4, 4, 4, 5, 5],
  [10, 10, 6, 4, 5], [4, 8, 4, 6, 6, 6], [5, 5, 5, 5, 3, 4, 3, 4],
  [6, 4, 4, 4, 6], [4, 5, 5, 6, 6, 6], [4, 6, 6, 4, 4, 4],
  [4, 6, 7, 7, 4, 6, 4], [5, 6, 6, 6, 6, 5], [8, 8, 6, 8, 6, 6],
] as const;
export const spring2018OfficialAnswerBanks = [
  [0, 1, 2, 3, 4], [0, 1, 1, 2, 2], [0, 1, 2, 3], [0, 1, 2, 3, 3],
  [0, 0, 1, 2, 3], [0, 1, 2, 3, 3, 4], [0, 1, 2, 3, 4, 5, 6, 7],
  [0, 1, 2, 3, 4], [0, 1, 1, 2, 2, 2], [0, 1, 1, 2, 3, 4],
  [0, 1, 2, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5],
] as const;

function majorIndex(number: number) {
  assert(Number.isSafeInteger(number) && number >= 1 && number <= 13, "unexpected_spring_major");
  return number - 1;
}
export const spring2018OriginalId = (number: number) => {
  majorIndex(number);
  return `question-ipa-2018h30h-fe-pm-${number}`;
};
type OriginalAnswers = Pick<Question, "id" | "origin" | "answerParts" | "choices" | "correctAnswer" | "choiceShuffleAllowed">;

/** Structural source correspondence only; semantic solvers and material,
 * source display, persistence and ordinary-app admission remain separate. */
export function assertSpring2018OriginalAnswers(question: OriginalAnswers, number: number) {
  const index = majorIndex(number), parts = question.answerParts;
  assert.equal(question.id, spring2018OriginalId(number), "spring_original_id");
  assert.equal(question.origin.kind, "official_reprint", "spring_original_kind");
  assert.equal(question.choiceShuffleAllowed, false, "spring_original_choice_order");
  assert(parts && parts.length === spring2018Afternoon.answerFieldCounts[index], "spring_original_answer_field_count");
  assert.equal(new Set(parts.map(p => p.id)).size, parts.length, "spring_duplicate_answer_field");
  const allIds = new Set(question.choices.map(c => c.id));
  assert.equal(allIds.size, question.choices.length, "spring_duplicate_choice");
  const answers = question.correctAnswer.parts;
  assert(answers && answers.length === spring2018Afternoon.answerDefinitionCounts[index] &&
    question.correctAnswer.choiceId === undefined, "spring_original_answer_definition_count");
  assert.equal(new Set(parts.flatMap(p => p.choiceIds)).size, allIds.size, "spring_unused_choice");
  for (let left = 0; left < parts.length; left++) for (let right = left + 1; right < parts.length; right++) {
    if (spring2018OfficialAnswerBanks[index][left] === spring2018OfficialAnswerBanks[index][right])
      assert.deepEqual(parts[left].choiceIds, parts[right].choiceIds, "spring_shared_answer_bank");
    else assert(parts[left].choiceIds.every(id => !parts[right].choiceIds.includes(id)), "spring_distinct_answer_banks");
  }
  const covered = new Set<string>();
  for (const [i, part] of parts.entries()) {
    assert.equal(part.choiceIds.length, spring2018OfficialChoiceCounts[index][i], "spring_original_choice_count");
    assert.equal(new Set(part.choiceIds).size, part.choiceIds.length, "spring_duplicate_field_choice");
    assert(part.choiceIds.every(id => allIds.has(id)), "spring_missing_field_choice");
    if (number === 4 && i >= 3) continue;
    const matched: PartAnswer[] = answers.filter(a => a.kind === "choice" && a.partId === part.id);
    assert.equal(matched.length, 1, "spring_original_answer_field_mapping");
    const answer = matched[0]; assert(answer.kind === "choice");
    const at = part.choiceIds.indexOf(answer.choiceId);
    assert(at >= 0, "spring_answer_outside_field");
    assert.equal(labels[at], spring2018OfficialAnswerLabels[index][i], "spring_official_answer_labels");
    covered.add(part.id);
  }
  if (number === 4) {
    const groups = answers.filter(a => a.kind === "unordered");
    assert.equal(groups.length, 1, "spring_original_unordered_group");
    const group = groups[0]; assert(group.kind === "unordered");
    assert.deepEqual(group.partIds, parts.slice(3).map(p => p.id), "spring_unordered_field_mapping");
    assert.equal(group.choiceIds.length, 2, "spring_unordered_multiplicity");
    const letters = group.choiceIds.map(id => {
      const at = parts[3].choiceIds.indexOf(id); assert(at >= 0, "spring_answer_outside_field"); return labels[at];
    }).sort().join("");
    assert.equal(letters, "アウ", "spring_official_unordered_labels");
    group.partIds.forEach(id => covered.add(id));
  } else assert(answers.every(a => a.kind === "choice"), "spring_original_single_choice_fields");
  assert.equal(covered.size, parts.length, "spring_uncovered_answer_field");
}

function policyRef(page: 1 | 3): SourceRef {
  return { sourceId: "source-ipa-2018h30h-fe-pm-booklet", locator: {
    section: "平成30年度 春期 基本情報技術者試験 午後 表紙・問題選択方法",
    page, year: 2018, period: "春期", exam: "基本情報技術者試験", subject: "旧制度・午後", timeSlot: "午後",
  } };
}
export function spring2018QuestionSelection(originalRefs: readonly Ref[]): QuestionSelectionPolicy {
  assert.equal(originalRefs.length, 13, "spring_complete_booklet_refs_required");
  originalRefs.forEach((ref, index) => {
    assert.equal(ref.questionId, spring2018OriginalId(index + 1), "spring_original_paper_order");
    assert(Number.isSafeInteger(ref.revision) && ref.revision >= 1, "spring_original_revision");
  });
  const refs = originalRefs.map(ref => ({ questionId: ref.questionId, revision: ref.revision }));
  return {
    requiredQuestionRefs: [refs[0], refs[7]],
    optionalGroups: [
      { id: "general", label: "問2〜7から4問", questionRefs: refs.slice(1, 7), choose: 4 },
      { id: "language", label: "問9〜13から1問", questionRefs: refs.slice(8), choose: 1 },
    ],
    sourceRefs: [policyRef(1), policyRef(3)], excessPolicy: "paper_order",
  };
}
export function spring2018Exam(mode: "study" | "practice", mix: boolean): Exam {
  return {
    schemaVersion: "3.0.0", id: `exam-2018-spring-pm-${mix ? "mix-" : ""}${mode}`, revision: 1,
    title: `2018年度 春期・旧午後 ${mix ? "ランダムミックス " : ""}${mode === "study" ? "学習・復習" : "時間付き練習"}`,
    subject: "B", mode, questionCount: mode === "study" ? 13 : 7,
    ...(mode === "practice" ? { timeLimitSeconds: 9000, practiceScope: "public_subset" as const } : {}),
    questionOrder: "set", choiceOrder: "fixed", duplicatePolicy: mix ? "instance_unique" : "lineage_unique", shortagePolicy: "block",
  };
}
