import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { refOf, type Selection } from "../src/core/types";
import { menuSourceGroups, menuSourceGroup, chooseMenuSourceGroup, menuSubjectOptions, menuSubjectNotice, patchMenuSelection } from "../src/core/menu-selection";
import { sourceCollections } from "../src/core/source-collections";
import { selectQuestions } from "../src/core/selection";
import { prepareRun, validateRun } from "../src/core/session";

const initial: Selection = { subject: "A", kind: "annual", year: 2026, mode: "study", size: "public", bindingMode: "original_data" };

test("the menu lists every publication before subject selection, including the B-only April sample", () => {
  const b = fixture(), groups = menuSourceGroups(b);
  assert.deepEqual(groups.map(g => g.title), ["2026年度 公開問題", "2025年度 公開問題", "2024年度 公開問題", "2023年度 公開問題", "2022年12月公表 サンプル問題", "2022年4月公表 サンプル問題", "旧制度 · 2018年度 春期・午後", "旧制度 · 2017年度 秋期・午後", "旧制度 · 2017年度 春期・午後"]);
  const all = [...sourceCollections(b, "A"), ...sourceCollections(b, "B")];
  assert.equal(all.length, 14); // Four A/B publications, three sample sets, and three old-PM booklets.
  assert.deepEqual(groups.flatMap(g => g.collections.map(c => c.id)).sort(), all.map(c => c.id).sort());
  assert.equal(new Set(groups.flatMap(g => g.collections.map(c => c.id))).size, all.length);
  const partial2025 = groups.find(g => g.collections.some(c => c.id === "set-annual-2025-b"))!;
  assert.equal(partial2025.collections.length, 2, "the B exclusion note does not create another publication");
});

test("choosing a B-only publication changes subject atomically and issues that exact set in source order", async () => {
  const b = fixture(), groups = menuSourceGroups(b);
  const next = chooseMenuSourceGroup(groups, initial, "set-sample-2022-apr-b");
  assert.equal(next.subject, "B"); assert.equal(next.year, undefined);
  assert.equal(next.sourceCollectionId, "set-sample-2022-apr-b");
  const options = menuSubjectOptions(menuSourceGroup(groups, next));
  assert.deepEqual(options.map(o => [o.subject, o.available]), [["A", false], ["B", true]]);
  assert.throws(() => chooseMenuSourceGroup(groups, next, "set-sample-2022-apr-b", "A"), { code: "SOURCE_COLLECTION" });
  const selected = selectQuestions(b, next, a => a), exact = b.sets.find(s => s.id === next.sourceCollectionId)!;
  assert.deepEqual(selected.questions.map(refOf), exact.questionRefs);
  assert.equal(selected.questions.length, 6);
  assert(selected.questions.every(q => q.origin.sourceRefs[0].locator.period === "2022年4月公表 サンプル問題"));
  const run = await prepareRun(b, next, {}, 100000); await validateRun(structuredClone(run));
  assert.equal(run.selection.sourceCollectionId, exact.id);
});

test("switching subjects keeps the chosen December publication instead of selecting the latest year", () => {
  const b = fixture(), groups = menuSourceGroups(b);
  const april = chooseMenuSourceGroup(groups, initial, "set-sample-2022-apr-b");
  const december = chooseMenuSourceGroup(groups, april, "set-sample-2022-dec-a");
  assert.equal(december.sourceCollectionId, "set-sample-2022-dec-b");
  const a = patchMenuSelection(b, december, { subject: "A" }, initial).selection;
  assert.equal(a.sourceCollectionId, "set-sample-2022-dec-a");
  assert.equal(selectQuestions(b, a).questions.length, 60);
  const back = patchMenuSelection(b, a, { subject: "B" }, initial).selection;
  assert.equal(back.sourceCollectionId, "set-sample-2022-dec-b");
  assert.equal(selectQuestions(b, back).questions.length, 20);
});

test("2022 sample publication dates retain current subject names and explain their new-format context in collection-based finite modes", () => {
  const groups = menuSourceGroups(fixture());
  const samples = groups.filter(g => g.collections.some(c => c.id.startsWith("set-sample-2022-")));
  assert.equal(samples.length, 2);
  for (const group of samples) {
    assert.equal(group.year, undefined, "publication date is not an old exam year");
    assert(group.period?.startsWith("2022年"));
    assert(menuSubjectOptions(group).every(o => o.title === `科目${o.subject}`));
    assert(menuSubjectNotice(group));
    assert.equal(menuSubjectNotice(group, false), undefined, "endless must not describe the last selected publication");
  }
  for (const group of groups.filter(g => !samples.includes(g))) assert.equal(menuSubjectNotice(group), undefined);
  assert.equal(menuSubjectNotice(undefined), undefined);
});

function withLegacySets() {
  const b = fixture();
  // Synthetic selection metadata only; no old question transcription/admission.
  for (const period of ["春期", "秋期", "特別試験"]) for (const slot of ["午前", "午後"]) {
    const subject = slot === "午前" ? "A" : "B";
    const q = structuredClone(b.questions.find(q => q.id === `question-ipa-2026-${subject.toLowerCase()}-1`)!);
    q.id = `question-menu-test-${period}-${slot}`; q.learning.tags = [];
    q.origin.sourceRefs[0].locator = { section: "synthetic menu position", year: 2019, period, timeSlot: slot, questionNumber: "1" };
    b.questions.push(q);
    const exam = { ...b.exams[0], id: `exam-${q.id}`, mode: "practice" as const, timeLimitSeconds: 9000 };
    b.exams.push(exam);
    const set = structuredClone(b.sets.find(s => s.id === `set-annual-2026-${subject.toLowerCase()}`)!);
    set.id = `set-${q.id}`; set.title = `2019年度 ${period} ${slot}`; set.questionRefs = [refOf(q)];
    set.examConfigRefs = [{ id: exam.id, revision: exam.revision }]; b.sets.push(set);
  }
  return b;
}

test("legacy morning, afternoon, spring, autumn and special exams remain distinct choices and retain their own labels/time", () => {
  const b = withLegacySets(), groups = menuSourceGroups(b), legacy = groups.filter(g => g.timeSlot);
  assert.equal(legacy.length, 9);
  assert.equal(new Set(legacy.map(g => g.id)).size, 9);
  const synthetic = legacy.filter(group => group.year === 2019);
  assert.equal(synthetic.length, 6);
  // All three actual booklets coexist with all six synthetic controls.
  const actualBooklets = legacy.filter(group => group.year === 2017 || group.year === 2018);
  assert.deepEqual(actualBooklets.map(group => [group.year, group.period]), [[2018, "春期"], [2017, "秋期"], [2017, "春期"]]);
  for (const actual of actualBooklets) {
  assert.equal(actual.timeSlot, "午後");
  assert.equal(actual.collections[0].questionRefs.length, 13);
  const original = chooseMenuSourceGroup(groups, initial, actual.id);
  const full = selectQuestions(b, original, a => a);
  assert.equal(full.questions.length, 13);
  const selectedQuestionRefs = [1, 2, 3, 4, 5, 8, 9].map(number => actual.collections[0].questionRefs[number - 1]);
  const timed = selectQuestions(b, { ...original, mode: "practice", selectedQuestionRefs }, a => a);
  assert.equal(timed.questions.length, 7);
  assert.equal(timed.exam.timeLimitSeconds, 9000);
  assert.deepEqual(timed.questions.map(refOf), selectedQuestionRefs);
  }
  for (const group of synthetic) {
    assert.equal(group.collections.length, 1); assert(group.title.startsWith("旧制度 · 2019年度"));
    const next = chooseMenuSourceGroup(groups, initial, group.id);
    const options = menuSubjectOptions(group);
    assert.equal(options.length, 1); assert.equal(options[0].title, `旧制度・${group.timeSlot}`);
    assert(!options[0].title.includes("科目"));
    assert.equal(menuSubjectNotice(group), undefined);
    assert.equal(menuSubjectNotice({ ...group, year: 2022 }), undefined, "year alone cannot identify a sample");
    const selected = selectQuestions(b, { ...next, mode: "practice" }, a => a);
    assert.equal(selected.exam.timeLimitSeconds, 9000);
    assert.deepEqual(selected.questions.map(refOf), group.collections[0].questionRefs);
    assert.equal(selected.questions[0].origin.sourceRefs[0].locator.timeSlot, group.timeSlot);
  }
});

test("endless subject changes cannot replace a remembered B-only booklet with another publication", () => {
  const b = fixture(), groups = menuSourceGroups(b), april = chooseMenuSourceGroup(groups, initial, "set-sample-2022-apr-b");
  const endless = patchMenuSelection(b, april, { mode: "endless" }, initial);
  assert.equal(endless.selection.sourceCollectionId, undefined);
  const changed = patchMenuSelection(b, endless.selection, { subject: "A" }, endless.finite);
  assert.equal(changed.selection.subject, "A");
  const restored = patchMenuSelection(b, changed.selection, { mode: "practice" }, changed.finite).selection;
  assert.equal(restored.sourceCollectionId, april.sourceCollectionId); assert.equal(restored.subject, "B");
  assert.equal(selectQuestions(b, restored).questions.length, 6);
});

test("an unavailable explicit selection is not silently replaced, and duplicate editions are not merged", () => {
  const b = fixture(), unknown = { ...initial, sourceCollectionId: "set-unavailable" };
  assert.equal(menuSourceGroup(menuSourceGroups(b), unknown), undefined);
  const next = patchMenuSelection(b, unknown, { subject: "B" }, initial).selection;
  assert.equal(next.sourceCollectionId, unknown.sourceCollectionId);
  assert.throws(() => selectQuestions(b, next), { code: "SOURCE_COLLECTION" });
  const extra = structuredClone(b.sets.find(s => s.id === "set-annual-2026-a")!);
  extra.id = "set-test-another-edition"; extra.title += " 別版"; b.sets.push(extra);
  const choices = menuSourceGroups(b).filter(g => g.year === 2026);
  assert.equal(choices.length, 3); assert(choices.every(g => g.collections.length === 1));
  assert.deepEqual(choices.flatMap(g => g.collections.map(c => c.id)).sort(), ["set-annual-2026-a", "set-annual-2026-b", extra.id].sort());
});

test("mix and endless retain their subject pools without a source-collection restriction", () => {
  const b = fixture();
  const mix = patchMenuSelection(b, initial, { kind: "mix", bindingMode: "generated_values" }, initial).selection;
  assert.equal(mix.sourceCollectionId, undefined); assert.equal(selectQuestions(b, mix).questions.length, 20);
  assert(menuSubjectOptions(undefined, false).every(o => o.available));
  const annual = patchMenuSelection(b, mix, { kind: "annual", bindingMode: "original_data" }, initial).selection;
  assert.equal(annual.sourceCollectionId, "set-annual-2026-a");
  assert.equal(selectQuestions(b, annual).questions.length, 20);
});
