/** All source families in one reviewed booklet exercise the same three-entry
 * append/grade/reload contract on the complete actual Bundle. Global inventory
 * and cross-subject pool contracts are verified independently. */
import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../fixtures";
import { answerRun as answerCurrent } from "../fixtures/answer-run";
import { refOf, type Selection } from "../../src/core/types";
import { answerCanVary, answerSignature } from "../../src/core/generation";
import { prepareRun, startRun, appendRunQuestion, isOpenEnded, finishRun, validateRun } from "../../src/core/session";
import { bookletRows } from "./generation-paths/scope";

const selection: Selection = { subject: "A", kind: "bookmark", year: 2026, mode: "study", size: "public", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: "question-ipa-2026-a-1", revision: 1 } };
export function registerBookletOpenEndedTests(scope: string) {
  test(scope + ": all bookmarked series append to one session and aggregate every answer without replacing saved content", async () => {
  const bundle = fixture();
  const rows = bookletRows(bundle, scope);
  for (const row of rows) {
    let run = startRun(await prepareRun(bundle, {
      ...selection,
      subject: row.original.subject,
      bookmarkQuestionRef: refOf(row.original),
    }, {}, 100000), 101000);
    assert(isOpenEnded(run));
    const baseRef = run.session.entries[0].questionRef;
    run = answerCurrent(run, true, 102000);
    run.session.entries[0].revealed = true;
    run.session.entries[0].reviewFlag = true;
    run.session.activeElapsedSeconds = 12;
    for (let index = 1; index < 3; index++) {
      const saved = structuredClone(run),
        next = await appendRunQuestion(run, baseRef, 103000 + index * 1000);
      assert.deepEqual(run, saved, row.original.id);
      assert.equal(next.session.id, run.session.id);
      assert.equal(next.session.startedAt, run.session.startedAt);
      assert.equal(next.session.revision, run.session.revision + 1);
      assert.equal(next.session.status, "running");
      assert.equal(next.session.currentIndex, index);
      assert.equal(next.session.activeElapsedSeconds, 12);
      assert.equal(next.result, undefined);
      assert.deepEqual(next.exam, run.exam);
      assert.deepEqual(next.set, run.set);
      assert.deepEqual(next.bundle, run.bundle);
      assert.deepEqual(next.session.entries.slice(0, index), run.session.entries);
      assert.deepEqual(next.issued.slice(0, index), run.issued);
      assert.deepEqual(next.instances.slice(0, index), run.instances);
      assert.equal(next.instances[index].sessionId, run.session.id);
      assert.equal(next.instances[index].entryIndex, index);
      assert.equal(next.session.entries[index].selectedChoiceId, undefined);
      assert.equal(next.session.entries[index].selectedPartChoices, undefined);
      assert.equal(next.session.entries[index].revealed, false);
      assert.equal(next.session.entries[index].reviewFlag, false);
      assert.notDeepEqual(next.instances[index].parameters, run.instances[index - 1].parameters);
      if (answerCanVary(row.linked[0]))
        assert.notEqual(answerSignature(next.issued[index]), answerSignature(run.issued[index - 1]));
      run = next;
      if (index === 1)
        run = answerCurrent(run, false, 105000);
    }
    const completed = finishRun(run, "completed", 108000);
    await validateRun(completed);
    assert.deepEqual(completed.result!.entries.map((e) => e.outcome), ["correct", "incorrect", "unanswered"]);
    assert.equal(completed.result!.total, 3);
    assert.equal(completed.result!.correct, 1);
    assert.equal(completed.result!.incorrect, 1);
    assert.equal(completed.result!.unanswered, 1);
    assert.equal(completed.result!.revealedCount, 1);
    assert.equal(completed.result!.learningAccuracyPercent, 33.3);
    if (row.original.answerParts) {
      // A repaired generated field can have a different scoring status from its official source.
      const issued = completed.issued[0], keys = issued.correctAnswer.parts!;
      // A checklist stores one entry per selected choice and awards one field.
      const extraChecklistSlots = keys.reduce((sum, key) =>
        key.kind === "unordered" && key.presentation === "checklist" ? sum + key.partIds.length - 1 : sum, 0);
      const fields = issued.answerParts!.length - extraChecklistSlots;
      const unscored = keys.filter(answer => answer.kind === "no_correct_answer").length;
      const scored = fields - unscored;
      assert(scored > 0, "The one-wrong exercise requires a scored answer slot");
      if (row.original.id === "question-ipa-2019r01a-fe-pm-12") {
        assert.equal(row.original.correctAnswer.parts!.filter(a => a.kind === "no_correct_answer").length, 1);
        assert.equal(fields, 8); assert.equal(unscored, 0);
      }
      assert.deepEqual(completed.result!.entries.map(entry => entry.parts!.length), [fields, fields, fields]);
      assert.deepEqual(completed.result!.partSummary, { total: fields * 3, correct: scored * 2 - 1,
        incorrect: 1, unanswered: scored, unscored: unscored * 3,
        learningAccuracyPercent: Math.round((scored * 2 - 1) / (scored * 3) * 1000) / 10 });
    }
  }

  });
}
