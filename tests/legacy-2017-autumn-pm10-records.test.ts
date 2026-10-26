import test from 'node:test';import assert from 'node:assert/strict';import metadata from './fixtures/legacy-2017-autumn-pm10-original-metadata.json';
import {legacy2017AutumnPm10Records as records,bindLegacy2017AutumnPm10Body as bind,inspectLegacy2017AutumnPm10Prepared as inspect} from '../scripts/import-legacy-2017-autumn-pm10';
import {legacy2017AutumnPm10Definition as d} from '../src/core/generators/legacy-2017-autumn-pm10';import {gradeAnswer,answerLabels} from '../src/core/answers';import {contentHash} from '../src/core/hash';
test('秋PM10 原5raw素材/基準/全6生成は共通e/f群・権利・全7欄JSON採点を保持する',async()=>{
 const {bundle,validation}=await records(structuredClone(metadata));assert.equal(bundle.assets.length,5);assert.equal(bundle.templates.length,1);assert.deepEqual(bundle.assets.map(a=>[a.sha256,a.width,a.height,a.byteLength]),metadata.rendered.pages.map(p=>[p.sha256,p.width,p.height,p.byteLength]));assert(metadata.rendered.rawImageExtraction.every(p=>p.losslessWebpPixelsExact));assert.equal(bundle.templates[0].originalContentSha256,await contentHash(bundle.questions[1]));assert.equal(validation.ordinaryAppRegistered,false);assert.equal(validation.finalBookletAdmission,false);
 for(const raw of[bundle.questions[0],...Array.from({length:6},(_,v)=>bind(bundle.questions[1],d.build([v])))] ){
  const q=JSON.parse(JSON.stringify(raw));assert.equal(q.choiceShuffleAllowed,false);assert.equal(q.choices.length,25);assert.deepEqual(q.answerParts[5].choiceIds,q.answerParts[6].choiceIds);const right=Object.fromEntries(q.correctAnswer.parts.map((a:{partId:string;choiceId:string})=>[a.partId,a.choiceId]));assert.equal(gradeAnswer(q,{selectedPartChoices:right}).outcome,'correct');
  for(const p of q.answerParts)for(const id of p.choiceIds)assert.equal(gradeAnswer(q,{selectedPartChoices:{...right,[p.id]:id}}).parts!.find(x=>x.partId===p.id)!.outcome,id===right[p.id]?'correct':'incorrect');
  for(let mask=0;mask<128;mask++)assert.equal(gradeAnswer(q,{selectedPartChoices:Object.fromEntries(Object.entries(right).filter((_,i)=>mask&(1<<i)))}).outcome,mask===127?'correct':'unanswered');
  inspect(q);assert(q.origin.sourceRefs.every((r:{locator:{questionNumber:string;period:string}})=>r.locator.questionNumber==='10'&&r.locator.period==='秋期'));
 }
 assert.equal(answerLabels(bundle.questions[0]),'設問1：ア、設問2 a：イ、設問2 b：ウ、設問2 c：ア、設問3 d：ア、設問3 e：イ、設問3 f：カ');
});
test('秋PM10 原本差替・raw証跡不一致・頁欠落・図の重複置換を拒否する',async()=>{
 for(const mutation of[(x:typeof metadata)=>{x.collection.answerPaper.sha256='0'.repeat(64);},(x:typeof metadata)=>{x.rendered.pages.pop();},(x:typeof metadata)=>{x.rendered.rawImageExtraction[0].losslessWebpPixelsExact=false;}]){const x=structuredClone(metadata);mutation(x);await assert.rejects(()=>records(x));}
 const {bundle}=await records(structuredClone(metadata)),q=structuredClone(bundle.questions[1]);const ix=q.prompt.blocks.flatMap((b,i)=>b.type==='diagram'?[i]:[]);q.prompt.blocks[ix[1]]=structuredClone(q.prompt.blocks[ix[0]]);assert.throws(()=>inspect(q));
});
