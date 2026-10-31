import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018SystemReview as reviews,legacy2018SystemFacts as facts} from "./legacy-2018-system-review";
export function legacy2018SystemOracle(source:string,body:GeneratedBody,values:number[]){
  const r=reviews.find(r=>`${r.collection}-${r.number}`===source),f=facts[source];assert(r&&f);assert.equal(values.length,1);assert(Number.isInteger(values[0])&&values[0]>=0&&values[0]<f.targets.length);
  assert.equal(body.prompt.length,1);assert(body.prompt[0].type==="paragraph");const targets=f.targets.flatMap((regex,i)=>regex.test(body.prompt[0].type==="paragraph"?body.prompt[0].text:"")?[i]:[]);assert.deepEqual(targets,[values[0]]);
  assert.equal(body.choices.length,4);const options=body.choices.map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==="paragraph");return bs[0].text;}),reviewed=r.choices.map((s,i)=>f.overrides?.[values[0]]?.[i]??s);assert.deepEqual(options,reviewed);
  const roles=new Map(reviewed.map((s,i)=>[s,f.optionRoles[i]])),truth=options.map(s=>roles.get(s)===f.askedRoles[targets[0]]);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));
  for(const term of f.explanationTerms[values[0]])assert(body.explanation.includes(term),term);return truth;
}
