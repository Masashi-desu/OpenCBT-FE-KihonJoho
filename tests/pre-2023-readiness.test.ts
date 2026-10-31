import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixture } from "./fixtures";
import { auditPre2023Readiness, pre2023Reviews, pre2023Scope, pre2023LegacyScope } from "../scripts/audit-pre-2023-readiness";

const evidence = () => JSON.parse(fs.readFileSync("scripts/source-evidence/ipa-pre-2023.json", "utf8"));
// Explicit historical controls, never admission evidence for the current734.
// Both original data and review rows must belong to that historical subset.
const through2018Collections = new Set(["2022-apr-sample-b", "2022-dec-sample-a", "2022-dec-sample-b",
  "2017h29h-fe-pm", "2017h29a-fe-pm", "2018h30h-fe-pm", "2018h30a-fe-pm"]);
const historicalReviews = () => pre2023Reviews.filter(r => through2018Collections.has(r.collectionId));
const withoutMorning = () => {
  const b = fixture(), morning = /(?:2017h29[ha]|2018h30[ha]|2019h31h|2019r01a)-fe-am-/;
  b.questions = b.questions.filter(q => !morning.test(q.id));
  b.templates = b.templates.filter(t => !morning.test(t.id));
  return b;
};
const through2018Bundle = () => {
  const b = withoutMorning(), later = /2019(?:h31h|r01a)-fe-pm-/;
  b.questions = b.questions.filter(q => !later.test(q.id));
  b.templates = b.templates.filter(t => !later.test(t.id));
  return b;
};
const initialBaseline = () => {
  const b = withoutMorning();
  b.questions = b.questions.filter(q => !/(?:sample-2022-(?:apr|dec)-(?:a|b)-|2017h29[ha]-fe-pm-|2018h30[ha]-fe-pm-|2019(?:h31h|r01a)-fe-pm-)/.test(q.id));
  b.templates = b.templates.filter(t => !/(?:sample-2022-(?:apr|dec)-(?:a|b)-|2017h29[ha]-fe-pm-|2018h30[ha]-fe-pm-|2019(?:h31h|r01a)-fe-pm-)/.test(t.id));
  return b;
};
test("the requested expansion cannot pass using the 103 already-distributed questions", () => {
  const reviews = historicalReviews().map(r => ({ ...r, checks: { originalSemantics: "pass" as const } }));
  assert.equal(initialBaseline().questions.filter(q => q.origin.kind === "official_reprint").length, 103);
  assert.equal(reviews.length, 138);
  const report = auditPre2023Readiness(initialBaseline(), evidence(), reviews);
  assert.equal(report.status, "not_ready");
  assert.deepEqual(report.summary, { collections: 67, requestedUnits: 3062, missingOriginals: 3062, originalSemanticsReviewed: 138, ready: 0 });
  assert.equal(report.missingByCheck.compound_answer_model, undefined);
  assert.equal(report.missingByCheck.originalSemantics, 2924);
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

test("86 samples and four complete 13-major booklets clear seven collections while the remaining 2,924 units stay pending", () => {
  const beforeS205 = through2018Bundle();
  assert.equal(beforeS205.questions.filter(q => q.origin.kind === "official_reprint").length, 241);
  const report = auditPre2023Readiness(beforeS205, evidence(), historicalReviews());
  assert.equal(report.status, "not_ready");
  assert.deepEqual(report.summary, { collections: 67, requestedUnits: 3062, missingOriginals: 2924, originalSemanticsReviewed: 138, ready: 138 });
  assert.equal(report.collections.find(c => c.id === "2017h29h-fe-pm")!.ready, 13);
  assert.equal(report.collections.find(c => c.id === "2017h29a-fe-pm")!.ready, 13);
  assert.equal(report.collections.find(c => c.id === "2018h30h-fe-pm")!.ready, 13);
  assert.equal(report.collections.find(c => c.id === "2018h30a-fe-pm")!.ready, 13);
  assert.equal(report.collections.find(c => c.id === "2022-apr-sample-b")!.ready, 6);
  assert.equal(report.collections.find(c => c.id === "2022-dec-sample-b")!.ready, 20);
  assert(report.collections.filter(c => !["2022-apr-sample-b","2022-dec-sample-b","2022-dec-sample-a","2017h29h-fe-pm","2017h29a-fe-pm","2018h30h-fe-pm","2018h30a-fe-pm"].includes(c.id)).every(c => c.ready === 0));
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
  const reviews = historicalReviews().map(r => ({ ...r, checks: { originalSemantics: "pass" as const } }));
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


test("the new13 registered majors remain pending when any one of the five scoped reviews is absent", () => {
  for (const check of ["transcription", "rights", "originalSemantics", "generatorSemantics", "rendering"] as const) {
    const reviews = structuredClone(historicalReviews());
    for (const review of reviews) if (review.collectionId === "2018h30a-fe-pm") delete review.checks[check];
    const oldBooklets = through2018Bundle();
    const report = auditPre2023Readiness(oldBooklets, evidence(), reviews);
    assert.equal(report.status, "not_ready");
    assert.equal(report.summary.ready, 125);
    assert.equal(report.summary.missingOriginals, 2924);
    const collection = report.collections.find(c => c.id === "2018h30a-fe-pm")!;
    assert.equal(collection.questions.length, 13);
    assert(collection.questions.every(q => q.pending.includes(check)));
    assert.equal(collection.ready, 0);
  }
});


test("the current734-source catalog admits467 AM,86 sample and78 PM units while all67/3062 scope and2431 pending units stay visible", () => {
  const report = auditPre2023Readiness(fixture(), evidence());
  assert.equal(report.status, "not_ready");
  assert.deepEqual(report.summary, { collections: 67, requestedUnits: 3062, missingOriginals: 2431, originalSemanticsReviewed: 631, ready: 631 });
  for (const id of ["2017h29h-fe-pm", "2017h29a-fe-pm", "2018h30h-fe-pm", "2018h30a-fe-pm", "2019h31h-fe-pm", "2019r01a-fe-pm"])
    assert.equal(report.collections.find(c => c.id === id)!.ready, 13);
  assert.equal(report.scopeDiscovery.status, "pending_materials_and_boundaries");
  assert.equal(report.scopeDiscovery.incorporatedPendingUnits, 930);
  assert.equal(report.scopeDiscovery.unknownBoundaryUnits, null);
});

test("each missing scoped review keeps all13 autumn2019 majors pending without hiding their registered originals", () => {
  for (const check of ["transcription", "rights", "originalSemantics", "generatorSemantics", "rendering"] as const) {
    const reviews = structuredClone(pre2023Reviews);
    assert.equal(reviews.filter(r => r.collectionId === "2019r01a-fe-pm").length, 13);
    for (const review of reviews) if (review.collectionId === "2019r01a-fe-pm") delete review.checks[check];
    const report = auditPre2023Readiness(fixture(), evidence(), reviews), collection = report.collections.find(c => c.id === "2019r01a-fe-pm")!;
    assert.equal(report.status, "not_ready");
    assert.equal(report.summary.collections, 67); assert.equal(report.summary.requestedUnits, 3062);
    assert.equal(report.summary.ready, 618); assert.equal(report.summary.missingOriginals, 2431);
    assert.equal(collection.questions.length, 13); assert.equal(collection.ready, 0);
    assert(collection.questions.every(q => q.pending.includes(check) && !q.pending.includes("missing_original")));
  }
});
