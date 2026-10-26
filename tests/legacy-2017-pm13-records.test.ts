import test from'node:test';import assert from'node:assert/strict';
import{legacy2017Pm13Records,bindLegacy2017Pm13Body,assessLegacy2017Pm13Schema}from'../scripts/import-legacy-2017-pm13';
import{legacy2017Pm13Definition as d}from'../src/core/generators/legacy-2017-pm13';
import{legacy2017Pm13MaterialAssetIds as materialIds}from'../src/core/generators/legacy-2017-pm13-data';
import{gradeAnswer,answerLabels,validateEntryAnswers,compoundAnswerSignature}from'../src/core/answers';
import{contentHash}from'../src/core/hash';
import original from'./fixtures/legacy-2017-pm13-original-metadata.json';
import{bindQuestion}from'../src/core/generation';
import{refOf}from'../src/core/types';
test('PM13の実raw metadataで原/基準/固定8資料・全6欄のJSON後採点・固定正答の8本文を検証',async()=>{
 const {bundle,validation}=await legacy2017Pm13Records(structuredClone(original));assert(validation.questions.every(q=>q.status==='pass'));assert.equal(bundle.sources.length,2);assert.equal(bundle.rights.length,3);assert.equal(bundle.assets.length,17);assert.equal(bundle.templates.length,1);
 assert.equal(bundle.questions[0].assetRefs.length,17);assert.deepEqual(bundle.questions[1].assetRefs,materialIds);for(const right of bundle.rights)assert.deepEqual(right.uses,{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'});
 for(const source of bundle.sources){assert(source.title.includes('問13'));const facts=source.facts;assert(Array.isArray(facts));assert(facts.some((s:unknown)=>typeof s==='string'&&s.includes('問9〜13から1問')));assert(!facts.some((s:unknown)=>typeof s==='string'&&s.includes('問13〜13')));}
 const questions=[bundle.questions[0],...Array.from({length:8},(_,v)=>bindLegacy2017Pm13Body(bundle.questions[1],d.build([v])))];
 for(const raw of questions){const q=JSON.parse(JSON.stringify(raw));assert.equal(q.choiceShuffleAllowed,false);const correct=Object.fromEntries(q.correctAnswer.parts.map((a:{partId:string;choiceId:string})=>[a.partId,a.choiceId]));assert.equal(gradeAnswer(q,{selectedPartChoices:correct}).outcome,'correct');
  for(const part of q.answerParts){for(const id of part.choiceIds){const selectedPartChoices={...correct,[part.id]:id};assert.doesNotThrow(()=>validateEntryAnswers(q,{selectedPartChoices}));const result=gradeAnswer(q,{selectedPartChoices});assert.equal(result.parts!.find(p=>p.partId===part.id)!.outcome,id===correct[part.id]?'correct':'incorrect');assert(result.parts!.filter(p=>p.partId!==part.id).every(p=>p.outcome==='correct'));}const missing={...correct};delete missing[part.id];assert.equal(gradeAnswer(q,{selectedPartChoices:missing}).outcome,'unanswered');}
  assert(q.contexts[0].content.attribution.rightsRefs.includes('rights-ipa-2017h29h-fe-pm-13-spreadsheet-instructions'));
  assert.equal(q.contexts.length,2);assert(q.contexts[1].content.attribution.rightsRefs.includes('rights-ipa-2017h29h-fe-pm-13-common-notation'));assert.deepEqual(q.contexts.flatMap((c:{content:{blocks:{type:string;assetId?:string}[]}})=>c.content.blocks.filter(b=>b.type==='image').map(b=>b.assetId)),materialIds);
 }
 assert.equal(answerLabels(bundle.questions[0]),'設問1 a：イ、設問2 b：ア、設問2 c：ウ、設問2 d：ウ、設問3 e：イ、設問3 f：エ');
 assert.equal(new Set(questions.slice(1).map(compoundAnswerSignature)).size,1);assert.equal(new Set(await Promise.all(questions.slice(1).map(contentHash))).size,8);
});
test('PM13の通常binderは全8条件でsource-local組立と同じ本文/全群/固定資料/採点を保持',async()=>{
 const {bundle}=await legacy2017Pm13Records(structuredClone(original)),base=bundle.questions[1],template=bundle.templates[0];
 for(let v=0;v<8;v++){
  const q=bindQuestion(base,template,[v],`pm13-binding-${v}`,'2026-10-26T00:00:00Z'),local=bindLegacy2017Pm13Body(base,d.build([v]));assert.deepEqual(q.prompt.blocks.map(b=>b.type==='diagram'?{...b,id:'normalized'}:b),local.prompt.blocks.map(b=>b.type==='diagram'?{...b,id:'normalized'}:b));
  assert.deepEqual(q.choices,local.choices);assert.deepEqual(q.assetRefs,materialIds);assert.deepEqual(q.correctAnswer.parts,local.correctAnswer.parts);assert.deepEqual(q.contexts.map(c=>c.content),local.contexts.map(c=>c.content));assert.deepEqual(q.origin.derivedFrom,[refOf(base)]);
 }
});
test('PM13の原本/頁数/付属版/寸法/hashを変更した合成metadataを拒否し、全PDFをassetへ入れない',async()=>{
 for(const change of [(x:typeof original)=>{x.collection.questionPaper.sha256='2'.repeat(64);},(x:typeof original)=>{x.rendered.pages.pop();},(x:typeof original)=>{x.rendered.pages[0].sha256='3'.repeat(64);},(x:typeof original)=>{x.rendered.pages[9].height=1;},(x:typeof original)=>{x.rendered.pages[10].page=74;}]){const bad=structuredClone(original);change(bad);await assert.rejects(()=>legacy2017Pm13Records(bad));}
 const {bundle}=await legacy2017Pm13Records(structuredClone(original));assert(bundle.assets.every(a=>a.mediaType==='image/webp'&&a.path.endsWith('.webp')));assert(!bundle.assets.some(a=>a.id.endsWith('p74')));assert(original.rendered.rawImageExtraction.every(r=>r.losslessWebpPixelsExact));assert.equal(original.rendered.rawImageExtraction.length,17);
 const noCommon=structuredClone(original);noCommon.rendered.pages=noCommon.rendered.pages.filter(p=>p.page>4);await assert.rejects(()=>legacy2017Pm13Records(noCommon));
 const missing=structuredClone(bundle.questions[1]);missing.contexts.pop();missing.contextRefs.pop();missing.assetRefs=missing.assetRefs.filter(id=>!id.endsWith('-p3')&&!id.endsWith('-p4'));assert.throws(()=>assessLegacy2017Pm13Schema(missing));
});
