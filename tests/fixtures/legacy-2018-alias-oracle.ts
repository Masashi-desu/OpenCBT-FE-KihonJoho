import assert from "node:assert/strict";
import type { GeneratedBody } from "../../src/core/generators/definition";
import { legacy2018CanonicalAliases } from "../../src/core/generators/legacy-2018-aliases";
import facts from "./knowledge-pairs.json";

export function legacy2018AliasOracle(source:string,body:GeneratedBody,values:number[]){
  const alias=legacy2018CanonicalAliases.find(a=>a.source===source);assert(alias);
  const fact=facts.find(f=>f.source===alias.canonicalSource);assert(fact);const [target]=values,prose=body.prompt.map(b=>b.type==="paragraph"?b.text:"").join(""),options=body.choices.map(c=>c.map(b=>b.type==="paragraph"?b.text:"").join(""));
  assert(!prose.includes("誤っている"));assert.equal(options.length,4);assert.equal(new Set(options).size,4);
  let truth:number[];
  if(fact.answerForm==="statements"){
    assert.match(prose,/LAN間接続装置に関する記述/);
    const all=new Set(fact.pairs.flatMap(([name])=>fact.pairs.map(([,meaning])=>`${name}は、${meaning}。`)));
    assert(options.every(c=>all.has(c)));truth=options.flatMap((c,i)=>fact.pairs.some(([name,meaning])=>c===`${name}は、${meaning}。`)?[i]:[]);
  }else{const term=fact.answerForm==="term";assert(prose.includes(fact.pairs[target][term?1:0]));assert(options.every(c=>fact.pairs.some(pair=>pair[term?0:1]===c)));truth=options.flatMap((c,i)=>c===fact.pairs[target][term?0:1]?[i]:[]);}
  assert.deepEqual(truth,[body.correctIndex]);assert(body.explanation.includes(fact.pairs[target][0]));assert(body.explanation.includes(fact.pairs[target][1]));
}
