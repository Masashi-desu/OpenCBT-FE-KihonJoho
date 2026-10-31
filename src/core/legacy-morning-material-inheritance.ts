import {isReviewedLegacy2019Spring42Refinement,legacy2019Spring42FsaRight}from './generators/legacy-2019-spring-42-material';
import type {Question}from './types';
import {sortedJson}from './hash';
import {bindLegacy2017Autumn64Material,legacy2017Autumn64Source,legacy2017Autumn64MoeRight}from './generators/legacy-2017-autumn-64-material';

/** Two source-local reviewed refinements of composite scans. Aggregate
 * provenance remains required; only the placement of the already-required
 * material right changes. The original strict MOE slot-D guard stays below. */
export function reviewedMaterialRightsRefinement(question:Question,original:Question):ReadonlySet<string>{
 if(isReviewedLegacy2019Spring42Refinement(question,original))return new Set([legacy2019Spring42FsaRight]);
 const aggregate='rights-ipa-2017h29a-fe-am-moe-planning-candidates';
 if(original.id!=='question-ipa-'+legacy2017Autumn64Source||original.origin.kind!=='official_reprint'||
    question.origin.kind!=='official_adaptation'||original.prompt.attribution.rightsRefs.length!==2||
    ![aggregate,legacy2017Autumn64MoeRight].every(id=>original.prompt.attribution.rightsRefs.includes(id)))return new Set();
 const refKey=(r:Question["origin"]["sourceRefs"][number])=>JSON.stringify(sortedJson(r));
 if(original.origin.sourceRefs.some(ref=>!question.origin.sourceRefs.some(r=>refKey(r)===refKey(ref))))return new Set();
 try{
  const canonical=bindLegacy2017Autumn64Material(question,{source:legacy2017Autumn64Source,originalSlotDChoiceId:'choice-value-4'});
  // The preparatory material splitter removed aggregate origin refs. Origin
  // provenance is separately required by the general inheritance check above.
  // Compare every actual material, answer and other field against its strict
  // source-local canonical form; a missing D condition is never repaired here.
  canonical.origin.sourceRefs=structuredClone(question.origin.sourceRefs);
  if(JSON.stringify(sortedJson(canonical))!==JSON.stringify(sortedJson(question)))return new Set();
  return new Set([aggregate,legacy2017Autumn64MoeRight]);
 }catch{return new Set();}
}
