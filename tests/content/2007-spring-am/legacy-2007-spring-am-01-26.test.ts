import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import { validateFormula } from '../../../src/core/validation';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007SpringAm01To26Definitions } from '../../../src/core/generators/legacy-2007-spring-am-01-26';
import { legacy2007SpringAm0126Figures } from '../../../src/core/generators/legacy-2007-spring-am-01-26-figures';
import { legacy2007SpringAm0126FigureRenderers } from '../../../src/ui/Legacy2007SpringAm0126Figures';
import source from '../../../src/core/generators/legacy-2007-spring-am-01-26-source.json';
import { concepts, officialAnswers, paperPages } from '../../fixtures/legacy-2007-spring-am-01-26-facts';

const conditions = [0,1,2,3];
const definition = (number: number) => legacy2007SpringAm01To26Definitions.find(def => def.source === '2007h19h-fe-am-' + number)!;
const build = (number: number, index: number) => definition(number).build([index]);
const text = (blocks: readonly Block[]) => blocks.flatMap(b => b.type === 'formula' ? [b.alt] : 'text' in b ? [b.text] : []).join('\n');
const prompt = (body: GeneratedBody) => text(body.prompt);
const choices = (body: GeneratedBody) => body.choices.map(text);
const diagram = (blocks: readonly Block[]) => {
  const figure = blocks.find(b => b.type === 'diagram'); assert(figure); return figure;
};
const table = (body: GeneratedBody) => {
  const table = body.prompt.find(b => b.type === 'table'); assert(table); return table;
};
const number = (value: string) => Number(value.replaceAll(',', ''));
function unique(body: GeneratedBody, verify: (option: Block[], index: number) => boolean) {
  assert.deepEqual(body.choices.flatMap((option, i) => verify(option, i) ? [i] : []), [body.correctIndex]);
}

test('原紙面と採用25問について、4条件・択群・正答・入出力域・数式を検査する', () => {
  assert.equal(legacy2007SpringAm01To26Definitions.length, 25);
  assert.equal(definition(11), undefined);
  for (const row of source) {
    const def = definition(row.number);
    assert(def);
    assert.equal(def.sourceAnswer, officialAnswers[row.number - 1]);
    assert.equal(row.printedPage, paperPages[row.number - 1]);
    const bodies = conditions.map(i => def.build([i]));
    assert.equal('アイウエ'[bodies[0].correctIndex!], row.sourceKey, String(row.number));
    const shape = (body: GeneratedBody) => [body.prompt.map(b => b.type), body.choices.map(c => c.map(b => b.type))];
    for (const body of bodies) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(c => JSON.stringify(c))).size, 4);
      assert.deepEqual(shape(body), shape(bodies[0]));
      assert(body.explanation.trim());
      for (const block of [...body.prompt,...body.choices.flat()]) if (block.type === 'formula') validateFormula(block.text);
    }
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4, String(row.number));
    for (const invalid of [[], [-1], [4], [0.5], [0,1], Array<number>(1)]) assert.throws(() => def.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
});

test('問1〜3は分数の交差積・けた数の傾き・符号ビットを使う参照方式を比較する', () => {
  for (const i of conditions) {
    const radix = build(1,i), digits = prompt(radix).match(/小数([\dA-F]{2})\.([\dA-F]{2})/)!.slice(1).join('');
    const expected = [...digits].reduce((n,d) => 16*n+'0123456789ABCDEF'.indexOf(d), 0);
    unique(radix, option => {
      const [n,d] = text(option).split('/').map(Number);
      return n*256 === expected*d;
    });
    const lengths = build(2,i), [a,b] = prompt(lengths).match(/(\d+)進表示のけた数Dと(\d+)進/)!.slice(1).map(Number);
    unique(lengths, option => {
      const mat = text(option).match(/(\d+|B) log_(\d+) (B|\d+)/)!;
      const calc = (v:number) => (mat[1]==='B'?v:Number(mat[1])) *
        Math.log(mat[3]==='B'?v:Number(mat[3])) / Math.log(Number(mat[2]));
      return [4,16,32,100,300].every(v => {
        const target = (BigInt(b)**BigInt(v)-1n).toString(a).length;
        return Math.abs(calc(v)-target)<=1;
      });
    });
    const limit = build(3,i), mult = Number(prompt(limit).match(/(\d+)倍/)![1]);
    unique(limit, option => {
      const unsigned = Number.parseInt(text(option),16), bits = unsigned.toString(2).padStart(16,'0');
      const sign = bits[0] === '1' ? -32768 : 0;
      const actual = sign + Number.parseInt(bits.slice(1),2);
      return actual * mult > 32767 || actual * mult < -32768;
    });
  }
});

test('問5〜7は閾値の枚挙、代入から導く定常式、全文字列の数え上げで検算する', () => {
  for (const i of conditions) {
    const average = build(5,i), p = prompt(average);
    const unit = Number(p.match(/近い(\d+)の倍数/)?.[1] ?? 1);
    unique(average, (option,j) => {
      const value = text(option);
      assert(value.includes('N'));
      const floor = Math.floor;
      const calculate = (s:number,n:number) => [
        unit*floor((s + unit/2)/(n*unit)), unit*(floor((s-unit)/(n*unit))+1),
        unit*floor(s/(n*unit)+0.5), unit*(floor(s/(n*unit))+1),
      ][j];
      return Array.from({length:1500}, (_,k)=>(k+1)/2).every(s => [2,3,4,5].every(n => {
        const lower = s - s % (n*unit), upper = lower + n*unit;
        const close = (s-lower < upper-s ? lower : upper) / n;
        return calculate(s,n)===close;
      }));
    });
    const recursive = build(6,i), substitution = prompt(recursive).match(/④ x←(.+)\n/)![1];
    unique(recursive, option => {
      const assertion = text(option);
      return assertion === 'f(' + substitution + ')＝y';
    });
    const words = build(7,i), w = prompt(words);
    const [alphabet,max] = [Number(w.match(/の(\d+)種類/)![1]),Number(w.match(/以上(\d+)以下/)![1])];
    const forbidden = w.match(/先頭は([A-Z，]+)/)![1].split('，').map(ch => ch.charCodeAt(0)-65);
    let count = 0;
    function visit(prefix: number[]) {
      if (prefix.length) count++;
      if (prefix.length === max) return;
      for (let v=0;v<alphabet;v++) if (prefix.length || !forbidden.includes(v)) visit([...prefix,v]);
    }
    visit([]);
    unique(words, option => number(text(option))===count);
  }
});

test('問8は標準正規密度を数値積分し、表の丸めと選択値の単位を独立に照合する', () => {
  const tail = (u: number) => {
    let sum=0; const step=0.0005;
    for(let x=u+step/2;x<9;x+=step) sum+=Math.exp(-x*x/2)/Math.sqrt(2*Math.PI)*step;
    return sum;
  };
  for (const i of conditions) {
    const body=build(8,i), p=prompt(body);
    const [mean,sigma,cut]=Array.from(p.matchAll(/([\d.]+) kg/g), m=>Number(m[1]));
    const probability=tail((mean-cut)/sigma)*100;
    unique(body, option => Math.abs(number(text(option))-probability)<0.06);
    for (const [z,prob] of table(body).rows) assert.equal(tail(number(z)).toFixed(3),prob);
    assert.match(diagram(body.prompt).alt,/右側.*網掛け/);
  }
});

test('問9・10・17は二入力の全真理値とレジスタの全ビット列を評価する', () => {
  const pairs = [[false,false],[false,true],[true,false],[true,true]] as const;
  for (const i of conditions) {
    const bool=build(9,i), statement=prompt(bool);
    const branches=[...statement.matchAll(/A = (True|False) AND B = (True|False)/g)].map(m=>[m[1]==='True',m[2]==='True']);
    unique(bool, option => {
      const [,,op,value]=text(option).match(/\((A) (AND|OR|XOR) B\) = (True|False)/)!;
      return pairs.every(([a,b]) => {
        const expected=branches.some(([x,y])=>x===a&&y===b);
        const actual=op==='AND' ? a&&b : op==='OR' ? a||b : a!==b;
        return (actual===(value==='True'))===expected;
      });
    });
    const parity=build(10,i), p=prompt(parity), size=Number(p.match(/(\d+)ビット/)![1]), odd=Number(p.includes('奇数パリティ'));
    unique(parity, option => {
      const [left,right]=text(option).split('＝');
      return Array.from({length:2**size},(_,j)=>j).every(k => {
        const sum=[...k.toString(2)].filter(d=>d==='1').length;
        const dataBit=sum%2, parityBit=(sum+odd)%2;
        const a=(dataBit+Number(left.startsWith('1⊕'))+(left.endsWith('⊕p')?parityBit:0))%2;
        return a === (right==='p'?parityBit:Number(right));
      });
    });
    const gate=build(17,i), gp=prompt(gate), emitOne=gp.includes('が1になる');
    unique(gate, option => pairs.every(([a,b]) => {
      const expectedTrigger=gp.includes('ともに1') ? a&&b : gp.includes('ともに0') ? !a&&!b : a!==b;
      const type=text(option).split(' ')[0];
      const signal=type==='AND'?a&&b:type==='NAND'?!(a&&b):type==='OR'?a||b:a!==b;
      return signal === (expectedTrigger ? emitOne : !emitOne);
    }));
  }
});

type Tree = { key:number; left?: Tree; right?: Tree };
function readTree(blocks: readonly Block[]): Tree {
  const tokens=diagram(blocks).alt.split('。')[0].match(/\d+|なし|[（）：、]/g)!;
  let at=1;
  function parse(): Tree|undefined {
    const value=tokens[at++];
    if (value==='なし') return undefined;
    const node:Tree={key:Number(value)};
    if (tokens[at]==='（') {at+=2; node.left=parse(); at+=2; node.right=parse(); at++;}
    return node;
  }
  // Labels are dropped by the tokenizer, leaving opening bracket and colon.
  return parse()!;
}
test('問12・13・14は木の探索、流れ図の各分岐、隣接比較の全小入力で照合する', () => {
  for (const i of conditions) {
    const tree=build(12,i), location=Number(prompt(tree).match(/に(\d+)を追加/)![1]), expected=readTree(tree.prompt);
    let current=expected;
    while(true) {
      const direction=location<current.key?'left':'right';
      if(!current[direction]) { current[direction]={key:location}; break; }
      current=current[direction]!;
    }
    const serialize=(node:Tree|undefined):unknown=>node?[node.key,serialize(node.left),serialize(node.right)]:null;
    unique(tree, option=>JSON.stringify(serialize(readTree(option)))===JSON.stringify(serialize(expected)));

    const match=build(13,i), m=prompt(match);
    const [input,needle]=Array.from(m.matchAll(/“([a-z]+)△”/g), part=>part[1]);
    const base=Number(m.match(/先頭の文字を(\d)番目/)![1]), original=diagram(match.prompt).alt;
    assert(original.includes(needle.length+'→jmax'));
    let a=0,b=0;
    for(let step=0;step<=input.length*needle.length;step++) {
      if(input[a]===needle[b]) {a++;b++;}
      else {a=a-b+1;b=0;}
      if(b===needle.length||a===input.length) break;
    }
    const result=b===needle.length ? a+base-needle.length : 0;
    assert.equal(result,input.indexOf(needle)+base);
    unique(match, option=>number(text(option))===result);

    const bubble=build(14,i), algorithm=prompt(bubble), forward=algorithm.includes('n−i'), small=algorithm.includes(' ＜ ');
    unique(bubble, option=>{
      const bits=text(option), lowest=bits.includes('最小値'), first=bits.includes('A[1]');
      return Array.from({length:81},(_,n)=>n).every(seed=>{
        const values=[...seed.toString(3).padStart(4,'0')].map(Number), before=[...values];
        for(const position of forward?[0,1,2]:[2,1,0]) {
          if (small ? values[position+1]<values[position] : values[position+1]>values[position]) {
            [values[position],values[position+1]]=[values[position+1],values[position]];
          }
        }
        return values[first?0:values.length-1]===(lowest?Math.min(...before):Math.max(...before));
      });
    });
  }
});

test('問19・20・24は図の処理順、ヒットとミスの重み、非圧縮画素数を独立に計算する', () => {
  for(const i of conditions) {
    const cycles=build(19,i);
    const period=Number(prompt(cycles).match(/時間を(\d+)ナノ秒/)![1]);
    const seq=diagram(cycles.prompt).alt.match(/順：([a-d→]+)/)![1].split('→');
    const expected=table(cycles).rows.reduce((sum,[mark,cpi])=>sum+period*number(cpi)*seq.filter(cmd=>cmd===mark).length,0);
    unique(cycles, option=>number(text(option))===expected);
    const hit=build(20,i), [memory,cache,latency]=Array.from(prompt(hit).matchAll(/時間(?:が)?(\d+)ナノ秒/g), m=>Number(m[1]));
    unique(hit, option=>Math.abs( number(text(option))*cache + (1-number(text(option)))*memory - latency)<0.00001);
    assert.match(hit.explanation,/直列モデル/);
    const clip=build(24,i), [pixels,colors,frames,minutes]=Array.from(prompt(clip).matchAll(/(\d+)(?:万画素|色|フレーム|分間)/g), m=>Number(m[1]));
    const bytes=(10000*pixels*frames*60*minutes)/8 * (colors-1).toString(2).length;
    const differences=choices(clip).map(choice=>Math.abs(number(choice)*1e6-bytes));
    unique(clip,(_,index)=>differences[index]===Math.min(...differences));
  }
});

test('九つの知識問題は条件ごとに全候補の意味と正答の一意性を照合する', () => {
  for(const [id,facts] of Object.entries(concepts)) for(const i of conditions) {
    const body=build(Number(id),i);
    assert.match(prompt(body),facts.stems[i]);
    unique(body, option=>facts.selected[i].test(text(option)));
    if(facts.rejected.length) for(const option of choices(body)) {
      assert.equal(facts.rejected.filter(rule=>rule.test(option)).length,1,option);
    }
  }
});

test('30図の全プロフィール・各条件でARIAとSVGの描画を照合する', () => {
  let total=0;
  for(const {profile,component} of legacy2007SpringAm0126FigureRenderers) {
    const definition=legacy2007SpringAm0126Figures.find(d=>d.profile===profile)!;
    for(let value=definition.domain[0][0];value<=definition.domain[0][1];value++) {
      const markup=renderToStaticMarkup(createElement(component,{caption:'問題図',values:[value]}));
      assert.match(markup,/role="img"/);
      assert.match(markup,/aria-describedby=/);
      assert(!markup.includes('NaN'));
      total++;
    }
  }
  assert.equal(total,30);
});
