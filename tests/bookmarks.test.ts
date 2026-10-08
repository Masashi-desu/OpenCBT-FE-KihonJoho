import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import {
  makeBookmark,
  bookmarkPreview,
  bookmarkTemplate,
  resultBookmarks,
} from "../src/core/bookmarks";
import { generationCoverage } from "../src/core/generation-coverage";
import { refOf, type Selection } from "../src/core/types";
import {
  prepareRun,
  startRun,
  updateAnswer,
  finishRun,
  validateRun,
} from "../src/core/session";
import { selectQuestions } from "../src/core/selection";
import { answerCanVary, answerSignature } from "../src/core/generation";

test("annual and generated entries bookmark the same source for every included question", () => {
  const b = fixture();
  for (const row of generationCoverage(b).rows) {
    const original = makeBookmark(b, refOf(row.original), 0),
      generated = makeBookmark(b, row.linked[0].baseQuestionRef, 0);
    assert.deepEqual(generated, original);
    assert.equal(
      bookmarkTemplate(b, original.questionRef).template.id,
      row.linked[0].id,
    );
  }
});

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

test("bookmark previews identify every source without choices, figure labels or answers", () => {
  const b = fixture(),
    saved = structuredClone(b);
  for (const row of generationCoverage(b).rows) {
    const preview = bookmarkPreview(b, refOf(row.original));
    assert(preview.length > 0, row.original.id);
    assert(Array.from(preview).length <= 141, row.original.id);
    assert(!/^問\s*[0-9０-９]/u.test(preview), row.original.id);
    assert(!/[\n\r]|〔プログラム〕/u.test(preview), row.original.id);
    assert.equal(bookmarkPreview(b, row.linked[0].baseQuestionRef), preview);
  }
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

test("all bookmarked sources generate consecutive fresh practice runs without changing saved content", async () => {
  const b = fixture();
  for (const row of generationCoverage(b).rows) {
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
      const incorrect = finishRun(updateAnswer(
        startRun(run),
        run.issued[0].choices.find(
          (choice) => choice.id !== run.issued[0].correctAnswer.choiceId,
        )!.id,
      ), "completed");
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
