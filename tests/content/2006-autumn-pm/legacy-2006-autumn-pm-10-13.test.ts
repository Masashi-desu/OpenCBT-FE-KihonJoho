import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { autumn2006PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2006-autumn-pm-10-13';
import { autumn2006Pm10To13Specs as specs } from '../../../scripts/legacy-2006-autumn-pm-10-13-specs';
import { q11Bill, q11Table } from '../../../src/core/generators/legacy-2006-autumn-pm-11';
import { q12Output } from '../../../src/core/generators/legacy-2006-autumn-pm-12';
import { q13Replacement, q13Rotation } from '../../../src/core/generators/legacy-2006-autumn-pm-13';
import { legacy2006AutumnPm1013Figures as figures } from '../../../src/core/generators/legacy-2006-autumn-pm-10-13-figures';
import { legacy2006AutumnPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2006AutumnPm1013Figures';
import { expectedOrders, executeOrders, stockFixtures, libraryReference, libraryMutant,
  type Book, type LibrarySource, type Parts } from '../../fixtures/legacy-2006-autumn-pm-language-reference';
import { assembleCasl, replaceNonoverlapping } from '../../fixtures/legacy-2006-autumn-pm-casl-reference';

const kana='アイウエオカキ';
const official=['アオアイエ','エカイアア','イウアエウ'];
const counts=[[5,5,4,3,4],[5,6,4,4,4],[4,4,4,4,5]];
export const q=(number:number,index:number)=>drafts[number-11].definition.build([index]);
export const prose=(body:GeneratedBody)=>body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
export const code=(body:GeneratedBody,language:string)=>body.prompt.flatMap(block=>block.type==='code'&&block.language===language?[block.text]:[]);
export const banks=(body:GeneratedBody)=>Object.fromEntries(body.answerParts!.map(part=>[part.id.slice(5),part.choiceIds.map(id=>{
  const block=body.choices[Number(id.split('-').at(-1))-1][0];
  assert(block.type==='code'||block.type==='paragraph');
  return block.text;
})]));
export const correct=(body:GeneratedBody)=>Object.fromEntries(body.answerParts!.map(part=>{
  const answer=body.partAnswers!.find(answer=>answer.kind==='choice'&&answer.partId===part.id);
  assert(answer?.kind==='choice');
  return [part.id.slice(5),part.choiceIds.indexOf(answer.choiceId)];
}));
const keyString=(body:GeneratedBody)=>body.answerParts!.map(part=>kana[correct(body)[part.id.slice(5)]]).join('');
const truth=(choices:string[],selected:number,actual:boolean[],label:string)=>{
  assert.deepEqual(actual,choices.map((_,i)=>i===selected),label);
};

test('問11〜13の全14頁・公式正答・全12入力・採点欄・解答群の順を維持する',()=>{
  assert.deepEqual(drafts.map(x=>x.number),[11,12,13]);
  for(const [j,draft] of drafts.entries()){
    const {original,originalPageAlt,pages}=specs[j];
    const baseline=draft.definition.build([0]);
    assert.equal(keyString(original),official[j]);
    assert.equal(keyString(baseline),official[j]);
    assert(pages.every(page=>originalPageAlt[page].length>100&&originalPageAlt[page].length<=2000));
    const conditions=Array.from({length:4},(_,i)=>draft.definition.build([i]));
    assert.equal(new Set(conditions.map(x=>JSON.stringify(x.prompt))).size,4);
    for(const body of conditions) {
      assert.equal(body.answerParts!.length,counts[j].length);
      assert.equal(body.partAnswers!.length,counts[j].length);
      assert.deepEqual(body.answerParts!.map(part=>part.choiceIds.length),counts[j]);
      assert.deepEqual(body.prompt.map(block=>block.type),baseline.prompt.map(block=>block.type));
      assert(body.explanation.length>120);
    }
    assert.deepEqual(pages,[[38,39,40,41,42],[43,44,45,46,47],[48,49,50,51]][j]);
    for(const invalid of [[],[2,1],[-1],[4],[0.5],[NaN],Array<number>(1)])
      assert.throws(()=>draft.definition.build(invalid),/範囲外/);
  }
});

export function cobolFixture(body:GeneratedBody,index:number){
  const {lists}=q11Bill.panel([index]), table=q11Table.panel([index]).rows;
  assert.deepEqual(table,lists.flatMap(([product,children])=>children.map(([name,n])=>[product.slice(2),name.slice(2),String(n)])));
  const parts:Parts=Object.fromEntries(table.filter(([product],row)=>table.findIndex(item=>item[0]===product)===row)
    .map(([product])=>[product,Object.fromEntries(table.filter(item=>item[0]===product).map(([,id,n])=>[id,Number(n)]))]));
  const input=/在庫が(\d+)個，部品B1の在庫が(\d+)個，部品B3の在庫が(\d+)個.+製品S2を(\d+)個/.exec(prose(body))!;
  return stockFixtures(parts,Number(input[1]),input.slice(2,4).map(Number),Number(input[4]));
}
test('問11の全欄を独立した在庫の逐次割当て・索引の位置付け・呼出し法で判定する',()=>{
  for(let i=0;i<4;i++){
    const body=q(11,i), choices=banks(body), selected=correct(body), fixtures=cobolFixture(body,i);
    for (const {stocks,parts,shipments} of fixtures) for (const reserve of [false,true]) {
      const have=executeOrders(stocks,parts,shipments,selected,reserve);
      const want=expectedOrders(stocks,parts,shipments,reserve);
      assert.deepEqual(have,want);
    }
    for(const part of ['a','b','c','d']){
      const keep=(candidate:number)=>fixtures.every(({stocks,parts,shipments})=>{
        const reserve=part==='d';
        return JSON.stringify(executeOrders(stocks,parts,shipments,{...selected,[part]:candidate},reserve))===
          JSON.stringify(expectedOrders(stocks,parts,shipments,reserve));
      });
      truth(choices[part],selected[part],choices[part].map((_,candidate)=>keep(candidate)),part);
    }
    truth(choices['2'],selected['2'],choices['2'].map(mode=>!['DYNAMIC','SEQUENTIAL'].some(valid=>mode.endsWith(valid))),'access mode');
    const originalExample=expectedOrders(fixtures[2].stocks,fixtures[2].parts,fixtures[2].shipments,false);
    assert.deepEqual(originalExample.orders.map(row=>row.component),['B3']);
    assert.match(prose(body),new RegExp(originalExample.orders[0].quantity+'（＝'));
    const lines=code(body,'cobol').join('\n').split('\n');
    assert.equal(lines.length,106);
    assert.match(lines[45],/^ *46 +［a］\./);
    assert.match(lines[50],/^ *51 +［b］/);
    assert.match(lines[82],/^ *83 +START BUHIN-F ［c］/);
    assert.match(lines[65],/^ *66 +COMPUTE W-YUKO-ZSU = Z-ZAIKO-SU - Z-WARIATE-SU\./);
  }
});

export function javaFixture(body:GeneratedBody):LibrarySource{
  const main=code(body,'java')[1], names=new Map<string,string>(), stock:Book[]=[];
  for (const [,variable,title,issue,id] of main.matchAll(/(\w+) = new (?:RegularBook|Magazine)\("([^"]+)", (?:(\d+), )?"([PM]\d{3})"\)/g)){
    names.set(variable,id);
    stock.push({id,title,...(issue?{issue:Number(issue)}:{})});
  }
  const [,one,two]=/new User\("([^"]+)", "ID-01"\);\n.+new User\("([^"]+)", "ID-02"\)/.exec(main)!;
  const extract=(line:string,symbol:string)=>new RegExp('Book\\[\\] '+symbol+' = \\{([^}]+)').exec(line)![1].split(', ').map(value=>names.get(value)!);
  const returned=/library\.returnBook\((\w+)\)/.exec(code(body,'java')[2])![1];
  return {stock,limit:Number(/new Library\(books, (\d+)\)/.exec(main)![1]),users:[one,two],
    loan1:extract(main,'books1'),loan2:extract(code(body,'java')[2],'books2'),returned:names.get(returned)!};
}
test('問12の原実行例・上限・全空欄・最新号の異なる登録順を独立ライブラリモデルで判定する',()=>{
  for(let i=0;i<4;i++){
    const body=q(12,i), selected=correct(body), choices=banks(body), base=javaFixture(body);
    assert.equal(libraryReference(base),q12Output.panel([i]).text);
    assert.equal(libraryMutant(base,selected),libraryReference(base));
    const latest=base.stock.find(book=>book.id==='M002')!;
    const mixed={...base,stock:[{id:'M003',title:'Independent title',issue:latest.issue},...base.stock],
      loan1:['M003',...base.loan1]};
    const inverse={...mixed,stock:[...mixed.stock].reverse()};
    for(const part of 'ab'){
      truth(choices[part],selected[part],choices[part].map((_,j)=>
        libraryMutant(base,{...selected,[part]:j})===libraryReference(base)&&
        [mixed,inverse].every(probe=>libraryMutant(probe,{...selected,[part]:j},true)===libraryReference(probe,true))),part);
    }
    for(const part of 'cde'){
      truth(choices[part],selected[part],choices[part].map((_,j)=>[mixed,inverse].every(probe=>
        libraryMutant(probe,{...selected,[part]:j},true)===libraryReference(probe,true))),part);
    }
    assert.deepEqual(code(body,'java').map(block=>Number(/^( *\d+)/.exec(block)![1])),[1,49,97]);
    for(const word of ['set','Map','Entry'])
      assert(body.contexts?.some(context=>context.blocks.some(block=>JSON.stringify(block).toLowerCase().includes(word.toLowerCase()))));
  }
});

export function caslData(body:GeneratedBody) {
  const [input]=code(body,'text'), values=[...input.matchAll(/：\s*([01]+)\b/g)].map(match=>match[1]);
  assert.equal(values.length,3);
  return values as [string,string,string];
}
test('問13の全CASL命令候補・端のビット長・重なり・位置復帰を独立機械と文字列の置換で照合する',()=>{
  for(let i=0;i<4;i++){
    const body=q(13,i), selected=correct(body), choices=banks(body), main=code(body,'casl2');
    const {source,pattern,replacement,target}=q13Replacement.panel([i]), rotate=q13Rotation.panel([i]);
    assert.equal(replaceNonoverlapping(source,pattern,replacement).expected,target);
    assert.equal(rotate.target,(rotate.source+rotate.source).slice(rotate.width,rotate.width+16));
    const input=caslData(body), probes=[
      input,[source,pattern,replacement],['0000000000000000','1','0'],['1011111101100011','11','10'],
      ['0000000000000001','1','0'],['1110111101110110','111','000'],['1000000000000001','1000000000000001','0000000000000000'],
      ['1010101010101010','0000000000000000','1111111111111111'],
    ];
    for(let length=1;length<=16;length++){
      const word='0101111100011010';
      const search=word.slice(16-length);
      probes.push([word,search,[...search].map(bit=>bit==='0'?'1':'0').join('')]);
    }
    const number=(bitString:string)=>Number.parseInt(bitString,2);
    const chosen=Object.fromEntries([...'abcd'].map(part=>[part,choices[part][selected[part]]]));
    const verify=(keys:Record<string,string>)=>{
      const run=assembleCasl(main,keys);
      const good=probes.every(([a,b,c])=>{
        const result=run('BREP',number(a),number(b.padEnd(16,'0')),number(c.padEnd(16,'0')),b.length);
        const want=replaceNonoverlapping(a,b,c);
        return result?.preserved&&result.word===number(want.expected)&&result.steps.length===want.calls&&
          result.steps.reduce((sum,n)=>sum+n,0)===16;
      });
      return good&&Array.from({length:17},(_,n)=>n).every(n=>{
        const result=run('ROTSL',number(source),0,0,0,n);
        return result?.preserved&&result.word===number((source+source).slice(n,n+16));
      });
    };
    for(const part of 'abcd') truth(choices[part],selected[part],choices[part].map(option=>verify({...chosen,[part]:option})),part);
    const calls=replaceNonoverlapping(...input).calls;
    truth(choices['2'],selected['2'],choices['2'].map(option=>Number(option)===calls),'rotation count');
    assert.deepEqual(choices['2'],['2','6','8','12','16']);
    assert.equal(body.contexts?.[0].blocks.length,6);
    assert(body.contexts[0].blocks.some(block=>block.type==='image'&&block.assetId.endsWith('-057-casl-excerpt')));
  }
});

test('問11〜13の全11図に四条件の描画器と表示用代替テキストがある',()=>{
  assert.deepEqual(renderers.map(row=>row.profile),figures.map(row=>row.profile));
  for(const [i,row] of renderers.entries()) for(const index of [0,1,2,3]){
    const markup=renderToStaticMarkup(createElement(row.component,{values:[index],caption:row.profile}));
    assert.match(markup,/class="diagram-scroll"/);
    assert.match(markup,/aria-description="[^"]{8,}"/);
    assert(markup.includes(figures[i].profile));
    assert.match(markup,/<(?:table|svg|pre)\b/);
  }
});
