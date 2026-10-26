import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { bookmarkGroupSelection, filterBookmarks, makeBookmark, type BookmarkFilter } from "../src/core/bookmarks";
import { generationCoverage } from "../src/core/generation-coverage";
import { selectQuestions } from "../src/core/selection";
import { appendRunQuestion, prepareRun, startRun, updateAnswer, validateRun } from "../src/core/session";
import { areas, refKey, refOf } from "../src/core/types";

test("subject and area filters intersect across every bookmarked source and preserve listing order and stored data", () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows,
    bookmarks = rows.map((row) => makeBookmark(bundle, refOf(row.original), 0)).reverse(),
    saved = structuredClone(bookmarks),
    classifications = new Map(rows.map((row) => [row.original.id, `${row.original.subject}/${row.original.learning.area}`]));
  for (const subject of ["all", "A", "B"] as const) {
    for (const area of ["all", ...Object.keys(areas)]) {
      const matchingClasses = new Set(
        (subject === "all" ? ["A", "B"] : [subject]).flatMap((s) =>
          (area === "all" ? Object.keys(areas) : [area]).map((a) => `${s}/${a}`),
        ),
      );
      const expected = bookmarks.filter((bookmark) => matchingClasses.has(classifications.get(bookmark.id)!));
      assert.deepEqual(filterBookmarks(bookmarks, { subject, area }), expected, `${subject}/${area}`);
    }
  }
  assert.deepEqual(filterBookmarks([], { subject: "all", area: "all" }), []);
  assert.deepEqual(filterBookmarks(bookmarks, { subject: "B", area: "management" }).map(bookmark => bookmark.id),
    ["question-ipa-2017h29h-fe-pm-6"]);
  assert.deepEqual(filterBookmarks(bookmarks, { subject: "all", area: "unavailable" }), []);
  assert.deepEqual(bookmarks, saved);
});

test("each filtered practice pool contains exactly its displayed source series and draws only from those candidates", async () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows,
    bookmarks = rows.map((row) => makeBookmark(bundle, refOf(row.original), 0));
  for (const subject of ["all", "A", "B"] as const) {
    for (const area of ["all", ...Object.keys(areas)]) {
      const visible = filterBookmarks(bookmarks, { subject, area });
      if (!visible.length) {
        assert.throws(() => bookmarkGroupSelection(visible), { code: "BOOKMARK_REF" });
        continue;
      }
      const selection = bookmarkGroupSelection(visible),
        expected = visible.map((bookmark) => refKey(rows.find((row) => row.original.id === bookmark.id)!.linked[0].baseQuestionRef)).sort(),
        prepared = selectQuestions(bundle, selection);
      assert.deepEqual(selection.questionRefs, visible.map((bookmark) => bookmark.questionRef));
      assert.deepEqual(prepared.set.questionRefs.map(refKey).sort(), expected);
      let run = startRun(await prepareRun(bundle, selection, {}, 100000, undefined, prepared), 101000);
      for (let index = 0; index < 5; index++) {
        if (index) run = await appendRunQuestion(run, undefined, 102000 + index * 1000);
        assert(expected.includes(refKey(run.session.entries[index].questionRef)), `${subject}/${area}`);
        if (subject !== "all") assert.equal(run.issued[index].subject, subject);
        if (area !== "all") assert.equal(run.issued[index].learning.area, area);
      }
      await validateRun(run);
    }
  }
});

test("changing filters or bookmarks after starting leaves the saved scope, issued content and answers intact", async () => {
  const bundle = fixture(), bookmarks = generationCoverage(bundle).rows.map((row) => makeBookmark(bundle, refOf(row.original), 0)),
    filter: BookmarkFilter = { subject: "A", area: "management" },
    visible = filterBookmarks(bookmarks, filter),
    selection = bookmarkGroupSelection(visible),
    started = startRun(await prepareRun(bundle, selection, {}, 100000), 101000),
    run = updateAnswer(started, started.issued[0].correctAnswer.choiceId, 102000),
    saved = structuredClone(run);
  filter.subject = "B";
  filter.area = "security";
  visible.length = 0;
  bookmarks.length = 0;
  selection.questionRefs!.length = 0;
  const next = await appendRunQuestion(run, undefined, 103000);
  assert.deepEqual(next.selection, saved.selection);
  assert.deepEqual(next.set, saved.set);
  assert.deepEqual(next.issued.slice(0, saved.issued.length), saved.issued);
  assert.deepEqual(next.session.entries.slice(0, saved.issued.length), saved.session.entries);
  assert.equal(next.issued.at(-1)!.subject, "A");
  assert.equal(next.issued.at(-1)!.learning.area, "management");
  await validateRun(next);
  assert.deepEqual(run, saved);
});
