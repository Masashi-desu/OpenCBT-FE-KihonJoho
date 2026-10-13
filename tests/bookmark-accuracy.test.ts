import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { makeBookmark } from "../src/core/bookmarks";
import {
  bookmarkAccuracy,
  BOOKMARK_ANSWER_LIMIT,
  type BookmarkHistory,
} from "../src/core/bookmark-accuracy";
import { generationCoverage } from "../src/core/generation-coverage";
import { refOf, type Entry, type Ref } from "../src/core/types";
import { prepareRun, startRun, updateAnswer, finishRun, appendRunQuestion } from "../src/core/session";

const bundle = fixture();
const rows = generationCoverage(bundle).rows;
const record = (
  answers: { ref: Ref; outcome: string }[],
  at = "2026-10-13T01:00:00.000Z",
): BookmarkHistory => ({
  session: {
    id: `session-${at}`,
    status: "completed",
    entries: answers.map(({ ref }) => ({ questionRef: ref }) as Entry),
  },
  result: {
    generatedAt: at,
    validity: "valid",
    entries: answers.map(({ outcome }, index) => ({
      questionRef: { questionId: `instance-${index}`, revision: 1 },
      outcome,
    })),
  },
});

test("all bookmarked sources combine original and generated answers across saved revisions", () => {
  const bookmarks = rows.map((row) => makeBookmark(bundle, refOf(row.original), 0));
  const history = [record(rows.flatMap((row) => [
    { ref: refOf(row.original), outcome: "correct" },
    { ref: row.linked[0].baseQuestionRef, outcome: "incorrect" },
    { ref: { ...row.linked[0].baseQuestionRef, revision: 1 }, outcome: "correct" },
  ]))];
  const saved = structuredClone({ bundle, bookmarks, history });
  const stats = bookmarkAccuracy(bundle, bookmarks, history);
  assert.equal(stats.size, rows.length);
  for (const bookmark of bookmarks)
    assert.deepEqual(stats.get(bookmark.id), { answered: 3, correct: 2, accuracyPercent: 66.7 }, bookmark.id);
  assert.deepEqual({ bundle, bookmarks, history }, saved);
});

test("the latest 20 answers are chosen per source across sessions in finish-time order", () => {
  assert.equal(BOOKMARK_ANSWER_LIMIT, 20);
  const [first, second] = rows;
  const bookmarks = [first, second].map((row) => makeBookmark(bundle, refOf(row.original), 0));
  const older = record(Array.from({ length: 30 }, () => ({ ref: refOf(first.original), outcome: "correct" })), "2026-10-11T00:00:00.000Z");
  const newer = record([
    ...Array.from({ length: 19 }, () => ({ ref: first.linked[0].baseQuestionRef, outcome: "incorrect" })),
    { ref: refOf(second.original), outcome: "correct" },
  ], "2026-10-13T00:00:00.000Z");
  const stats = bookmarkAccuracy(bundle, bookmarks, [older, newer]);
  assert.deepEqual(stats.get(first.original.id), { answered: 20, correct: 1, accuracyPercent: 5 });
  assert.deepEqual(stats.get(second.original.id), { answered: 1, correct: 1, accuracyPercent: 100 });
  assert.deepEqual(bookmarkAccuracy(bundle, bookmarks, [newer, older]), stats);
});

test("long runs use the last 20 answered entries and unanswered entries do not consume the limit", () => {
  const row = rows[0], ref = row.linked[0].baseQuestionRef;
  const bookmark = makeBookmark(bundle, refOf(row.original), 0);
  const answers = [
    ...Array.from({ length: 7 }, () => ({ ref, outcome: "incorrect" })),
    ...Array.from({ length: 20 }, () => ({ ref, outcome: "correct" })),
    ...Array.from({ length: 25 }, () => ({ ref, outcome: "unanswered" })),
  ];
  assert.deepEqual(bookmarkAccuracy(bundle, [bookmark], [record(answers)]).get(bookmark.id), {
    answered: 20, correct: 20, accuracyPercent: 100,
  });
  const newer = record([{ ref, outcome: "incorrect" }], "2026-10-13T02:00:00.000Z");
  assert.deepEqual(bookmarkAccuracy(bundle, [bookmark], [record(answers), newer]).get(bookmark.id), {
    answered: 20, correct: 19, accuracyPercent: 95,
  });
});

test("unfinished, invalid, purged, missing and unknown records do not contribute", () => {
  const row = rows[0], ref = refOf(row.original);
  const bookmark = makeBookmark(bundle, ref, 0);
  const valid = record([{ ref, outcome: "correct" }]);
  const ignored: BookmarkHistory[] = [
    ...(["ready", "running", "paused", "abandoned", "invalidated"] as const).map((status) => ({
      ...valid, session: { ...valid.session, status },
    })),
    { ...valid, result: undefined },
    { ...valid, result: { ...valid.result!, validity: "invalidated" } },
    { ...valid, purged: true },
    record([{ ref: { questionId: "unknown", revision: 1 }, outcome: "correct" }]),
    record([{ ref, outcome: "unanswered" }, { ref, outcome: "unknown" }]),
    { ...valid, session: { ...valid.session, entries: [] } },
  ];
  assert.deepEqual(bookmarkAccuracy(bundle, [bookmark], ignored).get(bookmark.id), {
    answered: 0, correct: 0, accuracyPercent: null,
  });
  const expired = { ...valid, session: { ...valid.session, status: "expired" as const } };
  assert.deepEqual(bookmarkAccuracy(bundle, [bookmark], [...ignored, expired]).get(bookmark.id), {
    answered: 1, correct: 1, accuracyPercent: 100,
  });
});

test("zero percent differs from no history, and removed history leaves bookmarks intact", () => {
  const bookmarks = rows.slice(0, 2).map((row) => makeBookmark(bundle, refOf(row.original), 0));
  const saved = structuredClone(bookmarks);
  const stats = bookmarkAccuracy(bundle, bookmarks, [record([{ ref: bookmarks[0].questionRef, outcome: "incorrect" }])]);
  assert.deepEqual(stats.get(bookmarks[0].id), { answered: 1, correct: 0, accuracyPercent: 0 });
  assert.deepEqual(stats.get(bookmarks[1].id), { answered: 0, correct: 0, accuracyPercent: null });
  for (const stats of bookmarkAccuracy(bundle, bookmarks, []).values())
    assert.deepEqual(stats, { answered: 0, correct: 0, accuracyPercent: null });
  assert.deepEqual(bookmarks, saved);
  assert.equal(bookmarkAccuracy(bundle, [], []).size, 0);
});

test("actual annual and repeated bookmark runs use saved outcomes and source refs for A and B", async () => {
  for (const subject of ["A", "B"] as const) {
    let annual = startRun(await prepareRun(bundle, {
      subject, kind: "annual", year: 2026, mode: "study", size: "public", bindingMode: "original_data",
    }, {}));
    annual = finishRun(updateAnswer(annual, annual.issued[0].correctAnswer.choiceId), "completed");
    const bookmark = makeBookmark(bundle, annual.session.entries[0].questionRef, 0);
    let practice = startRun(await prepareRun(bundle, {
      subject, kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: bookmark.questionRef,
    }, {}));
    practice = updateAnswer(practice, practice.issued[0].choices.find((choice) => choice.id !== practice.issued[0].correctAnswer.choiceId)!.id);
    practice = await appendRunQuestion(practice);
    practice = finishRun(updateAnswer(practice, practice.issued[1].correctAnswer.choiceId), "completed");
    assert.notDeepEqual(practice.result!.entries[0].questionRef, bookmark.questionRef);
    const saved = structuredClone({ annual, practice });
    assert.deepEqual(bookmarkAccuracy(bundle, [bookmark], [annual, practice]).get(bookmark.id), {
      answered: 3, correct: 2, accuracyPercent: 66.7,
    });
    assert.deepEqual({ annual, practice }, saved);
  }
});
