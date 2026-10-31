import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018KnowledgeReview,legacy2018KnowledgeFacts} from "./stage1-am-2018-knowledge-review";
export function legacy2018KnowledgeOracle(source:string,body:GeneratedBody,values:number[]){
  const r=legacy2018KnowledgeReview.find(r=>`${r.collection}-${r.number}`===source),facts=legacy2018KnowledgeFacts[source];assert(r&&facts,"unregistered independent knowledge oracle");
  assert.equal(body.prompt.length,1);assert.equal(body.prompt[0].type,"paragraph");assert(body.prompt[0].type==="paragraph");
  const prose=body.prompt[0].text,criteria=facts.criteria.flatMap((pattern,i)=>pattern.test(prose)?[i]:[]);assert.deepEqual(criteria,[values[0]],"displayed target must be unique and match the binding");
  assert.equal(body.choices.length,4);const options=body.choices.map(blocks=>{assert.equal(blocks.length,1);assert.equal(blocks[0].type,"paragraph");assert(blocks[0].type==="paragraph");return blocks[0].text;});
  const reviewedOptions=r.choices.map((text,i)=>facts.optionOverrides?.[values[0]]?.[i]??text);
  assert.deepEqual(options,reviewedOptions,"every displayed option must retain its independently reviewed role and text");
  const byOption=new Map(reviewedOptions.map((label,i)=>[label,facts.roles[i]])),askedRole=facts.roles[criteria[0]];
  const truth=options.map(label=>byOption.get(label)===askedRole);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));
  for(const term of facts.explanationTerms[criteria[0]])assert(body.explanation.includes(term),`missing independent explanation term ${term}`);
}
