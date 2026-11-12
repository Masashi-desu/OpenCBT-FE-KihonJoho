import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {legacy2008AutumnAm27To53Definitions as definitions} from '../../../src/core/generators/legacy-2008-autumn-am-27-53';
import {legacy2008AutumnAm2753Figures as figures} from '../../../src/core/generators/legacy-2008-autumn-am-27-53-figures';
import {legacy2008AutumnAm2753FigureRenderers as renderers} from '../../../src/ui/Legacy2008AutumnAm2753Figures';
import {original} from '../../../src/core/generators/legacy-2008-autumn-am-27-53-shared';
import type {GeneratedBody} from '../../../src/core/generators/definition';
import type {Block} from '../../../src/core/types';
import {knowledgeFacts} from '../../fixtures/legacy-2008-autumn-am-27-53-review';

const indices=[0,1,2,3];
const officialKeys=Array.from('ウエアアウウエイエアウイイエウエウウアエウエウイウアエ');
const officialPages=[12,12,13,13,14,14,15,15,16,16,16,17,17,17,18,18,18,19,19,20,20,21,21,22,22,22,23];
const numbers=officialKeys.map((_,i)=>i+27);
const cases=(number:number)=>indices.map(i=>definitions[number-27].build([i]));
function content(block:Block) {
  if(block.type==='paragraph') return block.text;
  if(block.type==='table') return block.rows.map(row=>row.join('，')).join('／');
  assert.fail('選択肢の表示形式');
}
function options(body:GeneratedBody) {
  return body.choices.map(choice=>{
    assert.equal(choice.length,1);
    return content(choice[0]);
  });
}
function stem(body:GeneratedBody) {
  const block=body.prompt[0];
  assert.equal(block.type,'paragraph');
  return block.text;
}
function figure(body:GeneratedBody,suffix:string) {
  const block=body.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+suffix));
  assert.ok(block?.type==='diagram'&&block.scene.kind==='source_figure');
  return block;
}
function tableAt(body:GeneratedBody,i:number) {
  const block=body.choices[i][0];
  assert.equal(block.type,'table');
  return block;
}
function unique(body:GeneratedBody,condition:(value:string,index:number)=>boolean) {
  assert.deepEqual(options(body).flatMap((value,i)=>condition(value,i)?[i]:[]),[body.correctIndex]);
}
function numeric(body:GeneratedBody,condition:(value:number)=>boolean) {
  const raw=options(body);
  assert.ok(raw.every(value=>/^\d+$/.test(value)));
  const ascending=raw.map(Number);
  assert.deepEqual(ascending,[...ascending].sort((a,b)=>a-b));
  unique(body,value=>condition(Number(value)));
}

test('27問の基準がIPA保存版の印刷頁・公式キー・4択・原条件に対応する',()=>{
  assert.equal(definitions.length,27);
  for(const [i,number] of numbers.entries()) {
    const definition=definitions[i], source=original(number);
    assert.equal(definition.source,'2008h20a-fe-am-'+number);
    assert.equal(source.page,officialPages[i]);
    assert.equal(definition.sourceAnswer,officialKeys[i]);
    assert.equal(source.key,officialKeys[i]);
    assert.deepEqual(definition.reference,[0]);
    const baseline=definition.build([0]);
    assert.equal('アイウエ'[baseline.correctIndex!],officialKeys[i]);
    assert.equal(stem(baseline),source.prompt);
    assert.equal(baseline.choices.length,4);
    if(number===34) {
      assert.deepEqual(baseline.choices.map((_,choice)=>tableAt(baseline,choice).columns),Array(4).fill(['MTBF','MTTR']));
      assert.deepEqual(options(baseline),source.choices.map(choice=>choice.replace('MTBF＝','').replace('，MTTR＝','，')));
    } else if(number===44) {
      assert.deepEqual(baseline.choices.map((_,choice)=>tableAt(baseline,choice).columns),Array(4).fill(['A','B']));
      assert.deepEqual(options(baseline),source.choices.map(choice=>choice.replaceAll('A＝','').replaceAll('B＝','')));
    } else {
      assert.deepEqual(options(baseline),source.choices);
    }
  }
});

test('全108入力で構成・正答の意味・決定性・境界を検証する',()=>{
  for(const definition of definitions) {
    assert.deepEqual(definition.fields.map(({minimum,maximum})=>[minimum,maximum]),[[0,3]]);
    assert.equal(definition.answerVariation,undefined);
    for(const bad of [[],[-1],[4],[.5],[NaN],[1,1],Array(1),Object.assign([0],{extra:true})]) assert.throws(()=>definition.build(bad));
    const all=indices.map(i=>definition.build([i]));
    all.forEach((body,i)=>{
      assert.deepEqual(body,definition.build([i]));
      assert.equal(body.choices.length,4);
      assert.equal(new Set(options(body)).size,4);
      assert.ok(body.correctIndex!==undefined&&body.correctIndex>=0&&body.correctIndex<=3);
      assert.ok(body.explanation.trim().length>25);
    });
    assert.equal(new Set(all.map(body=>options(body)[body.correctIndex!])).size,4);
    assert.equal(new Set(all.map(body=>JSON.stringify(body.prompt.map(block=>block.type==='diagram'?[block.type,block.alt]:block)))).size,4);
  }
});

test('問28等の18系列を本文の条件・査読済みの候補の役割・真偽で照合する',()=>{
  for(const [raw,fact] of Object.entries(knowledgeFacts)) {
    const number=Number(raw);
    cases(number).forEach((body,i)=>{
      assert.match(stem(body),fact.query[i],'問'+number);
      options(body).forEach((value,choice)=>assert.match(value,fact.roles[choice],'問'+number+' 選択肢'+'アイウエ'[choice]));
      unique(body,value=>fact.required[i].test(value));
    });
  }
  assert.equal(Object.keys(knowledgeFacts).length,18);
  for(const body of cases(42)) {
    const data=body.prompt[1];
    assert.equal(data.type,'table');
    assert.deepEqual(data.columns,['伝票番号','注文日','商品コード','数量','顧客コード']);
    assert.deepEqual(data.rows,[['（文字）','（文字）','（文字）','（数値）','（文字）']]);
  }
});

test('問27の状態順序と置換え対象をイベント前後条件から独立に判定する',()=>{
  cases(27).forEach((body,i)=>{
    const question=stem(body);
    assert.match(question,/主記憶に存在しないページ.*空きのページ枠はない/);
    const order=/古い方から([PQR])，([PQR])，([PQR])/.exec(question);
    const counts=/Pが(\d+)回，Qが(\d+)回，Rが(\d+)回/.exec(question);
    const victim=order?.[1]??(counts?'PQR'[[...counts.slice(1)].map(Number).indexOf(Math.min(...counts.slice(1).map(Number)))]:null);
    if(i!==0) assert.match(question,/全て変更済み/);
    unique(body,value=>{
      const [fault,decide,out,incoming]=value.split(' → ');
      return fault==='ページフォールト'&&incoming==='ページイン'&&
        (victim===null?decide==='置換え対象ページの決定'&&out==='ページアウト':decide==='置換え対象を'+victim+'に決定'&&out===victim+'をページアウト');
    });
  });
});

test('問29の始点・終点とイベントを6本の有向辺に照合する',()=>{
  const routes=[
    ['実行状態','実行可能状態',/自分より優先度の高いタスク/],
    ['外部','実行可能状態',/タスクが生成/],
    ['待ち状態','実行可能状態',/入出力要求による処理が完了/],
    ['実行状態','待ち状態',/^入出力要求を行った/],
  ] as const;
  cases(29).forEach((body,i)=>{
    const [from,to,event]=routes[i];
    const expectedPhrase=from==='外部'?'どの状態にもまだ属していないタスクが'+to:from+'のタスクが'+to;
    assert.ok(stem(body).includes(expectedPhrase));
    const alt=figure(body,'29-state').alt;
    for(const edge of ['外部→実行可能状態','実行可能状態→実行状態','実行状態→実行可能状態','実行状態→待ち状態','待ち状態→実行可能状態','実行状態→外部'])
      assert.ok(alt.includes(edge));
    unique(body,value=>event.test(value));
  });
});

test('問32の短いタイムクウォンタムを待ち行列で実行して正答を近似する',()=>{
  cases(32).forEach(body=>{
    const jobTimes=[...stem(body).matchAll(/ジョブ([ABC])(?:が|は)(\d+)分/g)];
    const wanted=/ジョブ([ABC])が終了するまで/.exec(stem(body))?.[1];
    assert.equal(jobTimes.length,3);
    const remaining=jobTimes.map(([,name,time])=>({name,ticks:Number(time)*100}));
    assert.ok(body.prompt.some(block=>block.type==='paragraph'&&block.text.includes('切替え時間は考慮しない')));
    let ticks=0;
    while(remaining.length) {
      const job=remaining.shift()!;
      job.ticks--;
      ticks++;
      if(job.ticks>0) remaining.push(job);
      else if(job.name===wanted) break;
    }
    numeric(body,value=>Math.abs(value-ticks/100)<.04);
  });
});

test('問34で観測完了した区間を分け、数式の分子・分母を照合する',()=>{
  const counts=[[3,3],[3,2],[2,3],[4,3]];
  cases(34).forEach((body,i)=>{
    const [runs,repairs]=counts[i], alt=figure(body,'34-uptime').alt;
    assert.equal([...alt.matchAll(/稼働 t[₁₂₃₄](?!（)/g)].length,i===0?4:runs);
    assert.equal([...alt.matchAll(/修理 r[₁₂₃₄](?!（)/g)].length,repairs);
    if(i>0) assert.match(stem(body),/終了までを確認した区間の算術平均/);
    unique(body,(_,option)=>{
      const [m,f]=tableAt(body,option).rows[0];
      if(i===0) return m==='(Σᵢ₌₁ⁿ tᵢ)/n'&&f==='(Σᵢ₌₁ⁿ rᵢ)/n';
      const mean=(formula:string,kind:string,count:number)=>{
        const tokens=[...formula.matchAll(/([tr])([₁₂₃₄])/g)];
        return formula.endsWith('/'+count)&&tokens.length===count&&
          tokens.every((token,j)=>token[1]===kind&&'₁₂₃₄'.indexOf(token[2])===j);
      };
      return mean(m,'t',runs)&&mean(f,'r',repairs);
    });
  });
});

test('問43の残存数を発見割合の等式から独立に検算する',()=>{
  cases(43).forEach((body,i)=>{
    const values=[...stem(body).matchAll(/(\d+)個/g)].map(match=>Number(match[1]));
    const [detected,planted,found]=values;
    assert.equal(values.length,3);
    assert.ok(planted>found&&found>0);
    assert.match(stem(body),/発見数とソフトウェアのバグの発見数は比例/);
    if(i>0) assert.match(stem(body),/ソフトウェア固有のバグ/);
    numeric(body,value=>(value+detected)*found===detected*planted);
  });
});

test('問44の四つの真偽表を独立した真理値ビット列で全候補検証する',()=>{
  const maskByOperator:Record<string,number>={'A OR B':0b1110,'A AND B':0b1000,'A XOR B':0b0110,'A AND (NOT B)':0b0100};
  cases(44).forEach(body=>{
    const operator=/判定 (.+) に入る/.exec(figure(body,'44-branch').alt)?.[1];
    assert.ok(operator&&maskByOperator[operator]);
    unique(body,(_,choice)=>{
      const {columns,rows}=tableAt(body,choice);
      assert.deepEqual(columns,['A','B']);
      assert.equal(rows.length,[1,2,2,3][choice]);
      const outcomes=rows.map(([a,b])=>{
        assert.ok(['真','偽'].includes(a)&&['真','偽'].includes(b));
        return (maskByOperator[operator]>>(Number(a==='真')*2+Number(b==='真')))&1;
      });
      return outcomes.includes(0)&&outcomes.includes(1);
    });
  });
});

test('問46の工程別稼働を月単位で再現しピークを検算する',()=>{
  cases(46).forEach(body=>{
    const values=/開発期間(\d+)か月，開発工数(\d+)人月/.exec(stem(body));
    const percentages=[...figure(body,'46-allocation').alt.matchAll(/(\d+)%/g)].map(match=>Number(match[1]));
    assert.ok(values);
    const months=Number(values[1]), personMonths=Number(values[2]), allocations=percentages.slice(0,4), times=percentages.slice(4);
    assert.equal(percentages.length,8);
    assert.equal(allocations.reduce((sum,part)=>sum+part,0),100);
    assert.equal(times.reduce((sum,part)=>sum+part,0),100);
    const calendar=times.flatMap((duration,phase)=>{
      const slots=duration*months/100;
      const people=(allocations[phase]*personMonths/100)/slots;
      assert.ok(Number.isInteger(slots)&&Number.isInteger(people));
      return Array<number>(slots).fill(people);
    });
    assert.equal(calendar.length,months);
    assert.equal(calendar.reduce((sum,value)=>sum+value,0),personMonths);
    numeric(body,value=>calendar.includes(value)&&calendar.every(headcount=>headcount<=value));
  });
});

test('問49のID容量・未再利用と累計発行数から枯渇年度を再計算する',()=>{
  cases(49).forEach(body=>{
    assert.match(stem(body),/欠番として管理し，再利用は行わない/);
    const format=body.prompt[2], alphabet=body.prompt[3], history=body.prompt[5];
    assert.equal(format.type,'paragraph');
    assert.equal(alphabet.type,'paragraph');
    assert.equal(history.type,'table');
    const pattern=/^([XN]{5})/.exec(format.text)?.[1], size=Number(/の(\d+)文字/.exec(alphabet.text)?.[1]);
    assert.ok(pattern&&Number.isInteger(size));
    assert.deepEqual(history.columns,['年度','2004','2005','2006','2007']);
    const capacity=Array.from(pattern).reduce((choices,code)=>choices*(code==='X'?size:10),1);
    const totals=history.rows[0].slice(1).map(count=>Number(count.replaceAll(',','')));
    const growth=[1,2,3].map(i=>totals[i]-totals[i-1]).sort((a,b)=>a-b)[1];
    let running=totals[3],year=2007;
    while(running<capacity) {running+=growth;year++;}
    assert.deepEqual(options(body),['2008年度','2009年度','2010年度','2011年度']);
    unique(body,value=>value===year+'年度');
  });
});

test('問50のブロードキャストをCIDRブロックの最終アドレスとして再計算する',()=>{
  cases(50).forEach(body=>{
    const bits=(address:string)=>address.split('.').reduce((value,byte)=>value*256+Number(byte==='x'?0:byte),0);
    const [ip,mask]=[...stem(body).matchAll(/(?:\d{1,3}\.){3}(?:\d{1,3}|x)/g)].map(match=>match[0]);
    const hostCount=2**32-bits(mask);
    const first=Math.floor(bits(ip)/hostCount)*hostCount;
    const end=first+hostCount-1;
    assert.ok(Number.isInteger(Math.log2(hostCount)));
    assert.equal(bits(options(body)[0]),first);
    unique(body,value=>bits(value)===end);
  });
});

test('4種の管理図の意味登録と各入力の出題表示が一致する',()=>{
  assert.deepEqual(figures.map(item=>item.profile),renderers.map(item=>item.profile));
  assert.equal(figures.length,4);
  for(const [number,profile] of [[29,'29-state'],[34,'34-uptime'],[44,'44-branch'],[46,'46-allocation']] as const) {
    const contract=figures.find(item=>item.profile.endsWith('-'+profile));
    const view=renderers.find(item=>item.profile.endsWith('-'+profile));
    assert.ok(contract&&view);
    for(const bad of [[],[-1],[4],[.5],[0,1]]) assert.throws(()=>contract.validate(bad));
    cases(number).forEach((body,i)=>{
      const block=figure(body,profile);
      const values=[i];
      contract.validate(values);
      assert.equal(contract.alt(values),block.alt);
      const html=renderToStaticMarkup(createElement(view.component,{values,caption:block.caption}));
      assert.match(html,/aria-description=.*diagram-scroll.*<figcaption>/s);
      if(number===29) assert.equal([...html.matchAll(/data-task-edge=/g)].length,6);
      if(number===34) assert.equal([...html.matchAll(/data-uptime-label=/g)].length,[7,6,5,8][i]);
      if(number===44) assert.match(html,/命令.*<\/text>/);
      if(number===46) assert.equal([...html.matchAll(/\d+%<\/text>/g)].length,8);
    });
  }
});
