import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixture } from "./fixtures";
import { auditPre2023Readiness, pre2023Reviews, pre2023Scope, pre2023LegacyScope } from "../scripts/audit-pre-2023-readiness";
import extensions from "../scripts/source-inventory-extensions.json";
import { inventoryCollectionIdentity, type InventoryExtensions } from "../scripts/source-inventory-extension-contract";

const evidence = () => JSON.parse(fs.readFileSync("scripts/source-evidence/ipa-pre-2023.json", "utf8"));
// Explicit historical controls, independent of later admissions.
// Both original data and review rows must belong to that historical subset.
const through2018Collections = new Set(["2022-apr-sample-b", "2022-dec-sample-a", "2022-dec-sample-b",
  "2017h29h-fe-pm", "2017h29a-fe-pm", "2018h30h-fe-pm", "2018h30a-fe-pm"]);
const historicalReviews = () => pre2023Reviews.filter(r => through2018Collections.has(r.collectionId));
// Historical fixtures retain explicit positions rather than admitting every
// future nonmorning booklet into an old control's fixed103/241 denominator.
const currentPosition=(q:ReturnType<typeof fixture>['questions'][number])=>q.origin.sourceRefs.some(r=>!r.locator.timeSlot&&r.locator.year!==undefined&&r.locator.year>=2023&&r.locator.year<=2026);
const historicalPosition=(q:ReturnType<typeof fixture>['questions'][number],lastYear:number)=>currentPosition(q)||q.origin.sourceRefs.some(r=>!r.locator.timeSlot&&/^2022年(?:4|12)月公表 サンプル問題$/.test(r.locator.period??'')||r.locator.timeSlot==='午後'&&r.locator.year!==undefined&&r.locator.year>=2017&&r.locator.year<=lastYear);
const projectHistorical=(accept:(q:ReturnType<typeof fixture>['questions'][number])=>boolean)=>{
 const b=fixture();b.questions=b.questions.filter(accept);const ids=new Set(b.questions.map(q=>q.id));b.templates=b.templates.filter(t=>ids.has(t.baseQuestionRef.questionId));return b;
};
const withoutMorning=()=>projectHistorical(q=>historicalPosition(q,2019));
const through2018Bundle=()=>projectHistorical(q=>historicalPosition(q,2018));
const initialBaseline=()=>projectHistorical(currentPosition);
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


test("the current catalog retains every independently declared booklet admission and all outstanding source obligations", () => {
  const report = auditPre2023Readiness(fixture(), evidence());
  assert.equal(report.status, "not_ready");
  let ready = 783;
  for (const { collectionId, excluded } of (extensions as InventoryExtensions).collections) {
    const count = inventoryCollectionIdentity(collectionId).count;
    const row = report.collections.find(c => c.id === collectionId)!;
    assert.equal(row.count, count);
    assert.equal(row.ready, count - excluded.length);
    assert.deepEqual(row.questions.filter(q => !q.questionId).map(q => q.number), excluded.map(q => q.number));
    ready += count - excluded.length;
  }
  assert.deepEqual(report.summary, { collections: 67, requestedUnits: 3062, missingOriginals: 3062 - ready, originalSemanticsReviewed: ready, ready });
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
    const unchanged = auditPre2023Readiness(fixture(), evidence());
    const report = auditPre2023Readiness(fixture(), evidence(), reviews), collection = report.collections.find(c => c.id === "2019r01a-fe-pm")!;
    assert.equal(report.status, "not_ready");
    assert.equal(report.summary.collections, 67); assert.equal(report.summary.requestedUnits, 3062);
    assert.equal(report.summary.ready, unchanged.summary.ready - 13);
    assert.equal(report.summary.missingOriginals, unchanged.summary.missingOriginals);
    assert.equal(collection.questions.length, 13); assert.equal(collection.ready, 0);
    assert(collection.questions.every(q => q.pending.includes(check) && !q.pending.includes("missing_original")));
  }
});
