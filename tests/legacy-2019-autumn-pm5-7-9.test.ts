import {tmpdir} from 'node:os';import {fileURLToPath}from'node:url';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {legacy2019AutumnStressDefinitions as q5} from '../src/core/generators/legacy-2019-autumn-pm5';
import {legacy2019AutumnProgressDefinitions as q6} from '../src/core/generators/legacy-2019-autumn-pm6';
import {legacy2019AutumnProfitDefinitions as q7} from '../src/core/generators/legacy-2019-autumn-pm7';
import {legacy2019AutumnDumpDefinitions as q9,autumnDumpOutput,autumnDumpCode} from '../src/core/generators/legacy-2019-autumn-pm9';
const P=fs.mkdtempSync(path.join(tmpdir(),'legacy-2019-autumn-pm9-')),tables=(b:any)=>b.prompt.filter((x:any)=>x.type==='table'),numbers=(a:string[])=>a.map(s=>Number(s.replaceAll(',',''))),text=(b:any)=>b.prompt.filter((x:any)=>x.type==='paragraph').map((x:any)=>x.text).join('\n');
function choices(b:any,i:number){return b.answerParts[i].choiceIds.map((id:string)=>b.choices[Number(id.split('-').at(-1))-1]);}
function picked(b:any,i:number){const a=b.partAnswers.find((a:any)=>a.partId===b.answerParts[i].id);assert(a?.kind==='choice');return b.answerParts[i].choiceIds.indexOf(a.choiceId);}
const stringChoices=(b:any,i:number)=>choices(b,i).map((blocks:any[])=>{assert.equal(blocks.length,1);assert.equal(blocks[0].type,'paragraph');return blocks[0].text;});
function allInputs(def:any):number[][]{let v:number[][]=[[]];for(const f of def.fields)v=v.flatMap(a=>Array.from({length:f.maximum-f.minimum+1},(_,i)=>[...a,f.minimum+i]));return v;}
const reviewedAnswers={5:[0,4,7,6,4,7],6:[0,0,3,3,1,1],7:[1,1,0,1,2],9:[0,1,0,4,4,2]};
test('raw QS/ANS visually reviewed reference keeps every field, bank count and tuple',()=>{for(const[defs,count,answer]of[[q5,[8,8,8,8,10,10],reviewedAnswers[5]],[q6,[3,3,4,4,5,4],reviewedAnswers[6]],[q7,[4,4,4,5,4],reviewedAnswers[7]],[q9,[4,4,3,6,6,6],reviewedAnswers[9]]]as any[]){const b=defs[0].build(defs[0].reference);assert.deepEqual(b.answerParts.map((p:any)=>p.choiceIds.length),count);assert.deepEqual(b.answerParts.map((_:any,i:number)=>picked(b,i)),answer);}assert.equal(q7[0].build([0,0,0]).answerParts!.filter(p=>p.id==='part-c').length,1);assert.equal(q9[0].build([0,0,0]).answerParts!.filter(p=>p.id==='part-b').length,1);});
function predicate(s:string,x:number){const r=s.match(/^(\d+)点以上かつ(\d+)点以下$/);if(r)return x>=Number(r[1])&&x<=Number(r[2]);const q=s.match(/^(\d+)点(以上|以下)$/);assert(q,s);return q[2]==='以上'?x>=Number(q[1]):x<=Number(q[1]);}
const region=(row:number[])=>row[1]>=77?'one':row[1]>=63&&row[0]+row[2]>=76?'two':'outside';
const route=(row:number[])=>row[1]>=77?'upper':row[1]<63?'lower':row[0]+row[2]>=76?'middle-yes':'middle-no';
function setsOfSix(){return Array.from({length:63},(_,mask)=>Array.from({length:6},(_,i)=>i).filter(i=>((mask+1)&(1<<i))!==0));}
test('Q5 all111 bodies: feasible integer totals, four conditional truth sets, all ten minimal-cover candidates',()=>{
 const input=allInputs(q5[0]);assert.equal(input.length,111);const promptSet=new Set();
 for(const v of input){const b=q5[0].build(v),rows=tables(b).find((t:any)=>t.caption.startsWith('表2')).rows.map((r:string[])=>numbers(r.slice(1))),bank=stringChoices(b,0);assert.equal(rows.length,6);promptSet.add(JSON.stringify(b.prompt));
  for(const row of rows)for(const[i,n]of[17,29,9].entries()){assert(Number.isInteger(row[i])&&row[i]>=n&&row[i]<=4*n);let extra=row[i]-n;const ratings=Array.from({length:n},()=>{const add=Math.min(3,extra);extra-=add;return 1+add;});assert.equal(extra,0);assert.equal(ratings.reduce((a,b)=>a+b),row[i]);}
  const expected=[(x:number)=>x<63,(x:number)=>x>=63&&x<77,(x:number)=>x>=76,(x:number)=>x<76];
  for(let part=0;part<4;part++){const lo=part<2?29:26,hi=part<2?116:104;const correct=bank.map((s:string,i:number)=>Array.from({length:hi-lo+1},(_,j)=>j+lo).every(x=>predicate(s,x)===expected[part](x))?i:-1).filter((i:number)=>i>=0);assert.deepEqual(correct,[picked(b,part)]);}
  for(const[part,classify]of[[4,region],[5,route]]as const){const targets=new Set(rows.map(classify)),covers=(indices:number[])=>new Set(indices.map(i=>classify(rows[i]))).size===targets.size;const min=Math.min(...setsOfSix().filter(covers).map(x=>x.length));const hits=stringChoices(b,part).flatMap((s:string,i:number)=>{const a=(s.match(/\d+/g)??[]).map(n=>Number(n)-1);assert.equal(new Set(a).size,a.length);assert(a.every(n=>n>=0&&n<6));return a.length===min&&covers(a)?[i]:[];});assert.deepEqual(hits,[picked(b,part)]);assert.equal(min,part===4?3:4);}
 }
 assert.equal(promptSet.size,111);
});
const total=(xs:number[])=>xs.reduce((a,b)=>a+b),qualityClass=(done:number,bugs:number)=>{const a=BigInt(bugs)*200n,d=BigInt(done);return a<d*3n?0:a<d*4n?1:a<=d*5n?2:3;};
test('Q6 all120 rendered tables independently determine numeric answers, staff premises and fixed semantic action maps',()=>{
 const inputs=allInputs(q6[0]);assert.equal(inputs.length,120);const seen=new Set();
 const action=['テスト要員を追加する','テスト項目を再度洗い出す','テストデータを再作成する'],review=['機能2担当者が担当した機能の詳細設計書の再レビュー','全機能の詳細設計書の再レビュー'];
 for(const v of inputs){const b=q6[0].build(v),ts=tables(b),plan=ts.find((t:any)=>t.caption.startsWith('表1')),actual=ts.find((t:any)=>t.caption.startsWith('表2')),plannedByPerson=ts.find((t:any)=>t.caption.startsWith('表3')),assigned=numbers(actual.rows[0].slice(1)),done=numbers(actual.rows[1].slice(1)),bugs=numbers(actual.rows[2].slice(1)),left=total(assigned)-total(done),leftPlan=Number(plan.rows[0][4].replaceAll(',','')),bugPlan=Number(plan.rows[1][4].replaceAll(',',''));
  assert.equal(picked(b,0),left>leftPlan?0:left===leftPlan?1:2);assert.equal(picked(b,1),total(bugs)>bugPlan?0:total(bugs)===bugPlan?1:2);assert.equal(picked(b,2),qualityClass(total(done),total(bugs)));
  const numerator=BigInt(assigned[1])*BigInt(total(assigned)-leftPlan),den=BigInt(total(assigned));assert.equal(numerator%den,0n);const d=Number(numerator/den);const ds=stringChoices(b,3).map((x:string)=>Number(x.replaceAll(',','')));assert.deepEqual(ds.flatMap((x:number,i:number)=>x===d?[i]:[]),[picked(b,3)]);
  for(const i of[1,2,3]){const expected=assigned[i]*(total(assigned)-leftPlan)/total(assigned);assert(done[i]*10>=expected*9&&done[i]*10<=expected*11);assert([1,2].includes(qualityClass(done[i],bugs[i])));}assert(done[0]*10<assigned[0]*(total(assigned)-leftPlan)/total(assigned)*9);assert(done[4]*10<assigned[4]*(total(assigned)-leftPlan)/total(assigned)*9);assert([1,2].includes(qualityClass(done[0],bugs[0])));assert(bugs[4]*50>done[4]);
  assert.equal(stringChoices(b,4)[picked(b,4)],action[v[2]]);assert.equal(stringChoices(b,5)[picked(b,5)],review[v[3]]);assert(text(b).includes(v[2]===0?'作業量が担当者一人の処理能力を超え':v[2]===1?'一部の項目が漏れ':'前提を満たさない誤り'));assert(text(b).includes(v[3]===0?'Eさんの担当外の機能も含まれる':'全機能の詳細設計書に同じ誤り'));assert.equal(plannedByPerson.rows[0][3],'非表示');seen.add(JSON.stringify(b.prompt));
 }assert.equal(seen.size,120);
});
const rounded=(n:bigint,d:bigint)=>Number((2n*n+d)/(2n*d));
test('Q7 all100 bodies: solve each displayed option by exact accounting equations; tuple remains one field and all money integral',()=>{
 const inputs=allInputs(q7[0]);assert.equal(inputs.length,100);const seen=new Set();
 for(const v of inputs){const b=q7[0].build(v),ts=tables(b),t1=ts.find((t:any)=>t.caption.startsWith('表1')),t2=ts.find((t:any)=>t.caption.startsWith('表2')),t5=ts.find((t:any)=>t.caption.startsWith('表5')),t6=ts.find((t:any)=>t.caption.startsWith('表6')),S=BigInt(t1.rows[0][1].replaceAll(',','')),cost=BigInt(t1.rows[1][1].replaceAll(',','')),F=BigInt(t2.rows[0][1].replaceAll(',','')),V=BigInt(t2.rows[1][1].replaceAll(',','')),goal=BigInt(t5.rows[3][1]),SZ=BigInt(t5.rows[0][2].replaceAll(',','')),FZ=BigInt(t2.rows[0][3].replaceAll(',','')),raw=text(b),discount=BigInt(raw.match(/一律(\d+)%を値引き/)![1]);
  for(let part=0;part<2;part++){const candidates=stringChoices(b,part).map((s:string)=>BigInt(s.replaceAll(',','')));const hits=candidates.flatMap((x:bigint,i:number)=>(part===0?(S+x-cost)*100n===(S+x)*16n:(S-cost+x)*100n===S*16n)?[i]:[]);assert.deepEqual(hits,[picked(b,part)]);}
  const tuples=choices(b,2).map((x:any[])=>{assert.equal(x[0].type,'table');assert.deepEqual(x[0].columns,['c1（百万円）','c2（%）']);return x[0].rows[0].map((s:string)=>BigInt(s.replaceAll(',','')));});
  const valid=tuples.flatMap(([cut,c2]:bigint[],i:number)=>{const margin=S-V,xGoal=(margin-(F-cut))*100n===goal*margin;const zMargin=SZ/2n,zRate=rounded((zMargin-FZ-cut)*100n,zMargin);return xGoal&&BigInt(zRate)===c2?[i]:[];});assert.deepEqual(valid,[picked(b,2)]);
  const expectedD=V*(100n-discount)/100n;assert.equal(V*(100n-discount)%100n,0n);const ds=stringChoices(b,3).map((s:string)=>BigInt(s.replaceAll(',','')));assert.deepEqual(ds.flatMap((x:bigint,i:number)=>x===expectedD?[i]:[]),[picked(b,3)]);const expectedE=rounded((S-F-expectedD)*100n,S),es=stringChoices(b,4).map(Number);assert.deepEqual(es.flatMap((x:number,i:number)=>x===expectedE?[i]:[]),[picked(b,4)]);assert.equal(new Set(es).size,4);assert.equal(t6.rows[0][1],t6.rows[0][2]);assert(raw.includes('表中のパーセント値は小数第1位を四捨五入'));assert(raw.includes('設問1・2の施策は適用しない'));seen.add(JSON.stringify(b.prompt));
 }assert.equal(seen.size,100);
});
const nativeDir=path.join(P,'native');fs.mkdirSync(nativeDir);
const referenceSource=fileURLToPath(new URL('./fixtures/legacy-2019-autumn/pm9-reference.c',import.meta.url));
const candidateSource=path.join(nativeDir,'actual-displayed.c'),candidateBinary=path.join(nativeDir,'actual-displayed');
fs.writeFileSync(candidateSource,autumnDumpCode.replace('[a]','chr & 0x0F').replace('[b1]','&&').replace('[b2]','||').replace('[c]','cnt > from').replace('[d]','pos == WIDTH')+'\n#include <stdlib.h>\nint main(int n,char **v){if(n!=4)return 2;dump(v[1],strtol(v[2],0,10),strtol(v[3],0,10));return 0;}\n');
for(const[source,exe]of[[referenceSource,path.join(nativeDir,'pdf-transcribed-dump')],[candidateSource,candidateBinary]]){const cc=spawnSync('cc',['-std=c11','-O1','-g','-fsanitize=address,undefined','-fno-omit-frame-pointer',source,'-o',exe],{encoding:'utf8',timeout:30000});assert.equal(cc.status,0,cc.stderr);}
const nativeCache=new Map<string,string>();function native(bytes:number[],from:number,to:number){const key=JSON.stringify([bytes,from,to]);if(nativeCache.has(key))return nativeCache.get(key)!;const file=path.join(P,'native/input.bin');fs.writeFileSync(file,Uint8Array.from(bytes));const p=spawnSync(path.join(P,'native/pdf-transcribed-dump'),[file,String(from),String(to)],{encoding:'utf8',timeout:5000,env:{...process.env,ASAN_OPTIONS:'detect_leaks=0',UBSAN_OPTIONS:'halt_on_error=1'}});assert.equal(p.status,0,p.stderr);assert.equal(p.stderr,'');const actual=spawnSync(candidateBinary,[file,String(from),String(to)],{encoding:'utf8',timeout:5000,env:{...process.env,ASAN_OPTIONS:'detect_leaks=0',UBSAN_OPTIONS:'halt_on_error=1'}});assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,p.stdout);assert.equal(actual.stderr,'');nativeCache.set(key,p.stdout);return p.stdout;}
test('Q9 all192 displayed bodies: C sanitizer execution confirms selected boundary strings and one tuple b',()=>{
 const inputs=allInputs(q9[0]);assert.equal(inputs.length,192);const seen=new Set();
 for(const v of inputs){const b=q9[0].build(v);assert(b.prompt.some(x=>x.type==='code'&&x.language==='c'&&x.text===autumnDumpCode));const s=text(b),m=s.match(/ケース1：ファイルサイズ100、from=(\d+)、to=(\d+)/)!,empty=s.match(/ケース2：ファイルサイズ0、from=(\d+)、to<0/)!,e=native(Array(100).fill(0),Number(m[1]),Number(m[2])).trim().split('\n').at(-1),f=native([],Number(empty[1]),-1).trim();assert.deepEqual(stringChoices(b,4).flatMap((choice:string,i:number)=>choice===e?[i]:[]),[picked(b,4)],'e unique in actual displayed bank');assert.deepEqual(stringChoices(b,5).flatMap((choice:string,i:number)=>choice===f?[i]:[]),[picked(b,5)],'f unique in actual displayed bank');assert.equal(choices(b,1).length,4);assert(choices(b,1).every((blocks:any[])=>blocks.length===1&&blocks[0].type==='table'&&blocks[0].rows[0].length===2));assert(s.includes('通常入力条件を満たさない'));assert(s.includes('2^31'));seen.add(JSON.stringify(b.prompt));
 }assert.equal(seen.size,192);
});
test('Q9 pure output helper agrees with independent PDF-transcribed C on all256 bytes and boundary partitions',()=>{
 for(const size of[0,1,2,59,60,61,119,120,121,255,256,257]){const data=Array.from({length:size},(_,i)=>(i*29+71)%256),starts=size?[0,Math.floor(size/2),size-1]:[0,1];for(const from of new Set(starts))for(const to of new Set(size?[-1,from,size-1]:[-1]))assert.equal(autumnDumpOutput(data,from,to),native(data,from,to));}
 const data=Array.from({length:256},(_,i)=>i);assert.equal(autumnDumpOutput(data,0,-1),native(data,0,-1));
});
// Fixed source facts from QS48, independently read; these are not built from answer metadata.
const reviewedQ9Banks=[['chr & 0x0F','chr & 0xF0','chr && 0x0F','chr && 0xF0'],[['&&','&&'],['&&','||'],['||','&&'],['||','||']],['cnt > from','cnt >= from','cnt >= from - 1'],['cnt == WIDTH - 1','cnt == WIDTH','cnt == WIDTH + 1','pos == WIDTH - 1','pos == WIDTH','pos == WIDTH + 1']];
function nibbleExpression(source:string,chr:number){const m=/^chr (&&|&) (0x[0-9A-F]+)$/.exec(source);assert(m,source);const mask=Number(m[2]);return m[1]==='&'?chr&mask:Number(Boolean(chr)&&Boolean(mask));}
function fromExpression(source:string,cnt:number,from:number){const m=/^cnt (>=|>) from(?: - (1))?$/.exec(source);assert(m,source);const limit=from-(m[2]?1:0);return m[1]==='>'?cnt>limit:cnt>=limit;}
function widthExpression(source:string,cnt:number,pos:number){const m=/^(cnt|pos) == WIDTH(?: ([+-]) (1))?$/.exec(source);assert(m,source);const rhs=60+(m[2]==='+'?1:m[2]==='-'?-1:0);return(m[1]==='cnt'?cnt:pos)===rhs;}
const boolOperator=(operator:string,a:boolean,b:boolean)=>{assert(operator==='&&'||operator==='||');return operator==='&&'?a&&b:a||b;};
test('Q9 all wrong program-expression candidates have independent witnesses',()=>{
 const boolInputs=[false,true].flatMap(e=>[false,true].flatMap(negative=>[false,true].map(inRange=>[e,negative,inRange]))),positionInputs=[[1,1],[59,59],[60,60],[61,1],[119,59],[120,60],[121,1]],fromInputs=[0,1,2,59,60,61,99,100];
 for(const values of allInputs(q9[0])){
  const b=q9[0].build(values),a=stringChoices(b,0),c=stringChoices(b,2),d=stringChoices(b,3),tuples=choices(b,1).map((blocks:any[])=>{assert.equal(blocks.length,1);const table=blocks[0];assert.equal(table.type,'table');assert.deepEqual(table.columns,['b1','b2']);assert.equal(table.rows.length,1);return table.rows[0] as string[];});
  assert.deepEqual([a,tuples,c,d],reviewedQ9Banks,'actual displayed source program banks');
  const hitsA=a.flatMap((source:string,i:number)=>Array.from({length:256},(_,chr)=>chr).every(chr=>nibbleExpression(source,chr)===chr%16)?[i]:[]);
  const hitsB=tuples.flatMap((operators:string[],i:number)=>boolInputs.every(([e,negative,inRange])=>boolOperator(operators[0],e,boolOperator(operators[1],negative,inRange))===(e&&(negative||inRange)))?[i]:[]);
  const hitsC=c.flatMap((source:string,i:number)=>fromInputs.every(from=>Array.from({length:122},(_,i)=>i+1).every(cnt=>fromExpression(source,cnt,from)===(cnt-1>=from)))?[i]:[]);
  const hitsD=d.flatMap((source:string,i:number)=>positionInputs.every(([cnt,pos])=>widthExpression(source,cnt,pos)===(pos===60))?[i]:[]);
  for(const[part,hits]of[[0,hitsA],[1,hitsB],[2,hitsC],[3,hitsD]]as const)assert.deepEqual(hits,[picked(b,part)],'independent truth uniquely matches actual answer ID '+part);
 }
});
test('generator field bounds reject out-of-domain and non-integer values',()=>{for(const defs of[q5,q6,q7,q9]){const d=defs[0];for(let i=0;i<d.fields.length;i++)for(const wrong of[d.fields[i].minimum-1,d.fields[i].maximum+1,0.5,NaN]){const v=[...d.reference];v[i]=wrong;assert.throws(()=>d.build(v));}}});
