import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture } from "./fixtures";
import { bindQuestion } from "../src/core/generation";
import { contentHash } from "../src/core/hash";
import { loadDetailPackage } from "../src/core/detailed-explanation";
import { makeBookmark } from "../src/core/bookmarks";

const root = "public/explanations/ipa-2026-a-2/";
const sandbox: any = vm.createContext({ structuredClone });
for (const file of ["sort-engine.js", "lesson.js"]) vm.runInContext(fs.readFileSync(root + file, "utf8"), sandbox);
const { SortEngine: engine, SortLesson: lesson } = sandbox;
const plain = (value: any) => JSON.parse(JSON.stringify(value));

// Independent conventional integer-array implementations. They do not use the
// production trace, its counters or renderer to determine the expected events.
function reference(kind: string, input: number[]) {
  const a = [...input], counts = { comparisons: 0, swaps: 0, shifts: 0, insertions: 0, mergeWrites: 0, copyBackWrites: 0, holds: 0 };
  const comparisons: any[] = [];
  const lt = (x: number, y: number) => { counts.comparisons++; comparisons.push([x, y, "<"]); return x < y; };
  const gt = (x: number, y: number) => { counts.comparisons++; comparisons.push([x, y, ">"]); return x > y; };
  const le = (x: number, y: number) => { counts.comparisons++; comparisons.push([x, y, "<="]); return x <= y; };
  const exchange = (i: number, j: number) => { if (i !== j) { const value = a[i]; a[i] = a[j]; a[j] = value; counts.swaps++; } };
  if (kind === "quick") {
    const ranges = [[0, a.length - 1]];
    while (ranges.length) {
      const [lo, hi] = ranges.pop()!; if (hi <= lo) continue;
      const p = a[hi]; let boundary = lo;
      for (let k = lo; k < hi; k++) if (lt(a[k], p)) exchange(boundary++, k);
      exchange(boundary, hi); ranges.push([boundary + 1, hi], [lo, boundary - 1]);
    }
  } else if (kind === "bubble") {
    for (let pass = 1; pass < a.length; pass++)
      for (let k = 1; k <= a.length - pass; k++) if (gt(a[k - 1], a[k])) exchange(k - 1, k);
  } else if (kind === "selection") {
    for (let start = 0; start < a.length - 1; start++) {
      let minimum = start;
      for (let k = start + 1; k < a.length; k++) if (lt(a[k], a[minimum])) minimum = k;
      exchange(start, minimum);
    }
  } else if (kind === "insertion" || kind === "shell") {
    const gaps = kind === "insertion" ? [1] : [];
    if (kind === "shell") for (let h = a.length >> 1; h; h >>= 1) gaps.push(h);
    for (const h of gaps) for (let k = h; k < a.length; k++) {
      const value = a[k]; counts.holds++; let dest = k;
      while (dest >= h && gt(a[dest - h], value)) { a[dest] = a[dest - h]; dest -= h; counts.shifts++; }
      a[dest] = value; counts.insertions++;
    }
  } else if (kind === "merge") {
    const sort = (values: number[]): number[] => {
      if (values.length <= 1) return values;
      const mid = Math.ceil(values.length / 2), left = sort(values.slice(0, mid)), right = sort(values.slice(mid));
      const out: number[] = []; let i = 0, j = 0;
      while (i < left.length && j < right.length) { out.push(le(left[i], right[j]) ? left[i++] : right[j++]); counts.mergeWrites++; }
      while (i < left.length) { out.push(left[i++]); counts.mergeWrites++; }
      while (j < right.length) { out.push(right[j++]); counts.mergeWrites++; }
      counts.copyBackWrites += out.length; return out;
    };
    a.splice(0, a.length, ...sort(a));
  } else if (kind === "heap") {
    const repair = (parent: number, size: number) => {
      for (;;) {
        let child = parent * 2 + 1; if (child >= size) return;
        if (child + 1 < size && lt(a[child], a[child + 1])) child++;
        if (!lt(a[parent], a[child])) return;
        exchange(parent, child); parent = child;
      }
    };
    for (let k = Math.floor(a.length / 2) - 1; k >= 0; k--) repair(k, a.length);
    for (let size = a.length - 1; size > 0; size--) { exchange(0, size); repair(0, size); }
  }
  return { a, counts, comparisons };
}
function verify(kind: string, input: number[]) {
  const trace = engine.generateTrace(kind, input), oracle = reference(kind, input), final = trace.steps.at(-1);
  assert.deepEqual(plain(final.array.map((v: any) => v.value)), [...input].sort((a, b) => a - b));
  assert.deepEqual(plain(final.counts), oracle.counts, `${kind} counters [${input}]`);
  assert.deepEqual(plain(trace.steps.filter((s: any) => s.operation === "compare").map((s: any) => [s.comparison.left.value, s.comparison.right.value, s.comparison.relation])), oracle.comparisons, `${kind} actual comparisons`);
  let previous = trace.steps[0];
  const fixed = new Map<number, number>();
  const tally: any = { comparisons: 0, swaps: 0, shifts: 0, insertions: 0, mergeWrites: 0, copyBackWrites: 0, holds: 0 };
  const countOperations: any = { compare: "comparisons", swap: "swaps", shift: "shifts", insert: "insertions", "merge-write": "mergeWrites", "copy-back": "copyBackWrites", hold: "holds" };
  for (const step of trace.steps) {
    assert(Object.isFrozen(step) && Object.isFrozen(step.array));
    assert(step.description.length > 5);
    const count = countOperations[step.operation]; if (count) tally[count]++;
    assert.deepEqual(plain(step.counts), tally);
    for (const [index, id] of fixed) assert.equal(step.array[index].id, id, `${kind} fixed position moved`);
    for (const index of step.fixed) { assert.equal(step.array[index].value, oracle.a[index]); fixed.set(index, step.array[index].id); }
    for (const range of step.sortedRanges) {
      let last = -1; for (let i = range.lo; i <= range.hi; i += range.stride) { assert(step.array[i]); assert(step.array[i].value >= last); last = step.array[i].value; }
    }
    if (step.pivot) assert.equal(step.array[step.pivot.index].id, step.pivot.id, "pivot index must follow actual exchange");
    if (step.comparison) {
      const c = step.comparison;
      assert.equal(c.result, c.relation === "<" ? c.left.value < c.right.value : c.relation === ">" ? c.left.value > c.right.value : c.left.value <= c.right.value);
      for (const side of [c.left, c.right]) if (side.location === "array") assert.equal(step.array[side.index].id, side.id);
      assert.equal(previous.operation === "compare" && step.operation === "judge" ? previous.counts.comparisons : step.counts.comparisons, step.counts.comparisons);
    }
    if (step.held) {
      assert.equal(step.array.filter((v: any) => v === null).length, 1);
      assert.deepEqual([...step.array.filter(Boolean).map((v: any) => v.id), step.held.id].sort((a, b) => a - b), Array.from({ length: input.length }, (_, i) => i));
    }
    const t = step.transition;
    if (t?.type === "swap") {
      assert.equal(step.array[t.from].id, previous.array[t.to].id); assert.equal(step.array[t.to].id, previous.array[t.from].id);
      assert.notEqual(t.from, t.to);
    } else if (t?.type === "shift") {
      assert.equal(previous.array[t.to], null); assert.equal(step.array[t.from], null); assert.equal(step.array[t.to].id, previous.array[t.from].id);
      assert.equal(t.to - t.from, kind === "shell" ? step.gap : 1);
    } else if (t?.type === "insert") { assert.equal(previous.array[t.to], null); assert.equal(step.array[t.to].id, previous.held.id); }
    else if (t?.type === "merge-write") {
      assert.equal(step.merge.output.at(-1).id, step.merge[t.from.side][t.from.cursor].id);
      assert.deepEqual(plain(step.array), plain(previous.array));
    } else if (t?.type === "copy-back") assert.equal(step.array[t.to].id, step.merge.output[t.from].id);
    else if (step.operation === "hold") assert.equal(previous.array[step.held.from].id, step.held.id);
    else assert.deepEqual(plain(step.array), plain(previous.array), `${kind} unrecorded mutation`);
    if (step.merge?.mode === "merge") {
      for (const side of ["left", "right", "output"]) { const values = step.merge[side].map((v: any) => v.value); assert.deepEqual(plain(values), plain([...values].sort((a, b) => a - b))); }
      assert.equal(step.merge.output.length, step.merge.leftCursor + step.merge.rightCursor);
    }
    if (step.heap?.mode === "valid") for (let i = 1; i < step.heap.size; i++) assert(step.array[Math.floor((i - 1) / 2)].value >= step.array[i].value, "only label valid heaps as valid");
    if (step.operation === "group" && kind === "quick") {
      for (const index of step.groups[0].indices) assert(step.array[index].value < step.pivot.value);
      for (const index of step.groups[1].indices) assert(step.array[index].value >= step.pivot.value);
    }
    previous = step;
  }
  assert.equal(final.operation, "complete"); assert.equal(final.fixed.length, input.length);
  return trace;
}

test("seven sort traces match independent algorithms, comparisons, operations and every recorded state", () => {
  const cases: number[][] = [[8, 3, 5, 1, 7, 2, 6, 4]];
  for (const n of [4, 5]) for (let mask = 0; mask < 3 ** n; mask++) {
    let value = mask; const input = []; for (let i = 0; i < n; i++) { input.push(value % 3); value = Math.floor(value / 3); } cases.push(input);
  }
  for (let n = 4; n <= 10; n++) cases.push(Array(n).fill(0), Array(n).fill(99), Array.from({ length: n }, (_, i) => i), Array.from({ length: n }, (_, i) => n - i), Array.from({ length: n }, (_, i) => i % 2 ? 0 : 99), Array.from({ length: n }, (_, i) => (i * 37 + n * 11) % 100));
  for (const kind of engine.algorithms) for (const input of cases) { const before = [...input]; verify(kind, input); assert.deepEqual(input, before); }
});

test("duplicates remain stable for bubble, insertion and left-first merge; immutable snapshots replay identically", () => {
  for (const kind of ["bubble", "insertion", "merge"]) {
    const trace = verify(kind, [3, 2, 3, 1, 2, 1]);
    const final = trace.steps.at(-1).array;
    for (let i = 1; i < final.length; i++) if (final[i - 1].value === final[i].value) assert(final[i - 1].id < final[i].id);
    const copy = JSON.stringify(trace);
    for (let i = trace.steps.length - 1; i >= 0; i--) assert.equal(JSON.stringify(trace.steps[i]), JSON.parse(copy).steps[i] && JSON.stringify(JSON.parse(copy).steps[i]));
    assert.throws(() => { trace.steps[1].array[0].value = 99; });
    assert.equal(JSON.stringify(trace), copy);
  }
  const shell = verify("shell", [8, 3, 5, 1, 7, 2, 6, 4]);
  assert.deepEqual(plain(shell.steps.filter((s: any) => s.operation === "gap").map((s: any) => s.gap)), [4, 2, 1]);
  assert(verify("insertion", [4, 3, 2, 1]).steps.some((s: any) => s.sortedRanges.length && !s.fixed.length));
});

test("input accepts specified delimiters, zeros and duplicates and reports concrete Japanese errors", () => {
  for (const delimiter of [",", "，", "、"]) assert.deepEqual(plain(engine.parseInput(` 0${delimiter}99${delimiter}2${delimiter}2 `)), [0, 99, 2, 2]);
  for (const [input, reason] of [["1,2,3", "4〜10"], ["1,2,3,4,5,6,7,8,9,10,11", "4〜10"], ["1,2,,4", "空"], ["1,2,3,4,", "空"], ["1,2.5,3,4", "小数"], ["1,2,a,4", "文字"], ["1,2,-1,4", "0〜99"], ["1,2,100,4", "0〜99"]]) assert.throws(() => engine.parseInput(input), new RegExp(reason));
  assert.throws(() => engine.generateTrace("quick", [1, 2, 3, NaN]));
});

test("reviewed original and all generated options initialize the right algorithm regardless of displayed labels", async () => {
  const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2026-a-2")!;
  const template = b.templates.find(t => t.id === "template-source-2026-a-2")!, base = b.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
  const context = { question: original, initialParameters: original.detailedExplanationRef?.initialParameters ?? {}, generation: null };
  assert.equal(lesson.standaloneContext.question.id, original.id);
  assert.equal(lesson.standaloneContext.question.correctAnswer.choiceId, original.correctAnswer.choiceId);
  assert.deepEqual(plain(lesson.standaloneContext.choiceOrder), original.choices.map((choice, i) => ({ id: choice.id, label: ["ア", "イ", "ウ", "エ"][i] })));
  assert(Object.isFrozen(lesson.standaloneContext));
  assert.equal(lesson.initialAlgorithm(context), "quick");
  assert.deepEqual(plain(lesson.choiceAlgorithms(context)), { "choice-1": "insertion", "choice-2": "selection", "choice-3": "quick", "choice-4": "bubble" });
  const reviewed = ["quick", "insertion", "selection", "bubble"], phrases = ["基準値", "挿入", "最小値", "隣接"];
  for (let target = 0; target < 4; target++) for (let rotation = 0; rotation < 3; rotation++) {
    const question = bindQuestion(base, template, [target, rotation], "sort-test", "2026-10-14T00:00:00Z");
    const c = { question, initialParameters: base.detailedExplanationRef!.initialParameters, generation: { generatorRef: template.generatorRef, parameters: { values: [target, rotation] } } };
    assert.equal(lesson.initialAlgorithm(c), reviewed[target]);
    assert.deepEqual(question.detailedExplanationRef, base.detailedExplanationRef);
    const map = lesson.choiceAlgorithms(c);
    question.choices.forEach((choice, i) => { const expected = (i + rotation) % 4; assert.equal(map[choice.id], reviewed[expected]); assert(choice.content.blocks.some((block: any) => block.text.includes(phrases[expected]))); assert.equal(lesson.initialAlgorithm({ ...c, initialParameters: { choiceId: choice.id } }), reviewed[expected]); });
    assert(question.correctAnswer.choiceId);
    assert.equal(map[question.correctAnswer.choiceId], reviewed[target]);
    assert.equal(lesson.initialAlgorithm({ ...c, initialParameters: { algorithm: "heap" } }), "heap");
  }
  for (const q of [original, base]) assert.equal(makeBookmark(b, { questionId: q.id, revision: q.revision - 1 }, 0).questionRef.revision, original.revision);
  assert.equal(template.originalContentSha256, await contentHash(base));
});

test("managed package hashes load, source-backed learning facts cover all seven algorithms", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2026-a-2")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://sort.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 8);
  assert.equal(new TextDecoder().decode(pkg.files["theme.css"].bytes), fs.readFileSync("src/ui/tokens.css", "utf8"), "both themes share the authoritative monochrome palette");
  assert.equal(new TextDecoder().decode(pkg.files["scrollbars.css"].bytes), fs.readFileSync("src/ui/scrollbars.css", "utf8"));
  assert.equal(pkg.manifest.attribution.origin, "original"); assert.equal(pkg.manifest.attribution.sourceRefs.length, 0);
  assert.equal(pkg.manifest.references?.title, "参考資料（定義・計算量の確認）");
  assert.equal(pkg.manifest.references?.sourceRefs.length, 9);
  for (const kind of engine.algorithms) {
    const info = lesson.algorithms[kind];
    for (const key of ["name", "english", "overview", "principle", "focus", "exam", "difference", "note", "average", "worst"]) assert(info[key].length > 2);
    if (["bubble", "selection", "insertion"].includes(kind)) assert.equal(info.average, "O(n²)");
    if (["quick", "merge", "heap"].includes(kind)) assert.equal(info.average, "O(n log n)");
    const source = b.sources.find(s => s.id === `source-nist-sort-${kind}`); assert(source?.checkedOn === "2026-10-14");
  }
  assert.equal(lesson.algorithms.quick.worst, "O(n²)"); assert.equal(lesson.algorithms.merge.worst, "O(n log n)"); assert.equal(lesson.algorithms.heap.worst, "O(n log n)");
  const quickSource = b.sources.find(source => source.id === "source-nist-sort-quick")!;
  assert(Array.isArray(quickSource.facts));
  const quickDefinition = quickSource.facts.join(" ");
  assert.match(quickDefinition, /ピボット/);
  assert(!quickDefinition.includes("末尾"), "NIST's general definition does not require this simulator's end-pivot variant");
  assert(lesson.algorithms.quick.focus.includes("末尾"), "the lesson identifies its actual pivot choice as an implementation variant");
});
