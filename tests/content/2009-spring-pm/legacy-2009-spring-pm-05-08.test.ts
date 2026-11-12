import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spring2009Pm05To08Specs as specs } from '../../../scripts/legacy-2009-spring-pm-05-08-specs';
import { legacy2009SpringPm0508Figures as figures } from '../../../src/core/generators/legacy-2009-spring-pm-05-08-figures';
import { legacy2009SpringPm0508FigureRenderers as renderers } from '../../../src/ui/Legacy2009SpringPm0508Figures';
import { compoundAnswerSignature,gradeAnswer,validateAnswerDefinition } from '../../../src/core/answers';
import { type GeneratedBody } from '../../../src/core/generators/definition';
import type { Attribution,Block,Question } from '../../../src/core/types';

const indices=[0,1,2,3];
const kana='アイウエオカキク';
const reviewPages=[18,21,25,29,34];
const official=['ウイアエウイ','ウイエウイエ','オアアウウオ','イウイイアオ'];
const widths=[[5,5,5,5,5,3],[4,4,4,4,4,4],[5,5,4,5,6,6],[4,4,4,4,5,5]];
const builds=(major:number)=>indices.map(index=>specs[major-5].definition.build([index]));
const paragraphs=(body:GeneratedBody)=>body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
const choiceIndex=(id:string)=>Number(id.split('-').at(-1))-1;
const bank=(body:GeneratedBody,slot:number)=>body.answerParts![slot].choiceIds.map(id=>body.choices[choiceIndex(id)][0]);
function partAnswer(body:GeneratedBody,slot:number) {
  const answer=body.partAnswers![slot];
  assert.equal(answer.kind,'choice');
  return answer;
}
function correctIndex(body:GeneratedBody,slot:number) {
  return body.answerParts![slot].choiceIds.indexOf(partAnswer(body,slot).choiceId);
}
function displayValue(block:Block) {
  if(block.type==='paragraph') return block.text;
  if(block.type==='table') return JSON.stringify([block.columns,block.rows]);
  assert.equal(block.type,'diagram');
  // Figure inputs and profile IDs are metadata; inspect the rendered answer's order.
  const order=block.alt.split('順で ').at(-1);
  assert.match(order!,/^\(\d, \d\)( → \(\d, \d\)){4}。$/);
  return order!;
}
function assertAnswer(body:GeneratedBody,slot:number,check:(block:Block,i:number)=>boolean) {
  assert.deepEqual(bank(body,slot).flatMap((candidate,i)=>check(candidate,i)?[i]:[]),[correctIndex(body,slot)]);
}
const paragraphValue=(block:Block)=>{assert.equal(block.type,'paragraph');return block.text;};
function figureFor(body:GeneratedBody,suffix:string) {
  const figure=body.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+suffix));
  assert.ok(figure?.type==='diagram'&&figure.scene.kind==='source_figure');
  return figure;
}
function question(body:GeneratedBody):Question {
  const attribution:Attribution={origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex']};
  return {id:'stage3-2009-spring-pm-test',answerParts:body.answerParts,correctAnswer:{parts:body.partAnswers,attribution},
    choices:body.choices.map((blocks,i)=>({id:'choice-value-'+(i+1),content:{blocks,attribution}}))} as Question;
}

test('問5～8の公式16ページ・24欄・各解答群を照合する',()=>{
  assert.equal(specs.length,4);
  for(const [i,spec] of specs.entries()) {
    assert.equal(spec.number,5+i);
    assert.equal(spec.definition.source,'2009h21h-fe-pm-'+spec.number);
    assert.deepEqual(spec.pages,Array.from({length:reviewPages[i+1]-reviewPages[i]},(_,p)=>reviewPages[i]+p));
    assert.ok(Object.values(spec.originalPageAlt).every(alt=>alt.length>45&&alt.length<=2000));
    assert.equal(spec.definition.sourceAnswer.replaceAll('／',''),official[i]);
    assert.deepEqual(spec.original.answerParts!.map(part=>part.choiceIds.length),widths[i]);
    assert.equal(spec.original.answerParts!.map((_,slot)=>kana[correctIndex(spec.original,slot)]).join(''),official[i]);
  }
  assert.equal(specs.reduce((n,spec)=>n+spec.original.answerParts!.length,0),24);
  assert.deepEqual(specs[2].original.answerParts!.map(part=>part.label),['a','b','c','設問2','d','e']);
  assert.match(specs[0].originalPageAlt[18],/月末処理モジュール.*データベース/);
  assert.match(specs[1].originalPageAlt[24],/網掛け.*0.68.*0.95/s);
  assert.match(specs[2].originalPageAlt[27],/100，95，93，92，105，115，110/);
  assert.match(specs[3].originalPageAlt[30],/12 ▲ CC = NC.*26 ■ More ＞ 0.*38 ▲ Image\[Vt, Ht\] = CC.*44 ・Return/s);
  assert.deepEqual(specs[3].definition.fixedReferenceAssetIds,['asset-ipa-2009h21h-fe-pm-p003','asset-ipa-2009h21h-fe-pm-p004']);
  assert.deepEqual(specs[3].original.contexts?.[0].blocks.map(block=>block.type==='image'&&block.assetId),specs[3].definition.fixedReferenceAssetIds);
});

test('各系列の有限入力4件で本文と実質的な複合正答が異なる',()=>{
  for(const spec of specs) {
    const {definition}=spec;
    assert.deepEqual(definition.reference,[0]);
    assert.deepEqual(definition.fields.map(field=>[field.minimum,field.maximum]),[[0,3]]);
    assert.equal(definition.answerVariation,undefined);
    for(const bad of [[],[-1],[4],[.5],[NaN],[0,0],Array(1),Object.assign([0],{extra:1})]) assert.throws(()=>definition.build(bad));
    const signatures=new Set<string>(), visible=new Set<string>(), prompts=new Set<string>();
    for(const index of indices) {
      const body=definition.build([index]),q=question(body);
      assert.deepEqual(body,definition.build([index]));
      assert.equal(body.answerParts!.length,6);
      assert.ok(body.explanation.split('\n').length>=4);
      validateAnswerDefinition(q);
      signatures.add(compoundAnswerSignature(q));
      prompts.add(JSON.stringify(body.prompt));
      visible.add(JSON.stringify(body.answerParts!.map((_,slot)=>displayValue(bank(body,slot)[correctIndex(body,slot)]))));
      for(let slot=0;slot<6;slot++){
        const values=bank(body,slot).map(displayValue);
        assert.equal(values.length,new Set(values).size);
      }
      const exact=Object.fromEntries(body.answerParts!.map((part,slot)=>[part.id,partAnswer(body,slot).choiceId]));
      assert.equal(gradeAnswer(q,{selectedPartChoices:exact}).outcome,'correct');
      for(const part of body.answerParts!) {
        for(const choiceId of part.choiceIds.filter(id=>id!==exact[part.id])) {
          assert.equal(gradeAnswer(q,{selectedPartChoices:{...exact,[part.id]:choiceId}}).outcome,'incorrect');
        }
      }
    }
    assert.equal(signatures.size,4);
    assert.equal(visible.size,4);
    assert.equal(prompts.size,4);
  }
});

test('問5の処理依存、最小データ、残高閾値とD/Eの順序を状態遷移で検算する',()=>{
  const precedes=[
    ['データベースの検索','処理B'],['処理B','処理A'],['処理A','処理C'],
  ];
  const orderings=(items:string[]):string[][]=>items.length?items.flatMap((item,i)=>
    orderings(items.filter((_,j)=>i!==j)).map(rest=>[item,...rest])):[[]];
  const [atm]=orderings(['処理A','処理B','処理C','データベースの検索']).filter(order=>
    precedes.every(([a,b])=>order.indexOf(a)<order.indexOf(b)));
  builds(5).forEach((body,i)=>{
    const before=i%2===1, different=i>=2;
    const amount=different?'その口座の口座管理手数料':'所定の口座管理手数料';
    const balance='その口座の残高', category='その口座の口座種別', mark='その口座の手数料マークの値';
    const needs=[[balance,...(different?[category]:[])],[amount,balance,mark]];
    const text=paragraphs(body);
    assert.match(text,/ほかの操作は行えない.*到着した順番.*負の値になることもある/s);
    assert.equal(/引落し前の残高は別に保存しない/.test(text),before);
    assert.equal(/口座種別は/.test(text),different);
    for(let slot=0;slot<3;slot++) assertAnswer(body,slot,candidate=>paragraphValue(candidate)===atm[slot]);
    needs.forEach((items,i)=>assertAnswer(body,i+3,candidate=>{
      const listed=paragraphValue(candidate).split('，');
      return listed.length===items.length&&items.every(item=>listed.includes(item));
    }));
    const limits=[[100000],[120000],[80000,150000],[50000,200000]][i];
    const executesCorrectly=(operations:string[])=>limits.every(limit=>[-20,limit-1,limit,limit+50,limit+101].every(initial=>{
      const charge=100;
      const expectedMark=(before?initial:initial-charge)<limit;
      let current=true, next=false, remaining=initial;
      for(const operation of operations) {
        if(operation==='D') {
          next=remaining<limit;
          if(!before) current=next;
        } else if(current) remaining-=charge;
      }
      return remaining===initial-charge&&next===expectedMark;
    }));
    const orders=[['D','E'],['E','D']];
    assertAnswer(body,5,(_,candidate)=>candidate===2?orders.every(executesCorrectly):executesCorrectly(orders[candidate]));
    // ATM refuses insufficient balance after including the ATM fee and only charges when the mark is true.
    assert.deepEqual([[120,100,true],[120,100,false],[130,100,true]].map(([balance,withdraw,charged])=>{
      const after=Number(balance)-Number(withdraw)-(charged?30:0);
      return after<0?null:after;
    }),[null,20,0]);
  });
});

const riskInputs=[
  [[20,12,8],[16,12,10],2],
  [[23,15,11],[19,15,13],1],
  [[27,16,9],[22,15,10],2],
  [[28,15,10],[25,17,13],1],
] as const;
test('問6の見積り見直し・変更管理と3点見積りを独立した整数式で全候補検算する',()=>{
  builds(6).forEach((body,i)=>{
    const text=paragraphs(body);
    assert.match(text,/要件定義書がB社に渡された.*M1が予想以上に複雑.*M2の操作性を自社判断.*計画と実績の差異分析.*審議・承認/s);
    const rules=[/要件定義書を受け取った時点.*見直さなかった/,/A社との調整を行わないで勝手に機能を広げ/,/納期を2週間延ばした後の更なる遅れ/,/操作性を一層高めたこと/];
    rules.forEach((rule,slot)=>assertAnswer(body,slot,candidate=>rule.test(paragraphValue(candidate))));
    const [first,second,multiplier]=riskInputs[i];
    const numerator=[...first,...second].reduce((sum,x,j)=>sum+x*(j%3===1?4:1),0);
    const tenthSigma=Math.round(Math.hypot(first[0]-first[2],second[0]-second[2])*10/6);
    assertAnswer(body,4,candidate=>6*Number(paragraphValue(candidate))===numerator);
    assertAnswer(body,5,candidate=>Math.round(10*Number(paragraphValue(candidate)))===multiplier*tenthSigma);
    assert.match(text,new RegExp('確率'+(multiplier===2?'0\\.95':'0\\.68')+'で作業が完了'));
    assert.match(figureFor(body,'6-formula').alt,/悲観値＋4×最頻値＋楽観値/);
    const table=figureFor(body,'6-pert').alt;
    for(const estimate of [first,second]) assert.ok(table.includes(estimate.join('，')+'，'));
    assert.match(table,/網掛けで非表示/);
    assert.ok(table.endsWith('標準偏差 '+tenthSigma/10+'。'));
  });
});

function median(values:number[]) {
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
}
function classify(series:number[]) {
  const years=[0,12,24].map(first=>series.slice(first,first+12));
  const swing=Math.max(...series)-Math.min(...series);
  if(swing<65) return '不規則変動だけ';
  const annualRange=Math.abs(median(years[2])-median(years[0]));
  const lagError=median(series.slice(12).map((value,i)=>Math.abs(value-series[i])));
  assert.notEqual(annualRange<25&&lagError<20,annualRange>40&&lagError>20);
  return annualRange<25?'季節変動と不規則変動':'傾向変動と不規則変動';
}
test('問7の需要の変動と予測値を表示系列・実績表から別計算で照合する',()=>{
  const expectedSubjects=['Z','Z','X','Y'];
  builds(7).forEach((body,i)=>{
    const texts=paragraphs(body);
    [/長期的な増加又は減少が継続/,/1年ごとに繰り返される/,/傾向変動や季節変動では説明できない/]
      .forEach((rule,slot)=>assertAnswer(body,slot,candidate=>rule.test(paragraphValue(candidate))));
    const graph=figureFor(body,'7-series');
    const curves=[...graph.alt.matchAll(/製品([XYZ])（[^）]+），1月から順に月ごとの値：([\d，]+)/g)]
      .map(match=>match[2].split('，').map(Number));
    assert.equal(curves.length,3);
    assert.ok(curves.every(curve=>curve.length===36&&curve.every(value=>value>=0&&value<=400)));
    const classified=curves.map(classify);
    assertAnswer(body,3,candidate=>candidate.type==='table'&&candidate.rows[0].every((value,j)=>value===classified[j]));
    const table=figureFor(body,'7-history');
    assert.ok(table.caption.includes('製品'+expectedSubjects[i]));
    assert.match(table.alt,/年：2008年。月：6月，7月，8月，9月，10月，11月，12月。/);
    const history=/需要実績：([\d，]+)。/.exec(table.alt);
    assert.ok(history);
    const data=history[1].split('，').map(Number);
    assert.deepEqual(curves['XYZ'.indexOf(expectedSubjects[i])].slice(-7),data);
    const alpha=Number(/指数aを(\d\.\d)として/.exec(texts)?.[1]);
    const novForecast=Number(/11月の予測値は(\d+)であった/.exec(texts)?.[1]);
    assertAnswer(body,4,candidate=>3*Number(paragraphValue(candidate))===data[3]+data[4]+data[5]);
    assertAnswer(body,5,candidate=>Math.abs(Number(paragraphValue(candidate))-novForecast-alpha*(data[5]-novForecast))<1e-8);
    assert.ok(bank(body,4).every(candidate=>Number.isSafeInteger(Number(paragraphValue(candidate)))));
    assert.deepEqual(bank(body,4).map(paragraphValue).map(Number),bank(body,4).map(paragraphValue).map(Number).sort((a,b)=>a-b));
  });
});

type Point=readonly [number,number];
function pixelRows(printed:string) {
  return printed.split('／').map(row=>Array.from(row,Number));
}
function directions([row,col]:Point) {
  return [[row-1,col],[row,col-1],[row+1,col],[row,col+1]] as const;
}
function independentTrace(grid:number[][],start:Point,mode:number) {
  const color=grid[start[0]-1][start[1]-1];
  const eligible=(point:Point,found:Point[])=>grid[point[0]-1]?.[point[1]-1]===color&&
    !found.some(([r,c])=>r===point[0]&&c===point[1]);
  const next=(point:Point)=>{const [u,l,d,r]=directions(point);return mode===0||mode===2?[l,d,r,u]:[u,l,d,r];};
  const found=[start];
  if(mode===0) {
    const path=[start];
    while(path.length) {
      const node=next(path.at(-1)!).find(point=>eligible(point,found));
      if(node) {found.push(node);path.push(node);}
      else path.pop();
    }
  } else {
    let pending=[start];
    while(pending.length) {
      const [first,...rest]=pending;
      const discovered=next(first).filter(point=>eligible(point,found));
      found.push(...discovered);
      pending=mode===3?[...rest,...discovered]:[...discovered.reverse(),...rest];
    }
  }
  return found;
}
function sameColorOutcome(count:number,start:number) {
  let pending=[start];
  const states=new Set<string>();
  while(pending.length) {
    const key=pending.join(',');
    if(states.has(key)) return 'cycle';
    states.add(key);
    const next=pending.pop()!;
    if(next>0) pending.push(next-1);
    if(next<count-1) pending.push(next+1);
    if(pending.length>64) return 'overflow';
  }
  return 'complete';
}
test('問8の塗替え4候補・外周設定と停止性を座標列と状態探索で照合する',()=>{
  const originalOrders=[
    [[5,3],[5,2],[6,2],[7,2],[7,3]],[[5,3],[4,3],[5,2],[4,2],[6,2]],
    [[5,3],[5,2],[4,3],[4,2],[4,4]],[[5,3],[4,3],[5,2],[3,3],[4,2]],
  ];
  const otherOrders=[
    [[4,4],[4,3],[4,5],[4,6],[3,6]],
    [[6,3],[5,3],[6,2],[7,3],[7,4]],
    [[4,8],[3,8],[5,8],[6,8],[6,7]],
  ];
  builds(8).forEach((body,i)=>{
    const example=figureFor(body,'8-example');
    const coordinates=/開始点 Image\[(\d), (\d)\]/.exec(example.alt);
    const images=/実行前：([123／]+)。実行後：([123／]+)。/.exec(example.alt);
    assert.ok(coordinates&&images);
    const start:Point=[Number(coordinates[1]),Number(coordinates[2])];
    const initial=pixelRows(images[1]), actual=pixelRows(images[2]);
    assert.equal(initial.length,8);
    assert.ok(initial.every(row=>row.length===8));
    if(i===0) assert.equal(images[1],'22233322／22332222／23322222／23333322／23322332／23222232／23322332／22333322');
    const order=independentTrace(initial,start,1);
    assert.deepEqual(order.slice(0,5),i===0?originalOrders[1]:otherOrders[i-1]);
    const trace=(candidate:Block)=>[...displayValue(candidate).matchAll(/\((\d), (\d)\)/g)].map(match=>[Number(match[1]),Number(match[2])]);
    assertAnswer(body,0,candidate=>JSON.stringify(trace(candidate))===JSON.stringify(order.slice(0,5)));
    bank(body,0).forEach((candidate,j)=>{
      assert.deepEqual(trace(candidate),independentTrace(initial,start,j).slice(0,5));
      if(i===0) assert.deepEqual(trace(candidate),originalOrders[j]);
    });
    assert.deepEqual(actual,initial.map((row,r)=>row.map((color,c)=>order.some(([v,h])=>v===r+1&&h===c+1)?1:color)));
    assertAnswer(body,1,candidate=>/Image の各添字の範囲チェックを省略/.test(paragraphValue(candidate)));
    const expressions=[(m:number,n:number)=>2*(m+1)*(n+1),(m:number,n:number)=>2*(m+n),
      (m:number,n:number)=>2*(m+n+2),(m:number,n:number)=>2*(m+n-2)];
    const wallCells=(m:number,n:number)=>new Set(Array.from({length:m*n},(_,index)=>{
      const r=Math.floor(index/n)+1,c=index%n+1;
      return directions([r,c]).filter(([v,h])=>v===0||h===0||v===m+1||h===n+1).map(point=>point.join(','));
    }).flat()).size;
    assert.deepEqual(bank(body,2).map(paragraphValue),['2(m＋1)(n＋1)','2(m＋n)','2(m＋n＋2)','2(m＋n－2)']);
    assertAnswer(body,2,(_,j)=>[[1,1],[5,7],[8,8],[10,3]].every(([m,n])=>expressions[j](m,n)===wallCells(m,n)));
    const walls=[(cc:number)=>cc,(_:number,nc:number)=>nc,(cc:number)=>256-cc,(_:number,nc:number)=>255-nc];
    assert.deepEqual(bank(body,3).map(paragraphValue),['・Wall ← CC','・Wall ← NC','・Wall ← 256 − CC','・Wall ← 255 − NC']);
    assertAnswer(body,3,(_,j)=>{
      for(let cc=0;cc<256;cc++) for(let nc=0;nc<256;nc++) if(cc!==nc) {
        const wall=walls[j](cc,nc);
        if(wall===cc||wall<0||wall>255) return false;
      }
      return true;
    });
    const outcomes=[sameColorOutcome(1,0),sameColorOutcome(2,0),sameColorOutcome(3,1)];
    assert.deepEqual(outcomes,['complete','cycle','overflow']);
    assertAnswer(body,4,candidate=>outcomes[0]==='complete'&&/同じ色で塗り替えて正しく終了/.test(paragraphValue(candidate)));
    assertAnswer(body,5,candidate=>outcomes[1]==='cycle'&&/一定値以下であるが処理が無限/.test(paragraphValue(candidate)));
    assert.match(body.explanation,/More は64を超える/);
    const program=figureFor(body,'8-program').alt;
    assert.equal(program.split('\n').length,44);
    assert.match(program,/30 　　・CheckAndStack\(V − 1, H\)\n31 　　・CheckAndStack\(V, H − 1\)\n32 　　・CheckAndStack\(V \+ 1, H\)\n33 　　・CheckAndStack\(V, H \+ 1\)/);
  });
});

test('全13図の入力域、意味、表示を全4条件で突き合わせる',()=>{
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  const represented=new Set<string>();
  for(const spec of specs) for(const i of indices) {
    const body=spec.definition.build([i]);
    for(const block of [...body.prompt,...body.choices.flat()]) if(block.type==='diagram') {
      assert.equal(block.scene.kind,'source_figure');
      const {profile,values}=block.scene;
      const figure=figures.find(figure=>figure.profile===profile);
      const renderer=renderers.find(renderer=>renderer.profile===profile);
      assert.ok(figure&&renderer);
      figure.validate(values);
      assert.equal(figure.alt(values),block.alt);
      const html=renderToStaticMarkup(createElement(renderer.component,{values,caption:block.caption}));
      assert.match(html,/aria-description=.*diagram-scroll.*<figcaption>/s);
      if(profile.endsWith('8-program')) {
        assert.equal([...html.matchAll(/data-program-line="/g)].length,44);
        assert.equal([...html.matchAll(/data-control="/g)].length,5);
      }
      if(profile.includes('8-choice')) {
        assert.equal([...html.matchAll(/data-pixel="/g)].length,64);
        assert.equal([...html.matchAll(/data-paint-step="/g)].length,5);
        for(const [,r,c] of displayValue(block).matchAll(/\((\d), (\d)\)/g))
          assert.match(html,new RegExp('data-cell="'+r+','+c+'"><rect[^>]+data-pixel="1"[^>]*></rect><text[^>]+data-paint-step='));
      }
      if(profile.endsWith('6-pert')) {
        assert.match(html,/<th[^>]+colSpan="3"[^>]*>作業日数/);
        assert.equal([...html.matchAll(/data-hidden-pert="/g)].length,4);
      }
      if(profile.endsWith('7-history')) assert.match(html,/<th[^>]+colSpan="7"[^>]*>2008年/);
      represented.add(profile);
    }
  }
  assert.equal(represented.size,13);
  for(const figure of figures) {
    assert.deepEqual(figure.domain,[[0,3]]);
    for(const invalid of [[],[-1],[4],[1,2],[NaN],[.5]]) assert.throws(()=>figure.validate(invalid));
    for(const i of indices) assert.ok(figure.alt([i]).length>15);
  }
});
