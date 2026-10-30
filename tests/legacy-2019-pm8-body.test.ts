/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019AfternoonHuffmanDefinitions} from "../src/core/generators/legacy-2019-pm-huffman";
import {assertLegacy2019Pm8Body as verify} from "./fixtures/legacy-2019-pm8-body-oracle";
import {compoundQuestion} from "./fixtures/compound-question";
import {bindBodyAnswers} from "../src/core/generators/definition";
import {validateAnswerDefinition,gradeAnswer,compoundAnswerSignature} from "../src/core/answers";
import {contentHash} from "../src/core/hash";
const d=legacy2019AfternoonHuffmanDefinitions[0];
test("2019 PM8 draft retains full eight-page major, six ordered parts with shared c/d group and all24 distinct alternatives",()=>{
 assert.equal(d.source,"2019h31h-fe-pm-8");assert.deepEqual(d.reference,[0]);for(let v=0;v<4;v++)verify(d.build([v]),[v]);assert.throws(()=>d.build([4]),/PARAMETER_CONSTRAINT/);assert.throws(()=>d.build([]),/PARAMETER_CONSTRAINT/);
});
test("2019 PM8 all four complete answer definitions survive24-choice permutations and JSON with correct general-procedure answers",async()=>{
 const signatures=new Set<string>();let answers=0;for(let v=0;v<4;v++){const b=d.build([v]),q=compoundQuestion();q.prompt.blocks=b.prompt;q.choices=b.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:q.prompt.attribution,blocks}}));q.answerParts=b.answerParts;bindBodyAnswers(q,b,q.correctAnswer.attribution);validateAnswerDefinition(q);signatures.add(compoundAnswerSignature(q));const saved=JSON.parse(JSON.stringify(q));assert.equal(await contentHash(saved),await contentHash(q));const selectedPartChoices=Object.fromEntries(q.correctAnswer.parts!.map(a=>{assert(a.kind==="choice");return[a.partId,a.choiceId];}));for(const shift of[0,1,7]){const moved=structuredClone(saved);moved.choices=[...moved.choices.slice(shift),...moved.choices.slice(0,shift)];assert.equal(gradeAnswer(moved,{selectedPartChoices}).outcome,"correct");assert.deepEqual(moved.answerParts![2].choiceIds,moved.answerParts![3].choiceIds);answers++;}}assert.equal(signatures.size,4);assert.equal(answers,12);
});
test("2019 PM8 independent body oracle rejects condition/reason swaps, missing source assumptions, single-part reduction and changed fixed original alternatives",()=>{
 for(let v=0;v<4;v++){const body=d.build([v]),wrong=structuredClone(body);wrong.partAnswers![0]={kind:"choice",partId:"part-a",choiceId:"choice-value-2"};assert.throws(()=>verify(wrong,[v]));assert.throws(()=>verify(d.build([(v+1)%4]),[v]));const stale=structuredClone(body);stale.explanation=d.build([(v+1)%4]).explanation;assert.throws(()=>verify(stale,[v]));for(const phrase of["全ての要素は−1","節の値が同じときの順序は並べ替える前の順","右側の子をつなぐ枝に1","小数第3位を四捨五入"]){const missing=structuredClone(body);missing.prompt=missing.prompt.map(b=>b.type==="paragraph"?{...b,text:b.text.replace(phrase,"")}:b);assert.throws(()=>verify(missing,[v]));}const generalized=structuredClone(body);generalized.explanation+="符号語の先頭が他の符号語になっている表は、文字の区切りを一意に復元できない";assert.throws(()=>verify(generalized,[v]));const single=structuredClone(body);single.answerParts=single.answerParts!.slice(0,1);assert.throws(()=>verify(single,[v]));const changed=structuredClone(body);changed.choices[8]=[{type:"paragraph",text:"nsize > 0"}];assert.throws(()=>verify(changed,[v]));}
});
