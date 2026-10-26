import test from "node:test";
import assert from "node:assert/strict";
import contracts from "./fixtures/legacy-2017-pm8-contracts.json";
import {contentHash} from "../src/core/hash";
import {createHash} from "node:crypto";
import {fixture} from "./fixtures/legacy-afternoon-main-preservation";
import type {Question} from "../src/core/types";
import {legacy2017Pm8Definition as d} from "../src/core/generators/legacy-2017-pm8";
import {assertLegacy2017Pm8,pm8ExplanationFacts} from "./fixtures/legacy-2017-pm8-oracle";
import {legacy2017Pm8OriginalMatrix as matrix} from "./fixtures/legacy-2017-pm8-source-review";
import {bindBodyAnswers,ownContexts} from "../src/core/generators/definition";
import {gradeAnswer,validateAnswerDefinition,validateEntryAnswers,answerLabels,compoundAnswerSignature} from "../src/core/answers";
function question(v:number){const q:Question=structuredClone(fixture().questions[0]),b=d.build([v]),attribution=q.prompt.attribution;q.subject="B";q.prompt={attribution,blocks:b.prompt};q.choices=b.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution,blocks}}));q.answerParts=b.answerParts;q.contexts=ownContexts(b,attribution);q.contextRefs=q.contexts.map(c=>c.id);q.explanation={attribution,blocks:[{type:"paragraph",text:b.explanation}]};bindBodyAnswers(q,b,attribution);return q;}
test("PM8全8実距離条件の全本文/共通資料/7欄34択/全真偽/独立解説を大問のまま検査する",()=>{
 assert.equal(d.version,"3.2.0");assert.deepEqual(d.fields,[{name:"辺の距離の条件",minimum:0,maximum:7}]);assert.deepEqual(d.reference,[0]);assert.equal(d.answerVariation,undefined);const hashes=new Set<string>();for(let v=0;v<8;v++){const b=d.build([v]);assertLegacy2017Pm8(b,[v]);hashes.add(createHash("sha256").update(JSON.stringify(b)).digest("hex"));}assert.equal(hashes.size,8);for(const values of [[],[0,0],[-1],[8],[NaN],[Infinity],[.5]])assert.throws(()=>d.build(values),/PARAMETER_CONSTRAINT/);
});
test("7欄はJSON保存後も独立採点し、c/dの同一選択を許す。全42選択と7未解答を検査する",()=>{
 let selections=0,missing=0;for(let v=0;v<8;v++){const q=JSON.parse(JSON.stringify(question(v)))as Question;validateAnswerDefinition(q);const correct=Object.fromEntries(q.correctAnswer.parts!.map(a=>{assert(a.kind==="choice");return [a.partId,a.choiceId];}));assert.equal(gradeAnswer(q,{selectedPartChoices:correct}).outcome,"correct");assert.equal(answerLabels(q),"設問1 a：イ、設問1 b：オ、設問1 c：キ、設問1 d：イ、設問2 e：イ、設問2 f：カ、設問2 g：ア");assert.deepEqual(q.answerParts![2].choiceIds,q.answerParts![3].choiceIds);
  for(const part of q.answerParts!){for(const id of part.choiceIds){const selectedPartChoices={...correct,[part.id]:id},result=gradeAnswer(q,{selectedPartChoices});assert.equal(result.parts!.find(p=>p.partId===part.id)!.outcome,id===correct[part.id]?"correct":"incorrect");assert(result.parts!.filter(p=>p.partId!==part.id).every(p=>p.outcome==="correct"));assert.equal(result.outcome,id===correct[part.id]?"correct":"incorrect");selections++;}const selectedPartChoices={...correct};delete selectedPartChoices[part.id];const result=gradeAnswer(q,{selectedPartChoices});assert.equal(result.outcome,"unanswered");assert.equal(result.parts!.find(p=>p.partId===part.id)!.outcome,"unanswered");assert(result.parts!.filter(p=>p.partId!==part.id).every(p=>p.outcome==="correct"));missing++;}
  const same={...correct,"part-c":correct["part-d"]};assert.doesNotThrow(()=>validateEntryAnswers(q,{selectedPartChoices:same}));const outcome=gradeAnswer(q,{selectedPartChoices:same});assert.equal(outcome.parts!.find(p=>p.partId==="part-c")!.outcome,"incorrect");assert.equal(outcome.parts!.find(p=>p.partId==="part-d")!.outcome,"correct");for(const order of [q.choices.map(c=>c.id),q.choices.map(c=>c.id).reverse()]){const saved=JSON.parse(JSON.stringify({choiceOrder:order,selectedPartChoices:correct}));assert.equal(gradeAnswer(q,saved).outcome,"correct");assert(saved.choiceOrder.includes(q.correctAnswer.parts![0].kind==="choice"?q.correctAnswer.parts![0].choiceId:""));}
 }assert.equal(selections,336);assert.equal(missing,56);
});
test("7欄ID固定とfの実正答内容を区別し、全8compound signatureと同一f条件を明示する",()=>{
 const signatures=Array.from({length:8},(_,v)=>compoundAnswerSignature(question(v))),f=Array.from({length:8},(_,v)=>{const q=question(v),a=q.correctAnswer.parts!.find(a=>a.kind==="choice"&&a.partId==="part-f")!;assert(a.kind==="choice");return JSON.stringify(q.choices.find(c=>c.id===a.choiceId)!.content.blocks);});assert.equal(new Set(signatures).size,8);assert.equal(new Set(f).size,8);for(let i=0;i<8;i++)for(let j=0;j<8;j++)assert.equal(signatures[i]===signatures[j],f[i]===f[j]);
});
test("本文外の初期化/前提欠落/択断片化/共有群崩れ/誤解説を受理しない",()=>{
 const b=d.build([0]);for(const mutate of [
  (q:typeof b)=>{q.prompt=q.prompt.filter(x=>x.type!=="paragraph"||!x.text.includes("少なくとも一つ"));},
  (q:typeof b)=>{q.prompt.splice(0,0,{type:"paragraph",text:"設問1でもpRouteの全要素を0に初期化する。"});},
  (q:typeof b)=>{const x=q.prompt.find(x=>x.type==="paragraph"&&x.text.includes("ここで、配列pRoute"));assert(x?.type==="paragraph");x.text=x.text.replace("ここで、配列pRouteの全ての要素には初期値として0が格納されているものとする。","");},
  (q:typeof b)=>{q.choices[22]=[{type:"paragraph",text:"ア"}];},
  (q:typeof b)=>{q.answerParts![3].choiceIds=[...q.answerParts![3].choiceIds].reverse();},
  (q:typeof b)=>{q.partAnswers![2]={kind:"choice",partId:"part-c",choiceId:"choice-value-11"};},
  (q:typeof b)=>{const x=q.prompt.find(x=>x.type==="table"&&x.caption.startsWith("表2"));assert(x?.type==="table");x.rows[0][1]="−1";},
  (q:typeof b)=>{q.contexts![0].blocks.pop();},
 ]){const q=structuredClone(b);mutate(q);assert.throws(()=>assertLegacy2017Pm8(q,[0]));}
 for(const reason of pm8ExplanationFacts(matrix)){const q=structuredClone(b);q.explanation=q.explanation.replace(reason,"");assert.throws(()=>assertLegacy2017Pm8(q,[0]));}for(const [from,to]of [["not(pFixed[j])","not(pFixed[i])"],["b：選んだ地点番号sPoint","b：選んだ地点番号dp"],["c：逆順の結果の書込先はsRoute[j]","c：逆順の結果の書込先はpRoute[j]"],["d：現在の地点iの直前の経由地pRoute[i]","d：現在の地点iの直前の経由地pRoute[dp]"],["e：確定する地点は0、1、3","e：確定する地点は0、1、4"],["地点6は未更新の∞のまま","地点6は14に更新済み"],["未更新の地点6は設問2の初期値0","未更新の地点6は設問1の初期値0"]]){const q=structuredClone(b);assert(q.explanation.includes(from));q.explanation=q.explanation.replace(from,to);assert.throws(()=>assertLegacy2017Pm8(q,[0]));}
});


test("PM8現行8body/版/入力域/全正答内容の契約hashを固定する",async()=>{
 const metadata={source:d.source,title:d.title,version:d.version,fields:d.fields,reference:d.reference,sourceAnswer:d.sourceAnswer,answerVariation:d.answerVariation??'variable',notes:d.notes};assert.equal(contracts.metadataSha256,await contentHash(metadata));assert.equal(contracts.valid,8);assert.equal(contracts.refusedInDomain,0);for(const r of contracts.outputs){const body=d.build(r.values);assertLegacy2017Pm8(body,r.values);assert.equal(await contentHash(body),r.sha256);assert.deepEqual(body.choices[27],r.correctF);assert.deepEqual(body.partAnswers,r.partAnswers);}
});
