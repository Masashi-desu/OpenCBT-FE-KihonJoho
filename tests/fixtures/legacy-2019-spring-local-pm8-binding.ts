/** Non-destructive source-specific binding. Raw producer bodies remain unchanged. */
import type {Question} from "../../src/core/types";
import assert from "node:assert/strict";
import {bindBodyAnswers} from "../../src/core/generators/definition";
import {legacy2019AfternoonHuffmanDefinitions} from "../../src/core/generators/legacy-2019-pm-huffman";
import {legacy2019AttributedFigureBlocks} from "./legacy-2019-spring-local-diagram-attribution";
export function bindLegacy2019Pm8(base:Question,values:number[]):Question{
 const common=base.contexts.find(c=>c.id==="context-legacy-2019-pm8-notation");assert(common&&base.contextRefs.includes(common.id),"PM8 common source context is required");assert.equal(common.content.attribution.origin,"official");assert.deepEqual(common.content.attribution.sourceRefs.map(r=>r.locator.page),[3,4]);assert.deepEqual(common.content.blocks.map(b=>{assert(b.type==="image");return b.assetId;}),["asset-ipa-2019h31h-fe-pm-p3","asset-ipa-2019h31h-fe-pm-p4"]);assert(common.content.attribution.rightsRefs.includes("rights-ipa-2019h31h-fe-pm-8"));assert(common.content.blocks.every(b=>b.type==="image"&&base.assetRefs.includes(b.assetId)));
 const body=legacy2019AfternoonHuffmanDefinitions[0].build(values),q=structuredClone(base);q.prompt.blocks=legacy2019AttributedFigureBlocks(body.prompt,base.prompt.attribution);q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:structuredClone(base.prompt.attribution),blocks:legacy2019AttributedFigureBlocks(blocks,base.prompt.attribution)}}));bindBodyAnswers(q,body,q.correctAnswer.attribution);q.explanation.blocks=[{type:"paragraph",text:body.explanation}];return q;
}
