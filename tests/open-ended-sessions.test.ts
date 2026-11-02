import test, { before } from "node:test";
import assert from "node:assert/strict";
import { fixture, installFixtureGenerators } from "./fixtures";
import { answerRun as answerCurrent } from "./fixtures/answer-run";
import { compoundRun } from "./fixtures/compound-question";
import { contentHash } from "../src/core/hash";
import { refOf, type Run, type Selection } from "../src/core/types";
import { selectQuestions } from "../src/core/selection";
import { schema } from "../src/core/validation";
import {
  appendRunQuestion,
  finishRun,
  isOpenEnded,
  prepareRun,
  startRun,
  updateAnswer,
  updatePartAnswer,
  validateRun,
} from "../src/core/session";

before(installFixtureGenerators);

const selection: Selection = {
  subject: "A",
  kind: "bookmark",
  year: 2026,
  mode: "study",
  size: "public",
  bindingMode: "generated_values",
  bookmarkQuestionRef: { questionId: "question-ipa-2026-a-1", revision: 1 },
};

test("open-ended sessions can exceed 60 questions and retain their position and results", async () => {
  let run = startRun(await prepareRun(fixture(), {
    ...selection,
    subject: "B",
    bookmarkQuestionRef: { questionId: "question-ipa-2025-b-1", revision: 1 },
  }, {}, 100000), 101000);
  const baseRef = run.session.entries[0].questionRef;
  for (let index = 0; index < 61; index++) {
    if (index > 0) run = await appendRunQuestion(run, baseRef, 102000 + index * 1000);
    run = updateAnswer(run, run.issued[index].correctAnswer.choiceId, 102000 + index * 1000);
    run.session.entries[index].revealed = true;
  }
  const completed = finishRun(run, "completed", 200000);
  assert.equal(completed.session.currentIndex, 60);
  assert.equal(completed.instances[60].entryIndex, 60);
  assert.equal(completed.result!.total, 61);
  assert.equal(completed.result!.correct, 61);
  assert.equal(completed.result!.revealedCount, 61);
  assert.equal(completed.result!.learningAccuracyPercent, 100);
  await validateRun(structuredClone(completed));
});

test("the shared append operation supports original questions independently of bookmark selections", async () => {
  const bundle = fixture(),
    annual = { ...selection, kind: "annual" as const, bindingMode: "original_data" as const },
    prepared = selectQuestions(bundle, annual);
  delete prepared.exam.questionCount;
  prepared.questions = prepared.questions.slice(0, 1);
  const run = startRun(await prepareRun(bundle, annual, {}, 100000, undefined, prepared), 101000),
    next = await appendRunQuestion(run, prepared.set.questionRefs[1], 102000);
  assert.equal(next.session.id, run.session.id);
  assert.equal(next.issued.length, 2);
  assert.equal(next.instances.length, 0);
  assert.deepEqual(next.issued[1], bundle.questions.find(
    (q) => q.id === prepared.set.questionRefs[1].questionId,
  ));
  await validateRun(next);
  await assert.rejects(appendRunQuestion(next, prepared.set.questionRefs[0]), { code: "SESSION_DUPLICATE" });
});

test("append rejects limited sessions, unavailable references and inactive states without changing the run", async () => {
  const ready = await prepareRun(fixture(), selection, {}, 100000),
    baseRef = ready.session.entries[0].questionRef,
    run = startRun(ready, 101000),
    saved = structuredClone(run);
  await assert.rejects(appendRunQuestion(ready, baseRef), { code: "STATE" });
  await assert.rejects(appendRunQuestion(finishRun(run, "completed", 102000), baseRef), { code: "STATE" });
  const paused = structuredClone(run);
  paused.session.status = "paused";
  paused.session.pausedAt = "1970-01-01T00:01:42.000Z";
  await assert.rejects(appendRunQuestion(paused, baseRef), { code: "STATE" });
  await assert.rejects(appendRunQuestion(run, { questionId: "missing", revision: 1 }), { code: "REFERENCE" });
  const inactive = structuredClone(run);
  inactive.bundle.questions.find((q) => q.id === baseRef.questionId)!.lifecycle = "withdrawn";
  await assert.rejects(appendRunQuestion(inactive, baseRef), { code: "REFERENCE" });
  const limited = structuredClone(run);
  limited.exam.questionCount = 1;
  limited.exam.duplicatePolicy = "instance_unique";
  await assert.rejects(appendRunQuestion(limited, baseRef), { code: "QUESTION_LIMIT" });
  limited.issued.push(structuredClone(limited.issued[0]));
  limited.session.entries.push(structuredClone(limited.session.entries[0]));
  await assert.rejects(validateRun(limited), { code: "SESSION_COUNT" });
  assert.deepEqual(run, saved);
  const practice = { ...run.exam, mode: "practice", timeLimitSeconds: 5400 };
  assert.throws(() => schema("exam", practice), { code: "SCHEMA" });
  assert.throws(() => schema("exam", { ...run.exam, questionCount: 0 }), { code: "SCHEMA" });
  assert.throws(() => schema("exam", { ...run.exam, questionCount: 1 }), { code: "SCHEMA" });
});

test("generation failure preserves all previously answered entries", async () => {
  const ready = await prepareRun(fixture(), selection, {}, 100000),
    run = updateAnswer(startRun(ready, 101000), ready.issued[0].correctAnswer.choiceId, 102000),
    baseRef = run.session.entries[0].questionRef;
  run.bundle.templates = [];
  const saved = structuredClone(run);
  await assert.rejects(appendRunQuestion(run, baseRef, 103000), { code: "GENERATOR_REF" });
  assert.deepEqual(run, saved);
});

// Synthetic API coverage only; the real 2018 autumn Q13 source keys and all
// choices are independently covered by the booklet's content tests after admission.
test("an unscored first field keeps its saved choice and cannot consume the one intended scored error", async () => {
  for (const selected of [undefined, "choice-one", "choice-two", "choice-three"]) {
    for (const correct of [true, false]) {
      const ready = await compoundRun(), q = ready.issued[0];
      q.answerParts!.unshift(q.answerParts!.pop()!);
      q.correctAnswer.parts!.unshift(q.correctAnswer.parts!.pop()!);
      ready.session.entries[0].issuedContent.contentSha256 = await contentHash(q);
      let run = startRun(ready, 100000);
      if (selected) run = updatePartAnswer(run, "part-f", selected, 100100);
      const source = structuredClone(run.issued[0]);
      run = answerCurrent(run, correct, 100200);
      assert.deepEqual(run.issued[0], source);
      assert.equal(run.session.entries[0].selectedPartChoices?.["part-f"], selected);
      assert.equal(run.session.entries[0].selectedPartChoices?.["part-a"] === "choice-two", correct);
      run = finishRun(run, "completed", 100300);
      await validateRun(structuredClone(run));
      assert.equal(run.result!.entries[0].outcome, correct ? "correct" : "incorrect");
      assert.deepEqual(run.result!.entries[0].parts!.find(part => part.partId === "part-f"),
        { partId: "part-f", outcome: "unscored" });
      assert.deepEqual(run.result!.partSummary, { total: 4, correct: correct ? 3 : 2,
        incorrect: correct ? 0 : 1, unanswered: 0, unscored: 1,
        learningAccuracyPercent: correct ? 100 : 66.7 });
    }
  }
});
