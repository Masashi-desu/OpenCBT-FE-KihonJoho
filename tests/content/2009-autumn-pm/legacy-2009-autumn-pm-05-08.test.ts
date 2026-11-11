import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { autumn2009Pm05To08Specs } from '../../../scripts/legacy-2009-autumn-pm-05-08-specs';
import { legacy2009AutumnPm05To08Definitions as definitions } from '../../../src/core/generators/legacy-2009-autumn-pm-05-08';
import { legacy2009AutumnPm0508Figures as figures } from '../../../src/core/generators/legacy-2009-autumn-pm-05-08-figures';
import { legacy2009AutumnPm0508FigureRenderers as renderers } from '../../../src/ui/Legacy2009AutumnPm0508Figures';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Attribution, Block, Question } from '../../../src/core/types';
import { displayedAnswerParts, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';

const kana = 'アイウエオカキクケコ';
const book = [21, 26, 29, 33, 39];
const answers = ['アエカカアイオ','オエウアエア','アアアアウイイ','イイエイエ'];
const sizes = [[6,6,6,6,6,6,6],[6,6,6,4,4,6],[4,4,4,5,4,4,3],[3,4,6,6,4]];
const text = (body:GeneratedBody) => body.prompt.flatMap(block => block.type==='paragraph' ? [block.text] : []).join('\n');
const images = (body:GeneratedBody) => body.prompt.filter(block => block.type==='diagram');
const tables = (body:GeneratedBody) => body.prompt.filter(block => block.type==='table');
const cases = (major:number) => Array.from({length:4},(_,i)=>definitions[major-5].build([i]));

function option(blocks: Block[]) {
  assert.equal(blocks.length,1);
  const [block]=blocks;
  assert.ok(block.type==='paragraph'||block.type==='code');
  return block.text;
}
function bank(body:GeneratedBody,slot:number) {
  return body.answerParts![slot].choiceIds.map(id=>option(body.choices[Number(id.split('-').at(-1))-1]));
}
function selected(body:GeneratedBody,slot:number) {
  const part = body.answerParts![slot];
  const answer=body.partAnswers!.find(answer=>answer.kind==='unordered'?answer.partIds.includes(part.id):answer.partId===part.id);
  assert.ok(answer && answer.kind!=='no_correct_answer');
  const id=answer.kind==='unordered'?answer.choiceIds[answer.partIds.indexOf(part.id)]:answer.choiceId;
  return part.choiceIds.indexOf(id);
}
function unique(body:GeneratedBody,slot:number,predicate:(option:string,index:number)=>boolean) {
  const correct=bank(body,slot).flatMap((option,i)=>predicate(option,i)?[i]:[]);
  assert.deepEqual(correct,[selected(body,slot)],'欄 '+body.answerParts![slot].label);
}
function figureAt(body:GeneratedBody,suffix:string) {
  const figure=images(body).find(block=>block.scene.kind==='source_figure' && block.scene.profile.endsWith('-'+suffix));
  assert.ok(figure && figure.scene.kind==='source_figure');
  return figure as typeof figure & { scene: { kind:'source_figure'; profile:string; values:number[] } };
}

test('2009秋午後 問5〜8の公式18ページと25解答欄を解答例に照合',()=>{
  assert.equal(autumn2009Pm05To08Specs.length,4);
  autumn2009Pm05To08Specs.forEach(({number,pages,definition,original,originalPageAlt},i)=>{
    assert.equal(number,5+i);
    assert.deepEqual(pages,Array.from({length:book[i+1]-book[i]},(_,j)=>book[i]+j));
    assert.equal(definition.source,'2009h21a-fe-pm-'+number);
    assert.equal(definition.sourceAnswer.split('／').join(''),answers[i]);
    assert.deepEqual(original.answerParts!.map(part=>part.choiceIds.length),sizes[i]);
    assert.equal(original.answerParts!.map((_,slot)=>kana[selected(original,slot)]).join(''),answers[i]);
    assert.ok(Object.values(originalPageAlt).every(alt=>alt.length>100&&alt.length<=2000));
  });
  assert.equal(autumn2009Pm05To08Specs.reduce((total,spec)=>total+spec.original.answerParts!.length,0),25);
  assert.match(autumn2009Pm05To08Specs[3].originalPageAlt[36],/n−2, n−3, …, 0/);
  const generated=cases(8)[0];
  assert.equal(generated.partAnswers![2].kind,'choice');
  assert.equal(generated.partAnswers![3].kind,'choice');
});

test('問5〜8の有限入力を全件確認し、図の登録と描画を照合',()=>{
  assert.deepEqual(figures.map(entry=>entry.profile),renderers.map(entry=>entry.profile));
  let checks=0, options=0;
  for(const definition of definitions) {
    assert.deepEqual(definition.fields.map(field=>[field.minimum,field.maximum]),[[0,3]]);
    for(const bad of [[],[-1],[4],[.5],[NaN],[0,0],Array(1),Object.assign([0],{extra:1})]) assert.throws(()=>definition.build(bad));
    const prompts=new Set<string>();
    for(let index=0;index<4;index++) {
      const body=definition.build([index]);
      assert.deepEqual(body,definition.build([index]));
      prompts.add(JSON.stringify(body.prompt));
      assert.equal(body.explanation.split('\n').length>=4,true);
      body.answerParts!.forEach((_,slot)=>{
        const candidates=bank(body,slot);
        options+=candidates.length;
        assert.equal(candidates.length,new Set(candidates).size);
        assert.ok(candidates.every(Boolean));
        assert.ok(selected(body,slot)>=0);
      });
      for(const block of images(body)) {
        assert.equal(block.scene.kind,'source_figure');
        const {profile,values}=block.scene;
        const figure=figures.find(figure=>figure.profile===profile);
        const renderer=renderers.find(renderer=>renderer.profile===profile);
        assert.ok(figure && renderer);
        figure.validate(values);
        assert.equal(figure.alt(values),block.alt);
        const markup=renderToStaticMarkup(createElement(renderer.component,{values,caption:block.caption}));
        assert.match(markup,/tabindex="0"/i);
        assert.ok(markup.includes(block.caption));
        checks++;
      }
    }
    assert.equal(prompts.size,4);
  }
  assert.equal(checks,44);
  assert.equal(options,500);
});

const tickets = [
  ['空港','航空会社','航空機','航空券','航空券発券システム','便','出発','ファースト','エコノミー','窓側，中間，通路側'],
  ['駅','鉄道会社','車両','乗車券','乗車券発券システム','列車','発車','グリーン','普通','窓側，通路側'],
  ['港','船会社','船舶','乗船券','乗船券発券システム','航便','出港','特等','2等','窓側，中央，通路側'],
  ['停留所','バス会社','バス車両','バス乗車券','バス乗車券発券システム','運行便','出発','プレミアム','標準','窓側，通路側'],
] as const;
test('問5は属性と多重度、メッセージの受け手、f/gの順不同を全ケース照合',()=>{
  cases(5).forEach((body,i)=>{
    const [terminal,company,vehicle,ticket,system,service,departure,first,economy,seats]=tickets[i];
    assert.ok(text(body).includes(terminal+'名，'+service+'名'));
    assert.ok(text(body).includes('グレード（'+first+'，'+economy+'）'));
    assert.ok(text(body).includes('席種（'+seats+'）'));
    const analysis=figureAt(body,'5-analysis').alt;
    assert.match(analysis,/顧客（氏名）1―1\.\.\*［b］/);
    assert.match(analysis,/［b］0\.\.1―1座席。［c］1―1\.\.\*座席/);
    assert.ok(analysis.includes('出発'+terminal+'と到着'+terminal));
    assert.ok(analysis.includes('［c］（'+service+'名，'+departure+'日時'));
    for(const slot of [0,1,2]) assert.deepEqual(bank(body,slot),[terminal,company,vehicle,ticket,system,service]);
    const identifies=[
      new Set<string>([terminal]),new Set<string>([ticket]),new Set<string>([service]),
    ];
    identifies.forEach((matching,slot)=>unique(body,slot,option=>matching.has(option)));
    const sequence=figureAt(body,'5-sequence').alt;
    assert.match(sequence,/画面→管理：［d］。管理→［c］：［e］。［c］→管理：空席状態。管理→画面：可否/);
    assert.match(sequence,/画面→自身：発券可否を表示する/);
    assert.match(sequence,/販売担当者→画面→管理：顧客情報を登録する/);
    const operations=figureAt(body,'5-operations').alt;
    assert.match(operations,/［f］。［g］/);
    const featureTypes=['vacancy','issue','register-person','read-time','write-time','issue-feasibility'];
    for(const slot of [3,4]) assert.deepEqual(bank(body,slot),[
      '空席を確認する',ticket+'を発券する','顧客情報を登録する',departure+'日時を問い合わせる',departure+'日時を登録する','発券可否を確認する',
    ]);
    unique(body,3,(_,i)=>featureTypes[i]==='issue-feasibility');
    unique(body,4,(_,i)=>featureTypes[i]==='vacancy');
    const screenOperations=bank(body,5);
    assert.deepEqual(screenOperations,['空席を確認する','顧客情報を登録する',departure+'日時を登録する','発券可否を確認する','発券可否を表示する',service+'の座席数を確認する']);
    assert.deepEqual(bank(body,6),screenOperations);
    const pair=body.partAnswers!.find(answer=>answer.kind==='unordered');
    assert.ok(pair?.kind==='unordered');
    assert.equal(pair.presentation,undefined);
    assert.deepEqual(pair.partIds,['part-f','part-g']);
    const operationsNotYetListed=new Set(['顧客情報を登録する','発券可否を表示する']);
    assert.deepEqual(new Set(pair.choiceIds.map(id=>screenOperations[body.answerParts![5].choiceIds.indexOf(id)])),operationsNotYetListed);
    assert.equal(body.partAnswers!.filter(answer=>answer.kind==='unordered').length,1);
    const attribution:Attribution={origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex']};
    const question={id:'ticket',answerParts:body.answerParts,correctAnswer:{parts:body.partAnswers,attribution},
      choices:body.choices.map((_,choice)=>({id:'choice-value-'+(choice+1)}))} as Question;
    assert.doesNotThrow(()=>validateAnswerDefinition(question));
    assert.deepEqual(displayedAnswerParts(question).slice(5).map(part=>part.id),['part-f','part-g']);
    const options=body.answerParts![5].choiceIds;
    for(const [f,first] of options.entries()) for(const [g,second] of options.entries()){
      const grade=gradeAnswer(question,{selectedPartChoices:{'part-f':first,'part-g':second}});
      assert.equal(grade.parts!.slice(5).every(part=>part.outcome==='correct'),
        f!==g&&operationsNotYetListed.has(screenOperations[f])&&operationsNotYetListed.has(screenOperations[g]));
    }
  });
});

const incidentFacts = [
  ['関連会社','受注システム','障害の影響度','毎週','1時間'],
  ['委託倉庫','出荷システム','障害の業務影響度','毎日','30分'],
  ['共同配送会社','在庫照会システム','障害の利用影響度','毎週','2時間'],
  ['委託店舗','商品発注システム','障害の事業影響度','毎営業日','15分'],
];
test('問6は通報、対応経緯、予定、終了審議、変更、未解決抽出をそれぞれ独立照合',()=>{
  cases(6).forEach((body,i)=>{
    const [users,system,priority,interval,delay]=incidentFacts[i];
    assert.ok(text(body).includes(system));
    const displayed=tables(body);
    assert.equal(displayed.length,4);
    assert.deepEqual(displayed.map(table=>table.caption?.slice(0,2)),['表1','表2','表3','表4']);
    assert.ok(displayed[1].rows[0][2].includes(users+'に通報'));
    assert.ok(displayed[1].rows[0][2].includes(delay+'ごと'));
    assert.match(displayed[1].rows[0][2],/［a］[^]*レベル3以上[^]*レベル2[^]*レベル1/);
    assert.ok(displayed[2].rows[0][2].includes(interval+'の問題管理委員会'));
    const fields=['解決日時','解決方法の詳細（記述形式）','解決予定日時','障害対応の経緯（追記形式）',priority,'障害の発生日時'];
    const meanings=['completion','method','planned','history','impact','occurrence'];
    for(const [slot,kind] of [[0,'impact'],[1,'history'],[2,'planned'],[5,'completion']] as const) {
      assert.deepEqual(bank(body,slot),fields);
      unique(body,slot,(_,choice)=>meanings[choice]===kind);
    }
    assert.match(text(body),/未解決の問題を重要なものから順に表示[^]*［f］が空欄の問題を［a］の降順/);
    assert.deepEqual(bank(body,3),[
      '原因が特定できず，その後再発しない問題','システム部にスキルのある担当者がいないので，解決できない問題',
      '放置しておいても，業務に大きな支障がない問題','予算不足で，システム変更作業ができない問題',
    ]);
    unique(body,3,option=>option.includes('原因が特定できず')&&option.includes('再発しない'));
    assert.deepEqual(bank(body,4),['キャパシティ管理','構成管理','サービスレベル管理','変更管理']);
    unique(body,4,option=>option==='変更管理');
    assert.match(text(body),/解決方針が決まった問題[^]*障害管理番号を［e］に引き継いで/);
  });
});

const paymentCases=[
  [4000,2000,3000,800,50,30,8,2,2,0.4,3,2,5],
  [5000,2500,3500,1200,60,75,10,3,5,1,4,2,6],
  [6000,3000,4500,1100,70,180,15,4,6,1,4,2,7],
  [4500,2000,3000,1000,40,105,9,3,2,0.7,4,2,6],
];
const money = (value:string) => Number(value.replaceAll(',',''));
test('問7は累計投資、5年定額の損益計算と併用の相乗効果を別計算で照合',()=>{
  cases(7).forEach((body,i)=>{
    const [sales,material,cost,indirect,devSales,devMaterial,devLegal,opSales,opMaterial,opLegal,salesRate,materialRate,labour]=paymentCases[i];
    const [systems,pnl]=tables(body);
    assert.deepEqual(systems.rows[2].slice(1).map(money),[devSales,devMaterial,devLegal]);
    assert.deepEqual(systems.rows[3].slice(1).map(money),[opSales,opMaterial,opLegal]);
    assert.match(systems.rows[4][1],new RegExp(salesRate+'％増加'));
    assert.match(systems.rows[4][2],new RegExp(materialRate+'％削減'));
    assert.match(text(body),/各システムの開発費は5年で定額償却/);
    assert.deepEqual(pnl.rows.map(row=>money(row[1])),[sales,cost,sales-cost,indirect,sales-cost-indirect]);
    assert.deepEqual(bank(body,0),[
      '効果が開発費と運用費の合計を上回る','効果が開発費と運用費の合計を下回る',
      '効果と運用費の合計が開発費を上回る','効果と運用費の合計が開発費を下回る',
    ]);
    const breakEven = (years:number) => years*material*materialRate/100 > devMaterial+years*opMaterial;
    const tested=Array.from({length:501},(_,j)=>j/100);
    unique(body,0,(_,j)=>tested.every(years=>{
      const received=years*material*materialRate/100, operating=years*opMaterial;
      const predicates=[received>devMaterial+operating,received<devMaterial+operating,received+operating>devMaterial,received+operating<devMaterial];
      return predicates[j]===breakEven(years);
    }));
    const reached=[1,2,3].findIndex(breakEven);
    assert.deepEqual(bank(body,1),['1年未満','1年以上2年未満','2年以上3年未満','3年以上']);
    unique(body,1,(_,choice)=>choice===(reached<0?3:reached));
    const income = (sale:number, cogs:number, overhead:number) => sale-cogs-overhead;
    const baseline=income(sales,cost,indirect);
    const saleAfter=sales*(100+salesRate)/100;
    const costAfter=cost*saleAfter/sales;
    const annualSalesCost=devSales/5+opSales;
    const saleOnly=income(saleAfter,costAfter,indirect+annualSalesCost)-baseline;
    const revisedSale=saleAfter-sales;
    assert.deepEqual(bank(body,2).map(money),[saleOnly,revisedSale-(costAfter-cost),revisedSale-annualSalesCost,revisedSale]);
    unique(body,2,option=>money(option)===saleOnly);
    const saving=material*materialRate/100;
    assert.deepEqual(bank(body,3),['売上原価','売上総利益','売上高','営業利益','販管費']);
    unique(body,3,option=>option==='売上原価');
    const legalNet=income(sales,cost,indirect-labour+devLegal/5+opLegal)-baseline;
    unique(body,4,option=>option.startsWith('販管費')&&money(/利益効果は([\d.,]+)/.exec(option)![1])===legalNet);
    assert.deepEqual(bank(body,4).map(option=>option.startsWith('売上原価')), [true,true,false,false]);
    assert.deepEqual(bank(body,4).map(option=>money(/利益効果は([\d.,]+)/.exec(option)![1])),[legalNet,labour,legalNet,labour]);
    const onlyMaterial=income(sales,cost-saving,indirect+devMaterial/5+opMaterial)-baseline;
    const bothCost=(cost-saving)*saleAfter/sales;
    const both=income(saleAfter,bothCost,indirect+annualSalesCost+devMaterial/5+opMaterial)-baseline;
    assert.deepEqual(bank(body,5),['売上高売上原価率の上昇','売上高売上原価率の低下','売上高の増加','売上高の減少']);
    unique(body,5,(_,j)=>[bothCost/saleAfter>cost/sales,bothCost/saleAfter<cost/sales,false,false][j]);
    assert.deepEqual(bank(body,6),['と等しい','を上回る','を下回る']);
    unique(body,6,(_,j)=>[both===saleOnly+onlyMaterial,both>saleOnly+onlyMaterial,both<saleOnly+onlyMaterial][j]);
    assert.ok(body.explanation.includes(String(saleOnly)+'百万円'));
  });
});

const newtonTrials=[
  { cubic:[3,1,-1], initial:2.5, multiple:2, units:1, pair:[6,7], same:false },
  { cubic:[4,2,0], initial:3.75, multiple:3, units:3, pair:[6,7], same:true },
  { cubic:[5,3,1], initial:4.5, multiple:4, units:1, pair:[6,7], same:false },
  { cubic:[6,4,2], initial:5.75, multiple:5, units:1, pair:[5,6], same:false },
];
const parsePrinted=(value:string)=>{
  const [number,exponent]=value.replaceAll('−','-').split('(');
  return Number(number)*(exponent?10**Number(exponent.replace(')','')):1);
};
function readFigureRows(body:GeneratedBody,suffix:string) {
  const {alt}=figureAt(body,suffix);
  return Array.from(alt.matchAll(/(\d+)：([^。]+)/g),match=>match[2].split('，'));
}
test('問8 a/eは3根の積と重根の厳密値から印字を検算する',()=>{
  cases(8).forEach((body,i)=>{
    const {cubic,initial,multiple,units,pair,same}=newtonTrials[i];
    const [first,second]=pair;
    const visible=text(body);
    assert.ok(visible.includes('予測値x＝'+initial));
    assert.ok(visible.includes('4個の解がすべて'+multiple));
    assert.match(visible,/有効数字7けた（8けた目を四捨五入）/);
    assert.match(visible,/2進数の浮動小数点形式/);
    const values=readFigureRows(body,'8-printed-1');
    assert.equal(values.length,8);
    assert.equal(values[first-1][0],values[second-1][0]);
    assert.equal(values[first-1][1]===values[second-1][1],same);
    assert.match(visible,new RegExp('行番号'+pair.join('，')+'のx'));
    assert.ok(figureAt(body,'8-printed-1').alt.endsWith('網掛けは'+pair.join('，')+'行目のx。'));
    if(same) {
      assert.equal(parsePrinted(values[first-1][1]),0);
      assert.notEqual(parsePrinted(values[first-1][2]),0);
      assert.match(visible,/保持したfが0の場合だけ/);
      assert.match(body.explanation,/更新量f\/dが0/);
    }
    let estimate=initial;
    const iterations=Array.from({length:8},()=>{
      const terms=cubic.map(root=>estimate-root);
      const value=terms[0]*terms[1]*terms[2];
      const derivative=terms[0]*terms[1]+terms[0]*terms[2]+terms[1]*terms[2];
      const row=[estimate,value,derivative];
      estimate-=value/derivative;
      return row;
    });
    for(const [line, row] of values.entries()) {
      row.forEach((display,column)=>{
        const value=parsePrinted(display), target=iterations[line][column];
        const tolerance=Math.max(6e-7*Math.abs(target),1e-12);
        assert.ok(Math.abs(value-target)<=tolerance,'図1: 行'+(line+1)+' 列'+column);
      });
    }
    const equal = iterations[first-1][0]===iterations[second-1][0];
    assert.equal(equal,same);
    const variables=pair.map(n=>'x'+'₀₁₂₃₄₅₆₇₈'[n]);
    const [left,right]=variables;
    assert.deepEqual(bank(body,0),[left+'＝'+right+'である',left+'≠'+right+'である',
      left+'＝'+right+'とも'+left+'≠'+right+'ともいえない']);
    unique(body,0,(_,j)=>[equal,!equal,false][j]);
    const quartic=readFigureRows(body,'8-printed-2');
    assert.equal(quartic.length,5);
    const x1=parsePrinted(quartic[0][0]), x2=parsePrinted(quartic[1][0]);
    assert.ok(Math.abs(x2-multiple)>Math.abs(x1-multiple));
    const exact=units**4 / 10**20;
    const exactD=4*(units / 100000)**3;
    assert.notEqual(parsePrinted(quartic[0][1]),exact);
    assert.ok(Math.abs(x1-exact/exactD-multiple)<Math.abs(x1-multiple),'丸めがなければ根に近づく');
    assert.match(figureAt(body,'8-partial').alt,/下の括弧\(A\)は定数項を加える直前/);
    const notation=/正確な値である[^（]+（印字の表記では([^）]+)）/.exec(visible)?.[1];
    assert.ok(notation);
    assert.ok(Math.abs(parsePrinted(notation)-exact)<exact*1e-14);
    assert.deepEqual(bank(body,4),['けたあふれ','けた落ち','指数下位けたあふれ','丸め誤差']);
    unique(body,4,option=>option==='丸め誤差');
    assert.match(visible,/が徐々に累積し[^]*加算するときに，けた落ちが発生/);
    assert.match(body.explanation,/丸め誤差が累積する/);
  });
});

test('問8 b/c/dはn=1〜9の係数と展開形で全候補を照合する',()=>{
  cases(8).forEach(body=>{
    const program=figureAt(body,'8-program-2').alt;
    assert.match(program,/1 ≦ n ≦ 9 とする/);
    assert.match(program,/添字は0から始まる/);
    assert.match(program,/繰返し回数は100回/);
    assert.match(figureAt(body,'8-b').alt,/k: n, k ≧ 1, −1/);
    const horn=figureAt(body,'8-cd').alt;
    assert.match(horn,/k: n−2, k ≧ 0, −1/);
    assert.match(horn,/kをn−2, n−3, …, 0として繰り返す/);
    assert.match(horn,/d ← d × x \+ ［d］/);
    assert.deepEqual(bank(body,1),[
      'b[k−1] ← (k−1) × a[k]','b[k−1] ← k × a[k]','b[k] ← k × a[k+1]','b[k] ← (k+1) × a[k+1]',
    ]);
    const expressions=['b[k−1]','b[k]','b[k+1]','b[n−1]','b[n−1] × x','b[n−1] × x + b[n−2]'];
    assert.deepEqual(bank(body,2),expressions);
    assert.deepEqual(bank(body,3),expressions);
    const trials=Array.from({length:9},(_,i)=>i+1).flatMap(n=>[-3n,0n,2n,4n].map(x=>{
      const a=Array.from({length:n+1},(_,i)=>BigInt(i*i+2*i+3));
      const b=Array.from({length:n},(_,i)=>a[i+1]*BigInt(i+1));
      const expanded=b.reduce((sum,value,power)=>sum+value*x**BigInt(power),0n);
      return {n,x,a,b,expanded};
    }));
    unique(body,1,(_,variant)=>trials.every(({a,b,n})=>{
      const generated=Array<bigint|undefined>(n);
      for(let k=n;k>=1;k--) {
        const target=variant<2?k-1:k;
        const factor=BigInt([k-1,k,k,k+1][variant]);
        const term=a[variant<2?k:k+1];
        generated[target]=term===undefined?undefined:factor*term;
      }
      return generated.length===n&&b.every((value,index)=>value===generated[index]);
    }));
    const evaluates = (c:number,d:number) => trials.every(({n,x,b,expanded})=>{
      const get=(variant:number,k:number|undefined) => {
        const lead=b[n-1];
        switch(variant) {
          case 0: return k===undefined?undefined:b[k-1];
          case 1: return k===undefined?undefined:b[k];
          case 2: return k===undefined?undefined:b[k+1];
          case 3: return lead;
          case 4: return lead*x;
          case 5: return n<2?undefined:lead*x+b[n-2];
        }
      };
      let derivative=get(c,undefined);
      for(let k=n-2;k>=0;k--) {
        const next=get(d,k);
        if(derivative===undefined||next===undefined) return false;
        derivative=derivative*x+next;
      }
      return derivative===expanded;
    });
    const valid=expressions.flatMap((_,c)=>expressions.flatMap((_,d)=>evaluates(c,d)?[[c,d]]:[]));
    assert.deepEqual(valid,[[selected(body,2),selected(body,3)]]);
    assert.ok(body.contexts?.some(context=>context.blocks.map(block=>block.type==='image'?block.assetId:'')
      .join(',')==='asset-ipa-2009h21a-fe-pm-p003,asset-ipa-2009h21a-fe-pm-p004'));
  });
});
