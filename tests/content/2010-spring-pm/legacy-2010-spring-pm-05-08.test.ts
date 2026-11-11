import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Attribution,Block,Question } from '../../../src/core/types';
import { displayedAnswerParts,gradeAnswer,validateAnswerDefinition } from '../../../src/core/answers';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2010SpringPm05To08Definitions as definitions } from '../../../src/core/generators/legacy-2010-spring-pm-05-08';
import { drawingIds,legacy2010SpringPm0508Figures as figures,programSheets,optionSheets } from '../../../src/core/generators/legacy-2010-spring-pm-05-08-figures';
import { sortTrace } from '../../../src/core/generators/legacy-2010-spring-pm-05-08-model';
import { legacy2010SpringPm0508FigureRenderers as renderers } from '../../../src/ui/Legacy2010SpringPm0508Figures';
import { spring2010Pm05To08Specs as specs } from '../../../scripts/legacy-2010-spring-pm-05-08-specs';
import { review } from '../../fixtures/legacy-2010-spring-pm-05-08-review';
Object.assign(globalThis,{React});

const letters='アイウエオカキクケコ';
const cases=(n:number)=>[0,1,2,3].map(i=>definitions[n-5].build([i]));
const paragraphs=(q:GeneratedBody)=>q.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join('\n');
const tableAt=(q:GeneratedBody,n:number)=>{
  const block=q.prompt.find(block=>block.type==='table'&&block.caption?.startsWith('表'+n+'　'));
  assert.equal(block?.type,'table');return block;
};
const diagramAt=(q:GeneratedBody,id:string)=>{
  const block=q.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+id));
  assert.equal(block?.type,'diagram');return block;
};
function choice(q:GeneratedBody,slot:number,index:number){
  const id=q.answerParts![slot].choiceIds[index], content=q.choices[Number(id.replace('choice-value-',''))-1];
  assert.equal(content.length,1);return content[0];
}
function text(block:Block){
  if(block.type==='diagram')return block.alt;
  assert.ok(block.type==='paragraph'||block.type==='code');
  return block.text;
}
const bank=(q:GeneratedBody,slot:number)=>q.answerParts![slot].choiceIds.map((_,i)=>text(choice(q,slot,i)));
function selected(q:GeneratedBody,slot:number){
  const part=q.answerParts![slot], answer=q.partAnswers!.find(a=>a.kind==='unordered'?a.partIds.includes(part.id):a.partId===part.id);
  assert.ok(answer&&answer.kind!=='no_correct_answer');
  const id=answer.kind==='unordered'?answer.choiceIds[answer.partIds.indexOf(part.id)]:answer.choiceId;
  return part.choiceIds.indexOf(id);
}
function unique(q:GeneratedBody,slot:number,truth:readonly boolean[]){
  assert.equal(truth.length,q.answerParts![slot].choiceIds.length);
  assert.deepEqual(truth.flatMap((ok,i)=>ok?[i]:[]),[selected(q,slot)],'欄 '+q.answerParts![slot].label);
}

test('公式4大問の26欄・頁・元の値・全選択肢数を照合する',()=>{
  for(const spec of specs){
    const n=spec.number as keyof typeof review.originals, expected=review.originals[n], original=spec.original;
    assert.deepEqual(spec.pages,expected.pages);
    assert.equal(spec.definition.sourceAnswer,expected.keys.split('').join('／'));
    assert.deepEqual(original.answerParts!.map(part=>part.choiceIds.length),expected.sizes);
    assert.equal(original.answerParts!.map((_,slot)=>letters[selected(original,slot)]).join(''),expected.keys);
    assert.ok(Object.values(spec.originalPageAlt).every(alt=>alt.length>100&&alt.length<=2000));
  }
  assert.equal(specs.flatMap(spec=>spec.original.answerParts!).length,26);
  assert.equal(specs.flatMap(spec=>spec.pages).length,23);
});
test('全16条件の決定性、選択肢、入力域とブロックSchemaを検査する',()=>{
  const folder='docs/public/schemas', ajv=new Ajv2020({strict:false,allErrors:true});
  addFormats(ajv);
  for(const file of readdirSync(folder).filter(file=>file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(readFileSync(folder+'/'+file,'utf8')));
  const validate=ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert.ok(validate);
  let options=0;
  for(const definition of definitions){
    const signatures=new Set<string>();
    for(let i=0;i<4;i++){
      const q=definition.build([i]);
      assert.deepEqual(q,definition.build([i]));
      signatures.add(JSON.stringify(q.prompt));
      for(const block of [...q.prompt,...q.choices.flat(),...q.contexts?.flatMap(item=>item.blocks)??[]])
        assert.ok(validate(block),JSON.stringify(validate.errors));
      for(let slot=0;slot<q.answerParts!.length;slot++){
        const values=bank(q,slot);
        assert.equal(new Set(values).size,values.length);assert.ok(values.every(Boolean));assert.ok(selected(q,slot)>=0);
        options+=values.length;
      }
    }
    assert.equal(signatures.size,4);
    for(const bad of [[],[-1],[4],[.5],[NaN],[0,0],Array(1),Object.assign([0],{extra:1})])assert.throws(()=>definition.build(bad));
  }
  assert.equal(options,596);
});

function dateOffset(text:string){
  if(text.includes('翌々日'))return 2;
  if(text.includes('翌日'))return 1;
  return Number(text.match(/(\d+)日後/)?.[1]??0);
}
function dateMatches(option:string,candidate:number,request:number,eligible:number,schedule:number){
  const reference=option.startsWith('受付日')?request+dateOffset(option):option.startsWith('配達可能日')?eligible:schedule;
  return option.includes('と同じでない')?candidate!==reference:option.includes('と同じ')?candidate===reference:
    option.includes('以前')?candidate<=reference:candidate>=reference;
}
test('問5は日付・業者と件数の条件、ファイル結合と完了登録の全候補を照合する',()=>{
  for(const q of cases(5)){
    const content=paragraphs(q), premise=content.match(/受付登録した日（受付日）の([^で]+)以降/)?.[1];
    assert.ok(premise);const lead=dateOffset(premise);
    assert.ok(review.delivery.dateOperands.every(operand=>bank(q,0).some(option=>option.startsWith(operand))));
    const request=18, dates=Array.from({length:13},(_,i)=>15+i);
    const trial=dates.flatMap(day=>[21,22,24,26].flatMap(eligible=>[20,23,24,27].map(schedule=>({day,eligible,schedule}))));
    unique(q,0,bank(q,0).map(option=>trial.every(({day,eligible,schedule})=>
      dateMatches(option,day,request,eligible,schedule)===(day-request>=lead))));
    unique(q,1,bank(q,1).map(option=>trial.every(({day,eligible,schedule})=>
      dateMatches(option,day,request,eligible,schedule)===(day===eligible))));
    assert.match(content,/配達先郵便番号と一致/);
    assert.ok(review.delivery.matchingKeys.every(key=>content.includes(key)));
    assert.match(content,/業者コードが等しく/);
    assert.match(content,/件数が上限値に達していなければ/);assert.match(content,/1回の受付登録で配達先は1か所/);
    const schemas=['5-accept','5-region','5-reservation'].map(id=>diagramAt(q,id).alt.replace(/^左から |。$/g,'').split('｜'));
    const reservation=schemas[2];
    unique(q,2,schemas.map(fields=>fields.includes('配達先住所')&&fields.includes('配達先氏名')));
    assert.equal(bank(q,2)[selected(q,2)],review.delivery.addressFile);
    unique(q,3,bank(q,3).map(column=>schemas[0].includes(column)&&reservation.includes(column)));
    assert.equal(bank(q,3)[selected(q,3)],review.delivery.joinedBy);
    const report=diagramAt(q,'5-report').alt;
    assert.match(report,/配達先件数3/);assert.match(report,/1｜.+｜[2-3]｜\d{4}/);
    const itemCount=report.split('\n').slice(2,4).map(row=>Number(row.split('｜')[3])).reduce((a,b)=>a+b,0);
    assert.ok(itemCount>3);
    unique(q,4,bank(q,4).map(option=>option===review.delivery.totals));
    assert.match(content,/一意の予約番号/);assert.match(content,/配達完了日は完了まで空白/);
    unique(q,5,bank(q,5).map(option=>option===review.delivery.completionKey&&reservation.includes(option)));
    assert.ok(diagramAt(q,'5-processing').alt.includes('中間ファイル，集計結果ファイル，業者ファイル'));
  }
});
function asQuestion(q:GeneratedBody):Question{
  const attribution:Attribution={origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex']};
  return {id:'quality',answerParts:q.answerParts,correctAnswer:{parts:q.partAnswers,attribution},
    choices:q.choices.map((_,i)=>({id:'choice-value-'+(i+1)}))} as Question;
}
test('問6のa/bは別欄と同じ解答群で、採点器で25組のうち二つの順序だけが正答となる',()=>{
  for(const body of cases(6)){
    const q=asQuestion(body);
    assert.doesNotThrow(()=>validateAnswerDefinition(q));
    assert.equal(displayedAnswerParts(q).length,8);
    const [group]=q.correctAnswer.parts!;
    assert.equal(group.kind,'unordered');
    assert.equal(group.presentation,undefined);
    assert.deepEqual(group.partIds,['part-a','part-b']);
    assert.deepEqual(q.answerParts![0].choiceIds,q.answerParts![1].choiceIds);
    assert.equal(tableAt(body,7).rows[0][1].includes('［a］と［b］'),true);
    const choices=bank(body,0);
    choices.forEach((item,i)=>assert.match(item,review.quality.causes[i]));
    const options=q.answerParts![0].choiceIds;
    for(let a=0;a<5;a++)for(let b=0;b<5;b++){
      const result=gradeAnswer(q,{selectedPartChoices:{'part-a':options[a],'part-b':options[b]}});
      const correct=result.parts!.slice(0,2).every(part=>part.outcome==='correct');
      assert.equal(correct,a!==b&&review.quality.designVariance[a]&&review.quality.designVariance[b]);
    }
    unique(body,2,review.quality.reuse);
    unique(body,3,review.quality.productivity);
  }
});
test('問6の曲線・実績分母・順位・最終の四捨五入を独立検算する',()=>{
  const round=(n:number,d:number)=>Number((100n*BigInt(n)+BigInt(d)/2n)/BigInt(d));
  for(const q of cases(6)){
    const expected=tableAt(q,2), design=tableAt(q,3), manufacture=tableAt(q,4), test=tableAt(q,5);
    assert.deepEqual(expected.rows[0].slice(1),['30','35','20','15']);
    const columns=[0,1,2].map(index=>[design.rows[0],manufacture.rows[0],...test.rows].map(row=>Number(row[index+1])));
    const sums=columns.map(col=>col.reduce((a,b)=>a+b,0));
    const early=columns.map(col=>col[0]+col[1]), f=round(columns[1][1],sums[1]);
    const top=early.findIndex((count,i)=>early.every((other,j)=>j===i||count*sums[j]>other*sums[i]));
    assert.ok(top>=0);
    const h=round(early[top],sums[top]);
    const curves=bank(q,4);
    curves.forEach((item,i)=>assert.match(item,review.quality.curve[i]));
    unique(q,4,curves.map(item=>/終盤は増加が見られない/.test(item)));
    unique(q,5,bank(q,5).map(value=>Number(value)===f));
    unique(q,6,bank(q,6).map(value=>value==='G'+(top+1)));
    unique(q,7,bank(q,7).map(value=>Number(value)===h));
    assert.match(diagramAt(q,'6-design-rate').alt,/全工程でのバグ総件数（予測値）/);
    assert.match(diagramAt(q,'6-manufacture-rate').alt,/全工程でのバグ総件数（実績値）/);
    assert.ok(Number(manufacture.rows[1][2])>columns[1][2]+columns[1][3]);
    assert.match(q.explanation,new RegExp(f+'％'));
  }
});
test('問7の事業分析の全択を、資産・5要因・3利益率の実際のデータで検査する',()=>{
  for(const q of cases(7)){
    const swot=tableAt(q,1), income=tableAt(q,2);
    unique(q,0,review.business.strengths);
    const asset=swot.rows[1][1].split('\n').find(row=>row.includes('ブランド'))?.[0];
    assert.ok(asset);
    unique(q,1,bank(q,1).map(value=>value===asset));
    const diagram=diagramAt(q,'7-forces').alt, options=bank(q,2);
    options.forEach((item,i)=>assert.match(item,review.business.bank[i]));
    unique(q,2,options.map((_,i)=>i===(diagram.includes('参入が容易')?7:6)));
    unique(q,3,options.map((_,i)=>i===(diagram.includes('売り手の交渉力が強い')?2:3)));
    unique(q,4,options.map((_,i)=>i===(diagram.includes('代替製品は多数ある')?0:1)));
    const [target,...others]=income.rows.map(row=>row.slice(1).map(Number));
    const rank=target.slice(1).map((value,i)=>others.every(row=>value*row[0]>row[i+1]*target[0])?'H':
      others.every(row=>value*row[0]<row[i+1]*target[0])?'L':'M').join('');
    const truth=review.business.rankLabels.map(pattern=>pattern===rank);
    assert.equal(truth[4],false);assert.equal(truth[5],false);
    unique(q,5,truth);
    assert.match(paragraphs(q),/清涼飲料事業や加工食品事業の強みを健康飲料事業に横展開/);
    unique(q,6,review.business.transfer);
  }
});
function traceByStack(values:readonly number[]){
  const pending:[number,number,boolean][]=[[0,values.length,false]], states:number[][]=[];
  while(pending.length){
    const [lo,hi,visited]=pending.pop()!;
    if(hi-lo<=1)continue;
    if(visited){states.push(values.slice(lo,hi).sort((a,b)=>a-b));continue;}
    const split=lo+Math.floor((hi-lo)/2);
    pending.push([lo,hi,true],[split,hi,false],[lo,split,false]);
  }
  return states;
}
function compareOp(left:number,op:string,right:number){
  if(op==='＞')return left>right;
  if(op==='≧')return left>=right;
  if(op==='＜')return left<right;
  if(op==='≦')return left<=right;
  throw Error('未知の比較演算子');
}
function condition(text:string,i:number,j:number,num1:number,num2:number){
  if(text.includes('i+j')){
    const op=text.match(/[＜≦＞≧]/)![0];
    return compareOp(i+j,op,num1+num2);
  }
  const operands:Record<string,number>={i,j,num1,num2};
  const [first,second]=[...text.matchAll(/\((i|j) ＜ (num[12])\)/g)].map(match=>operands[match[1]]<operands[match[2]]);
  return text.includes(' and ')?first&&second:first||second;
}
test('問8の停止条件・分割添字・比較ループ・αの履歴を全選択肢で検算する',()=>{
  for(const q of cases(8)){
    unique(q,0,bank(q,0).map(option=>{
      const [,op,value]=/^num ([≧＞]) (\d)$/.exec(option)!;
      return [1,2,3,4,5,6,7,8].every(n=>compareOp(n,op,Number(value))===(n>1));
    }));
    unique(q,1,bank(q,1).map(option=>[2,3,4,5,6,7,8].every(num=>{
      const num1=Math.floor(num/2),num2=num-num1, offset=/^list\[(?:(num[12]?)\+)?i\]$/.exec(option)?.[1];
      const start=offset==='num'?num:offset==='num1'?num1:offset==='num2'?num2:0;
      return Array.from({length:num2},(_,i)=>i).every(i=>start+i===num1+i);
    })));
    unique(q,2,bank(q,2).map(option=>{
      for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let i=0;i<=a;i++)for(let j=0;j<=b;j++)
        if(condition(option,i,j,a,b)!==(i<a&&j<b))return false;
      return true;
    }));
    const input=Array.from(paragraphs(q).matchAll(/配列listのデータ：([\d, ]+)/g),match=>match[1].split(',').map(Number));
    assert.equal(input.length,2);
    const expected=traceByStack(input[1]).map(group=>group.join(',')).join(' → ');
    unique(q,3,bank(q,3).map(value=>value===expected));
    assert.ok(diagramAt(q,'8-tree').alt.includes('最後に配列list ［'+[...input[0]].sort((a,b)=>a-b).join('，')+'］'));
    assert.match(paragraphs(q),/添字は0から始まる/);
    assert.equal(q.contexts?.[0].blocks.length,2);
  }
  for(let n=1;n<=6;n++)for(let state=0;state<3**n;state++){
    const input=state.toString(3).padStart(n,'0').split('').map(Number), actual:number[][]=[];
    assert.deepEqual(sortTrace(input,actual),[...input].sort((a,b)=>a-b));
    assert.deepEqual(actual,traceByStack(input));
  }
});
test('問8のβの4候補を、両側終了・片側終了と不均等長の全状態で照合する',()=>{
  for(const q of cases(8)){
    const truths=bank(q,4).map(option=>{
      const destinations=[...option.matchAll(/list\[([ij](?:\+num[12])?)\] ← slist[12]\[[ij]\]/g)].map(match=>match[1]);
      assert.equal(destinations.length,2);
      let matches=true;
      for(let n1=1;n1<=7;n1++)for(let n2=1;n2<=7;n2++)for(let i=0;i<=n1;i++)for(let j=0;j<=n2;j++){
        if(i<n1&&j<n2)continue;
        const left=Array.from({length:n1},(_,index)=>100+index),right=Array.from({length:n2},(_,index)=>200+index);
        const already=Array.from({length:i+j},(_,index)=>index), expected=[...already,...left.slice(i),...right.slice(j)], actual=[...already];
        let a=i,b=j;
        const address=(expr:string)=>{
          const [key,offset]=expr.split('+'), map:Record<string,number>={i:a,j:b,num1:n1,num2:n2};
          return map[key]+(offset?map[offset]:0);
        };
        while(a<n1){actual[address(destinations[0])]=left[a];a++;}
        while(b<n2){actual[address(destinations[1])]=right[b];b++;}
        if(JSON.stringify(actual)!==JSON.stringify(expected))matches=false;
      }
      return matches;
    });
    unique(q,4,truths);
  }
});
test('疑似言語の全行と継続宣言・空行・α・β・制御線・コード選択肢の枠を保持する',()=>{
  assert.deepEqual(programSheets.map(sheet=>sheet.rows.length),[20,26]);
  assert.deepEqual(programSheets[0].rails.map(rail=>rail.kind),['branch','loop','loop']);
  assert.deepEqual(programSheets[1].rails.map(rail=>rail.kind),['loop','branch','loop','branch']);
  assert.equal(programSheets[0].alpha,17);
  assert.deepEqual(programSheets[1].beta,[16,24]);
  assert.equal(programSheets[0].rows[4].blank,'a');assert.equal(programSheets[0].rows[12].blank,'b');assert.equal(programSheets[1].rows[7].blank,'c');
  assert.equal(programSheets[1].rows[2].align,programSheets[1].rows[3].align);
  assert.ok((programSheets[1].rows[2].align??0)>0);
  assert.ok(optionSheets.every(sheet=>sheet.rows.length===8&&sheet.rails.length===2));
});
test('20図の入力域、読み上げ参照と全80条件のSSRを照合する',()=>{
  assert.equal(figures.length,20);assert.equal(renderers.length,20);
  for(const [i,figure] of figures.entries()){
    assert.equal(renderers[i].profile,figure.profile);
    for(let state=0;state<4;state++){
      const values=[state], html=renderToStaticMarkup(React.createElement(renderers[i].component,{values,caption:'図'}));
      assert.doesNotThrow(()=>figure.validate(values));assert.ok(figure.alt(values).length>15);
      assert.ok(html.includes('diagram-scroll')&&html.includes('aria-description='));
      if(html.includes('<svg')){
        const title=/aria-labelledby="([^"]+)"/.exec(html)?.[1],desc=/aria-describedby="([^"]+)"/.exec(html)?.[1];
        assert.ok(title&&desc&&html.includes('<title id="'+title+'"')&&html.includes('<desc id="'+desc+'"'));
      }
      if(drawingIds[i]==='8-programs'){
        assert.equal((html.match(/data-program-line=/g)??[]).length,46);
        assert.equal((html.match(/data-control=/g)??[]).length,7);
      }
    }
    for(const bad of [[],[-1],[4],[NaN],Array(1)])assert.throws(()=>figure.validate(bad));
  }
});
