import test, { before } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, installFixtureGenerators } from "./fixtures";
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

test("bookmarks always resolve current sources and preserve their original timestamps", () => {
  const b = fixture(), before = structuredClone(b);
  for (const row of generationCoverage(b).rows) {
    const current = makeBookmark(b, refOf(row.original), 0);
    for (const ref of [refOf(row.original), row.linked[0].baseQuestionRef]) {
      const old = { ...ref, revision: 1 };
      assert.deepEqual(makeBookmark(b, old, 0), current);
      const saved = { ...current, questionRef: old };
      assert.deepEqual(refreshBookmark(b, saved), current);
      assert.deepEqual(saved.questionRef, old);
    }
    assert.throws(() => makeBookmark(b, { ...refOf(row.original), revision: row.original.revision + 1 }), { code: "BOOKMARK_REF" });
  }
  const row = generationCoverage(b).rows[0], old = { ...refOf(row.original), revision: 1 };
  b.catalog.withdrawals.push({ ...b.catalog.withdrawals[0], questionRef: old });
  assert.deepEqual(makeBookmark(b, old, 0), makeBookmark(b, refOf(row.original), 0));
  assert.deepEqual(before.questions, b.questions);
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

// Match executable App setup without changing raw shared fixture imports.
before(installFixtureGenerators);
