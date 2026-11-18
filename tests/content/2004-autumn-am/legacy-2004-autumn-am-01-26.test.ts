import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2004AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2004-autumn-am-01-26';
import { legacy2004AutumnAm0126Figures as figures } from '../../../src/core/generators/legacy-2004-autumn-am-01-26-figures';
import { legacy2004AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2004AutumnAm0126Figures';
import { knowledgeFacts } from '../../fixtures/legacy-2004-autumn-am-01-26-facts';

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
const frac=(text:string)=>text.split('/').map(BigInt) as [bigint,bigint];
const toHex=(v:number)=>v.toString(16).toUpperCase();
function parseHex(value:string) {
  const [whole,decimal]=value.split('.');
  return parseInt(whole,16)*16**decimal.length+parseInt(decimal,16);
}

test('公式の正答と全24問の基準・全条件、4択、入力域、図の登録を照合する',()=>{
  const official='エイウエウアイウウウウウウイエアアアエエアエエウウウ';
  assert.deepEqual([...byNumber.keys()],Array.from({length:26},(_,i)=>i+1).filter(n=>n!==22&&n!==26));
  assert.deepEqual(renderers.map(item=>item.profile).sort(),figures.map(item=>item.profile).sort());
  const visible=new Set<string>();
  for(const [q,def] of byNumber){
    assert.equal(def.sourceAnswer,official[q-1]);
    assert.equal('アイウエ'[def.build([0]).correctIndex!],official[q-1]);
    const generated=entries(q);
    assert.equal(new Set(generated.map(body=>JSON.stringify(body.prompt))).size,4);
    assert(new Set(generated.map(body=>body.correctIndex)).size>1||def.answerVariation==='fixed');
    for(const [i,body] of generated.entries()) {
      assert.deepEqual(body,def.build([i]));
      assert.equal(new Set(choices(body)).size,4);
      assert(body.explanation.length>25);
      for(const block of [...body.prompt,...body.choices.flat()]){
        if(block.type!=='diagram'||block.scene.kind!=='source_figure')continue;
        const markup=svg(block);
        for(const marker of ['role="img"','<title','<desc','aria-labelledby','aria-describedby','tabindex="0"'])assert(markup.includes(marker));
        assert(markup.includes(block.alt));
        visible.add(block.scene.profile+'-'+block.scene.values.join('-'));
      }
    }
    for(const values of [[-1],[4],[0.5],[],[0,1],new Array(1)])assert.throws(()=>def.build(values),/査読済み入力域/);
  }
  assert.equal(visible.size,17);
});

test('問1〜3の分数・シフトとスタック・整数倍を、独立した桁表記で検算する',()=>{
  for(const body of entries(1)){
    const raw=stem(body).match(/小数0\.([\dA-F]{3})を/)?.[1];
    assert(raw);
    const numerator=[...raw].reverse().reduce((total,char,n)=>total+parseInt(char,16)*16**n,0);
    match(body,text=>{
      const [n,d]=frac(text);
      return n*4096n===BigInt(numerator)*d;
    });
  }
  for(const body of entries(2)){
    const q=stem(body).match(/(\d+)ビット.+?(\d+)回繰り返す/);
    assert(q);
    const [,bits,times]=q, count=+times, width=+bits;
    assert(width===count*4&&stem(body).includes('符号なし固定小数点'));
    const cases=[0,2**width-1,parseInt('8BCD1'.slice(0,count),16),...Array.from({length:width},(_,i)=>2**i)];
    match(body,text=>{
      const m=text.match(/n AND ([\dA-F]+)₁₆／(左|右)に4ビット/);
      assert(m);
      const mask=parseInt(m[1],16);
      assert.equal(m[1].length,count);
      return cases.every(value=>{
        let x=BigInt(value);
        const collected=[];
        for(let k=0;k<count;k++){
          collected.push(Number(x&BigInt(mask)));
          x=m[2]==='右'?x/16n:(x*16n)%BigInt(2**width);
        }
        const expected=[...toHex(value).padStart(count,'0')].reverse().map(digit=>parseInt(digit,16));
        return collected.join(',')===expected.join(',');
      });
    });
  }
  for(const body of entries(3)){
    const value=stem(body).match(/(0\.[A-F\d]{4})を(\d+)倍/);
    assert(value);
    match(body,text=>{
      const [,tail]=text.split('.');
      assert.equal(tail.length,4);
      let sum=0;
      for(let times=0;times<+value[2];times++)sum+=parseHex(value[1]);
      return parseHex(text)===sum;
    });
  }
});

test('問5〜7の事象、さいころ、正規分布を全結果と標準密度の積分で検算する',()=>{
  const count=(mask:number)=>[...mask.toString(2)].filter(char=>char==='1').length;
  const parser=(text:string,a:number,b:number,join:number,intersection:number)=>{
    const lookup={'P(A)':a,'P(B)':b,'P(A∪B)':join,'P(A∩B)':intersection} as Record<string,number>;
    const side=(expr:string)=>{
      if(expr==='1')return 1;
      const sum=expr.split('＋');
      if(sum.length>1)return sum.reduce((n,s)=>n+lookup[s],0);
      return expr.split('・').reduce((n,s)=>n*lookup[s],1);
    };
    const [left,right]=text.split('＝');
    return side(left)===side(right);
  };
  for(const body of entries(5)){
    const question=stem(body);
    const situations:Array<[number,number,number,number]>=[];
    for(let A=0;A<=15;A++)for(let B=0;B<=15;B++){
      const a=count(A)/4,b=count(B)/4, u=count(A|B)/4,c=count(A&B)/4;
      const valid=question.includes('独立')?c===a*b:question.includes('排反')?c===0:
        question.includes('含まれる')?(A&B)===A:(A^B)===15;
      if(valid)situations.push([a,b,u,c]);
    }
    assert(situations.length>8);
    match(body,choice=>situations.every(state=>parser(choice,...state)));
  }
  for(const [i,body] of entries(6).entries()){
    const range=stem(body).match(/出た目が(\d)～(\d)の場合/);
    assert(range&&stem(body).includes('1回'));
    if(i>0)assert(stem(body).includes('各面が等確率'));
    const scores=[1,2,3,4,5,6].map(face=>face>=+range[1]&&face<=+range[2]?face:0);
    const total=scores.reduce((a,b)=>a+b,0);
    match(body,text=>{
      const [n,d]=frac(text);
      return n*6n===BigInt(total)*d;
    });
  }
  const density=(x:number)=>Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI);
  function cdf(x:number){
    const count=2000, step=x/count;
    let sum=density(0)+density(x);
    for(let i=1;i<count;i++)sum+=(i%2===0?2:4)*density(i*step);
    return 0.5+sum*step/3;
  }
  for(const [index,body] of entries(7).entries()){
    const printed=grid(body), condition=stem(body).match(/標準偏差([\d.]+) mm.+?±([\d.]+) mm/);
    assert(condition&&stem(body).includes('最も近い値')&&stem(body).includes('平均0 mm'));
    assert.deepEqual(printed.columns,['確率変数','分布関数値','確率密度関数値']);
    if(index===0)assert.deepEqual(printed.rows,[
      ['0.00','0.5000','0.3938'],['0.50','0.6915','0.3521'],['1.00','0.8413','0.2420'],
      ['1.50','0.9332','0.1296'],['2.00','0.9773','0.0540'],['2.50','0.9938','0.0175'],
      ['3.00','0.9987','0.0044'],['3.50','0.9998','0.0009'],
    ]);
    else for(const [z,prob,pdf] of printed.rows){
      assert.equal(prob,cdf(+z).toFixed(4));assert.equal(pdf,density(+z).toFixed(4));
    }
    const z=+condition[2]/+condition[1], row=printed.rows.find(([x])=>Math.abs(+x-z)<1e-9);
    assert(row);
    const tail=2*(1-Number(row[1]))*100, ideal=2*(1-cdf(z))*100;
    const closest=(target:number)=>{
      const distances=choices(body).map(val=>Math.abs(+val-target));
      return Math.min(...distances);
    };
    match(body,choice=>Math.abs(Number(choice)-tail)===closest(tail));
    match(body,choice=>Math.abs(Number(choice)-ideal)===closest(ideal));
    assert(body.explanation.includes(tail.toFixed(2)+'％'));
  }
});

test('問8〜11はビット列全256通り、論理値全8通り、十桁候補、状態表の各経路で検算する',()=>{
  for(const body of entries(8)){
    const direction=stem(body).match(/(下位|上位)(\d)ビットを変化させずに/);
    assert(direction);
    match(body,text=>{
      const m=text.match(/16進数([\dA-F]+)と(排他的論理和|論理和)/);
      assert(m);
      const mask=parseInt(m[1],16).toString(2).padStart(8,'0');
      return Array.from({length:256},(_,i)=>i.toString(2).padStart(8,'0')).every(value=>
        [...value].every((digit,n)=>{
          const keeps=direction[1]==='下位'?n>=8-Number(direction[2]):n<Number(direction[2]);
          const goal=keeps?Number(digit):1-Number(digit);
          const result=m[2]==='論理和'?Math.max(Number(digit),Number(mask[n])):Number(digit!==mask[n]);
          return goal===result;
        }));
    });
  }
  function value(formula:string,state:Record<string,boolean>){
    const tokens=formula.match(/[XYZ]̄?|[・＋（）]/g)??[];
    let cursor=0;
    function term():boolean {
      const token=tokens[cursor++];
      if(token==='（'){const inner=or();assert.equal(tokens[cursor++],'）');return inner;}
      assert(token&&token[0] in state);
      return token.length>1?!state[token[0]]:state[token];
    }
    function and():boolean {
      let result=term();
      while(tokens[cursor]==='・'){cursor++;const next=term();result=result&&next;}
      return result;
    }
    function or():boolean {
      let result=and();
      while(tokens[cursor]==='＋'){cursor++;const next=and();result=result||next;}
      return result;
    }
    const result=or();
    assert.equal(cursor,tokens.length);
    return result;
  }
  for(const body of entries(9)){
    const target=stem(body).split('と等価な')[0];
    match(body,choice=>Array.from({length:8},(_,bits)=>({
      X:Boolean(bits&4),Y:Boolean(bits&2),Z:Boolean(bits&1),
    })).every(state=>value(target,state)===value(choice,state)));
  }
  for(const body of entries(10)){
    const m=stem(body).match(/N₂＝(\d)，N₃＝(\d)，N₄＝(\d)，C＝(\d)/);
    assert(m&&stem(body).includes('データにエラーが含まれていない'));
    const formula=body.prompt.find(block=>block.type==='formula');
    assert(formula?.alt.includes('N₁×1＋N₂×2＋N₃×3＋N₄×4'));
    const [,b,c,d,key]=m.map(Number);
    const eligible=Array.from({length:10},(_,i)=>i).filter(i=>{
      const digits=[i,b,c,d];
      const expand=digits.flatMap((digit,index)=>Array(index+1).fill(digit) as number[]);
      return expand.reduce((n,x)=>n+x,0).toString().endsWith(String(key));
    });
    assert.equal(eligible.length,1);
    num(body,eligible[0]);
  }
  for(const body of entries(11)){
    const table=grid(body), words=choices(body);
    assert(stem(body).includes('初期状態をa')&&stem(body).includes('文字列の入力中'));
    assert.deepEqual(table.columns,['現在の状態','空白','数字','符号','小数点','その他']);
    const route=new Map(table.rows.map(([state,...next])=>[state,next]));
    match(body,word=>{
      let next='a';
      for(const char of word) {
        const wanted=char==='△'?0:'0123456789'.includes(char)?1:'＋−'.includes(char)?2:char==='.'?3:4;
        next=route.get(next)![wanted];
        if(next==='e')return true;
      }
      return false;
    });
    assert(words.every(word=>word.length>=2));
  }
});

test('問12・14はSVGの節を移して中順走査し、表示した桁・法と配列で検算する',()=>{
  for(const body of entries(12)){
    const deletion=stem(body).match(/要素(\d+)を削除/)?.[1];
    assert(deletion);
    const rendering=svg(drawing(body,'tree'));
    const nodes=[...rendering.matchAll(/data-node="(\d+)" data-parent="(-?\d+)" data-left="(yes|no)"[\s\S]*?<text[^>]*>(\d+)<\/text>/g)]
      .map(([,key,parent,left,value])=>({key:+key,parent:+parent,left:left==='yes',value:+value}));
    assert.equal(nodes.length,15);
    const removed=nodes.find(node=>node.value===+deletion)!;
    match(body,choice=>{
      // 元位置の子は動かせないので、候補を除くと枝が孤立するかを検査する。
      const moved=nodes.find(node=>node.value===+choice)!;
      const after=nodes.filter(node=>node.key!==moved.key).map(node=>node.key===removed.key?{...node,value:moved.value}:node);
      if(after.some(node=>node.parent>=0&&!after.some(parent=>parent.key===node.parent)))return false;
      const traversed:number[]=[];
      function walk(key:number){
        const n=after.find(node=>node.key===key);
        if(!n)return;
        const [left,right]=[true,false].map(position=>after.find(child=>child.parent===key&&child.left===position));
        if(left)walk(left.key);
        traversed.push(n.value);
        if(right)walk(right.key);
      }
      walk(0);
      return traversed.length===14&&traversed.every((value,i)=>i===0||traversed[i-1]<value);
    });
  }
  for(const body of entries(14)){
    const matchNumber=stem(body).match(/場合，(\d{5})は次の配列/);
    const matchMod=stem(body).match(/mod\(x，(\d+)\)の値は/);
    assert(matchNumber&&matchMod);
    const [key,mod]=[matchNumber[1],+matchMod[1]] as const;
    let address=[...key].reduce((s,d)=>s+(d.charCodeAt(0)-48),0);
    while(address>=mod)address-=mod;
    const show=svg(drawing(body,'hash-array'));
    assert(show.includes('>'+String(mod-1)+'</text>'));
    num(body,address);
  }
});
type DecisionState={years:number;labour:number;bookkeeping:number;english:number;total:number;outcome:string};
test('問15の決定表の各規則を、全得点の整数境界と全選択肢の含意で検算する',()=>{
  for(const body of entries(15)) {
    const table=grid(body), conditions=table.rows.slice(0,3).map(([row])=>Number(row.match(/\d+$/)?.[0]));
    const [minYears,minTotal,minEnglish]=conditions;
    const buckets=Array.from({length:4},(_,rule)=>table.rows.findIndex((row,i)=>i>=3&&row[rule+1]==='X'));
    assert.deepEqual(buckets,[3,4,5,5]);
    const rulings=new Map<string,number>();
    const stems=choices(body);
    function predicates(option:string) {
      const [criteria,claim]=option.split('者は，');
      assert(claim,option);
      const parts=criteria.split('，').map(segment=>segment.replace(/で$/,''));
      const binding=parts.map(segment=>{
        if(segment.includes('業務経験年数'))return 'years';
        if(segment.includes('英語の得点'))return 'english';
        if(segment.includes('経理の得点'))return 'bookkeeping';
        if(segment.includes('労務管理の得点'))return 'labour';
        assert(segment.includes('合計得点'),segment);return 'total';
      });
      const compareKinds=parts.map(part=>part.includes('以上')?'ge':part.includes('未満')?'lt':'eq');
      const limits=parts.map(part=>Number(part.match(/\d+/)?.[0]));
      const succeeds=(facts:DecisionState)=>claim.startsWith('仮合格か合格')?facts.outcome!=='不合格':facts.outcome===claim.split('に')[0];
      return {
        qualifies:(facts:DecisionState)=>binding.every((key,i)=>compareKinds[i]==='ge'?facts[key]>=limits[i]:
          compareKinds[i]==='lt'?facts[key]<limits[i]:facts[key]===limits[i]),succeeds,
      };
    }
    const implications=stems.map(predicates);
    const refutations=stems.map(()=>false), preview=stems.map(()=>false);
    for(const years of [minYears-1,minYears])for(let bookkeeping=0;bookkeeping<=100;bookkeeping++){
      for(let english=0;english<=100;english++)for(let labour=0;labour<=100;labour++){
        const total=labour+bookkeeping+english;
        const values=[years>=minYears,total>=minTotal,english>=minEnglish];
        const key=values.map(Number).join('');
        let rule=rulings.get(key);
        if(rule===undefined){
          const satisfied=[0,1,2,3].filter(index=>values.every((yes,row)=>{
            const cell=table.rows[row][index+1];
            return cell==='―'||(cell==='Y')===yes;
          }));
          assert.equal(satisfied.length,1);
          rule=satisfied[0];
          rulings.set(key,rule);
        }
        const outcome=table.rows[buckets[rule]][0];
        const facts={years,labour,bookkeeping,english,total,outcome};
        for(const [i,{qualifies,succeeds}] of implications.entries())if(!refutations[i]&&qualifies(facts)){
          preview[i]=true;
          if(!succeeds(facts))refutations[i]=true;
        }
      }
    }
    assert(preview.every(Boolean));
    match(body,(_,i)=>!refutations[i]);
  }
});

test('問17・18・19・24は回路形状、二段の番地、平均クロックの単位とセクタ数を照合する',()=>{
  for(const body of entries(17)){
    const m=stem(body).match(/A＝([01])，B＝([01])，C＝([01])/);
    assert(m);
    const [a,b,c]=m.slice(1).map(Number), chain=svg(drawing(body,'logic-chain'));
    const gates=[...chain.matchAll(/data-logic-gate="(AND|OR|NOT)"/g)].map(([,type])=>type);
    assert.equal(gates.length,3);assert.equal(gates[2],'NOT');
    const truth=new Map([['AND','0001'],['OR','0111']]);
    const p=Number(truth.get(gates[0])![a*2+b]), q=Number(truth.get(gates[1])![p*2+c]);
    match(body,text=>text===[p,q,'10'[q]].join('／'));
    const legend=svg(drawing(body,'gate-legend'));
    assert(['AND','OR','NOT'].every(kind=>legend.includes('>'+kind+'</text>')));
  }
  for(const body of entries(18)){
    const art=drawing(body,'address');
    const m=art.alt.match(/値(\d+)から主記憶の(\d+)番地を指す。(\d+)番地の内容は(\d+)。.+?(\d+)番地を指し/);
    assert(m);
    assert.equal(m[1],m[2]);assert.equal(m[2],m[3]);assert.equal(m[4],m[5]);assert.notEqual(m[1],m[4]);
    const rendered=svg(art);
    assert.equal((rendered.match(/marker-end/g)??[]).length,2);
    assert(rendered.includes('>命令部</text>')&&rendered.includes('>データ</text>'));
    match(body,text=>text==='間接アドレス指定');
    assert(body.explanation.includes(m[1])&&body.explanation.includes(m[4]));
  }
  for(const body of entries(19)){
    const m=stem(body).match(/([\d.]+) GHz.+?平均([\d.]+)クロック.+?1秒間に約何万命令/);
    assert(m);
    const [,GHz,CPI]=m;
    const cpiTen=10n**BigInt(CPI.split('.')[1]?.length??0), clockTen=10n**BigInt(GHz.split('.')[1]?.length??0);
    const cycles=BigInt(GHz.replace('.',''))*1000000000n/clockTen;
    const instructionCost=BigInt(CPI.replace('.',''));
    const result=cycles*cpiTen/instructionCost;
    assert.equal(result*instructionCost,cycles*cpiTen);
    num(body,Number(result/10000n));
  }
  for(const body of entries(24)){
    const m=stem(body).match(/1セクタが(\d+)バイト.+?(\d+)ビット/);
    assert(m&&stem(body).includes('512×2²¹を1 Gバイト'));
    const physical=(1n<<BigInt(m[2]))*BigInt(m[1]);
    const one=1n<<30n;
    match(body,text=>BigInt(text.replaceAll(',',''))*one===physical);
    assert(body.explanation.replaceAll(',','').includes(String(physical/one)));
  }
});

test('知識選択7問の四条件は、固定資料で問いの焦点と全選択肢の意味を別に評価する',()=>{
  for(const [q,facts] of Object.entries(knowledgeFacts))for(const [i,body] of entries(+q).entries()){
    const {focus,candidates}=facts[i];
    assert(stem(body).includes(focus),stem(body));
    match(body,(phrase,position)=>{
      const [semantic,valid]=candidates[position];
      assert(phrase.includes(semantic),phrase);
      return valid;
    });
  }
});
