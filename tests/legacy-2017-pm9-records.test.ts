import test from 'node:test';import assert from 'node:assert/strict';
import{legacy2017Pm9Records,bindLegacy2017Pm9Body}from'../scripts/import-legacy-2017-pm9';
import{legacy2017Pm9Definition as d}from'../src/core/generators/legacy-2017-pm9';
import{gradeAnswer,answerLabels,validateEntryAnswers,compoundAnswerSignature}from'../src/core/answers';
const collection={id:'2017h29h-fe-pm',questionPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf',sha256:'7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8',byteLength:13923067},answerPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_ans.pdf',sha256:'7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b',byteLength:202195}};
const input=()=>({collection:structuredClone(collection),rendered:{papers:Object.fromEntries(Object.entries(collection).filter(([k])=>k!=='id').map(([k,v])=>{assert(typeof v!=='string');return[k,{sha256:v.sha256,byteLength:v.byteLength}];})),pages:[41,42,43,44,45,46].map(page=>({page,name:`page-${page}.webp`,width:1432,height:2026,byteLength:100,sha256:'1'.repeat(64)}))}});
test('PM9原/基準/生成は出典・用途別権利・全6素材・false方針を保持し、全7欄をJSON後も採点する',async()=>{
 const {bundle,validation}=await legacy2017Pm9Records(input());assert.equal(validation.allAnswerGroupsInPrompt,true);assert(validation.questions.every(q=>q.status==='pass'&&q.pendingPaths.length===0));assert.equal(bundle.sources.length,2);assert.equal(bundle.rights.length,1);assert.equal(bundle.assets.length,6);assert.equal(bundle.templates.length,1);
 assert.deepEqual(bundle.rights[0].uses,{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'});
 const qs=[bundle.questions[0],...Array.from({length:8},(_,v)=>bindLegacy2017Pm9Body(bundle.questions[1],d.build([v])))];
 for(const raw of qs){const q=JSON.parse(JSON.stringify(raw));assert.equal(q.choiceShuffleAllowed,false);const choices=Object.fromEntries(q.correctAnswer.parts.map((a:{partId:string;choiceId:string})=>[a.partId,a.choiceId]));assert.equal(gradeAnswer(q,{selectedPartChoices:choices}).outcome,'correct');
 for(const part of q.answerParts){for(const id of part.choiceIds){const selectedPartChoices={...choices,[part.id]:id};assert.doesNotThrow(()=>validateEntryAnswers(q,{selectedPartChoices}));const result=gradeAnswer(q,{selectedPartChoices});assert.equal(result.parts!.find(p=>p.partId===part.id)!.outcome,id===choices[part.id]?'correct':'incorrect');}const partial={...choices};delete partial[part.id];assert.equal(gradeAnswer(q,{selectedPartChoices:partial}).outcome,'unanswered');}
 }
 assert.equal(answerLabels(bundle.questions[0]),'設問1 a：カ、設問1 b：キ、設問1 c：エ、設問2 d：イ、設問2 e：イ、設問3 f：ア、設問3 g：イ');
 assert.equal(new Set(qs.slice(1).map(compoundAnswerSignature)).size,8);
 for(const q of qs.slice(1))for(const b of q.prompt.blocks)if(b.type==='diagram')assert.deepEqual(b.attribution.rightsRefs,['rights-ipa-2017h29h-fe-pm-9','rights-original']);
});
test('PM9の異なる原本hashや欠落頁を正式候補に流さない',async()=>{const bad=input();bad.collection.questionPaper.sha256='2'.repeat(64);await assert.rejects(()=>legacy2017Pm9Records(bad));const missing=input();missing.rendered.pages.pop();await assert.rejects(()=>legacy2017Pm9Records(missing));});
