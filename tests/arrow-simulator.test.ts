import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture } from "./fixtures";
import { contentHash } from "../src/core/hash";
import { loadDetailPackage } from "../src/core/detailed-explanation";
import { bindQuestion } from "../src/core/generation";
import { makeBookmark } from "../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun, appendRunQuestion } from "../src/core/session";
import type { Bundle, Question, Template, SetRecord } from "../src/core/types";
import previous from "./fixtures/pre-arrow-revisions.json";
import { restorePreRadix } from "./radix-history";

const root = "public/explanations/ipa-2024-a-13/", sandbox: any = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(root + "arrow-engine.js", "utf8"), sandbox);
const engine = sandbox.window.ArrowEngine;
const plain = (value: any) => JSON.parse(JSON.stringify(value, (_k, v) => typeof v === "bigint" ? String(v) : v));

// Fixed, separately reviewed topology from IPA 2024 A Q13 p.6. The oracle
// enumerates every route; it does not use the engine's topological CPM passes.
const topology = [
  ["A", 0, 1], ["B", 1, 2], ["C", 1, 3], ["D", 1, 4],
  ["E", 2, 5], ["F", 3, 5], ["G", 4, 5], ["H", 5, 6],
  ["dummy-upper", 2, 3], ["dummy-lower", 3, 4],
] as const;
function independent(values: Record<string, bigint | number | string>, mask: number) {
  const edges = topology.filter(([id]) => id === "dummy-upper" ? mask & 1 : id === "dummy-lower" ? mask & 2 : true)
    .map(([id, from, to]) => ({ id, from, to, duration: id.startsWith("dummy") ? 0n : BigInt(values[id]) }));
  function routes(from: number, to: number, ids: string[] = [], duration = 0n): { ids: string[]; duration: bigint }[] {
    if (from === to) return [{ ids, duration }];
    return edges.filter(e => e.from === from).flatMap(e => routes(e.to, to, [...ids, e.id], duration + e.duration));
  }
  const maximum = (paths: { duration: bigint }[]) => paths.reduce((max, p) => p.duration > max ? p.duration : max, 0n);
  const all = routes(0, 6), total = maximum(all), early = Array.from({ length: 7 }, (_, i) => maximum(routes(0, i))),
    late = Array.from({ length: 7 }, (_, i) => total - maximum(routes(i, 6)));
  return { edges, early, late, total, paths: all.filter(p => p.duration === total).map(p => p.ids) };
}
function verify(values: Record<string, bigint | number | string>, mask = 3) {
  const r = engine.calculate(values, { "dummy-upper": Boolean(mask & 1), "dummy-lower": Boolean(mask & 2) }), expected = independent(values, mask);
  assert.equal(r.total, expected.total);
  assert.deepEqual(plain(engine.nodes.map((id: string) => r.earliest[id])), expected.early.map(String));
  assert.deepEqual(plain(engine.nodes.map((id: string) => r.latest[id])), expected.late.map(String));
  assert.deepEqual(plain(r.paths).map((p: string[]) => p.join(",")).sort(), expected.paths.map(p => p.join(",")).sort());
  for (const e of expected.edges) {
    const actual = r.edges.find((edge: any) => edge.id === e.id)!;
    assert.equal(actual.es, expected.early[e.from]); assert.equal(actual.ef, expected.early[e.from] + e.duration);
    assert.equal(actual.lf, expected.late[e.to]); assert.equal(actual.ls, expected.late[e.to] - e.duration);
    assert.equal(actual.float, expected.late[e.to] - expected.early[e.from] - e.duration);
    assert.equal(actual.critical, actual.float === 0n);
  }
  for (const e of r.edges) if (!e.enabled) assert.equal(e.critical, false);
  return r;
}

test("original values, dummy direction, earliest/latest times and the official unique answer are independently checked", () => {
  assert.deepEqual(plain(engine.initial), { A: 30, B: 5, C: 30, D: 20, E: 40, F: 25, G: 30, H: 30 });
  const r = verify(engine.initial);
  assert.equal(r.total, 120n);
  assert.deepEqual(plain(r.paths), [["A", "C", "dummy-lower", "G", "H"]]);
  assert.deepEqual(plain(r.earliest), { start: "0", branch: "30", upper: "35", middle: "60", lower: "60", merge: "90", end: "120" });
  assert.deepEqual(plain(r.latest), { start: "0", branch: "30", upper: "50", middle: "60", lower: "60", merge: "90", end: "120" });
  assert.equal(engine.formula(r, "middle"), "max(30 + 30, 35 + 0) = 60日");
  assert.deepEqual(plain(r.edges.filter((e: any) => !e.dummy).map((e: any) => e.float)), ["0", "15", "0", "10", "15", "5", "0", "0"]);
  const q = fixture().questions.find(q => q.id === "question-ipa-2024-a-13")!;
  assert.equal(q.correctAnswer.choiceId, "choice-3");
  assert.equal([105n, 115n, 120n, 125n].filter(value => value === r.total).length, 1);
  assert(q.explanation.blocks.some((b: any) => b.text.includes("120日（ウ）")));
});

test("duration changes, slack threshold, path switches and both independently toggled dummies", () => {
  for (const [id, duration, total, paths] of [["B", 20, 120, 2], ["B", 25, 125, 1], ["B", 45, 145, 1], ["B", 50, 150, 1], ["D", 100, 190, 1], ["F", 90, 180, 1]] as const) {
    const r = verify({ ...engine.initial, [id]: duration }); assert.equal(r.total, BigInt(total)); assert.equal(r.paths.length, paths);
  }
  assert.deepEqual(plain(verify({ ...engine.initial, B: 25 }).paths), [["A", "B", "E", "H"]]);
  assert.equal(verify(engine.initial, 1).total, 115n, "removing middle→lower stops G waiting on C");
  assert.equal(verify({ ...engine.initial, B: 70 }, 3).earliest.middle, 100n);
  assert.equal(verify({ ...engine.initial, B: 70 }, 2).earliest.middle, 60n);
  for (let mask = 0; mask < 4; mask++) verify(engine.initial, mask);
});

test("all 3^8 small integer inputs and all four dependency configurations match every enumerated path and float", () => {
  const ids = Object.keys(engine.initial);
  for (let code = 0; code < 3 ** 8; code++) {
    let remaining = code; const values: Record<string, number> = {};
    for (const id of ids) { values[id] = remaining % 3; remaining = Math.floor(remaining / 3); }
    for (let mask = 0; mask < 4; mask++) verify(values, mask);
  }
  const zero = verify(Object.fromEntries(ids.map(id => [id, 0])));
  assert.equal(zero.paths.length, 6);
});

test("free integer input rejects invalid states and remains exact beyond floating point precision", () => {
  for (const invalid of ["", " ", "-1", "2.5", "1.0", "1e2", "Infinity", "NaN", "bad", "1,000", -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, null, undefined])
    assert.throws(() => engine.parseDays(invalid));
  assert.equal(engine.parseDays(" 0012 "), 12n); assert.equal(engine.parseDays("0"), 0n);
  const huge = 10n ** 60n + 17n;
  const r = verify({ ...engine.initial, A: huge }); assert.equal(r.total, huge + 90n);
  let seed = 73821;
  for (let i = 0; i < 100; i++) {
    const values = Object.fromEntries(Object.keys(engine.initial).map(id => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return [id, seed % 1001]; }));
    verify(values, i % 4);
  }
});

test("step trace follows the active dependencies after duration changes and toggles", () => {
  for (let mask = 0; mask < 4; mask++) {
    const r = engine.calculate({ ...engine.initial, D: 100 }, { "dummy-upper": Boolean(mask & 1), "dummy-lower": Boolean(mask & 2) });
    const trace = engine.steps(r), visited = new Set<string>();
    for (const step of trace) {
      if (step.kind !== "node") continue;
      for (const e of r.incoming[step.node]) assert(visited.has(e.from), `${e.id} is evaluated after its source`);
      visited.add(step.node);
      assert.equal(engine.formula(r, step.node).endsWith(`${r.earliest[step.node]}日`), true);
    }
    assert.equal(visited.size, 7); assert.equal(trace.at(-1).kind, "critical");
    assert.deepEqual(plain(trace.at(-1).edges).sort(), plain(r.edges.filter((e: any) => e.critical).map((e: any) => e.id)).sort());
  }
});

test("generated detail uses saved inputs and the new references preserve older snapshots and bookmark resolution", async () => {
  const b = fixture(), t = b.templates.find(t => t.id === "template-critical-path")!, base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(t.originalContentSha256, await contentHash(base));
  for (const version of ["2.1.0", "2.2.0"]) {
    const values = [15, 25, 35, 45, 20, 10, 50, 60];
    const context = { generation: { generatorRef: { id: "generator-critical-path", version }, parameters: { values } } }, before = JSON.stringify(context);
    const state = engine.initialState(context); assert.equal(state.label, "この問題の保存済み条件");
    assert.deepEqual(plain(Object.values(state.values)), values.map(String)); assert.equal(JSON.stringify(context), before);
  }
  for (const input of [[0, 0, 0, 0, 0, 0, 0, 0], [30, 5, 30, 20, 40, 25, 30, 30], [5, 60, 25, 30, 10, 45, 20, 55]]) {
    if (input.every(v => v > 0)) {
      const generated = bindQuestion(base, t, input, "arrow-test", "2026-10-14T00:00:00Z");
      const r = verify(Object.fromEntries(Object.keys(engine.initial).map((id, i) => [id, input[i]])));
      const answer = generated.choices.find(c => c.id === generated.correctAnswer.choiceId)!;
      assert(answer.content.blocks.some((block: any) => block.text === `${r.total}日`));
      assert.deepEqual(generated.detailedExplanationRef, base.detailedExplanationRef);
    }
  }
  for (const q of Object.values(previous.questions)) {
    const current = b.questions.find(p => p.id === q.id)!;
    assert.deepEqual(current.prompt, q.prompt); assert.deepEqual(current.choices, q.choices); assert.deepEqual(current.correctAnswer, q.correctAnswer);
    assert.equal("detailedExplanationRef" in q, false);
    assert.equal(makeBookmark(b, { questionId: q.id, revision: q.revision }, 0).questionRef.revision, b.questions.find(q => q.id === "question-ipa-2024-a-13")!.revision);
  }
});

test("historical annual and generated runs still validate, resume, append and review without replacing their content", async () => {
  const historical: Bundle = restorePreRadix(fixture());
  for (const [id, q] of Object.entries(previous.questions)) historical.questions[historical.questions.findIndex(q => q.id === id)] = structuredClone(q) as Question;
  historical.templates[historical.templates.findIndex(t => t.id === previous.template.id)] = structuredClone(previous.template) as Template;
  for (const [id, set] of Object.entries(previous.sets)) historical.sets[historical.sets.findIndex(s => s.id === id)] = structuredClone(set) as SetRecord;
  for (const kind of ["annual", "mix"] as const) {
    const targeted = structuredClone(historical);
    if (kind === "mix") {
      const set = targeted.sets.find(s => s.id === "set-mix-a")!;
      set.questionRefs = set.questionRefs.filter(q => q.questionId === "question-template-critical-path");
      set.generationBindings = set.generationBindings.filter(g => g.questionRef.questionId === "question-template-critical-path");
    }
    let run = startRun(await prepareRun(targeted, { subject: "A", kind, year: 2024, mode: kind === "annual" ? "study" : "endless", size: "public", bindingMode: kind === "annual" ? "original_data" : "generated_values",
      ...(kind === "mix" ? { questionRefs: [previous.template.baseQuestionRef] } : {}) }, {}, 100000), 100001);
    const before = structuredClone(run.issued);
    await validateRun(run); run = updateAnswer(run, run.issued[0].correctAnswer.choiceId, 100002);
    if (kind === "mix") { run = await appendRunQuestion(run, undefined, 100003); assert.equal(run.issued.length, before.length + 1); }
    await validateRun(run);
    assert.deepEqual(run.issued.slice(0, before.length), before);
    const ended = finishRun(run, "completed", 100004); await validateRun(ended);
    for (const q of ended.issued) if (q.origin.sourceRefs[0]?.locator.questionNumber === "13") assert.equal(q.detailedExplanationRef, undefined);
  }
});

test("package assets, source rights, shared themes and overlay scrollbar copies are validated", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2024-a-13")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://arrow.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7); assert.equal(pkg.manifest.attribution.origin, "adapted");
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2024-a", "rights-original"]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]])
    assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});
