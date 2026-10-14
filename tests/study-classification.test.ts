import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture } from "./fixtures";
import oldHashes from "./fixtures/pre-classification-hashes.json";
import bookmarkRevisions from "../src/core/bookmark-revisions.json";
import supplementalRevisions from "../src/core/supplemental-bookmark-revisions.json";
import preSort from "./fixtures/pre-sort-revisions.json";
import preArrow from "./fixtures/pre-arrow-revisions.json";
import { generationCoverage } from "../src/core/generation-coverage";
import { bindQuestion } from "../src/core/generation";
import { contentHash } from "../src/core/hash";
import { schema, validateBundle } from "../src/core/validation";
import { makeBookmark, refreshBookmark } from "../src/core/bookmarks";
import { refKey, refOf, type Ref } from "../src/core/types";
import {
  prepareRun, startRun, updateAnswer, finishRun, validateRun, appendRunQuestion,
} from "../src/core/session";
import { BookmarkLearning } from "../src/ui/BookmarkLearning";

const migration = bookmarkRevisions as Record<string, string>;
const previousKey = new Map(Object.entries(migration).map(([from, to]) => [to, from]));
for (const [before, after] of Object.entries(supplementalRevisions))
  previousKey.set(after, previousKey.get(before)!);
function previousRef(ref: Ref): Ref {
  const key = previousKey.get(refKey(ref));
  assert(key, refKey(ref));
  const [questionId, revision] = key.split("@");
  return { questionId, revision: Number(revision) };
}

function previousBundle() {
  const b = fixture();
  for (const q of b.questions) {
    const saved = (preArrow.questions as Record<string, unknown>)[q.id];
    if (saved) { Object.assign(q, structuredClone(saved)); delete q.detailedExplanationRef; }
  }
  Object.assign(b.templates.find(t => t.id === preArrow.template.id)!, structuredClone(preArrow.template));
  for (const s of b.sets) {
    const saved = (preArrow.sets as Record<string, unknown>)[s.id];
    if (saved) Object.assign(s, structuredClone(saved));
  }
  // Reconstruct the actual distribution before the later lesson addition, then
  // undo classification. The fixed historical hash oracle remains unchanged.
  for (const q of b.questions) {
    const saved = (preSort.questions as Record<string, unknown>)[q.id];
    if (saved) { Object.assign(q, structuredClone(saved)); delete q.detailedExplanationRef; }
  }
  const template = b.templates.find(t => t.id === preSort.template.id)!;
  Object.assign(template, structuredClone(preSort.template));
  for (const s of b.sets) {
    const revision = (preSort.setRevisions as Record<string, number>)[s.id];
    if (revision) s.revision = revision;
    for (const binding of s.generationBindings) if (binding.templateRef.id === template.id) binding.templateRef.revision = template.revision;
  }
  b.catalog.revision--;
  for (const q of b.questions) {
    const old = previousRef(refOf(q));
    q.revision = old.revision;
    delete q.learning.topics;
    delete q.learning.keywords;
    q.origin.derivedFrom = q.origin.derivedFrom.map(previousRef);
  }
  for (const t of b.templates) {
    t.revision--;
    t.baseQuestionRef = previousRef(t.baseQuestionRef);
    t.originalContentSha256 = (oldHashes as Record<string, string>)[refKey(t.baseQuestionRef)];
  }
  for (const s of b.sets) {
    s.revision--;
    s.questionRefs = s.questionRefs.map(previousRef);
    s.generationBindings = s.generationBindings.map((binding) => ({
      questionRef: previousRef(binding.questionRef),
      templateRef: { ...binding.templateRef, revision: binding.templateRef.revision - 1 },
    }));
  }
  for (const w of b.catalog.withdrawals)
    if (w.replacement) w.replacement = previousRef(w.replacement);
  b.catalog.revision--;
  return b;
}

test("every included question has multiple-topic classification and index words; all generators inherit them", () => {
  const b = fixture(), saved = structuredClone(b);
  for (const row of generationCoverage(b).rows) {
    const t = row.linked[0],
      base = b.questions.find((q) => refKey(refOf(q)) === refKey(t.baseQuestionRef))!;
    for (const q of [row.original, base]) {
      schema("question", q);
      assert(q.learning.topics?.length, q.id);
      assert(q.learning.keywords?.length, q.id);
      assert.deepEqual(q.learning.topics, row.original.learning.topics);
      assert.deepEqual(q.learning.keywords, row.original.learning.keywords);
    }
    const generated = bindQuestion(base, t, t.referenceParameters.values, "instance-topics", "2026-10-13T00:00:00Z");
    assert.deepEqual(generated.learning, base.learning);
    assert.notEqual(generated.learning, base.learning);
  }
  const circuit = b.questions.find((q) => q.id === "question-ipa-2026-a-6")!;
  assert.deepEqual(circuit.learning.topics, ["論理演算", "論理回路"]);
  assert(circuit.learning.keywords?.includes("タイミングチャート"));
  assert.deepEqual(b, saved);
});

test("the metadata revision leaves all historical bodies, choices, answers, explanations and other fields intact", async () => {
  const b = previousBundle();
  assert.equal(Object.keys(oldHashes).length, b.questions.length);
  assert.equal(Object.keys(migration).length, b.questions.length);
  for (const q of b.questions)
    assert.equal(await contentHash(q), (oldHashes as Record<string, string>)[refKey(refOf(q))], q.id);
  await validateBundle(b);
});

test("classification schema accepts old snapshots and rejects incomplete, duplicate or malformed new labels", () => {
  const q = fixture().questions[0];
  const legacy = structuredClone(q);
  delete legacy.learning.topics;
  delete legacy.learning.keywords;
  schema("question", legacy);
  for (const field of ["topics", "keywords"] as const) {
    for (const value of [[], [""], [" 論理演算"], ["論理演算 "], ["論理\n演算"], ["論理演算", "論理演算"], ["語".repeat(81)], "論理演算", null]) {
      const bad = structuredClone(q);
      (bad.learning as Record<string, unknown>)[field] = value;
      assert.throws(() => schema("question", bad), { code: "SCHEMA" });
    }
    const incomplete = structuredClone(q);
    delete incomplete.learning[field];
    assert.throws(() => schema("question", incomplete), { code: "SCHEMA" });
  }
});

test("classification-only bookmark upgrades preserve every source and timestamp, including bookmarks from old generated runs", () => {
  const b = fixture(), before = structuredClone(b);
  for (const row of generationCoverage(b).rows) {
    const current = makeBookmark(b, refOf(row.original), 0);
    for (const ref of [refOf(row.original), row.linked[0].baseQuestionRef]) {
      const old = previousRef(ref);
      assert.deepEqual(makeBookmark(b, old, 0), current);
      const saved = { ...current, questionRef: old };
      assert.deepEqual(refreshBookmark(b, saved), current);
      assert.deepEqual(saved.questionRef, old);
    }
    assert.throws(() => makeBookmark(b, { ...refOf(row.original), revision: row.original.revision + 1 }), { code: "BOOKMARK_REF" });
  }
  const row = generationCoverage(b).rows[0], old = previousRef(refOf(row.original));
  b.catalog.withdrawals.push({ ...b.catalog.withdrawals[0], questionRef: old });
  assert.throws(() => makeBookmark(b, old), { code: "BOOKMARK_REF" });
  assert.deepEqual(before.questions, b.questions);
});

test("sessions saved without classification remain valid and retain existing content when appending or reviewing", async () => {
  const old = previousBundle();
  for (const kind of ["annual", "mix"] as const) {
    const prepared = await prepareRun(old, {
      subject: "A", kind, year: 2026, mode: "study", size: "public",
      bindingMode: kind === "annual" ? "original_data" : "generated_values",
    }, {});
    const run = updateAnswer(startRun(prepared), prepared.issued[0].correctAnswer.choiceId);
    const saved = structuredClone(run);
    await validateRun(run);
    const completed = finishRun(run, "completed");
    await validateRun(completed);
    assert.equal(completed.result?.correct, 1);
    assert.deepEqual(run, saved);
    assert(run.issued.every((q) => !q.learning.topics && !q.learning.keywords));
  }
  const original = old.questions.find((q) => q.id === "question-ipa-2026-a-6")!;
  const run = startRun(await prepareRun(old, {
    subject: "A", kind: "bookmark", mode: "endless", bindingMode: "generated_values",
    questionRefs: [refOf(original)],
  }, {}));
  const before = structuredClone(run.issued);
  const next = await appendRunQuestion(run);
  await validateRun(next);
  assert.deepEqual(next.issued.slice(0, before.length), before);
  assert(next.issued.every((q) => !q.learning.topics && !q.learning.keywords));
});

test("bookmark metadata displays all topics and index words after the area, escapes text and avoids repeating a topic", () => {
  const html = renderToStaticMarkup(createElement(BookmarkLearning, {
    areaLabel: "テクノロジ",
    learning: { area: "technology", tags: [], topics: ["論理演算", "論理回路"], keywords: ["論理回路", "タイミングチャート", "<script>"] },
  }));
  const words = ["テクノロジ", "論理演算", "論理回路", "タイミングチャート", "&lt;script&gt;", "時間制限なし"];
  for (let i = 1; i < words.length; i++) assert(html.indexOf(words[i - 1]) < html.indexOf(words[i]));
  assert.equal(html.split("論理回路").length - 1, 1);
  assert(!html.includes("<script>"));
  const legacy = renderToStaticMarkup(createElement(BookmarkLearning, { areaLabel: "マネジメント" }));
  assert(legacy.includes("マネジメント"));
  assert(!legacy.includes("bookmark-topic") && !legacy.includes("bookmark-keyword"));
});
