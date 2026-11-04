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

const root = "public/explanations/ipa-2017-spring-am-20/", sandbox: any = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(root + "dac-engine.js", "utf8"), sandbox);
const E = sandbox.window.DacEngine;
const plain = (v: any) => JSON.parse(JSON.stringify(v));
await installFixtureGenerators();

test("official D/A conditions and all four fractions independently identify answer A by cross multiplication", () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2017h29h-fe-am-20")!;
  const m = E.solve(E.defaults, 128);
  assert.equal(m.unit.n, 5n); assert.equal(m.unit.d, 256n);
  assert.equal(E.display(m.unit), "0.01953125"); assert.equal(E.display(m.output), "2.5");
  assert.equal(m.levels, 256); assert.equal(m.max, 255);
  const order = [...q.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] }));
  const choices = E.choices({ question: q, choiceOrder: order });
  assert.deepEqual(Array.from(choices, (c: any) => c.text), ["2.5/512", "2.5/256", "2.5/255", "2.5/128"]);
  // V(code)/code is fixed by the two known points, independent of the engine.
  const matching = choices.filter((c: any) => c.value.n * 128n * 2n === 5n * c.value.d);
  assert.equal(matching.length, 1); assert.equal(matching[0].id, q.correctAnswer.choiceId); assert.equal(matching[0].label, "エ");
  for (const c of choices) assert.equal(E.same(E.outputFor(c.value, 128), m.voltage), c.denominator === 128);
});

test("every code for all 2 to 12 bit resolutions agrees with independent weighted-bit summation and unit increments", () => {
  for (let bits = 2; bits <= 12; bits++) {
    const reference = 2 ** (bits - 1), max = 2 ** bits - 1;
    for (let code = 0; code <= max; code++) {
      const m = E.solve({ bits, reference, volts: "2.5" }, code);
      // Repeated division extracts each digit without using engine weights/binary.
      let rest = code, total = 0n, weight = 1n, digits = "";
      for (let p = 0; p < bits; p++) { const bit = rest % 2; total += BigInt(bit) * weight; digits = bit + digits; rest = Math.floor(rest / 2); weight *= 2n; }
      assert.equal(m.binary, digits);
      assert.equal(m.output.n * 2n * BigInt(reference), total * 5n * m.output.d);
      if (code > 0) {
        const previous = E.solve({ bits, reference, volts: "2.5" }, code - 1).output;
        assert.equal((m.output.n * previous.d - previous.n * m.output.d) * m.unit.d, m.unit.n * m.output.d * previous.d);
      }
      for (let i = 0; i < bits; i++) assert.equal(m.contributions[i].n * 2n * BigInt(reference), 5n * BigInt(2 ** (bits - i - 1)) * m.contributions[i].d);
    }
  }
});

test("all 24 recorded generator inputs preserve conditions, every option, unique answer and immutable saved order", async () => {
  const b = fixture(), t = b.templates.find(t => t.id === "template-source-2017h29h-fe-am-20")!;
  const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(t.originalContentSha256, await contentHash(base));
  for (let bits = 7; bits <= 10; bits++) for (let half = 1; half <= 6; half++) {
    const q = bindQuestion(base, t, [bits, half], "dac-content", "2026-11-04T00:00:00Z");
    const context = { question: q, generation: { generatorRef: t.generatorRef, parameters: { values: [bits, half] } }, choiceOrder: [...q.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) };
    const before = JSON.stringify(context), data = E.initialState(context), m = E.solve(data);
    assert.deepEqual(plain(data), { bits, reference: 2 ** (bits - 1), volts: String(half / 2) });
    const prompt = q.prompt.blocks.map((block: any) => block.text ?? "").join("");
    assert(prompt.includes(`${bits}ビット`) && prompt.includes(`ディジタル値${data.reference}`) && prompt.includes(`${data.volts}V`));
    assert.equal(m.unit.n * 2n * BigInt(data.reference), BigInt(half) * m.unit.d);
    const options = E.choices(context), matching = options.filter((c: any) => c.value.n * 2n * BigInt(data.reference) === BigInt(half) * c.value.d);
    assert.equal(options.length, 4); assert.equal(matching.length, 1); assert.equal(matching[0].id, q.correctAnswer.choiceId);
    assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef); assert.equal(JSON.stringify(context), before);
    for (let i = 0; i < 4; i++) assert.equal(options[i].label, context.choiceOrder[i].label);
  }
  for (const generation of [{ generatorRef: { ...t.generatorRef, version: "unknown" }, parameters: { values: [8, 5] } }, { generatorRef: t.generatorRef, parameters: { values: [6, 5] } }, { generatorRef: t.generatorRef, parameters: { values: [8, 7] } }]) assert.throws(() => E.initialState({ generation }));
});

test("exploration includes maximum calibration, fractional outputs, boundary volts and invalid input rejection", () => {
  for (const bits of [2, 8, 12]) for (const reference of [1, 2 ** (bits - 1), 2 ** bits - 1]) for (const volts of ["0.001", "2.5", "100"]) {
    const m = E.solve({ bits, reference, volts }, reference);
    assert(E.same(m.output, m.voltage)); assert.equal(E.solve(m.data, 0).output.n, 0n);
    const [w, p = ""] = volts.split(".");
    const num = BigInt(w + p), den = 10n ** BigInt(p.length);
    assert.equal(m.unit.n * den * BigInt(reference), num * m.unit.d);
  }
  assert.equal(E.display(E.ratio(1n, 3n)), "1/3"); assert.equal(E.display(E.ratio(1n, 100000000n)), "0.00000001");
  for (const value of ["", " ", "1e2", "-1", "NaN", "Infinity", "１２", "1.5"]) assert.throws(() => E.integer(value, 0, 4095));
  for (const value of ["", "0", "-1", "100.001", "1e1", ".5", "1.0001", "Infinity"]) assert.throws(() => E.decimal(value));
  for (const input of [{ bits: 1, reference: 1, volts: "1" }, { bits: 13, reference: 1, volts: "1" }, { bits: 8, reference: 0, volts: "1" }, { bits: 8, reference: 256, volts: "1" }]) assert.throws(() => E.solve(input));
  assert.throws(() => E.solve(E.defaults, 256)); assert.throws(() => E.solve(E.defaults, -1));
});

test("managed D/A package validates declared bytes, attribution and exact shared theme and scrollbar styles", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2017h29h-fe-am-20")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://dac.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7);
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2017h29h-fe-am-numeric-candidates", "rights-original"]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});

test("current snapshots remain unchanged; outdated references reject resume and bookmarks resolve current D/A revision", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2017h29h-fe-am-20")!;
  assert.equal(q.revision, 2);
  assert.equal(makeBookmark(b, { questionId: q.id, revision: 1 }, 0).questionRef.revision, 2);
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: q.id, revision: q.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run); await validateRun(run); assert.equal(JSON.stringify(run), before);
  const old = structuredClone(run); old.issued[0].revision--; await assert.rejects(() => validateRun(old));
});
