import test from 'node:test';import assert from 'node:assert/strict';
import {createElement} from 'react';import{renderToStaticMarkup}from'react-dom/server';
import{legacy2017Pm10Definition as d}from'../src/core/generators/legacy-2017-pm10';
import{legacy2017Pm10Profiles}from'../src/core/generators/legacy-2017-pm10-data';
import{Legacy2017Pm10Figure}from'../src/ui/Legacy2017Pm10Figure';
import{assertPm10Body,pm10TestSlips,pm10Reference,pm10Interpreter,pm10QuarterReference}from'./fixtures/legacy-2017-pm10-oracle';
test('PM10原54行/全前提/7欄30参照/全25択と3つの異なる四半期末月条件を独立査読する',()=>{for(let v=0;v<3;v++)assertPm10Body(d.build([v]),v);for(const v of [[],[0,1],[-1],[3],[.5],[NaN],[-0],Array(1),Object.assign([0],{extra:1})])assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);let read=0;const getter=[0];Object.defineProperty(getter,'0',{get(){read++;return 0;}});assert.throws(()=>d.build(getter),/PARAMETER_CONSTRAINT/);assert.equal(read,0);});
test('年月整列と月境界・支店加算・全支店総和は別のMap集計と一致し、a〜d全択の唯一性を検証',()=>{
 const truth=[Array(4).fill(true),Array(4).fill(true),Array(5).fill(true),Array(5).fill(true)],correct=[2,1,3,0];
 for(let v=0;v<3;v++)for(let mode=0;mode<4;mode++){
  const slips=pm10TestSlips(v+4,mode),expected=pm10Reference(slips);assert.equal(expected.length,12);assert.deepEqual(pm10Interpreter(slips,correct),expected);
  for(let slot=0;slot<4;slot++)for(let option=0;option<truth[slot].length;option++){const h=[...correct];h[slot]=option;let same=false;try{same=JSON.stringify(pm10Interpreter(slips,h))===JSON.stringify(expected);}catch{}truth[slot][option]&&=same;}
 }
 assert.deepEqual(truth.map(row=>row.map((b,i)=>b?i:-1).filter(i=>i>=0)),[[2],[1],[3],[0]]);
});
test('e/f/g全択の実行位置・条件月・表示番号を独立した四半期集約で照合する',()=>{
 for(let start=4;start<=6;start++){
  const monthly=pm10Reference(pm10TestSlips(start)),expected=pm10QuarterReference(monthly),months=monthly.map(m=>m.month%100),endSet=new Set([months[2],months[5],months[8],months[11]]);
  const starts=[months[0],months[3],months[6],months[9]],fSets=[new Set(Array.from({length:12},(_,i)=>i+1)),new Set<number>(),new Set(starts),endSet];
  const truth=fSets.map(ends=>{let sum=0;const result:number[]=[];for(const m of monthly){sum+=m.total;if(ends.has(m.month%100)){result.push(sum);sum=0;}}return JSON.stringify(result)===JSON.stringify(expected);});assert.deepEqual(truth,[false,false,false,true]);
  const suffix=['ST','ND','RD','TH'],gResults=[1,3,9,0].map((step,i)=>{let q=1;const labels:string[]=[];for(let j=0;j<4;j++){labels.push(`${q}${suffix[q-1]??'?'}`);q=i<2?q+step:step;}return labels;});
  assert.deepEqual(gResults.map(a=>a.join(',')==='1ST,2ND,3RD,4TH'),[true,false,false,false]);
  // Source e alternatives insert once after sort, once after RET loop, per slip, or once per finalized month.
  const eventKeys=[['after-all'],['after-all'],pm10TestSlips(start).map(s=>String(Math.floor(s.date/100))),monthly.map(m=>String(m.month))];
  assert.deepEqual(eventKeys.map(keys=>keys.length===12&&keys.every((k,i)=>k===String(monthly[i].month))),[false,false,false,true]);
 }
});
test('原レコードの結合見出し・54行・全解答群・変更表の全処理行と未記入空欄をSSR照合',()=>{
 for(let v=0;v<3;v++)for(const profile of legacy2017Pm10Profiles)for(const values of profile.endsWith('choice-group')?Array.from({length:6},(_,g)=>[v,g]):[[v]]){const html=renderToStaticMarkup(createElement(Legacy2017Pm10Figure,{profile,values}));assert(html.includes('data-legacy-pm10-profile'));if(profile.endsWith('master-record')){assert(html.includes('rowSpan="2"')||html.includes('rowspan="2"'));assert(html.includes('支店8'));}if(profile.endsWith('changes'))for(const t of ['STNDRDTH','ZZ,ZZZ,ZZZ,ZZ9','QUART-NO(CR-QUART)','空欄f','空欄e','空欄g','MOVE ZERO TO QUART-AMOUNT'])assert(html.includes(t),t);if(profile.endsWith('program')){assert.equal((html.match(/data-pm10-line=/g)??[]).length,54);assert.equal((html.match(/class="pm10-blank"/g)??[]).length,4);}if(profile.endsWith('choice-group'))assert.equal((html.match(/data-pm10-choice=/g)??[]).length,values[1]===2?5:4);}
});
test('EOF処理/桁数/共通欄/本文群/四半期条件を損なう負例を拒否',()=>{
 for(const change of [(b:ReturnType<typeof d.build>)=>{b.answerParts![3].choiceIds.reverse();},(b:ReturnType<typeof d.build>)=>{b.choices[20]=b.choices[19];},(b:ReturnType<typeof d.build>)=>{const c=b.prompt.find(x=>x.type==='diagram'&&x.scene.kind==='source_figure'&&x.scene.profile.endsWith('program'));assert(c?.type==='diagram');c.alt=c.alt.replace('PERFORM WRI-PROC','CONTINUE');},(b:ReturnType<typeof d.build>)=>{b.prompt=b.prompt.filter(x=>x.type!=='paragraph'||!x.text.includes('ゼロの月'));}]){const b=d.build([0]);change(b);assert.throws(()=>assertPm10Body(b,0));}
});
