import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import type{GeneratedBody}from'../../src/core/generators/definition';import{Legacy2017Pm6Document}from'../../src/ui/Legacy2017Pm6Document';
export const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\u00a0/g,' ');
export const visible=(s:string)=>decode(s.replace(/<[^>]+>/g,''));
export function readPm6Display(body:GeneratedBody){
 const html=body.prompt.map(b=>b.type==='diagram'?renderToStaticMarkup(React.createElement(Legacy2017Pm6Document,{profile:b.scene.kind==='source_figure'?b.scene.profile:'',values:b.scene.kind==='source_figure'?b.scene.values:[]})):b.type==='paragraph'?b.text:'');
 const all=html.join('\n'),table1=new Map<string,string>();for(const m of all.matchAll(/<td[^>]*data-pm6-cell="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g))table1.set(decode(m[1]),visible(m[2]));assert.equal(table1.size,20);
 const months:{table:string;stage:string;company:string;index:number;state:string;value:number|null}[]=[];
 for(const m of all.matchAll(/<td[^>]*data-monthcell="([^"]+)"[^>]*data-start="(\d+)"[^>]*data-end="(\d+)"[^>]*data-state="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g)){const [table,stage,company]=decode(m[1]).split(':');for(let i=Number(m[2]);i<=Number(m[3]);i++)months.push({table,stage,company,index:i,state:m[4],value:m[4]==='shown'?Number(visible(m[5])):null});}
 assert.equal(months.length,168);assert.equal(new Set(months.map(m=>[m.table,m.stage,m.company,m.index].join(':'))).size,168);
 const phase=[...all.matchAll(/data-phase="([^"]+)" data-start="(\d+)" data-end="(\d+)"/g)].map(m=>{const [table,stage,name]=decode(m[1]).split(':');return{table,stage,name,start:Number(m[2]),end:Number(m[3])};});assert.equal(phase.length,20);
 const banks:Record<string,string[]>={};for(const m of all.matchAll(/<p[^>]*data-pm6-choice="(ab|c|d|ef):(\d+)"[^>]*>([\s\S]*?)<\/p>/g)){(banks[m[1]]??=[])[Number(m[2])]=visible(m[3]).replace(/^[アイウエオカキ]\s*/,'');}
 assert.deepEqual(Object.values(banks).map(v=>v.length),[6,4,4,6]);return{html,all,table1,months,phase,banks};
}
import review from './legacy-2017-pm6-review.json';
const space=(s:string)=>s.replace(/\s+/g,'');
export function assertPm6Source(body:GeneratedBody,values:number[]){
 assert.equal(body.prompt.length,33);const d=readPm6Display(body),managed=[0,14,16,19,20,21,22,24,25,26,27,29,31,32],expected=review.numericExpectations.find(c=>c.values.join(',')===values.join(','))!;assert(expected);
 review.facts.units.forEach((u,i)=>{const b=body.prompt[i];if(!managed.includes(i)){assert(b.type==='paragraph');assert.equal(b.text,(u.marker?u.marker+' ':'')+u.text);return;}assert(b.type==='diagram');assert(b.scene.kind==='source_figure');assert.equal(b.scene.profile,'legacy-2017-pm6-unit');assert.deepEqual(b.scene.values,[i,...values]);
  assert.deepEqual(b.attribution.sourceRefs.map(r=>r.locator.page),[u.physicalPage,...(u.continuesOnPhysicalPage?[u.continuesOnPhysicalPage]:[])]);assert(b.attribution.sourceRefs.every(r=>r.sourceId==='source-ipa-2017h29h-fe-pm-6-qs'&&r.locator.year===2017&&r.locator.period==='春期'&&r.locator.timeSlot==='午後'&&r.locator.questionNumber==='6'));const h=d.html[i];assert(h.includes('data-pm6-unit="'+u.id+'"'));if(u.kind==='blank-paragraph'||u.kind==='subquestion-instruction'){const restored=visible(h.replace(/<span[^>]*data-blank="([^"]+)"[^>]*>[\s\S]*?<\/span>/g,(_,id)=>'【'+decode(id)+'】'));assert.equal(space(restored),space((u.label??'')+u.text));}
  if(u.kind==='selection-notice')assert.equal(space(visible(h)),space(u.text!));
  if(u.kind==='fraction-equation')for(const s of[u.left,u.operator,u.numerator,u.denominator])assert(visible(h).includes(s!));
 });
 assert.equal([...d.all.matchAll(/data-blank=/g)].length,8);assert.equal([...d.all.matchAll(/data-blank="無記名指示枠"/g)].length,2);assert.equal([...d.all.matchAll(/pm6-diagonal"/g)].length,8);
 assert.equal([...d.all.matchAll(/rowSpan="2"|rowspan="2"/g)].length,10);assert(d.all.includes('colSpan="5"')||d.all.includes('colspan="5"'));
 const table=review.facts.tables[0];table.rows!.forEach((r,i)=>r.values.forEach((x,j)=>{let e=x===null?'':String(x);if(i===0&&j===0)e=expected.table1BoundCells.stage1External;if(i===2&&j===0)e=expected.table1BoundCells.stage2External;assert.equal(d.table1.get('table1:'+i+':'+j),e);}));
 for(const t of review.facts.tables.slice(1)){for(const[s,ps]of Object.entries(t.schedules!))for(const p of ps){const got=d.phase.find(x=>x.table===t.id&&x.stage===s&&x.name===p.phase)!;assert.equal(got.start,t.months!.indexOf(p.start));assert.equal(got.end,t.months!.indexOf(p.end));}for(const[s,cs]of Object.entries(t.staffing!))for(const[c,ms]of Object.entries(cs))ms.forEach((x,i)=>{let e=x.value;if(t.id==='table3'&&c==='B社'){if(s==='一期開発'&&['2018-03','2018-04'].includes(x.month))e=expected.table3Stage1B[i===11?0:1];if(s==='一期開発'&&['2018-05','2018-06','2018-07'].includes(x.month))e=expected.table3Stage1B[2];if(s==='二期開発'&&i>=11&&i<=15)e=expected.table3Stage2BMarchJuly[i-11];}const got=d.months.find(m=>m.table===t.id&&m.stage===s&&m.company===c&&m.index===i)!;assert.equal(got.state,x.state);assert.equal(got.value,e);});}
 assert.deepEqual(d.banks.ab,expected.abChoiceContents.map(String));assert.deepEqual(d.banks.c,review.facts.choiceGroups.c.values);assert.deepEqual(d.banks.d,review.facts.choiceGroups.d.values);assert.deepEqual(d.banks.ef,review.facts.choiceGroups.ef.values.map(String));return d;
}
