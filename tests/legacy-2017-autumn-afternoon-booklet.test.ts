import test from "node:test";
import assert from "node:assert/strict";
import type { Question, Ref } from "../src/core/types";
import { schema } from "../src/core/validation";
import {
  assertAutumn2017OriginalAnswers, autumn2017Afternoon, autumn2017Exam,
  autumn2017OfficialAnswerLabels, autumn2017OfficialChoiceCounts, autumn2017OfficialAnswerBanks,
  autumn2017OriginalId, autumn2017QuestionSelection,
} from "../scripts/legacy-2017-autumn-afternoon-booklet";

// Answer-structure unit fixture only: no source transcription, semantic proof,
// material admission or normal-app acceptance is inferred from this object.
function answerStructure(number: number) {
  const counts = autumn2017OfficialChoiceCounts[number - 1];
  const parts = counts.map((count, index) => ({ id: `part-${index + 1}`, label: `設問${index + 1}`,
    choiceIds: Array.from({ length: count }, (_, choice) => `choice-${autumn2017OfficialAnswerBanks[number - 1][index]}-${choice + 1}`) }));
  const own = { origin: "original" as const, sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: ["codex"] };
  return {
    id: autumn2017OriginalId(number),
    origin: { kind: "official_reprint" as const, sourceRefs: [], derivedFrom: [], changes: [], isModified: false,
      modificationBasis: "official_source" as const },
    choiceShuffleAllowed: false,
    answerParts: parts,
    choices: [...new Set(parts.flatMap(part => part.choiceIds))].map(id => ({ id, content: {
      attribution: own, blocks: [{ type: "paragraph" as const, text: id }],
    } })),
    correctAnswer: { attribution: own, parts: parts.map((part, index) => ({ kind: "choice" as const,
      partId: part.id,
      choiceId: part.choiceIds["アイウエオカキクケコ".indexOf(autumn2017OfficialAnswerLabels[number - 1][index])],
    })) },
  } satisfies Pick<Question, "id" | "origin" | "choiceShuffleAllowed" | "answerParts" | "choices" | "correctAnswer">;
}

test("秋期は13大問75欄、複数穴の組合せと共有群をその欄数のまま検査する", () => {
  assert.equal(autumn2017Afternoon.answerFieldCounts.reduce((sum, count) => sum + count, 0), 75);
  for (let number = 1; number <= 13; number++) assertAutumn2017OriginalAnswers(answerStructure(number), number);
  const wrongCount = answerStructure(3);
  wrongCount.answerParts.push({ id: "split-b2", label: "b2", choiceIds: [...wrongCount.answerParts[2].choiceIds] });
  assert.throws(() => assertAutumn2017OriginalAnswers(wrongCount, 3), /answer_field_count/);
  const truncatedSharedBank = answerStructure(4);
  truncatedSharedBank.answerParts[1].choiceIds.pop();
  assert.throws(() => assertAutumn2017OriginalAnswers(truncatedSharedBank, 4), /shared_answer_bank/);
  const copiedBank = answerStructure(7);
  const copies = copiedBank.choices.filter(choice => copiedBank.answerParts[1].choiceIds.includes(choice.id))
    .map(choice => ({ ...choice, id: choice.id + "-copy" }));
  copiedBank.choices.push(...copies); copiedBank.answerParts[1].choiceIds = copies.map(choice => choice.id);
  assert.throws(() => assertAutumn2017OriginalAnswers(copiedBank, 7), /shared_answer_bank/);
  assert.equal(Array.from({ length: 13 }, (_, index) => answerStructure(index + 1).choices.length)
    .reduce((sum, count) => sum + count, 0), 345);
});

test("公式正答と欄対応の誤り、候補欠落、別冊子の原問題を拒否する", () => {
  const wrongAnswer = answerStructure(9);
  wrongAnswer.correctAnswer.parts[0].choiceId = wrongAnswer.answerParts[0].choiceIds[0];
  assert.throws(() => assertAutumn2017OriginalAnswers(wrongAnswer, 9), /official_answer_labels/);
  const duplicateFieldAnswer = answerStructure(1);
  duplicateFieldAnswer.correctAnswer.parts[1].partId = duplicateFieldAnswer.correctAnswer.parts[0].partId;
  assert.throws(() => assertAutumn2017OriginalAnswers(duplicateFieldAnswer, 1), /answer_field_mapping/);
  const missingChoice = answerStructure(13); missingChoice.choices.pop();
  assert.throws(() => assertAutumn2017OriginalAnswers(missingChoice, 13), /unused_choice|missing_field_choice/);
  const spring = answerStructure(1); spring.id = "question-ipa-2017h29h-fe-pm-1";
  assert.throws(() => assertAutumn2017OriginalAnswers(spring, 1), /original_id/);
  const reordered = { ...answerStructure(5), choiceShuffleAllowed: true };
  assert.throws(() => assertAutumn2017OriginalAnswers(reordered, 5), /choice_order/);
});

test("秋期選択規則は全13原問題の順序と改訂を要求し、保留大問の削除で成立させない", () => {
  const refs: Ref[] = Array.from({ length: 13 }, (_, index) => ({ questionId: autumn2017OriginalId(index + 1), revision: 1 }));
  const policy = autumn2017QuestionSelection(refs);
  assert.deepEqual(policy.requiredQuestionRefs.map(ref => ref.questionId), [autumn2017OriginalId(1), autumn2017OriginalId(8)]);
  assert.deepEqual(policy.optionalGroups.map(group => [group.questionRefs.length, group.choose]), [[6, 4], [5, 1]]);
  assert.deepEqual(policy.sourceRefs.map(ref => ref.locator.page), [1, 3]);
  assert(policy.sourceRefs.every(ref => ref.locator.period === "秋期" && ref.locator.timeSlot === "午後"));
  assert.throws(() => autumn2017QuestionSelection(refs.filter((_, index) => index !== 10)), /complete_booklet_refs/);
  assert.throws(() => autumn2017QuestionSelection([...refs].reverse()), /paper_order/);
  assert.throws(() => autumn2017QuestionSelection(refs.map((ref, index) => index === 11 ? { ...ref, revision: 0 } : ref)), /revision/);
  policy.requiredQuestionRefs[0].revision = 99;
  assert.equal(refs[0].revision, 1);
});

test("秋期の75通りは7大問だが35〜41解答欄に変動し、春期の欄数を流用しない", () => {
  const counts = autumn2017Afternoon.answerFieldCounts;
  const totals: number[] = [];
  for (let mask = 0; mask < 64; mask++) {
    const general = Array.from({ length: 6 }, (_, index) => index + 2).filter((_, index) => (mask & (1 << index)) !== 0);
    if (general.length !== 4) continue;
    for (let language = 9; language <= 13; language++) {
      const selected = [1, 8, ...general, language];
      assert.equal(selected.length, 7);
      totals.push(selected.reduce((sum, number) => sum + counts[number - 1], 0));
    }
  }
  assert.equal(totals.length, 75);
  assert.equal(Math.min(...totals), 35); assert.equal(Math.max(...totals), 41);
  for (const mix of [false, true]) for (const mode of ["study", "practice"] as const) {
    const exam = autumn2017Exam(mode, mix); schema("exam", exam);
    assert.equal(exam.questionCount, mode === "study" ? 13 : 7);
    assert.equal(exam.timeLimitSeconds, mode === "study" ? undefined : 9000);
  }
});
