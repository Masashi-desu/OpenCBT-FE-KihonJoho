import assert from "node:assert/strict";
import type {Block} from "../../src/core/types";
import type {GeneratedBody} from "../../src/core/generators/definition";
import fixed from "./legacy-2017-pm8-body-review.json";
import {legacy2017Pm8OriginalProgram as sourceLines,legacy2017Pm8OriginalEdges as edges,legacy2017Pm8OriginalChoices as sourceChoices,legacy2017Pm8ReviewedWeightConditions as weights} from "./legacy-2017-pm8-source-review";
import {pm8Reference,pm8SourceBlankInterpreter} from "./legacy-2017-pm8-reference";
import {pm8Svg,readPm8Svg,pm8NotationFacts} from "./legacy-2017-pm8-figure-reader";
const text=(b:Block)=>{assert(b.type==="paragraph"||b.type==="code");return b.text;},array=(a:number[])=>a.map(x=>Number.isFinite(x)?String(x):"∞").join(", ");
const diagram=(b:Block,profile:string,values:number[])=>{assert.equal(b.type,"diagram");if(b.type!=="diagram"||b.scene.kind!=="source_figure")throw Error();assert.equal(b.scene.profile,profile);assert.deepEqual(b.scene.values,values);assert.equal(b.rendererRef.id,"renderer-source-figures");assert.equal(b.rendererRef.version,"1.0.0");return readPm8Svg(profile,pm8Svg(profile,values),values);};
export function pm8ExplanationFacts(matrix:number[][]){
 const r=pm8Reference(matrix,0,6),t=r.trace[2];
 return [
 "a：候補jが未確定であるnot(pFixed[j])を条件にして、pDist[j]が現在の候補iより小さい場合だけiを更新する。pFixed[i]は候補jの状態を調べず、pFixed[j]は確定済み地点を選ぶため不適切。",
 "b：選んだ地点番号sPointのpFixed要素をtrueにする。dpは目的地、spは出発地、nPoint−1は末尾地点、nPointは配列の範囲外であり、選んだ地点を一般に表さない。",
 "c：逆順の結果の書込先はsRoute[j]。pRouteは各地点の直前の経由地を保持する配列であり、sRouteの添字i、dp、spは結果の連続格納位置jを一般に表さない。同じcを行44と48の両方へ入れる。",
 "d：現在の地点iの直前の経由地pRoute[i]をたどる。dp、j、spを添字に固定した参照やsRouteの参照は、その地点iの直前の経由地を一般に返さない。",
 `e：確定する地点は0、1、3の順なので3。`,
 `f：3回目のβではpDistは${array(t.distances)}。地点3から地点5へ進む候補は${matrix[0][3]}＋${matrix[3][5]}＝${t.distances[5]}であり、まだ地点2を経由する処理も地点5から地点6への処理も実行していない。地点6は未更新の∞のまま。`,
 `g：この時点のpRouteは${array(t.previous)}。地点4の直前は1、地点5の直前は3、未更新の地点6は設問2の初期値0である。同距離ではstrictな小なり比較なので、先に昇順で選んだ候補を置き換えない。最後まで実行した最短距離は${r.distance}、sRouteの有効部分は目的地から${r.reverse.join("、")}の順となる。`,
 ];
}
/** Full source text/choices and all mathematical values are checked separately.
 * Production model, edge constants and explanation builders are not imported. */
export function assertLegacy2017Pm8(b:GeneratedBody,values:number[]){
 assert.deepEqual(values.length,1);const v=values[0];assert(Number.isInteger(v)&&v>=0&&v<8);assert.equal(b.prompt.length,28);assert.equal(b.choices.length,34);assert.equal(b.correctIndex,undefined);
 assert.deepEqual(b.prompt.filter(x=>x.type==="paragraph").map(text),fixed.paragraphs);
 const tables=b.prompt.filter(x=>x.type==="table");assert.equal(tables.length,3);assert.deepEqual(tables[0],fixed.argumentTable);
 const matrix:number[][]=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>i===j?0:-1));edges.forEach(([a,c],i)=>matrix[a][c]=matrix[c][a]=weights[v][i]);const r=pm8Reference(matrix,0,6),third=r.trace[2];
 assert.deepEqual(tables[1],{type:"table",caption:"表2 図1の例における配列Distanceの内容",columns:["i＼j","0","1","2","3","4","5","6"],rows:matrix.map((row,i)=>[String(i),...row.map(x=>x===-1?"−1":String(x))])});
 assert.deepEqual(tables[2],{type:"table",caption:"表3 βにおける配列pDistと配列pRouteの値",columns:["最短経路探索処理の繰返し","配列pDist","配列pRoute"],rows:[...r.trace.slice(0,2).map((t,i)=>[`${i+1}回目`,array(t.distances),array(t.previous)]),["3回目","［f］","［g］"],["⋮","⋮","⋮"]]});
 const diagrams=b.prompt.filter(x=>x.type==="diagram");assert.equal(diagrams.length,2);assert.deepEqual(diagram(diagrams[0],"legacy-2017-pm8-graph",values),matrix);diagram(diagrams[1],"legacy-2017-pm8-program",[0]);assert.equal(diagrams[0].caption,"図1 地点数Nが7の経路の例");assert.equal(diagrams[0].alt,"丸は地点番号0〜6、線分は双方向に移動できる直接経路。"+edges.map(([a,c],i)=>`地点${a}と${c}の距離${weights[v][i]}`).join("、")+"。");assert.equal(diagrams[1].caption,"プログラム ShortestPath（行1〜48）");assert.equal(diagrams[1].alt,"ShortestPathの全48行。行6〜10、12〜39、14〜19、23〜27、30〜38、43〜47が繰返し。行15〜17、20〜22、24〜26、31〜37、33〜36が条件分岐。空欄aは行24、bは行29、cは行44と48、dは行45。αは行28、βは行39。"+sourceLines.map((s,i)=>`${i+1}行 ${s}`).join("\n"));
 assert.equal(b.contexts?.length,1);const context=b.contexts![0];assert.equal(context.title,"共通に使用される擬似言語の記述形式（原p3〜4）");assert.equal(context.presentation,"text_figure");assert.equal(context.blocks.length,5);assert.deepEqual(context.blocks.filter(x=>x.type==="paragraph").map(text),fixed.commonParagraphs);diagram(context.blocks[1],"legacy-2017-pm8-common-notation",[0]);diagram(context.blocks[2],"legacy-2017-pm8-common-operators",[0]);const notation=context.blocks[1],operators=context.blocks[2];assert(notation.type==="diagram"&&operators.type==="diagram");assert.equal(notation.caption,"宣言、注釈及び処理");assert.equal(notation.alt,"2017春期の共通記法。単岐/双岐選択は▲開始/▼終端。前判定・後判定・変数型の繰返しは上下■。後判定の条件式は処理の後に記す。"+pm8NotationFacts.map(([, ,syntax,desc])=>syntax.join("、")+"："+desc.join("")).join("\n"));assert.equal(operators.caption,"演算子と優先順位");assert.equal(operators.alt,"演算子の優先順位は単項、乗除、加減、関係、論理積、論理和の順に高い。単項は＋・−・not、乗除は×・÷・%、加減は＋・−、関係は＞・＜・≧・≦・＝・≠、論理積はand、論理和はor。");
 const future=pm8Reference(matrix,0,5).distance,premature=matrix[0][2]+matrix[2][5],current=third.distances[5],to6=third.distances[4]+matrix[4][6];assert(future<premature&&premature<current);const f=[future,premature,current].flatMap(x=>[to6,Infinity].map(end=>[...third.distances.slice(0,5),x,end]));const expected=[...sourceChoices.a,...sourceChoices.b,...sourceChoices.cd,...sourceChoices.e.map(String),...f.map(array),...sourceChoices.g.map(array)];
 assert.deepEqual(b.choices.map(c=>{assert.equal(c.length,1);return text(c[0]);}),expected);b.choices.forEach((c,i)=>assert.equal(c[0].type,i<17?"code":"paragraph"));
 const counts=[4,5,8,8,5,6,6],offsets=[0,4,9,9,17,22,28],correct=[1,4,6,1,1,5,0];assert.deepEqual(b.answerParts,counts.map((n,i)=>({id:`part-${"abcdefg"[i]}`,label:`設問${i<4?1:2} ${"abcdefg"[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})));assert.deepEqual(b.partAnswers,correct.map((c,i)=>({kind:"choice",partId:`part-${"abcdefg"[i]}`,choiceId:`choice-value-${offsets[i]+c+1}`})));
 assert.deepEqual(sourceChoices.e.map(x=>x===third.point),[false,true,false,false,false]);assert.deepEqual(f.map(row=>row.every((n,i)=>n===third.distances[i])),[false,false,false,false,false,true]);assert.deepEqual(sourceChoices.g.map(row=>row.every((n,i)=>n===third.previous[i])),[true,false,false,false,false,false]);
 const holes=[1,4,6,1]as[number,number,number,number];for(let slot=0;slot<4;slot++){const truth=Array.from({length:counts[slot]},(_,option)=>{const trial=[...holes]as[number,number,number,number];trial[slot]=option;try{const result=pm8SourceBlankInterpreter(matrix,trial);return result.distance===r.distance&&JSON.stringify(result.reverse)===JSON.stringify(r.reverse)&&JSON.stringify(result.points)===JSON.stringify(r.trace.map(t=>t.point));}catch{return false;}});assert.equal(truth.filter(Boolean).length,1);assert.equal(truth.indexOf(true),correct[slot]);}
 assert.equal(b.explanation,pm8ExplanationFacts(matrix).join(""));
}
