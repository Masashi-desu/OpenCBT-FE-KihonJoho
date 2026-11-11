import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { spring2015Pm09To13Specs as specs } from '../../../scripts/legacy-2015-spring-pm-09-13-specs';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2015SpringPm0913Figures } from '../../../src/core/generators/legacy-2015-spring-pm-09-13-figures';
import { legacy2015SpringPm0913FigureRenderers } from '../../../src/ui/Legacy2015SpringPm0913Figures';
import { attendanceCandidate, attendanceExpected, caslTrace, cipherReference, compileCipher, encoderExpected, factorial,
  gregorianDay, javaCheck, temporary } from '../../fixtures/legacy-2015-spring-pm-09-13-reference';

const count = (number:number) => specs[number-9].definition.fields[0].maximum+1;
const original = (number:number) => specs[number-9].original;
const body = (number:number,index:number) => specs[number-9].definition.build([index]);
const choices = (value:GeneratedBody,field:number) => value.answerParts![field].choiceIds.map(id=>{
  const option=value.choices[Number(id.replace('choice-value-',''))-1][0];
  assert(option.type==='code'||option.type==='paragraph');
  return option.text;
});
const selected = (value:GeneratedBody,field:number) => {
  const answer=value.partAnswers![field];
  assert(answer.kind==='choice');
  return value.answerParts![field].choiceIds.indexOf(answer.choiceId);
};
const correct = (value:GeneratedBody) => value.answerParts!.map((_,field)=>choices(value,field)[selected(value,field)]);
function compareField(value:GeneratedBody,field:number,predicate:(candidate:string)=>boolean) {
  const offered=choices(value,field);
  assert.deepEqual(offered.filter(predicate),[offered[selected(value,field)]], 'field '+field);
}
const programs = (value:GeneratedBody,language:string) =>
  value.prompt.flatMap(block=>block.type==='code' && block.language===language ? [block.text] : []);
const text = (value:GeneratedBody) => value.prompt.flatMap(block=>'text' in block ? [block.text] : []).join('\n');
const diagram = (value:GeneratedBody,suffix:string) => {
  const block=value.prompt.find(block=>block.type==='diagram' && block.scene.kind==='source_figure' && block.scene.profile.endsWith(suffix));
  assert(block?.type==='diagram');
  return block.alt;
};

const official = [
  {number:9,pages:[42,43,44,45,46],keys:'キエエエイカ',sizes:[10,10,5,5,5,6],references:[]},
  {number:10,pages:[47,48,49,50,51],keys:'オイイエオイ',sizes:[5,5,4,4,5,5],references:[]},
  {number:11,pages:[52,53,54,55,56],keys:'ウイウアイウ',sizes:[4,4,4,4,4,5],references:[]},
  {number:12,pages:[57,58,59,60],keys:'エオウエオウ',sizes:[5,5,6,5,5,5],references:[69,70,71,72,73,74]},
  {number:13,pages:[61,62,63,64,65,66],keys:'エオイエウエ',sizes:[6,6,2,6,8,7],references:[2,4,5,75,76,77,78,79,80]},
];
const fixed = (pages:number[]) => pages.map(page=>'asset-ipa-2015h27h-fe-pm-p'+String(page).padStart(3,'0')+(page===71?'-casl-excerpt':''));
test('2015春 午後問9〜13の25頁・公式30欄・全40条件・参照の境界を照合する',()=>{
  for(const [i,spec] of specs.entries()){
    const expected=official[i];
    const {number,definition,original,originalPageAlt}=spec;
    assert.equal(number,expected.number);
    assert.deepEqual(spec.pages,expected.pages);
    assert.deepEqual(Object.keys(originalPageAlt).map(Number),expected.pages);
    assert(expected.pages.every(page=>originalPageAlt[page].length>=100 && originalPageAlt[page].length<=2000));
    assert.deepEqual(definition.reference,[0]);
    assert.equal(count(number),8);
    assert.equal(original.partAnswers!.map((_,field)=>'アイウエオカキクケコ'[selected(original,field)]).join(''),expected.keys);
    assert.deepEqual(definition.fixedReferenceAssetIds??[],fixed(expected.references));
    const seenPrompt=new Set(),seenCorrect=new Set();
    for(let index=0;index<count(number);index++){
      const generated=body(number,index);
      seenPrompt.add(JSON.stringify(generated.prompt));
      seenCorrect.add(JSON.stringify(correct(generated)));
      assert.deepEqual(generated.answerParts!.map(part=>part.choiceIds.length),expected.sizes);
      assert.deepEqual(generated.answerParts!.map((_,field)=>new Set(choices(generated,field)).size),expected.sizes);
      const materials=generated.contexts?.flatMap(context=>context.blocks.flatMap(block=>block.type==='image'?[block.assetId]:[]))??[];
      assert.deepEqual(materials,fixed(expected.references));
      assert.ok(materials.every(asset=>!/(p067|p068|p071$)/.test(asset)));
    }
    assert.equal(seenPrompt.size,8);
    assert(seenCorrect.size>=2,'meaningful correct answer variation '+number);
    for(const invalid of [[],[8],[-1],[.5],Array(1),[0,1]])assert.throws(()=>definition.build(invalid));
  }
  assert.deepEqual(original(9).answerParts![0].choiceIds,original(9).answerParts![1].choiceIds);
  assert.deepEqual(original(10).answerParts![4].choiceIds,original(10).answerParts![5].choiceIds);
  assert.match(original(11).contexts![0].title,/編集資料/);
  assert.match(specs[4].originalPageAlt[64],/行の位置として0が指定された場合には，null/);
  assert.match(text(original(13)),/行の位置として0が指定された場合には，null/);
  const correction=original(13).contexts![0].blocks[0];
  assert(correction.type==='paragraph');
  assert.match(correction.text,/行の位置として0/);
});

test('2015春 問9の全条件・全選択肢を逆引きと表示Cコードで検算する',()=>temporary('s3-008-c-',directory=>{
  const table=diagram(original(9),'cipher-table').split('\n')
    .filter(line=>/^[0-4]｜/.test(line)).map(row=>row.split('｜').slice(1).join('').replaceAll('△',' '));
  assert.equal(new Set(table.join('')).size,65);
  const run=compileCipher(directory,programs(original(9),'c')[0],table);
  const alternatives=['','()-','--a','aZ','Aa','Fn','uu','zz','0123,','F-E*E=X','  ','Az.','nnn'];
  for(const input of alternatives)assert.equal(run(input),cipherReference(input,table).result,input);
  for(let index=0;index<count(9);index++){
    const generated=body(9,index);
    assert.deepEqual(programs(generated,'c'),programs(original(9),'c'));
    const plain=diagram(generated,'cipher-table').split('\n').find(line=>line.startsWith('平文｜'))!
      .split('｜').slice(1).join('').replaceAll('△',' ');
    const word=/平文“([^”]+)”を暗号文/.exec(text(generated))![1];
    const reference=cipherReference(plain,table);
    const [first,,,,fifth,sixth]=reference.traces;
    const asChoice=(value:string)=>value===' '?'空白文字':"'" + value + "'";
    const known=[String(first.first[1]),String(first.first[0]),asChoice(first.secondOutput),
      asChoice(fifth.secondOutput),String(sixth.indices[1]),cipherReference(word,table).result];
    assert.deepEqual(known,correct(generated));
    known.forEach((expected,field)=>compareField(generated,field,value=>value===expected));
    assert.equal(run(plain),reference.result);
    assert.equal(run(word),known[5]);
    assert.match(text(generated),new RegExp('str\\['+fifth.indices[1]+'\\]'));
    assert(diagram(generated,'cipher-trace').includes('cp｜[a]｜'+first.second[1]));
    assert(diagram(generated,'cipher-trace').includes('rp｜[b]｜'+first.second[0]));
  }
}));

test('2015春 問10の全候補を日索引・集団項目・深夜集計の独立モデルで検算する',()=>{
  for(let index=0;index<count(10);index++){
    const generated=body(10,index);
    const cobol=programs(generated,'cobol').join('\n');
    const width=Number(/LOG-DATE\s+PIC 9\((\d+)\)/.exec(cobol)![1]);
    const change=diagram(generated,'attendance-change');
    const cutoff=Number(/NIGHT-TIME PIC 9\(4\) VALUE (\d+)\./.exec(change)![1]);
    assert.match(diagram(generated,'attendance-input'),new RegExp('^日付.*\n'+width+'桁'));
    assert.match(text(generated),new RegExp('C社では'+cutoff/100+'時以降'));
    const shifts:[[number,string,number,number],...[number,string,number,number][]]=[
      [1,'A00001',900,cutoff],[3,'A00001',830,2400],[31,'A00001',645,2350],
      [1,'A00002',1200,1300],[31,'A00002',1300,2400],
    ];
    assert.equal(attendanceExpected(shifts,cutoff).length,2);
    for(let field=0;field<6;field++) compareField(generated,field,candidate=>attendanceCandidate(field,candidate,width,cutoff,shifts));
    assert.match(change,/MOVE \[d\] TO ATD-NIGHTSUM/);
    assert.match(cobol,/REWRITE ATD-REC[\s\S]*WRITE ATD-REC/);
  }
});

test('2015春 問11のJava8原コード・全候補と全入力を別の文字分類で検算する',()=>temporary('s3-008-java-',directory=>{
  const baseline=original(11);
  const code=programs(baseline,'java');
  assert.equal(code.length,6);
  const classes=[code[0]+'\n'+code[1],code[2],code[3]+'\n'+code[4],code[5]];
  const inputs:(string|null)[]=[null,'','I aAz019','<>&"', "A A''ああ", '\u0000\u00ff\u0100\uffff','[]\\{}!?'];
  for(let index=0;index<count(11);index++){
    const generated=body(11,index);
    const generatedPrograms=programs(generated,'java');
    assert.deepEqual(generatedPrograms.slice(0,-1),code.slice(0,-1));
    const tester=generatedPrograms.at(-1)!;
    const literal=/\.encode\(("[^"\n]*")\)/.exec(tester)![1];
    const input=JSON.parse(literal) as string;
    inputs.push(input);
    const hits=encoderExpected(input).split('\t')[0];
    compareField(generated,5,candidate=>candidate===hits);
  }
  const correctBase=correct(baseline);
  assert(javaCheck(directory,classes,correctBase,inputs));
  for(let field=0;field<5;field++)compareField(baseline,field,candidate=>
    javaCheck(directory,classes,correctBase.map((expected,i)=>i===field?candidate:expected),inputs));
}));

test('2015春 問12のCASL命令候補をスタックと16ビットレジスタで全件検算する',()=>{
  const baseline=original(12);
  const source=programs(baseline,'casl2').join('\n');
  const key=correct(baseline);
  const withAnswers=(answers:string[])=>source.replace(/\[([abc])\]/g,(_,slot:string)=>answers[slot.charCodeAt(0)-97]);
  function validates(program:string){
    for(let n=0;n<=8;n++){
      if(caslTrace(program,'FACT',n).value!==factorial(n) || caslTrace(program,'FACT2',n).value!==factorial(n))return false;
    }
    for(const [a,b] of [[0,0xffff],[1,0xffff],[15,4369],[73,411],[511,99],[1,0x8000],[19,0]]){
      if(caslTrace(program,'MULT',a,b).value!==a*b)return false;
    }
    return true;
  }
  assert(validates(withAnswers(key)));
  for(let field=0;field<3;field++)compareField(baseline,field,candidate=>{
    try{return validates(withAnswers(key.map((answer,i)=>i===field?candidate:answer)));}catch{return false;}
  });
  for(let index=0;index<count(12);index++){
    const generated=body(12,index), prompt=text(generated);
    assert.equal(programs(generated,'casl2').join('\n'),source);
    const iterative=Number(/FACTを使用してF\((\d+)\)/.exec(prompt)![1]);
    const recursive=Number(/FACT2を使用してF\((\d+)\)/.exec(prompt)![1]);
    const step=/行番号11の命令を(初めて|([234])回目に)/.exec(prompt)!;
    const visit=step[2]?Number(step[2]):1;
    const [end,push]=[caslTrace(withAnswers(key),'FACT',iterative),caslTrace(withAnswers(key),'FACT2',recursive)];
    assert.equal(end.value,factorial(iterative));
    assert.equal(push.value,factorial(recursive));
    const stack=push.pushes[visit-1];
    const values=[String(end.beforeRpop),'B - '+(-stack.sp),String(stack.value)];
    values.forEach((answer,i)=>compareField(generated,i+3,candidate=>candidate===answer));
  }
});

function checkSheetJudgment(candidate:string,start:string,end:string|null,standard:number){
  if(end===null)return candidate.startsWith('null,')?null:'empty-result';
  if(!candidate.startsWith('null,'))return null;
  const offset=candidate.includes('＋1')?1:candidate.includes('－1')?-1:0;
  return gregorianDay(end)-gregorianDay(start)+offset<=standard?'○':'△';
}

const units=[100,200,300];
const itemIds=[101,102,201,202,301,302];
const histories=Array.from({length:4},(_,completed)=>[0,1].flatMap(prefix=>
  [false,true].flatMap(started=>Array.from({length:8},(_,policies)=>({
    completed,
    order:units.map((_,u)=>Boolean(policies & 1<<u)?'任意':'順次'),
    items:itemIds.map((_,i)=>{
      const unit=Math.floor(i/2), offset=i%2;
      const done=unit<completed || unit===completed && offset<prefix;
      return {start:done || started && unit===completed && offset===prefix,done};
    }),
  }))))).flat();

function eligibility(candidates:string[],position:number,state:typeof histories[number]){
  const [b,c,d]=candidates;
  const current=itemIds[position],currentUnit=Math.floor(current/100);
  const previous=itemIds[position-1];
  const argument=b.includes('(I2,')?previous:current;
  const displacement=b.endsWith('－1')?-1:b.endsWith('＋1')?1:0;
  const matched=units.indexOf(Math.floor(argument/100)*100)+1+displacement;
  const lookedUp = matched===0 ? null : matched<=state.completed?'完了日':null;
  const byUnit=currentUnit===1||lookedUp!==null;
  const cell=d.slice(0,2);
  const written=cell==='L3'?state.items[position].start:state.items[cell==='M2'?position-1:position].done;
  const byItem=state.order[currentUnit-1]===c.slice(1,-1) || current%100===1 || (d.includes('≠')?written:!written);
  return byUnit && byItem;
}

function eligibleByPrior(position:number,state:typeof histories[number]){
  const id=itemIds[position], unit=Math.floor(id/100)-1;
  const earlierUnits=units.slice(0,unit);
  return earlierUnits.every((_,i)=>i<state.completed) &&
    (state.order[unit]==='任意' || itemIds.slice(0,position).every((before,i)=>
      Math.floor(before/100)!==unit+1 || state.items[i].done));
}

test('2015春 問13の全候補を暦日・先行履歴の走査・相対参照で検算する',()=>{
  const macroDates={E:[800,null,802,803],F:[900,901,902,903],L:[1000,1001,null,1003],M:[1100,null,1102,1103]};
  for(let index=0;index<count(13);index++){
    const generated=body(13,index), source=text(generated), answers=correct(generated);
    const offset=source.includes('学習開始日の翌日から')?0:1;
    compareField(generated,0,candidate=>
      [null,'2024-02-28','2024-02-29','2024-03-01'].every(end=>{
        const start='2024-02-28', expected=end===null?null:
          gregorianDay(end)-gregorianDay(start)+offset<=1?'○':'△';
        return checkSheetJudgment(candidate,start,end,1)===expected;
      }));
    for(let field=1;field<=3;field++)compareField(generated,field,candidate=>{
      const tested=answers.slice(1,4).map((answer,i)=>i+1===field?candidate:answer);
      return histories.every(history=>itemIds.slice(1).every((_,i)=>eligibility(tested,i+1,history)===eligibleByPrior(i+1,history)));
    });
    compareField(generated,4,candidate=>[true,false].every(allowed=>
      [true,false].every(itemBlank=>[true,false].every(unitBlank=>{
        const stateMatches=candidate.includes("＝'可'")===allowed;
        const isBlank=candidate.includes('E2')?unitBlank:itemBlank;
        return (stateMatches&&(candidate.includes('≠null')?!isBlank:isBlank))===(allowed&&itemBlank);
      }))));
    compareField(generated,5,candidate=>{
      const column=/表引き\(([EFLM])2/.exec(candidate)![1] as keyof typeof macroDates;
      const useItem=candidate.includes('ItemRow');
      const itemRow=3,unitRow=2,today=1200;
      const dates=structuredClone(macroDates);
      dates.L[itemRow-1]=today;
      return dates[column][(useItem?itemRow:unitRow)-1]===today;
    });
    const sheet=diagram(generated,'unit-sheet').split('\n').filter(row=>/^(2|3)｜/.test(row));
    for(const line of sheet){
      const [,,,,standard,start,finish,flag]=line.split('｜');
      assert.equal(checkSheetJudgment(answers[0],start,finish,Number(standard)),flag);
    }
    const itemSheet=diagram(generated,'item-sheet').split('\n');
    const entry=itemSheet.find(row=>/^2｜/.test(row))!.split('｜').at(-1);
    assert(itemSheet.some(row=>row.split('｜')[1]===entry));
    assert.match(source,/表引き\(\$F\$2～\$F\$13, \[b\], 1\)/);
    assert.match(source,/行の位置として0が指定された場合には，null/);
  }
});

test('2015春 午後問9〜13の8図が可視セル・空欄・列見出しを描画する',()=>{
  assert.equal(legacy2015SpringPm0913Figures.length,8);
  assert.deepEqual(legacy2015SpringPm0913FigureRenderers.map(r=>r.profile),legacy2015SpringPm0913Figures.map(r=>r.profile));
  for(const [i,definition] of legacy2015SpringPm0913Figures.entries()){
    const {component}=legacy2015SpringPm0913FigureRenderers[i];
    for(let index=0;index<=definition.domain[0][1];index++){
      const values=[index];
      definition.validate(values);
      const markup=renderToStaticMarkup(createElement(component,{values,caption:'試験資料'}));
      const model=definition.panel(values);
      assert.equal((markup.match(/<table/g)??[]).length,model.tables.length);
      assert.equal((markup.match(/<(?:td|th)(?:\s|>)/g)??[]).length,
        model.tables.reduce((total,table)=>total+(table.headers?.length??0)+table.rows.reduce((sum,row)=>sum+row.length,0),0));
      assert.match(markup,/diagram-scroll/);
      assert.doesNotMatch(markup,/<script/i);
      if(definition.profile.endsWith('item-sheet'))assert.match(markup,/>N<\/th>[\s\S]*>O<\/th>/);
    }
  }
});
