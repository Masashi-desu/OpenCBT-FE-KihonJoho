import assert from'node:assert/strict';import test from'node:test';
import type{Bundle,Question,Selection,Exam,SetRecord}from'../src/core/types';
import{prepareRun}from'../src/core/session';import{refOf}from'../src/core/types';import{contentHash}from'../src/core/hash';
import{fixture}from'./fixtures/legacy-afternoon-main-preservation';
/** Local factories remain excluded until the separately tested normal admission. */
async function localBooklet(){
 const b=fixture(),questions:Question[]=[];
 for(let n=1;n<=8;n++){
  const m=await import('../scripts/import-legacy-2017-pm'+n+'.ts');let result;
  if(n===6)result=await m.pm6Records();else if(n===7)result=await m.pm7Records();else{const metadata=await import('./fixtures/legacy-2017-pm'+n+(n===8?'-pages':'-original-metadata')+'.json'),rendered=metadata.default,collection=n===8?(await import('../scripts/source-evidence/ipa-pre-2023.json')).default.collections.find((c:{id:string})=>c.id==='2017h29h-fe-pm'):rendered.collection;result=await m['legacy2017Pm'+n+'Records']({collection,rendered});}
  const records=(result.bundle??result.records)as Pick<Bundle,'sources'|'rights'|'assets'|'questions'|'templates'>;questions.push(...records.questions);for(const k of['sources','rights','assets','questions','templates']as const)b[k].push(...records[k]as never[]);
  assert(records.questions.every(q=>q.choiceShuffleAllowed===false),'Q'+n+' original/base source-order policy');assert.equal(records.templates[0].originalContentSha256,await contentHash(records.questions[1]));
 }
 return{b,questions};
}
test('2017春PM1〜8は原/基準16問の本文記号・表順を固定し現行hashへ対応する',async()=>{const{b,questions}=await localBooklet();assert.equal(questions.length,16);const exam:Exam={schemaVersion:'3.0.0',id:'exam-pm-fixed-order-local',revision:1,title:'固定順局所検査',subject:'B',mode:'study',questionOrder:'set',choiceOrder:'shuffle',duplicatePolicy:'lineage_unique',shortagePolicy:'block'},set:SetRecord={schemaVersion:'3.0.0',id:'set-pm-fixed-order-local',revision:1,title:'固定順局所検査',subject:'B',distribution:'included',questionRefs:questions.map(refOf),examConfigRefs:[{id:exam.id,revision:1}],generationBindings:[]},selection:Selection={kind:'annual',subject:'B',year:2017,mode:'study',bindingMode:'original_data'};const run=await prepareRun(b,selection,{},Date.UTC(2026,9,26),undefined,{questions,exam,set,quota:{}});assert.equal(run.instances.length,0);run.session.entries.forEach((e,i)=>assert.deepEqual(e.choiceOrder,questions[i].choices.map(c=>c.id)));assert(questions.every(q=>q.distribution==='excluded'),'this test does not grant normal admission');});
