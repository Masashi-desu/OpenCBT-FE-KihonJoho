import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture, installFixtureGenerators } from "./fixtures";
import { bindQuestion } from "../src/core/generation";
import { loadDetailPackage, questionDetailContext } from "../src/core/detailed-explanation";
import { makeBookmark } from "../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../src/core/session";

const root = "public/explanations/ipa-2016-autumn-am-21/", sandbox = vm.createContext({ window: {} as any });
vm.runInContext(fs.readFileSync(root + "led-engine.js", "utf8"), sandbox);
const E = sandbox.window.LedEngine;
const plain = (v: any) => JSON.parse(JSON.stringify(v));
const bundle = fixture(), original = bundle.questions.find(q => q.id === "question-ipa-2016h28a-fe-am-21")!;
const template = bundle.templates.find(t => t.id === "template-source-2016h28a-fe-am-21")!;
const base = bundle.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
await installFixtureGenerators();

// Terminal order from the physical connections in the IPA diagram (p.13).
const wiring = ["Dt", "g", "f", "e", "d", "c", "b", "a"];
function reference(byte: number) {
  return wiring.map((segment, i) => {
    const bit = Math.floor(byte / 2 ** (7 - i)) % 2;
    return { segment, number: 7 - i, bit, on: bit === 0 };
  });
}
test("original source: 92, active-low wiring and each of the four drawings, including Dt", () => {
  const ctx = questionDetailContext(original, "light");
  assert.equal(E.initial(ctx), 146);
  const state = E.snapshot(146, 11);
  assert.equal(state.bits, "10010010");
  assert.deepEqual(plain(state.ports.filter((p: any) => p.on).map((p: any) => p.segment)).reverse(), ["a", "c", "d", "f", "g"]);
  // Read lit segments directly from the four official drawings, not from the generated masks.
  const drawn = ["abcdgDt", "bcfg", "acdfg", "acdefgDt"];
  const choices = E.choices(ctx);
  choices.forEach((choice: any, i: number) => {
    const lit = reference(255 - choice.mask).filter(p => p.on).map(p => p.segment).reverse().join("");
    assert.equal(lit, drawn[i]);
  });
  assert.deepEqual(plain(choices.map((c: any) => E.differences(state.mask, c.mask))),
    [["b", "f", "Dt"], ["a", "b", "d"], [], ["e", "Dt"]]);
  assert.equal(choices.find((c: any) => c.mask === state.mask).id, original.correctAnswer.choiceId);
});

test("all 256 bytes across every step: high/low nibbles, terminal order, active-low and cumulative display", () => {
  for (let byte = 0; byte < 256; byte++) for (let step = 0; step <= 11; step++) {
    const expected = reference(byte), m = E.snapshot(byte, step);
    assert.equal(m.bits, expected.map(p => p.bit).join(""));
    assert.deepEqual(plain(m.ports), expected.map(({ on, ...p }, i) => ({
      ...p, converted: step >= (i < 4 ? 1 : 2), current: step === 3 + i, on: step >= 3 + i ? on : null,
    })));
    assert.equal(m.active?.segment, expected[step - 3]?.segment);
    assert.equal(m.mask, expected.reduce((sum, p) => sum + (p.on ? 2 ** p.number : 0), 0));
    assert.equal(E.parseHex(E.hex(byte)), byte);
  }
  for (const bad of ["", "A", "000", "0x", " 92", "92 ", "G0", "９Ｇ", "⑨2", "ﬀ", "9\n"]) assert.equal(E.parseHex(bad), null);
  assert.equal(E.parseHex("ｆＦ"), 255);
  assert.equal(E.parseHex("aB"), 171);
  for (const input of [-1, 256, 1.2, "92"]) assert.throws(() => E.snapshot(input, 0));
  for (const input of [-1, 12, 1.2]) assert.throws(() => E.snapshot(0, input));
});

test("all 8 saved generated conditions recover the byte and reordered choices without reading the prompt or answer", () => {
  for (let index = 0; index < 8; index++) {
    const values = [index], q = bindQuestion(base, template, values, "led-content", "2026-11-06T00:00:00Z");
    const prompt = q.prompt.blocks.find(b => b.type === "paragraph");
    assert(prompt?.type === "paragraph");
    const input = prompt.text.match(/16進数で([0-9A-F]{2})/)![1], byte = parseInt(input, 16);
    const ctx = { question: { choices: q.choices }, generation: { generatorRef: template.generatorRef, parameters: { values } },
      choiceOrder: [...q.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) };
    const before = JSON.stringify(ctx), start = E.initial(ctx), choices = E.choices(ctx), state = E.snapshot(start, 11);
    assert.equal(start, byte);
    assert.deepEqual(plain(choices.map(({ id, label }: any) => ({ id, label }))), ctx.choiceOrder);
    const correct = choices.filter((c: any) => E.differences(state.mask, c.mask).length === 0);
    assert.equal(correct.length, 1); assert.equal(correct[0].id, q.correctAnswer.choiceId);
    for (const c of choices) {
      const block = q.choices.find(row => row.id === c.id)!.content.blocks[0];
      assert(block.type === "diagram" && block.scene.kind === "source_figure");
      const lit = reference(255 - block.scene.values[0]), result = reference(byte);
      assert.deepEqual(plain(E.differences(state.mask, c.mask)).sort(),
        lit.filter((p, i) => p.on !== result[i].on).map(p => p.segment).sort());
    }
    E.snapshot(0, 11);
    assert.equal(JSON.stringify(ctx), before);
    assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
  }
  for (const values of [[], [8], [-1], [1.5], [0, 0], ["0"]]) {
    assert.throws(() => E.initial({ generation: { generatorRef: template.generatorRef, parameters: { values } } }));
  }
  assert.throws(() => E.initial({ generation: { generatorRef: { ...template.generatorRef, version: "9.0.0" }, parameters: { values: [0] } } }));
});

test("optional package verifies all resources, exact source and common theme assets", async () => {
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(original.detailedExplanationRef!, new URL("https://led.invalid/"), undefined, fetcher);
  assert(pkg);
  assert.equal(pkg.manifest.files.length, 7);
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2016h28a-fe-am", "rights-original"]);
  assert.deepEqual(pkg.manifest.attribution.sourceRefs.map(r => [r.sourceId, r.locator.page, r.locator.questionNumber]),
    [["source-ipa-2016h28a-fe-am-qs", 13, "21"], ["source-ipa-2016h28a-fe-am-ans", 1, "21"]]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) {
    assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
  }
});

test("old bookmark resolves current detail; current answered generated run validates, old reference does not", async () => {
  assert.equal(original.revision, 2);
  assert.equal(makeBookmark(bundle, { questionId: original.id, revision: 1 }, 0).questionRef.revision, 2);
  let run = startRun(await prepareRun(bundle, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values",
    bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run);
  await validateRun(run);
  assert.equal(JSON.stringify(run), before);
  const old = structuredClone(run);
  old.issued[0].revision--;
  await assert.rejects(() => validateRun(old));
});
