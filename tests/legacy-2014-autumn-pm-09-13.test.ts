import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../src/core/generators/definition';
import { blockText } from '../src/core/generators/legacy-2016-autumn-pm-09-13-support';
import {
  legacy2014AutumnPm9Definition as q9, legacy2014AutumnPm10Definition as q10,
  legacy2014AutumnPm11Definition as q11, legacy2014AutumnPm12Definition as q12,
  legacy2014AutumnPm13Definition as q13, autumn2014Pm0913OriginalPageAlt,
} from '../src/core/generators/legacy-2014-autumn-pm-09-13';
import { autumn2014Pm10Model, autumn2014Pm13Model } from '../src/core/generators/legacy-2014-autumn-pm-09-13-models';
import { legacy2014AutumnPm0913Figures as figures } from '../src/core/generators/legacy-2014-autumn-pm-09-13-figures';
import { legacy2014AutumnPm0913FigureRenderers as renderers } from '../src/ui/Legacy2014AutumnPm0913Figures';

const specs = [q9,q10,q11,q12,q13];
const keys = ['イウイウイカ','オイエイアエ','ウオイキイアイ','アエカウイオ','アエアカエイイ'];
const pages = [[47,52],[53,59],[60,65],[66,69],[71,77]];
const sum = (values:readonly number[])=>values.reduce((a,b)=>a+b,0);
const parts = (body:GeneratedBody)=>body.answerParts!;
const answers = (body:GeneratedBody)=>body.partAnswers!;
const prompt = (body:GeneratedBody)=>body.prompt.map(blockText).join('\n');
const choiceIndex = (id:string)=>Number(id.slice('choice-value-'.length))-1;
const choice = (body:GeneratedBody,id:string)=>blockText(body.choices[choiceIndex(id)][0]);
function bank(body:GeneratedBody,name:string){
  const part = parts(body).find(value=>value.id==='part-'+name)!;
  const answer = answers(body).find(value=>value.kind==='choice'&&value.partId===part.id)!;
  assert.equal(answer.kind,'choice');
  return { choices:part.choiceIds.map(id=>choice(body,id)), answer:choice(body,answer.choiceId),
    key:'アイウエオカキク'[part.choiceIds.indexOf(answer.choiceId)] };
}
function accepts(body:GeneratedBody,field:string,oracle:(candidate:string,index:number)=>boolean) {
  const {choices,answer}=bank(body,field);
  assert.deepEqual(choices.filter(oracle),[answer],field+': '+choices.join('｜'));
}
function panel(body:GeneratedBody,name:string) {
  const block=body.prompt.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile.endsWith('-'+name));
  assert(block?.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene;
  const figure=figures.find(f=>f.profile===profile)!;
  assert.equal(block.alt,figure.alt(values));
  return figure.panel(values);
}

test('2014秋 午後問9〜13の公式キー、原ページ、全40入力と共有解答群を保つ',()=>{
  for(const [i,definition] of specs.entries()){
    const [start,end]=pages[i];
    assert.deepEqual(Object.keys(autumn2014Pm0913OriginalPageAlt(i+9)).map(Number),Array.from({length:end-start+1},(_,j)=>start+j));
    const original=definition.build([0]);
    const fingerprint=new Set<string>();
    const semanticAnswers=new Set<string>();
    assert.equal(parts(original).map(part=>bank(original,part.id.slice(5)).key).join(''),keys[i]);
    assert.equal(definition.sourceAnswer,keys[i]);
    assert.deepEqual(definition.reference,[0]);
    for(let index=0;index<8;index++){
      const item=definition.build([index]);
      assert.deepEqual(parts(item).map(({id,choiceIds})=>[id,choiceIds]),parts(original).map(({id,choiceIds})=>[id,choiceIds]));
      for(const part of parts(item)){
        const field=i===4&&part.id==='part-g'?'g[12]':part.id.slice(5);
        assert.match(prompt(item),new RegExp('[\\[［]'+field+'[\\]］]'),part.id);
        assert.equal(new Set(part.choiceIds.map(id=>choice(item,id))).size,part.choiceIds.length);
      }
      fingerprint.add(prompt(item));
      semanticAnswers.add(parts(item).map(part=>bank(item,part.id.slice(5)).answer).join('｜'));
    }
    assert.equal(fingerprint.size,8);
    assert.ok(semanticAnswers.size>=2);
    for(const bad of [[],[-1],[8],[0.25],Array(1),[0,1]])assert.throws(()=>definition.build(bad));
  }
  assert.equal(specs.reduce((count,definition)=>count+parts(definition.build([0])).length,0),32);
  assert.deepEqual(q11.build([0]).contexts?.map(x=>x.title),['問11 Java APIの参考資料（編集資料）']);
  assert(!q11.fixedReferenceAssetIds);
  assert(q12.fixedReferenceAssetIds?.[2]?.endsWith('p081-casl-excerpt'));
  assert(q12.build([0]).contexts?.some(x=>x.title==='問12 数字と空白の文字コード（編集資料）'));
  assert.equal(q13.fixedReferenceAssetIds?.length,8);
});

type Row = { id:string; name:string; hex:number; date:string };
function cRows(item:GeneratedBody) {
  const [newFile,oldFile]=panel(item,'input').tables;
  const rows=(file:typeof newFile):Row[]=>file.rows.map(([id,name,attr,date])=>
    ({id:id.text,name:name.text,hex:parseInt(attr.text,16),date:date.text}));
  return {fresh:rows(newFile),old:rows(oldFile)};
}
const normalizeRows = (body:GeneratedBody, name:string)=>panel(body,name).tables[0].rows.map(row=>row.map(cell=>cell.text));

test('2014秋 午後問9は順ファイル例と全選択肢を集合差・真理値表で照合する',()=>{
  const masks=[8,4];
  for(let index=0;index<8;index++){
    const item=q9.build([index]),{fresh,old}=cRows(item);
    const newMap=new Map(fresh.map(row=>[row.id,row])),oldMap=new Map(old.map(row=>[row.id,row]));
    const ids=[...new Set([...newMap.keys(),...oldMap.keys()])].sort();
    const privilege=(row:Row|undefined,mask:number)=>Math.floor((row?.hex??0)/mask)%2;
    const disabled=Number(/属性のビットrが([01])である/.exec(prompt(item))![1]);
    const differences=ids.flatMap(id=>{
      const next=newMap.get(id),previous=oldMap.get(id);
      const events=next&&previous?[]:[next?'利用者 ID 追加':'利用者 ID 削除'];
      for(const [position,mask] of masks.entries()){
        const newValue=privilege(next,mask),oldValue=privilege(previous,mask);
        if(newValue!==oldValue)events.push('特権 '+'SO'[position]+(newValue?' 付加':' 解除'));
      }
      return events.length?[[id,(next??previous)!.name,events.join('　')]]:[];
    });
    assert.deepEqual(normalizeRows(item,'differences'),differences);
    const usage=fresh.flatMap(row=>{
      const flags=[...(row.hex%2===disabled?['現在使用不可']:[]),...(row.date===oldMap.get(row.id)?.date?['期間中未使用']:[])];
      return flags.length?[[row.id,row.name,flags.join('　')]]:[];
    });
    assert.deepEqual(normalizeRows(item,'usage'),usage);
    const booleans=[false,true];
    accepts(item,'a',(_,candidate)=>booleans.every(n=>booleans.every(o=>
      [n&&o,n||o,n!==o,n===o][candidate]===!( !n&&!o ))));
    accepts(item,'b',(_,candidate)=>Array.from({length:16},(_,n)=>n).every(n=>
      Array.from({length:16},(_,o)=>o).every(o=>{
        const valid=masks.some(mask=>Math.floor(n/mask)%2!==Math.floor(o/mask)%2);
        const mask=12;
        return [Boolean(n&o&mask),Boolean((n|o)&mask),(n&mask)!==(o&mask),(n|mask)!==(o|mask)][candidate]===valid;
      })));
    accepts(item,'c',candidate=>candidate.includes('ReadNewRecord();')&&candidate.includes('ReadOldRecord();'));
    accepts(item,'d',(_,candidate)=>[-1,1].every(relation=>[0,4,8,12].every(n=>[0,4,8,12].every(o=>
      [n!==0,n>o,relation<0,relation>0][candidate]===(relation===-1)))));
    const matches=(i:number,isSame:boolean,dateSame:boolean,r:number,oldR:number)=>
      [r!==oldR,r===disabled,dateSame,isSame,isSame&&r===disabled,isSame&&dateSame][i];
    const assignments=[false,true].flatMap(isSame=>[false,true].flatMap(dateSame=>
      [0,1].flatMap(r=>[0,1].map(oldR=>({isSame,dateSame,r,oldR})))));
    accepts(item,'e',(_,candidate)=>assignments.every(({isSame,dateSame,r,oldR})=>
      matches(candidate,isSame,dateSame,r,oldR)===(r===disabled)));
    accepts(item,'f',(_,candidate)=>assignments.every(({isSame,dateSame,r,oldR})=>
      matches(candidate,isSame,dateSame,r,oldR)===(isSame&&dateSame)));
  }
});

type Ledger = {month:number; column:number; monthAmounts:number[]};
function cobolStatement(index:number, state:Ledger, nextMonth:number, amount:number) {
  const next={...state,monthAmounts:[...state.monthAmounts]};
  if(index===0)next.month++;
  if(index===1)next.monthAmounts[next.column-1]+=amount;
  if(index===2)next.month=1;
  if(index===3)next.monthAmounts[next.month-1]=amount;
  if(index===4)next.month=nextMonth;
  if(index===5)next.column=nextMonth;
  return next;
}
function chartStatement(index:number, accum:[number,number], months:number[], slot:number, column:number):[number,number] {
  const [start,rolling]=accum;
  const here=months[slot-1];
  const previous=months[slot-13];
  return [
    [start+here,rolling],[start,rolling+here],[start,rolling+start],
    [start,rolling+here-previous],[start,rolling+start+months[column-2]],[months[column-1],rolling],
  ][index] as [number,number];
}

test('2014秋 午後問10は月次とZチャートの独立集計・帳票位置から全候補を照合する',()=>{
  for(let index=0;index<8;index++){
    const item=q10.build([index]);
    const dates=[[5,6],[11,12],[12,1],[1,2],[3,4],[6,7]];
    accepts(item,'a',(_,candidate)=>dates.every(([month,nextMonth])=>{
      const next=cobolStatement(candidate,{month,column:4,monthAmounts:Array<number>(24).fill(0)},nextMonth,34);
      return next.month===nextMonth&&next.column===4&&sum(next.monthAmounts)===0;
    }));
    accepts(item,'b',(_,candidate)=>[1,8,13,24].every(column=>{
      const state={month:7,column,monthAmounts:Array<number>(24).fill(10)};
      const expected=state.monthAmounts.map((v,i)=>i===column-1?v+35:v);
      const next=cobolStatement(candidate,state,state.month,35);
      return next.month===state.month&&next.column===column&&JSON.stringify(next.monthAmounts)===JSON.stringify(expected);
    }));
    accepts(item,'c',candidate=>candidate==='PRINT-MK(IX-LINE, IX-COL)');
    const sales=Array.from({length:24},(_,i)=>[(i+1)*12345,400001,100000,100001,999999][i%5]);
    accepts(item,'d',(_,candidate)=>{
      const folded=sales.slice(0,12).reduce<[number,number]>((state,_,i)=>chartStatement(candidate,state,sales,i+1,1),[0,0]);
      return folded[0]===0&&folded[1]===sum(sales.slice(0,12));
    });
    const changedCode=panel(item,'changes').tables[0].rows[2][1].text;
    const secondMark=changedCode.indexOf('MOVE ALL "@"')<changedCode.indexOf('MOVE ALL "#"')?'@':'#';
    assert.match(prompt(item),secondMark==='@'?/“#”＞“@”＞“\*”/:/“@”＞“#”＞“\*”/);
    for(const [name,mark] of [['e',secondMark],['f',secondMark==='@'?'#':'@']] as const){
      accepts(item,name,(_,candidate)=>sales.slice(12).every((_,column)=>{
        const s=sum(sales.slice(12,column+12)),y=sum(sales.slice(column,column+12));
        const next=chartStatement(candidate,[s,y],sales,column+13,column+1);
        return mark==='@'?next[0]===sum(sales.slice(12,column+13))&&next[1]===y
          :next[0]===s&&next[1]===sum(sales.slice(column+1,column+13));
      }));
    }
    const ordinary=panel(item,'monthly-chart').tables[0];
    assert.equal(ordinary.rows.length,10);
    assert(ordinary.rows.every(row=>row.length===25));
    const z=panel(item,'z-chart').tables[0];
    assert.equal(z.rows.length,24);
    assert(z.rows.every(row=>row.length===13));
    if(index===0){
      const monthEnds=[50,50,40,50,50,60,60,70,70,80,80,90,70,40,40,30,40,40,40,60,60,70,70,70];
      const visible=(mark:string)=>Array.from({length:12},(_,i)=>Number(z.rows.find(row=>row[i+1].text===mark)?.[0].text??0));
      assert.deepEqual(visible('**'),[0,50,50,50,50,50,50,100,100,100,100,100]);
      assert.deepEqual(visible('@@'),[100,150,200,250,300,350,350,400,450,500,550,0]);
      assert.deepEqual(visible('##'),[700,700,700,700,650,650,650,650,650,650,600,600]);
      assert.deepEqual(monthEnds,monthEnds.map((_,i)=>Number(ordinary.rows.find(row=>row[i+1].text==='**')?.[0].text)));
    }else{
      const {monthlyAmounts}=autumn2014Pm10Model(index);
      assert(monthlyAmounts);
      assert.deepEqual(monthlyAmounts.map(value=>Math.ceil(value/100000)*10),
        monthlyAmounts.map((_,i)=>Number(ordinary.rows.find(row=>row[i+1].text==='**')?.[0].text)));
      const priority=secondMark==='@'?['**','@@','##']:['**','##','@@'];
      for(const [column,month] of monthlyAmounts.slice(12).entries()){
        const amounts:Record<string,number>={'**':month,'@@':sum(monthlyAmounts.slice(12,column+13)),
          '##':sum(monthlyAmounts.slice(column+1,column+13))};
        const expected=new Map(priority.map(mark=>[Math.ceil(amounts[mark]/500000)*50,mark]));
        assert.deepEqual(z.rows.flatMap(row=>row[column+1].text?[[Number(row[0].text),row[column+1].text]]:[]),
          [...expected].sort(([a],[b])=>b-a));
      }
    }
    const lastColumn=z.rows.map(row=>row.at(-1)!.text).filter(Boolean);
    assert(lastColumn.includes(secondMark==='@'?'##':'@@'));
    assert(!lastColumn.includes(secondMark==='@'?'@@':'##'));
  }
});

const operators:Record<string,(a:number,b:number)=>boolean>={
  '!=':(a,b)=>a!==b,'<':(a,b)=>a<b,'<=':(a,b)=>a<=b,'==':(a,b)=>a===b,'>':(a,b)=>a>b,'>=':(a,b)=>a>=b,
};
const equalSpan:Record<string,number>={'0':0,'DELTA':1,'DELTA * 2':2,'DELTA * 3':3,'DELTA / 2':.5,'DELTA / 3':1/3};
test('2014秋 午後問11は有向区間の両端、Classリテラルと防御的コピーを全択照合する',()=>{
  for(let index=0;index<8;index++){
    const item=q11.build([index]),body=prompt(item);
    const includeStart=/始点は含まれるが終点は含まれない/.test(body);
    const ranges=[[2,8],[8,2],[5,5]];
    for(const field of ['a','b'] as const)accepts(item,field,candidate=>ranges.every(([start,end])=>
      Array.from({length:12},(_,time)=>time).every(time=>{
        const direction=Math.sign(end-start);
        const fromStart=(time-start)*direction,toEnd=(end-time)*direction;
        const expected=direction!==0&&(includeStart?fromStart>=0&&toEnd>0:fromStart>0&&toEnd>=0);
        const forward=includeStart?time>=start&&time<end:time>start&&time<=end;
        const a=field==='a'?operators[candidate]:(x:number,y:number)=>includeStart?x<=y:x<y;
        const b=field==='b'?operators[candidate]:(x:number,y:number)=>includeStart?x>y:x>=y;
        return (forward||a(time,start)&&b(time,end))===expected;
      })));
    accepts(item,'c',candidate=>[-5,0,5].every(length=>operators[candidate](length,0)===(length<0)));
    accepts(item,'d',candidate=>candidate.endsWith('.class')&&candidate.startsWith('NullPointer'));
    accepts(item,'e',candidate=>candidate.endsWith('.class')&&candidate.startsWith('IllegalArgument'));
    accepts(item,'f',candidate=>candidate.endsWith('.clone()')&&candidate.startsWith('(Date)'));
    const visibleSpan=/Date end = new Date\(now \+ (DELTA(?: [*/] [23])?)\);/.exec(body)?.[1];
    assert(visibleSpan);
    accepts(item,'g',candidate=>equalSpan[candidate]===equalSpan[visibleSpan]);
  }
});

function modelSort(values:number[], leftBranch:string, outerBranch:string){
  const sorted=[...values];let comparisons=0,writes=0;
  for(let pass=1;pass<100;pass++){
    const count=sorted.length-pass;
    if(count<1)return {sorted,comparisons,writes};
    for(let j=0;j<count;j++){
      comparisons++;
      const delta=sorted[j]-sorted[j+1];
      const skip=leftBranch==='JMI CONT'?delta<0:leftBranch==='JPL CONT'?delta>0:leftBranch==='JZE CONT'&&delta===0;
      if(leftBranch.endsWith('LOOP1'))return null;
      if(!skip){
        const saved=sorted[j+1];
        sorted[j+1]=sorted[j];
        sorted[j]=saved;
        writes++;
      }
    }
    if(outerBranch==='JPL LOOP1'&&count>1)continue;
    if(outerBranch==='JZE LOOP1'&&count===1)return null;
    return {sorted,comparisons,writes};
  }
  return null;
}
const bcd = (value:number)=>parseInt(String(value),16);
function assemblyStatement(candidate:string,gr:[number,number]):[number,number] {
  const [op,reg]=candidate.split(' ');
  const position=reg.startsWith('GR0')?0:1;
  const n=gr[position];
  gr[position]=op==='AND'?n&15:op==='SLL'?(n<<4)&65535:n>>>4;
  return gr;
}
test('2014秋 午後問12はフラグ、比較・交換回数、BCDと空白出力を全択照合する',()=>{
  const probes=[[1,2,3,4],[4,3,2,1],[5,0],[8,8,5,2],[7,3,4],[0,65535,32768,19]];
  for(let index=0;index<8;index++){
    const item=q12.build([index]),descending=prompt(item).includes('降順');
    const sort=(values:number[])=>[...values].sort((a,b)=>descending?b-a:a-b);
    const a=descending?'JPL CONT':'JMI CONT';
    const b='JPL LOOP1';
    accepts(item,'a',candidate=>probes.every(data=>JSON.stringify(modelSort(data,candidate,b)?.sorted)===JSON.stringify(sort(data))));
    accepts(item,'b',candidate=>probes.every(data=>{
      if(!candidate.endsWith('LOOP1'))return false;
      const r=modelSort(data,a,candidate);
      return r?.comparisons===data.length*(data.length-1)/2&&JSON.stringify(r?.sorted)===JSON.stringify(sort(data));
    }));
    const input=panel(item,'count-array').tables[0].rows.map(row=>Number(row[1].text));
    const result=modelSort(input,a,b)!;
    assert.equal(result.comparisons,input.length*(input.length-1)/2);
    if(new Set(input).size===input.length){
      const inversions=sum(input.map((value,i)=>input.slice(i+1).filter(later=>descending?value<later:value>later).length));
      assert.equal(result.writes,inversions);
    }
    accepts(item,'c',candidate=>Number(candidate)===result.comparisons);
    accepts(item,'d',candidate=>Number(candidate)===result.writes);
    const encoded=[0,4,17,100,305,3090,5607,9999].map(bcd);
    accepts(item,'e',candidate=>encoded.every(value=>{
      const [g0,g3]=assemblyStatement(candidate,[value,value]);
      return g0===value&&g3===value%16;
    }));
    accepts(item,'f',candidate=>encoded.every(value=>{
      const [g0,g3]=assemblyStatement(candidate,[value,1234]);
      return g0===Math.floor(value/16)&&g3===1234;
    }));
    const inputs=panel(item,'digits').tables[0].rows;
    const values=inputs.map(row=>Number(row[0].text.slice(1,-1)));
    assert.deepEqual(inputs.map(row=>row[1].text.slice(1,-1)),sort(values).map(n=>String(n).padStart(4,' ')));
    const output=panel(item,'bcd').tables[0].rows[0].map(cell=>cell.text);
    assert.equal(parseInt(output.join(''),2),bcd(values[0]));
  }
});

const relationOperators:Record<string,(x:number,y:number)=>boolean>={
  '<':(x,y)=>x<y,'≦':(x,y)=>x<=y,'>':(x,y)=>x>y,'≧':(x,y)=>x>=y,
};
const ceilUnits=(distance:number,unit:number)=>Math.ceil(distance/unit);
const distanceInBand=(distance:number,lower:number,upper:number)=>Math.max(0,Math.min(distance,upper)-lower);
const stationPairs=Array.from({length:32},(_,i)=>Array.from({length:32},(_,j)=>[i+1,j+1])).flat();
function checkStationFlags(operation:string,lowerOperator:string,upperOperator:string) {
  return stationPairs.every(([a,b])=>{
    const expected=Array.from({length:Math.abs(b-a)},(_,i)=>Math.min(a,b)+i);
    const selected=Array.from({length:31},(_,i)=>i+1).filter(position=>{
      const lower=relationOperators[lowerOperator](position,Math.min(a,b));
      const upper=relationOperators[upperOperator](position,Math.max(a,b));
      return operation==='論理積'?lower&&upper:lower||upper;
    });
    return selected.length===expected.length&&selected.every((value,i)=>value===expected[i]);
  });
}

test('2014秋 午後問13は全乗降駅、区分運賃、最長窓と段階の上限から全択を独立照合する',()=>{
  for(let index=0;index<8;index++){
    const item=q13.build([index]);
    accepts(item,'a',value=>checkStationFlags(value,'≧','<'));
    accepts(item,'b',value=>checkStationFlags('論理積',/([<≦>≧])最小/.exec(value)![1],'<'));
    accepts(item,'c',value=>checkStationFlags('論理積','≧',/([<≦>≧])最大/.exec(value)![1]));
    const fareRows=normalizeRows(item,'fare');
    const [first,second,third,fourth]=fareRows.slice(4);
    const [total,from,to] = [
      Number(/全長(\d+\.\d)km/.exec(prompt(item))![1]),
      Number(normalizeRows(item,'trip')[0][2]),
      Number(normalizeRows(item,'trip')[1][2]),
    ];
    const visible=normalizeRows(item,'route').slice(1).filter(row=>row[0]!=='⋮');
    assert.deepEqual(visible.map(row=>row[3]),visible.map(row=>
      Number(row[1])>=Math.min(from,to)&&Number(row[1])<Math.max(from,to)?'○':''));
    const tenths=(s:string)=>Number(s.replace('.',''));
    const traveled=visible.filter(row=>row[3]==='○');
    const length=sum(traveled.map(row=>tenths(row[2])));
    assert.equal(traveled.length,Math.abs(to-from));
    assert.equal(tenths(normalizeRows(item,'trip')[2][2]),length);
    let low=0;
    let fare=Number(fareRows[0][4]);
    const caps=[first,second,third,fourth].map(row=>{
      const [upper,unit,rate]=row.slice(2,5).map(Number);
      const distance=distanceInBand(length,low,upper*10);
      const price=ceilUnits(distance,unit*10)*rate;
      assert.equal(tenths(row[5]),distance);
      assert.equal(Number(row[6]),price);
      low=upper*10;
      fare+=price;
      return {upper:upper*10,unit:unit*10};
    });
    assert.equal(Number(normalizeRows(item,'trip')[3][2]),fare);

    const samples=[0,1,caps[0].upper-1,caps[0].upper,caps[0].upper+1,395,590,870];
    accepts(item,'d',(_,candidate)=>samples.every(distance=>{
      const lengths=caps.map(({upper},j)=>distanceInBand(distance,caps[j-1]?.upper??0,upper));
      const bounds=caps.map(({upper})=>upper);
      return [1,2,3].every(i=>{
        const deducted=[bounds[i-1],lengths[i-1],sum(bounds.slice(0,i)),sum(bounds),
          sum(lengths.slice(i-1)),sum(lengths.slice(0,i))][candidate];
        return Math.min(distance,bounds[i])-deducted===lengths[i];
      });
    }));
    accepts(item,'e',(_,candidate)=>[0,1,10,12,20,30,31,52,76].every(distance=>
      [10,20,30].every(unit=>{
        const upper=87;
        const alternatives=[Math.ceil(upper/10)*10/unit,Math.ceil(upper/unit),Math.ceil(distance/10)*10/unit,
          Math.ceil(distance/unit),Math.floor(upper/unit+1),Math.floor(distance/unit+1)];
        return alternatives[candidate]===ceilUnits(distance,unit);
      })));
    const program=prompt(item);
    const window=program.includes('六つ離れた')?6:5;
    assert.match(program,new RegExp('I ≦ '+(31-window)));
    accepts(item,'f',candidate=>{
      const [_,first,last]=/J：([01]), J ≦ (\d+)/.exec(candidate)!;
      const accessed=[0,...Array.from({length:Number(last)-Number(first)+1},(_,i)=>Number(first)+i)];
      return accessed.length===window&&accessed.every((offset,i)=>offset===i);
    });
    const shortestLimit=(threshold:number,previous:number,unit:number)=>{
      let current=previous;
      while(current<threshold)current+=unit;
      return current;
    };
    const gInputs=[[43,151,471,30,50],[48,170,412,30,40],[40,160,410,20,50],[37,155,415,30,50],[41,169,439,30,50]];
    accepts(item,'g',(_,candidate)=>gInputs.every(([dist1,dist2,dist3,unit2,unit3])=>{
      const b5=shortestLimit(dist1,0,10);
      const b6=shortestLimit(dist2,b5,unit2);
      const b7=shortestLimit(dist3,b6,unit3);
      const firstDiff=[dist2,dist2-b5,dist2-dist1,dist2-b5+10,dist2-dist1+10][candidate];
      const secondDiff=[dist3,dist3-b6,dist3-dist2,dist3-b6+10,dist3-dist2+10][candidate];
      return b5+ceilUnits(firstDiff,unit2)*unit2===b6&&b6+ceilUnits(secondDiff,unit3)*unit3===b7;
    }));
    const {line}=autumn2014Pm13Model(index);
    const ratio=Number(/距離の(\d+)％以下/.exec(program)![1]);
    assert.equal(sum(line),Math.round(total*10));
    const segments=line.slice(0,-1);
    const prefix=[0];
    for(const length of segments)prefix.push(prefix.at(-1)!+length);
    const target2=Math.max(...prefix.slice(0,32-window).map((value,i)=>prefix[i+window]-value));
    const target3=prefix.at(-1)!*ratio/100;
    const expected1=shortestLimit(Math.max(...segments),0,10);
    const expected2=shortestLimit(target2,expected1,caps[1].unit);
    const expected3=shortestLimit(target3,expected2,caps[2].unit);
    assert(expected2>=target2&&expected2-caps[1].unit<target2);
    assert(expected3>=target3&&expected3-caps[2].unit<target3);
  }
});

test('2014秋 午後問9〜13の16図が全128条件で描画され、原注記と結合セルを維持する',()=>{
  assert.equal(figures.length,16);
  assert.deepEqual(renderers.map(x=>x.profile),figures.map(x=>x.profile));
  for(const [i,figure] of figures.entries()){
    for(let index=0;index<8;index++){
      assert(figure.alt([index]).length>4);
      const html=renderToStaticMarkup(createElement(renderers[i].component,{values:[index],caption:figure.profile}));
      assert.match(html,/<table/);
      assert.match(html,/diagram-scroll/);
      if(figure.profile.endsWith('-input'))assert.match(html,/属性の値（網掛け部分）は，16進数/);
      if(figure.profile.endsWith('-fare'))assert.match(html,/colSpan="6"/i);
      if(figure.profile.endsWith('-z-chart'))assert.match(html,/<tfoot>/);
    }
  }
});

test('2014秋 午後問9と問11は表示コードをC11・Java SE 8で実行して全条件と境界を照合する', async () => {
  await import('./fixtures/legacy-2014-autumn-pm-09-13-native-check');
});
