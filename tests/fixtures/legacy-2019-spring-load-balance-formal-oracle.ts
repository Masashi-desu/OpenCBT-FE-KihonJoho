/** Independent formal oracle facet extracted from the unchanged historical oracle. No old prompt/DOM is synthesized. Only source-form-only structural checks are delegated to separately reviewed source gold; actual choices/answers/computation/displayed conditions below remain live. */
import assert from "node:assert/strict";
import type {Block} from "../../src/core/types";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2019PmLoadBalanceReview as review} from "./legacy-2019-pm-load-balance-review";
const text=(bs:Block[])=>bs.map(b=>b.type==="paragraph"?b.text.replaceAll("，","、"):b.type==="formula"?b.text:"").join("\n");
const choice=(bs:Block[])=>{assert.equal(bs.length,1);assert(bs[0].type==="paragraph");return bs[0].text.replaceAll("，","、");};
/** Independent stationary-distribution evaluation: P(N=n)=(1-rho)*rho^n.
 * Sum the expected number waiting (N-1)+, then Little's law Lq/lambda.
 * 512 states leave an error below 1e-14 at the largest reviewed rho=.92. */
export function reviewedQueueWait(service:number,arrival:number){const rho=service*arrival;assert(rho>=0&&rho<1);if(arrival===0)return 0;let probability=1-rho,expectedWaiting=0;for(let n=0;n<512;n++){expectedWaiting+=Math.max(0,n-1)*probability;probability*=rho;}return expectedWaiting/arrival;}
export type ReviewedRequest={client:number;proxy:number;cookie:string|null;responseCookie?:string};
/** IP affinity and HTTP session affinity are distinct independent state maps.
 * Repeated cookies stay on their recorded server; initial requests round-robin. */
export function reviewedBalance(requests:ReviewedRequest[],kind:"sourceIP"|"cookie"){const assignments=new Map<string,number>();let next=0;return requests.map(r=>{const key=kind==="sourceIP"?`proxy:${r.proxy}`:r.cookie;if(key!==null&&assignments.has(key))return assignments.get(key)!;if(kind==="cookie"&&key!==null)throw Error("UNSPECIFIED_COOKIE");const server=next++%2;if(kind==="sourceIP")assignments.set(key!,server);else if(r.responseCookie)assignments.set(r.responseCookie,server);return server;});}
export function assertLegacy2019LoadBalance(source:string,body:GeneratedBody,values:number[]){
  assert.equal(source,review.source);const[network,scenario]=values,prompt=text(body.prompt),t=review.timeScenarios[scenario],service=t.serviceHundredths/100,arrival=t.arrivalHundredths/100;
  assert.equal(body.correctIndex,undefined);assert.equal(body.choices.length,22);assert.deepEqual(body.answerParts?.map(p=>p.choiceIds.length),[6,4,4,4,4]);assert.equal(body.partAnswers?.length,5);review.premises.forEach(p=>assert(prompt.includes(p),p));
  const a={dns:`192.0.2.${1+network*10}`,publicBalancer:`192.0.2.${2+network*10}`,privateBalancer:`192.168.${network}.254`,app1:`192.168.${network}.1`,app2:`192.168.${network}.2`,content:`192.168.${network}.3`,proxy:`198.51.100.${1+network*10}`};
  const f=body.prompt.filter((b):b is Extract<GeneratedBody["prompt"][number],{type:"diagram"}>=>b.type==="diagram"&&b.scene.kind==="source_figure"&&b.scene.profile==="legacy-2019-load-balance-network");assert.equal(f.length,1);assert(f[0].scene.kind==="source_figure");assert.equal(f[0].scene.profile,"legacy-2019-load-balance-network");assert.deepEqual(f[0].scene.values,[network]);Object.values(a).forEach(ip=>assert(f[0].alt.includes(ip),ip));for(const s of ["教室","インターネット","外部側LAN","内部LAN","アプリケーションサーバ1","アプリケーションサーバ2","コンテンツサーバ","x.x.x.x"])assert(f[0].alt.includes(s),s);
  const formulas=body.prompt.filter(b=>b.type==="formula");assert.equal(formulas.length,1);assert.equal(formulas[0].text,"平均処理待ち時間 ＝ ρ／(1 − ρ) × 平均処理時間");assert(prompt.includes("利用率 ＝ λ／μ"));assert(prompt.includes("処理率（＝平均処理時間の逆数）"));
  assert(prompt.includes(`平均処理時間は${service.toFixed(2)}秒`));assert(prompt.includes(`平均到着率は${arrival.toFixed(2)}件／秒`));const old=reviewedQueueWait(service,arrival),newWait=reviewedQueueWait(service,arrival/2),oldCents=Math.round(old*100),newCents=Math.round(newWait*100);assert.equal(oldCents,t.expectedOldWaitingHundredths);assert.equal(newCents,t.expectedNewWaitingHundredths);assert(prompt.includes(`${(oldCents/100).toFixed(2)}秒となる`));
  assert(Math.abs(service*arrival-.92)<1e-12);assert(Math.abs(service*arrival/2-.46)<1e-12);assert(Number.isInteger(t.arrivalHundredths/2),"derive per-server arrivals without introducing third-decimal arithmetic");
  const choices=body.choices.map(choice),aChoices=choices.slice(0,6),bChoices=choices.slice(6,10),cChoices=choices.slice(10,14),dChoices=choices.slice(14,18),waiting=choices.slice(18);
  assert.deepEqual(aChoices,review.roles.a.map(role=>a[role as keyof typeof a]));assert.deepEqual(bChoices,review.roles.b.map(pair=>pair.map(role=>a[role as keyof typeof a]).join(" と ")));
  const aTruth=aChoices.map(ip=>ip===a.publicBalancer),wanted=[a.app1,a.app2].sort(),bTruth=bChoices.map(s=>JSON.stringify(s.split(" と ").sort())===JSON.stringify(wanted));
  // Fixed semantic facts are reviewed independently: only a session identifier
  // carried in cookie distinguishes each browser behind a shared proxy.
  assert.deepEqual(cChoices,["DNSサーバのIPアドレス","アプリケーションサーバとコンテンツサーバのポート番号","セッションIDを示すcookie","負荷分散装置のIPアドレス"]);
  assert.deepEqual(dChoices,["同じ教室のどのクライアントからの要求も送信元IPアドレスが全て同じになること。","クライアントから送られてきたIPパケット内の送信先アドレスが変換されること。","負荷分散装置が送信元IPアドレスの情報を用いるだけの単純な機能なので、高速に動作すること。","プロキシサーバを経由しても、HTTPヘッダの情報が変更されないこと。"]);
  const requests=Array.from({length:6},(_,client)=>({client,proxy:0,cookie:null,responseCookie:`session-${client}`}));assert.deepEqual(reviewedBalance(requests,"sourceIP"),[0,0,0,0,0,0]);assert.deepEqual(reviewedBalance(requests,"cookie"),[0,1,0,1,0,1]);
  waiting.forEach(s=>assert(/^\d+\.\d{2}$/.test(s),"uniform source display precision"));assert.deepEqual(waiting.map(s=>Math.round(Number(s)*100)),[...t.choices]);const waitingTruth=waiting.map(s=>Math.round(Number(s)*100)===newCents);assert.equal(new Set(waiting).size,4);assert(Number(waiting[0])<newWait&&newWait<Number(waiting[2])&&Number(waiting[2])<Number(waiting[3]));assert(Math.min(...waiting.map((s,i)=>i===1?Infinity:Math.abs(Number(s)-newCents/100)))>=.08-1e-12);
  const truths=[aTruth,bTruth,[...review.fixedChoiceTruth.c],[...review.fixedChoiceTruth.d],waitingTruth],offsets=[0,6,10,14,18];truths.forEach((truth,i)=>{assert.equal(truth.filter(Boolean).length,1);const part=body.answerParts![i],answer=body.partAnswers![i];assert.equal(part.id,`part-${"abcde"[i]}`);assert.deepEqual(part.choiceIds,truth.map((_,j)=>`choice-value-${offsets[i]+j+1}`));assert.equal(answer.kind,"choice");if(answer.kind==="choice"){assert.equal(answer.partId,part.id);assert.equal(answer.choiceId,part.choiceIds[truth.indexOf(true)]);}});
  for(const s of [...Object.values(a),"セッションID","cookie","送信元IP","M/M/1",service.toFixed(2),arrival.toFixed(2),(oldCents/100).toFixed(2),(newCents/100).toFixed(2),"0.92","0.46","到着率が2分の1","小数第3位を四捨五入"])assert(body.explanation.includes(s),s);
}
