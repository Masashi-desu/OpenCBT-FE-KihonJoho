import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { validateFormula } from '../../../src/core/validation';
import { legacy2006AutumnPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2006-autumn-pm-01-05';
import { legacy2006AutumnPm0105Figures as figures } from '../../../src/core/generators/legacy-2006-autumn-pm-01-05-figures';
import { legacy2006AutumnPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2006AutumnPm0105Figures';
import { autumn2006Pm01To05Specs as specs } from '../../../scripts/legacy-2006-autumn-pm-01-05-specs';

const versions=[0,1,2,3];
const build=(n:number,i:number)=>definitions[n-1].build([i]);
const text=(blocks:readonly Block[])=>blocks.flatMap(b=>'text' in b?[b.text]:[]).join('\n');
const figure=(blocks:readonly Block[],suffix:string)=>{
 const block=blocks.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile.endsWith(suffix));
 assert(block?.type==='diagram');return block.alt;
};
const marks='アイウエオカキク';
function options(body:GeneratedBody,label:string){
 const part=body.answerParts!.find(item=>item.label===label);assert(part);
 const decision=body.partAnswers!.find(answer=>answer.kind==='choice'&&answer.partId===part.id);
 assert(decision?.kind==='choice');
 return {choiceId:decision.choiceId,choices:part.choiceIds.map(id=>[
  id,text(body.choices[Number(id.replace('choice-value-',''))-1]),
 ] as const)};
}
function unique(body:GeneratedBody,label:string,valid:(value:string)=>boolean){
 const {choiceId,choices}=options(body,label);
 assert.deepEqual(choices.filter(([,candidate])=>valid(candidate)).map(([id])=>id),[choiceId],label);
}
function key(body:GeneratedBody){
 return body.answerParts!.map(({label})=>{
  const {choiceId,choices}=options(body,label);
  return marks[choices.findIndex(([id])=>id===choiceId)];
 }).join('');
}
const number=(s:string)=>Number(s.replaceAll(',',''));

test('全5大問・21欄の公式解答、問題・択構造、共通資料及び不正パラメータを照合する',()=>{
 const official=['クカウイ','ウイエエ','ウイオ','エアイアカ','アキエイエ'];
 assert.deepEqual(specs.map(q=>q.pages),[[4,5],[6,7,8],[9,10,11],[12,13,14,15],[16,17,18,19,20]]);
 for(const [i,def] of definitions.entries()){
  const variations=versions.map(v=>def.build([v]));
  assert.equal(key(variations[0]),official[i]);
  assert.equal([...def.sourceAnswer.matchAll(/=([ァ-ン])/g)].map(m=>m[1]).join(''),official[i]);
  assert.equal(new Set(variations.map(variant=>JSON.stringify(variant.prompt))).size,4);
  const initial=variations[0];
  for(const body of variations){
   assert.deepEqual(body.prompt.map(b=>b.type),initial.prompt.map(b=>b.type));
   assert.deepEqual(body.choices.map(row=>row.map(b=>b.type)),initial.choices.map(row=>row.map(b=>b.type)));
   assert.deepEqual(body.answerParts,initial.answerParts);
   const blocks=body.prompt.filter(b=>b.type==='formula');
   for(const block of blocks)validateFormula(block.text);
   assert(body.explanation.length>50);
   if(i===2||i===3) assert.deepEqual(body.contexts?.[0].blocks.map(b=>b.type==='image'?b.assetId:null),
     ['asset-ipa-2006h18a-fe-pm-page-002','asset-ipa-2006h18a-fe-pm-page-003']);
  }
  for(const invalid of [[],[-1],[4],[0,1],[0.4],Array<number>(1)])assert.throws(()=>def.build(invalid));
  assert(Object.values(specs[i].originalPageAlt).every(alt=>alt.trim().length>100));
 }
});

test('問1は台年当たりの故障率を使って整数8択と費用の極値4択を再計算する',()=>{
 for(const i of versions){
  const body=build(1,i), prompt=text(body.prompt);
  const fleet=number(prompt.match(/装置([\d,]+)台で/)![1]), failed=number(prompt.match(/平均(\d+)台の装置/)![1]);
  const target=number(prompt.match(/MTTF が(\d+)年の機種/)![1]), batch=number(prompt.match(/毎年(\d+)台ずつ/)![1]);
  const change=10000*number(prompt.match(/1台当たり(\d+)万円/)![1]), work=10000*number(prompt.match(/作業費は(\d+)万円/)![1]);
  const types=body.prompt.find(b=>b.type==='table');assert(types);
  const annual=new Map(types.rows.map(([name,price,life])=>{
   const relative=life==='y'?1:Number(life.split(' ')[0]);
   const expectedFailures=fleet/(relative*fleet/failed);
   return [name,batch*(Number(price.replaceAll(',',''))+work)+change*expectedFailures];
  }));
  const [min,,,max]=[...annual.values()].sort((a,b)=>a-b);
  unique(body,'a',v=>number(v)*failed===fleet);
  unique(body,'b',v=>number(v)*target===fleet);
  unique(body,'c',v=>Math.abs((annual.get(v)??-1)-min)<0.001);
  unique(body,'d',v=>Math.abs((annual.get(v)??-1)-max)<0.001);
 }
});

test('問2の正規化の二欄は全記述を査読済みの分類に照合し、SQL二欄は全候補を実行する',()=>{
 const knowledge=[
  { label:'設問1', claims:[/会員表.*データの重複/,/商品表.*情報の独立性/,/販売明細表.*繰返し要素/], chosen:2 },
  { label:'設問2', claims:[/セキュリティ/,/更新する際の影響を局所化/,/移行/,/処理性能/], chosen:1 },
 ];
 for(const i of versions){
  const body=build(2,i), prompt=text(body.prompt);
  for(const {label,claims,chosen} of knowledge)unique(body,label,value=>{
   const matching=claims.flatMap((re,index)=>re.test(value)?[index]:[]);
   assert.equal(matching.length,1);
   return matching[0]===chosen;
  });
  const floor=[10000,8000,12000,6000][i], product=['ワイン','ビール','日本酒','ウイスキー'][i];
  assert(prompt.includes(['1万円','8千円','1万2千円','6千円'][i]+'以上')&&prompt.includes(product+'の購入歴'));
  const db=new DatabaseSync(':memory:');
  try {
   db.exec(`CREATE TABLE 会員表(会員ID INT PRIMARY KEY,氏名 TEXT,住所 TEXT);
      CREATE TABLE 販売表(伝票番号 INT PRIMARY KEY,会員ID INT,販売額 INT);
      CREATE TABLE 商品表(商品コード INT PRIMARY KEY,分類 TEXT);
      CREATE TABLE 販売明細表(伝票番号 INT,商品コード INT,PRIMARY KEY(伝票番号,商品コード));
      INSERT INTO 会員表 VALUES(1,'甲','X'),(2,'乙','Y'),(3,'丙','Z'),(4,'丁','W'),(5,'戊','V');
      INSERT INTO 販売表 VALUES(11,1,${floor}),(12,1,${floor+1}),(21,2,${floor-1}),(22,2,${floor-1}),(31,3,${floor+5}),(41,4,1);
      INSERT INTO 販売明細表 VALUES(11,1),(12,1),(21,2),(22,2),(31,1),(41,2);
      INSERT INTO 商品表 VALUES(1,'その他'),(2,'${product}');`);
   const queries=body.prompt.filter(b=>b.type==='code');
   for(const [index,label,expected] of [[0,'設問3',['甲:X','丙:Z']],[1,'設問4',['丁:W','乙:Y']]] as const){
    unique(body,label,candidate=>{
      const statement=queries[index].text.replace('［'+label+'］',candidate);
      try {
       const rows=db.prepare(statement).all();
       const output=rows.map(row=>row.氏名+':'+row.住所).sort();
       return output.join(',')===[...expected].sort().join(',');
      } catch(error) {
       if(candidate.startsWith('MAX(')||candidate.startsWith('SUM(')||candidate.includes('AND MAX(')||candidate.includes('AND SUM('))return false;
       throw error;
      }
    });
   }
  } finally { db.close(); }
 }
});

type Matrix=number[][];
function determinant(rows:Matrix):number{
 if(rows.length===1)return rows[0][0];
 return rows[0].reduce((sum,n,j)=>sum+(j%2?-n:n)*determinant(rows.slice(1).map(row=>row.filter((_,k)=>k!==j))),0);
}
function referenceSolution(rows:Matrix,b:number[]){
 const base=determinant(rows);
 assert.notEqual(base,0);
 return rows[0].map((_,col)=>determinant(rows.map((row,i)=>row.map((cell,j)=>j===col?b[i]:cell)))/base);
}
function simulateElimination(rows:Matrix,b:number[],pivot:string,backward:string,sum:string){
 const a=rows.map(row=>[...row]), c=[...b], n=a.length;
 for(let step=0;step<n-1;step++){
  const address=pivot.match(/a\[([1kn]),([1kn])\]/);
  assert(address);
  const position=(key:string)=>key==='1'?0:key==='k'?step:n-1;
  const divisor=a[position(address[1])][position(address[2])];
  if(divisor===0)return [];
  for(let i=step+1;i<n;i++){
   const factor=a[i][step]/divisor;
   for(let j=step+1;j<n;j++)a[i][j]-=factor*a[step][j];
   c[i]-=factor*c[step];
  }
 }
 if(!backward.startsWith('i:')||!sum.startsWith('j:'))return [];
 const out=Array<number>(n).fill(NaN);out[n-1]=c[n-1]/a[n-1][n-1];
 const order=backward.includes('n−1')?Array.from({length:n-1},(_,k)=>n-2-k):Array.from({length:n},(_,k)=>k);
 for(const i of order){
  let known=0;
  const columns=sum.includes('i＋1')?Array.from({length:n-i-1},(_,k)=>i+k+1):
    Array.from({length:sum.includes('≦ i')?i+1:n-1},(_,k)=>k);
  for(const j of columns)known+=a[i][j]*out[j];
  out[i]=(c[i]-known)/a[i][i];
 }
 return out;
}
test('問3の各候補でプログラムを解釈し、余因子展開で得た行列の解と照合する',()=>{
 const rows=[[2,1,2],[3,2,1],[2,4,1]], extra=[[11,4],[-3,8]];
 for(const version of versions){
  const body=build(3,version), equations=body.prompt.filter(x=>x.type==='formula');
  const constants=[...equations[6].text.matchAll(/&=(-?[0-9]+)/g)].map(next=>Number(next[1]));
  assert.equal(constants.length,3);
  const expected=referenceSolution(rows,constants);
  const shown=[...equations[10].text.matchAll(/=((-?[0-9]+))(?=(?:\\\\|\\end))/g)].map(m=>Number(m[1])).reverse();
  assert.deepEqual(shown,expected);
  for(const [index,label] of ['a','b','c'].entries()){
   const completed=['Pivot ← a[k,k]','i: n−1, i ≧ 1, −1','j: i＋1, j ≦ n, 1'];
   unique(body,label,candidate=>{
    completed[index]=candidate;
    const probes:[Matrix,number[]][]=[[rows,constants],[extra,[10,19]]];
    return probes.every(([matrix,rhs])=>{
      const actual=simulateElimination(matrix,rhs,completed[0],completed[1],completed[2]);
      const direct=referenceSolution(matrix,rhs);
      return actual.length===direct.length&&direct.every((solution,k)=>Math.abs(actual[k]-solution)<1e-9);
     });
   });
  }
 }
});

function nearestRight(input:readonly string[],next:(position:number)=>number){
 const expected:string[]=[];
 for(const char of input){
  if(char!=='TAB')expected.push(char);
  else {
   const at=expected.length+1, target=next(at);
   for(let j=at;j<target;j++)expected.push('△');
  }
 }
 return expected;
}
const a='Didx ＋ TabGap − 1', b='Didx ← Didx ＋ 1', c='Dst[Didx] ← Src[Sidx]';
const d='TabPos ← TabSet[Tidx]', e='Tidx ← Tidx ＋ 1';
function assignOption(result:string[],line:string,position:number,index:number,src:readonly string[]) {
 if(line===b)return position+1;
 const nextCell=line.includes('Didx ＋ 1')?1:0;
 const nextSource=line.includes('Sidx ＋ 1')?1:0;
 result[position-1+nextCell]=src[index+nextSource];
 return position;
}
function runTab1(input:readonly string[],gap:number,[a,b,c]:readonly string[]){
 const values:string[]=[];
 let position=1;
 for(const [i,char] of input.entries()){
  if(char==='EOS'){values[position-1]='EOS';break;}
  if(char==='TAB'){
   const x=a.includes('−')?-1:1;
   const formula=position+x+(a.includes('TabGap')?gap:0);
   const end=1+gap*Math.floor(formula/gap);
   for(let guard=0;position<end;guard++){
    if(guard>50)return undefined;
    values[position-1]='△';position=assignOption(values,b,position,i,input);
   }
  }else position=assignOption(values,c,position,i,input)+1;
 }
 return values;
}
function runTab2(input:readonly string[],stops:number[],d:string,e:string) {
 const dst:string[]=[];
 let nextIndex=0;
 for(const char of input){
  if(char!=='TAB'){dst.push(char);continue;}
  let end=dst.length+2;
  const column=dst.length+1;
  for(let guard=0;stops[nextIndex]!==-1;guard++){
   if(guard>=30||!Number.isSafeInteger(stops[nextIndex]))return undefined;
   const found=column<stops[nextIndex];
   if(found)end=stops[nextIndex]+(d.includes('＋ Didx')?column:d.includes('− Didx')?-column:0);
   nextIndex=e.includes('Tidx ＋ 1')?nextIndex+1:e.includes('TabPos')?end:column;
   if(found)break;
  }
  if(end<=column)return undefined;
  while(dst.length<end-1)dst.push('△');
 }
 return dst;
}
test('問4の図と全選択肢をタブ位置境界、連続タブ、−1での終端で検証する',()=>{
 for(const index of versions){
  const body=build(4,index), visible=figure(body.prompt,'-tab-run');
  const input=visible.match(/Src：([^。]+)/)![1].split('、');
  const output=visible.match(/Dst：([^。]+)/)![1].split('、');
  const stops=[...figure(body.prompt,'-tab-stops').matchAll(/\]は(\d+)/g)].map(match=>Number(match[1]));
  const gap=Number(text(body.prompt).match(/タブ間隔が(\d+)のとき/)![1]);
  const next=(p:number,g:number)=>Array.from({length:100},(_,i)=>1+(i+1)*g).find(n=>n>p)!;
  assert.deepEqual(nearestRight(input,p=>next(p,gap)),output);
  assert.deepEqual(nearestRight(input,p=>stops.find(n=>n>p)??p+1),output);
  const examples=[input,['TAB','TAB','x','y','TAB','EOS'],['x','y','z','TAB','q','TAB','EOS'],['x','TAB','y','TAB','TAB','TAB','EOS']];
  for(const [column,label] of ['a','b','c'].entries())unique(body,label,candidate=>{
   const filled=[a,b,c];filled[column]=candidate;
   return [2,3,4,5,6,gap].every(g=>examples.every(src=>runTab1(src,g,filled)?.join(',')===nearestRight(src,p=>next(p,g)).join(',')));
  });
  const sets=[[...stops,-1],[2,5,9,-1],[3,7,-1],[2,-1]];
  for(const [column,label] of ['d','e'].entries())unique(body,label,candidate=>{
   if(!candidate.startsWith(column===0?'TabPos ←':'Tidx ←'))return false;
   const filled=[d,e];filled[column]=candidate;
   return sets.every(stops=>examples.every(src=>runTab2(src,stops,filled[0],filled[1])?.join(',')===
    nearestRight(src,p=>stops.find(n=>n>p)??p+1).join(',')));
  });
  const code=body.prompt.filter(b=>b.type==='code').map(b=>b.text);
  assert(code[0].includes('│  │  │  ・［b］\n│  │  ■\n│  ├─────'));
  assert(code[1].includes('│  │  │  │  ・Loop ← false\n│  │  │  ▼\n│  │  │  ・［e］'));
 }
});

function parsePredicate(input:string,kind:string) {
 const condition=input.replace(/牧場区分(＝|≠)“([A-Z])”/g,(_,op,name)=>Number(op==='＝'?name===kind:name!==kind).toString());
 const tokens=condition.match(/0|1|（|）|and|or/g)!;
 let cursor=0;
 function value():boolean{
  const token=tokens[cursor++];
  if(token==='0'||token==='1')return token==='1';
  assert.equal(token,'（');const result=disjunction();assert.equal(tokens[cursor++],'）');return result;
 }
 function all():boolean{
  let lhs=value();
  while(tokens[cursor]==='and'){cursor++;const rhs=value();lhs=lhs&&rhs;}
  return lhs;
 }
 function disjunction():boolean{
  let lhs=all();
  while(tokens[cursor]==='or'){cursor++;const rhs=all();lhs=lhs||rhs;}
  return lhs;
 }
 const result=disjunction();
 assert.equal(cursor,tokens.length);
 return result;
}

test('問5は替わるレコード列、区分ごとの各論理式、切り捨て前後の総量を全択で照合する',()=>{
 const data=[
  {製造日:'1',製品コード:'X',牧場区分:'J',ロット番号:'1'},
  {製造日:'1',製品コード:'Y',牧場区分:'K',ロット番号:'2'},
  {製造日:'2',製品コード:'Y',牧場区分:'K',ロット番号:'2'},
  {製造日:'2',製品コード:'Y',牧場区分:'J',ロット番号:'3'},
 ] as const;
 for(const i of versions){
  const body=build(5,i), prompt=text(body.prompt), all=prompt.match(/を表す“([A-Z])”，“([A-Z])”，“([A-Z])”，又は混合を表す“([A-Z])”/)!.slice(1);
  const last=prompt.match(/誤差は，([A-Z])牧場/)![1];
  const allocated=all.slice(0,3).filter(x=>x!==last).map(x=>x.toLowerCase());
  const validFarms=all.slice(0,3), mix=all[3];
  const decision=figure(body.prompt,'-dispatch');
  const mixDiagram=figure(body.prompt,'-mix-flow');
  assert(decision.includes('必要量ファイルの終わり又は［a］'));
  assert(mixDiagram.includes('w'+allocated[0]+'←')&&mixDiagram.includes('w'+allocated[1]+'←'));
  assert(mixDiagram.includes('w'+last.toLowerCase()+'←［d］'));
  unique(body,'a',candidate=>{
   const key=candidate.replace('が変わる','') as keyof (typeof data)[number];
   return [1,2,3].filter(n=>data[n-1][key]!==data[n][key]).join(',')==='2';
  });
  unique(body,'b',v=>[...all,'X','0'].every(kind=>parsePredicate(v,kind)===(kind===mix)));
  unique(body,'c',v=>[...validFarms,'X','0'].every(kind=>parsePredicate(v,kind)===validFarms.includes(kind)));
  unique(body,'d',v=>[1,2,13,31,57,100].every(total=>{
   const ratios=new Map([[allocated[0],33],[allocated[1],33],[last.toLowerCase(),34]]);
   const amounts=new Map(Array.from(ratios,([farm,p])=>[farm,Math.floor(total*p/100)]));
   const variables=[...v.matchAll(/w([a-z])/g)].map(m=>m[1]);
   const terms=[...v.matchAll(/([A-Z])牧場の割合/g)].map(m=>m[1].toLowerCase());
   let result=total;
   if(variables.length) for(const term of variables)result-=amounts.get(term)!;
   else {
    const percent=v.includes('100 −')?100-terms.reduce((n,term)=>n+ratios.get(term)!,0):ratios.get(terms[0])!;
    result=Math.floor(total*percent/100);
   }
   return result+amounts.get(allocated[0])!+amounts.get(allocated[1])! === total;
  }));
  const usesCategory=new Map([['エラー',false],['混合',false],['集計',false],['単一',true]]);
  unique(body,'設問3',v=>{assert(usesCategory.has(v));return usesCategory.get(v)!;});
 }
});

test('全図の登録は当該原問へ所属し、レンダラーのラベル・説明・キーボード操作を保持する',()=>{
 const seen=new Set<string>();
 for(const n of [2,4,5]){
  for(const i of versions){
   for(const block of build(n,i).prompt){
    if(block.type!=='diagram'||block.scene.kind!=='source_figure')continue;
    const {profile,values}=block.scene;
    const definition=figures.find(item=>item.profile===profile);
    const renderer=renderers.find(item=>item.profile===profile);
    assert(definition&&renderer);
    assert(profile.startsWith('legacy-2006-autumn-pm-'+n+'-'));
    definition.validate(values);
    assert.equal(definition.alt(values),block.alt);
    for(const invalid of [[],[-1],[false],[values[0],1],[0.5]]) assert.throws(()=>definition.validate(invalid as number[]));
    const markup=renderToStaticMarkup(createElement(renderer.component,{values,caption:block.caption}));
    assert(markup.includes('role="img"')&&markup.includes('aria-describedby=')&&markup.includes('tabindex="0"'));
    assert(markup.includes('<title')&&markup.includes('<desc')&&markup.includes(profile));
    seen.add(profile+':'+values[0]);
   }
  }
 }
 assert.equal(seen.size,25);
});
