import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDistributionBundle, encodeRecordPacks } from '../scripts/distribution-files';
import { stage3CollectionFiles } from '../scripts/stage3-collection-transport';
import { makeStage3MorningRecords, spring2016SourceRef } from '../scripts/stage3-morning-records';
import { stage3MorningDefinitions } from '../src/core/generators/stage3-morning-install';
import { readCatalog } from '../src/core/catalog-reader';
import { catalogKinds } from '../src/core/catalog-files';
import { contentHash } from '../src/core/hash';
import sourceFacts from './fixtures/legacy-2016-spring-fundamentals-source-facts.json';
import type { Asset, Source, Rights } from '../src/core/types';
import references from './fixtures/legacy-2016-spring-am-release-references.json';

// Deliberately synthetic material metadata for the transport unit tests.
// These bytes are never used as source/material/release acceptance.
async function candidate() {
  const facts=sourceFacts.crops.map((c,i)=>({source:'2016h28h-fe-am-'+(i+1),number:i+1,page:c.pdfPage,officialKey:sourceFacts.officialKeys[i],alt:sourceFacts.fullalts[i].literal,
    crop:{path:'synthetic-unit-only.png',sha256:c.sha256,width:1030,height:200,byteLength:100,cropBox:[0,0,1030,200]}}));
  const assets=[2,3].map(n=>({schemaVersion:'3.0.0',id:'asset-synthetic-common-'+n,path:'assets/synthetic-common-'+n+'.png',mediaType:'image/png',sha256:'0'.repeat(64),width:32,height:32,byteLength:100,alt:'Synthetic common material for unit transport only.',
    attribution:{origin:'official',sourceRefs:[spring2016SourceRef(undefined,n)],rightsRefs:['rights-ipa-2016h28h-fe-am'],creatorIds:['ipa']}} as Asset));
  return makeStage3MorningRecords({facts,definitions:stage3MorningDefinitions,commonAssets:assets,sources:structuredClone(references.sources) as Source[],rights:structuredClone(references.rights) as Rights[],checkedOn:'2026-11-01'});
}

// Reconstruct the pre-collection transport fixture from current records without
// retaining a historical question payload. This is not an admission entrance;
// the independent integration tests use the complete actual published bundle.
function transportBaseline(){
  const b=readDistributionBundle(),files=new Map<string,Uint8Array>();
  const target=(id:string)=>id.includes('2016h28h-fe-am');
  for(const k of catalogKinds)(b[k] as {id:string}[])=(b[k] as {id:string}[]).filter(row=>!target(row.id));
  const mix=b.sets.find(s=>s.id==='set-mix-a')!;
  mix.questionRefs=mix.questionRefs.filter(r=>!target(r.questionId));mix.generationBindings=mix.generationBindings.filter(r=>!target(r.templateRef.id));
  for(const k of catalogKinds){const packs=encodeRecordPacks(k,b[k]);b.catalog.files[k]=packs.map(p=>p.entry);for(const p of packs)files.set(p.entry.path,p.bytes);}
  const read=(p:string)=>{const bytes=files.get(p);assert(bytes,p);return bytes;};
  return {baseline:b,read};
}

test('stage3 candidate retains source keys, original/base identities, common pages and native generator references',async()=>{
  const c=await candidate();assert.equal(c.questions.length,16);assert.equal(c.templates.length,8);assert.equal(c.assets.length,10);
  for(let i=0;i<8;i++){
    const q=c.questions[i*2],base=c.questions[i*2+1],t=c.templates[i];
    assert.equal(q.correctAnswer.choiceId,'choice-original-'+('アイウエ'.indexOf(sourceFacts.officialKeys[i])+1));
    assert.deepEqual(q.contexts.map(x=>x.content.attribution.sourceRefs[0].locator.page),[2,3]);
    assert(base.contexts.length>=2);assert.equal(t.originalContentSha256,await contentHash(base));
    assert.equal(q.distribution,'excluded');assert.equal(base.distribution,'excluded');assert.equal(t.distribution,'excluded');
    assert.deepEqual(t.baseQuestionRef,{questionId:base.id,revision:1});
  }
});

test('stage3 transport preserves all unrelated records and pack bytes and hashes the admitted base after its state changes',async()=>{
  const {baseline,read}=transportBaseline(),c=await candidate();
  const before=await contentHash({baseline,c});
  const result=stage3CollectionFiles(baseline,c,read);
  const decoded=await readCatalog(async(name,max)=>{const bytes=result.files.get(name);assert(bytes && bytes.length<=max);return bytes;});
  assert.equal(decoded.templates.length,baseline.templates.length+8);
  for(const kind of catalogKinds) for(const old of baseline[kind])assert.deepEqual(decoded[kind].find(r=>r.id===old.id),kind==='sets' && old.id==='set-mix-a'?result.nextMix:old);
  for(const t of result.added.templates){const base=decoded.questions.find(q=>q.id===t.baseQuestionRef.questionId)!;assert.equal(base.distribution,'included');assert.equal(t.originalContentSha256,await contentHash(base));}
  for(const p of result.preserved)assert.deepEqual(result.files.get(p),read(p));
  assert.equal(await contentHash({baseline,c}),before,'transport never mutates reviewed inputs');
  assert.equal(result.removed.length,1,'only the containing mix pack is superseded');
});

test('stage3 transport rejects missing/duplicate/foreign identities, swapped generators, wrong counts and unused materials',async()=>{
  const {baseline,read}=transportBaseline(),c=await candidate();
  const mutations=[
    (v:typeof c)=>{v.questions.pop();},
    (v:typeof c)=>{v.templates[1].id=v.templates[0].id;},
    (v:typeof c)=>{v.templates[0].generatorRef.id='generator-source-2016h28h-fe-am-60';},
    (v:typeof c)=>{v.questions[0].id='question-ipa-2016h28h-fe-am-60';},
    (v:typeof c)=>{v.exams[1].questionCount=80;},
    (v:typeof c)=>{v.exams[1].timeLimitSeconds=5400;},
    (v:typeof c)=>{v.assets.push({...v.assets[0],id:'unreviewed-extra'});},
    (v:typeof c)=>{v.questions[0].review.checks.terms='pending';},
    (v:typeof c)=>{v.assets[2].path=baseline.assets[0].path;},
    (v:typeof c)=>{v.assets[3].path=v.assets[2].path;},
    (v:typeof c)=>{v.assets[2].path='assets/../catalog.json';},
  ];
  for(const mutate of mutations){const bad=structuredClone(c);mutate(bad);assert.throws(()=>stage3CollectionFiles(baseline,bad,read));}
});
