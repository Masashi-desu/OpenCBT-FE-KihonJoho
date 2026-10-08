import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { bookmarkGroupSelection, makeBookmark } from "../src/core/bookmarks";
import { generationCoverage } from "../src/core/generation-coverage";
import { nextQuestionRef, selectEndlessQuestions, selectQuestions } from "../src/core/selection";
import { refKey, refOf, type Ref, type Selection } from "../src/core/types";
import { schema, validateBundle } from "../src/core/validation";
import {
  appendRunQuestion, finishRun, prepareRun, startRun, updateAnswer, validateRun,
} from "../src/core/session";

test("the shared endless pool accepts arbitrary single-subject and mixed subsets with only their bindings", () => {
  const bundle = fixture(), saved = structuredClone(bundle),
    rows = generationCoverage(bundle).rows,
    a = rows.filter((row) => row.original.subject === "A"),
    b = rows.filter((row) => row.original.subject === "B");
  for (const group of [[a[0]], a.slice(0, 3), b.slice(0, 2), [a[0], b[0], a[1]]]) {
    const refs = group.map((row) => row.linked[0].baseQuestionRef),
      prepared = selectEndlessQuestions(bundle, refs, "指定した問題群", (a) => a);
    refs[0] = { questionId: "changed-after-selection", revision: 1 };
    assert.deepEqual(prepared.set.questionRefs, group.map((row) => row.linked[0].baseQuestionRef));
    assert.deepEqual(prepared.set.generationBindings.map((g) => g.templateRef.id), group.map((row) => row.linked[0].id));
    assert.equal(prepared.exam.subject, new Set(group.map((row) => row.original.subject)).size === 1 ? group[0].original.subject : "mixed");
    assert.equal(prepared.set.subject, prepared.exam.subject);
    assert.equal(prepared.exam.duplicatePolicy, "random_reuse");
    assert.equal(prepared.questions.length, 1);
    assert.equal(prepared.questions[0].id, group[0].linked[0].baseQuestionRef.questionId);
    schema("set", prepared.set);
    schema("exam", prepared.exam);
  }
  assert.deepEqual(bundle, saved);
});

test("every registered bookmark is selectable across both subjects, including consecutive repeats, while results preserve every answer", async () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows,
    bookmarks = rows.map((row) => makeBookmark(bundle, refOf(row.original), 0)),
    selection = bookmarkGroupSelection(bookmarks), savedSelection = structuredClone(selection),
    prepared = selectQuestions(bundle, selection, (a) => a),
    expected = rows.map((row) => refKey(row.linked[0].baseQuestionRef)).sort();
  assert.equal(selection.subject, "mixed");
  assert.equal(selection.kind, "bookmark");
  assert.deepEqual(prepared.set.questionRefs.map(refKey).sort(), expected);
  let run = startRun(await prepareRun(bundle, selection, {}, 100000, undefined, prepared), 101000);
  const sessionId = run.session.id;
  for (let index = 0; index < expected.length + 2; index++) {
    if (index) {
      const targetIndex = (index - 1) % expected.length;
      const ref = nextQuestionRef(run, (refs) => [refs[targetIndex], ...refs.slice(0, targetIndex), ...refs.slice(targetIndex + 1)]);
      run = await appendRunQuestion(run, ref, 102000 + index * 1000);
    }
    if (index % 3 !== 2) {
      const answer = index % 3 === 0 ? run.issued[index].correctAnswer.choiceId :
        run.issued[index].choices.find((c) => c.id !== run.issued[index].correctAnswer.choiceId)!.id;
      run = updateAnswer(run, answer, 102000 + index * 1000);
    }
    assert.equal(run.session.id, sessionId);
    assert(expected.includes(refKey(run.session.entries[index].questionRef)));
  }
  assert.deepEqual([...new Set(run.session.entries.map((e) => refKey(e.questionRef)))].sort(), expected);
  assert.deepEqual(run.session.entries[0].questionRef, run.session.entries[1].questionRef);
  const saved = structuredClone(run);
  saved.instances.reverse();
  // Current bookmarks can change independently; the saved pool and questions remain fixed.
  bookmarks.splice(0, bookmarks.length);
  selection.questionRefs!.splice(0, selection.questionRefs!.length);
  assert.deepEqual(saved.selection, savedSelection);
  await validateRun(saved);
  saved.session.currentIndex = 0;
  saved.session.entries[0].reviewFlag = true;
  saved.session.entries[0].revealed = true;
  const resumed = await appendRunQuestion(saved, nextQuestionRef(saved, (a) => a), 300000);
  assert.deepEqual(resumed.issued.slice(0, saved.issued.length), saved.issued);
  assert.deepEqual(resumed.session.entries.slice(0, saved.issued.length), saved.session.entries);
  const completed = finishRun(resumed, "completed", 301000),
    count = expected.length + 2;
  assert.equal(completed.result!.total, count + 1);
  assert.equal(completed.result!.correct, Math.ceil(count / 3));
  assert.equal(completed.result!.incorrect, Math.floor((count + 1) / 3));
  assert.equal(completed.result!.unanswered, Math.floor(count / 3) + 1);
  assert.equal(completed.result!.revealedCount, 1);
  assert.deepEqual(completed.selection.questionRefs, savedSelection.questionRefs);
  await validateRun(completed);
});

test("random bookmark draws never add unregistered series and change each series' preceding input", async () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows;
  for (const group of [
    rows.filter((row) => row.original.subject === "A").slice(0, 2),
    rows.filter((row) => row.original.subject === "B").slice(0, 2),
    [rows.find((row) => row.original.id === "question-ipa-2026-a-2")!],
    [rows[0], rows.find((row) => row.original.subject === "B")!],
  ]) {
    const selection = bookmarkGroupSelection(group.map((row) => makeBookmark(bundle, refOf(row.original)))),
      refs = group.map((row) => refKey(row.linked[0].baseQuestionRef)).sort(),
      latest = new Map<string, number[]>();
    let run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000);
    for (let index = 0; index < (group.length === 1 ? 40 : group.length * 4); index++) {
      if (index) run = await appendRunQuestion(run, undefined, 102000 + index * 1000);
      const instance = run.instances.at(-1)!, key = refKey(instance.baseQuestionRef);
      assert(refs.includes(key));
      if (latest.has(key)) assert.notDeepEqual(instance.parameters.values, latest.get(key));
      latest.set(key, instance.parameters.values);
    }
    await validateRun(finishRun(run, "completed", 200000));
  }
});

test("duplicate source/base aliases form one candidate and empty, unavailable or incompatible groups cannot start", () => {
  const bundle = fixture(), row = generationCoverage(bundle).rows[0],
    bookmark = makeBookmark(bundle, refOf(row.original)),
    selection = bookmarkGroupSelection([bookmark]),
    prepared = selectQuestions(bundle, {
      ...selection, questionRefs: [bookmark.questionRef, row.linked[0].baseQuestionRef, bookmark.questionRef],
    });
  assert.equal(prepared.set.questionRefs.length, 1);
  assert.equal(prepared.set.generationBindings.length, 1);
  assert.throws(() => bookmarkGroupSelection([]), { code: "BOOKMARK_REF" });
  assert.throws(() => selectEndlessQuestions(bundle, [], "空"), { code: "SHORTAGE" });
  assert.throws(() => selectQuestions(bundle, { ...selection, questionRefs: [] }), { code: "BOOKMARK_REF" });
  const missing: Ref = { questionId: "missing", revision: 1 };
  assert.throws(() => selectQuestions(bundle, { ...selection, questionRefs: [missing] }), { code: "BOOKMARK_REF" });
  assert.throws(() => selectEndlessQuestions(bundle, [missing], "不明"), { code: "BINDING_REF" });
  for (const patch of [{ subject: "mixed" as const }, { mode: "practice" as const }, { mode: "study" as const }])
    assert.throws(() => selectQuestions(bundle, { ...selection, ...patch }), { code: "SELECTION" });
  const unsupported = structuredClone(bundle);
  unsupported.templates = [];
  assert.throws(() => selectQuestions(unsupported, selection), { code: "BOOKMARK_REF" });
  const withdrawn = structuredClone(bundle);
  withdrawn.catalog.withdrawals.push({ questionRef: bookmark.questionRef, reason: "test" });
  assert.throws(() => selectQuestions(withdrawn, selection), { code: "BOOKMARK_REF" });
  const excluded = structuredClone(bundle);
  excluded.questions.find((q) => refKey(refOf(q)) === refKey(row.linked[0].baseQuestionRef))!.distribution = "excluded";
  assert.throws(() => selectQuestions(excluded, selection), { code: "BOOKMARK_REF" });
  assert.throws(() => schema("exam", { ...prepared.exam, subject: "mixed", mode: "practice", questionCount: 2, timeLimitSeconds: 120, practiceScope: "learning_set" }), { code: "SCHEMA" });
});

test("saved pools allow repeated series but reject added candidates and mismatched scope without changing answers", async () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows,
    group = [rows[0], rows.find((row) => row.original.subject === "B")!],
    outside = rows.find((row) => !group.includes(row))!,
    selection = bookmarkGroupSelection(group.map((row) => makeBookmark(bundle, refOf(row.original)))),
    run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000),
    saved = structuredClone(run);
  const repeated = await appendRunQuestion(run, run.session.entries[0].questionRef, 102000);
  assert.deepEqual(repeated.session.entries[1].questionRef, run.session.entries[0].questionRef);
  assert.notDeepEqual(repeated.instances[1].parameters, run.instances[0].parameters);
  await assert.rejects(appendRunQuestion(run, outside.linked[0].baseQuestionRef, 102000), { code: "REFERENCE" });
  const altered = structuredClone(run);
  altered.set.questionRefs.push(outside.linked[0].baseQuestionRef);
  await assert.rejects(validateRun(altered), { code: "SESSION_CONFIG" });
  const scope = structuredClone(run);
  scope.exam.subject = "A";
  await assert.rejects(validateRun(scope), { code: "SESSION_CONFIG" });
  assert.deepEqual(run, saved);
  const generic: Selection = {
    subject: "mixed", kind: "mix", mode: "endless", bindingMode: "generated_values",
    questionRefs: group.map((row) => row.linked[0].baseQuestionRef),
  };
  const next = startRun(await prepareRun(bundle, generic, {}, 100000), 101000);
  await validateRun(await appendRunQuestion(next, undefined, 102000));
});

test("mixed sets retain reference integrity and require both subjects", async () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows,
    refs = [rows[0], rows.find((row) => row.original.subject === "B")!].map((row) => row.linked[0].baseQuestionRef),
    prepared = selectEndlessQuestions(bundle, refs, "混在する学習群");
  bundle.sets.push(prepared.set);
  bundle.exams.push(prepared.exam);
  await validateBundle(bundle);
  const missing = structuredClone(bundle);
  missing.sets.at(-1)!.questionRefs.push({ questionId: "missing", revision: 1 });
  await assert.rejects(validateBundle(missing), { code: "REFERENCE" });
  const single = structuredClone(bundle);
  single.sets.at(-1)!.questionRefs = [refs[0]];
  await assert.rejects(validateBundle(single), { code: "SUBJECT" });
});
