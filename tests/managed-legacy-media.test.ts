import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {schema} from '../src/core/validation';
import {validateSourceFigure,sourceFigureAlt,sourceFigureDomains} from '../src/core/source-figures';
import {managedLegacyFigure,joinManagedLegacyDomains} from '../src/core/managed-legacy-figures';
import {SourceFigure} from '../src/ui/SourceFigure';
import {Content} from '../src/ui/Content';
import {AnswerChoices} from '../src/ui/AnswerChoices';
import {legacy2017Pm3Records} from '../scripts/import-legacy-2017-pm3';
import metadata from './fixtures/legacy-2017-pm3-original-metadata.json';

import morningDomains from '../src/core/legacy-morning-figure-domains.json';
import coreDomains from '../src/core/source-figure-domains.json';
import {legacyAfternoonFigureDomains} from '../src/core/legacy-afternoon-figures';
import {fixture} from './fixtures/legacy-afternoon-main-preservation';
import {legacy2017Pm3FigureAlt} from '../src/core/generators/legacy-2017-pm3-data';
const profile='legacy-2017-pm3-waste-database',caption='図1 データベースの表構成とデータ格納例';
const scene=(values:unknown=[0],p=profile)=>({kind:'source_figure' as const,profile:p,values:values as number[]});
const refuse=(values:unknown,p=profile)=>assert.throws(()=>validateSourceFigure(scene(values,p)),{code:'FIGURE_PROFILE'});
test('literal managed singleton joins exactly one frozen profile; duplicates and outside widening fail',()=>{
 const keys=Object.keys(sourceFigureDomains),coreKeys=Object.keys(coreDomains),morningKeys=Object.keys(morningDomains),afternoonKeys=Object.keys(legacyAfternoonFigureDomains);
 // The literal singleton extends the 30 current profiles; the reviewed AM/PM
 // families are separate admissions and cannot silently widen that partition.
 assert.equal(coreKeys.length,30);assert.equal(morningKeys.length,61);
 const declared=[...coreKeys,...morningKeys,...afternoonKeys,profile];
 assert.equal(new Set(declared).size,declared.length,'reviewed profile families cannot overlap');
 assert.deepEqual([...keys].sort(),declared.sort(),'only declared current/AM/PM and the literal singleton are admitted');
 assert.deepEqual(keys.filter(key=>!Object.hasOwn(legacyAfternoonFigureDomains,key)&&!Object.hasOwn(morningDomains,key)).sort(),[...coreKeys,profile].sort());
 assert.deepEqual(sourceFigureDomains[profile],[[0,0]]);
 for(const [key,rows]of Object.entries(morningDomains)){
  validateSourceFigure(scene([...rows[0].values],key));
  const outside=[...rows[0].values];outside[0]=Math.max(...rows.map(row=>row.values[0]))+1;refuse(outside,key);
 }
 assert(Object.isFrozen(managedLegacyFigure));assert(Object.isFrozen(managedLegacyFigure.domain[0]));
 assert.throws(()=>{(sourceFigureDomains as Record<string,unknown>)[profile]=[[0,9]]});assert.throws(()=>{(sourceFigureDomains[profile][0] as unknown as number[])[1]=9});
 assert.throws(()=>joinManagedLegacyDomains({[profile]:[[0,0]]}),/Duplicate/);validateSourceFigure(scene());assert.equal(sourceFigureAlt(profile,[0]),legacy2017Pm3FigureAlt());
 for(const p of ['unknown','legacy-2017-pm3','legacy-2017-pm3-waste-database-extra','constructor','__proto__'])refuse([0],p);
});
test('singleton refuses sparse inherited/accessor/extra/symbol and all nonzero inputs without calling getter',()=>{
 for(const v of [[],[1],[-1],[0,0],[NaN],[0.5],[Infinity],new Array(1),Object.assign([0],{extra:1}),Object.assign([0],{[Symbol('bad')]:1})])refuse(v);
 const inherited=new Array(1);Object.setPrototypeOf(inherited,{0:0,length:1});refuse(inherited);
 let getters=0;const accessor=new Array(1);Object.defineProperty(accessor,'0',{get(){getters++;return 0}});refuse(accessor);assert.equal(getters,0);
});
test('real schema and unmodified Content/AnswerChoices draw reviewed source form; own caption rejection',async()=>{
 const {bundle:b}=await legacy2017Pm3Records({collection:metadata.collection,rendered:metadata});const q=b.questions[1],bundle=fixture();Object.assign(bundle,{sources:[...bundle.sources,...b.sources],rights:[...bundle.rights,...b.rights]});
 schema('question',q);const svg=renderToStaticMarkup(createElement(SourceFigure,{scene:scene(),caption}));
 assert.equal((svg.match(/data-pm3-table-caption=/g)||[]).length,4);assert.equal((svg.match(/data-pm3-header=/g)||[]).length,14);assert.equal((svg.match(/data-pm3-data=/g)||[]).length,14);assert.equal((svg.match(/data-pm3-primary-key=/g)||[]).length,5);
 const markup=renderToStaticMarkup(createElement(Content,{content:q.prompt,bundle,assetUrls:{},credit:true}));assert(markup.includes('CREATE TABLE'));assert(markup.includes('データベースの表構成とデータ格納例'));
 const choices=renderToStaticMarkup(createElement(AnswerChoices,{question:q,entry:{choiceOrder:q.choices.map(c=>c.id)},bundle,assetUrls:{},disabled:false,revealed:true}));assert.equal((choices.match(/<fieldset/g)||[]).length,5);assert.equal((choices.match(/type="radio"/g)||[]).length,21);
 assert.throws(()=>renderToStaticMarkup(createElement(SourceFigure,{scene:scene(),caption:'別の見出し'})),{code:'SOURCE_MATERIAL'});
 // Block.alt/renderer/credit are checked upstream; SourceFigure never receives them.
 const bad=structuredClone(q);const f=bad.prompt.blocks[5];assert(f.type==='diagram'&&f.scene.kind==='source_figure');f.scene.profile='unapproved';assert.throws(()=>schema('question',bad),{code:'SCHEMA'});
});
