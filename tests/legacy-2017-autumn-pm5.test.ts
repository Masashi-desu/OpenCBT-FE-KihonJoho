import test from 'node:test';import assert from 'node:assert/strict';
import { createElement } from 'react';import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2017AutumnPm5Definition as d } from '../src/core/generators/legacy-2017-autumn-pm5';
import { legacy2017AutumnPm5Figure as figure,legacy2017AutumnPm5Profiles as profiles,legacy2017AutumnPm5Erratum as erratum } from '../src/core/generators/legacy-2017-autumn-pm5-data';
import { Legacy2017AutumnPm5Figure } from '../src/ui/Legacy2017AutumnPm5Figure';
import { intervalOracle,sourceFlow,comparison,arithmetic,keyWitness,ordered,orderCases,type Payment,type Bill } from './fixtures/legacy-2017-autumn-pm5-oracle';
const text=(blocks:ReturnType<typeof d.build>['choices'][number])=>blocks.map(b=>{assert(b.type==='paragraph');return b.text;}).join('\n');
const choice=(body:ReturnType<typeof d.build>,n:number)=>text(body.choices[n]);
test('2017秋PM5: all4 finite conditions retain6 official roles/27choices/33references and independent all-choice truth witnesses',()=>{
  let evaluated=0;const bodies=[];
  for(let v=0;v<4;v++){
    const b=d.build([v]);bodies.push(JSON.stringify(b.choices));assert.equal(b.choices.length,27);assert.deepEqual(b.answerParts?.map(x=>x.choiceIds.length),[6,4,6,5,6,6]);assert.deepEqual(b.answerParts![4].choiceIds,b.answerParts![5].choiceIds);
    const bank=(start:number,count:number)=>Array.from({length:count},(_,i)=>choice(b,start+i));
    const validA=bank(0,6).map(s=>keyWitness(s.split('\n')).valid);
    assert.equal(validA.filter(Boolean).length,1);
    const predicateTruth=(start:number,count:number,kind:'payment'|'bill')=>bank(start,count).map(s=>{let correct=true,checked=0;for(let total=0;total<=8;total++)for(let done=0;done<=total;done++){const actual=comparison(s,total,done,kind);correct=correct&&(actual===(total-done>0));checked++;}assert.equal(checked,45);return correct;});
    const validB=predicateTruth(6,4,'payment'),validC=predicateTruth(10,6,'bill');
    const validD=bank(16,5).map(s=>orderCases.every(rows=>ordered(s,rows).map(x=>x.id).join(',')==='M1,M2,M3'));
    const mathTruth=(which:'payment'|'bill')=>bank(21,6).map(s=>{let correct=true;for(let pt=0;pt<=6;pt++)for(let pd=0;pd<=pt;pd++)for(let bt=0;bt<=6;bt++)for(let bd=0;bd<=bt;bd++){const actual=arithmetic(s,[pt,pd],[bt,bd]);correct=correct&&(actual===(which==='payment'?pt-pd:bt-bd));}return correct;});
    const truths=[validA,validB,validC,validD,mathTruth('payment'),mathTruth('bill')];
    truths.forEach((rows,i)=>{assert.equal(rows.filter(Boolean).length,1);const part=b.answerParts![i],answer=b.partAnswers![i];assert.equal(answer.kind,'choice');if(answer.kind==='choice')assert.equal(answer.choiceId,part.choiceIds[rows.indexOf(true)]);evaluated+=rows.length;});
  }
  assert.equal(new Set(bodies).size,4);assert.equal(evaluated,132);assert.equal(d.answerVariation,'fixed');
  const b=d.build([0]);assert.deepEqual(b.partAnswers?.map((a,i)=>{assert(a.kind==='choice');return 'アイウエオカ'[b.answerParts![i].choiceIds.indexOf(a.choiceId)];}),[...'カイイイオイ']);
});
test('2017秋PM5: positive economic FIFO interval intersections independently match source nested flow, empty/zero/partial/full/equal/unequal/clients/prepayment',()=>{
  let cases=0;
  for(let p1=0;p1<=5;p1++)for(let p2=0;p2<=5;p2++)for(let b1=0;b1<=5;b1++)for(let b2=0;b2<=5;b2++)for(const partial of [false,true]){
    const ps:Payment[]=[{id:'P2',client:'C1',date:20171020,amount:p2,allocated:partial?Math.floor(p2/2):0},{id:'P1',client:'C1',date:20160901,amount:p1,allocated:partial?Math.floor(p1/2):0},{id:'P3',client:'C2',date:20171031,amount:3,allocated:1}];
    const bs:Bill[]=[{id:'M2',client:'C1',month:201710,amount:b2,settled:partial?Math.floor(b2/2):0},{id:'M1',client:'C1',month:201701,amount:b1,settled:partial?Math.floor(b1/2):0},{id:'M3',client:'C2',month:201702,amount:4,settled:1}];
    const expected=intervalOracle(ps,bs),actual=sourceFlow(ps,bs);assert.deepEqual(actual.allocations,expected);
    for(const p of ps)assert.equal(actual.payments.find(x=>x.id===p.id)!.allocated,p.allocated+expected.filter(x=>x.payment===p.id).reduce((n,x)=>n+x.amount,0));
    for(const b of bs)assert.equal(actual.bills.find(x=>x.id===b.id)!.settled,b.settled+expected.filter(x=>x.bill===b.id).reduce((n,x)=>n+x.amount,0));cases++;
  }
  assert.equal(cases,2592);assert.deepEqual(sourceFlow([],[]).allocations,[]);
});
test('2017秋PM5: all source-local profiles use real components;7entities/8edges/keyunderlines/rowspans/visible headings/6 bank groups and blank instructions',()=>{
  for(let v=0;v<4;v++)for(const profile of profiles){const f=figure(profile,[v]),html=renderToStaticMarkup(createElement(Legacy2017AutumnPm5Figure,{profile,values:[v],caption:f.caption}));assert(html.includes(f.caption)||f.kind.startsWith('instruction')||f.kind==='selection'||f.kind==='description');assert(!html.includes('dangerouslySetInnerHTML'));if(f.kind==='er'){assert.equal((html.match(/data-autumn-pm5-entity=/g)||[]).length,7);assert.equal((html.match(/data-autumn-pm5-edge=/g)||[]).length,8);assert.equal((html.match(/data-autumn-pm5-key=/g)||[]).length,7);}if(f.kind==='flow'){assert.equal((html.match(/data-autumn-pm5-flow-node=/g)||[]).length,17);assert.equal((html.match(/data-autumn-pm5-hole="b"/g)||[]).length,1);assert.equal((html.match(/data-autumn-pm5-hole="c"/g)||[]).length,1);assert.equal((html.match(/data-autumn-pm5-hole="e"/g)||[]).length,1);assert.equal((html.match(/data-autumn-pm5-hole="f"/g)||[]).length,1);assert(html.includes('Yes')&&html.includes('No')&&html.includes('α')&&html.includes('β'));}if(f.kind==='table2')assert.equal((html.match(/rowSpan="2"|rowspan="2"/g)||[]).length,2);}
});
test('2017秋PM5: official erratum is explicit before answer; original before text has no only; no arbitrary or accessor conditions',()=>{
  const b=d.build([0]);assert.equal(erratum.before,'入金は，買上げ前に行うことができる。');assert(!erratum.before.includes('のみ'));assert.equal(erratum.after,'得意先は，入金を，買上げ前にも，買上げ後にも行うことができる。');assert(b.contexts?.[0].blocks.some(x=>x.type==='paragraph'&&x.text==='訂正後：'+erratum.after));assert(b.prompt.some(x=>x.type==='paragraph'&&x.text.includes(erratum.after)));
  let reads=0;const a:number[]=[];Object.defineProperty(a,'0',{get(){reads++;return 0;},enumerable:true});for(const values of [[],[0,0],[-1],[4],[.5],[NaN],[Infinity],a,Object.assign([0],{extra:1}),Object.assign([0],{[Symbol('x')]:1})])assert.throws(()=>d.build(values));assert.equal(reads,0);const x=d.build([0]);x.prompt.pop();assert.equal(d.build([0]).prompt.length,b.prompt.length);assert.throws(()=>figure(profiles[0],[4]));assert.throws(()=>figure('unknown',[0]));
});
test('2017秋PM5: QS physical26 flow retains17 nodes, distinct loop terminals, both branches/merge and source comments',()=>{
  const profile='legacy-2017-autumn-pm5-flow',f=figure(profile,[0]);
  const html=renderToStaticMarkup(createElement(Legacy2017AutumnPm5Figure,{profile,values:[0],caption:f.caption}));
  const visible=html.replace(/<[^>]+>/g,'').replace(/\s+/g,'');
  // Independently transcribed from QS26; this assertion does not import the renderer's node dictionary.
  for(const source of [
    '・入金表から，bの条件を満たすレコードを整列して取得する',
    '・αで取得したレコードのうち先頭のものを[入金]とする',
    '消込み①[入金]がない',
    '・月間買上げ表から，[入金].得意先IDと同じ得意先IDをもち，cの条件を満たすレコードを整列して取得する',
    '・βで取得したレコードのうち先頭のものを[月間買上げ]とする',
    '・変数1 ← e','消込み②[月間買上げ]がない','・変数2 ← f',
    '・[月間買上げ].消込額 ← [月間買上げ].月間買上げ額',
    '・[月間買上げ]で月間買上げ表を更新する',
    '・[入金].充当額 ← [入金].充当額＋変数2',
    '・[入金]で入金表を更新する',
    '・消込表に，変数2の値を消込充当額として，消込みに使用した入金と月間買上げの情報をもつレコードを登録する',
    '・変数1 ← 変数1−変数2',
    '・[月間買上げ].消込額 ← [月間買上げ].消込額＋変数1',
    '・[入金].充当額 ← [入金].入金額',
    '・消込表に，変数1の値を消込充当額として，消込みに使用した入金と月間買上げの情報をもつレコードを登録する',
    '・βで取得したレコードのうち次のものを[月間買上げ]とする',
    '・αで取得したレコードのうち次のものを[入金]とする',
    '注記　“[X]”という記述でX表の処理中のレコードを表し，“[X].Y”という記述でX表の処理中のレコードの属性を表す。',
  ])assert(visible.includes(source.replace(/\s+/g,'')),source);
  assert(html.includes('変数1 ＞ 変数2'));assert.equal((html.match(/data-autumn-pm5-loop="start"/g)||[]).length,2);assert.equal((html.match(/data-autumn-pm5-loop="end"/g)||[]).length,2);
  assert(html.includes('points="52,287 653,287 665,299 665,354 40,354 40,299"'));
  assert(html.includes('points="40,1529 665,1529 665,1572 653,1584 52,1584 40,1572"'));
  for(const edge of ['start→select-payment','select-payment→first-payment','first-payment→payment-loop','payment-loop→select-month','select-month→first-month','first-month→payment-rest','payment-rest→month-loop','month-loop→month-rest','month-rest→compare','compare-yes','compare-no-horizontal','compare-no-vertical','finish-month→next-month','next-month→month-end','month-end→next-payment','finish-payment-exit1','finish-payment-exit2','next-payment→payment-end','payment-end→end'])assert(html.includes('data-autumn-pm5-connection="'+edge+'"'),edge);
  assert(html.includes('data-autumn-pm5-merge-arrow="left"'));
  for(const marker of ['α','β'])assert(html.includes('data-autumn-pm5-reference-arrow="'+marker+'"'));
});

test('2017秋PM5: QS25 explanatory paragraph retains three rectangular inline holes without an added caption',()=>{const profile='legacy-2017-autumn-pm5-description',f=figure(profile,[0]),html=renderToStaticMarkup(createElement(Legacy2017AutumnPm5Figure,{profile,values:[0],caption:f.caption}));assert.deepEqual([...html.matchAll(/data-autumn-pm5-inline-hole="(.)"/g)].map(x=>x[1]),['b','c','d']);assert(!html.includes('<figcaption'));assert(!html.includes('legacy-autumn-pm5-heading'));assert(html.includes('得意先IDの昇順，入金日の昇順'));});
