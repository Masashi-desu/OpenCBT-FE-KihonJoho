import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {makeLegacy2016Definitions} from '../src/core/generators/legacy-2016';
import {spring2016ParameterInputs as spring2016Inputs,spring2016Trees,decodeSpring2016,spring2016Case} from '../src/core/generators/legacy-2016-spring-fundamentals-models';
import {assertSpring2016Body} from './fixtures/legacy-2016-spring-fundamentals-oracle';
import {spring2016Review as review,spring2016Q1CapacityReview as q1Review} from './fixtures/legacy-2016-spring-fundamentals-review';
test('all400 native inputs: independent all-choice truth, exact original8, notes and finite reject',()=>{let total=0;for(const[n0,d]of makeLegacy2016Definitions().entries()){const n=n0+1,rows=spring2016Inputs[n];assert.equal(rows.length,review.counts[n0]);assert.deepEqual(d.reference,rows[0]);for(const v of rows){const decoded=(inputContract.internalAcceptedValues as Record<string,number[][]>)[String(n)][v[0]];assert.deepEqual(decodeSpring2016(n,v),decoded);assertSpring2016Body(n,d.build([...v]),decoded,n===5?spring2016Trees[decoded[0]]:undefined);total++;}for(const invalid of [[],[...d.reference,1],d.reference.map(()=>-1),d.reference.map(()=>NaN)])assert.throws(()=>d.build(invalid),/PARAMETER_CONSTRAINT/);}assert.equal(total,400);assert.equal(review.remaining72,72);});
test('Q7 keeps nonterminating B/D and four distinct additive functions; old35 is not accepted',()=>{const d=makeLegacy2016Definitions()[6];assert.equal(d.answerVariation,'fixed');assert.equal(new Set(spring2016Inputs[7].map(v=>d.build([...v]).choices[0][0].type==='paragraph'?(d.build([...v]).choices[0][0] as {text:string}).text:'')).size,4);});

import inputContract from './fixtures/legacy-2016-spring-fundamentals-input-contracts.json';
test('independently fixed correlated domain: all raw rectangle combinations admitted or rejected exactly',()=>{let adopted=0,rejected=0;for(const[n0,d]of makeLegacy2016Definitions().entries()){const n=n0+1,rows=(inputContract.acceptedValues as Record<string,number[][]>)[String(n)],rect=(inputContract.fieldRectangles as Record<string,number[][]>)[String(n)],expected=new Set(rows.map(x=>JSON.stringify(x)));assert.deepEqual(spring2016Inputs[n],rows);if(n===5)assert.deepEqual(spring2016Trees,inputContract.independentTreePaths);assert.deepEqual(d.reference,inputContract.sourceReferenceTuples[n0].values);assert.deepEqual(d.fields.map(f=>[f.minimum,f.maximum]),rect);const walk=(v:number[])=>{if(v.length<rect.length){const[min,max]=rect[v.length];for(let x=min;x<=max;x++)walk([...v,x]);return;}if(expected.has(JSON.stringify(v))){d.build(v);adopted++;}else{assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);rejected++;}};walk([]);}assert.equal(adopted,400);assert.equal(rejected,0);});
test('negative stale source prompt, omitted premise or misbound scene is rejected independently',()=>{const defs=makeLegacy2016Definitions();for(const n of[1,3,6]){const d=defs[n-1],internal=(inputContract.internalAcceptedValues as Record<string,number[][]>)[String(n)],index=internal.findIndex(x=>n===3?x[0]===1&&x[1]===1:JSON.stringify(x)!==JSON.stringify(internal[0])),values=[index],decoded=internal[index],body=d.build(values);body.prompt[0]=d.build(d.reference).prompt[0];assert.throws(()=>assertSpring2016Body(n,body,decoded));}for(const n of[2,5,7,8]){const d=defs[n-1],index=spring2016Inputs[n].length-1,decoded=(inputContract.internalAcceptedValues as Record<string,number[][]>)[String(n)][index],body=d.build([index]),b=body.prompt[1];assert(b.type==='diagram'&&b.scene.kind==='source_figure');b.scene.values=n===7?[1]:n===2?[1-decoded[0]]:n===5?[999]:[99,99];assert.throws(()=>assertSpring2016Body(n,body,decoded,n===5?spring2016Trees[decoded[0]]:undefined));}const d5=defs[4];for(const v of spring2016Inputs[5]){const decoded=decodeSpring2016(5,v),body=d5.build([...v]);const row=body.choices[0][0];assert(row.type==='paragraph');const match=/^a=([1-9])，b=([1-9])$/.exec(row.text);assert(match);body.choices[0]=[{type:'table',columns:['a','b'],rows:[[match[1],match[2]]],caption:'空欄の組合せ'}];assert.throws(()=>assertSpring2016Body(5,body,decoded,spring2016Trees[decoded[0]]));}const d=defs[0],body=d.build(d.reference);const b=body.prompt[0];assert(b.type==='paragraph');b.text=b.text.replace('ここで，あふれ（オーバフロー）は，発生しないものとする。','');assert.throws(()=>assertSpring2016Body(1,body,inputContract.internalReferences[0]));});

test('Q1 ten meaningful finite cases preserve the old two bodies and leave eight inputs after the observed prior run',()=>{
 const d=makeLegacy2016Definitions()[0];
 const expected=[[2,1],[1,2],[1,3],[1,4],[2,3],[2,4],[3,1],[3,2],[3,3],[3,4]];
 assert.deepEqual(inputContract.internalAcceptedValues['1'],expected);assert.equal(q1Review.after,10);
 assert.equal(d.version,'3.2.0');assert.deepEqual(d.reference,[0]);assert.deepEqual(d.fields.map(f=>[f.minimum,f.maximum]),[[0,9]]);
 for(let index=0;index<2;index++)assert.equal(createHash('sha256').update(JSON.stringify(d.build([index]))).digest('hex'),q1Review.preservedBodySHA256[index]);
 const signatures=new Set<string>();let kept=0,excluded=0;
 for(let s=1;s<=3;s++)for(let k=1;k<=4;k++){
  const unique=!(s===1&&k===1||s===2&&k===2),index=expected.findIndex(v=>v[0]===s&&v[1]===k);
  assert.equal(index>=0,unique);
  if(!unique){assert.throws(()=>spring2016Case(1,[s,k]),/PARAMETER_CONSTRAINT/);excluded++;continue;}
  assert.equal(spring2016Case(1,[s,k]),index);assert.deepEqual(decodeSpring2016(1,[index]),[s,k]);
  const body=d.build([index]);assertSpring2016Body(1,body,[s,k]);
  const signature=JSON.stringify([body.prompt,body.choices]);assert(!signatures.has(signature));signatures.add(signature);kept++;
 }
 assert.equal(kept,10);assert.equal(excluded,2);assert.equal(signatures.size,10);
 const previouslyUsed=new Set(['[0]','[1]']);
 assert.equal(spring2016Inputs[1].filter(v=>!previouslyUsed.has(JSON.stringify(v))).length,8);
 for(const v of [[],[-1],[10],[.5],[Infinity],[0,1]])assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);
});

test('Q1 independent all-choice oracle rejects110 answer, binding, premise and explanation mutations across all ten inputs',()=>{
 const d=makeLegacy2016Definitions()[0];let rejected=0;
 for(let i=0;i<10;i++){
  const values=decodeSpring2016(1,[i]),[s,k]=values,body=d.build([i]);assertSpring2016Body(1,body,values);
  const reject=(changed:typeof body)=>{assert.throws(()=>assertSpring2016Body(1,changed,values));rejected++;};
  for(let wrong=0;wrong<4;wrong++)if(wrong!==2){const b=structuredClone(body);b.correctIndex=wrong;reject(b);}
  for(const slot of[0,1,3]){const b=structuredClone(body);b.choices[slot]=structuredClone(b.choices[2]);reject(b);}
  const numeric=structuredClone(body),correct=numeric.choices[2][0];assert(correct.type==='paragraph');correct.text=String(Number(correct.text)+1);reject(numeric);
  const omitted=structuredClone(body),p0=omitted.prompt[0];assert(p0.type==='paragraph');p0.text=p0.text.replace('ここで，あふれ（オーバフロー）は，発生しないものとする。','');reject(omitted);
  const shift=structuredClone(body),p1=shift.prompt[0];assert(p1.type==='paragraph');p1.text=p1.text.replace(`${s}ビット左`,`${s+1}ビット左`);reject(shift);
  const add=structuredClone(body),p2=add.prompt[0];assert(p2.type==='paragraph');p2.text=p2.text.replace(`して，${k===1?'x':`${k}×x`} を加える`,`して，${k+1}×x を加える`);reject(add);
  const reason=structuredClone(body);reason.explanation=reason.explanation.replace(/\d+xになる。/,'99xになる。');assert.notEqual(reason.explanation,body.explanation);reject(reason);
 }
 assert.equal(rejected,110);
});
