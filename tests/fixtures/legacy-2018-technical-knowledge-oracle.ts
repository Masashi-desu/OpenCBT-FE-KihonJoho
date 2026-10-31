import assert from "node:assert/strict";
import type {Block} from "../../src/core/types";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018TechnicalKnowledgeReview as reviews,legacy2018TechnicalKnowledgeFacts as facts} from "./legacy-2018-technical-knowledge-review";
function text(block:Block){assert.equal(block.type,"paragraph");assert(block.type==="paragraph");return block.text;}
export function legacy2018TechnicalKnowledgeOracle(source:string,body:GeneratedBody,v:number[]){
 const r=reviews.find(r=>`${r.collection}-${r.number}`===source);assert(r);const expected=r.choices.slice();let truth:boolean[],explanation:string[];
 assert.equal(body.choices.length,4);
 if(r.number===3){const f=facts[3];assert.deepEqual(body.prompt.map(text),[f.stem]);assert.equal(v.length,3);for(const [j,i] of [0,1,3].entries()){assert(v[j]===0||v[j]===1);if(v[j])expected[i]=f.changed[j];}truth=f.truth.slice();explanation=f.explanation;}
 else if(r.number===28){const f=facts[28];assert.equal(v.length,3);assert.equal(body.prompt.length,2);assert.equal(text(body.prompt[0]),f.stem);const code=body.prompt[1];assert(code.type==="code");assert.equal(code.language,"sql");assert.equal(code.text,f.code);for(let j=0;j<3;j++){assert(v[j]===0||v[j]===1);expected[j+1]=f.falseObjects[j][v[j]];}truth=expected.map(name=>f.meanings[name as keyof typeof f.meanings]==="現在行への位置付け");for(const name of expected)assert(name in f.meanings);explanation=f.explanation;}
 else if(r.number===34){const f=facts[34];assert.deepEqual(body.prompt.map(text),[f.stem]);assert.equal(v.length,3);for(let j=0;j<3;j++){assert(v[j]===0||v[j]===1);expected[j+1]=f.falseFields[j][v[j]];}truth=expected.map(name=>f.meanings[name as keyof typeof f.meanings]==="盲写宛先");for(const name of expected)assert(name in f.meanings);explanation=f.explanation;}
 else{assert.equal(r.number,43);const f=facts[43];assert.equal(v.length,1);assert(Number.isInteger(v[0])&&v[0]>=0&&v[0]<4);assert.deepEqual(body.prompt.map(text),[f.prefix+f.functions[v[0]]+f.suffix,...f.premises]);const need=new Set(f.needs[v[0]]),eligible=f.grants.map(grant=>[...need].every(n=>grant.includes(n)));const costs=f.grants.map((grant,i)=>eligible[i]?grant.filter(n=>!need.has(n)).length:Infinity),minimum=Math.min(...costs);truth=costs.map(c=>c===minimum);explanation=f.explanation;}
 assert.deepEqual(body.choices.map(bs=>{assert.equal(bs.length,1);return text(bs[0]);}),expected);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));for(const part of explanation)assert(body.explanation.includes(part),part);return truth;
}
