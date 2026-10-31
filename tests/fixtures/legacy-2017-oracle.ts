import {legacy2017RenderedCostTable} from "./legacy-2017-cost-svg";
import assert from "node:assert/strict";
import type {Block} from "../../src/core/types";
import type {GeneratedBody} from "../../src/core/generators/definition";
const flatten=(blocks:Block[]):string=>blocks.map(b=>b.type==="paragraph"||b.type==="code"?b.text:b.type==="list"?b.items.join("\n"):b.type==="table"?[b.caption,...b.columns,...b.rows.flat()].join("\n"):"").join("\n");
const capture=(text:string,re:RegExp)=>{const m=text.match(re);assert.ok(m,`${re} in ${text}`);return m.slice(1).map(s=>Number(s.replaceAll(",","")));};
const f=(n:number)=>String(Number(n.toFixed(1)));
const choices=(body:GeneratedBody)=>body.choices.map(flatten);
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
function check(body:GeneratedBody,expected:string[],correct:string){
 assert.deepEqual(choices(body),expected);assert.equal(new Set(expected).size,4);assert.equal(expected.filter(s=>s===correct).length,1);assert.equal(choices(body)[body.correctIndex!],correct);assert.ok(body.explanation.includes(correct)||body.explanation.includes(correct.replaceAll(",","")),"explanation lacks independent conclusion");return correct;
}
/** Independently evaluate displayed inputs, not production definitions/answers.
 * Divisor enumeration, per-disk placement, exact integer ratios, decimal-unit
 * expansion, all system states, bit-string masking and inventory queues differ
 * from the production formulas. Every displayed distractor is checked too.
 */
export function legacy2017NumericOracle(source:string,body:GeneratedBody,values:number[]):string{
 const text=flatten(body.prompt),tables=body.prompt.filter((b):b is Extract<Block,{type:"table"}>=>b.type==="table");
 switch(source){
 case "2017h29h-fe-am-6":{
  const [x,y]=capture(text,/f\((\d+), (\d+)\)の値/);assert.deepEqual([x,y],[values[0]*25,values[0]*17]);assert.ok(text.includes("x mod yはxをyで割った余り"));assert.ok(text.includes("f(x, y): if y = 0 then return x else return f(y, x mod y)"));
  let divisor=1;for(let d=1;d<=Math.min(x,y);d++)if(x%d===0&&y%d===0)divisor=d;
  return check(body,["0",String(divisor),String(x%y),String(y)],String(divisor));
 }
 case "2017h29h-fe-am-11":{
  const [amount,capacity]=capture(text,/(\d+)Tバイトのデータ[\s\S]*容量が(\d+)Tバイト/);assert.deepEqual([amount,capacity],values);assert.ok(text.includes("RAID1")&&text.includes("フォーマット後")&&text.includes("少なくとも"));
  const disks=Array.from({length:amount/capacity},()=>[capacity,capacity]).flat();assert.equal(disks.reduce((a,b)=>a+b,0),2*amount);const base=disks.length/2;
  return check(body,[base,base+1,base+2,disks.length].map(String),String(disks.length));
 }
 case "2017h29h-fe-am-20":{
  const [bits]=capture(text,/分解能が(\d+)ビット/),[voltage]=capture(text,/電圧が([\d.]+)Vとなる場合/),[input]=capture(text,/ディジタル値(\d+)を入力したときの出力電圧が[\d.]+Vとなる場合/);
  assert.deepEqual([bits,voltage],[values[0],values[1]/2]);assert.equal(input.toString(2),"1"+"0".repeat(bits-1));assert.ok(text.includes("ディジタル値0")&&text.includes("出力電圧が0V")&&text.includes("最下位の1ビット"));
  const options=[input,2**bits-1,2**bits,2**(bits+1)].map(n=>`${f(voltage)}/${n}`),correct=options.filter(s=>{const [a,b]=s.split("/").map(Number);return Math.abs(a*input-voltage*b)<1e-9;});assert.equal(correct.length,1);return check(body,options,correct[0]);
 }
 case "2017h29h-fe-am-23":{
  const [current,rate,years]=capture(text,/顧客総数は([\d,]+)人[\s\S]*毎年(\d+)割[\s\S]*?(\d+)年後/);assert.deepEqual([current,rate,years],[values[0]*1000,values[1],values[2]]);assert.ok(text.includes("A〜Zの英大文字26種類")&&text.includes("少なくとも"));
  let population=current;for(let i=0;i<years;i++)population=population*(100+rate*10)/100;assert.ok(Number.isInteger(population));
  let capacity=1,n=0;do{capacity*=26;n++;}while(capacity<population);return check(body,["3","4","5","6"],String(n));
 }
 case "2017h29h-fe-am-30":{
  const [batch,count,speed]=capture(text,/伝票データを(\d+)件[\s\S]*平均([\d,]+)件[\s\S]*速度を(\d+)Mビット/);assert.deepEqual([count,batch,speed],[values[0]*10000,values[1],values[2]]);assert.ok(text.includes("2,000バイト/件")&&text.includes("400バイトのヘッダ")&&text.includes("1時間")&&text.includes("およそ"));
  // Scale to seconds after separately counting payload and packet headers.
  const payloadBits=count*2000*8,headerBits=count/batch*400*8,budget=speed*1000000*3600;
  const rate=(payloadBits+headerBits)*100/budget,answer=Math.round(rate),options=[Number((rate/8).toFixed(1)),Math.round(payloadBits*100/budget),answer,Math.round((payloadBits+count*400*8)*100/budget)];
  assert.ok(Math.min(...options.filter((_,i)=>i!==2).map(n=>Math.abs(n-answer)/answer))>=.04);return check(body,options.map(f),String(answer));
 }
 case "2017h29h-fe-am-78":{
  const [cost,prior,years]=capture(text,/取得価額は([\d,]+)千円[\s\S]*累計額は([\d,]+)千円[\s\S]*耐用年数は(\d+)年/);assert.deepEqual([cost,prior,years],[values[0]*1000,values[0]*100*values[1],values[2]*10]);assert.ok(text.includes("定額法")&&text.includes("会計期間は1年間")&&text.includes("残存価額は0円"));
  const annual=cost/years;assert.equal(Array.from({length:years},()=>annual).reduce((a,b)=>a+b),cost);return check(body,[prior/years,(cost-prior)/years,annual,(cost+prior)/years].map(String),String(annual));
 }
 case "2017h29a-fe-am-9":{
  const [ns]=capture(text,/平均命令実行時間が(\d+)ナノ秒/);assert.equal(ns,[20,25,50,100][values[0]]);assert.ok(text.includes("何MIPS"));
  const million=1000000,secondNs=1000000000,operations=secondNs/ns,answer=operations/million;return check(body,[answer/10,answer/5,ns,answer].map(String),String(answer));
 }
 case "2017h29a-fe-am-15":{
  const [up,down]=capture(text,/MTBFが(\d+)時間でMTTRが(\d+)時間/);assert.deepEqual([up,down],[values[0]*values[1],(10-values[0])*values[1]]);assert.ok(text.includes("二つ直列")&&text.includes("故障は独立"));
  const total=(up+down)**2;let serial=0,parallel=0;for(const a of [true,false])for(const b of [true,false]){const weight=(a?up:down)*(b?up:down);if(a&&b)serial+=weight;if(a||b)parallel+=weight;}
  const r=up/(up+down),answer=(serial/total).toFixed(2);return check(body,[answer,r.toFixed(2),((1+r)/2).toFixed(2),(parallel/total).toFixed(2)],answer);
 }
 case "2017h29a-fe-am-24":{
  const [data]=capture(text,/データを(\d{4})、重み付け定数を1234、基数を11/);const digits=String(data).split("").map(Number);assert.deepEqual(digits,values);assert.ok(text.includes("対応する桁ごとの積")&&text.includes("和を基数で割って")&&text.includes("基数から余りを減じ")&&text.includes("結果の1の位")&&text.includes("末尾に付加"));
  const products=digits.map((n,i)=>n*Number("1234"[i])),sum=products.reduce((a,b)=>a+b),quotient=Math.floor(sum/11),remainder=sum-11*quotient,subtracted=String(11-remainder),last=Number(subtracted[subtracted.length-1]),d=digits[3];
  return check(body,[last,remainder,d,11-d].map(n=>String(data)+n),String(data)+last);
 }
 case "2017h29a-fe-am-35":{
  const [address,mask]=capture(text,/IPアドレス：10\.170\.70\.(\d+)[\s\S]*マスク：255\.255\.255\.(\d+)/);assert.deepEqual([address,mask],[2**values[0]*values[1]+values[2],256-2**values[0]]);assert.ok(text.includes("ネットワークアドレスとして"));
  const binary=address.toString(2).padStart(8,"0"),maskBinary=mask.toString(2).padStart(8,"0"),network=Number.parseInt([...binary].map((b,i)=>b==="1"&&maskBinary[i]==="1"?"1":"0").join(""),2),broadcast=Number.parseInt([...binary].map((b,i)=>maskBinary[i]==="1"?b:"1").join(""),2);
  return check(body,[0,network,broadcast,255].map(n=>`10.170.70.${n}`),`10.170.70.${network}`);
 }
 case "2017h29a-fe-am-52":{
  assert.equal(tables.length,1);const t=tables[0];assert.deepEqual(t.columns,["規模＼複雑度","単純","普通","複雑"]);assert.deepEqual(t.rows,[["小","0.4","0.6","0.8"],["中","0.6","0.9","1.0"],["大","0.8","1.0","1.2"]]);
  const amounts=[...text.matchAll(/画面数：(\d+)/g)].map(m=>Number(m[1]));assert.deepEqual(amounts,[30+10*values[0],40-10*values[0],20,10]);assert.equal(amounts.reduce((a,b)=>a+b),100);assert.ok(text.includes("100画面")&&text.includes("レビューと修正に5人日")&&text.includes("レビューと修正の工数を含めた"));const [percentage]=capture(text,/作業工数の(\d+)%/);assert.equal(percentage,values[1]*20);
  const rows=[0,1,2,2],cols=[1,2,2,3];let tenths=0;for(let i=0;i<amounts.length;i++)tenths+=Math.round(Number(t.rows[rows[i]][cols[i]])*10)*amounts[i];
  const work=tenths/10,reviewed=work+5,total=reviewed+reviewed*percentage/100,wrong=work+work*percentage/100+5;return check(body,[work,reviewed,wrong,total].map(String),String(total));
 }
 case "2017h29a-fe-am-66":{
  assert.equal(tables.length,0);const diagram=body.prompt.find(b=>b.type==="diagram");assert.ok(diagram?.type==="diagram"&&diagram.scene.kind==="source_figure");assert.equal(diagram.scene.profile,"legacy-2017-development-cost-table");assert.deepEqual(diagram.scene.values,values);const t=legacy2017RenderedCostTable(diagram.scene.profile,diagram.scene.values);const [create,other]=capture(text,/作成工程が(\d+)万円[\s\S]*それぞれ(\d+)万円/);assert.deepEqual([create,other],[40+values[2]*20,80+values[3]*20]);assert.ok(text.includes("作成工程が6か月")&&text.includes("改造工程が3か月")&&text.includes("評価工程が2か月")&&text.includes("三つ以外のコストは考慮しない"));
  assert.deepEqual(t.rows.map(r=>r[0]),["ア","イ","ウ","エ"]);assert.deepEqual(t.rows.map(r=>r[1]),["サンプルを購入して社内で改造","社外に一括委託","社内資産を改造","社内で新規作成"]);assert.deepEqual(t.rows.map(r=>r.slice(4)),[["0","4","1"],["0","0","0"],["0","10","3"],["10","0","2"]]);assert.deepEqual(t.rows.map(r=>r.slice(2,4)),[[String(1600+values[0]*400),"0"],["0",String(3200+values[1]*300)],["0","0"],["0","0"]]);
  const details=t.rows.map(r=>{let cost=Number(r[2])+Number(r[3]);[6,3,2].forEach((months,i)=>{for(let month=0;month<months;month++)cost+=Number(r[i+4])*(i===0?create:other);});return cost;});const best=Math.min(...details);assert.equal(details.filter(c=>c===best).length,1);assert.ok(details.every(n=>Number.isInteger(n)));assert.ok(details.filter(n=>n!==best).every(n=>(n-best)/best>=(100/3400)/2));const symbols=t.rows.map(r=>r[0]);for(const n of details)assert.ok(body.explanation.includes(n+"万円"));return check(body,symbols,symbols[details.indexOf(best)]);
 }
 case "2017h29a-fe-am-78":{
  assert.equal(tables.length,1);const t=tables[0];assert.deepEqual(t.columns,["摘要","数量（個）","単価（千円）"]);assert.equal(t.rows.length,6);assert.deepEqual(t.rows.map(r=>r[0]),["期首在庫","4月仕入","6月仕入","7月仕入","9月仕入","期末在庫"]);assert.ok(text.includes("先入先出法")&&text.includes("期末の在庫評価額は何千円"));
  const receipts=t.rows.slice(0,5);assert.deepEqual(receipts.map(r=>Number(r[1])),[10,1,2,3,4].map(n=>n*values[0]));assert.deepEqual(receipts.map(r=>Number(r[2])),[10,11,12,13,14].map(n=>n+values[1]));const ending=Number(t.rows[5][1]);assert.equal(ending,12*values[0]);
  const queue=receipts.flatMap(r=>Array.from({length:Number(r[1])},()=>Number(r[2]))),before=[...queue];while(queue.length>ending)queue.shift();const answer=queue.reduce((a,b)=>a+b),average=before.reduce((a,b)=>a+b)/before.length;close(average*ending,Math.round(average*ending));
  return check(body,[ending*Number(receipts[1][2]),average*ending,answer,ending*Number(receipts[4][2])].map(String),String(answer));
 }
 default:throw Error(`Unregistered independent oracle ${source}`);
 }
}
/** Independent validity model fixed from the reviewed domains. Rejects are
 * not caught from production and silently skipped by the exhaustive test. */
export function legacy2017InputAllowed(source:string,v:number[]):boolean{
 if(source.endsWith("h-fe-am-11")){const [amount,disk]=v;return amount%disk===0&&amount/disk>=3&&amount/disk<=8;}
 if(source.endsWith("a-fe-am-24")){const sum=v.reduce((a,b,i)=>a+b*(i+1),0),r=sum%11,last=Number(String(11-r).slice(-1)),options=[last,r,v[3],11-v[3]];return options.every(n=>n<10)&&new Set(options).size===4;}
 if(source.endsWith("a-fe-am-66")){const buy=1600+400*v[0],outside=3200+300*v[1],make=40+20*v[2],other=80+20*v[3],cost=[buy+4*3*other+2*other,outside,10*3*other+3*2*other,10*6*make+2*2*other];return cost.filter(n=>n===Math.min(...cost)).length===1;}
 if(source.endsWith("h-fe-am-30")){const packets=v[0]*10000/v[1],budget=v[2]*3600*1e6/100,payload=2000*v[0]*10000*8,header=packets*400*8,correct=Math.round((payload+header)/budget),numbers=[Number(((payload+header)/8/budget).toFixed(1)),Math.round(payload/budget),correct,Math.round((payload+v[0]*10000*400*8)/budget)];return correct<=100&&new Set(numbers).size===4&&numbers.filter((_,i)=>i!==2).every(n=>Math.abs(n-correct)/correct>=.04);}
 return true;
}
