import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { autumn2012Pm05To08Specs } from '../scripts/legacy-2012-autumn-pm-05-08-specs';
import { legacy2012AutumnPm0508FigureRenderers } from '../src/ui/Legacy2012AutumnPm0508Figures';

type Table = Extract<Block,{type:'table'}>;
type Figure = Extract<Block,{type:'diagram'}>;
const range=[0,1,2,3];
function definition(number:number) {
  const spec=autumn2012Pm05To08Specs.find(row=>row.number===number);
  assert(spec);
  return spec.definition;
}
function selected(body:GeneratedBody,slot:number) {
  const part=body.answerParts![slot], key=body.partAnswers![slot];
  assert.equal(key.kind,'choice');
  return part.choiceIds.indexOf(key.choiceId);
}
function blockText(block:Block):string {
  if(block.type==='paragraph'||block.type==='code') return block.text;
  assert.equal(block.type,'table');
  return block.rows[0].join('｜');
}
function candidates(body:GeneratedBody,slot:number) {
  return body.answerParts![slot].choiceIds.map(id=>blockText(body.choices[Number(id.split('-').at(-1))-1][0]));
}
function unique(body:GeneratedBody,slot:number,accept:(text:string)=>boolean) {
  const options=candidates(body,slot), match=options.map((text,i)=>accept(text)?i:-1).filter(i=>i!==-1);
  assert.equal(options.length,new Set(options).size);
  assert.deepEqual(match,[selected(body,slot)]);
}
const textOf=(body:GeneratedBody)=>body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
function tableFor(body:GeneratedBody,prefix:string):Table {
  const table=body.prompt.find((b):b is Table=>b.type==='table'&&b.caption.startsWith(prefix));
  assert(table);
  return table;
}
function figFor(body:GeneratedBody,tail:string) {
  const block=body.prompt.find((b):b is Figure=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile.endsWith('-'+tail));
  assert(block&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene;
  const renderer=legacy2012AutumnPm0508FigureRenderers.find(row=>row.profile===profile);
  assert(renderer);
  return {block,html:renderToStaticMarkup(createElement(renderer.component,{values,caption:block.caption}))};
}

test('S3-018問5–8の公式28欄と解答群数、各原頁の読上げを独立に照合する',()=>{
  const keys=['ウエオウアエエ','オカキイエイエ','ウイウオアエイ','ウアエウエウウ'];
  const bankSizes=[[5,5,5,3,3,5,5],[9,9,9,9,6,4,4],[8,8,8,5,9,4,6],[4,4,4,4,4,4,4]];
  const pages=[[22,28],[29,32],[33,37],[38,43]];
  const kana='アイウエオカキクケ';
  for(const [i,spec] of autumn2012Pm05To08Specs.entries()){
    assert.equal(spec.number,i+5);
    assert.equal(spec.pages[0],pages[i][0]); assert.equal(spec.pages.at(-1),pages[i][1]);
    assert.equal(spec.pages.length,pages[i][1]-pages[i][0]+1);
    assert(spec.pages.every(page=>spec.originalPageAlt[page].length>100));
    assert.equal(spec.original.answerParts?.length,7);
    assert.deepEqual(spec.original.answerParts?.map(part=>part.choiceIds.length),bankSizes[i]);
    assert.equal(spec.original.answerParts?.map((_,slot)=>kana[selected(spec.original,slot)]).join(''),keys[i]);
    assert.equal(spec.definition.sourceAnswer,[...keys[i]].join('／'));
    for(const invalid of [[],[-1],[4],[0,1],[NaN],[1.5],new Array<number>(1)])
      assert.throws(()=>spec.definition.build(invalid));
    assert.equal(new Set(range.map(n=>JSON.stringify(spec.definition.build([n]).prompt))).size,4);
  }
});

test('S3-018問5を暦月・提出境界・優秀判定から全候補を独立検算する',()=>{
  for(const index of range){
    const body=definition(5).build([index]), prompt=textOf(body), course=tableFor(body,'表1 A社');
    const duration=course.rows.map(row=>Number.parseInt(row[1],10));
    const required=[...prompt.matchAll(/(\d+)回以上答案を提出し，かつ，平均点が(\d+)点以上/g)];
    assert.equal(required.length,2);
    const pass=Number(required[0][2]), honor=Number(/全ての答案を提出し，かつ，平均点が(\d+)点以上/.exec(prompt)?.[1]);
    const months=[...prompt.matchAll(/起算日(?:という）)?から(\d+)か月/g)].map(m=>Number(m[1]));
    assert.equal(months.length,2);
    const {html:chart}=figFor(body,'5-grade-flow'), {html:discount}=figFor(body,'5-discount-flow');
    for(const [i,match] of required.entries()) {
      assert(chart.includes(`受講期間の月数＝${duration[2-i]}かつ提出回数≧${match[1]}`));
      assert.equal(Number(match[2]),pass);
    }
    assert(chart.includes('平均点≧'+pass));
    months.forEach(month=>assert(discount.includes('割引対象期間←'+month)));
    const dates=[
      {start:20220501,finish:20221031,deadline:20221025,sent:20221101,returned:20221101},
      {start:20220501,finish:20221130,deadline:20221025,sent:20221024,returned:20221026},
      {start:20220601,finish:20221101,deadline:20221125,sent:20221126,returned:20221127},
      {start:20221001,finish:20221031,deadline:20221025,sent:20221025,returned:20221028},
    ];
    const fieldNames=['開始年月日','提出期限','終了年月日','提出日','返送日'];
    const dateFields=['start','deadline','finish','sent','returned'] as const;
    unique(body,0,option=>{
      const field=dateFields[fieldNames.findIndex(name=>option.includes(name))];
      return dates.every(d=>(d[field]<20221101)===(d.finish<20221101));
    });
    const datePairs=[[24,25],[25,25],[26,25],[27,25]];
    const compares=[(a:number,b:number)=>a===b,(a:number,b:number)=>a!==b,(a:number,b:number)=>a>b,
      (a:number,b:number)=>a<=b,(a:number,b:number)=>a-1>b];
    unique(body,1,option=>{
      const operator=option.match(/[＝≠＞≦]/)?.[0];
      const n=option.includes('前日')?4:'＝≠＞≦'.indexOf(operator??'');
      return datePairs.every(([a,b])=>compares[n](a,b)===[true,true,false,false][a-24]);
    });
    const scores=[pass,pass+1,honor-1,honor,honor+1,100];
    const predicate=[(n:number)=>n===pass,(n:number)=>n<pass,(n:number)=>n>pass&&n<honor,
      (n:number)=>n>honor,(n:number)=>n>=honor];
    unique(body,2,option=>{
      const match=/(＝|＜平均点＜|平均点＜|＞|≧)/.exec(option);
      assert(match);
      const role=['＝','平均点＜','＜平均点＜','＞','≧'].indexOf(match[0]);
      return scores.every(n=>predicate[role](n)===(n>=honor));
    });
    unique(body,3,x=>x==='“優秀”'); unique(body,4,x=>x==='“合格”');
    const dateCases=[[2022,11,2022,12],[2022,11,2023,1],[2022,11,2024,11],[2022,2,2023,3]];
    const align=[(s:number,n:number,y:number)=>s-y,(s:number,n:number,y:number)=>s+y,
      (s:number,n:number,y:number)=>n-y,(s:number,n:number,y:number)=>n+y,(s:number,n:number,y:number)=>n-y];
    const offsets=dateCases.map(([ys,ms,yn,mn])=>{
      const cursor=new Date(Date.UTC(ys,ms-1,1)), target=new Date(Date.UTC(yn,mn-1,1));
      let elapsed=0;
      while(cursor<target){cursor.setUTCMonth(cursor.getUTCMonth()+1);elapsed++;}
      return elapsed;
    });
    const fRoles=candidates(body,5);
    unique(body,5,option=>dateCases.every(([ys,ms,yn,mn],i)=>
      ys===yn||align[fRoles.indexOf(option)](ms,mn,12*(yn-ys))-ms===offsets[i]));
    const last=[(start:number,term:number)=>start,(start:number,term:number)=>start-term,(start:number,term:number)=>term,
      (start:number,term:number)=>term+start,(start:number,term:number)=>term-start];
    const gRoles=candidates(body,6);
    unique(body,6,option=>dateCases.every(([ys,ms,yn,mn],i)=>months.every(term=>{
      const span=last[gRoles.indexOf(option)](ms,term)-(mn+12*(yn-ys));
      const expected=term-offsets[i];
      return (span<0?99:span)===(expected<0?99:expected);
    })));
    assert(body.explanation.includes(`平均${honor}点以上`)&&body.explanation.includes('0は置換しない'));
  }
});

test('S3-018問6を表示された移動ログから棚・箱・貸出しの個別残高で検算する',()=>{
  for(const index of range){
    const body=definition(6).build([index]), movements=tableFor(body,'図2 棚卸対象');
    let rack=1036, unused=12, pending=8, lent=4, disposed=0;
    for(const [,operation] of movements.rows){
      if(operation.includes('全テープ')){
        disposed+=pending;pending=0;
        continue;
      }
      const amount=Number(/(\d+)本/.exec(operation)?.[1]);
      assert(Number.isSafeInteger(amount)&&amount>0);
      if(operation.includes('出庫')) rack-=amount;
      else if(operation.includes('移動')) {rack-=amount;pending+=amount;}
      else if(operation.includes('貸出し')) {rack-=amount;lent+=amount;}
      else if(operation.includes('新規購入')) unused+=amount;
      else if(operation.includes('返却')) {rack+=amount;lent-=amount;}
      else if(operation.includes('使用')) {rack+=amount;unused-=amount;}
      else assert.fail(operation);
    }
    [disposed,unused,pending,lent-1,rack+unused+pending+lent].forEach((value,slot)=>unique(body,slot,x=>Number(x)===value));
    unique(body,5,x=>x.includes('運用課が返却予定日を管理し，超過した場合'));
    unique(body,6,x=>x.includes('ヘルプデスク担当者が機密情報を複写し'));
    const {html}=figFor(body,'6-current');
    assert(html.includes('>'+rack+'</td>')&&html.includes('このうちの1本は所在を確認中'));
    assert.equal((html.match(/data-source-blank=/g)??[]).length,5);
    assert(body.explanation.includes('＝'+(rack+unused+pending+lent)+'本'));
  }
});

test('S3-018問7の台帳と9通りの手配を状態遷移と集計から独立検算する',()=>{
  for(const index of range){
    const body=definition(7).build([index]), a=figFor(body,'7-stock-a'), b=figFor(body,'7-stock-b');
    function ledger(block:Figure) {
      const rows=block.alt.split('\n').slice(1,11).map(row=>row.split('｜'));
      assert.equal(rows.length,10);
      return rows.map(row=>row.slice(1).map(cell=>Number(cell.replaceAll(',','').replace('¹⁾',''))));
    }
    const A=ledger(a.block), B=ledger(b.block);
    const opening=A[7][1]-A[0][1]-A[3][1]+A[1][1]+A[2][1];
    const damage=A[8][0]+A[1][1]-A[6][1]-A[8][1];
    const damaged=A[9][1]+A[2][2]+A[4][2]-A[5][2];
    [opening,damage,damaged].forEach((value,slot)=>unique(body,slot,x=>Number(x.replaceAll(',',''))===value));
    const changes=B.map(row=>row[2]-row[1]);
    assert.equal(changes[7],B[0][2]+B[3][2]-B[1][2]-B[2][2]);
    assert.equal(changes[8],B[1][2]-B[4][2]-B[6][2]);
    assert.equal(changes[9],B[2][2]+B[4][2]-B[5][2]);
    const narrative=[
      B[0][1]<B[6][1] && B[1][1]-B[0][1]===0,
      B[3][1]===B[4][1],
      B[5][1]===0&&B[5][2]===0&&changes[8]===-B[5][2],
      B[3][2]===B[4][2],
      B[0][2]===0&&B[3][2]>0&&changes[7]<0,
    ];
    const statements=candidates(body,3);
    unique(body,3,x=>narrative[statements.indexOf(x)]);
    const plan=(rows:number[][])=>{
      const due=rows[6][3], good=rows[8][2], checking=rows[7][2];
      assert(good>=due,'生成例は不足時の手順②と③の同時適用を要しない');
      return Math.min(good/2,(good+checking)/3)<due?'21日の生産を手配する':'なし';
    };
    unique(body,4,x=>x===plan(A)+'｜'+plan(B));
    unique(body,5,x=>x.includes('キャッシュフローを増加させ，棚卸資産を減少させる'));
    unique(body,6,x=>x.includes('手順③')&&x.includes('倍率を下げる'));
    assert.equal((a.html.match(/data-source-blank=/g)??[]).length,3);
    assert(a.html.includes('<sup>1)</sup>')&&b.html.includes('網掛けの非表示部分'));
  }
});

function shortest(edges:readonly (readonly [number,number,number])[],size:number,start:number,end:number,limit:number) {
  if(start===end) return 0;
  const walk=(current:number,used:readonly number[],dist:number):number=>{
    if(current===end)return dist;
    if(current!==start&&current>limit)return Infinity;
    return Math.min(Infinity,...edges.flatMap(([a,b,w])=>{
      const next=a===current?b:b===current?a:null;
      return next===null||used.includes(next)?[]:[walk(next,[...used,next],dist+w)];
    }));
  };
  assert(start>=1&&start<=size&&end>=1&&end<=size);
  return walk(start,[start],0);
}

test('S3-018問8の全段階・全駅対・数値選択肢を単純路列挙から独立検算する',()=>{
  for(const index of range){
    const body=definition(8).build([index]), route=figFor(body,'8-route'), matrix=figFor(body,'8-distance-trace');
    const weights=[...route.block.alt.matchAll(/(\d)－(\d)：(\d+)/g)].map(m=>m.slice(1).map(Number) as [number,number,number]);
    assert.equal(weights.length,6);
    const phases=matrix.block.alt.split(/(?:初期値|Via＝[1-5])\n/).slice(1);
    assert.equal(phases.length,6);
    phases.forEach((section,via)=>{
      section.split('\n').slice(0,5).forEach((row,i)=>row.split('　').forEach((value,j)=>{
        const independent=shortest(weights,5,i+1,j+1,via);
        if(value==='［a］') assert.equal(independent,Number(candidates(body,0)[selected(body,0)]));
        else if(value==='［b］') assert.equal(independent,Number(candidates(body,1)[selected(body,1)]));
        else assert.equal(Number(value),Number.isFinite(independent)?independent:999);
      }));
    });
    unique(body,0,x=>Number(x)===shortest(weights,5,1,3,2));
    unique(body,1,x=>Number(x)===shortest(weights,5,3,5,2));
    const triple=[5,10].map(n=>n*n*n), quadratic=[5,10].map(n=>n*n);
    unique(body,2,x=>x==='O(N³)'&&triple[1]/triple[0]===8);
    unique(body,3,x=>x==='O(N²)'&&quadratic[1]/quadratic[0]===4);
    unique(body,4,x=>{
      const bounds=x.startsWith('From ＋ 1')?(i:number,n:number)=>[i+1,n]
        : x.startsWith('From,')?(i:number,n:number)=>[i,n-1]
          : x.includes('From ＋ 1')?(i:number)=>[1,i+1]:(i:number)=>[1,i];
      const n=5, pair=new Set<string>();
      let comparisonCount=0;
      for(let i=1;i<n;i++){
        const [first,last]=bounds(i,n);
        for(let j=first;j<=last;j++){
          comparisonCount++;
          if(i!==j)pair.add([Math.min(i,j),Math.max(i,j)].join('-'));
        }
      }
      return comparisonCount===10&&pair.size===10;
    });
    const extended=figFor(body,'8-extended-route').block.alt;
    const displayed=[...extended.matchAll(/([1-6])－([1-6])の距離(\d+)/g)].map(m=>m.slice(1).map(Number) as [number,number,number]);
    assert.equal(displayed.length,3);
    const other=[[1,2,12],[2,3,16],[2,10,8],[10,4,7],[1,7,8],[7,8,9],[8,9,11],[9,3,12]] as const;
    const network=[...displayed,...other], sections=[
      ['1',1,0,1,0],['2',2,0,2,0],['3',3,0,3,0],['4',4,0,4,0],
      ['B',1,displayed[0][2],3,displayed[1][2]+displayed[2][2]],
      ['B',1,displayed[0][2]+displayed[1][2],3,displayed[2][2]],
      ['C',1,8,3,32],['C',1,17,3,23],['C',1,28,3,12],['E',2,8,4,7],
    ] as const;
    const matchers=[(x:typeof sections[number],y:typeof sections[number])=>x[1]===y[1]&&x[3]===y[3],
      (x:typeof sections[number],y:typeof sections[number])=>x[1]!==y[1]||x[3]!==y[3],
      (x:typeof sections[number],y:typeof sections[number])=>x[0]===y[0],
      (x:typeof sections[number],y:typeof sections[number])=>x[0]!==y[0]];
    const predicates=candidates(body,5);
    unique(body,5,option=>sections.every((from,i)=>sections.every((to,j)=>{
      if(i===j)return true;
      const via=Math.min(...[[from[1],from[2]],[from[3],from[4]]].flatMap(([a,da])=>[[to[1],to[2]],[to[3],to[4]]].map(([b,db])=>
        da+shortest(network,10,a,b,10)+db)));
      const result=matchers[predicates.indexOf(option)](from,to)?Math.min(via,Math.abs(from[2]-to[2])):via;
      return result===shortest(network,10,i+1,j+1,10);
    })));
    const k=Number(/例えばK＝(\d+)/.exec(textOf(body))?.[1]);
    unique(body,6,x=>{
      const n=Number(x);
      return n*n>k*k+5*n&&(n-1)*(n-1)<=k*k+5*(n-1);
    });
    assert.equal((matrix.html.match(/data-distance-phase=/g)??[]).length,6);
    assert.equal((matrix.html.match(/data-source-blank=/g)??[]).length,4);
    assert(body.explanation.includes('Sec[i]＝Sec[j]'));
    assert.deepEqual(body.contexts?.[0].blocks.map(block=>block.type==='image'?block.assetId:''),
      ['asset-ipa-2012h24a-fe-pm-p003','asset-ipa-2012h24a-fe-pm-p004']);
  }
});

test('S3-018問8の制御線・字下げと点線置換範囲を紙面の行位置で検査する',()=>{
  const body=definition(8).build([0]);
  const main=figFor(body,'8-program'), half=figFor(body,'8-half-program'), branch=figFor(body,'8-minimum-program');
  const controls=(html:string)=>[...html.matchAll(/data-control-prefix="([^"]*)"/g)].map(m=>m[1]);
  assert.deepEqual(controls(main.html),['','','','■','│ ■','│ │ ■','│ │ │ ▲','│ │ │ │','│ │ │ ▼','│ │ ■','│ ■','│','■']);
  assert.deepEqual(controls(half.html),['■','│ ■','│ │ ▲','│ │ │','│ │ │','│ │ ▼','│ ■','■']);
  assert.deepEqual(controls(branch.html),['▲','│','├','▼']);
  assert.equal((main.html.match(/data-source-dashed=/g)??[]).length,1);
  assert.equal((main.html.match(/Print\(N, Dist\)/g)??[]).length,4);
  assert(half.html.includes('data-source-blank="e"'));
  assert(branch.html.includes('data-source-blank="f"'));
});
