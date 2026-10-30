import test from'node:test';import assert from'node:assert/strict';
import{observe,observeQ12,packed,q12Program,repairedQ12Program}from'./helpers/legacy-2019-autumn-casl-observer';
// Independent decimal/BCD oracle: text digits, no interpreter flags or digit loop.
function decimalWord(n:number,negative=n<0){const s=String(Math.abs(n)).padStart(3,'0')+(negative?'d':'c');return parseInt(s,16);}
test('reviewed numeric instructions preserve signed/unsigned/shift flags and GR1..7',()=>{const cases:[string[],number[],number,number][]=[
 [['ADDL GR0,=1','RET'],[65535],0,1],[['ADDA GR0,=1','RET'],[32767],32768,1],
 [['SUBL GR0,=1','RET'],[0],65535,1],[['SUBA GR0,=1','RET'],[32768],32767,1],
 [['SLL GR0,1','RET'],[0x8001],2,1],[['SRL GR0,1','RET'],[0x8001],0x4000,1],
 [['SLA GR0,1','RET'],[0xc001],0x8002,1],[['SRA GR0,1','RET'],[0x8001],0xc000,1],
 [['CPL GR0,GR1','RET'],[0x8000,1],0x8000,0],[['CPA GR0,GR1','RET'],[0x8000,1],0x8000,0],
 ];for(const[p,r,value,of]of cases){const actual=observe(p,r);assert.equal(actual.value,value);assert.equal(actual.flags.of,of);}assert.equal(observe(['CPL GR0,GR1','RET'],[0x8000,1]).flags.sf,0);assert.equal(observe(['CPA GR0,GR1','RET'],[0x8000,1]).flags.sf,1);
 const r=observeQ12(1,0x246c,0x057c);assert.equal(r.value,0x303c);assert.deepEqual(r.gr.slice(1),r.before.slice(1));
});
test('each of the six original f options fails a reviewed valid opposite-sign input',()=>{const witnesses=[[1,10],[0,1],[1,10],[1,10],[0,1],[1,100]];for(let f=0;f<6;f++){const[a,b]=witnesses[f],expected=decimalWord(a-b);if(f===3)assert.throws(()=>observeQ12(2,decimalWord(a),decimalWord(b,true),{f}),/NONTERMINATING/);else assert.notEqual(observeQ12(2,decimalWord(a),decimalWord(b,true),{f}).value,expected);}assert.equal(observeQ12(2,0x001c,0x100d,{f:5}).value,0x1f9d);assert.equal(decimalWord(1-100),0x099d);});
test('proposed repair matches all1998000 valid opposite-sign operand pairs; zero has sign C',()=>{const p=repairedQ12Program();assert.equal(p.filter(s=>s==='ADDL GR2,GR0').length,1);assert(q12Program(2,{f:5}).includes('SUBL GR1,GR0'));const words=Array.from({length:1000},(_,i)=>decimalWord(i)),negativeWords=Array.from({length:1000},(_,i)=>decimalWord(i,true));let n=0;for(let a=0;a<1000;a++)for(let b=1;b<1000;b++){const expected=decimalWord(a-b);for(const pair of[[words[a],negativeWords[b]],[negativeWords[b],words[a]]]){const r=observe(p,[0,...pair]);assert.equal(r.value,expected,`${a}+-${b}`);assert.deepEqual(r.gr.slice(1),r.before.slice(1));n++;}}assert.equal(n,1998000);});
test('same-sign addition matches all999001 valid pairs with no thousands carry',()=>{const p=q12Program(1);let n=0;for(let a=0;a<1000;a++)for(let b=0;b<1000-a;b++){for(const negative of(a>0&&b>0?[false,true]:[false])){const r=observe(p,[0,decimalWord(a,negative),decimalWord(b,negative)]);assert.equal(r.value,decimalWord(a+b,negative));n++;}}assert.equal(n,999001);for(let i=0;i<1000;i++){assert.equal(packed(i),decimalWord(i));assert.equal(packed(-i,i!==0),decimalWord(i,i!==0));}});
