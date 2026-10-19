import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture } from "./fixtures";
import { bindQuestion, parametersForSeed } from "../src/core/generation";
import { contentHash } from "../src/core/hash";
import { loadDetailPackage } from "../src/core/detailed-explanation";
import { makeBookmark } from "../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../src/core/session";

const root = "public/explanations/ipa-2024-a-3/", sandbox: any = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(root + "cache-engine.js", "utf8"), sandbox);
const E = sandbox.window.CacheEngine;
const value = (r: any) => Number(r.n) / Number(r.d);
const plain = (x: any) => JSON.parse(JSON.stringify(x));

// Independent oracle: interpolate the difference between CPU times at h=0 and
// h=1. Check the selected probability by actual weighted-time substitution.
function verify(input: any) {
  const m = E.solve(input), atZero = input.xm - input.ym, atOne = input.xh - input.yh;
  const kind = atZero === atOne ? (atZero === 0 ? "any" : "none") :
    (atZero * atOne > 0 ? "outside" : "unique");
  assert.equal(m.kind, kind);
  if (m.h) {
    const h = value(m.h);
    assert(Math.abs(h - atZero / (atZero - atOne)) < 1e-10);
    const x = input.xh * h + input.xm * (1 - h), y = input.yh * h + input.ym * (1 - h);
    assert(Math.abs(x - y) < 1e-5); assert(Math.abs(value(m.xavg) - x) < 1e-5);
    assert.equal(m.xavg.n * m.yavg.d, m.yavg.n * m.xavg.d);
  }
  return m;
}

test("official values and all four choices independently verify the unique 0.90 answer at 76ns", () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2024-a-3")!;
  const m = verify(E.defaults); assert.equal(value(m.h), .9); assert.equal(value(m.xavg), 76);
  const choices = E.choices({ question: q, choiceOrder: [...q.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) });
  const matching = choices.filter((c: { h: { n: bigint; d: bigint } }) => 40n * c.h.n + 400n * (c.h.d - c.h.n) === 20n * c.h.n + 580n * (c.h.d - c.h.n));
  assert.equal(matching.length, 1); assert.equal(matching[0].id, q.correctAnswer.choiceId); assert.equal(matching[0].label, "ウ");
  assert(q.explanation.blocks.some((block: any) => block.text.includes("200h＝180") && block.text.includes("76ns")));
});

test("all 2401 small input combinations classify degeneracies and endpoint solutions, including reversed timings", () => {
  const seen = new Set();
  for (let xh = 0; xh <= 6; xh++) for (let xm = 0; xm <= 6; xm++) for (let yh = 0; yh <= 6; yh++) for (let ym = 0; ym <= 6; ym++) {
    const m = verify({ ...E.defaults, xh, xm, yh, ym }); seen.add(m.kind);
  }
  assert.deepEqual([...seen].sort(), ["any", "none", "outside", "unique"]);
  for (const input of [{ xh: 10, xm: 100, yh: 20, ym: 100 }, { xh: 10, xm: 100, yh: 10, ym: 200 }]) {
    const m = verify({ ...E.defaults, ...input }); assert.equal(m.kind, "unique"); assert([0, 1].includes(value(m.h)));
  }
  verify({ ...E.defaults, xh: 100000000, xm: 0, yh: 0, ym: 99999999 });
  assert.equal(E.display(E.ratio(1, 3)), "1/3"); assert.equal(E.display(E.ratio(-1, 3)), "−1/3");
  assert.equal(E.display(E.ratio(1, 1000000)), "0.000001"); assert.equal(E.display(E.ratio(1, 10000000)), "1/10000000");
  assert.equal(E.display(E.ratio(9, 10), 2), "0.90");
  const capacityOnly = E.solve({ ...E.defaults, cache: 1, main: 100000000 });
  assert.equal(value(capacityOnly.h), .9); assert.equal(value(capacityOnly.xavg), 76);
});

test("the explained weighted mean equals the total time of 100 accesses divided by 100", () => {
  // Count hit/miss accesses independently of the engine's rational average.
  for (const [hit, miss] of [[40, 400], [20, 580], [0, 100], [100, 0], [25, 25]]) {
    for (let hits = 0; hits <= 100; hits++) {
      const total = Array.from({ length: 100 }, (_, i) => i < hits ? hit : miss).reduce((sum, duration) => sum + duration, 0);
      const actual = E.average(hit, miss, E.ratio(hits, 100));
      assert.equal(actual.n * 100n, BigInt(total) * actual.d);
    }
  }
});

test("input validation excludes blanks, fractional and exponent notation; exact numerator operations stay safe", () => {
  for (const key of E.keys) {
    for (const raw of ["", " ", "-1", "1.5", "1e3", "NaN", "Infinity", "100000001", "9007199254740993", "１２"]) assert.throws(() => E.integer(raw, key));
    assert.equal(E.integer("00012", key), 12); assert.equal(E.integer("100000000", key), 100000000);
    if (["cache", "main"].includes(key)) assert.throws(() => E.integer("0", key)); else assert.equal(E.integer("0", key), 0);
  }
});

test("saved generator input decoding uses the recorded contract; boundary inputs and 64 seeded questions preserve every option and source", async () => {
  const b = fixture(), t = b.templates.find(t => t.id === "template-source-2024-a-3")!;
  const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(t.originalContentSha256, await contentHash(base));
  for (const percent of [70, 96]) for (const scale of [1, 5]) for (const cy of [5, 30]) for (const mx of [100, 600]) {
    const context = { generation: { generatorRef: t.generatorRef, parameters: { values: [percent, scale, cy, mx] } } };
    const data = E.initialState(context).data; verify(data); assert.equal(value(E.solve(data).h), percent / 100);
  }
  for (let i = 0; i < 64; i++) {
    const parameters = await parametersForSeed(i.toString(16).padStart(32, "0"), t);
    const q = bindQuestion(base, t, parameters.values, "cache-test", "2026-10-19T00:00:00Z");
    const context = { question: q, generation: { generatorRef: t.generatorRef, parameters }, choiceOrder: [...q.choices].reverse().map((c, j) => ({ id: c.id, label: "アイウエ"[j] })) };
    const before = JSON.stringify(context), initial = E.initialState(context), m = verify(initial.data);
    assert(initial.saved); assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
    const table = q.prompt.blocks.find(block => block.type === "table")!;
    assert(table.type === "table");
    assert.deepEqual(table.rows, [["キャッシュメモリ", String(initial.data.xh), String(initial.data.yh)], ["主記憶", String(initial.data.xm), String(initial.data.ym)]]);
    const choices = E.choices(context), matches = choices.filter((c: any) => {
      const x = E.average(initial.data.xh, initial.data.xm, c.h), y = E.average(initial.data.yh, initial.data.ym, c.h);
      return x.n * y.d === y.n * x.d;
    });
    assert.equal(matches.length, 1); assert.equal(matches[0].id, q.correctAnswer.choiceId);
    assert.equal(value(matches[0].h), value(m.h)); assert.equal(JSON.stringify(context), before);
  }
  assert.deepEqual(plain(E.initialState(null).data), plain(E.defaults));
  for (const generation of [{ generatorRef: { ...t.generatorRef, version: "unknown" }, parameters: t.referenceParameters }, { generatorRef: t.generatorRef, parameters: { values: [0, 2, 20, 400] } }]) assert.throws(() => E.initialState({ generation }));
});

test("managed package loads with rights and shared assets; current saved answers stay intact and bookmarks use current revisions", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2024-a-3")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://cache.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7); assert.equal(pkg.manifest.attribution.origin, "adapted");
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2024-a", "rights-original"]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
  for (const id of [q.id, "question-template-source-2024-a-3"]) assert.equal(makeBookmark(b, { questionId: id, revision: 1 }, 0).questionRef.revision, q.revision);
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: q.id, revision: q.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run); await validateRun(run); assert.equal(JSON.stringify(run), before);
  const old = structuredClone(run); old.issued[0].revision--;
  // No historical content fixture: a reference mismatch cannot resume as current.
  await assert.rejects(() => validateRun(old));
});
