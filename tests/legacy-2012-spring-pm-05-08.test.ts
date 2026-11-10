import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../src/core/generators/definition';
import type { Block } from '../src/core/types';
import { legacy2012SpringPm05To08Definitions as definitions, spring2012Pm0508OriginalPageAlt } from '../src/core/generators/legacy-2012-spring-pm-05-08';
import { legacy2012SpringPm0508Figures as figures } from '../src/core/generators/legacy-2012-spring-pm-05-08-figures';
import { legacy2012SpringPm0508FigureRenderers as renderers } from '../src/ui/Legacy2012SpringPm0508Figures';

const marks='アイウエオカキクケコ';
const baselineKeys=['エカエエイウ','ウカイウアイ','アカアエアウイウ','ウアイアアオ'];
const slotNames=[['a','b','設問2','c','d','e'],['a','b','c','d','e','f'],
  ['a','b','c','d','e','f','g','h'],['a','b','c','d','e','f']];
const bankCounts=[[7,7,6,7,7,8],[4,6,4,6,3,4],[6,8,4,4,4,3,3,3],[5,5,6,4,4,6]];
const number = (str:string)=>Number(str.replaceAll(',','').replace('−','-'));
const body=(major:number,index:number)=>definitions[major-5].build([index]);
const cases=(major:number)=>Array.from({length:4},(_,index)=>body(major,index));
const paragraphs=(q:GeneratedBody)=>q.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join('\n');
function diagram(q:GeneratedBody,id:string) {
  const block=q.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+id));
  assert(block?.type==='diagram');
  return block;
}
function table(q:GeneratedBody,caption:RegExp) {
  const block=q.prompt.find(block=>block.type==='table'&&caption.test(block.caption));
  assert(block?.type==='table');
  return block;
}
function candidates(q:GeneratedBody, part:number) {
  return q.answerParts![part].choiceIds.map(id=>{
    const choice=q.choices[Number(id.match(/choice-value-(\d+)/)?.[1])-1];
    assert.equal(choice.length,1);
    return choice[0];
  });
}
function text(block:Block) {
  if(block.type==='paragraph'||block.type==='code') return block.text;
  if(block.type==='diagram'||block.type==='formula') return block.alt;
  assert.fail('unsupported choice type: '+block.type);
}
function correct(q:GeneratedBody,part:number) {
  const result=q.partAnswers![part];
  assert.equal(result.kind,'choice');
  assert.equal(result.partId,q.answerParts![part].id);
  return q.answerParts![part].choiceIds.indexOf(result.choiceId);
}
function allChoices(q:GeneratedBody,part:number,judge:(choice:string,index:number)=>boolean) {
  const results=candidates(q,part).map((block,i)=>judge(text(block),i));
  assert.deepEqual(results.flatMap((yes,i)=>yes?[i]:[]),[correct(q,part)],q.answerParts![part].label);
}
const one=(q:GeneratedBody,part:number,expected:string)=>allChoices(q,part,choice=>choice===expected);

test('問5〜8の公式26欄、選択肢構成、原頁・基準値、全有限入力と拒否境界',()=>{
  const pages=[[19,24],[25,29],[30,34],[35,39]];
  assert.deepEqual(definitions.map(d=>d.source),[5,6,7,8].map(n=>'2012h24h-fe-pm-'+n));
  for(const [i,definition] of definitions.entries()) {
    assert.deepEqual(definition.reference,[0]);
    assert.equal(definition.sourceAnswer.replaceAll('／',''),baselineKeys[i]);
    assert.deepEqual(definition.fields.map(field=>[field.minimum,field.maximum]),[[0,3]]);
    const baseline=definition.build([0]);
    assert.equal(baseline.answerParts!.map((_,part)=>marks[correct(baseline,part)]).join(''),baselineKeys[i]);
    const [from,to]=pages[i];
    const original=spring2012Pm0508OriginalPageAlt(([5,6,7,8] as const)[i]);
    assert.deepEqual(Object.keys(original).map(Number),Array.from({length:to-from+1},(_,j)=>from+j));
    assert(Object.values(original).every(alt=>alt.length>100));
    const generated=cases(i+5);
    assert.equal(new Set(generated.map(q=>JSON.stringify(q.prompt))).size,4);
    assert.equal(new Set(generated.map(q=>JSON.stringify(q.answerParts!.map((_,j)=>text(candidates(q,j)[correct(q,j)]))))).size,4);
    for(const [index,q] of generated.entries()) {
      assert.deepEqual(q.answerParts!.map(part=>part.label),slotNames[i]);
      assert.deepEqual(q.answerParts!.map(part=>part.choiceIds.length),bankCounts[i]);
      assert.equal(q.partAnswers!.length,slotNames[i].length);
      assert.ok(q.explanation.length>=200);
      for(const [j,part] of q.answerParts!.entries()) {
        assert.equal(new Set(candidates(q,j).map(text)).size,part.choiceIds.length);
        assert.ok(correct(q,j)>=0);
      }
      assert.deepEqual(q,definition.build([index]));
    }
    for(const input of [[],[-1],[4],[0.2],[NaN],[1,2],new Array(1)]) assert.throws(()=>definition.build(input));
  }
  const fixed=definitions[3].fixedReferenceAssetIds;
  assert.deepEqual(fixed,['asset-ipa-2012h24h-fe-pm-p003','asset-ipa-2012h24h-fe-pm-p004']);
  assert.deepEqual(body(8,0).contexts?.[0].blocks.map(block=>block.type==='image'&&block.assetId),fixed);
  assert.deepEqual(body(7,0).answerParts?.slice(5).map(part=>part.choiceIds),
    Array.from({length:3},()=>body(7,0).answerParts?.[5].choiceIds));
});

test('問5の片側欠落・整列キー・前年度順位をSQLiteで独立検算',()=>{
  const original=[
    ['1','東南高校','82','8','62'],['2','東西高校','80','1','96'],['2','西北高校','80','4','68'],
    ['4','南西高校','73','5','64'],['5','北北学園','60','3','70'],['5','南南学園','60','','0'],
    ['','その他計','2666','','2723'],['','合計','3101','','3083'],
  ];
  const names=original.slice(0,6).map(row=>row[1]);
  for(const [index,q] of cases(5).entries()) {
    const statement=paragraphs(q);
    const sourceOrder=statement.match(/どちらも学校コードの(昇順|降順)/)?.[1];
    const printOrder=statement.match(/同数の場合は，前年度受験者数の(昇順|降順)，それも同数の場合は，学校コードの(昇順|降順)/);
    assert(sourceOrder&&printOrder);
    assert.match(statement,/指定順位よりも下位[\s\S]*その他計/);
    assert.match(statement,/この突合せ処理の中では，整列は行わない/);
    assert.match(statement,/前年度に受験者がいなかった高校の前年度順位は空欄/);
    const comparison=diagram(q,'match-table').alt;
    assert.match(comparison,/あり｜なし｜網掛け｜［a：今年度受験者数，前年度受験者数の2列］/);
    assert.match(comparison,/なし｜あり｜［b：学校コード，今年度受験者数の2列］｜網掛け/);
    assert.match(diagram(q,'flow-extra').alt,/処理1→ファイルX→処理2→ファイルY→処理3→ファイルZ→処理4→ファイル8/);
    const out=table(q,/^図5/).rows;
    if(index===0) assert.deepEqual(out,original);
    const currentShift=number(out.find(row=>row[1]===names[0])![2])-82;
    const priorShift=number(out.find(row=>row[1]===names[0])![4])-62;
    const db=new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE schools(code TEXT PRIMARY KEY,name TEXT); CREATE TABLE current(code TEXT,n INT); CREATE TABLE prior(code TEXT,n INT);');
      const school=db.prepare('INSERT INTO schools VALUES (?,?)'), now=db.prepare('INSERT INTO current VALUES (?,?)'),
        past=db.prepare('INSERT INTO prior VALUES (?,?)');
      for(const [i,row] of original.slice(0,6).entries()){
        const key='S0'+(i+1);
        school.run(key,row[1]); now.run(key,Number(row[2])+currentShift);
        if(Number(row[4])) past.run(key,Number(row[4])+priorShift);
      }
      // Lower-ranked schools are represented only by sums in the source.
      const lower=[80,63,63,...Array<number>(51).fill(49),18];
      for(const [i,priorCount] of lower.entries()){
        const key='T'+(i+10);
        school.run(key,'lower '+i); now.run(key,i<26?49:48); past.run(key,priorCount+priorShift);
      }
      const order=(value:string)=>value==='昇順'?'ASC':'DESC';
      const query=`WITH p AS (SELECT code,n,RANK() OVER (ORDER BY n DESC) AS rank FROM prior)
        SELECT RANK() OVER (ORDER BY COALESCE(current.n,0) DESC) AS r, schools.name, COALESCE(current.n,0) AS curr,
          COALESCE(p.rank,'') AS oldRank, COALESCE(p.n,0) AS old
        FROM schools LEFT JOIN current USING(code) LEFT JOIN p USING(code)
        ORDER BY curr DESC, old ${order(printOrder[1])}, schools.code ${order(printOrder[2])}`;
      const records=db.prepare(query).all();
      const visible=records.filter(row=>Number(row.r)<=5).map(row=>Object.values(row).map(String));
      const sum=(subset:typeof records,key:'curr'|'old')=>String(subset.reduce((total,row)=>total+Number(row[key]),0));
      const other=records.filter(row=>Number(row.r)>5);
      const expected=[...visible,['','その他計',sum(other,'curr'),'',sum(other,'old')],['','合計',sum(records,'curr'),'',sum(records,'old')]];
      assert.deepEqual(out,expected);
      assert.deepEqual(table(q,/^図2/).rows,expected.map(row=>row.filter((_,i)=>i!==3)));
    for(const prefix of [/^図2/,/^図5/]) {
      const list=table(q,prefix);
      assert.equal(list.captionPresentation,'accessible');
      assert.equal(list.sourceLabels?.[0]?.position,'top-center');
      assert.equal(q.prompt.filter(block=>block.type==='paragraph'&&prefix.test(block.text)&&/^図[25]　/.test(block.text)).length,1);
    }
      const joined=db.prepare(`WITH a(code,n) AS (VALUES ('A',4),('B',3)), b(code,n) AS (VALUES ('B',7),('C',9))
        SELECT COALESCE(a.code,b.code) AS key,COALESCE(a.n,0) AS curr,COALESCE(b.n,0) AS old FROM a FULL OUTER JOIN b USING(code)`).all();
      assert.deepEqual(joined.map(row=>Object.values(row)),[['A',4,0],['B',3,7],['C',0,9]]);
      const choices=candidates(q,0).map(text);
      const field=(source:string,value:string)=>value==='0'?'0':value==='ファイル1の当該項目'?source.split('/')[0]:source.split('/')[1];
      const applicable=(row:typeof joined[number],part:number,choice:string)=>{
        const options=choice.split('｜');
        return part===0
          ? field('4/missing',options[0])===String(row.curr)&&field('missing/missing',options[1])===String(row.old)
          : field('missing/C',options[0])===String(row.key)&&field('missing/missing',options[1])===String(row.curr);
      };
      assert.equal(new Set(choices).size,7);
      allChoices(q,0,choice=>applicable(joined[0],0,choice));
      allChoices(q,1,choice=>applicable(joined[2],1,choice));
      allChoices(q,2,choice=>{
        const clauses=[...choice.matchAll(/（([^：]+)：(昇順|降順)）/g)].map(match=>match.slice(1));
        return JSON.stringify(clauses)===JSON.stringify([['今年度受験者数','降順'],['前年度受験者数',printOrder[1]],['学校コード',printOrder[2]]]);
      });
      one(q,3,'受験者数の降順への整列');
      one(q,4,'学校コードの'+sourceOrder+'への整列');
      const printedColumns=table(q,/^図5/).columns;
      one(q,5,['学校コード',...printedColumns.slice(2)].join('，'));
      assert.match(q.explanation,/前年度順位は空欄/);
    } finally {db.close();}
  }
});

const halfUp=(numerator:number,denominator:number,scale:number)=>Math.floor((2*numerator*scale+denominator)/(2*denominator));
test('問6の計画・実績・残工数を独立の整数丸めで全欄検算',()=>{
  for(const [index,q] of cases(6).entries()) {
    const p=paragraphs(q);
    assert.match(p,/1日の勤務時間は8時間[\s\S]*月曜日から金曜日までの5日間[\s\S]*土曜日と日曜日は休日/);
    assert.match(p,/第2週は全メンバが計画工数どおり/);
    assert.match(p,/小数第2位を四捨五入[\s\S]*小数第3位を四捨五入/);
    const actual=diagram(q,'actual-table').alt.split('\n').slice(2).map(line=>line.split('｜'));
    const plans=diagram(q,'plan-table').alt.split('\n').slice(1).map(line=>line.split('｜'));
    assert.equal(actual.length,5);
    assert.equal(plans.length,5);
    if(index===0) assert.deepEqual(actual.map(row=>row.slice(2)),[
      ['50','0','50','25','20'],['100','25','75','65','35'],['100','20','80','60','45'],
      ['100','15','85','55','40'],['350','60','290','205','140'],
    ]);
    const data=actual.map(([_,name,total,a1,r1,a2,r2],i)=>{
      const hours=plans[i].slice(2).map(Number), week3=hours[4];
      const work=[Number(a1),Number(a2)], remaining=[Number(r1),Number(r2)], plannedTotal=Number(total);
      assert.equal(work[1]-work[0],hours[2]);
      if(i!==4) assert(work[0]<=40&&hours[2]<=40&&week3<=40);
      assert.equal(plannedTotal,hours[0]+hours[2]+week3);
      const plan=[halfUp(hours[0],plannedTotal,1000),halfUp(hours[0]+hours[2],plannedTotal,1000)];
      const real=work.map((value,week)=>halfUp(value,value+remaining[week],1000));
      const ratios=work.map((value,week)=>halfUp(value+remaining[week],plannedTotal,100));
      assert.deepEqual(plan,[Math.round(hours[1]*10),Math.round(hours[3]*10)]);
      return {name,work,remaining,plannedTotal,week3,plan,real,ratios};
    });
    const team=data[4], members=data.slice(0,4);
    assert(team.ratios.every(ratio=>ratio<=100));
    for(const week of [0,1]) {
      assert.equal(team.work[week],members.reduce((sum,row)=>sum+row.work[week],0));
      assert.equal(team.remaining[week],members.reduce((sum,row)=>sum+row.remaining[week],0));
    }
    const late=(week:number)=>members.filter(row=>row.work[week]>0&&row.real[week]<row.plan[week]).map(row=>row.name);
    assert(late(0).length<=1);
    one(q,0,late(0).length?late(0)[0]+'である':'いない');
    assert.equal(late(1).length,2);
    allChoices(q,1,choice=>choice.split('と').every(member=>late(1).includes(member)));
    const changes=team.real.map((rate,week)=>Math.sign(rate-team.plan[week]));
    const trends:Record<string,number[]>={'週ごとに':[-1,-1],'同じであり':[0,1],'同じであるが':[0,-1],'下回っているが':[-1,1]};
    allChoices(q,2,choice=>{
      const possible=Object.entries(trends).filter(([needle])=>choice.includes(needle));
      assert.equal(possible.length,1);
      return possible[0][1].every((value,i)=>changes[i]===value);
    });
    allChoices(q,3,choice=>choice.split('及び').every((ratio,i)=>Math.round(Number(ratio)*100)===team.ratios[i]));
    one(q,4,String(members.filter(row=>row.ratios[1]>row.ratios[0]).length));
    const eligible=members.filter(row=>row.remaining[1]<row.week3);
    const max=Math.max(...eligible.map(row=>row.real[1]));
    allChoices(q,5,choice=>eligible.some(row=>row.name===choice&&row.real[1]===max));
    assert.ok(q.explanation.includes((team.real[1]/10).toFixed(1)+'％'));
  }
});

function roundRatio(numerator:bigint,denominator:bigint): number {
  return numerator < 0n ? -roundRatio(-numerator,denominator) : Number((2n*numerator+denominator)/(2n*denominator));
}
function npvReference(investment:number[], rate:number, life:number, extraSaving=0) {
  const amortized=Array(9).fill(0) as number[];
  for(const [i, amount] of investment.entries()) for(let j=i+1;j<=i+life&&j<9;j++) amortized[j]+=amount/life;
  const byYear=amortized.map((dep,i)=>{
    const saving=i===0?0:(i<=3?200:300)+extraSaving;
    const tax=(saving-dep)*2/5, afterTax=saving-tax, net=afterTax-investment[i];
    const pv10=roundRatio(BigInt(Math.round(net*100))*100n**BigInt(i),10n*BigInt(100+rate)**BigInt(i));
    return {saving,dep,tax,afterTax,net,pv10};
  });
  return {byYear,total:byYear.reduce((sum,row)=>sum+row.pv10,0)};
}
const disclosed=(str:string)=> !str.startsWith('［')&&!str.startsWith('（網掛け');

test('問7の全年度・全候補を有理数の複利割引と独立償却で検算',()=>{
  for(const [index,q] of cases(7).entries()) {
    const p=paragraphs(q);
    assert.match(p,/n＝0で計算[\s\S]*2012年から2020年[\s\S]*投資した翌年から4年間の定額償却（残存価額は0円）[\s\S]*法人税率を40％/);
    assert.match(p,/解答は重複して選んでもよい/);
    const rate=Math.round(Number(p.match(/割引率を(0\.\d\d)とし/)?.[1])*100);
    const read=(id:string)=>diagram(q,id).alt.split('\n').slice(2,-2).map(line=>line.split('｜').slice(1));
    const left=read('lump-table'), right=read('split-table');
    assert.equal(left.length,9);
    assert.equal(right.length,9);
    const first=left[0].map(number), second=right[0].map(number);
    const lump=npvReference(first,rate,4), split=npvReference(second,rate,4);
    for(const [rows,model] of [[left,lump],[right,split]] as const) {
      for(const [year,row] of model.byYear.entries()){
        const values=[row.dep,row.saving,row.tax,row.afterTax,row.net,rate/100,row.pv10/10];
        values.forEach((value,slot)=>{if(disclosed(rows[slot+1][year])) assert.equal(number(rows[slot+1][year]),value);});
      }
      if(disclosed(rows[8][0])) assert.equal(number(rows[8][0])*10,model.total);
    }
    if(index===0) assert.deepEqual([lump.total,split.total],[3781,3859]);
    const signatures:Record<string,(c:number,r:number,n:number)=>number>={
      'C／(1＋r)ⁿ':(c,r,n)=>c/(1+r)**n, 'C／(1−r)ⁿ':(c,r,n)=>c/(1-r)**n, 'C／rⁿ':(c,r,n)=>c/r**n,
      'C×(1＋r)ⁿ':(c,r,n)=>c*(1+r)**n, 'C×(1−r)ⁿ':(c,r,n)=>c*(1-r)**n, 'C×rⁿ':(c,r,n)=>c*r**n,
    };
    allChoices(q,0,choice=>Math.abs(signatures[choice](100,rate/100,2)*(1+rate/100)**2-100)<1e-9);
    const {net,pv10}=lump.byYear[1], {dep,saving,tax,afterTax}=split.byYear[3];
    allChoices(q,1,choice=>choice.split('｜').map(number).every((value,i)=>value===[net,rate/100,pv10/10][i]));
    allChoices(q,2,choice=>choice.split('｜').map(number).every((value,i)=>value===[dep,saving,tax,afterTax][i]));
    allChoices(q,3,choice=>choice===(lump.total>split.total?'一括':'分割')+'投資するべきである');
    const figures=p.match(/一括投資の場合のNPVは(\d+)億([\d,]+)万円，分割投資の場合のNPVは(\d+)億([\d,]+)万円/);
    assert(figures);
    const withExtra=[Number(figures[1])*1000+number(figures[2])/10,Number(figures[3])*1000+number(figures[4])/10];
    if(index===0) assert.deepEqual(withExtra,[3619,3700]);
    else {
      const addition=p.match(/2012年に([\d,]+)万円の追加投資[\s\S]*2013年から年間で([\d,]+)万円/);
      assert(addition);
      assert.deepEqual(withExtra,[first,second].map(values=>npvReference(
        values.map((value,i)=>i===0?value+number(addition[1])/100:value),rate,4,number(addition[2])/100).total));
    }
    const benefits=withExtra.map((value,i)=>value>[lump.total,split.total][i]);
    const interpretations:Record<string,boolean[]>={'どちらの場合も受け入れるべきではない':[false,false],
      'どちらの場合も受け入れるべきである':[true,true],'一括投資の場合だけ':[true,false],'分割投資の場合だけ':[false,true]};
    allChoices(q,4,choice=>Object.entries(interpretations).some(([text,values])=>
      choice.includes(text)&&values.every((value,i)=>value===benefits[i])));
    const longer=npvReference(first,rate,5), longerSplit=npvReference(second,rate,5);
    const depreciation=table(q,/^表3/);
    assert.equal(depreciation.captionPresentation,'accessible');
    assert.deepEqual(depreciation.sourceLabels,[{text:'単位　百万円',position:'top-end'}]);
    assert.deepEqual(depreciation.rows[0].slice(1).map(number),longer.byYear.map(row=>row.dep));
    assert(longerSplit.total<split.total);
    const deltas=[longer.byYear[1].afterTax-lump.byYear[1].afterTax,
      longer.byYear[5].afterTax-lump.byYear[5].afterTax,longer.total-lump.total];
    assert(longer.byYear.slice(1,5).every((row,i)=>row.afterTax<lump.byYear[i+1].afterTax));
    const directions:Record<string,number>={'表1と変わらない':0,'表1に比べて上がる':1,'表1に比べて下がる':-1};
    deltas.forEach((value,i)=>allChoices(q,i+5,choice=>directions[choice]===Math.sign(value)));
    assert.ok(q.explanation.includes(lump.total/10+'百万円')&&q.explanation.includes(split.total/10+'百万円'));
  }
});

function pureBinary(value:number){return value.toString(2).padStart(8,'0');}
const clearLow=(value:string)=>{
  const i=value.lastIndexOf('1');
  return i<0?value:value.slice(0,i)+'0'+value.slice(i+1);
};
test('問8の2条件・全修正案を8ビット全域で真理値照合',()=>{
  const q=body(8,0);
  const candidatesA=candidates(q,0).map(text);
  const candidate=(expression:string,d:number,m:number)=>{
    const parsed=expression.match(/^\(Data (&|\|) Mask\) = ("00000000"B|Data|Mask)$/);
    assert(parsed);
    const lhs=parsed[1]==='&'?d&m:d|m, rhs=parsed[2]==='Data'?d:parsed[2]==='Mask'?m:0;
    return lhs===rhs;
  };
  const mismatch=Array.from({length:5},()=>Array<number>(5).fill(0));
  const fixes=[0,0,0];
  for(let d=0;d<256;d++) for(let m=0;m<256;m++){
    const wanted=[...pureBinary(d)].filter((_,i)=>pureBinary(m)[i]==='1');
    const target=wanted.length===0||wanted.every(value=>value==='0')?0:wanted.every(value=>value==='1')?2:1;
    const a=candidatesA.map(condition=>candidate(condition,d,m));
    if(m>0) for(let i=0;i<5;i++) for(let j=0;j<5;j++) if((a[i]?2:a[j]?0:1)!==target) mismatch[i][j]++;
    const solutions=[a[2]?2:a[0]?0:1,a[0]?0:a[2]?2:1,a[2]?2:a[0]?0:1];
    solutions.forEach((result,i)=>{if(result!==target) fixes[i]++;});
  }
  assert.deepEqual(mismatch.flatMap((row,i)=>row.flatMap((count,j)=>count===0?[[i,j]]:[])),[[2,0]]);
  assert.deepEqual(fixes,[256,0,256]);
  for(const q of cases(8)) {
    assert.equal(correct(q,0),2); assert.equal(correct(q,1),0);
    allChoices(q,2,choice=>{
      const indices=[...'①②③'].flatMap((mark,i)=>choice.includes(mark)?[i]:[]);
      return indices.length===1&&fixes[indices[0]]===0;
    });
    assert.match(diagram(q,'fix-options').alt,/修正案②\n▲ ［b］[\s\S]*修正案③/);
    assert.match(paragraphs(q),/1個以上[\s\S]*両オペランドを8ビット符号なし整数[\s\S]*1のビットが0個の場合は返却値0/);
  }
});

test('問8の処理量・最下位ビット除去を表示した行と256入力で独立検算',()=>{
  for(const [index,q] of cases(8).entries()) {
    const second=diagram(q,'program-two').alt, third=diagram(q,'program-three').alt;
    assert.match(second,/■ Loop: 0, Loop ＜ 8, 1\n処理量\d+　│ ▲ Workの最下位ビットが1[\s\S]*│ ▼/);
    assert.match(third,/│ ・Work ← Work & \(Work − 1\)　← α/);
    const parse=(program:string)=>[...program.matchAll(/処理量(\d+)/g)].map(match=>Number(match[1]));
    const [p2load,p2start,p2loop,p2if,p2inc,p2shift,p2end]=parse(second);
    const [p3load,p3start,p3loop,p3inc,p3clear,p3end]=parse(third);
    const v2:number[]=[], v3:number[]=[];
    for(let input=0;input<256;input++){
      const digits=pureBinary(input), population=[...digits].filter(x=>x==='1').length;
      let cost=p2load+p2start+p2end, tmp=digits, added=0;
      for(let loop=0;loop<8;loop++){
        cost+=p2loop+p2if+p2shift;
        if(tmp.endsWith('1')){cost+=p2inc;added++;}
        tmp='0'+tmp.slice(0,-1);
      }
      assert.equal(added,population); v2.push(cost+p2loop);
      cost=p3load+p3start+p3end; tmp=digits; added=0;
      do {
        cost+=p3loop;
        if(!tmp.includes('1')) break;
        tmp=clearLow(tmp); added++; cost+=p3inc+p3clear;
      } while(true);
      assert.equal(added,population); v3.push(cost);
    }
    const costTable=table(q,/^表1 プログラム2/);
    assert.deepEqual(costTable.rows,[
      ['プログラム2',String(Math.min(...v2)),'［d］'],['プログラム3','［e］',String(Math.max(...v3))],
    ]);
    one(q,3,String(Math.max(...v2))); one(q,4,String(Math.min(...v3)));
    const sample=paragraphs(q).match(/引数Dataの内容が"([01]{8})"B/)?.[1];
    assert(sample);
    const value=clearLow(clearLow(sample));
    allChoices(q,5,choice=>/^[01]{8}$/.test(choice)&&choice===value);
    assert.ok(q.explanation.includes(sample+'→'+clearLow(sample)+'→'+value));
    if(index===0) assert.deepEqual([Math.min(...v2),Math.max(...v2),Math.min(...v3),Math.max(...v3),value],[72,80,6,54,'01100000']);
    for(const [,data,mask,positions,result] of diagram(q,'examples').alt.matchAll(/Data ([01]{8})，Mask ([01]{8})。対応線の位置：([\d，]+)。返却値 (\d)/g)){
      const selected=[...mask].flatMap((bit,i)=>bit==='1'?[7-i]:[]);
      assert.deepEqual(selected,positions.split('，').map(Number));
      const flags=selected.map(bit=>data[7-bit]);
      assert.equal(Number(result),flags.every(flag=>flag==='1')?2:flags.every(flag=>flag==='0')?0:1);
    }
  }
});

test('構造図・式・結合セル・疑似言語と選択肢図の全描画入力を照合',()=>{
  assert.deepEqual(figures.map(row=>row.profile),renderers.map(row=>row.profile));
  for(const [i,figure] of figures.entries()){
    const inputs=figure.domain.reduce<number[][]>((sets,[from,to])=>sets.flatMap(prefix=>
      Array.from({length:to-from+1},(_,index)=>[...prefix,from+index])),[[]]);
    for(const values of inputs){
      figure.validate(values);
      const markup=renderToStaticMarkup(createElement(renderers[i].component,{values,caption:'表示確認'}));
      assert.match(markup,/表示確認/);
      assert.match(markup,/<(?:table|svg|span)\b/);
      assert.match(markup,/tabindex="0"/i);
      assert(figure.alt(values).length>=1);
      if(figure.profile.endsWith('5-match-table')) {
        assert.match(markup,/colSpan="2".*data-source-blank="a"/s);
        assert.match(markup,/colSpan="2".*data-source-blank="b"/s);
      }
      if(figure.profile.endsWith('7-lump-table')) assert.match(markup,/rowSpan="3".*data-source-blank="b"/s);
      if(figure.profile.endsWith('7-split-table')) assert.match(markup,/rowSpan="4".*data-source-blank="c"/s);
      if(figure.profile.endsWith('8-program-three')) assert.match(markup,/αの行/);
      if(figure.profile.endsWith('8-fix-options')) assert.match(markup,/修正案①（変更なし）.*修正案②.*修正案③/s);
    }
  }
  for(const q of cases(6)) {
    const equations = [
      '計画進捗率＝（計画工数の累積）÷（計画工数の総合計）×100',
      '実績進捗率＝（実績工数の累積）÷（実績工数の累積＋残り工数）×100',
      '計画実績工数比＝（実績工数の累積＋残り工数）÷（計画工数の総合計）',
    ];
    for(const [i,equation] of equations.entries()) {
      assert.deepEqual(q.prompt[[8,20,24][i]],{type:'paragraph',text:equation});
      assert.equal(q.prompt.filter(block=>block.type==='paragraph'&&block.text===equation).length,1);
    }
  }
  for(const q of cases(7)) {
    const options=candidates(q,0);
    assert.equal(options.length,6);
    for(const block of options) {
      assert(block.type==='formula'&&block.format==='latex');
      assert.match(block.text,/^[ -~]+$/);
    }
  }
});
