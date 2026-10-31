import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import type {GeneratedBody} from "../../src/core/generators/definition";
import type {Block} from "../../src/core/types";
import facts from "./legacy-2017-autumn-platform-facts.json";
import {readAutumnPlatformMemorySvg} from "./legacy-2017-autumn-platform-svg";
import {Legacy2017AutumnPlatformFigure} from "../../src/ui/Legacy2017AutumnPlatformFigures";
const plain=(blocks:readonly Block[])=>blocks.map(b=>{assert.equal(b.type,"paragraph");if(b.type!=="paragraph")throw Error("PARAGRAPH");return b.text;});
/** A separate address-order compactor and word-copy trace. No producer answer or
 * timing helper is used; actual SVG text supplies all four segment lengths. */
export function autumnPlatformCopyTrace(sizes:readonly number[]){
 assert.equal(sizes.length,4);assert(sizes.every(n=>Number.isInteger(n)&&n>0));
 const [a,hole,moved,tail]=sizes.map(n=>n*250),memory=Array.from({length:a+hole+moved+tail},(_,i)=>i),expected=[...memory.slice(0,a),...memory.slice(a+hole,a+hole+moved)];
 let reads=0,writes=0;for(let i=0;i<moved;i++){const word=memory[a+hole+i];reads++;memory[a+i]=word;writes++;}
 assert.deepEqual(memory.slice(0,a+moved),expected);const ns=BigInt(reads+writes)*30n;
 return{movedBytes:moved*4,reads,writes,nanoseconds:ns,milliseconds:Number(ns)/1e6,freeKBytes:(hole+tail)/250};
}
export function legacy2017AutumnPlatformOracle(source:string,body:GeneratedBody,values:number[]){
 const n=Number(source.split("-").at(-1)),s=facts.sourceQuestions.find(q=>q.number===n),domain=facts.designInputs.find(d=>d.number===n);assert(s&&domain);assert.equal(source,`2017h29a-fe-am-${n}`);assert.equal(values.length,1);const v=values[0];assert(Number.isInteger(v)&&v>=0&&v<domain.capacity);
 assert.equal(body.choices.length,4);assert.equal(new Set(body.choices.map(c=>JSON.stringify(c))).size,4);const expected=facts.conditions.find(r=>r.source===source&&r.variant===v)!;assert(expected);
 const q=body.prompt[0];assert(q.type==="paragraph");assert.equal(q.text,n===18?(domain.scenarios[v] as {stem:string}).stem:s.stem);
 const choices=body.choices.map(c=>{const p=plain(c);assert.equal(p.length,1);return p[0];});assert.deepEqual(choices,expected.fullChoices);
 let establishedTruth:boolean[];
 if(n===19){
  assert.equal(body.prompt.length,2);const diagram=body.prompt[1];assert(diagram.type==="diagram"&&diagram.scene.kind==="source_figure");assert.equal(diagram.scene.profile,"legacy-2017-memory-compaction");assert.deepEqual(diagram.scene.values,[v]);assert.equal(diagram.caption,"メモリマップ");
  const svg=renderToStaticMarkup(createElement(Legacy2017AutumnPlatformFigure,{profile:diagram.scene.profile,values:diagram.scene.values,caption:diagram.caption}));const sizes=readAutumnPlatformMemorySvg(svg,v),trace=autumnPlatformCopyTrace(sizes);
  assert.equal(diagram.alt,svg.match(/<desc[^>]*>([^<]*)<\/desc>/)![1]);
  const wrongFreed=sizes[1]*1000/4*60/1e6,wrongRead=trace.reads*30/1e6,wrongStationary=sizes[0]*1000/4*60/1e6,truth=choices.map(c=>Number(c)===trace.milliseconds);
  assert.deepEqual(choices.map(Number),[wrongFreed,wrongRead,wrongStationary,trace.milliseconds].sort((a,b)=>a-b));assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));establishedTruth=truth;assert(choices.every(c=>/^\d+\.\d$/.test(c)));
  const answer=trace.milliseconds.toFixed(1);assert.equal(body.explanation,`セグメント2の解放で生じる空きを詰めるため、セグメント1はそのままにし、その後ろのセグメント3（${sizes[2]}kバイト）を移動する。移動量は${trace.movedBytes}バイトであり、4バイトごとに1回読み、1回書く。必要なアクセス回数は読取り${trace.reads}回と書込み${trace.writes}回なので、${trace.reads}×（30＋30）ナノ秒＝${answer}ミリ秒となる。読取りだけなら${wrongRead.toFixed(1)}ミリ秒、解放するセグメント2を移動すると誤認すると${wrongFreed.toFixed(1)}ミリ秒、移動しないセグメント1を誤って計算すると${wrongStationary.toFixed(1)}ミリ秒となる。`);
 }else if(n===18){
  assert.equal(body.prompt.length,1);const high=q.text.match(/([AB])の方が[AB]よりも優先度が高い/)![1],transitions=[['A','B','ready'],['A','B','waiting'],['B','A','ready'],['B','A','waiting']],truth=transitions.map(([current,newTask,oldState])=>newTask===high&&current!==high&&oldState==='ready');assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));establishedTruth=truth;
  assert.equal(body.explanation,`優先度が高いタスク${high}が実行可能になると、優先度の低いタスクの実行を中断して高い方を実行する。中断された低いタスクは実行可能状態であり、資源やイベントを待つ待ち状態ではない。低い方のタスクが起動しても、既に実行中の高い方を中断して切り替えることはない。`);
 }else{
  assert.equal(body.prompt.length,1);const truth=expected.slots.map(c=>c.trueForQuestion);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));establishedTruth=truth;const e=facts.explanationFacts.find(f=>f.number===n)!;assert(e);assert.equal(body.explanation,e.common+e.otherReasons[v]);
 }
 return establishedTruth;
}
