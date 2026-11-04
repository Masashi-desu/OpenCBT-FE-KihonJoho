import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture } from "./fixtures";
import { bindQuestion, parametersForSeed } from "../src/core/generation";
import { contentHash } from "../src/core/hash";
import { loadDetailPackage, validateDetailAttribution } from "../src/core/detailed-explanation";
import { makeBookmark } from "../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../src/core/session";

const root = "public/explanations/ipa-sample-2022-dec-a-2/", sandbox: any = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(root + "binary-engine.js", "utf8"), sandbox);
const E = sandbox.window.BinaryEngine, plain = (v: any) => JSON.parse(JSON.stringify(v));

// Independent, reviewed instruction tuples transcribed from the four rows of
// official question p.4. Evaluate assignment statements without engine helpers.
const programs = [
  [["j", "quotient"], ["array", "remainder"]],
  [["j", "remainder"], ["array", "quotient"]],
  [["array", "quotient"], ["j", "remainder"]],
  [["array", "remainder"], ["j", "quotient"]],
];
test("all permitted inputs, widths and four programs agree with independent assignment and positional-value oracles at every step", () => {
  for (let width = 5; width <= 8; width++) for (let input = 1; input <= (width === 8 ? 99 : 2 ** width - 1); input++) {
    const expectedBits = Array.from({ length: width }, (_, i) => Number(Boolean(input & (1 << i))));
    for (let option = 0; option < 4; option++) {
      const m = E.trace(input, width, option); let j = input;
      const array: (number | null)[] = Array(width).fill(null);
      assert.equal(m.states.length, width * 4 + 2);
      assert.deepEqual(plain(m.states[0].cells), array);
      for (let k = 1; k <= width; k++) {
        const loop = m.states[1 + 4 * (k - 1)];
        assert.equal(loop.phase, "loop"); assert.equal(loop.k, k); assert.equal(loop.j, j);
        for (let p = 0; p < 2; p++) {
          const [target, operator] = programs[option][p], before = j;
          // Bit shift and bit mask are independent of the simulator's division.
          const value = operator === "quotient" ? j >> 1 : j & 1;
          if (target === "j") j = value; else array[k - 1] = value;
          const s = m.states[2 + 4 * (k - 1) + p];
          assert.equal(s.phase, p ? "b" : "a"); assert.equal(s.j, j);
          assert.deepEqual(plain(s.cells), array);
          assert.equal(s.action.before, before); assert.equal(s.action.result, value);
          assert.equal(s.action.quotient * 2 + s.action.remainder, before);
          assert.equal(s.action.store, target === "array"); assert.equal(s.action.mod, operator === "remainder");
          assert(s.text.includes(String(value)));
        }
        const repeat = m.states[4 * k]; assert.equal(repeat.phase, "repeat"); assert.equal(repeat.j, j); assert.deepEqual(plain(repeat.cells), array);
      }
      const end = m.states.at(-1); assert.equal(end.phase, "end"); assert.deepEqual(plain(end.cells), array);
      const valid = array.every(n => n === 0 || n === 1);
      assert.equal(m.validBits, valid);
      const decoded = valid ? array.reduce<number>((n, bit, i) => n + bit! * 2 ** i, 0) : null;
      assert.equal(m.decoded, decoded); assert.equal(m.matches, decoded === input);
      if (option === 3) {
        assert.deepEqual(array, expectedBits); assert.equal(j, 0);
        assert.equal(m.output, input.toString(2).padStart(width, "0")); assert(m.matches);
      } else assert.equal(m.matches, false);
    }
  }
});

test("teaching example, zero padding and erroneous updates have distinct truthful explanations", () => {
  const correct = E.trace(13, 8, 3);
  assert.equal(correct.output, "00001101");
  assert.equal(correct.states[2].j, 13); assert.equal(correct.states[2].cells[0], 1);
  assert.equal(correct.states[3].j, 6); assert.equal(correct.states[3].cells[0], 1);
  assert(correct.states.at(-1).text.includes("0になった後"));
  assert.equal(E.trace(13, 8, 0).decoded, 6);
  assert.equal(E.trace(13, 8, 1).decoded, 0);
  assert.equal(E.trace(13, 8, 2).states[2].cells[0], 6);
  assert(E.trace(13, 8, 2).states[2].text.includes("桁になりません"));
  assert.equal(E.trace(1, 8, 2).decoded, 0);
  for (const option of [0, 1, 2]) assert.equal(E.trace(13, 8, option).matches, false);
  const retained = JSON.stringify(correct.states[0]); correct.states[3].cells[0] = 7;
  assert.equal(JSON.stringify(correct.states[0]), retained);
});

test("integer boundaries and unsupported saved conditions reject invalid input without reinterpretation", () => {
  for (let w = 5; w <= 8; w++) {
    const max = w === 8 ? 99 : 2 ** w - 1;
    assert.equal(E.integer("0001", w), 1); assert.equal(E.integer(String(max), w), max);
    for (const v of ["", " ", "0", "-1", "1.5", "1e1", "１２", "Infinity", "NaN", String(max + 1)]) assert.throws(() => E.integer(v, w));
  }
  for (const [w, p] of [[4, 3], [9, 3], [8, -1], [8, 4], [6.5, 0]]) assert.throws(() => E.trace(13, w, p));
  for (const generation of [{ generatorRef: { id: "unknown", version: "3.2.0" }, parameters: { values: [8] } }, { generatorRef: { id: "generator-source-sample-2022-dec-a-2", version: "next" }, parameters: { values: [8] } }, { generatorRef: { id: "generator-source-sample-2022-dec-a-2", version: "3.2.0" }, parameters: { values: [8, 1] } }]) assert.throws(() => E.initial({ generation }));
});

test("all generated widths and shuffled choice labels use saved contracts and never mutate question or generation data", async () => {
  const b = fixture(), t = b.templates.find(t => t.id === "template-source-sample-2022-dec-a-2")!;
  const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(t.originalContentSha256, await contentHash(base));
  for (const width of [5, 6, 7, 8]) {
    const q = bindQuestion(base, t, [width], "binary-test", "2026-11-04T00:00:00Z");
    assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
    const context = { question: q, generation: { generatorRef: t.generatorRef, parameters: { values: [width] } }, choiceOrder: [...q.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) };
    const before = JSON.stringify(context); assert.equal(E.initial(context).width, width);
    const choices = E.choices(context); assert.equal(choices[3].label, "ア"); assert.equal(choices[3].id, q.correctAnswer.choiceId);
    choices.forEach((c: any) => { const table = q.choices.find(v => v.id === c.id)!.content.blocks.find(v => v.type === "table")!; assert(table.type === "table"); assert.deepEqual(table.rows[0], [c.a, c.b]); });
    assert.equal(JSON.stringify(context), before);
  }
  const widths = new Set();
  for (let seed = 0; seed < 32; seed++) { const p = await parametersForSeed(seed.toString(16).padStart(32, "0"), t); widths.add(E.initial({ generation: { generatorRef: t.generatorRef, parameters: p } }).width); }
  assert.equal(widths.size, 4);
  const q = b.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-2")!;
  assert.equal(E.choices({ question: q })[3].id, q.correctAnswer.choiceId);
});

test("managed package validates resource hashes, original rights, official page locators and shared theme", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-2")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://binary.invalid/"), undefined, fetcher);
  assert(pkg); validateDetailAttribution(pkg.manifest, b);
  assert.equal(pkg.manifest.files.length, 7); assert.equal(pkg.manifest.attribution.origin, "adapted");
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-sample-2022-dec-a", "rights-original"]);
  assert.deepEqual(pkg.manifest.references?.sourceRefs.map(s => s.locator.page), [4, 1]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});

test("saved current answers retain issued data and old bookmarks resolve the current optional explanation", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-2")!;
  for (const id of [q.id, "question-template-source-sample-2022-dec-a-2"]) assert.equal(makeBookmark(b, { questionId: id, revision: 1 }, 0).questionRef.revision, q.revision);
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: q.id, revision: q.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run); await validateRun(run); assert.equal(JSON.stringify(run), before);
  const old = structuredClone(run); old.issued[0].revision--;
  await assert.rejects(() => validateRun(old));
});
