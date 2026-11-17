import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {Block} from '../../../src/core/types';
import {legacy2006SpringAm27To53Definitions as definitions} from '../../../src/core/generators/legacy-2006-spring-am-27-53';
import {legacy2006SpringAm2753Figures as figures} from '../../../src/core/generators/legacy-2006-spring-am-27-53-figures';
import {legacy2006SpringAm2753FigureRenderers as renderers} from '../../../src/ui/Legacy2006SpringAm2753Figures';
import {facts} from '../../fixtures/legacy-2006-spring-am-27-53-review';

const conditions=[0,1,2,3];
const truth=(items:readonly boolean[])=>items.flatMap((value,index)=>value?[index]:[]);
const get=(q:number,c:number)=>definitions.find(def=>Number(def.source.split('-').at(-1))===q)!.build([c]);
const text=(block:Block)=>{assert('text' in block);return block.text;};
const matches=(q:number,c:number)=>get(q,c).choices.map(choice=>text(choice[0]));
const number=(value:string)=>Number(value.replaceAll(',',''));
const allDigits=(value:string)=>[...value.matchAll(/\d+/g)].map(q=>Number(q[0]));
function picture(block:Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene;
  const found=renderers.find(item=>item.profile===profile);
  assert(found);
  return {block,profile,values,dom:renderToStaticMarkup(createElement(found.component,{values,caption:block.caption}))};
}

test('25問100条件で原キー・各4択・解説が揃い，問32・52の保留を独立に再現する',()=>{
  const keys='ウウウイエイアウアエアアイイエエアアウウイエウウアアウ';
  const range=Array.from({length:27},(_,i)=>i+27).filter(q=>q!==32&&q!==52);
  assert.deepEqual(definitions.map(def=>Number(def.source.split('-').at(-1))),range);
  const assessed=[...Object.keys(facts).map(Number),27,29,36,37,39,42,44,46,48,49].sort((a,b)=>a-b);
  assert.deepEqual(assessed,range);
  for(const n of range) {
    const def=definitions.find(def=>def.source.endsWith('-'+n))!;
    assert.equal(def.sourceAnswer,keys[n-27]);
    assert.equal('アイウエ'[get(n,0).correctIndex!],def.sourceAnswer);
    const samples=conditions.map(condition=>get(n,condition));
    assert.equal(new Set(samples.map(sample=>JSON.stringify(sample.prompt))).size,4,String(n));
    for(const sample of samples){
      assert.equal(new Set(sample.choices.map(candidate=>JSON.stringify(candidate))).size,4,String(n));
      assert(sample.explanation.length>22);
    }
    for(const invalid of [[],[-1],[1.5],[4],[0,1]]) assert.throws(()=>def.build(invalid));
  }
  const failurePools=[
    [[0.4,0],[0.15,3],[0.15,6],[0.15,12],[0.15,9]],
    [[0.8,0],[0.2,7]],
    [[0.8,0],[0.1,1],[0.1,2]],
  ];
  for(const [i,pop] of failurePools.entries()) {
    const marginal=Array.from({length:4-i},(_,bit)=>pop.reduce((sum,[weight,mask])=>sum+((mask&(1<<bit))?weight:0),0));
    assert(marginal.every(value=>Math.abs(value-[0.3,0.2,0.1][i])<1e-10));
  }
  assert.equal(1-(failurePools[0].find(([,mask])=>mask===15)?.[0]??0),1);
  assert.equal(1-(failurePools[2].find(([,mask])=>mask===3)?.[0]??0),1);
  const ideal=[1-0.3**4,1-0.2**3,1-0.1**2,0.99];
  assert.equal(ideal.indexOf(Math.max(...ideal)),1);
  const bytes=1.2e6, encoding=64e3, network=48e3;
  const duration=bytes*8/encoding, playingSeconds=(encoding-network)*duration/encoding;
  const waitingSeconds=bytes*8/network-duration;
  assert.equal(playingSeconds,37.5);
  assert.equal(waitingSeconds,50);
  assert(![50,150,200,350].includes(playingSeconds));
});

test('知識問15件240選択肢を独立資料に沿って全条件を査読する',()=>{
  for(const [s,reference] of Object.entries(facts)) for(const i of conditions) {
    const q=Number(s),sample=get(q,i),{stem,correctRole,options}=reference.cases[i];
    assert.match(text(sample.prompt[0]),stem,s+' '+i);
    assert(reference.distinction.length>15);
    const roles=options??reference.options;
    const verdict=matches(q,i).map((option,j)=>{
      assert.match(option,roles[j],s+' '+i+' '+j);
      return j===correctRole;
    });
    assert.deepEqual(truth(verdict),[sample.correctIndex]);
  }
});

test('問27・29を時系列の置換記録と1分単位の印刷・保有イベントから検算する',()=>{
  for(const i of conditions) {
    const fifo=get(27,i),src=text(fifo.prompt[0]).match(/\d(?:→\d){6}/);
    assert(src);
    const pages=allDigits(src[0]),positions=new Map<number,number>(),faults:number[]=[];
    pages.forEach((p,t)=>{
      if(positions.has(p)) return;
      if(positions.size===3) {
        const earliest=Math.min(...positions.values());
        positions.delete([...positions].find(([,assigned])=>assigned===earliest)![0]);
      }
      positions.set(p,t);faults.push(p);
    });
    assert.deepEqual(truth(matches(27,i).map(choice=>number(choice)===faults.length)),[fifo.correctIndex]);
    assert(fifo.explanation.includes(faults.join('→')));

    const spool=get(29,i),conditionsText=spool.prompt.slice(2).map(text);
    const job=allDigits(conditionsText[1])[1],size=allDigits(conditionsText[2])[1],rate=allDigits(conditionsText[5]).at(-1)!;
    const onePrint=size*rate/100;
    const holding=new Set<number>(), queued:number[]=[], released:number[]=[];
    let remaining=0,current:number|undefined,peak=0;
    for(let time=0;time<=4*job+4*onePrint;time++) {
      if(current!==undefined && remaining===0) {holding.delete(current);released.push(time); current=undefined;}
      if(time%job===0&&time>0&&time/job<=4) queued.push(time/job-1);
      if(current===undefined&&queued.length) {current=queued.shift();remaining=onePrint;}
      if(time%job===0&&time/job<4) holding.add(time/job);
      peak=Math.max(peak,holding.size);
      if(current!==undefined) remaining--;
    }
    const options=matches(29,i).map(number);
    assert.deepEqual(truth(options.map(option=>option===size*peak)),[spool.correctIndex]);
    assert.deepEqual(options,[size,2*size,3*size,4*size]);
    assert(spool.explanation.includes(released.join('，')));
  }
});

function compareExpression(expression:string,inputs:ReadonlyMap<string,number>) {
  const tokens=expression.match(/[ABCD]|T[₁₂₃]|[＋－＊／（）]/g)??[];
  let at=0;
  const atom=():number=>{
    const token=tokens[at++];
    if(token!=='（') return inputs.get(token)??Number.NaN;
    const grouped=sum();
    assert.equal(tokens[at++],'）');
    return grouped;
  };
  const product=()=>{
    let value=atom();
    while(tokens[at]==='＊'||tokens[at]==='／'){
      const operator=tokens[at++], operand=atom();
      value=operator==='＊'?value*operand:value/operand;
    }
    return value;
  };
  const sum=()=>{
    let value=product();
    while(tokens[at]==='＋'||tokens[at]==='－'){
      const operator=tokens[at++],operand=product();
      value=operator==='＋'?value+operand:value-operand;
    }
    return value;
  };
  const result=sum();
  assert.equal(tokens.length,at);
  return result;
}
test('問37の四つ組を一時領域に展開し構文演算の全択を比較する',()=>{
  const scenarios=[[20,7,4,10],[36,8,5,3],[6,4,2,7],[21,5,9,6]];
  for(const i of conditions) {
    const sample=get(37,i);
    const quads=text(sample.prompt[3]).split('\n').map(line=>line.slice(1,-1).split('，'));
    const options=matches(37,i);
    const results=scenarios.map(values=>{
      const initial=new Map('ABCD'.split('').map((symbol,index)=>[symbol,values[index]]));
      const memory=new Map(initial);
      for(const [operator,left,right,out] of quads) {
        const a=memory.get(left)!,b=memory.get(right)!;
        assert(Number.isFinite(a)&&Number.isFinite(b));
        const result=operator==='＋'?a+b:operator==='－'?a-b:operator==='＊'?a*b:a/b;
        memory.set(out,result);
      }
      const target=memory.get('T₃')!;
      return options.map(option=>Math.abs(compareExpression(option,initial)-target)<1e-12);
    });
    assert.deepEqual(truth(options.map((_,index)=>results.every(line=>line[index]))),[sample.correctIndex]);
  }
});

test('問36・39・42は図の入出路・終端記号・減算に沿って4択を判定する',()=>{
  const controlSpecs=[
    {conditionFirst:true,loops:true,boxes:1,executions:'zero allowed'},
    {conditionFirst:false,loops:true,boxes:1,executions:'one required'},
    {conditionFirst:true,loops:false,boxes:1,executions:'optional'},
    {conditionFirst:true,loops:false,boxes:2,executions:'two alternatives'},
  ];
  const guide=[/while 型/,/少なくとも1回/,/実行するか省略するか/,/異なる二つの処理/];
  for(const i of conditions) {
    const flow=get(36,i);
    assert.match(text(flow.prompt[0]),guide[i]);
    const flowChoices=flow.choices.map(([block])=>picture(block));
    const keys=flowChoices.map(({block,dom})=>{
      const proc=(dom.match(/>処理<\/text>/g)??[]).length;
      const post=/M 130 18 V 45/.test(dom);
      const repeats=/H 54 V 32|H 52 V 23/.test(dom);
      assert((block.alt.includes('条件の前に戻る')||block.alt.includes('処理の前に戻る'))===repeats);
      const c={conditionFirst:!post,loops:repeats,boxes:proc,executions:
        repeats?(post?'one required':'zero allowed'):(proc===2?'two alternatives':'optional')};
      return JSON.stringify(c)===JSON.stringify(controlSpecs[i]);
    });
    assert.deepEqual(truth(keys),[flow.correctIndex]);

    const uml=get(39,i), sketch=picture(uml.prompt[1]);
    assert.equal((sketch.dom.match(/data-relation=/g)??[]).length,4);
    const diamond=[...sketch.dom.matchAll(/data-relation="([A-D]{2})" data-terminator="1"/g)];
    assert.equal(diamond.length,1);
    const pair=[...diamond[0][1]].sort().join('');
    assert.match(sketch.block.alt,/白いひし形/);
    assert.deepEqual(truth(matches(39,i).map(choice=>(choice.match(/[A-D]/g)??[]).sort().join('')===pair)),[uml.correctIndex]);

    const subtract=get(42,i), description=text(subtract.prompt[1]).replace(/[^①②③④⑤⑥]/g,'');
    assert.match(text(subtract.prompt[2]),/ともに正の整数/);
    assert.match(picture(subtract.prompt[3]).block.alt,/m−nをm.*n−mをn/);
    const pairs=[[2,1],[1,2],[3,2],[2,3]];
    const observed=pairs.map(([a,b])=>{
      const sample=Array.from({length:8},(_,k)=>{
        let m=a*(k+1),n=b*(k+1),route='①';
        while(m!==n){
          route+='②③';
          if(m>n){m-=n;route+='④';}else{n-=m;route+='⑤';}
        }
        return route+'②⑥';
      });
      return sample.every(route=>route===description);
    });
    assert.deepEqual(matches(42,i),['a＝2b','2a＝b','2a＝3b','3a＝2b']);
    assert.deepEqual(truth(observed),[subtract.correctIndex]);
  }
});

test('問44の表と検出曲線を併せて4つの品質評価を検算する',()=>{
  const expected=[
    [/a の方が.*収束/,/品質安定状況になく/,/ほぼ同数/,/未解決バグ数は0件/],
    [/a のみ.*収束/,/どちらも終盤まで.*増えて/,/検出数が一致/,/未解決バグは0件/],
    [/a のみ収束/,/最後|終盤まで検出数が増え/,/規模，テスト密度，検出数，未解決数/,/未解決数だけ/],
    [/a の検出だけが収束/,/テスト密度も基準未満/,/開発規模を同一/,/基準密度以上.*0件/],
  ];
  for(const i of conditions) {
    const item=get(44,i),table=item.prompt[1];
    assert(table.type==='table');
    const records=table.rows.map(row=>row.slice(1).map(cell=>allDigits(cell)[0]));
    const density=Number(text(item.prompt[0]).match(/(\d+) 項目／k/)?.[1]);
    const display=picture(item.prompt[3]);
    const curves=[...display.dom.matchAll(/data-counts="([^"]+)"/g)].map(q=>q[1].split(',').map(Number));
    assert.equal(curves.length,2);
    const settled=curves.map(curve=>curve.at(-1)!-curve.at(-2)!<=6);
    const meetsDensity=records.every(([size,tests])=>tests>=size*density);
    const sameScale=records[0][0]===records[1][0]&&records[0][1]===records[1][1];
    const sameBugs=curves[0].at(-1)===curves[1].at(-1);
    const noneOpen=records.every(([, , open])=>open===0);
    const verdict=[settled[0]&&!settled[1],!settled[0]&&!settled[1],settled.every(Boolean)&&sameScale&&sameBugs&&noneOpen,
      meetsDensity&&settled.every(Boolean)&&noneOpen&&!sameBugs];
    for(const [j,choice] of matches(44,i).entries()) assert.match(choice,expected[i][j]);
    assert.deepEqual(truth(verdict),[item.correctIndex]);
  }
});

test('問46・48・49は全経路、13桁照合、折れ線の傾きで全選択肢を区別する',()=>{
  for(const i of conditions) {
    const project=get(46,i), diagram=picture(project.prompt[1]);
    const edges=[...diagram.dom.matchAll(/data-edge="([A-N]),(\d+),(\d+),(\d+)"/g)].map(([,name,a,b,w])=>({name,a:+a,b:+b,w:+w}));
    assert.equal(edges.length,14);
    assert.equal(new Set(edges.map(edge=>edge.name)).size,14);
    const totals=Array<number>(11).fill(-Infinity);totals[0]=0;
    for(const a of [0,1,3,2,4,5,6,7,8,9]) for(const edge of edges.filter(edge=>edge.a===a))
      totals[edge.b]=Math.max(totals[edge.b],totals[a]+edge.w);
    const routes=matches(46,i).map(choice=>{
      let current=0,sum=0;
      for(const task of choice.split('－')){
        const edge=edges.find(edge=>edge.name===task)!;
        assert.equal(edge.a,current);
        current=edge.b;sum+=edge.w;
      }
      assert.equal(current,10);return sum;
    });
    assert.deepEqual(truth(routes.map(total=>total===totals[10])),[project.correctIndex]);
    assert(project.explanation.includes(totals[10]+' 日'));

    const jan=get(48,i), digits=text(jan.prompt[0]).match(/（(\d{12})）/)?.[1];
    const input=picture(jan.prompt.at(-1)!);
    assert.equal(input.dom.match(/data-digits="(\d+)"/)?.[1],digits);
    assert.equal(input.block.alt.includes([...digits!].join(' ')),true);
    const weighted=(data:string)=>[...data].reduce((sum,value,index)=>sum+Number(value)*(index%2?3:1),0);
    const candidates=matches(48,i);
    assert.deepEqual(candidates,['0','3','5','8']);
    assert.deepEqual(truth(candidates.map(value=>weighted(digits!+value)%10===0)),[jan.correctIndex]);
    assert.equal([...Array(10).keys()].filter(value=>weighted(digits!+value)%10===0).length,1);

    const charge=get(49,i);
    const verdict=charge.choices.map(([block])=>{
      const svg=picture(block).dom;
      const coordinates=(svg.match(/data-rates="([^"]+)"/)?.[1]??'').split(',').map(Number);
      assert(coordinates.length>=4);
      const slopes=coordinates.filter((_,j)=>j%2===1).slice(1).map((y,j)=>{
        const [x0,y0,x1]=coordinates.slice(j*2,j*2+3);
        return (y0-y)/(x1-x0);
      });
      const shapes=[
        slopes.every((s,j)=>s>0&&(j===0||s<slopes[j-1])),
        slopes[0]>0&&slopes.at(-1)===0,
        slopes.every((s,j)=>s>0&&(j===0||s>slopes[j-1])),
        slopes.every(s=>s<0),
      ];
      return shapes[i];
    });
    assert.deepEqual(truth(verdict),[charge.correctIndex]);
  }
});

test('13図52状態の代替説明・UI登録・共有設定が一対一で対応する',()=>{
  assert.equal(figures.length,13);
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  for(const i of conditions) {
    const objects=definitions.flatMap(def=>{
      const body=def.build([i]);return [...body.prompt,...body.choices.flat()];
    }).filter(b=>b.type==='diagram').map(picture);
    assert.equal(objects.length,13);
    for(const obj of objects) {
      const registered=figures.find(figure=>figure.profile===obj.profile)!;
      assert.deepEqual(registered.domain,[[0,3]]);
      assert.equal(registered.alt(obj.values),obj.block.alt);
      assert(obj.dom.includes('aria-describedby')&&obj.dom.includes('<desc')&&obj.dom.includes('tabindex="0"'));
      assert.throws(()=>registered.validate([4]));
    }
  }
});
