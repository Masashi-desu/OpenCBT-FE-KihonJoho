import type {Attribution,Question,Template} from '../types';
import {DataError} from '../errors';
import {sortedJson} from '../hash';
import reviewedInput from './legacy-2019-spring-42-material-review.json';

export const legacy2019Spring42Source='2019h31h-fe-am-42';
export const legacy2019Spring42FsaRight='rights-fsa-2011-information-communication';
const source=legacy2019Spring42Source,base='question-template-source-'+source,original='question-ipa-'+source,template='template-source-'+source,generator='generator-source-'+source;
const eq=(a:unknown,b:unknown)=>JSON.stringify(sortedJson(a))===JSON.stringify(sortedJson(b));
const fail=():never=>{throw new DataError('SOURCE_MATERIAL','2019春午前42の査読済み本文・素材範囲と一致しません');};
/** Own finite JSON through data descriptors. No caller getter or retained alias. */
export function ownLegacy2019Spring42Json<T>(v:T,ancestors=new Set<object>()):T{
 if(v===null||typeof v==='string'||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v)&&!Object.is(v,-0))return v;
 if(!v||typeof v!=='object'||ancestors.has(v))return fail();ancestors.add(v);let out:unknown;
 if(Array.isArray(v)){if(Object.getPrototypeOf(v)!==Array.prototype||Reflect.ownKeys(v).length!==v.length+1)return fail();out=Array.from({length:v.length},(_,i)=>{const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!d.enumerable||!('value'in d))return fail();return ownLegacy2019Spring42Json(d.value,ancestors);});}
 else{if(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)return fail();out=Object.fromEntries(Reflect.ownKeys(v).map(k=>{const d=Object.getOwnPropertyDescriptor(v,k)!;if(typeof k!=='string'||!d.enumerable||!('value'in d))return fail();return[k,ownLegacy2019Spring42Json(d.value,ancestors)];}));}
 ancestors.delete(v);return out as T;
}
// Keep the module-owned contract independent of any other JSON importer.
const reviewed=ownLegacy2019Spring42Json(reviewedInput);
function caseOf(q:Question){
 const parent=q.id===base?original:base;
 if(q.revision!==1||q.subject!=='A'||q.origin.kind!=='official_adaptation'||!q.origin.isModified||q.origin.modificationBasis!=='official_source'||
    !eq(q.origin.sourceRefs,reviewed.originSourceRefs)||!eq(q.origin.derivedFrom,[{questionId:parent,revision:1}])||
    q.contexts.length||q.contextRefs.length||q.assetRefs.length||q.answerParts||q.choices.length!==4||
    !eq(q.correctAnswer.attribution,reviewed.independentAttribution)||!eq(q.explanation.attribution,reviewed.independentAttribution))return fail();
 const ids=q.choices.map(c=>c.id);if(new Set(ids).size!==4||Array.from({length:4},(_,i)=>'choice-value-'+(i+1)).some(id=>!ids.includes(id)))return fail();
 const cases=reviewed.cases.filter(c=>eq(q.prompt.blocks,c.prompt)&&q.choices.every(ch=>eq(ch.content.blocks,c.choices[Number(ch.id.slice('choice-value-'.length))-1]))&&
    q.correctAnswer.choiceId==='choice-value-'+(c.correctIndex+1)&&eq(q.explanation.blocks,[{type:'paragraph',text:c.explanation}]));
 if(cases.length!==1)return fail();return cases[0];
}
function templateGuard(t:Template){
 if(t.id!==template||t.revision!==1||t.generatorRef.id!==generator||t.generatorRef.version!==reviewed.version||
    !eq(t.baseQuestionRef,{questionId:base,revision:1})||!eq(t.parameterDomain,reviewed.parameterDomain)||
    !eq(t.referenceParameters,reviewed.referenceParameters)||!eq(t.attribution,reviewed.templateAttribution)||!eq(t.editorIds,['codex']))return fail();
}
function questionGuard(q:Question){
 const c=caseOf(q);if(!eq(q.prompt.attribution,reviewed.ipaAttribution)||q.choices.some(ch=>!eq(ch.content.attribution,c.value===0&&ch.id===reviewed.originalSlotIChoiceId?reviewed.fsaAttribution:reviewed.ipaAttribution)))return fail();
 return c;
}
function triggered(q:Question,t:Template){return q.id===base||t.id===template||t.generatorRef.id===generator||t.baseQuestionRef.questionId===base||q.origin.derivedFrom.some(r=>r.questionId===base||r.questionId===original);}
/** Current 3.2.0 only. All three full bodies are fixed review inputs. In input0
 * the original I sentence is carried by stable ID2; in inputs1/2 that slot is
 * independently written material. Correctness never determines this credit. */
export function validateLegacy2019Spring42Materials(q:Question,t:Template):boolean{
 if(!triggered(q,t))return false;templateGuard(t);questionGuard(q);return true;
}
/** Bind only from the already narrowed, reviewed reference. The shared binder
 * initially inherits ID2 credit; this hook removes that credit exactly when
 * the registered body replaces the sentence. It cannot repair missing scope. */
export function bindLegacy2019Spring42Materials(q:Question,baseQuestion:Question,t:Template):void{
 if(!triggered(q,t))return;
 if(!validateLegacy2019Spring42Materials(baseQuestion,t)||baseQuestion.id!==base||caseOf(baseQuestion).value!==0)return fail();
 const c=caseOf(q);if(!eq(q.prompt.attribution,reviewed.ipaAttribution)||q.choices.some(ch=>!eq(ch.content.attribution,ch.id===reviewed.originalSlotIChoiceId?reviewed.fsaAttribution:reviewed.ipaAttribution)))return fail();
 if(c.value!==0)q.choices.find(ch=>ch.id===reviewed.originalSlotIChoiceId)!.content.attribution=ownLegacy2019Spring42Json(reviewed.ipaAttribution) as Attribution;
 validateLegacy2019Spring42Materials(q,t);
}
/** Dev after-step entry. Only the exact previously aggregate-credited base is
 * accepted. Its content, origin, answer, explanation and original stay intact. */
export function narrowLegacy2019Spring42ReviewedBase(value:Question,t:Template):Question{
 const q=ownLegacy2019Spring42Json(value);templateGuard(t);if(q.id!==base||caseOf(q).value!==0||
    !eq(q.prompt.attribution,reviewed.fsaAttribution)||q.choices.some(ch=>!eq(ch.content.attribution,reviewed.fsaAttribution)))return fail();
 q.prompt.attribution=ownLegacy2019Spring42Json(reviewed.ipaAttribution) as Attribution;
 for(const ch of q.choices)if(ch.id!==reviewed.originalSlotIChoiceId)ch.content.attribution=ownLegacy2019Spring42Json(reviewed.ipaAttribution) as Attribution;
 validateLegacy2019Spring42Materials(q,t);return q;
}
/** Source-local exception for composite-scan inheritance, no general bypass.
 * Retains every aggregate origin SourceRef and verifies the original signature.
 * Only FSA's prompt-level requirement may move to its reviewed material slot. */
export function isReviewedLegacy2019Spring42Refinement(q:Question,root:Question):boolean{
 try{
  const signature={id:root.id,revision:root.revision,origin:{kind:root.origin.kind,isModified:root.origin.isModified,sourceRefs:root.origin.sourceRefs},prompt:root.prompt,choices:root.choices,correctAnswer:root.correctAnswer};
  if(root.id!==original||!eq(signature,reviewed.originalSignature))return false;
  questionGuard(q);return true;
 }catch{return false;}
}
