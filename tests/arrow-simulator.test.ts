import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture } from "./fixtures";
import { contentHash } from "../src/core/hash";
import { detailContext, questionDetailContext, loadDetailPackage } from "../src/core/detailed-explanation";
import { bindQuestion } from "../src/core/generation";
import { makeBookmark } from "../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun, appendRunQuestion } from "../src/core/session";
import type { Bundle, Question, Template, SetRecord } from "../src/core/types";

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
// Separately transcribed from IPA 2025 A Q14 p.8, including both dummy directions.
const topology2025 = [
  ["A", 0, 1], ["B", 1, 3], ["C", 3, 5], ["D", 5, 6], ["E", 1, 2],
  ["F", 1, 5], ["G", 3, 4], ["H", 3, 6], ["I", 6, 7],
  ["dummy-e", 2, 3], ["dummy-g", 4, 5],
] as const;
function independent(values: Record<string, bigint | number | string>, mask: number, pattern = "2024-a-13") {
  const graph = pattern === "2025-a-14" ? topology2025 : topology, end = pattern === "2025-a-14" ? 7 : 6;
  const edges = graph.filter(([id]) => ["dummy-upper", "dummy-e"].includes(id) ? mask & 1 : ["dummy-lower", "dummy-g"].includes(id) ? mask & 2 : true)
    .map(([id, from, to]) => ({ id, from, to, duration: id.startsWith("dummy") ? 0n : BigInt(values[id]) }));
  function routes(from: number, to: number, ids: string[] = [], duration = 0n): { ids: string[]; duration: bigint }[] {
    if (from === to) return [{ ids, duration }];
    return edges.filter(e => e.from === from).flatMap(e => routes(e.to, to, [...ids, e.id], duration + e.duration));
  }
  const maximum = (paths: { duration: bigint }[]) => paths.reduce((max, p) => p.duration > max ? p.duration : max, 0n);
  const terminals = Array.from({ length: end + 1 }, (_, i) => i).filter(n => !edges.some(e => e.from === n));
  const all = terminals.flatMap(n => routes(0, n)), total = maximum(all), early = Array.from({ length: end + 1 }, (_, i) => maximum(routes(0, i))),
    late = Array.from({ length: end + 1 }, (_, i) => total - maximum(terminals.flatMap(n => routes(i, n))));
  early[end] = total;
  return { edges, early, late, total, paths: all.filter(p => p.duration === total).map(p => p.ids) };
}
function verify(values: Record<string, bigint | number | string>, mask = 3, pattern = "2024-a-13") {
  const lesson = engine.forPattern(pattern), dummies = Object.keys(lesson.pattern.dummyNames);
  const r = lesson.calculate(values, { [dummies[0]]: Boolean(mask & 1), [dummies[1]]: Boolean(mask & 2) }), expected = independent(values, mask, pattern);
  assert.equal(r.total, expected.total);
  assert.deepEqual(plain(lesson.nodes.map((id: string) => r.earliest[id])), expected.early.map(String));
  assert.deepEqual(plain(lesson.nodes.map((id: string) => r.latest[id])), expected.late.map(String));
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

test("current generated detail uses its issued inputs and bookmarks resolve the latest source", async () => {
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
  const original = b.questions.find(q => q.id === "question-ipa-2024-a-13")!;
  for (const q of [original, base])
    assert.equal(makeBookmark(b, { questionId: q.id, revision: 1 }, 0).questionRef.revision, original.revision);

});

test("package assets, source rights, shared themes and overlay scrollbar copies are validated", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2024-a-13")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://arrow.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7); assert.equal(pkg.manifest.attribution.origin, "adapted");
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2024-a", "rights-ipa-2025-a", "rights-original"]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]])
    assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});


test("2025 Q14 original, all three joins, official answer and regular explanation match independent routes", () => {
  const lesson = engine.forPattern("2025-a-14"), r = verify(lesson.initial, 3, "2025-a-14");
  assert.deepEqual(plain(lesson.initial), { A: 3, B: 6, C: 8, D: 6, E: 5, F: 14, G: 11, H: 15, I: 5 });
  assert.equal(r.total, 31n);
  assert.deepEqual(plain(r.earliest), { start: "0", branch: "3", lower: "8", join: "9", upper: "20", merge: "20", preend: "26", end: "31" });
  assert.deepEqual(plain(r.paths), [["A", "B", "G", "dummy-g", "D", "I"]]);
  assert.equal(lesson.formula(r, "join"), "max(3 + 6, 8 + 0) = 9日");
  assert.equal(lesson.formula(r, "merge"), "max(9 + 8, 3 + 14, 20 + 0) = 20日");
  assert.equal(lesson.formula(r, "preend"), "max(20 + 6, 9 + 15) = 26日");
  const q = fixture().questions.find(q => q.id === "question-ipa-2025-a-14")!;
  assert.equal(q.correctAnswer.choiceId, "choice-4");
  assert.equal([27n, 28n, 29n, 31n].filter(v => v === r.total).length, 1);
  assert(q.explanation.blocks.some((b: any) => b.text.includes("31日（エ）") && b.text.includes("A→B→G→ダミー（0日）→D→I")));
  assert.equal(engine.initialState(questionDetailContext(q, "light")).pattern, "2025-a-14");
  assert.equal(engine.initialState({ question: { id: "question-ipa-2024-a-13" } }).pattern, "2024-a-13");
  for (const pattern of ["unknown", "__proto__", "constructor"]) {
    assert.equal(engine.initialState({ initialParameters: { pattern } }).pattern, "2024-a-13");
    assert.throws(() => engine.forPattern(pattern));
  }
});

test("2025 Q14 exhausts 3^9 small inputs and four dummy states, plus path switches and exact large days", () => {
  const lesson = engine.forPattern("2025-a-14"), ids = Object.keys(lesson.initial);
  for (let code = 0; code < 3 ** 9; code++) {
    let remaining = code; const values: Record<string, number> = {};
    for (const id of ids) { values[id] = remaining % 3; remaining = Math.floor(remaining / 3); }
    for (let mask = 0; mask < 4; mask++) verify(values, mask, "2025-a-14");
  }
  for (const [id, value, total, paths] of [["E", 7, 32, 1], ["F", 25, 39, 1], ["H", 17, 31, 2], ["H", 18, 32, 1], ["C", 11, 31, 2]] as const) {
    const r = verify({ ...lesson.initial, [id]: value }, 3, "2025-a-14");
    assert.equal(r.total, BigInt(total)); assert.equal(r.paths.length, paths);
  }
  assert.equal(verify(lesson.initial, 1, "2025-a-14").total, 29n, "G dummy removed: H determines completion");
  assert.equal(verify({ ...lesson.initial, E: 7 }, 2, "2025-a-14").total, 31n, "E no longer delays B endpoint");
  assert.equal(verify({ ...lesson.initial, E: 100 }, 2, "2025-a-14").total, 103n, "detached E must still finish");
  assert.equal(verify({ ...lesson.initial, G: 100 }, 1, "2025-a-14").total, 109n, "detached G must still finish");
  const huge = 10n ** 60n + 17n;
  assert.equal(verify({ ...lesson.initial, I: huge }, 3, "2025-a-14").total, huge + 26n);
  let seed = 52131;
  for (let i = 0; i < 100; i++) {
    const values = Object.fromEntries(ids.map(id => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return [id, seed % 1001]; }));
    const r = verify(values, i % 4, "2025-a-14"), visited = new Set();
    for (const step of lesson.steps(r)) if (step.kind === "node") {
      for (const e of r.incoming[step.node]) assert(visited.has(e.from));
      visited.add(step.node);
    }
    assert.equal(visited.size, 8);
  }
  assert.equal(lesson.steps(lesson.calculate(lesson.initial)).length, 12);
});

test("2025 generated inputs, current references, read-only detail and old revision rejection stay consistent", async () => {
  const b = fixture(), t = b.templates.find(t => t.id === "template-source-2025-a-14")!, base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(await contentHash(base), t.originalContentSha256);
  for (const input of [[3, 6, 8, 6, 5, 14, 11, 15, 5], Array(9).fill(1), Array(9).fill(20), [20, 1, 15, 2, 20, 1, 3, 20, 10]]) {
    const q = bindQuestion(base, t, input, "arrow-2025", "2026-10-16T00:00:00Z");
    const diagram: any = q.prompt.blocks.find(b => b.type === "diagram");
    assert.deepEqual(diagram.scene.values, input);
    const context = { question: q, generation: { generatorRef: t.generatorRef, parameters: { values: input } } }, before = JSON.stringify(context);
    const origin = engine.initialState(context), r = verify(origin.values, 3, origin.pattern);
    assert.deepEqual(plain(Object.values(origin.values)), input.map(String));
    assert.equal(q.choices.find(c => c.id === q.correctAnswer.choiceId)!.content.blocks[0].type, "paragraph");
    assert.equal((q.choices.find(c => c.id === q.correctAnswer.choiceId)!.content.blocks[0] as any).text, String(r.total));
    assert(q.explanation.blocks.some((b: any) => b.text.includes(`最少日数は${r.total}日`)));
    assert.equal(JSON.stringify(context), before);
    assert.equal(engine.initialState(context, "2024-a-13").values.A, 30);
    assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
  }
  const original = b.questions.find(q => q.id === "question-ipa-2025-a-14")!;
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
  run.session.entries[0].revealed = true; run = finishRun(run, "completed"); await validateRun(run);
  const before = JSON.stringify(run), context = detailContext(run, { sessionId: run.session.id, entryIndex: 0, from: "review", initialParameters: {} }, "dark");
  assert.deepEqual(plain(Object.values(engine.initialState(context).values)), run.instances[0].parameters.values.map(String));
  assert.equal(JSON.stringify(run), before);
  const outdated = structuredClone(run); outdated.instances[0].templateRef.revision--;
  await assert.rejects(validateRun(outdated));
  assert.equal(makeBookmark(b, { questionId: original.id, revision: 1 }, 0).questionRef.revision, original.revision);
});
