import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { decemberBReview as review } from "./fixtures/dec-2022-b-review";
import { selectQuestions } from "../src/core/selection";
import { sourceQuestionLabel } from "../src/core/source-label";
import { questionSearchDocuments,findSearchDocuments,emptySearch } from "../src/core/search";
import { prepareRun,startRun,updateAnswer,finishRun,validateRun } from "../src/core/session";
test("December B collection keeps all 20 source questions, separate answer paper and common notation",async()=>{
  const b=fixture(),selection={subject:"B",kind:"annual",sourceCollectionId:"set-sample-2022-dec-b",mode:"study",size:"public",bindingMode:"original_data"} as const;
  const chosen=selectQuestions(b,selection);assert.equal(chosen.questions.length,20);
  for(const [i,q] of chosen.questions.entries()){
    const item=review.questions[i];assert.equal(q.id,`question-ipa-sample-2022-dec-b-${i+1}`);assert.equal(q.origin.isModified,false);assert.equal(q.origin.sourceRefs[0].locator.year,undefined);
    assert.equal(q.choices.length,item.choices.length);assert.equal(q.correctAnswer.choiceId,`choice-${"アイウエオカキクケコ".indexOf(item.answer)+1}`);
    const answer=q.correctAnswer.attribution.sourceRefs[0];assert.equal(answer.locator.page,1);assert.equal(b.sources.find(s=>s.id===answer.sourceId)!.sha256,review.answerPaper.sha256);
    const images=q.prompt.blocks.filter(x=>x.type==="image");assert.deepEqual(images.map(x=>b.assets.find(a=>a.id===x.assetId)!.attribution.sourceRefs[0].locator.page),[...item.pages,...(i<16?[2,3]:[])]);
    assert(sourceQuestionLabel(q).startsWith("2022年12月公表 サンプル問題 科目B"));
    const rights=b.rights.find(r=>r.id===q.prompt.attribution.rightsRefs[0])!;assert(rights.attributionText.includes(review.attribution));assert(rights.assessmentNotes.includes("プロジェクト判断"));
    assert(q.explanation.attribution.rightsRefs.includes("rights-original"));
  }
  assert.equal(selectQuestions(b,{...selection,mode:"practice"}).exam.timeLimitSeconds,6000);
  let run=startRun(await prepareRun(b,selection,{},100000),101000);
  for(const [i,item] of review.questions.entries()){run.session.currentIndex=i;run=updateAnswer(run,`choice-${"アイウエオカキクケコ".indexOf(item.answer)+1}`,102000+i);}
  await validateRun(run);run=finishRun(run,"completed",103000);assert.equal(run.result!.correct,20);assert.equal(run.result!.learningAccuracyPercent,100);await validateRun(run);
});
test("publication year search includes both independent sample collections",()=>{
  const b=fixture(),docs=findSearchDocuments(questionSearchDocuments(b),{...emptySearch,year:2022});assert.equal(docs.length,86);assert.equal(docs.filter(d=>d.title.includes("12月公表")).length,80);assert(docs.every(d=>!d.title.includes("年度")));
});
