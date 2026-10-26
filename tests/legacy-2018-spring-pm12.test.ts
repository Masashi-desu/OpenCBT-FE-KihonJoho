import test from 'node:test';import assert from 'node:assert/strict';
import {legacy2018SpringPm12Definition as definition} from '../src/core/generators/legacy-2018-spring-pm12';
import {legacy2018SpringPm12Figure as inspect,legacy2018SpringPm12Profiles as profiles} from '../src/core/generators/legacy-2018-spring-pm12-model';
import {assembleVisiblePrograms,runVisibleMachine,decimalReference,tableReference} from './fixtures/legacy-2018-spring-pm12-machine';
// Manually reviewed QS64/66/67 banks, in source order. Not producer-derived.
const reviewed=[
 ['ADDL GR5,GR4','SLL GR4,1','SLL GR4,2','SLL GR5,1','SLL GR5,2'],
 ['JNZ FIN','JNZ LP','JNZ NUM','JZE FIN','JZE LP','JZE NUM'],
 ['JNZ FIN','JNZ FIN2','JNZ NUM','JZE FIN','JZE FIN2','JZE NUM'],
 ['LAD GR6,1,GR1','LAD GR6,1,GR6','LAD GR7,1,GR2','LAD GR7,1,GR7','LD GR6,GR1','LD GR7,GR2'],
 ['JMI FIN','JMI NEXT','JPL FIN','JPL NEXT','JZE FIN','JZE NEXT'],
 ['ADDL GR0,GR5','ADDL GR5,GR4','LD GR5,GR4','SLL GR5,1','SRL GR5,1']
];
const offsets=[0,5,11,17,23,29],widths=[5,6,6,6,6,5];
function textOf(b:{type:string;text?:string}){assert.equal(b.type,'code');return b.text!;}
function displayed(values:number[]){const body=definition.build(values),programs:string[]=[];for(const b of body.prompt){if(b.type!=='diagram'||b.scene.kind!=='source_figure')continue;const f=inspect(b.scene.profile,b.scene.values);assert.equal(b.caption,f.caption);assert.equal(b.alt,f.alt);if(b.scene.profile===profiles[0])programs.push(f.text);}assert.equal(programs.length,3);return{body,programs};}
function completed(programs:string[],mode:number,override?:[number,string]){const keys=[4,2,mode===0?1:4,3,4,4],chosen=reviewed.map((b,i)=>override?.[0]===i?override[1]:b[keys[i]]);return programs.map(s=>s.replace(/\[([a-f])\]/g,(_,c)=>chosen[c.charCodeAt(0)-97]));}
function check(program:ReturnType<typeof assembleVisiblePrograms>,entry:'DTOB'|'GETWD'|'MULT',text:string){const r=runVisibleMachine(program,{entry,text,maxSteps:15000});assert.deepEqual(r.registers.slice(1),r.before.slice(1),'GR1–GR7 must be restored');if(entry==='DTOB')assert.equal(r.registers[0],decimalReference(text));else if(entry==='MULT'){const ns=tableReference(text);assert.equal(ns.length,2);assert.equal(r.registers[0],ns[0]*ns[1]);assert.deepEqual([...r.memory].filter(([a])=>a>=0xc000&&a<0xc003).sort((a,b)=>a[0]-b[0]).map(r=>r[1]),[...ns,65535]);}else{const expected=[...tableReference(text),65535];assert.deepEqual(Array.from({length:expected.length},(_,i)=>r.memory.get(0x9000+i)),expected);assert.deepEqual([...r.writes].sort((a,b)=>a-b),expected.map((_,i)=>0x9000+i));}return r;}
test('actual producer and native banks retain all34 source choices, six fields and both flag signatures',()=>{
 for(let mode=0;mode<2;mode++)for(let example=0;example<6;example++){
  const {body,programs}=displayed([mode,example]);assert.equal(body.choices.length,34);assert.deepEqual(body.choices.map(b=>{assert.equal(b.length,1);return textOf(b[0]);}),reviewed.flat());
  assert.deepEqual(body.answerParts?.map(p=>p.choiceIds.length),widths);for(const p of body.answerParts!){assert.equal(new Set(p.choiceIds.map(id=>{const n=Number(id.split('-').pop())-1;return textOf(body.choices[n][0]);})).size,p.choiceIds.length);} // Repeated opcodes across different banks retain their independent field roles.
  const keys=[4,2,mode===0?1:4,3,4,4];assert.deepEqual(body.partAnswers?.map((p,i)=>{assert(p.kind==='choice');return Number(p.choiceId.split('-').pop())-1-offsets[i];}),keys);
  const banks=body.prompt.filter(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile===profiles[1]);assert.equal(banks.length,6);for(const [i,b]of banks.entries()){assert(b.type==='diagram'&&b.scene.kind==='source_figure');assert.equal(inspect(b.scene.profile,b.scene.values).text,reviewed[i].map((s,j)=>`${'アイウエオカ'[j]} ${s}`).join('\n'));}
  assert.match(programs[1],new RegExp(`LD GR3,=${mode===0?-1:0} +; 数字列の処理状態`));assert.match(programs[1],new RegExp(`NUM +LD GR3,GR3[^\n]*\n +${mode===0?'JZE':'JNZ'} LP`));assert.match(programs[1],new RegExp(`LD GR3,=${mode===0?0:-1} +; 次の数字列`));
 }
});
test('all12 visible program conditions execute against independent decimal and table oracles',()=>{
 for(let mode=0;mode<2;mode++)for(let example=0;example<6;example++){
  const {programs}=displayed([mode,example]),program=assembleVisiblePrograms(completed(programs,mode));
  for(const s of ['0','1','9','10','32768','65534','000000000000567'])check(program,'DTOB',s);
  for(const s of ['1.','  0  65534 .','1234 56789   9876.','000001 00000000000 9   .'])check(program,'GETWD',s);
  for(const pair of [[0,0],[0,65534],[65534,0],[1,32768],[1,65534],[3,21845],[5,13107],[255,257],[2,32767]])check(program,'MULT',` ${pair[0]}  ${pair[1]} .`);
 }
});
test('DTOB entire0..65534 and leading-zero classes beyond five digits use actual visible program',()=>{
 const program=assembleVisiblePrograms(completed(displayed([0,0]).programs,0));
 for(let n=0;n<=65534;n++){const r=runVisibleMachine(program,{entry:'DTOB',text:String(n),maxSteps:200});assert.equal(r.registers[0],n);assert.deepEqual(r.registers.slice(1),r.before.slice(1));}
 for(const zeros of [1,5,17,256,4096])for(const n of [0,1,9,65534]){const text='0'.repeat(zeros)+n,r=runVisibleMachine(program,{entry:'DTOB',text,maxSteps:100000});assert.equal(r.registers[0],decimalReference(text));assert.deepEqual(r.registers.slice(1),r.before.slice(1));}
});
test('all34 real alternatives are executed; each wrong candidate has a concrete counterexample',()=>{
 const counterexamples:unknown[]=[];
 for(let mode=0;mode<2;mode++){
  const {body,programs}=displayed([mode,0]);const keys=[4,2,mode===0?1:4,3,4,4];
  for(let field=0;field<6;field++)for(let option=0;option<widths[field];option++){
   const actual=textOf(body.choices[offsets[field]+option][0]),program=assembleVisiblePrograms(completed(programs,mode,[field,actual])),entry=field===0?'DTOB':field<4?'GETWD':'MULT';
   const inputs=entry==='DTOB'?['10','123','65534']:entry==='GETWD'?['1 2.',' 1.','1   2 .','0  65534.']:['2 3.','0 1.','1 0.','1 32768.','3 21845.'];
   let failure:string|undefined;for(const text of inputs){try{check(program,entry,text);}catch(e){failure=`${text}: ${e instanceof Error?e.message:String(e)}`;break;}}
   if(option===keys[field])assert.equal(failure,undefined,`correct ${mode}/${field}/${option}`);else{assert(failure,`missing counterexample ${mode}/${field}/${option}`);counterexamples.push({mode,field,option,actual,failure});}
  }
 }assert.equal(counterexamples.length,56);
});
test('no original digit cap or held JIS chart; reference facts and finite capacity are explicit',()=>{
 const all=Array.from({length:12},(_,i)=>[Math.floor(i/6),i%6]);
 for(const values of all){const b=definition.build(values),dump=JSON.stringify(b);assert(!/1〜5桁|1～5桁|最大5桁|JIS X|1\.3 文字符号/.test(dump));assert.equal(b.contexts?.length,2);const ref=b.contexts![1].blocks[0];assert(ref.type==='diagram'&&ref.scene.kind==='source_figure');assert.deepEqual(ref.scene.values,[0,0,0]);const referenceProfile=ref.scene.profile;assert.throws(()=>inspect(referenceProfile,[1,0,0]),/PARAMETER_CONSTRAINT/);assert.deepEqual(ref.attribution.sourceRefs.map(r=>r.sourceId),['source-unicode-17-ucd-q12']);assert.deepEqual(ref.attribution.creatorIds,['unicode','codex']);
  for(const previous of all){const remaining=all.filter(v=>v[0]!==previous[0]&&JSON.stringify(v)!==JSON.stringify(values)&&JSON.stringify(v)!==JSON.stringify([0,0]));assert(remaining.length>=4);}
 }
});
test('visible nonhole branch, literal and GR preservation corruption are detected by independent execution',()=>{
 const source=completed(displayed([0,0]).programs,0);
 const wrongState=[...source];wrongState[1]=wrongState[1].replace(/(NUM +LD GR3,GR3[^\n]*\n +)JZE LP/,'$1JNZ LP');assert.notEqual(wrongState[1],source[1]);assert.throws(()=>check(assembleVisiblePrograms(wrongState),'GETWD','1 2.'));
 const wrongLiteral=[...source];wrongLiteral[0]=wrongLiteral[0].replace("SUBL GR4,='0'","SUBL GR4,='1'");assert.throws(()=>check(assembleVisiblePrograms(wrongLiteral),'DTOB','10'));
 const wrongSave=[...source];wrongSave[0]=wrongSave[0].replace('        RPUSH\n','');assert.throws(()=>check(assembleVisiblePrograms(wrongSave),'DTOB','567'),/STACK|stack|register/i);
});

test('visible MULT covers every pair of0..31; GETWD handles long zero prefixes and more than three numbers',()=>{
 for(const mode of [0,1]){const program=assembleVisiblePrograms(completed(displayed([mode,mode===0?0:5]).programs,mode));for(let a=0;a<32;a++)for(let b=0;b<32;b++)check(program,'MULT',`${a} ${b}.`);
 check(program,'GETWD','0'.repeat(256)+'1  '+ '0'.repeat(128)+'65534 .');check(program,'MULT','0'.repeat(256)+'255  '+ '0'.repeat(128)+'257 .');check(program,'GETWD',' 0  1 2  3 4 5 6  7 65534  .');}
});

test('effective-address low16-bit arithmetic handles start0 and the memory-end boundary',()=>{
 const program=assembleVisiblePrograms(completed(displayed([0,0]).programs,0));for(const start of [0,1,65530,65534]){const r=runVisibleMachine(program,{entry:'DTOB',text:'065534',start,maxSteps:500});assert.equal(r.registers[0],65534);assert.deepEqual(r.registers.slice(1),r.before.slice(1));}
 for(const start of [0,65530]){const r=runVisibleMachine(program,{entry:'GETWD',text:' 1 2 .',start,maxSteps:1000});assert.deepEqual([r.memory.get(0x9000),r.memory.get(0x9001),r.memory.get(0x9002)],[1,2,65535]);assert.deepEqual(r.registers.slice(1),r.before.slice(1));}
});
