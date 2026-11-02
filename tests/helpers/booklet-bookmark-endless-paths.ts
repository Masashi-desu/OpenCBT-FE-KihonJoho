import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../fixtures";
import { answerRun } from "../fixtures/answer-run";
import { bookmarkGroupSelection, makeBookmark } from "../../src/core/bookmarks";
import { refKey, refOf, type Bundle } from "../../src/core/types";
import { generationCoverage } from "../../src/core/generation-coverage";
import { nextQuestionRef, selectQuestions } from "../../src/core/selection";
import { appendRunQuestion, finishRun, prepareRun, startRun, validateRun } from "../../src/core/session";
import { bookletRows } from "./generation-paths/scope";

type Row = ReturnType<typeof generationCoverage>["rows"][number];

/** The original repeat/answer/history protocol, bounded to one complete
 * booklet. The full mixed pool remains checked by the common test. */
export async function checkBookmarkEndlessHistory(bundle: Bundle, rows: Row[]) {
  assert(rows.length > 0, "no bookmark series selected");

  const bookmarks = rows.map((row) => makeBookmark(bundle, refOf(row.original), 0)),
    selection = bookmarkGroupSelection(bookmarks), savedSelection = structuredClone(selection),
    prepared = selectQuestions(bundle, selection, (a) => a),
    expected = rows.map((row) => refKey(row.linked[0].baseQuestionRef)).sort();
  assert.equal(selection.subject, new Set(rows.map(row => row.original.subject)).size === 1 ? rows[0].original.subject : "mixed");
  assert.equal(selection.kind, "bookmark");
  assert.deepEqual(prepared.set.questionRefs.map(refKey).sort(), expected);
  let run = startRun(await prepareRun(bundle, selection, {}, 100000, undefined, prepared), 101000);
  const sessionId = run.session.id;
  for (let index = 0; index < expected.length + 2; index++) {
    if (index) {
      const targetIndex = (index - 1) % expected.length;
      const ref = nextQuestionRef(run, (refs) => [refs[targetIndex], ...refs.slice(0, targetIndex), ...refs.slice(targetIndex + 1)]);
      run = await appendRunQuestion(run, ref, 102000 + index * 1000);
    }
    if (index % 3 !== 2) {
      run = answerRun(run, index % 3 === 0, 102000 + index * 1000);
    }
    assert.equal(run.session.id, sessionId);
    assert(expected.includes(refKey(run.session.entries[index].questionRef)));
  }
  assert.deepEqual([...new Set(run.session.entries.map((e) => refKey(e.questionRef)))].sort(), expected);
  assert.deepEqual(run.session.entries[0].questionRef, run.session.entries[1].questionRef);
  const saved = structuredClone(run);
  saved.instances.reverse();
  // Current bookmarks can change independently; the saved pool and questions remain fixed.
  bookmarks.splice(0, bookmarks.length);
  selection.questionRefs!.splice(0, selection.questionRefs!.length);
  assert.deepEqual(saved.selection, savedSelection);
  await validateRun(saved);
  saved.session.currentIndex = 0;
  saved.session.entries[0].reviewFlag = true;
  saved.session.entries[0].revealed = true;
  const resumed = await appendRunQuestion(saved, nextQuestionRef(saved, (a) => a), 300000);
  assert.deepEqual(resumed.issued.slice(0, saved.issued.length), saved.issued);
  assert.deepEqual(resumed.session.entries.slice(0, saved.issued.length), saved.session.entries);
  const completed = finishRun(resumed, "completed", 301000),
    count = expected.length + 2;
  assert.equal(completed.result!.total, count + 1);
  assert.equal(completed.result!.correct, Math.ceil(count / 3));
  assert.equal(completed.result!.incorrect, Math.floor((count + 1) / 3));
  assert.equal(completed.result!.unanswered, Math.floor(count / 3) + 1);
  assert.equal(completed.result!.revealedCount, 1);
  assert.deepEqual(completed.selection.questionRefs, savedSelection.questionRefs);
  await validateRun(completed);
}

export function registerBookletBookmarkEndlessTests(scope: string) {
  test(`bookmark paths ${scope}: every registered series retains repeats, answers and resumed history`, async () => {
    const bundle = fixture();
    await checkBookmarkEndlessHistory(bundle, bookletRows(bundle, scope));
  });
}
