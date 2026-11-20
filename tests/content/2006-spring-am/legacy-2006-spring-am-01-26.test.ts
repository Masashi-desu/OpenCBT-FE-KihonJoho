import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { validateFormula } from '../../../src/core/validation';
import { legacy2006SpringAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2006-spring-am-01-26';
import { legacy2006SpringAm0126Figures as figures } from '../../../src/core/generators/legacy-2006-spring-am-01-26-figures';
import { legacy2006SpringAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2006SpringAm0126Figures';
import source from '../../../src/core/generators/legacy-2006-spring-am-01-26-source.json';
import { knowledge, official, originalPages } from '../../fixtures/legacy-2006-spring-am-01-26-facts';

const cases=[0,1,2,3];
const definitionsByNumber=new Map(definitions.map(def=>[Number(def.source.split('-').at(-1)),def]));
function build(n:number,i:number){const def=definitionsByNumber.get(n);assert(def);return def.build([i]);}
const text=(blocks:readonly Block[])=>blocks.flatMap(b=>'text' in b?[b.text]:[]).join('\n');
const figure=(blocks:readonly Block[],part=0)=>{
 const b=blocks.filter(b=>b.type==='diagram')[part];assert(b);return b.alt;
};
const table=(blocks:readonly Block[])=>{const t=blocks.find(b=>b.type==='table');assert(t);return t;};
const number=(s:string)=>Number(s.replaceAll(',',''));
function unique(b:GeneratedBody,predicate:(option:Block[],index:number)=>boolean){
 assert.deepEqual(b.choices.flatMap((c,i)=>predicate(c,i)?[i]:[]),[b.correctIndex]);
}
function binary(value:string) {
 const [integer,fraction='']=value.split('.');
 return [...integer].reduce((n,bit)=>2*n+Number(bit),0)+[...fraction].reduce((n,bit,i)=>n+Number(bit)/2**(i+1),0);
}
test('公式の問番号・頁・全正答と四条件を照合する',()=>{
 const intended=Array.from({length:26},(_,i)=>i+1);
 assert.deepEqual([...definitionsByNumber.keys()],intended);
 assert.deepEqual(source.map(row=>row.number),intended);
 for(const [n,definition] of definitionsByNumber){
  assert.equal(definition.sourceAnswer,official[n-1]);
  assert.equal(source.find(row=>row.number===n)?.printedPage,originalPages[n-1]);
  const variants=cases.map(i=>definition.build([i]));
  assert.equal('アイウエ'[variants[0].correctIndex!],official[n-1]);
  assert.equal(new Set(variants.map(v=>JSON.stringify(v.prompt))).size,4,n.toString());
  const shape=(body:GeneratedBody)=>[body.prompt.map(b=>b.type),body.choices.map(option=>option.map(b=>b.type))];
  for(const variant of variants){
   assert.deepEqual(shape(variant),shape(variants[0]));
   assert.equal(new Set(variant.choices.map(option=>JSON.stringify(option))).size,4);
   assert(variant.explanation.length>20);
   for(const block of [variant.prompt,...variant.choices].flat())if(block.type==='formula'&&block.format==='latex')validateFormula(block.text);
  }
  for(const invalid of [[],[-1],[4],[0.3],[0,1],Array<number>(1)])assert.throws(()=>definition.build(invalid));
 }
});
test('問8は査読したJISマッピングを参照し、二文字の全8ビットと順番で全択を判定する',()=>{
 const reference={ '1':0x31,'2':0x32,'3':0x33,A:0x41,B:0x42,C:0x43 } as const;
 const entries=Object.entries(reference);
 for(const i of cases) {
  const body=build(8,i);
  const [first,second]=[...text(body.prompt).matchAll(/“(.)”/g)].map(match=>match[1]);
  assert.equal(first+second,['A2','B3','C1','3A'][i]);
  const block=body.contexts?.[0].blocks[0];
  assert(block?.type==='table');
  assert.deepEqual(block.rows.map(row=>row[0]),['0001','0010','0011']);
  assert.deepEqual(block.columns.slice(1).map(column=>column.split(' ').at(-1)),['0001','0010','0011','0100']);
  const recovered=block.rows.flatMap(([low,...columns])=>columns.flatMap((value,index)=>
    value ? [[value, ((index+1)*16)+Number.parseInt(low,2)]] : []));
  assert.deepEqual(recovered.sort(),entries.sort());
  unique(body, option=>{
   const words=text(option).split('　');
   assert.equal(words.length,2);
   assert(words.every(word=>/^[01]{8}$/.test(word)));
   return Number.parseInt(words[0],2)===reference[first as keyof typeof reference] &&
     Number.parseInt(words[1],2)===reference[second as keyof typeof reference];
  });
 }
 assert.deepEqual(build(8,0).choices.map(text),['00010100　00100011','00110010　01000001','01000001　00110010','01000010　00110010']);
});

test('問1〜3の各候補を桁位置・繰下がり・全ビット値から別方式で検算する',()=>{
 for(const i of cases){
  const radix=build(1,i), [whole,fraction]=text(radix.prompt).match(/[\dA-F]+\.[\dA-F]+/)![0].split('.');
  const values=(s:string)=>[...s].map(d=>'0123456789ABCDEF'.indexOf(d));
  const expected=[...values(whole),...values(fraction)].reduce((sum,digit,k)=>sum+digit*16**(whole.length-k-1),0);
  unique(radix,option=>{
   const result=[...text(option).matchAll(/2\^\{(-?\d+)\}/g)].map(m=>2**Number(m[1]));
   assert.equal(result.length,6);return result.reduce((a,b)=>a+b,0)===expected;
  });
  const base=build(2,i), [left,right,answer]=text(base.prompt).match(/(\d+) − (\d+) ＝ (\d+)/)!.slice(1);
  unique(base,option=>{
   const radix=Number(text(option));
   if([...left+right+answer].some(ch=>Number(ch)>=radix))return false;
   const tl=[...left].reverse().map(Number), tr=[...right].reverse().map(Number);
   const remainder=tl.map((digit,k)=>{
    const v=digit-(tr[k]??0);
    if(v<0){tl[k+1]--;return v+radix;}
    return v;
   }).reverse().join('').replace(/^0+/,'');
   return remainder===answer;
  });
  const signed=build(3,i), prompt=text(signed.prompt);
  const encoding=prompt.includes('2の補数')?'twos':prompt.includes('1の補数')?'ones':'sign';
  const extra=Number(prompt.includes('n＋1'));
  unique(signed,option=>{
   const [lo,hi]=text(option).split(' 〜 ');
   const evaluate=(expression:string,n:number)=>{
    const amount=expression.replaceAll('2ⁿ⁻¹',String(2**(n-1))).replaceAll('2ⁿ',String(2**n));
    const nums=amount.match(/\d+/g)!.map(Number);
    let result=nums[0]-(nums[1]??0);
    if(amount.startsWith('−('))return -result;
    if(amount.startsWith('−'))return -nums[0]-(nums[1]??0);
    return result;
   };
   return [3,5,8].every(n=>{
    const width=n+extra, codes=Array.from({length:2**width},(_,data)=>{
     const str=data.toString(2).padStart(width,'0');
     if(str[0]==='0')return binary(str);
     if(encoding==='twos')return data-2**width;
     if(encoding==='ones')return -binary([...str].map(bit=>bit==='1'?'0':'1').join(''));
     return -binary(str.slice(1));
    });
    return evaluate(lo,n)===Math.min(...codes)&&evaluate(hi,n)===Math.max(...codes);
   });
  });
 }
});
test('問4〜7は負の指数、情報落ち、全パリティパターンとベン図の全領域を検算する',()=>{
 for(const i of cases){
  const float=build(4,i), value=Number(text(float.prompt).match(/10進数(-?[\d.]+)を/)![1]);
  assert.match(figure(float.prompt),/符号の1ビット.*指数の4ビット.*仮数の11ビット.*小数点はfの直前/);
  unique(float,option=>{
   const [s,e,f]=figure(option).match(/S：([01])、e：([01]{4})、f：([01]{11})/)!.slice(1);
   if(f[0]==='0')return false;
   const exponent=binary(e.slice(1))-Number(e[0])*8;
   return (s==='0'?1:-1)*2**exponent*binary('0.'+f)===value;
  });
  const rounding=build(5,i), precision=Number(text(rounding.prompt).match(/仮数部が(\d+)ビット/)![1]);
  unique(rounding,option=>{
   const inputs=[...text(option).matchAll(/\(([01.]+)\)_2\\times2\^\{(-?\d+)\}/g)];
   assert.equal(inputs.length,2);
   const data=inputs.map(([,digits,e])=>{
    const power=Number(e)+digits.indexOf('.')-1;
    return [...digits.replace('.','')].flatMap((bit,k)=>bit==='1'?[power-k]:[]);
   });
   const maximum=Math.max(...data.flat()), minimum=Math.min(...data.flat());
   // The source's width allows either including or separately storing
   // the leading significant bit. This candidate loses digits in both.
   const dropsAsSpecified=maximum-minimum>=precision;
   const dropsWithImplicitLeading=maximum-minimum>precision;
   assert.equal(dropsAsSpecified,dropsWithImplicitLeading);
   return dropsAsSpecified;
  });
  const parity=build(6,i), str=text(parity.prompt);
  const width=Number(str.match(/(\d+)ビット符号/)![1]);
  const clear=str.startsWith('最上位')?0:str.startsWith('最下位')?width-1:width-4;
  unique(parity,option=>{
   const [raw,op]=text(option).match(/([\dA-F]+) との (AND|OR|XOR)/)!.slice(1);
   const mask=parseInt(raw,16).toString(2).padStart(width,'0');
   return Array.from({length:2**width},(_,value)=>value.toString(2).padStart(width,'0')).every(template=>
    [...template].every((bit,k)=>{
     const values=[bit==='1',mask[k]==='1'];
     const actual=op==='AND'?values.every(Boolean):op==='OR'?values.some(Boolean):values[0]!==values[1];
     return actual===(k!==clear&&bit==='1');
    }));
  });
  const venn=build(7,i), description=figure(venn.prompt).match(/網掛け領域：([^。]+)/)![1].split('／');
  const actual=description.map(region=>['A','B','C'].map(letter=>Number(region.includes(letter+'に属する'))).join(''));
  const all=(s:string,a:boolean,b:boolean,c:boolean)=>{
   if(s.startsWith('\\neg(A\\cap'))return b&&!(a&&c);
   if(s.startsWith('(A\\cup'))return (a||b)&&!c;
   if(s.startsWith('(\\neg'))return b&&(a!==c);
   if(s.startsWith('\\neg(A\\cup'))return !a&&!b&&!c;
   throw Error('未知の集合式');
  };
  unique(venn,option=>Array.from({length:8},(_,n)=>n.toString(2).padStart(3,'0')).every(bits=>
   all(text(option),bits[0]==='1',bits[1]==='1',bits[2]==='1')===actual.includes(bits)));
 }
});
test('問9〜13は文字単位実行、後置計算、三辺距離、手続実行と安定桁整列を照合する',()=>{
 for(const i of cases){
  const states=build(9,i), rows=table(states.prompt).rows;
  unique(states,option=>{
   let state='a';
   for(const ch of text(option)){
    const col=ch==='△'?1:ch==='.'?4:'＋−'.includes(ch)?3:'0123456789'.includes(ch)?2:5;
    state=rows.find(([id])=>id===state)![col];
    if(state==='e')return true;
   }
   return false;
  });
  const notation=build(10,i), expression=text(notation.prompt).split('\n').at(-1)!;
  const operators=expression.match(/[＋−×÷]/g)!;
  const evaluate=(symbol:string,a:number,b:number)=>symbol==='＋'?a+b:symbol==='−'?a-b:symbol==='×'?a*b:a/b;
  unique(notation,option=>[
   [2,3,4,5,6],[3,7,11,2,5],[9,2,6,2,3],
  ].every(([a,b,c,d,e])=>{
   const out=Array<number>();
   const variables:Record<string,number>={A:a,B:b,C:c,D:d,E:e};
   for(const symbol of text(option).slice(1,-1)){
    if(symbol in variables)out.push(variables[symbol]);
    else {
     const right=out.pop(),left=out.pop();if(right===undefined||left===undefined)return false;
     out.push(evaluate(symbol,left,right));
    }
   }
   const expected=evaluate(operators[1],evaluate(operators[0],a,b),evaluate(operators[2],c,evaluate(operators[3],d,e)));
   return out.length===1&&Math.abs(out[0]-expected)<1e-9;
  }));
  const usage=build(11,i), values=[...figure(usage.prompt,1).matchAll(/[ABCD]：(\d+)、(\d+)、(\d+)/g)].map(m=>m.slice(1).map(Number));
  assert.equal(values.length,4);assert(values.every(row=>row.reduce((a,b)=>a+b,0)===100));
  unique(usage,option=>{
   const str=text(option), [db,word,sheet]=values['ABCD'.indexOf(str[0])];
   if(str.includes('だけ'))return word>0&&db+sheet===0;
   if(str.includes('ほかのソフトに比べて'))return sheet===Math.max(db,sheet,word)&&db!==sheet&&word!==sheet;
   if(str.includes('の順に'))return db>sheet&&sheet>word;
   return sheet===0;
  });
  const storage=build(12,i), program=storage.prompt.find(x=>x.type==='code');assert(program);
  let stack='', queue='';
  function run(s:string):string{
   if(s==='pop()'){const top=stack[0];assert(top);stack=stack.slice(1);return top;}
   if(s==='deq()'){const front=queue[0];assert(front);queue=queue.slice(1);return front;}
   if(/^[a-d]$/.test(s))return s;
   const [command,argument]=s.match(/^(push|enq)\((.*)\)$/)!.slice(1), element=run(argument);
   if(command==='push')stack=element+stack;else queue+=element;
   return element;
  }
  let expected='';
  for(const line of program.text.split('\n')){
   if(line.startsWith('x ← '))expected=run(line.slice(4));else run(line);
  }
  unique(storage,option=>text(option)===expected);
  const sort=build(13,i);
  const input=text(sort.prompt).match(/6個の数値 ([\d，]+)/)![1].split('，').map(Number);
  const digits=(values:number[],column:number)=>Array.from({length:10},(_,rank)=>
   values.filter(value=>String(value)[column]===String(rank))).flat();
  const result=digits(digits(input,2),1).join('，');
  unique(sort,option=>text(option)===result);
 }
});
test('問14〜16は中央位置の全候補、シフト加算の境界、全NAND入力を照合する',()=>{
 for(const i of cases){
  const search=build(14,i), prompt=text(search.prompt);
  const location=figure(search.prompt).match(/。([^、]+)をx、([^に]+)に入れる/)!.slice(1);
  assert.deepEqual(location,[[ '1','nをy'],['2','n−1をy'],['3','nをy'],['1','n−2をy']][i]);
  unique(search,option=>{
   const chars=text(option).replaceAll(' ','');
   return [9,10,11,12,17,28].every(n=>{
    const x0=Number(location[0]), limit=n-Number(location[1].match(/−(\d+)/)?.[1]??0);
    const enumerate=Array.from({length:n},(_,idx)=>idx*2+6);
    const center=(x:number,y:number)=>{
     let a=chars.includes('x＋y')?x+y:chars.includes('x−y')?x-y:y-x;
     if(chars.includes('＋1'))a++;
     return chars.includes('／2')?Math.trunc(a/2):a;
    };
    for(let target=2;target<=2*n+8;target++){
     let lo=x0,hi=limit,answer=0;
     while(lo<=hi){
      const m=center(lo,hi), range=enumerate.slice(lo-1,hi);
      const unbiased=lo+(prompt.includes('大きい方')?Math.floor(range.length/2):Math.floor((range.length-1)/2));
      if(m!==unbiased)return false;
      const candidate=enumerate[m-1];
      if(candidate===target){answer=m;break;}
      if(target<candidate)hi=m-1;else lo=m+1;
     }
     const found=enumerate.findIndex((value,idx)=>idx+1>=x0&&idx+1<=limit&&value===target);
     if(answer!==found+1)return false;
    }
    return true;
   });
  });
  const multiplication=build(15,i), widths=text(multiplication.prompt).match(/符号なしの(\d+)ビット.*?(\d+)ビットのレジスタ/)!.slice(1).map(Number);
  const [width,reg]=widths,max=2**width-1;
  assert(figure(multiplication.prompt).includes('i≦'+width));
  unique(multiplication,option=>{
   const [source,steps]=table(option).rows[0];
   const order=source.includes('最下位')?1:2**(reg-1);
   const shifts=steps.match(/[左右]シフト/g)!;
   const step=(value:number,left:boolean)=>left?(value*2)%2**reg:Math.trunc(value/2);
   return [[0,max],[1,max],[max,1],[max,max],[17,13],[2**(width-1),9],[99,156]].every(([a,b])=>{
    let one=a, two=b, output=0;
    for(let k=0;k<width;k++){
     if(Math.trunc(two/order)%2)output=(output+one)%2**reg;
     one=step(one,shifts[0]==='左シフト');two=step(two,shifts[1]==='左シフト');
    }
    return output===a*b;
   });
  });
  const circuit=build(16,i), connections=[...figure(circuit.prompt,1).matchAll(/NAND\(([A-Z0-9]+),([A-Z0-9]+)\)/g)].map(m=>m.slice(1));
  assert.equal(connections.length,3);
  unique(circuit,option=>[0,1,2,3].every(input=>{
   const x=Boolean(input>>1),y=Boolean(input&1), values:Record<string,boolean>={X:x,Y:y};
   for(const [idx,[a,b]] of connections.entries()){
    assert(a in values&&b in values);
    values[idx===2?'Z':'N'+(idx+1)]=[values[a],values[b]].filter(Boolean).length!==2;
   }
   const rule=text(option), inner=rule.includes('\\cdot')?x&&y:x||y;
   return values.Z===(rule.startsWith('\\neg')?!inner:inner);
  }));
 }
});

test('問18・19・20・24・26の全候補を処理依存、実行総量、単位、ブロック境界・装置の役割で検査する',()=>{
 const stages=[
  ['命令フェッチ','命令の解読','オペランド読出し','命令の実行'],
  ['命令フェッチ','命令の解読','指定アドレスの読出し','レジスタへの格納'],
  ['命令の解読','アドレス指定先から実効アドレスを取得','実効アドレスからオペランド読出し','加算の実行'],
  ['レジスタの読出し','和を算出','和を指定アドレスへ書込み','命令の処理を完了'],
 ];
 const devices=[
  ['記憶','制御'],['入力','記憶'],['演算','出力'],['記憶','演算'],
 ];
 const deviceActionPattern=[/命令はどの装置から取り出され/,/外から与えられた値/,/二数の加算結果/,/既に保存してある二つの値/];
 for(const i of cases){
  const instructions=build(18,i);
  assert.match(text(instructions.prompt),[/命令実行順序/,/直接アドレス指定/,/間接アドレス指定/,/値の和を主記憶/][i]);
  unique(instructions,option=>{
   const displayed=text(option).split(' → ');
   return stages[i].every((stage,j)=>displayed.includes(stage)&&(j===0||displayed.indexOf(stages[i][j-1])<displayed.indexOf(stage)));
  });
  const cpi=build(19,i), input=table(cpi.prompt).rows;
  const instructions100=input.flatMap(([,count,cycles])=>Array<number>(Number(count)).fill(Number(cycles)));
  assert.equal(instructions100.length,100);
  unique(cpi,option=>number(text(option))*instructions100.length===instructions100.reduce((a,b)=>a+b,0));
  const speed=build(20,i), mips=Number(text(speed.prompt).match(/(\d+)MIPS/)![1]);
  unique(speed,option=>{
   const [numeric,label]=text(option).split(' ');
   return Number(numeric)*(label==='ナノ秒'?1:1000)*mips===1000;
  });
  const file=build(24,i), [bytes,block,a,b]=text(file.prompt).match(/([\d,]+)バイトのセクタ(\d+)個.*?([\d,]+)バイト及び([\d,]+)バイト/)!.slice(1).map(number);
  unique(file,option=>{
   let used=0;
   for(let remaining of [a,b]){
    while(remaining>0){used+=block;remaining-=bytes*block;}
   }
   return number(text(option))===used;
  });
  const roles=build(26,i);
  assert.match(text(roles.prompt),deviceActionPattern[i]);
  unique(roles,option=>table(option).rows[0].join(',')===devices[i].join(','));
 }
});
test('問17・21・22・23・25の全択を監査済みの事実に照合する',()=>{
 for(const [n,truth] of Object.entries(knowledge)){
  for(const i of cases){
   const item=build(Number(n),i);
   assert.match(text(item.prompt),truth.target[i]);
   const pattern=truth.meanings[truth.meanings.length>1&&i?1:0];
   unique(item,option=>{
    const matches=pattern.flatMap((re,j)=>re.test(text(option))?[j]:[]);
    assert.equal(matches.length,1);
    return truth.answer[i]===matches[0];
   });
  }
 }
 const baseline=build(23,0);
 assert.match(baseline.explanation,/全体のパリティを付加する拡張ハミング符号/);
 const ordinary=Array.from({length:128},(_,word)=>word).filter(word=>{
  let check=0;
  for(let b=0;b<7;b++)if(word&(1<<b))check^=b+1;
  return check===0;
 });
 const distance=(a:number,b:number)=>[...(a^b).toString(2)].filter(bit=>bit==='1').length;
 const extended=ordinary.map(word=>word+128*(distance(word,0)%2));
 assert.equal(ordinary.length,16);
 assert.equal(Math.min(...ordinary.slice(1).map(v=>distance(v,0))),3);
 assert.equal(Math.min(...extended.slice(1).map(v=>distance(v,0))),4);
 for(const word of extended){
  for(let i=0;i<8;i++){
   const read=word^(1<<i);
   assert.deepEqual(extended.filter(valid=>distance(valid,read)<=1),[word]);
   for(let j=i+1;j<8;j++)assert.equal(extended.some(valid=>distance(valid,read^(1<<j))<=1),false);
  }
 }
});
test('原問に属する39図の入力域・音声代替・SSR表示を照合する',()=>{
 const seen=new Set<string>();
 for(const n of [4,7,11,14,15,16]){
  for(const i of cases){
   const result=build(n,i);
   for(const b of [result.prompt,...result.choices].flat()){
    if(b.type!=='diagram'||b.scene.kind!=='source_figure')continue;
    const {profile,values}=b.scene, def=figures.find(x=>x.profile===profile), renderer=renderers.find(x=>x.profile===profile);
    assert(def&&renderer);
    assert(profile.startsWith('legacy-2006-spring-am-'+n+'-'));
    assert.equal(def.alt(values),b.alt);
    def.validate(values);
    for(const bad of [[],[-1],[values[0],0],[0.5]])assert.throws(()=>def.validate(bad));
    const markup=renderToStaticMarkup(createElement(renderer.component,{values,caption:b.caption}));
    assert(markup.includes('aria-describedby=')&&markup.includes('role="img"')&&markup.includes('tabindex="0"'));
    assert(markup.includes('<title')&&markup.includes('<desc')&&markup.includes(profile));
    seen.add(profile+':'+values[0]);
   }
  }
 }
 assert.equal(seen.size,39);
});
