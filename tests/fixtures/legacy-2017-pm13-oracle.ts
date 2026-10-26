import assert from'node:assert/strict';
import{createElement}from'react';import{renderToStaticMarkup}from'react-dom/server';
import type{GeneratedBody}from'../../src/core/generators/definition';
import{Legacy2017Pm13Figure}from'../../src/ui/Legacy2017Pm13Figure';
import{pm13Inputs,pm13SourceRates,pm13SourceColumns,pm13SourceChoices,pm13SourceMacro}from'./legacy-2017-pm13-source-review';
export type Pm13Input=typeof pm13Inputs[number];
const mass=(counts:number[],weights:number[])=>counts.reduce((n,x,i)=>n+x*weights[i],0);
/** Independent maximum: analytically choose the largest feasible Z for each X/Y.
 * Production scans all Z values; no producer model/constants are imported. */
export function pm13ReferenceBest(remaining:number[],weights:number[],cap:number){
 let maximum=-1,counts=[0,0,0];
 for(let x=0;x<=remaining[0];x++)for(let y=0;y<=remaining[1];y++){
  const rest=cap-x*weights[0]-y*weights[1];if(rest<0)continue;
  const z=Math.min(remaining[2],Math.floor(rest/weights[2])),w=x*weights[0]+y*weights[1]+z*weights[2];
  if(w>maximum){maximum=w;counts=[x,y,z];}
 }
 return{counts,weight:maximum};
}
export function pm13Reference(input:Pm13Input){
 const limits=[2000,5000,10000,20000,30000],upper=limits.map((n,i)=>n-input.boxes[i]),lower=[1,...upper.slice(0,-1).map(n=>n+1)],column=pm13SourceColumns.indexOf(input.column);
 const category=(n:number)=>n===0?0:upper.findIndex(u=>n<=u)+1;
 const remaining=[...input.shipping],packages:{counts:number[];weight:number;category:number;rate:number}[]=[];let last=[0,0,0];
 while(mass(remaining,input.weights)>0){assert(packages.length<10);last=[...remaining];const n=mass(remaining,input.weights),c=n>upper[4]?5:category(n),best=pm13ReferenceBest(remaining,input.weights,upper[4]);assert(best.weight>0);packages.push({...best,category:c,rate:pm13SourceRates[c-1][column]});best.counts.forEach((x,i)=>remaining[i]-=x);}
 const exampleWeight=mass(input.example,input.weights),exampleCategory=category(exampleWeight),shippingWeight=mass(input.shipping,input.weights);
 return{limits,upper,lower,packages,remaining,last,lastWeight:mass(last,input.weights),exampleWeight,exampleCategory,examplePacked:exampleWeight+input.boxes[exampleCategory-1],exampleRate:pm13SourceRates[exampleCategory-1][column],shippingWeight,totalRate:packages.reduce((n,p)=>n+p.rate,0)};
}
/** The six e/f holes' statement meaning, interpreted from the reviewed source.
 * Expected output is separately found by the two-dimensional reference above. */
export function pm13MacroInterpreter(input:Pm13Input,e:number,f:number){
 const cap=30000-input.boxes[4],original=input.shipping,remaining=[...original],result:{counts:number[];weight:number}[]=[];
 while(mass(remaining,input.weights)>0){if(result.length>=10||remaining.some(n=>n<0))throw Error('no finite valid progress');let best=0,saved=[0,0,0],last=[0,0,0];const before=mass(remaining,input.weights);
  for(let i=0;i<=remaining[0];i++)for(let j=0;j<=remaining[1];j++)for(let k=0;k<=remaining[2];k++){
   const work=[i,j,k],w=mass(work,input.weights),conditions=[best<before&&w>cap,best<w&&w<=cap,best>before&&w>cap,best>w&&w<=cap];last=work;if(conditions[e]){saved=[...work];best=w;}
  }
  if(best===0)throw Error('no selected package');result.push({counts:saved,weight:best});for(let i=0;i<3;i++)remaining[i]=[original[i]-last[i],original[i]-saved[i],remaining[i]-last[i],remaining[i]-saved[i]][f];
 }
 return result;
}
const decode=(s:string)=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#x27;',"'");
export function pm13Markup(profile:string,value:number){return renderToStaticMarkup(createElement(Legacy2017Pm13Figure,{profile,values:[value]}));}
export function pm13Cells(profile:string,value:number){
 const result=new Map<string,string>();for(const [,key,html]of pm13Markup(profile,value).matchAll(/<td[^>]*data-pm13-cell="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g)){assert(!result.has(key),key);result.set(key,decode(html.replace(/<[^>]+>/g,'')));}return result;
}
export function pm13ReadMacro(value=0){
 const html=pm13Markup('legacy-2017-pm13-macro',value),rows=[...html.matchAll(/<g data-pm13-macro-row="(\d+)"[^>]*>([\s\S]*?)<\/g>/g)];
 return rows.map(([,n,fragment],i)=>{assert.equal(Number(n),i+1);const marker=/data-pm13-marker="([■▲▼・])"/.exec(fragment)?.[1]??'',hole=/data-pm13-hole="([ef])"/.exec(fragment)?.[1],text=/<text[^>]*data-pm13-row-text="(?:source|hole)"[^>]*>([\s\S]*?)<\/text>/.exec(fragment)?.[1]??'';return marker+(hole?`［${hole}］`:decode(text));});
}
export function assertPm13Body(body:GeneratedBody,v:number){
 const input=pm13Inputs[v],r=pm13Reference(input),counts=[6,4,4,4,4,4],offsets=[0,6,10,14,18,22],answers=[1,0,2,2,1,3];
 assert.equal(body.correctIndex,undefined);assert.equal(body.choices.length,26);
 const choices=body.choices.map(c=>{assert.equal(c.length,1);const b=c[0];assert(b.type==='code');return b.text;});assert.deepEqual(choices,pm13SourceChoices);
 assert.deepEqual(body.answerParts,counts.map((n,i)=>({id:`part-${'abcdef'[i]}`,label:`設問${i===0?1:i<4?2:3} ${'abcdef'[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})));
 assert.deepEqual(body.partAnswers,answers.map((n,i)=>({kind:'choice',partId:`part-${'abcdef'[i]}`,choiceId:`choice-value-${offsets[i]+n+1}`})));
 const diagrams=body.prompt.filter(b=>b.type==='diagram');assert.equal(diagrams.length,15);for(const diagram of diagrams){assert(diagram.scene.kind==='source_figure');assert.deepEqual(diagram.scene.values,[v]);}
 const text=JSON.stringify(body.prompt);for(const s of ['全ての都道府県はいずれか一つ','上のセルから順','30,000gまで','箱の重量を加えたとき','最も小さい重量区分','上限を超えるときは5','荷物の数は10個を超えない','行16〜25','m','残数量から差し引き','初期値として0','残重量が0になるまで','0から対応する商品の残数量まで順に','全ての組合せの比較が終了'])assert(text.includes(s),s);
 assert.equal(body.prompt.filter(b=>b.type==='table'||b.type==='code'||b.type==='image').length,0,'all five original worksheets and macro retain source-owned drawing');
 assert.equal(body.contexts?.length,2);assert.equal(body.contexts![0].blocks.length,7);assert.deepEqual(body.contexts![0].blocks.slice(1).map(b=>{assert(b.type==='image');return b.assetId;}),[78,79,80,81,82,83].map(n=>`asset-ipa-2017h29h-fe-pm-13-p${n}`));
 assert.equal(body.contexts![1].blocks.length,3);assert(body.contexts![1].title.includes('擬似言語'));assert.deepEqual(body.contexts![1].blocks.slice(1).map(b=>{assert(b.type==='image');return b.assetId;}),[3,4].map(n=>`asset-ipa-2017h29h-fe-pm-13-p${n}`));
 const banks=diagrams.filter(b=>b.caption.endsWith('に関する解答群'));assert.equal(banks.length,6);for(let i=0;i<6;i++)for(let j=0;j<counts[i];j++)assert(banks[i].alt.includes('アイウエオカ'[j]+' '+pm13SourceChoices[offsets[i]+j]));
 assert.deepEqual(pm13ReadMacro(v),pm13SourceMacro);
 assert(body.explanation.includes('同重量では先に見つけた数量を保つ'));assert(body.explanation.includes('保存値を引く'));for(const p of r.packages)assert(body.explanation.includes(`${p.counts.join('/')}個、${p.weight}g`));
}
/** Match/lookup semantics and sort requirements from official appendix p81–82. */
export function pm13Match(value:number,array:number[],mode:number){
 if(mode===1){if(array.some((x,i)=>i>0&&x<array[i-1]))throw Error('ascending required');const n=Math.max(...array.filter(x=>x<=value));return array.indexOf(n)+1;}
 if(mode===-1){if(array.some((x,i)=>i>0&&x>array[i-1]))throw Error('descending required');const n=Math.min(...array.filter(x=>x>=value));return array.indexOf(n)+1;}
 return array.indexOf(value)+1;
}
