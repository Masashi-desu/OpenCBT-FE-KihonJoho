import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../fixtures";
import { answerRun } from "../fixtures/answer-run";
import { refKey, type Selection, type Bundle } from "../../src/core/types";
import { nextQuestionRef } from "../../src/core/selection";
import { appendRunQuestion, finishRun, isOpenEnded, prepareRun, startRun, validateRun } from "../../src/core/session";
import { bookletRows } from "./generation-paths/scope";

/** Same answer/identity/reopen/result assertions as the prior long random
 * session. Full subject pools receive representative random sessions in the
 * common test; booklet sessions explicitly visit every owned candidate. */
export async function checkEndlessSessionHistory(bundle: Bundle, selection: Selection, drawCount?: number, forceEveryCandidate = false) {
  let run = startRun(await prepareRun(bundle, {
    ...selection, year: 2025, size: "full",
  }, {}, 100000), 101000);
  assert(isOpenEnded(run));
  assert.equal(run.selection.year, undefined);
  assert.equal(run.selection.size, undefined);
  const count = drawCount === undefined ? run.set.questionRefs.length : drawCount - 2,
    sessionId = run.session.id,
    first = structuredClone(run.issued[0]);
  for (let index = 0; index < count + 2; index++) {
    if (index) run = await appendRunQuestion(run, forceEveryCandidate ? run.set.questionRefs[(index - 1) % run.set.questionRefs.length] : undefined, 102000 + index * 1000);
    run = answerRun(run, true, 102000 + index * 1000);
    assert.equal(run.session.id, sessionId);
    assert.equal(run.session.currentIndex, index);
    assert.equal(run.instances[index].entryIndex, index);
    assert.equal(run.session.status, "running");
  }
  assert(run.session.entries.every((entry) => run.set.questionRefs.some((ref) => refKey(ref) === refKey(entry.questionRef))));
  assert.equal(new Set(run.instances.map((i) => i.id)).size, count + 2);
  const latest = new Map<string, number[]>();
  for (const instance of run.instances) {
    const key = refKey(instance.baseQuestionRef);
    if (latest.has(key)) assert.notDeepEqual(instance.parameters.values, latest.get(key));
    latest.set(key, instance.parameters.values);
  }
  assert.deepEqual(run.issued[0], first);
  if (forceEveryCandidate) assert.deepEqual([...new Set(run.session.entries.map(entry => refKey(entry.questionRef)))].sort(), run.set.questionRefs.map(refKey).sort());
  const saved = structuredClone(run);
  // Reopening preserves saved questions even if the instances arrive in storage-key order.
  saved.instances.sort((a, b) => a.id.localeCompare(b.id));
  await validateRun(saved);
  const nextRef = nextQuestionRef(saved, (a) => a);
  assert.deepEqual(nextRef, saved.set.questionRefs[0]);
  const resumed = await appendRunQuestion(saved, nextRef, 200000);
  assert.deepEqual(resumed.issued.slice(0, saved.issued.length), saved.issued);
  const completed = finishRun(resumed, "completed", 201000);
  assert.equal(completed.result!.total, count + 3);
  assert.equal(completed.result!.correct, count + 2);
  assert.equal(completed.result!.unanswered, 1);
  await validateRun(completed);
}

export function registerBookletEndlessPracticeTests(scope: string) {
  test(`endless paths ${scope}: every series retains answers and saved instances across resume`, async () => {
    const bundle = fixture(), rows = bookletRows(bundle, scope), subject = rows[0].original.subject;
    assert(rows.every(row => row.original.subject === subject));
    await checkEndlessSessionHistory(bundle, {
      subject, kind: "mix", mode: "endless", bindingMode: "generated_values",
      questionRefs: rows.map(row => row.linked[0].baseQuestionRef),
    }, undefined, true);
  });
}
