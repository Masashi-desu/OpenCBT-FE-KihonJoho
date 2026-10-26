import test from "node:test";
import assert from "node:assert/strict";
import type { Question, Ref } from "../src/core/types";
import { labels } from "../src/core/types";
import { schema } from "../src/core/validation";
import { gradeAnswer } from "../src/core/answers";
import {
  assertSpring2018OriginalAnswers, spring2018Afternoon as paper,
  spring2018OfficialAnswerLabels as marks, spring2018OfficialChoiceCounts as counts,
  spring2018OfficialAnswerBanks as banks, spring2018OriginalId,
  spring2018QuestionSelection, spring2018Exam,
} from "../scripts/legacy-2018-spring-afternoon-booklet";

// A source-structure fixture, deliberately NOT a transcription or semantic
// oracle. Original/body/algorithm/material/display checks are separate tests.
function structure(n: number) {
  const parts = counts[n - 1].map((count, i) => ({ id: `field-${i}`, label: `欄${i + 1}`,
    choiceIds: Array.from({ length: count }, (_, j) => `bank-${banks[n - 1][i]}-${j}`) }));
  const attribution = { origin: "original" as const, sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: ["codex"] };
  const single = parts.slice(0, n === 4 ? 3 : parts.length).map((part, i) => ({ kind: "choice" as const,
    partId: part.id, choiceId: part.choiceIds[labels.indexOf(marks[n - 1][i])] }));
  return {
    id: spring2018OriginalId(n), origin: { kind: "official_reprint" as const, sourceRefs: [],
      derivedFrom: [], changes: [], isModified: n === 12, modificationBasis: "official_source" as const },
    choiceShuffleAllowed: false, answerParts: parts,
    choices: [...new Set(parts.flatMap(p => p.choiceIds))].map(id => ({ id,
      content: { attribution, blocks: [{ type: "paragraph" as const, text: id }] } })),
    correctAnswer: { attribution, parts: n === 4 ? [...single, { kind: "unordered" as const,
      partIds: parts.slice(3).map(p => p.id), choiceIds: [parts[3].choiceIds[0], parts[3].choiceIds[2]] }] : single },
  } satisfies Pick<Question, "id" | "origin" | "choiceShuffleAllowed" | "answerParts" | "choices" | "correctAnswer">;
}

test("2018春期は13大問74操作欄・73正答定義、324固有択・386欄別参照を別々に保つ", () => {
  assert.equal(paper.answerFieldCounts.reduce((a, b) => a + b, 0), 74);
  assert.equal(paper.answerDefinitionCounts.reduce((a, b) => a + b, 0), 73);
  let unique = 0, refs = 0;
  for (let n = 1; n <= 13; n++) {
    const q = structure(n); assertSpring2018OriginalAnswers(q, n);
    unique += q.choices.length; refs += q.answerParts.reduce((a, p) => a + p.choiceIds.length, 0);
  }
  assert.equal(unique, 324); assert.equal(refs, 386);
  const missing = structure(6); missing.answerParts.pop();
  assert.throws(() => assertSpring2018OriginalAnswers(missing, 6), /answer_field_count/);
  const splitTuple = structure(6); splitTuple.answerParts.push({ ...splitTuple.answerParts[5], id: "e2" });
  assert.throws(() => assertSpring2018OriginalAnswers(splitTuple, 6), /answer_field_count/);
});

test("共有群の複製・順序変更、別群間の流用、誤正答・別冊子を拒否する", () => {
  const duplicate = structure(5), ids = [...duplicate.answerParts[1].choiceIds];
  duplicate.choices.push(...duplicate.choices.filter(c => ids.includes(c.id)).map(c => ({ ...c, id: c.id + "-copy" })));
  duplicate.answerParts[1].choiceIds = ids.map(id => id + "-copy");
  assert.throws(() => assertSpring2018OriginalAnswers(duplicate, 5), /shared_answer_bank/);
  const reordered = structure(6); reordered.answerParts[4].choiceIds.reverse();
  assert.throws(() => assertSpring2018OriginalAnswers(reordered, 6), /shared_answer_bank/);
  const sharedWrong = structure(3); sharedWrong.answerParts[1].choiceIds = [...sharedWrong.answerParts[0].choiceIds];
  assert.throws(() => assertSpring2018OriginalAnswers(sharedWrong, 3), /unused_choice|distinct_answer_banks/);
  const wrong = structure(11); const answer = wrong.correctAnswer.parts[0]; assert(answer.kind === "choice");
  answer.choiceId = wrong.answerParts[0].choiceIds[1];
  assert.throws(() => assertSpring2018OriginalAnswers(wrong, 11), /official_answer_labels/);
  const foreign = structure(1); foreign.id = "question-ipa-2017h29h-fe-pm-1";
  assert.throws(() => assertSpring2018OriginalAnswers(foreign, 1), /original_id/);
  assert.throws(() => assertSpring2018OriginalAnswers({ ...structure(1), choiceShuffleAllowed: true }, 1), /choice_order/);
});

test("問4の2欄順不同は一つの定義を保ち、順序・重複・空欄の全36状態を5結果欄へ採点する", () => {
  const q = structure(4), group = q.correctAnswer.parts[3]; assert(group.kind === "unordered");
  const reversed = structuredClone(q); const rg = reversed.correctAnswer.parts[3]; assert(rg.kind === "unordered");
  rg.choiceIds.reverse(); assertSpring2018OriginalAnswers(reversed, 4);
  const merged = structuredClone(q); merged.answerParts.pop();
  assert.throws(() => assertSpring2018OriginalAnswers(merged, 4), /answer_field_count/);
  const repeated = structuredClone(q); const repeatedGroup = repeated.correctAnswer.parts[3]; assert(repeatedGroup.kind === "unordered");
  repeatedGroup.choiceIds[1] = repeatedGroup.choiceIds[0];
  assert.throws(() => assertSpring2018OriginalAnswers(repeated, 4), /official_unordered_labels/);
  const fixed = Object.fromEntries(q.correctAnswer.parts.flatMap(a => a.kind === "choice" ? [[a.partId, a.choiceId]] : []));
  const values = [undefined, ...q.answerParts[3].choiceIds]; let checked = 0;
  for (const a of values) for (const b of values) {
    const selected = { ...fixed, ...(a ? { [group.partIds[0]]: a } : {}), ...(b ? { [group.partIds[1]]: b } : {}) };
    // The grading API reads only the source-structure fields above.
    const graded = gradeAnswer(q as unknown as Question, { selectedPartChoices: selected });
    assert.equal(graded.parts!.length, 5);
    const remaining = new Set([q.answerParts[3].choiceIds[0], q.answerParts[3].choiceIds[2]]);
    const expected = [a, b].map(v => !v ? "unanswered" : remaining.delete(v) ? "correct" : "incorrect");
    assert.deepEqual(graded.parts!.slice(3).map(p => p.outcome), expected);
    assert.equal(graded.outcome, !a || !b ? "unanswered" : expected.every(x => x === "correct") ? "correct" : "incorrect");
    checked++;
  }
  assert.equal(checked, 36);
});

test("全13原refを必須とする選択規則は75通り・7大問・35〜41操作欄・150分", () => {
  const refs: Ref[] = Array.from({ length: 13 }, (_, i) => ({ questionId: spring2018OriginalId(i + 1), revision: 1 }));
  const policy = spring2018QuestionSelection(refs);
  assert.deepEqual(policy.requiredQuestionRefs.map(r => r.questionId), [spring2018OriginalId(1), spring2018OriginalId(8)]);
  assert.deepEqual(policy.optionalGroups.map(g => [g.questionRefs.length, g.choose]), [[6, 4], [5, 1]]);
  assert.deepEqual(policy.sourceRefs.map(r => [r.locator.page, r.locator.year, r.locator.period]), [[1, 2018, "春期"], [3, 2018, "春期"]]);
  assert.equal(policy.excessPolicy, "paper_order");
  assert.throws(() => spring2018QuestionSelection(refs.slice(0, 12)), /complete_booklet_refs/);
  assert.throws(() => spring2018QuestionSelection([...refs].reverse()), /paper_order/);
  assert.throws(() => spring2018QuestionSelection(refs.map((r, i) => i === 12 ? { ...r, revision: 0 } : r)), /revision/);
  policy.requiredQuestionRefs[0].revision = 99; assert.equal(refs[0].revision, 1);
  const totals: number[] = [];
  for (let mask = 0; mask < 64; mask++) {
    const general = Array.from({ length: 6 }, (_, i) => i + 2).filter((_, i) => mask & (1 << i));
    if (general.length !== 4) continue;
    for (let lang = 9; lang <= 13; lang++) totals.push([1, 8, ...general, lang].reduce((a, n) => a + paper.answerFieldCounts[n - 1], 0));
  }
  assert.equal(totals.length, 75); assert.equal(Math.min(...totals), 35); assert.equal(Math.max(...totals), 41);
  for (const mode of ["study", "practice"] as const) for (const mix of [false, true]) {
    const exam = spring2018Exam(mode, mix); schema("exam", exam);
    assert.equal(exam.questionCount, mode === "study" ? 13 : 7);
    assert.equal(exam.timeLimitSeconds, mode === "study" ? undefined : 9000);
  }
});
