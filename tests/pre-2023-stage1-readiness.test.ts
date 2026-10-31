import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixture } from "./fixtures";
import { auditPre2023Readiness } from "../scripts/audit-pre-2023-readiness";
import { stage1ContentReadiness, stage1ContentScope } from "../scripts/audit-pre-2023-stage1";
const full = () => auditPre2023Readiness(fixture(), JSON.parse(fs.readFileSync("scripts/source-evidence/ipa-pre-2023.json", "utf8")));

test("stage1 retains six morning collections and three reviewed samples without changing the complete-scope audit", () => {
  const input = full(), before = structuredClone(input), report = stage1ContentReadiness(input);
  assert.deepEqual(report.summary, { collections: 9, requestedUnits: 566, legacyMorningUnits: 480, sampleUnits: 86, ready: 553 });
  assert.equal(report.status, "not_ready");
  assert.equal(report.missingByCheck.missing_original, 13);
  assert.equal(report.missingByCheck.rights, 13);
  assert.equal(report.fullScope.status, "not_ready");
  assert.equal(report.fullScope.summary.requestedUnits, 3062);
  assert.deepEqual(report.fullScope.summary, { collections: 67, requestedUnits: 3062, missingOriginals: 2431, originalSemanticsReviewed: 631, ready: 631 });
  const held = [
    ["2017h29h-fe-am", [55, 66]], ["2017h29a-fe-am", [55]],
    ["2018h30h-fe-am", [39, 47, 62]], ["2018h30a-fe-am", [39, 65]],
    ["2019h31h-fe-am", [41, 51, 67]], ["2019r01a-fe-am", [55, 57]],
  ] as const;
  for (const [id, numbers] of held) {
    const collection = report.collections.find(c => c.id === id)!;
    assert.equal(collection.questions.length, 80); assert.equal(collection.ready, 80 - numbers.length);
    assert.deepEqual(collection.questions.filter(q => !q.questionId).map(q => q.number), [...numbers]);
    assert.deepEqual(collection.questions.filter(q => q.pending.includes("missing_original")).map(q => q.number), [...numbers]);
  }
  assert.deepEqual(input, before);
});
test("omitting, duplicating or renumbering collections/questions never shrinks stage1", () => {
  for (const scope of stage1ContentScope) {
    const missing = full(); missing.collections = missing.collections.filter(c => c.id !== scope.id);
    assert.throws(() => stage1ContentReadiness(missing), /STAGE1_SCOPE/);
    const duplicate = full(); duplicate.collections.push(duplicate.collections.find(c => c.id === scope.id)!);
    assert.throws(() => stage1ContentReadiness(duplicate), /STAGE1_SCOPE/);
    for (const change of ["drop", "duplicate", "outside", "count"] as const) {
      const input = full(), c = input.collections.find(c => c.id === scope.id)!;
      if (change === "drop") c.questions.pop();
      if (change === "duplicate") c.questions[0].number = c.questions[1].number;
      if (change === "outside") c.questions[0].number = scope.count + 1;
      if (change === "count") c.count--;
      assert.throws(() => stage1ContentReadiness(input), /STAGE1_COUNT/);
    }
  }
});
test("synthetic completed content controls leave later stages pending; any missing review or original reverses readiness", () => {
  // Synthetic report controls, never evidence of actual source/App acceptance.
  const input = full();
  for (const scope of stage1ContentScope) for (const q of input.collections.find(c => c.id === scope.id)!.questions) {
    q.questionId = `synthetic-${scope.id}-${q.number}`; q.originalSemanticsReviewed = true; q.pending = [];
  }
  assert.equal(stage1ContentReadiness(input).status, "ready");
  assert.equal(stage1ContentReadiness(input).fullScope.status, "not_ready");
  for (const missing of ["rights", "transcription", "originalSemantics", "generatorSemantics", "rendering", "generation_binding", "source_collection", "inactive_original"]) {
    const changed = structuredClone(input); changed.collections.find(c => c.id === "2017h29h-fe-am")!.questions[0].pending.push(missing);
    const report = stage1ContentReadiness(changed);
    assert.equal(report.status, "not_ready"); assert.equal(report.summary.ready, 565); assert.equal(report.missingByCheck[missing], 1);
  }
  for (const kind of ["questionId", "semantics"] as const) {
    const changed = structuredClone(input), q = changed.collections.find(c => c.id === "2017h29h-fe-am")!.questions[0];
    if (kind === "questionId") q.questionId = undefined; else q.originalSemanticsReviewed = false;
    assert.equal(stage1ContentReadiness(changed).status, "not_ready");
  }
});
