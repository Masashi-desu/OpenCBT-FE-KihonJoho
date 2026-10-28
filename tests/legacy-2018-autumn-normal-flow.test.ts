import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { readDistributionBundle } from "../scripts/distribution-files";
import type { Bundle, Question, Ref, Run, Selection } from "../src/core/types";
import { refOf } from "../src/core/types";
import { selectQuestions } from "../src/core/selection";
import { prepareRun, startRun, updatePartAnswer, finishRun, resultFor, remaining, validateRun } from "../src/core/session";
import { gradeAnswer, hasCompleteAnswer } from "../src/core/answers";
import { prepareSnapshot } from "../src/core/storage-snapshot";
import { contentHash, sha256 } from "../src/core/hash";

// Source-reviewed QS1/3, ANS1 and per-major field/blank inventories. These
// expected keys and counts are independent of the runtime correctAnswer.
const collection = "set-annual-2018-autumn-pm", sid = "2018h30a-fe-pm";
const fieldCounts = [5,4,4,5,5,7,5,7,6,6,6,6,7];
const definitionCounts = [5,4,4,3,5,6,4,7,6,6,6,6,7];
const sourceMarks: (string | null)[][] = [
  [..."ウエアエイ"], [..."オイイキ"], [..."アエアウ"], [..."イオウアカ"], [..."アアオイア"],
  [..."ウエオエウクオ"], [..."アイウイエ"], [..."イエエアエイエ"], [..."カウアオイア"],
  [..."ウエイエエア"], [..."ウウオウエオ"], [..."イカイカエウ"], [null,..."オイイエエウ"],
];
const sourcePartIds = [
  ["sub1","a","b","c","sub3"], ["sub1","a","b","c"], ["sub1","a","b","sub4"],
  [..."abcde"], [..."abcde"], [..."abcdefg"], ["1","2a","2b","a","b"], [..."abcdefg"],
  [..."abcdef"], [..."abcdef"], [..."abcdef"], [..."abcdef"], [..."abcdefg"],
].map(row=>row.map(id=>"part-"+id));
const alphabet = "アイウエオカキクケコサシスセソタチツテト";
const now = Date.UTC(2026,9,28,0,0,0);
const bundle = readDistributionBundle();
const originalId = (n: number) => `question-ipa-${sid}-${n}`;
const major = (q: Question) => Number(q.origin.sourceRefs[0].locator.questionNumber);
const refsFor = (ns: number[]): Ref[] => ns.map(n => {
  const q=bundle.questions.find(q=>q.id===originalId(n)); assert(q); return refOf(q);
});
function selection(kind: "annual"|"mix", mode: "study"|"practice", chosen?: number[]): Selection {
  return {subject:"B",kind,mode,size:"public",year:2018,bindingMode:kind==="annual"?"original_data":"generated_values",
    ...(kind==="annual"?{sourceCollectionId:collection}:{mixProfileCollectionId:collection}),
    ...(chosen?{selectedQuestionRefs:refsFor(chosen)}:{})};
}
const roundTrip = (run: Run): Run => JSON.parse(JSON.stringify(run));
function markId(q: Question, field: number, mark: string) {
  const id=q.answerParts![field].choiceIds[alphabet.indexOf(mark)];assert(id,`${major(q)}/${field}/${mark}`);return id;
}
function assertStructure(q: Question, n: number) {
  assert.equal(major(q),n);assert.deepEqual(q.answerParts!.map(p=>p.id),sourcePartIds[n-1]);
  assert.equal(q.answerParts!.length,fieldCounts[n-1]);assert.equal(q.correctAnswer.parts!.length,definitionCounts[n-1]);
  assert.equal(q.choiceShuffleAllowed,false);
  assert.equal(q.correctAnswer.parts!.filter(a=>a.kind==="no_correct_answer").length,n===13?1:0);
  assert(q.origin.sourceRefs.every(r=>r.sourceId===`source-ipa-${sid}-${n}-qs`&&r.locator.year===2018&&r.locator.period==="秋期"&&r.locator.timeSlot==="午後"));
}
function answerAt(run: Run, index: number, independentOriginal: boolean): Run {
  run.session.currentIndex=index;const q=run.issued[index];
  if(independentOriginal){
    sourceMarks[major(q)-1].forEach((mark,i)=>{if(mark!==null)run=updatePartAnswer(run,q.answerParts![i].id,markId(q,i,mark),now+1000);});
  }else{
    // Workflow helper only. Algorithm/knowledge truth for generated values has
    // separate per-major independent tests; this does not replace those oracles.
    for(const a of q.correctAnswer.parts!){
      if(a.kind==="choice")run=updatePartAnswer(run,a.partId,a.choiceId,now+1000);
      if(a.kind==="unordered")a.partIds.forEach((partId,i)=>{run=updatePartAnswer(run,partId,a.choiceIds[i],now+1000);});
    }
  }
  return run;
}
async function study(kind: "annual"|"mix") { return startRun(await prepareRun(bundle,selection(kind,"study"),{},now),now); }
function legalChoices() {const result:number[][]=[];for(let mask=0;mask<64;mask++){const general=[2,3,4,5,6,7].filter((_,i)=>mask&(1<<i));if(general.length===4)for(let language=9;language<=13;language++)result.push([1,...general,8,language]);}return result;}

let originalAnswered: Run, generatedAnswered: Run;
test("actual annual study issues all13 in source order and grades independent ANS keys as73fields/69groups/72scored",async()=>{
  let run=await study("annual");assert.deepEqual(run.issued.map(major),Array.from({length:13},(_,i)=>i+1));assert.equal(run.instances.length,0);
  for(let i=0;i<13;i++){assertStructure(run.issued[i],i+1);assert.equal(run.issued[i].origin.kind,"official_reprint");assert.equal(run.issued[i].origin.isModified,false);run=answerAt(run,i,true);assert(hasCompleteAnswer(run.issued[i],run.session.entries[i]));}
  const result=resultFor(run,now+2000);assert.equal(result.total,13);assert.equal(result.correct,13);assert.equal(result.learningAccuracyPercent,100);
  assert.deepEqual(result.partSummary,{total:73,correct:72,incorrect:0,unanswered:0,unscored:1,learningAccuracyPercent:100});
  assert.equal(run.issued.reduce((s,q)=>s+q.correctAnswer.parts!.length,0),69);assert.equal(run.session.entries[12].selectedPartChoices?.["part-a"],undefined);
  originalAnswered=run;await validateRun(roundTrip(run));
});

test("actual generated study binds every selected S204 major and keeps the complete unbound snapshot",async()=>{
  const before=await contentHash(bundle);let snapshotHash="";
  let run=startRun(await prepareRun(bundle,selection("mix","study"),{},now,async(_id,snapshot)=>{snapshotHash=await contentHash(snapshot);}),now);
  assert.equal(snapshotHash,before);assert.equal(await contentHash(run.bundle),before);assert.equal(await contentHash(bundle),before);
  assert.equal(run.instances.length,13);assert.equal(run.session.bindingMode,"generated_values");
  for(let i=0;i<13;i++){const q=run.issued[i],instance=run.instances[i];assertStructure(q,i+1);assert.equal(q.origin.kind,"official_adaptation");assert.equal(q.origin.isModified,true);assert.equal(instance.generatorRef.id,`generator-source-${sid}-${i+1}`);assert.equal(instance.baseQuestionRef.questionId,`question-template-source-${sid}-${i+1}`);assert.equal(instance.contentSha256,await contentHash(q));assert.equal(run.session.entries[i].generatedInstanceId,instance.id);run=answerAt(run,i,false);}
  const result=resultFor(run,now+2000);assert.deepEqual(result.partSummary,{total:73,correct:72,incorrect:0,unanswered:0,unscored:1,learningAccuracyPercent:100});
  generatedAnswered=run;await validateRun(roundTrip(run));
});

test("all75 legal practices issue the exact7 chosen majors for original and generated paths with9000s and correct field denominators",async t=>{
  const combinations=legalChoices();assert.equal(combinations.length,75);const totals:number[]=[];let runs=0;
  for(const kind of["annual","mix"]as const){for(const [index,ns]of combinations.entries()){
    // Caller order is arbitrary; ordinary selection must retain source order.
    const request=selection(kind,"practice",[...ns].reverse());let run=startRun(await prepareRun(bundle,request,{},now),now);
    assert.deepEqual(run.issued.map(major),ns);assert.equal(run.exam.questionCount,7);assert.equal(run.exam.timeLimitSeconds,9000);assert.equal(remaining(run,now),9000);
    assert.equal(run.instances.length,kind==="annual"?0:7);assert.equal(run.session.bindingMode,kind==="annual"?"original_data":"generated_values");
    const fields=ns.reduce((s,n)=>s+fieldCounts[n-1],0),unscored=ns.includes(13)?1:0;totals.push(fields);
    const result=resultFor(run,now+1000);assert.deepEqual(result.partSummary,{total:fields,correct:0,incorrect:0,unanswered:fields-unscored,unscored,learningAccuracyPercent:0});assert.equal(result.total,7);assert.equal(result.unanswered,7);
    await validateRun(run);runs++;if(index===74)t.diagnostic(`${kind}:75 exact normal practice starts/validateRun`);
  }}
  assert.equal(runs,150);assert.equal(Math.min(...totals),36);assert.equal(Math.max(...totals),41);
});

test("Q13a none/all six choices survive JSON restore and never alter scored completion or the72-field denominator",async()=>{
  for(const initial of[originalAnswered,generatedAnswered]){
    assert(initial);let run=structuredClone(initial);run.session.currentIndex=12;const q=run.issued[12],a=q.answerParts![0];
    let onlyA=structuredClone(run);for(const part of q.answerParts!.slice(1))onlyA=updatePartAnswer(onlyA,part.id,undefined,now+2500);onlyA=updatePartAnswer(onlyA,a.id,a.choiceIds[0],now+2500);assert.equal(hasCompleteAnswer(q,onlyA.session.entries[12]),false);assert.equal(gradeAnswer(q,onlyA.session.entries[12]).outcome,"unanswered");assert.deepEqual(resultFor(onlyA,now+2600).partSummary,{total:73,correct:66,incorrect:0,unanswered:6,unscored:1,learningAccuracyPercent:91.7});await validateRun(roundTrip(onlyA));
    for(const selected of[undefined,...a.choiceIds]){
      run=updatePartAnswer(run,a.id,selected,now+3000);const saved=roundTrip(run);await validateRun(saved);
      assert.equal(saved.session.entries[12].selectedPartChoices?.[a.id],selected);assert.equal(hasCompleteAnswer(q,saved.session.entries[12]),true);
      const grade=gradeAnswer(q,saved.session.entries[12]);assert.equal(grade.outcome,"correct");assert.equal(grade.parts![0].outcome,"unscored");
      assert.deepEqual(resultFor(saved,now+4000).partSummary,{total:73,correct:72,incorrect:0,unanswered:0,unscored:1,learningAccuracyPercent:100});
    }
    // Nontrivial denominator: one scored error, while a stays stored/unscored.
    const wrong=markId(q,1,"ア");run=updatePartAnswer(run,q.answerParts![1].id,wrong,now+5000);run=finishRun(run,"completed",now+6000);
    assert.equal(run.result!.learningAccuracyPercent,92.3);assert.deepEqual(run.result!.partSummary,{total:73,correct:71,incorrect:1,unanswered:0,unscored:1,learningAccuracyPercent:98.6});
    await validateRun(roundTrip(run));const bad=roundTrip(run);bad.result!.partSummary!.learningAccuracyPercent=97.3;await assert.rejects(validateRun(bad),{code:"RESULT"});
    const badStored=roundTrip(run);badStored.session.entries[12].selectedPartChoices![a.id]="missing-choice";await assert.rejects(validateRun(badStored),{code:"ANSWER_REF"});
    const badInstance=roundTrip(run);if(badInstance.instances.length){badInstance.instances[12].generatorRef.version="0.0.0";await assert.rejects(validateRun(badInstance));}
  }
});

test("all four printed unordered groups retain swapped answers, reject duplicates and preserve unanswered slots through ordinary APIs",async()=>{
  const groups=[[4,0,1],[4,3,4],[6,4,5],[7,1,2]];
  for(const [n,first,second]of groups){let run=structuredClone(originalAnswered);run.session.currentIndex=n-1;const q=run.issued[n-1],one=markId(q,first,sourceMarks[n-1][first]!),two=markId(q,second,sourceMarks[n-1][second]!);
    run=updatePartAnswer(run,q.answerParts![first].id,two,now+7000);run=updatePartAnswer(run,q.answerParts![second].id,one,now+7000);assert.equal(resultFor(run,now+8000).correct,13);await validateRun(roundTrip(run));
    run=updatePartAnswer(run,q.answerParts![second].id,two,now+9000);const duplicate=resultFor(run,now+10000);assert.equal(duplicate.partSummary!.incorrect,1);assert.equal(duplicate.partSummary!.correct,71);
    run=updatePartAnswer(run,q.answerParts![second].id,undefined,now+11000);const missing=resultFor(run,now+12000);assert.equal(missing.unanswered,1);assert.equal(missing.partSummary!.unanswered,1);assert.equal(missing.partSummary!.unscored,1);
  }
});

test("illegal major selections and tampered saved selections/deadlines cannot resume as another legal paper",async()=>{
  const good=[1,2,3,4,5,8,13],cases=[good.filter(n=>n!==1),good.filter(n=>n!==8),[...good,2],[1,2,3,4,8,13],[1,2,3,4,5,6,8,13],[1,2,3,4,5,8],[...good,9]];
  for(const kind of["annual","mix"]as const){for(const ns of cases)assert.throws(()=>selectQuestions(bundle,selection(kind,"practice",ns)),{code:"QUESTION_SELECTION"});
    const bad=selection(kind,"practice",good);bad.selectedQuestionRefs![6].revision=99;assert.throws(()=>selectQuestions(bundle,bad),{code:"QUESTION_SELECTION"});
    const foreign=selection(kind,"practice",good);foreign.selectedQuestionRefs![6]={questionId:"question-ipa-2018h30h-fe-pm-13",revision:1};assert.throws(()=>selectQuestions(bundle,foreign),{code:"QUESTION_SELECTION"});
    assert.throws(()=>selectQuestions(bundle,selection(kind,"study",good)),{code:"QUESTION_SELECTION"});
    const run=startRun(await prepareRun(bundle,selection(kind,"practice",good),{},now),now);assert.equal(remaining(run,now+8_999_001),1);
    const drift=roundTrip(run);drift.selection.selectedQuestionRefs!.at(-1)!.questionId=originalId(9);await assert.rejects(validateRun(drift));
    const deadline=roundTrip(run);deadline.session.deadlineAt=new Date(now+9_001_000).toISOString();await assert.rejects(validateRun(deadline),{code:"DEADLINE"});
    const expired=updatePartAnswer(run,run.issued[0].answerParts![0].id,run.issued[0].answerParts![0].choiceIds[0],now+9_000_000);assert.equal(expired.session.status,"expired");assert.equal(expired.result!.partSummary!.unscored,1);assert.equal(expired.session.entries[0].selectedPartChoices,undefined);await validateRun(roundTrip(expired));
  }
});

test("snapshot payload retains Q13a answers and all89 logical material IDs over87 actual image blobs",async()=>{
  const run=roundTrip(originalAnswered);run.session.currentIndex=12;const selected=run.issued[12].answerParts![0].choiceIds[5];const answered=updatePartAnswer(run,"part-a",selected,now+13000);
  const assetIds=[...new Set(answered.issued.flatMap(q=>q.assetRefs))],assets:Record<string,Blob>={};
  for(const id of assetIds){const asset=bundle.assets.find(a=>a.id===id)!;const bytes=fs.readFileSync(path.resolve("public/data",asset.path));assert.equal(await sha256(bytes),asset.sha256);assets[id]=new Blob([bytes],{type:asset.mediaType});}
  assert.equal(assetIds.length,89); // All13 original bodies and appendices, including common p4/p5 twice.
  const snapshot=await prepareSnapshot(answered.session.id,answered.bundle,assets);assert.equal(snapshot.snapshot.assetKeys.length,87);assert.equal(snapshot.shared.bundle.catalogHash,bundle.catalogHash);
  assert.equal(snapshot.snapshot.assetRefs[`asset-ipa-${sid}-8-p4`],snapshot.snapshot.assetRefs[`asset-ipa-${sid}-13-p4`]);
  const restored=roundTrip(answered);restored.bundle=structuredClone(snapshot.shared.bundle);restored.assets=Object.fromEntries(Object.entries(snapshot.snapshot.assetRefs).map(([id,key])=>[id,snapshot.assets.find(a=>a.id===key)!.blob]));
  assert.equal(await sha256(JSON.stringify(restored.bundle)),snapshot.snapshot.bundleKey);await validateRun(restored);assert.equal(restored.session.entries[12].selectedPartChoices!["part-a"],selected);assert.equal(resultFor(restored,now+14000).partSummary!.unscored,1);
});

test("new booklet does not replace the previous74-field paper or leak into current-subject B mix",async()=>{
  const previous:Selection={subject:"B",kind:"annual",mode:"study",size:"public",bindingMode:"original_data",sourceCollectionId:"set-annual-2018-spring-pm"};
  const spring=startRun(await prepareRun(bundle,previous,{},now),now);await validateRun(spring);assert.equal(resultFor(spring,now+1000).partSummary!.total,74);assert.equal(resultFor(spring,now+1000).partSummary!.unscored,0);
  const current:Selection={subject:"B",kind:"mix",mode:"study",size:"public",bindingMode:"generated_values",mixProfileCollectionId:"set-annual-2026-b"};
  const chosen=selectQuestions(bundle,current);assert.equal(chosen.questions.length,6);assert(chosen.questions.every(q=>!q.origin.sourceRefs.some(r=>r.locator.timeSlot==="午後")));
});
