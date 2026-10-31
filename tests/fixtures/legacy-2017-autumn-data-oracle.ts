import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {GeneratedBody} from '../../src/core/generators/definition';
import {Legacy2017AutumnDataFigure as Figure} from '../../src/ui/Legacy2017AutumnDataFigures';
import {readAutumnDataLogicSvg,readAutumnDataFormulaSvg,readAutumnDataUmlSvg,autumnDataFormulaAlt} from './legacy-2017-autumn-data-svg';
import facts from './legacy-2017-autumn-data-facts.json';
const plain=(b:GeneratedBody['choices'][number])=>{assert.equal(b.length,1);const p=b[0];assert.equal(p.type,'paragraph');assert(p.type==='paragraph');return p.text;};
function* vectors(length:number,options:number[],values:number[]=[]):Generator<number[]>{if(values.length===length){yield values;return;}for(const n of options)yield*vectors(length,options,[...values,n]);}
const cached=new Map<string,{models:number;ordinary:boolean;divisionEmployee:boolean;empty:boolean;unmanaged:boolean}>();
/** Small object instances are enumerated separately from diagram/producer data.
 * Bounds also admit ordinary Departments: no covering constraint was supplied.
 * Universal conclusions separately follow from endpoint type and lower bounds. */
export function autumnDataUmlModels(employeeMinimum:number,managerMinimum:number){
 const key=`${employeeMinimum}:${managerMinimum}`;if(cached.has(key))return cached.get(key)!;
 let models=0,ordinary=false,divisionEmployee=false,empty=false,unmanaged=false;
 for(const count of[2,3]){const departments=Array.from({length:count},(_,i)=>i);
  for(let mask=1;mask<1<<count;mask++){const divisions=departments.filter(d=>mask>>d&1);
   for(let n=0;n<=4;n++)for(const employeeDepartments of vectors(n,departments)){
    const counts=departments.map(d=>employeeDepartments.filter(x=>x===d).length);if(counts.some(n=>n<employeeMinimum))continue;
    for(const managers of vectors(count,managerMinimum?divisions:[-1,...divisions])){
     if(divisions.some(d=>!managers.includes(d)))continue;models++;
     ordinary ||= employeeDepartments.some(d=>!divisions.includes(d));divisionEmployee ||= employeeDepartments.some(d=>divisions.includes(d));empty ||= counts.includes(0);unmanaged ||= managers.includes(-1);
    }
   }
  }
 }
 const result={models,ordinary,divisionEmployee,empty,unmanaged};cached.set(key,result);return result;
}
function drawn(profile:string,values:number[],caption:string){return renderToStaticMarkup(createElement(Figure,{profile,values,caption}));}
const logicExplanations=[
 '入力AとBが異なるときだけ出力が1になる回路で、排他的論理和に等しい。二つの入力の積とその否定の和は常に1である。同じ入力の組を1にする積和と、二つの和の積で表された同値の式は、いずれもAとBが等しいときに1となるため、この回路とは異なる。',
 '最後のゲートがNORなので、二つのANDの出力の論理和を反転する。AとBが等しいときだけ出力が1となり、A・BとAの否定・Bの否定の和に等しい。積とその否定の和は常に1であり、残る二つの式はAとBが異なるときに1となる。',
];
export function legacy2017AutumnDataOracle(source:string,body:GeneratedBody,values:number[]){
 const expected=facts.conditions.find(r=>r.source===source&&r.variant===values[0]),plan=facts.designInputs.find(p=>p.source===source);assert(expected&&plan);assert.equal(values.length,1);const v=values[0],n=plan.number;assert(Number.isInteger(v)&&v>=0&&v<plan.capacity);
 assert.equal(body.choices.length,4);assert.equal(body.prompt.length,n===23||n===28?2:1);const stem=body.prompt[0];assert(stem.type==='paragraph');assert.equal(stem.text,expected.fullStem);
 let truth=expected.slots.map(s=>s.trueForQuestion);
 if(n===23){
  const b=body.prompt[1];assert(b.type==='diagram'&&b.scene.kind==='source_figure');assert.equal(b.scene.profile,'legacy-2017-logic-six-gates');assert.deepEqual(b.scene.values,[v,0]);assert.equal(b.caption,'ディジタル回路');const svg=drawn(b.scene.profile,b.scene.values,b.caption);assert.equal(b.alt,svg.match(/<desc[^>]*>([^<]*)<\/desc>/)![1]);const circuit=readAutumnDataLogicSvg(svg,v);
  const equations=body.choices.map((blocks,i)=>{assert.equal(blocks.length,1);const c=blocks[0];assert(c.type==='diagram'&&c.scene.kind==='source_figure');assert.equal(c.scene.profile,'legacy-2017-logic-six-gates');assert.deepEqual(c.scene.values,[v,i+1]);assert.equal(c.caption,'論理式');assert.equal(c.alt,autumnDataFormulaAlt[v][i]);return readAutumnDataFormulaSvg(drawn(c.scene.profile,c.scene.values,c.caption),v,i+1);});
  const rows=[[false,false],[false,true],[true,false],[true,true]],circuitVector=rows.map(([a,b])=>Number(circuit(a,b))).join(''),vectors=equations.map(e=>rows.map(([a,b])=>Number(e(a,b))).join(''));
  assert.deepEqual(vectors,v===0?['1111','1001','0110','1001']:['1111','1001','0110','0110']);assert.equal(circuitVector,v===0?'0110':'1001');truth=vectors.map(s=>s===circuitVector);assert.equal(body.explanation,logicExplanations[v]);
 }else{
  assert.deepEqual(body.choices.map(plain),expected.fullChoices);
  if(n===28){const b=body.prompt[1];assert(b.type==='diagram'&&b.scene.kind==='source_figure');assert.equal(b.scene.profile,'legacy-2017-uml-departments');assert.deepEqual(b.scene.values,[v]);assert.equal(b.caption,'データモデル');const svg=drawn(b.scene.profile,b.scene.values,b.caption);assert.equal(b.alt,svg.match(/<desc[^>]*>([^<]*)<\/desc>/)![1]);const bounds=readAutumnDataUmlSvg(svg,v),models=autumnDataUmlModels(bounds.employeeMinimum,bounds.managerMinimum);assert.equal(models.models,[2822,1222,7871][v]);truth=[false,v===0?models.divisionEmployee:!models.ordinary,models.empty,!models.unmanaged];}
  let explanation=expected.fullChoices.map((c,i)=>`「${c}」${expected.slots[i].reason}`).join(' ');
  if(n===29)explanation+=' ACIDは原子性・一貫性・独立性・永続性の四性質である。一貫性には宣言した制約やアプリケーションの正しい処理も関わり、DBMSだけで全ての業務規則が自動的に満たされるという意味ではない。';
  assert.equal(body.explanation,explanation);
 }
 assert.deepEqual(truth,expected.slots.map(s=>s.trueForQuestion));assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));
 return truth;
}
