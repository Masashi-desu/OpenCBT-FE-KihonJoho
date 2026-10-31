import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018AutumnNetworkTargetFacts as targets,legacy2018AutumnNetworkFixedFacts as fixed} from "./legacy-2018-autumn-network-review";
/** Exact approved assertions are independent literals. All choices are looked
 * up in reviewed role facts, never in the generator's answer calculation. */
export function legacy2018AutumnNetworkOracle(source:string,b:GeneratedBody,v:number[]){
 const n=Number(source.split("-").at(-1)),t=targets.find(t=>t.number===n),f=fixed.find(f=>f.number===n);assert(t||f);assert.equal(source,`2018h30a-fe-am-${n}`);assert.equal(b.prompt.length,1);assert.equal(b.prompt[0].type,"paragraph");assert.equal(b.choices.length,4);const text=(b.prompt[0] as {text:string}).text;
 const actual=b.choices.map(bs=>{assert.equal(bs.length,1);assert.equal(bs[0].type,"paragraph");return(bs[0] as {text:string}).text;});let truth:boolean[],terms:string[];
 if(t){assert.equal(v.length,1);assert(t.valid.includes(v[0]));assert.equal(text,t.prompts[v[0]]);assert.deepEqual(actual,t.choices);truth=t.truth[v[0]]!;terms=t.explanation[v[0]];assert.equal(t.choiceFacts.length,4);}
 else {assert(f);assert.equal(v.length,f.variedIndices.length);assert(v.every(n=>n===0||n===1));assert.equal(text,f.prompt);const expected=f.original.map((s,i)=>{const at=f.variedIndices.indexOf(i);return at>=0&&v[at]===1?f.changed[at]:s;});assert.deepEqual(actual,expected);const reviewed=new Map<string,boolean>([...f.original.map((s,i)=>[s,i===f.correct] as const),...f.changed.map(s=>[s,false] as const)]);truth=actual.map(s=>{assert(reviewed.has(s));return reviewed.get(s)!;});terms=f.explanation;assert.equal(f.roles.length,4);assert.equal(f.falseReasons.length,3);}
 assert.equal(new Set(actual).size,4);assert.equal(truth.filter(Boolean).length,1);assert.equal(b.correctIndex,truth.indexOf(true));for(const term of terms)assert(b.explanation.includes(term),`${source}:${v}:${term}`);assert(!/原資料では[アイウエ]が|[アイウエ]が正答/.test(b.explanation));assert(!/転載したものでは|資料本文.*転載/.test(b.explanation));return truth;
}
/** Tiny independent message/key countermodel. It proves the false claims are
 * logically distinct, not cryptographic security of XOR or a product. */
export function legacy2018AutumnNetworkKeyCounterexamples(){let pairChecks=0,wrongKeyFailures=0,publishedKeyRecoveries=0;for(let message=0;message<16;message++)for(let encryptKey=0;encryptKey<16;encryptKey++){const cipher=message^encryptKey;assert.equal(cipher^encryptKey,message);publishedKeyRecoveries++;for(let unrelated=0;unrelated<16;unrelated++)if(unrelated!==encryptKey){assert.notEqual(cipher^unrelated,message);wrongKeyFailures++;}pairChecks++;}assert.equal(pairChecks,256);assert.equal(wrongKeyFailures,3840);return{pairChecks,wrongKeyFailures,publishedKeyRecoveries};}
