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
  assert.deepEqual(groups.map(g => g.title), ["2026年度 公開問題", "2025年度 公開問題", "2024年度 公開問題", "2023年度 公開問題", "2022年12月公表 サンプル問題", "2022年4月公表 サンプル問題", "旧制度 · 2019年度 秋期", "旧制度 · 2019年度 春期", "旧制度 · 2018年度 秋期", "旧制度 · 2018年度 春期", "旧制度 · 2017年度 秋期", "旧制度 · 2017年度 春期", "旧制度 · 2016年度 春期"]);
  const all = [...sourceCollections(b, "A"), ...sourceCollections(b, "B")];
  assert.equal(all.length, 24); // Four A/B publications, three samples, six AM/PM pairs and the2016spring AM booklet.
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
    q.origin.sourceRefs[0].locator = { section: "synthetic menu position", exam: "基本情報技術者試験", year: 2011, period, timeSlot: slot, questionNumber: "1" };
    b.questions.push(q);
    const exam = { ...b.exams[0], id: `exam-${q.id}`, mode: "practice" as const, timeLimitSeconds: 9000 };
    b.exams.push(exam);
    const set = structuredClone(b.sets.find(s => s.id === `set-annual-2026-${subject.toLowerCase()}`)!);
    set.id = `set-${q.id}`; set.title = `2011年度 ${period} ${slot}`; set.questionRefs = [refOf(q)];
    set.examConfigRefs = [{ id: exam.id, revision: exam.revision }]; b.sets.push(set);
  }
  return b;
}

test("legacy menu choices group AM/PM by year and period while issuing each exact booklet with its own count/time", () => {
  const b = withLegacySets(), groups = menuSourceGroups(b), legacy = groups.filter(g => g.timeSlots);
  assert.equal(legacy.length, 10);
  assert.equal(new Set(legacy.map(g => g.id)).size, 10);
  const synthetic = legacy.filter(group => group.collections.every(collection => collection.id.startsWith("set-question-menu-test-")));
  assert.equal(synthetic.length, 3);
  // All thirteen actual booklets coexist with six synthetic controls. Only menu
  // choices are grouped; spring, autumn and special exams remain separate.
  const actualBooklets = legacy.filter(group => !synthetic.includes(group));
  assert.equal(actualBooklets.length, 7);
  assert.deepEqual(actualBooklets.map(group => [group.year, group.period, group.collections[0].questionRefs.length]), [
    [2019, "秋期", 78], [2019, "春期", 77], [2018, "秋期", 78], [2018, "春期", 77], [2017, "秋期", 79], [2017, "春期", 78], [2016, "春期", 75],
  ]);
  const pairedBooklets=actualBooklets.filter(group=>group.collections.length===2);
  assert.equal(pairedBooklets.length,6);
  for (const group of pairedBooklets) {
    const [morning, afternoon] = group.collections;
    assert.deepEqual(group.timeSlots, { A: "午前", B: "午後" });
    assert.equal(afternoon.questionRefs.length, 13);
    assert.deepEqual(menuSubjectOptions(group).map(o => [o.subject, o.title, o.available]), [
      ["A", "旧制度・午前", true], ["B", "旧制度・午後", true],
    ]);
    const next = chooseMenuSourceGroup(groups, initial, group.id);
    const selected = selectQuestions(b, { ...next, mode: "practice" }, a => a);
    assert.equal(selected.exam.timeLimitSeconds, 9000, "official 150-minute limit is independent of the admitted subset size");
    assert.equal(selected.questions.length, morning.questionRefs.length);
    assert.deepEqual(selected.questions.map(refOf), morning.questionRefs);
    assert(selected.questions.every(question => question.origin.sourceRefs[0].locator.timeSlot === "午前"));

    const pm = patchMenuSelection(b, next, { subject: "B" }, initial).selection;
    assert.equal(pm.sourceCollectionId, afternoon.id);
    assert.equal(menuSourceGroup(groups, pm)?.id, group.id);
    assert.deepEqual(selectQuestions(b, pm, a => a).questions.map(refOf), afternoon.questionRefs);
    const selectedQuestionRefs = [1, 2, 3, 4, 5, 8, 9].map(number => afternoon.questionRefs[number - 1]);
    const timed = selectQuestions(b, { ...pm, mode: "practice", selectedQuestionRefs }, a => a);
    assert.equal(timed.questions.length, 7); assert.equal(timed.exam.timeLimitSeconds, 9000);
    assert.deepEqual(timed.questions.map(refOf), selectedQuestionRefs);

    const savedPm = { ...pm, mode: "practice" as const, selectedQuestionRefs };
    const back = patchMenuSelection(b, savedPm, { subject: "A" }, initial).selection;
    assert.equal(back.sourceCollectionId, morning.id); assert.equal(back.selectedQuestionRefs, undefined);
    assert.deepEqual(savedPm.selectedQuestionRefs, selectedQuestionRefs, "changing the menu does not rewrite the saved PM selection");
    const mixPm = patchMenuSelection(b, pm, { kind: "mix" }, initial).selection;
    assert.equal(mixPm.mixProfileCollectionId, afternoon.id);
    const mixAm = patchMenuSelection(b, mixPm, { subject: "A" }, initial).selection;
    assert.equal(mixAm.mixProfileCollectionId, morning.id); assert.equal(mixAm.sourceCollectionId, undefined);
  }
  const onlyMorning=actualBooklets.filter(group=>group.collections.length===1);
  assert.equal(onlyMorning.length,1);const group=onlyMorning[0],morning=group.collections[0];
  assert.deepEqual([group.year,group.period,morning.id],[2016,'春期','set-annual-2016h28h-fe-am']);
  assert.deepEqual(group.timeSlots,{A:'午前'});
  assert.deepEqual(menuSubjectOptions(group).map(o=>[o.subject,o.title,o.available]),[['A','旧制度・午前',true],['B','旧制度・午後',false]]);
  for(const kind of['annual','mix']as const){
    const next=chooseMenuSourceGroup(groups,{...initial,kind},group.id),saved=structuredClone(next);
    assert.equal(next.subject,'A');assert.equal(next[kind==='annual'?'sourceCollectionId':'mixProfileCollectionId'],morning.id);
    assert.equal(menuSourceGroup(groups,next),group);
    const selected=selectQuestions(b,{...next,mode:'practice'},a=>a);
    assert.equal(selected.questions.length,75);assert.equal(selected.exam.timeLimitSeconds,9000);
    assert(selected.questions.every(q=>q.origin.sourceRefs.some(r=>r.locator.year===2016&&r.locator.period==='春期'&&r.locator.timeSlot==='午前')));
    if(kind==='annual')assert.deepEqual(selected.questions.map(refOf),morning.questionRefs);
    assert.throws(()=>chooseMenuSourceGroup(groups,next,group.id,'B'),{code:'SOURCE_COLLECTION'});
    assert.throws(()=>patchMenuSelection(b,next,{subject:'B'},initial),{code:'SOURCE_COLLECTION'});
    assert.deepEqual(next,saved,'unavailable PM selection cannot rewrite the saved concrete morning choice');
  }
  assert.deepEqual(synthetic.map(group => group.period), ["秋期", "特別試験", "春期"]);
  for (const group of synthetic) {
    assert.equal(group.collections.length, 2); assert(group.title.startsWith("旧制度 · 2011年度"));
    assert.equal(menuSubjectNotice(group), undefined);
    assert.equal(menuSubjectNotice({ ...group, year: 2022 }), undefined, "year alone cannot identify a sample");
    for (const subject of ["A", "B"] as const) {
      const next = chooseMenuSourceGroup(groups, initial, group.id, subject);
      const selected = selectQuestions(b, { ...next, mode: "practice" }, a => a);
      assert.equal(selected.exam.timeLimitSeconds, 9000);
      assert.deepEqual(selected.questions.map(refOf), group.collections.find(c => c.subject === subject)!.questionRefs);
      assert.equal(selected.questions[0].origin.sourceRefs[0].locator.timeSlot, group.timeSlots![subject]);
    }
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

test("a legacy period with only one published booklet disables the missing section and preserves saved concrete IDs", () => {
  for (const missing of ["A", "B"] as const) {
    const b = fixture(), existing = menuSourceGroups(b).find(g => g.year === 2019 && g.period === "秋期")!;
    const missingId = existing.collections.find(c => c.subject === missing)!.id;
    b.sets = b.sets.filter(c => c.id !== missingId);
    const groups = menuSourceGroups(b), group = groups.find(g => g.year === 2019 && g.period === "秋期")!;
    assert.equal(group.collections.length, 1);
    assert.deepEqual(menuSubjectOptions(group).map(o => [o.title, o.available]), [
      ["旧制度・午前", missing !== "A"], ["旧制度・午後", missing !== "B"],
    ]);
    const next = chooseMenuSourceGroup(groups, initial, group.id);
    assert.equal(next.sourceCollectionId, group.collections[0].id);
    assert.equal(menuSourceGroup(groups, next), group);
    assert.throws(() => chooseMenuSourceGroup(groups, next, group.id, missing), { code: "SOURCE_COLLECTION" });
  }
});

test("ambiguous legacy editions and incomplete or conflicting source positions never merge AM/PM by year alone", () => {
  for (const change of ["duplicate", "missing-exam", "conflicting-period"] as const) {
    const b = fixture(), original = menuSourceGroups(b).find(g => g.year === 2019 && g.period === "秋期")!;
    const morning = original.collections.find(c => c.subject === "A")!;
    if (change === "duplicate") {
      const extra = structuredClone(morning); extra.id += "-another-edition"; b.sets.push(extra);
    } else if (change === "missing-exam") {
      for (const ref of morning.questionRefs) for (const source of b.questions.find(q => q.id === ref.questionId)!.origin.sourceRefs)
        delete source.locator.exam;
    } else {
      b.questions.find(q => q.id === morning.questionRefs[1].questionId)!.origin.sourceRefs[0].locator.period = "春期";
    }
    const choices = menuSourceGroups(b).filter(g => g.year === 2019 && g.period === "秋期");
    assert.equal(choices.length, change === "duplicate" ? 3 : 2);
    assert(choices.every(g => g.collections.length === 1));
    assert.deepEqual(choices.flatMap(g => g.collections.map(c => c.id)).sort(),
      [...original.collections.map(c => c.id), ...(change === "duplicate" ? [morning.id + "-another-edition"] : [])].sort());
  }
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
