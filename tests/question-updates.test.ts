import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { generationCoverage } from "../src/core/generation-coverage";
import { makeBookmark, refreshBookmark, bookmarkTemplate } from "../src/core/bookmarks";
import { latestLearningSelection, outdatedQuestionIndexes, QUESTION_UPDATE_NOTICE } from "../src/core/question-updates";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";
import { validateTemplateContract } from "../src/core/generation";
import { refOf, type Selection } from "../src/core/types";
import { validateBundle } from "../src/core/validation";

// Obsolete revisions are represented by metadata only. No old problem wording
// or historical question bodies are retained in the repository.
test("compatibility checks every issued source and ignores unissued catalog changes", () => {
  const latest = fixture();
  const saved = { session: { entries: latest.questions.map(q => ({ questionRef: refOf(q) })) } };
  assert.deepEqual(outdatedQuestionIndexes(saved, latest), []);
  const changed = structuredClone(latest);
  changed.questions[0].revision++;
  assert.deepEqual(outdatedQuestionIndexes(saved, changed), [0]);
  changed.questions[1].lifecycle = "withdrawn";
  assert.deepEqual(outdatedQuestionIndexes(saved, changed), [0, 1]);
  changed.questions.splice(2, 1);
  assert.deepEqual(outdatedQuestionIndexes(saved, changed), [0, 1, 2]);
  const one = { session: { entries: [saved.session.entries[10]] } };
  assert.deepEqual(outdatedQuestionIndexes(one, changed), []);
  changed.catalog.revision++;
  assert.deepEqual(outdatedQuestionIndexes(one, changed), []);
});

test("endless learning also replaces an obsolete future source pool", () => {
  const latest = fixture(), refs = latest.questions.slice(0, 2).map(refOf);
  const saved = { session: { entries: [{ questionRef: refs[0] }] }, set: { questionRefs: refs }, selection: { mode: "endless" as const } };
  assert.deepEqual(outdatedQuestionIndexes(saved, latest), []);
  const changed = structuredClone(latest);
  changed.questions.find(q => q.id === refs[1].questionId)!.revision++;
  assert.deepEqual(outdatedQuestionIndexes(saved, changed), [0]);
  assert.deepEqual(outdatedQuestionIndexes({ ...saved, selection: { mode: "study" } }, changed), []);
});

test("saved snapshots need only issued generators, while distribution and hashes remain strict", async () => {
  const saved = fixture(), template = saved.templates[0];
  template.generatorRef.version = "1.9.9";
  await assert.rejects(validateBundle(saved), { code: "GENERATOR_REF" });
  await assert.rejects(validateBundle(saved, new Set([`${template.id}@${template.revision}`])), { code: "GENERATOR_REF" });
  await validateBundle(saved, new Set());
  template.originalContentSha256 = "0".repeat(64);
  await assert.rejects(validateBundle(saved, new Set()), { code: "TEMPLATE_ORIGINAL_HASH" });
});

test("all old bookmark revisions resolve the current source and current generator without a migration allowlist", () => {
  const latest = fixture();
  for (const row of generationCoverage(latest).rows) {
    const current = makeBookmark(latest, refOf(row.original), 0);
    const template = row.linked[0], base = latest.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
    for (const change of base.origin.changes.slice(0, -1))
      assert.equal(change.answerDetails, undefined, "past question text must not remain in change records");
    if (["2.3.0", "3.4.0"].includes(template.generatorRef.version)) {
      const retired = structuredClone(template);
      retired.generatorRef.version = template.generatorRef.version === "2.3.0" ? "2.1.0" : ["2025-b-4", "2025-b-5"].includes(row.original.id.replace("question-ipa-", "")) ? "3.3.0" : "3.2.0";
      assert.throws(() => validateTemplateContract(retired), { code: "GENERATOR_REF" });
    }
    for (const questionRef of [refOf(row.original), row.linked[0].baseQuestionRef]) {
      for (let revision = 1; revision <= questionRef.revision; revision++) {
        const ref = { ...questionRef, revision };
        assert.deepEqual(makeBookmark(latest, ref, 0), current);
        assert.deepEqual(refreshBookmark(latest, { ...current, questionRef: ref }), current);
        assert.equal(bookmarkTemplate(latest, ref).template.revision, row.linked[0].revision);
      }
      for (const revision of [0, -1, questionRef.revision + 1])
        assert.throws(() => makeBookmark(latest, { ...questionRef, revision }), { code: "BOOKMARK_REF" });
    }
  }
});

test("latest learning resolves explicit single and grouped source pools and avoids starting a timed exam", () => {
  const latest = fixture(), rows = generationCoverage(latest).rows.slice(0, 3);
  for (const kind of ["bookmark", "mix"] as const) {
    const refs = rows.map(row => ({
      ...(kind === "bookmark" ? refOf(row.original) : row.linked[0].baseQuestionRef), revision: 1,
    }));
    const selection: Selection = { subject: "A", kind, mode: "practice", bindingMode: "generated_values", questionRefs: refs };
    const before = structuredClone(selection), updated = latestLearningSelection({ selection }, latest);
    assert.equal(updated.mode, "study");
    assert.deepEqual(updated.questionRefs, rows.map(row => kind === "bookmark" ? refOf(row.original) : row.linked[0].baseQuestionRef));
    assert.deepEqual(selection, before);
  }
  const ref = { ...refOf(rows[0].original), revision: 1 };
  const selection: Selection = { subject: "A", kind: "bookmark", mode: "endless", bindingMode: "generated_values", bookmarkQuestionRef: ref };
  const updated = latestLearningSelection({ selection }, latest);
  assert.equal(updated.mode, "endless");
  assert.deepEqual(updated.bookmarkQuestionRef, refOf(rows[0].original));
  assert.throws(() => latestLearningSelection({ selection: { ...selection, bookmarkQuestionRef: { questionId: "question-missing", revision: 1 } } }, latest));
});

test("replacement learning has independent questions, answers, elapsed time and results", async () => {
  const latest = fixture(), row = generationCoverage(latest).rows.find(row => row.original.id === "question-ipa-2023-a-1")!;
  const selection: Selection = { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: refOf(row.original) };
  let previous = startRun(await prepareRun(latest, selection, {}, 100000), 100001);
  previous = updateAnswer(previous, previous.issued[0].correctAnswer.choiceId, 100002);
  previous = finishRun(previous, "completed", 100003);
  // Simulate an obsolete reference; content is always the current wording.
  previous.session.entries[0].questionRef.revision--;
  assert.deepEqual(outdatedQuestionIndexes(previous, latest), [0]);
  const before = structuredClone(previous);
  const replacement = await prepareRun(latest, latestLearningSelection(previous, latest), {}, 200000);
  replacement.replacementFor = previous.session.id;
  await validateRun(replacement);
  assert.notEqual(replacement.session.id, previous.session.id);
  assert.notEqual(replacement.instances[0].id, previous.instances[0].id);
  assert.equal(replacement.result, undefined);
  assert.equal(replacement.session.activeElapsedSeconds, 0);
  assert.equal(replacement.session.entries[0].selectedChoiceId, undefined);
  assert.equal(replacement.session.entries[0].revealed, false);
  assert.equal(replacement.session.entries[0].reviewFlag, false);
  assert.deepEqual(outdatedQuestionIndexes(replacement, latest), []);
  assert(replacement.issued[0].prompt.blocks.some(b => b.type === "paragraph" && /10進小数に変換したものはどれか。/.test(b.text)));
  assert.deepEqual(previous, before);
  assert.match(QUESTION_UPDATE_NOTICE, /互換性がありません/);
  assert.match(QUESTION_UPDATE_NOTICE, /回答・結果は引き継ぎません/);
});
