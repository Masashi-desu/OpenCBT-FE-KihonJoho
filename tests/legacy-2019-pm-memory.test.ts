/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { legacy2019AfternoonMemoryDefinitions,legacy2019PageFaults } from "../src/core/generators/legacy-2019-pm-memory";
import { Legacy2019SpringNetworkMemoryFigure as Legacy2019Figure } from "../src/ui/Legacy2019SpringNetworkMemoryFigure";
import { legacy2019Afternoon } from "./fixtures/legacy-2019-spring-local-scope";
import { legacy2019PmMemoryReview as review,legacy2019ReviewedPageLayouts } from "./fixtures/legacy-2019-pm-memory-review";
import { assertLegacy2019Memory as oracle,reviewedPageFaults } from "./fixtures/legacy-2019-pm-memory-oracle";
import { compoundQuestion } from "./fixtures/compound-question";
import { bindBodyAnswers } from "../src/core/generators/definition";
import { gradeAnswer,validateAnswerDefinition } from "../src/core/answers";
// Include the reusable annual stager in normal TypeScript checking without
// running filesystem imports or publishing candidate records during tests.
const d=legacy2019AfternoonMemoryDefinitions[0];
test("2019 spring PM2 preserves all five official slots, all 31 choices and original FIFO/LRU boundary example",()=>{
  const q=legacy2019Afternoon["2019h31h-fe-pm"][1];assert.deepEqual(q.pages,[9,12]);assert.deepEqual(q.slots.map(s=>s.answer),review.sourceAnswers);assert.deepEqual(d.reference,review.reference);
  const body=d.build(d.reference);oracle(d.source,body,d.reference);assert.equal(body.partAnswers!.map((a,i)=>a.kind==="choice"?"アイウエオカキクケ"[body.answerParts![i].choiceIds.indexOf(a.choiceId)]:"?").join(""),"ウエアアエ");
  assert.equal(reviewedPageFaults(review.originalReferenceOrder,3,"FIFO").faults,9);assert.equal(reviewedPageFaults(review.originalReferenceOrder,4,"FIFO").faults,10);
  assert.equal(reviewedPageFaults(review.originalReferenceOrder,3,"LRU").faults,10);assert.equal(reviewedPageFaults(review.originalReferenceOrder,4,"LRU").faults,8);
});
test("2019 spring PM2 all 96 full-major inputs independently evaluate all five groups, displayed counts and initial-state premises",()=>{
  let checked=0;const unique=new Set<string>();for(let layout=0;layout<4;layout++)for(let order=0;order<12;order++)for(let frames=2;frames<=3;frames++){
    const v=[layout,order,frames],body=d.build(v);oracle(d.source,body,v);unique.add(JSON.stringify(body));checked++;
    for(let i=0;i<5;i++){const wrong=structuredClone(body),a=wrong.partAnswers![i];assert(a.kind==="choice");a.choiceId=wrong.answerParts![i].choiceIds[(wrong.answerParts![i].choiceIds.indexOf(a.choiceId)+1)%wrong.answerParts![i].choiceIds.length];assert.throws(()=>oracle(d.source,wrong,v),{name:"AssertionError"});}
  }assert.equal(checked,review.capacity);assert.equal(unique.size,checked);
  const missing=d.build(d.reference);missing.prompt=missing.prompt.filter(b=>b.type!=="paragraph"||!b.text.includes("全て空きページ"));assert.throws(()=>oracle(d.source,missing,d.reference),{name:"AssertionError"});
  for(const values of [[4,0,3],[0,12,3],[0,0,1],[0,0,4],[0,.5,3]])assert.throws(()=>d.build(values),/PARAMETER_CONSTRAINT/);
});
test("2019 page-replacement policies match the independent clock/set model for all 3-page reference strings up to length seven and all capacities 1–3",()=>{
  let strings=0,comparisons=0;const walk=(order:number[])=>{
    strings++;for(let frames=1;frames<=3;frames++)for(const policy of ["FIFO","LRU"] as const){assert.equal(legacy2019PageFaults(order,frames,policy),reviewedPageFaults(order,frames,policy).faults);comparisons++;}
    if(order.length<7)for(let next=1;next<=3;next++)walk([...order,next]);
  };walk([]);assert.equal(strings,3280);assert.equal(comparisons,19680);
  const adversarial=[1,2,3,1,4,1];assert.notEqual(legacy2019PageFaults(adversarial,3,"FIFO"),legacy2019PageFaults(adversarial,3,"LRU"));
  assert.equal(legacy2019PageFaults([1,1,1],2,"FIFO"),1);assert.equal(legacy2019PageFaults([1,1,1],2,"LRU"),1);
});
test("2019 memory mapping SVG includes every original data cell, all present bits, four blanks and both symbolic page counts",()=>{
  legacy2019ReviewedPageLayouts.forEach((layout,i)=>{
    const html=renderToStaticMarkup(createElement(Legacy2019Figure,{profile:"legacy-2019-page-mapping",values:[i],caption:"図1"})).replace(/<desc[^>]*>.*?<\/desc>/s,"");
    for(let row=0;row<8;row++){assert(html.includes(`x="850" y="${144+row*48}" text-anchor="middle">${layout[row]}</text>`));assert(html.includes(`x="150" y="${144+row*48}" text-anchor="middle">${"ABCDEFGH"[row]}</text>`));assert(html.includes(`x="427.5" y="${144+row*48}" text-anchor="middle">1</text>`));}
    for(const label of ["a1","a2","a3","a4","m","n","仮想アドレス空間","ページテーブル","物理アドレス空間","存在ビット"])assert(html.includes(`>${label}</text>`));
    assert.equal((html.match(/stroke-dasharray="5 5"/g)??[]).length,4);assert.equal((html.match(/marker-end=/g)??[]).length,5);assert(!html.includes("undefined"));assert(!html.includes("NaN"));
  });
});
test("2019 memory whole-major body binds all five answer parts, keeps the two nine-choice groups separate and grades after JSON roundtrip",()=>{
  for(const values of [d.reference,[3,11,2]]){
    const body=d.build(values),q=compoundQuestion();q.prompt.blocks=body.prompt;q.answerParts=body.answerParts;
    q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:q.prompt.attribution,blocks}}));bindBodyAnswers(q,body,q.correctAnswer.attribution);
    const saved=JSON.parse(JSON.stringify(q)) as typeof q;validateAnswerDefinition(saved);assert.equal(saved.correctAnswer.choiceId,undefined);assert.deepEqual(saved.answerParts!.map(p=>p.choiceIds.length),[5,4,4,9,9]);
    const choices=Object.fromEntries(saved.correctAnswer.parts!.map(a=>{assert(a.kind==="choice");return[a.partId,a.choiceId];}));assert.equal(gradeAnswer(saved,{selectedPartChoices:choices}).outcome,"correct");
    for(const part of saved.answerParts!){const bad={...choices,[part.id]:part.choiceIds.find(id=>id!==choices[part.id])!},grade=gradeAnswer(saved,{selectedPartChoices:bad});assert.equal(grade.outcome,"incorrect");assert.equal(grade.parts!.filter(p=>p.outcome==="correct").length,4);}
    assert.throws(()=>gradeAnswer(saved,{selectedPartChoices:{...choices,"part-d":saved.answerParts![4].choiceIds[0]}}),{code:"ANSWER_REF"});
    assert.throws(()=>bindBodyAnswers(saved,{...body,correctIndex:0},saved.correctAnswer.attribution),{code:"SOURCE_FORMAT"});
  }
});
