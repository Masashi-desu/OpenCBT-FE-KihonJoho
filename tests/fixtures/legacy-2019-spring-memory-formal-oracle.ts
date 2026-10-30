/** Independent formal oracle facet extracted from the unchanged historical oracle. No old prompt/DOM is synthesized. Only source-form-only structural checks are delegated to separately reviewed source gold; actual choices/answers/computation/displayed conditions below remain live. */
import assert from "node:assert/strict";
import type { Block } from "../../src/core/types";
import type { GeneratedBody } from "../../src/core/generators/definition";
import { legacy2019PmMemoryReview as review,legacy2019ReviewedPageCandidates as candidates,legacy2019ReviewedPageLayouts as layouts,legacy2019ReviewedReferenceStrings as orders } from "./legacy-2019-pm-memory-review";
const text=(blocks:Block[])=>blocks.map(b=>b.type==="paragraph"?b.text.replaceAll("，","、"):b.type==="code"?b.text:"").join("\n");
function tuple(blocks:Block[]){assert.equal(blocks.length,1);const t=blocks[0];assert(t.type==="table");assert.equal(t.rows.length,1);return t;}
/** Set/clock reference model: no queue rotation or producer helper is used. */
export function reviewedPageFaults(order:readonly number[],frames:number,policy:"FIFO"|"LRU") {
  const resident=new Map<number,{loaded:number;used:number}>(),evictions:number[]=[];let faults=0;
  order.forEach((page,t)=>{
    const present=resident.get(page);if(present){present.used=t;return;}
    faults++;
    if(resident.size===frames){const entries=[...resident.entries()],clock=(row:typeof entries[number])=>policy==="FIFO"?row[1].loaded:row[1].used;
      assert.equal(new Set(entries.map(clock)).size,entries.length,"No unspecified tie may influence eviction");const oldest=entries.reduce((old,row)=>clock(row)<clock(old)?row:old);resident.delete(oldest[0]);evictions.push(oldest[0]);}
    resident.set(page,{loaded:t,used:t});
  });return{faults,evictions,resident:[...resident.keys()].sort((a,b)=>a-b)};
}
function meaning(s:string){if(s==="変わらない")return 0;const m=s.match(/^([1-4])回(増える|減る)$/);assert.ok(m);return +m[1]*(m[2]==="増える"?1:-1);}
export function assertLegacy2019Memory(source:string,body:GeneratedBody,values:number[]) {
  assert.equal(source,review.source);const [layout,orderCase,frames]=values,prompt=text(body.prompt);
  assert.equal(body.correctIndex,undefined);assert.deepEqual(body.answerParts?.map(p=>p.choiceIds.length),[5,4,4,9,9]);assert.equal(body.choices.length,31);
  for(const p of review.premises)if(p!=="網掛けの部分は表示していない")assert.ok(prompt.includes(p),p);
  const figure=body.prompt.find(b=>b.type==="diagram");assert(figure?.type==="diagram"&&figure.scene.kind==="source_figure");assert.equal(figure.scene.profile,"legacy-2019-spring-pm2-mapping");assert.deepEqual(figure.scene.values,[layout]);
  const physical=layouts[layout];assert(figure.alt.includes(physical.join("、")));for(const term of ["a1〜a4","m","n","存在ビット","網掛け"])assert.ok(figure.alt.includes(term));
  const truthA=body.choices.slice(0,5).map((blocks,i)=>{const t=tuple(blocks);assert.deepEqual(t.columns,["a1","a2","a3","a4"]);const row=t.rows[0].map(Number);assert.deepEqual(row,[...candidates[layout][i]]);return row.every((n,j)=>physical[n-1]==="ABCD"[j]);});assert.equal(truthA.filter(Boolean).length,1);
  const pairTruth=(offset:number,name:string)=>body.choices.slice(offset,offset+4).map((blocks,i)=>{
    const t=tuple(blocks);assert.deepEqual(t.columns,[`${name}1`,`${name}2`]);assert.deepEqual(t.rows[0],[...review.pairChoices[i]]);
    // The blank paragraph defines which existing data is acted on. Eviction
    // writes from main memory; a fault loads the required virtual-page data.
    return name==="b"?t.rows[0][0]==="物理"&&t.rows[0][1]==="補助記憶装置に書き出す":t.rows[0][0]==="仮想"&&t.rows[0][1]==="補助記憶装置から読み込む";
  });
  const truthB=pairTruth(5,"b"),truthC=pairTruth(9,"c");
  assert.match(prompt,/空きページにする［b1］ページ/);assert.match(prompt,/選んだページに格納されているデータを［b2］/);
  assert.match(prompt,/実行に必要な［c1］ページに格納されているデータを［c2］/);
  const sequence=prompt.match(/^〔仮想ページの参照順〕\n([1-5](?: → [1-5]){12})$/m);assert.ok(sequence);const order=sequence[1].split(" → ").map(Number);assert.equal(order.join(""),orders[orderCase]);
  const fifo0=reviewedPageFaults(order,frames,"FIFO").faults,fifo1=reviewedPageFaults(order,frames+1,"FIFO").faults,lru0=reviewedPageFaults(order,frames,"LRU").faults,lru1=reviewedPageFaults(order,frames+1,"LRU").faults;
  assert.ok(prompt.includes(`FIFOを用いると、割り当てられた物理ページの個数が${frames}のときは、ページフォールトの発生回数は${fifo0}回`));
  assert.ok(prompt.includes(`LRUを用いると、物理ページの個数が${frames}のときは、ページフォールトの発生回数は${lru0}回`));
  assert.equal((prompt.match(new RegExp(`物理ページの個数が${frames+1}ならば` ,"g"))??[]).length,2);
  const truthD=body.choices.slice(13,22).map(text).map(s=>meaning(s)===fifo1-fifo0),truthE=body.choices.slice(22).map(text).map(s=>meaning(s)===lru1-lru0);
  assert.deepEqual(body.choices.slice(13,22).map(text),[...review.changeChoices]);assert.deepEqual(body.choices.slice(22).map(text),[...review.changeChoices]);
  for(const t of [truthD,truthE])assert.equal(t.filter(Boolean).length,1);
  const truths=[truthA,truthB,truthC,truthD,truthE],offsets=[0,5,9,13,22];
  truths.forEach((truth,i)=>{const part=body.answerParts![i];assert.equal(part.id,`part-${"abcde"[i]}`);assert.equal(part.label,["設問1 a","設問2 b","設問2 c","設問3 d","設問3 e"][i]);
    assert.deepEqual(part.choiceIds,truth.map((_,j)=>`choice-value-${offsets[i]+j+1}`));assert.deepEqual(body.partAnswers![i],{kind:"choice",partId:part.id,choiceId:part.choiceIds[truth.indexOf(true)]});});
  for(const n of [fifo0,fifo1,lru0,lru1])assert.ok(body.explanation.includes(`${n}回`));
  assert.ok(body.explanation.includes("hitだけでは順を更新しない"));assert.ok(body.explanation.includes("初期の全ページは空き"));
}
