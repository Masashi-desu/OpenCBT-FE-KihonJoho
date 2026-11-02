/** Import-readiness projection only. It cannot admit a distribution or invent
 * obligations from the catalogue. The independent declarations fix the unit. */
import {inventoryCollectionIdentity} from './source-inventory-extension-contract';
import type {ImportReview} from './audit-pre-2023-readiness';

export type BookletReleaseReview={schema:string;taskId:string;status:string;releaseUnitReady:boolean;wholeScopeReady:boolean;expectedTotal:number;includedNumbers:number[];
 held:{number:number;status:string;bodyPublished:boolean;reason:string}[];questionPaperSHA256:string;
 rootSourceReview:{status:string;evidence:unknown};independent:{status:string;evidence:unknown};normalApp:{status:string;evidence:unknown};
 questions:{number:number;checks:Record<string,string>;testFiles:string[]}[]};

export function bookletReleaseReviewPath(collectionId:string){
 const {scope}=inventoryCollectionIdentity(collectionId);
 return 'scripts/source-evidence/legacy-'+scope+'-release-review.json';
}
export function reviewedBookletImports(collection:{collectionId:string;excluded:readonly {number:number}[]},review:BookletReleaseReview):ImportReview[]{
 const {count}=inventoryCollectionIdentity(collection.collectionId),held=collection.excluded.map(h=>h.number),included=Array.from({length:count},(_,i)=>i+1).filter(n=>!held.includes(n));
 const exact=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
 const pin=(gate:BookletReleaseReview['normalApp'])=>gate?.status==='pass'&&gate.evidence&&typeof gate.evidence==='object'&&typeof(gate.evidence as {path?:unknown}).path==='string'&&/^[a-f0-9]{64}$/.test(String((gate.evidence as {sha256?:unknown}).sha256));
 const accepted=review.schema==='stage3-booklet-release-review/v1'&&/^S3-\d{3}$/.test(review.taskId)&&review.status==='reviewed_source_and_normal_app'&&review.releaseUnitReady===true&&review.wholeScopeReady===(held.length===0)&&review.expectedTotal===count&&/^[a-f0-9]{64}$/.test(review.questionPaperSHA256)&&exact(review.includedNumbers,included)&&exact(review.held.map(h=>h.number),held)&&review.held.every(h=>h.status==='material_conditions_unconfirmed'&&h.bodyPublished===false&&h.reason.length>10)&&[review.rootSourceReview,review.independent,review.normalApp].every(pin)&&exact(review.questions.map(q=>q.number),included)&&review.questions.every(q=>q.testFiles.length>0&&q.testFiles.every(f=>/^tests\/[a-zA-Z0-9_./-]+\.test\.ts$/.test(f)&&!f.split('/').includes('..')));
 const checks=['transcription','rights','originalSemantics','generatorSemantics','rendering']as const;
 return review.questions.map(q=>({collectionId:collection.collectionId,questionNumber:q.number,paperSha256:review.questionPaperSHA256,checks:accepted?Object.fromEntries(checks.filter(k=>q.checks[k]==='pass').map(k=>[k,'pass' as const])):{},testFiles:q.testFiles}));
}
