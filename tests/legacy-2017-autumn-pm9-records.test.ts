import test from 'node:test';import assert from 'node:assert/strict';
import metadata from './fixtures/legacy-2017-autumn-pm9-original-metadata.json';
import {legacy2017AutumnPm9Records as records,bindLegacy2017AutumnPm9Body as bind,inspectLegacy2017AutumnPm9Prepared as inspect} from '../scripts/import-legacy-2017-autumn-pm9';
import {legacy2017AutumnPm9Definition as d} from '../src/core/generators/legacy-2017-autumn-pm9';
import {gradeAnswer,answerLabels} from '../src/core/answers';
import {contentHash} from '../src/core/hash';
test('秋PM9 原7raw素材/基準/全4生成は37択7欄の出典・権利とJSON採点を保持する',async()=>{
  const {bundle,validation}=await records(structuredClone(metadata));assert.equal(bundle.assets.length,7);assert.equal(bundle.sources.length,2);assert.equal(bundle.rights.length,1);assert.equal(bundle.templates.length,1);
  assert.deepEqual(bundle.assets.map(a=>[a.sha256,a.width,a.height,a.byteLength]),metadata.rendered.pages.map(p=>[p.sha256,p.width,p.height,p.byteLength]));assert(metadata.rendered.rawImageExtraction.every(p=>p.losslessWebpPixelsExact));
  assert.equal(bundle.templates[0].originalContentSha256,await contentHash(bundle.questions[1]));assert.equal(validation.ordinaryAppRegistered,false);assert.equal(validation.finalBookletAdmission,false);
  assert.equal(validation.questions[0].schema,'pass');assert.equal(validation.questions[1].schema,'not_submitted_pending_shared_profile_admission');
  const qs=[bundle.questions[0],...Array.from({length:4},(_,v)=>bind(bundle.questions[1],d.build([v])))];
  for(const raw of qs){const q=JSON.parse(JSON.stringify(raw));assert.equal(q.choiceShuffleAllowed,false);const right=Object.fromEntries(q.correctAnswer.parts.map((a:{partId:string;choiceId:string})=>[a.partId,a.choiceId]));assert.equal(gradeAnswer(q,{selectedPartChoices:right}).outcome,'correct');
    for(const p of q.answerParts){for(const id of p.choiceIds){const r=gradeAnswer(q,{selectedPartChoices:{...right,[p.id]:id}});assert.equal(r.parts!.find(x=>x.partId===p.id)!.outcome,id===right[p.id]?'correct':'incorrect');}}
    for(let mask=0;mask<128;mask++){const part=Object.fromEntries(Object.entries(right).filter((_,i)=>mask&(1<<i)));assert.equal(gradeAnswer(q,{selectedPartChoices:part}).outcome,mask===127?'correct':'unanswered');}
    assert.equal(inspect(q).kind,q.origin.kind==='official_reprint'?'original':'prepared_base_or_generated');
    assert(q.origin.sourceRefs.every((r:{sourceId:string;locator:{period:string}})=>r.sourceId.includes('2017h29a')&&r.locator.period==='秋期'));
  }
  assert.equal(answerLabels(bundle.questions[0]),'設問1 a：オ、設問1 b：カ、設問1 c：ウ、設問2 d：オ、設問2 e：エ、設問3 f：オ、設問3 g：イ');
});
test('秋PM9 原本差替・raw証跡欠落・頁欠落・有効profile複製による図欠落を拒否する',async()=>{
  for(const mutation of [(x:typeof metadata)=>{x.collection.questionPaper.sha256='0'.repeat(64);},(x:typeof metadata)=>{x.rendered.pages.pop();},(x:typeof metadata)=>{x.rendered.rawImageExtraction[0].losslessWebpPixelsExact=false;}]){const bad=structuredClone(metadata);mutation(bad);await assert.rejects(()=>records(bad));}
  const {bundle}=await records(structuredClone(metadata)),bad=structuredClone(bundle.questions[1]);const indexes=bad.prompt.blocks.flatMap((b,i)=>b.type==='diagram'?[i]:[]);bad.prompt.blocks[indexes[1]]=structuredClone(bad.prompt.blocks[indexes[0]]);assert.throws(()=>inspect(bad));
});
