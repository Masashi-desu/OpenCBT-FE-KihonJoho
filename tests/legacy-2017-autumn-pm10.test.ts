import test from 'node:test';import assert from 'node:assert/strict';import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {legacy2017AutumnPm10Definition as d,legacy2017AutumnPm10Program1 as p1,legacy2017AutumnPm10Program2 as p2,legacy2017AutumnPm10Changes as changes} from '../src/core/generators/legacy-2017-autumn-pm10';
import {legacy2017AutumnPm10Model as model,legacy2017AutumnPm10Calculate as calculate,legacy2017AutumnPm10Profiles as profiles,legacy2017AutumnPm10Figure as inspect} from '../src/core/generators/legacy-2017-autumn-pm10-model';
import {Legacy2017AutumnPm10Figure as Figure} from '../src/ui/Legacy2017AutumnPm10Figure';
import {autumnPm10Review as review,autumnPm10Advance as advance,autumnPm10EventReference as reference,autumnPm10AllOptionTruth as truth,autumnPm10Loop as loop} from './fixtures/legacy-2017-autumn-pm10-oracle';
test('秋PM10 全6単価条件・原21+43行・7欄25固有択31参照を固定査読値と照合する',()=>{
 assert.equal(p1.split('\n').length,21);
 for(let v=0;v<6;v++){const m=model([v]),b=d.build([v]);assert.deepEqual([m.day,m.night],review.rates[v]);assert.equal(p2(m.day).split('\n').length,43);assert.equal(m.packed.length,72);assert.equal(b.choices.length,25);assert.deepEqual(b.answerParts!.map(p=>p.choiceIds.length),review.counts);
  const indexes=b.partAnswers!.map((a,i)=>{assert(a.kind==='choice');return b.answerParts![i].choiceIds.indexOf(a.choiceId);});assert.deepEqual(indexes,review.originalIndexes);assert.deepEqual(b.answerParts![5].choiceIds,b.answerParts![6].choiceIds);
  assert.deepEqual(Array.from({length:24},(_,i)=>Number(m.packed.slice(i*3,i*3+3))),Array.from({length:24},(_,h)=>h<6||h>=20?m.night:m.day));
  assert(changes([v])[0][1].includes(m.packed.slice(0,36)));assert(b.explanation.includes(`20〜23時が${m.night}円`));
 }
});
test('秋PM10 全7欄の31参照を独立状態/全6条件式の有限実行で検算する',()=>{
 const t=truth();for(const[i,row]of t.entries()){assert.equal(row.filter(Boolean).length,1);assert.equal(row.indexOf(true),review.originalIndexes[i]);}
 assert.equal(loop(23,2,1,5).status,'stopped');assert.deepEqual(loop(23,2,1,5).indexes,[24,1]);assert.deepEqual(loop(23,0,1,5).indexes,[]);assert.notEqual(loop(0,0,0,5).status,'stopped');
});
test('秋PM10 分境界・24時間帯・複数日を独立課金開始イベント列で全10368件照合する',()=>{
 let checked=0;for(let v=0;v<6;v++)for(let hour=0;hour<24;hour++)for(const minute of[0,1,29,30,58,59])for(const span of[0,1,59,60,61,119,120,121,1439,1440,1441,2881]){
  const input={year:2017,month:10,day:15,hour,minute},output=advance(input,span),[day,night]=review.rates[v];assert.deepEqual(calculate(input,output,[v]),reference(input,output,day,night));checked++;
 }assert.equal(checked,10368);
});
test('秋PM10 年/月境界・1900非閏/2000閏・1601起点・原課金例を独立暦へ照合する',()=>{
 for(const date of[{year:1601,month:1,day:1},{year:1900,month:2,day:28},{year:2000,month:2,day:28},{year:2000,month:2,day:29},{year:2017,month:12,day:31}])for(let v=0;v<6;v++){
  const input={...date,hour:23,minute:59},out=advance(input,1501),[day,night]=review.rates[v];assert.deepEqual(calculate(input,out,[v]),reference(input,out,day,night));
 }
 const input={year:2017,month:10,day:15,hour:10,minute:30};assert.equal(calculate(input,{...input,hour:11},[0]).full,300);assert.equal(calculate(input,{...input,hour:11,minute:31},[0]).full,600);
});
test('秋PM10 実componentは全64行/6空欄/3原レコード図/全6群をSSRで保持する',()=>{
 for(let v=0;v<6;v++){
  const body=d.build([v]),figures=body.prompt.filter(b=>b.type==='diagram');assert.equal(figures.length,12);
  for(const f of figures){assert(f.scene.kind==='source_figure');assert.equal(f.caption,inspect(f.scene.profile,f.scene.values).caption);assert(!f.alt.includes('undefined'));const html=renderToStaticMarkup(createElement(Figure,{profile:f.scene.profile,values:f.scene.values}));assert(!html.includes('undefined'));}
  const render=(i:number,group?:number)=>renderToStaticMarkup(createElement(Figure,{profile:profiles[i],values:group===undefined?[v]:[v,group]}));
  assert.equal((render(1).match(/data-pm10-line=/g)||[]).length,21);assert.equal((render(2).match(/data-pm10-line=/g)||[]).length,43);assert.deepEqual([...render(2).matchAll(/data-pm10-blank="(.)"/g)].map(m=>m[1]),['a','b','c']);assert.deepEqual([...render(3).matchAll(/data-pm10-blank="(.)"/g)].map(m=>m[1]),['d','e','f']);
  for(let g=0;g<3;g++)assert.equal((render(0,g).match(/data-pm10-field=/g)||[]).length,[4,2,3][g]);for(let g=0;g<6;g++)assert.equal((render(4,g).match(/data-pm10-option=/g)||[]).length,[3,4,4,4,4,6][g]);
  const prose=body.prompt.flatMap(b=>b.type==='paragraph'?[b.text]:[]).join('\n');for(const note of['1分以上','999,999円','1601年1月1日','20時00分から翌朝5時59分','1桁目は標識領域','最終文字の直後で改行','排他制御は適切'])assert(prose.includes(note));
 }
});
test('秋PM10 不正値・実在しない日付・逆転・料金領域超過・unknown profileを拒否する',()=>{
 for(const x of[[],[-1],[6],[0.5],[0,1]])assert.throws(()=>d.build(x));const t={year:2017,month:10,day:15,hour:10,minute:30};assert.throws(()=>calculate({...t,month:2,day:30},t,[0]));assert.throws(()=>calculate(t,{...t,hour:9},[0]));assert.throws(()=>calculate(t,{...t,year:9999},[0]));assert.throws(()=>inspect('unknown',[0]));assert.throws(()=>inspect(profiles[0],[0]));
});
import{autumnPm10ReviewedChoiceBanks as reviewedChoices}from'./fixtures/legacy-2017-autumn-pm10-choices-review';
test('秋PM10 producer全25択/共有e-f31参照を独立原字面・全7欄の真偽へ接続する',()=>{
 for(let v=0;v<6;v++){const body=d.build([v]),actual=body.choices.map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==='code'||bs[0].type==='paragraph');return bs[0].text;});assert.deepEqual(actual,reviewedChoices.flat(),'producer choices differ from independently source-reviewed COBOL bank');const t=truth();for(let i=0;i<7;i++){assert.equal(t[i].filter(Boolean).length,1);const answer=body.partAnswers![i];assert(answer.kind==='choice');assert.equal(answer.choiceId,body.answerParts![i].choiceIds[t[i].indexOf(true)]);assert.deepEqual(body.answerParts![i].choiceIds.map(id=>actual[Number(id.split('-').at(-1))-1]),reviewedChoices[i<6?i:5]);}}
});
