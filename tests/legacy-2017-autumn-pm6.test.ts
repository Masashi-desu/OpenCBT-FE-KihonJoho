import test from 'node:test';import assert from 'node:assert/strict';import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {legacy2017AutumnPm6Definition as d} from '../src/core/generators/legacy-2017-autumn-pm6';
import {legacy2017AutumnPm6Figure as inspect,legacy2017AutumnPm6Profiles as profiles} from '../src/core/generators/legacy-2017-autumn-pm6-data';
import {Legacy2017AutumnPm6Figure} from '../src/ui/Legacy2017AutumnPm6Figure';
import {originalCostRows,scaleNumerators,budgetReference,sourceOptionCounts,officialLabels,originalNumericBanks,qualitativeBanks} from './fixtures/legacy-2017-autumn-pm6-oracle';
const numbers=(html:string)=>[...html.matchAll(/<td[^>]*>([\d,]+)<\/td>/g)].map(m=>Number(m[1].replaceAll(',','')));
const choiceTexts=(b:ReturnType<typeof d.build>)=>b.choices.map(xs=>{assert.equal(xs.length,1);assert(xs[0].type==='paragraph');return xs[0].text;});
test('2017秋PM6 all4 conditions: displayed 36 table numbers, all36 choices,7 answers and explanations versus integer-rational independent budget ledger',()=>{
 let choicesChecked=0;const variants=new Set();
 for(let v=0;v<4;v++) {
  const b=d.build([v]),draw=inspect(profiles[1],[v]),html=renderToStaticMarkup(createElement(Legacy2017AutumnPm6Figure,{profile:profiles[1],values:[v],caption:draw.caption}));
  const rows=originalCostRows.map(r=>r.map(n=>n*scaleNumerators[v]/5)),sum=Array.from({length:6},(_,i)=>rows.reduce((n,r)=>n+r[i],0));assert.deepEqual(numbers(html),[...rows.flat(),...sum]);assert.deepEqual(draw.model.costs,rows);
  const ref=budgetReference(rows),texts=choiceTexts(b);variants.add(JSON.stringify(b));assert.equal(b.choices.length,36);assert.deepEqual(b.answerParts?.map(p=>p.choiceIds.length),sourceOptionCounts);
  const banks=b.answerParts!.map(p=>p.choiceIds.map(id=>texts[Number(id.split('-').at(-1))-1]));
  assert.deepEqual(banks[0],qualitativeBanks.trend);assert.deepEqual(banks[2],qualitativeBanks.composition);assert.deepEqual(banks[4],qualitativeBanks.reduction);assert.deepEqual(banks[5],qualitativeBanks.margin);
  const truth=[ref.trendTruth,banks[1].map(n=>Number(n.replaceAll(',',''))===ref.byRule[3]),ref.compositionTruth,banks[3].map(n=>Number(n.replaceAll(',',''))===ref.quote),ref.reductionTruth,ref.marginTruth,banks[6].map(n=>Number(n)*10===ref.tenthsPercent)];
  truth.forEach((t,i)=>{assert.equal(t.filter(Boolean).length,1);const part=b.answerParts![i],a=b.partAnswers![i];assert(a.kind==='choice');assert.equal(a.choiceId,part.choiceIds[t.indexOf(true)]);choicesChecked+=t.length;});
  for(const [i,key]of[[1,'a'],[3,'c']] as const){const original=originalNumericBanks[key];assert.deepEqual(banks[i].map(n=>Number(n.replaceAll(',',''))),original.map(n=>n*scaleNumerators[v]/5));const correct=i===1?ref.byRule[3]:ref.quote;assert.equal(new Set(banks[i]).size,original.length);banks[i].forEach((s,j)=>assert.equal(Math.round((Number(s.replaceAll(',',''))-correct)*5),Math.round((original[j]-(i===1?260:7000))*scaleNumerators[v])));}
  assert.deepEqual(banks[6].map(Number),originalNumericBanks.f);assert(draw.model.budget.every(Number.isSafeInteger));assert(draw.model.first.every(Number.isSafeInteger));assert(draw.model.automated.every(Number.isSafeInteger));assert.equal(draw.model.total,ref.cost);assert.equal(draw.model.price,ref.quote);assert.equal(draw.model.firstTotal,ref.firstCost);assert.equal(draw.model.automatedTotal,ref.finalCost);assert.equal(draw.model.roundedMargin,ref.tenthsPercent/10);
  for(const n of [ref.byRule[3],ref.cost,ref.quote,ref.firstCost,ref.finalCost])assert(b.explanation.includes(n.toLocaleString('en-US')));assert(b.explanation.includes('途中では丸めず'));assert(b.explanation.includes('7.9%'));
  if(v===0)assert.equal(b.partAnswers!.map((a,i)=>{assert(a.kind==='choice');return 'アイウエオカ'[b.answerParts![i].choiceIds.indexOf(a.choiceId)];}).join(''),officialLabels);
 }
 assert.equal(variants.size,4);assert.equal(choicesChecked,144);
});
test('2017秋PM6 actual components retain grouped year headings, both masked cells, source rectangle holes,7 complete banks and final-only rounding instruction',()=>{
 for(let v=0;v<4;v++) {
  const holes:string[]=[];let choices=0;for(const profile of profiles){const f=inspect(profile,[v]),html=renderToStaticMarkup(createElement(Legacy2017AutumnPm6Figure,{profile,values:[v],caption:f.caption}));holes.push(...[...html.matchAll(/data-autumn-pm6-hole="([^"]+)"/g)].map(x=>x[1]));choices+=(html.match(/data-autumn-pm6-choice=/g)||[]).length;
   if(f.kind==='table1'){assert.equal((html.match(/colSpan="2"|colspan="2"/g)||[]).length,3);assert(html.includes('rowSpan="2"')||html.includes('rowspan="2"'));assert.equal((html.match(/<tr>/g)||[]).length,8);assert.equal((html.match(/<td/g)||[]).length,36);}
   if(f.kind==='table2'){assert.equal((html.match(/data-autumn-pm6-masked="true"/g)||[]).length,2);assert(html.includes('注記　網掛けの部分は表示していない。'));assert(!html.includes('aria-label="'+f.model.budget[0]+'"'));}
   if(f.kind==='automation')assert(html.includes('小数第2位で四捨五入'));
  }assert.deepEqual(holes,['empty','a','b','empty','c','d','e','f']);assert.equal(choices,36);
 }
});
test('2017秋PM6 finite capacity includes reference and rejects malformed values without executing accessors',()=>{
 let reads=0;const a:number[]=[];Object.defineProperty(a,'0',{get(){reads++;return 0;},enumerable:true});for(const values of [[],[0,1],[-1],[4],[.5],[NaN],[Infinity],a,Object.assign([0],{extra:1}),Object.assign([0],{[Symbol('x')]:1})])assert.throws(()=>d.build(values));assert.equal(reads,0);assert.throws(()=>inspect('unknown',[0]));assert.deepEqual(d.reference,[0]);
 const hashes=Array.from({length:4},(_,v)=>JSON.stringify(d.build([v])));for(let previous=0;previous<4;previous++){const remaining=hashes.filter((_,i)=>i!==previous);assert.equal(remaining.length,3);assert.equal(new Set(remaining).size,3);if(previous!==0)assert(remaining.includes(hashes[0]));}
});
