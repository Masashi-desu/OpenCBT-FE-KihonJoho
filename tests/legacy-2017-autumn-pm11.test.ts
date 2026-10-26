import test from'node:test';import assert from'node:assert/strict';import{createElement}from'react';import{renderToStaticMarkup}from'react-dom/server';import{mkdtempSync,writeFileSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import{spawnSync}from'node:child_process';
import{legacy2017AutumnPm11Definition as d,legacy2017AutumnPm11Program1 as p1,legacy2017AutumnPm11Program2 as p2,legacy2017AutumnPm11Replacement2 as r2,legacy2017AutumnPm11Replacement3 as r3,legacy2017AutumnPm11ApiAssetIds as apiIds}from'../src/core/generators/legacy-2017-autumn-pm11';
import{legacy2017AutumnPm11Model as model,legacy2017AutumnPm11Sort as sort,legacy2017AutumnPm11Profiles as profiles,legacy2017AutumnPm11Figure as inspect}from'../src/core/generators/legacy-2017-autumn-pm11-model';import{Legacy2017AutumnPm11Figure as Figure}from'../src/ui/Legacy2017AutumnPm11Figure';
import{autumnPm11Review as review,autumnPm11Rows as rows,autumnPm11PartitionReference as reference,autumnPm11Orders as orders,autumnPm11PairSign as pairSign}from'./fixtures/legacy-2017-autumn-pm11-oracle';
const baseCall='        sorter.sort(data, new TableSorter.OrderBy("lex", 0),\n                    new TableSorter.OrderBy("num", 1, true));';
function fill(choices:number[]){let source=p1;for(let i=0;i<5;i++)source=source.replaceAll(`[${'abcde'[i]}]`,review.candidates[i][choices[i]]);return source;}
function tester(v:number,scenario:number,name:string){let source=p2([v]);assert(source.includes(baseCall));if(scenario)source=source.replace(baseCall,scenario===1?r2:r3);return source.replaceAll('TableSorterTester',name);}
const output=(s:string)=>s.trim().split(/\r?\n/).map(s=>s.trimEnd());
test('秋PM11 全8条件/7欄30択/固定API3頁と原出力形式を独立安定分割へ照合する',()=>{
 for(let v=0;v<8;v++){const m=model([v]),b=d.build([v]);assert.deepEqual(m.rows,rows(v));assert.deepEqual(m.example,reference(rows(v),orders[0]));assert.deepEqual(m.second,reference(rows(v),orders[1]));assert.deepEqual(m.third,reference(rows(v),orders[2]));assert.deepEqual(b.answerParts!.map(p=>p.choiceIds.length),review.counts);assert.equal(b.choices.length,30);
  assert.deepEqual(b.partAnswers!.map((a,i)=>{assert(a.kind==='choice');return b.answerParts![i].choiceIds.indexOf(a.choiceId);}),[2,2,3,0,2,review.secondThirdOptionIndexes[v],review.secondThirdOptionIndexes[v]]);
  assert.deepEqual(b.choices.slice(0,20).map(c=>{assert.equal(c.length,1);assert(c[0].type==='code');return c[0].text;}),review.candidates.flat());
  assert.deepEqual(b.contexts!.flatMap(c=>c.blocks.map(b=>{assert(b.type==='image');return b.assetId;})),apiIds);assert.equal(b.contexts!.length,1);
  assert(b.explanation.includes(`先頭は「${m.second[0].join(' ')}」`));assert(b.explanation.includes(`3行目は「${m.third[2].join(' ')}」`));
 }
});
test('秋PM11 全同値は入力順・条件無しは不変、列優先と逆順を独立分割へ照合する',()=>{
 const values:[string,string,string][]=[['apple','2','1,000'],['banana','2','1,000'],['apple','2','1,000'],['cherry','1','300']];
 assert.deepEqual(sort(values,[]),values);assert.deepEqual(sort(values,[{key:'num',col:2}],true),reference(values,[{col:2,numeric:true}]));
 for(let primary=0;primary<3;primary++)for(let secondary=0;secondary<3;secondary++)for(const reverse of[false,true]){const selected=[{col:primary,numeric:primary!==0,reversed:reverse},{col:secondary,numeric:secondary!==0}],production=selected.map(o=>({col:o.col,key:o.numeric?'num' as const:'lex' as const,isReversed:o.reversed}));assert.deepEqual(sort(values,production,true),reference(values,selected));}
});
test('秋PM11 実componentは5矢印/原位置a2,b1,c2,d1,e1/αと全30択を保持する',()=>{
 for(let v=0;v<8;v++){const b=d.build([v]),figs=b.prompt.filter(b=>b.type==='diagram');assert.equal(figs.length,13);for(const f of figs){assert(f.scene.kind==='source_figure');assert.equal(f.caption,inspect(f.scene.profile,f.scene.values).caption);assert(!f.alt.includes('undefined'));assert(!renderToStaticMarkup(createElement(Figure,{profile:f.scene.profile,values:f.scene.values})).includes('undefined'));}
  const render=(n:number,g?:number)=>renderToStaticMarkup(createElement(Figure,{profile:profiles[n],values:g===undefined?[v]:[v,g]}));assert.equal((render(0).match(/data-pm11-row-arrow=/g)||[]).length,5);assert.deepEqual([...render(2).matchAll(/data-pm11-blank="(.)"/g)].map(m=>m[1]),['a','a','b','c','c','d','e']);assert.equal((render(3).match(/aria-label="α/g)||[]).length,1);
  for(let g=0;g<7;g++)assert.equal((render(4,g).match(/data-pm11-option=/g)||[]).length,review.counts[g]);const prose=b.prompt.flatMap(b=>b.type==='paragraph'?[b.text]:[]).join('\n');for(const note of['先に指定した条件が優先','並べ替える前の並び順を維持','配列の添字','isReversedがfalse','trueであれば、降順','1行目','3行目'])assert(prose.includes(note));
 }
});
test('秋PM11 正答補完した実JavaをJava8互換で全8条件×3指定順に実行する',()=>{
 const folder=mkdtempSync(join(tmpdir(),'autumn-pm11-java-'));try{
  writeFileSync(join(folder,'TableSorter.java'),fill(review.indexes.slice(0,5)));const files=['TableSorter.java'];for(let v=0;v<8;v++)for(let s=0;s<3;s++){const name=`Tester_${v}_${s}`;writeFileSync(join(folder,name+'.java'),tester(v,s,name));files.push(name+'.java');}
  const compiled=spawnSync('javac',['--release','8',...files],{cwd:folder,encoding:'utf8',timeout:30000});assert.equal(compiled.status,0,compiled.stderr);
  for(let v=0;v<8;v++)for(let s=0;s<3;s++){const run=spawnSync('java',['-cp',folder,`Tester_${v}_${s}`],{encoding:'utf8',timeout:5000});assert.equal(run.status,0,run.stderr);assert.deepEqual(output(run.stdout),reference(rows(v),orders[s]).map(r=>r.join(' ')));}
 }finally{rmSync(folder,{recursive:true,force:true});}
});
test('秋PM11 全20択を実Java差込みし、誤型/未定義9択と比較契約違反6択を独立検出する',(t)=>{
 const folder=mkdtempSync(join(tmpdir(),'autumn-pm11-mutants-')),failures:{group:string;candidate:number;kind:string}[]=[];try{
  for(let group=0;group<5;group++)for(let choice=0;choice<4;choice++){
   const indexes=review.indexes.slice(0,5);indexes[group]=choice;let source=fill(indexes).replace('public class TableSorter {','public class TableSorter {\n    public static Comparator<String[]> captured;').replace('Arrays.sort(table, new Comparator<String[]>()','Arrays.sort(table, captured = new Comparator<String[]>()');
   writeFileSync(join(folder,'TableSorter.java'),source);
   const data=JSON.stringify(rows(0)).replaceAll('[','{').replaceAll(']','}');const driver=`public class Probe {public static void main(String[] args){TableSorter s=new TableSorter();s.putSortOrder("lex",new java.util.Comparator<String>(){public int compare(String a,String b){return a.compareTo(b);}});s.putSortOrder("num",new java.util.Comparator<String>(){public int compare(String a,String b){return new Integer(a).compareTo(new Integer(b));}});String[][] rows=${data};s.sort(rows.clone(),new TableSorter.OrderBy("lex",0),new TableSorter.OrderBy("num",1,true));for(String[]a:rows)for(String[]b:rows)System.out.println(Integer.signum(TableSorter.captured.compare(a,b)));}}`;
   writeFileSync(join(folder,'Probe.java'),driver);const compiled=spawnSync('javac',['--release','8','TableSorter.java','Probe.java'],{cwd:folder,encoding:'utf8',timeout:30000});
   const shouldReject=review.compilerRejection[group].includes(choice);if(shouldReject){assert.equal(compiled.status,1,compiled.stderr);assert(compiled.stderr.includes('TableSorter.java:'));failures.push({group:'abcde'[group],candidate:choice,kind:'compile-time type/name rejection'});continue;}assert.equal(compiled.status,0,compiled.stderr);
   const run=spawnSync('java',['-cp',folder,'Probe'],{encoding:'utf8',timeout:5000});assert.equal(run.status,0,run.stderr);const expected=rows(0).flatMap(a=>rows(0).map(b=>String(pairSign(a,b,orders[0])))),actual=output(run.stdout),matches=JSON.stringify(actual)===JSON.stringify(expected);
   assert.equal(matches,choice===review.indexes[group],JSON.stringify({group,choice,actual,expected}));if(!matches)failures.push({group:'abcde'[group],candidate:choice,kind:'25 ordered-pair comparison signs differ from reference'});
  }assert.equal(failures.length,15);t.diagnostic(JSON.stringify({javaAllChoiceRejections:failures}));
 }finally{rmSync(folder,{recursive:true,force:true});}
});
test('秋PM11 不正入力/不明profile/Integer形式と範囲/不正列を拒否する',()=>{
 for(const v of[[],[-1],[8],[0.5],[0,1]])assert.throws(()=>d.build(v));assert.throws(()=>inspect('unknown',[0]));assert.throws(()=>inspect(profiles[4],[0]));assert.throws(()=>sort([['a','x','0'],['b','1','0']],[{key:'num',col:1}]));assert.throws(()=>sort([['a','2147483648','0'],['b','1','0']],[{key:'num',col:1}]));assert.throws(()=>sort(rows(0),[{key:'lex',col:3}]));
});
test('秋PM11 実出力10択は独立入力行の原順[4,0,2,3,1]であり両設問の正答IDへ一致する',()=>{
 for(let v=0;v<8;v++){const body=d.build([v]),input=rows(v),expected=[4,0,2,3,1].map(i=>input[i].join(' ')),actual=body.choices.slice(20).map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==='paragraph');return bs[0].text;});assert.deepEqual(actual,[...expected,...expected],'producer output candidates differ from source row roles');for(const[group,offset,answerRow]of[[5,20,reference(input,orders[1])[0]],[6,25,reference(input,orders[2])[2]]]as const){const flags=actual.slice(offset-20,offset-15).map(s=>s===answerRow.join(' '));assert.equal(flags.filter(Boolean).length,1);const answer=body.partAnswers![group];assert(answer.kind==='choice');assert.equal(answer.choiceId,`choice-value-${offset+flags.indexOf(true)+1}`);}}
});
