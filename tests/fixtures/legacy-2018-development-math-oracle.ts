import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {Legacy2018DevelopmentFigure} from "../../src/ui/Legacy2018DevelopmentFigures";
import {legacy2018CoverageFacts as coverage,legacy2018ShorteningFacts as network} from "./legacy-2018-development-math-review";
const decode=(s:string)=>s.replaceAll("&gt;",">").replaceAll("&lt;","<").replaceAll("&amp;","&");
const attr=(s:string,key:string)=>{const match=s.match(new RegExp(`(?:^|\\s)${key}="([^"]*)"`));assert(match,`${key}: ${s}`);return decode(match[1]);};
const numbers=(s:string,keys:string[])=>keys.map(key=>Number(attr(s,key)));
const paragraph=(block:GeneratedBody["prompt"][number])=>{assert(block.type==="paragraph");return block.text;};
const choices=(body:GeneratedBody)=>body.choices.map(blocks=>{assert.equal(blocks.length,1);return paragraph(blocks[0]);});
const pairs=(s:string)=>{const matches=[...s.matchAll(/\(A=(\d+)、B=(\d+)\)/g)];assert.equal(matches.length,2);assert.equal(matches.map(m=>m[0]).join("、"),s);return matches.map(m=>[Number(m[1]),Number(m[2])]);};
const unique=(body:GeneratedBody,truth:boolean[])=>{assert.equal(truth.length,4);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));};
export function legacy2018DevelopmentSvg(body:GeneratedBody){const diagrams=body.prompt.filter(b=>b.type==="diagram");assert.equal(diagrams.length,1);const figure=diagrams[0];assert(figure.type==="diagram");assert(figure.scene.kind==="source_figure");assert(figure.alt);return renderToStaticMarkup(createElement(Legacy2018DevelopmentFigure,{profile:figure.scene.profile,values:figure.scene.values,caption:figure.caption??""}));}
/** Reads visible geometry/text, independently of generator's truth/longest-path helpers. */
export function legacy2018CoverageSvg(svg:string){
  const texts=[...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)];
  const decision=texts.find(m=>m[1].includes('data-condition="decision"'));assert(decision);const match=decode(decision[2]).match(/^A>([4-6]) (or|and) B=([0-2])$/);assert(match);
  const rects=[...svg.matchAll(/<rect\b([^>]*)/g)].map(m=>numbers(m[1],["x","y","width","height"]));assert.deepEqual(rects,[[220,40,220,60],[220,340,220,60]]);
  const polygon=svg.match(/<polygon\b([^>]*)/);assert(polygon);assert.equal(attr(polygon[1],"points"),coverage.figure.decision);
  for(const [route,expected]of [["yes",coverage.figure.yes],["exit",coverage.figure.exit]] as const){const line=[...svg.matchAll(/<line\b([^>]*)/g)].find(m=>m[1].includes(`data-route="${route}"`));assert(line);assert.deepEqual(numbers(line[1],["x1","y1","x2","y2"]),expected);assert(attr(line[1],"marker-end").includes("arrow"));}
  const no=svg.match(/<polyline\b([^>]*)/);assert(no);assert.equal(attr(no[1],"data-route"),"no");assert.equal(attr(no[1],"points"),coverage.figure.no);assert(attr(no[1],"marker-end").includes("arrow"));
  assert(texts.some(m=>m[2]==="Yes"&&m[1].includes('data-branch="yes"')));assert(texts.some(m=>m[2]==="No"&&m[1].includes('data-branch="no"')));assert(texts.some(m=>m[2]==="処理1"));assert(texts.some(m=>m[2]==="処理2"));
  return{threshold:Number(match[1]),operator:match[2],equal:Number(match[3])};
}
type ReadEdge={task:string;from:number;to:number;days:number};
export function legacy2018NetworkSvg(svg:string):ReadEdge[]{
  const circleTags=[...svg.matchAll(/<circle\b([^>]*)/g)];assert.equal(circleTags.length,7);const nodes=circleTags.slice(0,5).map(m=>{assert.equal(Number(attr(m[1],"r")),18);return numbers(m[1],["cx","cy"]);});assert.deepEqual(nodes,network.nodes);
  const nearest=(x:number,y:number)=>{const distances=nodes.map(([a,b])=>Math.hypot(a-x,b-y)),minimum=Math.min(...distances);assert(Math.abs(minimum-18)<1e-8);assert.equal(distances.filter(n=>Math.abs(n-minimum)<1e-8).length,1);return distances.indexOf(minimum);};
  const groups=[...svg.matchAll(/<g data-edge="([A-F])">([\s\S]*?)<\/g>/g)];assert.equal(groups.length,6);
  const edges=groups.map(m=>{const line=m[2].match(/<line\b([^>]*)/);assert(line);const [x1,y1,x2,y2]=numbers(line[1],["x1","y1","x2","y2"]);assert(attr(line[1],"marker-end").includes("arrow"));const from=nearest(x1,y1),to=nearest(x2,y2);assert.deepEqual([from,to],network.edgeByTask[m[1] as keyof typeof network.edgeByTask]);const labels=[...m[2].matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)];assert.equal(labels.length,2);assert.equal(attr(labels[0][1],"data-task"),m[1]);assert.equal(labels[0][2],m[1]);assert.equal(attr(labels[1][1],"data-days"),m[1]);assert(Number(attr(labels[0][1],"y"))<Number(attr(labels[1][1],"y")));const side=(tag:string)=>{const [x,y]=numbers(tag,["x","y"]),[a,b]=nodes[from],[c,d]=nodes[to];return(c-a)*(y-b)-(d-b)*(x-a);};assert(side(labels[0][1])<0,"task name above the directed edge");assert(side(labels[1][1])>0,"duration below the directed edge");assert(/^[1-8]$/.test(labels[1][2]));return{task:m[1],from,to,days:Number(labels[1][2])};});
  const legend=svg.match(/<g data-legend="task-duration">([\s\S]*?)<\/g>/);assert(legend);assert(legend[1].includes(">作業名</text>"));assert(legend[1].includes(">所要日数</text>"));assert(svg.includes('orient="auto"'));return edges;
}
/** Enumerates all start-to-finish paths instead of production's earliest-event algorithm. */
export function independent2018Paths(edges:ReadEdge[],shorten:string[]=[]){const paths:{tasks:string[];days:number}[]=[];const visit=(node:number,tasks:string[],days:number)=>{assert(tasks.length<=6,"acyclic source graph");if(node===4){paths.push({tasks,days});return;}const outgoing=edges.filter(e=>e.from===node);assert(outgoing.length>0);for(const edge of outgoing)visit(edge.to,[...tasks,edge.task],days+edge.days-Number(shorten.includes(edge.task)));};visit(0,[],0);assert.equal(paths.length,3);return paths;}
export function legacy2018DevelopmentMathOracle(source:string,body:GeneratedBody,values:number[]){
  assert.equal(body.choices.length,4);assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);const svg=legacy2018DevelopmentSvg(body);const figure=body.prompt.find(b=>b.type==="diagram");assert(figure?.type==="diagram"&&figure.scene.kind==="source_figure");
  if(source.endsWith("-49")){
    assert.equal(values.length,3);assert(values.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=(i===2?1:2)));assert.equal(body.prompt.length,4);assert.equal(paragraph(body.prompt[0]),coverage.stem);const header=body.prompt[2];assert(header.type==="list");assert.deepEqual(header.items,["判定条件網羅によるテストデータ"]);const initial=pairs(paragraph(body.prompt[3])),alternatives=choices(body).map(pairs),condition=legacy2018CoverageSvg(svg);assert.deepEqual(condition,{threshold:values[0]+4,equal:values[1],operator:values[2]?"and":"or"});
    assert.equal(figure.alt,`上から処理1、判定A>${condition.threshold} ${condition.operator} B=${condition.equal}。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。`);
    const truth=([a,b]:number[])=>`${Number(a>condition.threshold)}${Number(b===condition.equal)}`,decision=([a,b]:number[])=>condition.operator==="or"?a>condition.threshold||b===condition.equal:a>condition.threshold&&b===condition.equal;
    const resolve=([da,db]:number[])=>[condition.threshold+(condition.operator==="and"?-da:da),condition.equal+db];assert.deepEqual(initial,coverage.initialOffsets.map(resolve));assert.deepEqual(alternatives,coverage.choiceOffsets.map(rows=>rows.map(resolve)));assert.deepEqual(new Set(initial.map(decision)),new Set([false,true]));
    const combinations=["00","01","10","11"],selected=alternatives.map(rows=>combinations.every(c=>[...initial,...rows].some(row=>truth(row)===c)));unique(body,selected);for(const term of ["偽/偽","偽/真","真/偽","真/真","短絡評価",`A>${condition.threshold}`,`B=${condition.equal}`])assert(body.explanation.includes(term),term);return{initial:initial.map(truth),choices:alternatives.map(rows=>rows.map(truth)),correct:selected.indexOf(true)};
  }
  assert(source.endsWith("-51"));assert.equal(values.length,1);assert(Number.isInteger(values[0])&&values[0]>=0&&values[0]<9);assert.equal(body.prompt.length,2);assert.equal(paragraph(body.prompt[0]),network.stem);assert.deepEqual(choices(body),network.alternatives.map(a=>a.join("、")));const edges=legacy2018NetworkSvg(svg);assert.deepEqual(edges.map(e=>e.days),network.days[values[0]]);assert.equal(figure.alt,`作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。${edges.map(e=>`${e.task}=${e.days}日`).join("、")}。同じ表記の凡例を付ける。`);const paths=independent2018Paths(edges),before=Math.max(...paths.map(p=>p.days)),after=network.alternatives.map(tasks=>Math.max(...independent2018Paths(edges,tasks).map(p=>p.days)));const truth=after.map(days=>before-days===2);unique(body,truth);assert.equal(truth.indexOf(true),network.manualCorrectIndices[values[0]]);for(const term of [`A-D=${paths[0].days}日`,`B-C-D=${paths[1].days}日`,`B-E-F=${paths[2].days}日`,...network.alternatives.map((tasks,i)=>`${tasks.join("・")}で${after[i]}日`),"全経路を再計算"])assert(body.explanation.includes(term),term);return{paths,before,after,correct:truth.indexOf(true)};
}
