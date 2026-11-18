import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005SpringAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2005-spring-am-01-26';
import { legacy2005SpringAm0126Figures as figures } from '../../../src/core/generators/legacy-2005-spring-am-01-26-figures';
import { legacy2005SpringAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2005SpringAm0126Figures';
import { knowledgeFacts } from '../../fixtures/legacy-2005-spring-am-01-26-facts';

const variants=[0,1,2,3], entries=(q:number)=>variants.map(i=>definitions[q-1].build([i]));
const stem=(body:GeneratedBody)=>body.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join(' ');
function choiceText(blocks:Block[]) {
  return blocks.map(block=>{
    if(block.type==='paragraph')return block.text;
    if(block.type==='diagram'||block.type==='formula')return block.alt;
    if(block.type==='table')return block.rows[0].join('／');
    throw Error('未対応の選択肢ブロック');
  }).join(' ');
}
const choices=(body:GeneratedBody)=>body.choices.map(choiceText);
const numbers=(body:GeneratedBody)=>choices(body).map(x=>Number(x.replaceAll(',','')));
function matches(body:GeneratedBody,checks:boolean[]) {
  assert.equal(checks.length,4);
  assert.deepEqual(checks.flatMap((ok,index)=>ok?[index]:[]),[body.correctIndex]);
}
function numeric(body:GeneratedBody,expected:number) {
  matches(body,numbers(body).map(value=>Math.abs(value-expected)<1e-8));
  assert(body.explanation.replaceAll(',','').includes(String(expected)));
}
function diagram(body:GeneratedBody,index=0) {
  const drawing=body.prompt.filter(block=>block.type==='diagram')[index];
  assert(drawing);
  return drawing;
}
function svg(block:Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene, renderer=renderers.find(item=>item.profile===profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
}
function stringsOf(width:number) {
  return Array.from({length:2**width},(_,i)=>i.toString(2).padStart(width,'0'));
}
test('公式解答26問、基準入力、各4条件、入力制約、四択とSVG契約を照合する',()=>{
  const official='エイウエイイエアアイウイアエイウイウエウエイイウイエ';
  assert.equal(definitions.length,26);
  assert.deepEqual(renderers.map(item=>item.profile).sort(),figures.map(item=>item.profile).sort());
  for(const [offset,definition] of definitions.entries()) {
    assert.equal(definition.source,'2005h17h-fe-am-'+(offset+1));
    assert.equal(definition.sourceAnswer,official[offset]);
    assert.equal('アイウエ'[definition.build([0]).correctIndex!],official[offset]);
    const generated=entries(offset+1);
    assert.equal(new Set(generated.map(body=>JSON.stringify(body.prompt))).size,4);
    assert(new Set(generated.map(body=>body.correctIndex)).size>1||definition.answerVariation==='fixed');
    for(const [index,body] of generated.entries()) {
      assert.deepEqual(body,definition.build([index]));
      assert.equal(new Set(choices(body)).size,4);
      assert(body.explanation.length>25);
      for(const block of [...body.prompt,...body.choices.flat()]) {
        if(block.type!=='diagram')continue;
        const drawing=svg(block);
        for(const attribute of ['role="img"','<title','<desc','aria-labelledby','aria-describedby','tabindex="0"'])assert(drawing.includes(attribute));
        assert(drawing.includes(block.alt));
      }
    }
    for(const values of [[-1],[4],[0.5],[],[1,2],new Array(1)])assert.throws(()=>definition.build(values),/査読済み入力域/);
  }
});
test('問1〜3は表示された代入式・桁列・補数を、標準基数変換とビットレジスタで検算する',()=>{
  for(const body of entries(1)) {
    const match=stem(body).match(/0＜j＜(\d+)）を(\d+)進数.+?(\w+)\(1\)から\w+\((\d+)\)/);
    assert(match);
    const [,upper,base,array,slots]=match, r=Number(base), size=Number(slots);
    assert(diagram(body).alt.includes('k：1，1，'+size));
    assert(svg(diagram(body)).includes('初期値，増分，終値'));
    matches(body,choices(body).map(pair=>{
      const instructions=pair.split('／').map(line=>line.match(/^j (div|mod) (\d+) → (.+)$/));
      assert(instructions.every(Boolean));
      return Array.from({length:Number(upper)-1},(_,i)=>i+1).every(value=>{
        let j=value;
        const result:string[]=[];
        for(let k=0;k<size;k++)for(const instruction of instructions) {
          const [,operation,operand,target]=instruction!;
          assert.equal(Number(operand),r);
          const data=operation==='div'?Math.trunc(j/r):j%r;
          if(target==='j')j=data;
          else { assert.equal(target,array+'(k)'); result[k]=String(data); }
        }
        return result.reverse().join('')===value.toString(r).padStart(size,'0');
      });
    }));
  }
  for(const body of entries(2)) {
    const fragment=stem(body).match(/xを(\d+)進数で表現すると，(\d)と0が/);
    assert(fragment);
    const [,basis,digit]=fragment, base=BigInt(basis);
    const inputs=[1,2,3,7,12];
    matches(body,choices(body).map(choice=>inputs.every(n=>{
      const only=choice.match(/^x＋x\/(\d+)＝(?:(\d+)×\()?\d+\^\((2n(?:＋1)?)\)(−1)?(?:\)\/(\d+))?$/);
      assert(only,choice);
      const [,divisor,multiplier,exponent,minus,denominator]=only, d=BigInt(denominator??1);
      const x=BigInt(parseInt((digit+'0').repeat(Math.min(n,3)),+basis));
      const built=n<=3?x:Array.from({length:2*n},(_,index)=>index%2?'0':digit)
        .reduce((sum,next)=>sum*base+BigInt(next),0n);
      const left=built+built/BigInt(divisor);
      return left*d===BigInt(multiplier??1)*(base**BigInt(2*n+(exponent.includes('＋')?1:0))-BigInt(Boolean(minus)));
    })));
  }
  for(const body of entries(3)) {
    const m=stem(body).match(/補数で表す(\d+)ビット.+?する(と−\d+)/);
    assert(m);
    const width=Number(m[1]), negative=-Number(m[2].slice(2));
    const representation=stringsOf(width).find(bits=>
      [...bits].reduce((sum,bit,index)=>sum+(index===0?-1:1)*Number(bit)*2**(width-index-1),0)===negative);
    assert(representation);
    numeric(body,parseInt(representation,2));
  }
});
test('問6〜8は全コイン列、実SVGの遷移確率、三集合の全所属パターンで検算する',()=>{
  for(const [i,body] of entries(6).entries()) {
    const m=stem(body).match(/(\d+)回投げたときに，表が(\d+)回/);
    assert(m);
    if(i)assert(stem(body).includes('等確率')&&stem(body).includes('独立'));
    const outcomes=stringsOf(+m[1]);
    numeric(body,outcomes.filter(bits=>[...bits].filter(bit=>bit==='1').length===+m[2]).length/outcomes.length);
  }
  for(const body of entries(7)) {
    const m=stem(body).match(/天気が(晴れ|曇り|雨)のとき，2日後の天気が(晴れ|曇り|雨)に/);
    assert(m);
    const [,from,to]=m, view=svg(diagram(body)), labels=['晴れ','雨','曇り'];
    const rates=new Map([...view.matchAll(/data-weather-from="([^"]+)" data-weather-to="([^"]+)"[\s\S]*?<text[^>]*>([\d.]+)<\/text>/g)]
      .map(([,a,b,rate])=>[a+'→'+b,Math.round(+rate*10)]));
    assert.equal(rates.size,9);
    const tickets=(row:string)=>labels.flatMap(state=>Array.from({length:rates.get(row+'→'+state)!},()=>state));
    const outcomes=tickets(from).flatMap(tickets);
    assert.equal(outcomes.length,100);
    assert(labels.every(row=>tickets(row).length===10));
    numeric(body,outcomes.filter(last=>last===to).length/100);
  }
  const evaluate=(expression:string,assigned:Record<string,boolean>)=>{
    const tokens=[...expression.replaceAll('（','(').replaceAll('）',')')];
    let at=0;
    function unary():boolean {
      const token=tokens[at++];
      if(token==='(') {const nested=read();assert.equal(tokens[at++],')');return nested;}
      assert(token in assigned);return assigned[token];
    }
    function read():boolean {
      let result=unary();
      while(tokens[at]&&tokens[at]!==')') {
        const op=tokens[at++], next=unary();
        result=op==='∪'?result||next:op==='∩'?result&&next:result&&!next;
      }
      return result;
    }
    const value=read();assert.equal(at,tokens.length);return value;
  };
  for(const body of entries(8)) {
    const goal=stem(body).match(/集合(.+?)に等しい/)?.[1];
    assert(goal);
    matches(body,choices(body).map(option=>stringsOf(3).every(([a,b,c])=>{
      const membership={S:a==='1',T:b==='1',R:c==='1'};
      return evaluate(option,membership)===evaluate(goal,membership);
    })));
  }
});
test('問9〜12の論理演算、パリティ、受理言語、木の探索順を全候補で照合する',()=>{
  const allBytes=stringsOf(8);
  for(const body of entries(9)) {
    const required=stem(body).match(/(下位|上位)(\d)ビット/);
    assert(required);
    const width=+required[2], inspect=(x:string)=>required[1]==='下位'?x.slice(-width):x.slice(0,width);
    matches(body,choices(body).map(option=>{
      const variant=option.match(/表記([\dA-F]{2}).+との(.+)をとる/);
      assert(variant);
      const mask=parseInt(variant[1],16).toString(2).padStart(8,'0');
      return allBytes.every(bits=>{
        const out=[...bits].map((bit,index)=>{
          const pair=[bit,mask[index]].join('');
          if(variant[2]==='論理積')return pair==='11'?'1':'0';
          if(variant[2]==='論理和')return pair==='00'?'0':'1';
          if(variant[2]==='排他的論理和')return pair==='10'||pair==='01'?'1':'0';
          assert.equal(variant[2],'否定論理積');return pair==='11'?'0':'1';
        }).join('');
        return inspect(out)===inspect(bits);
      });
    }));
  }
  for(const body of entries(10)) {
    const input=stem(body).match(/(偶数|奇数)パリティビット.+?コード([\dA-F]{2})，([\dA-F]{2})，([\dA-F]{2})に/);
    assert(input);
    const [,parity,...codes]=input, odd=parity==='奇数';
    const enc=(n:string)=>parseInt(n,16).toString(2).padStart(8,'0');
    matches(body,choices(body).map(option=>option.split('，').every((value,index)=>{
      const word=enc(value);
      return word.slice(1)===enc(codes[index]).slice(1)&&(([...word].filter(bit=>bit==='1').length%2===1)===odd);
    })));
  }
  for(const body of entries(11)) {
    const m=stem(body).match(/図は([01])の数が(偶数|奇数)個/);
    assert(m);
    const [,digit,desired]=m, graph=diagram(body).alt;
    assert(graph.includes('初期状態は偶')&&graph.includes('受理状態は'+desired[0]));
    const transition=new Map([...graph.matchAll(/(偶|奇)→(偶|奇)は([01ab])/g)].map(([,a,b,x])=>[a+'→'+x,b]));
    assert.equal(transition.size,4);
    const accepted=Array.from({length:8},(_,length)=>length?stringsOf(length):['']).flat();
    matches(body,choices(body).map(option=>{
      const [a,b]=option.split('／');
      return accepted.every(bits=>{
        let state='偶';
        for(const input of bits) {
          const label=state==='偶'?input:input===a?'a':input===b?'b':'';
          if(state==='奇'&&a===b&&input===a)return false;
          state=transition.get(state+'→'+label)??'不成立';
        }
        return (state===desired[0])===([...bits].filter(bit=>bit===digit).length%2===(desired==='奇数'?1:0));
      });
    }));
  }
  for(const body of entries(12)) {
    matches(body,body.choices.map(([block])=>{
      const drawing=svg(block), nodes=[...drawing.matchAll(/data-tree-node="(\d+)" data-tree-parent="(-?\d+)"[\s\S]*?<text[^>]*>(\d+)<\/text>/g)]
        .map(([,node,parent,n])=>({node:+node,parent:+parent,n:+n}));
      assert.equal(nodes.length,9);
      assert.equal(new Set(nodes.map(node=>node.n)).size,9);
      const walk=(node:number):number[]=>{
        const children=nodes.filter(child=>child.parent===node);
        assert(children.length===0||children.length===2);
        return children.length===0?[nodes[node].n]:[...walk(children[0].node),nodes[node].n,...walk(children[1].node)];
      };
      const visit=walk(0);
      return visit.every((value,i)=>i===0||visit[i-1]<value);
    }));
  }
});
test('問13・15・17・18は末尾からの追跡、比較回数の列挙、回路の真理値、命令100個で検算する',()=>{
  for(const body of entries(13)) {
    const required=Number(stem(body).match(/(\d)番目のPUSH/)?.[1]);
    const steps=diagram(body,0).alt.replace('。','').split('→');
    const n=steps.filter(step=>step==='PUSH').length, values=diagram(body,1).alt.match(/上から([\d、]+)/)?.[1].split('、').map(Number);
    assert(values);
    let order=n, pending=0;
    const survivors:number[]=[];
    for(const step of [...steps].reverse()) {
      if(step==='POP')++pending;
      else {
        if(pending)--pending;
        else survivors.push(order);
        --order;
      }
    }
    numeric(body,values[survivors.indexOf(required)]);
  }
  for(const body of entries(15)) {
    const multiplier=Number(stem(body).match(/が(\d+)倍/)?.[1]);
    function longest(size:number):number {
      return size<1?0:1+longest(size-Math.floor((size-1)/2)-1);
    }
    matches(body,choices(body).map(candidate=>Array.from({length:1000},(_,i)=>i+1).every(n=>
      candidate.startsWith('約')?Math.abs(longest(n*multiplier)/longest(n)-Number(candidate.match(/\d+/)?.[0]))<0.2:
        longest(n*multiplier)-longest(n)===Number(candidate.match(/\d+/)?.[0]))));
  }
  for(const body of entries(17)) {
    const vector=(block:Block)=>stringsOf(2).map(([a,b])=>{
      assert(block.type==='diagram');
      const formula=block.alt.match(/出力X＝(.+)。/)?.[1];
      assert(formula);
      let expression=formula.replaceAll('A',a).replaceAll('B',b).replaceAll('0ND','AND').replaceAll('1ND','AND');
      const view=svg(block);
      assert.equal((view.match(/data-gate="/g)??[]).length,(formula.match(/AND|OR|NOT/g)??[]).length);
      assert(view.includes('>A</text>')&&view.includes('>B</text>'));
      while(expression.length>1) {
        const pruned=expression.replace(/NOT\(([01])\)|(?:AND|OR)\([01],[01]\)/g,token=>{
          if(token.startsWith('NOT'))return token[4]==='0'?'1':'0';
          const [x,y]=token.match(/[01]/g)!;
          return token.startsWith('AND')?String(Math.min(+x,+y)):String(Math.max(+x,+y));
        });
        assert.notEqual(pruned,expression);expression=pruned;
      }
      return expression;
    }).join('');
    const target=vector(diagram(body,1));
    matches(body,body.choices.map(([block])=>vector(block)===target));
  }
  for(const body of entries(18)) {
    const clock=Number(stem(body).match(/([\d.]+) GHz/)?.[1]);
    const grid=body.prompt.find(block=>block.type==='table');
    assert(grid);
    const run=grid.rows.flatMap(([,cycles,share])=>Array.from({length:+share},()=>+cycles));
    assert.equal(run.length,100);
    numeric(body,Math.round(1e5*clock/run.reduce((sum,value)=>sum+value,0)));
    assert(body.explanation.includes('CPI'));
  }
});
test('問22、23、25、26は物理量、ヘッドの逐次移動、画素数と入出力の配線から検算する',()=>{
  for(const body of entries(22)) {
    const match=stem(body).match(/([\d,]+)回転／分.+?時間が(\d+)ミリ秒.+?容量は，([\d,]+)バイト.+?が([\d,]+)バイト/);
    assert(match);
    const [,rpm,seek,capacity,b]=match.map(token=>+token.replaceAll(',',''));
    const bytePerSecond=capacity*rpm/60, transfer=1000*b/bytePerSecond;
    const wait=1000*(capacity/2)/bytePerSecond;
    numeric(body,seek+wait+transfer);
  }
  for(const body of entries(23)) {
    const line=stem(body), m=line.match(/シリンダ番号(\d+)にあり.+?シリンダ番号([\d，]+)が/);
    assert(m);
    assert(line.includes('現在の方向に要求がないとき')&&line.includes('処理中に新たな要求は発生しない'));
    let head=+m[1], dir=line.includes('増加する方向')?1:-1, distance=0;
    const pending=new Set(m[2].split('，').map(Number));
    while(pending.size) {
      let next:number|undefined;
      for(const cylinder of pending)if((cylinder-head)*dir>=0&&(next===undefined||Math.abs(cylinder-head)<Math.abs(next-head)))next=cylinder;
      if(next===undefined){dir*=-1;continue;}
      distance+=Math.abs(next-head);head=next;pending.delete(next);
    }
    numeric(body,distance);
  }
  for(const body of entries(25)) {
    const values=stem(body).match(/横([\d.]+)cm，縦([\d.]+)cm.+?解像度(\d+)dpi，(\d+)ビット/);
    assert(values&&stem(body).includes('1インチは2.54cm'));
    const [,w,h,dpi,bits]=values.map(Number);
    const millionbits=Math.round(w*100*dpi/254)*Math.round(h*100*dpi/254)*bits;
    numeric(body,millionbits/8e6);
  }
  for(const body of entries(26)) {
    const alt=diagram(body).alt, select=alt.match(/入力装置→([abc])、([abc])→出力装置.+?制御（破線）は([abc])→入力装置/);
    assert(select);
    const [,memory,same,control]=select, remaining=[...'abc'].find(letter=>letter!==memory&&letter!==control)!;
    assert.equal(memory,same);
    assert(alt.includes(memory+'→'+remaining)&&alt.includes(remaining+'→'+memory));
    const roles=new Map([[memory,'記憶装置'],[control,'制御装置'],[remaining,'演算装置']]);
    matches(body,choices(body).map(choice=>choice.split('／').every((role,index)=>role===roles.get('abc'[index]))));
    assert(svg(diagram(body)).includes('stroke-dasharray')&&svg(diagram(body)).includes('データの流れ'));
  }
});
test('知識選択8問の4条件について、固定査読資料で問いの焦点と全選択肢の意味を照合する',()=>{
  for(const [key,facts] of Object.entries(knowledgeFacts))for(const [i,body] of entries(+key).entries()) {
    const {focus,options}=facts[i];
    assert(stem(body).includes(focus),stem(body));
    matches(body,choices(body).map((choice,index)=>{
      const [phrase,truth]=options[index];
      assert(choice.includes(phrase),choice);
      return truth;
    }));
  }
});
