import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixture } from "./fixtures";
import { auditPre2023Readiness, pre2023Reviews, pre2023Scope, pre2023LegacyScope } from "../scripts/audit-pre-2023-readiness";

const evidence = () => JSON.parse(fs.readFileSync("scripts/source-evidence/ipa-pre-2023.json", "utf8"));
const initialBaseline = () => {
  const b = fixture();
  b.questions = b.questions.filter(q => !/(?:sample-2022-(?:apr|dec)-(?:a|b)-|2017h29[ha]-fe-pm-|2018h30h-fe-pm-)/.test(q.id));
  b.templates = b.templates.filter(t => !/(?:sample-2022-(?:apr|dec)-(?:a|b)-|2017h29[ha]-fe-pm-|2018h30h-fe-pm-)/.test(t.id));
  return b;
};
test("the requested expansion cannot pass using the 103 already-distributed questions", () => {
  const reviews = pre2023Reviews.map(r => ({ ...r, checks: { originalSemantics: "pass" as const } }));
  const report = auditPre2023Readiness(initialBaseline(), evidence(), reviews);
  assert.equal(report.status, "not_ready");
  assert.deepEqual(report.summary, { collections: 67, requestedUnits: 3062, missingOriginals: 3062, originalSemanticsReviewed: 125, ready: 0 });
  assert.equal(report.missingByCheck.compound_answer_model, undefined);
  assert.equal(report.missingByCheck.originalSemantics, 2937);
  assert.equal(report.missingByCheck.generatorSemantics, 3062);
  assert.deepEqual(report.capacity, [
    { kind: "questions", requiredAtLeast: 6330, maximum: 32000, exceeds: false },
    { kind: "templates", requiredAtLeast: 3165, maximum: 32000, exceeds: false },
  ]);
  assert.equal(pre2023Scope.filter(c => c.compound).length, 32);
  assert.equal(pre2023LegacyScope.filter(c => c.compound).length, 22);
});

test("deleting an unimplemented collection or changing its count never makes the release audit green", () => {
  const missing = evidence(); missing.collections.pop();
  assert.throws(() => auditPre2023Readiness(fixture(), missing), /IMPORT_SCOPE/);
  const count = evidence();
  count.collections.find((c: { id: string }) => c.id === "2011h23tokubetsu-fe-pm").questionNumbers.pop();
  assert.throws(() => auditPre2023Readiness(fixture(), count), /IMPORT_COUNT/);
});

test("86 samples and three complete 13-major booklets clear six collections while the remaining 2,937 units stay pending", () => {
  const report = auditPre2023Readiness(fixture(), evidence());
  assert.equal(report.status, "not_ready");
  assert.deepEqual(report.summary, { collections: 67, requestedUnits: 3062, missingOriginals: 2937, originalSemanticsReviewed: 125, ready: 125 });
  assert.equal(report.collections.find(c => c.id === "2017h29h-fe-pm")!.ready, 13);
  assert.equal(report.collections.find(c => c.id === "2017h29a-fe-pm")!.ready, 13);
  assert.equal(report.collections.find(c => c.id === "2018h30h-fe-pm")!.ready, 13);
  assert.equal(report.collections.find(c => c.id === "2022-apr-sample-b")!.ready, 6);
  assert.equal(report.collections.find(c => c.id === "2022-dec-sample-b")!.ready, 20);
  assert(report.collections.filter(c => !["2022-apr-sample-b","2022-dec-sample-b","2022-dec-sample-a","2017h29h-fe-pm","2017h29a-fe-pm","2018h30h-fe-pm"].includes(c.id)).every(c => c.ready === 0));
});

test("a review cannot silently move to a different PDF, question or collection", () => {
  for (const patch of [
    { paperSha256: "0".repeat(64) }, { questionNumber: 7 }, { collectionId: "missing" }, { testFiles: [] },
  ]) {
    const reviews = structuredClone(pre2023Reviews); Object.assign(reviews[0], patch);
    assert.throws(() => auditPre2023Readiness(fixture(), evidence(), reviews), /IMPORT_REVIEW/);
  }
  assert.throws(() => auditPre2023Readiness(fixture(), evidence(), [...pre2023Reviews, pre2023Reviews[0]]), /IMPORT_REVIEW/);
});

test("an independently checked original alone does not clear its generator, rights or rendering", () => {
  const reviews = pre2023Reviews.map(r => ({ ...r, checks: { originalSemantics: "pass" as const } }));
  const report = auditPre2023Readiness(initialBaseline(), evidence(), reviews);
  const collection = report.collections.find(c => c.id === "2022-apr-sample-b")!;
  assert.equal(collection.ready, 0);
  for (const q of collection.questions) {
    assert(q.originalSemanticsReviewed);
    assert(!q.pending.includes("originalSemantics"));
    for (const pending of ["missing_original", "rights", "transcription", "generatorSemantics", "rendering"])
      assert(q.pending.includes(pending));
  }
});

test("matching a PDF hash cannot disguise a sample as a 2023 exam or a stale collection reference", () => {
  const b = initialBaseline(), e = evidence();
  const sample = e.collections.find((c: { id: string }) => c.id === "2022-apr-sample-b");
  const q = b.questions.find(q => q.id === "question-ipa-2023-b-1")!;
  const source = structuredClone(b.sources.find(s => s.id === q.origin.sourceRefs[0].sourceId)!);
  source.id = "source-test-sample";
  source.sha256 = sample.questionPaper.sha256;
  source.publishedOn = sample.publishedOn;
  b.sources.push(source);
  q.origin.sourceRefs[0].sourceId = source.id;
  const row = () => auditPre2023Readiness(b, e).collections.find(c => c.id === sample.id)!.questions[0];
  assert(row().pending.includes("source_position"));
  assert(!row().pending.includes("missing_original"));
  delete q.origin.sourceRefs[0].locator.year;
  assert(!row().pending.includes("source_position"));
  q.revision += 1;
  assert(row().pending.includes("source_collection"));
  assert(row().pending.includes("generation_binding"));
  assert.equal(auditPre2023Readiness(b, e).status, "not_ready");
});
