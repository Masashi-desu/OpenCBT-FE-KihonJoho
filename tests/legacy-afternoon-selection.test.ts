import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures/legacy-afternoon-main-preservation";
import { refKey, refOf, type Selection } from "../src/core/types";
import { selectedCollectionQuestions, validateQuestionSelection } from "../src/core/question-selection";
import { selectQuestions } from "../src/core/selection";
import { prepareRun, validateRun } from "../src/core/session";
import { chooseMenuSourceGroup, menuSourceGroups, patchMenuSelection } from "../src/core/menu-selection";
import { latestLearningSelection } from "../src/core/question-updates";

// Metadata-only synthetic booklet. These questions are never admitted to the
// catalog. The independent policy expectation is the 2017 spring cover:
// mandatory 1/8, four from 2..7, one from 9..13; 13:00..15:30 (150 minutes).
function sample() {
  const bundle = fixture();
  const sourceSet = bundle.sets.find(set => set.id === "set-annual-2026-b")!;
  const original = bundle.questions.find(q => refKey(refOf(q)) === refKey(sourceSet.questionRefs[0]))!;
  const refs = Array.from({ length: 13 }, (_, index) => {
    const question = structuredClone(original);
    question.id = `synthetic-pm-${index + 1}`;
    question.learning.tags = ["synthetic-selective-afternoon"];
    question.origin.sourceRefs = question.origin.sourceRefs.map(ref => ({ ...ref,
      locator: { ...ref.locator, year: 2017, period: "春期", timeSlot: "午後", questionNumber: String(index + 1) } }));
    bundle.questions.push(question);
    const base = structuredClone(question); base.id += "-base";
    base.origin.kind = "official_adaptation"; base.origin.isModified = true; base.origin.derivedFrom = [refOf(question)];
    bundle.questions.push(base);
    const template = structuredClone(bundle.templates[0]);
    template.id = `synthetic-template-${index + 1}`; template.baseQuestionRef = refOf(base);
    bundle.templates.push(template);
    return refOf(question);
  });
  const collection = structuredClone(sourceSet);
  collection.id = "set-synthetic-2017-spring-pm";
  collection.title = "2017年度 春期 午後（合成検証資料）";
  collection.questionRefs = refs;
  collection.questionSelection = { requiredQuestionRefs: [refs[0], refs[7]], optionalGroups: [
    { id: "general", label: "問2〜7", questionRefs: refs.slice(1, 7), choose: 4 },
    { id: "language", label: "問9〜13", questionRefs: refs.slice(8), choose: 1 },
  ], sourceRefs: [original.origin.sourceRefs[0]], excessPolicy: "paper_order" };
  const practice = structuredClone(bundle.exams.find(exam => exam.subject === "B" && exam.mode === "practice")!);
  practice.id = "exam-synthetic-pm-practice"; practice.questionCount = 7; practice.timeLimitSeconds = 9000;
  bundle.exams.push(practice);
  collection.examConfigRefs = [{ id: practice.id, revision: practice.revision }];
  bundle.sets.push(collection);
  const selection: Selection = { subject: "B", kind: "annual", sourceCollectionId: collection.id,
    mode: "practice", size: "public", bindingMode: "original_data" };
  return { bundle, collection, refs, selection };
}

test("all 75 legal selections issue exactly the seven specified majors, in paper order, with the source duration", () => {
  const { bundle, collection, refs, selection } = sample();
  bundle.questions.reverse(); // JSON pack order is independent of paper order.
  let count = 0;
  // An independent combination enumerator, not the runtime group counter.
  for (let omitted1 = 2; omitted1 <= 7; omitted1++) for (let omitted2 = omitted1 + 1; omitted2 <= 7; omitted2++) {
    for (let language = 9; language <= 13; language++) {
      const numbers = [1, ...[2, 3, 4, 5, 6, 7].filter(n => n !== omitted1 && n !== omitted2), 8, language];
      const chosenRefs = numbers.map(n => refs[n - 1]);
      const out = selectQuestions(bundle, { ...selection, selectedQuestionRefs: [...chosenRefs].reverse() }, a => [...a].reverse());
      assert.deepEqual(out.questions.map(refOf), chosenRefs);
      assert.equal(out.exam.questionCount, 7); assert.equal(out.exam.timeLimitSeconds, 9000);
      assert.equal(out.exam.questionOrder, "set"); assert.equal(out.set.questionSelection, undefined);
      const mix = selectQuestions(bundle, { ...selection, kind: "mix", sourceCollectionId: undefined,
        mixProfileCollectionId: collection.id, bindingMode: "generated_values", selectedQuestionRefs: chosenRefs }, a => [...a].reverse());
      assert.deepEqual(mix.questions.map(q => q.origin.derivedFrom[0]), chosenRefs);
      assert.deepEqual(mix.set.questionRefs, mix.questions.map(refOf));
      assert.equal(mix.exam.questionCount, 7); assert.equal(mix.exam.timeLimitSeconds, 9000);
      assert.equal(mix.exam.questionOrder, "set"); count++;
    }
  }
  assert.equal(count, 75);
  const study = selectQuestions(bundle, { ...selection, mode: "study" });
  assert.deepEqual(study.questions.map(refOf), refs);
  assert.equal(study.exam.timeLimitSeconds, undefined);
});

test("missing/duplicate/excess/foreign/stale selections are rejected, and groups must cover the full booklet", () => {
  const { bundle, collection, refs, selection } = sample();
  const valid = [0, 1, 2, 3, 4, 7, 8].map(index => refs[index]);
  for (const bad of [undefined, [], valid.slice(1), [...valid, refs[5]], [...valid, refs[9]], [...valid, valid[0]],
    [...valid.slice(0, -1), { questionId: "absent", revision: 1 }],
    [...valid.slice(0, -1), { ...refs[8], revision: refs[8].revision + 1 }]]) {
    assert.throws(() => selectedCollectionQuestions(bundle, collection, { ...selection, selectedQuestionRefs: bad }), { code: "QUESTION_SELECTION" });
  }
  assert.throws(() => selectedCollectionQuestions(bundle, collection, { ...selection, mode: "study", selectedQuestionRefs: valid }), { code: "QUESTION_SELECTION" });
  for (const mutate of [
    () => { collection.questionSelection!.optionalGroups[0].questionRefs.pop(); },
    () => { collection.questionSelection!.optionalGroups[0].choose = 7; },
    () => { collection.questionSelection!.requiredQuestionRefs.push(refs[1]); },
    () => { collection.questionRefs[0] = collection.questionRefs[1]; },
    () => { collection.questionSelection!.optionalGroups[1].questionRefs[4] = { questionId: "absent", revision: 1 }; },
  ]) {
    const before = structuredClone(collection); mutate();
    assert.throws(() => validateQuestionSelection(bundle, collection), { code: "QUESTION_SELECTION" });
    Object.assign(collection, before);
  }
});

test("saved timed annual runs keep their exact selection and reject a changed or expanded selection", async () => {
  const { bundle, refs, selection } = sample();
  const run = await prepareRun(bundle, { ...selection, selectedQuestionRefs: [0, 1, 2, 3, 4, 7, 12].map(index => refs[index]) }, {});
  await validateRun(run);
  assert.equal(run.issued.length, 7); assert.equal(run.bundle.sets.find(set => set.id === selection.sourceCollectionId)!.questionRefs.length, 13);
  const changed = structuredClone(run);
  changed.selection.selectedQuestionRefs![6] = refs[11];
  await assert.rejects(validateRun(changed), { code: "SESSION_CONFIG" });
  const expanded = structuredClone(run);
  expanded.selection.selectedQuestionRefs!.push(refs[10]);
  await assert.rejects(validateRun(expanded), { code: "QUESTION_SELECTION" });
});

test("changing collection, mode, or entering endless clears booklet choices without altering the saved run", () => {
  const { bundle, collection, refs, selection } = sample();
  const current = { ...selection, selectedQuestionRefs: [refs[0], refs[7]] };
  assert.deepEqual(patchMenuSelection(bundle, current, { subject: "B" }, current).selection.selectedQuestionRefs, current.selectedQuestionRefs);
  assert.deepEqual(patchMenuSelection(bundle, current, { kind: "annual" }, current).selection.selectedQuestionRefs, current.selectedQuestionRefs);
  assert.equal(chooseMenuSourceGroup(menuSourceGroups(bundle), current, collection.id).selectedQuestionRefs, undefined);
  assert.equal(patchMenuSelection(bundle, current, { mode: "study" }, current).selection.selectedQuestionRefs, undefined);
  assert.equal(patchMenuSelection(bundle, current, { mode: "endless" }, current).selection.selectedQuestionRefs, undefined);
  assert.equal(current.selectedQuestionRefs.length, 2);
  const replacement = latestLearningSelection({ selection: current }, bundle);
  assert.equal(replacement.mode, "study"); assert.equal(replacement.selectedQuestionRefs, undefined);
  assert.equal(selectQuestions(bundle, replacement).questions.length, 13);
});
