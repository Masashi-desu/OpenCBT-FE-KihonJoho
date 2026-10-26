import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Legacy2018Figure} from "../../src/ui/Legacy2018Figures";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018PmReview as review} from "./legacy-2018-pm-review";

const prose=(blocks:GeneratedBody["prompt"])=>blocks.map(b=>b.type==="paragraph"||b.type==="code"?b.text:"").join("\n");
const number=(s:string)=>{assert.match(s,/^[\d,]+$/);return Number(s.replaceAll(",",""));};
const display=(n:number)=>n.toLocaleString("en-US");
export const pmFigureSvg=(profile:string,values:number[])=>renderToStaticMarkup(createElement(Legacy2018Figure,{profile,values,caption:"検算"})).replace(/<desc[^>]*>.*?<\/desc>/s,"");
export function reviewedProfitTable(svg:string){
  const cells=new Map([...svg.matchAll(/<text[^>]*data-cell="(\d+-\d+)"[^>]*>([^<]*)<\/text>/g)].map(m=>[m[1],m[2]]));
  assert.equal(cells.size,14,"two shaded rows must not acquire four answer-revealing cells");
  for(const [row,label]of ["ケース","販売数（千個）","売上高（千円）","変動費（千円）","固定費（千円）","利益（千円）"].entries())assert.equal(cells.get(`${row}-0`),label);
  assert.equal(cells.get("0-1"),"X");assert.equal(cells.get("0-2"),"Y");
  for(const row of [3,4])for(const col of [1,2])assert(!cells.has(`${row}-${col}`));
  assert.equal((svg.match(/data-hidden-cell=/g)??[]).length,4);
  const get=(row:number,col:number)=>number(cells.get(`${row}-${col}`)!);
  return {quantityX:get(1,1),quantityY:get(1,2),salesX:get(2,1),salesY:get(2,2),profitX:get(5,1),profitY:get(5,2)};
}
export function reviewedCostCurves(svg:string){
  const curves=[...svg.matchAll(/<g data-curve="(\d)"><line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"([^>]*)><\/line>((?:<line[^>]+><\/line>)?)<text[^>]*y="([\d.]+)"[^>]*>([^<]+)<\/text><\/g>/g)].map(m=>{
    const y2=Number(m[5]),labelY=Number(m[8]);
    if(labelY!==y2){assert(m[7].includes(`data-label-leader="${m[1]}"`));assert(m[7].includes(`x1="749" y1="${y2}" x2="770" y2="${labelY}"`));}else assert.equal(m[7],"");
    if(m[7]){assert(m[7].includes('stroke-dasharray="3 4"'));assert(m[7].includes("stroke-width:1;opacity:0.65"));}
    return {label:Number(m[1]),x1:Number(m[2]),y1:Number(m[3]),x2:Number(m[4]),y2,attributes:m[6],symbol:m[9]};
  });
  assert.equal(curves.length,4);assert(svg.includes(">費用</text>")&&svg.includes(">売上高</text>")&&svg.includes(">0</text>"));
  curves.forEach((c,i)=>{assert.equal(c.symbol,"①②③④"[i]);assert.equal(c.label,i+1);assert.equal(c.x1,90);assert.equal(c.x2,740);assert(c.y1>c.y2&&c.y2>=40);});
  assert(!curves[0].attributes.includes("stroke-dasharray"));assert(curves[1].attributes.includes('stroke-dasharray="14 9"'));assert(curves[2].attributes.includes('stroke-dasharray="2 10"'));assert(curves[3].attributes.includes('stroke-dasharray="24 9"'));
  assert.deepEqual([...curves].sort((a,b)=>a.y1-b.y1).map(c=>c.label),[1,3,2,4]);
  return curves;
}
/** Independent solution reads the actual SVG table cells and line endpoints,
 * not the generator's numeric/geometry helpers or supplied correct answers. */
export function assertLegacy2018Pm(source:string,body:GeneratedBody,values:number[]){
  assert.equal(source,review.source);assert.equal(values.length,4);assert(values.every(Number.isInteger));
  const [ratioCase,profitCase,scale,highest]=values;
  assert([[0,0],[0,1],[1,0],[1,1],[1,2]].some(([r,p])=>r===ratioCase&&p===profitCase));assert(scale>=1&&scale<=3&&highest>=0&&highest<=3);
  assert.equal(body.correctIndex,undefined);assert.equal(body.answerParts?.length,8);assert.equal(body.partAnswers?.length,8);assert.equal(body.choices.length,34);
  assert.deepEqual(body.answerParts!.map(p=>p.choiceIds.length),review.groups);assert.deepEqual(body.answerParts!.map(p=>p.label),review.labels);
  const prompt=prose(body.prompt);for(const condition of review.premises)assert(prompt.includes(condition),condition);
  assert(!prompt.includes("誤記"));assert(!prompt.includes("PARAMETER_CONSTRAINT"));
  const figures=body.prompt.filter(b=>b.type==="diagram");assert.equal(figures.length,2);
  const table=figures[0],graph=figures[1];assert.equal(table.scene.kind,"source_figure");assert.equal(graph.scene.kind,"source_figure");
  if(table.scene.kind!=="source_figure"||graph.scene.kind!=="source_figure")throw Error("figure type");
  assert.equal(table.scene.profile,"legacy-2018-profit-table");assert.equal(graph.scene.profile,"legacy-2018-cost-curves");assert.deepEqual(table.scene.values,values.slice(0,3));assert.deepEqual(graph.scene.values,[highest]);
  assert.equal(table.caption,"表1 収益検討表");assert.equal(graph.caption,"図1 4社の売上高と費用の関係を示したグラフ");
  const t=reviewedProfitTable(pmFigureSvg(table.scene.profile,table.scene.values));
  const expectedRatio=[75,80][ratioCase],expectedDiscount=[4,8,12][profitCase];
  assert.deepEqual(t,{quantityX:1000*scale,quantityY:1200*scale,salesX:200000*scale,salesY:240000*scale,profitX:2000*scale*expectedDiscount,profitY:2000*scale*expectedDiscount+400*scale*(100-expectedRatio)});
  assert(prompt.includes(`販売数を${display(t.quantityX)}千個`)&&prompt.includes(`${display(t.quantityY)}千個`));
  const ds=t.salesY-t.salesX,dp=t.profitY-t.profitX,variableRate=(ds-dp)*100/ds;
  const fixedNumerator=t.salesX*dp-t.profitX*ds;assert.equal(fixedNumerator%ds,0);const fixed=fixedNumerator/ds;
  assert.equal(fixed*ds%dp,0);const breakEven=fixed*ds/dp;assert.equal(t.profitX*100%t.salesX,0);const discount=t.profitX*100/t.salesX;
  const options=body.answerParts!.map(part=>part.choiceIds.map(id=>{const i=Number(id.replace("choice-value-",""))-1;assert(body.choices[i]);return prose(body.choices[i]);}));
  const numeric=options.slice(0,4).map(g=>g.map(number));
  const wrongFixed=t.salesX*(100-(variableRate-15))/100-t.profitX;
  const expectedNumeric=[[variableRate-50,variableRate-35,variableRate-15,variableRate,variableRate+5],[t.profitX,fixed,wrongFixed,t.salesX*(100-(variableRate-35))/100-t.profitX,t.salesX*(100-(variableRate-50))/100-t.profitX],
    [Math.round(fixed*100/variableRate),wrongFixed,Math.round(wrongFixed*100/variableRate),breakEven,wrongFixed*100/(100-variableRate)],[discount/2,discount,discount*5/4,discount*3/2,discount*2]];
  assert.deepEqual(numeric,expectedNumeric);
  const truths=numeric.map((group,i)=>group.map(n=>n===[variableRate,fixed,breakEven,discount][i]));
  const minGap=(g:number[],correct:number)=>Math.min(...g.filter(n=>n!==correct).map(n=>Math.abs(n-correct)/Math.abs(correct)));
  for(let i=0;i<4;i++){assert.equal(new Set(numeric[i]).size,numeric[i].length);assert(numeric[i].every(Number.isInteger));assert(minGap(numeric[i],[variableRate,fixed,breakEven,discount][i])+1e-10>=minGap(review.originalChoices[i].map(number),[75,34000,136000,8][i])/2);}
  assert.deepEqual(options.slice(4),review.originalChoices.slice(4));
  const eCompare=t.profitY*t.salesX-t.profitX*t.salesY;truths.push([eCompare===0,eCompare>0,eCompare<0]);
  const curves=reviewedCostCurves(pmFigureSvg(graph.scene.profile,graph.scene.values));
  const slopes=curves.map(c=>(c.y1-c.y2)/(c.x2-c.x1)),largest=Math.max(...slopes);truths.push(slopes.map(m=>m===largest));
  assert.equal(slopes.indexOf(largest),highest);
  // No tick units are printed in the original graph. A common positive scale
  // for each axis must still make R's displayed curve C(S)=r*S+F compatible
  // with the financial table; choosing R's intercept fixes the cost scale.
  const selected=curves[highest],costUnit=fixed/(430-selected.y1),salesAtRight=(selected.y1-selected.y2)*costUnit/(variableRate/100);
  assert(costUnit>0&&salesAtRight>0);
  for(const fraction of [0,.25,.5,.75,1]){const plottedCost=(430-selected.y1+(selected.y1-selected.y2)*fraction)*costUnit,financialCost=fixed+variableRate/100*salesAtRight*fraction;assert(Math.abs(plottedCost-financialCost)<1e-7);}

  // Fixed denominator perturbation, followed by the reviewed meanings of the
  // four measures. This does not infer IPA's official scoring methodology.
  const lowerRatioBreakEven=fixed/(1-variableRate/100+.01);assert(lowerRatioBreakEven>0&&lowerRatioBreakEven<breakEven);
  truths.push([false,true,false],[true,false,false,false]);
  truths.forEach((valid,i)=>{assert.equal(valid.filter(Boolean).length,1);const answer=body.partAnswers![i];assert.equal(answer.kind,"choice");if(answer.kind!=="choice")throw Error("answer shape");assert.equal(answer.partId,body.answerParts![i].id);assert.equal(answer.choiceId,body.answerParts![i].choiceIds[valid.indexOf(true)]);});
  for(const conclusion of [`変動費率は${variableRate}%`,`${display(fixed)}千円が固定費`,`${display(breakEven)}千円`,`${discount}%`,`最も傾きが大きい${"①②③④"[highest]}`,"固定費一定で変動費率を下げる","販売数・変動費総額を固定した値下げ"])assert(body.explanation.includes(conclusion),conclusion);
  return {table:t,variableRate,fixed,breakEven,discount,slopes};
}
