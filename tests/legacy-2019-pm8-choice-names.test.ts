/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {AnswerChoices} from "../src/ui/AnswerChoices";
import {labels} from "../src/core/types";
import {bindBodyAnswers} from "../src/core/generators/definition";
import {legacy2019AfternoonHuffmanDefinitions} from "../src/core/generators/legacy-2019-pm-huffman";
import {compoundQuestion} from "./fixtures/compound-question";
import {fixture} from "./fixtures";
import fixed from "./fixtures/legacy-2019-pm8-choice-names-review.json";
import {legacy2019Pm8SourceReview as source} from "./fixtures/legacy-2019-pm8-source-review";
import {legacy2019Pm8PriorityOracle as priority} from "./fixtures/legacy-2019-pm8-model-oracle";
import {assertLegacy2019Pm8Body} from "./fixtures/legacy-2019-pm8-body-oracle";
const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
test("2019 PM8 fixed table-name expectations retain source headers, all16 code rows and independent optimal codes",()=>{
 assert.deepEqual(fixed.sourceCodes,source.question1.originalCodeTables);assert.deepEqual(fixed.cases.map(c=>c.values),[[0],[1],[2],[3]]);
 for(const c of fixed.cases){const body=legacy2019AfternoonHuffmanDefinitions[0].build(c.values);assertLegacy2019Pm8Body(body,c.values);assert.deepEqual(c.rows[0].slice(1),priority(fixed.targetFrequencies[c.values[0]]).codes);for(let i=0;i<4;i++){assert.deepEqual(body.choices[i],[{type:"table",caption:fixed.caption,columns:fixed.columns,rows:[c.rows[i]]}]);assert(c.expectedNameBodies[i].includes("列見出し：文字、A、B、C、D"));assert(c.expectedNameBodies[i].includes("1行目：ビット表現、"));}}
});
test("2019 PM8 actual AnswerChoices names use independent literals after order/reveal/JSON;caption-only and missing-row/first-column/split-code are rejected",()=>{
 const bundle=fixture();let checked=0,negatives=0;
 for(const c of fixed.cases){const body=legacy2019AfternoonHuffmanDefinitions[0].build(c.values),q=compoundQuestion();q.origin.kind="official_adaptation";q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:q.prompt.attribution,blocks}}));bindBodyAnswers(q,body,q.correctAnswer.attribution);
  for(const reversed of[false,true])for(const revealed of[false,true]){const order=q.choices.map(c=>c.id);if(reversed)order.reverse();const entry={choiceOrder:order,selectedPartChoices:{}},props={question:q,bundle,assetUrls:{},entry,disabled:false,revealed},html=renderToStaticMarkup(createElement(AnswerChoices,props)),groups=[...html.matchAll(/<fieldset\b[\s\S]*?<\/fieldset>/g)];assert.equal(groups.length,6);const inputs=[...groups[0][0].matchAll(/<input\b[^>]*aria-label="([^"]*)"[^>]*>/g)].map(m=>decode(m[1]));const indices=reversed?[3,2,1,0]:[0,1,2,3],expected=indices.map((i,pos)=>`${labels[pos]} ${c.expectedNameBodies[i]}${revealed&&i===0?" 正答":""}`);assert.deepEqual(inputs,expected);checked+=4;
   for(const bad of[`${labels[0]} aに関する解答群`,inputs[0].replace("列見出し：文字、","列見出し："),inputs[0].replace("ビット表現、",""),inputs[0].replace(/([01]{2,})/,s=>s[0]+" "+s.slice(1))]){assert.notEqual(bad,inputs[0]);assert.throws(()=>assert.deepEqual([bad,...inputs.slice(1)],expected));negatives++;}
   const saved=JSON.parse(JSON.stringify({q,entry}));assert.equal(renderToStaticMarkup(createElement(AnswerChoices,{...props,question:saved.q,entry:saved.entry})),html);
  }
 }
 assert.equal(checked,64);assert.equal(negatives,64);
});
