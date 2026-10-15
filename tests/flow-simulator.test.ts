import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture } from "./fixtures";
import { loadDetailPackage, validateDetailAttribution } from "../src/core/detailed-explanation";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun, appendRunQuestion } from "../src/core/session";
import { makeBookmark } from "../src/core/bookmarks";

const root = "public/explanations/ipa-2023-a-11/", sandbox: any = vm.createContext({});
vm.runInContext(fs.readFileSync(root + "flow-engine.js", "utf8"), sandbox);
const E = sandbox.FlowEngine;
const plain = (value: any) => JSON.parse(JSON.stringify(value));
const configure = (a = 6, b = 9, exitOp = "eq", subtractOp = "lt") => E.config({ a, b, exitOp, subtractOp });
function run(c: any, limit?: number) {
  const history = [E.create(c)];
  while (history.at(-1).status === "running") history.push(E.advance(history, c, limit));
  return history;
}

test("requested three paths calculate actual values, symbolic expressions and print output", () => {
  for (const [c, path, printed] of [
    [configure(), [1, 2, 3, 5, 2, 3, 4, 2, 6], 3],
    [configure(3, 6), [1, 2, 3, 5, 2, 6], 3],
    [configure(6, 9, "ne"), [1, 2, 6], 6],
  ] as const) {
    const history = run(c);
    assert.deepEqual(history.map(s => s.node), path);
    assert.equal(history.at(-1).printed, printed);
    assert.equal(history.at(-1).status, "completed");
    for (const s of history) {
      assert.equal(BigInt(s.em[0]) * BigInt(c.a) + BigInt(s.em[1]) * BigInt(c.b), BigInt(s.m));
      assert.equal(BigInt(s.en[0]) * BigInt(c.a) + BigInt(s.en[1]) * BigInt(c.b), BigInt(s.n));
    }
  }
  const history = run(configure());
  assert.deepEqual(history.filter(s => [1, 4, 5].includes(s.node)).map(s => [s.m, s.n]), [[6, 9], [6, 3], [3, 3]]);
  assert.deepEqual(plain(history[6].em), [2, -1]); assert.deepEqual(plain(history[6].en), [-1, 1]);
  assert.equal(E.expression(history[6].em), "2a−b"); assert.equal(E.expression(history[6].en), "b−a");
});

// Independent branch oracle uses membership of the three ordering outcomes,
// rather than any predicate, branch table or next-node function from the lesson.
const accepted: Record<string, number[]> = { eq: [0], ne: [-1, 1], lt: [-1], le: [-1, 0], gt: [1], ge: [0, 1] };
test("all 36 operator pairs partition and restrict labels with no overlapping or missing outcomes", () => {
  const expected: Record<string, number[]> = { "＝": [0], "≠": [-1, 1], "＜": [-1], "≦": [-1, 0], "＞": [1], "≧": [0, 1], "到達不能": [], "すべて": [-1, 0, 1] };
  for (const exit of Object.keys(accepted)) for (const sub of Object.keys(accepted)) {
    const branches = E.branches(configure(6, 9, exit, sub));
    for (const edge of ["2-6", "2-3", "3-5", "3-4"]) {
      const outcomes = [-1, 0, 1].filter(r => edge === "2-6" ? accepted[exit].includes(r)
        : edge === "2-3" ? !accepted[exit].includes(r)
        : !accepted[exit].includes(r) && (edge === "3-5" ? accepted[sub].includes(r) : !accepted[sub].includes(r)));
      assert.deepEqual(plain(branches[edge].outcomes), outcomes);
      assert.deepEqual(expected[branches[edge].label], outcomes);
      assert.equal(branches[edge].reachable, outcomes.length > 0);
    }
  }
  const b = E.branches(configure());
  assert.deepEqual([b["2-6"].label, b["2-3"].label, b["3-5"].label, b["3-4"].label], ["＝", "≠", "＜", "＞"]);
  assert.equal(E.branches(configure(6, 9, "ne", "lt"))["3-5"].label, "到達不能");
});

test("independent BigInt interpreter covers all operator pairs and small inputs, with exact coefficient invariants", () => {
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  for (const exit of Object.keys(accepted)) for (const sub of Object.keys(accepted)) for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    const c = configure(a, b, exit, sub), history = run(c);
    let m = BigInt(a), n = BigInt(b), pc = 1;
    const seen = new Set<string>();
    for (const [i, s] of history.entries()) {
      assert.equal(s.node, pc);
      if (pc === 4 || pc === 5) {
        const candidate = pc === 4 ? m - n : n - m;
        if (candidate < -max || candidate > max) {
          assert.equal(s.status, "stopped"); assert.match(s.reason, /整数精度/);
          assert.equal(s.m, Number(m)); assert.equal(s.n, Number(n)); break;
        }
        if (pc === 4) m = candidate; else n = candidate;
      }
      assert.equal(BigInt(s.m), m); assert.equal(BigInt(s.n), n);
      assert.equal(BigInt(s.em[0]) * BigInt(a) + BigInt(s.em[1]) * BigInt(b), m);
      assert.equal(BigInt(s.en[0]) * BigInt(a) + BigInt(s.en[1]) * BigInt(b), n);
      if (pc === 6) { assert.equal(s.printed, Number(m)); assert.equal(s.status, "completed"); break; }
      const key = `${pc}/${m}/${n}`;
      if (seen.has(key)) { assert.equal(s.status, "stopped"); assert.match(s.reason, /循環/); break; }
      seen.add(key);
      // A bounded coefficient representation is intentionally also guarded.
      if (s.status === "stopped") { assert.match(s.reason, /整数精度|実行上限/); break; }
      const r = m < n ? -1 : m > n ? 1 : 0;
      const next = pc === 1 || pc === 4 || pc === 5 ? 2 : pc === 2 ? accepted[exit].includes(r) ? 6 : 3 : accepted[sub].includes(r) ? 5 : 4;
      if (pc === 2 || pc === 3) {
        assert.equal(s.comparison.holds, accepted[pc === 2 ? exit : sub].includes(r));
        assert.equal(s.comparison.next, next);
      }
      pc = next;
      assert(i < E.STEP_LIMIT);
    }
  }
});

test("default positive-input interpreter agrees with an independent remainder-based GCD", () => {
  for (let a = 1; a <= 24; a++) for (let b = 1; b <= 24; b++) {
    let x = a, y = b;
    while (y) [x, y] = [y, x % y];
    const s = run(configure(a, b)).at(-1);
    assert.equal(s.status, "completed"); assert.equal(s.printed, x);
  }
});

test("history snapshots are immutable under stepping and all previous display fields can be restored", () => {
  const c = configure(), history = [E.create(c)];
  while (history.at(-1).status === "running") {
    const before = JSON.stringify(history), next = E.advance(history, c);
    assert.equal(JSON.stringify(history), before); history.push(next);
  }
  const saved = history.map(s => plain(s));
  for (let position = history.length - 1; position >= 0; position--) {
    assert.deepEqual(plain(history[position]), saved[position]);
    if (position < history.length - 1) assert.deepEqual(plain(E.advance(history.slice(0, position + 1), c)), saved[position + 1]);
  }
  assert.equal(history[7].printed, null); assert.equal(history[7].status, "running");
  assert(!history[7].edges.includes("6-end")); assert(history[8].edges.includes("6-end"));
});

test("invalid, fractional, zero, negative and unsafe inputs fail before history reset", () => {
  for (const a of ["", " ", "1.5", "1.0", "1e2", "0", "000", "-1", "NaN", "Infinity", "9007199254740992", "9".repeat(1000), "0x10"]) assert.throws(() => configure(a as any, 9));
  for (const b of ["", "0", "2.1", "9007199254740993"]) assert.throws(() => configure(6, b as any));
  assert.equal(configure("0006" as any, "+9" as any).a, 6);
  assert.equal(configure(Number.MAX_SAFE_INTEGER, 1).a, Number.MAX_SAFE_INTEGER);
  assert.throws(() => configure(6, 9, "toString")); assert.throws(() => configure(6, 9, "eq", "__proto__"));
});

test("cycle, execution limit, numeric and coefficient precision guards preserve recoverable states", () => {
  const cyclic = run(configure(1, 1, "gt", "lt"));
  assert.match(cyclic.at(-1).reason, /循環/); assert.equal(cyclic.at(-1).status, "stopped");
  assert.equal(E.advance(cyclic, configure(1, 1, "gt", "lt")), cyclic.at(-1));
  const bounded = run(configure(1000, 1)); assert.equal(bounded.length, E.STEP_LIMIT); assert.match(bounded.at(-1).reason, /実行上限/);
  const overflow = run(configure(Number.MAX_SAFE_INTEGER, 1, "lt", "gt"));
  assert.match(overflow.at(-1).reason, /整数精度/); assert.equal(overflow.at(-1).printed, null);
  const old = { ...E.create(configure()), node: 3, next: 4, m: 6, n: 9, em: [Number.MAX_SAFE_INTEGER, 0], en: [-1, 1] };
  const guarded = E.advance([old], configure()); assert.equal(guarded.status, "stopped");
  assert.equal(guarded.m, 6); assert.deepEqual(plain(guarded.em), plain(old.em));
  assert.equal(E.create(configure()).node, 1);
});

test("symbolic formatting collects terms, handles signs and zero, and explanation follows active settings", () => {
  for (const [pair, label] of [[[0, 0], "0"], [[1, 0], "a"], [[0, -1], "−b"], [[2, -1], "2a−b"], [[-1, 1], "b−a"], [[-2, -3], "−2a−3b"]] as const) assert.equal(E.expression(pair), label);
  const c = configure(), history = run(c), explanation = E.explain(c, history).join(" ");
  assert.match(explanation, /2a−b＝b−a/); assert.match(explanation, /正解は「エ」/); assert.match(explanation, /印字した値は3/);
  const changed = configure(6, 9, "ne"), alternative = E.explain(changed, run(changed)).join(" ");
  assert.match(alternative, /②で 6 ≠ 9 が成立/); assert.match(alternative, /印字した値は6/); assert(!alternative.includes("正解は「エ」"));
  assert(!alternative.includes("適用中：")); assert(!explanation.includes("適用中："));
  assert(!E.baselineApplies(configure(3, 6), run(configure(3, 6))));
  for (let k = 1; k <= 20; k++) {
    const c = configure(2 * k, 3 * k); assert(E.baselineApplies(c, run(c))); assert.equal(run(c).at(-1).printed, k);
  }
});

test("official choices have exactly one relation producing the specified execution path", () => {
  const target = "1,2,3,5,2,3,4,2,6";
  // Ratios read from the official choices: a=2b, 2a=b, 2a=3b, 3a=2b.
  const choices = [[2, 1], [1, 2], [3, 2], [2, 3]];
  const matches = choices.flatMap(([a, b], i) => run(configure(a, b)).map(s => s.node).join(",") === target ? [i] : []);
  assert.deepEqual(matches, [3]);
  const q = fixture().questions.find(q => q.id === "question-ipa-2023-a-11")!;
  assert.equal(q.correctAnswer.choiceId, q.choices[matches[0]].id);
  assert(q.explanation.blocks.some((block: any) => block.text.includes("3a＝2b")));
});

test("all four official relation examples derive their own equations and distinguish the requested path", () => {
  // Fixed from the official choice order, independently traced by subtraction.
  const expected = [
    { choice: "ア", relation: "a＝2b", a: 6, b: 3, path: [1, 2, 3, 4, 2, 6], em: [1, -1], en: [0, 1] },
    { choice: "イ", relation: "2a＝b", a: 3, b: 6, path: [1, 2, 3, 5, 2, 6], em: [1, 0], en: [-1, 1] },
    { choice: "ウ", relation: "2a＝3b", a: 9, b: 6, path: [1, 2, 3, 4, 2, 3, 5, 2, 6], em: [1, -1], en: [-1, 2] },
    { choice: "エ", relation: "3a＝2b", a: 6, b: 9, path: [1, 2, 3, 5, 2, 3, 4, 2, 6], em: [2, -1], en: [-1, 1] },
  ];
  const q = fixture().questions.find(q => q.id === "question-template-source-2023-a-11")!;
  for (const [i, item] of expected.entries()) {
    assert.equal(q.choices[i].content.blocks[0].type, "paragraph");
    assert.equal((q.choices[i].content.blocks[0] as any).text, item.relation);
    const p = E.patterns[i];
    assert.deepEqual(plain(p), { id: `choice-${i + 1}`, choice: item.choice, relation: item.relation, a: item.a, b: item.b });
    const c = configure(p.a, p.b), history = run(c), last = history.at(-1);
    assert.deepEqual(history.map(s => s.node), item.path);
    assert.equal(last.printed, 3);
    assert.deepEqual(plain(last.em), item.em); assert.deepEqual(plain(last.en), item.en);
    assert.equal(E.comparisonRelation(last.em, last.en, "eq"), item.relation);
    const final = E.explain(c, history).join(" ");
    assert(final.includes(`移項して整理すると ${item.relation}`));
    if (i < 3) { assert(final.includes("指定経路とは異なります")); assert(!final.includes("基準問題と同じ経路になる設定")); }
    else assert(final.includes("基準問題の正解は「エ」"));
    for (let k = 1; k <= 20; k++) assert.equal(E.matchingPattern(configure(item.a * k, item.b * k)).id, p.id);
    const saved = history.map(s => JSON.stringify(E.explain(c, history.slice(0, history.indexOf(s) + 1))));
    for (let j = history.length - 1; j >= 0; j--) assert.equal(JSON.stringify(E.explain(c, history.slice(0, j + 1))), saved[j]);
  }
  assert.equal(E.matchingPattern(configure(5, 7)), null);
  assert.equal(E.matchingPattern(configure(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1)), null);
  const changed = configure(9, 6, "ne"), text = E.explain(changed, run(changed)).join(" ");
  assert(text.includes("a≠b")); assert(!text.includes("移項して整理すると 2a＝3b"));
});

test("rearranged symbolic conditions preserve all six comparisons, signs, reduction and exact large coefficients", () => {
  const vectors = [[1, 0], [0, 1], [2, -1], [-1, 2], [-1, 1], [0, 0], [-2, -3], [3, 2], [4, -2]];
  const values = [[1, 1], [1, 3], [3, 1], [2, 3], [3, 2], [5, 7]];
  const labels: Record<string, number[]> = { "＝": [0], "≠": [-1, 1], "＜": [-1], "≦": [-1, 0], "＞": [1], "≧": [0, 1] };
  const evaluate = (side: string, a: bigint, b: bigint) => side === "0" ? 0n : side.split("＋").reduce((sum, term) => {
    const match = /^(\d*)([ab])$/.exec(term); assert(match, side);
    return sum + BigInt(match[1] || "1") * (match[2] === "a" ? a : b);
  }, 0n);
  for (const left of vectors) for (const right of vectors) for (const op of Object.keys(accepted)) {
    const relation = E.comparisonRelation(left, right, op), parts = relation.split(/([＝≠＜≦＞≧])/);
    for (const [a, b] of values) {
      const original = BigInt(left[0] - right[0]) * BigInt(a) + BigInt(left[1] - right[1]) * BigInt(b);
      const reduced = evaluate(parts[0], BigInt(a), BigInt(b)) - evaluate(parts[2], BigInt(a), BigInt(b));
      const sign = (n: bigint) => n < 0n ? -1 : n > 0n ? 1 : 0;
      assert.equal(labels[parts[1]].includes(sign(reduced)), accepted[op].includes(sign(original)), `${relation}: ${a}/${b}`);
    }
  }
  assert.equal(E.comparisonRelation([Number.MAX_SAFE_INTEGER, -1], [-Number.MAX_SAFE_INTEGER, 0], "eq"), "18014398509481982a＝b");
  assert.equal(E.comparisonRelation([4, -2], [-2, 2], "eq"), "3a＝2b");
  assert.equal(E.comparisonRelation([1, 0], [1, 0], "eq"), "0＝0");
});

test("reviewed package, resource hashes, provenance and shared theme load through common host", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2023-a-11")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://flow.invalid/"), undefined, fetcher);
  assert(pkg); validateDetailAttribution(pkg.manifest, b);
  assert.equal(pkg.manifest.files.length, 7); assert.equal(pkg.manifest.attribution.origin, "adapted");
  assert.equal(pkg.manifest.references?.sourceRefs.length, 2);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});

test("current annual answers retain their issued content and bookmarks resolve the latest flow source", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2023-a-11")!;
  assert.equal(makeBookmark(b, { questionId: q.id, revision: 1 }, 0).questionRef.revision, q.revision);
  let saved = startRun(await prepareRun(b, { subject: "A", kind: "annual", year: 2023, mode: "study", size: "public", bindingMode: "original_data" }, {}, 100000), 100001);
  saved.session.currentIndex = saved.issued.findIndex(item => item.id === q.id);
  const content = structuredClone(saved.issued);
  saved = updateAnswer(saved, q.correctAnswer.choiceId, 100002);
  const completed = finishRun(saved, "completed", 100003); await validateRun(completed);
  assert.deepEqual(completed.issued, content);
  assert.equal(completed.session.entries[saved.session.currentIndex].selectedChoiceId, q.correctAnswer.choiceId);
});
