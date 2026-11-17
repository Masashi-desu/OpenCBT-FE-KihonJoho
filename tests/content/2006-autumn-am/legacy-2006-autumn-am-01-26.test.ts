import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2006AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2006-autumn-am-01-26';
import { legacy2006AutumnAm0126Figures as figures } from '../../../src/core/generators/legacy-2006-autumn-am-01-26-figures';
import { legacy2006AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2006AutumnAm0126Figures';
import source from '../../../src/core/generators/legacy-2006-autumn-am-01-26-source.json';
import { facts, officialAnswers, pages } from '../../fixtures/legacy-2006-autumn-am-01-26-facts';

const cases = [0,1,2,3];
const build = (n:number,i:number) => definitions[n-1].build([i]);
const text = (blocks:readonly Block[])=>blocks.flatMap(b=>'text' in b?[b.text]:[]).join('\n');
const prompt = (b:GeneratedBody)=>text(b.prompt);
const figure = (blocks:readonly Block[],part=0)=>{
 const b=blocks.filter(b=>b.type==='diagram')[part];assert(b);return b.alt;
};
const table = (blocks:readonly Block[])=>{const t=blocks.find(b=>b.type==='table');assert(t);return t;};
const num = (s:string)=>Number(s.replaceAll(',',''));
function unique(b:GeneratedBody,predicate:(option:Block[],index:number)=>boolean){
 assert.deepEqual(b.choices.flatMap((c,i)=>predicate(c,i)?[i]:[]),[b.correctIndex]);
}
function closest(b:GeneratedBody, value:number) {
 const d=b.choices.map(c=>Math.abs(num(text(c))-value));
 unique(b,(_,index)=>d[index]===Math.min(...d));
}

test('原ページと公式解答を照合し、26問の4条件・選択肢構造・不正入力域を検証する',()=>{
 assert.equal(definitions.length,26);
 assert.equal(source.map(r=>r.sourceKey).join(''),officialAnswers);
 assert.deepEqual(source.map(r=>r.printedPage),pages);
 for(const [index,def] of definitions.entries()){
  const items=cases.map(i=>def.build([i]));
  const reference=items[0];
  assert.equal(def.sourceAnswer,officialAnswers[index]);
  assert.equal('アイウエ'[reference.correctIndex!],officialAnswers[index]);
  assert.equal(new Set(items.map(body=>JSON.stringify(body.prompt))).size,4,def.source);
  const shape=(body:GeneratedBody)=>[body.prompt.map(b=>b.type),body.choices.map(blocks=>blocks.map(b=>b.type))];
  for(const body of items){
   assert.deepEqual(shape(body),shape(reference));
   assert.equal(new Set(body.choices.map(b=>JSON.stringify(b))).size,4);
   assert(body.explanation.length>20);
  }
  for(const invalid of [[],[-1],[4],[0.5],[0,1],Array<number>(1)]) assert.throws(()=>def.build(invalid),{code:'PARAMETER_CONSTRAINT'});
 }
});

test('問1〜3はビット全列挙、桁の移動と加算、任意の8ビット値の倍数判定で検算する',()=>{
 for(const i of cases){
  const limits=build(1,i), s=prompt(limits);
  const [width,ones]= i?[Number(s.match(/^(\d+)ビット/)![1]),Number(s.match(/1のビット数が(\d+)/)![1])]:[8,4];
  const accepted=Array.from({length:2**width},(_,value)=>value).filter(value=>
   [...value.toString(2)].filter(x=>x==='1').length===ones);
  unique(limits,option=>num(text(option))===(s.includes('最大')?accepted.at(-1):accepted[0]));
  const multiplier=build(2,i), m=prompt(multiplier), shift=Number(m.match(/(\d+)ビット左/)![1]);
  unique(multiplier,option=>[1,2,3,17,23].every(x=>{
   const placed=Number.parseInt(x.toString(2)+'0'.repeat(shift),2);
   return num(text(option))*x===placed+(m.includes('x を加える')?x:-x);
  }));
  if(i===0){
   for(const value of [52,53,54,55,56,57,58,59,60,61,62,63]){
    assert(value*4<256&&value*5>=256);
    const actual=(value*5)%256;
    assert(multiplier.choices.every(option=>num(text(option))*value!==actual));
   }
  }
  const filter=build(3,i), divisor=Number(prompt(filter).match(/(\d+)の倍数/)![1]);
  unique(filter,option=>{
   const s=text(option),mask=s.match(/[01]{8}/)![0];
   return Array.from({length:256},(_,v)=>v).every(v=>{
    const bits=v.toString(2).padStart(8,'0');
    const allZero=[...bits].every((digit,k)=>s.includes('論理積')?digit==='0'||mask[k]==='0':digit==='0'&&mask[k]==='0');
    return allZero===(v%divisor===0);
   });
  });
 }
});

test('問4・5・7はビットの重みと人の組合せを、選択肢を含めて別方式で評価する',()=>{
 for(const i of cases){
  const floating=build(4,i), alt=figure(floating.prompt), pos=Number(alt.match(/1〜(\d+)が指数部/)![1]);
  const bias=Number(alt.match(/指数に(\d+)を加算/)![1]), max=!prompt(floating).includes('最小値');
  const shown=floating.choices.map(c=>parseInt(text(c),16));
  const width=Number(prompt(floating).match(/(\d+)ビット/)![1]);
  const value=(v:number)=>{
   const raw=v.toString(2).padStart(width,'0'), exponent=parseInt(raw.slice(1,pos+1),2)-bias;
   const fraction=[...raw.slice(pos+1)].reduce((sum,bit,j)=>sum+Number(bit)*2**(-j-1),0);
   return (raw[0]==='0'?1:-1)*16**exponent*fraction;
  };
  const extreme=Math[max?'max':'min'](...[0,1].flatMap(sign=>[0,2**pos-1].flatMap(exponent=>[0,2**(width-pos-1)-1].map(
   fraction=>value(sign*2**(width-1)+exponent*2**(width-pos-1)+fraction)))));
  unique(floating,(_,index)=>value(shown[index])===extreme);
  const fixed=build(5,i), length=Number(prompt(fixed).match(/(\d+)ビット/)![1]);
  unique(fixed,option=>{
   const bits=parseInt(text(option),16).toString(2).padStart(length,'0');
   const decoded=Number(bits[0])*-(2**(length-1))+parseInt(bits.slice(1),2);
   return decoded===(prompt(fixed).includes('最小値')?-(2**(length-1)):2**(length-1)-1);
  });
  const groups=build(7,i), [m,w,total,min]=Array.from(prompt(groups).matchAll(/(\d+)人/g),q=>Number(q[1]));
  let count=0;
  for(let state=0;state<2**(m+w);state++){
   const selected=state.toString(2).padStart(m+w,'0');
   if([...selected].filter(n=>n==='1').length===total&&[...selected.slice(0,m)].filter(n=>n==='1').length>=min)count++;
  }
  unique(groups,choice=>num(text(choice))===count);
 }
});

test('問8・9は任意の入力と真理値表の全行、問10は開始・終了位置の総数から検算する',()=>{
 const operations={
  XOR:(a:number,b:number)=>Number(a!==b), NAND:(a:number,b:number)=>Number(a!==1||b!==1),
  AND:(a:number,b:number)=>Number(a===1&&b===1), OR:(a:number,b:number)=>Number(a===1||b===1),
 };
 const bits=(value:number)=>value.toString(2).padStart(8,'0');
 for(const i of cases){
  const items=build(8,i), [input,output]=Array.from(prompt(items).matchAll(/[01]{8}/g),m=>m[0]);
  const targets=[/最も右にある1を残し/, /Aから1を引いた結果のビット列/, /1より右のビットもすべて1/, /位置だけを0/];
  assert.match(prompt(items),targets[i]);
  function expected(value:number) {
   const original=bits(value), lastOne=original.lastIndexOf('1');
   switch(i){
    case 0: return [...original].map((_,position)=>position===lastOne?'1':'0').join('');
    case 1: return bits(value-1);
    case 2: return original.slice(0,lastOne+1)+'1'.repeat(7-lastOne);
    default: return [...original].map((_,position)=>position===lastOne?'0':'1').join('');
   }
  }
  assert.equal(output,expected(parseInt(input,2)));
  unique(items,option=>{
   const key=text(option).match(/（([A-Z]+)）/)![1] as keyof typeof operations;
   assert(operations[key]);
   for(let value=1;value<256;value++){
    const operand=bits(value), previous=bits(value-1);
    const actual=[...operand].map((bit,k)=>operations[key](Number(bit),Number(bit!==previous[k]))).join('');
    if(actual!==expected(value))return false;
   }
   return true;
  });
  const truth=build(9,i), rows=table(truth.prompt).rows;
  assert.equal(new Set(rows.map(row=>row.slice(0,3).join(''))).size,8);
  unique(truth,option=>rows.every(([x,y,z,f])=>{
   const values={X:x,Y:y,Z:z};
   const terms=text(option).split('＋').some(term=>term.split('・').every(token=>{
    const key=token[0] as keyof typeof values;
    return values[key]===(token.length>1?'0':'1');
   }));
   return Number(terms)===Number(f);
  }));
  const strings=build(10,i), [n,minimum]=Array.from(prompt(strings).matchAll(/長さ(\d+)/g),m=>Number(m[1])).slice(2);
  let amount=0;
  for(let left=0;left<n;left++){
   for(let right=left;right<n;right++) if(right-left+1>=minimum)amount++;
  }
  unique(strings,option=>{
   const end=Number(text(option).split('＋').at(-1));
   return Array.from({length:end},(_,k)=>k+1).reduce((a,b)=>a+b,0)===amount;
  });
 }
});

test('問11・12は状態遷移と巡回による実際の出力を候補ごとに比較する',()=>{
 const standard=[
  ['＋a＊−bcd','(a＋((b−c)＊d))','abc−d＊＋'],
  ['−＊ab＋cd','((a＊b)−(c＋d))','ab＊cd＋−'],
  ['＊a＋−bcd','(a＊((b−c)＋d))','abc−d＋＊'],
  ['＊＋ab−cd','((a＋b)＊(c−d))','ab＋cd−＊'],
 ];
 for(const i of cases){
  const automaton=build(11,i), visible=figure(automaton.prompt,1);
  const [pulse,repeat]=visible.match(/(\d)を読むたびに次の状態へ進み、(\d)回/)!.slice(1);
  unique(automaton,option=>{
   let state=0;
   for(const bit of text(option)){
    if(state>Number(repeat))continue;
    state=bit===pulse?state+1:0;
   }
   return state===Number(repeat);
  });
  const traversal=build(12,i), labels=['前置記法','中置記法','後置記法'];
  labels.forEach((label,k)=>assert(figure(traversal.prompt).includes(label+' '+standard[i][k]+'。')));
  unique(traversal,option=>{
   const [label,rule]=text(option).split('：');
   const timing=rule.includes('左の枝から右')?1:rule.includes('上に戻る')?2:0;
   return standard[i][labels.indexOf(label)]===standard[i][timing];
  });
 }
});

test('問13〜15はセルの実行、探索の反復、衝突時の空き検査で解答を導く',()=>{
 for(const i of cases){
  const list=build(13,i), before=table(list.prompt).rows;
  const target=prompt(list).match(/リストを［([^］]+)］/)![1].split('，');
  unique(list,option=>{
   const assigned=new Map(before.map(([row,,next])=>[Number(row),next.length?Number(next):-1]));
   for(const operation of table(option).rows[0]){
    const [expression,location]=operation.split('→');
    const row=Number(location.match(/A\((\d+),2\)/)![1]);
    const literals=expression.match(/^(\d+)$/);
    const indirect=expression.match(/^A\(A\((\d+),2\),2\)$/);
    const value=literals?Number(literals[1]):assigned.get(assigned.get(Number(indirect![1]))!)??-1;
    assigned.set(row,value);
   }
   const actual:string[]=[];
   const used=new Set<number>();
   for(let row=1;row!==0;row=assigned.get(row)!){
    if(!assigned.has(row)||used.has(row))return false;
    used.add(row);actual.push(before[row-1][1].slice(1,-1));
   }
   return actual.join('、')===target.join('、');
  });
  const search=build(14,i);
  const models:Record<string,(n:number)=>number>={
   'log₂ n':Math.log2,'(log₂ n＋1)／2':n=>(Math.log2(n)+1)/2,'n':n=>n,'n²':n=>n*n,'1':()=>1,
  };
  const input=prompt(search);
  const expected=(n:number)=>{
   const keys=Array.from({length:n},(_,j)=>j);
   if(input.includes('2分探索')){
    const key=input.includes('最初の中央要素')?keys[(n-1)/2]:keys[n-1];
    let low=0,high=n-1,steps=0;
    while(low<=high){
     steps++;const mid=Math.floor((low+high)/2);
     if(keys[mid]===key)return steps;
     if(keys[mid]<key)low=mid+1;else high=mid-1;
    }
    return 0;
   }
   return (input.includes('n 回')?n:1)*(keys.findIndex(key=>key===n-1)+1);
  };
  unique(search,option=>[127,255,511,1023].every(n=>{
   const rule=models[text(option)];assert(rule);
   return Math.abs(rule(n)-expected(n))<0.02;
  }));
  const array=build(15,i);
  const values=prompt(array).match(/([\d，]+) を順に格納/)![1].split('，').map(Number);
  const assignments=new Map<number,number>();
  for(const v of values){
   const available=[v,v+1,v+4].map(address=>address-10*Math.floor(address/10));
   const position=available.find(which=>!assignments.has(which));
   assert.notEqual(position,undefined);assignments.set(position!,v);
  }
  unique(array,option=>assignments.get(Number(text(option).match(/\[(\d+)\]/)![1]))===values.at(-1));
 }
});

test('問17・18はゲートの真偽値と段の時間割を全候補で照合する',()=>{
 for(const i of cases){
  const gate=build(17,i), [a,b,c]=prompt(gate).match(/A＝(\d)，B＝(\d)，C＝(\d)/)!.slice(1).map(v=>v==='1');
  const [first,second]=figure(gate.prompt,1).match(/(?:AND|OR)/g)!;
  const apply=(logic:string,left:boolean,right:boolean)=>logic==='AND'?left&&right:left||right;
  const p=apply(first,a,b), q=apply(second,p,c);
  unique(gate,option=>table(option).rows[0].join('')===[p,q,!q].map(Number).join(''));
  const pipe=build(18,i), min=Number(prompt(pipe).match(/少なくとも(\d+)サイクル/)?.[1]??1);
  unique(pipe,option=>{
   const [a,b,c]=figure(option).match(/位置：([^。]+)/)![1].split('、').map(Number);
   const start=[a,b,c];const schedule=new Set<string>();
   if(b-a<min||c-b<min)return false;
   for(const time of start){
    for(const [stage,offset] of [...'FDARE'].map((s,k)=>[s,k] as const)){
     const move=stage+':'+(time+offset);
     if(schedule.has(move))return false;schedule.add(move);
    }
   }
   return c+5===2*min+5;
  });
 }
});

test('問20・22・23・26は試行時間、物理量の次元、データ分布、記録可能枚数で検算する',()=>{
 for(const i of cases){
  const memory=build(20,i), [[,hitX,hitY],[,missX,missY]]=table(memory.prompt).rows;
  unique(memory,option=>{
   const hits=Number(text(option))*100;
   return num(hitX)*hits+num(missX)*(100-hits)===num(hitY)*hits+num(missY)*(100-hits);
  });
  const waits=build(22,i), [rpm,seek]=prompt(waits).match(/([\d,]+)回／分.*?(\d+)ミリ秒/)!.slice(1).map(num);
  const turnsInSecond=rpm/60;
  closest(waits,(0.5/turnsInSecond+seek/1000)*1000);
  const disks=build(23,i);
  const columns=Array.from(figure(disks.prompt).matchAll(/ディスク\d：([^。]+)/g),m=>
    m[1].split('、').map(label=>Number(label.slice(1))));
  const matches=columns.every(column=>column.join(',')===columns[0].join(','));
  if(!matches){
   assert(columns[0].every((_,row)=>columns.every((column,j)=>column[row]===row*columns.length+j)));
   assert.equal(new Set(columns.flat()).size,columns.flat().length);
  }
  unique(disks,option=>text(option)===(matches?'ミラーリング':'ストライピング'));
  const images=build(26,i), [w,h,bits,mb]=prompt(images).match(/横([\d,]+)画素，縦([\d,]+)画素で，(\d+)ビット.*?(\d+)Mバイト/)!.slice(1).map(num);
  unique(images,option=>[10**6,2**20].every(unit=>{
   const capacity=mb*unit*8, choice=num(text(option)), image=w*h*bits;
   return choice*image<=capacity&&(choice+1)*image>capacity;
  }));
 }
});

test('問6・16・19・21・24・25は査読済みの事実と全択の判定を照合する',()=>{
 const displayChoices=[
  [/視野角が狭い/,/寿命が長い/,/発熱が少ない/,/自ら発光/],
  [/自ら発光/,/バックライトの光の通り方/,/暗いとバックライトが必ず消える/,/画面全体で一定/],
  [/斜めからでも正面に近い/,/解像度が必ず倍/,/発光効率が必ず上がる/,/正面からしか/],
  [/暗い画素にはバックライトを追加/,/すべての画素が同じ電力/,/暗い画素の発光に使う電力が少なく/,/液晶では画素ごとに有機材料/],
 ];
 for(const [number,reference] of Object.entries(facts)){
  for(const i of cases){
   const item=build(Number(number),i), selected=reference.answer[i];
   assert.match(prompt(item),reference.stem[i]);
   const choices=number==='25'?displayChoices[i]:reference.meanings;
   unique(item,option=>{
    const meanings=choices.flatMap((pattern,j)=>pattern.test(text(option))?[j]:[]);
    assert.equal(meanings.length,1,'問'+number+' 条件'+i+' '+text(option));
    return meanings[0]===selected;
   });
  }
 }
});

test('7問の全42図は固有プロファイルと可視・音声代替情報を保持する',()=>{
 const rendered=new Set<string>();
 for(const n of [4,11,12,17,18,20,23]){
  for(const i of cases){
   const body=build(n,i);
   for(const block of [body.prompt,...body.choices].flat()){
    if(block.type!=='diagram'||block.scene.kind!=='source_figure')continue;
    const {profile,values}=block.scene;
    const def=figures.find(candidate=>candidate.profile===profile);
    const renderer=renderers.find(candidate=>candidate.profile===profile);
    assert(def&&renderer);assert(profile.startsWith('legacy-2006-autumn-am-'+n+'-'));
    def.validate(values);
    for(const invalid of [[-1],[0.25],[values[0],0],[]])assert.throws(()=>def.validate(invalid));
    assert.equal(def.alt(values),block.alt);
    const markup=renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
    assert(markup.includes('role="img"')&&markup.includes('aria-describedby=')&&markup.includes('tabindex="0"'));
    assert(markup.includes('<title')&&markup.includes('<desc')&&markup.includes(block.alt));
    const id=profile+':'+values.join(',');
    assert(markup.includes(id.split(':')[0]));rendered.add(id);
   }
  }
 }
 assert.equal(rendered.size,42);
});
