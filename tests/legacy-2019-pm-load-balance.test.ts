/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Legacy2019SpringNetworkMemoryFigure as Legacy2019Figure} from "../src/ui/Legacy2019SpringNetworkMemoryFigure";
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019AfternoonLoadBalanceDefinitions,legacy2019LoadBalanceAddresses,legacy2019LoadBalanceFigureAlt} from "../src/core/generators/legacy-2019-pm-load-balance";
import {legacy2019PmLoadBalanceReview as review} from "./fixtures/legacy-2019-pm-load-balance-review";
import {legacy2019Afternoon} from "./fixtures/legacy-2019-spring-local-scope";
import {assertLegacy2019LoadBalance as oracle,reviewedQueueWait,reviewedBalance} from "./fixtures/legacy-2019-pm-load-balance-oracle";
import {compoundQuestion} from "./fixtures/compound-question";
import {bindBodyAnswers} from "../src/core/generators/definition";
import {gradeAnswer,validateAnswerDefinition} from "../src/core/answers";
const d=legacy2019AfternoonLoadBalanceDefinitions[0],inputs=()=>Array.from({length:4},(_,n)=>Array.from({length:3},(_,t)=>[n,t])).flat();
test("2019 spring PM4 keeps five source pages, all five official slots, original seven addresses, formula and every 6/4/4/4/4 alternative",()=>{
  const q=legacy2019Afternoon["2019h31h-fe-pm"][3];assert.deepEqual(q.pages,[18,22]);assert.deepEqual(q.slots.map(s=>s.answer),[...review.sourceAnswers]);assert.deepEqual(d.reference,[...review.reference]);assert.deepEqual(legacy2019LoadBalanceAddresses(0),review.originalAddresses);const b=d.build(d.reference);oracle(d.source,b,d.reference);assert.deepEqual(b.choices.slice(18).map(bs=>{assert(bs[0].type==="paragraph");return bs[0].text;}),[...review.originalNumbers.waitingChoices]);assert.equal(b.partAnswers!.map((a,i)=>a.kind==="choice"?"アイウエオカ"[b.answerParts![i].choiceIds.indexOf(a.choiceId)]:"?").join(""),"イアウアイ");assert.equal(d.answerVariation,undefined);
});
test("2019 load-balancing all 12 full-major inputs use independent affinity/fact and stationary queue oracles with fixed source precision and premise mutations",()=>{
  const unique=new Set<string>(),waiting=new Set<string>();for(const v of inputs()){const b=d.build(v);oracle(d.source,b,v);unique.add(JSON.stringify(b));waiting.add(JSON.stringify(b.choices[19]));for(let i=0;i<5;i++){const bad=structuredClone(b),a=bad.partAnswers![i];assert(a.kind==="choice");a.choiceId=bad.answerParts![i].choiceIds[(bad.answerParts![i].choiceIds.indexOf(a.choiceId)+1)%bad.answerParts![i].choiceIds.length];assert.throws(()=>oracle(d.source,bad,v),{name:"AssertionError"});}}
  assert.equal(unique.size,12);assert.equal(waiting.size,3);for(const missing of ["ログインしてからログアウトするまで","交互に振り分けられる","小数第3位を四捨五入","処理時間は変わらない"]){const b=d.build(d.reference);b.prompt=b.prompt.map(p=>p.type==="paragraph"?{...p,text:p.text.replace(missing,"")}:p);assert.throws(()=>oracle(d.source,b,d.reference),{name:"AssertionError"});}
  const bad=d.build(d.reference);assert(bad.choices[19][0].type==="paragraph");bad.choices[19][0].text="0.03";assert.throws(()=>oracle(d.source,bad,d.reference),{name:"AssertionError"});for(const v of [[4,0],[-1,0],[0,3],[0,-1],[0,.5],[0],[0,0,0]])assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);for(const v of [[],[4],[-1],[.5],[0,1]])assert.throws(()=>legacy2019LoadBalanceFigureAlt(v),/PARAMETER_CONSTRAINT/);
});
test("2019 stationary geometric queue sum agrees with a separate exact rational benchmark and distinguishes waiting from total time",()=>{
  const cases=[[.4,2.3,23,5],[.4,1.15,46,135],[.2,4.6,23,10],[.2,2.3,23,135],[.1,9.2,23,20],[.1,4.6,23,270]];for(const[s,a,numerator,denominator]of cases){const wait=reviewedQueueWait(s,a);assert(Math.abs(wait-numerator/denominator)<1e-12);assert(wait+s>wait);assert(wait>0);}assert.equal(reviewedQueueWait(.4,0),0);assert.throws(()=>reviewedQueueWait(.4,2.5),{name:"AssertionError"});
});
test("2019 proxy/source affinity and cookie affinity maintain sessions over all 720 permutations of six client requests",()=>{
  const permutations=(a:number[]):number[][]=>a.length?a.flatMap((n,i)=>permutations(a.filter((_,j)=>i!==j)).map(t=>[n,...t])):[[]];let checked=0;for(const order of permutations([0,1,2,3,4,5])){const initial=order.map(client=>({client,proxy:0,cookie:null,responseCookie:`session-${client}`})),follow=[...initial].reverse().map(r=>({...r,cookie:r.responseCookie})),a=reviewedBalance([...initial,...follow],"sourceIP"),b=reviewedBalance([...initial,...follow],"cookie");assert.deepEqual(a,Array(12).fill(0));assert.equal(b.slice(0,6).filter(n=>n===0).length,3);for(let i=0;i<6;i++)assert.equal(b[i],b[11-i]);checked++;}assert.equal(checked,720);
  assert.throws(()=>reviewedBalance([{client:0,proxy:0,cookie:"not-recorded"}],"cookie"),/UNSPECIFIED_COOKIE/);
  assert.deepEqual(reviewedBalance([{client:0,proxy:0,cookie:null},{client:1,proxy:0,cookie:null}],"cookie"),[0,1]);
});
test("2019 load-balance all five parts preserve IDs and grading through saved JSON for every input",()=>{
  for(const v of inputs()){const body=d.build(v),q=compoundQuestion();q.prompt.blocks=body.prompt;q.answerParts=body.answerParts;q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:q.prompt.attribution,blocks}}));bindBodyAnswers(q,body,q.correctAnswer.attribution);const saved=JSON.parse(JSON.stringify(q));validateAnswerDefinition(saved);const selected=Object.fromEntries(q.correctAnswer.parts!.map(a=>{assert(a.kind==="choice");return[a.partId,a.choiceId];}));assert.equal(gradeAnswer(saved,{selectedPartChoices:selected}).outcome,"correct");for(const part of q.answerParts!){const wrong={...selected,[part.id]:part.choiceIds.find(id=>id!==selected[part.id])!};assert.equal(gradeAnswer(saved,{selectedPartChoices:wrong}).parts!.filter(p=>p.outcome==="correct").length,4);}}
});

test("2019 load-balance managed graph contains all seven assigned addresses, both NICs, clients and two application-server labels in every diagram",()=>{
  for(let n=0;n<4;n++){const html=renderToStaticMarkup(createElement(Legacy2019Figure,{profile:"legacy-2019-load-balance-network",values:[n],caption:"図1"})),a=legacy2019LoadBalanceAddresses(n),ips=[...html.matchAll(/<text[^>]*data-network-role="([^"]+)"[^>]*>([^<]+)<\/text>/g)];assert.equal(ips.length,7);assert.deepEqual(Object.fromEntries(ips.map(m=>[m[1],m[2]])),a);for(const name of ["教室","DNSサーバ","負荷分散装置","サーバ1","サーバ2","コンテンツ","プロキシ","x.x.x.x"])assert(html.includes(name),name);assert.equal((html.match(/>クライ<\/text>/g)??[]).length,3);assert.equal((html.match(/>アント<\/text>/g)??[]).length,3);assert(html.includes('viewBox="0 0 1290 650"'));assert(html.includes('x1="580" y1="405" x2="615" y2="405"'));assert(html.includes('x1="795" y1="405" x2="870" y2="405"'));}
});
