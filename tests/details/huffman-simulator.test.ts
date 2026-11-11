import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture, installFixtureGenerators } from "../fixtures";
import { bindQuestion } from "../../src/core/generation";
import { loadDetailPackage, questionDetailContext, type DetailContext } from "../../src/core/detailed-explanation";
import { makeBookmark } from "../../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../../src/core/session";

type Letter = { symbol: string; weight: number; code: string };
type Node = { label: string; weight: number; code: string; born: number; children: Node[] };
type Choice = { id: string; label: string; code: string };
type Lesson = { root: Node; nodes: Map<string, Node>; merges: { parent: Node; operands: Node[]; ties: Node[] }[];
  letters: Letter[]; fixedWidth: number; fixedBits: number; huffmanBits: number };
const directory = "explanations/ipa-2018-autumn-am-4/";
const sandbox = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync("public/" + directory + "huffman-engine.js", "utf8"), sandbox);
const engine: {
  initial(context?: DetailContext): { rows: Letter[]; choices: Choice[] };
  model(rows: Letter[]): Lesson;
  compare(model: Lesson, code: string): { path: string; matches: boolean; collisions: { row: Letter; kind: string }[] };
} = sandbox.window.HuffmanEngine;

const bundle = fixture(), source = "2018h30a-fe-am-4";
const original = bundle.questions.find(q => q.id === "question-ipa-" + source)!;
const template = bundle.templates.find(t => t.id === "template-source-" + source)!;
const base = bundle.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
await installFixtureGenerators();

// Each prefix occupies an interval of 4-bit integers. Intersections detect
// collisions without traversing a trie or using the lesson's prefix tests.
function interval(code: string) {
  const start = parseInt(code.padEnd(4, "0"), 2);
  return [start, start + 2 ** (4 - code.length)];
}
function overlaps(left: string, right: string) {
  const [a, b] = interval(left), [c, d] = interval(right);
  return a < d && c < b;
}

function minimumCost(weights: number[]): number {
  if (weights.length === 1) return 0;
  // Try every pair, including pairs that a greedy algorithm would skip.
  return Math.min(...weights.flatMap((a, i) => weights.slice(i + 1).map((b, offset) =>
    a + b + minimumCost([...weights.filter((_, k) => k !== i && k !== i + 1 + offset), a + b]))));
}

function verify(input: ReturnType<typeof engine.initial>, answerId: string) {
  const { rows, choices } = input, model = engine.model(rows);
  const known = Array.from(rows).filter(row => row.code);
  const freeCodes = [1, 2, 3, 4].flatMap(size =>
    Array.from({ length: 2 ** size }, (_, n) => n.toString(2).padStart(size, "0")))
    .filter(code => known.every(row => !overlaps(row.code, code)));
  const answer = freeCodes[0];
  assert(answer);
  assert.equal(model.letters.find(row => row.symbol === "D")?.code, answer);
  assert.equal(known.reduce((sum, row) => sum + 2 ** -row.code.length, 2 ** -answer.length), 1);

  const active = new Map(rows.map(row => [row.symbol, row.weight]));
  assert.equal(model.merges.length, 4);
  for (const [index, { parent, operands, ties }] of model.merges.entries()) {
    const weights = [...active.values()].sort((a, b) => a - b);
    assert.deepEqual(Array.from(operands, operand => active.get(operand.label)), weights.slice(0, 2));
    assert.deepEqual(Array.from(ties, node => node.label).sort(), weights[1] === weights[2]
      ? [...active].filter(([, weight]) => weight === weights[1]).map(([label]) => label).sort()
      : []);
    assert.equal(parent.born, index + 1);
    assert.equal(parent.weight, weights[0] + weights[1]);
    assert.deepEqual(Array.from(parent.children, child => child.code), [parent.code + "0", parent.code + "1"]);
    for (const child of operands) active.delete(child.label);
    active.set(parent.label, parent.weight);
  }
  assert.deepEqual([...active.values()], [100]);
  assert.equal(model.root.code, "");

  for (const row of rows) {
    const code = row.code || answer;
    const leaf = Array.from(code).reduce((node, bit) => node.children[Number(bit)], model.root);
    assert.equal(leaf.label, row.symbol);
    assert.equal(leaf.weight, row.weight);
  }
  const encoded = rows.flatMap(row => Array(row.weight).fill(row.code || answer)).join("");
  assert.equal(model.huffmanBits, encoded.length);
  assert.equal(model.huffmanBits, minimumCost(rows.map(row => row.weight)));
  assert.equal(model.fixedWidth, 3);
  assert.equal(model.fixedBits, 300);
  assert.equal(model.huffmanBits, 225);

  const correct = [];
  for (const choice of choices) {
    const expected = known.filter(row => overlaps(row.code, choice.code));
    const compared = engine.compare(model, choice.code);
    assert.deepEqual(Array.from(compared.collisions, collision => collision.row.symbol), expected.map(row => row.symbol));
    assert.deepEqual(Array.from(compared.collisions, collision => collision.kind), expected.map(row =>
      row.code.length === choice.code.length ? "same" : row.code.length < choice.code.length ? "known-prefix" : "candidate-prefix"));
    assert.equal(compared.matches, expected.length === 0);
    assert(model.nodes.has(compared.path));
    if (compared.matches) correct.push(choice.id);
  }
  assert.deepEqual(correct, [answerId]);
  return model;
}

test("IPA p.4 Huffman table, all choices and the official answer lead to the 225-bit encoding", () => {
  const input = engine.initial(questionDetailContext(original, "light"));
  assert.deepEqual(Array.from(input.rows, row => [row.symbol, row.weight, row.code]),
    [["A", 26, "00"], ["B", 25, "01"], ["C", 24, "10"], ["D", 13, ""], ["E", 12, "111"]]);
  assert.deepEqual(Array.from(input.choices, choice => [choice.label, choice.code]),
    [["ア", "001"], ["イ", "010"], ["ウ", "101"], ["エ", "110"]]);
  assert(original.correctAnswer.choiceId);
  const model = verify(input, original.correctAnswer.choiceId);
  assert.deepEqual(Array.from(model.merges, ({ parent }) => parent.weight), [25, 49, 51, 100]);
  assert.deepEqual(Array.from(model.merges, merge => Boolean(merge.ties.length)), [false, true, false, false]);
  assert.equal(Array.from(model.letters, row => row.code).join(""), "000110110111");
  assert.equal(input.choices.find(choice => choice.id === original.correctAnswer.choiceId)?.label, "エ");
});

test("every generated Huffman table and its four reordered options are checked independently", () => {
  for (const length of [0, 1]) for (const mask of [0, 1, 2, 3]) for (const frequency of [0, 1, 2, 3, 4]) {
    const values = [length, mask, frequency];
    const q = bindQuestion(base, template, values, "huffman-content", "2026-11-06T00:00:00Z");
    const context = { ...questionDetailContext(q, "light"),
      choiceOrder: [...q.choices].reverse().map((choice, i) => ({ id: choice.id, label: "アイウエ"[i] })) };
    const before = JSON.stringify(context), input = engine.initial(context);
    const table = q.prompt.blocks.find(block => block.type === "table")!;
    assert.deepEqual(Array.from(input.rows, row => [row.symbol, row.weight, row.code]),
      table.rows.map(([symbol, weight, code]) => [symbol, Number(weight), symbol === "D" ? "" : code]));
    assert.deepEqual(Array.from(input.choices, choice => [choice.id, choice.label, choice.code]), context.choiceOrder.map(({ id, label }) => {
      const block = q.choices.find(choice => choice.id === id)!.content.blocks[0];
      assert.equal(block.type, "paragraph");
      return [id, label, block.text];
    }));
    assert(q.correctAnswer.choiceId);
    const model = verify(input, q.correctAnswer.choiceId);
    assert.equal(model.letters.find(row => row.symbol === "D")?.code.length, 3 - length);
    assert.equal(JSON.stringify(context), before);
    assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef);
  }
});

const url = new URL("https://huffman.invalid/");
const fetcher = (async (url: URL) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;

test("detail resources and attribution verify", async () => {
  const pkg = await loadDetailPackage(original.detailedExplanationRef!, url, undefined, fetcher);
  assert(pkg);
  assert.equal(pkg.manifest.files.length, 7);
  assert.deepEqual(pkg.manifest.attribution.sourceRefs.map(r => [r.sourceId, r.locator.page, r.locator.questionNumber]),
    [["source-ipa-2018h30a-fe-am-qs", 4, "4"], ["source-ipa-2018h30a-fe-am-ans", 1, "4"]]);
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2018h30a-fe-am-numeric-candidates", "rights-original"]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) {
    assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
  }
});

test("bookmarks resolve to the current detail and generated runs use the current revision", async () => {
  assert.deepEqual(makeBookmark(bundle, { questionId: original.id, revision: 1 }, 0).questionRef, { questionId: original.id, revision: 2 });
  let run = startRun(await prepareRun(bundle, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values",
    bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run);
  await validateRun(run);
  assert.equal(JSON.stringify(run), before);
  assert.deepEqual(run.issued[0].detailedExplanationRef, original.detailedExplanationRef);
  const old = structuredClone(run);
  old.issued[0].revision--;
  await assert.rejects(() => validateRun(old));
});
