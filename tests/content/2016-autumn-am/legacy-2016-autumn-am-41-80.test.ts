import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import type {Block} from '../../../src/core/types';
import type {GeneratedBody} from '../../../src/core/generators/definition';
import {legacy2016AutumnAm4180Definitions as definitions,legacy2016AutumnAm4180HeldNumbers as held} from '../../../src/core/generators/legacy-2016-autumn-am-41-80';
import {autumn2016Am4180Profiles as P,autumn2016Am4180FigureAllowed,autumn2016Am4180FigureAlt,autumn2016Am4180FigureDomains as domains} from '../../../src/core/generators/legacy-2016-autumn-am-41-80-figures';
import {Legacy2016AutumnAm4180Figures} from '../../../src/ui/Legacy2016AutumnAm4180Figures';
import {legacy2016AutumnAm4180StudyTerms as terms} from '../../../src/core/generators/legacy-2016-autumn-am-41-80-study-terms';
import facts from '../../fixtures/legacy-2016-autumn-am-41-80-review.json';
import {autumn2016Am4180Knowledge as knowledge,assertAutumn2016Knowledge,autumn2016QuantitativeTruth,bodyText} from '../../fixtures/legacy-2016-autumn-am-41-80-oracle';
const numberOf=(s:string)=>Number(s.split('-').at(-1));
const graph=(block:Block)=>{assert(block.type==='diagram'&&block.scene.kind==='source_figure');return render(h(Legacy2016AutumnAm4180Figures,{scene:block.scene,caption:block.caption}));};
function ocCorrect(markup:string){const curves=[...markup.matchAll(/<polyline\b([^>]*)>/g)].map(m=>{const attrs=m[1],c=attrs.match(/data-c="(\d+)"/),p=attrs.match(/points="([^"]+)"/);assert(c&&p);return{c:+c[1],points:p[1].split(' ').map(s=>s.split(',').map(Number))};}).sort((a,b)=>a.c-b.c);assert.equal(curves.length,3);assert.equal(new Set(curves.map(x=>x.c)).size,3);return curves.slice(1).every((current,i)=>current.points.every(([x,y],j)=>{const[px,py]=curves[i].points[j];assert(Math.abs(x-px)<1e-9);return y<=py+1e-9;}));}
function truths(n:number,i:number,b:GeneratedBody){if(String(n) in knowledge.questions)return assertAutumn2016Knowledge(n,i,b);if(n===77)return b.choices.map(bs=>ocCorrect(graph(bs[0])));return autumn2016QuantitativeTruth(n,b);}
function inspect(n:number,i:number,b:GeneratedBody){const t=truths(n,i,b);assert.equal(t.length,4);assert.equal(t.filter(Boolean).length,1,`${n}/${i}: unique semantic answer`);assert.equal(b.correctIndex,t.indexOf(true));assert(b.explanation.length>55,`${n}/${i}: explanation`);assert.equal(new Set(b.choices.map(bs=>JSON.stringify(bs))).size,4);return t;}

test('all40 obligations retain37 candidates and3 explicit material holds; original condition0 matches complete source and official keys',()=>{
 assert.deepEqual([...facts.questions.map(q=>q.number),...facts.held.map(q=>q.number)].sort((a,b)=>a-b),Array.from({length:40},(_,i)=>41+i));assert.deepEqual([...held],[55,56,57]);assert.equal(definitions.length,37);
 const official='イアエアウエエエウエアアイエアイエアイアウエアイウウエエアイエウエエウイイエアア';assert.equal(official.length,40);
 for(const d of definitions){const n=numberOf(d.source),s=facts.questions.find(q=>q.number===n)!;assert(s);const b=d.build([0]);assert.equal(d.sourceAnswer,official[n-41]);assert.equal(s.officialKey,d.sourceAnswer);assert.equal(b.correctIndex,'アイウエ'.indexOf(d.sourceAnswer));assert.equal(bodyText([b.prompt[0]]),s.prompt);assert.deepEqual(d.reference,[0]);if(n!==77)assert.deepEqual(b.choices.map(bodyText),s.choices);assert(s.fullAlt.includes(s.prompt));assert.equal(s.crop.sha256.length,64);assert(s.crop.width>1000&&s.crop.height>150);if('table' in s){const actual=b.prompt.find(x=>x.type==='table');assert(actual?.type==='table');assert.deepEqual(actual.columns,s.table!.columns);assert.deepEqual(actual.rows,s.table!.rows);}if(n===48){const l=b.prompt.find(x=>x.type==='list');assert(l?.type==='list');assert.deepEqual(l.items,'steps' in s?s.steps:undefined);}}
});

test('independent all-choice meanings and exact reference calculations cover all205 finite bodies and820 choices',()=>{
 let bodies=0;for(const d of definitions){const n=numberOf(d.source),seen=new Set<string>();for(let i=0;i<=d.fields[0].maximum;i++){const b=d.build([i]);inspect(n,i,b);assert.deepEqual(b,d.build([i]));const text=JSON.stringify([b.prompt,b.choices]);assert(!seen.has(text),`${n}/${i}: substantive condition must differ`);seen.add(text);bodies++;}for(const v of [[],[-1],[d.fields[0].maximum+1],[NaN],[Infinity],[.5],[0,0]])assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);}assert.equal(bodies,205);
});

test('wrong-key and changed-claim mutations cannot reuse valid source truth; every question has a registered oracle',()=>{
 let negative=0;for(const d of definitions){const n=numberOf(d.source);for(const i of [0,d.fields[0].maximum]){const b=d.build([i]);const wrong=structuredClone(b);wrong.correctIndex=(b.correctIndex!+1)%4;assert.throws(()=>inspect(n,i,wrong));negative++;if(String(n) in knowledge.questions){const text=structuredClone(b);text.choices[b.correctIndex!]=[{type:'paragraph',text:'検証のために置換した未査読の主張'}];assert.throws(()=>inspect(n,i,text));negative++;}}}assert(negative>=120);assert.throws(()=>autumn2016QuantitativeTruth(55,definitions[0].build([0])),/ORACLE_MISSING/);
});

test('finite capacity keeps distinct conditions after two prior inputs and respects fixed-answer declarations',()=>{
 for(const d of definitions){const bs=Array.from({length:d.fields[0].maximum+1},(_,i)=>d.build([i]));assert(bs.length>=4);const key=(i:number)=>JSON.stringify(bs[i].choices[bs[i].correctIndex!]);for(let a=0;a<bs.length;a++)for(let b=0;b<bs.length;b++){if(a===b)continue;const remaining=bs.filter((_,i)=>i!==a&&i!==b&&(d.answerVariation==='fixed'||key(i)!==key(b)));assert(remaining.length>0,`${d.source}: prior pair${a}/${b}`);}}
});

test('all source-owned figure domains render with readable source topology and reject unknown or widened inputs',()=>{
 let rendered=0;for(const[profile,ds]of Object.entries(domains)){for(const v of ds){assert(autumn2016Am4180FigureAllowed(profile,v));const markup=render(h(Legacy2016AutumnAm4180Figures,{scene:{kind:'source_figure',profile,values:[...v]}}));assert.match(markup,/class="legacy2016-figure"/);assert.match(markup,/role="img"/);assert.match(markup,/aria-label=/);assert(!/NaN|Infinity|undefined|#[0-9a-f]{3,8}/i.test(markup));rendered++;}for(const v of [[],[NaN],[Infinity],[-1],[...ds[0],0]]){assert(!autumn2016Am4180FigureAllowed(profile,v));assert.throws(()=>autumn2016Am4180FigureAlt(profile,v),/FIGURE_VALUE/);}}assert.equal(rendered,63);assert.throws(()=>autumn2016Am4180FigureAlt('unknown',[0]),/FIGURE_PROFILE/);
 const marketing=definitions.find(d=>numberOf(d.source)===68)!.build([0]);const mm=graph(marketing.prompt[1]);for(const s of ['Product','Price','Place','Promotion','4P','4C'])assert(mm.includes(s));assert.equal((mm.match(/<rect /g)??[]).length,10);
 const bom=definitions.find(d=>numberOf(d.source)===72)!.build([0]);assert.match(graph(bom.prompt[1]),/B（2）/);assert.equal((graph(bom.prompt[1]).match(/<text[^>]*>C（1）<\/text>/g)??[]).length,2);
 const originalOC=definitions.find(d=>numberOf(d.source)===77)!.build([0]);assert.deepEqual(originalOC.choices.map(bs=>ocCorrect(graph(bs[0]))),[false,true,false,false]);
 const stock=definitions.find(d=>numberOf(d.source)===78)!.build([0]);for(const s of ['最大在庫量','発注点K','安全在庫量S','発注量E','調達期間','①','発注a','納品a','発注b','納品b'])assert(graph(stock.prompt[1]).includes(s));
});

test('source-specific terms keep formal names and are absent from held scopes; every eligible source keeps separate progress states',()=>{
 const ids=terms.find(t=>t.term==='IDS');assert(ids);assert.equal(ids.expansion,'Intrusion Detection System');assert.deepEqual(ids.sources,['2016h28a-fe-am-41']);assert(ids.meaning.includes('侵入検知'));
 assert(terms.length>=40);for(const t of terms){assert(t.meaning.length>15);assert(t.sources?.length);for(const s of t.sources!){const n=numberOf(s);assert(definitions.some(d=>d.source===s));assert(!held.includes(n as typeof held[number]));}}for(const q of facts.questions){assert(q.statuses.source);assert(q.statuses.material);assert(q.statuses.generator);assert(q.statuses.independent);assert(q.statuses.display);assert.equal(q.statuses.normalApp,'root_pending');}
});

// Count uniform finite samples directly, independent of the rendering's polynomial.
test('OC threshold conditions preserve nested acceptance events for every finite sample, and bind all actual c labels',()=>{
 const d=definitions.find(d=>numberOf(d.source)===77)!;const subsets:number[][]=[];const visit=(at:number,chosen:number[])=>{if(chosen.length===6){subsets.push([...chosen]);return;}for(let j=at;j<12;j++){chosen.push(j);visit(j+1,chosen);chosen.pop();}};visit(0,[]);assert.equal(subsets.length,924);let checked=0;
 for(let i=0;i<=d.fields[0].maximum;i++){const b=d.build([i]),m=bodyText(b.prompt).match(/cを([0-9，]+)と/);assert(m);const cs=m[1].split('，').map(Number);assert.equal(cs.length,3);assert(cs[0]<cs[1]&&cs[1]<cs[2]);const curves=graph(b.choices[1][0]);assert.deepEqual([...curves.matchAll(/data-c="(\d+)"/g)].map(x=>+x[1]),cs);
 for(let defects=0;defects<=12;defects++){const counts=[0,0,0];for(const sample of subsets){const bad=sample.filter(n=>n<defects).length;cs.forEach((c,j)=>{if(bad<=c)counts[j]++;});checked++;}assert(counts[0]<=counts[1]&&counts[1]<=counts[2]);}
 }assert.equal(checked,120120);
});

test('inventory rendering preserves equal depletion slopes and actual order-level intersections in all10 cases',()=>{
 const d=definitions.find(d=>numberOf(d.source)===78)!;for(let i=0;i<=d.fields[0].maximum;i++){const b=d.build([i]),svg=graph(b.prompt[1]),path=svg.match(/stroke-width="2.5" d="M([0-9.]+) ([0-9.]+)L([0-9.]+) ([0-9.]+)V([0-9.]+)L([0-9.]+) ([0-9.]+)V([0-9.]+)L([0-9.]+) ([0-9.]+)"/);assert(path);const[x0,top,da,low,ta,db,sb,tb,tx,ty]=path.slice(1).map(Number);assert.equal(ta,top);assert.equal(tb,top);assert.equal(sb,low);const slopes=[(low-top)/(da-x0),(sb-ta)/(db-da),(ty-tb)/(tx-db)];assert(Math.abs(slopes[0]-slopes[1])<1e-9);assert(Math.abs(slopes[1]-slopes[2])<1e-9);assert.match(svg,/stroke-dasharray="5 4"/);}
});

test('inventory original identity does not depend on drawing measurements; all generated K values are visibly available before answering',()=>{
 const d=definitions.find(d=>numberOf(d.source)===78)!;const original=d.build([0]);assert.deepEqual(autumn2016QuantitativeTruth(78,original),[false,false,false,true]);
 // At 2X=K+S the third and fourth quantities coincide numerically, but the third is not a general identity.
 const s0=20,k0=60,xEqual=40,xOther=50;assert.equal(k0-xEqual,xEqual-s0);assert.notEqual(k0-xOther,xOther-s0);
 for(const e of [41,70,140]){const maximum=e+s0;assert(maximum>k0);assert.equal(xEqual+e-(k0-xEqual),maximum);assert.notEqual(xOther+e-(k0-xOther),maximum);assert.equal(xOther+e-(xOther-s0),maximum);}
 // Move only illustrative original drawing coordinates: the symbolic answer remains the same identity.
 for(const coords of [[0,100,10,80,20],[0,200,20,100,60],[0,300,30,120,75]]){const b=structuredClone(original),f=b.prompt.find(x=>x.type==='diagram');assert(f?.type==='diagram'&&f.scene.kind==='source_figure');f.scene.values=coords;assert.deepEqual(autumn2016QuantitativeTruth(78,b),[false,false,false,true]);}
 for(let i=1;i<=d.fields[0].maximum;i++){const b=d.build([i]),f=b.prompt.find(x=>x.type==='diagram');assert(f?.type==='diagram'&&f.scene.kind==='source_figure');const[_,__,s,k,x]=f.scene.values;const svg=graph(f);assert(svg.includes(`>発注点K（${k}個）</text>`));assert(f.alt.includes(`発注点K（${k}個）`));for(let offset=1;offset<=100;offset++){const e=k-s+offset;assert(e+s>k);const amounts=[e+s-x,k+s-x,-(k-x),-(x-s)];const t=amounts.map(delta=>x+e+delta===e+s);assert.deepEqual(t,[false,false,false,true]);}}
});
