import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Legacy2018LogicFigure} from "../../src/ui/Legacy2018LogicFigures";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018LogicReview as review} from "./legacy-2018-pm-logic-review";
const inputPairs=[[0,0],[0,1],[1,0],[1,1]];
const truth:Record<string,number[]>={AND:[0,0,0,1],OR:[0,1,1,1],NAND:[1,1,1,0],NOR:[1,0,0,0],XOR:[0,1,1,0]};
const text=(blocks:GeneratedBody["prompt"])=>blocks.map(b=>b.type==="paragraph"?b.text:"").join("\n");
export const logicSvg=(profile:string,values:number[])=>renderToStaticMarkup(createElement(Legacy2018LogicFigure,{profile,values,caption:"検算"})).replace(/<desc[^>]*>.*?<\/desc>/s,"");
export function reviewedLogicWires(svg:string,composition:boolean){
  const path=(key:string)=>svg.match(new RegExp(`<path data-wire="${key}" d="([^"]+)"`))?.[1];
  assert.equal(path("x-both"),"M 105 80 H 230 M 160 80 V 280 H 230");assert.equal(path("y-both"),"M 105 320 H 230 M 130 320 V 120 H 150 Q 160 100 170 120 H 230");
  assert.equal((svg.match(/data-junction=/g)??[]).length,2);assert(svg.includes('data-junction="x" class="junction" cx="160" cy="80"'));assert(svg.includes('data-junction="y" class="junction" cx="130" cy="320"'));
  assert(!svg.includes('cx="160" cy="120"'));assert(!svg.includes('cx="160" cy="110"'));
  assert(svg.includes('<rect x="230" y="55" width="210" height="90"'));assert(svg.includes('<rect x="230" y="255" width="210" height="90"'));
  const label=(name:string)=>svg.match(new RegExp(`<text data-gate="${name}"[^>]*>([^<]+)</text>`))?.[1];
  assert.equal(label("lower"),composition?"a":"c");
  if(composition){assert.equal(path("upper-final"),"M 440 100 H 530 V 180 H 620");assert.equal(path("lower-final"),"M 440 300 H 530 V 220 H 620");assert(svg.includes('data-wire="output" x1="820" y1="200" x2="880" y2="200"'));assert(svg.includes(">出力</text>"));}
  else{assert.equal(label("upper"),"b");assert(svg.includes('data-wire="sum" x1="440" y1="100" x2="535" y2="100"'));assert(svg.includes('data-wire="carry" x1="440" y1="300" x2="535" y2="300"'));assert(svg.includes('data-output="sum" x="560" y="100">Z</text>'));assert(svg.includes('data-output="carry" x="560" y="300">C</text>'));assert(svg.includes('text-anchor="end">X</text>')&&svg.includes('text-anchor="end">Y</text>'));}
  return {known:label("upper"),final:label("final")};
}
const vector=(s:string)=>{assert.match(s,/^［[−0-9., ]+］$/);return s.slice(1,-1).split(",").map(t=>{assert.match(t.trim(),/^−?\d+\.\d$/);return Math.round(Number(t.trim().replace("−","-"))*10);});};
/** Independently compares exact integer tenths; executable code from source
 * material, displayed expressions, or data-driven callbacks is never run. */
export function independentThreshold(values:number[],x:number,y:number){const [wx,wy,t]=values;assert(values.length===3&&values.every(Number.isInteger));assert([0,1].includes(x)&&[0,1].includes(y));return wx*x+wy*y<t?0:1;}
export function assertLegacy2018Logic(source:string,body:GeneratedBody,values:number[]){
  assert.equal(source,review.source);assert.equal(values.length,2);const [configuration,parameter]=values;assert(Number.isInteger(configuration)&&configuration>=0&&configuration<4);assert(Number.isInteger(parameter)&&parameter>=0&&parameter<6);
  const c=review.configurations[configuration],w=review.parameters[parameter];
  assert.equal(body.correctIndex,undefined);assert.equal(body.choices.length,26);assert.deepEqual(body.answerParts?.map(p=>p.choiceIds.length),review.groups);assert.deepEqual(body.answerParts?.map(p=>p.label),review.labels);assert.equal(body.partAnswers?.length,5);
  const prose=text(body.prompt);for(const term of review.premiseTerms)assert(prose.includes(term),term);assert(!prose.includes("誤記"));
  const fullTarget=c.target==="XOR"?"XOR（排他的論理和）":"XNOR（否定排他的論理和）";assert(prose.includes(`表2に示す${fullTarget}の論理演算`));
  const tables=body.prompt.filter(b=>b.type==="table");assert.equal(tables.length,3);
  assert.equal(tables[0].caption,"表1 主要な論理演算の真理値表");assert.deepEqual(tables[0].columns,["入力","入力","AND（論理積）の出力","OR（論理和）の出力","NAND（否定論理積）の出力","NOR（否定論理和）の出力"]);assert.deepEqual(tables[0].rows,review.sourceTruthRows);
  assert.equal(tables[1].caption,`表2 ${fullTarget}の真理値表`);assert.deepEqual(tables[1].columns,["入力","入力","出力"]);assert.deepEqual(tables[1].rows,inputPairs.map(([x,y],i)=>[String(x),String(y),String(c.truth[i])]));
  const diagrams=body.prompt.filter(b=>b.type==="diagram");assert.equal(diagrams.length,2);const [composition,half]=diagrams;assert.equal(composition.scene.kind,"source_figure");assert.equal(half.scene.kind,"source_figure");if(composition.scene.kind!=="source_figure"||half.scene.kind!=="source_figure")throw Error("scene");
  assert.equal(composition.scene.profile,"legacy-2018-gate-composition");assert.deepEqual(composition.scene.values,[configuration]);assert.equal(composition.caption,`図1 ${fullTarget}の論理回路`);assert.equal(half.scene.profile,"legacy-2018-half-adder");assert.deepEqual(half.scene.values,[0]);assert.equal(half.caption,"図2 半加算器の論理回路");
  const wires=reviewedLogicWires(logicSvg(composition.scene.profile,composition.scene.values),true);assert.equal(wires.known,c.known);assert.equal(wires.final,c.final);reviewedLogicWires(logicSvg(half.scene.profile,half.scene.values),false);
  const options=body.answerParts!.map(p=>p.choiceIds.map(id=>{const choice=body.choices[Number(id.replace("choice-value-",""))-1];assert(choice);assert.equal(choice.length,1);assert.equal(choice[0].type,"paragraph");return text(choice);}));
  assert.deepEqual(options[0],review.gateChoices);assert.deepEqual(options[1],review.halfAdderChoices);assert.deepEqual(options[2],review.halfAdderChoices);
  const evaluate=(name:string,x:number,y:number)=>{assert(truth[name],name);return truth[name][2*x+y];};
  const a=options[0].map(candidate=>inputPairs.every(([x,y],i)=>evaluate(wires.final!,evaluate(wires.known!,x,y),evaluate(candidate,x,y))===Number(tables[1].rows[i][2])));
  const b=options[1].map(candidate=>inputPairs.every(([x,y])=>evaluate(candidate,x,y)===(x+y)%2));const carry=options[2].map(candidate=>inputPairs.every(([x,y])=>evaluate(candidate,x,y)===Math.floor((x+y)/2)));
  const decimal=(n:number)=>(n<0?"−":"")+(Math.abs(n)/10).toFixed(1),notation=`［${[...w.weights,w.example].map(decimal).join(", ")}］`;
  assert(prose.includes(`パラメタWxが${decimal(w.weights[0])}、Wyが${decimal(w.weights[1])}、Tが${decimal(w.example)}`));assert(prose.includes(`パラメタ${notation}`));assert(prose.includes("OR（論理和）になる"));
  assert.equal(tables[2].caption,`表3 パラメタ${notation}の場合の入出力関係`);assert.deepEqual(tables[2].columns,["入力X","入力Y","Wx×X＋Wy×Y","T","出力Z"]);
  assert.deepEqual(tables[2].rows,inputPairs.map(([x,y],i)=>[String(x),String(y),`${decimal(w.weights[0])}×${x}＋${decimal(w.weights[1])}×${y}`,decimal(w.example),String(independentThreshold([...w.weights,w.example],x,y))]));assert.deepEqual(tables[2].rows.map(r=>Number(r[4])),truth.OR);
  const vectorsD=options[3].map(vector),vectorsE=options[4].map(vector);assert.deepEqual(vectorsD,w.vectors);assert.deepEqual(vectorsE,w.vectors);
  const d=vectorsD.map(v=>inputPairs.every(([x,y],i)=>independentThreshold(v,x,y)===truth.AND[i])),e=vectorsE.map(v=>inputPairs.every(([x,y],i)=>independentThreshold(v,x,y)===truth.NAND[i]));
  [a,b,carry,d,e].forEach((correct,i)=>{assert.equal(correct.filter(Boolean).length,1);const answer=body.partAnswers![i];assert.equal(answer.kind,"choice");if(answer.kind!=="choice")throw Error("part");assert.equal(answer.partId,body.answerParts![i].id);assert.equal(answer.choiceId,body.answerParts![i].choiceIds[correct.indexOf(true)]);});
  const expectedKinds=[truth.NAND,truth.NOR,[1,1,1,1],truth.OR,truth.AND,[0,0,0,0]];vectorsD.forEach((v,i)=>assert.deepEqual(inputPairs.map(([x,y])=>independentThreshold(v,x,y)),expectedKinds[i]));
  for(const term of [c.target,c.known,c.final,options[0][a.indexOf(true)],`［${w.vectors[4].map(decimal).join(", ")}］`,`［${w.vectors[0].map(decimal).join(", ")}］`,"下位桁ZはXOR、桁上がりCはAND","Tと等しい場合","≧","Exclusive OR","Exclusive NOR"])assert(body.explanation.includes(term),term);
  return {compositionTruths:a,halfSumTruths:b,halfCarryTruths:carry,thresholdTruths:[d,e],vectors:vectorsD};
}
