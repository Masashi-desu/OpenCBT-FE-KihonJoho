import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {Legacy2017ComputingFigure} from "../../src/ui/Legacy2017ComputingFigures";
import {legacy2017ComputingReview as reviews,legacy2017ComputingSourceStems as stems,legacy2017ComputingPageInputs as sequences,legacy2017ComputingArrayFacts as arrayFacts,legacy2017ComputingSetPairs as setPairs} from "./legacy-2017-computing-review";
import {legacy2017ComputingWireReview as wires,legacy2017ComputingReplacementPositions as replacementPositions} from "./legacy-2017-computing-svg-review";
import {legacy2017ComputingExplanationFacts} from "./legacy-2017-computing-explanations";

const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
const attributes=(s:string)=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
export function computingSvg(profile:string,values:number[]){return renderToStaticMarkup(createElement(Legacy2017ComputingFigure,{profile,values,caption:"独立表示検査"}));}
/** Extract the actual visible component centres and actual wire vertices, then
 * form connectivity. IDs alone cannot establish the graph. */
export function readAvailabilitySvg(svg:string){
 const leads=[...svg.matchAll(/<line ([^>]*)>/g)].map(m=>{const a=attributes(m[1]);return [Number(a.x1),Number(a.y1),Number(a.x2),Number(a.y2)];});assert.deepEqual(leads,[[55,160,100,160],[880,160,925,160]]);
 const nodes=new Map<string,[number,number]>(),components:string[]=[];
 for(const m of svg.matchAll(/<g ([^>]*data-component[^>]*)>(.*?)<\/g>/g)){
  const a=attributes(m[1]),rect=attributes(m[2].match(/<rect ([^>]*)>/)![1]),text=attributes(m[2].match(/<text ([^>]*)>/)![1]);
  assert.equal(rect.width,"150");assert.equal(rect.height,"50");assert.match(m[2],/>R<\/text>/);
  const centre:[number,number]=[Number(rect.x)+75,Number(rect.y)+25];assert.deepEqual(centre,[Number(text.x),Number(text.y)]);assert.deepEqual(centre,[Number(a["data-node-x"]),Number(a["data-node-y"])]);nodes.set(a["data-component"],centre);components.push(a["data-component"]);
 }
 assert.deepEqual(components,["R0","R1","R2","R3"]);nodes.set("start",[100,160]);nodes.set("end",[880,160]);if(svg.includes('data-to="middle"'))nodes.set("middle",[480,160]);
 const actualWires:string[][]=[];const edges:[string,string][]=[];for(const m of svg.matchAll(/<polyline ([^>]*)>/g)){
  const a=attributes(m[1]),from=a["data-from"],to=a["data-to"],points=a.points.split(" ").map(s=>s.split(",").map(Number));assert(nodes.has(from)&&nodes.has(to));assert.deepEqual(points[0],nodes.get(from));assert.deepEqual(points.at(-1),nodes.get(to));assert.equal(points.length,4);for(let i=1;i<points.length;i++)assert(points[i][0]===points[i-1][0]||points[i][1]===points[i-1][1]);edges.push([from,to]);
  actualWires.push([from,to,a.points]);
 }
 const kind=nodes.get("R0")![0]===280?0:nodes.get("R0")![0]===300?1:2;assert.deepEqual(actualWires,wires[kind]);assert([6,8].includes(edges.length));return {nodes,components,edges};
}
export function readDirectorySvg(svg:string){
 const nodes=new Map<string,{name:string;x:number;y:number}>();
 for(const m of svg.matchAll(/<text ([^>]*data-directory[^>]*)>(.*?)<\/text>/g)){const a=attributes(m[1]);nodes.set(a["data-directory"],{name:decode(m[2]),x:Number(a.x),y:Number(a.y)});}
 assert.equal(nodes.size,15);assert.equal(nodes.get("/")!.name,"ルート");const edges:[string,string][]=[];
 for(const m of svg.matchAll(/<line ([^>]*data-parent[^>]*)>/g)){const a=attributes(m[1]),p=nodes.get(a["data-parent"])!,c=nodes.get(a["data-child"])!;assert(p&&c);assert.deepEqual([Number(a.x1),Number(a.y1),Number(a.x2),Number(a.y2)],[p.x,p.y+20,c.x,c.y-20]);edges.push([a["data-parent"],a["data-child"]]);}
 assert.equal(edges.length,14);for(const [id,node]of nodes){const children=edges.filter(e=>e[0]===id).map(e=>nodes.get(e[1])!.name);if(node.y<335)assert.deepEqual(children,["A","B"]);else assert.equal(children.length,0);}
 return {nodes,edges};
}
export function directoryEndpoint(moves:string,tree=readDirectorySvg(computingSvg("legacy-2017-directory-tree",[0]))){
 let current="/";for(const instruction of moves.split(" → ")){
  assert(instruction.length);if(instruction.startsWith("¥"))current="/";
  for(const name of instruction.split("¥").filter(Boolean)){
   if(name===".")continue;if(name===".."){const parent=tree.edges.find(e=>e[1]===current);assert(parent);current=parent[0];continue;}
   const matches=tree.edges.filter(e=>e[0]===current&&tree.nodes.get(e[1])!.name===name);assert.equal(matches.length,1);current=matches[0][1];
  }
 }
 const labels:string[]=[];while(current!=="/"){labels.unshift(tree.nodes.get(current)!.name);current=tree.edges.find(e=>e[1]===current)![0];}return "¥"+labels.join("¥");
}
export function readReplacementSvg(svg:string){
 const cells=new Map<string,string>();for(const m of svg.matchAll(/<text ([^>]*data-cell[^>]*)>(.*?)<\/text>/g)){const a=attributes(m[1]),[r,c]=a["data-cell"].split("-").map(Number),expected=replacementPositions.cells[r]?.[c];assert(expected);assert.deepEqual({text:decode(m[2]),x:Number(a.x),y:Number(a.y)},expected);assert(!cells.has(a["data-cell"]));cells.set(a["data-cell"],decode(m[2]));}
 const headings=[...svg.matchAll(/<text ([^>]*data-heading[^>]*)>(.*?)<\/text>/g)].map(m=>{const a=attributes(m[1]);return {text:decode(m[2]),x:Number(a.x),y:Number(a.y)};});assert.deepEqual(headings,replacementPositions.headings);
 assert.equal(cells.size,12);assert.match(svg,/data-heading="FIFO"[^>]*>FIFO<\/text>/);assert.match(svg,/data-heading="LRU"[^>]*>LRU<\/text>/);
 const rows=Array.from({length:4},(_,i)=>[cells.get(`${i}-0`)!,cells.get(`${i}-1`)!,cells.get(`${i}-2`)!]);assert.deepEqual(rows,[["ア","3","2"],["イ","3","6"],["ウ","4","3"],["エ","5","4"]]);return rows;
}
/** Queue insertion order / LRU stack order, independent of timestamp eviction. */
export function replacementTrace(sequence:number[]){
 return [false,true].map(lru=>{const queue:number[]=[],trace:{page:number;hit:boolean;evicted:number|null;memory:number[]}[]=[];let replacements=0;
  for(const page of sequence){const index=queue.indexOf(page),hit=index>=0;let evicted:number|null=null;if(hit){if(lru){queue.splice(index,1);queue.push(page);}}else{if(queue.length===3){evicted=queue.shift()!;replacements++;}queue.push(page);}trace.push({page,hit,evicted,memory:[...queue]});}return {replacements,trace};});
}
/** One-second events: ready printing jobs wait in priority order. CPU and
 * printer consume separate seconds, avoiding the producer's max recurrence. */
export function jobEvents(rows:{job:string;execute:number;print:number}[]){
 let cpuJob=0,cpuLeft=rows[0].execute,printerJob=-1,printerLeft=0,finished=0;const ready:number[]=[],events=rows.map(r=>({...r,cpuEnd:0,printStart:0,printEnd:0}));
 for(let time=0;finished<4;time++){
  if(printerJob<0&&ready.length){printerJob=ready.shift()!;printerLeft=rows[printerJob].print;events[printerJob].printStart=time;}
  if(cpuJob<4&&--cpuLeft===0){events[cpuJob].cpuEnd=time+1;ready.push(cpuJob);cpuJob++;if(cpuJob<4)cpuLeft=rows[cpuJob].execute;}
  if(printerJob>=0&&--printerLeft===0){events[printerJob].printEnd=time+1;printerJob=-1;finished++;}assert(time<2000);
 }return events;
}
function boolExpression(text:string,variables:Record<string,boolean>){
 const tokens=text.match(/NAND|[A-CXY()]|[∩∪]/g)!;assert.equal(tokens.join(""),text.replace(/\s/g,""));let pos=0;
 const atom=():boolean=>{const t=tokens[pos++];if(t==="("){const v=expr();assert.equal(tokens[pos++],")");return v;}assert(t in variables);return variables[t];};
 const expr=():boolean=>{let v=atom();while(pos<tokens.length&&tokens[pos]!==")"){const op=tokens[pos++],right=atom();if(op==="NAND")v=!(v&&right);else if(op==="∩")v=v&&right;else{assert.equal(op,"∪");v=v||right;}}return v;};
 const result=expr();assert.equal(pos,tokens.length);return result;
}
type Q={n:bigint;d:bigint};const q=(n:bigint,d=1n):Q=>({n,d});const add=(a:Q,b:Q):Q=>q(a.n*b.d+b.n*a.d,a.d*b.d),sub=(a:Q,b:Q):Q=>q(a.n*b.d-b.n*a.d,a.d*b.d),mul=(a:Q,b:Q):Q=>q(a.n*b.n,a.d*b.d);
function availabilityFormula(text:string,r:Q):Q{
 const tokens=text.replace(/²/g,"^2").replace(/⁴/g,"^4").replace(/−/g,"-").replace(/\s/g,"").match(/R|1|2|4|[()^\-]/g)!;assert.equal(tokens.join(""),text.replace(/²/g,"^2").replace(/⁴/g,"^4").replace(/−/g,"-").replace(/\s/g,""));let pos=0;
 const atom=():Q=>{const t=tokens[pos++];let v:Q;if(t==="("){v=expr();assert.equal(tokens[pos++],")");}else{assert(t==="1"||t==="R");v=t==="R"?r:q(1n);}if(tokens[pos]==="^"){pos++;const n=Number(tokens[pos++]);let power=q(1n);for(let i=0;i<n;i++)power=mul(power,v);v=power;}return v;};
 const expr=():Q=>{let v=atom();while(tokens[pos]==="-"){pos++;v=sub(v,atom());}return v;};const result=expr();assert.equal(pos,tokens.length);return result;
}
function graphProbability(svg:string,k:number):Q{
 const {edges,components}=readAvailabilitySvg(svg);let numerator=0n;
 for(let mask=0;mask<16;mask++){
  const up=new Set(components.filter((_,i)=>mask&(1<<i))),seen=new Set(["start"]),queue=["start"];while(queue.length){const n=queue.shift()!;for(const [a,b]of edges){const next=a===n?b:b===n?a:null;if(next&&!seen.has(next)&&(!components.includes(next)||up.has(next))){seen.add(next);queue.push(next);}}}
  if(seen.has("end"))numerator+=BigInt(k)**BigInt(up.size)*BigInt(10-k)**BigInt(4-up.size);
 }return q(numerator,10000n);
}
const paragraph=(blocks:GeneratedBody["prompt"])=>blocks.filter(b=>b.type==="paragraph").map(b=>(b as {text:string}).text).join("\n");
const strings=(body:GeneratedBody)=>body.choices.map(c=>{assert.equal(c.length,1);assert.equal(c[0].type,"paragraph");return(c[0]as{text:string}).text;});
const figure=(body:GeneratedBody,profile:string)=>{const figures=body.prompt.filter(b=>b.type==="diagram");assert.equal(figures.length,1);const f=figures[0];assert(f.type==="diagram"&&f.scene.kind==="source_figure");assert.equal(f.scene.profile,profile);return f.scene.values;};
export function legacy2017ComputingOracle(source:string,body:GeneratedBody,values:number[]){
 const number=Number(source.split("-").at(-1)),review=reviews.find(r=>r.number===number)!;assert(review);const prompt=paragraph(body.prompt),options=strings(body);let truth:boolean[]=[];
 if(number===1){assert.equal(prompt,stems[1]);assert.deepEqual(options,setPairs.map((pair,i)=>pair[values[i]]));truth=options.map(s=>{const sides=s.split(" ＝ ");assert.equal(sides.length,2);return Array.from({length:8},(_,i)=>({A:!!(i&1),B:!!(i&2),C:!!(i&4)})).every(v=>boolExpression(sides[0],v)===boolExpression(sides[1],v));});assert.deepEqual(truth,values.map(n=>n===1));assert(body.explanation.includes(options[body.correctIndex!]));}
 else if(number===3){assert.deepEqual(options,review.choices);assert.match(prompt,/NAND Yは、NOT\(X AND Y\)として定義/);const target=prompt.match(/。(.+)をNANDだけを使って表した論理式はどれか。$/)![1];assert.equal(target,["NOT Y","X OR Y","X AND Y","NOT X"][values[0]]);truth=options.map(s=>Array.from({length:4},(_,i)=>({X:!!(i&1),Y:!!(i&2)})).every(v=>boolExpression(s,v)===(target==="NOT Y"?!v.Y:target==="NOT X"?!v.X:target==="X OR Y"?v.X||v.Y:v.X&&v.Y)));}
 else if(number===4){assert.equal(prompt,stems[4]);assert.equal(options[0],review.choices[0]);const conditions=[[/位置を指定.*直接アクセス/,true],[/先頭.*挿入|先頭へ.*挿入/,false],[/参照は効率的ではない|必ず先頭から.*ポインタ|格納位置が連続していない/,false],[/隣接するデータを移動せず|後続の要素を移動せず|ポインタを書き換えるだけで変更/,false]] as const;truth=options.map((s,i)=>{assert.equal(s,arrayFacts[values[0]][i].text);assert(arrayFacts[values[0]][i].reason.length>20);assert.match(s,conditions[i][0]);return arrayFacts[values[0]][i].suitable;});}
 else if(number===8){
  const table=body.prompt.find(b=>b.type==="table");assert(table?.type==="table");assert.equal(table.rows.length,3);assert.deepEqual(table.rows.map(r=>r[0]),["レジスタ間演算","メモリ・レジスタ間演算","無条件分岐"]);const clock=Number(prompt.match(/(\d+)MHz/)![1]),cycles=table.rows.map(r=>Number(r[1])),rates=table.rows.map(r=>Number(r[2]));assert.equal(rates.reduce((a,b)=>a+b),100);assert.deepEqual(cycles,values[0]===0?[4,8,10]:[2,4,6]);assert.deepEqual(rates,values[0]===0?[30,60,10]:[25,50,25]);assert.equal(clock,(values[0]===0?350:200)*values[1]);const weighted=cycles.reduce((n,c,i)=>n+c*rates[i],0),answer=clock*100/weighted;assert(Number.isInteger(answer));assert.deepEqual(options.map(Number),[answer/10,answer/2,answer*7/10,answer]);truth=options.map(s=>Number(s)===answer);assert.match(prompt,/約何MIPSか/);assert(body.explanation.includes(String(answer)));}
 else if(number===10){assert.deepEqual(options,review.choices);assert.equal(prompt,["1000BASE-T","シリアルATA（SATA）","IEEE 1394","USB 3.0"][values[0]]+"の説明として、適切なものはどれか。");const conditions=[/1クロックで2ビット.*4対.*最大1G/,/ATA仕様をシリアル化/,/アイソクロナス.*ブロードキャスト.*シリアル/,/スーパースピード.*5G.*データ転送モード/];conditions.forEach((r,i)=>assert.match(options[i],r));truth=options.map((_,i)=>i===values[0]);}
 else if(number===14){assert.match(prompt,/少なくとも1台/);assert.match(prompt,/全ての装置/);assert.match(prompt,/故障は互いに独立/);assert.deepEqual(options,review.choices);const v=figure(body,"legacy-2017-four-device-availability");assert.deepEqual(v,values);const svg=computingSvg("legacy-2017-four-device-availability",v);truth=options.map(s=>Array.from({length:9},(_,i)=>i+1).every(k=>{const a=availabilityFormula(s,q(BigInt(k),10n)),b=graphProbability(svg,k);return a.n*b.d===b.n*a.d;}));}
 else if(number===16){
  assert.equal(prompt,stems[16]);const conditions=body.prompt.find(b=>b.type==="list");assert(conditions?.type==="list");assert.equal(conditions.ordered,true);assert.equal(conditions.items.length,5);[/一斉.*多重度1/,/A.*最も高.*B、C、D/,/実行後.*スプーリング.*1台.*逐次/,/単独.*実行時間と印刷時間/,/オーバヘッド.*考慮しない/].forEach((p,i)=>assert.match(conditions.items[i],p));const table=body.prompt.find(b=>b.type==="table");assert(table?.type==="table");assert.equal(table.caption,"単位：秒");assert.deepEqual(table.columns,["ジョブ","実行時間","印刷時間"]);const rows=table.rows.map(r=>({job:r[0],execute:Number(r[1]),print:Number(r[2])}));assert.deepEqual(rows.map(r=>r.job),["A","B","C","D"]);for(const row of rows)for(const n of [row.execute,row.print])assert(Number.isInteger(n)&&n>=10&&n<=90);const patterns=[[[5,3,2,4],[5,4,3,2]],[[6,2,2,4],[5,4,3,2]],[[4,4,2,4],[6,4,3,2]]];assert.deepEqual(rows.map(r=>r.execute),patterns[values[0]][0].map(n=>n*values[1]*5));assert.deepEqual(rows.map(r=>r.print),patterns[values[0]][1].map(n=>n*values[1]*5));const events=jobEvents(rows),answer=events[3].printEnd;assert.deepEqual(options.map(Number),[events[0].printEnd,events[3].cpuEnd+rows[3].print,answer,rows.reduce((n,r)=>n+r.execute+r.print,0)]);truth=options.map(n=>Number(n)===answer);for(const e of events){assert(body.explanation.includes(`${e.job}は${e.cpuEnd}秒`));assert(body.explanation.includes(`${e.job}が${e.printEnd}秒`));}const sorted=options.map(Number).sort((a,b)=>a-b);assert(Math.min(...sorted.slice(1).map((n,i)=>n-sorted[i]))/answer>=3/19-1e-12);}
 else if(number===18){
  assert.deepEqual(options,review.choices);assert.match(prompt,/→は移動の順序/);const rules=body.prompt.find(b=>b.type==="list");assert(rules?.type==="list");assert.equal(rules.items.length,5);[/経路上.*¥.*目的/,/カレント.*“\.”/,/1階層上.*“\.\.”/,/始まりが“¥”.*ルート/,/“¥”、“\.”、“\.\.”.*“\.¥”/].forEach((p,i)=>assert.match(rules.items[i],p));assert.deepEqual(figure(body,"legacy-2017-directory-tree"),[0]);const goal=prompt.match(/“([^”]+)”がカレント/)![1],tree=readDirectorySvg(computingSvg("legacy-2017-directory-tree",[0])),endpoints=options.map(s=>directoryEndpoint(s,tree));assert.deepEqual(endpoints,["¥B¥A¥B","¥B¥B¥B","¥B","¥B¥B"]);assert.equal(goal,endpoints[values[0]]);truth=endpoints.map(p=>p===goal);options.forEach((s,i)=>assert(body.explanation.includes(`「${s}」の終点は${endpoints[i]}となる。`)));}
 else if(number===19){
  assert.equal(prompt.split("\n")[0],stems[19]);const sequence=prompt.split("\n")[1].split("、").map(Number);assert.deepEqual(sequence,sequences[values[0]]);assert.equal(sequence.length,10);assert.deepEqual([...new Set(sequence)].sort(),[1,2,3,4,5]);assert.match(prompt,/最初は空/);assert.match(prompt,/最初の格納は置換に数えない/);assert.match(prompt,/追い出して格納する場合だけ/);assert.deepEqual(options,["ア","イ","ウ","エ"]);assert.deepEqual(figure(body,"legacy-2017-page-replacement-choices"),[0]);const rows=readReplacementSvg(computingSvg("legacy-2017-page-replacement-choices",[0])),results=replacementTrace(sequence).map(r=>r.replacements);truth=rows.map(r=>Number(r[1])===results[0]&&Number(r[2])===results[1]);assert(body.explanation.includes(`FIFOが${results[0]}回、LRUが${results[1]}回`));}
 assert.deepEqual(truth.flatMap((v,i)=>v?[i]:[]),[body.correctIndex],`${source} independent all-choice truth`);for(const f of legacy2017ComputingExplanationFacts(number,values))assert(body.explanation.includes(f.clause),`${source} explanation ${f.clause}`);assert(body.explanation.length>80);assert.doesNotMatch(body.explanation,/原の|生成の誤答|別原問|転載|同じ位置へ/);
}
