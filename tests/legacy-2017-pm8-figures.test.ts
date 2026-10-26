import test from "node:test";
import fs from "node:fs";
import assert from "node:assert/strict";
import material from "./fixtures/legacy-2017-pm8-material-review.json";
import {pm8Svg,readPm8Svg} from "./fixtures/legacy-2017-pm8-figure-reader";
import {legacy2017Pm8OriginalMatrix,legacy2017Pm8OriginalProgram} from "./fixtures/legacy-2017-pm8-source-review";
import {legacy2017Pm8ProgramText} from "../src/core/generators/legacy-2017-pm8-program";
test("PM8 graphは全7円と9実線の実座標/ラベルから49セルを独立復元する",()=>{
 for(let v=0;v<8;v++){const svg=pm8Svg("legacy-2017-pm8-graph",[v]),matrix=readPm8Svg("legacy-2017-pm8-graph",svg,[v]);if(v===0)assert.deepEqual(matrix,legacy2017Pm8OriginalMatrix);for(const wrong of [svg.replace('cx="80"','cx="81"'),svg.replace(/x1="([\d.]+)"/,(_,x)=>`x1="${Number(x)+10}"`),svg.replace('data-distance="0" x="165"','data-distance="0" x="166"'),svg.replace('data-node="6"','data-node="7"')])assert.throws(()=>readPm8Svg("legacy-2017-pm8-graph",wrong,[v]));}
});
test("PM8実コード全48行/コメント/11制御枠/5空欄/両c/αβの文字と全座標を保持する",()=>{
 assert.deepEqual(legacy2017Pm8ProgramText,legacy2017Pm8OriginalProgram);const harness=fs.readFileSync(new URL("../scripts/render-legacy-2017-pm8-browser.js",import.meta.url),"utf8"),snapshot=harness.match(/const expectedProgram=(\[[\s\S]*?\]),expectedWeights=/);assert(snapshot);assert.deepEqual(JSON.parse(snapshot[1]),legacy2017Pm8OriginalProgram);const profile="legacy-2017-pm8-program",svg=pm8Svg(profile,[0]);readPm8Svg(profile,svg,[0]);for(const wrong of [svg.replace('data-program-line="48"','data-program-line="49"'),svg.replace('data-blank="c"','data-blank="d"'),svg.replace('data-position-marker="β"','data-position-marker="α"'),svg.replace(/marker-end="url\(#[^)]+\)"/,'marker-end="url(#missing)"'),svg.replace('stroke="currentColor" stroke-width="1.5"','stroke-width="1.5"'),svg.replace('style="fill:currentColor"','style="fill:none"'),svg.replace('i ← i + 1','i ← i − 1'),svg.replace('data-control="6-10"','data-control="6-11"'),svg.replace('height="40"','height="30"')])assert.throws(()=>readPm8Svg(profile,wrong,[0]));
});
test("共通記法の後判定は上下■で条件式が下にあり、三角終端への後退を拒否する",()=>{
 const profile="legacy-2017-pm8-common-notation",svg=pm8Svg(profile,[0]);readPm8Svg(profile,svg,[0]);
 const post=svg.match(/<g data-common-row="posttest">([\s\S]*?)<\/g>/)![0],rectangles=[...post.matchAll(/<rect\b[^>]*><\/rect>/g)].map(m=>m[0]);assert.equal(rectangles.length,2);
 const terminal=rectangles[1],y=Number(terminal.match(/ y="(\d+)"/)![1]),triangle=`<polygon points="125,${y} 119,${y+12} 131,${y+12}" style="fill:currentColor"></polygon>`;
 for(const wrongPost of [
  post.replace(terminal,triangle),post.replace("</g>",triangle+"</g>"),post.replace(terminal,""),
  post.replace(terminal,terminal.replace(`y="${y}"`,`y="${y-10}"`)),
  post.replace('data-common-syntax="0"','data-common-syntax="1"').replace('>処理<','>条件式<'),
  post.replace('処理を実行し、条件式が真の間、','条件式が偽の間、'),
  post.replace('fill="currentColor"','fill="none"'),
 ])assert.throws(()=>readPm8Svg(profile,svg.replace(post,wrongPost),[0]));
 assert.equal(material.materials[1].symbolCorrection,"後判定も開始■/条件式側終端■。前判定/変数型も上下■。後判定は処理の後に条件式を記す。原programの6loopは前判定/変数型で変更なし。");
 assert.equal(material.symbolRecheck.sourcePhysicalPage,3);assert.equal(material.symbolRecheck.sourcePaperSha256,"7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8");assert.match(material.symbolRecheck.priorFinding,/読み誤った/);
});
test("演算子6優先階層と上高/下低を可視値の順序と座標で検査する",()=>{
 const profile="legacy-2017-pm8-common-operators",svg=pm8Svg(profile,[0]);readPm8Svg(profile,svg,[0]);for(const wrong of [svg.replace('>not<','>and<').replace('＋、−、not','＋、−、or'),svg.replace('>and<','>or<'),svg.replace('>高<','>低<'),svg.replace('M 1260 185 L 1270 170','M 1260 185 L 1270 380')])assert.throws(()=>readPm8Svg(profile,wrong,[0]));
});
