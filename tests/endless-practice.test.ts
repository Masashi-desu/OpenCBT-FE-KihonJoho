import { checkEndlessSessionHistory } from "./helpers/booklet-endless-practice-paths";
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { fixture, installFixtureGenerators } from "./fixtures";
import { publishedSourceScope } from "./helpers/published-source-scope";
import { generationCoverage } from "../src/core/generation-coverage";
import { nextQuestionRef, selectQuestions } from "../src/core/selection";
import { refKey, refOf, type Selection } from "../src/core/types";
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

test("each endless draw offers all candidates regardless of their past frequency and uses fresh randomness", async (t) => {
  const run = startRun(await prepareRun(fixture(), selection, {}, 100000), 101000),
    refs = structuredClone(run.set.questionRefs);
  // Unequal historical counts must not exclude frequently used definitions.
  run.session.entries.push(...Array.from({ length: 10 }, () => structuredClone(run.session.entries[0])));
  const saved = structuredClone(run);
  for (const index of [0, 0, refs.length - 1]) {
    const drawn = nextQuestionRef(run, (offered) => {
      assert.deepEqual(offered, refs);
      offered.reverse();
      const [target] = offered.splice(refs.length - 1 - index, 1);
      return [target, ...offered];
    });
    assert.deepEqual(drawn, refs[index]);
  }
  const original = crypto.getRandomValues.bind(crypto);
  let draws = 0;
  t.mock.method(crypto, "getRandomValues", (array: Uint32Array) => {
    if (array instanceof Uint32Array) {
      draws++;
      array.fill(0);
      return array;
    }
    return original(array);
  });
  // Fixed random draws can select the same definition repeatedly; they are not consumed from a lap.
  assert.deepEqual(nextQuestionRef(run), refs[1]);
  const previousDraws = draws;
  assert.deepEqual(nextQuestionRef(run), refs[1]);
  assert(draws > previousDraws);
  assert.deepEqual(run, saved);
});

test("older cycling sessions switch to random draws while retaining issued content and answers", async () => {
  let old = startRun(await prepareRun(fixture(), selection, {}, 100000), 101000);
  old.exam.duplicatePolicy = "cycle_unique";
  old = updateAnswer(old, old.issued[0].correctAnswer.choiceId, 102000);
  await validateRun(old);
  const saved = structuredClone(old),
    next = await appendRunQuestion(old, old.session.entries[0].questionRef, 103000);
  assert.equal(next.session.id, old.session.id);
  assert.equal(next.exam.duplicatePolicy, "random_reuse");
  assert.notEqual(next.exam.id, old.exam.id);
  assert.notEqual(next.set.id, old.set.id);
  assert.deepEqual(next.session.entries.slice(0, 1), old.session.entries);
  assert.deepEqual(next.issued.slice(0, 1), old.issued);
  assert.deepEqual(next.instances.slice(0, 1), old.instances);
  assert.deepEqual(next.session.examConfigRef, { id: next.exam.id, revision: next.exam.revision });
  assert.deepEqual(next.session.setRef, { id: next.set.id, revision: next.set.revision });
  assert.deepEqual(old, saved);
  await validateRun(next);
  const invalid = structuredClone(next);
  invalid.exam.duplicatePolicy = "cycle_unique";
  await assert.rejects(appendRunQuestion(invalid, undefined, 104000), { code: "SESSION_DUPLICATE" });
});

test("endless current-subject pools retain all applicable series and explicit bookmark pools retain all old-PM series", () => {
  const bundle = fixture();
  for (const subject of ["A", "B"] as const) {
    const clean = selectQuestions(bundle, { ...selection, subject }, (a) => a);
    const expected = generationCoverage(bundle).rows
      .filter((row) => row.original.subject === subject &&
        !row.original.origin.sourceRefs.some(ref => ref.locator.timeSlot === "午後"))
      .map((row) => refKey(row.linked[0].baseQuestionRef)).sort();
    assert.deepEqual(clean.set.questionRefs.map(refKey).sort(), expected);
    assert.equal(expected.length, publishedSourceScope.subjectPoolCounts[subject]);
    if (subject === "A") assert.deepEqual(clean.set.questionRefs.filter(ref=>ref.questionId.startsWith("question-template-source-2016h28a-fe-am-"))
      .map(ref=>Number(ref.questionId.split("-").at(-1))).sort((a,b)=>a-b),
      Array.from({length:80},(_,i)=>i+1).filter(n=>![55,56,57].includes(n)));
    assert(clean.set.questionRefs.every(ref => !ref.questionId.includes("2017h29h-fe-pm")));
    if (subject === "B") {
      // A deliberate bookmark pool uses the old majors instead of silently
      // inserting them into the current-format subject-B pool.
      const pm = generationCoverage(bundle).rows.filter(row => row.original.origin.sourceRefs
        .some(ref => ref.locator.year === 2017 && ref.locator.period === "春期" && ref.locator.timeSlot === "午後"));
      assert.equal(pm.length, 13);
      const explicit = selectQuestions(bundle, { ...selection, subject, kind: "bookmark", questionRefs: pm.map(row => refOf(row.original)) }, a => a);
      assert.deepEqual(explicit.set.questionRefs.map(refKey).sort(), pm.map(row => refKey(row.linked[0].baseQuestionRef)).sort());
      assert.equal(explicit.questions.length, 1);
    }
    assert.equal(clean.questions.length, 1);
    assert.equal(clean.exam.questionCount, undefined);
    assert.equal(clean.exam.mode, "study");
    assert.equal(clean.exam.timeLimitSeconds, undefined);
    assert.equal(clean.exam.duplicatePolicy, "random_reuse");
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

test("both complete subject pools retain representative random answers and saved history in one session", async () => {
  const bundle = fixture();
  for (const subject of ["A", "B"] as const)
    await checkEndlessSessionHistory(bundle, { ...selection, subject }, 4);
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
  assert.throws(() => selectQuestions(bundle, { ...selection, kind: "annual" }), { code: "SELECTION" });
  assert.throws(() => selectQuestions(bundle, { ...selection, kind: "bookmark" }), { code: "BOOKMARK_REF" });
  assert.throws(() => selectQuestions(bundle, { ...selection, mode: "study" }), { code: "SELECTION" });
  assert.throws(() => selectQuestions(bundle, { ...selection, mode: "practice", year: 2026 }), { code: "SELECTION" });
  const run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000);
  await assert.rejects(appendRunQuestion(finishRun(run, "completed", 102000)), { code: "STATE" });
  const repeated = await appendRunQuestion(run, run.session.entries[0].questionRef, 102000);
  assert.deepEqual(repeated.session.entries[1].questionRef, run.session.entries[0].questionRef);
  assert.notDeepEqual(repeated.instances[1].parameters, run.instances[0].parameters);
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

// Match executable App setup without changing raw shared fixture imports.
before(installFixtureGenerators);
