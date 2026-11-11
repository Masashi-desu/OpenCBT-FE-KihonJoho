import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync,readdirSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2010AutumnPm05To08Definitions as definitions } from '../src/core/generators/legacy-2010-autumn-pm-05-08';
import { legacy2010AutumnPm0508Figures as figures, programSheets, programText } from '../src/core/generators/legacy-2010-autumn-pm-05-08-figures';
import { legacy2010AutumnPm0508FigureRenderers as renderers } from '../src/ui/Legacy2010AutumnPm0508Figures';
import { autumn2010Pm05To08Specs as specs } from '../scripts/legacy-2010-autumn-pm-05-08-specs';
import { program1, program2 } from '../src/core/generators/legacy-2010-autumn-pm-05-08-model';
import { fixedReview as review } from './fixtures/legacy-2010-autumn-pm-05-08-review';
Object.assign(globalThis,{React});
const text=(blocks:readonly Block[])=>blocks.map(block=>{
  if(block.type==='paragraph'||block.type==='code')return block.text;
  if(block.type==='table')return [block.caption,block.columns.join('｜'),...block.rows.map(row=>row.join('｜'))].join('\n');
  if(block.type==='diagram')return block.caption+'\n'+block.alt;
  return '';
}).join('\n');
function optionTexts(body:GeneratedBody,slot:number){
  const part=body.answerParts![slot];
  return part.choiceIds.map(id=>text(body.choices[Number(id.replace('choice-value-',''))-1]));
}
function chosen(body:GeneratedBody,slot:number){
  const answer=body.partAnswers![slot];
  assert.equal(answer.kind,'choice');
  if(answer.kind!=='choice')throw Error('answer');
  return body.answerParts![slot].choiceIds.indexOf(answer.choiceId);
}
function unique(body:GeneratedBody,slot:number,truth:readonly boolean[]){
  assert.equal(truth.length,body.answerParts![slot].choiceIds.length);
  assert.equal(truth.filter(Boolean).length,1);
  assert.equal(chosen(body,slot),truth.indexOf(true));
}
const selected=(index:number,length:number)=>Array.from({length},(_,i)=>i===index);

test('公式5–8の26欄・原形式・全解答群・紙面頁・元の値を対応させる',()=>{
  for(const [index,spec] of specs.entries()){
    const number=spec.number as 5|6|7|8, original=review.originals[number], body=spec.original;
    assert.deepEqual(spec.pages,original.pages);
    assert.equal(spec.definition.sourceAnswer,original.keys.split('').join('／'));
    assert.deepEqual(body.answerParts!.map(part=>part.choiceIds.length),original.counts);
    assert.deepEqual(body.answerParts!.map((_,i)=>'アイウエオカキ'[chosen(body,i)]).join(''),original.keys);
    assert.equal(definitions[index].fields[0].maximum,3);
    for(const alt of Object.values(spec.originalPageAlt))assert.ok(alt.length>160);
  }
  assert.equal(specs.flatMap(spec=>spec.original.answerParts!).length,26);
});

test('すべての有限条件で全選択肢と正答を重複なく表示し本文・選択肢・参照のSchemaと不正入力を検査する',()=>{
  const dir='docs/public/schemas', ajv=new Ajv2020({strict:false,allErrors:true});
  addFormats(ajv);
  for(const file of readdirSync(dir).filter(file=>file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(readFileSync(dir+'/'+file,'utf8')));
  const validate=ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert.ok(validate);
  for(const definition of definitions){
    const signatures=new Set<string>();
    for(let i=0;i<4;i++){
      const body=definition.build([i]);
      assert.deepEqual(body,definition.build([i]));
      signatures.add(text(body.prompt));
      for(const block of [...body.prompt,...body.choices.flat(),...body.contexts?.flatMap(context=>context.blocks)??[]])
        assert.ok(validate(block),JSON.stringify(validate.errors));
      for(let j=0;j<body.answerParts!.length;j++){
        const options=optionTexts(body,j);
        assert.equal(new Set(options).size,options.length);
        assert.ok(chosen(body,j)>=0);
        assert.ok(options.every(option=>option.trim().length));
      }
    }
    assert.equal(signatures.size,4);
    for(const values of [[],[-1],[4],[0.5],[NaN],[Infinity],[0,0],Array(1),Object.assign([0],{other:1})]){
      assert.throws(()=>definition.build(values));
    }
  }
});

test('問5は管理単位の整列・最低限項目・FIFOの全枝を別のキュー方式で検算する',()=>{
  const fifo=(receipts:readonly {id:number;date:number;qty:number;price:number}[],issues:readonly {id:number;qty:number}[])=>{
    const answer=[];
    for(const id of [...new Set(receipts.map(row=>row.id))].sort()){
      let remaining=issues.filter(row=>row.id===id).reduce((sum,row)=>sum+row.qty,0);
      for(const row of receipts.filter(row=>row.id===id).sort((a,b)=>a.date-b.date)){
        const amount=Math.min(remaining,row.qty);remaining-=amount;
        if(row.qty>amount)answer.push({...row,qty:row.qty-amount});
      }
      assert.equal(remaining,0);
    }
    return answer;
  };
  const receipts=[{id:2,date:3,qty:7,price:40},{id:1,date:2,qty:6,price:20},{id:1,date:1,qty:4,price:10},{id:3,date:1,qty:3,price:30}];
  const issues=[{id:1,qty:2},{id:1,qty:5},{id:2,qty:7}];
  assert.deepEqual(fifo(receipts,issues),[{id:1,date:2,qty:3,price:20},{id:3,date:1,qty:3,price:30}]);
  assert.equal(fifo(receipts,issues).reduce((sum,row)=>sum+row.qty*row.price,0),150);
  for(let i=0;i<4;i++){
    const body=definitions[0].build([i]), record=body.prompt.find(block=>block.type==='diagram'&&block.caption.includes('レコード様式'));
    assert.equal(record?.type,'diagram');if(record?.type!=='diagram')throw Error('record');
    const key=/示す。([^｜]+)｜受入日付｜購入単価｜受入数量/.exec(record.alt)?.[1];
    assert.ok(key);
    unique(body,0,optionTexts(body,0).map(item=>item===key+'，受入日付'));
    unique(body,1,optionTexts(body,1).map(item=>item==='払出数量，'+key));
    unique(body,2,optionTexts(body,2).map(item=>item===key));
    assert.equal(review.inventorySort.length,6);assert.equal(review.issueFields.length,6);assert.equal(review.issueGroup.length,6);
    const flow=body.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('5-flow'))!;
    assert.equal(flow.type,'diagram');if(flow.type!=='diagram')throw Error('flow');
    const labels=[...flow.alt.matchAll(/P[123]/g)].map(match=>match[0]);
    assert.equal(new Set(labels).size,3);
    const wanted=[labels[0],labels[2]].sort().join('，');
    unique(body,3,optionTexts(body,3).map(option=>option===wanted));
    const reverse=flow.alt.includes('0とHをこの順に比較');
    unique(body,4,body.answerParts![4].choiceIds.map(id=>{
      const option=body.choices[Number(id.replace('choice-value-',''))-1][0];
      return option.type==='table'&&option.rows[0][0]===(reverse?'＞':'＜')&&option.rows[0][1]==='＝';
    }));
    for(let h=0;h<=10;h++)for(let u=1;u<=10;u++){
      const difference=h-u, comparison=reverse?-difference:difference;
      assert.equal(reverse?comparison>0:comparison<0,u>h);
      assert.equal(comparison===0,h===u);
      assert.equal(Math.max(0,-difference),Math.max(0,u-h));
    }
    assert.ok(text(body.prompt).includes('数量が0のレコードは期末在庫に出力しない'));
    assert.ok(flow.alt.includes('最大値は突合せキーが取り得る値よりも大きい'));
  }
});

test('問6は当時前提の契約・監督・技術的/物理的区分と全誤答の因果を査読資料から判定する',()=>{
  assert.ok(review.privacy.basis.every(Boolean));
  for(let i=0;i<4;i++){
    const body=definitions[1].build([i]), paragraphs=body.prompt.filter(block=>block.type==='paragraph').map(block=>block.text);
    unique(body,0,review.privacy.ab.map(entry=>entry.kind==='contract'));
    unique(body,1,review.privacy.ab.map(entry=>entry.kind==='data-supervision'));
    unique(body,2,review.privacy.c);
    const findings=paragraphs.filter(line=>/^[①②③④]　/.test(line));
    assert.equal(findings.length,4);
    const physical=findings.findIndex(line=>line.includes('鍵'));
    unique(body,3,selected(physical,4));
    unique(body,4,review.privacy.riskPhysical);
    unique(body,5,review.privacy.riskMissingAudit);
    assert.ok(paragraphs.some(line=>line.includes('試験当時')));
    assert.ok(paragraphs.some(line=>line.includes('必要なデータだけ')));
    assert.ok(paragraphs.some(line=>line.includes('暗号化')));
  }
});

const toNumber=(value:string)=>Number(value.replaceAll(',',''));
function accounts(body:GeneratedBody){
  const tables=body.prompt.filter(block=>block.type==='table'), financial=tables.filter(table=>table.caption?.includes('の業績'));
  assert.equal(financial.length,2);
  const fx=tables.find(table=>table.caption?.includes('為替レート'))!;
  const rates=fx.rows.map(row=>row.slice(1).map(value=>Number(value.split('円')[0])));
  return financial.map((table,year)=>table.columns.slice(1).map((_,company)=>{
    const local=company<2?1:rates[company-2][year];
    return Object.fromEntries(table.rows.map(row=>[row[0],toNumber(row[company+1])/local]));
  }));
}
test('問7は実際の表の2年度の全48財務項目を読み現地通貨へ戻して全条件を独立検算する',()=>{
  for(let i=0;i<4;i++){
    const body=definitions[2].build([i]), [previous,current]=accounts(body), eligible=current.map(row=>row['営業利益']>0&&row['経常利益']>0);
    assert.equal(eligible.filter(value=>!value).length,1);
    unique(body,0,eligible.map(value=>!value));
    unique(body,1,review.finance.identity);unique(body,2,review.finance.efficiency);
    const salesUp=current[2]['売上高']>previous[2]['売上高'], opUp=current[2]['営業利益']>previous[2]['営業利益'];
    const trends=[salesUp&&opUp,salesUp&&!opUp,!salesUp&&opUp];
    unique(body,3,trends);
    unique(body,4,review.finance.exchangeChanges);unique(body,5,review.finance.exchangeInvariant);
    const award=current.map((row,j)=>{
      const old=previous[j];
      return eligible[j]&&row['売上高']>old['売上高']&&row['営業利益']/row['売上高']>old['営業利益']/old['売上高']&&
        row['経常利益']/row['総資産']>old['経常利益']/old['総資産'];
    });
    const investigate=current.map((row,j)=>row['売上高']<=previous[j]['売上高']*.9&&row['営業利益']<=previous[j]['営業利益']*.9);
    unique(body,6,[...award,!award.some(Boolean)]);
    unique(body,7,[...investigate,!investigate.some(Boolean)]);
    assert.ok(current.every(row=>Math.abs(row['売上高']-row['製造原価・販管費']-row['営業利益'])<1e-6));
    assert.ok(current.every(row=>Math.abs(row['営業利益']+row['営業外損益']-row['経常利益'])<1e-6));
  }
});
/** Generator uses signed numeric registers. This reference uses arrays, ripple carry and slice replacement. */
function word(value:number,width:number){return Array.from({length:width},(_,i)=>Number((value&(1<<(width-1-i)))!==0));}
function add(a:readonly number[],b:readonly number[]){
  let carry=0;return a.map(()=>0).map((_,i)=>i).reverse().reduce<number[]>((out,i)=>{
    const total=a[i]+b[i]+carry;carry=total>1?1:0;out.unshift(total&1);return out;
  },[]);
}
function reference(m:number,n:number,booth:boolean){
  let state=booth?[0,0,0,0,0,...word(n,4),0]:[0,0,0,0,0,...word(n,8)];
  const rows=[], width=state.length;
  for(let turn=0;turn<(booth?4:8);turn++){
    const pair=state.slice(-2).join(''), sign=booth?pair==='01'?1:pair==='10'?-1:0:state.at(-1)!;
    state=sign?[...add(state.slice(0,5),word(m*sign,5)),...state.slice(5)]:state;
    const updated=state.join('');
    state=[state[0],...state.slice(0,-1)];
    rows.push({updated,shifted:state.join(''),operation:sign});
  }
  return {rows,result:state.slice(booth?1:width-8,booth?width-1:width).join('')};
}
test('問8の独立配列ビット参照で全256入力と負数の最低/最高回数を検算する',()=>{
  const popcounts:number[]=[], transitions:number[]=[];
  for(let m=-8;m<8;m++)for(let n=-8;n<8;n++){
    const plain=reference(m,n,false), booth=reference(m,n,true), expected=word(m*n,8).join('');
    assert.equal(plain.result,expected);assert.equal(booth.result,expected);
    const actualPlain=program1(m,n),actualBooth=program2(m,n);
    assert.equal(actualPlain.result,plain.result);assert.equal(actualBooth.result,booth.result);
    assert.deepEqual(actualPlain.rows.map(row=>({updated:row.afterAdd,shifted:row.shifted})),plain.rows.map(({updated,shifted})=>({updated,shifted})));
    assert.deepEqual(actualBooth.rows.map(row=>({updated:row.updated,shifted:row.shifted})),booth.rows.map(({updated,shifted})=>({updated,shifted})));
    if(n<0&&m===1){
      popcounts.push(plain.rows.filter(row=>row.operation).length);
      transitions.push(booth.rows.filter(row=>row.operation).length);
    }
  }
  assert.equal(Math.min(...popcounts),review.multiplication.negativeMinimum);
  assert.equal(Math.max(...transitions),review.multiplication.negativeMaximum);
});
test('問8の生成例の全択・図の実際のビット列・空欄長・共通資料を独立追跡と照合する',()=>{
  for(let i=0;i<4;i++){
    const body=definitions[3].build([i]), content=text(body.prompt), found=/N＝3，M＝(\d+)の場合/.exec(content)!;
    assert.ok(found);const m=-Number(found[1]), normal=reference(m,3,false), booth=reference(m,3,true);
    const expected=[normal.rows[0].shifted.slice(0,6),normal.rows[1].shifted.slice(0,7),booth.rows[1].shifted.slice(0,7)];
    for(let slot=0;slot<3;slot++)unique(body,slot,optionTexts(body,slot).map(value=>value===expected[slot]));
    unique(body,3,review.multiplication.combinedShift);
    unique(body,4,optionTexts(body,4).map(value=>Number(value)===review.multiplication.negativeMinimum));
    unique(body,5,optionTexts(body,5).map(value=>Number(value)===review.multiplication.negativeMaximum));
    unique(body,6,review.multiplication.runOfOnes.map(value=>value===7));
    assert.equal(body.contexts![0].blocks.length,2);
    assert.ok(content.includes('範囲は−8～7'));assert.ok(content.includes('けたあふれ'));
    const diagrams=body.prompt.filter(block=>block.type==='diagram');
    for(const diagram of diagrams){
      assert.equal(diagram.scene.kind,'source_figure');
      if(diagram.scene.kind!=='source_figure')throw Error('profile');
      const {profile}=diagram.scene;
      const position=figures.findIndex(figure=>figure.profile===profile);
      assert.ok(position>=0);
      assert.equal(diagram.alt,figures[position].alt([i]));
      if(!diagram.scene.profile.includes('trace'))continue;
      const html=renderToStaticMarkup(React.createElement(renderers[position].component,{values:[i],caption:diagram.caption}));
      const rows=[...html.matchAll(/data-trace-register="true"[\s\S]*?data-visible="([ 01]*)"/g)].map(match=>match[1]);
      assert.equal(rows.length,9);
      const kind=Number(diagram.scene.profile.at(-1));
      const r=reference(kind===1?-m:m,3,kind===3);
      const expectedRows=kind===3?
        ['     0011 ','0000000110',r.rows[0].updated,r.rows[0].shifted,r.rows[1].shifted,r.rows[2].updated,r.rows[2].shifted,r.rows[3].shifted,r.result]:
        ['0000000000011',r.rows[0].updated,r.rows[0].shifted,r.rows[1].updated,r.rows[1].shifted,r.rows[2].shifted,r.rows[6].shifted,r.rows[7].shifted,r.result];
      const hides=kind===3?[0,0,5,6,7,7,8,9,8]:kind===2?[0,5,6,6,7,8,12,13,8]:[];
      assert.deepEqual(rows,expectedRows.map((word,j)=>word.slice(hides[j]??0)));
    }
  }
});

test('疑似言語の原形式は両コード全行・継続コメント・行番号と制御線を同一SVGへ保持する',()=>{
  assert.deepEqual(programSheets.map(sheet=>sheet.lines.length),[14,16]);
  assert.deepEqual(programSheets.map(sheet=>sheet.rails.map(rail=>rail.kind)),[['loop','branch'],['loop','branch','branch']]);
  for(let number=0;number<2;number++){
    const sheet=programSheets[number], text=programText(number);
    assert.equal(sheet.lines.filter(line=>line.operation).length,number===0?8:9);
    assert.ok(text.includes('/* 空いたビット位置には */\n'));
    assert.ok(text.includes('/* 符号と同じものが入る */'));
    assert.ok(sheet.lines.at(-1)!.text.includes('return'));
    assert.equal(sheet.lines.filter(line=>line.text==='').length,number===0?2:3);
    assert.ok(sheet.lines.filter(line=>line.text.includes('内容にM')||line.text.includes('内容からM')).every(line=>line.depth===2));
  }
});

test('全図・4有限条件のSSR，プロフィール・入力域・完全altを照合する',()=>{
  assert.equal(figures.length,8);assert.equal(renderers.length,8);
  for(const [i,figure] of figures.entries()){
    assert.equal(renderers[i].profile,figure.profile);
    for(let v=0;v<4;v++){
      assert.doesNotThrow(()=>figure.validate([v]));
      const html=renderToStaticMarkup(React.createElement(renderers[i].component,{values:[v],caption:'図'}));
      assert.ok(html.includes('<svg'));assert.ok(html.includes('diagram-scroll'));
      assert.ok(figure.alt([v]).length>30);
      assert.ok(html.includes('aria-description='));
    }
    for(const values of [[],[-1],[4],[NaN],Array(1)])assert.throws(()=>figure.validate(values));
  }
});
