import test from 'node:test';import assert from 'node:assert/strict';import metadata from './fixtures/legacy-2017-pm10-original-metadata.json';
import{legacy2017Pm10Records,bindLegacy2017Pm10Body,assessLegacy2017Pm10Schema}from'../scripts/import-legacy-2017-pm10';
import{legacy2017Pm10Definition as d}from'../src/core/generators/legacy-2017-pm10';
import{gradeAnswer,answerLabels,validateEntryAnswers,compoundAnswerSignature}from'../src/core/answers';
const collection={id:'2017h29h-fe-pm',questionPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf',sha256:'7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8',byteLength:13923067},answerPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_ans.pdf',sha256:'7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b',byteLength:202195}};
const input=()=>({collection:structuredClone(collection),rendered:structuredClone(metadata)});
test('PM10原/基準/生成は出典・用途別権利・全5素材・false方針を保持し、全7欄をJSON後も採点する',async()=>{
 const {bundle,validation}=await legacy2017Pm10Records(input());assert.equal(validation.allAnswerGroupsInPrompt,true);assert.equal(bundle.sources.length,2);assert.equal(bundle.rights.length,1);assert.equal(bundle.assets.length,5);assert.deepEqual(bundle.assets.map(a=>[a.sha256,a.width,a.height,a.byteLength]),metadata.pages.map(p=>[p.sha256,p.width,p.height,p.byteLength]));assert(metadata.pixelProof.every(p=>p.webpPixelsExact));assert.equal(bundle.templates.length,1);
 assert.deepEqual(bundle.rights[0].uses,{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'});
 const qs=[bundle.questions[0],...Array.from({length:3},(_,v)=>bindLegacy2017Pm10Body(bundle.questions[1],d.build([v])))];
 for(const raw of qs){const q=JSON.parse(JSON.stringify(raw));assert.equal(q.choiceShuffleAllowed,false);const choices=Object.fromEntries(q.correctAnswer.parts.map((a:{partId:string;choiceId:string})=>[a.partId,a.choiceId]));assert.equal(gradeAnswer(q,{selectedPartChoices:choices}).outcome,'correct');
 for(const part of q.answerParts){for(const id of part.choiceIds){const selectedPartChoices={...choices,[part.id]:id};assert.doesNotThrow(()=>validateEntryAnswers(q,{selectedPartChoices}));const result=gradeAnswer(q,{selectedPartChoices});assert.equal(result.parts!.find(p=>p.partId===part.id)!.outcome,id===choices[part.id]?'correct':'incorrect');}const partial={...choices};delete partial[part.id];assert.equal(gradeAnswer(q,{selectedPartChoices:partial}).outcome,'unanswered');}
  for(let mask=0;mask<128;mask++){const selectedPartChoices=Object.fromEntries(Object.entries(choices).filter((_,i)=>mask&(1<<i)));assert.equal(gradeAnswer(q,{selectedPartChoices}).outcome,mask===127?'correct':'unanswered');}
 }
 assert.equal(answerLabels(bundle.questions[0]),'設問1 a：ウ、設問1 b：イ、設問1 c：エ、設問1 d：ア、設問2 e：エ、設問2 f：エ、設問2 g：ア');
 assert.equal(new Set(qs.slice(1).map(compoundAnswerSignature)).size,3);
 for(const q of qs.slice(1))for(const b of q.prompt.blocks)if(b.type==='diagram')assert.deepEqual(b.attribution.rightsRefs,['rights-ipa-2017h29h-fe-pm-10','rights-original']);
});
test('PM10の異なる原本hashや欠落頁を正式候補に流さない',async()=>{const bad=input();bad.collection.questionPaper.sha256='2'.repeat(64);await assert.rejects(()=>legacy2017Pm10Records(bad));const missing=input();missing.rendered.pages.pop();await assert.rejects(()=>legacy2017Pm10Records(missing));});

test('PM10は有効profileの複製による別図の欠落も拒否する',async()=>{const {bundle}=await legacy2017Pm10Records(input());const q=structuredClone(bundle.questions[1]);const ix=q.prompt.blocks.flatMap((b,i)=>b.type==='diagram'?[i]:[]);q.prompt.blocks[ix[1]]=structuredClone(q.prompt.blocks[ix[0]]);assert.throws(()=>assessLegacy2017Pm10Schema(q));});
