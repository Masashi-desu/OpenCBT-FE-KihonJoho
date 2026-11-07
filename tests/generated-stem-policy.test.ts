import assert from "node:assert/strict";
import test from "node:test";
import { auditGeneratedStems } from "../scripts/audit-generated-stems";
import { readDistributionBundle } from "../scripts/distribution-files";
import pendingReview from "./fixtures/generated-stems-pending-review.json";
import cohort from "./fixtures/reviewed-stem-cohort.json";
import {assertReviewedStemMeaning} from "./fixtures/reviewed-stem-meanings";
import {installFixtureGenerators} from "./fixtures";
import {bindQuestion,validateTemplateContract} from "../src/core/generation";
import {definitionForVersion,validateAdditionalFormat} from "../src/core/generators";

test("new and revised generation series vary the question unless the fixed stem has a documented reason", async () => {
  await installFixtureGenerators();
  const bundle = readDistributionBundle();
  assert.equal(cohort.rows.length,229);
  assert.equal(new Set(cohort.rows.map(row=>row.source)).size,229);
  assert.deepEqual(pendingReview,[]);
  for(const row of cohort.rows){
    const t=bundle.templates.find(t=>t.generatorRef.id==="generator-source-"+row.source)!;
    assert(t,row.source);
    if(row.outcome==="fixed"){
      assert.equal(t.generatorRef.id+"@"+t.generatorRef.version,row.previousGenerator);
      assert(row.considered.length>10&&row.reason.length>60,row.source);
      continue;
    }
    assert.equal(t.generatorRef.version,"3.7.0");
    const d=definitionForVersion(t.generatorRef.id,t.generatorRef.version)!;
    const v=[row.selector!,...row.reference.slice(1)];
    const body=d.build(v);
    assert(assertReviewedStemMeaning(row.source,body,v));
    const wrong=structuredClone(body);wrong.correctIndex=(body.correctIndex!+1)%4;
    assert.throws(()=>assertReviewedStemMeaning(row.source,wrong,v));
    for(let i=0;i<4;i++){const bad=structuredClone(body);bad.choices[i]=structuredClone(bad.choices[(i+1)%4]);assert.throws(()=>assertReviewedStemMeaning(row.source,bad,v));}
    const base=bundle.questions.find(q=>q.id===t.baseQuestionRef.questionId)!;
    const generated=bindQuestion(base,t,v,"review-"+row.source,"2026-11-07T04:00:00Z");
    validateTemplateContract(t);validateAdditionalFormat(generated,t);
    assert.notDeepEqual(generated.prompt.blocks,base.prompt.blocks);
    assert.equal(generated.correctAnswer.choiceId,"choice-value-"+(body.correctIndex!+1));
  }
  const {fixed} = await auditGeneratedStems(bundle);
  const fixedIds = new Set(fixed.map(row => row.generator));
  const pendingIds = new Set<string>(pendingReview);
  for (const id of pendingIds)
    assert(fixedIds.has(id), `Remove the outdated review candidate ${id}`);

  const missingReasons = fixed.filter(({generator}) => {
    if (cohort.rows.some(row=>row.outcome==="fixed"&&row.previousGenerator===generator)) return false;
    if (pendingIds.has(generator)) return false;
    const template = bundle.templates.find(t => `${t.generatorRef.id}@${t.generatorRef.version}` === generator)!;
    const question = bundle.questions.find(q => q.id === template.baseQuestionRef.questionId
      && q.revision === template.baseQuestionRef.revision)!;
    return !/本文固定の理由[：:].+\S/u.test(question.review.notes);
  });
  assert.deepEqual(missingReasons, [], "Record an independently reviewed reason or bind a meaningful input in the displayed question");
});
