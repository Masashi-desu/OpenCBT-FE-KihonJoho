import test, { before } from "node:test";
import assert from "node:assert/strict";
import { fixture, installFixtureGenerators } from "./fixtures";
import { refOf, refKey, type Bundle, type Selection } from "../src/core/types";
import { mixProfile, scaleAreaCounts } from "../src/core/mix-profile";
import { selectQuestions } from "../src/core/selection";
import { menuSourceGroups, menuSourceGroup, chooseMenuSourceGroup, menuSubjectOptions, patchMenuSelection } from "../src/core/menu-selection";
import { prepareRun, validateRun, startRun, updateAnswer, finishRun } from "../src/core/session";

const initial: Selection = { subject: "A", kind: "mix", year: 2026, mode: "study", size: "public", bindingMode: "generated_values" };
const select = (id: string, subject: "A" | "B", size: "public" | "full" = "public"): Selection =>
  ({ ...initial, subject, year: undefined, mixProfileCollectionId: id, size });

test("every included publication provides its actual finite mix count and independently fixed area profile", () => {
  const b = fixture();
  const expected = [
    ["set-annual-2026-a", "A", 20, { technology: 12, management: 3, strategy: 5 }],
    ["set-annual-2025-a", "A", 20, { technology: 13, management: 2, strategy: 5 }],
    ["set-annual-2024-a", "A", 20, { technology: 12, management: 3, strategy: 5 }],
    ["set-annual-2023-a", "A", 20, { technology: 12, management: 3, strategy: 5 }],
    ["set-sample-2022-dec-a", "A", 60, { technology: 41, management: 7, strategy: 12 }],
    ["set-annual-2026-b", "B", 6, { algorithm: 5, security: 1 }],
    ["set-annual-2025-b", "B", 5, { algorithm: 5 }],
    ["set-annual-2024-b", "B", 6, { algorithm: 5, security: 1 }],
    ["set-annual-2023-b", "B", 6, { algorithm: 5, security: 1 }],
    ["set-sample-2022-dec-b", "B", 20, { algorithm: 16, security: 4 }],
    ["set-sample-2022-apr-b", "B", 6, { algorithm: 5, security: 1 }],
  ] as const;
  for (const [id, subject, count, quota] of expected) {
    const s = select(id, subject), profile = mixProfile(b, s), out = selectQuestions(b, s, a => a);
    assert.equal(profile.publicCount, count); assert.equal(out.questions.length, count);
    assert.deepEqual(profile.quota, quota);
    assert.deepEqual(out.questions.reduce((r, q) => (r[q.learning.area] = (r[q.learning.area] ?? 0) + 1, r), {} as Record<string, number>), quota);
    assert(out.set.title.includes(b.sets.find(set => set.id === id)!.title));
    const full = mixProfile(b, { ...s, size: "full" });
    assert.equal(full.questionCount, subject === "A" ? 60 : 20);
    if (subject === "B") assert.deepEqual(full.quota, { algorithm: 16, security: 4 });
  }
});

test("both set kinds share all publications, retain April/December identities, and constrain the same subjects", () => {
  const b = fixture(), groups = menuSourceGroups(b);
  let s = chooseMenuSourceGroup(groups, initial, "set-sample-2022-apr-b");
  assert.equal(s.kind, "mix"); assert.equal(s.mixProfileCollectionId, "set-sample-2022-apr-b");
  assert.equal(s.sourceCollectionId, undefined); assert.equal(s.year, undefined); assert.equal(s.subject, "B");
  assert.deepEqual(menuSubjectOptions(menuSourceGroup(groups, s)).map(o => [o.subject, o.available]), [["A", false], ["B", true]]);
  assert.throws(() => patchMenuSelection(b, s, { subject: "A" }, initial), { code: "SOURCE_COLLECTION" });
  s = patchMenuSelection(b, s, { kind: "annual" }, initial).selection;
  assert.equal(s.sourceCollectionId, "set-sample-2022-apr-b"); assert.equal(s.mixProfileCollectionId, undefined);
  s = patchMenuSelection(b, s, { kind: "mix" }, initial).selection;
  assert.equal(s.mixProfileCollectionId, "set-sample-2022-apr-b");
  const endless = patchMenuSelection(b, s, { mode: "endless" }, initial);
  assert.equal(endless.selection.mixProfileCollectionId, undefined);
  const changed = patchMenuSelection(b, endless.selection, { subject: "A" }, endless.finite);
  const restored = patchMenuSelection(b, changed.selection, { mode: "practice" }, changed.finite).selection;
  assert.equal(restored.subject, "B"); assert.equal(restored.mixProfileCollectionId, s.mixProfileCollectionId);
  const december = chooseMenuSourceGroup(groups, restored, "set-sample-2022-dec-a");
  const a = patchMenuSelection(b, december, { subject: "A" }, initial).selection;
  assert.equal(a.mixProfileCollectionId, "set-sample-2022-dec-a"); assert.equal(selectQuestions(b, a).questions.length, 60);
  const unknown = { ...a, mixProfileCollectionId: "missing-profile" };
  assert.equal(menuSourceGroup(groups, unknown), undefined);
  assert.throws(() => selectQuestions(b, unknown), { code: "MIX_PROFILE" });
});

/** Synthetic metadata only: exercises future variable sizes without admitting
 * any new source, generator, or old afternoon transcription to distribution. */
function addVariableBook(b: Bundle, subject: "A" | "B", areaList: string[], slot?: "午前" | "午後", seconds = 730) {
  const source = b.questions.find(q => q.id === `question-ipa-2026-${subject.toLowerCase()}-1`)!;
  const originalBase = b.questions.find(q => q.origin.derivedFrom.some(r => refKey(r) === refKey(refOf(source))))!;
  const originalTemplate = b.templates.find(t => refKey(t.baseQuestionRef) === refKey(refOf(originalBase)))!;
  const id = `set-test-variable-${subject}-${slot ?? "current"}`, refs = [];
  for (const [i, area] of areaList.entries()) {
    const original = structuredClone(source), base = structuredClone(originalBase), template = structuredClone(originalTemplate);
    original.id = `question-${id}-${i}`; original.learning.tags = []; original.learning.area = area;
    original.origin.sourceRefs[0].locator = { section: "synthetic menu fixture", year: 2011, period: "特別試験", timeSlot: slot, questionNumber: String(i + 1) };
    base.id = `base-${id}-${i}`; base.learning.area = area; base.learning.tags = [];
    base.origin.sourceRefs = structuredClone(original.origin.sourceRefs); base.origin.derivedFrom = [refOf(original)];
    template.id = `template-${id}-${i}`; template.baseQuestionRef = refOf(base);
    b.questions.push(original, base); b.templates.push(template); refs.push(refOf(original));
  }
  const set = structuredClone(b.sets.find(set => set.id === `set-annual-2026-${subject.toLowerCase()}`)!);
  set.id = id; set.title = `2011年度 特別試験 ${slot ?? subject}（合成資料）`; set.questionRefs = refs;
  const study = { ...structuredClone(b.exams.find(e => e.mode === "study" && e.subject === subject)!), id: `exam-${id}-study`, questionCount: refs.length };
  const practice = { ...structuredClone(b.exams.find(e => e.mode === "practice" && e.subject === subject)!), id: `exam-${id}-practice`, questionCount: refs.length, timeLimitSeconds: seconds };
  b.exams.push(study, practice); set.examConfigRefs = [study, practice].map(e => ({ id: e.id, revision: e.revision })); b.sets.push(set);
  return set;
}

test("variable A7/B9, old morning80 and afternoon13 derive counts and configured times without current-format mixing", () => {
  const b = fixture();
  for (const [subject, list, slot, seconds] of [
    ["A", ["technology", "technology", "technology", "management", "management", "strategy", "strategy"], undefined, 730],
    ["B", [...Array(6).fill("algorithm"), ...Array(3).fill("security")], undefined, 870],
    ["A", Array(80).fill("technology"), "午前", 9000],
    ["B", [...Array(8).fill("algorithm"), ...Array(5).fill("security")], "午後", 9000],
  ] as const) {
    const set = addVariableBook(b, subject, [...list], slot, seconds);
    const s = { ...select(set.id, subject), mode: "practice" as const };
    const out = selectQuestions(b, s, a => a);
    assert.equal(out.questions.length, list.length); assert.equal(out.exam.timeLimitSeconds, seconds);
    const annual = selectQuestions(b, { ...s, kind: "annual", sourceCollectionId: set.id, mixProfileCollectionId: undefined });
    assert.equal(annual.questions.length, list.length); assert.equal(annual.exam.timeLimitSeconds, seconds);
    if (slot) {
      assert.equal(out.set.questionRefs.length, list.length);
      assert(out.questions.every(q => q.origin.derivedFrom.some(r => set.questionRefs.some(owned => refKey(owned) === refKey(r)))));
      assert.throws(() => selectQuestions(b, { ...s, size: "full" }), { code: "PROFILE_SCOPE" });
      const selected = chooseMenuSourceGroup(menuSourceGroups(b), { ...s, size: "full" }, set.id);
      assert.equal(selected.size, "public");
    } else {
      const full = selectQuestions(b, { ...s, size: "full" }, a => a);
      assert.deepEqual(full.quota, subject === "A"
        ? { technology: 26, management: 17, strategy: 17 } : { algorithm: 16, security: 4 });
    }
  }
});

test("area apportionment matches a separate exhaustive integer least-squares reference and keeps deterministic ties", () => {
  for (let t = 1; t <= 4; t++) for (let m = 0; m <= 3; m++) for (let s = 0; s <= 3; s++) {
    const weights = [t, m, s], denominator = t + m + s, total = 17;
    const result = scaleAreaCounts({ technology: t, management: m, strategy: s }, total);
    const actual = [result.technology ?? 0, result.management ?? 0, result.strategy ?? 0];
    const loss = (a: number[]) => a.reduce((sum, n, i) => sum + (n * denominator - weights[i] * total) ** 2, 0);
    let best = Infinity;
    for (let a = 0; a <= total; a++) for (let c = 0; c <= total - a; c++) best = Math.min(best, loss([a, c, total - a - c]));
    assert.equal(actual.reduce((sum, n) => sum + n), total); assert.equal(loss(actual), best);
  }
  assert.deepEqual(scaleAreaCounts({ technology: 1, management: 1 }, 3), { technology: 2, management: 1 });
  const badCounts: Record<string, number>[] = [{}, { technology: -1 }, { technology: 0.1 }, { unknown: 1 }];
  for (const counts of badCounts) assert.throws(() => scaleAreaCounts(counts, 60), { code: "PROFILE" });
});

test("new sample mixes preserve source-profile identity, generated answers, timing and results across JSON save/reopen", async () => {
  const b = fixture();
  for (const [id, subject, count, seconds] of [["set-sample-2022-dec-a", "A", 60, 5400], ["set-sample-2022-dec-b", "B", 20, 6000], ["set-sample-2022-apr-b", "B", 6, 1800]] as const) {
    for (const mode of ["study", "practice"] as const) {
      let run = startRun(await prepareRun(b, { ...select(id, subject), mode }, {}, 100000), 101000);
      assert.equal(run.issued.length, count); assert.equal(run.selection.mixProfileCollectionId, id);
      if (mode === "practice") assert.equal(run.exam.timeLimitSeconds, seconds);
      const answeredIndex = run.issued.findIndex(q => !q.answerParts);
      assert(answeredIndex >= 0); run.session.currentIndex = answeredIndex;
      run = updateAnswer(run, run.issued[answeredIndex].correctAnswer.choiceId, 102000);
      if (mode === "study") {
        run.session.status = "paused"; run.session.pausedAt = new Date(103000).toISOString();
        await validateRun(JSON.parse(JSON.stringify({ ...run, assets: {} })));
        run.session.status = "running"; delete run.session.pausedAt;
      }
      await validateRun(JSON.parse(JSON.stringify({ ...run, assets: {} })));
      const saved = JSON.stringify(run.issued); run = finishRun(run, "completed", 105000);
      await validateRun(JSON.parse(JSON.stringify({ ...run, assets: {} })));
      assert.equal(JSON.stringify(run.issued), saved); assert.equal(run.result!.total, count); assert.equal(run.result!.correct, 1);
      const wrong = structuredClone(run); wrong.selection.mixProfileCollectionId = "missing-profile";
      await assert.rejects(validateRun(wrong), { code: "MIX_PROFILE" });
      const badCount = structuredClone(run); badCount.exam.questionCount = count + 1;
      await assert.rejects(validateRun(badCount), { code: "SESSION_CONFIG" });
    }
  }
});

test("profile provenance rejects unavailable originals and conflicting slots while display-title edits preserve a valid saved run", async () => {
  const b = fixture(), s = select("set-annual-2026-b", "B");
  const unavailable = structuredClone(b);
  unavailable.questions.find(q => q.id === "question-ipa-2026-b-1")!.distribution = "excluded";
  assert.throws(() => selectQuestions(unavailable, s), { code: "MIX_PROFILE" });
  const duplicate = structuredClone(b), collection = duplicate.sets.find(set => set.id === s.mixProfileCollectionId)!;
  collection.questionRefs.push(collection.questionRefs[0]);
  assert.throws(() => selectQuestions(duplicate, s), { code: "MIX_PROFILE" });
  const legacy = addVariableBook(b, "B", Array(3).fill("algorithm"), "午後", 9000);
  b.questions.find(q => refKey(refOf(q)) === refKey(legacy.questionRefs[0]))!.origin.sourceRefs[0].locator.timeSlot = "午前";
  assert.throws(() => selectQuestions(b, select(legacy.id, "B")), { code: "MIX_PROFILE" });
  const run = await prepareRun(fixture(), s, {}, 100000);
  run.set.title = "保存時の表示名"; run.exam.title = "保存時の表示名";
  await validateRun(run); // A wording update does not change the issued practice.
});

test("existing saved year-only mixes retain their issued counts and answers without current profile recomputation", async () => {
  const b = fixture();
  const run = await prepareRun(b, { ...initial, subject: "B", year: 2026 }, {}, 100000);
  run.selection.year = 2025; // Before collection profiles, all B years issued six.
  assert.equal(run.selection.mixProfileCollectionId, undefined); assert.equal(run.issued.length, 6);
  await validateRun(structuredClone(run));
  for (const kind of ["annual", "bookmark"] as const) assert.throws(() => selectQuestions(b, { ...select("set-sample-2022-apr-b", "B"), kind }), { code: "SELECTION" });
  assert.throws(() => selectQuestions(b, { ...select("set-sample-2022-apr-b", "B"), mode: "endless" }), { code: "SELECTION" });
  assert.throws(() => selectQuestions(b, select("set-sample-2022-apr-b", "A")), { code: "MIX_PROFILE" });
});

// Match executable App setup without changing raw shared fixture imports.
before(installFixtureGenerators);
