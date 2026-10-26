import test from 'node:test';import assert from 'node:assert/strict';import {createElement}from'react';import {renderToStaticMarkup}from'react-dom/server';
import type {Block,Question}from'../src/core/types';import type {GeneratedBody,GenerationDefinition}from'../src/core/generators/definition';
import {schema}from'../src/core/validation';
import {gradeAnswer,validateAnswerDefinition}from'../src/core/answers';import {contentHash}from'../src/core/hash';
import {spring2018LegacyDefinitions,spring2018ValidTuples,spring2018Prepare,spring2018NativeFragment,type Spring2018Major}from'../src/core/generators/legacy-2018-spring-pm5-8-native';
import {legacy2018SpringPm5Definition as d5}from'../src/core/generators/legacy-2018-spring-pm5';import {legacy2018SpringPm6Definition as d6}from'../src/core/generators/legacy-2018-spring-pm6';import {legacy2018SpringPm7Definition as d7}from'../src/core/generators/legacy-2018-spring-pm7';import {legacy2018SpringPm8Definition as d8}from'../src/core/generators/legacy-2018-spring-pm8';
import {legacy2018HealthOracle as healthOracle}from'./fixtures/legacy-2018-pm-health-oracle';import {assertLegacy2018Evm as evmOracle}from'./fixtures/legacy-2018-pm-evm-oracle';import {assertLegacy2018Pm as profitOracle}from'./fixtures/legacy-2018-pm-oracle';import {legacy2018HeapOracle as heapOracle}from'./fixtures/legacy-2018-pm-heap-oracle';
import {readEvmGraph}from'./fixtures/legacy-2018-pm-evm-oracle';import {reviewedProfitTable,reviewedCostCurves}from'./fixtures/legacy-2018-pm-oracle';import {readHeapTree,readHeapArray,readHeapRegions,readHeapProgram}from'./fixtures/legacy-2018-pm-heap-oracle';
import {Legacy2018SpringPmNativeText as Native,Legacy2018SpringPm6ForecastTable}from'../src/ui/Legacy2018SpringPm5To8Native';
import {Legacy2018SpringPm5Figure as F5}from'../src/ui/Legacy2018SpringPm5Figure';import {Legacy2018SpringPm6Figure as F6}from'../src/ui/Legacy2018SpringPm6Figure';import {Legacy2018SpringPm7Figure as F7}from'../src/ui/Legacy2018SpringPm7Figure';import {Legacy2018SpringPm8Figure as F8}from'../src/ui/Legacy2018SpringPm8Figure';
import {legacy2018SpringPm5Records as r5,bindLegacy2018SpringPm5Body as b5}from'../scripts/import-legacy-2018-spring-pm5';import {legacy2018SpringPm6Records as r6,bindLegacy2018SpringPm6Body as b6}from'../scripts/import-legacy-2018-spring-pm6';import {legacy2018SpringPm7Records as r7,bindLegacy2018SpringPm7Body as b7}from'../scripts/import-legacy-2018-spring-pm7';import {legacy2018SpringPm8Records as r8,bindLegacy2018SpringPm8Body as b8}from'../scripts/import-legacy-2018-spring-pm8';
import m5 from'./fixtures/legacy-2018-spring-pm5-original-metadata.json';import m6 from'./fixtures/legacy-2018-spring-pm6-original-metadata.json';import m7 from'./fixtures/legacy-2018-spring-pm7-original-metadata.json';import m8 from'./fixtures/legacy-2018-spring-pm8-original-metadata.json';
import{readSpring2018HeapRegions,readSpring2018HeapTypedProgram}from'./fixtures/legacy-2018-spring-pm8-source-format-oracle';
import {independentSpring2018Pm5Roles}from'./fixtures/legacy-2018-spring-pm5-role-oracle';
const defs:Record<Spring2018Major,GenerationDefinition>={5:d5,6:d6,7:d7,8:d8};
const fixed={5:{counts:[10,10,6,4,5],unique:25,refs:35,marks:'キウウアエ',banks:4,anonymous:2},6:{counts:[4,8,4,6,6,6],unique:28,refs:34,marks:'ウクアカオイ',banks:5,anonymous:4},7:{counts:[5,5,5,5,3,4,3,4],unique:34,refs:34,marks:'エイエイイイイア',banks:8,anonymous:2},8:{counts:[6,4,4,4,6],unique:24,refs:24,marks:'イエエイイ',banks:5,anonymous:2}};
const symbols='アイウエオカキクケコ';
const prose=(blocks:Block[])=>blocks.map(b=>{assert(b.type==='paragraph');return b.text;}).join('\n');
function existingOracle(n:Spring2018Major,b:GeneratedBody,v:number[]){if(n===5)healthOracle(b,v);if(n===6)evmOracle(d6.source,b,v);if(n===7)profitOracle(d7.source,b,v);if(n===8)heapOracle(d8.source,b,v);}
function contents(b:GeneratedBody){return b.answerParts!.map(p=>p.choiceIds.map(id=>prose(b.choices[Number(id.slice(13))-1])));}
function answers(b:GeneratedBody){return b.partAnswers!.map((a,i)=>{assert(a.kind==='choice');return contents(b)[i][b.answerParts![i].choiceIds.indexOf(a.choiceId)];});}
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
test('actual PM5 master choices require minimality, and all actual sorting/dedup/output candidates are evaluated independently',()=>{
 for(const v of[[0],[1]]){const body=d5.build(v),proof=independentSpring2018Pm5Roles(body);assert.deepEqual(proof.wrongCandidateWitnesses,[9,9,5,3,4]);assert.equal(proof.manager,v[0]===0);
  const broken=structuredClone(body);broken.choices[v[0]===0?6:9]=[{type:'paragraph',text:'従業員マスタ，職位マスタ及び在勤地マスタ'}];assert.throws(()=>independentSpring2018Pm5Roles(broken),{name:'AssertionError'});
 }
});
test('all174 actual formal adapters conserve independently reviewed semantic units and every answer role;12 invalid profit inputs remain invalid',()=>{
 let count=0;for(const n of[5,6,7,8]as const)for(const v of spring2018ValidTuples[n]){
  const old=spring2018LegacyDefinitions[n].build(v);existingOracle(n,old,v);const actual=defs[n].build(v),meta=spring2018Prepare(n,v);assert.deepEqual(actual,meta.body);assert.deepEqual(actual.answerParts!.map(p=>p.choiceIds.length),fixed[n].counts);assert.equal(actual.choices.length,fixed[n].unique);assert.equal(actual.answerParts!.reduce((a,p)=>a+p.choiceIds.length,0),fixed[n].refs);
  const expected=contents(old);if(n===6)expected[5]=expected[5].map((_,i)=>{const e=old.prompt.find(b=>b.type==='table'&&b.caption==='eに関する解答群');assert(e?.type==='table');return e.rows[i].slice(1).join(' ／ ');});assert.deepEqual(contents(actual),expected);
  const beforeAnswers=answers(old);if(n===6)beforeAnswers[5]='BAC ／ EV ／ AC';assert.deepEqual(answers(actual),beforeAnswers);
  // New output must carry every old semantic paragraph/table/diagram unchanged.
  // The exact replacements below are source instruction/notice/caption fixes,
  // not a made-up historical Bundle or an invocation of an old admission gate.
  const normalized=(text:string)=>text.replace(/^旧制度・午後 問([678])(?:（必須問題）)?。/,'問$1 ').replace('空欄','［　］').replace('［設問2］','［　］');
  for(const [index,unit]of old.prompt.entries()){
   if(unit.type==='paragraph'){
    if(n===5&&[0,33,49,50,51].includes(index))continue;
    let text=normalized(unit.text);
    if(n===6&&index===9)text=text.replace('［a］','［　］');if(n===7&&index===2)text=text.replace('［a］〜［e］','［　］');if(n===7&&index===10)text=text.replace('［f］、［g］','［　］');if(n===8&&index===21)text=text.replace('［a］、［b］','［　］');if(n===8&&index===22)text=text.replace('［c］、［d］、［e］','［　］');
    assert(actual.prompt.some(b=>b.type==='paragraph'&&b.text===text),`${n}/${index} lost source unit`);
   }else if(unit.type==='table'){
    if(n===6&&unit.caption==='eに関する解答群')continue;
    assert(actual.prompt.some(b=>JSON.stringify(b)===JSON.stringify(unit)),`${n}/${index} lost table`);
   }else if(unit.type==='diagram')assert(actual.prompt.some(b=>b.type==='diagram'&&JSON.stringify(b.scene)===JSON.stringify(unit.scene)&&b.alt===unit.alt),`${n}/${index} lost figure`);
  }
  const bankTexts=new Set(meta.banks.map(b=>b.text)),actualCore=actual.prompt.filter(b=>b.type!=='paragraph'||!bankTexts.has(b.text));
  if(n!==5){const notice=actualCore.shift();assert(notice?.type==='paragraph');assert.equal(notice.text,n===8?'次の問8は必須問題です。必ず解答してください。':'選択した問題は，選択欄の［選］をマークしてください。マークがない場合は，採点されません。');}
  const expectedCore:Block[]=old.prompt.flatMap((raw,index)=>{const unit=structuredClone(raw);if(n===5&&[33,49,50,51].includes(index)||n===6&&unit.type==='table'&&unit.caption==='eに関する解答群')return[];if(unit.type==='paragraph'){unit.text=normalized(unit.text);if(n===5&&index===0)unit.text='選択した問題は，選択欄の［選］をマークしてください。マークがない場合は，採点されません。';if(n===6&&index===9)unit.text=unit.text.replace('［a］','［　］');if(n===7&&index===2)unit.text=unit.text.replace('［a］〜［e］','［　］');if(n===7&&index===10)unit.text=unit.text.replace('［f］、［g］','［　］');if(n===8&&index===21)unit.text=unit.text.replace('［a］、［b］','［　］');if(n===8&&index===22)unit.text=unit.text.replace('［c］、［d］、［e］','［　］');}if(n===8&&unit.type==='diagram'&&unit.scene.kind==='source_figure'&&unit.scene.profile.includes('-program-'))unit.caption=unit.scene.profile.endsWith('-one')?'〔プログラム1〕':'〔プログラム2〕';return[unit];});
  assert.deepEqual(actualCore,expectedCore,'exact source-unit order/multiplicity; no contradictory extra paragraph');
  assert.equal(meta.banks.length,fixed[n].banks);for(const bank of meta.banks){assert.equal(actual.prompt.filter(b=>b.type==='paragraph'&&b.text===bank.text).length,1);const rendered=renderToStaticMarkup(createElement(Native,{major:n,text:bank.text}));assert(rendered.includes(`data-source-bank="${bank.key}"`));for(const item of bank.items)if(!bank.cells)assert(rendered.includes(escape(item.text)),`${n}/${bank.key}/${item.symbol}`);if(bank.cells)for(const row of bank.cells)for(const cell of row)assert(rendered.includes(`>${cell}</td>`));assert(rendered.indexOf('source-bank-heading')<rendered.indexOf('diagram-scroll'));}
  if(n===5)assert.deepEqual(actual.answerParts![0].choiceIds,actual.answerParts![1].choiceIds);if(n===6)assert.deepEqual(actual.answerParts![3].choiceIds,actual.answerParts![4].choiceIds);
  count++;
 }assert.equal(count,174);let bad=0;for(const scale of[1,2,3])for(const graph of[0,1,2,3]){assert.throws(()=>d7.build([0,2,scale,graph]),/PARAMETER_CONSTRAINT/);bad++;}assert.equal(bad,12);
});
test('source-native rectangles, anonymous instruction boxes, bank order and two-level EVM headers cannot be opted into by arbitrary text',()=>{
 for(const n of[5,6,7,8]as const){const body=defs[n].build(defs[n].reference);let markup='';for(const b of body.prompt)if(b.type==='paragraph'&&spring2018NativeFragment(n,b.text).known){markup+=renderToStaticMarkup(createElement(Native,{major:n,text:b.text}));assert.throws(()=>renderToStaticMarkup(createElement(Native,{major:n,text:b.text+'!'})),/SPRING_2018_NATIVE_TEXT/);}assert.equal((markup.match(/data-source-blank="anonymous"/g)??[]).length,fixed[n].anonymous);assert(spring2018NativeFragment(n,'array[a]').known===false);}
 const table=d6.build(d6.reference).prompt.find(b=>b.type==='table'&&b.caption.startsWith('表5'));assert(table?.type==='table');const html=renderToStaticMarkup(createElement(Legacy2018SpringPm6ForecastTable,{block:table}));assert(html.includes('rowSpan="2"')||html.includes('rowspan="2"'));assert(html.includes('colSpan="3"')||html.includes('colspan="3"'));assert.equal((html.match(/<tr>/g)??[]).length,5);
 const e=spring2018Prepare(6,d6.reference).banks.find(b=>b.key==='e');assert(e);const bank=renderToStaticMarkup(createElement(Native,{major:6,text:e.text}));assert.equal((bank.match(/class="legacy-2018-spring-source-bank-corner" aria-hidden="true"><\/td>/g)??[]).length,1);assert.equal((bank.match(/<thead>[\s\S]*?<\/thead>/)![0].match(/<th\b/g)??[]).length,3);
});
test('all actual diagram tuples serialize source-local headings while keeping full source geometry/code',()=>{
 const figures={5:F5,6:F6,7:F7,8:F8};let programTwo=0;
 for(const n of[5,6,7,8]as const)for(const v of spring2018ValidTuples[n])for(const b of defs[n].build(v).prompt){if(b.type!=='diagram'||b.scene.kind!=='source_figure')continue;const html=renderToStaticMarkup(createElement(figures[n],{profile:b.scene.profile,values:b.scene.values,caption:b.caption??''}));assert(html.includes('<svg'));assert(html.includes(escape(b.caption??'')));if(n===8&&b.scene.profile.endsWith('-program-two')){assert.equal((html.match(/data-line-heading=/g)??[]).length,2);assert(html.includes('（行番号）'));programTwo++;}const top=(n===6&&b.scene.profile.endsWith('-plan-table'))||(n===7&&b.scene.profile.endsWith('-profit-table'))||n===8&&b.scene.profile.includes('-program-');assert(html.includes(`data-caption-position="${top?'top':'bottom'}"`));}
 assert.equal(programTwo,48);
});
test('actual formal native SVG coordinates/markers/statement text/control geometry feed independent source readers',()=>{
 let parsed=0;for(const n of[6,7,8]as const)for(const v of spring2018ValidTuples[n])for(const b of defs[n].build(v).prompt){if(b.type!=='diagram'||b.scene.kind!=='source_figure')continue;const html=renderToStaticMarkup(createElement(({6:F6,7:F7,8:F8})[n],{profile:b.scene.profile,values:b.scene.values,caption:b.caption??''})),p=b.scene.profile;
  if(p==='legacy-2018-evm-status'){readEvmGraph(html,v[0]);parsed++;}
  if(p==='legacy-2018-profit-table'){reviewedProfitTable(html);parsed++;}if(p==='legacy-2018-cost-curves'){reviewedCostCurves(html);parsed++;}
  if(p==='legacy-2018-heap-tree'){readHeapTree(html);parsed++;}if(p==='legacy-2018-heap-array'){readHeapArray(html);parsed++;}if(p==='legacy-2018-heap-regions'){readSpring2018HeapRegions(html);parsed++;}
  if(p==='legacy-2018-heap-program-one'){readSpring2018HeapTypedProgram(html,'one');parsed++;}if(p==='legacy-2018-heap-program-two'){const originalCode=html.replace(/<text data-line-heading="(?:heapSort|downHeap)"[^>]*>（行番号）<\/text>/g,'');assert.notEqual(originalCode,html);readSpring2018HeapTypedProgram(html,'two');parsed++;}
 }assert.equal(parsed,64+120+240);
});
test('source format readers reject lost range arrowheads, omitted-edge notation, integer underlines and segmented swap delimiters',()=>{
 const render=(suffix:string)=>renderToStaticMarkup(createElement(F8,{profile:`legacy-2018-heap-${suffix}`,values:[0,12],caption:''}));
 const regions=render('regions'),one=render('program-one'),two=render('program-two');
 readSpring2018HeapRegions(regions);readSpring2018HeapTypedProgram(one,'one');readSpring2018HeapTypedProgram(two,'two');
 for(const broken of[regions.replace(/ marker-start="[^"]*"/,''),regions.replace('stroke-dasharray="5 5"','stroke-dasharray="0"'),regions.replace('data-region-cell="2">','data-region-cell="2"><text x="435" y="45">…</text>')])assert.throws(()=>readSpring2018HeapRegions(broken));
 for(const broken of[one.replace('text-decoration="underline"','text-decoration="none"'),one.replace('data-source-segment="close" x="460"','data-source-segment="close" x="355"'),one.replace('>)</text></g>',']</text></g>'),one.replace('data-blank="b" x="350" y="273" width="90"','data-blank="b" x="333" y="273" width="56"')]){assert.notEqual(broken,one);assert.throws(()=>readSpring2018HeapTypedProgram(broken,'one'));}
 assert.throws(()=>readSpring2018HeapTypedProgram(two.replace('text-decoration="underline"','text-decoration="none"'),'two'));
});
test('real23 raw metadata -> excluded original/base/template preserves shared ordered fields and JSON grading without rights self-admission',async()=>{
 const factories={5:r5,6:r6,7:r7,8:r8},binders={5:b5,6:b6,7:b7,8:b8},metadata={5:m5,6:m6,7:m7,8:m8};let assets=0;
 for(const n of[5,6,7,8]as const){const input=structuredClone(metadata[n]),before=structuredClone(input),result=await factories[n](input);assert.deepEqual(input,before);const {bundle}=result,[original,base]=bundle.questions;assets+=bundle.assets.length;assert.equal(result.validation.ordinaryAppRegistered,false);assert.equal(result.validation.materialAdmission,false);assert(bundle.rights.every(r=>Object.values(r.uses).every(s=>s==='unconfirmed')&&r.thirdParty.status==='unresolved'));assert.equal(bundle.templates[0].originalContentSha256,await contentHash(base));
  assert.equal(original.learning.area,({5:'technology',6:'management',7:'strategy',8:'technology'} as const)[n]);assert.equal(base.learning.area,original.learning.area);assert.equal(original.distribution,'excluded');assert.equal(base.distribution,'excluded');assert.equal(base.choiceShuffleAllowed,false);assert.equal(original.choiceShuffleAllowed,false);assert.equal(original.answerParts!.map((p,i)=>{const answer=original.correctAnswer.parts![i];assert(answer.kind==='choice');return symbols[p.choiceIds.indexOf(answer.choiceId)];}).join(''),fixed[n].marks);
  for(const v of spring2018ValidTuples[n]){const q=JSON.parse(JSON.stringify(binders[n](base,defs[n].build(v))))as Question;validateAnswerDefinition(q);const parts=Object.fromEntries(q.correctAnswer.parts!.map(a=>{assert(a.kind==='choice');return[a.partId,a.choiceId];}));assert.equal(gradeAnswer(q,{selectedPartChoices:parts}).outcome,'correct');assert.equal(gradeAnswer(q,{selectedPartChoices:{}}).parts!.length,fixed[n].counts.length);assert.deepEqual(q.contextRefs,q.contexts.map(c=>c.id));if(n===8){assert.equal(q.contexts.length,1);assert.deepEqual(q.assetRefs,['asset-ipa-2018h30h-fe-pm-8-p4','asset-ipa-2018h30h-fe-pm-8-p5']);assert.deepEqual(defs[n].build(v).contexts!.map(c=>c.blocks),q.contexts.map(c=>c.content.blocks));}else assert.equal(q.assetRefs.length,0);}
  const bad=structuredClone(input);bad.rendered.pages[0].sha256='a'.repeat(64);await assert.rejects(async()=>factories[n](bad),/exact fresh raw/);
 }assert.equal(assets,23);
});

test('accepted shared schema validates all174 source-native binds and still rejects unknown profiles',async()=>{const fs={5:r5,6:r6,7:r7,8:r8},bs={5:b5,6:b6,7:b7,8:b8},ms={5:m5,6:m6,7:m7,8:m8};for(const n of[5,6,7,8]as const){const {bundle}=await fs[n](structuredClone(ms[n]));for(const v of spring2018ValidTuples[n])schema('question',bs[n](bundle.questions[1],defs[n].build(v)));const bad=structuredClone(bundle.questions[1]),b=bad.prompt.blocks.find(b=>b.type==='diagram');assert(b?.type==='diagram'&&b.scene.kind==='source_figure');b.scene.profile='unsupported-2018-spring-pm';assert.throws(()=>schema('question',bad));}});
