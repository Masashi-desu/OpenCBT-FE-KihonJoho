import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import { legacy2006AutumnAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2006-autumn-am-27-53';
import { legacy2006AutumnAm2753Figures as figures } from '../../../src/core/generators/legacy-2006-autumn-am-27-53-figures';
import { legacy2006AutumnAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2006AutumnAm2753Figures';
import { knowledgeReview } from '../../fixtures/legacy-2006-autumn-am-27-53-review';

const conditions=[0,1,2,3];
const indices = (list: readonly boolean[]) => list.flatMap((value,i) => value ? [i] : []);
const nums = (line:string) => (line.replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g)??[]).map(Number);
const columns = (block:Block) => { assert.equal(block.type,'table'); return block.columns; };
const rows = (block:Block) => { assert.equal(block.type,'table'); return block.rows; };
const paragraph = (block:Block) => { assert.equal(block.type,'paragraph'); return block.text; };
const generated = (number:number,condition:number) => definitions.find(d=>Number(d.source.split('-').at(-1))===number)!.build([condition]);
const textChoices = (number:number,condition:number) => generated(number,condition).choices.map(choice=>paragraph(choice[0]));
const brief = (number:number,condition:number) => generated(number,condition).prompt.filter(block=>block.type==='paragraph').map(paragraph).join('\n');
function drawn(number:number,condition:number) {
  const b=generated(number,condition).prompt.find(block=>block.type==='diagram');
  assert(b && b.scene.kind==='source_figure');
  const { profile,values }=b.scene;
  const renderer=renderers.find(renderer=>renderer.profile===profile);
  assert(renderer);
  return {b,profile,values,markup:renderToStaticMarkup(createElement(renderer.component,{values,caption:b.caption}))};
}

test('問27〜53の公式キー26件と保留問32を追跡し、各問で本文または図が4通りに変わる', () => {
  const official='ウウウエウイウアイウウウエエアイウアアアエエウアアアア';
  const numbers=Array.from({length:27},(_,i)=>i+27).filter(n=>n!==32);
  assert.deepEqual(definitions.map(d=>Number(d.source.split('-').at(-1))),numbers);
  for(const [i,def] of definitions.entries()) {
    assert.equal(def.sourceAnswer,official[numbers[i]-27]);
    assert.equal('アイウエ'[def.build(def.reference).correctIndex!],def.sourceAnswer);
    const bodies=conditions.map(condition=>def.build([condition]));
    assert.equal(new Set(bodies.map(body=>JSON.stringify(body.prompt))).size,4,def.source);
    for(const body of bodies) {
      assert.equal(body.choices.length,4);
      assert.equal(new Set(body.choices.map(choice=>JSON.stringify(choice))).size,4);
      assert(body.explanation.length>=23);
    }
    for(const invalid of [[],[-1],[1.5],[4],[0,1]]) assert.throws(()=>def.build(invalid));
  }
  const covered=[...Object.keys(knowledgeReview).map(Number),27,29,33,39,43,44,45,46,50,52,53].sort((a,b)=>a-b);
  assert.deepEqual(covered,numbers);
});

test('知識問15問の4条件240択を問いの役割と定義から査読する', () => {
  for(const [q,row] of Object.entries(knowledgeReview)) for(const condition of conditions) {
    const n=Number(q), body=generated(n,condition);
    assert.match(brief(n,condition), row.anchors[condition], q+' condition '+condition);
    assert(row.distinction.length>=20);
    const expected=row.alternate?.[condition]??row.base;
    const choices=textChoices(n,condition);
    assert.equal(expected.length,choices.length);
    const truth=choices.map((choice,i)=>{
      const [role,pattern]=expected[i];
      assert.match(choice, pattern,q+' condition '+condition+' choice '+i);
      return row.targets[condition]===role;
    });
    assert.deepEqual(indices(truth),[body.correctIndex],q+' condition '+condition);
  }
});

test('問27・33は挿入時刻の追跡と厳密な比によって全候補を評価する', () => {
  for(const condition of conditions) {
    const fifo=generated(27,condition), source=rows(fifo.prompt[1]);
    const seats:(null|{id:number;inserted:number})[]=[null,null,null];
    for(const [i,row] of source.entries()) {
      const step=Number(row[0]), id=Number(row[1]);
      assert.equal(step,i+1);
      if(!seats.some(value=>value?.id===id)) {
        const oldest=seats.reduce((left,right,k)=>((right?.inserted??-1)<(seats[left]?.inserted??-1)?k:left),0);
        seats[oldest]={id,inserted:step};
      }
      if(i<3) assert.deepEqual(row.slice(2),seats.map(s=>s?String(s.id):'—'));
    }
    assert.equal(source.length,6);
    assert.equal(source[5][2],'［解答欄］');
    const output=seats.map(value=>String(value!.id));
    const options=fifo.choices.map(choice=>rows(choice[0])[0].join('，'));
    assert.deepEqual(indices(options.map(option=>option===output.join('，'))),[fifo.correctIndex]);
    const accesses=source.map(row=>row[1]);
    const lru=accesses.slice(0,3);
    for(const [i,accessed] of accesses.entries()) {
      if(i<3||lru.includes(accessed)) continue;
      const latest=lru.map(page=>accesses.slice(0,i).lastIndexOf(page));
      lru[latest.indexOf(Math.min(...latest))]=accessed;
    }
    const independentCandidates=[output,output.slice().sort((a,b)=>Number(a)-Number(b)),lru,accesses.slice(-3)];
    assert.deepEqual(options.slice().sort(),independentCandidates.map(candidate=>candidate.join('，')).sort());
    assert.ok(output.every(x=>fifo.explanation.includes(x)));

    const uptime=generated(33,condition), starting=condition===0?[37,13]:nums(brief(33,condition));
    const [mtbf,mttr]=starting;
    const pairs=condition===0?[[2,2],[0.5,0.5],[2,0.5],[0.5,2]]:textChoices(33,condition).map(nums);
    const base=mtbf/(mttr+mtbf);
    assert(mtbf>0&&mttr>0);
    assert.deepEqual(indices(pairs.map(([a,b])=>{
      const after=mtbf*a/(mttr*b+mtbf*a);
      return after-base>1e-9;
    })),[uptime.correctIndex]);
    assert.match(uptime.explanation,/MTBF ÷（MTBF＋MTTR）/);
  }
});

test('保留の問32は原条件が同じでも最少2台・3台・4台の構成を全状態列挙できる',()=>{
  const countBits=(mask:number)=>[0,1,2,3].filter(bit=>mask&(1<<bit)).length;
  const populations=[
    [60000,10000,10000,0,10000,0,0,0,10000,0,0,0,0,0,0,0],
    Array.from({length:16},(_,mask)=>10*9**(4-countBits(mask))),
    Array.from({length:16},(_,mask)=>({0:68000,1:7000,3:1000}[countBits(mask)]??0)),
  ];
  for(const [i,population] of populations.entries()) {
    assert.equal(population.reduce((a,b)=>a+b,0),100000);
    assert.deepEqual([1,2,4,8].map(bit=>population.reduce((sum,count,mask)=>sum+((mask&bit)?count:0),0)),[10000,10000,10000,10000]);
    const unavailable = [1,3,7,15].map(used=>population.reduce((sum,count,mask)=>sum+((mask&used)===used?count:0),0));
    assert.equal(unavailable.findIndex(observations=>observations<=100)+1,i+2);
  }
});

test('問29・39・45は図の全条件で矢印、DFD記号、予測と実績を独立に判定する', () => {
  const branchKeys={'①':['実行状態','実行可能状態'],'②':['実行可能状態','実行状態'],'③':['実行状態','待ち状態'],'④':['待ち状態','実行可能状態']} as const;
  const coordinateIndex=(x:string)=>'abc'.indexOf(x);
  const dfdNames={'○':'プロセス','二本の平行線':'データストア','→':'データフロー'} as const;
  const qualityRequirements=[
    [/重点対策.*前工程/,/遅く.*問題はない/,/消化が速く.*予測した以上/,/効率的に進行/],
    [/未消化項目が少ない/,/消化が遅い.*品質が良いとは判断しない/,/消化が速く.*予測以上/,/予測どおり.*管理だけ/],
    [/未消化項目が多い/,/テスト消化が遅い/,/消化が速く.*累積誤り.*予測を上回る/,/予測どおり.*管理だけ/],
    [/消化が予測より遅く累積誤りが多い/,/消化が予測より著しく遅い/,/累積誤りが予測より著しく多い/,/予測に近く.*未解決の誤り/],
  ];
  for(const condition of conditions) {
    const diagram=drawn(29,condition);
    const connections=[...diagram.b.alt.matchAll(/([①②③④]) ([abc])→([abc])/g)];
    assert.equal(connections.length,4);
    assert.deepEqual([...diagram.markup.matchAll(/data-transition="([abc]→[abc])"/g)].map(match=>match[1]),connections.map(match=>match[2]+'→'+match[3]));
    for(const [i,event] of [/高いほか.*CPU 使用権が移された/,/CPU 使用権が与えられた/,/入出力動作の完了を待つ/,/入出力動作が完了した/].entries())
      assert.match(paragraph(generated(29,condition).prompt[i+3]),event);
    const states=generated(29,condition);
    assert.deepEqual(indices(states.choices.map(c=>{
      const [choice]=rows(c[0]);
      assert.deepEqual(columns(c[0]),['a','b','c']);
      return connections.every(([,event,from,to])=>{
        const [expectedSource,expectedDestination]=branchKeys[event as keyof typeof branchKeys];
        return choice[coordinateIndex(from)]===expectedSource && choice[coordinateIndex(to)]===expectedDestination;
      });
    })),[states.correctIndex]);

    const dfd=drawn(39,condition), target=brief(39,condition).match(/“([^”]+)”/)?.[1] as keyof typeof dfdNames;
    const items=[...dfd.markup.matchAll(/data-symbol="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(items[0],'□');
    assert.equal(items.at(-1),'□');
    assert.equal(items.filter(symbol=>symbol==='二本の平行線').length,1);
    for(const id of items) assert(dfd.b.alt.includes(id));
    assert(target==='→'||items.includes(target));
    assert.deepEqual(indices(textChoices(39,condition).map(choice=>choice===dfdNames[target])),[generated(39,condition).correctIndex]);

    const quality=drawn(45,condition);
    const endpoints=Object.fromEntries([...quality.markup.matchAll(/<path d="([^"]+)" data-quantity="([^"]+)"/g)].map(([,path,name])=>{
      const endings=path.split(' C ').map(piece=>nums(piece).slice(-2));
      return [name,endings[1]];
    }));
    const [x,y]=endpoints['remaining-actual'], [t,z]=endpoints['errors-actual'];
    assert.equal(x,t);
    assert.equal(endpoints['remaining-plan'][0],x);
    assert.equal(endpoints['errors-plan'][0],x);
    const deltaLeft=endpoints['remaining-plan'][1]-y, deltaErrors=endpoints['errors-plan'][1]-z;
    const cases=[deltaLeft>10&&deltaErrors>10,deltaLeft>10&&deltaErrors < -10,deltaLeft < -10&&deltaErrors>10,Math.abs(deltaLeft)<10&&Math.abs(deltaErrors)<10];
    assert.deepEqual(indices(cases),[generated(45,condition).correctIndex]);
    for(const [i,c] of textChoices(45,condition).entries()) assert.match(c,qualityRequirements[condition][i]);
    assert(quality.b.alt.includes('左縦軸は未消化テスト項目数') && quality.b.alt.includes('右縦軸は累積誤り検出数'));
  }
});

test('問43・44・46・50を入力から網羅し、表と選択肢の全候補を判別する',()=>{
  const boolValues=(text:string)=>(text.match(/真|偽/g)??[]).map(word=>word==='真');
  const sampleSpace=Array.from({length:8},(_,v)=>[Boolean(v&4),Boolean(v&2),Boolean(v&1)]);
  const numberWithComma=(value:string)=>Number(value.replaceAll(',',''));
  for(const condition of conditions) {
    const e=generated(43,condition);
    const groups=rows(e.prompt[1]).map(([,values])=>nums(values));
    assert.equal(new Set(groups.flat()).size,groups.flat().length);
    const truth=textChoices(43,condition).map(value=>{
      const items=new Set(nums(value));
      return groups.every(group=>group.filter(entry=>items.has(entry)).length===1) && items.size===groups.length;
    });
    assert.deepEqual(indices(truth),[e.correctIndex]);

    const b=generated(44,condition),expr=paragraph(b.prompt[1]);
    const operators=expr.match(/AND|OR/g);
    assert(operators?.length===2);
    const [outer,inner]=operators;
    const expanded=outer===inner ? (outer==='AND'?'111':'111,110,101,100,011,010,001') :
      outer==='AND'?'111,110,101':'111,110,101,100,011';
    const evaluate=(row:boolean[])=>expanded.split(',').includes(row.map(Number).join(''));
    const completed=b.prompt.slice(4).map(block=>boolValues(paragraph(block)));
    const covered=new Set(completed.map(evaluate));
    assert.equal(covered.size,1);
    assert(sampleSpace.some(sample=>!covered.has(evaluate(sample))));
    assert.deepEqual(indices(b.choices.map(choice=>!covered.has(evaluate(boolValues(rows(choice[0])[0].join('，')))))),[b.correctIndex]);

    const f=generated(46,condition);
    const factor=nums(paragraph(f.prompt[0]))[0];
    const weightedUnits=rows(f.prompt[1]).flatMap(([,n,v])=>Array(Number(n)).fill(Number(v)) as number[]);
    const total=weightedUnits.reduce((sum,x)=>sum+x*factor,0);
    const answers=textChoices(46,condition).map(Number);
    assert.deepEqual(answers.slice().sort((a,b)=>a-b),answers);
    assert.deepEqual(indices(answers.map(answer=>answer===total)),[f.correctIndex]);
    assert(f.explanation.includes(String(total)+' ファンクションポイント'));

    const c=generated(50,condition), lines=c.prompt.slice(2).map(paragraph);
    const data=lines.slice(0,5).map(line=>nums(line.replaceAll(',','')).slice(1));
    const size=data[0][0], incidence=data[1][0], found=data[2][0], partition=data[3], repair=data[4].slice(-2);
    const selected=lines[5].includes('影響度大')?0:1;
    assert.equal(partition[0]+partition[1],100);
    const randomDraws=10000;
    const expectedUnitOutcomes=Array.from({length:found},(_,detected)=>detected).flatMap(()=>
      Array.from({length:partition[selected]},()=>repair[selected]));
    assert.equal(expectedUnitOutcomes.length,found*partition[selected]);
    const expected=expectedUnitOutcomes.reduce((sum,x)=>sum+x,0)*size*Math.round(incidence*100)/(randomDraws*100);
    const amounts=textChoices(50,condition).map(numberWithComma);
    assert.deepEqual(amounts.slice().sort((a,b)=>a-b),amounts);
    assert.deepEqual(indices(amounts.map(amount=>amount===expected)),[c.correctIndex]);
    assert(c.explanation.includes(String(expected)+'万円'));
  }
});

test('問52・53をサブネット全アドレスと全反転位置から検算する',()=>{
  for(const condition of conditions) {
    const text=brief(52,condition), suffix=Number(text.match(/192\.168\.\d+\.0\/(\d+)/)?.[1]??24);
    const mask=Number(text.match(/255\.255\.255\.(\d+)/)?.[1]);
    const usable=Array.from({length:1<<(32-suffix)},(_,addr)=>addr).filter(addr=>{
      const host=addr & (255^mask);
      return host!==0&&host!==(255^mask);
    }).length;
    const choices=textChoices(52,condition).map(Number), subnet=generated(52,condition);
    assert.deepEqual(indices(choices.map(n=>n===usable)),[subnet.correctIndex]);
    assert(subnet.explanation.includes('＝'+usable+' 個'));
    if(condition===0) for(const alternative of [25,26,27,28]) {
      const hostCount=(1<<(29-alternative))*6;
      assert(!choices.includes(hostCount));
    }

    const source=brief(53,condition);
    const p=generated(53,condition), alternatives=textChoices(53,condition);
    const detected=(original:number,flips:number)=>{
      let expected=0, observed=0;
      for(let bit=0;bit<8;bit++) {
        expected^=(original>>bit)&1;
        observed^=((original^flips)>>bit)&1;
      }
      return expected!==observed;
    };
    const errors=Array.from({length:256},(_,mask)=>mask);
    for(const parity of [0,1]) {
      const word=(parity<<7)|3;
      assert.equal(errors.filter(mask=>detected(word,mask)).length,128);
      for(let bit=0;bit<8;bit++) for(let other=0;other<bit;other++) {
        assert(detected(word,1<<bit));
        assert(!detected(word,(1<<bit)|(1<<other)));
      }
    }
    if(!condition) assert.deepEqual(indices(alternatives.map(choice=>choice==='1 ビットの誤りを検出できる。')),[p.correctIndex]);
    else {
      const fields=source.match(/(偶数|奇数)パリティ.* ([01]{8}) を送る。左から ([0-9，]+) 番目/);
      assert(fields);
      const [,expected,word,fieldsFlipped]=fields;
      const wordBits=parseInt(word,2), bits=nums(fieldsFlipped);
      assert.equal([...word].filter(bit=>bit==='1').length%2,Number(expected==='奇数'));
      const flags=bits.reduce((setBit,i)=>setBit|(1<<(8-i)),0);
      const hasError=detected(wordBits,flags);
      const [a,b,c,d]=alternatives;
      assert.match(a,/検出できる.*特定できない/);
      assert.match(b,/検出でき.*位置も.*特定できる/);
      assert.match(c,condition===2?/2 ビットの反転を検出できる/:/パリティビット以外.*検出できない/);
      assert.match(d,/奇偶が変わらない.*検出できない/);
      assert.deepEqual(indices([hasError,false,false,!hasError]),[p.correctIndex]);
      assert(p.explanation.includes((wordBits^flags).toString(2).padStart(8,'0')));
    }
  }
});

test('描画3種の全12状態は登録・代替説明・見出し・図形が一致する',()=>{
  assert.equal(figures.length,3);
  assert.equal(renderers.length,3);
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  for(const [i,number] of [29,39,45].entries()) for(const condition of conditions) {
    const {b,profile,values,markup}=drawn(number,condition);
    const figure=figures[i];
    assert.equal(figure.profile,profile);
    assert.deepEqual(figure.domain,[[0,3]]);
    assert.equal(figure.alt(values),b.alt);
    assert(markup.includes('aria-describedby') && markup.includes('<desc') && markup.includes('tabindex="0"') && markup.includes(b.caption));
    assert.throws(()=>figure.validate([4]));
  }
});
