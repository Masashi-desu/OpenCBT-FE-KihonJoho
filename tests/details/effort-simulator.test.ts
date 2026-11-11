import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture, installFixtureGenerators } from "../fixtures";
import { bindQuestion } from "../../src/core/generation";
import { contentHash } from "../../src/core/hash";
import { loadDetailPackage } from "../../src/core/detailed-explanation";
import { makeBookmark } from "../../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../../src/core/session";

const root = "public/explanations/ipa-2019-spring-am-54/", sandbox: any = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(root + "effort-engine.js", "utf8"), sandbox);
const E = sandbox.window.EffortEngine, plain = (v: any) => JSON.parse(JSON.stringify(v));
await installFixtureGenerators();

// Count work one program at a time, then add each extra coding-sized workload.
// Find the first sufficient integer staffing level; no simulator/ceil reused.
function reference(d: Record<string, number>) {
  let coding = 0;
  for (let i = 0; i < 3; i++) for (let p = 0; p < d[`count${i}`]; p++) coding += d[`unit${i}`];
  let total = coding;
  for (let batch = 0; batch < d.other; batch++) total += coding;
  let people = 1;
  while (people * d.days < total) people++;
  return { coding, extra: total - coding, total, people };
}
test("official Q54 quantities, extra eight workloads and all four staffing choices agree independently", () => {
  const m = E.solve(E.defaults), expected = reference(E.defaults);
  for (const k of Object.keys(expected)) assert.equal(m[k], expected[k as keyof typeof expected]);
  assert.deepEqual(plain(m.rows.map((r: any) => r.effort)), [20, 30, 45]);
  assert.equal(m.total, 855); assert.equal(m.people, 9); assert.equal(m.remainder, 0);
  assert.deepEqual(plain(E.choices().map((c: any) => E.compare(m, c.value).kind)), ["short", "minimum", "extra", "extra"]);
  assert.equal(m.shortage, 95); assert.equal(m.surplus, 0);
});
test("edited conditions cover exact division, nonzero remainder and minimum-one-person boundaries", () => {
  for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) for (let c = 1; c <= 4; c++)
    for (const other of [0, 1, 8, 20]) for (const days of [1, 2, 3, 7, 95, 9999]) {
      const data = { count0: a, unit0: b, count1: b, unit1: c, count2: c, unit2: a, other, days }, m = E.solve(data), r = reference(data);
      for (const k of Object.keys(r)) assert.equal(m[k], r[k as keyof typeof r]);
      assert.equal(m.whole * days + m.remainder, r.total); assert(m.remainder >= 0 && m.remainder < days);
      assert(m.lower < r.total && m.capacity >= r.total); assert.equal(m.shortage, r.total - m.lower); assert.equal(m.surplus, m.capacity - r.total);
    }
  const large = E.solve({ count0: 999, unit0: 999, count1: 999, unit1: 999, count2: 999, unit2: 999, other: 20, days: 1 });
  assert.equal(BigInt(large.total), 3n * 999n * 999n * 21n); assert.equal(large.people, large.total);
  for (const key of E.keys) for (const value of ["", "-1", "1.5", "NaN", "1e2", "0x10", Infinity, null, key === "other" ? 21 : key === "days" ? 10000 : 1000]) assert.throws(() => E.solve({ ...E.defaults, [key]: value }));
  for (const key of E.keys.filter((k: string) => k !== "other")) assert.throws(() => E.solve({ ...E.defaults, [key]: 0 }));
});
test("all 27 saved generated inputs restore table values, displayed choice order and unique minimum without mutation", async () => {
  const bundle = fixture(), t = bundle.templates.find(t => t.id === "template-source-2019h31h-fe-am-54")!, base = bundle.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  for (let scale = 1; scale <= 3; scale++) for (let dayIndex = 0; dayIndex <= 2; dayIndex++) for (let other = 7; other <= 9; other++) {
    const values = [scale, dayIndex, other], q = bindQuestion(base, t, values, "effort-content", "2026-11-05T00:00:00Z");
    const context = { question: q, generation: { generatorRef: t.generatorRef, parameters: { values } }, choiceOrder: [...q.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) }, before = JSON.stringify(context);
    const d = E.initialState(context), m = E.solve(d), r = reference(d), choices = E.choices(context);
    assert.deepEqual(plain(d), { count0: scale * 20, unit0: 1, count1: scale * 10, unit1: 3, count2: scale * 5, unit2: 9, other, days: [85, 95, 105][dayIndex] });
    const table = q.prompt.blocks.find(b => b.type === "table"); assert(table?.type === "table");
    assert.deepEqual(table.rows, plain(m.rows.map((r: any) => [r.name, String(r.count), String(r.unit)])));
    assert(q.prompt.blocks.some(b => b.type === "paragraph" && b.text.includes(`工数の${d.other}倍`)));
    assert.equal(m.people, r.people); assert.equal(m.total, r.total);
    const minimum = choices.filter((c: any) => c.value * d.days >= r.total && (c.value - 1) * d.days < r.total);
    assert.equal(minimum.length, 1); assert.equal(minimum[0].id, q.correctAnswer.choiceId);
    for (const c of choices) { assert.equal(c.value, Number((q.choices.find(row => row.id === c.id)!.content.blocks[0] as any).text)); assert.equal(E.compare(m, c.value).kind === "minimum", c.id === q.correctAnswer.choiceId); }
    E.solve({ ...d, days: 100 }); assert.equal(JSON.stringify(context), before); assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
  }
  for (const values of [[], [0, 0, 7], [1, 3, 8], [1, 0, 10], [1.5, 0, 8], [1, 0, 8, 1]]) assert.throws(() => E.initialState({ generation: { generatorRef: t.generatorRef, parameters: { values } } }));
  assert.throws(() => E.initialState({ generation: { generatorRef: { ...t.generatorRef, version: "unknown" }, parameters: { values: [1, 1, 8] } } }));
  assert.throws(() => E.choices({ choiceOrder: [{ id: "missing", label: "ア" }] }));
});
test("managed effort package pins all bytes, common colors and Q54 source/rights", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019h31h-fe-am-54")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://effort.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7);
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2019h31h-stage1-core", "rights-original"]);
  assert.equal(pkg.manifest.attribution.sourceRefs[0].locator.page, 24);
  assert(pkg.manifest.attribution.sourceRefs.every(ref => ref.locator.questionNumber === "54"));
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});
test("current saved runs keep answers; incompatible references reject resume and bookmarks resolve the latest lesson", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019h31h-fe-am-54")!;
  assert.equal(q.revision, 2); assert.equal(makeBookmark(b, { questionId: q.id, revision: 1 }, 0).questionRef.revision, 2);
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: q.id, revision: q.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run), hash = await contentHash(run.issued[0]); await validateRun(run);
  assert.equal(JSON.stringify(run), before); assert.equal(await contentHash(run.issued[0]), hash);
  const old = structuredClone(run); old.issued[0].revision--; await assert.rejects(() => validateRun(old));
});
