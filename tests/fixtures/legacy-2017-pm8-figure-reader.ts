import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Legacy2017Pm8Figure} from "../../src/ui/Legacy2017Pm8Figures";
import {legacy2017Pm8OriginalProgram as sourceLines,legacy2017Pm8ProgramControls as controls,legacy2017Pm8OriginalEdges as edges,legacy2017Pm8ReviewedWeightConditions as weights} from "./legacy-2017-pm8-source-review";
const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
const attrs=(s:string)=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const tags=(s:string,t:string)=>[...s.matchAll(new RegExp(`<${t}\\b([^>]*)>`,"g"))].map(m=>attrs(m[1]));
const texts=(s:string)=>[...s.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(m=>({a:attrs(m[1]),s:decode(m[2])}));
const group=(s:string,key:string,value:string)=>{const m=s.match(new RegExp(`<g\\b(?=[^>]*${key}="${value}")[^>]*>([\\s\\S]*?)<\\/g>`));assert(m,`${key}=${value}`);return m[1];};
const numbers=(a:Record<string,string>,keys:string[])=>keys.map(k=>{assert(k in a);assert(Number.isFinite(Number(a[k])));return Number(a[k]);});
const rect=(a:Record<string,string>)=>numbers(a,["x","y","width","height"]),line=(a:Record<string,string>)=>numbers(a,["x1","y1","x2","y2"]);
const xy=(a:Record<string,string>)=>numbers(a,["x","y"]);
const centers=[[80,220],[280,100],[390,220],[280,340],[650,120],[690,330],[950,220]],labels=[[165,145],[230,200],[165,310],[465,90],[515,150],[545,255],[480,380],[815,145],[835,295]];
/** These are source semantics, not producer constants. In particular a
 * post-test loop has square start/end markers; its condition follows the body. */
export const pm8NotationFacts=[
 ["declaration",80,["○"],["手続、変数などの名前、型などを宣言する。"]],
 ["comment",80,["/* 文 */"],["文に注釈を記述する。"]],
 ["statements",120,["・変数 ← 式","・手続（引数、…）"],["変数に式の値を代入する。","手続を呼び出し、引数を受け渡す。"]],
 ["single",150,["条件式","処理"],["単岐選択処理を示す。","条件式が真のときは処理を実行する。"]],
 ["double",210,["条件式","処理1","処理2"],["双岐選択処理を示す。","条件式が真のときは処理1を実行し、偽のときは処理2を実行する。"]],
 ["pretest",160,["条件式","処理"],["前判定繰返し処理を示す。","条件式が真の間、処理を繰り返し実行する。"]],
 ["posttest",160,["処理","条件式"],["後判定繰返し処理を示す。","処理を実行し、条件式が真の間、処理を繰り返し実行する。"]],
 ["counted",260,["変数: 初期値、条件式、増分","処理"],["繰返し処理を示す。","開始時点で変数に初期値（式で与えられる）が格納され、条件式が真の間、処理を繰り返す。また、繰り返すごとに、変数に増分（式で与えられる）を加える。"]],
] as const;
export const pm8OperatorFacts=[["単項演算","＋、−、not"],["乗除演算","×、÷、%"],["加減演算","＋、−"],["関係演算","＞、＜、≧、≦、＝、≠"],["論理積","and"],["論理和","or"]];
export const pm8Svg=(profile:string,values:number[])=>renderToStaticMarkup(createElement(Legacy2017Pm8Figure,{profile,values,caption:"PM8独立読取"}));
function marker(svg:string){const m=svg.match(/<marker\b([^>]*)>([\s\S]*?)<\/marker>/);assert(m);const a=attrs(m[1]);assert.deepEqual({...a,id:"id"},{id:"id",viewBox:"0 0 10 10",refX:"9",refY:"5",markerWidth:"7",markerHeight:"7",orient:"auto"});assert.deepEqual(tags(m[2],"path"),[{d:"M 1 1 L 9 5 L 1 9",fill:"none",stroke:"currentColor","stroke-width":"1.5"}]);return a.id;}
export function readPm8Svg(profile:string,svg:string,values:number[]){
 const markerId=marker(svg);const description=svg.match(/<desc id="([^"]+)">([^<]+)<\/desc>/);assert(description);assert(svg.includes(`aria-describedby="${description[1]}"`));assert.doesNotMatch(svg,/\bopacity="0"|visibility="hidden"|display="none"/);
 if(profile==="legacy-2017-pm8-graph"){
  assert.equal(decode(description[2]),"地点0〜6の双方向経路。"+edges.map(([from,to],i)=>`地点${from}と${to}の距離${weights[values[0]][i]}`).join("、")+"。線がない地点間は直接移動しない。");assert.match(svg,/viewBox="0 0 1100 440"/);assert.equal(tags(svg,"circle").length,7);assert.equal(tags(svg,"line").length,9);assert.equal(tags(svg,"text").length,16);
  for(let i=0;i<7;i++){const g=group(svg,"data-node",String(i));assert.deepEqual(numbers(tags(g,"circle")[0],["cx","cy","r"]),[...centers[i],25]);assert.deepEqual(texts(g).map(t=>[...xy(t.a),t.s]),[[...centers[i],String(i)]]);}
  const matrix:number[][]=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>i===j?0:-1));
  edges.forEach(([from,to],i)=>{const g=group(svg,"data-edge",String(i)),[x1,y1]=centers[from],[x2,y2]=centers[to],r=Math.hypot(x2-x1,y2-y1),expected=[x1+25*(x2-x1)/r,y1+25*(y2-y1)/r,x2-25*(x2-x1)/r,y2-25*(y2-y1)/r],observed=line(tags(g,"line")[0]);observed.forEach((n,k)=>assert(Math.abs(n-expected[k])<1e-9));assert.deepEqual(texts(g).map(t=>[...xy(t.a),t.s]),[[...labels[i],String(weights[values[0]][i])]]);matrix[from][to]=matrix[to][from]=Number(texts(g)[0].s);});return matrix;
 }
 if(profile==="legacy-2017-pm8-program"){
  assert.equal(decode(description[2]),"ShortestPathの全48行。行6〜10、12〜39、14〜19、23〜27、30〜38、43〜47が繰返し。行15〜17、20〜22、24〜26、31〜37、33〜36が条件分岐。空欄aは行24、bは行29、cは行44と48、dは行45。αは行28、βは行39。"+sourceLines.map((s,i)=>`${i+1}行 ${s}`).join("\n"));
  const sourceRows=sourceLines.map((s,i)=>{const comment=s.match(/ \/\* (.*) \*\/$/)?.[1]??"",body=comment?s.slice(0,s.indexOf(" /*")):s;return {i:i+1,comment,body,height:Math.max(1,Math.ceil(comment.length/31),i===0?2:1)*34+18};});let y=45;const ys=sourceRows.map(r=>{const p=y;y+=r.height;return p;});assert.match(svg,new RegExp(`viewBox="0 0 1750 ${y+25}"`));
  assert.equal(tags(svg,"g").filter(a=>"data-program-line"in a).length,48);const allControls=[...controls.loops.map(([from,to])=>({from,to,kind:"loop"})),...controls.conditions.map(([from,to])=>({from,to,kind:"condition"}))],depth=(n:number)=>allControls.filter(c=>c.from<n&&c.to>n).length;
  assert.equal(tags(svg,"g").filter(a=>"data-control"in a).length,11);
  for(const c of allControls){const g=group(svg,"data-control",`${c.from}-${c.to}`),x=85+depth(c.from)*45,a=ys[c.from-1],b=ys[c.to-1];assert.deepEqual(line(tags(g,"line")[0]),[x,a+5,x,b-8]);if(c.kind==="loop"){assert.deepEqual(tags(g,"rect").map(rect),[[x-6,a-7,12,12],[x-6,b-7,12,12]]);assert.equal(tags(g,"polygon").length,0);}else{assert.equal(tags(g,"rect").length,0);assert.deepEqual(tags(g,"polygon").map(p=>p.points),[`${x},${a-12} ${x-8},${a+4} ${x+8},${a+4}`,`${x-8},${b-12} ${x+8},${b-12} ${x},${b+4}`]);tags(g,"polygon").forEach(p=>assert.equal(p.style,"fill:currentColor"));}}
  for(const r of sourceRows){const g=group(svg,"data-program-line",String(r.i)),ts=texts(g),y=ys[r.i-1],x=110+depth(r.i)*45;const dots=ts.filter(t=>t.s==="・");assert.deepEqual(dots.map(t=>xy(t.a)),r.body.startsWith("・")?[[x-25,y]]:[]);assert.deepEqual(tags(g,"circle").map(a=>numbers(a,["cx","cy","r"])),r.body.startsWith("○")?[[85,y-8,7]]:[]);const number=ts.find(t=>"data-line-number"in t.a)!;assert(number);assert.deepEqual([...xy(number.a),number.s],[45,y,String(r.i)]);const comments=ts.filter(t=>"data-comment"in t.a);assert.equal(comments.map(t=>t.s).join(""),r.comment?`/* ${r.comment} */`:"");comments.forEach((t,j)=>assert.deepEqual(xy(t.a),[690,y+j*34]));
   const blanks=tags(g,"rect").filter(a=>"data-blank"in a);if([24,29,44,45,48].includes(r.i)){const name=r.i===24?"a":r.i===29?"b":r.i===45?"d":"c",offset=r.i===29?110:r.i===45?70:0,w=[29,45].includes(r.i)?60:70;assert.equal(blanks.length,1);assert.equal(blanks[0]["data-blank"],name);assert.deepEqual(rect(blanks[0]),[x+offset,y-22,w,40]);assert(ts.some(t=>t.s===name&&Number(t.a.x)===x+offset+w/2&&Number(t.a.y)===y));const words=ts.filter(t=>!("data-line-number"in t.a)&&!("data-comment"in t.a)&&t.s!=="・").map(t=>t.s).join("");assert.equal(words,({24:"aand pDist[j] < pDist[i]",29:"pFixed[b] ← true",44:"c← i",45:"i ←d",48:"c← sp"}as Record<number,string>)[r.i]);
   }else{assert.equal(blanks.length,0);const code=ts.filter(t=>"data-code"in t.a);assert.equal(code.map(t=>t.s).join(""),r.i===1?"副プログラム: ShortestPath(整数型: Distance[][], 整数型: nPoint,整数型: sp, 整数型: dp, 整数型: sRoute[], 整数型: sDist)":r.body.slice(1).trim());code.forEach((t,j)=>assert.deepEqual(xy(t.a),[x,y+j*34]));}
  }
  assert.equal(tags(svg,"rect").filter(a=>"data-blank"in a).length,5);for(const [symbol,n,to]of [["α",28,470],["β",39,135]]as const){const g=group(svg,"data-position-marker",symbol),a=tags(g,"line")[0];assert.deepEqual(line(a),[1580,ys[n-1],to,ys[n-1]]);assert.equal(a["marker-end"],`url(#${markerId})`);assert.deepEqual(texts(g).map(t=>[...xy(t.a),t.s]),[[1605,ys[n-1],symbol]]);}return sourceRows;
 }
 if(profile==="legacy-2017-pm8-common-notation"){
  assert.equal(decode(description[2]),"2017春期の共通記法。単岐/双岐選択は▲開始/▼終端。前判定・後判定・変数型の繰返しは上下■。後判定の条件式は処理の後に記す。"+pm8NotationFacts.map(([, ,syntax,desc])=>syntax.join("、")+"："+desc.join("")).join("\n"));assert.match(svg,/viewBox="0 0 1600 1300"/);assert.deepEqual(texts(svg).slice(0,4).map(t=>[...xy(t.a),t.s]),[[330,55,"記述形式"],[1110,55,"説明"],[52,710,"処"],[52,750,"理"]]);let y=70;for(const [kind,h,syntax,description]of pm8NotationFacts){const g=group(svg,"data-common-row",kind),top=y,bottom=top+h-25;y+=h;const ts=texts(g),syn=ts.filter(t=>"data-common-syntax"in t.a),desc=ts.filter(t=>"data-common-description"in t.a);assert.deepEqual(syn.map(t=>t.s),syntax);assert.equal(desc.map(t=>t.s).join(""),description.join(""));if(["pretest","posttest","counted"].includes(kind)){assert.deepEqual(rect(tags(g,"rect")[0]),[119,top+18,12,12]);assert.equal(tags(g,"rect").length,2);assert.equal(tags(g,"polygon").length,0);assert.deepEqual(rect(tags(g,"rect")[1]),[119,bottom-12,12,12]);tags(g,"rect").forEach(a=>assert.equal(a.fill,"currentColor"));assert(Number(syn[0].a.y)<Number(syn[1].a.y));if(kind==="posttest")assert.deepEqual(syn.map(t=>xy(t.a)),[[185,top+65],[150,bottom]]);}if(["single","double"].includes(kind))assert.equal(tags(g,"polygon").length,2);tags(g,"polygon").forEach(a=>assert.equal(a.style,"fill:currentColor"));}return pm8NotationFacts;
 }
 assert.equal(profile,"legacy-2017-pm8-common-operators");assert.equal(decode(description[2]),"演算子の優先順位は単項、乗除、加減、関係、論理積、論理和の順に高い。単項は＋・−・not、乗除は×・÷・%、加減は＋・−、関係は＞・＜・≧・≦・＝・≠、論理積はand、論理和はor。");assert.match(svg,/viewBox="0 0 1500 500"/);for(let i=0;i<6;i++)assert.deepEqual(texts(group(svg,"data-operator-row",String(i))).map(t=>[...xy(t.a),t.s]),[[50,125+i*63,pm8OperatorFacts[i][0]],[390,125+i*63,pm8OperatorFacts[i][1]]]);assert.deepEqual(texts(svg).slice(-2).map(t=>[...xy(t.a),t.s]),[[1270,130,"高"],[1270,435,"低"]]);assert.deepEqual(tags(svg,"path").at(-1)!.d,"M 1260 185 L 1270 170 L 1280 185 M 1260 365 L 1270 380 L 1280 365");return pm8OperatorFacts;
}
