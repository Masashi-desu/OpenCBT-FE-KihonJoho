import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {autumn2008Pm06To09Specs as specs} from '../../../scripts/legacy-2008-autumn-pm-06-09-specs';
import {legacy2008AutumnPm0609Figures as figures} from '../../../src/core/generators/legacy-2008-autumn-pm-06-09-figures';
import {legacy2008AutumnPm0609FigureRenderers as renderers} from '../../../src/ui/Legacy2008AutumnPm0609Figures';
import {compoundAnswerSignature,gradeAnswer,validateAnswerDefinition} from '../../../src/core/answers';
import type {GeneratedBody} from '../../../src/core/generators/definition';
import type {Attribution,Block,Question} from '../../../src/core/types';
import {maskFromBits,runCasl} from '../../fixtures/legacy-2008-autumn-pm-06-09-oracle';

const cases=[0,1,2,3];
const keys=['オオエ','イウウア','イウクイ','ウオアカ'];
const widths=[[5,6,4],[6,6,4,5],[8,8,8,4],[5,5,5,6]];
const pageStarts=[24,27,31,35,38];
const text=(body:GeneratedBody)=>body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
const programs=(body:GeneratedBody,language:string)=>body.prompt.flatMap(block=>block.type==='code'&&block.language===language?[block.text]:[]);
const bodyAt=(major:number,index:number)=>specs[major-6].definition.build([index]);
function bank(body:GeneratedBody,slot:number) {
  return body.answerParts![slot].choiceIds.map(id=>{
    const block=body.choices[Number(id.split('-').at(-1))-1][0];
    assert.ok(block.type==='code'||block.type==='paragraph');
    return block.text;
  });
}
function choice(body:GeneratedBody,slot:number) {
  const answer=body.partAnswers![slot];
  assert.equal(answer.kind,'choice');
  return body.answerParts![slot].choiceIds.indexOf(answer.choiceId);
}
const filled=(body:GeneratedBody,slot:number)=>bank(body,slot)[choice(body,slot)];
function unique(body:GeneratedBody,slot:number,condition:(value:string,i:number)=>boolean) {
  assert.deepEqual(bank(body,slot).flatMap((value,i)=>condition(value,i)?[i]:[]),[choice(body,slot)],'解答欄 '+body.answerParts![slot].label);
}
function drawing(body:GeneratedBody,suffix:string) {
  const block=body.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+suffix));
  assert.ok(block?.type==='diagram'&&block.scene.kind==='source_figure');
  return block;
}
function substitute(code:string,answers:readonly string[]) {
  return code.replaceAll(/［([a-d])］/g,(_,mark)=>answers[mark.charCodeAt(0)-97]??'［'+mark+'］');
}
function processOutput(cmd:string,args:string[],cwd:string) {
  const result=spawnSync(cmd,args,{cwd,encoding:'utf8',timeout:30000});
  assert.ifError(result.error);
  assert.equal(result.status,0,cmd+' '+args.join(' ')+'\n'+result.stderr);
  return result.stdout.trimEnd();
}
function inTemp(callback:(folder:string)=>void) {
  const folder=mkdtempSync(join(tmpdir(),'opencbt-2008-autumn-'));
  try {callback(folder);} finally {rmSync(folder,{force:true,recursive:true});}
}

test('公式14ページ・4大問15欄・解答群と必要資料を照合する',()=>{
  assert.equal(specs.length,4);
  specs.forEach((spec,i)=>{
    assert.equal(spec.number,6+i);
    assert.deepEqual(spec.pages,Array.from({length:pageStarts[i+1]-pageStarts[i]},(_,page)=>pageStarts[i]+page));
    assert.equal(spec.definition.source,'2008h20a-fe-pm-'+spec.number);
    assert.equal(spec.original.answerParts!.map((_,slot)=>'アイウエオカキク'[choice(spec.original,slot)]).join(''),keys[i]);
    assert.deepEqual(spec.original.answerParts!.map(part=>part.choiceIds.length),widths[i]);
    assert.ok(Object.values(spec.originalPageAlt).every(alt=>[...alt].length>100&&[...alt].length<=2000));
  });
  assert.equal(specs.reduce((sum,spec)=>sum+spec.original.answerParts!.length,0),15);
  assert.match(specs[0].originalPageAlt[24],/^次の問6から問9まで.*はじめの1問/);
  assert.match(specs[1].originalPageAlt[29],/27 {10}READ COPY-FILE.*\n28 {25}NOT AT END/s);
  assert.match(specs[2].originalPageAlt[32],/book =\n +new HashMap/);
  assert.equal(specs[2].original.answerParts!.at(-1)?.label,'設問2');
  assert.deepEqual(specs[2].definition.fixedReferenceAssetIds,['060','061','062'].map(page=>'asset-ipa-2008h20a-fe-pm-page-'+page));
  assert.deepEqual(specs[3].definition.fixedReferenceAssetIds,['064','065','066-casl-excerpt','067','068','069'].map(page=>'asset-ipa-2008h20a-fe-pm-page-'+page));
  assert.match(specs[3].originalPageAlt[37],/15＞B1≧B2＞0/);
  for(const spec of specs) {
    assert.deepEqual(spec.original.contexts?.flatMap(context=>context.blocks.map(block=>block.type==='image'&&block.assetId))??[],
      spec.definition.fixedReferenceAssetIds??[]);
  }
});

test('全16条件で生成・採点が安定し、各大問の可視正答が4種類になる',()=>{
  const attribution:Attribution={origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex']};
  for(const {definition} of specs) {
    assert.deepEqual(definition.reference,[0]);
    assert.deepEqual(definition.fields.map(field=>[field.minimum,field.maximum]),[[0,3]]);
    assert.equal(definition.answerVariation,undefined);
    for(const bad of [[],[-1],[4],[.5],[NaN],[1,2],Array(1),Object.assign([0],{extra:true})])
      assert.throws(()=>definition.build(bad));
    const signatures=new Set<string>(), visible=new Set<string>(), prompts=new Set<string>();
    for(const index of cases) {
      const body=definition.build([index]);
      assert.deepEqual(definition.build([index]),body);
      const q={id:definition.source,answerParts:body.answerParts,correctAnswer:{parts:body.partAnswers,attribution},
        choices:body.choices.map((blocks,i)=>({id:'choice-value-'+(i+1),content:{blocks,attribution}}))} as Question;
      validateAnswerDefinition(q);
      signatures.add(compoundAnswerSignature(q));
      visible.add(JSON.stringify(body.answerParts!.map((_,slot)=>filled(body,slot))));
      prompts.add(JSON.stringify(body.prompt.map(block=>block.type==='diagram'?[block.type,block.alt]:block)));
      const selected=Object.fromEntries(body.partAnswers!.flatMap(answer=>answer.kind==='choice'?[[answer.partId,answer.choiceId]]:[]));
      assert.equal(gradeAnswer(q,{selectedPartChoices:selected}).outcome,'correct');
      body.answerParts!.forEach((part,slot)=>{
        assert.equal(new Set(bank(body,slot)).size,part.choiceIds.length);
        for(const wrong of part.choiceIds.filter(id=>id!==selected[part.id])) {
          assert.equal(gradeAnswer(q,{selectedPartChoices:{...selected,[part.id]:wrong}}).outcome,'incorrect');
        }
      });
    }
    assert.equal(signatures.size,4);
    assert.equal(visible.size,4);
    assert.equal(prompts.size,4);
  }
});

const cCases=[
  {radix:10,group:3,separator:','},{radix:8,group:3,separator:'_'},{radix:16,group:3,separator:':'},{radix:10,group:4,separator:'_'},
] as const;
function externalFormat(value:number,radix:number,group:number,separator:string) {
  const decimal=Math.abs(value).toString(radix).toUpperCase();
  return (value<0?'-':'')+decimal.replace(new RegExp('(?<=.)(?=(.{'+group+'})+$)','g'),separator);
}
test('C問6の表示コードを4条件でコンパイルし、全選択肢を独立に判定する',()=>inTemp(folder=>{
  for(const [index,{radix,group,separator}] of cCases.entries()) {
    const body=bodyAt(6,index), source=programs(body,'c').find(code=>code.includes('do{'));
    assert.ok(source);
    const table=body.prompt.find(block=>block.type==='table');
    assert.equal(table?.type,'table');
    assert.match(text(body),/十分な領域が確保.*9けた以下/);
    assert.match(source,/str\[j--\] = '\\0';/);
    const boundary=radix**group;
    const values=[0,1,-1,radix-1,radix,radix+1,boundary-1,boundary,boundary+1,-boundary-1,
      100100001,-999999999,...table.rows.map(row=>Number(row[0]))];
    const fromTable=table.rows.map(([value,result])=>[Number(value),result]);
    for(const [value,result] of fromTable) assert.equal(result,externalFormat(Number(value),radix,group,separator));
    const correct=body.answerParts!.map((_,slot)=>filled(body,slot));
    const header='#include <stdio.h>\n#include <stdlib.h>\n';
    const driver='\nint main(int argc, char **argv){\n  for(int i=1;i<argc;i++){char text[64]; convert(strtol(argv[i],NULL,10),text); puts(text);}\n  return 0;\n}\n';
    const name='convert-'+index;
    writeFileSync(join(folder,name+'.c'),header+substitute(source,correct)+driver);
    processOutput('cc',['-std=c11','-Wall','-Wextra','-Werror',name+'.c','-o',name],folder);
    const output=processOutput(join(folder,name),values.map(String),folder).split('\n');
    assert.deepEqual(output,values.map(value=>externalFormat(value,radix,group,separator)));
    const operation:Record<string,(value:number)=>number>={
      ['%= '+radix]:value=>value%radix,'*= -1':value=>-value,['*= -'+radix]:value=>-radix*value,
      ['*= '+radix]:value=>radix*value,['/= '+radix]:value=>Math.floor(value/radix),
    };
    unique(body,0,candidate=>values.every(value=>{
      const n=Math.abs(value), expected=Number.parseInt(n.toString(radix).slice(0,-1)||'0',radix);
      return operation[candidate](n)===expected;
    }));
    unique(body,1,candidate=>[1,2,3,4,5,6,7,8,9].every(length=>{
      const expression=/^(?:\(([ij]) \+ (\d)\)|([ij])) % (\d)$/.exec(candidate);
      assert.ok(expression);
      const name=expression[1]??expression[3],offset=Number(expression[2]??0),divisor=Number(expression[4]);
      const expected=Array.from({length:Math.floor((length-1)/group)},(_,i)=>(i+1)*group);
      const positions:number[]=[];
      for(let digit=1,stored=0;digit<=length;digit++) {
        stored++;
        if(digit<length&&((name==='i'?digit:stored)+offset)%divisor===0){positions.push(digit);stored++;}
      }
      return JSON.stringify(expected)===JSON.stringify(positions);
    }));
    unique(body,2,candidate=>[1,2,3,4,6,9].every(length=>{
      const items=Array.from({length},(_,i)=>i);
      const unequal=candidate.includes('!='), retreat=candidate.includes('j--');
      let left=0,right=length-1;
      for(let steps=0;unequal?left!==right:left<right;steps++){
        if(left>=length||right<0||steps>=length) return false;
        [items[left],items[right]]=[items[right],items[left]];
        left++;
        if(retreat)right--;
      }
      return items.every((value,i)=>value===length-i-1);
    }));
  }
}));

const copyOracles=[
  {unit:100,limit:50,maximum:3000,bars:[12,8,7,17,5],warnings:[false,true,false,true,false]},
  {unit:200,limit:60,maximum:6000,bars:[12,8,7,17,5],warnings:[false,false,true,false,false]},
  {unit:125,limit:40,maximum:3750,bars:[13,9,7,17,5],warnings:[true,true,false,false,true]},
  {unit:250,limit:70,maximum:7500,bars:[13,9,7,18,5],warnings:[false,true,true,false,false]},
];
test('COBOL問7をレコード・整数桁・集計位置・割合の別計算で全候補検算する',()=>{
  const records=[
    {dept:1,paper:1,both:1},{dept:1,paper:200,both:0},{dept:2,paper:90,both:1},{dept:1,paper:150,both:1},{dept:3,paper:0,both:0},
  ];
  const totals=Array.from({length:5},(_,i)=>records.filter(record=>record.dept===i+1).map(record=>record.paper).reduce((a,b)=>a+b,0));
  const both=Array.from({length:5},(_,i)=>records.filter(record=>record.dept===i+1&&record.both).map(record=>record.paper).reduce((a,b)=>a+b,0));
  for(const [index,{unit,limit,maximum,bars,warnings}] of copyOracles.entries()) {
    const body=bodyAt(7,index),[declaration,procedure]=programs(body,'cobol');
    const lines=(declaration+'\n'+procedure).split('\n');
    assert.deepEqual(lines.map(line=>Number(line.trimStart().split(/\s+/,1)[0])),Array.from({length:45},(_,i)=>i+1));
    assert.match(text(body),new RegExp(maximum.toLocaleString('en-US')+'枚以下'));
    assert.match(text(body),new RegExp(unit+'枚に満たない分は切り上げる'));
    assert.match(drawing(body,'7-changes').alt,new RegExp('BOTH-RATE >= '+limit+' THEN'));
    const chart=drawing(body,'7-output').alt.split('\n'), marked=drawing(body,'7-marked').alt.split('\n');
    assert.equal(chart[0],marked[0]);
    assert.ok(chart[0].endsWith('(x'+(unit*10)+')'));
    assert.deepEqual(chart.slice(1).map(line=>(line.match(/\*/g)??[]).length),bars);
    assert.deepEqual(marked.slice(1).map(line=>line.endsWith('(!)')),warnings);
    unique(body,0,candidate=>{
      if(!/^(ADD|MOVE) (1|CP-CNT) TO DEPT-TOTAL\(CP-DEPT\)$/.test(candidate))return false;
      const trial=Array<number>(5).fill(0);
      for(const record of records) {
        const value=candidate.includes(' 1 ')?1:record.paper;
        const prior=candidate.startsWith('ADD')?trial[record.dept-1]:0;
        trial[record.dept-1]=prior+value;
      }
      return trial.every((value,i)=>value===totals[i]);
    });
    unique(body,1,candidate=>[1,unit-1,unit,unit+1,2*unit,maximum].every(total=>{
      let desired=0;
      while(desired*unit<total)desired++;
      if(candidate.startsWith('MOVE DEPT-TOTAL'))return total%100===desired;
      const expression=/^COMPUTE MARK-CNT = (?:\(DEPT-TOTAL\(DEPT-CNT\) \+ (\d+)\)|DEPT-TOTAL\(DEPT-CNT\)) \/ (\d+)$/.exec(candidate);
      return !!expression&&Math.trunc((total+Number(expression[1]??0))/Number(expression[2]))===desired;
    }));
    unique(body,2,candidate=>{
      const line=Number(/行番号(\d+)/.exec(candidate)?.[1]), observed=Array<number>(5).fill(0);
      const validRecords=line===35?records:[]; // EOF, close, and header occur after record processing.
      for(const record of validRecords) if(record.both) observed[record.dept-1]+=record.paper;
      return observed.every((value,i)=>value===both[i]);
    });
    unique(body,3,candidate=>[[350,0],[400,200],[350,350],[200,Math.floor(2*limit)-1],[200,2*limit]].every(([total,double])=>{
      const desired=Array.from({length:101},(_,percent)=>percent).filter(percent=>percent*total<=double*100).at(-1);
      if(candidate.startsWith('MOVE DEPT-BOTH')) return double%1000===desired;
      if(candidate.startsWith('COMPUTE BOTH-RATE')) {
        const divisor=candidate.includes('/ DEPT-TOTAL')?total:100;
        const scaled=candidate.includes('* 100')?double*100:double;
        return Math.trunc(scaled/divisor)===desired;
      }
      return false; // MARK-CNT is a different field.
    }));
  }
});

const queries=['names','numbers','namesByNumber','numbersByName'];
const queryOptions=[
  /電話番号のうち.*始まるすべての電話番号/,
  /名前のうち.*始まるすべての名前/,
  /始まる電話番号に対応付けられたすべての名前/,
  /始まる名前に対応付けられたすべての電話番号/,
];
const entries=[['Alfa','140'],['Alfa','261'],['Alton','412'],['Alton','142'],['Bert','149'],['Bert','222'],['Bea','013']];
function queryOracle(index:number,prefix:string) {
  const nameTest=index===0||index===3;
  const returnName=index===0||index===2;
  const matching=entries.filter(entry=>entry[nameTest?0:1].slice(0,prefix.length)===prefix);
  return '['+[...new Set(matching.map(entry=>entry[returnName?0:1]))].sort().join(', ')+']';
}
test('Java問8をJDKでコンパイル・実行し、集合操作と検索結果・全解答候補を照合する',()=>inTemp(folder=>{
  for(const index of cases) {
    const body=bodyAt(8,index),code=programs(body,'java');
    const source=code.find(value=>value.startsWith('import java.util.Set'))!, tester=code.find(value=>value.startsWith('public class PhoneBookTester'))!;
    assert.ok(source&&tester);
    assert.match(source,/book =\n +new HashMap/);
    const method=drawing(body,'8-method').alt, observed=drawing(body,'8-result').alt;
    const working=join(folder,'case-'+index);mkdirSync(working);
    const selected=[0,1,2].map(slot=>filled(body,slot));
    const complete=substitute(source,selected);
    writeFileSync(join(working,'PhoneBook.java'),complete.slice(0,complete.lastIndexOf('}'))+
      method.split('\n').map(line=>'   '+line).join('\n')+'\n}');
    writeFileSync(join(working,'PhoneBookTester.java'),tester);
    const probe='import java.util.TreeSet;\npublic class Probe {\n'+
      '  static void need(boolean ok) { if (!ok) throw new AssertionError(); }\n'+
      '  public static void main(String[] args) {\n    PhoneBook book = new PhoneBook();\n'+
      entries.map(([name,number])=>'    book.add("'+name+'","'+number+'");').join('\n')+'\n'+
      '    book.add("Alfa","140"); need(book.get("Alfa").size() == 2);\n'+
      '    book.get("Alfa").clear(); need(book.get("Alfa").size() == 2);\n'+
      '    book.remove("Missing","140"); need(book.get("Missing").isEmpty());\n'+
      '    try {book.add(null,"1"); throw new AssertionError();} catch (NullPointerException expected) {}\n'+
      '    try {book.add("B",null); throw new AssertionError();} catch (NullPointerException expected) {}\n'+
      '    for (String invalid : new String[]{"", "1-2", "A#"}) {\n'+
      '      try {book.add("B",invalid); throw new AssertionError();} catch (IllegalArgumentException expected) {}\n'+
      '    }\n'+
      '    for (String prefix : args) System.out.println(new TreeSet<>(book.methodX(prefix)));\n'+
      '    book.remove("Bea","013"); need(!book.book.containsKey("Bea"));\n'+
      '    book.remove("Bert"); need(!book.book.containsKey("Bert"));\n  }\n}\n';
    writeFileSync(join(working,'Probe.java'),probe);
    processOutput('javac',['-encoding','UTF-8','PhoneBook.java','PhoneBookTester.java','Probe.java'],working);
    assert.equal(processOutput('java',['-cp',working,'PhoneBookTester'],working),observed);
    const prefixes=['Al','14','B','4',''];
    const actual=processOutput('java',['-cp',working,'Probe',...prefixes],working).split('\n');
    assert.deepEqual(actual,prefixes.map(prefix=>queryOracle(index,prefix)));
    const corresponding=['numbers','names','namesByNumber','numbersByName'].indexOf(queries[index]);
    unique(body,3,value=>queryOptions[corresponding].test(value));

    if(index!==0) continue; // the same Set/Map signatures and methods appear in all conditions.
    const compatible=[
      /^(?:add|remove)\((?:name|phoneNumber)\)$/,
      /^(?:put\(name, numbers\)|remove\((?:name|phoneNumber)\))$/,
      /^(?:add|remove)\((?:name|phoneNumber)\)$/,
    ];
    const alternatives=compatible.flatMap((rule,slot)=>bank(body,slot).flatMap((value,candidate)=>{
      if(!rule.test(value)) return []; // Other statements lack a compatible typed method.
      const name='Book_'+slot+'_'+candidate, copy=selected.map((answer,i)=>i===slot?value:answer);
      const file=name+'.java';
      writeFileSync(join(working,file),substitute(source,copy).replace('class PhoneBook','class '+name));
      return [{slot,candidate,name,file}];
    }));
    const compare='import java.util.TreeSet;\npublic class AlternativeProbe {\n  public static void main(String[] args) {\n'+
      alternatives.map(({name})=>'    { '+name+' b = new '+name+'(); b.add("N","123"); b.add("N","456"); b.remove("N","123"); '+
        'System.out.println("'+name+'=" + new TreeSet<>(b.get("N"))); }').join('\n')+'\n  }\n}';
    writeFileSync(join(working,'AlternativeProbe.java'),compare);
    processOutput('javac',['-encoding','UTF-8',...alternatives.map(alt=>alt.file),'AlternativeProbe.java'],working);
    const output=processOutput('java',['-cp',working,'AlternativeProbe'],working).split('\n');
    for(let slot=0;slot<3;slot++) unique(body,slot,(_,candidate)=>{
      const name='Book_'+slot+'_'+candidate;
      return output.includes(name+'=[456]');
    });
  }
}));

const caslOracles=[
  {width:1,lower:0,upper:0,inside:0},{width:2,lower:0,upper:0,inside:1},
  {width:3,lower:0,upper:-1,inside:0},{width:4,lower:1,upper:0,inside:1},
];
test('CASL問9の全ビット・全端点で命令を独立実行し、語・GR1復元・全候補を検算する',()=>{
  for(const [index,{width,lower,upper,inside}] of caslOracles.entries()) {
    const body=bodyAt(9,index),source=programs(body,'casl2');
    assert.equal(source.length,4);
    assert.ok(source.every(program=>!/(?:^|\s)(?:IN|OUT)\s|['"]/.test(program)));
    assert.match(text(body),/GR1の内容は元に戻す/);
    const figures=body.prompt.filter((block):block is Extract<Block,{type:'table'}>=>block.type==='table');
    assert.equal(figures.length,2);
    if(index>0) {
      assert.ok(figures[0].rows[2][1].includes('B＋'+(width-1)+'までの'+width+'ビット'));
      assert.match(figures[1].rows[0][1],new RegExp((lower?'B2＋1':'B2')+'以上'+(upper?'B1未満':'B1以下')+'のビットを'+inside));
    }
    const actual=body.answerParts!.map((_,slot)=>filled(body,slot));
    for(let slot=0;slot<3;slot++) {
      unique(body,slot,value=>Array.from({length:slot===2?17-width:16},(_,bit)=>bit).every(bit=>{
        const list=source.map(program=>substitute(program,actual.map((answer,i)=>i===slot?value:answer)));
        const result=runCasl(list,'PTN'+(slot+1),bit);
        const expected=maskFromBits(position=>slot===0?position>=bit:slot===1?position<bit:position>=bit&&position<bit+width);
        return result.gr1===bit&&result.gr2===expected;
      }));
    }
    unique(body,3,value=>{
      const list=source.map(program=>substitute(program,[...actual.slice(0,3),value]));
      for(let first=1;first<15;first++)for(let second=1;second<=first;second++) {
        if(second+lower>first+upper) continue;
        const result=runCasl(list,'PTN4',first,second);
        const expected=maskFromBits(position=>Boolean(position>=second+lower&&position<=first+upper?inside:1-inside));
        if(result.gr1!==first||result.gr2!==expected) return false;
      }
      return true;
    });
  }
});

test('全5図×4条件を管理図の入力・代替表示・字下げと照合する',()=>{
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  const represented=new Set<string>();
  for(const major of [7,8]) for(const index of cases) for(const block of bodyAt(major,index).prompt) {
    if(block.type!=='diagram'||block.scene.kind!=='source_figure') continue;
    const {profile,values}=block.scene,definition=figures.find(figure=>figure.profile===profile), renderer=renderers.find(item=>item.profile===profile);
    assert.ok(definition&&renderer);
    assert.deepEqual(values,[index]);
    assert.equal(definition.alt(values),block.alt);
    definition.validate(values);
    const markup=renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
    assert.match(markup,/aria-description=.*diagram-scroll.*<figcaption>/s);
    if(profile.endsWith('7-changes')) assert.match(markup,/<th[^>]+scope="col"[^>]*>処置.*<pre.*\n/s);
    if(profile.endsWith('8-method')) assert.match(markup,/\n {3}for \(String key : book.keySet\(\)\) \{/);
    represented.add(profile);
  }
  assert.equal(represented.size,5);
});
