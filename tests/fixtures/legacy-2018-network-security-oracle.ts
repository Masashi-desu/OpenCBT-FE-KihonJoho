import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018NetworkSecurityReview as reviews,legacy2018NetworkSecurityFixedFacts as fixed,legacy2018NetworkSecurityOtherFacts as facts} from "./legacy-2018-network-security-review";
const text=(body:GeneratedBody)=>body.prompt.map(block=>{assert(block.type==="paragraph");return block.text;}).join("\n");
const options=(body:GeneratedBody)=>body.choices.map(choice=>{assert.equal(choice.length,1);assert(choice[0].type==="paragraph");return choice[0].text;});
const result=(body:GeneratedBody,truth:boolean[])=>{assert.equal(truth.length,4);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));return truth;};
type Actor="A"|"B"|"C";
type Key=`${Actor}-${"public"|"private"}`;
/** Fixed conceptual key-pair model, not a cryptographic implementation or
 * an assumption that a small numeric RSA example proves security. */
const cryptoClaims:Record<string,{actors:Actor[];keys:Key[]}>={
  "only-B-uses-A-public":{actors:["B"],keys:["A-public"]},
  "only-B-uses-B-private":{actors:["B"],keys:["B-private"]},
  "B-and-C-use-B-public":{actors:["B","C"],keys:["B-public","B-public"]},
  "B-and-C-use-own-private":{actors:["B","C"],keys:["B-private","C-private"]},
  "only-B-uses-A-private":{actors:["B"],keys:["A-private"]},
  "B-and-C-use-A-private":{actors:["B","C"],keys:["A-private","A-private"]},
  "only-C-uses-C-private":{actors:["C"],keys:["C-private"]},
};
export function independentKeyClaim(role:string){
  const claim=cryptoClaims[role];assert(claim,role);
  const available=claim.actors.map((actor,i)=>claim.keys[i].endsWith("public")||claim.keys[i]===`${actor}-private`);
  const matchedPair=claim.keys.map(key=>key==="B-private");
  return{actors:claim.actors,available,matchedPair,truth:available.every(Boolean)&&matchedPair.every(Boolean)};
}
/** Fixed distance scores: a smaller distance is accepted below threshold.
 * This enumerates an illustrative receiver; it is not device performance. */
export function independentBiometricThresholds(){
  const genuine=[1,2,3,4],impostor=[3,4,5,6];
  const rows=Array.from({length:8},(_,threshold)=>({threshold,rejects:genuine.filter(d=>d>threshold).length,accepts:impostor.filter(d=>d<=threshold).length}));
  for(let i=1;i<rows.length;i++){assert(rows[i].rejects<=rows[i-1].rejects);assert(rows[i].accepts>=rows[i-1].accepts);}
  assert.deepEqual(rows[2],{threshold:2,rejects:2,accepts:0});assert.deepEqual(rows[4],{threshold:4,rejects:0,accepts:2});assert(!rows.some(r=>r.rejects===0&&r.accepts===0));return rows;
}
const thresholdRows=independentBiometricThresholds();
const inClientRange=(value:number)=>Number.isInteger(value)&&value>=1024&&value<=65535;
export function independentPortRule(rows:string[][],service:string,port:number){
  assert.equal(rows.length,2);assert(rows.every(r=>r.length===4));
  const matchPort=(cell:string,n:number)=>cell==="1024以上"?inClientRange(n):Number(cell)===n;
  const probes=[1024,32768,49152,65535];
  const permits=(from:string,to:string,sourcePort:number,destinationPort:number)=>rows.some(r=>r[0]===from&&r[1]===to&&matchPort(r[2],sourcePort)&&matchPort(r[3],destinationPort));
  return probes.every(client=>permits("PC",service,client,port)&&permits(service,"PC",port,client));
}
export function legacy2018NetworkSecurityOracle(source:string,body:GeneratedBody,values:number[]){
  const r=reviews.find(r=>`${r.collection}-${r.number}`===source);assert(r,source);assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);assert.equal(body.choices.length,4);assert.equal(body.prompt.length,1);const number=r.number;
  if(fixed[number]){
    const f=fixed[number];assert.equal(values.length,3);assert(values.every(n=>n===0||n===1));assert.equal(text(body),f.stem);
    const choices=options(body),correct=f.roles.indexOf(f.correctRole),wrong=[0,1,2,3].filter(i=>i!==correct),expected=[...r.choices];wrong.forEach((i,j)=>{if(values[j]===1)expected[i]=f.changes[j];});assert.deepEqual(choices,expected);
    const roleMap=new Map(r.choices.map((s,i)=>[s,f.roles[i]]));f.changes.forEach((s,i)=>roleMap.set(s,f.changedRoles[i]));assert.equal(roleMap.size,7);assert.equal(new Set([...f.roles,...f.changedRoles]).size,7);assert.equal(f.counterexamples.length,3);for(const term of f.explanationTerms)assert(body.explanation.includes(term),term);
    const truth=choices.map(s=>{const role=roleMap.get(s);assert(role);return number===38?independentKeyClaim(role).truth:role===f.correctRole;});return result(body,truth);
  }
  assert.equal(values.length,1);assert(Number.isInteger(values[0]));const condition=values[0];
  if(number===33){assert(condition>=0&&condition<4);assert.equal(text(body),facts.commandStems[condition]);assert.deepEqual(options(body),r.choices);const roleByChoice=new Map(r.choices.map((s,i)=>[s,facts.commandRoles[i]]));for(const term of ["直前に使用","Address Resolution Protocol","待受けポート","-a","ICMP","往復時間"])assert(body.explanation.includes(term),term);return result(body,options(body).map(s=>roleByChoice.get(s)===facts.commandRoles[condition]));}
  if(number===35){assert(condition>=0&&condition<4);assert.equal(text(body),facts.webStems[condition]);assert.deepEqual(options(body),r.choices);const roleByChoice=new Map(r.choices.map((s,i)=>[s,facts.webRoles[i]]));for(const term of ["Common Gateway Interface","Hypertext Markup Language","Multipurpose Internet Mail Extensions","Uniform Resource Locator","全てCGIで動くという意味ではない"])assert(body.explanation.includes(term),term);return result(body,options(body).map(s=>roleByChoice.get(s)===facts.webRoles[condition]));}
  if(number===44){assert(condition>=0&&condition<4);const f=facts.ports[condition],server=`${f.name}サーバ`;assert.equal(text(body),`社内ネットワークとインターネットの接続点に、ステートフルインスペクション機能をもたない、静的なパケットフィルタリング型のファイアウォールを設置している。このネットワーク構成において、社内のPCからインターネット上の${f.operation}できるようにするとき、ファイアウォールで通過を許可するTCPパケットのポート番号の組合せはどれか。ここで、${f.name}通信には、デフォルトのポート番号を使うものとする。`);
    const selected=body.choices.map((choice,i)=>{assert.equal(choice.length,1);const t=choice[0];assert(t.type==="table");assert.equal(t.caption,"往路と復路で許可するパケット");assert.deepEqual(t.columns,facts.portColumns);assert.equal(t.rows.length,2);const n=String(i%2===0?f.port:f.comparison),high="1024以上",expected=i<2?[["PC",server,n,high],[server,"PC",high,n]]:[["PC",server,high,n],[server,"PC",n,high]];assert.deepEqual(t.rows,expected);return independentPortRule(t.rows,server,f.port);});
    for(const term of [`デフォルトのサーバポートは${f.port}`,"往路と復路をともに許可",`${f.comparison}はこの対象サービスのサーバポートではなく`,"全OSの既定の動的ポート範囲","Simple Mail Transfer Protocol","Post Office Protocol version 3","Internet Message Access Protocol","Hypertext Transfer Protocol"])assert(body.explanation.includes(term),term);return result(body,selected);
  }
  if(number===45){assert(condition>=0&&condition<3);assert.equal(text(body),"生体認証システムを導入するときに考慮すべき点として、最も適切なものはどれか。");const selected=options(body),expected=[...r.choices];expected[1]=facts.biometricCorrect[condition];assert.deepEqual(selected,expected);const strict=thresholdRows[2],loose=thresholdRows[4];assert(strict.rejects>loose.rejects&&strict.accepts<loose.accepts);for(const term of ["双方を考える","しきい値を厳しく","本人の拒否が増える場合","緩くするとこの向きが逆","両方を同時にゼロへできるとは限らない","知識認証"])assert(body.explanation.includes(term),term);return result(body,selected.map(s=>facts.biometricCorrect.includes(s)));}
  assert.equal(number,46);assert(condition>=0&&condition<4);assert.equal(text(body),facts.objectStems[condition]);assert.deepEqual(options(body),r.choices);const roleByChoice=new Map(r.choices.map((s,i)=>[s,facts.objectRoleByOption[i]]));for(const term of ["属性や機能をサブクラスで利用","内部の実装を隠す","同じメッセージ","同じ定義とはしない","privateメンバ"])assert(body.explanation.includes(term),term);return result(body,options(body).map(s=>roleByChoice.get(s)===facts.objectAskedRoles[condition]));
}
