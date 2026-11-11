import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture, installFixtureGenerators } from "../fixtures";
import { bindQuestion } from "../../src/core/generation";
import { loadDetailPackage, questionDetailContext } from "../../src/core/detailed-explanation";
import { makeBookmark } from "../../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../../src/core/session";

const directory = "explanations/ipa-2016-spring-am-4/";
const sandbox = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync("public/" + directory + "pcm-engine.js", "utf8"), sandbox);
const engine = sandbox.window.PcmEngine;
const bundle = fixture();
const original = bundle.questions.find(q => q.id === "question-ipa-2016h28h-fe-am-4")!;
const template = bundle.templates.find(t => t.id === "template-source-2016h28h-fe-am-4")!;
const base = bundle.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
await installFixtureGenerators();

test("IPA problem p.5 and answer p.1: all intervals checked by integer cross-multiplication", () => {
  const { bits, rate, choices } = engine.initial(questionDetailContext(original, "light"));
  assert.equal(bits, 8);
  assert.equal(rate, 64000);
  assert.deepEqual(Array.from(choices, (choice: any) => choice.interval), [15.6, 46.8, 125, 128]);
  const model = engine.model(bits, rate);
  assert.equal(model.frequency, 8000);
  assert.equal(model.intervalSeconds, 0.000125);
  assert.equal(model.interval, 125);
  const matching = choices.filter((choice: any) => {
    const lhs = bits * 10_000_000, rhs = Math.round(choice.interval * 10) * rate;
    const reference = lhs === rhs;
    const candidate = engine.compare(model, choice.interval);
    assert.equal(candidate.matches, reference);
    assert.equal(candidate.impliedRate, lhs / Math.round(choice.interval * 10));
    return reference;
  });
  assert.equal(matching.length, 1);
  assert.equal(matching[0].label, "ウ");
  assert.equal(matching[0].id, original.correctAnswer.choiceId);
});

test("sample times, quantization and binary codes agree with the nearest-level search for both bit widths", () => {
  for (const bits of [4, 8]) for (const rate of [16000, 32000, 64000]) {
    const model = engine.model(bits, rate);
    const times = [0, bits * 1e6 / rate, 2 * bits * 1e6 / rate];
    assert.deepEqual(Array.from(model.samples, (sample: any) => sample.time), times);
    assert.equal(model.duration, 3 * bits * 1e6 / rate);
    for (const [i, sample] of model.samples.entries()) {
      assert(Math.abs(sample.position - i / 3) < 1e-15);
      assert.equal(sample.value, engine.amplitude(sample.position));
      const distances = Array.from({ length: 2 ** bits }, (_, n) => Math.abs(sample.value - n / (2 ** bits - 1)));
      assert.equal(sample.level, distances.indexOf(Math.min(...distances)));
      assert.equal(Math.round(Number(sample.value.toFixed(3)) * (2 ** bits - 1)), sample.level);
      assert.equal(sample.code.length, bits);
      assert.equal(parseInt(sample.code, 2), sample.level);
    }
    for (const value of [model.interval, model.interval / 8, model.interval * 2]) {
      const points = engine.compare(model, value).positions;
      assert.equal(points[0], 0);
      assert(points.every((x: number, i: number) => x < 1 && Math.abs(x * model.duration - i * value) < 1e-9));
      assert(points.length * value >= model.duration);
    }
  }
});

test("all four generated conditions and reordered choices match the saved problem with one correct interval", () => {
  for (let index = 0; index < 4; index++) {
    const values = [index], q = bindQuestion(base, template, values, "pcm-content", "2026-11-06T00:00:00Z");
    const prompt = q.prompt.blocks[0];
    assert(prompt.type === "paragraph");
    const [bits, rate] = prompt.text.match(/(\d+)ビットのディジタル.*速度は([\d,]+)ビット/)!.slice(1).map(s => Number(s.replaceAll(",", "")));
    const ctx = { question: q, generation: { generatorRef: template.generatorRef, parameters: { values } },
      choiceOrder: [...q.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) };
    const before = JSON.stringify(ctx), state = engine.initial(ctx);
    assert.equal(state.bits, bits);
    assert.equal(state.rate, rate);
    const model = engine.model(state.bits, state.rate);
    assert.equal(Math.round(model.interval * 10) * rate, bits * 10_000_000);
    const matching = [];
    for (const [i, choice] of state.choices.entries()) {
      const block = q.choices.find(row => row.id === ctx.choiceOrder[i].id)!.content.blocks[0];
      assert(block.type === "paragraph");
      assert.equal(choice.id, ctx.choiceOrder[i].id);
      assert.equal(choice.label, ctx.choiceOrder[i].label);
      assert.equal(choice.interval, Number(block.text));
      const matches = Math.round(Number(block.text) * 10) * rate === bits * 10_000_000;
      assert.equal(engine.compare(model, choice.interval).matches, matches);
      if (matches) matching.push(choice.id);
    }
    assert.deepEqual(matching, [q.correctAnswer.choiceId]);
    assert.equal(JSON.stringify(ctx), before);
    assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
  }
  for (const values of [[], [4], [-1], [1.5], [0, 0], ["0"]]) {
    assert.throws(() => engine.initial({ generation: { generatorRef: template.generatorRef, parameters: { values } } }));
  }
  assert.throws(() => engine.initial({ generation: { generatorRef: { ...template.generatorRef, version: "9.0.0" }, parameters: { values: [0] } } }));
});

test("optional package verifies each resource, IPA sources and shared theme assets", async () => {
  const fetcher = (async (url: URL) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(original.detailedExplanationRef!, new URL("https://pcm.invalid/"), undefined, fetcher);
  assert(pkg);
  assert.equal(pkg.manifest.files.length, 7);
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2016h28h-fe-am", "rights-original"]);
  assert.deepEqual(pkg.manifest.attribution.sourceRefs.map(r => [r.sourceId, r.locator.page, r.locator.questionNumber]),
    [["source-ipa-2016h28h-fe-am-qs", 5, "4"], ["source-ipa-2016h28h-fe-am-ans", 1, "4"]]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) {
    assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
  }
});

test("bookmarks resolve to the current PCM reference and answered runs follow revision compatibility", async () => {
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
