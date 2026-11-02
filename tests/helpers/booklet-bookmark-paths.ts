/** Per-booklet paths retain the complete real Bundle; only the source-row
 * traversal is partitioned. Common invalid-state and cross-subject contracts
 * remain in tests/bookmarks.test.ts. No fixture or production pool is reduced. */
import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../fixtures";
import { answerRun } from "../fixtures/answer-run";
import { makeBookmark, bookmarkPreview, bookmarkTemplate, resultBookmarks } from "../../src/core/bookmarks";
import { refOf, type Selection } from "../../src/core/types";
import { prepareRun, startRun, finishRun, validateRun } from "../../src/core/session";
import { selectQuestions } from "../../src/core/selection";
import { answerCanVary, answerSignature } from "../../src/core/generation";
import { bookletRows } from "./generation-paths/scope";

export function registerBookletBookmarkTests(scope: string) {
  test(scope + ": annual and generated entries bookmark the same source for every included question", () => {
  const b = fixture(), rows = bookletRows(b, scope);
  for (const row of rows) {
    const original = makeBookmark(b, refOf(row.original), 0),
      generated = makeBookmark(b, row.linked[0].baseQuestionRef, 0);
    assert.deepEqual(generated, original);
    assert.equal(
      bookmarkTemplate(b, original.questionRef).template.id,
      row.linked[0].id,
    );
  }

  });
  test(scope + ": bookmark previews identify every source without choices, figure labels or answers", () => {
  const b = fixture(),
    saved = structuredClone(b), rows = bookletRows(b, scope);
  for (const row of rows) {
    const preview = bookmarkPreview(b, refOf(row.original));
    assert(preview.length > 0, row.original.id);
    assert(Array.from(preview).length <= 141, row.original.id);
    assert(!/^問\s*[0-9０-９]/u.test(preview), row.original.id);
    assert(!/[\n\r]|〔プログラム〕/u.test(preview), row.original.id);
    assert.equal(bookmarkPreview(b, row.linked[0].baseQuestionRef), preview);
  }
  assert.deepEqual(b, saved);

  });
  test(scope + ": all bookmarked sources generate consecutive fresh practice runs without changing saved content", async () => {
  const b = fixture(), rows = bookletRows(b, scope);
  for (const row of rows) {
    const selection: Selection = {
      subject: row.original.subject,
      kind: "bookmark",
      year: 2026,
      mode: "study",
      size: "public",
      bindingMode: "generated_values",
      bookmarkQuestionRef: refOf(row.original),
    };
    const previous = await prepareRun(b, selection, {}),
      saved = structuredClone(previous),
      next = await prepareRun(
        b,
        selection,
        {},
        Date.now() + 1000,
        undefined,
        selectQuestions(b, selection),
        previous.instances,
      );
    for (const run of [previous, next]) {
      await validateRun(run);
      const completed = finishRun(startRun(run), "completed");
      assert.notDeepEqual(
        completed.result!.entries[0].questionRef,
        completed.session.entries[0].questionRef,
      );
      assert.deepEqual(resultBookmarks(b, completed, "unanswered", 0), [
        makeBookmark(b, refOf(row.original), 0),
      ], row.original.id);
      const incorrect = finishRun(answerRun(startRun(run), false), "completed");
      assert.deepEqual(resultBookmarks(b, incorrect, "incorrect", 0), [
        makeBookmark(b, refOf(row.original), 0),
      ], row.original.id);
      assert.equal(run.issued.length, 1);
      assert.equal(run.instances.length, run.issued.length);
      assert(
        run.session.entries.every((e) => e.issuedContent.bindingPerformed),
      );
      assert(run.instances.every((i) => i.templateRef.id === row.linked[0].id));
      assert.equal(
        new Set(run.instances.map((i) => JSON.stringify(i.parameters))).size,
        run.issued.length,
      );
    }
    assert(
      next.instances.every(
        (i) =>
          !previous.instances.some(
            (p) =>
              JSON.stringify(p.parameters) === JSON.stringify(i.parameters),
          ),
      ),
    );
    if (answerCanVary(row.linked[0]))
      assert.notEqual(
        answerSignature(next.issued[0]),
        answerSignature(previous.issued[0]),
      );
    const third = await prepareRun(
      b,
      selection,
      {},
      Date.now() + 2000,
      undefined,
      selectQuestions(b, selection),
      [...previous.instances, ...next.instances],
    );
    await validateRun(third);
    assert.notDeepEqual(
      third.instances[0].parameters,
      next.instances[0].parameters,
    );
    assert.deepEqual(previous, saved);
  }

  });
}
