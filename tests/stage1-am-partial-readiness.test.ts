import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ledger from "../scripts/source-evidence/stage1-am-partial-release-review.json";
import {auditPre2023Readiness,morningPartialImportReviews,pre2023Reviews} from "../scripts/audit-pre-2023-readiness";
import {readDistributionBundle} from "../scripts/distribution-files";

const kinds=["transcription","rights","originalSemantics","generatorSemantics","rendering"];
const evidence=()=>JSON.parse(fs.readFileSync("scripts/source-evidence/ipa-pre-2023.json","utf8"));
function syntheticAccepted(){
  const value:NonNullable<Parameters<typeof morningPartialImportReviews>[0]>=structuredClone(ledger);
  value.status="reviewed_source_and_normal_app";value.candidateSHA256="1".repeat(64);
  for(const key of ["rootSourceReview","normalApp","independent"] as const)
    value[key]={status:"pass",evidence:{path:"synthetic-metadata-only",sha256:"2".repeat(64)}};
  for(const c of value.collections)for(const q of c.questions)(q.checks as Record<string,string>).rendering="pass";
  return value;
}
test("partial AM review metadata preserves all480 obligations and admits only467 explicitly reviewed rows",()=>{
  const reviews=morningPartialImportReviews(syntheticAccepted());
  assert.equal(reviews.length,467);assert.equal(new Set(reviews.map(r=>`${r.collectionId}:${r.questionNumber}`)).size,467);
  assert(reviews.every(r=>kinds.every(k=>(r.checks as Record<string,string>)[k]==="pass")));
  for(const c of ledger.collections)for(const n of c.heldNumbers)assert(!reviews.some(r=>r.collectionId===c.id&&r.questionNumber===n));
  for(const change of [
    (v:ReturnType<typeof syntheticAccepted>)=>{v.status="pending";},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.normalApp.status="pending";},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.rootSourceReview.evidence=null;},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.independent.evidence=null;},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.collections[0].questions.pop();},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.collections[0].heldNumbers=[];},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.collections[0].questions[0].number=55;},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.collections[0].expected=78;},
    (v:ReturnType<typeof syntheticAccepted>)=>{v.collections[1]=structuredClone(v.collections[0]);},
  ]){const bad=syntheticAccepted();change(bad);assert(morningPartialImportReviews(bad).every(r=>Object.keys(r.checks).length===0));}
});
test("a published subset supplies its own collection without inventing originals, reviews or unanswered rows for the13 holds",()=>{
  const bundle=readDistributionBundle(),before=JSON.stringify(bundle);
  const other=pre2023Reviews.filter(r=>!ledger.collections.some(c=>c.id===r.collectionId));
  const report=auditPre2023Readiness(bundle,evidence(),[...other,...morningPartialImportReviews(syntheticAccepted())]);
  assert.equal(report.summary.collections,67);assert.equal(report.summary.requestedUnits,3062);assert.equal(report.status,"not_ready");
  for(const c of ledger.collections){
    const actual=report.collections.find(v=>v.id===c.id)!;assert.equal(actual.questions.length,80);assert.equal(actual.ready,80-c.heldNumbers.length);
    for(const row of actual.questions)if(c.heldNumbers.includes(row.number)){
      assert.equal(row.questionId,undefined);assert(row.pending.includes("missing_original"));for(const kind of kinds)assert(row.pending.includes(kind));
    }else assert.deepEqual(row.pending,[],`${c.id}:${row.number}`);
  }
  const changed=structuredClone(bundle),annual=changed.sets.find(s=>s.id==="set-annual-2018h30h-fe-am")!;
  annual.questionRefs.push(annual.questionRefs[0]);
  const duplicate=auditPre2023Readiness(changed,evidence(),[...other,...morningPartialImportReviews(syntheticAccepted())]);
  assert(duplicate.collections.find(v=>v.id==="2018h30h-fe-am")!.questions.filter(v=>!ledger.collections[2].heldNumbers.includes(v.number)).every(v=>v.pending.includes("source_collection")));
  assert.equal(JSON.stringify(bundle),before);
});
