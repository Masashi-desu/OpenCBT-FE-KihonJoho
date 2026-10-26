import assert from "node:assert/strict";
import test from "node:test";
import {fixture} from "./fixtures";
import {bindQuestion} from "../src/core/generation";
import {contentHash} from "../src/core/hash";
import {refOf,type Run,type Selection} from "../src/core/types";
import {selectQuestions} from "../src/core/selection";
import {prepareRun,startRun,updateAnswer,finishRun,validateRun} from "../src/core/session";

test("生成後も基準問題の固定順/並替え許可を保持し、実出題の正答IDとJSON復元へ反映する",async context=>{
 // Deterministic Fisher-Yates: zero swaps rotate four elements, so a hidden
 // unconditional true cannot happen to pass through a coincidental identity.
 const random=context.mock.method(crypto,"getRandomValues",<T extends ArrayBufferView|null>(array:T):T=>{
  assert.ok(array);new Uint8Array(array.buffer,array.byteOffset,array.byteLength).fill(0);return array;
 });
 try{
  for(const permitted of [false,true]){
   const b=fixture(),t=b.templates.find(t=>t.id==="template-source-sample-2022-dec-a-1")!;assert.ok(t);
   const base=b.questions.find(q=>q.id===t.baseQuestionRef.questionId)!;base.choiceShuffleAllowed=permitted;t.originalContentSha256=await contentHash(base);
   const original=b.questions.find(q=>base.origin.derivedFrom.some(r=>r.questionId===q.id))!;assert.ok(original);
   const selection:Selection={subject:base.subject,kind:"bookmark",mode:"study",bindingMode:"generated_values",bookmarkQuestionRef:refOf(original)},prepared=selectQuestions(b,selection);
   assert.equal(prepared.exam.choiceOrder,"shuffle");
   const run=await prepareRun(b,selection,{},100000,undefined,prepared),q=run.issued[0],order=q.choices.map(c=>c.id);
   assert.equal(q.choiceShuffleAllowed,permitted);assert.equal(run.instances[0].question.choiceShuffleAllowed,permitted);
   if(permitted)assert.notDeepEqual(run.session.entries[0].choiceOrder,order);else assert.deepEqual(run.session.entries[0].choiceOrder,order);
   const answer=q.correctAnswer.choiceId!;assert.ok(order.includes(answer));const correctDisplayIndex=run.session.entries[0].choiceOrder.indexOf(answer);assert.ok(correctDisplayIndex>=0);
   const resumed=JSON.parse(JSON.stringify(run)) as Run;await validateRun(resumed);assert.deepEqual(resumed.session.entries[0].choiceOrder,run.session.entries[0].choiceOrder);assert.equal(resumed.issued[0].correctAnswer.choiceId,answer);
   const completed=finishRun(updateAnswer(startRun(resumed,101000),resumed.session.entries[0].choiceOrder[correctDisplayIndex],102000),"completed",103000);
   assert.equal(completed.result!.entries[0].outcome,"correct");const roundTrip=JSON.parse(JSON.stringify(completed)) as Run;await validateRun(roundTrip);assert.deepEqual(roundTrip.result,completed.result);
  }
 }finally{random.mock.restore();}
});

test("既存2022〜2026公開範囲の全基準問題と生成結果は引き続き並替えを許可する",()=>{
 const b=fixture(),templates=b.templates.filter(t=>{const base=b.questions.find(q=>q.id===t.baseQuestionRef.questionId)!;return base.origin.sourceRefs.some(s=>Number(s.locator.year)>=2022&&Number(s.locator.year)<=2026||/^source-ipa-sample-2022-(apr|dec)-[ab]-qs$/.test(s.sourceId));});
 assert.equal(templates.length,189,"frozen 2022 sample + 2023–2026 official scope; not an upper bound for later imports");
 for(const t of templates){const base=b.questions.find(q=>q.id===t.baseQuestionRef.questionId)!;assert.equal(base.choiceShuffleAllowed,true,base.id);const generated=bindQuestion(base,t,t.referenceParameters.values,`policy-${t.id}`,"2026-10-19T00:00:00Z");assert.equal(generated.choiceShuffleAllowed,true,t.id);}
 console.log(`Existing source scope checked: ${templates.length} bases and generated questions`);
});
