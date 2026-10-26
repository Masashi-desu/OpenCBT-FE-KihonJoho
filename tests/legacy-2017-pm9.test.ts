import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {legacy2017Pm9Definition as d,legacy2017Pm9Program1,legacy2017Pm9Program2,legacy2017Pm9Extension} from "../src/core/generators/legacy-2017-pm9";
import {legacy2017Pm9Figure,legacy2017Pm9Profiles} from "../src/core/generators/legacy-2017-pm9-model";
import {Legacy2017Pm9Figure} from "../src/ui/Legacy2017Pm9Figure";
import {pm9ReviewedInputs,pm9ReviewedGeography,pm9DigitSet,pm9UnorderedReference,assertPm9Body} from "./fixtures/legacy-2017-pm9-oracle";
test("PM9 C全8条件、7独立欄、25固有択41参照を独立した数字/集合モデルで照合する",()=>{
  const bodies=Array.from({length:8},(_,v)=>{const b=d.build([v]);assertPm9Body(b,v);return b;});
  assert.equal(new Set(bodies.map(b=>createHash("sha256").update(JSON.stringify(b)).digest("hex"))).size,8);
  assert.equal(bodies[0].answerParts!.reduce((n,p)=>n+p.choiceIds.length,0),41);
  assert.deepEqual(bodies[0].partAnswers!.map(a=>{assert(a.kind==="choice");return a.choiceId;}),[6,7,4,10,14,16,23].map(i=>`choice-value-${i}`));
  for(const values of [[],[0,0],[-1],[8],[.2],[NaN],[Infinity]])assert.throws(()=>d.build(values),/PARAMETER_CONSTRAINT/);
});
test("Cのビット消去は16bit全65536値の独立算術桁モデルと一致し、&&置換を否定する",()=>{
  let falseLogical=0;
  for(let n=0;n<65536;n++) {
    let work=n,count=0;while(work!==0){count++;work=work&(work-1);}
    assert.equal(count,pm9DigitSet(n).size);
    let logical=n,lc=0;while(logical!==0){lc++;logical=Number(Boolean(logical)&&Boolean(logical-1));assert(lc<3);}
    if(lc!==pm9DigitSet(n).size)falseLogical++;
    if(n===4){assert.equal(lc,2);assert.equal(pm9DigitSet(n).size,1);}if(n===7){assert.equal(lc,2);assert.equal(pm9DigitSet(n).size,3);}if(pm9ReviewedInputs.some(row=>row.work===n)){assert.equal(lc,2);assert.equal(pm9DigitSet(n).size,2);}
  }
  assert(falseLogical>60000);
  assert(legacy2017Pm9Program2.includes("work = work & (work - 1);"));
  assert(legacy2017Pm9Program1.includes("countMarkBits([a]) <= [b]"));
  assert.equal(legacy2017Pm9Extension.split("\n").length,13);
});
test("a/b/c全選択肢を16bit解答と指定数2〜8で真偽判定し、正答一意を確認する",()=>{
  const truth=Array.from({length:3},()=>Array(8).fill(true));
  for(let n=2;n<=8;n++)for(let e=0;e<65536;e++){
    const c=Array.from({length:n},(_,i)=>2**(15-i)).reduce((a,b)=>a+b,0),es=pm9DigitSet(e),cs=pm9DigitSet(c);
    const values=[2,3,c,c&e,c|e,e,n,n+1];
    for(let i=0;i<8;i++){
      truth[0][i]&&=pm9DigitSet(values[i]).size===es.size;
      truth[1][i]&&=(es.size<=values[i])===(es.size<=n);
      truth[2][i]&&=pm9DigitSet(values[i]).size===[...es].filter(x=>cs.has(x)).length;
    }
  }
  assert.deepEqual(truth.map(row=>row.map((x,i)=>x?i:-1).filter(x=>x>=0)),[[5],[6],[3]]);
});
test("順不同の多重マーク除外・重複統合・末尾のみ記録を各図条件と独立に検査する",()=>{
  for(const input of pm9ReviewedInputs){const r=pm9UnorderedReference(input.correct,input.submitted);assert.deepEqual(r.mark.slice(0,2),[0,0]);}
  assert.deepEqual(pm9UnorderedReference([0x4000,0x1000,0x0800],[0x0800,0x0800,0x5000]),{mark:[0,0,1],sumE:0x0800});
  assert.deepEqual(pm9UnorderedReference([0x4000,0x1000,0x0800],[0x0800,0x4000,0x1000]),{mark:[0,0,3],sumE:0x5800});
  assert.deepEqual(pm9UnorderedReference([0x4000,0x1000,0x0800],[0,0xffff,0x8000]),{mark:[0,0,0],sumE:0x8000});
});
test('図3の地理的真偽と固定正答b/d/eが全8図4入力と一致する',()=>{
 assert.deepEqual(pm9ReviewedGeography.map(p=>p.inland),[false,true,false,true,true,false,false]);
 for(let v=0;v<8;v++){
  const f=legacy2017Pm9Figure('legacy-2017-pm9-marking-trace',[v]),inland=pm9ReviewedGeography.flatMap((p,i)=>p.inland?[2**(15-i)]:[]);assert.deepEqual(f.model.correct,inland);
  const html=renderToStaticMarkup(createElement(Legacy2017Pm9Figure,{profile:'legacy-2017-pm9-marking-trace',values:[v]}));
  assert.deepEqual([...html.matchAll(/data-pm9-trace-value="ansC:\d+">([^<]+)<\/text>/g)].map(m=>m[1]),['0100 0000 0…0','0001 0000 0…0','0000 1000 0…0']);
  const figure3=renderToStaticMarkup(createElement(Legacy2017Pm9Figure,{profile:'legacy-2017-pm9-unordered-example',values:[v]}));for(const p of pm9ReviewedGeography)assert(figure3.includes(p.prefecture));assert(figure3.includes('海に面していない'));
  assert.deepEqual([...figure3.matchAll(/aria-label="([a-g]) マークあり"/g)].map(m=>m[1]),['b','e','d','b','e','d']);
  assertPm9Body(d.build([v]),v);
 }
});
test("原4図とf群×全8条件は本文の実数値だけを表示し、図4に解答や解説を先出ししない",()=>{
  for(let v=0;v<8;v++)for(const profile of legacy2017Pm9Profiles){
    const f=legacy2017Pm9Figure(profile,[v]);assert(f.caption&&f.alt);const html=renderToStaticMarkup(createElement(Legacy2017Pm9Figure,{profile,values:[v]}));
    if(profile.endsWith('-bank')){assert(!html.includes('<table'));assert.equal((html.match(/data-pm9-option=/g)??[]).length,f.bank.length);}else if(profile.endsWith('bit-layout')||profile.endsWith('marking-trace')){assert(html.includes('<svg'));assert(!html.includes('<table'));}else assert(/<table(?:\s|>)/.test(html));assert(html.includes('data-legacy-pm9-profile'));assert(!html.includes('sumE'));assert(!html.includes('正しい答え'));
    if(profile.endsWith('marking-trace')){assert.equal((html.match(/data-pm9-trace-blank="f"/g)??[]).length,1);assert.equal((html.match(/data-pm9-trace-value=/g)??[]).length,9);assert(html.includes('type[20]'));assert(html.includes('ansE[22]'));}
    const where=profile.endsWith('-bank')||profile.endsWith('-result-options')?'top':'bottom';assert(html.includes(`data-pm9-caption="${where}">${f.caption}</p>`));
  }
});
test('原p42図2の左右2組マーク列→16bit対応を10本の点線として保持',()=>{
 const html=renderToStaticMarkup(createElement(Legacy2017Pm9Figure,{profile:'legacy-2017-pm9-bit-layout',values:[0]}));
 assert.deepEqual([...html.matchAll(/data-pm9-bit-panel="([CE])"/g)].map(m=>m[1]),['C','E']);
 assert.deepEqual([...html.matchAll(/data-pm9-bit-link="([^"]+)"/g)].map(m=>m[1]),['C:a:0','C:b:1','C:c:2','C:d:3','C:e:4','E:a:0','E:b:1','E:c:2','E:d:3','E:e:4']);
 assert.deepEqual([...html.matchAll(/data-pm9-selected="(true|false)"/g)].map(m=>m[1]),['false','true','false','false','true','false','true','false','true','false']);
 assert.deepEqual([...html.matchAll(/data-pm9-bit-value="([01])"/g)].map(m=>m[1]).join(''),'0100100001010000');
 assert.equal((html.match(/data-pm9-bit-tail="8zeros"/g)??[]).length,2);assert(html.includes('ansC[11]')&&html.includes('ansE[11]'));
 assert(!html.includes('上位8ビット'));assert(!html.includes('対応する残りの選択肢'));
});
test("前提/欄/値/択/解説を損なう負例を拒否する",()=>{
  for(const change of [
    (b:ReturnType<typeof d.build>)=>{b.answerParts![1].choiceIds.reverse();},
    (b:ReturnType<typeof d.build>)=>{b.partAnswers![6]={kind:'choice',partId:'part-g',choiceId:'choice-value-25'};},
    (b:ReturnType<typeof d.build>)=>{b.choices[9]=b.choices[8];},
    (b:ReturnType<typeof d.build>)=>{b.prompt=b.prompt.filter(x=>x.type!=='paragraph'||!x.text.includes('16ビット'));},
    (b:ReturnType<typeof d.build>)=>{b.explanation=b.explanation.replace('sumEは0000 1000 0…0','sumEは0101 1000 0…0');},
  ]){const b=d.build([0]);change(b);assert.throws(()=>assertPm9Body(b,0));}
});
