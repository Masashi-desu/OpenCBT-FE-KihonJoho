/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019AfternoonDatabaseDefinitions} from "../src/core/generators/legacy-2019-pm-database";
import {legacy2019Afternoon} from "./fixtures/legacy-2019-spring-local-scope";
import {legacy2019PmDatabaseReview as review} from "./fixtures/legacy-2019-pm-database-review";
import {assertLegacy2019Database as oracle,reviewedSqlLike,reviewedRightJoin,reviewedSqlAggregate,type ReviewedMeasurement,type ReviewedCategory} from "./fixtures/legacy-2019-pm-database-oracle";
import {compoundQuestion} from "./fixtures/compound-question";
import {bindBodyAnswers} from "../src/core/generators/definition";
import {gradeAnswer,validateAnswerDefinition} from "../src/core/answers";
const d=legacy2019AfternoonDatabaseDefinitions[0];
const each=(fn:(v:number[])=>void)=>{const walk=(v:number[])=>{if(v.length===d.fields.length){fn(v);return;}const f=d.fields[v.length];for(let n=f.minimum;n<=f.maximum;n++)walk([...v,n]);};walk([]);};
test("2019 spring PM3 retains all five source pages, six official slots, full original tables and every one of the 31 alternatives",()=>{
  const q=legacy2019Afternoon["2019h31h-fe-pm"][2];assert.deepEqual(q.pages,[13,17]);assert.deepEqual(q.slots.map(s=>s.answer),[...review.sourceAnswers]);assert.deepEqual(d.reference,[...review.reference]);
  const b=d.build(d.reference);oracle(d.source,b,d.reference);assert.equal(b.partAnswers!.map((a,i)=>a.kind==="choice"?"アイウエオカ"[b.answerParts![i].choiceIds.indexOf(a.choiceId)]:"?").join(""),"アウアエウア");
  const tables=b.prompt.filter(block=>block.type==="table");assert.deepEqual(tables[0].rows.filter(r=>r[0]!=="⋮"),review.originalTransitionRows.map(r=>[...r]));assert.deepEqual(tables[1].rows,review.originalClasses.map(r=>[...r]));assert.deepEqual(tables[2].rows.map(r=>Number(r[1])),[...review.originalWrongFrequencies]);
  assert.equal(d.answerVariation,undefined);
});
test("2019 spring PM3 all 72 whole-major inputs satisfy independent LIKE, view type, sorting, constraints and outer-join aggregation criteria",()=>{
  let checked=0;const unique=new Set<string>(),correctChoices=new Set<string>();each(v=>{const b=d.build(v);oracle(d.source,b,v);unique.add(JSON.stringify(b));correctChoices.add(JSON.stringify(b.partAnswers));checked++;
    for(let i=0;i<6;i++){const bad=structuredClone(b),a=bad.partAnswers![i];assert(a.kind==="choice");a.choiceId=bad.answerParts![i].choiceIds[(bad.answerParts![i].choiceIds.indexOf(a.choiceId)+1)%bad.answerParts![i].choiceIds.length];assert.throws(()=>oracle(d.source,bad,v),{name:"AssertionError"});}
  });assert.equal(checked,72);assert.equal(unique.size,72);assert.equal(correctChoices.size,8);
  const baseline=d.build(d.reference),withoutNote=structuredClone(baseline);withoutNote.prompt=withoutNote.prompt.filter(b=>b.type!=="paragraph"||!b.text.includes("小数第2位を四捨五入"));assert.throws(()=>oracle(d.source,withoutNote,d.reference),{name:"AssertionError"});
  const wrongCount=structuredClone(baseline),join=wrongCount.prompt.filter(b=>b.type==="code").at(-1)!;join.text=join.text.replace("COUNT(*)","COUNT(身長階級)");assert.throws(()=>oracle(d.source,wrongCount,d.reference),{name:"AssertionError"});
  const staleMaximum=structuredClone(baseline),end=staleMaximum.prompt.filter(b=>b.type==="paragraph").at(-1)!;end.text=end.text.replace("180.1cm","190.1cm");assert.throws(()=>oracle(d.source,staleMaximum,d.reference),{name:"AssertionError"});
  for(const v of [[3,0,0,0,0],[0,2,0,0,0],[0,0,2,0,0],[0,0,0,2,0],[0,0,0,0,2],[0,0,0,0,.5],[0,0,0,0]])assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);
});
test("2019 decade LIKE predicate is independently checked on all 10,000 four-digit years and wildcard edge cases",()=>{
  for(const prefix of ["201","202","203"]){const accepted=[];for(let n=0;n<10000;n++){const value=String(n).padStart(4,"0");if(reviewedSqlLike(value,prefix+"_"))accepted.push(n);}assert.deepEqual(accepted,Array.from({length:10},(_,i)=>Number(prefix)*10+i));assert(!reviewedSqlLike(prefix,prefix+"_"));assert(!reviewedSqlLike(prefix+"00",prefix+"_"));}
  for(const value of ["","20","201","2010","20100","201x"])assert.equal(reviewedSqlLike(value,"201%"),value.startsWith("201"));
});
test("2019 right outer join preserves empty classes, filters ON correctly and COUNT height differs from COUNT class over all 128 small datasets",()=>{
  const categories:ReviewedCategory[]=[{name:"低",low:0,high:99},{name:"中",low:100,high:199},{name:"高",low:200,high:9999}];
  const samples:ReviewedMeasurement[]=[{height:0,year:"2019",sex:"男"},{height:100,year:"2019",sex:"男"},{height:100,year:"2019",sex:"男"},{height:199,year:"2019",sex:"男"},{height:200,year:"2018",sex:"男"},{height:200,year:"2019",sex:"女"},{height:null,year:"2019",sex:"男"}];
  let datasets=0;for(let mask=0;mask<128;mask++){const rows=samples.filter((_,i)=>mask&(1<<i)),joined=reviewedRightJoin(categories,rows,"2019","男"),expected=[0,0,0];for(const r of rows)if(r.year==="2019"&&r.sex==="男"&&r.height!==null)expected[r.height<100?0:r.height<200?1:2]++;
    for(let i=0;i<3;i++){assert.equal(reviewedSqlAggregate(joined[i],"COUNT(身長)"),expected[i]);assert.equal(reviewedSqlAggregate(joined[i],"COUNT(*)"),Math.max(1,expected[i]));assert.equal(reviewedSqlAggregate(joined[i],"COUNT(身長階級)"),Math.max(1,expected[i]));}
    assert.equal(joined[2].length,1);assert.equal(joined[2][0].height,null);datasets++;
  }assert.equal(datasets,128);
  // Every decimal value representable by the source DECIMAL(4,1) from 0.0
  // through 999.9 belongs to exactly one generated closed interval.
  for(const shift of [-1,0,1]){const table=d.build([0,0,0,0,shift]).prompt.filter(b=>b.type==="table")[1],bounds=table.rows.map(r=>[Math.round(Number(r[1])*10),Math.round(Number(r[2])*10)]);for(let value=0;value<10000;value++)assert.equal(bounds.filter(([low,high])=>value>=low&&value<=high).length,1);}
});
test("2019 database full major binds and grades all six independent parts after JSON persistence across every declared input",()=>{
  let checked=0;each(values=>{const body=d.build(values),q=compoundQuestion();q.prompt.blocks=body.prompt;q.answerParts=body.answerParts;q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:q.prompt.attribution,blocks}}));bindBodyAnswers(q,body,q.correctAnswer.attribution);
    const restored=JSON.parse(JSON.stringify(q)) as typeof q;validateAnswerDefinition(restored);assert.deepEqual(restored.answerParts!.map(p=>p.choiceIds.length),[6,5,4,5,5,6]);assert.equal(restored.correctAnswer.choiceId,undefined);
    const selected=Object.fromEntries(restored.correctAnswer.parts!.map(a=>{assert(a.kind==="choice");return[a.partId,a.choiceId];}));assert.equal(gradeAnswer(restored,{selectedPartChoices:selected}).outcome,"correct");
    for(const part of restored.answerParts!){const bad={...selected,[part.id]:part.choiceIds.find(id=>id!==selected[part.id])!},result=gradeAnswer(restored,{selectedPartChoices:bad});assert.equal(result.outcome,"incorrect");assert.equal(result.parts!.filter(p=>p.outcome==="correct").length,5);}checked++;
  });assert.equal(checked,72);
});
