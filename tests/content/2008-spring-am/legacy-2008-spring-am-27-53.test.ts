import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {legacy2008SpringAm27To53Definitions as definitions} from '../../../src/core/generators/legacy-2008-spring-am-27-53';
import {legacy2008SpringAm2753Figures as figures} from '../../../src/core/generators/legacy-2008-spring-am-27-53-figures';
import {legacy2008SpringAm2753FigureRenderers as renderers} from '../../../src/ui/Legacy2008SpringAm2753Figures';
import {original} from '../../../src/core/generators/legacy-2008-spring-am-27-53-shared';
import type {GeneratedBody} from '../../../src/core/generators/definition';
import type {Block} from '../../../src/core/types';
import {knowledgeFacts} from '../../fixtures/legacy-2008-spring-am-27-53-review';

const indices=[0,1,2,3];
const keys=Array.from('エウイエウエアアウアアイウアエウイウイイイエウウエアイ');
const pages=[12,12,13,13,13,14,14,15,15,15,15,16,16,16,16,17,17,17,18,18,18,19,19,20,20,21,21];
const cases=(number:number)=>indices.map(i=>definitions[number-27].build([i]));
const blockValue=(block:Block)=>{
  if(block.type==='paragraph') return block.text;
  assert.equal(block.type,'diagram');
  return block.alt;
};
const choices=(body:GeneratedBody)=>body.choices.map(blocks=>{
  assert.equal(blocks.length,1);
  return blockValue(blocks[0]);
});
const stem=(body:GeneratedBody)=>{
  const first=body.prompt[0];assert.equal(first.type,'paragraph');return first.text;
};
function promptDrawing(body:GeneratedBody,suffix:string) {
  const block=body.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+suffix));
  assert.ok(block?.type==='diagram'&&block.scene.kind==='source_figure');
  return block;
}
function unique(body:GeneratedBody,accept:(text:string,index:number)=>boolean) {
  assert.deepEqual(choices(body).flatMap((value,i)=>accept(value,i)?[i]:[]),[body.correctIndex]);
}
function ascending(values:number[]) {
  assert.deepEqual(values,[...values].sort((a,b)=>a-b));
}
function figureMarkup(block:Block) {
  assert.ok(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene;
  const component=renderers.find(view=>view.profile===profile)?.component;
  assert.ok(component);
  return renderToStaticMarkup(createElement(component,{values,caption:block.caption}));
}

test('27問の基準を公式の物理・印刷頁、原文、正答、四つの選択肢に照合する',()=>{
  assert.equal(definitions.length,27);
  definitions.forEach((def,i)=>{
    const n=27+i,record=original(n),base=def.build([0]);
    assert.equal(def.source,'2008h20h-fe-am-'+n);
    assert.equal(record.page,pages[i]);
    assert.equal(def.sourceAnswer,keys[i]);
    assert.equal(record.key,keys[i]);
    assert.equal('アイウエ'[base.correctIndex!],keys[i]);
    assert.equal(stem(base),record.prompt);
    assert.deepEqual(n===50?choices(base).map(value=>value.replace('横軸は使用量，縦軸は利用料金，原点に0。','')):choices(base),record.choices);
  });
});
test('全108入力で構成・境界・決定性・4つの実質正答を確認する',()=>{
  for(const def of definitions) {
    assert.deepEqual(def.reference,[0]);
    assert.deepEqual(def.fields.map(field=>[field.minimum,field.maximum]),[[0,3]]);
    assert.equal(def.answerVariation,undefined);
    for(const bad of [[],[-1],[4],[.5],[NaN],[1,1],Array(1),Object.assign([0],{extra:true})]) assert.throws(()=>def.build(bad));
    const all=indices.map(i=>def.build([i])),baseline=all[0];
    all.forEach((body,i)=>{
      assert.deepEqual(body,def.build([i]));
      assert.equal(body.choices.length,4);
      assert.deepEqual(body.prompt.map(block=>block.type),baseline.prompt.map(block=>block.type));
      assert.deepEqual(body.choices.map(option=>option.map(block=>block.type)),baseline.choices.map(option=>option.map(block=>block.type)));
      assert.deepEqual(body.prompt.flatMap(block=>block.type==='diagram'&&block.scene.kind==='source_figure'?[block.scene.profile]:[]),
        baseline.prompt.flatMap(block=>block.type==='diagram'&&block.scene.kind==='source_figure'?[block.scene.profile]:[]));
      assert.equal(new Set(choices(body)).size,4);
      assert.ok(body.correctIndex!==undefined&&body.correctIndex>=0&&body.correctIndex<4);
      assert.ok(body.explanation.trim().length>25);
    });
    assert.equal(new Set(all.map(body=>choices(body)[body.correctIndex!])).size,4);
    assert.equal(new Set(all.map(body=>JSON.stringify(body.prompt.map(block=>block.type==='diagram'?[block.type,block.alt]:block)))).size,4);
  }
});
test('19知識系列の全候補について条件、役割、真偽を独立した対応資料で照合する',()=>{
  for(const [raw,fact] of Object.entries(knowledgeFacts)) {
    const n=Number(raw);
    cases(n).forEach((body,i)=>{
      assert.match(stem(body),fact.query[i],'問'+n);
      choices(body).forEach((text,j)=>assert.match(text,fact.roles[j],'問'+n+' 選択肢'+'アイウエ'[j]));
      unique(body,text=>fact.answer[i].test(text));
    });
  }
  assert.equal(Object.keys(knowledgeFacts).length,19);
});

test('問27のLRUを各ページの最終参照時刻から検算する',()=>{
  cases(27).forEach(body=>{
    const prompt=stem(body),reads=/ページ([\d，]+)の順にアクセス/.exec(prompt)?.[1].split('，').map(Number);
    assert.ok(reads&&reads.length===10);
    assert.match(prompt,/ページ枠が4.*初期状態では主記憶にどのページも存在しない/);
    const times=new Map<number,number>();
    let evicted:number|undefined;
    for(const [tick,value] of reads.entries()) {
      evicted=undefined;
      if(!times.has(value)&&times.size===4) {
        evicted=[...times.entries()].reduce((older,entry)=>entry[1]<older[1]?entry:older)[0];
        times.delete(evicted);
      }
      times.set(value,tick);
    }
    assert.ok(evicted);
    ascending(choices(body).map(Number));
    unique(body,choice=>Number(choice)===evicted);
  });
});
test('問31の入出力経路とCPUの役割から構成名を照合する',()=>{
  const expected=[
    [/待機系として現用系の故障に備え/,/切替装置.*現用系周辺装置.*待機系周辺装置/,'デュプレックスシステム'],
    [/1系統でオンライン処理/,/CPU1台.*切替装置と待機系はない/,'シンプレックスシステム'],
    [/同じオンライン処理を同時/,/同報装置.*CPU・CPU.*結果照合/,'デュアルシステム'],
    [/一つの仕事を部分に分け/,/作業分割.*CPU・CPU.*結果統合/,'パラレルプロセッサシステム'],
  ] as const;
  cases(31).forEach((body,i)=>{
    const [prompt,diagram,answer]=expected[i];
    assert.match(stem(body),prompt);
    assert.match(promptDrawing(body,'31-system').alt,diagram);
    unique(body,text=>text===answer);
  });
});
test('問32の四つの式を全装置の状態列挙から独立に検算する',()=>{
  const superscripts='⁰¹²³⁴⁵⁶⁷⁸⁹';
  cases(32).forEach(body=>{
    const topology=promptDrawing(body,'32-lan'), match=/クライアント(\d)台とプリンタ(\d)台/.exec(topology.alt);
    assert.ok(match);
    const [client,printer]=match.slice(1).map(Number);
    assert.match(stem(body),new RegExp(client+'台のクライアント及び'+printer+'台のプリンタ'));
    const t=body.prompt[2];
    assert.equal(t.type,'table');
    assert.deepEqual(t.rows,[['サーバ','a'],['クライアント','b'],['プリンタ','c'],['LAN','1']]);
    const a=.74,b=.57,c=.63,probabilities=[a,...Array<number>(client).fill(b),...Array<number>(printer).fill(c)];
    let expected=0;
    for(let bits=0;bits<2**probabilities.length;bits++){
      const working=probabilities.map((_,i)=>Boolean(bits&(1<<i)));
      if(working[0]&&working.slice(1,1+client).some(Boolean)&&working.slice(1+client).some(Boolean))
        expected+=probabilities.reduce((weight,probability,i)=>weight*(working[i]?probability:1-probability),1);
    }
    const bc=superscripts[client],pc=superscripts[printer];
    const formulas:Record<string,number>={
      ['ab'+bc+'c'+pc]:a*b**client*c**printer,
      ['a(1−b'+bc+')(1−c'+pc+')']:a*(1-b**client)*(1-c**printer),
      ['a(1−b)'+bc+'(1−c)'+pc]:a*(1-b)**client*(1-c)**printer,
      ['a(1−(1−b)'+bc+')(1−(1−c)'+pc+')']:a*(1-(1-b)**client)*(1-(1-c)**printer),
    };
    unique(body,text=>Math.abs(formulas[text]-expected)<1e-10);
    const rendered=figureMarkup(topology);
    assert.equal([...rendered.matchAll(/data-lan-device="client"/g)].length,client);
    assert.equal([...rendered.matchAll(/data-lan-device="printer"/g)].length,printer);
  });
});
test('問33の直列故障率と稼働時間を週間の期待故障回数から照合する',()=>{
  cases(33).forEach(body=>{
    const match=/(\d+)台の磁気ディスクをすべて使用し，1週間に(\d+)時間連続運転する.*MTBFが([\d,]+)時間/.exec(stem(body));
    assert.ok(match);
    const [n,hours,mtbf]=match.slice(1).map(x=>Number(x.replaceAll(',','')));
    assert.match(stem(body),/MTTRはMTBFに対して無視.*磁気ディスク以外の構成要素の故障は考慮しない/);
    const number=(text:string)=>Number(text.replaceAll(',',''));
    ascending(choices(body).map(number));
    unique(body,text=>Math.abs(Array<number>(n).fill(hours*number(text)/mtbf).reduce((a,b)=>a+b,0)-1)<1e-10);
  });
});
test('問42のデータフローで外部入力から得られない項目を四つのストアと照合する',()=>{
  const flow=[
    [/受注システム.*受注情報.*売上計算.*売上台帳/,/売上管理システム/,'単価ファイル'],
    [/請求受付.*請求対象.*請求額計算.*請求書/,/実際に計上された売上金額/,'売上ファイル'],
    [/出荷システム.*出荷情報.*受注照合.*出荷記録/,/元の注文の内容と照合/,'受注ファイル'],
    [/請求システム.*請求情報.*残高計算.*残高台帳/,/実際に受領した入金額/,'入金ファイル'],
  ] as const;
  cases(42).forEach((body,i)=>{
    const [alt,query,answer]=flow[i];
    const diagram=promptDrawing(body,'42-dfd').alt;
    assert.match(diagram,alt);
    assert.match(diagram,/データストアAからも/);
    assert.match(stem(body),query);
    unique(body,text=>text===answer);
  });
});

const pairPattern=/\(A＝(\d+)，B＝(\d+)\)/g;
function pairs(text:string) {
  const result=[...text.matchAll(pairPattern)].map(match=>[Number(match[1]),Number(match[2])] as const);
  assert.equal(result.length,2);
  return result;
}
test('問48で二条件を独立評価し、複数条件網羅に必要な追加データを全候補検算する',()=>{
  const op:Record<string,(a:number,b:number)=>boolean>={'<':(a,b)=>a<b,'>':(a,b)=>a>b,'≥':(a,b)=>a>=b,'=':(a,b)=>a===b,'≠':(a,b)=>a!==b};
  cases(48).forEach(body=>{
    const description=promptDrawing(body,'48-flow').alt;
    const match=/A ([<>≥]) (\d+) (or|and) B ([=≠]) (\d+)/.exec(description);
    assert.ok(match);
    const [,,left,join,,right]=match;
    const prior=body.prompt[3];
    assert.equal(prior.type,'paragraph');
    const outcomes=([a,b]:readonly [number,number])=>[op[match[1]](a,Number(left)),op[match[4]](b,Number(right))];
    const initial=pairs(prior.text).map(outcomes);
    assert.equal(new Set(initial.map(([a,b])=>join==='or'?a||b:a&&b)).size,2);
    unique(body,text=>{
      const all=[...initial,...pairs(text).map(outcomes)].map(([a,b])=>String(a)+','+String(b));
      return ['false,false','false,true','true,false','true,true'].every(combination=>all.includes(combination));
    });
  });
});
test('問50の実際の折れ線を傾き・初期値・上限で分類する',()=>{
  const checks=[
    (slopes:number[],start:number)=>start===183&&slopes.every((s,i)=>s>0&&(i===0||s<slopes[i-1])),
    (slopes:number[],start:number)=>start===183&&slopes[0]>0&&slopes.slice(1).every(s=>s===0),
    (slopes:number[],start:number)=>start===183&&slopes.every((s,i)=>s>0&&(i===0||s>slopes[i-1])),
    (slopes:number[],start:number)=>start<183&&slopes.every(s=>s<0),
  ];
  cases(50).forEach((body,i)=>{
    assert.match(stem(body),[/逓減課金/,/所定の上限/,/逓増課金/,/割引後の請求額が下がる/][i]);
    unique(body,(_,choice)=>{
      const svg=figureMarkup(body.choices[choice][0]), match=/points="([^"]+)" data-fee-curve="true"/.exec(svg);
      assert.ok(match);
      const points=match[1].split(' ').map(pair=>pair.split(',').map(Number));
      const slopes=points.slice(1).map(([x,y],j)=>(points[j][1]-y)/(x-points[j][0]));
      return checks[i](slopes,points[0][1]);
    });
  });
});
test('問53のネットワークアドレスをCIDRブロックの先頭で独立に検算する',()=>{
  const number=(address:string)=>address.split('.').reduce((integer,octet)=>integer*256+Number(octet),0);
  cases(53).forEach(body=>{
    const parts=body.prompt.slice(1).map(block=>blockValue(block).split('：')[1]);
    assert.equal(parts.length,2);
    const [host,mask]=parts.map(number),group=2**32-mask,low=host-host%group;
    assert.ok(Number.isInteger(Math.log2(group)));
    ascending(choices(body).map(number));
    assert.equal(number(choices(body)[2]),low+group-1);
    unique(body,text=>number(text)===low);
  });
});
test('8管理図の役割と代替説明、表示を全条件で検査する',()=>{
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  const represented=new Set<string>();
  for(const n of [31,32,42,48,50]) for(const body of cases(n)) for(const block of [...body.prompt,...body.choices.flat()]) {
    if(block.type!=='diagram'||block.scene.kind!=='source_figure')continue;
    const {profile,values}=block.scene,contract=figures.find(figure=>figure.profile===profile);
    assert.ok(contract);
    contract.validate(values);
    assert.equal(contract.alt(values),block.alt);
    assert.match(figureMarkup(block),/aria-description=.*diagram-scroll.*<svg.*aria-labelledby=.*aria-describedby=.*<title.*<desc.*<figcaption>/s);
    represented.add(profile);
  }
  assert.equal(represented.size,8);
  for(const figure of figures) for(const invalid of [[],[4],[-1],[.25],[0,0]])assert.throws(()=>figure.validate(invalid));
});
