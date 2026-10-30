/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019AfternoonAuthDefinitions} from "../src/core/generators/legacy-2019-pm-auth";
import {assertLegacy2019PmAuthBody as verify,legacy2019PmAuthInputs as inputs,legacy2019PmAuthFirstExternalFailure} from "./fixtures/legacy-2019-pm-auth-oracle";
import {legacy2019PmAuthReview as review} from "./fixtures/legacy-2019-pm-auth-review";
import {compoundQuestion} from "./fixtures/compound-question";
import {bindBodyAnswers} from "../src/core/generators/definition";
import {compoundAnswerSignature,gradeAnswer,validateAnswerDefinition} from "../src/core/answers";
import {contentHash} from "../src/core/hash";
const d=legacy2019AfternoonAuthDefinitions[0];
test("2019 spring PM1 preserves the whole five-slot source,27 truth checks per input and64 meaningfully different distractor conditions",()=>{
 assert.equal(d.source,review.source);assert.equal(d.answerVariation,"fixed");assert.deepEqual(d.reference,[0,0,0,0,0,0]);assert.deepEqual(d.fields.map(f=>[f.name,f.minimum,f.maximum]),review.roles.map(r=>[r.field,0,1]));
 const bodies=new Set<string>();let truthChecks=0;for(const values of inputs()){const body=d.build(values);truthChecks+=verify(body,values).truthChecks;bodies.add(JSON.stringify(body.choices));}assert.equal(truthChecks,1728);assert.equal(bodies.size,64);assert.equal(legacy2019PmAuthFirstExternalFailure(),3);
 for(const invalid of[[],[0,0,0,0,0],[0,0,0,0,0,0,0],[-1,0,0,0,0,0],[0,0,0,0,0,2],[0,0,.5,0,0,0],[0,NaN,0,0,0,0]])assert.throws(()=>d.build(invalid),/PARAMETER_CONSTRAINT/);
});
test("2019 spring PM1 all2304 slot-choice grades and192 saved/permuted whole majors keep shared IDs and independent a/b/c answers",async()=>{
 let grades=0,saved=0;const signatures=new Set<string>();for(const values of inputs()){
  const body=d.build(values),q=compoundQuestion();q.prompt.blocks=body.prompt;q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:q.prompt.attribution,blocks}}));q.answerParts=body.answerParts;bindBodyAnswers(q,body,q.correctAnswer.attribution);validateAnswerDefinition(q);signatures.add(compoundAnswerSignature(q));
  const correct=Object.fromEntries(q.correctAnswer.parts!.map(p=>{assert(p.kind==="choice");return[p.partId,p.choiceId];}));
  for(const part of q.answerParts!)for(const id of part.choiceIds){const selectedPartChoices={...correct,[part.id]:id},result=gradeAnswer(q,{selectedPartChoices});assert.equal(result.outcome,id===correct[part.id]?"correct":"incorrect");grades++;}
  const before=JSON.stringify(q);for(const shift of[0,1,8]){const restored=JSON.parse(before);restored.choices=[...restored.choices.slice(shift),...restored.choices.slice(0,shift)];validateAnswerDefinition(restored);assert.equal(gradeAnswer(restored,{selectedPartChoices:correct}).outcome,"correct");for(let i=0;i<3;i++)assert.deepEqual(restored.answerParts[i].choiceIds,q.answerParts![0].choiceIds);const shared="choice-value-6",independent={"part-a":shared,"part-b":shared,"part-c":shared};assert.equal(gradeAnswer(restored,{selectedPartChoices:independent}).parts?.filter((p:{outcome:string})=>p.outcome==="correct").length,1);const cleared={...independent,"part-b":undefined};assert.equal(cleared["part-a"],shared);assert.equal(cleared["part-c"],shared);assert.equal(await contentHash(JSON.parse(JSON.stringify(restored))),await contentHash(restored));saved++;}
 }
 assert.equal(grades,2304);assert.equal(saved,192);assert.equal(signatures.size,1,"Fixed correct concepts must not be sold as variable answer signatures");
});
test("2019 spring PM1 independent oracle rejects wrong concepts,missing network/password constraints,wrong order or reason, and a flattened source",()=>{
 let rejected=0;for(const values of inputs()){
  const body=d.build(values);for(const mutate of[
   (b:typeof body)=>{b.choices[5]=[{type:"paragraph",text:"ICカードの所持情報"}];},
   (b:typeof body)=>{b.choices[0]=b.choices[1];},
   (b:typeof body)=>{b.answerParts![1].choiceIds=[...b.answerParts![1].choiceIds].reverse();},
   (b:typeof body)=>{b.answerParts=b.answerParts!.slice(0,1);},
   (b:typeof body)=>{b.partAnswers![4]={kind:"choice",partId:"part-e",choiceId:"choice-value-16"};},
   (b:typeof body)=>{b.explanation=b.explanation.replace("A社の本人認証に実際に使う","");},
   (b:typeof body)=>{b.explanation=b.explanation.replace("LDAPには複数の認証方式","LDAPはパスワード認証だけ");},
   (b:typeof body)=>{b.prompt=b.prompt.map(p=>p.type==="paragraph"?{...p,text:p.text.replace("認証有効期限及び利用者ID","")}:p);},
   (b:typeof body)=>{b.prompt=b.prompt.map(p=>p.type==="paragraph"?{...p,text:p.text.replace("全てファイアウォールによって禁止","")}:p);},
   (b:typeof body)=>{b.prompt=b.prompt.map(p=>p.type==="paragraph"?{...p,text:p.text.replace("認証結果が成功の場合に","")}:p);},
   (b:typeof body)=>{b.prompt=b.prompt.map(p=>p.type==="paragraph"?{...p,text:p.text.replace("設定は、A社のセキュリティポリシに基づき変更できない","")}:p);},
  ]){const wrong=structuredClone(body);mutate(wrong);assert.throws(()=>verify(wrong,values));rejected++;}
  for(let i=0;i<6;i++){const opposite=[...values];opposite[i]^=1;const stale=structuredClone(body);stale.explanation=d.build(opposite).explanation;assert.throws(()=>verify(stale,values));rejected++;}
 }
 assert.equal(rejected,1088);
});
test("2019 spring PM1 capacity review counts actual64 semantic bodies and every finite exclusion boundary without claiming unregistered Run coverage",()=>{
 const pool=inputs().map(values=>({values,body:JSON.stringify(d.build(values).choices)}));assert.equal(new Set(pool.map(r=>r.body)).size,64);for(const preceding of pool){assert.equal(pool.filter(p=>p.body!==preceding.body).length,63);}for(let u=0;u<=64;u++){const excluded=new Set(pool.slice(0,u).map(p=>JSON.stringify(p.values)));assert.equal(pool.filter(p=>!excluded.has(JSON.stringify(p.values))).length,64-u);}assert.match(review.capacity.pending,/実prepareRun\/appendRunQuestion\/seed samplerの統合検査は未完/);assert.match(review.capacity.bounds,/128回/);
});
