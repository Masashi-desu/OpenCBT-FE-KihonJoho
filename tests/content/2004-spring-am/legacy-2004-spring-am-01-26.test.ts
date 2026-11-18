import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2004SpringAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2004-spring-am-01-26';
import { legacy2004SpringAm0126Figures as figures } from '../../../src/core/generators/legacy-2004-spring-am-01-26-figures';
import { legacy2004SpringAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2004SpringAm0126Figures';
import { knowledgeFacts, memoryHierarchy } from '../../fixtures/legacy-2004-spring-am-01-26-facts';

const parameters=[0,1,2,3];
const byNumber=new Map(definitions.map(item=>[Number(item.source.split('-').at(-1)),item]));
const entries=(q:number)=>parameters.map(i=>byNumber.get(q)!.build([i]));
const stem=(body:GeneratedBody)=>body.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join(' ');
function option(blocks:Block[]) {
  return blocks.map(block=>{
    if(block.type==='paragraph')return block.text;
    if(block.type==='formula'||block.type==='diagram')return block.alt;
    if(block.type==='table')return block.rows[0].join('／');
    throw Error('未対応の選択肢形式');
  }).join(' ');
}
const choices=(body:GeneratedBody)=>body.choices.map(option);
function match(body:GeneratedBody, pass:(choice:string,i:number)=>boolean) {
  assert.deepEqual(choices(body).flatMap((value,i)=>pass(value,i)?[i]:[]),[body.correctIndex]);
}
function num(body:GeneratedBody, expected:number) {
  match(body,choice=>Math.abs(Number(choice.replaceAll(',',''))-expected)<1e-8);
  assert(body.explanation.replaceAll(',','').includes(String(expected)));
}
function grid(body:GeneratedBody) {
  const table=body.prompt.find(item=>item.type==='table');
  assert(table);
  return table;
}
function drawing(body:GeneratedBody,label:string) {
  const item=body.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+label));
  assert(item?.type==='diagram');
  return item;
}
function svg(block:Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene, render=renderers.find(item=>item.profile===profile);
  assert(render);
  return renderToStaticMarkup(createElement(render.component,{caption:block.caption,values}));
}
const fraction=(text:string)=>text.split('/').map(BigInt) as [bigint,bigint];
const bits=[[0,0],[0,1],[1,0],[1,1]];

test('公式の正答、全23問の基準・4条件、図の登録と入力域を照合する',()=>{
  const official='ウイアアアアアアイイアウウイウエウアエイウウイウアウ';
  const admitted=Array.from({length:26},(_,i)=>i+1).filter(n=>![11,23,25].includes(n));
  assert.deepEqual([...byNumber.keys()],admitted);
  assert.deepEqual(renderers.map(item=>item.profile).sort(),figures.map(item=>item.profile).sort());
  const visible=new Set<string>();
  for (const [q,def] of byNumber) {
    assert.equal(def.sourceAnswer,official[q-1]);
    assert.equal('アイウエ'[def.build([0]).correctIndex!],official[q-1]);
    const generated=entries(q);
    assert.equal(new Set(generated.map(value=>JSON.stringify(value.prompt))).size,4);
    assert(new Set(generated.map(value=>value.correctIndex)).size>1||def.answerVariation==='fixed');
    for (const [i,body] of generated.entries()) {
      assert.deepEqual(body,def.build([i]));
      assert.equal(new Set(choices(body)).size,4);
      assert(body.explanation.length>25);
      for (const block of [...body.prompt,...body.choices.flat()]) {
        if (block.type!=='diagram'||block.scene.kind!=='source_figure') continue;
        const markup=svg(block);
        for (const marker of ['role="img"','<title','<desc','aria-labelledby','aria-describedby','tabindex="0"']) assert(markup.includes(marker));
        assert(markup.includes(block.alt));
        visible.add(block.scene.profile+'-'+block.scene.values.join('-'));
      }
    }
    for (const values of [[-1],[4],[0.5],[],[0,1],new Array(1)]) assert.throws(()=>def.build(values),/査読済み入力域/);
  }
  assert.equal(visible.size,16);
});

test('問1〜4の小数各桁、除算各基数、浮動小数点表示の役割、論理シフトを照合する',()=>{
  for (const body of entries(1)) {
    const raw=stem(body).match(/(\d+)÷(\d+)/);
    assert(raw);
    match(body,value=>{
      const suffix=value.split('.')[1];
      const val=[...suffix].reduce((sum,bit,i)=>sum+Number(bit)/2**(i+1),0);
      return val*Number(raw[2])===Number(raw[1]);
    });
    const sorted=choices(body).map(choice=>[...choice.slice(2)].reduce((sum,bit,i)=>sum+(bit==='1'?2**(-i-1):0),0));
    assert.deepEqual(sorted,[...sorted].sort((a,b)=>a-b));
  }
  for (const body of entries(2)) {
    const eq=stem(body).match(/(\d{4})÷(\d)＝(\d{3})（余り0）/);
    assert(eq);
    const [,total,divisor,quotient]=eq;
    match(body,value=>{
      const radix=BigInt(value);
      const scaled=(digits:string)=>[...digits].reverse().reduce((sum,digit,i)=>{
        assert(BigInt(digit)<radix);
        return sum+BigInt(digit)*radix**BigInt(i);
      },0n);
      return scaled(total)===BigInt(divisor)*scaled(quotient);
    });
  }
  for (const body of entries(3)) {
    const formula=body.prompt.find(item=>item.type==='formula');
    assert(formula);
    const parts=formula.text.match(/^a=(\w)\\times (\w)\^\{(\w)\}$/);
    assert(parts);
    const [ , coefficient,radix,exponent ]=parts;
    match(body,choice=>choice.includes(coefficient+'を仮数')&&choice.includes(radix+'を基数')&&choice.includes(exponent+'を指数'));
  }
  for (const body of entries(4)) {
    const raw=stem(body).match(/(\d+)ビットのレジスタに16進数([0-9A-F]{4})が入っているとき，(\d+)ビットだけ右に論理シフト/);
    assert(raw);
    const [,width,input,amount]=raw;
    const data=BigInt('0x'+input).toString(2).padStart(Number(width),'0');
    const expected=BigInt('0b'+('0'.repeat(Number(amount))+data.slice(0,Number(width)-Number(amount))));
    match(body,choice=>BigInt('0x'+choice)===expected);
    assert(body.explanation.includes(expected.toString(16).toUpperCase()));
  }
});

test('問6の非復元の組合せを、球を区別し総当たりで検算する',()=>{
  for (const body of entries(6)) {
    const m=stem(body).match(/赤，白，黄の3種類の球が(\d+)個ずつ.+?(\d+)個の球を同時.+?すべて(赤|白|黄)の球/);
    assert(m&&stem(body).includes('どの取り出し方も同じ確率'));
    const n=Number(m[1]), k=Number(m[2]);
    const balls=[...'赤'.repeat(n)+'白'.repeat(n)+'黄'.repeat(n)];
    let total=0n, success=0n;
    for (let mask=1; mask<2**balls.length; mask++) {
      const draw=balls.filter((_,i)=>(mask>>i&1)!==0);
      if (draw.length!==k) continue;
      total++;
      if (draw.every(color=>color===m[3])) success++;
    }
    match(body,choice=>{ const [top,bottom]=fraction(choice); return top*total===bottom*success; });
  }
});

test('問7・8・9の論理式・比較関数・図の全組合せを別の論理で照合する',()=>{
  for (const body of entries(7)) {
    const text=stem(body);
    const physical=svg(drawing(body,'sum-table'));
    const rowData=[...physical.matchAll(/data-sum-row="(\d,\d,\d,\d)"/g)].map(match=>match[1].split(',').map(Number));
    const expected=bits.map(([A,B])=>{
      const a=text.includes('数A̅')?1-A:A, b=text.includes('，B̅')?1-B:B;
      const two= a+b+(text.includes('固定の1')?1:0);
      return [A,B,Number(two>=2),Number(two===1||two===3)];
    });
    assert.deepEqual(rowData,expected);
    function expression(text:string,A:number,B:number) {
      const digit: Record<string,string>={A:String(A),B:String(B),'A̅':String(1-A),'B̅':String(1-B)};
      const normalized=text.replace(/[AB]̅?/g,s=>digit[s]).replaceAll('＋','|').replaceAll('・','&');
      const expr=normalized.match(/^([01])([|&])([01])$/);
      if(expr)return Number(expr[2]==='|'?(expr[1]==='1'||expr[3]==='1'):(expr[1]==='1'&&expr[3]==='1'));
      const m=normalized.match(/^\(([01])([|&])([01])\)([|&])\(([01])([|&])([01])\)$/);
      assert(m);
      const op=(left:string,operator:string,right:string)=>
        operator==='|'?String(Number(left==='1'||right==='1')):String(Number(left==='1'&&right==='1'));
      return Number(op(op(m[1],m[2],m[3]),m[4],op(m[5],m[6],m[7])));
    }
    match(body,choice=>{
      const [c,s]=choice.split('／');
      return expected.every(([A,B,high,low])=>expression(c,A,B)===high&&expression(s,A,B)===low);
    });
  }
  for (const body of entries(8)) {
    const observed=stem(body).match(/eq\(eq\(([ABC])，([ABC])\)，eq\(([ABC])，([ABC])\)\).+?(\d)が返/);
    assert(observed);
    const conditions: Record<string,number>[]=[];
    for (let A=0;A<3;A++) for (let B=0;B<3;B++) for (let C=0;C<3;C++) conditions.push({A,B,C});
    const evaluate=(condition:string,values:Record<string,number>)=>{
      const leaves=condition.replace(/[ABC][＝≠][ABC]/g,token=>{
        const truth=(values[token[0]]===values[token[2]])===(token[1]==='＝');
        return truth?'1':'0';
      });
      const clauses=leaves.replace(/\(([^)]+)\)/g,(_,group)=>group.includes('かつ')?
        (group.split('かつ').every((x:string)=>x==='1')?'1':'0'):(group.split('又は').includes('1')?'1':'0')).split('又は');
      return clauses.includes('1');
    };
    const [,leftFrom,leftTo,rightFrom,rightTo,digit]=observed;
    match(body,option=>conditions.every(values=>{
      const right=Number(values[leftFrom]===values[leftTo])^Number(values[rightFrom]===values[rightTo]);
      return evaluate(option,values)===(right!==Number(digit));
    }));
  }
  const truthTable: Record<string,number[]>={AND:[0,0,0,1],XOR:[0,1,1,0],NAND:[1,1,1,0],OR:[0,1,1,1]};
  for (const body of entries(9)) {
    const diagram=svg(drawing(body,'branch-tree'));
    const exits=Object.fromEntries([...diagram.matchAll(/data-branch-input="([01]{2})" data-branch-exit="([12])"/g)].map(m=>[m[1],Number(m[2])]));
    assert.equal(Object.keys(exits).length,4);
    match(body,(_,i)=>{
      const option=svg(body.choices[i][0]);
      const gate=option.match(/data-logic="(\w+)" data-true="1" data-false="2"/)?.[1];
      assert(gate&&option.includes('A '+gate+' B'));
      return bits.every(([a,b],j)=>exits[''+a+b]===(truthTable[gate][j]?1:2));
    });
  }
});

test('問10・12・13・14の符号、スタック、ハッシュ、再帰を独立の手順で照合する',()=>{
  for (const body of entries(10)) {
    const cap=stem(body).match(/(\d+)通りの符号/)?.[1];
    assert(cap&&stem(body).includes('1個以上'));
    let length=0, all=0, tail=[''];
    while(all<Number(cap)){
      length++;
      tail=tail.flatMap(prefix=>[prefix+'A',prefix+'B']);
      all+=tail.length;
    }
    num(body,length);
  }
  for (const body of entries(12)) {
    const words=stem(body).match(/^([A-D，]{7})の順に到着/)?.[1];
    assert(words);
    const incoming=words.split('，');
    const all=new Set<string>();
    function arrivals(from:number,stack:string[],output:string[]) {
      if(output.length===incoming.length){ all.add(output.join('，'));return; }
      if(from<incoming.length)arrivals(from+1,[...stack,incoming[from]],output);
      if(stack.length)arrivals(from,stack.slice(0,-1),[...output,stack.at(-1)!]);
    }
    arrivals(0,[],[]);
    assert.equal(all.size,14);
    match(body,choice=>all.has(choice));
  }
  for (const body of entries(13)) {
    const text=stem(body), m=text.match(/9個のデータ([\dA-F，]+)を順に.+?mod\(データ，(\d+)\)/);
    assert(m);
    const mod=Number(m[2]);
    const inputs=m[1].split('，').map(s=>'0123456789ABCDEF'.indexOf(s[0])*16+'0123456789ABCDEF'.indexOf(s[1]));
    assert.equal(inputs.length,9);
    const pos=inputs.findIndex((value,i)=>inputs.slice(0,i).some(previous=>(value-previous)/mod===Math.trunc((value-previous)/mod)));
    assert(pos>0);
    match(body,choice=>Number('0x'+choice)===inputs[pos]);
  }
  for (const body of entries(14)) {
    const input=stem(body).match(/F\((\d)\)の値/)?.[1];
    assert(input);
    const program=body.prompt.find(value=>value.type==='code');
    assert(program?.text.includes('n≦1 then return 1'));
    assert(program?.text.includes('n＝0 then return 0'));
    const f=[1,1], g=[0,2];
    for (let i=2;i<=Number(input);i++){
      f[i]=i*g[i-1];
      g[i]=i+f[i-1];
    }
    num(body,f[Number(input)]);
  }
});

test('問15は添字・閾値・進め方を表示図から読み、配列を全列挙して検算する',()=>{
  for (const body of entries(15)) {
    const markup=svg(drawing(body,'array-search'));
    const begin=markup.match(/data-begin="([1N])"/)?.[1];
    const bound=markup.match(/data-bound="([1N])" data-exits-on="([＜＞])"/);
    const advance=markup.match(/data-advance="([＋−])([12])"/);
    assert(begin&&bound&&advance);
    const reverse=bound[2]==='＜', step=Number(advance[2])* (advance[1]==='−'?-1:1);
    assert.equal(begin,reverse?'N':'1');
    assert.equal(bound[1],reverse?'1':'N');
    assert.equal(step<0,reverse);
    const limits=Math.abs(step)===2?[3,5,7]:[2,3,4,5,6,7];
    assert.equal(stem(body).includes('Nは奇数'),Math.abs(step)===2);
    const models:{ N:number;places:number[];want:number }[]=[];
    for (const N of limits) for (let mask=0;mask<2**N;mask++) {
      const places=Array.from({length:N},(_,i)=>i+1).filter((_,i)=>(mask>>i&1)!==0);
      const eligible=places.filter(k=>Math.abs(step)===1||k%2===1);
      const want=eligible.length?(reverse?Math.max(...eligible):Math.min(...eligible)):
        reverse?(step===-1?0:-1):(N+step);
      models.push({N,places,want});
    }
    match(body,option=>{
      const target=option.match(/kには(.+?)が設定/)?.[1];
      assert(target);
      const checked=models.filter(({places,N})=>option.includes('配列中にない')?places.length===0:
        places.length===2&&places[0]===1&&places[1]===N);
      assert(checked.length===limits.length);
      return checked.every(({N,want})=>(target==='N'?N:target==='N＋2'?N+2:Number(target.replace('−','-')))===want);
    });
  }
});

test('問18・19・21・22の単位・加重時間・位置決め・二段の端数を検算する',()=>{
  for (const body of entries(18)) {
    const m=stem(body).match(/(\d+)MIPS/);
    assert(m);
    match(body,option=>{
      const [,magnitude,unit]=option.match(/^([\d.]+)(ナノ秒|マイクロ秒)$/)!;
      return Number(m[1])*Number(magnitude)*(unit==='ナノ秒'?1:1000)===1000;
    });
  }
  for (const [i,body] of entries(19).entries()) {
    const penalty=Number(stem(body).match(/1回当たり(\d+)ナノ秒/)?.[1]??0);
    assert.equal(penalty,[0,8,10,16][i]);
    const scored=choices(body).map(row=>{
      const [cache,percentage,main]=row.split('／').map(Number);
      const measurements=Array.from({length:100},(_,j)=>j<percentage?[cache,cache]:[main+penalty,cache+main+penalty]);
      return measurements.reduce(([a,b],[x,y])=>[a+x,b+y],[0,0]);
    });
    if(!i)assert.deepEqual(scored,[[3400,3800],[2800,3100],[2900,3500],[2600,3000]]);
    for (const column of [0,1]){
      const smallest=Math.min(...scored.map(data=>data[column]));
      match(body,(_,index)=>scored[index][column]===smallest);
    }
  }
  for (const body of entries(21)) {
    const q=stem(body).match(/([\d,]+)回／分で，平均位置決め時間が(\d+)ミリ秒/);
    assert(q);
    const rpm=Number(q[1].replaceAll(',','')), seek=Number(q[2]);
    const distances=choices(body).map(option=>Math.abs((Number(option)-seek)*rpm-30000));
    match(body,(_,i)=>distances[i]===Math.min(...distances));
  }
  for (const body of entries(22)) {
    const q=stem(body).match(/1レコード(\d+)バイトのレコード([\d,]+)(万)?件.+?(\d+)レコードを1ブロック/);
    assert(q&&stem(body).includes('最後のセクタで余った部分は利用されない'));
    const count=Number(q[2].replaceAll(',',''))*(q[3]?10000:1), blockBytes=Number(q[1])*Number(q[4]);
    const [tracks,sectors,bytesPerSector]=grid(body).rows.map(row=>Number(row[1]));
    const required=Array.from({length:count/Number(q[4])},()=>1+Math.trunc((blockBytes-1)/bytesPerSector))
      .reduce((sum,x)=>sum+x,0);
    const capacity=Array.from({length:tracks},()=>sectors).reduce((sum,x)=>sum+x,0);
    match(body,option=>Number(option)*capacity>=required&&(Number(option)-1)*capacity<required);
    assert(choices(body).every((option,i,all)=>i===0||Number(all[i-1])<Number(option)));
  }
});

test('全選択肢の用語・説明とアクセス階層を査読済みの意味で照合する',()=>{
  for(const [number,facts] of Object.entries(knowledgeFacts)) {
    for(const [i,body] of entries(Number(number)).entries()) {
      const row=facts[i], values=choices(body);
      assert.match(stem(body),row.prompt);
      assert.equal(values.length,row.options.length);
      for(const [index,value] of values.entries())assert.match(value,row.options[index]);
      match(body,choice=>row.trueOption.test(choice));
    }
  }
  for(const body of entries(20)){
    assert(stem(body).includes('キャッシュ')||stem(body).includes('直接アクセス'));
    const level=choices(body).map(choice=>memoryHierarchy.get(choice));
    assert(level.every(value=>value!==undefined));
    match(body,(_,i)=>level[i]===Math.min(...level as number[]));
  }
});
