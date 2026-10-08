import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { refOf, type Selection } from "../src/core/types";
import { generationCoverage } from "../src/core/generation-coverage";
import { answerCanVary, answerSignature } from "../src/core/generation";
import { selectQuestions } from "../src/core/selection";
import { schema } from "../src/core/validation";
import {
  appendRunQuestion,
  finishRun,
  isOpenEnded,
  prepareRun,
  startRun,
  updateAnswer,
  validateRun,
} from "../src/core/session";

const selection: Selection = {
  subject: "A",
  kind: "bookmark",
  year: 2026,
  mode: "study",
  size: "public",
  bindingMode: "generated_values",
  bookmarkQuestionRef: { questionId: "question-ipa-2026-a-1", revision: 1 },
};

test("all bookmarked series append to one session and aggregate every answer without replacing saved content", async () => {
  const bundle = fixture();
  for (const row of generationCoverage(bundle).rows) {
    let run = startRun(await prepareRun(bundle, {
      ...selection,
      subject: row.original.subject,
      bookmarkQuestionRef: refOf(row.original),
    }, {}, 100000), 101000);
    assert(isOpenEnded(run));
    const baseRef = run.session.entries[0].questionRef;
    run = updateAnswer(run, run.issued[0].correctAnswer.choiceId, 102000);
    run.session.entries[0].revealed = true;
    run.session.entries[0].reviewFlag = true;
    run.session.activeElapsedSeconds = 12;
    for (let index = 1; index < 3; index++) {
      const saved = structuredClone(run),
        next = await appendRunQuestion(run, baseRef, 103000 + index * 1000);
      assert.deepEqual(run, saved, row.original.id);
      assert.equal(next.session.id, run.session.id);
      assert.equal(next.session.startedAt, run.session.startedAt);
      assert.equal(next.session.revision, run.session.revision + 1);
      assert.equal(next.session.status, "running");
      assert.equal(next.session.currentIndex, index);
      assert.equal(next.session.activeElapsedSeconds, 12);
      assert.equal(next.result, undefined);
      assert.deepEqual(next.exam, run.exam);
      assert.deepEqual(next.set, run.set);
      assert.deepEqual(next.bundle, run.bundle);
      assert.deepEqual(next.session.entries.slice(0, index), run.session.entries);
      assert.deepEqual(next.issued.slice(0, index), run.issued);
      assert.deepEqual(next.instances.slice(0, index), run.instances);
      assert.equal(next.instances[index].sessionId, run.session.id);
      assert.equal(next.instances[index].entryIndex, index);
      assert.equal(next.session.entries[index].selectedChoiceId, undefined);
      assert.equal(next.session.entries[index].revealed, false);
      assert.equal(next.session.entries[index].reviewFlag, false);
      assert.equal(new Set(next.instances.map((i) => JSON.stringify(i.parameters))).size, index + 1);
      if (answerCanVary(row.linked[0]))
        assert.notEqual(answerSignature(next.issued[index]), answerSignature(run.issued[index - 1]));
      run = next;
      if (index === 1)
        run = updateAnswer(run, run.issued[index].choices.find(
          (choice) => choice.id !== run.issued[index].correctAnswer.choiceId,
        )!.id, 105000);
    }
    const completed = finishRun(run, "completed", 108000);
    await validateRun(completed);
    assert.deepEqual(completed.result!.entries.map((e) => e.outcome), ["correct", "incorrect", "unanswered"]);
    assert.equal(completed.result!.total, 3);
    assert.equal(completed.result!.correct, 1);
    assert.equal(completed.result!.incorrect, 1);
    assert.equal(completed.result!.unanswered, 1);
    assert.equal(completed.result!.revealedCount, 1);
    assert.equal(completed.result!.learningAccuracyPercent, 33.3);
  }
});

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
  await assert.rejects(appendRunQuestion(limited, baseRef), { code: "QUESTION_LIMIT" });
  limited.issued.push(structuredClone(limited.issued[0]));
  limited.session.entries.push(structuredClone(limited.session.entries[0]));
  await assert.rejects(validateRun(limited), { code: "SESSION_COUNT" });
  assert.deepEqual(run, saved);
  const practice = { ...run.exam, mode: "practice", timeLimitSeconds: 5400 };
  assert.throws(() => schema("exam", practice), { code: "SCHEMA" });
  assert.throws(() => schema("exam", { ...run.exam, questionCount: 0 }), { code: "SCHEMA" });
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
