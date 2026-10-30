import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { readDistributionBundle } from "../scripts/distribution-files";
import type { Block, Question, Run } from "../src/core/types";
import { refKey, refOf } from "../src/core/types";
import { selectQuestions } from "../src/core/selection";
import { prepareRun, startRun, updatePartAnswer, finishRun, resultFor, remaining, validateRun } from "../src/core/session";
import { gradeAnswer, hasCompleteAnswer } from "../src/core/answers";
import { validateBundle } from "../src/core/validation";
import { prepareSnapshot } from "../src/core/storage-snapshot";
import { contentHash, sha256 } from "../src/core/hash";
import { bindQuestion, parametersForSeed } from "../src/core/generation";
import { makeBookmark, bookmarkSource, bookmarkTemplate, bookmarkPreview, resultBookmarks } from "../src/core/bookmarks";
import { questionSearchDocuments, findSearchDocuments, emptySearch } from "../src/core/search";
import { sourceCollections } from "../src/core/source-collections";
import { menuSourceGroups, menuSubjectOptions } from "../src/core/menu-selection";
import { contract, originalId, baseId, major, partIds, refsFor, selection, legalChoices, answerOriginal, answerGeneratedWorkflow } from "./helpers/legacy-2019-autumn-app";

const now=Date.UTC(2026,9,30,0,0,0), bundle=readDistributionBundle();
const original=(n:number)=>{const q=bundle.questions.find(q=>q.id===originalId(n));assert(q);return q;};
const base=(n:number)=>{const q=bundle.questions.find(q=>q.id===baseId(n));assert(q);return q;};
const template=(n:number)=>{const t=bundle.templates.find(t=>t.id===`template-source-${contract.sourceId}-${n}`);assert(t);return t;};
const roundTrip=(run:Run):Run=>JSON.parse(JSON.stringify(run));
const blocksText=(blocks:Block[])=>blocks.map(b=>"text"in b?b.text:JSON.stringify(b)).join("\n");
const beforeAnswer=(q:Question)=>[...q.contextRefs.flatMap(id=>q.contexts.find(c=>c.id===id)!.content.blocks),...q.prompt.blocks];
const study=async(kind:"annual"|"mix")=>startRun(await prepareRun(bundle,selection(bundle,kind,"study"),{},now),now);
function structure(q:Question,n:number,generated:boolean) {
  assert.equal(major(q),n);assert.deepEqual(q.answerParts!.map(p=>p.id),partIds(n));
  assert.equal(q.answerParts!.length,contract.fieldCounts[n-1]);assert.equal(q.correctAnswer.parts!.length,contract.fieldCounts[n-1]);
  assert.equal(q.choiceShuffleAllowed,false);assert.equal(q.correctAnswer.parts!.filter(p=>p.kind==="unordered").length,0);
  assert.equal(q.correctAnswer.parts!.filter(p=>p.kind==="no_correct_answer").length,!generated&&n===12?1:0);
  const source=q.origin.sourceRefs.find(r=>r.sourceId===`source-ipa-${contract.sourceId}-${n}-qs`);assert(source);
  assert.equal(source.locator.year,2019);assert.equal(source.locator.period,"秋期");assert.equal(source.locator.timeSlot,"午後");
}

test("normal full bundle, original collection and base-only mix metadata are accepted without changing strict validation",async()=>{
  await validateBundle(bundle);
  const annual=bundle.sets.find(s=>s.id===contract.collectionId)!;
  const mix=bundle.sets.find(s=>s.id==="set-mix-2019-autumn-pm")!;
  assert(annual&&mix);assert.equal(annual.questionRefs.length,13);assert.deepEqual(annual.questionRefs,refsFor(bundle,Array.from({length:13},(_,i)=>i+1)));
  assert.deepEqual(annual.generationBindings,[]);assert(annual.questionSelection);assert.equal(mix.questionSelection,undefined);
  assert.deepEqual(mix.questionRefs,Array.from({length:13},(_,i)=>refOf(base(i+1))));assert.equal(mix.generationBindings.length,13);
  for(const [i,binding]of mix.generationBindings.entries()) {assert.deepEqual(binding.questionRef,refOf(base(i+1)));assert.deepEqual(binding.templateRef,{id:template(i+1).id,revision:template(i+1).revision});}
  for(const n of[5,11,12]) {assert.equal(original(n).prompt.attribution.origin,"official");assert.equal(original(n).origin.isModified,true);}
  assert(sourceCollections(bundle,"B").some(s=>s.id===contract.collectionId));
  const group=menuSourceGroups(bundle).find(g=>g.collections.some(s=>s.id===contract.collectionId));assert(group);
  assert.equal(group.year,2019);assert.equal(group.period,"秋期");assert.equal(group.timeSlot,"午後");assert.match(group.title,/2019.*秋期/);
  assert(menuSubjectOptions(group).some(o=>o.title==="旧制度・午後"));
});

test("normal annual study preserves all13 originals and independent ANS1 answers:77 fields,76 scored",async()=>{
  let run=await study("annual");assert.deepEqual(run.issued.map(major),Array.from({length:13},(_,i)=>i+1));assert.equal(run.instances.length,0);
  for(let i=0;i<13;i++) {const q=run.issued[i];structure(q,i+1,false);assert.equal(q.origin.kind,"official_reprint");assert.deepEqual(q.origin.derivedFrom,[]);assert.equal(q.origin.isModified,[5,11,12].includes(i+1));
    run=answerOriginal(run,i,now+1000);assert(hasCompleteAnswer(q,run.session.entries[i]));}
  const result=resultFor(run,now+2000);assert.equal(result.correct,13);assert.equal(result.total,13);assert.equal(result.learningAccuracyPercent,100);
  assert.deepEqual(result.partSummary,{total:77,correct:76,incorrect:0,unanswered:0,unscored:1,learningAccuracyPercent:100});
  run=finishRun(run,"completed",now+3000);await validateRun(roundTrip(run));assert.deepEqual(roundTrip(run).result!.partSummary,result.partSummary);
});

test("normal generated study binds all13 with seeded replay, exact refs/content hashes and an unchanged full source snapshot",async()=>{
  const before=await contentHash(bundle);let snapshotHash="";
  let run=startRun(await prepareRun(bundle,selection(bundle,"mix","study"),{},now,async(_id,b)=>{snapshotHash=await contentHash(b);}),now);
  assert.equal(snapshotHash,before);assert.equal(await contentHash(run.bundle),before);assert.equal(await contentHash(bundle),before);assert.equal(run.instances.length,13);
  for(let i=0;i<13;i++) {const q=run.issued[i],instance=run.instances[i],t=template(i+1);structure(q,i+1,true);
    assert.equal(q.origin.kind,"official_adaptation");assert.equal(q.origin.isModified,true);assert.deepEqual(q.origin.derivedFrom,[refOf(base(i+1))]);
    assert.equal(instance.sessionId,run.session.id);assert.equal(instance.entryIndex,i);assert.deepEqual(instance.templateRef,{id:t.id,revision:t.revision});
    assert.deepEqual(instance.baseQuestionRef,refOf(base(i+1)));assert.deepEqual(instance.generatorRef,t.generatorRef);assert.equal(instance.parameterSelection,"seeded");assert.match(instance.seed,/^[a-f0-9]{32}$/);
    assert.deepEqual(await parametersForSeed(instance.seed,t),instance.parameters);assert.equal(t.originalContentSha256,await contentHash(base(i+1)));
    assert.deepEqual(bindQuestion(base(i+1),t,instance.parameters.values,instance.id,instance.createdAt),q);assert.equal(instance.contentSha256,await contentHash(q));
    assert.equal(run.session.entries[i].generatedInstanceId,instance.id);assert.deepEqual(run.session.entries[i].questionRef,refOf(base(i+1)));run=answerGeneratedWorkflow(run,i,now+1000);
  }
  assert.deepEqual(resultFor(run,now+2000).partSummary,{total:77,correct:77,incorrect:0,unanswered:0,unscored:0,learningAccuracyPercent:100});
  await validateRun(roundTrip(finishRun(run,"completed",now+3000)));
});

test("all75 practice selections retain mandatory1/8 plus4+1, source order,9000seconds and exact original/generated denominators",async t=>{
  const combinations=legalChoices();assert.equal(combinations.length,75);let count=0;
  for(const kind of["annual","mix"]as const) {for(const ns of combinations) {
    const run=startRun(await prepareRun(bundle,selection(bundle,kind,"practice",[...ns].reverse()),{},now),now);
    assert.deepEqual(run.issued.map(major),ns);assert.equal(run.exam.questionCount,7);assert.equal(run.exam.timeLimitSeconds,9000);assert.equal(remaining(run,now),9000);
    assert.deepEqual(run.selection.selectedQuestionRefs,refsFor(bundle,[...ns].reverse()));assert.equal(run.instances.length,kind==="annual"?0:7);
    const total=ns.reduce((s,n)=>s+contract.fieldCounts[n-1],0),unscored=kind==="annual"&&ns.includes(12)?1:0;
    assert.deepEqual(resultFor(run,now+1000).partSummary,{total,correct:0,incorrect:0,unanswered:total-unscored,unscored,learningAccuracyPercent:0});
    assert.equal(run.session.snapshot.catalogSha256,bundle.catalogHash);await validateRun(roundTrip(run));count++;
  }t.diagnostic(`${kind}:75 actual prepareRun/validateRun, no selected-major fallback`);}
  assert.equal(count,150);
});

test("Q4a/Q7c/Q9b tuple choices stay single ordered operation fields and reject a wrong tuple as one field",async()=>{
  let run=await study("mix");for(let i=0;i<13;i++)run=answerGeneratedWorkflow(run,i,now+1000);
  for(const row of contract.tupleFields) {const q=run.issued[row.major-1],part=q.answerParts!.find(p=>p.id===row.partId)!;
    assert(part);assert.equal(q.answerParts!.filter(p=>p.id===part.id).length,1);
    const tables=part.choiceIds.map(id=>q.choices.find(c=>c.id===id)!.content.blocks.filter(b=>b.type==="table"));
    assert(tables.every(ts=>ts.length===1&&ts[0].type==="table"&&ts[0].columns.length===row.columns&&ts[0].rows.length===1&&ts[0].rows[0].length===row.columns));
    const selected=run.session.entries[row.major-1].selectedPartChoices![part.id],wrong=part.choiceIds.find(id=>id!==selected)!;
    const changed=structuredClone(run);changed.session.currentIndex=row.major-1;
    const result=resultFor(updatePartAnswer(changed,part.id,wrong,now+2000),now+3000);
    assert.equal(result.partSummary!.incorrect,1);assert.equal(result.partSummary!.correct,76);assert.equal(result.partSummary!.total,77);await validateRun(changed);
  }
});

test("official Q12 whole-question measure remains visible while app annual f alone is unscored and generated repaired f grades",async()=>{
  for(const kind of["annual","mix"]as const) {
    let run=await study(kind);const index=11,q=run.issued[index];run=kind==="annual"?answerOriginal(run,index,now+1000):answerGeneratedWorkflow(run,index,now+1000);
    const text=blocksText(beforeAnswer(q));assert(text.includes(contract.officialQ12Measure));assert.match(text,/このアプリの年度別問題では原fを採点対象外/);assert.match(text,/生成版.*全8欄.*通常採点/);
    assert.equal(q.answerParts![5].choiceIds.length,6);const f=q.answerParts![5],a=q.answerParts![0];run.session.currentIndex=index;
    const grade=gradeAnswer(q,run.session.entries[index]);assert.equal(grade.outcome,"correct");assert.equal(grade.parts!.filter(p=>p.outcome==="unscored").length,kind==="annual"?1:0);
    for(const choice of f.choiceIds) {const trial=updatePartAnswer(structuredClone(run),f.id,choice,now+2000),g=gradeAnswer(q,trial.session.entries[index]);
      const fp=g.parts!.find(p=>p.partId===f.id)!;assert.equal(fp.outcome,kind==="annual"?"unscored":choice===run.session.entries[index].selectedPartChoices![f.id]?"correct":"incorrect");}
    const key=run.session.entries[index].selectedPartChoices![a.id],wrong=a.choiceIds.find(id=>id!==key)!;
    run=updatePartAnswer(run,a.id,wrong,now+3000);assert.equal(gradeAnswer(q,run.session.entries[index]).outcome,"incorrect");
    assert.equal(resultFor(run,now+4000).partSummary!.unscored,kind==="annual"?1:0);await validateRun(roundTrip(run));
  }
});

test("all field answers and exact one-error/blank grades survive normal JSON history with corrupt Run rejection",async()=>{
  for(const kind of["annual","mix"]as const) {let run=await study(kind);for(let i=0;i<13;i++)run=kind==="annual"?answerOriginal(run,i,now+1000):answerGeneratedWorkflow(run,i,now+1000);
    run.session.currentIndex=10;const part=run.issued[10].answerParts![0],key=run.session.entries[10].selectedPartChoices![part.id],wrong=part.choiceIds.find(id=>id!==key)!;
    const scored=kind==="annual"?76:77;run=updatePartAnswer(run,part.id,wrong,now+2000);run=finishRun(run,"completed",now+3000);
    assert.deepEqual(run.result!.partSummary,{total:77,correct:scored-1,incorrect:1,unanswered:0,unscored:77-scored,learningAccuracyPercent:Math.round((scored-1)/scored*1000)/10});
    const restored=roundTrip(run);await validateRun(restored);assert.deepEqual(restored.session.entries,run.session.entries);assert.deepEqual(restored.issued,run.issued);assert.deepEqual(restored.result,run.result);
    const corrupt=roundTrip(run);corrupt.result!.partSummary!.correct--;await assert.rejects(validateRun(corrupt),{code:"RESULT"});
    const unknown=roundTrip(run);unknown.session.entries[10].selectedPartChoices![part.id]="missing-choice";await assert.rejects(validateRun(unknown),{code:"ANSWER_REF"});
    if(kind==="mix") {const orphan=roundTrip(run);orphan.session.entries[0].generatedInstanceId="instance-orphan";await assert.rejects(validateRun(orphan));const badSeed=roundTrip(run);badSeed.instances[0].seed="z".repeat(32);await assert.rejects(validateRun(badSeed));}
    let blank=await study(kind);blank=kind==="annual"?answerOriginal(blank,10,now+1000):answerGeneratedWorkflow(blank,10,now+1000);blank.session.currentIndex=10;
    blank=updatePartAnswer(blank,part.id,undefined,now+2000);assert.equal(hasCompleteAnswer(blank.issued[10],blank.session.entries[10]),false);assert.equal(gradeAnswer(blank.issued[10],blank.session.entries[10]).outcome,"unanswered");await validateRun(roundTrip(blank));
  }
});

test("every required common material stays before the answer for annual, base and normal-generated Q2/Q8/Q13",async()=>{
  const run=await study("mix");
  for(const [key,pages]of Object.entries(contract.requiredMaterialPages)) {const n=Number(key),ids=pages.map(p=>`asset-ipa-${contract.sourceId}-p${p}`);
    for(const q of[original(n),base(n),run.issued[n-1]]) {
      assert(q.contextRefs.length>0);const images=beforeAnswer(q).filter(b=>b.type==="image").map(b=>b.assetId);
      for(const id of ids) {assert(images.includes(id),`${q.id}: required pre-answer image ${id}`);assert(q.assetRefs.includes(id));const asset=bundle.assets.find(a=>a.id===id);assert(asset);assert(asset.alt.length>50&&asset.alt.length<=2000);}
      assert.deepEqual(q.contextRefs,q.contexts.map(c=>c.id));
    }
  }
});

test("actual76 material blobs and source bundle restore through normal snapshot API without losing answers",async()=>{
  let run=await study("annual");for(let i=0;i<13;i++)run=answerOriginal(run,i,now+1000);
  const ids=[...new Set(run.issued.flatMap(q=>q.assetRefs))],assets:Record<string,Blob>={};assert.equal(ids.length,76);
  for(const id of ids) {const asset=bundle.assets.find(a=>a.id===id)!;const raw=fs.readFileSync(path.resolve("public/data",asset.path));assert.equal(await sha256(raw),asset.sha256);assets[id]=new Blob([raw],{type:asset.mediaType});}
  const payload=await prepareSnapshot(run.session.id,run.bundle,assets);assert.equal(payload.snapshot.assetKeys.length,76);
  const restored=roundTrip(run);restored.bundle=structuredClone(payload.shared.bundle);restored.assets=Object.fromEntries(Object.entries(payload.snapshot.assetRefs).map(([id,key])=>[id,payload.assets.find(a=>a.id===key)!.blob]));
  assert.equal(await sha256(JSON.stringify(restored.bundle)),payload.snapshot.bundleKey);assert.equal(restored.bundle.catalogHash,bundle.catalogHash);assert.deepEqual(restored.session.entries,run.session.entries);
  for(const id of ids)assert.equal(await sha256(await restored.assets[id].arrayBuffer()),bundle.assets.find(a=>a.id===id)!.sha256);
  await validateRun(restored);assert.deepEqual(resultFor(restored,now+3000).partSummary,{total:77,correct:76,incorrect:0,unanswered:0,unscored:1,learningAccuracyPercent:100});
});

test("normal bookmark and search APIs resolve all13 originals and their current templates without indexing bases twice",async()=>{
  const documents=questionSearchDocuments(bundle),owned=documents.filter(d=>d.question.id.startsWith(`question-ipa-${contract.sourceId}-`));assert.equal(owned.length,13);
  assert.equal(documents.filter(d=>d.question.id.startsWith(`question-template-source-${contract.sourceId}-`)).length,0);
  for(let n=1;n<=13;n++) {const q=original(n),bookmark=makeBookmark(bundle,refOf(q),now),viaBase=makeBookmark(bundle,refOf(base(n)),now);assert.deepEqual(bookmark,viaBase);
    assert.deepEqual(bookmarkSource(bundle,bookmark.questionRef),q);const target=bookmarkTemplate(bundle,bookmark.questionRef);assert.deepEqual(target.original,q);assert.deepEqual(target.base,base(n));assert.deepEqual(target.template,template(n));assert(bookmarkPreview(bundle,bookmark.questionRef).length>0);
    const selection={subject:"B"as const,kind:"bookmark"as const,mode:"study"as const,bindingMode:"generated_values"as const,bookmarkQuestionRef:bookmark.questionRef};
    const run=startRun(await prepareRun(bundle,selection,{},now),now);assert.equal(run.issued.length,1);assert.equal(major(run.issued[0]),n);assert.equal(run.instances.length,1);await validateRun(run);
    assert.match(owned.find(d=>d.question.id===q.id)!.title,/2019.*秋期/);
  }
  for(const [n,query]of[[5,"ストレス"],[8,"Bitap"],[13,"表計算"]]as const)assert(findSearchDocuments(documents,{...emptySearch,query,subject:"B",year:2019,kind:"question"}).some(d=>d.question.id===originalId(n)));
  let run=await study("mix");run=answerGeneratedWorkflow(run,0,now+1000);run.session.currentIndex=0;const part=run.issued[0].answerParts![0],chosen=run.session.entries[0].selectedPartChoices![part.id];run=updatePartAnswer(run,part.id,part.choiceIds.find(id=>id!==chosen)!,now+2000);run=finishRun(run,"completed",now+3000);
  assert.deepEqual(resultBookmarks(bundle,run,"incorrect",now).map(b=>b.questionRef),[refOf(original(1))]);assert.equal(resultBookmarks(bundle,run,"unanswered",now).length,12);
});

test("illegal selected majors, foreign revisions and saved deadlines reject through normal APIs",async()=>{
  const good=[1,2,3,4,5,8,13],cases=[good.filter(n=>n!==1),good.filter(n=>n!==8),[...good,2],[1,2,3,4,8,13],[...good,9]];
  for(const kind of["annual","mix"]as const) {for(const ns of cases)assert.throws(()=>selectQuestions(bundle,selection(bundle,kind,"practice",ns)),{code:"QUESTION_SELECTION"});
    const bad=selection(bundle,kind,"practice",good);bad.selectedQuestionRefs![6].revision=99;assert.throws(()=>selectQuestions(bundle,bad),{code:"QUESTION_SELECTION"});
    const foreign=selection(bundle,kind,"practice",good);foreign.selectedQuestionRefs![6]={questionId:"question-ipa-2019h31h-fe-pm-13",revision:1};assert.throws(()=>selectQuestions(bundle,foreign),{code:"QUESTION_SELECTION"});
    assert.throws(()=>selectQuestions(bundle,selection(bundle,kind,"study",good)),{code:"QUESTION_SELECTION"});
    const run=startRun(await prepareRun(bundle,selection(bundle,kind,"practice",good),{},now),now);assert.equal(remaining(run,now+8_999_001),1);
    const deadline=roundTrip(run);deadline.session.deadlineAt=new Date(now+9_001_000).toISOString();await assert.rejects(validateRun(deadline),{code:"DEADLINE"});
    const drift=roundTrip(run);drift.selection.selectedQuestionRefs!.at(-1)!.questionId=originalId(9);await assert.rejects(validateRun(drift));
    const expired=updatePartAnswer(run,run.issued[0].answerParts![0].id,run.issued[0].answerParts![0].choiceIds[0],now+9_000_000);assert.equal(expired.session.status,"expired");assert.equal(expired.session.entries[0].selectedPartChoices,undefined);await validateRun(roundTrip(expired));
  }
});

test("all13 registered bases bind, while substituted old-carrier-style profile/caption/body/choice/explanation fail SOURCE_FORMAT",async()=>{
  for(let n=1;n<=13;n++) {const q=base(n),t=template(n),values=t.referenceParameters.values;assert.equal(t.originalContentSha256,await contentHash(q));
    const bound=bindQuestion(q,t,values,`normal-autumn-base-${n}`,new Date(now).toISOString());structure(bound,n,true);assert.equal(major(bound),n);}
  const n=4,q=base(n),t=template(n),values=t.referenceParameters.values;
  const mutations:((q:Question)=>void)[]=[
    q=>{const d=q.prompt.blocks.find(b=>b.type==="diagram");assert(d&&d.type==="diagram"&&d.scene.kind==="source_figure");d.scene.profile="legacy-2019-pm4-nat64";},
    q=>{const d=q.prompt.blocks.find(b=>b.type==="diagram");assert(d&&d.type==="diagram");d.caption+=" 旧carrier";},
    q=>{const p=q.prompt.blocks.find(b=>b.type==="paragraph");assert(p&&p.type==="paragraph");p.text+=" 旧carrier";},
    q=>{q.choices[0].content.blocks.push({type:"paragraph",text:"旧carrier"});},
    q=>{q.explanation.blocks.push({type:"paragraph",text:"旧carrier"});},
  ];
  for(const mutate of mutations) {const bad=structuredClone(q);mutate(bad);assert.notEqual(await contentHash(bad),await contentHash(q));assert.throws(()=>bindQuestion(bad,t,values,"normal-autumn-reject",new Date(now).toISOString()),{code:"SOURCE_FORMAT"});}
  assert.equal(new Set(Array.from({length:13},(_,i)=>refKey(refOf(base(i+1))))).size,13);
});
