import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {legacy2018SpringPm11Definition as definition} from '../src/core/generators/legacy-2018-spring-pm11';
import {legacy2018SpringPm11Figure as inspect,legacy2018SpringPm11Profiles as profiles} from '../src/core/generators/legacy-2018-spring-pm11-model';
import {pm11IndependentReference as reference,pm11IndependentKeys as keys,pm11IndependentFieldSizes as sizes,pm11IndependentOffsets as offsets,pm11ReviewedAccess} from './fixtures/legacy-2018-spring-pm11-oracle';
function actual(values:number[]){const body=definition.build(values),programs:string[]=[],figures:string[]=[],banks:string[]=[];for(const b of body.prompt){if(b.type!=='diagram'||b.scene.kind!=='source_figure')continue;const f=inspect(b.scene.profile,b.scene.values);assert.equal(b.caption,f.caption);assert.equal(b.alt,f.alt);if(b.scene.profile===profiles[0])programs.push(f.text);if(b.scene.profile===profiles[1])figures.push(f.text);if(b.scene.profile===profiles[2])banks.push(f.text);}assert.equal(programs.length,6);assert.equal(figures.length,2);assert.equal(banks.length,6);return {body,programs,figures,banks};}
function javaAt(cwd:string,args:string[]){const r=spawnSync('javac',['-proc:none','-XDrawDiagnostics','-Xlint:-options','--release','8','-d',path.join(cwd,'classes'),...args],{cwd,encoding:'utf8',timeout:30000});if(r.error)throw r.error;return{status:r.status,diagnostic:r.stderr+r.stdout};}
function runAt(cwd:string,main:string){const r=spawnSync('java',['-cp',path.join(cwd,'classes'),main],{cwd,encoding:'utf8',timeout:10000});if(r.error)throw r.error;assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
function writeJava(cwd:string,name:string,text:string){const p=path.join(cwd,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);return p;}
function sandbox(){const parent=path.resolve('output/source-review/legacy-2018-spring-pm11-java-tests');fs.mkdirSync(parent,{recursive:true});return fs.mkdtempSync(path.join(parent,'case-'));}
test('actual31 choices/native source banks and all38 field references match independent source ledger for all40 cases',()=>{
 for(let a=0;a<4;a++)for(let b=0;b<5;b++)for(let c=0;c<2;c++){
  const v=[a,b,c],r=reference(v),x=actual(v),texts=x.body.choices.map(bs=>{assert.equal(bs.length,1);assert.equal(bs[0].type,'paragraph');return bs[0].type==='paragraph'?bs[0].text:'';});assert.deepEqual(texts,r.banks.flat());assert.deepEqual(x.banks,r.banks.map(bank=>bank.map((s,i)=>`${'アイウエオカキ'[i]} ${s}`).join('\n')));
  assert.deepEqual(x.body.answerParts?.map(p=>p.choiceIds.length),sizes);assert.deepEqual(x.body.partAnswers?.map((p,i)=>{assert(p.kind==='choice');return Number(p.choiceId.split('-').pop())-1-offsets[i];}),keys);assert.equal(x.figures[0],r.first);
  assert(x.programs[3].includes(`Expression ${r.pn} = new Constant(${r.p})`));assert(x.programs[3].includes(`Expression ${r.qn} = new Constant(${r.q})`));assert.equal((x.programs.join('\n').match(/\[a\]/g)??[]).length,5);assert.equal((JSON.stringify(x.body.prompt).match(/［　］/g)??[]).length,7); // one source-local diagram alt for each real anonymous box.
  assert.equal(r.banks[4].filter(s=>s===r.nested).length,1);assert.equal(pm11ReviewedAccess.filter(x=>x.fitsForeignSubclassApi).length,1);
 }
});
test('JDK21 executes actual displayed programs for all40 inputs and compares complete strings',()=>{
 const cwd=sandbox();try{const sources:string[]=[],names=['Expression','Constant','Addition','BinaryOperatorExpression','Subtraction'];let common=false;
  for(let a=0;a<4;a++)for(let b=0;b<5;b++)for(let c=0;c<2;c++){
   const v=[a,b,c],x=actual(v),r=reference(v),suffix=`V${a}${b}${c}`,selected=[r.banks[0][0],r.banks[1][5],r.banks[2][0],r.banks[2][1]];
   if(!common){for(const [i,n]of [[0,names[0]],[1,names[1]],[2,names[2]],[4,names[3]],[5,names[4]]]as const)sources.push(writeJava(cwd,n+'.java',x.programs[i].replaceAll('[a]','com.example.expr')));common=true;}
   let program=x.programs[3].replace(/\[([a-d])\]/g,(_,s)=>selected[s.charCodeAt(0)-97]).replace('class Test','class Test'+suffix).replace('/* α */',x.figures[1]);
   sources.push(writeJava(cwd,`Test${suffix}.java`,program));assert.equal(x.figures[0],r.first);
  }
  const compiled=javaAt(cwd,sources);assert.equal(compiled.status,0,compiled.diagnostic);
  for(let a=0;a<4;a++)for(let b=0;b<5;b++)for(let c=0;c<2;c++){const r=reference([a,b,c]);assert.equal(runAt(cwd,`com.example.test.TestV${a}${b}${c}`),r.first+'\n'+r.nested);}
 }finally{fs.rmSync(cwd,{recursive:true,force:true});}
});
test('all24 Q1 field alternatives are inserted at the real program positions and checked by Java',()=>{
 const v=[1,0,1],r=reference(v),x=actual(v),fieldBanks=[r.banks[0],r.banks[1],r.banks[2],r.banks[2]],correct=[0,5,0,1];
 for(let field=0;field<4;field++)for(let option=0;option<fieldBanks[field].length;option++){
  const cwd=sandbox();try{const chosen=fieldBanks.map((b,i)=>b[i===field?option:correct[i]]),program=x.programs[3].replace(/\[([a-d])\]/g,(_,s)=>chosen[s.charCodeAt(0)-97]),sources=[...x.programs.slice(0,3).map((p,i)=>writeJava(cwd,['Expression','Constant','Addition'][i]+'.java',p)),writeJava(cwd,'Test.java',program)],result=javaAt(cwd,sources);
   if(result.status===0){const output=runAt(cwd,'com.example.test.Test');assert.equal(output===r.first,option===correct[field],`${field}/${option}: ${output}`);}else{assert.equal(result.status,1,'Compiler abnormal exit is not an acceptable wrong-option result: '+result.diagnostic);assert.notEqual(option,correct[field]);assert.match(result.diagnostic,/compiler\.err\./);}
  }finally{fs.rmSync(cwd,{recursive:true,force:true});}
 }
});
test('four equality alternatives distinguish object identity/value equality/primitive operations with normal diagnostics',()=>{
 const r=reference([1,0,1]),x=actual([1,0,1]);
 for(let option=0;option<4;option++){
  const cwd=sandbox();try{const sources=[writeJava(cwd,'Expression.java',x.programs[0]),writeJava(cwd,'Constant.java',x.programs[1]),writeJava(cwd,'Equality.java',`import com.example.expr.Constant; class Equality { public static void main(String[] args) { boolean result = ${r.banks[5][option]}; System.out.println(result); } }`)];
   const result=javaAt(cwd,sources);if(option===3){assert.equal(result.status,1,result.diagnostic);assert.match(result.diagnostic,/compiler\.err\.cant\.deref: int/);assert(!/Exception|An exception has occurred/.test(result.diagnostic));}else{assert.equal(result.status,0,result.diagnostic);assert.equal(runAt(cwd,'Equality'),['false','false','true'][option]);}
  }finally{fs.rmSync(cwd,{recursive:true,force:true});}
 }
});
test('protected remains usable in same package and foreign subclasses, while unrelated foreign callers are rejected',()=>{
 const x=actual([1,0,1]),cases=[{package:'com.example.expr',body:'class Access { static class Derived extends BinaryOperatorExpression { Derived(){super(new Constant(1),new Constant(2));} public int evaluate(){return 0;} protected String getOperator(){return "+";} } Expression get(BinaryOperatorExpression x){return x.getLeft();} }',valid:true},{package:'other',body:'public class Access extends BinaryOperatorExpression { public Access(){super(new Constant(1),new Constant(2));} public int evaluate(){return getLeft().evaluate();} protected String getOperator(){return "+";} }',valid:true},{package:'other',body:'class Access { Expression get(BinaryOperatorExpression x){return x.getLeft();} }',valid:false}];
 for(const item of cases){const cwd=sandbox();try{const sources=[writeJava(cwd,'Expression.java',x.programs[0]),writeJava(cwd,'Constant.java',x.programs[1]),writeJava(cwd,'BinaryOperatorExpression.java',x.programs[4]),writeJava(cwd,'Access.java',`package ${item.package}; import com.example.expr.*; ${item.body}`)],result=javaAt(cwd,sources);assert.equal(result.status,item.valid?0:1,result.diagnostic);if(!item.valid)assert.match(result.diagnostic,/compiler\.err\./);}finally{fs.rmSync(cwd,{recursive:true,force:true});}}
});
