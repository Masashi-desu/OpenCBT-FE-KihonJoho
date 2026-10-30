/** Source-specific credit survives body replacement; the raw producer is never
 * mutated and the original source images are not copied into generated assets. */
import assert from "node:assert/strict";
import type {Question} from "../../src/core/types";
import {bindBodyAnswers} from "../../src/core/generators/definition";
import {legacy2019AfternoonAuthDefinitions} from "../../src/core/generators/legacy-2019-pm-auth";
import {legacy2019AttributedFigureBlocks} from "./legacy-2019-spring-local-diagram-attribution";
export function bindLegacy2019PmAuth(base:Question,values:number[]):Question{
 assert.equal(base.id,"question-template-source-2019h31h-fe-pm-1");assert.equal(base.prompt.attribution.origin,"adapted");assert.deepEqual(base.prompt.attribution.sourceRefs.map(r=>r.locator.page),[5,6,7,8]);assert(base.prompt.attribution.rightsRefs.includes("rights-ipa-2019h31h-fe-pm-1"));
 const body=legacy2019AfternoonAuthDefinitions[0].build(values),q=structuredClone(base);q.prompt.blocks=legacy2019AttributedFigureBlocks(body.prompt,base.prompt.attribution);q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:structuredClone(base.prompt.attribution),blocks:legacy2019AttributedFigureBlocks(blocks,base.prompt.attribution)}}));bindBodyAnswers(q,body,q.correctAnswer.attribution);q.explanation.blocks=[{type:"paragraph",text:body.explanation}];return q;
}
