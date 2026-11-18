import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2004Pm06To09Specs as specs } from '../../../scripts/legacy-2004-spring-pm-06-09-specs';
import { legacy2004SpringPm0609Figures as figures } from '../../../src/core/generators/legacy-2004-spring-pm-06-09-figures';
import { legacy2004SpringPm0609FigureRenderers as renderers } from '../../../src/ui/Legacy2004SpringPm0609Figures';
import { compileCaslParity, referenceMerge, referenceParity, runCobolMerge, type MergeChoices, type Workbook } from '../../fixtures/legacy-2004-spring-pm-06-09-oracle';

const values=[0,1,2,3];
const admitted=new Map(specs.map(spec=>[spec.number,spec]));
const variants=(n:number)=>values.map(i=>admitted.get(n)!.definition.build([i]));
const text=(body:GeneratedBody)=>body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
function programs(body:GeneratedBody,language:string) {
  return body.prompt.flatMap(block=>block.type==='code'&&block.language===language?[block.text]:[]);
}
function bank(body:GeneratedBody,id:string) {
  const part=body.answerParts?.find(p=>p.id==='part-'+id);
  assert(part);
  const choice=body.partAnswers?.find(a=>a.kind==='choice'&&a.partId===part.id);
  assert(choice?.kind==='choice');
  const options=part.choiceIds.map(id=>{
    const block=body.choices[Number(id.split('-').at(-1))-1][0];
    assert(block.type==='code');
    return block.text;
  });
  assert.equal(new Set(options).size,options.length);
  return {options,key:part.choiceIds.indexOf(choice.choiceId)};
}
function selected(body:GeneratedBody,id:string){
  const {options,key}=bank(body,id);
  return options[key];
}
const highest='アイウエオカキクケコ';
const official: Record<number,string>={7:'イカアウエ',8:'ウアウエ',9:'イエウ'};
const labels: Record<number,string[]>={7:['a','b','c','d','e'],8:['a','b','c','d'],9:['設問1','設問2 a','設問2 b']};
const slots: Record<number,string[]>={7:['a','b','c','d','e'],8:['a','b','c','d'],9:['s','a','b']};

test('公式の原資料、解答欄、固定資料と各4条件を照合する',()=>{
  assert.deepEqual([...admitted.keys()],[7,8,9]);
  assert.deepEqual(specs.map(item=>item.pages),[[30,31,32,33,34],[35,36,37,38],[39,40]]);
  assert.deepEqual(renderers.map(renderer=>renderer.profile),figures.map(figure=>figure.profile));
  const svgKeys=new Set<string>();
  for(const spec of specs){
    const {number,original,definition}=spec;
    assert.equal(definition.sourceAnswer,official[number]);
    assert.deepEqual(original.answerParts?.map(item=>item.label),labels[number]);
    assert.equal(slots[number].map(id=>highest[bank(original,id).key]).join(''),official[number]);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number),spec.pages);
    const items=variants(number);
    assert.equal(new Set(items.map(item=>JSON.stringify(item.prompt))).size,4);
    for(const [i,body] of items.entries()){
      assert.deepEqual(body,definition.build([i]));
      assert(body.explanation.length>50);
      assert.deepEqual(body.answerParts?.map(item=>item.label),labels[number]);
      for(const id of slots[number])assert(bank(body,id).key>=0);
      for(const block of body.prompt){
        if(block.type!=='diagram'||block.scene.kind!=='source_figure')continue;
        const {profile,values}=block.scene;
        const renderer=renderers.find(item=>item.profile===profile);
        assert(renderer);
        const svg=renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
        for(const term of ['<title','<desc','role="img"','aria-labelledby','aria-describedby','tabindex="0"'])assert(svg.includes(term));
        svgKeys.add(profile+'-'+values.join('-'));
      }
    }
    for(const malformed of [[-1],[4],[1.25],[],[1,2],new Array(1)])assert.throws(()=>definition.build(malformed));
  }
  assert.equal(svgKeys.size,6);
  const shared=admitted.get(9)!.definition.fixedReferenceAssetIds;
  assert.deepEqual(shared,[
    'asset-ipa-2004h16h-fe-pm-page-060','asset-ipa-2004h16h-fe-pm-page-061',
    'asset-ipa-2004h16h-fe-pm-page-062-casl-excerpt','asset-ipa-2004h16h-fe-pm-page-063',
    'asset-ipa-2004h16h-fe-pm-page-064','asset-ipa-2004h16h-fe-pm-page-065',
  ]);
});

test('問7の全16,000通りの空欄補完を、社員を索引にする別算法と照合する',()=>{
  for(const body of variants(7)){
    const match=text(body).match(/全部で(\d+)区分あり/);
    assert(match);
    const capacity=Number(match[1]);
    const program=programs(body,'cobol').join('\n');
    assert.equal([...program.matchAll(/PIC X\((\d+)\)/g)].slice(0,2).map(m=>Number(m[1])).join(','),[9+capacity*2,9+capacity*2].join(','));
    assert.match(program,new RegExp('OCCURS '+capacity+' INDEXED BY N'));
    assert.match(program,new RegExp('UNTIL N > '+capacity+' OR J-KUBUN = W-KUBUN-A\\(N\\)\\n +OR W-KUBUN-A\\(N\\) = SPACE'));
    assert.match(program,new RegExp('IF N < '+(capacity+1)+' AND W-KUBUN-A\\(N\\) = SPACE'));
    assert.match(program,/WHEN W-SBANGO = W-E-SBANGO AND NOT = HIGH-VALUE\n {16}\[b\]/);
    const layout=body.prompt.find(block=>block.type==='diagram');
    assert(layout?.type==='diagram'&&layout.scene.kind==='source_figure');
    const drawing=renderToStaticMarkup(createElement(renderers[0].component,{caption:layout.caption,values:layout.scene.values}));
    assert.match(drawing,new RegExp('data-record-field="区分領域'+capacity+'" data-digits="2"'));
    const full=Array.from({length:capacity},(_,i)=>i+1);
    const coverage:Workbook[]=[
      {employees:[],scores:[],qualifications:[]},
      {employees:[{id:3,grade:65,certifications:[]}],scores:[],qualifications:[]},
      {employees:[{id:2,grade:1,certifications:[4]},{id:5,grade:9,certifications:[]}],
        scores:[{id:1,grade:9},{id:2,grade:999},{id:3,grade:111},{id:5,grade:0},{id:6,grade:44}],
        qualifications:[{id:1,category:2},{id:2,category:4},{id:2,category:1},{id:3,category:2},{id:5,category:3},{id:6,category:4}]},
      {employees:[{id:3,grade:12,certifications:full},{id:4,grade:6,certifications:[1]}],scores:[],
        qualifications:[{id:3,category:capacity},{id:4,category:2},{id:4,category:3}]},
      {employees:[{id:10,grade:2,certifications:[]},{id:11,grade:3,certifications:[]}],
        scores:[{id:11,grade:451}],qualifications:[]},
      {employees:[{id:13,grade:12,certifications:[1]}],scores:[{id:13,grade:99}],qualifications:[]},
      {employees:[],scores:[{id:17,grade:0}],qualifications:[{id:4,category:1}]},
    ];
    const outcomes=coverage.map(input=>JSON.stringify(referenceMerge(input)));
    const banks=Object.fromEntries(slots[7].map(id=>[id,bank(body,id).options])) as Record<keyof MergeChoices,string[]>;
    let examined=0;
    const passed:MergeChoices[]=[];
    for(const a of banks.a)for(const b of banks.b)for(const c of banks.c)for(const d of banks.d)for(const e of banks.e){
      const choice={a,b,c,d,e};
      examined++;
      if(coverage.every((data,i)=>JSON.stringify(runCobolMerge(data,capacity,choice))===outcomes[i]))passed.push(choice);
    }
    assert.equal(examined,16000);
    assert.deepEqual(passed,[Object.fromEntries(slots[7].map(id=>[id,selected(body,id)]))]);
  }
});

test('問8の型・公開メソッド・実行例の四条件と全選択肢を照合する',()=>{
  const expected=[
    {up:'CtoF',down:'FtoC',value:68,output:20.0,methods:[/9\.0 \/ 5\.0 \* input \+ 32\.0/,/5\.0 \/ 9\.0 \* \(input - 32\.0\)/]},
    {up:'CmToM',down:'MToCm',value:2.5,output:250.0,methods:[/input \/ 100\.0/,/input \* 100\.0/]},
    {up:'SToMin',down:'MinToS',value:90,output:1.5,methods:[/input \/ 60\.0/,/input \* 60\.0/]},
    {up:'GToKg',down:'KgToG',value:1250,output:1.25,methods:[/input \/ 1000\.0/,/input \* 1000\.0/]},
  ];
  for(const [i,body] of variants(8).entries()){
    const java=programs(body,'java'),[contract,runner,forward,backward,tester]=java;
    const found=expected[i];
    assert.equal(java.length,5);
    assert.match(contract,/public interface Converter \{\n {4}\[a\]/);
    assert.match(runner,/private \[b\] conv;\n\n {4}public void setConverter\(\[b\] conv\)/);
    assert.match(runner,/public void run\(String input\)/);
    assert.match(runner,/if \(conv == null\) return;/);
    assert.match(runner,/double in = Double.parseDouble\(input\);\n {12}double out = conv.convert\(in\);/);
    assert.match(runner,/catch \(NumberFormatException e\)/);
    for(const [j,block] of [forward,backward].entries()){
      assert.match(block,/public double convert\(double input\)/);
      assert.match(block,found.methods[j]);
      assert.match(block,new RegExp('public class '+[found.up,found.down][j]+' \\[c\\]'));
    }
    assert.match(tester,new RegExp('if \\("1"\\.equals\\(choice\\)\\) \\{\\n +runner.setConverter\\(new '+found.down+'\\(\\)\\);'));
    assert.match(tester,new RegExp('if \\("2"\\.equals\\(choice\\)\\) \\{\\n +runner.setConverter\\(new '+found.up+'\\(\\)\\);'));
    assert.match(tester,/String value = reader.readLine\(\);\n {16}\[d\]/);
    assert.match(tester,/" \+\n {33}"or q\(Quit\): "/);
    const sample=programs(body,'text')[0];
    const rows=sample.split('\n');
    assert.equal(rows[0],'% java TestConverter');
    assert.equal(rows[1],'Type 1('+found.down+'), 2('+found.up+'), or q(Quit): '+(i<2?1:2));
    assert.equal(Number(rows[2].split(': ')[1]),found.value);
    assert.equal(Number(rows[3]),found.output);
    const options=[
      {part:'a',criteria:/^public double convert\(double \w+\);$/,source:[/^abstract public void convert\(\);$/,/[{] [}]/,/^public double convert\(double \w+\);$/,/convert\(String/]},
      {part:'b',criteria:/^Converter$/,source:[/^Converter$/,/^ConverterRunner$/,new RegExp('^'+found.up+'$'),new RegExp('^'+found.down+'$')]},
      {part:'c',criteria:/^implements Converter$/,source:[/^extends Converter$/,/^extends ConverterRunner$/,/^implements Converter$/,/^implements ConverterRunner$/]},
      {part:'d',criteria:/^runner\.run\(value\);$/,source:[/^runner\.conv\.convert/,/^runner\.conv\.run/,/^runner\.convert/,/^runner\.run\(value\);$/]},
    ];
    for(const item of options){
      const bankCase=bank(body,item.part);
      for(const [j,value] of bankCase.options.entries())assert.match(value,item.source[j]);
      assert.deepEqual(bankCase.options.flatMap((value,j)=>item.criteria.test(value)?[j]:[]),[bankCase.key]);
    }
  }
});

test('問9の元の動作と補正を、全16ビット値と全候補から独立に検算する',()=>{
  for(const body of variants(9)){
    const p=programs(body,'casl2')[0];
    const question=text(body);
    const odd=question.includes('奇数パリティを設定する');
    assert(odd||question.includes('偶数パリティを設定する'));
    assert.match(p,/NCNT  POP   GR1\n {6}SRL   GR1,1\n {6}JNZ   LP1\n {6}LD    GR1,TMP\n {6}\[s\]/);
    assert.match(p,/OR +GR1,=#8000 +; ◀ α/);
    assert.match(p,new RegExp('LAD +GR2,'+(odd?1:0)));
    const a=bank(body,'a'), b=bank(body,'b'), s=bank(body,'s');
    const paths=s.options.map(option=>compileCaslParity(p,option));
    const candidates=b.options.map(option=>compileCaslParity(p,s.options[s.key],option));
    const sample=Number('0x'+question.match(/GR1に#([\dA-F]{4})が設定/)?.[1]);
    assert(Number.isSafeInteger(sample)&&(sample&0x8000)!==0);
    const gr2=0x4086, orig=paths[s.key](sample,gr2);
    assert.deepEqual(orig,[sample,gr2]);
    assert.notEqual(referenceParity(sample,odd),sample);
    assert.deepEqual(a.options.flatMap((word,i)=>Number('0x'+word.slice(1))===orig[0]?[i]:[]),[a.key]);
    assert.deepEqual(a.options,[...a.options].sort());
    const probe=[0,1,2,3,4,7,16,17,255,256,0x2001,0x7FFF,0x8000,0x8001,0xFFFE,0xFFFF];
    const single=(actual:[number,number],value:number)=>actual[0]===referenceParity(value,odd)&&actual[1]===gr2;
    assert.deepEqual(paths.flatMap((path,i)=>probe.filter(x=>x<0x8000).every(word=>single(path(word,gr2),word))?[i]:[]),[s.key]);
    assert.deepEqual(candidates.flatMap((path,i)=>probe.every(word=>single(path(word,gr2),word))?[i]:[]),[b.key]);
    for(let word=0;word<=0xFFFF;word++){
      const ref=referenceParity(word,odd);
      const [corrected,restored]=candidates[b.key](word,gr2);
      if(corrected!==ref||restored!==gr2)assert.deepEqual([corrected,restored],[ref,gr2]);
      if(word<0x8000){
        const [original,restored]=paths[s.key](word,gr2);
        if(original!==ref||restored!==gr2)assert.deepEqual([original,restored],[ref,gr2]);
      }
    }
  }
});
