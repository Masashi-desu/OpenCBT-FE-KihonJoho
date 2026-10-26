import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compoundQuestion, compoundRun } from "./fixtures/compound-question";
import { fixture } from "./fixtures";
import { answerLabels, gradeAnswer, hasCompleteAnswer, validateAnswerDefinition, validateEntryAnswers } from "../src/core/answers";
import { schema, validateBundle } from "../src/core/validation";
import { startRun, updateAnswer, updatePartAnswer, finishRun, validateRun, resultFor } from "../src/core/session";
import { contentHash } from "../src/core/hash";
import { AnswerChoices } from "../src/ui/AnswerChoices";
import type { Question } from "../src/core/types";
import { bindBodyAnswers, type GeneratedBody } from "../src/core/generators/definition";

test("compound definitions preserve slots and forbid flattening, missing/duplicate keys and foreign choice IDs", () => {
  const q = compoundQuestion(); schema("question", q); validateAnswerDefinition(q);
  const wrong: ((q: Question) => void)[] = [
    q => { q.correctAnswer.choiceId = "choice-one"; },
    q => { q.correctAnswer.parts!.pop(); },
    q => { q.correctAnswer.parts!.push(q.correctAnswer.parts![0]); },
    q => { q.answerParts![0].choiceIds = ["choice-missing"]; },
    q => { q.answerParts![1].choiceIds.pop(); },
    q => { q.answerParts![1].id = q.answerParts![0].id; },
    q => { const answer = q.correctAnswer.parts![1]; if (answer.kind === "unordered") answer.choiceIds.pop(); },
    q => { q.correctAnswer.parts![2] = { kind: "no_correct_answer", partId: "part-f", reason: "" }; },
  ];
  for (const mutate of wrong) {
    const bad = structuredClone(q); mutate(bad);
    assert.throws(() => { schema("question", bad); validateAnswerDefinition(bad); });
  }
});

test("all 256 answer combinations match an independent multiset solution, including duplicates and omitted slots", () => {
  const q = compoundQuestion(), options = [undefined, "choice-one", "choice-two", "choice-three"];
  for (const a of options) for (const b of options) for (const c of options) for (const f of options) {
    const selectedPartChoices = Object.fromEntries([["part-a", a], ["part-b", b], ["part-c", c], ["part-f", f]].filter((pair): pair is [string, string] => pair[1] !== undefined));
    const got = gradeAnswer(q, { selectedPartChoices });
    const complete = Boolean(a && b && c), ordered = [b, c].filter(Boolean).sort();
    const right = a === "choice-two" && JSON.stringify(ordered) === JSON.stringify(["choice-one", "choice-three"]);
    assert.equal(got.outcome, !complete ? "unanswered" : right ? "correct" : "incorrect");
    const groupCorrect = Number(ordered.includes("choice-one")) + Number(ordered.includes("choice-three"));
    const expectedCorrect = Number(a === "choice-two") + groupCorrect;
    assert.equal(got.parts!.filter(p => p.outcome === "correct").length, expectedCorrect);
    assert.equal(got.parts!.filter(p => p.outcome === "unscored").length, 1);
    assert.equal(got.parts!.filter(p => p.outcome === "unanswered").length, [a, b, c].filter(x => !x).length);
    assert.equal(hasCompleteAnswer(q, { selectedPartChoices }), complete);
  }
});

test("answer editing, clearing, reload and immutable result preserve each slot and the order-independent group", async () => {
  let run = startRun(await compoundRun(), 100000);
  const before = await contentHash(run.issued[0]), original = structuredClone(run);
  run = updatePartAnswer(run, "part-a", "choice-two", 100100);
  run = updatePartAnswer(run, "part-b", "choice-three", 100200);
  run = updatePartAnswer(run, "part-c", "choice-one", 100300);
  await validateRun(structuredClone(run));
  assert.equal(original.session.entries[0].selectedPartChoices, undefined);
  assert.equal(await contentHash(run.issued[0]), before);
  assert(hasCompleteAnswer(run.issued[0], run.session.entries[0]));
  run = finishRun(run, "completed", 100400);
  await validateRun(structuredClone(run));
  assert.equal(run.result!.calculationVersion, "learning-accuracy-v2");
  assert.equal(run.result!.learningAccuracyPercent, 100);
  assert.deepEqual(run.result!.partSummary, { total: 4, correct: 3, incorrect: 0, unanswered: 0, unscored: 1, learningAccuracyPercent: 100 });
  const damaged = structuredClone(run); damaged.result!.entries[0].parts![0].outcome = "incorrect";
  await assert.rejects(validateRun(damaged), { code: "RESULT" });
  assert.throws(() => updatePartAnswer(run, "part-a", undefined), { code: "STATE" });
  const editable = startRun(await compoundRun(), 100000);
  const answered = updatePartAnswer(editable, "part-a", "choice-two", 100100);
  assert.equal(updatePartAnswer(answered, "part-a", undefined, 100200).session.entries[0].selectedPartChoices, undefined);
  assert.throws(() => updateAnswer(editable, "choice-one"), { code: "ANSWER_REF" });
  assert.throws(() => updatePartAnswer(editable, "part-a", "foreign"), { code: "ANSWER_REF" });
});

test("partial attempts retain per-slot credit, and an entirely unscored question never gains a fake correct answer", async () => {
  let run = startRun(await compoundRun(), 100000);
  run = updatePartAnswer(run, "part-a", "choice-two", 100100);
  const partial = resultFor(run, 100200);
  assert.equal(partial.unanswered, 1);
  assert.equal(partial.partSummary!.correct, 1);
  assert.equal(partial.partSummary!.unanswered, 2);
  const q = run.issued[0];
  q.answerParts = [q.answerParts![3]];
  q.correctAnswer.parts = [q.correctAnswer.parts![2]];
  run.session.entries[0].selectedPartChoices = undefined;
  validateAnswerDefinition(q);
  const result = resultFor(run, 100300);
  schema("result", result);
  assert.equal(result.unscored, 1);
  assert.equal(result.correct + result.incorrect + result.unanswered, 0);
  assert.equal(result.learningAccuracyPercent, 0);
  assert.equal(result.partSummary!.unscored, 1);
});

test("a timed deadline takes precedence over a slot edit", async () => {
  const ready = await compoundRun(true); ready.exam.timeLimitSeconds = 1;
  const run = startRun(ready, 100000), expired = updatePartAnswer(run, "part-a", "choice-two", 101001);
  assert.equal(expired.session.status, "expired");
  assert.equal(expired.session.entries[0].selectedPartChoices, undefined);
  assert.equal(expired.result!.unanswered, 1);
});

test("a slot selection cannot become a single selection or use another slot's choice, including inherited object names", () => {
  const q = compoundQuestion();
  assert.throws(() => validateEntryAnswers(q, { selectedChoiceId: "choice-two" }), { code: "ANSWER_REF" });
  assert.throws(() => validateEntryAnswers(q, { selectedPartChoices: { missing: "choice-one" } }), { code: "ANSWER_REF" });
  assert.throws(() => validateEntryAnswers(q, { selectedPartChoices: [] as any }), { code: "ANSWER_REF" });
  q.answerParts![0].id = "constructor";
  const key = q.correctAnswer.parts![0]; if (key.kind === "choice") key.partId = "constructor";
  assert.equal(gradeAnswer(q, { selectedPartChoices: {} }).parts![0].outcome, "unanswered");
  const single = fixture().questions[0];
  assert.throws(() => validateEntryAnswers(single, { selectedPartChoices: {} }), { code: "ANSWER_REF" });
  const b = fixture(); b.questions.push(compoundQuestion());
  assert.doesNotThrow(() => schema("question", q));
});

test("rendered groups have separate radio names, retain labels and reveal unscored status only with answers", () => {
  const q = compoundQuestion(), b = fixture(), entry = { choiceOrder: q.choices.map(c => c.id), selectedPartChoices: { "part-a": "choice-two" } };
  const render = (revealed: boolean) => renderToStaticMarkup(createElement(AnswerChoices, { question: q, bundle: b, assetUrls: {}, entry, disabled: false, revealed, showResponse: true }));
  const hidden = render(false), shown = render(true);
  assert.equal((hidden.match(/<fieldset/g) ?? []).length, 4);
  for (const id of ["part-a", "part-b", "part-c", "part-f"]) assert(hidden.includes(`name="answer-${id}"`));
  assert(!hidden.includes("採点対象外"));
  assert(shown.includes("採点対象外")); assert(shown.includes("順不同"));
  assert(shown.includes("設問1 a")); assert(shown.includes("設問3 f"));
  assert(!answerLabels(q).includes("undefined"));
});

test("existing single-choice results keep v1 and do not gain compound metadata", async () => {
  const run = await compoundRun(), single = fixture().questions.find(q => q.id === "question-ipa-2026-b-1")!;
  run.issued = [single]; run.session.entries[0].selectedChoiceId = single.correctAnswer.choiceId;
  delete run.session.entries[0].selectedPartChoices;
  const r = resultFor(run, 100000);
  assert.equal(r.calculationVersion, "learning-accuracy-v1");
  assert(!Object.hasOwn(r, "partSummary")); assert(!Object.hasOwn(r, "unscored"));
  assert(!Object.hasOwn(r.entries[0], "parts"));
  assert.equal(r.correct, 1);
});

test("unordered expected answers retain multiplicity, and generated bodies cannot flatten compound sources", () => {
  const q = compoundQuestion(), key = q.correctAnswer.parts![1];
  assert(key.kind === "unordered"); key.choiceIds = ["choice-one", "choice-one"];
  const answers = { "part-a": "choice-two", "part-b": "choice-one", "part-c": "choice-one" };
  assert.equal(gradeAnswer(q, { selectedPartChoices: answers }).outcome, "correct");
  assert.equal(gradeAnswer(q, { selectedPartChoices: { ...answers, "part-c": "choice-three" } }).outcome, "incorrect");
  const body: GeneratedBody = { prompt: q.prompt.blocks, choices: q.choices.map(c => c.content.blocks),
    explanation: "", answerParts: q.answerParts, partAnswers: q.correctAnswer.parts };
  const generated = structuredClone(q);
  bindBodyAnswers(generated, body, q.correctAnswer.attribution);
  schema("question", generated);
  assert.deepEqual(generated.correctAnswer.parts, q.correctAnswer.parts);
  assert.equal(generated.correctAnswer.choiceId, undefined);
  assert.throws(() => bindBodyAnswers(structuredClone(q), { ...body, correctIndex: 0 }, q.correctAnswer.attribution), { code: "SOURCE_FORMAT" });
  assert.throws(() => bindBodyAnswers(structuredClone(q), { ...body, answerParts: undefined, partAnswers: undefined }, q.correctAnswer.attribution), { code: "SOURCE_FORMAT" });
  const single = fixture().questions[0];
  assert.throws(() => bindBodyAnswers(structuredClone(single), body, single.correctAnswer.attribution), { code: "SOURCE_FORMAT" });
});
