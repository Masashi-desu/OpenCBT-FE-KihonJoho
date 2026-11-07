import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture, installFixtureGenerators } from "./fixtures";
import { bindQuestion } from "../src/core/generation";
import { contentHash } from "../src/core/hash";
import { loadDetailPackage } from "../src/core/detailed-explanation";
import { makeBookmark } from "../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../src/core/session";

const root = "public/explanations/ipa-2019-autumn-am-29/", sandbox: any = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(root + "locking-engine.js", "utf8"), sandbox);
const E = sandbox.window.LockingEngine, plain = (v: any) => JSON.parse(JSON.stringify(v));
await installFixtureGenerators();

// Independent serial scheduler: each transaction has a FIFO of issued commands.
// W is concurrently readable; the three update resources have a single owner.
// Completion atomically removes that owner's locks. No simulator routines used.
function reference(order: string[], exclusiveW = false) {
  const queues: string[][] = [[], []], programs = [["W", "X", "Y", "Z"], order];
  const cursor = [0, 0], owners = new Map<string, number>();
  for (let tick = 0; tick < 8; tick++) {
    const t = tick % 2;
    queues[t].push(programs[t][Math.floor(tick / 2)]);
    let advanced: boolean;
    do {
      advanced = false;
      for (let p = 0; p < 2; p++) {
        const d = queues[p][0];
        if (d && (d === "W" && !exclusiveW || !owners.has(d) || owners.get(d) === p)) {
          queues[p].shift(); cursor[p]++; advanced = true;
          if (d !== "W" || exclusiveW) owners.set(d, p);
          if (cursor[p] === 4) for (const [key, owner] of owners) if (owner === p) owners.delete(key);
        }
      }
    } while (advanced);
  }
  return { deadlock: cursor.some(n => n < 4), waits: queues.map(q => q[0] ?? null) };
}
const permutations = (xs: string[]): string[][] => xs.length ? xs.flatMap((x, i) => permutations(xs.filter((_, j) => j !== i)).map(rest => [x, ...rest])) : [[]];

test("all 24 B permutations agree with independent FIFO/ownership scheduling; every snapshot obeys 2PL", () => {
  for (const order of permutations(["W", "X", "Y", "Z"])) {
    const trace = E.trace(order), expected = reference(order), last = trace.at(-1);
    assert.equal(last.deadlock, expected.deadlock, order.join());
    if (expected.deadlock) assert.deepEqual(plain([last.waiting.A.data, last.waiting.B.data]), expected.waits);
    else assert.deepEqual(plain(last.phase), { A: "done", B: "done" });
    for (const [i, s] of trace.entries()) {
      assert(s.title && s.text); assert(s.pc.A <= s.issued.A && s.pc.B <= s.issued.B);
      for (const d of ["X", "Y", "Z"]) assert(s.locks[d].length <= 1);
      for (const tx of ["A", "B"]) {
        assert(new Set(s.locks.W).size === s.locks.W.length);
        if (s.phase[tx] !== "growing") assert.equal(s.pc[tx], 4);
        if (s.waiting[tx]) {
          assert(s.pc[tx] < 4);
          assert.equal(s.waiting[tx].data, (tx === "A" ? ["W", "X", "Y", "Z"] : order)[s.pc[tx]]);
          assert.deepEqual(plain(s.waiting[tx].blockers), plain(s.locks[s.waiting[tx].data].filter((t: string) => t !== tx)));
        }
      }
      if (i && ["acquire", "resume"].includes(s.kind)) assert.equal(trace[i - 1].phase[s.tx], "growing");
      if (s.kind === "release") {
        assert.equal(s.phase[s.tx], "shrinking");
        assert(trace[i - 1].locks[s.data].includes(s.tx)); assert(!s.locks[s.data].includes(s.tx));
        for (const d of ["W", "X", "Y", "Z"].filter(d => d !== s.data)) assert.deepEqual(s.locks[d], trace[i - 1].locks[d]);
      }
    }
    assert(trace.length < 40);
  }
  assert(Object.isFrozen(E.data));
  for (const bad of [[], ["W", "X", "Y", "Y"], ["W", "X", "Y", "Q"], null]) assert.throws(() => E.trace(bad));
});
test("official four orders retain command issue positions, shared reads, blocking, all releases and uniquely C", () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-29")!;
  const choices = E.choices({ question: q }), expected = [["W", "Y", "X", "Z"], ["W", "Y", "Z", "X"], ["X", "W", "Y", "Z"], ["Y", "Z", "X", "W"]];
  assert.deepEqual(plain(choices.map((c: any) => c.order)), expected);
  assert.deepEqual(plain(choices.filter((c: any) => !reference(c.order).deadlock).map((c: any) => c.id)), [q.correctAnswer.choiceId]);
  const safe = E.trace(choices[2].order);
  assert(safe.some((s: any) => s.locks.W.length === 2));
  assert(safe.some((s: any) => s.kind === "queued" && s.tx === "A" && s.index === 2 && s.pc.A === 1));
  assert(safe.some((s: any) => s.kind === "resume" && s.tx === "A" && s.data === "X"));
  for (const tx of ["A", "B"]) assert.equal(safe.filter((s: any) => s.kind === "release" && s.tx === tx).length, 4);
  const firstRelease = safe.find((s: any) => s.kind === "release" && s.data === "W");
  assert.deepEqual(plain(firstRelease.locks.W), ["A"]);
  const frozen = JSON.stringify(safe); safe.at(-1).locks.W.push("probe");
  assert.equal(safe[0].locks.W.length, 0); assert.equal(JSON.stringify(E.trace(choices[2].order)), frozen);
});
test("step actors and both execution cursors independently follow requests, retain waits across queued issues and clear at commit", () => {
  const kinds = new Set<string>();
  for (const order of permutations(["W", "X", "Y", "Z"])) {
    const cursors: Record<string, number | null> = { A: null, B: null };
    for (const s of E.trace(order)) {
      kinds.add(s.kind);
      if (["acquire", "resume", "wait"].includes(s.kind)) cursors[s.tx] = s.index;
      if (s.kind === "commit") cursors[s.tx] = null;
      const before = JSON.stringify(s), view = E.presentation(s);
      assert.deepEqual(plain(view.cursors), cursors);
      assert.deepEqual(plain(view.active), s.deadlock ? ["A", "B"] : s.tx ? [s.tx] : []);
      if (s.kind === "queued") { assert.notEqual(view.cursors[s.tx], s.index); assert.equal(view.action, "発行のみ"); }
      if (s.kind === "deadlock") { assert.notEqual(view.cursors.A, null); assert.notEqual(view.cursors.B, null); assert.equal(view.action, "停止"); }
      if (["start", "done"].includes(s.kind)) assert.deepEqual(plain(view.active), []);
      if (["commit", "release", "finish"].includes(s.kind)) assert.equal(view.cursors[s.tx], null);
      assert.equal(JSON.stringify(s), before);
    }
  }
  assert.deepEqual([...kinds].sort(), ["start", "acquire", "wait", "queued", "commit", "release", "finish", "resume", "deadlock", "done"].sort());
});
test("all 17 saved generation conditions match every rendered option and independent answer without mutating context", async () => {
  const b = fixture(), t = b.templates.find(t => t.id === "template-source-2019r01a-fe-am-29")!, base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(t.originalContentSha256, await contentHash(base));
  for (let v = 0; v < 17; v++) {
    const q = bindQuestion(base, t, [v], "locking-content", "2026-11-05T00:00:00Z");
    const context = { question: q, generation: { generatorRef: t.generatorRef, parameters: { values: [v] } }, choiceOrder: q.choices.map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) }, before = JSON.stringify(context);
    const choices = E.choices(context), good = choices.filter((c: any) => !reference(c.order, v === 16).deadlock);
    assert.equal(good.length, 1); assert.equal(good[0].id, q.correctAnswer.choiceId);
    for (const c of choices) {
      const table = q.choices.find(row => row.id === c.id)!.content.blocks[0];
      assert.equal(table.type, "table"); if (table.type !== "table") throw Error("table");
      assert.deepEqual(plain([c.order.map(E.operation)]), table.rows);
      assert.equal(E.trace(c.order, v === 16).at(-1).deadlock, reference(c.order, v === 16).deadlock);
    }
    assert.equal(JSON.stringify(context), before); assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
  }
  const reversed = E.choices({ choiceOrder: [...base.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) });
  assert.equal(reversed[1].id, "choice-value-3"); assert.equal(reversed[1].label, "イ");
  assert.equal(reference(reversed[1].order).deadlock, false);
  for (const values of [[], [-1], [17], [1.5], ["0"], [null], [0, 1]]) assert.throws(() => E.choices({ generation: { generatorRef: t.generatorRef, parameters: { values } } }));
  assert.throws(() => E.variant({ generation: { generatorRef: { ...t.generatorRef, version: "unknown" }, parameters: { values: [0] } } }));
  assert.throws(() => E.choices({ choiceOrder: [{ id: "unknown", label: "ア" }] }));
});
test("managed package pins bytes, shared colors/scrollbars and official Q29 attribution", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-29")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://locking.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7);
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2019r01a-fe-am-stage1-source77", "rights-original"]);
  assert.equal(pkg.manifest.attribution.sourceRefs[0].locator.page, 17);
  assert(pkg.manifest.attribution.sourceRefs.every(ref => ref.locator.questionNumber === "29"));
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});
test("revised runs keep saved answers; incompatible refs cannot resume and bookmarks use the current question", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-29")!;
  assert.equal(q.revision, 3); assert.equal(makeBookmark(b, { questionId: q.id, revision: 1 }, 0).questionRef.revision, 3);
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: q.id, revision: q.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run); await validateRun(run); assert.equal(JSON.stringify(run), before);
  const old = structuredClone(run); old.issued[0].revision--; await assert.rejects(() => validateRun(old));
});
