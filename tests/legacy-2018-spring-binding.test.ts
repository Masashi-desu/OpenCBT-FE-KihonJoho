import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Question, Template } from "../src/core/types";
import type { Spring2018PreparedBundle } from "../scripts/import-legacy-2018-spring-pm-preparation";
import { legacy2018SpringAfternoonDefinitions as definitions } from "../src/core/generators/legacy-2018-spring-afternoon-definitions";
import { bindLegacyAfternoonQuestion, validateLegacyAfternoonFormat } from "../src/core/generators/legacy-afternoon-binding";
import { validate2018SpringFixedMaterials } from "../src/core/generators/legacy-2018-spring-material-validation";
import { schema } from "../src/core/validation";
import { gradeAnswer } from "../src/core/answers";

async function prepared(number: number): Promise<Spring2018PreparedBundle> {
  const input = JSON.parse(readFileSync(`tests/fixtures/legacy-2018-spring-pm${number}-original-metadata.json`,"utf8"));
  const module = await import(`../scripts/import-legacy-2018-spring-pm${number}.ts`);
  return (await module[`legacy2018SpringPm${number}Records`](input)).bundle;
}
function correctSelections(q: Question) {
  const selections: Record<string,string> = {};
  for (const answer of q.correctAnswer.parts!) {
    if (answer.kind === "choice") selections[answer.partId] = answer.choiceId;
    if (answer.kind === "unordered") answer.partIds.forEach((id,i)=>selections[id]=answer.choiceIds[i]);
  }
  return selections;
}

test("shared spring binding preserves all 305 inputs, schema, fixed credits and 74-slot grading through JSON", async () => {
  let generated=0, originalFields=0;
  for (const [index,definition] of definitions.entries()) {
    const {questions,templates} = await prepared(index+1);
    const [original,base] = questions, template: Template = templates[0];
    originalFields+=original.answerParts!.length;
    validateLegacyAfternoonFormat(base,definition);
    assert.equal(gradeAnswer(original,{selectedPartChoices:correctSelections(original)}).outcome,"correct");
    const visit = (values: number[]) => {
      if (values.length<definition.fields.length) {
        const f=definition.fields[values.length];
        for(let value=f.minimum;value<=f.maximum;value++) visit([...values,value]);
        return;
      }
      try { definition.build(values); }
      catch(error) { assert(index===6 && error instanceof Error && error.message==="PARAMETER_CONSTRAINT"); return; }
      const q=bindLegacyAfternoonQuestion(base,template,definition,values,`spring2018-${index+1}-${generated}`,"2026-10-27T00:00:00Z");
      const saved: Question=JSON.parse(JSON.stringify(q));
      assert.deepEqual(saved,q); schema("question",saved);
      validateLegacyAfternoonFormat(saved,definition);
      assert.equal(saved.origin.isModified,true);
      const result=gradeAnswer(saved,{selectedPartChoices:correctSelections(saved)});
      assert.equal(result.outcome,"correct"); assert.equal(result.parts!.length,saved.answerParts!.length);
      assert.equal(gradeAnswer(saved,{}).outcome,"unanswered");
      generated++;
    };
    visit([]);
  }
  assert.deepEqual([generated,originalFields],[305,74]);
});

test("shared binding refuses altered appendix identities, per-material sources, rights and independent character facts", async () => {
  let rejected=0;
  for(const number of [8,10,12,13]) {
    const {questions,templates}=await prepared(number),base=questions[1],definition=definitions[number-1];
    const mutate: ((q: Question)=>void)[]=[
      q=>q.contextRefs.reverse(),
      q=>q.contexts[0].title+="変更",
      q=>q.contexts[0].content.attribution.rightsRefs=["rights-original"],
      q=>q.contexts[0].content.attribution.sourceRefs[0].sourceId="source-other",
      q=>q.contexts[0].content.blocks.pop(),
      q=>q.assetRefs.pop(),
    ];
    // A one-item reverse is unchanged, so remove the first item for those cases.
    if(base.contextRefs.length===1) mutate[0]=q=>{q.contextRefs=[];};
    if(number===12) mutate.push(
      q=>{const b=q.contexts[1].content.blocks[0];assert(b.type==="diagram");b.alt=b.alt.replace("#0020","#0021");},
      q=>{const b=q.contexts[1].content.blocks[0];assert(b.type==="diagram"&&b.scene.kind==="source_figure");b.scene.values=[1,0,0];},
      q=>{q.contexts[1].content.attribution.creatorIds=["ipa"];},
    );
    for(const change of mutate) {
      const bad=structuredClone(base); change(bad);
      assert.throws(()=>validate2018SpringFixedMaterials(bad,definition),/SOURCE_MATERIAL|固定資料/);
      assert.throws(()=>bindLegacyAfternoonQuestion(bad,templates[0],definition,[...definition.reference],"bad-material","2026-10-27T00:00:00Z"));
      rejected++;
    }
  }
  assert.equal(rejected,27);
});
