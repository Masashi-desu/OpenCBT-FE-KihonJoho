import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {Legacy2018EvmFigure} from "../../src/ui/Legacy2018EvmFigures";
import {legacy2018EvmReview as review} from "./legacy-2018-pm-evm-review";
const prose=(blocks:GeneratedBody["prompt"])=>blocks.map(b=>b.type==="paragraph"?b.text:"").join("\n");
const close=(a:number,b:number)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
export const evmSvg=(profile:string,values:number[])=>renderToStaticMarkup(createElement(Legacy2018EvmFigure,{profile,values,caption:"検算"})).replace(/<desc[^>]*>.*?<\/desc>/s,"");
const attr=(tag:string,key:string)=>{const match=tag.match(new RegExp(`(?:^| )${key}="([^"]+)"`));assert(match,`${key}: ${tag}`);return match[1];};
const group=(svg:string,key:string,value:string)=>{const match=svg.match(new RegExp(`<g ${key}="${value}">([\\s\\S]*?)</g>`));assert(match,`${key}=${value}`);return match[1];};
/** Parse precisely what appears in the candidate, not its internal numbers. */
export function hundredths(text:string){assert.match(text,/^\d+\.\d{2}$/);const [whole,decimal]=text.split(".");return Number(whole)*100+Number(decimal);}
const two=(n:number)=>`${Math.floor(n/100)}.${String(n%100).padStart(2,"0")}`;
const roundedSeventhEighth=(n:number)=>Number((BigInt(n)*7n*2n+8n)/16n);
export function evaluateForecast(rows:string[][]){
  assert.equal(rows.length,3);const v=rows.map(row=>row.slice(1).map(hundredths));
  const delay=v.map(([,pv,ev])=>BigInt(ev)<BigInt(pv));
  // Estimated final actual cost = final PV * AC / EV; compare exact integers.
  const over=v.map(([final,,ev,ac])=>BigInt(final)*BigInt(ac)>BigInt(final)*BigInt(ev));
  const truth=[!delay[0]&&!over[0],!delay[0]&&over[0],delay[1],!delay[1]&&over[1],delay[2],!delay[2]&&!over[2]];
  return{v,delay,over,truth,trueStatements:truth.flatMap((b,i)=>b?[i+1]:[])};
}
/** Axes, plotted coordinates, marker styles and gap endpoints are all taken
 * from serialized managed SVG. No production model/solver is imported. */
export function readEvmGraph(svg:string,scale:number){
  const ticks=[...svg.matchAll(/<text data-axis-value="effort"[^>]*>\d+<\/text>/g)].map(m=>({n:Number(m[0].match(/>(\d+)</)![1]),y:Number(attr(m[0],"y"))}));
  assert.deepEqual(ticks.map(t=>t.n),Array.from({length:9},(_,i)=>i*50*scale));
  const months=[...svg.matchAll(/<text data-axis-value="month"[^>]*>\d+<\/text>/g)].map(m=>({n:Number(m[0].match(/>(\d+)</)![1]),x:Number(attr(m[0],"x"))}));assert.deepEqual(months.map(t=>t.n),[2,3,4,5,6,7,8,9,10,11,12]);
  const unitX=(months.at(-1)!.x-months[0].x)/10,unitY=(ticks[0].y-ticks.at(-1)!.y)/(400*scale),month=(x:number)=>2+(x-months[0].x)/unitX,effort=(y:number)=>(ticks[0].y-y)/unitY;
  for(const t of ticks)close(effort(t.y),t.n);for(const m of months)close(month(m.x),m.n);
  const data=Object.fromEntries(["PV","EV","AC"].map((name,i)=>{const g=group(svg,"data-series",name),tag=g.match(/<polyline[^>]+>/)![0],points=attr(tag,"points").split(" ").map(pair=>{const [x,y]=pair.split(",").map(Number);return{month:month(x),effort:effort(y),x,y};});
    assert.equal(attr(tag,"fill"),"none");assert.equal(tag.match(/stroke-dasharray="([^"]+)"/)?.[1],[undefined,"14 9","2 7"][i]);
    const markers=[...g.matchAll(i===0?/<rect[^>]+>/g:/<circle[^>]+>/g)].map(m=>m[0]);assert.equal(markers.length,points.length);
    markers.forEach((m,j)=>{close(Number(attr(m,i===0?"x":"cx"))+(i===0?5:0),points[j].x);close(Number(attr(m,i===0?"y":"cy"))+(i===0?5:0),points[j].y);assert.equal(attr(m,"style"),i===2?"fill:var(--surface)":"fill:currentColor");});
    const legend=group(svg,"data-legend",name);assert(legend.includes(`>${name}</text>`));assert.equal(legend.match(/stroke-dasharray="([^"]+)"/)?.[1],[undefined,"14 9","2 7"][i]);assert(legend.includes(i===2?'style="fill:var(--surface)"':'style="fill:currentColor"'));
    assert.deepEqual(points.map(p=>Math.round(p.month)),i===0?[2,3,4,5,6,7,8,9,10,11,12]:[3,4,5,6,7,8,9,10,11]);points.forEach(p=>{close(p.month,Math.round(p.month));assert(p.effort>=0&&p.effort<=400*scale);});
    for(let j=1;j<points.length;j++)assert(points[j].effort>=points[j-1].effort-1e-8,"Cumulative effort must not decrease");return[name,points];
  }));
  for(const [name,expectedMonth]of [["start",10],["one-month",11]] as const){const tag=svg.match(new RegExp(`<path data-evaluation="${name}"[^>]+>`))![0],parts=attr(tag,"d").match(/^M ([\d.]+) ([\d.]+) H ([\d.]+) V ([\d.]+)$/);assert(parts);close(month(Number(parts[3])),expectedMonth);assert(Number(parts[4])<ticks.at(-1)!.y);}
  const last=(name:string)=>data[name].find(p=>Math.abs(p.month-11)<1e-8)!;
  const gaps=["alpha","beta"].map((name,i)=>{const g=group(svg,"data-gap",name),upper=g.match(/<line data-gap-edge="upper"[^>]+>/)![0],lower=g.match(/<line data-gap-edge="lower"[^>]+>/)![0],u=last(i===0?"AC":"PV"),e=last("EV");close(Number(attr(upper,"y1")),u.y);close(Number(attr(upper,"y2")),u.y);close(Number(attr(lower,"y1")),e.y);close(Number(attr(lower,"y2")),e.y);assert(Number(attr(upper,"x1"))>u.x);assert(Number(attr(upper,"x1"))-u.x>=9-1e-8);assert(Number(attr(upper,"y1"))<Number(attr(lower,"y1")));
    const bracket=g.match(/<path data-gap-bracket="[^"]+"[^>]+>/)![0],numbers=attr(bracket,"d").match(/^M ([\d.]+) ([\d.]+) H ([\d.]+) V ([\d.]+) H ([\d.]+)$/);assert(numbers);close(Number(numbers[1]),Number(attr(upper,"x2"))+6);close(Number(numbers[2]),u.y);close(Number(numbers[4]),e.y);assert(g.includes(`>${i===0?"α":"β"}</text>`));return{top:u.y,bottom:e.y,x:Number(numbers[3]),leaderEnd:Number(attr(upper,"x2"))};
  });
  // No vertical bracket passes through the other interval's upper leader.
  const [outer,inner]=[...gaps].sort((a,b)=>b.x-a.x);assert(outer.top<inner.top);assert(inner.leaderEnd<outer.x);assert(outer.top<inner.top-1,"separate upper guides");
  const at=(name:string,m:number)=>data[name].find(p=>Math.abs(p.month-m)<1e-8)!.effort;
  const spi=[10,11].map(m=>at("EV",m)/at("PV",m)),cpi=[10,11].map(m=>at("EV",m)/at("AC",m)),scheduleGap=[10,11].map(m=>at("PV",m)-at("EV",m)),costGap=[10,11].map(m=>at("AC",m)-at("EV",m));
  return{data,gaps,at,spi,cpi,scheduleGap,costGap,order:["PV","EV","AC"].sort((a,b)=>last(b).effort-last(a).effort)};
}
export function assertLegacy2018Evm(source:string,body:GeneratedBody,values:number[]){
  assert.equal(source,review.source);assert.equal(values.length,3);const [scale,scenario,trend]=values;assert([1,2].includes(scale)&&Number.isInteger(scenario)&&scenario>=0&&scenario<8&&Number.isInteger(trend)&&trend>=0&&trend<4);
  assert.equal(body.correctIndex,undefined);assert.equal(body.choices.length,34);assert.deepEqual(body.answerParts?.map(p=>p.choiceIds.length),review.groups);assert.deepEqual(body.answerParts?.map(p=>p.label),review.labels);assert.equal(body.partAnswers?.length,6);
  const text=prose(body.prompt);for(const term of review.premiseTerms)assert(text.includes(term),term);
  const tables=body.prompt.filter(b=>b.type==="table");assert.equal(tables.length,5);assert.deepEqual(tables[0].rows,review.productivity);assert.deepEqual(tables[0].columns,["開発工程","生産性"]);assert.equal(tables[0].caption,"表1 各開発工程の生産性（単位 KLOC／人月）");assert.deepEqual(tables[1].rows,review.sizes.map(([name,n])=>[name,two(hundredths(n)*scale)]));assert.deepEqual(tables[1].columns,["サブシステム","開発規模"]);assert.deepEqual(tables[2].rows,review.indicators);assert.deepEqual(tables[2].columns,["指標","名称","意味"]);assert.deepEqual(tables[4].rows,review.eRows);assert.deepEqual(tables[4].columns,["解答記号","e1","e2","e3"]);
  assert.deepEqual(tables[3].columns,["サブシステム","外部設計終了時点 PV（出来高計画値）","外部設計開始から1.75か月経過時点 PV（出来高計画値）","同時点 EV（出来高実績値）","同時点 AC（コスト実績値）"]);
  const f=evaluateForecast(tables[3].rows),state=review.scenarios[scenario];assert.deepEqual(tables[3].rows.map(row=>row[0]),review.sizes.map(row=>row[0]));
  f.v.forEach(([final,pv,ev,ac],i)=>{const size=hundredths(tables[1].rows[i][1]),productivity=hundredths(tables[0].rows[0][1]);assert.equal(final,Number(BigInt(size)*100n/BigInt(productivity)));assert.equal(pv,roundedSeventhEighth(final));assert.equal(ev,state.states[i][0]==="O"?pv:review.lateEvHundredths[i]*scale);assert.equal(ac,state.states[i][1]==="+"?ev+review.overAcIncrements[i]*scale:ev-review.withinAcDecrements[i]*scale);assert.equal(f.delay[i],state.states[i][0]==="L");assert.equal(f.over[i],state.states[i][1]==="+");assert.equal(f.delay[i],BigInt(ev)*8n<BigInt(final)*7n,"displayed and unrounded PV must not disagree");});
  assert.deepEqual(f.trueStatements,state.trueStatements);assert.equal(f.trueStatements.length,2);
  const diagrams=body.prompt.filter(b=>b.type==="diagram");assert.equal(diagrams.length,3);for(const b of diagrams)assert.equal(b.scene.kind,"source_figure");const scenes=diagrams.map(b=>{assert(b.scene.kind==="source_figure");return b.scene;});assert.deepEqual(scenes.map(s=>[s.profile,s.values]),[["legacy-2018-evm-timeline",[0]],["legacy-2018-evm-plan-table",[scale]],["legacy-2018-evm-status",[trend,scale]]]);
  const timeline=evmSvg(scenes[0].profile,scenes[0].values),plan=evmSvg(scenes[1].profile,scenes[1].values),graph=readEvmGraph(evmSvg(scenes[2].profile,scenes[2].values),scale);
  assert(diagrams[2].alt.includes(`11か月時点の上からの順序は${graph.order.join("、")}。`));
  assert.equal((timeline.match(/data-schedule="phase"/g)??[]).length,6);const ticks=[...timeline.matchAll(/<text data-month="(\d+)"[^>]*>/g)].map(m=>({month:Number(m[1]),x:Number(attr(m[0],"x"))}));assert.deepEqual(ticks.map(t=>t.month),review.phaseBounds);
  for(let i=0;i<6;i++){const g=group(timeline,"data-phase",String(i)),arrow=g.match(/<line data-schedule="phase"[^>]+>/)![0];close(Number(attr(arrow,"x1")),ticks[i].x);close(Number(attr(arrow,"x2"))+3,ticks[i+1].x);const labels=[...g.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map(m=>m[1]);assert.equal(labels.join(""),review.phaseNames[i]);}
  const contract=timeline.match(/<path data-contract="accepted"[^>]+>/)![0];assert.equal(attr(contract,"d"),`M ${ticks[2].x} 208 Q ${ticks[2].x} 230 ${ticks[2].x+30} 230 H ${ticks[6].x-30} Q ${ticks[6].x} 230 ${ticks[6].x} 208`);
  assert.equal((plan.match(/data-hidden-cell=/g)??[]).length,3);for(const row of [2,3,4])assert(plan.includes(`data-hidden-cell="${row}-2"`));const cells=Object.fromEntries([...plan.matchAll(/<text data-cell="([^"]+)"[^>]*>([^<]+)<\/text>/g)].map(m=>[m[1],m[2]]));assert.equal(Object.keys(cells).length,12);for(const [i,row]of review.sourcePlan.entries()){assert.equal(cells[`${i+1}-0`],row[0]);assert.equal(cells[`${i+1}-1`],two(hundredths(row[1]!)*scale));assert.equal(cells[`${i+1}-2`],i===0?"a":undefined);}
  // Compute planned phase efforts independently from actual source tables.
  const totalSize=tables[1].rows.reduce((n,row)=>n+hundredths(row[1]),0)/100,phaseEffort=tables[0].rows.map(row=>totalSize/(hundredths(row[1])/100));
  const planned=(m:number)=>{let sum=0;for(let phase=0;phase<4;phase++){const start=review.phaseBounds[phase+2],end=review.phaseBounds[phase+3],duration=end-start;sum+=phaseEffort[phase]*Math.max(0,Math.min(duration,m-start))/duration;}return sum;};for(let m=2;m<=12;m++)close(graph.at("PV",m),planned(m));
  for(const name of ["EV","AC"]){const value=f.v.reduce((n,row)=>n+row[name==="EV"?2:3],0)/100;assert(value>=graph.at(name,3)-1e-8&&value<=graph.at(name,4)+1e-8,"table5 evaluation is within graph's month3–4 cumulative range");}
  const improvingSchedule=graph.spi[1]>graph.spi[0],improvingCost=graph.cpi[1]>graph.cpi[0];assert.equal(improvingSchedule,[false,true,true,false][trend]);assert.equal(improvingCost,[false,true,false,true][trend]);assert.equal(graph.scheduleGap[1]<graph.scheduleGap[0],improvingSchedule);assert.equal(graph.costGap[1]<graph.costGap[0],improvingCost);
  const options=body.answerParts!.map(part=>part.choiceIds.map(id=>prose(body.choices[Number(id.replace("choice-value-",""))-1])));assert.deepEqual(options[0],review.sourceA.map(n=>two(hundredths(n)*scale)));assert.deepEqual(options[1],review.pairs.map(pair=>`(${pair[0]})と(${pair[1]})`));assert.deepEqual(options[2],review.trends);assert.deepEqual(options[3],review.indicatorChoices);assert.deepEqual(options[4],review.indicatorChoices);assert.deepEqual(options[5],review.eRows.map(r=>`解答群表の${r[0]}行（${r.slice(1).join("、")}）`));
  const internal=Number(BigInt(hundredths(tables[1].rows[0][1]))*100n/BigInt(hundredths(tables[0].rows[1][1]))),correctA=options[0].map(n=>hundredths(n)===internal),correctForecast=review.pairs.map(pair=>pair.every(n=>f.trueStatements.includes(n))),correctB=review.trends.map((_,i)=>i===([false,true].indexOf(improvingSchedule)===1?improvingCost?1:2:improvingCost?3:0)),correctC=review.indicatorChoices.map(s=>s.startsWith("CV（")),correctD=review.indicatorChoices.map(s=>s.startsWith("SV（")),correctE=review.eRows.map(row=>row.slice(1).join("-")==="BAC-EV-AC");
  [correctA,correctForecast,correctB,correctC,correctD,correctE].forEach((matches,i)=>{assert.equal(matches.filter(Boolean).length,1);const answer=body.partAnswers![i];assert.equal(answer.kind,"choice");if(answer.kind!=="choice")throw Error("choice");assert.equal(answer.partId,body.answerParts![i].id);assert.equal(answer.choiceId,body.answerParts![i].choiceIds[matches.indexOf(true)]);});
  const bac=planned(12),ev=graph.at("EV",11),ac=graph.at("AC",11);for(const term of [two(internal),review.trends[trend],"CV＝EV−AC","SV＝EV−PV","BAC−EV＋AC",(bac-ev+ac).toFixed(2),"設問2のCPI一定による補正をここへ流用しない","Budget at Completion","Schedule Performance Index","Cost Performance Index"])assert(body.explanation.includes(term),term);
  return{forecast:f,graph,remaining:bac-ev,totalEstimate:bac-ev+ac};
}
