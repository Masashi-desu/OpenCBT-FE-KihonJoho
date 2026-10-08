import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { generationCoverage } from "../src/core/generation-coverage";
import { nextQuestionRef, selectQuestions } from "../src/core/selection";
import { refKey, type Selection } from "../src/core/types";
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
  kind: "mix",
  mode: "endless",
  bindingMode: "generated_values",
};

test("endless mode selects every included series independently of hidden year and size settings", () => {
  const bundle = fixture();
  for (const subject of ["A", "B"] as const) {
    const clean = selectQuestions(bundle, { ...selection, subject }, (a) => a);
    const expected = generationCoverage(bundle).rows
      .filter((row) => row.original.subject === subject)
      .map((row) => refKey(row.linked[0].baseQuestionRef)).sort();
    assert.deepEqual(clean.set.questionRefs.map(refKey).sort(), expected);
    assert.equal(clean.questions.length, 1);
    assert.equal(clean.exam.questionCount, undefined);
    assert.equal(clean.exam.mode, "study");
    assert.equal(clean.exam.timeLimitSeconds, undefined);
    assert.equal(clean.exam.duplicatePolicy, "cycle_unique");
    assert.equal(clean.exam.practiceScope, undefined);
    assert.deepEqual(clean.quota, {});
    for (const year of [2023, 2024, 2025, 2026, 2099])
      for (const size of ["public", "full"] as const) {
        const stale = selectQuestions(bundle, { ...selection, subject, year, size }, (a) => a);
        assert.deepEqual(stale.set.questionRefs, clean.set.questionRefs);
        assert.deepEqual(stale.questions, clean.questions);
        assert.equal(stale.exam.title, clean.exam.title);
        assert.equal(stale.exam.questionCount, undefined);
      }
  }
});

test("both subjects visit every series before a new lap and keep every issued answer in one session", async () => {
  const bundle = fixture();
  for (const subject of ["A", "B"] as const) {
    let run = startRun(await prepareRun(bundle, {
      ...selection, subject, year: 2025, size: "full",
    }, {}, 100000), 101000);
    assert(isOpenEnded(run));
    assert.equal(run.selection.year, undefined);
    assert.equal(run.selection.size, undefined);
    const count = run.set.questionRefs.length,
      sessionId = run.session.id,
      first = structuredClone(run.issued[0]);
    for (let index = 0; index < count + 2; index++) {
      if (index) run = await appendRunQuestion(run, undefined, 102000 + index * 1000);
      run = updateAnswer(run, run.issued[index].correctAnswer.choiceId, 102000 + index * 1000);
      assert.equal(run.session.id, sessionId);
      assert.equal(run.session.currentIndex, index);
      assert.equal(run.instances[index].entryIndex, index);
      assert.equal(run.session.status, "running");
    }
    assert.deepEqual(
      run.session.entries.slice(0, count).map((entry) => refKey(entry.questionRef)).sort(),
      run.set.questionRefs.map(refKey).sort(),
    );
    assert.equal(new Set(run.session.entries.slice(count).map((entry) => refKey(entry.questionRef))).size, 2);
    assert.equal(new Set(run.instances.map((i) => `${i.templateRef.id}:${JSON.stringify(i.parameters.values)}`)).size, count + 2);
    assert.deepEqual(run.issued[0], first);
    const saved = structuredClone(run);
    // Reopening preserves all used series even if the instances arrive in storage-key order.
    saved.instances.sort((a, b) => a.id.localeCompare(b.id));
    await validateRun(saved);
    const nextRef = nextQuestionRef(saved, (a) => a);
    assert(!saved.session.entries.slice(count).some((entry) => refKey(entry.questionRef) === refKey(nextRef)));
    const resumed = await appendRunQuestion(saved, nextRef, 200000);
    assert.deepEqual(resumed.issued.slice(0, saved.issued.length), saved.issued);
    const completed = finishRun(resumed, "completed", 201000);
    assert.equal(completed.result!.total, count + 3);
    assert.equal(completed.result!.correct, count + 2);
    assert.equal(completed.result!.unanswered, 1);
    await validateRun(completed);
  }
});

test("normal modes retain year, count and deadlines while missing settings and incompatible endless sets are rejected", async () => {
  const bundle = fixture();
  for (const subject of ["A", "B"] as const)
    for (const mode of ["study", "practice"] as const)
      for (const size of ["public", "full"] as const) {
        const prepared = selectQuestions(bundle, { ...selection, subject, mode, size, year: 2026 });
        const count = subject === "A" ? size === "public" ? 20 : 60 : size === "public" ? 6 : 20;
        assert.equal(prepared.questions.length, count);
        assert.equal(prepared.exam.questionCount, count);
        assert.equal(prepared.exam.mode, mode);
        assert.equal(prepared.exam.timeLimitSeconds, mode === "practice" ? count * (subject === "A" ? 90 : 300) : undefined);
      }
  for (const kind of ["annual", "bookmark"] as const)
    assert.throws(() => selectQuestions(bundle, { ...selection, kind }), { code: "SELECTION" });
  assert.throws(() => selectQuestions(bundle, { ...selection, mode: "study" }), { code: "SELECTION" });
  assert.throws(() => selectQuestions(bundle, { ...selection, mode: "practice", year: 2026 }), { code: "SELECTION" });
  const run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000);
  await assert.rejects(appendRunQuestion(finishRun(run, "completed", 102000)), { code: "STATE" });
  await assert.rejects(appendRunQuestion(run, run.session.entries[0].questionRef, 102000), { code: "SESSION_DUPLICATE" });
  for (const patch of [{ questionCount: 1 }, { mode: "practice" as const }]) {
    const invalid = structuredClone(run);
    Object.assign(invalid.exam, patch);
    await assert.rejects(validateRun(invalid), { code: "SESSION_CONFIG" });
  }
  const stale = structuredClone(run);
  stale.selection.year = 2026;
  await assert.rejects(validateRun(stale), { code: "SESSION_CONFIG" });
});

test("finite condition domains can keep cycling without repeating the preceding condition or answer", async () => {
  const bundle = fixture(),
    prepared = selectQuestions(bundle, selection),
    binding = prepared.set.generationBindings.find(
      (g) => g.questionRef.questionId === "question-template-source-2026-a-2",
    )!,
    base = bundle.questions.find((q) => q.id === binding.questionRef.questionId)!;
  prepared.set.questionRefs = [binding.questionRef];
  prepared.set.generationBindings = [binding];
  prepared.questions = [base];
  let run = startRun(await prepareRun(bundle, selection, {}, 100000, undefined, prepared), 101000);
  for (let index = 1; index < 40; index++) {
    const previous = run.instances.at(-1)!,
      next = await appendRunQuestion(run, undefined, 102000 + index * 1000),
      current = next.instances.at(-1)!;
    assert.notDeepEqual(current.parameters, previous.parameters);
    const answerText = (instance: typeof current) => instance.question.choices.find(
      (c) => c.id === instance.question.correctAnswer.choiceId,
    )!.content;
    assert.notDeepEqual(answerText(current), answerText(previous));
    run = next;
  }
  assert.equal(run.instances.length, 40);
  // This registered domain has only 4 × 3 inputs; completing 40 laps requires safe reuse.
  assert(new Set(run.instances.map((i) => JSON.stringify(i.parameters.values))).size <= 12);
  assert.equal(new Set(run.instances.map((i) => i.id)).size, 40);
  await validateRun(finishRun(run, "completed", 200000));
});

test("resumed endless runs reject their own preceding seed even after a newer session of the same series", async (t) => {
  const bundle = fixture(),
    prepared = selectQuestions(bundle, selection),
    binding = prepared.set.generationBindings.find(
      (g) => g.questionRef.questionId === "question-template-source-2026-a-2",
    )!,
    base = bundle.questions.find((q) => q.id === binding.questionRef.questionId)!;
  prepared.set.questionRefs = [binding.questionRef];
  prepared.set.generationBindings = [binding];
  prepared.questions = [base];
  const previous = startRun(await prepareRun(bundle, selection, {}, 100000, undefined, prepared), 101000),
    newer = await prepareRun(bundle, selection, {}, 200000, undefined, prepared, previous.instances),
    saved = structuredClone(previous),
    seed = Uint8Array.from(previous.instances[0].seed.match(/../g)!, (value) => parseInt(value, 16)),
    random = crypto.getRandomValues.bind(crypto);
  t.mock.method(crypto, "getRandomValues", (array: Uint8Array) => {
    if (array instanceof Uint8Array && array.length === 16) {
      array.set(seed);
      return array;
    }
    return random(array);
  });
  await assert.rejects(
    appendRunQuestion(previous, undefined, 300000, newer.instances),
    { code: "GENERATION_CAPACITY" },
  );
  assert.deepEqual(previous, saved);
});
