import test from 'node:test';import assert from 'node:assert/strict';
import{legacy2017Pm12Records,bindLegacy2017Pm12Body}from'../scripts/import-legacy-2017-pm12';
import{legacy2017Pm12Definition as d}from'../src/core/generators/legacy-2017-pm12';
import{legacy2017Pm12MaterialAssetIds as materialIds}from'../src/core/generators/legacy-2017-pm12-data';
import{gradeAnswer,answerLabels,validateEntryAnswers,compoundAnswerSignature}from'../src/core/answers';
import materialPins from './fixtures/legacy-2017-pm12-materials.json';
const collection={id:'2017h29h-fe-pm',questionPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf',sha256:'7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8',byteLength:13923067},answerPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_ans.pdf',sha256:'7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b',byteLength:202195}};
const input=()=>({collection:structuredClone(collection),rendered:{papers:Object.fromEntries(Object.entries(collection).filter(([k])=>k!=='id').map(([k,v])=>{assert(typeof v!=='string');return[k,{sha256:v.sha256,byteLength:v.byteLength}];})),pages:[...[58,59,60,61,62].map(page=>({page,name:`page-${page}.webp`,width:1432,height:2026,byteLength:100,sha256:'1'.repeat(64)})),...structuredClone(materialPins.materials)]}});
test('PM12原/基準/生成の実schema・全6欄JSON採点・独立用権利・付属6assetを検証',async()=>{
 const {bundle,validation}=await legacy2017Pm12Records(input());assert(validation.questions.every(q=>q.status==='pass'&&q.pendingPaths.length===0));assert.equal(bundle.sources.length,2);assert.equal(bundle.rights.length,2);assert.equal(bundle.assets.length,11);assert.equal(bundle.templates.length,1);
 assert.equal(bundle.questions[0].assetRefs.length,11);assert.deepEqual(bundle.questions[1].assetRefs,materialIds);
 for(const rights of bundle.rights)assert.deepEqual(rights.uses,{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'});
 const qs=[bundle.questions[0],...Array.from({length:8},(_,v)=>bindLegacy2017Pm12Body(bundle.questions[1],d.build([v])))];
 for(const raw of qs){const q=JSON.parse(JSON.stringify(raw));assert.equal(q.choiceShuffleAllowed,false);const choices=Object.fromEntries(q.correctAnswer.parts.map((a:{partId:string;choiceId:string})=>[a.partId,a.choiceId]));assert.equal(gradeAnswer(q,{selectedPartChoices:choices}).outcome,'correct');
  for(const part of q.answerParts){for(const id of part.choiceIds){const selectedPartChoices={...choices,[part.id]:id};assert.doesNotThrow(()=>validateEntryAnswers(q,{selectedPartChoices}));assert.equal(gradeAnswer(q,{selectedPartChoices}).parts!.find(p=>p.partId===part.id)!.outcome,id===choices[part.id]?'correct':'incorrect');}const partial={...choices};delete partial[part.id];assert.equal(gradeAnswer(q,{selectedPartChoices:partial}).outcome,'unanswered');}
  assert.deepEqual(q.contexts[0].content.attribution.rightsRefs,['rights-ipa-2017h29h-fe-pm-12-casl-instructions']);
  assert.deepEqual(q.contexts[0].content.blocks.filter((b:{type:string})=>b.type==='image').map((b:{assetId:string})=>b.assetId),materialIds);
 }
 assert.equal(answerLabels(bundle.questions[0]),'設問1 a：オ、設問1 b：ウ、設問1 c：イ、設問2 d：エ、設問3 e：ア、設問3 f：オ');
 assert.equal(new Set(qs.slice(1).map(compoundAnswerSignature)).size,8);
});
test('PM12の承認済抜粋はraw JPEG由来の固定寸法/hashを要求し、全p74代入・資料欠落を拒否',async()=>{
 const p74=materialPins.materials.find(p=>p.page===74)!;assert.deepEqual([p74.width,p74.height],[1432,1240]);assert.equal(p74.sha256,'6ed2179c9f0ee9b5a8ed0253df7923b5c5949a6b5a9e867b81b4a7236d73c49a');
 for(const mutate of [(x:ReturnType<typeof input>)=>{x.rendered.pages.find(p=>p.page===74)!.height=2026;},(x:ReturnType<typeof input>)=>{x.rendered.pages.find(p=>p.page===74)!.sha256='2'.repeat(64);},(x:ReturnType<typeof input>)=>{x.rendered.pages.pop();},(x:ReturnType<typeof input>)=>{x.collection.questionPaper.sha256='3'.repeat(64);}]){const bad=input();mutate(bad);await assert.rejects(()=>legacy2017Pm12Records(bad));}
 const {bundle}=await legacy2017Pm12Records(input());assert(bundle.assets.every(a=>a.mediaType==='image/webp'&&!a.path.endsWith('.pdf')));assert(bundle.assets.find(a=>a.id.endsWith('p74-instructions'))!.attribution.rightsRefs.includes('rights-ipa-2017h29h-fe-pm-12-casl-instructions'));
 assert(!bundle.assets.some(a=>a.id==='asset-ipa-2017h29h-fe-pm-12-p74'));
 assert.deepEqual(materialPins.extraction.cropRectangle,[0,0,1432,1240]);assert.equal(materialPins.extraction.p74OriginalEmbeddedSha256,'6f4c74f72c34277c9af9ba77efba08b6552fea734e409b1f41965a0f7e61f6f6');
});
