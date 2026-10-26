import test from 'node:test';import assert from 'node:assert/strict';
import {legacy2017Pm3Records} from '../scripts/import-legacy-2017-pm3';
import metadata from './fixtures/legacy-2017-pm3-original-metadata.json';
import {legacy2017Pm3TestCarrier} from '../scripts/review-legacy-2017-pm3-records';
import {legacy2017Pm3Definition as definition} from '../src/core/generators/legacy-2017-pm3';
import {additionalDefinitions,bindAdditionalQuestion} from '../src/core/generators';
import {validateSourceFormat} from '../src/core/generation-formats';
import {contentHash} from '../src/core/hash';
import {prepareRun,validateRun} from '../src/core/session';
import {validateBundle} from '../src/core/validation';
import type {Question,Template,Attribution} from '../src/core/types';
import {fixture} from './fixtures/legacy-afternoon-main-preservation';
import {readCatalog} from '../src/core/catalog-reader';
import {sha256} from '../src/core/hash';
const create=async()=>legacy2017Pm3TestCarrier((await legacy2017Pm3Records({collection:metadata.collection,rendered:metadata})).bundle);
const figure=(q:Question)=>{const f=q.prompt.blocks[5];assert(f.type==='diagram'&&f.scene.kind==='source_figure');return f};
export const badMaterials:Record<string,(q:Question,t:Template)=>void>={
 page14:q=>{figure(q).attribution.sourceRefs[0].locator.page=14},
 rights:q=>{figure(q).attribution.rightsRefs=['rights-original']},
 origin:q=>{figure(q).attribution.origin='original'},
 refs:q=>{figure(q).attribution.sourceRefs=[]},
 creator:q=>{figure(q).attribution.creatorIds=['ipa']},
 alt:q=>{figure(q).alt+='別'},caption:q=>{figure(q).caption+='別'},
 renderer:q=>{figure(q).rendererRef.version='1.1.0'},
 slot:q=>{[q.prompt.blocks[5],q.prompt.blocks[6]]=[q.prompt.blocks[6],q.prompt.blocks[5]]},
 foreignProfile:q=>{const f=figure(q);assert(f.scene.kind==='source_figure');f.scene.profile='waf-network';f.scene.values=[0]},
 foreignSource:q=>{q.origin.sourceRefs[0].sourceId='source-ipa-2023-a-qs'},
 baseRevision:(q,t)=>{t.baseQuestionRef.revision=2},
 template:(q,t)=>{t.id='template-source-2023-a-1'},
 generator:(q,t)=>{t.generatorRef.id='generator-source-2023-a-1'},
 version:(q,t)=>{t.generatorRef.version='3.1.0'},
 parent:q=>{q.origin.derivedFrom=[{questionId:'question-ipa-2023-a-1',revision:1}]},
};
const inject=async(fn:()=>Promise<void>)=>{const before=[...additionalDefinitions];assert(!before.some(d=>d.source===definition.source));(additionalDefinitions as import('../src/core/generators/definition').GenerationDefinition[]).push(definition);try{await fn()}finally{additionalDefinitions.splice(before.length);before.forEach((d,i)=>assert.equal(additionalDefinitions[i],d));assert.equal(additionalDefinitions.length,176)}};
test('reviewed p13 credit survives all four real binds and complete included carrier; source excluded bytes unchanged',async()=>{
 const source=(await legacy2017Pm3Records({collection:metadata.collection,rendered:metadata})).bundle,bytes=JSON.stringify(source);
 await inject(async()=>{const {bundle,base,template}=await legacy2017Pm3TestCarrier(source);await validateBundle(bundle);validateSourceFormat(base,template);
 for(let v=0;v<4;v++){const q=bindAdditionalQuestion(base,template,[v],'instance-material-'+v,'2026-10-23T10:00:00Z');validateSourceFormat(q,template);assert.throws(()=>bindAdditionalQuestion(q,template,[v],'instance-rebound','2026-10-23T10:00:00Z'),{code:'SOURCE_MATERIAL'});assert.deepEqual(q.origin.derivedFrom,[{questionId:base.id,revision:1}]);assert.deepEqual(base.origin.derivedFrom,[{questionId:source.questions[0].id,revision:1}]);
 assert.deepEqual(figure(q).attribution,{origin:'adapted',sourceRefs:[{sourceId:'source-ipa-2017h29h-fe-pm-3-qs',locator:{section:'平成29年度 春期 基本情報技術者試験 午後 問3',page:13,year:2017,period:'春期',exam:'基本情報技術者試験',subject:'午後',timeSlot:'午後',questionNumber:'3'}}],rightsRefs:['rights-ipa-2017h29h-fe-pm-3','rights-original'],creatorIds:['codex']});assert.equal(q.correctAnswer.attribution.origin,'original');assert.equal(q.explanation.attribution.origin,'original');}
 });assert.equal(JSON.stringify(source),bytes);assert.equal(source.questions[0].assetRefs.length,4);assert(source.questions.every(q=>q.distribution==='excluded'));
});
test('bidirectional trigger rejects material and identity mutations before bind or saved-format fallback',async()=>{
 await inject(async()=>{const {base,template,bundle}=await create();for(const [name,mutate]of Object.entries(badMaterials)){const q=structuredClone(base),t=structuredClone(template);mutate(q,t);assert.throws(()=>bindAdditionalQuestion(q,t,[0],'instance-negative','2026-10-23T10:00:00Z'),name);assert.throws(()=>validateSourceFormat(q,t),name);}
 const foreign=structuredClone(bundle.questions.find(q=>q.id==='question-template-source-2023-a-2')??bundle.questions.find(q=>q.id!==base.id&&q.origin.kind==='official_adaptation')!);const t=bundle.templates.find(t=>t.baseQuestionRef.questionId===foreign.id)!;foreign.prompt.blocks[0]=structuredClone(figure(base));assert.throws(()=>validateSourceFormat(foreign,t),{code:'SOURCE_MATERIAL'});
 });
});
test('rehashing issued Question, instance and entry cannot bypass restored semantic material checks',async()=>{
 await inject(async()=>{const {bundle,base,template,set,exam}=await create();const run=await prepareRun(bundle,{subject:'B',kind:'bookmark',mode:'study',bindingMode:'generated_values',bookmarkQuestionRef:{questionId:base.id,revision:1}},{},Date.now(),undefined,{questions:[base],set,exam,quota:{}});await validateRun(run);
 for(const [name,mutate]of Object.entries(badMaterials).slice(0,11)){const changed=structuredClone(run),t=changed.bundle.templates.find(t=>t.id===template.id)!;mutate(changed.issued[0],t);const hash=await contentHash(changed.issued[0]);changed.session.entries[0].issuedContent.contentSha256=hash;changed.instances[0].question=structuredClone(changed.issued[0]);changed.instances[0].contentSha256=hash;assert.throws(()=>validateSourceFormat(changed.issued[0],t),{code:'SOURCE_MATERIAL'},name);await assert.rejects(validateRun(changed),{code:'SOURCE_MATERIAL'},name);}
 });
});

function attributeAt(q:Question,location:string):Attribution {
 if(location==='prompt')return q.prompt.attribution=structuredClone(q.prompt.attribution);
 if(location==='explanation')return q.explanation.attribution=structuredClone(q.explanation.attribution);
 if(location==='correctAnswer')return q.correctAnswer.attribution=structuredClone(q.correctAnswer.attribution);
 const [kind,index]=location.split('-'),i=Number(index);
 if(kind==='context')return q.contexts[i].content.attribution=structuredClone(q.contexts[i].content.attribution);
 if(kind==='choice')return q.choices[i].content.attribution=structuredClone(q.choices[i].content.attribution);
 const b=q.prompt.blocks[i];assert(b.type==='diagram');return b.attribution=structuredClone(b.attribution);
}
test('PM3 QS or ANS references in every foreign attribution activate the same bidirectional guard',async()=>{
 const {bundle}=await create();
 for(const [id,contexts]of [['question-template-source-2023-a-10',false],['question-template-source-2023-b-6',true]]as const){
  const base=bundle.questions.find(q=>q.id===id)!,t=bundle.templates.find(t=>t.baseQuestionRef.questionId===id)!;
  validateSourceFormat(base,t);
  const locations=contexts?base.contexts.map((_,i)=>'context-'+i):['prompt',...base.choices.map((_,i)=>'choice-'+i),'explanation','correctAnswer',...base.prompt.blocks.flatMap((b,i)=>b.type==='diagram'?['diagram-'+i]:[])];
  const run=await prepareRun(bundle,{subject:base.subject,kind:'bookmark',mode:'study',bindingMode:'generated_values',bookmarkQuestionRef:{questionId:base.id,revision:base.revision}},{},Date.now());await validateRun(run);
  for(const suffix of ['qs','ans'])for(const location of locations){
   const mutate=(q:Question)=>{attributeAt(q,location).sourceRefs=[{sourceId:'source-ipa-2017h29h-fe-pm-3-'+suffix,locator:{section:'PM3 guard negative',page:13}}]};
   const wrong=structuredClone(base);mutate(wrong);assert.throws(()=>bindAdditionalQuestion(wrong,t,t.referenceParameters.values,'instance-foreign-attribution','2026-10-23T10:00:00Z'),{code:'SOURCE_MATERIAL'},suffix+'/'+location);assert.throws(()=>validateSourceFormat(wrong,t),{code:'SOURCE_MATERIAL'});
   const changed=structuredClone(run),before=JSON.stringify(changed.bundle.templates),origin=JSON.stringify(changed.issued[0].origin);mutate(changed.issued[0]);assert.equal(JSON.stringify(changed.bundle.templates),before);assert.equal(JSON.stringify(changed.issued[0].origin),origin);const hash=await contentHash(changed.issued[0]);changed.instances[0].question=structuredClone(changed.issued[0]);changed.instances[0].contentSha256=hash;changed.session.entries[0].issuedContent.contentSha256=hash;
   assert.throws(()=>validateSourceFormat(changed.issued[0],t),{code:'SOURCE_MATERIAL'});await assert.rejects(validateRun(changed),{code:'SOURCE_MATERIAL'},suffix+'/'+location);
  }
 }
});
test('base and issued prompt/template/editor/own credits are exact; each mutation is detached from unrelated aliases',async()=>{
 await inject(async()=>{const {bundle,base,template,set,exam}=await create(),foreign=fixture().templates.find(t=>t.generatorRef.id==='generator-source-2023-a-10')!.attribution;
 const run=await prepareRun(bundle,{subject:'B',kind:'bookmark',mode:'study',bindingMode:'generated_values',bookmarkQuestionRef:{questionId:base.id,revision:1}},{},Date.now(),undefined,{questions:[base],set,exam,quota:{}});await validateRun(run);
 const cases:{name:string,mutate:(q:Question,t:Template)=>void,template:boolean}[]=[];
 for(const role of ['prompt','explanation','correctAnswer','template'])for(const field of ['sourceRefs','rightsRefs','origin','creatorIds'])cases.push({name:role+'/'+field,template:role==='template',mutate(q,t){const a=role==='template'?(t.attribution=structuredClone(t.attribution)):attributeAt(q,role);if(field==='sourceRefs')a.sourceRefs=structuredClone(foreign.sourceRefs);else if(field==='rightsRefs')a.rightsRefs=structuredClone(foreign.rightsRefs);else if(field==='creatorIds')a.creatorIds=['ipa'];else a.origin=a.origin==='original'?'adapted':'official';}});
 cases.push({name:'template/editor',template:true,mutate(q,t){t.editorIds=['ipa']}});
 for(const c of cases){const q=structuredClone(base),t=structuredClone(template);c.mutate(q,t);assert.throws(()=>bindAdditionalQuestion(q,t,[0],'instance-credit-negative','2026-10-23T10:00:00Z'),{code:'SOURCE_MATERIAL'},c.name);assert.throws(()=>validateSourceFormat(q,t),{code:'SOURCE_MATERIAL'},c.name);
 const changed=structuredClone(run),rt=changed.bundle.templates.find(t=>t.id===template.id)!,beforeTemplate=JSON.stringify(rt),beforeQuestion=JSON.stringify(changed.issued[0]);c.mutate(changed.issued[0],rt);if(c.template)assert.equal(JSON.stringify(changed.issued[0]),beforeQuestion);else assert.equal(JSON.stringify(rt),beforeTemplate);const hash=await contentHash(changed.issued[0]);changed.instances[0].question=structuredClone(changed.issued[0]);changed.instances[0].contentSha256=hash;changed.session.entries[0].issuedContent.contentSha256=hash;assert.throws(()=>validateSourceFormat(changed.issued[0],rt),{code:'SOURCE_MATERIAL'},c.name);await assert.rejects(validateRun(changed),{code:'SOURCE_MATERIAL'},c.name);
 }
 });
});
test('complete included carrier has real private pack hashes and readCatalog transport; corrupt hash and rehashed missing reference fail',async()=>{
 await inject(async()=>{const source=(await legacy2017Pm3Records({collection:metadata.collection,rendered:metadata})).bundle,old=JSON.stringify(source),{bundle,wire}=await legacy2017Pm3TestCarrier(source);
 const loaded=await readCatalog(async path=>{assert(wire[path],path);return new Uint8Array(wire[path])});assert.equal(loaded.catalog.id,'catalog-private-managed-pm3');assert.equal(loaded.catalogHash,await sha256(wire['catalog.json']));assert.equal(loaded.catalogHash,bundle.catalogHash);
 for(const kind of ['questions','sources','rights','assets','sets','exams','templates']as const)assert.deepEqual([...loaded[kind]].sort((a,b)=>a.id.localeCompare(b.id)),[...bundle[kind]].sort((a,b)=>a.id.localeCompare(b.id)));
 const path=bundle.catalog.files.sources[0].path;await assert.rejects(readCatalog(async p=>p===path?new Uint8Array([...wire[p],32]):new Uint8Array(wire[p])),{code:'FILE_HASH'});
 const bad=structuredClone(wire),catalog=JSON.parse(new TextDecoder().decode(bad['catalog.json'])),entry=catalog.files.sources.find((entry:{path:string})=>JSON.parse(new TextDecoder().decode(bad[entry.path])).some((r:{id:string})=>r.id==='source-ipa-2017h29h-fe-pm-3-qs'));assert(entry);const rows=JSON.parse(new TextDecoder().decode(bad[entry.path])).filter((r:{id:string})=>r.id!=='source-ipa-2017h29h-fe-pm-3-qs');bad[entry.path]=new TextEncoder().encode(JSON.stringify(rows)+'\n');entry.sha256=await sha256(bad[entry.path]);entry.recordCount=rows.length;bad['catalog.json']=new TextEncoder().encode(JSON.stringify(catalog)+'\n');await assert.rejects(readCatalog(async p=>new Uint8Array(bad[p])),{code:'REFERENCE'});assert.equal(JSON.stringify(source),old);
 });
});
