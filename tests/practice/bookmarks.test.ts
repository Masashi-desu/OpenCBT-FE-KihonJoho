import test, { before } from "node:test";
import assert from "node:assert/strict";
import { fixture, installFixtureGenerators } from "../fixtures";
import {
  makeBookmark,
  bookmarkPreview,
  bookmarkTemplate,
  resultBookmarks,
} from "../../src/core/bookmarks";
import { generationCoverage } from "../../src/core/generation-coverage";
import { refOf, type Selection } from "../../src/core/types";
import {
  prepareRun,
  startRun,
  updateAnswer,
  finishRun,
} from "../../src/core/session";
import { selectQuestions } from "../../src/core/selection";

test("result bookmarks separate incorrect answers from unanswered and correct questions", async () => {
  const b = fixture();
  let run = startRun(
    await prepareRun(b, {
      subject: "A",
      kind: "annual",
      year: 2026,
      mode: "study",
      size: "public",
      bindingMode: "original_data",
    }, {}),
  );
  run = updateAnswer(run, run.issued[0].correctAnswer.choiceId);
  run.session.currentIndex = 1;
  run = updateAnswer(
    run,
    run.issued[1].choices.find(
      (choice) => choice.id !== run.issued[1].correctAnswer.choiceId,
    )!.id,
  );
  run = finishRun(run, "completed");
  const saved = structuredClone(run);
  assert.equal(run.result!.correct, 1);
  assert.equal(run.result!.incorrect, 1);
  assert.equal(run.result!.unanswered, 18);
  assert.deepEqual(
    resultBookmarks(b, run, "incorrect", 0).map((bookmark) => bookmark.id),
    [run.issued[1].id],
  );
  assert.deepEqual(
    resultBookmarks(b, run, "unanswered", 0).map((bookmark) => bookmark.id),
    run.issued.slice(2).map((question) => question.id),
  );
  assert.deepEqual(run, saved);
});

test("result bookmarks deduplicate generated sources and omit unavailable references", () => {
  const b = fixture(),
    [first, second, third] = generationCoverage(b).rows;
  const result = {
    entries: [
      { questionRef: refOf(first.original), outcome: "unanswered" },
      { questionRef: first.linked[0].baseQuestionRef, outcome: "unanswered" },
      { questionRef: first.linked[0].baseQuestionRef, outcome: "incorrect" },
      { questionRef: refOf(second.original), outcome: "correct" },
      { questionRef: refOf(third.original), outcome: "unanswered" },
      { questionRef: { questionId: "missing-question", revision: 1 }, outcome: "unanswered" },
    ],
  };
  b.catalog.withdrawals.push({
    ...b.catalog.withdrawals[0],
    questionRef: refOf(third.original),
  });
  const run = { result, session: { entries: result.entries } };
  const saved = structuredClone({ bundle: b, result });
  assert.deepEqual(resultBookmarks(b, run, "unanswered", 0), [
    makeBookmark(b, refOf(first.original), 0),
  ]);
  assert.deepEqual(resultBookmarks(b, run, "incorrect", 0), [
    makeBookmark(b, refOf(first.original), 0),
  ]);
  const empty = { result: { entries: [] }, session: { entries: [] } };
  assert.deepEqual(resultBookmarks(b, empty, "unanswered"), []);
  assert.deepEqual(resultBookmarks(b, empty, "incorrect"), []);
  assert.deepEqual({ bundle: b, result }, saved);
});

test("bookmark previews retain reviewed current-format examples without answers", () => {
  const b = fixture(), saved = structuredClone(b);
  const preview = (id: string) => {
    const original = b.questions.find((q) => q.id === id)!;
    return bookmarkPreview(b, refOf(original));
  };
  assert.equal(
    preview("question-ipa-2025-a-20"),
    "カーボンフットプリントの説明として，適切なものはどれか。",
  );
  assert.equal(
    preview("question-ipa-2024-a-13"),
    "アローダイアグラムで表されるプロジェクトは，完了までに最少で何日を要するか。",
  );
  assert.equal(
    preview("question-ipa-2025-a-9"),
    "暗号の危殆化に該当するものはどれか。",
  );
  assert.match(preview("question-ipa-2024-b-1"), /関数maximum.*最大値を返す。$/u);
  assert.match(preview("question-ipa-2023-b-1"), /findPrimeNumbers.*…$/u);
  assert.deepEqual(b, saved);

});

test("unavailable, withdrawn, wrong-subject and unsupported bookmarks cannot start", () => {
  const b = fixture(),
    original = generationCoverage(b).rows[0].original;
  assert.throws(() => makeBookmark(b, { questionId: "missing", revision: 1 }));
  const selection: Selection = {
    subject: original.subject === "A" ? "B" : "A",
    kind: "bookmark",
    year: 2026,
    mode: "study",
    size: "public",
    bindingMode: "generated_values",
    bookmarkQuestionRef: refOf(original),
  };
  assert.throws(() => selectQuestions(b, selection));
  assert.throws(() =>
    selectQuestions(b, {
      ...selection,
      subject: original.subject,
      mode: "practice",
    }),
  );
  assert.throws(() =>
    selectQuestions(b, {
      ...selection,
      subject: original.subject,
      bookmarkQuestionRef: undefined,
    }),
  );
  const unsupported = structuredClone(b);
  unsupported.sets.forEach((set) => {
    set.generationBindings = [];
  });
  assert.throws(() =>
    selectQuestions(unsupported, { ...selection, subject: original.subject }),
  );
  const withdrawnBase = structuredClone(b),
    base = bookmarkTemplate(withdrawnBase, refOf(original)).base;
  base.lifecycle = "withdrawn";
  assert.throws(() =>
    selectQuestions(withdrawnBase, { ...selection, subject: original.subject }),
  );
  b.catalog.withdrawals.push({
    ...b.catalog.withdrawals[0],
    questionRef: refOf(original),
  });
  assert.throws(() => makeBookmark(b, refOf(original)));
});

// Match executable App setup without changing raw shared fixture imports.
before(installFixtureGenerators);
