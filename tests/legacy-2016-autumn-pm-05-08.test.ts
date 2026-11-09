import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import sourceReview from './fixtures/legacy-2016-autumn-pm-05-08-review.json';
import { createElement } from 'react';
import { Content } from '../src/ui/Content';
import type { Bundle } from '../src/core/types';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import { legacy2016AutumnPm5Definition as q5 } from '../src/core/generators/legacy-2016-autumn-pm-5';
import { legacy2016AutumnPm6Definition as q6 } from '../src/core/generators/legacy-2016-autumn-pm-6';
import { legacy2016AutumnPm7Definition as q7 } from '../src/core/generators/legacy-2016-autumn-pm-7';
import { legacy2016AutumnPm8Definition as q8, autumn2016Pm8Edit } from '../src/core/generators/legacy-2016-autumn-pm-8';
import { legacy2016AutumnPm0508Figures, autumn2016Pm0508NativeFragment, autumn2016Pm0508NativeProfiles } from '../src/core/generators/legacy-2016-autumn-pm-figures-05-08';
import { legacy2016AutumnPm0508FigureRenderers } from '../src/ui/Legacy2016AutumnPm0508Figures';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import { specs } from '../scripts/legacy-2016-autumn-pm-05-08-specs';
import { officialKeys,expectedCounts,expectedQ5Terms,rentalReference,ProductInfo,CompactDisc,MovieDisc,Book,qualityRegion,qualitySatisfied,financeReference,roundMoney,fraction,compare,formatReference,transitionReference,reviewedQ6Knowledge,reviewedQ7Knowledge,editConditionMeaning } from './fixtures/legacy-2016-autumn-pm-05-08-oracle';

const defs=[q5,q6,q7,q8];
const plain=(blocks:Block[])=>blocks.map(b=>b.type==='paragraph'||b.type==='code'?b.text:b.type==='table'?b.rows.flat().join('|'):b.type==='diagram'?b.alt:'').join('\n');
function selected(body:ReturnType<typeof q5.build>,id:string){const answer=body.partAnswers!.find(p=>p.kind==='choice'&&p.partId==='part-'+id)!;assert.equal(answer.kind,'choice');if(answer.kind!=='choice')throw Error('PART');return body.choices[Number(answer.choiceId.split('-').at(-1))-1];}
function bank(body:ReturnType<typeof q5.build>,id:string){return body.answerParts!.find(p=>p.id==='part-'+id)!.choiceIds.map(id=>body.choices[Number(id.split('-').at(-1))-1]);}
function selectedIndex(body:ReturnType<typeof q5.build>,id:string){const p=body.answerParts!.find(p=>p.id==='part-'+id)!;const a=body.partAnswers!.find(a=>a.kind==='choice'&&a.partId===p.id)!;if(a.kind!=='choice')throw Error('PART');return p.choiceIds.indexOf(a.choiceId);}
const tableFrom=(body:ReturnType<typeof q5.build>,caption:string)=>{const blocks=body.prompt.map(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&autumn2016Pm0508NativeProfiles.includes(b.scene.profile)?autumn2016Pm0508NativeFragment(b.scene.profile,b.scene.values).block:b);const b=blocks.find(b=>b.type==='table'&&b.caption.startsWith(caption));assert(b?.type==='table');return b;};

test('2016 autumn PM5–8 retain all original fields, complete banks, shared groups, source keys and fixed language pages',()=>{
  defs.forEach((definition,index)=>{const number=index+5,body=definition.build([0]);assert.deepEqual(body.answerParts!.map(p=>p.choiceIds.length),expectedCounts[number as 5|6|7|8]);
    assert.deepEqual(body.answerParts!.map(p=>'アイウエオカキクケコ'[selectedIndex(body,p.id.slice(5))]),officialKeys[number as 5|6|7|8]);
    assert(body.answerParts!.every(p=>new Set(p.choiceIds).size===p.choiceIds.length));assert(body.choices.every(c=>plain(c).length>0));for(const part of body.answerParts!)assert.equal(new Set(part.choiceIds.map(id=>JSON.stringify(body.choices[Number(id.split('-').at(-1))-1]))).size,part.choiceIds.length);
    for(const bad of [[],[-1],[4],[.5],[NaN],[Infinity],[0,0]])assert.throws(()=>definition.build(bad),/PARAMETER_CONSTRAINT/);
    assert.deepEqual(definition.build([0]),body);assert(definition.publicNotes.length>0);
    for(let value=0;value<4;value++){const visible=definition.build([value]);const allBlocks=[...visible.prompt,...visible.choices.flat(),...(visible.contexts??[]).flatMap(context=>context.blocks)];assert(!allBlocks.some(block=>block.type==='code'&&block.language==='text'),'required source content must not use the initially closed Content text-code fallback');}
  });
  assert.deepEqual(q5.build([0]).answerParts![2].choiceIds,q5.build([0]).answerParts![3].choiceIds);
  assert.deepEqual(q7.build([0]).answerParts![3].choiceIds,q7.build([0]).answerParts![4].choiceIds);
  assert.deepEqual(q8.build([0]).answerParts![1].choiceIds,q8.build([0]).answerParts![2].choiceIds);
  assert.deepEqual(q8.build([0]).answerParts![3].choiceIds,q8.build([0]).answerParts![4].choiceIds);
  assert.deepEqual(q8.fixedReferenceAssetIds,['asset-ipa-2016h28a-fe-pm-p004','asset-ipa-2016h28a-fe-pm-p005']);
  for(let i=0;i<4;i++)assert.deepEqual(q8.build([i]).contexts!.flatMap(c=>c.blocks.map(b=>b.type==='image'?b.assetId:null)),q8.fixedReferenceAssetIds);
  assert.equal(specs.length,4);assert.deepEqual(specs.flatMap(s=>s.pages),Array.from({length:20},(_,i)=>i+21));
  for(const spec of specs){assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number),spec.pages);assert(Object.values(spec.originalPageAlt).every(text=>text.length>200));const reviewed=sourceReview.questions.find(q=>q.number===spec.number)!;assert.equal(reviewed.source,spec.definition.source);assert.deepEqual(reviewed.pages,spec.pages);assert.equal(reviewed.originalPageAltSHA256,createHash('sha256').update(JSON.stringify(spec.originalPageAlt)).digest('hex'));assert.equal(reviewed.finiteCaseCount,4);assert.deepEqual(reviewed.answerFields,spec.original.answerParts!.map(part=>({id:part.id,label:part.label,choiceCount:part.choiceIds.length})));}
});

test('PM5 every rental/grouped policy is solved independently as asset relations and virtual dispatch, without treating names as answer changes',()=>{
  for(let i=0;i<4;i++){
    const body=q5.build([i]),bundle=i%2===1,r=rentalReference(bundle,i<2?1:2),screen=tableFrom(body,'図2');
    assert.deepEqual(screen.rows.map(row=>[row[0],row[1],Number(row[5].slice(0,-1))]),r.assets.map(a=>[a.product,a.days===7?'1週間':a.days+'日',a.fee]));
    assert(plain(body.prompt).includes('貸出料金合計 '+r.total+'円'));
    assert.equal(r.loanDates,3);assert.equal(r.detailCount,bundle?3:4);
    const tuples=bank(body,'b').map(c=>c[0].type==='table'?c[0].rows[0]:[]),truth=tuples.map(t=>t[0]===r.b1&&t[1]===r.b2);
    assert.equal(truth.filter(Boolean).length,1);assert.equal(truth[selectedIndex(body,'b')],true);
    assert.deepEqual(bank(body,'a').map(plain),expectedQ5Terms.a);assert.equal(plain(selected(body,'a')),'貸出期間');
    assert.deepEqual(bank(body,'c').map(plain),expectedQ5Terms.cd);assert.equal(plain(selected(body,'c')),'貸出期間，本日日付');assert.equal(plain(selected(body,'d')),'貸出期間');
    const etuples=bank(body,'e').map(c=>c[0].type==='table'?c[0].rows[0]:[]);assert.deepEqual(etuples,expectedQ5Terms.e);assert.equal(etuples.filter(t=>t[0]==='インヘリタンス'&&t[1]==='ポリモーフィズム').length,1);assert.equal(selectedIndex(body,'e'),1);
    if(bundle)assert(plain(body.prompt).includes('その明細内の一部の商品だけを返却することはない'));
    else assert(!plain(body.prompt).includes('その明細内の一部の商品だけを返却することはない'));
  }
  const items:ProductInfo[]=[new CompactDisc('編曲者A',63),new MovieDisc('監督B','主演C',122),new Book('著者X',100,'ISBN-xxxx')];
  assert.deepEqual(items.map(item=>item.summary()),['編曲者A，63分','監督B，主演C，122分','著者X，100ページ，ISBN-xxxx']);
  assert(items.every(item=>item instanceof ProductInfo));assert.equal(new Set(items.map(item=>item.summary())).size,3);
});

test('PM6 all displayed densities, error roles and inclusive80/120 percent boundaries use independent integer-fraction checks',()=>{
  for(let i=0;i<4;i++){
    const body=q6.build([i]),rows=tableFrom(body,'表2').rows,density=[98,96,100,104][i];
    assert.deepEqual(rows.map(row=>[Number(row[1]),Number(row[2]),Number(row[4])]),[[10,density*10,70],[2,215,9],[6,750,20],[8,600,30]]);
    assert.equal(plain(selected(body,'b')),String(density));assert.equal(bank(body,'b').map(plain).filter(s=>Number(s.replaceAll(',',''))*10===density*10).length,1);
    assert.deepEqual(rows.map(row=>qualityRegion(Number(row[1]),Number(row[2]),Number(row[4]))),['Ⅰ','Ⅲ','Ⅳ','Ⅱ']);
    assert.deepEqual(rows.map(row=>qualitySatisfied(Number(row[1]),Number(row[2]),Number(row[4]))),[false,true,false,false]);
    assert.equal(selectedIndex(body,'a'),2);assert.equal(selectedIndex(body,'c'),2);assert.equal(selectedIndex(body,'d'),0);assert.equal(selectedIndex(body,'e'),1);assert.equal(selectedIndex(body,'f'),1);
    assert(plain(selected(body,'d')).includes('詳細設計書を正確に反映'));assert(plain(selected(body,'e')).includes('全ての処理の流れを網羅'));assert(plain(selected(body,'f')).includes('実施が不足している処理の流れ'));
  }
  for(const size of [1,2,5,10])for(const tests of [80*size-1,80*size,80*size+1])for(const bugs of [4*size-1,4*size,6*size,6*size+1]){
    const valid=tests*100>=100*80*size&&bugs*100>=5*80*size&&bugs*100<=5*120*size;
    assert.equal(qualitySatisfied(size,tests,bugs),valid);
  }
});

test('PM7 all finance statements, shared ten-choice answers, growth boundaries and perpetual present values have independent rational solutions',()=>{
  for(let i=0;i<4;i++){
    const body=q7.build([i]),k=i+1,pl=tableFrom(body,'表1').rows,bs=tableFrom(body,'表2').rows,cf=tableFrom(body,'表3').rows,r=financeReference(k);
    assert.deepEqual(pl.map(row=>Number(row[1])),[120,40,7,9,10,7].map(n=>n*k));assert.equal(Number(bs[0][1])+Number(bs[1][1]),Number(bs[2][1])+Number(bs[3][1])+Number(bs[4][1]));
    assert(Number(pl[2][1])*100>=Number(pl[0][1])*5);assert(Number(pl[3][1])*100>=(Number(bs[0][1])+Number(bs[1][1]))*5);assert.equal(Number(cf[0][1])+Number(cf[1][1]),10*k);
    assert.equal(plain(selected(body,'d')),roundMoney(r.d));assert.equal(plain(selected(body,'e')),roundMoney(r.e));
    for(const id of ['d','e'])assert.equal(bank(body,id).map(plain).filter(value=>value===roundMoney(id==='d'?r.d:r.e)).length,1);
    assert.deepEqual(body.answerParts!.map(p=>selectedIndex(body,p.id.slice(5))),[3,2,2,8,2,0,3]);
    const forecast=body.prompt.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile.endsWith('-forecast'))!;assert(forecast.type==='diagram');for(const n of [4,5,6])assert(forecast.alt.includes(roundMoney(r.flows[n])));
    assert(compare(financeReference(k,fraction(12,100)).value,r.value)<0);assert(compare(financeReference(k,fraction(1,10),-1).value,r.value)<0);assert(compare(financeReference(k,fraction(1,10),1).value,r.value)>0);
    assert(plain(body.prompt).includes('各年度末に発生'));assert(plain(body.prompt).includes('2024年度からは一定'));
  }
});

test('PM8 all four live questions and every answer choice are compared with a separate declarative formatter',()=>{
  for(let i=0;i<4;i++){
    const body=q8.build([i]),rows=tableFrom(body,'表3').rows,digits=['12','34','56','78'][i],expected=['********','*****'+digits+'#','****.'+digits+'*'];
    assert.deepEqual(rows.map(row=>row[1].replace(/[“”]/g,'')),['01234+','00000+','000'+digits+'-','000'+digits+'+']);
    for(let j=0;j<3;j++){const pair=rows[j+1].slice(0,2).map(s=>s.replace(/[“”]/g,'').replaceAll('␣',' '));const output=formatReference(pair[0],pair[1]);assert.equal(output,expected[j]);assert.equal(plain(selected(body,'abc'[j])).replace(/[“”]/g,''),output);assert.equal(bank(body,'abc'[j]).map(plain).filter(s=>s.replace(/[“”]/g,'')===output).length,1);}
    assert.equal(selectedIndex(body,'d'),1);assert.equal(selectedIndex(body,'e'),3);assert.equal(selectedIndex(body,'f'),3);
    assert.equal(tableFrom(body,'表2').rows.length,9);assert(plain(body.prompt).includes('各配列の添字は，0から始まる'));assert(plain(body.prompt).includes('正又は0なら'));
  }
});

test('PM8 state-table and declarative references cover every digit, control, sign, leading zero and table case independently',()=>{
  const seen=new Set<number>();let checked=0;
  for(let count=1;count<=3;count++)for(let mask=0;mask<(1<<count);mask++)for(const fill of [' ','*'])for(let number=0;number<10**count;number++)for(const sign of ['+','-']){
    if(number===0&&sign==='-')continue;
    const digits=String(number).padStart(count,'0'),controls=Array.from({length:count},(_,i)=>mask>>i&1?'■':'□'),pattern=fill+controls.map((c,i)=>c+(i<count-1?i%2?',':'.':'')).join('')+'#',value=digits+sign;
    assert.equal(autumn2016Pm8Edit(pattern,value),formatReference(pattern,value),pattern+'/'+value);checked++;
  }
  for(const control of ['□','■','literal']as const)for(const active of [false,true])for(const digit of '0123456789')for(const next of ['+','-','0','9'])seen.add(transitionReference(control,active,digit,next).row);
  assert.deepEqual([...seen].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9]);assert.equal(checked,33652);
  for(const [pattern,value] of [['*□□□.□□#','00012-'],['*□□■.□□#','00012+'],[' □□,□□□','01234+'],['*■■■■■#','00000+'],['*□□□□□#','00000+']])assert.equal(autumn2016Pm8Edit(pattern,value),formatReference(pattern,value));
  for(const pair of [['','1+'],['*□','12+'],['*□','0-'],['*□','a+']])assert.throws(()=>autumn2016Pm8Edit(...pair as [string,string]));
});

test('all source-owned managed figures have bijective semantic/render registrations, visible source labels and no answer leakage into blank diagrams',()=>{
  assert.equal(legacy2016AutumnPm0508Figures.length,39);assert.deepEqual(legacy2016AutumnPm0508Figures.map(f=>f.profile),legacy2016AutumnPm0508FigureRenderers.map(r=>r.profile));
  for(const figure of legacy2016AutumnPm0508Figures)for(let index=0;index<4;index++){
    assert(readBookletFigure(figure,[index]).length>(autumn2016Pm0508NativeProfiles.includes(figure.profile)?0:40));const component=legacy2016AutumnPm0508FigureRenderers.find(r=>r.profile===figure.profile)!.component,html=renderToStaticMarkup(createElement(component,{values:[index],caption:'検証図'}));
    if(!autumn2016Pm0508NativeProfiles.includes(figure.profile)&&!figure.profile.endsWith('-detail-program'))assert(html.includes('検証図'));assert(!html.includes('<img'));assert(!html.includes('undefined'));assert(!html.includes('NaN'));
    if(figure.profile.endsWith('-classes')){for(const label of ['data-pm2016-blank="a"','data-pm2016-blank="b1"','data-pm2016-blank="b2"','会員情報','貸出明細','1..10','クラスA','クラスD'])assert(html.includes(label));assert.equal((html.match(/data-uml-class=/g)??[]).length,13);}
    if(figure.profile.endsWith('-sequence')){assert.equal((html.match(/data-lifeline=/g)??[]).length,8);for(const label of ['data-pm2016-blank="c"','data-pm2016-blank="d"','α','省略'])assert(html.includes(label));}
    if(figure.profile.endsWith('-quality-graph'))for(const label of ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','80','100','4','5','6'])assert(html.includes(label));
    if(figure.profile.endsWith('-forecast')){assert.equal((html.match(/網掛け・非表示/g)??[]).length,3);assert(html.includes('data-pm2016-blank="d"'));assert(!html.includes('11.55'));}
    if (figure.profile === 'legacy-2016-autumn-pm-8-program') {
      // Printed p.36 (PDF p.37) puts all three lines inside the dashed frame.
      const summary = [...html.matchAll(/data-program-row="(?:9|10|11)"><g><text[^>]*>([^<]+)/g)].map(match => match[1]);
      assert.deepEqual(summary, [
        '現在の変数・配列要素の内容が，表2のケース1〜7の',
        'どれに該当するかを決定し，そのケースに従って',
        'Pattern[p]とsignifの更新処理を行う。',
      ]);
    }
    if(figure.profile.endsWith('-detail-program')){assert(html.includes('data-pm2016-blank="d"'));assert(html.includes('data-pm2016-blank="e"'));assert(html.includes('何もしない'));}
  }
});


test('all knowledge distractors preserve their source-reviewed meanings and the detailed edit-condition pair is unique over all states',()=>{
  for(let index=0;index<4;index++) {
    const quality=q6.build([index]),finance=q7.build([index]),edit=q8.build([index]);
    assert.deepEqual(bank(quality,'a').map(c=>c[0].type==='table'?c[0].rows[0]:[]),reviewedQ6Knowledge.a);
    for(const id of ['c','d','e','f'] as const)assert.deepEqual(bank(quality,id).map(plain),reviewedQ6Knowledge[id]);
    for(const id of ['a','b','c','f','g'] as const)assert.deepEqual(bank(finance,id).map(plain),reviewedQ7Knowledge[id]);
    assert.deepEqual(bank(finance,'d').map(plain),reviewedQ7Knowledge.moneyCents.map(cents=>roundMoney(fraction(cents*(index+1),100))));
    const choices=bank(edit,'d').map(plain),pairs:number[][]=[];
    assert.deepEqual(choices,Object.keys(editConditionMeaning));
    for(let d=0;d<choices.length;d++)for(let e=0;e<choices.length;e++){
      let correct=true;
      for(const control of ['□','■'] as const)for(const before of [false,true])for(const digit of '0123456789')for(const next of ['+','-','0','9']) {
        let active=before,replaced='digit';
        if(!before){if(!(control==='□'&&digit==='0')&&next!=='+')active=true;if(editConditionMeaning[choices[d]](digit,next))replaced='fill';}
        else if(editConditionMeaning[choices[e]](digit,next))active=false;
        const expected=transitionReference(control,before,digit,next);
        if(active!==expected.active||replaced!==expected.replaced)correct=false;
      }
      if(correct)pairs.push([d,e]);
    }
    assert.deepEqual(pairs,[[selectedIndex(edit,'d'),selectedIndex(edit,'e')]]);
    const fTruth=bank(edit,'f').map(c=>[...plain(c).matchAll(/\d/g)].map(m=>Number(m[0])).join(',')==='5,7');
    assert.equal(fTruth.filter(Boolean).length,1);assert.equal(fTruth[selectedIndex(edit,'f')],true);
    const digits=['12','34','56','78'][index];
    assert.deepEqual(bank(edit,'a').map(c=>plain(c).replace(/[“”]/g,'')),['*******#','********','******0#','******0*']);
    assert.deepEqual(bank(edit,'b').map(c=>plain(c).replace(/[“”]/g,'')),['*****'+digits+'#','*****'+digits+'*','****.'+digits+'#','****.'+digits+'*','***0.'+digits+'#','***0.'+digits+'*']);
  }
  defs.forEach(definition=>{
    const bodies=Array.from({length:4},(_,i)=>definition.build([i])),signatures=bodies.map(body=>body.answerParts!.map(part=>plain(selected(body,part.id.slice(5)))).join('/'));
    assert.equal(new Set(bodies.map(body=>JSON.stringify([body.prompt,body.choices]))).size,4);
    assert(new Set(signatures).size>=2,'substantive conditions change actual correct content, not only option order');
  });
});


test('PM5–8 native source boxes, unnamed instruction boxes, actor activations and grouped/hidden table cells retain the original visible form',()=>{
  const expected = [ ['a','b1','b2','c','d','e1','e2'], ['a1','a2','a3','b','c','c','d','e','f'], ['a','b','c','d','e','f'], ['a','b','c','d','e','f'] ];
  const genericCounts=[3,2,2,3],bundle={rights:[],sources:[],assets:[]} as unknown as Bundle;
  for(const [which,definition] of defs.entries())for(let value=0;value<4;value++){
    const body=definition.build([value]),html=renderToStaticMarkup(createElement(Content,{content:{attribution:{origin:'adapted',sourceRefs:[],rightsRefs:[],creatorIds:['codex']},blocks:body.prompt},bundle,assetUrls:{},showAttribution:false}));
    const boxes=[...html.matchAll(/data-pm2016-blank="([^"]*)"/g)].map(m=>m[1]);
    assert.deepEqual(boxes.filter(Boolean).sort(),[...expected[which]].sort());assert.equal(boxes.filter(name=>name==='').length,genericCounts[which]);
    assert(!html.includes('supplementary-text'));
    if(which===0){assert.equal((html.match(/data-participant-header=/g)??[]).length,7);assert.equal((html.match(/data-uml-actor=/g)??[]).length,1);assert.equal((html.match(/data-activation=/g)??[]).length,7);assert.equal((html.match(/data-nested-activation=/g)??[]).length,3);}
    if(which===1)assert.equal((html.match(/原資料で非表示の部分/g)??[]).length,9);
    if(which===3){assert(html.includes('colSpan="3"')||html.includes('colspan="3"'));assert(html.includes('現在の変数・配列要素の内容'));assert(html.includes('更新処理'));assert.equal((html.match(/原資料で非表示の部分/g)??[]).length,3);}
  }
});
