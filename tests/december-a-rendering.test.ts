import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceFigure} from "../src/ui/SourceFigure";
import {fixture} from "./fixtures";
const svg=(profile:string,values:number[])=>renderToStaticMarkup(createElement(SourceFigure,{scene:{kind:"source_figure",profile:`dec-a-${profile}`,values},caption:"査読対象図"})).replace(/<desc[\s\S]*?<\/desc>/g,"");
const textNodes=(html:string)=>[...html.matchAll(/<text[^>]*x="([\d.-]+)"[^>]*y="([\d.-]+)"[^>]*>(.*?)<\/text>/g)].map(m=>({x:Number(m[1]),y:Number(m[2]),text:m[3]}));
test("all 8x8 figure stars follow the source arrays and independently applied transformations",()=>{
 for(let op=0;op<4;op++)for(let pattern=0;pattern<3;pattern++){
  const original=Array.from({length:8},(_,i)=>Array.from({length:8},(_,j)=>pattern===0?(j===1||i===0&&j>=1&&j<=6||i===3&&j>=1&&j<=4):pattern===1?(j===1||i===7&&j>=1&&j<=6):(j===1||i===0&&j>=1&&j<=5||i===3&&j>=1&&j<=5||j===5&&i<=3)));
  let expected=original.map(row=>[...row]);if(op===2)expected=original.map(row=>[...row].reverse());else for(let r=0;r<(op===0?2:op===1?3:1);r++)expected=expected[0].map((_,col)=>expected.map(row=>row[col]).reverse());
  const nodes=textNodes(svg("array",[op,pattern])).filter(n=>n.text==="＊"),positions=(grid:boolean[][],x:number)=>grid.flatMap((row,i)=>row.flatMap((star,j)=>star?[{x:x+j*30+15,y:190+i*30+16,text:"＊"}]:[]));assert.deepEqual(nodes,[...positions(original,380),...positions(expected,710)]);
 }
});
test("automaton has all six labels, the initial edge, and three source states",()=>{
 const html=svg("automaton",[0]);assert.deepEqual(textNodes(html).map(n=>n.text),["0／0","1／1","1／0","1／1","0／0","0／0","S1","S2","S3"]);assert.equal((html.match(/<circle/g)??[]).length,3);for(const path of ["M 228 213 Q 350 145 472 213","M 528 213 Q 650 145 772 213","M 472 247 Q 350 305 228 247","M 780 250 Q 500 470 222 250"])assert(html.includes(path));assert(html.includes('x1="65" y1="230" x2="167" y2="230"'));
});
test("all component-count, multiplicity and selected dispatch-edge variants are actually rendered",()=>{
 for(let c=2;c<=4;c++)for(let p=2;p<=3;p++){const nodes=textNodes(svg("availability",[c,p]));assert.equal(nodes.filter(n=>n.text==="クライアント").length,c);assert.equal(nodes.filter(n=>n.text==="プリンタ").length,p);assert.equal(nodes.filter(n=>n.text==="サーバ").length,1);}
 const expected=[["1..＊","0..＊"],["1","1"],["0..1","1..＊"],["1","1..＊"]];for(let v=0;v<4;v++){const nodes=textNodes(svg("multiplicity",[v]));assert.deepEqual(nodes.filter(n=>n.y===166).map(n=>n.text),expected[v]);}
 for(let v=0;v<3;v++){const html=svg("dispatch",[v]),bold=[...html.matchAll(/<line[^>]*style="stroke-width:7"/g)];assert.equal(bold.length,2);const first=bold[0][0];if(v===1)assert.match(first,/x1="255"/);else assert(!first.includes('x1="255"'));}
});
test("source areas follow syllabus content rather than assuming a sample's question numbering quota",()=>{
 const b=fixture();for(let n=1;n<=60;n++)for(const prefix of ["question-ipa-","question-template-source-"]){const q=b.questions.find(q=>q.id===`${prefix}sample-2022-dec-a-${n}`)!;assert.equal(q.learning.area,n<=41?"technology":n<=48?"management":"strategy");}
 // FE syllabus: Scrum is software development management technology; project,
 // service management and audit are management; VDI/ROI are system strategy.
});
