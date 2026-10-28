import{fileURLToPath}from'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {GeneratedBody,GenerationDefinition} from '../src/core/generators/definition';
import {autumn2018LanguageSpecs} from '../scripts/legacy-2018-autumn-language-specs';
import {Legacy2018AutumnLanguageFigure,autumn2018LanguageModel} from '../src/ui/Legacy2018AutumnLanguageFigure';
import {autumn2018Pm11Input} from '../src/core/generators/legacy-2018-autumn-pm11';
const folder=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
type Unit={number:number;promptIndex:number;id:string;physicalPages:number[];kind:'paragraph'|'code'|'diagram';sourceText?:string;language?:string;binding?:string;profile?:string;group?:number;nestedSourceUnits?:string[]};
const ledger=JSON.parse(fs.readFileSync(path.join(folder,'tests/fixtures/legacy-2018-autumn-language-source-unit-order.json'),'utf8'))as{units:Unit[]};
function check(number:number,body:GeneratedBody,reference=false){
 const units=ledger.units.filter(u=>u.number===number);assert.equal(body.prompt.length,units.length);
 for(const u of units){const block=body.prompt[u.promptIndex];assert.equal(block.type,u.kind);
  if(block.type==='paragraph'){if(reference||!u.binding)assert.equal(block.text,u.sourceText,u.id);}
  else if(block.type==='code'){assert.equal(block.text,u.sourceText,u.id);assert.equal(block.language,u.language);}
  else if(block.type==='diagram'){assert.equal(block.scene.kind,'source_figure');if(block.scene.kind!=='source_figure')throw Error('kind');assert.equal(block.scene.profile,u.profile);assert.equal(block.scene.values.at(-1),u.group);const model=autumn2018LanguageModel(block.scene.profile,block.scene.values),html=renderToStaticMarkup(React.createElement(Legacy2018AutumnLanguageFigure,{profile:block.scene.profile,values:block.scene.values}));assert.equal(model.caption,block.caption);assert(html.includes('<figcaption>'));if(model.lineNumbersLabel)assert(html.indexOf('（行番号）')<html.indexOf('<pre'));}
 }
}
function* tuples(d:GenerationDefinition,v:number[]=[]):Generator<number[]>{if(v.length===d.fields.length){yield v;return;}for(let n=d.fields[v.length].minimum;n<=d.fields[v.length].maximum;n++)yield*tuples(d,[...v,n]);}
test('manual146 source units span all22 body pages and preserve literal reference text, declarations, labels and source order',()=>{
 assert.equal(ledger.units.length,146);assert.deepEqual([9,10,11,12].map(n=>ledger.units.filter(u=>u.number===n).length),[57,25,41,23]);
 assert.deepEqual([...new Set(ledger.units.flatMap(u=>u.physicalPages))].sort((a,b)=>a-b),Array.from({length:22},(_,i)=>45+i));
 assert.equal(new Set(ledger.units.map(u=>u.id)).size,146);
 for(const spec of autumn2018LanguageSpecs)check(spec.number,spec.definition.build(spec.definition.reference),true);
 const q9=ledger.units.filter(u=>u.number===9),position=(id:string)=>q9.findIndex(u=>u.id===id);
 assert(position('Q9.P46.struct-block-declaration')<position('Q9.P47-48.program1'));
 assert(position('Q9.P47.struct-train-declaration')<position('Q9.P47-48.program1'));
 assert(position('Q9.P51.program3')<position('Q9.P51.blank-e-f-after-program3'));
 assert(position('Q9.P51.blank-e-f-after-program3')<position('Q9.P51.bank-e'));
});
test('all42 conditions keep source-unit positions; source example keys and dependent period/year wording remain bound',()=>{
 let count=0;for(const spec of autumn2018LanguageSpecs)for(const values of tuples(spec.definition)){const body=spec.definition.build(values);check(spec.number,body);if(spec.number===11){const x=autumn2018Pm11Input(values);for(const key of ['名前','明細','合計']){assert(x.template.includes('<'+key+'>'));assert(x.table[key].length>=1);}assert(body.prompt.some(b=>b.type==='paragraph'&&b.text.includes('ひな形中の<明細>')));}count++;}assert.equal(count,42);
});
test('source-unit regression guard rejects declaration deletion, next-section definition loss, paragraph merger and preposed e/f sentence',()=>{
 const spec=autumn2018LanguageSpecs[0],original=spec.definition.build(spec.definition.reference),units=ledger.units.filter(u=>u.number===9),at=(id:string)=>units.find(u=>u.id===id)!.promptIndex;
 const deleted=structuredClone(original);deleted.prompt.splice(at('Q9.P46.struct-block-declaration'),1);assert.throws(()=>check(9,deleted,true));
 const missingDefinition=structuredClone(original),def=missingDefinition.prompt[at('Q9.P46.rule5-definition')];assert(def.type==='paragraph');def.text=def.text.replace('（以下，次区間という）','');assert.throws(()=>check(9,missingDefinition,true));
 const merged=structuredClone(original),p1=merged.prompt[at('Q9.P49.proceed-function')],p2=merged.prompt[at('Q9.P49.proceed-argument-blocks')];assert(p1.type==='paragraph'&&p2.type==='paragraph');p1.text+=p2.text;merged.prompt.splice(at('Q9.P49.proceed-argument-blocks'),1);assert.throws(()=>check(9,merged,true));
 const moved=structuredClone(original),[sentence]=moved.prompt.splice(at('Q9.P51.blank-e-f-after-program3'),1);moved.prompt.splice(at('Q9.P51.program3'),0,sentence);assert.throws(()=>check(9,moved,true));
});
test('native source forms keep separate route/table, qualification grouped heading, figure output labels and alpha between break/default',()=>{
 const q9=autumn2018LanguageSpecs[0].definition.build([3,0]),diagrams=q9.prompt.filter(b=>b.type==='diagram');assert(diagrams[0].type==='diagram'&&diagrams[1].type==='diagram');assert.equal(diagrams[0].scene.kind,'source_figure');
 const graph=renderToStaticMarkup(React.createElement(Legacy2018AutumnLanguageFigure,{profile:"legacy-2018-autumn-pm9-route",values:[3,0,0]})),table=renderToStaticMarkup(React.createElement(Legacy2018AutumnLanguageFigure,{profile:"legacy-2018-autumn-pm9-route",values:[3,0,1]}));assert(graph.includes('<svg')&&!graph.includes('<table'));assert(table.includes('<table')&&!table.includes('<svg'));assert(graph.indexOf('</svg>')<graph.indexOf('<figcaption>'));assert(table.indexOf('<figcaption>')<table.indexOf('<table'));
 const record=renderToStaticMarkup(React.createElement(Legacy2018AutumnLanguageFigure,{profile:"legacy-2018-autumn-pm10-record",values:[0,0,0]}));assert(record.includes('rowSpan')||record.includes('rowspan="2"'));assert(record.includes('colSpan')||record.includes('colspan="4"'));assert(record.includes('保有状況'));
 const example=renderToStaticMarkup(React.createElement(Legacy2018AutumnLanguageFigure,{profile:"legacy-2018-autumn-pm11-example",values:[0,0]}));assert(example.includes('出力<br/>')&&example.includes('出力文書'));
 const parser=renderToStaticMarkup(React.createElement(Legacy2018AutumnLanguageFigure,{profile:"legacy-2018-autumn-pm11-program",values:[0,3]}));assert(parser.indexOf('break;',parser.indexOf('［c］'))<parser.indexOf('data-alpha'));assert(parser.indexOf('data-alpha')<parser.indexOf('default:'));
});
test('all109 source-bank texts are independently frozen and both native banks and actual choice records retain their ordered role positions',()=>{
 const gold=JSON.parse(fs.readFileSync(path.join(folder,'tests/fixtures/legacy-2018-autumn-language-source-banks.json'),'utf8'))as Record<string,string[][]>;
 let count=0;for(const spec of autumn2018LanguageSpecs){const expected=gold[String(spec.number)],body=spec.definition.build(spec.definition.reference);let offset=0;
  for(const [g,bank]of expected.entries()){
   const model=autumn2018LanguageModel(`legacy-2018-autumn-pm${spec.number}-bank`,[...spec.definition.reference,g]);assert.deepEqual(model.rows!.map(row=>row[1]),bank);
   assert.deepEqual(body.choices.slice(offset,offset+bank.length).map(blocks=>{assert.equal(blocks.length,1);const b=blocks[0];assert(b.type==='code');return b.text;}),bank);offset+=bank.length;count+=bank.length;
  }assert.equal(offset,body.choices.length);
 }assert.equal(count,109);
});
test('source-reviewed12 complete programs and2 change tables retain every nonblank line; all42 conditions change only declared value slots',()=>{
 const gold=JSON.parse(fs.readFileSync(path.join(folder,'tests/fixtures/legacy-2018-autumn-language-source-programs-reviewed.json'),'utf8'))as{rows:{number:number;profile:string;group:number;pages:number[];referenceModel:ReturnType<typeof autumn2018LanguageModel>}[]};
 assert.equal(gold.rows.filter(r=>r.profile.endsWith('-program')).length,12);assert.equal(gold.rows.filter(r=>r.profile.endsWith('-changes')).length,2);
 for(const spec of autumn2018LanguageSpecs)for(const values of tuples(spec.definition))for(const r of gold.rows.filter(r=>r.number===spec.number)){
  const current=structuredClone(autumn2018LanguageModel(r.profile,[...values,r.group]));
  if(r.number===9&&r.group===2)current.text=current.text!.replace(/i < [1-6];/,'i < 4;');
  if(r.number===12&&r.group===0){const year=[1970,1972,1980,1999,2000,2099,2100,2399][values[0]];current.text=current.text!.replaceAll(String(year),'1970');}
  assert.deepEqual(current,r.referenceModel,`${r.number}/${r.group}/${values}`);
 }
 const sample=gold.rows.find(r=>r.number===11&&r.group===5)!,mutant=structuredClone(sample.referenceModel);mutant.text=mutant.text!.replace('import java.util.List;\n','');assert.notDeepEqual(mutant,sample.referenceModel,'unused source imports are also required transcription units');
 assert.deepEqual(gold.rows.find(r=>r.number===9&&r.group===1)!.pages,[49,50]);
});
