import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2005-autumn-am-01-26';
import { legacy2005AutumnAm0126Figures as figures } from '../../../src/core/generators/legacy-2005-autumn-am-01-26-figures';
import { legacy2005AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2005AutumnAm0126Figures';
import { knowledgeFacts } from '../../fixtures/legacy-2005-autumn-am-01-26-facts';

const variants = [0,1,2,3];
const definitionsByNumber = new Map(definitions.map(definition=>[Number(definition.source.slice('2005h17a-fe-am-'.length)),definition]));
function entries(number: number) {
  const definition=definitionsByNumber.get(number);
  assert(definition,'missing cohort definition '+number);
  return variants.map(variant=>definition.build([variant]));
}
const parts = (body: GeneratedBody) => body.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join(' ');
const flat = (blocks: Block[]) => blocks.map(block=>{
  if(block.type==='paragraph') return block.text;
  if(block.type==='formula'||block.type==='diagram') return block.alt;
  throw Error('未入力の内容形式');
}).join(' ');
const choices=(body: GeneratedBody)=>body.choices.map(flat);
const integers=(body: GeneratedBody)=>choices(body).map(val=>Number(val.replaceAll(',','')));
function match(body: GeneratedBody, predicates: boolean[]) {
  assert.equal(predicates.length,4);
  assert.deepEqual(predicates.flatMap((pass,i)=>pass?[i]:[]),[body.correctIndex]);
}
function numeric(body: GeneratedBody, expected: number) {
  match(body,integers(body).map(candidate=>candidate===expected));
  assert(body.explanation.replaceAll(',','').includes(String(expected)));
}
function tableRows(body: GeneratedBody) {
  const block=body.prompt.find(item=>item.type==='table'); assert(block);
  return block.rows;
}
function svg(block: Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const { profile, values }=block.scene;
  const renderer=renderers.find(item=>item.profile===profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
}

test('公式解答を全掲載問で読み合わせ、全入力の出題形式と再現性を保つ',()=>{
  const official=['ウ','ア','エ','エ','イ','イ','ウ','エ','イ','エ','ウ','ウ','ウ','ア','エ','エ','ウ','ア','エ','ウ','イ','ウ','ウ','エ','ア','エ'];
  const admitted=Array.from({length:26},(_,index)=>index+1).filter(q=>q!==11&&q!==17);
  assert.deepEqual([...definitionsByNumber.keys()],admitted);
  for(const q of admitted) {
    const definition=definitionsByNumber.get(q)!;
    assert.equal(definition.sourceAnswer,official[q-1]);
    const referenceIndex=definition.build([0]).correctIndex;
    assert(typeof referenceIndex==='number');
    assert.equal('アイウエ'[referenceIndex],official[q-1]);
    const bodies=entries(q);
    assert.equal(new Set(bodies.map(body=>JSON.stringify(body.prompt))).size,4);
    assert(new Set(bodies.map(body=>body.correctIndex)).size>1||definition.answerVariation==='fixed');
    for(const [index,body] of bodies.entries()) {
      assert.deepEqual(body,definition.build([index]));
      assert.equal(new Set(choices(body)).size,4);
      assert(body.explanation.length>25);
    }
    for(const values of [[-1],[4],[2.5],[],[1,2],new Array(1)]) assert.throws(()=>definition.build(values),/査読済み入力域/);
  }
});

test('問1〜5の全択を、筆算の余り・桁の重み・レジスタ・除算区間・補数の真理表で照合する',()=>{
  for(const body of entries(1)) {
    const base=Number(parts(body).match(/(\d+)進数に変換/)?.[1]);
    const terminating=(string: string)=>{
      const digits=string.split('.')[1], divisor=10**digits.length, seen=new Set<number>();
      let remainder=Number(digits);
      while(remainder&&!seen.has(remainder)) { seen.add(remainder); remainder=remainder*base%divisor; }
      return remainder===0;
    };
    match(body,choices(body).map(terminating));
  }
  for(const body of entries(2)) {
    const stem=parts(body), key=stem.match(/キー値が(\d+)/)?.[1];
    assert(key&&stem.includes('0000〜4999')&&stem.includes('11進数')&&stem.includes('0.5')&&stem.includes('切捨て'));
    const converted=[...key].reverse().reduce((sum,digit,index)=>sum+Number(digit)*11**index,0);
    const low=String(converted).slice(-4), result=(BigInt(low)/2n).toString().padStart(4,'0');
    match(body,choices(body).map(candidate=>candidate===result));
    assert(body.explanation.includes(result));
  }
  for(const body of entries(3)) {
    const distance=Number(parts(body).match(/(\d+)ビット左/)?.[1]);
    assert(parts(body).includes('あふれが生じることはない'));
    const values=[-31,-1,0,1,7,49];
    const method=(value:number)=>Number((BigInt(value)<<BigInt(distance))+BigInt(value));
    match(body,integers(body).map(candidate=>values.every(value=>value*candidate===method(value))));
  }
  for(const body of entries(4)) {
    const stem=parts(body), targets=stem.match(/（−(\d+)）mod (\d+)/);
    assert(targets&&body.prompt.some(block=>block.type==='formula'&&block.alt.includes('0≦m＜p')));
    const [,digits,p]=targets, modulus=Number(p), target=Number(digits);
    let r=0;
    while((r+target)%modulus!==0) ++r;
    const fromExpression=(candidate:string)=>{
      const [value,base]=candidate.match(/\d+/g)!.map(Number);
      if(candidate.startsWith('−')) return -value%base;
      return candidate.includes('−')?base-value%base:value%base;
    };
    match(body,choices(body).map(candidate=>fromExpression(candidate)===r));
    assert(body.explanation.includes(String(r)));
  }
  for(const [i,body] of entries(5).entries()) {
    const radix=[2,10,8,16][i];
    if(i)assert(parts(body).includes(radix+'の補数'));
    const cap=radix**3;
    for(const b of [0,1,radix-1,cap-1])for(const a of [0,1,radix,cap-1]) {
      const want=a>=b?a-b:cap+a-b;
      const complement=cap-b;
      const production=(a+complement)%cap;
      assert.equal(production,want);
    }
    const operations=choices(body);
    assert.deepEqual(operations.map(option=>option.match(/^[加減乗除]算を[加減]算/)?.[0]),['加算を減算','減算を加算','乗算を加算','除算を減算']);
    match(body,operations.map(option=>option.startsWith('減算を加算')));
  }
});

test('問7・8の計算時間と4ビットかぎを、演算件数とビットごとの奇偶で照合する',()=>{
  for(const body of entries(7)) {
    const stem=parts(body), numbers=Array.from(stem.matchAll(/([\d,]+)(?=元|秒かかった|倍の演算速度)/g),m=>Number(m[1].replace(',','')));
    assert.equal(numbers.length,4);
    const [small,seconds,speed,large]=numbers, cycles=BigInt(large)**3n*BigInt(seconds);
    numeric(body,Number(cycles/(BigInt(small)**3n*BigInt(speed))));
  }
  const run=(...inputs: string[])=>Array.from({length:4},(_,i)=>String(inputs.filter(input=>input[i]==='1').length%2)).join('');
  for(const body of entries(8)) {
    const tokens=parts(body).match(/[01]{4}/g)!;
    const diagram=body.prompt.find(block=>block.type==='diagram')!;
    assert(diagram.type==='diagram');
    const shown=diagram.alt.match(/[01]{4}/g)!;
    assert.equal(shown.length,5);
    const [input,a,b,c,before]=shown, [namedInput,namedBefore,target]=tokens;
    assert.deepEqual([namedInput,namedBefore],[input,before]);
    assert.equal(run(input,a,b,c),before);
    assert.notEqual(before,target);
    for(const value of shown) assert(svg(diagram).includes('>'+value+'<'));
    match(body,choices(body).map(option=>run(input,a,option,c)===target));
  }
});

function evaluateNand(source: string, x: boolean, y: boolean) {
  const tokens=source.match(/NAND|[XY()]/g)!;
  let offset=0;
  function value(): boolean {
    const token=tokens[offset++];
    if(token==='X')return x;
    if(token==='Y')return y;
    assert.equal(token,'('); const result=expression();
    assert.equal(tokens[offset++],')'); return result;
  }
  function expression(): boolean {
    const left=value();
    if(tokens[offset]!=='NAND')return left;
    offset++;
    const right=value();
    return !(left&&right);
  }
  const result=expression();assert.equal(offset,tokens.length);return result;
}
const flags = [false,true];
const pairFlags=flags.flatMap(x=>flags.map(y=>[x,y] as const));

test('問9のNAND式を全4入力で実行し、問10の文字列は可能な境界位置を独立に全列挙する',()=>{
  const expected=[
    (x:boolean,y:boolean)=>x||y,(x:boolean,y:boolean)=>x&&y,
    (x:boolean,y:boolean)=>!x||y,(x:boolean,y:boolean)=>x||!y,
  ];
  for(const [i,body] of entries(9).entries()) {
    assert(parts(body).includes(['X OR Yを','X AND Yを','（NOT X）OR Yを','X OR（NOT Y）を'][i]));
    match(body,choices(body).map(option=>pairFlags.every(([x,y])=>evaluateNand(option,x,y)===expected[i](x,y))));
  }
  const glyph=(group:string,char:string)=>group==='A-Z'?char>='A'&&char<='Z':char>='0'&&char<='9';
  for(const body of entries(10)) {
    const stem=parts(body), pattern=stem.match(/\[(A-Z|0-9)\]([＋＊])\[(A-Z|0-9)\]([＋＊])/);
    assert(pattern&&stem.includes('0回以上')&&stem.includes('1回以上'));
    const [,left,a,right,b]=pattern;
    const follows=(word:string)=>Array.from({length:word.length+1},(_,split)=>split).some(split=>{
      if((a==='＋'&&split===0)||(b==='＋'&&split===word.length))return false;
      return [...word].every((c,j)=>glyph(j<split?left:right,c));
    });
    match(body,choices(body).map(follows));
  }
});

function evalTreeFormula(block: Block, k: number) {
  assert(block.type==='formula');
  const text=block.text;
  const first=text.match(/^n=k\(k\+1\)\+(\d+)$/);
  if(first)return k*(k+1)+Number(first[1]);
  const second=text.match(/^n=(\d+)\^k\+(\d+)$/);
  if(second)return Number(second[1])**k+Number(second[2]);
  if(text==='n=2^{k+1}-1')return 2**(k+1)-1;
  const third=text.match(/^n=\\frac\{(\d+)\^\{k\+1\}-1\}\{(\d+)\}$/);
  if(third)return (Number(third[1])**(k+1)-1)/Number(third[2]);
  const fourth=text.match(/^n=\(k-1\)\(k\+1\)\+(\d+)$/);
  assert(fourth);
  return (k-1)*(k+1)+Number(fourth[1]);
}

test('問12の木の模型と問15の再帰を、節点列挙と部分集合列挙で照合する',()=>{
  for(const body of entries(12)) {
    const branches=Number(parts(body).match(/(\d)分木/)?.[1]);
    const diagram=body.prompt.find(block=>block.type==='diagram')!;
    const counted=Array.from({length:7},(_,depth)=>{
      let frontier=['root'], count=1;
      for(let i=0;i<depth;i++) {
        frontier=frontier.flatMap(node=>Array.from({length:branches},(_,child)=>node+'.'+child));
        count+=frontier.length;
      }
      return count;
    });
    assert.equal((svg(diagram).match(/<circle/g)||[]).length,counted[2]);
    assert(body.choices.every(option=>evalTreeFormula(option[0],2)===counted[2]));
    match(body,body.choices.map(option=>counted.every((count,k)=>evalTreeFormula(option[0],k)===count)));
  }
  for(const body of entries(15)) {
    const digits=parts(body).match(/f\((\d)，(\d)\) の値/);
    assert(digits&&body.prompt.some(block=>block.type==='formula'&&block.alt.includes('k＝nなら1')));
    const [,n,k]=digits.map(Number);
    const masks=Array.from({length:2**n},(_,i)=>i.toString(2));
    numeric(body,masks.filter(seq=>[...seq].filter(c=>c==='1').length===k).length);
  }
});

test('問16の回路を実SVGのゲート列から読み、全16入力の真理値で全候補を照合する',()=>{
  for(const [i,body] of entries(16).entries()) {
    const requirements=['又は偶数個のとき出力が1','奇数個のとき出力が1','両方で1の入力数が1個ずつ','どちらでも1の入力数が0個又は2個'];
    assert(parts(body).includes(requirements[i]));
    const evaluate=(option: Block[], a: number,b: number)=>{
      const gates=Array.from(svg(option[0]).matchAll(/data-gate="([A-Z]+)"/g),m=>m[1]);
      assert.deepEqual(gates.slice(0,2),['XOR','XOR']);
      const u=a===1,v=b===1;
      const middle=({AND:u&&v,OR:u||v,XOR:u!==v} as Record<string,boolean>)[gates[2]];
      return gates[3]==='NOT'?!middle:middle;
    };
    const combos=Array.from({length:16},(_,input)=>input.toString(2).padStart(4,'0')).map(bits=>
      [Number(bits[0])+Number(bits[1]),Number(bits[2])+Number(bits[3])] as const);
    const desired=(a:number,b:number)=>[(a+b)%2===0,(a+b)%2===1,a===1&&b===1,a!==1&&b!==1][i];
    match(body,body.choices.map(option=>combos.every(([a,b])=>evaluate(option,a,b)===desired(a,b))));
  }
});

test('問18・19・22・23は、表の各値を使ってアドレス・処理能力・待ち時間・配置容量を独立に検算する',()=>{
  for(const body of entries(18)) {
    const rows=tableRows(body), indexed=new Map(rows.map(([name,value])=>[name,Number(value)]));
    const regs=indexed.get('インデックスレジスタの値')!, address=indexed.get('命令語のアドレス部の値')!;
    const moving=Array.from({length:regs},(_,value)=>value+1).at(-1)!;
    numeric(body,address+moving);
  }
  for(const body of entries(19)) {
    const frequency=Number(parts(body).match(/(\d+) MHz/)?.[1]), rows=tableRows(body);
    const trace=rows.flatMap(([,cycle,ratio])=>Array<number>(Number(ratio)).fill(Number(cycle)));
    assert.equal(trace.length,100);
    numeric(body,100*frequency/trace.reduce((sum,value)=>sum+value,0));
  }
  for(const body of entries(22)) {
    const data=Array.from(parts(body).matchAll(/([\d,]+)(?=回転|ミリ秒で| kバイト)/g),m=>Number(m[1].replaceAll(',','')));
    const [rpm,seek,track,block]=data;
    const micros=60_000_000/rpm;
    const meanWait=(micros*0.25+micros*0.75)/2;
    const transfer=Array.from({length:block},()=>micros/track).reduce((sum,t)=>sum+t);
    const expected=seek+(meanWait+transfer)/1000;
    numeric(body,expected);
  }
  for(const body of entries(23)) {
    const stem=parts(body), disk=tableRows(body).map(row=>Number(row[1]));
    const [tracks, sectors, capacity]=disk;
    const [width,tens,size]=Array.from(stem.matchAll(/(\d+)(?=バイトのレコード|万件|レコードを1ブロック)/g),m=>Number(m[1]));
    let cylinder=1, cursor=0;
    for(let record=0;record<tens*10000;record+=size) {
      let left=width*size;
      while(left>0) {
        if(cursor===tracks*sectors) { ++cylinder;cursor=0; }
        ++cursor;left-=capacity;
      }
    }
    assert(stem.includes('最後のセクタで余った部分は利用できない'));
    numeric(body,cylinder);
  }
});

test('問6・13・14・20・21・24〜26の四候補の命題を査読済みの事実と照合する',()=>{
  for(const [q,records] of knowledgeFacts) {
    const all=entries(q);
    for(const [i,{prompt,meaning,accepted}] of records.entries()) {
      const body=all[i];
      assert.match(parts(body),prompt);
      const options=choices(body);
      for(const [j,term] of meaning.entries())assert.match(options[j],term);
      match(body,meaning.map((_,j)=>accepted.includes(j)));
    }
  }
});

test('全図を描画登録と照合し、SVGに画像内のタイトル・説明・フォーカス可能な領域を保持する',()=>{
  assert.equal(figures.length,4);
  assert.deepEqual(renderers.map(item=>item.profile).sort(),figures.map(item=>item.profile).sort());
  for(const q of [8,12,16])for(const body of entries(q)) {
    const items=[...body.prompt,...body.choices.flat()].filter(item=>item.type==='diagram');
    for(const block of items) {
      assert.equal(block.scene.kind,'source_figure');
      const {profile,values}=block.scene, definition=figures.find(item=>item.profile===profile);
      assert(definition);
      assert.equal(block.alt,definition.alt(values));
      const markup=svg(block);
      for(const mark of ['<title','<desc','role="img"','aria-labelledby','aria-describedby','tabindex="0"'])assert(markup.includes(mark));
      assert(markup.includes(block.alt));
    }
  }
});
