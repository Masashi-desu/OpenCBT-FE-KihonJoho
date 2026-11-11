import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2009SpringAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2009-spring-am-27-53';
import { legacy2009SpringAm2753Figures as figures } from '../../../src/core/generators/legacy-2009-spring-am-27-53-figures';
import source from '../../../src/core/generators/legacy-2009-spring-am-27-53-source.json';
import { legacy2009SpringAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2009SpringAm2753Figures';
import { knowledgeReview } from '../../fixtures/legacy-2009-spring-am-27-53-review';

const officialAnswers='エウエウイウエアエエエアウウイエエイイウエウエウエエイ';
const official:Record<string,{prompt:string; choices:string[]; detail?:string}>=source;
type Diagram=Extract<Block,{type:'diagram'}>;
type Table=Extract<Block,{type:'table'}>;
function choiceText(blocks:Block[]) {
  return blocks.map(block=>{
    if(block.type==='diagram') return block.alt;
    if(block.type==='table') return block.rows.map(row=>row.join('｜')).join('\n');
    assert.ok(block.type==='paragraph'||block.type==='code');
    return block.text;
  }).join('\n');
}
const stem=(body:GeneratedBody)=>choiceText(body.prompt.slice(0,1));
const choices=(body:GeneratedBody)=>body.choices.map(choiceText);
function unique(body:GeneratedBody,truth:readonly boolean[]) {
  assert.equal(truth.length,4);
  assert.deepEqual(truth.flatMap((yes,index)=>yes?[index]:[]),[body.correctIndex]);
}
function tableAt(blocks:Block[]):Table {
  const value=blocks.find(block=>block.type==='table');
  assert.ok(value);
  return value;
}
function graphic(blocks:Block[]) {
  const block=blocks.find(block=>block.type==='diagram') as Diagram|undefined;
  assert.ok(block && block.scene.kind==='source_figure');
  const {profile,values}=block.scene;
  const definition=figures.find(figure=>figure.profile===profile);
  const renderer=renderers.find(figure=>figure.profile===profile);
  assert.ok(definition && renderer);
  definition.validate(values);
  assert.equal(definition.alt(values),block.alt);
  const markup=renderToStaticMarkup(createElement(renderer.component,{values,caption:block.caption}));
  assert.match(markup,/tabindex="0"/i);
  assert.match(markup,/aria-description=/);
  return {alt:block.alt,markup};
}

function checkKnowledge(body:GeneratedBody,number:number,index:number) {
  const review=knowledgeReview[number];
  const [cue,kind]=review.stems[index];
  assert.ok(stem(body).includes(cue),'本文の査読語句 '+cue);
  type Facts=readonly (readonly [string,string])[];
  const options=typeof review.options[0][0]==='string'?review.options as Facts:(review.options as readonly Facts[])[index];
  unique(body,choices(body).map((choice,i)=>{
    const [evidence,meaning]=options[i];
    assert.ok(choice.includes(evidence),'選択肢の査読語句 '+evidence);
    return meaning===kind;
  }));
}

function checkOrders(body:GeneratedBody,index:number) {
  const {columns,rows}=tableAt(body.prompt);
  assert.deepEqual(columns,['ファイル','項目','備考']);
  assert.deepEqual(rows.map(row=>row[0]),['顧客マスタファイル','商品マスタファイル','担当者マスタファイル','当月受注ファイル']);
  assert.equal(rows[3][1],'顧客コード，商品コード，受注額');
  assert.match(stem(body),new RegExp('直前の'+[3,2,4,2][index]+'か月分'));
  const snapshot=index===1;
  const productByStaff=index>=2;
  assert.equal(rows[0][1].includes('担当者コード（各月時点）'),snapshot);
  assert.equal(rows[1][2].includes('商品と担当者の組合せ'),index===2);
  assert.equal(rows[2][2].includes('担当者と商品の組合せ'),index===3);
  if(productByStaff) assert.match(rows[0][2],/当月分だけ/);
  // Two customers, two products and two staff. Observations are only the
  // monthly aggregates kept by the four files. Histories with the same
  // observations must give the same requested grouping to be recoverable.
  const worlds=new Map<string,Set<string>[]>();
  const ownership=index===0?[[0,1]]:[[0,0],[0,1],[1,0],[1,1]];
  for(const owners of ownership) for(let history=0;history<16;history++) {
    const byCustomer=[0,0],byProduct=[0,0], customerProduct=[0,0,0,0],productCustomer=[0,0,0,0];
    const byProductStaff=[0,0,0,0],byStaffCustomer=[0,0,0,0];
    for(let customer=0;customer<2;customer++) for(let product=0;product<2;product++) {
      const amount=(history>>(2*customer+product))&1;
      const staff=owners[customer];
      byCustomer[customer]+=amount;
      byProduct[product]+=amount;
      customerProduct[2*customer+product]+=amount;
      productCustomer[2*product+customer]+=amount;
      byProductStaff[2*product+staff]+=amount;
      byStaffCustomer[2*staff+customer]+=amount;
    }
    const recorded=JSON.stringify([byCustomer,byProduct,snapshot?owners:[],productByStaff?byProductStaff:[]]);
    const inferred=worlds.get(recorded)??Array.from({length:4},()=>new Set<string>());
    [customerProduct,productCustomer,byProductStaff,byStaffCustomer].forEach((row,i)=>inferred[i].add(row.join(',')));
    worlds.set(recorded,inferred);
  }
  assert.deepEqual(choices(body),['顧客別の商品別受注実績','商品別の顧客別受注実績','商品別の担当者別受注実績','担当者別の顧客別受注実績']);
  unique(body,[0,1,2,3].map(choice=>[...worlds.values()].every(outputs=>outputs[choice].size===1)));
}

const schemas=[
  [['従業員番号','従業員氏名','技能コード','技能名','技能経験年数'],[0,2]],
  [['機器番号','機器名','利用部署コード','利用部署名','導入年度'],[0]],
  [['講師番号','講師氏名','講座コード','講座名','標準時間'],[2]],
  [['仕入先コード','仕入先名','商品コード','商品名','契約単価'],[0,2]],
] as const;
function checkNormal(body:GeneratedBody,index:number) {
  const [columns,extra]=schemas[index];
  const names:string[]=[...columns];
  const prompt=choiceText(body.prompt);
  assert.match(prompt,/下線部は主キーを表す/);
  assert.match(prompt,/\{ \} は繰返しを表す/);
  assert.ok(names.every(name=>prompt.includes(name)));
  const dependencies:readonly [readonly number[],number][]=[[[0],1],[[2],3],[extra,4]];
  function closure(set:readonly number[]) {
    const seen=new Set(set);
    for(let pass=0;pass<names.length;pass++) {
      dependencies.forEach(([keys,field])=>{if(keys.every(key=>seen.has(key))) seen.add(field);});
    }
    return seen;
  }
  const check=body.choices.map(blocks=>{
    const {alt,markup}=graphic(blocks);
    const rows=alt.split('｜').map(row=>row.split('，').map(item=>{
      const primary=item.endsWith('（主キー）');
      const name=primary?item.slice(0,-5):item;
      const id=names.indexOf(name);
      assert.ok(id>=0,name);
      return {id,primary};
    }));
    assert.equal((markup.match(/<u /g)??[]).length,rows.flat().filter(cell=>cell.primary).length);
    const all=rows.flat().map(cell=>cell.id);
    if(names.some((_,id)=>!all.includes(id))) return false;
    if(!rows.some(row=>row.some(cell=>cell.id===0)&&row.some(cell=>cell.id===2))) return false;
    return rows.every(row=>{
      const fields=row.map(cell=>cell.id), declared=row.filter(cell=>cell.primary).map(cell=>cell.id);
      const isKey=(attributes:number[])=>fields.every(id=>closure(attributes).has(id));
      const possible=Array.from({length:2**fields.length},(_,mask)=>fields.filter((_,i)=>(mask&(1<<i))!==0));
      const keys=possible.filter(attributes=>isKey(attributes)&&attributes.every(id=>!isKey(attributes.filter(value=>value!==id))));
      if(!keys.some(key=>key.length===declared.length&&key.every(id=>declared.includes(id)))) return false;
      // Examine projected nontrivial dependencies in every relation. A
      // determinant must be a superkey or the dependent attribute prime.
      const prime=new Set(keys.flat());
      return possible.every(attributes=>isKey(attributes)||fields.filter(id=>!attributes.includes(id)&&closure(attributes).has(id))
        .every(id=>prime.has(id)));
    });
  });
  unique(body,check);
}

const viewCases=[
  ['製品','売上','売上報告','製品番号','製品名','単価','納品数','売上年月日','売上金額'],
  ['部材','入庫','入庫報告','部材番号','部材名','単価','入庫数','入庫年月日','入庫金額'],
  ['備品','貸出','貸出報告','備品番号','備品名','日額','貸出日数','貸出年月日','貸出金額'],
  ['商品','発注','発注報告','商品番号','商品名','単価','発注数','発注年月日','発注金額'],
] as const;
function checkView(body:GeneratedBody,index:number) {
  const [master,records,view,id,name,price,amount,date,total]=viewCases[index];
  const statement=body.prompt.find(block=>block.type==='code');
  assert.ok(statement);
  assert.equal(statement.language,'sql');
  if(index===0) assert.equal(statement.text,official[33].detail?.split('\n表名・列名')[0]);
  assert.deepEqual(tableAt(body.prompt).rows,[[master,[id,name,price].join('，')],[records,[id,amount,date].join('，')]]);
  assert.deepEqual(choices(body),['GRANT','INSERT','SCHEMA','SELECT']);
  const db=new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE '+master+' ('+id+' INTEGER PRIMARY KEY,'+name+' TEXT,'+price+' INTEGER);'+
      'CREATE TABLE '+records+' ('+id+' INTEGER,'+amount+' INTEGER,'+date+' TEXT);'+
      "INSERT INTO "+master+" VALUES (1,'A',20),(2,'B',30);"+
      "INSERT INTO "+records+" VALUES (1,3,'1'),(1,2,'2'),(2,4,'3'),(3,5,'4');");
    unique(body,choices(body).map(candidate=>{
      const sql=statement.text.replace('［a］',candidate);
      try { db.exec(sql); } catch(error) {
        assert.match(String(error),/syntax error/);
        return false;
      }
      const rows=db.prepare('SELECT * FROM '+view+' ORDER BY '+date).all();
      assert.deepEqual(rows.map(row=>Object.keys(row)),Array(3).fill([id,name,amount,date,total]));
      assert.deepEqual(rows.map(row=>Object.values(row)),[[1,'A',3,'1',60],[1,'A',2,'2',40],[2,'B',4,'3',120]]);
      return true;
    }));
  } finally { db.close(); }
}

function checkRate(body:GeneratedBody) {
  const input=/(\d+(?:\.\d+)?) Mビット／秒.*?(\d+) Mバイト.*回線利用率を(\d+)％/.exec(stem(body));
  assert.ok(input);
  const [,speed,size,use]=input;
  const bits=BigInt(size)*8_000_000n;
  const capacity=BigInt(Math.round(Number(speed)*1_000_000))*BigInt(use)/100n;
  const answer=bits/capacity;
  assert.equal(bits%capacity,0n);
  const actual=choices(body).map(BigInt);
  const noUtilization=bits/BigInt(Math.round(Number(speed)*1_000_000));
  assert.deepEqual(actual,[answer/8n,noUtilization*BigInt(use)/100n,noUtilization,answer]);
  unique(body,actual.map(duration=>capacity*duration===bits));
  assert.ok(body.explanation.endsWith(answer+'秒となる。'));
}
function checkIp(body:GeneratedBody,index:number) {
  const ip=/IPアドレス(\d+\.\d+\.\d+\.\d+)/.exec(stem(body))?.[1];
  assert.ok(ip);
  assert.equal(ip,['10.128.192.10','172.20.44.7','192.168.12.11','224.1.0.12'][index]);
  const prefix=Number(ip.split('.')[0]).toString(2).padStart(8,'0');
  const bits:Record<string,string>={A:'0',B:'10',C:'110',D:'1110'};
  unique(body,choices(body).map(option=>prefix.startsWith(bits[option.at(-1)!])));
}
function checkMail(body:GeneratedBody,index:number) {
  const {alt,markup}=graphic(body.prompt);
  assert.match(alt,/①メール送信は.*→左のサーバ/);
  assert.match(alt,/②メール受信は左のサーバ→/);
  assert.match(alt,/③メール転送は両サーバ間の双方向/);
  assert.match(markup,/marker-start=/);
  if(index===1||index===2) assert.match(stem(body),/サーバ/);
  const receiver=['POP3','IMAP4','IMAP4','POP3'][index];
  const rows=body.choices.map(blocks=>{
    const option=tableAt(blocks);
    assert.deepEqual(option.columns,['①','②','③']);
    return option.rows[0];
  });
  assert.deepEqual(rows,[[receiver,receiver,'SMTP'],[receiver,'SMTP',receiver],['SMTP',receiver,'SMTP'],['SMTP','SMTP','SMTP']]);
  const transport=new Set(['SMTP']);
  unique(body,rows.map(([send,receive,relay])=>transport.has(send)&&receive===receiver&&transport.has(relay)));
}
function checkPrivacy(body:GeneratedBody,index:number) {
  const [first,second,recipient]=[
    ['商店','顧客','商店'],['病院','検査機関','検査機関'],['書店','取次会社','書店'],['倉庫','店舗','店舗'],
  ][index];
  if(index===0) assert.match(stem(body),/商店が，顧客から.*受信/);
  else {
    const sender=first===recipient?second:first;
    assert.ok(stem(body).includes(sender+'から'+recipient+'へ'));
  }
  const cells=body.choices.map(blocks=>{
    const {columns,rows}=tableAt(blocks);
    assert.deepEqual(columns,[first+'が利用する',second+'が利用する']);
    return rows[0];
  });
  assert.deepEqual(cells,[['公開鍵','公開鍵'],['公開鍵','秘密鍵'],['秘密鍵','公開鍵'],['秘密鍵','秘密鍵']]);
  const pair=(actor:string)=>actor===recipient?'秘密鍵':'公開鍵';
  unique(body,cells.map(([a,b])=>a===pair(first)&&b===pair(second)));
}
const graphCases=[
  [3,1,2,4,6,1,1,3,2,5,4],[4,2,2,5,4,1,1,3,3,5,3],[2,2,3,3,3,2,1,3,3,6,2],[3,2,2,6,4,1,2,2,1,5,3],
];
function checkArrow(body:GeneratedBody,index:number) {
  assert.match(stem(body),/矢線の数字は作業所要日数を示し，Aの作業開始時を0日/);
  const {alt,markup}=graphic(body.prompt);
  const arcs=Array.from(alt.matchAll(/([A-I])→([A-I]) (\d+)日/g),match=>({from:match[1],to:match[2],days:Number(match[3])}));
  assert.deepEqual(arcs.map(({from,to})=>from+to),['AB','AC','AF','BE','CD','DE','DH','FG','GH','EI','HI']);
  assert.deepEqual(arcs.map(({days})=>days),graphCases[index]);
  for(const {from,to,days} of arcs)
    assert.match(markup,new RegExp('data-edge="'+from+to+'"[^]*?<text[^>]*>'+days+'</text>'));
  assert.match(markup,/作業所要日数/);
  function paths(start:string,end:string):{path:string;days:number}[] {
    if(start===end) return [{path:end,days:0}];
    return arcs.filter(edge=>edge.from===start).flatMap(edge=>paths(edge.to,end).map(({path,days})=>
      ({path:start+'−'+path,days:edge.days+days})));
  }
  const h=paths('A','H'), end=paths('A','I').sort((a,b)=>b.days-a.days);
  assert.ok(end[0].days>end[1].days);
  const dates=h.map(path=>path.days).sort((a,b)=>a-b);
  assert.equal(new Set(dates).size,2);
  const cells=body.choices.map(blocks=>{
    const {columns,rows}=tableAt(blocks);
    assert.deepEqual(columns,['クリティカルパス','Hの最早開始日']);
    return rows[0];
  });
  assert.deepEqual(cells,['A−B−E−I','A−C−D−E−I'].flatMap(path=>dates.map(day=>[path,String(day)])));
  unique(body,cells.map(([path,day])=>path===end[0].path&&Number(day)===Math.max(...dates)));
  assert.ok(body.explanation.includes(end[0].path));
}
const workInputs=[
  [1,[2,5,1,4,2,3],25],[8,[3,3,2,4,2,2],50],[1,[3,6,2,6,2,2],50],[1,[4,7,2,6,1,2],50],
] as const;
function checkWork(body:GeneratedBody,index:number) {
  const [begin,days,progress]=workInputs[index];
  const {columns,rows}=tableAt(body.prompt);
  assert.deepEqual(columns,['作業','計画工数','完了予定日']);
  assert.deepEqual(rows.map(row=>row[0]),['仕様書作成','プログラム設計','テスト計画書作成','コーディング','コンパイル','テスト']);
  assert.deepEqual(rows.map(row=>Number(row[1].slice(0,-1))),days);
  let businessDays=0;
  rows.forEach((row,i)=>{
    businessDays+=days[i];
    const count=businessDays-1, day=begin+count+2*Math.floor(count/5);
    assert.equal(row[2],'6月'+day+'日（'+'月火水木金'[count%5]+'）');
    if(i===3) assert.ok(stem(body).includes('6月'+day+'日の終了時点でコーディング作業の'+progress+'％'));
  });
  assert.match(stem(body),/土日を除く週5日間/);
  const total=days.reduce<number>((sum,days)=>sum+days,0), [,, ,coding,compile,testing]=days;
  const uncompleted=(100-progress)*coding+100*(compile+testing);
  const rounded=Math.floor((2*uncompleted+total)/(2*total));
  const complete=100*total-uncompleted;
  const options=choices(body).map(Number);
  assert.deepEqual(options,[
    index===0?30:Math.floor((200*(compile+testing)+total)/(2*total)),
    rounded,Math.floor(complete/total),Math.floor((2*complete+total)/(2*total)),
  ]);
  unique(body,options.map(value=>value===rounded));
  assert.ok(body.explanation.endsWith('約'+rounded+'％となる。'));
}

const check:Record<number,(body:GeneratedBody,index:number)=>void>={
  29:checkOrders,32:checkNormal,33:checkView,36:checkRate,38:checkIp,39:checkMail,40:checkPrivacy,51:checkArrow,53:checkWork,
};

test('2009春午前 問27～53の番号・正答・図登録を照合する',()=>{
  assert.deepEqual(definitions.map(definition=>definition.source),Array.from({length:27},(_,i)=>'2009h21h-fe-am-'+(i+27)));
  assert.equal(definitions.map(definition=>definition.sourceAnswer).join(''),officialAnswers);
  assert.deepEqual(figures.map(entry=>entry.profile),renderers.map(entry=>entry.profile));
  for(const entry of figures) {
    assert.deepEqual(entry.domain,[[0,3]]);
    for(const bad of [[],[-1],[4],[0.5],[1,1]]) assert.throws(()=>entry.validate(bad));
  }
});

for(const definition of definitions) {
  const number=Number(definition.source.split('-').at(-1));
  test('2009春午前 問'+number+'の原形式と全4条件・選択肢を検証',()=>{
    assert.deepEqual(definition.reference,[0]);
    assert.deepEqual(definition.fields.map(field=>[field.minimum,field.maximum]),[[0,3]]);
    for(const bad of [[],[-1],[4],[.5],[NaN],[0,0]]) assert.throws(()=>definition.build(bad));
    const baseline=definition.build([0]);
    assert.equal(stem(baseline),official[number].prompt);
    assert.deepEqual(choices(baseline),official[number].choices);
    assert.equal('アイウエ'[baseline.correctIndex!],officialAnswers[number-27]);
    const conditions=new Set<string>();
    for(let index=0;index<4;index++) {
      const body=definition.build([index]);
      assert.deepEqual(body,definition.build([index]));
      assert.equal(body.choices.length,4);
      assert.equal(new Set(choices(body)).size,4);
      assert.ok(body.explanation.length>20);
      conditions.add(JSON.stringify(body.prompt));
      if(check[number]) check[number](body,index);
      else checkKnowledge(body,number,index);
    }
    assert.equal(conditions.size,4);
  });
}
