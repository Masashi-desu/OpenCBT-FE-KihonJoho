import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
/** Reviewed source inputs, independently transcribed from QS44/46. No producer import. */
export const pm9ReviewedInputs = [
  {work:0x5000, correct:[0x4000,0x1000,0x0800], submitted:[0x0800,0x0800,0x5000]},
  {work:0x2400, correct:[0x4000,0x1000,0x0800], submitted:[0x1000,0x1000,0x4800]},
  {work:0x1200, correct:[0x4000,0x1000,0x0800], submitted:[0x4000,0x4000,0x1800]},
  {work:0x4800, correct:[0x4000,0x1000,0x0800], submitted:[0x1000,0x1000,0x6000]},
  {work:0x2200, correct:[0x4000,0x1000,0x0800], submitted:[0x0800,0x0800,0x4000]},
  {work:0x1100, correct:[0x4000,0x1000,0x0800], submitted:[0x1000,0x1000,0x0800]},
  {work:0x4400, correct:[0x4000,0x1000,0x0800], submitted:[0x4000,0x4000,0x1000]},
  {work:0x2100, correct:[0x4000,0x1000,0x0800], submitted:[0x1000,0x1000,0x4000]},
] as const;
/** Fixed truth data from QS45 Figure3's question, explanation and correct marks.
 * It constrains the input's meaning independently of the bit-count algorithm. */
export const pm9ReviewedGeography=[
 {letter:'a',prefecture:'大阪',inland:false}, {letter:'b',prefecture:'岐阜',inland:true},
 {letter:'c',prefecture:'京都',inland:false}, {letter:'d',prefecture:'滋賀',inland:true},
 {letter:'e',prefecture:'奈良',inland:true}, {letter:'f',prefecture:'兵庫',inland:false},
 {letter:'g',prefecture:'三重',inland:false},
];
/** Arithmetic digit decomposition and mathematical sets, not the C bit-clear/OR algorithm. */
export function pm9DigitSet(value: number) { const set = new Set<number>(); for(let position=0;position<16;position++) if(Math.floor(value / 2 ** position) % 2 === 1) set.add(position); return set; }
export function pm9UnorderedReference(correct: readonly number[], submitted: readonly number[]) {
  const c = new Set(correct.flatMap(n=>[...pm9DigitSet(n)]));
  const e = new Set(submitted.flatMap(n=>{const d=pm9DigitSet(n);return d.size===1?[...d]:[];}));
  return {mark:[0,0,[...e].filter(x=>c.has(x)).length], sumE:[...e].reduce((n,p)=>n+2**p,0)};
}
const bitText=(n:number)=>{const all=n.toString(2).padStart(16,'0');return[all.slice(0,8),all.slice(8)].map(byte=>byte==='00000000'?'0…0':byte==='11111111'?'1…1':byte.slice(0,4)+' '+byte.slice(4)).join(' ');};
export function assertPm9Body(body: GeneratedBody, value: number) {
  const input=pm9ReviewedInputs[value], expected=pm9UnorderedReference(input.correct,input.submitted);
  const inlandBits=pm9ReviewedGeography.flatMap((p,i)=>p.inland?[2**(15-i)]:[]);
  assert.deepEqual(input.correct,inlandBits);
  assert.equal(body.correctIndex,undefined);assert.equal(body.choices.length,25);
  const counts=[8,8,8,4,3,6,4],offsets=[0,0,0,8,12,15,21];
  assert.deepEqual(body.answerParts,counts.map((n,i)=>({id:`part-${"abcdefg"[i]}`,label:`設問${i<3?1:i<5?2:3} ${"abcdefg"[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})));
  const text=(index:number)=>{const b=body.choices[index][0];assert(b.type==="paragraph"||b.type==="code");return b.text;};
  assert.deepEqual(Array.from({length:8},(_,i)=>text(i)),["2","3","ansC[i]","ansC[i] & ansE[i]","ansC[i] | ansE[i]","ansE[i]","type[i]","type[i] + 1"]);
  const positions=[...pm9DigitSet(input.work)].sort((a,b)=>a-b),low=2**positions[0],high=2**positions[1];
  assert.deepEqual(Array.from({length:4},(_,i)=>text(8+i)),[low,high,input.work-1,2*high+low].map(bitText));
  assert.deepEqual(Array.from({length:3},(_,i)=>text(12+i)),['演算子&&と&とは実行する演算の内容が同じなので、正しい結果を返す','演算子&&はビットごとの論理積を求めることはしないので、誤った結果を返す','変数workには実行前の値が保持されたまま変わらないので、無限ループになる']);
  const dTruth=Array.from({length:4},(_,i)=>text(8+i)===bitText(high));assert.deepEqual(dTruth,[false,true,false,false]);
  const fs=body.choices.slice(15,21).map(b=>{assert.equal(b.length,1);const t=b[0];assert(t.type==="table");assert.deepEqual(t.columns,["値"]);assert.equal(t.rows.length,3);return t.rows.map(row=>{assert.equal(row.length,1);return Number(row[0]);});});
  assert.deepEqual(fs,[[0,0,expected.mark[2]],[0,0,3],[0,expected.mark[2],0],[0,expected.mark[2],2],[expected.mark[2],0,0],[expected.mark[2],0,2]]);
  assert.deepEqual(fs.map(a=>JSON.stringify(a)===JSON.stringify(expected.mark)),[true,false,false,false,false,false]);
  const gs=[0,input.submitted[0],input.submitted[2], [...new Set([...pm9DigitSet(input.submitted[0]),...pm9DigitSet(input.submitted[2])])].reduce((n,p)=>n+2**p,0)];
  assert.deepEqual(Array.from({length:4},(_,i)=>text(21+i)),gs.map(bitText));
  assert.equal(gs.filter(n=>n===expected.sumE).length,1);
  const correct=[5,6,3,1,1,0,gs.indexOf(expected.sumE)];
  assert.deepEqual(body.partAnswers,correct.map((n,i)=>({kind:"choice",partId:`part-${"abcdefg"[i]}`,choiceId:`choice-value-${offsets[i]+n+1}`})));
  const prompt=JSON.stringify(body.prompt);
  assert(prompt.includes('海に面していない'));assert(prompt.includes('正答b、d、e'));
  const code=body.prompt.filter(b=>b.type==='code'&&b.language==='c').map(b=>{assert(b.type==='code');return b.text.split('\n').map(s=>s.trim().replace(/ +/g,' '));});
  assert.deepEqual(code,[
    ['void marking(int numQ, int type[], unsigned int ansC[],','unsigned int ansE[], int mark[]) {','int i;','/* α */','','for (i = 0; i < numQ; i++) {','mark[i] = 0;','if (type[i] == 1) {','if (ansE[i] == ansC[i]) {','mark[i] = 1;','}','}','else if ((2 <= type[i]) && (type[i] <= 8)) {','if (countMarkBits([a]) <= [b]) {','mark[i] = countMarkBits([c]);','}','}','/* β */','}','}'],
    ['int countMarkBits(unsigned int ans) {','int count = 0;','unsigned int work = ans;','','while (work != 0) {','count++;','work = work & (work - 1); /* γ */','}','return count;','}'],
    ['work = work && (work - 1);'],['unsigned int sumC, sumE;'],
    ['else if ((11 <= type[i]) && (type[i] <= 13)) {','if (type[i] == 11) {','sumC = 0;','sumE = 0;','}','sumC = sumC | ansC[i];','if (countMarkBits(ansE[i]) == 1) {','sumE = sumE | ansE[i];','}','if (type[i] == 13) {','mark[i] = countMarkBits(sumC & sumE);','}','}'],
  ]);
  for(const prerequisite of ["16ビット","2≦n≦8","要素数","最上位","引数の値に誤り","n＋1個以上","共に1","countMarkBits","/* α */","/* β */","/* γ */","先頭の問","末尾の問","中間の問"]) {
    assert(prompt.includes(prerequisite),prerequisite);
  }
  assert(prompt.includes(bitText(input.work)));assert.equal(body.prompt.filter(b=>b.type==="diagram").length,9);
  assert.equal(body.prompt.filter(b=>b.type==='table').length,2,'only the original argument/scoring tables');
  const bankEntries=[['a〜cに関する解答群',Array.from({length:8},(_,i)=>text(i))],['dに関する解答群',Array.from({length:4},(_,i)=>text(8+i))],['gに関する解答群',Array.from({length:4},(_,i)=>text(21+i))]] as const;
  for(const [heading,items]of bankEntries){const bank=body.prompt.find(b=>b.type==='diagram'&&b.caption===heading);assert(bank?.type==='diagram');items.forEach((item,i)=>assert(bank.alt.includes('アイウエオカキク'[i]+' '+item)));}
  const eBank=body.prompt.find(b=>b.type==='diagram'&&b.caption==='eに関する解答群');assert(eBank?.type==='diagram');for(let i=0;i<3;i++)assert(eBank.alt.includes('アイウ'[i]+' '+text(12+i)));
  assert(body.explanation.includes(`markは0、0、${expected.mark[2]}`));assert(body.explanation.includes(`sumEは${bitText(expected.sumE)}`));
  assert(body.explanation.includes("最下位の1だけ"));assert(body.explanation.includes("0又は1"));
  assert(body.explanation.includes('ans=4なら本来1個だが2を返し、ans=7なら本来3個だが2を返す'));
  assert(body.explanation.includes('今回のworkの2bitだけでは2と偶然一致'));assert.equal(pm9DigitSet(input.work).size,2);
}
