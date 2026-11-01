import review from './source-evidence/stage3-s3-001-review.json';
import type { ImportReview } from './audit-pre-2023-readiness';

/** Declared reviews never change the80-question obligation. Only the exact
 * source/material/independent/app-reviewed subset can gain readiness checks. */
export function stage3ImportReviews():ImportReview[]{
  const held=[46,56,60,63,66],included=Array.from({length:80},(_,i)=>i+1).filter(n=>!held.includes(n));
  const pin=(v:typeof review.normalApp)=>v.status==='pass' && !!v.evidence &&
    typeof (v.evidence as {path?:unknown}).path==='string' && /^[a-f0-9]{64}$/.test(String((v.evidence as {sha256?:unknown}).sha256));
  const accepted=review.schema==='stage3-booklet-release-review/v1' && review.taskId==='S3-001' &&
    review.status==='reviewed_source_and_normal_app' && review.releaseUnitReady && !review.wholeScopeReady &&
    review.expectedTotal===80 && JSON.stringify(review.includedNumbers)===JSON.stringify(included) &&
    JSON.stringify(review.held.map(h=>h.number))===JSON.stringify(held) &&
    review.held.every(h=>h.status==='material_conditions_unconfirmed'&&!h.bodyPublished&&h.reason.length>10) &&
    [review.rootSourceReview,review.independent,review.normalApp].every(pin) &&
    JSON.stringify(review.questions.map(q=>q.number))===JSON.stringify(included);
  const checks=['transcription','rights','originalSemantics','generatorSemantics','rendering'] as const;
  return review.questions.map(q=>({collectionId:'2016h28h-fe-am',questionNumber:q.number,paperSha256:review.questionPaperSHA256,
    checks:accepted?Object.fromEntries(checks.filter(k=>q.checks[k]==='pass').map(k=>[k,'pass' as const])):{},testFiles:q.testFiles}));
}
