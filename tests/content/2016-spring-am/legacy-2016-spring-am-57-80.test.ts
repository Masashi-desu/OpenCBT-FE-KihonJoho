import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import type {Block,Scene} from '../../../src/core/types';
import type {GeneratedBody} from '../../../src/core/generators/definition';
import {legacy2016SpringAm5780Definitions as definitions} from '../../../src/core/generators/legacy-2016-spring-am-57-80';
import {Legacy2016SpringAm5780Figures} from '../../../src/ui/Legacy2016SpringAm5780Figures';
import {spring2016Am5780Knowledge as knowledge} from '../../fixtures/legacy-2016-spring-am-57-80-oracle';
import facts from '../../fixtures/legacy-2016-spring-am-57-80-review.json';
const numberOf=(source:string)=>Number(source.split('-').at(-1));
const text=(blocks:readonly Block[]):string=>blocks.map(b=>b.type==='paragraph'?b.text:b.type==='list'?b.items.join('\n'):'').join('\n');
const epsilon=1e-8;
function statementTruth(number:number,caseIndex:number,body:GeneratedBody):boolean[]{
 const spec=knowledge[number];assert(spec,`unregistered independent knowledge ${number}`);
 assert.equal(body.choices.length,4);assert(spec.truths[caseIndex]);
 const values=body.choices.map(text);
 for(let i=0;i<4;i++){
  assert.match(values[i],new RegExp(spec.anchors[caseIndex][i]),`${number}/${caseIndex}/${i}: reviewed claim`);
  assert(!/ただし上記の記述は誤りである/.test(values[i]));
 }
 const truths=[...spec.truths[caseIndex]].map(s=>s==='1');
 const prompt=text(body.prompt);
 // Independently resolve those name-selection questions from the actual shown conditions.
 let semanticAnswer:string|undefined;
 if(number===62){
  const four=['ビジネスアーキテクチャ','データアーキテクチャ','アプリケーションアーキテクチャ','テクノロジアーキテクチャ'];
  const missing=four.filter(s=>!prompt.includes(s));assert.equal(missing.length,1);semanticAnswer=missing[0];
 }
 if(number===72){
  const ls=body.prompt.find(b=>b.type==='list');assert(ls?.type==='list');assert.equal(ls.items.length,3);
  const steps=ls.items.join('\n');
  semanticAnswer=/部品構成表/.test(steps)&&/在庫/.test(steps)&&/リードタイム/.test(steps)?'MRP':
   /作業計画/.test(steps)&&/負荷/.test(steps)&&/能力/.test(steps)?'CRP':
   /形状/.test(steps)&&/寸法/.test(steps)&&/図面/.test(steps)?'CAD':
   /後工程/.test(steps)&&/引き取/.test(steps)&&/補充/.test(steps)?'JIT':undefined;
  assert(semanticAnswer,'the three displayed steps must independently identify one process');
 }
 if(number===73){
  semanticAnswer=/企業が他の企業/.test(prompt)?'BtoB':/多数の出店者/.test(prompt)?'バーチャルモール':/政府が一般消費者/.test(prompt)?'GtoC':/一般消費者.*購入条件.*売り手/.test(prompt)?'逆オークション':undefined;
  assert(semanticAnswer);
 }
 if(number===75){
  semanticAnswer=/模倣.*中核/.test(prompt)?'コアコンピタンス':/企業理念.*標章.*統一/.test(prompt)?'コーポレートアイデンティティ':/影響.*関心.*影響度/.test(prompt)?'ステークホルダアナリシス':/透明性.*監督・監視/.test(prompt)?'コーポレートガバナンス':undefined;
  assert(semanticAnswer);
 }
 if(number===78){
  semanticAnswer=/一定時点.*資産.*負債.*純資産/.test(prompt)?'貸借対照表':/収益.*費用.*利益/.test(prompt)?'損益計算書':/営業.*投資.*財務.*現金/.test(prompt)?'キャッシュフロー計算書':/純資産の変動/.test(prompt)?'株主資本等変動計算書':undefined;
  assert(semanticAnswer);
 }
 if(number===76){const expected=/機能別組織/.test(prompt)?/^経理/:/事業部制/.test(prompt)?/^地域/:/ネットワーク型/.test(prompt)?/^複数企業/:/プロジェクト/.test(prompt)?/^ある問題/:undefined;assert(expected);assert.deepEqual(values.map(s=>expected.test(s)),truths);}
 if(semanticAnswer)assert.deepEqual(values.map(s=>s===semanticAnswer),truths);
 const directions:Record<number,RegExp>={57:/容量・能力.*監視/,58:/落雷|雷による/,59:/アクセス.*監査|アクセス.*監査人/,61:/パッチ|ソフトウェア更新/,64:/UML/,65:/IoT/,67:/SWOT/,68:/ベンチマーキング/,69:/マトリックス/,70:/EMS/,71:/ディジタルディバイド/,74:/ロングテール/,76:/プロジェクト組織|機能別組織|事業部制組織|ネットワーク型組織/,79:/保護.*対象.*ならない/,80:/契約|請負/};
 if(directions[number])assert.match(prompt,directions[number]);
 assert.equal(truths.filter(Boolean).length,1);return truths;
}
function assertKnowledge(number:number,caseIndex:number,body:GeneratedBody){
 const truths=statementTruth(number,caseIndex,body);
 assert.equal(body.correctIndex,truths.indexOf(true));
 assert(body.explanation.length>45);
}
function diagramMarkup(b:Block){assert(b.type==='diagram'&&b.scene.kind==='source_figure');return render(h(Legacy2016SpringAm5780Figures,{scene:b.scene,caption:b.caption}));}
function inspectPareto(markup:string){
 const rects=[...markup.matchAll(/<rect[^>]* x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)].map(m=>m.slice(1).map(Number));
 assert([4,5].includes(rects.length));rects.forEach(([x,y,w,h],i)=>{assert(Math.abs(x-(25+48*i))<epsilon);assert.equal(w,48);assert(h>0);assert(Math.abs(y+h-192)<epsilon);});
 const poly=markup.match(/<polyline[^>]* points="([^"]+)"/);assert(poly);const points=poly[1].split(' ').map(s=>s.split(',').map(Number));assert.equal(points.length,6);points.forEach(([x])=>assert(Number.isFinite(x)));
 const heights=rects.map(r=>r[3]);
 const descending=heights.every((v,i)=>i===0||heights[i-1]>=v-epsilon);
 let sum=0;const cumulative=points.length===heights.length+1&&points.every(([x,y],i)=>{if(i)sum+=heights[i-1];return Math.abs(x-(25+48*i))<epsilon&&Math.abs(192-y-sum)<epsilon;});
 return descending&&cumulative;
}

test('source57–80 keeps all24 dispositions, 21 candidate originals, complete original wording and official answers',()=>{
 assert.deepEqual([...facts.questions.map(q=>q.number),...facts.held.map(q=>q.number)].sort((a,b)=>a-b),Array.from({length:24},(_,i)=>57+i));
 assert.deepEqual(facts.held.map(h=>h.number),[60,63,66]);assert.equal(definitions.length,21);
 for(const d of definitions){
  const n=numberOf(d.source),q=facts.questions.find(q=>q.number===n)!;assert(q);const b=d.build([0]);assert.deepEqual(d.reference,[0]);assert.equal(d.sourceAnswer,q.officialKey);assert.equal(b.correctIndex,'アイウエ'.indexOf(q.officialKey));assert.equal(text([b.prompt[0]]),q.prompt);
  assert.equal(b.choices.length,4);if(n!==77)assert.deepEqual(b.choices.map(text),q.choices);
  if(n===72){const ls=b.prompt.find(b=>b.type==='list');assert(ls?.type==='list');assert.deepEqual(ls.items,'steps' in q?q.steps:undefined);}
  if(n===69)assert.equal(b.prompt.filter(b=>b.type==='diagram').length,1);
  if(n===77)assert.equal(b.choices.flat().filter(b=>b.type==='diagram').length,4);
  assert(q.fullAlt.includes(q.prompt));assert(q.crop.sha256.length===64);assert(q.crop.width>1000&&q.crop.height>300);
 }
});

test('independent primary-fact truth review covers all92 finite bodies and368 choices, including original conditions',()=>{
 let bodies=0,choices=0;for(const d of definitions){const n=numberOf(d.source),seen=new Set<string>();
  for(let i=0;i<=d.fields[0].maximum;i++){
   const b=d.build([i]);assert.deepEqual(b,d.build([i]));assert.equal(b.choices.length,4);
   if(n===77){const truths=b.choices.map(bs=>inspectPareto(diagramMarkup(bs[0])));assert.deepEqual(truths,[true,false,false,false]);assert.equal(b.correctIndex,truths.indexOf(true));}
   else assertKnowledge(n,i,b);
   const signature=JSON.stringify([b.prompt,b.choices]);assert(!seen.has(signature),`${n}/${i}: substantive finite input must differ`);seen.add(signature);bodies++;choices+=4;
  }
  for(const v of [[],[-1],[d.fields[0].maximum+1],[NaN],[Infinity],[.5],[0,0]])assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);
 }assert.equal(bodies,92);assert.equal(choices,368);
});

test('knowledge mutations reject wrong correct answer, swapped claim, counterfeit condition and all unreviewed questions',()=>{
 let rejected=0;
 for(const d of definitions){const n=numberOf(d.source);if(n===77)continue;
  for(let i=0;i<=d.fields[0].maximum;i++){
   const b=d.build([i]);assertKnowledge(n,i,b);const wrong=structuredClone(b);wrong.correctIndex=(wrong.correctIndex!+1)%4;assert.throws(()=>assertKnowledge(n,i,wrong));rejected++;
   const swapped=structuredClone(b),j=b.correctIndex!,k=(j+1)%4;[swapped.choices[j],swapped.choices[k]]=[swapped.choices[k],swapped.choices[j]];assert.throws(()=>assertKnowledge(n,i,swapped));rejected++;
   const negated=structuredClone(b),b0=negated.choices[j][0];assert(b0.type==='paragraph');b0.text+='ただし上記の記述は誤りである。';assert.throws(()=>assertKnowledge(n,i,negated));rejected++;
  }
 }
 assert.equal(rejected,240);for(const n of[60,63,66])assert.throws(()=>statementTruth(n,0,definitions[0].build([0])));
});

test('source-local SVG SSR validates all48 graphs and4 matrices, fixed labels and order; rejects invalid input and a false cumulative line',()=>{
 let graphs=0,matrices=0;
 for(const d of definitions){const n=numberOf(d.source);if(n!==69&&n!==77)continue;
  for(let i=0;i<=d.fields[0].maximum;i++){
   const b=d.build([i]);if(n===77){for(const[role,bs]of b.choices.entries()){
    const markup=diagramMarkup(bs[0]);assert.equal(inspectPareto(markup),role===0);assert.equal((markup.match(/<polyline /g)||[]).length,1);assert.equal((markup.match(/<rect /g)||[]).length,role===1?4:5);assert(!markup.includes('<text'));assert(markup.includes('aria-label='));assert(markup.includes('--source-figure-width:320px'));graphs++;
    if(role===0){const corrupted=markup.replace(/(<polyline[^>]* points=")[^"]+/, '$125,192 73,192 121,192 169,192 217,192 265,192');assert.notEqual(corrupted,markup);assert.equal(inspectPareto(corrupted),false);}
   }}else{
    const markup=diagramMarkup(b.prompt[1]);assert(markup.includes('事業の強み（市場シェア）'));assert(markup.includes('事業の魅力度（市場成長率）'));assert(markup.includes('x="170" y="350">強'));assert(markup.includes('x="403" y="350">弱'));assert(markup.includes('x="442" y="88">高'));assert(markup.includes('x="442" y="316">低'));assert.equal((markup.match(/<rect /g)||[]).length,1);assert(markup.includes('M285 65V325M155 195H415'));assert(markup.includes('--source-figure-width:500px'));matrices++;
   }
  }
 }
 assert.equal(graphs,48);assert.equal(matrices,4);
 const badScenes:Extract<Scene,{kind:'source_figure'}>[]=[{kind:'source_figure',profile:'legacy-2016-spring-am-ppm',values:[1]},{kind:'source_figure',profile:'legacy-2016-spring-am-pareto',values:[4,0]},{kind:'source_figure',profile:'legacy-2016-spring-am-pareto',values:[0,12]},{kind:'source_figure',profile:'legacy-2016-spring-am-pareto',values:[NaN,0]}];
 for(const scene of badScenes)assert.throws(()=>render(h(Legacy2016SpringAm5780Figures,{scene})),/FIGURE_VALUE/);
});


test('source-local study terms retain reviewed expansions and source scopes, excluding held60/63/66',async()=>{
 const {legacy2016SpringAm5780StudyTerms:terms,legacy2016SpringAm5780RelatedTerms:related}=await import('../../../src/core/generators/legacy-2016-spring-am-57-80-study-terms');
 const expansions:Record<string,string>={IT:'Information Technology',CPU:'Central Processing Unit',SPD:'Surge Protective Device',ID:'Identifier',OS:'Operating System',EA:'Enterprise Architecture',UML:'Unified Modeling Language',ER:'Entity-Relationship',DFD:'Data Flow Diagram',IoT:'Internet of Things',CtoC:'Consumer to Consumer',Web:'World Wide Web',SWOT:'Strengths, Weaknesses, Opportunities, Threats',BSC:'Balanced Scorecard',PEST:'Political, Economic, Social, Technological','3C':'Customer, Competitor, Company',ERP:'Enterprise Resource Planning',BPR:'Business Process Reengineering',EMS:'Electronics Manufacturing Service',PC:'Personal Computer',CAD:'Computer-Aided Design',CRP:'Capacity Requirements Planning',JIT:'Just In Time',MRP:'Material Requirements Planning',BtoB:'Business to Business',GtoC:'Government to Consumer'};
 const sources=facts.questions.map(q=>q.source);assert.deepEqual(Object.keys(related),sources);assert(terms.length>=Object.keys(expansions).length);
 for(const term of terms){assert(term.sources?.length);assert(term.sources.every(s=>sources.includes(s)));assert(term.meaning.length>15);if(term.expansion)assert.equal(term.expansion,expansions[term.term]);}
 for(const [term,expansion]of Object.entries(expansions))assert.equal(terms.find(t=>t.term===term)?.expansion,expansion);
 assert(terms.find(t=>t.term==='請負・派遣・準委任')?.meaning.includes('2016年'));assert(terms.find(t=>t.term==='プログラムの解法')?.meaning.includes('10条3項'));
});
