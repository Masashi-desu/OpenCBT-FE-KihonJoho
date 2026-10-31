import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018FundamentalReview as reviews,legacy2018FundamentalFacts as facts} from "./legacy-2018-fundamental-review";
export function legacy2018FundamentalOracle(source:string,body:GeneratedBody,values:number[]){
  const review=reviews.find(r=>`${r.collection}-${r.number}`===source),fact=facts[source];assert(review&&fact);
  assert.equal(values.length,1);assert(Number.isInteger(values[0])&&values[0]>=0&&values[0]<=3);
  assert.equal(body.prompt.length,1);assert(body.prompt[0].type==="paragraph");const prompt=body.prompt[0].text;
  const targets=fact.targets.flatMap((r,i)=>r.test(prompt)?[i]:[]);assert.deepEqual(targets,[values[0]],"displayed target and all supplied conditions must match a unique reviewed role");
  const expectedOptions=review.choices.map((s,i)=>fact.overrides?.[targets[0]]?.[i]??s);
  assert.equal(body.choices.length,4);const options=body.choices.map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==="paragraph");return bs[0].text;});assert.deepEqual(options,expectedOptions);
  const roleByText=new Map(expectedOptions.map((s,i)=>[s,fact.roles[i]])),targetRole=fact.roles[targets[0]],truth=options.map(s=>roleByText.get(s)===targetRole);
  assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));
  for(const term of fact.explanationTerms[targets[0]])assert(body.explanation.includes(term),term);
  return truth;
}
