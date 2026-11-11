import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture, installFixtureGenerators } from "../fixtures";
import { bindQuestion } from "../../src/core/generation";
import { contentHash } from "../../src/core/hash";
import { loadDetailPackage } from "../../src/core/detailed-explanation";
import { makeBookmark } from "../../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, validateRun } from "../../src/core/session";

const root = "public/explanations/ipa-2019-autumn-am-28/", sandbox: any = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(root + "transaction-engine.js", "utf8"), sandbox);
const E = sandbox.window.TransactionEngine;
const plain = (v: any) => JSON.parse(JSON.stringify(v));
await installFixtureGenerators();

// Reviewed independently from the simulator. Fixed five-state model from the
// official Q28/answer and its distinction between completion and processing.
const reference: Record<string, string[]> = {
  active: ["committing", "aborting"], committing: ["committed", "aborting"],
  committed: [], aborting: ["aborted"], aborted: [],
};
test("all 25 state pairs match the independently reviewed relation; completed transactions cannot resume", () => {
  assert.deepEqual(Object.keys(E.states).sort(), Object.keys(reference).sort());
  for (const from of Object.keys(reference)) for (const to of Object.keys(reference)) assert.equal(E.canMove(from, to), reference[from].includes(to), `${from} -> ${to}`);
  assert.equal(E.canMove("unknown", "active"), false);
  assert(Object.isFrozen(E.states) && Object.isFrozen(E.edges) && Object.isFrozen(E.scenarios[0].events));
});
test("every step of all three finite paths covers all five legal edges without mutating prior snapshots", () => {
  const expected = { normal: ["active", "committing", "committed"], cancel: ["active", "aborting", "aborted"], failure: ["active", "committing", "aborting", "aborted"] };
  const transitions = new Set<string>();
  for (const [scenario, sequence] of Object.entries(expected)) {
    const result = E.trace(scenario), before = JSON.stringify(result);
    assert.deepEqual(plain(result.map((s: any) => s.state)), sequence);
    result.forEach((s: any, i: number) => {
      assert.equal(s.passed.length, i); assert(s.title && s.text);
      if (i) { assert(reference[result[i - 1].state].includes(s.state)); transitions.add(`${result[i - 1].state}/${s.state}`); }
    });
    // UI may move/revisit a snapshot; no calculation or history changes.
    for (const i of [result.length - 1, 0, 1, result.length - 1]) assert.equal(result[i].state, sequence[i]);
    assert.equal(JSON.stringify(result), before);
    result.at(-1).passed.push("probe"); assert.equal(result[0].passed.length, 0);
    assert.deepEqual(plain(E.trace(scenario).map((s: any) => s.state)), sequence);
  }
  assert.equal(transitions.size, 5); assert.throws(() => E.trace("unknown"));
});
test("official four options independently identify only B as impossible, retaining every pair and label", () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-28")!;
  const choices = E.choices({ question: q }), pairs = [["aborting", "aborted"], ["aborting", "committing"], ["committing", "aborting"], ["committing", "committed"]];
  assert.deepEqual(plain(choices.map((c: any) => [c.from, c.to])), pairs);
  const impossible = choices.filter((c: any) => !reference[c.from].includes(c.to));
  assert.equal(impossible.length, 1); assert.equal(impossible[0].id, q.correctAnswer.choiceId); assert.equal(impossible[0].label, "イ");
  for (const c of choices) { assert.equal(c.possible, reference[c.from].includes(c.to)); assert(E.explainChoice(c).length > 30); }
  assert.match(E.explainChoice(choices[2]), /完了前/);
});
test("all four generated cases match rendered question rows and independently unique answers, without changing saved context", async () => {
  const b = fixture(), t = b.templates.find(t => t.id === "template-source-2019r01a-fe-am-28")!, base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(t.originalContentSha256, await contentHash(base));
  const impossiblePairs = [["aborting", "committing"], ["aborting", "committed"], ["aborted", "committed"], ["committed", "aborting"]];
  for (let v = 0; v <= 3; v++) {
    const q = bindQuestion(base, t, [v], "transaction-content", "2026-11-05T00:00:00Z");
    const context = { question: q, generation: { generatorRef: t.generatorRef, parameters: { values: [v] } }, choiceOrder: q.choices.map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) }, before = JSON.stringify(context);
    const choices = E.choices(context), table = q.prompt.blocks.find(b => b.type === "table")!;
    assert.equal(E.variant(context), v); assert.deepEqual(plain([choices[1].from, choices[1].to]), impossiblePairs[v]);
    for (const [i, c] of choices.entries()) {
      assert(table.type === "table"); assert.deepEqual(table.rows[i], [c.label, E.states[c.from].name, E.states[c.to].name]);
      assert.equal(c.possible, reference[c.from].includes(c.to));
    }
    const impossible = choices.filter((c: any) => !reference[c.from].includes(c.to));
    assert.equal(impossible.length, 1); assert.equal(impossible[0].id, q.correctAnswer.choiceId);
    assert.match(E.explainChoice(impossible[0]), v === 3 ? /確定が完了/ : v === 2 ? /取消しが完了/ : /ロールバック/);
    assert.deepEqual(q.detailedExplanationRef, base.detailedExplanationRef); assert.equal(JSON.stringify(context), before);
  }
  const reversed = E.choices({ choiceOrder: [...base.choices].reverse().map((c, i) => ({ id: c.id, label: "アイウエ"[i] })) });
  assert.equal(reversed[0].id, "choice-value-4"); assert.equal(reversed[2].label, "ウ"); assert.equal(reversed[2].possible, false);
  for (const values of [[], [0, 1], [-1], [4], [1.5], ["1"], [null]]) assert.throws(() => E.choices({ generation: { generatorRef: t.generatorRef, parameters: { values } } }));
  assert.throws(() => E.variant({ generation: { generatorRef: { ...t.generatorRef, version: "unknown" }, parameters: { values: [0] } } }));
  assert.throws(() => E.choices({ choiceOrder: [{ id: "unknown", label: "ア" }] }));
});
test("managed package pins every byte and inherits exact shared colors, scrollbars and reviewed attribution", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-28")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://transaction.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7);
  assert.deepEqual(pkg.manifest.attribution.rightsRefs, ["rights-ipa-2019r01a-fe-am-stage1-source77", "rights-original"]);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});
test("current runs keep answers and snapshots; old references cannot resume and bookmarks resolve the current revision", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-28")!;
  assert.equal(q.revision, 2); assert.equal(makeBookmark(b, { questionId: q.id, revision: 1 }, 0).questionRef.revision, 2);
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: q.id, revision: q.revision } }, {}));
  run = updateAnswer(run, run.issued[0].choices[0].id);
  const before = JSON.stringify(run); await validateRun(run); assert.equal(JSON.stringify(run), before);
  const old = structuredClone(run); old.issued[0].revision--; await assert.rejects(() => validateRun(old));
});
