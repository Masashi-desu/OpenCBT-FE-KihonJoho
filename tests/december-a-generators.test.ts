import test from "node:test";
import {decAFixedKnowledgeReview,decAFixedKnowledgeOracle,decAPathCounterexamples} from "./fixtures/dec-a-fixed-knowledge-review";
import assert from "node:assert/strict";
import {decemberADefinitions as definitions} from "../src/core/generators/sample-2022-dec-a";
import {decAGeneratorOracle,decATreeOracle,decAReviewedNetworkEdges} from "./fixtures/dec-a-generator-oracle";
import {decemberAReview as review} from "./fixtures/dec-2022-a-review";
import {aTree,aNetworkEdges} from "../src/core/generators/sample-2022-dec-a-data";
import {decAOriginalQuantitativeChoices,decAKnowledgeSourceRoles} from "./fixtures/dec-a-source-choices";
test("all 60 December A baselines preserve the separately transcribed official answer and input",()=>{
 assert.equal(definitions.length,60);assert.equal(review.questions.length,60);
 for(const [i,d] of definitions.entries()){const original=review.questions[i],b=d.build(d.reference);assert.deepEqual(d.reference,original.reference,d.source);assert.equal(d.sourceAnswer,original.answer);assert.equal(b.correctIndex,"アイウエ".indexOf(original.answer));decAGeneratorOracle(i+1,b,d.reference);}
});
test("baseline choices retain all original numeric values, expressions and knowledge roles",()=>{
 const norm=(s:string)=>s.replace(/\s/g,"");
 for(const [i,d] of definitions.entries()){const n=i+1,b=d.build(d.reference),actual=b.choices.map(c=>c.flatMap(x=>x.type==="paragraph"||x.type==="code"?[x.text]:x.type==="table"?x.rows.flat():[]));
  if(n===5){for(let c=0;c<4;c++)assert.deepEqual(aTree(0,c,0),decATreeOracle(0,c,0));continue;}
  if(decAOriginalQuantitativeChoices[n])assert.deepEqual(actual.map(c=>c.map(norm)),decAOriginalQuantitativeChoices[n].map(s=>(typeof s==="string"?[s]:s).map(norm)),d.source);
  else {const review=decAKnowledgeSourceRoles[n];assert(review);assert.equal(review.roles.length,4);assert(review.change.length>0);actual.forEach((c,j)=>assert.match(c.join(""),review.match[j],`${d.source} role ${review.roles[j]}`));}
 }
 assert.equal(Object.keys(decAOriginalQuantitativeChoices).length+Object.keys(decAKnowledgeSourceRoles).length+1,60);
});
const counts=[5,4,4,6,16,12,4,6,3,3,6,4,27,6,3,3,8,4,3,4,3,4,3,6,4,10,4,4,18,4,4,3,3,3,3,4,4,4,3,4,3,3,4,9,4,4,3,3,4,8,4,4,3,4,4,3,9,33,6,3];
for(const [i,d] of definitions.entries())test(`December A Q${i+1}: all declared inputs and independent semantics`,()=>{
 let valid=0,invalid=0;const walk=(v:number[])=>{if(v.length<d.fields.length){const f=d.fields[v.length];for(let n=f.minimum;n<=f.maximum;n++)walk([...v,n]);return;}let b;try{b=d.build(v);}catch(e){assert.equal((e as Error).message,"PARAMETER_CONSTRAINT");assert([7,59].includes(i+1));invalid++;return;}decAGeneratorOracle(i+1,b,v);valid++;};walk([]);assert.equal(valid,counts[i]);assert.equal(invalid,i===6?2:i===58?6:0);
});
test("new A oracles reject a wrong answer for every source",()=>{
 for(const [i,d] of definitions.entries()){const b=d.build(d.reference);b.correctIndex=(b.correctIndex!+1)%4;assert.throws(()=>decAGeneratorOracle(i+1,b,d.reference),{name:"AssertionError"});}
});
test("changed displayed premises and unreviewed knowledge cannot use a stale independent answer model",()=>{
 for(const [n,old,next] of [[2,"下位桁から順","上位桁から順"],[8,"n＋f(n−1)","n×f(n−1)"],[13,"90％を超えた","90％以上になった"],[58,"残存価額は0円","残存価額は1000円"]] as const){const d=definitions[n-1],b=d.build(d.reference),block=b.prompt.find(x=>(x.type==="paragraph"||x.type==="code")&&x.text.includes(old));assert(block&&(block.type==="paragraph"||block.type==="code"));block.text=block.text.replace(old,next);assert.throws(()=>decAGeneratorOracle(n,b,d.reference));}
 const d=definitions[18],b=d.build(d.reference),block=b.choices[b.correctIndex!][0];assert(block.type==="paragraph");block.text="電源が失われても永久に情報を保持する。";assert.throws(()=>decAGeneratorOracle(19,b,d.reference));
});
test("tree and network renderer inputs match independently frozen edges and all label variants",()=>{
 assert.deepEqual(aNetworkEdges,decAReviewedNetworkEdges);
 for(let v=0;v<4;v++)for(let c=0;c<4;c++)for(let o=0;o<4;o++)assert.deepEqual(aTree(v,c,o),decATreeOracle(v,c,o));
});
test("Q4 retains both alphabets, initial state, read direction and transition-label meaning before the answer for all six inputs",()=>{
 const d=definitions[3];
 for(let v=0;v<6;v++){
  const b=d.build([v]);decAGeneratorOracle(4,b,[v]);
  for(const [old,next] of [["集合が{0，1}","集合が{0，2}"],["入力記号、出力記号の集合が{0，1}であり、",""],["S₁は初期状態を表し","S₂は初期状態を表し"],["入力記号は左から順に読み込まれる","入力記号は右から順に読み込まれる"],["入力／出力を表している","出力／入力を表している"]]){
   const changed=structuredClone(b),block=changed.prompt.find(x=>x.type==="paragraph"&&x.text.includes(old));assert(block?.type==="paragraph");block.text=block.text.replace(old,next);
   // Keeping the original words in the explanation cannot repair a missing
   // or changed premise in the question visible before answering.
   changed.explanation+=old;assert.throws(()=>decAGeneratorOracle(4,changed,[v]),{name:"AssertionError"});
  }
 }
});

test("fixed-answer A16/A18 vary reviewed mechanisms and path-resolution behaviour",()=>{
 decAPathCounterexamples();
 for(const n of [16,18] as const){const d=definitions[n-1],r=decAFixedKnowledgeReview[n];assert.equal(d.answerVariation,"fixed");assert.equal(d.fields[0].maximum+1,r.wrong.length);
  assert.equal(new Set(r.mechanisms.map(x=>JSON.stringify(x))).size,r.wrong.length);
  for(let v=0;v<r.wrong.length;v++){const b=d.build([v]);decAFixedKnowledgeOracle(n,b,[v]);assert.equal(b.choices[b.correctIndex!][0].type,"paragraph");
   const other=d.build([(v+1)%r.wrong.length]);assert.throws(()=>decAFixedKnowledgeOracle(n,other,[v]),{name:"AssertionError"});}
 }
});
