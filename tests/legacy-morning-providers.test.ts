import test from "node:test";
import assert from "node:assert/strict";
import {effectivePublicDefinitions} from "../src/core/generators/effective-public";
import {makeLegacyMorningProviders} from "../src/core/generators/legacy-morning-providers";
import {developmentOperationsOracle as oracle,developmentOperationsReview as review} from "./fixtures/development-operations-review";
import {contentHash} from "../src/core/hash";
import reviewed from "../src/core/generators/reviewed-contracts/legacy-2017-modern.json";

test("AM composition owns its reviewed operation dependency without executing or changing the public generator",async()=>{
 const publicBefore=effectivePublicDefinitions.map(({build,...metadata})=>metadata),calls:number[]=[];
 const publicPool=effectivePublicDefinitions.map(d=>d.source==="2024-a-14"?{...d,build:()=>{calls.push(1);throw Error("public implementation must not execute")}}:d);
 const providers=makeLegacyMorningProviders(publicPool),local=providers.find(d=>d.source==="2024-a-14")!;
 assert.notEqual(local,publicPool.find(d=>d.source===local.source));
 assert.deepEqual(providers.filter(d=>d.source!==local.source),publicPool.filter(d=>d.source!==local.source));
 const {build,...metadata}=local;assert.equal(await contentHash(metadata),reviewed.rows.find(r=>r.canonical.metadata.source===local.source)!.canonical.metadataSha256);
 let accepted=0,rejected=0;
 for(let bits=0;bits<16;bits++){
  const values=[0,1,2,3].map(i=>(bits>>i)&1);
  if(!review.valid.some(v=>JSON.stringify(v)===JSON.stringify(values))){assert.throws(()=>build(values),/PARAMETER_CONSTRAINT/);rejected++;continue;}
  const body=build(values);oracle(body,values);accepted++;
  const changed=structuredClone(body);changed.correctIndex=(changed.correctIndex!+1)%4;assert.throws(()=>oracle(changed,values));
 }
 assert.deepEqual({accepted,rejected},{accepted:4,rejected:12});assert.deepEqual(calls,[]);
 assert.deepEqual(effectivePublicDefinitions.map(({build,...metadata})=>metadata),publicBefore);
});

test("AM provider requires exactly one public identity and owns descriptor arrays",()=>{
 assert.throws(()=>makeLegacyMorningProviders(effectivePublicDefinitions.filter(d=>d.source!=="2024-a-14")),/MORNING_PROVIDER_REQUIRED/);
 assert.throws(()=>makeLegacyMorningProviders([...effectivePublicDefinitions,effectivePublicDefinitions.find(d=>d.source==="2024-a-14")!]),/MORNING_PROVIDER_REQUIRED/);
 const a=makeLegacyMorningProviders(effectivePublicDefinitions).find(d=>d.source==="2024-a-14")!,b=makeLegacyMorningProviders(effectivePublicDefinitions).find(d=>d.source==="2024-a-14")!;
 a.fields[0].minimum=-1;a.reference[0]=1;assert.equal(b.fields[0].minimum,0);assert.deepEqual(b.reference,[0,0,1,0]);
 for(const invalid of[[],[0,0],[0,0,1,0,0],[0,.5,1,0],[0,NaN,1,0]])assert.throws(()=>b.build(invalid),/PARAMETER_CONSTRAINT/);
});
