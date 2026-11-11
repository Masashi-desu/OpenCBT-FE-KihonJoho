import {addReviewedStemCase} from "../../../src/core/generators/reviewed-stem-cases";
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import official from '../../fixtures/legacy-2016-autumn-am-source-facts.json';
import {knowledgeKeys,variableStemMarkers,rejectedStatements,knowledgeReviewBasis,reviewedVariantPrompts,independentFsmValid,independentBstValid,independentGateTruth,independentReferences} from '../../fixtures/legacy-2016-autumn-am-01-40-oracle';
import {legacy2016AutumnAm0140Definitions,legacy2016AutumnAm0140IncludedNumbers,legacy2016AutumnAm0140HeldNumbers,legacy2016AutumnAm0140FigureAllowed,legacy2016AutumnAm0140FigureAlt,legacy2016AutumnAm0140FigureDomains,legacy2016AutumnAm0140StudyTerms} from '../../../src/core/generators/legacy-2016-autumn-am-01-40';
import {Legacy2016AutumnAm0140Figures} from '../../../src/ui/Legacy2016AutumnAm0140Figures';
import type {GeneratedBody} from '../../../src/core/generators/definition';
import type {Block,Bundle,Template} from '../../../src/core/types';
import {parametersForSeed,checkParameters} from '../../../src/core/generation';
import {ensureStage3MorningGenerators} from '../../../src/core/generators/stage3-morning-install';
import {additionalDefinitions,additionalContracts,additionalVersion} from '../../../src/core/generators';
import {schema,validateFormula} from '../../../src/core/validation';
import {readDistributionBundle} from '../../../scripts/distribution-files';
const defs=legacy2016AutumnAm0140Definitions(),sourceRows=official.rows.slice(0,40) as any[],done=new Set<string>();
const text=(blocks:Block[])=>blocks.map(b=>'text'in b?b.text:b.type==='table'?b.rows.map(r=>r.join('｜')).join('\n'):b.type==='list'?b.items.join('\n'):'').join('\n');
const stem=(body:GeneratedBody)=>{const b=body.prompt[0];assert.equal(b.type,'paragraph');return b.type==='paragraph'?b.text:'';};
const normalize=(s:string)=>s.replaceAll('10^6','10⁶').replaceAll('10^8','10⁸');
const options=(b:GeneratedBody)=>b.choices.map(text);
function figValues(b:Block){assert.equal(b.type,'diagram');if(b.type!=='diagram'||b.scene.kind!=='source_figure')throw Error('SOURCE_FIGURE');return{profile:b.scene.profile,values:b.scene.values};}
const onlyFigure=(b:GeneratedBody)=>figValues(b.prompt.find(x=>x.type==='diagram')!);
function each(ns:number[],fn:(n:number,c:number,b:GeneratedBody)=>void){for(const n of ns){const d=defs[n-1];for(let c=0;c<=d.fields[0].maximum;c++){const b=d.build([c]);fn(n,c,b);done.add(n+'/'+c);}}}
function unique(b:GeneratedBody,predicate:(v:string,i:number)=>boolean){const valid=options(b).flatMap((v,i)=>predicate(v,i)?[i]:[]);assert.deepEqual(valid,[b.correctIndex],stem(b));}
function tables(b:GeneratedBody){return b.prompt.filter((p):p is Extract<Block,{type:'table'}>=>p.type==='table');}
function knowledge(n:number,c:number,b:GeneratedBody){
 const original=sourceRows[n-1],expected=knowledgeKeys[n][c],choice=options(b);assert(knowledgeReviewBasis[n]);assert.equal(b.choices.length,4);assert(!/適切でない|正しくない|誤っている/.test(stem(b)));
 if(n===5){const expectedOrder=['標本化','量子化','符号化'];for(const x of choice)assert.deepEqual(x.split('，').sort(),expectedOrder.slice().sort());unique(b,s=>JSON.stringify(s.split('，'))===JSON.stringify(expectedOrder));}
 else if(n===18){const expectedOrder=['実行状態の退避','プロセスの選択','実行状態の回復'];const rows=b.choices.map(cs=>{const t=cs[0];assert.equal(t.type,'table');if(t.type!=='table')throw Error();assert.deepEqual(t.columns,['a','b','c']);assert.equal(t.rows.length,1);return t.rows[0];});for(const row of rows)assert.deepEqual(row.slice().sort(),expectedOrder.slice().sort());assert.deepEqual(rows.flatMap((r,i)=>JSON.stringify(r)===JSON.stringify(expectedOrder)?[i]:[]),[b.correctIndex]);}
 else if(rejectedStatements[n]&&c){const all=rejectedStatements[n][c-1].slice();all.splice(expected,0,original.originalChoices[expected]);assert.deepEqual(choice,all);assert.equal(stem(b),normalize(original.promptParagraphs[0]));}
 else assert.deepEqual(choice,original.originalChoices);
 if(reviewedVariantPrompts[n])assert.equal(stem(b),normalize(c?reviewedVariantPrompts[n][c-1]:original.promptParagraphs[0]));
 if(variableStemMarkers[n])assert(stem(b).includes(variableStemMarkers[n][c]),n+'/'+c+' target '+variableStemMarkers[n][c]);
 if(n===24){const t=tables(b)[0];assert.deepEqual(t.columns,['伝票番号','注文日','商品コード','数量','顧客コード']);assert.deepEqual(t.rows,[['（文字）','（文字）','（文字）','（数値）','（文字）']]);}
 if(n===30){const committed=c<4,old=new Map([['existing',1]]),after=new Map(old);if([1,5].includes(c))after.set('added',2);else if([2,6].includes(c))after.delete('existing');else after.set('existing',9);const target=committed?after:old;assert.notDeepEqual([...after],[...old]);assert.deepEqual([...target],committed?[...after]:[...old]);assert(stem(b).includes('トランザクションログ'));if(c&&committed)assert(stem(b).includes('完了した'));if(!committed)assert(/完了する前|完了していない/.test(stem(b)));assert.equal(choice[b.correctIndex!],committed?'ロールフォワード':'ロールバック');}
 assert.equal(b.correctIndex,expected,n+'/'+c);assert(b.explanation.length>45);
}

test('all forty source obligations and official cells remain explicit, with no source/registry/public admission by this unit',()=>{
 assert.deepEqual(legacy2016AutumnAm0140IncludedNumbers,Array.from({length:40},(_,i)=>i+1));assert.deepEqual(legacy2016AutumnAm0140HeldNumbers,[]);assert.equal(defs.length,40);assert.equal(new Set(defs.map(d=>d.source)).size,40);
 for(const [i,d]of defs.entries()){assert.equal(d.source,sourceRows[i].source);assert.equal(sourceRows[i].status,'eligible_materials_reviewed');assert.equal(d.sourceAnswer,sourceRows[i].officialKey);assert.deepEqual(d.reference,[0]);assert.equal(d.version,'3.2.0');assert.equal(d.fields.length,1);}
 assert(independentReferences.length>=9);
});

test('all original zero stems, source choices, ordered conditions and six-row duplicates are independently retained',()=>{
 for(const[n0,d]of defs.entries()){const n=n0+1,b=d.build([0]),s=sourceRows[n0];assert.equal(stem(b),normalize(s.promptParagraphs[0]));assert.equal('アイウエ'[b.correctIndex!],s.officialKey);assert.equal(b.choices.length,4);assert(!b.answerParts);assert(!b.partAnswers);
  if(![3,6,18,21,23].includes(n))assert.deepEqual(options(b),s.originalChoices,'all source choices '+n);
  if(s.conditions){const block=b.prompt.find(x=>x.type==='list');assert(block?.type==='list');assert.equal(block.ordered,true);assert.deepEqual(block.items,s.conditions);}
 }
 const r=tables(defs[26].build([0]))[0].rows;assert.equal(r.length,6);assert.deepEqual(r[0],r[1]);
 assert(!sourceRows[14].originalPrompt.includes('故障は独立'));assert(text(defs[14].build([0]).prompt).includes('2台の故障は独立'));
});

test('every knowledge option is checked against full independently frozen statements or a separately reviewed concept/ordering oracle',()=>{each(Object.keys(knowledgeKeys).map(Number),knowledge);});

test('knowledge regressions reject changed targets, reversed direction, a false replacement answer and changed full distractors',()=>{
 for(const n of [13,14,19,26,37,38,39,40]){const d=defs[n-1],b=d.build([1]);const target=structuredClone(b);target.prompt[0]={type:'paragraph',text:'別カテゴリの意味として，適切なものはどれか。'};assert.throws(()=>knowledge(n,1,target));const q=structuredClone(b);q.choices[q.correctIndex!]=[{type:'paragraph',text:'前提にない異なる概念を定義する。'}];assert.throws(()=>knowledge(n,1,q));const wrong=structuredClone(b);wrong.choices[(wrong.correctIndex!+1)%4]=[{type:'paragraph',text:'この候補も正しい。'}];assert.throws(()=>knowledge(n,1,wrong));}
});

test('bit preservation is exhaustively checked for all256 inputs and all four operations',()=>each([1],(_,c,b)=>{
 const a=stem(b).match(/(上位|下位)(\d+)ビット/)!;assert(a);const k=Number(a[2]),maskText=options(b)[0].match(/表記([\dA-F]{2})/)!;assert(maskText);const m=parseInt(maskText[1],16),keep=a[1]==='上位'?((1<<k)-1)<<(8-k):(1<<k)-1;
 const truth=[0,1,2,3].map(op=>Array.from({length:256},(_,x)=>{const y=[x^m,(~(x&m))&255,x&m,x|m][op];return(y&keep)===(x&keep);}).every(Boolean));assert.deepEqual(truth.flatMap((v,i)=>v?[i]:[]),[b.correctIndex]);assert.equal(b.correctIndex,2);assert(c>=0);
}));

test('conditional probability uses a10000-product frequency population, not the production formula, and keeps whole-percent choices',()=>each([2],(_,c,b)=>{
 const s=stem(b),ms=s.match(/全体の(\d+)%.*ラインBでは(\d+)%.*製品の(\d+)%.*製品の(\d+)%/)!;assert(ms);const[p,q,a,z]=ms.slice(1).map(Number);assert.equal(p+q,100);const products=Array.from({length:10000},(_,i)=>({line:i<p*100?'A':'B',bad:i<p*100?i%100<a:(i-p*100)%100<z}));const bad=products.filter(x=>x.bad),answer=products.filter(x=>x.bad&&x.line==='A').length*100/bad.length;assert(Number.isInteger(answer));unique(b,v=>Number(v)===answer);const values=options(b).map(Number);assert.equal(new Set(values).size,4);assert(values.every(v=>Number.isInteger(v)&&v>=0&&v<=100));assert(Math.min(...values.filter(v=>v!==answer).map(v=>Math.abs(v-answer)))>=answer*.1);assert(b.explanation.includes(answer+'%'));assert(c>=0);
}));

test('bit-pattern ratios count Boolean vectors by exact powers, while Euclidean results use an independent divisor enumeration',()=>each([4,7],(n,_,b)=>{
 if(n===4){const m=stem(b).match(/(\d+)ビット.*?個数は，(\d+)ビット/)!;const big=1n<<BigInt(m[1]),small=1n<<BigInt(m[2]);unique(b,x=>BigInt(x)*small===big);}
 else {const m=stem(b).match(/F\((\d+)[,，](\d+)\)の値/)!;assert(m);const[x,y]=m.slice(1).map(Number),common=Array.from({length:y},(_,i)=>i+1).filter(d=>x%d===0&&y%d===0);unique(b,v=>Number(v)===Math.max(...common));assert.match(stem(b),/x＞y≧0/);assert.match(stem(b),/余り/);const f=b.prompt.find(p=>p.type==='formula');assert(f?.type==='formula');assert.match(f.text,/y=0/);assert.match(f.alt,/y>0/);assert(x>=100&&x<=999&&y>=10&&y<=99);}
}));

test('all state-machine and tree choices are independently traced or inorder-validated, including the original nondeterministic arc',()=>each([3,6],(n,c,b)=>{
 const values=b.choices.map(choice=>figValues(choice[0]).values);const valid=values.flatMap((v,i)=>(n===3?independentFsmValid(v):independentBstValid(v))?[i]:[]);assert.deepEqual(valid,[b.correctIndex]);
 if(n===3&&c===0){assert.deepEqual(values[1].slice(3,6),[0,2,2]);assert.deepEqual(values[0],[0,0,1,2,0,0,0,0,0,0]);}
 if(n===6){assert.deepEqual(values.map(v=>v.filter(Boolean).length),[5,6,6,7]);for(const tree of values)tree.forEach((v,i)=>{if(v&&i)assert(tree[Math.floor((i-1)/2)]);});}
}));

test('addressing diagrams and byte/word access buses expose all actual conditions before answering',()=>each([9,11],(n,_,b)=>{
 const f=onlyFigure(b);assert(legacy2016AutumnAm0140FigureAllowed(f.profile,f.values));
 if(n===9){const[mode]=f.values;const actualSVG=renderToStaticMarkup(createElement(Legacy2016AutumnAm0140Figures,{...f,caption:'主記憶の参照'})).replace(/<desc[^>]*>[\s\S]*?<\/desc>/g,'');const renderedMode=actualSVG.includes('指標レジスタ')?1:actualSVG.includes('プログラムカウンタ')?2:(actualSVG.match(/marker-end=/g)||[]).length===2?0:3;assert.equal(renderedMode,mode);assert.equal(options(b)[b.correctIndex!],['間接アドレス指定','指標アドレス指定','相対アドレス指定','直接アドレス指定'][renderedMode]);const a=legacy2016AutumnAm0140FigureAlt(f.profile,f.values);assert(!/間接アドレス指定|指標アドレス指定|相対アドレス指定|直接アドレス指定/.test(a));if(mode===1)assert(a.includes('指標レジスタ'));if(mode===2)assert(a.includes('プログラムカウンタ'));}
 else{const s=stem(b),size=Number(s.match(/^(\d+)Mバイト/)![1]),access=s.match(/には(?:(\d+)バイト|バイト)単位/)!,bytes=access[1]?Number(access[1]):1;assert(s.includes('1,024kバイト')&&s.includes('1,024バイト'));const locations=BigInt(size)*1024n*1024n/BigInt(bytes);let lines=0;while((1n<<BigInt(lines))<locations)lines++;unique(b,v=>Number(v)===lines);assert.equal(f.values[0],bytes*8);assert(!legacy2016AutumnAm0140FigureAlt(f.profile,f.values).includes(lines+'本'));}
}));

test('parallel availability is validated by all10000 independent device-state pairs with source-scale decimal gaps',()=>each([15],(_,__,b)=>{
 assert(text(b.prompt).includes('2台の故障は独立'));const t=tables(b)[0];assert.deepEqual(t.columns,['','MTBF','MTTR']);const p=t.rows.map(r=>{const [bf,rt]=r.slice(1).map(x=>Number(x.replace('時間','')));const percent=bf*100/(bf+rt);assert(Number.isInteger(percent));return percent;});let up=0;for(let a=0;a<100;a++)for(let c=0;c<100;c++)if(a<p[0]||c<p[1])up++;const answer=up/100;unique(b,x=>Number(x)===answer);assert(options(b).every(v=>/^\d+(?:\.\d)?$/.test(v)));assert(Math.min(...options(b).map(Number).filter(v=>v!==answer).map(v=>Math.abs(v-answer)))>=1.65);
}));

test('job and printer growth is reproduced by a500-job discrete-event schedule, including upstream bottlenecks',()=>each([16],(_,__,b)=>{
 const list=b.prompt.find(x=>x.type==='list');assert(list?.type==='list');const s=list.items.join(' '),m=Number(s.match(/多重度(\d+)/)![1]),gap=Number(s.match(/ジョブは(\d+)分間隔/)![1]),execution=Number(s.match(/依存せず(\d+)分/)![1]),printing=Number(s.match(/印刷時間は(\d+)分/)![1]),pn=Number(s.match(/プリンタは(\d+)台/)![1]);
 const processors=Array(m).fill(0),printers=Array(pn).fill(0),ew:number[]=[],pw:number[]=[];for(let i=0;i<500;i++){const arrival=i*gap,p=processors.indexOf(Math.min(...processors)),start=Math.max(arrival,processors[p]),complete=start+execution;processors[p]=complete;ew.push(start-arrival);const q=printers.indexOf(Math.min(...printers)),ps=Math.max(complete,printers[q]);printers[q]=ps+printing;pw.push(ps-complete);}
 const growing=(a:number[])=>a.slice(-50).reduce((x,y)=>x+y)/50-a.slice(0,50).reduce((x,y)=>x+y)/50>1,ex=growing(ew),pr=growing(pw);const expected=ex?(pr?2:1):(pr?0:3);assert.equal(b.correctIndex,expected);
}));

test('linear probing follows each six-key insertion in source order and wraps address6 to1',()=>each([20],(_,__,b)=>{
 const l=b.prompt.find(x=>x.type==='list');assert(l?.type==='list');assert(l.items[2].includes('最終アドレスの次は先頭'));assert(l.items[3].includes('何も格納されていない'));const keys=l.items[0].match(/キー値が(.+?)の順/)![1].split(/[，,]/).map(Number);assert.equal(keys.length,6);const occupied=new Map<number,number>();for(const k of keys){const path=Array.from({length:6},(_,i)=>(k%5+i)%6+1),first=path.find(a=>!occupied.has(a));assert(first);occupied.set(first,k);}unique(b,v=>Number(v)===occupied.get(1));
}));

test('LED active-low wiring is decoded bit by bit and all original lit/blank segments are retained',()=>each([21],(_,c,b)=>{
 const s=stem(b),hex=s.match(/16進数で([\dA-F]{2})/)![1],port=parseInt(hex,16);assert(s.includes('出力が0のとき')&&s.includes('P7を最上位ビット')&&s.includes('P0を最下位ビット'));const answers=b.choices.map(x=>{const f=figValues(x[0]),mask=f.values[0],svg=renderToStaticMarkup(createElement(Legacy2016AutumnAm0140Figures,{...f,caption:'LED表示'}));for(let i=0;i<8;i++){const label=['a','b','c','d','e','f','g','Dt'][i];assert(svg.includes('data-segment=\"'+label+'\" data-state=\"'+(((mask>>i)&1)?'on':'off')+'\"'));}return mask;});const required=Array.from({length:8},(_,i)=>((port>>i)&1)===0),valid=answers.flatMap((mask,i)=>required.every((v,j)=>Boolean((mask>>j)&1)===v)?[i]:[]);assert.deepEqual(valid,[b.correctIndex]);if(c===0)assert.deepEqual(answers,[207,102,109,253]);
}));

test('all five-gate alternatives are evaluated on eight Boolean assignments against the independently fixed majority table',()=>each([23],(_,c,b)=>{
 const expected=[0,0,0,1,0,1,1,1];const t=tables(b)[0];assert.deepEqual(t.rows.map(r=>Number(r[3])),expected);const truth=b.choices.map(x=>independentGateTruth(figValues(x[0]).values)),valid=truth.flatMap((v,i)=>JSON.stringify(v)===JSON.stringify(expected)?[i]:[]);assert.deepEqual(valid,[b.correctIndex]);if(c===0)assert.deepEqual(b.choices.map(x=>figValues(x[0]).values),[[0,0,0,1,1],[2,2,2,1,1],[1,1,1,0,3],[2,2,2,0,3]]);
}));

test('audio storage uses exact integer bit capacity and proves the maximum whole minute fits while the next minute does not',()=>each([25],(_,__,b)=>{
 const s=stem(b),rate=BigInt(s.match(/1秒間に([\d,]+)回/)![1].replaceAll(',','')),bits=BigInt(s.match(/それぞれ(\d+)ビット/)![1]),mb=BigInt(s.match(/(\d+)×10⁶バイト/)![1]),capacity=mb*1000000n*8n,minute=rate*bits*60n,N=capacity/minute;unique(b,v=>BigInt(v)===N);assert(N*minute<=capacity&&(N+1n)*minute>capacity);assert.equal(new Set(options(b)).size,4);assert(options(b).every(x=>/^\d{2,4}$/.test(x)));const correct=Number(N);assert(Math.min(...options(b).map(Number).filter(v=>v!==correct).map(v=>Math.abs(v-correct)))>=correct*.12);
}));

test('functional dependencies use all row pairs and show independent counterexamples for every rejected option',()=>each([27],(_,__,b)=>{
 const t=tables(b)[0];assert.equal(t.rows.length,6);assert.deepEqual(t.columns,['配送日','部署ID','部署名','配送先','部品ID','数量']);const pairs=[[3,4],[0,4],[1,4],[2,3]],truth=pairs.map(([l,r])=>t.rows.every(a=>t.rows.every(z=>a[l]!==z[l]||a[r]===z[r])));assert.deepEqual(truth.flatMap((v,i)=>v?[i]:[]),[b.correctIndex]);pairs.forEach(([l,r],i)=>{if(i!==b.correctIndex)assert(t.rows.some(a=>t.rows.some(z=>a[l]===z[l]&&a[r]!==z[r])));});
}));

const datasets=[[[1,2],[2,3]],[[1,3],[1,3]],[[],[1,2]],[[2],[]]];
const canonical=(rows:unknown[][])=>rows.map(r=>JSON.stringify(r)).sort();
test('relation-algebra alternatives are all executed by SQLite over overlapping/disjoint/empty counterexample relations',()=>each([28],(_,c,b)=>{
 const matches=options(b).map(()=>true);for(const [R,S]of datasets){const db=new DatabaseSync(':memory:');try{db.exec('CREATE TABLE R(a INTEGER); CREATE TABLE S(b INTEGER)');for(const n of R)db.prepare('INSERT INTO R VALUES(?)').run(n);for(const n of S)db.prepare('INSERT INTO S VALUES(?)').run(n);const expected=[R.flatMap(a=>S.map(z=>[a,z])),R.filter(x=>!S.includes(x)).map(x=>[x]),[...new Set([...R,...S])].map(x=>[x]),R.filter(x=>S.includes(x)).map(x=>[x])][c];options(b).forEach((sql,i)=>{const result=db.prepare(sql).all().map(row=>Object.values(row));matches[i]&&=JSON.stringify(canonical(result))===JSON.stringify(canonical(expected));});}finally{db.close();}}
 assert.deepEqual(matches.flatMap((v,i)=>v?[i]:[]),[b.correctIndex]);assert(stem(b).includes('行の重複はない'));if(c)assert(stem(b).includes('列数と対応する列の型は等しい'));
}));

test('every displayed employee/department query is independently executed, retaining all9/7 source rows and COUNT(*) multiplicity',()=>each([29],(_,__,b)=>{
 const[employee,department]=tables(b);assert.equal(employee.rows.length,9);assert.equal(department.rows.length,7);const sql=b.prompt.find(x=>x.type==='code');assert(sql?.type==='code');const db=new DatabaseSync(':memory:');try{db.exec('CREATE TABLE 社員(社員番号 INTEGER, 所属 TEXT); CREATE TABLE 部門(部門名 TEXT, フロア INTEGER)');for(const r of employee.rows)db.prepare('INSERT INTO 社員 VALUES(?,?)').run(Number(r[0]),r[1]);for(const r of department.rows)db.prepare('INSERT INTO 部門 VALUES(?,?)').run(r[0],Number(r[1]));const value=Object.values(db.prepare(sql.text).get()!)[0];unique(b,v=>Number(v)===value);}finally{db.close();}
}));

test('the actual layer stack selects exactly one device; generated layer2 never admits both bridge and switching-hub',()=>each([31],(_,c,b)=>{
 const n=onlyFigure(b).values[0],roles:Record<string,number>={'スイッチングハブ':2,'ブリッジ':2,'リピータハブ':1,'ルータ':3,'アプリケーションゲートウェイ':5};unique(b,v=>roles[v]===n);if(n===2)assert(!options(b).includes('スイッチングハブ'));assert.equal(stem(b),sourceRows[30].promptParagraphs[0]);assert(c<4);
}));

test('IPv4 subnets use an independent32-bit BigInt network mask and exclude unusable host-address shortcuts',()=>each([33],(_,__,b)=>{
 const last=Number(stem(b).match(/255\.255\.255\.(\d+)/)![1]),mask=(255n<<24n)|(255n<<16n)|(255n<<8n)|BigInt(last),hostMask=255^last;
 const networks=options(b).map(x=>x.split('と').map(ip=>{const octets=ip.split('.').map(Number),low=octets[3]&hostMask;assert(low!==0&&low!==hostMask,'both PC addresses must be host addresses');return octets.reduce((a,c)=>(a<<8n)|BigInt(c),0n)&mask;}));assert.deepEqual(networks.flatMap((r,i)=>r[0]===r[1]?[i]:[]),[b.correctIndex]);
}));

test('NTP solves equal transmission delay on a physical timeline and retains the full six-digit notation/response fields',()=>each([34],(_,__,b)=>{
 const[t1,t2,t3,t4]=onlyFigure(b).values,delay=(t4-t1-(t3-t2))/2;assert(delay>0);const simultaneousServer=t2-delay,pcAhead=t1-simultaneousServer,answer=Math.abs(pcAhead)+'マイクロ秒'+(pcAhead>0?'進んでいる。':'遅れている。');unique(b,v=>v===answer);assert.equal(new Set(options(b)).size,4);assert(stem(b).includes('伝送遅延は問合せと応答で等しい'));assert(stem(b).includes('それぞれの内部時計'));assert(stem(b).includes('aa:bb:cc.dddddd'));assert(stem(b).includes('ddddddはマイクロ秒'));assert(b.explanation.includes(pcAhead>0?'進んでいる':'遅れている'));
}));

test('satellite delay uses two physical links and one relay delay with exact rational centiseconds and source-scale options',()=>each([35],(_,__,b)=>{
 const s=stem(b),km=BigInt(s.match(/どちらも([\d,]+)km/)![1].replaceAll(',','')),ms=BigInt(s.match(/遅延を(\d+)ミリ秒/)![1]),num=(2n*km*1000n*1000n+ms*300000000n)*100n,den=300000000000n;assert.equal(num%den,0n);const cents=num/den;unique(b,v=>BigInt(v.replace('.',''))===cents);assert(s.includes('高度約36,000km'));assert(s.includes('3×10⁸m／秒'));assert(options(b).every(x=>/^\d\.\d{2}$/.test(x)));const n=Number(cents)/100;assert(Math.min(...options(b).map(Number).filter(v=>v!==n).map(v=>Math.abs(v-n)))>=n*.17);
}));

function switchLabels(svg:string){for(const y of [180,208,370])assert(svg.includes('<text x="650" y="'+y+'">'));assert(650-4*22/2-595>=10,'B labels leave at least10 SVG units from the state line');}
function switchTiming(svg:string){const d=(type:string,id:string)=>{const m=svg.match(new RegExp('data-switch-'+type+'="'+id+'" d="([^"]+)"'));assert(m,id);return m[1];};const ar=d('state','a-running').match(/^M115 (\d+)V(\d+)$/)!,br=d('state','b-running').match(/^M595 (\d+)V(\d+)$/)!,ready=d('state','b-ready').match(/^M595 (\d+)V(\d+)$/)!,out=d('edge','a-to-os').match(/^M115 (\d+)H340V(\d+)$/)!,into=d('edge','os-to-b').match(/^M340 (\d+)V(\d+)H595$/)!,interrupt=d('edge','interrupt').match(/^M25 (\d+)H105$/)!;assert(ar&&br&&ready&&out&&into&&interrupt);assert.equal(ar[2],out[1]);assert.equal(interrupt[1],out[1]);assert.equal(br[1],into[2]);assert.equal(ready[2],into[2]);assert(Number(into[1])<Number(br[1]));}
test('every finite figure is strictly admitted, visibly renders all labels and uses the same condition tuple as its complete alt',()=>{
 const seen=new Set<string>();let renderCount=0;for(const d of defs)for(let c=0;c<=d.fields[0].maximum;c++){const b=d.build([c]);for(const block of [...b.prompt,...b.choices.flat()])if(block.type==='diagram'){
  const f=figValues(block);seen.add(f.profile);assert(legacy2016AutumnAm0140FigureAllowed(f.profile,f.values));assert.equal(block.alt,legacy2016AutumnAm0140FigureAlt(f.profile,f.values));const svg=renderToStaticMarkup(createElement(Legacy2016AutumnAm0140Figures,{...f,caption:block.caption}));assert(svg.includes('viewBox=')&&svg.includes('diagram-scroll'));assert(!/NaN|undefined/.test(svg));const visible=svg.replace(/<desc[^>]*>[\s\S]*?<\/desc>/g,'').replace(/<title[^>]*>[\s\S]*?<\/title>/g,'');
  if(f.profile.endsWith('-21-circuit'))for(const label of ['Vcc','P0','P7','凡例','点灯','消灯'])assert(visible.includes(label));
  if(f.profile.endsWith('-34-ntp'))for(const n of f.values)assert(visible.includes('aa:bb:cc.'+String(n).padStart(6,'0')));
  if(f.profile.endsWith('-23-gates')){assert.equal((svg.match(/data-gate="/g)||[]).length,5);assert.equal((svg.match(/data-wire-input="/g)||[]).length,6);}
  if(f.profile.endsWith('-31-stack')){const top=70+(5-f.values[0])*38;assert(svg.includes('d="M40 52V325H360V'+(top+33)+'H560V325H880V52"'));assert(top+33>top+25+5,'flow runs below the Japanese text baseline, not through labels');}
  if(f.profile.endsWith('-18-switch')){switchTiming(svg);switchLabels(svg);assert.throws(()=>switchLabels(svg.replace('x="650" y="180"','x="640" y="180"')));assert.throws(()=>switchTiming(svg.replace('data-switch-state="b-running" d="M595 350V375"','data-switch-state="b-running" d="M595 305V375"')));assert.throws(()=>switchTiming(svg.replace('data-switch-state="a-running" d="M115 65V125"','data-switch-state="a-running" d="M115 65V135"')));}
  renderCount++;
 }}assert.deepEqual([...seen].sort(),Object.keys(legacy2016AutumnAm0140FigureDomains).sort());assert(renderCount>150);
 for(const profile of seen){assert(!legacy2016AutumnAm0140FigureAllowed(profile,[NaN]));assert(!legacy2016AutumnAm0140FigureAllowed(profile,[999999]));assert.throws(()=>legacy2016AutumnAm0140FigureAlt(profile,[999999]));}assert(!legacy2016AutumnAm0140FigureAllowed('legacy-2016-spring-am-3-fsm',[0]));
});

test('all236 bodies satisfy the real question schema and every LaTeX expression satisfies the production command policy; shape scaffolds are not admission',()=>{
 const source=readDistributionBundle().questions.find(q=>!q.answerParts);assert(source);let checked=0,formulas=0;
 for(const d of defs)for(let c=0;c<=d.fields[0].maximum;c++){
  const b=d.build([c]),q=structuredClone(source);q.id='question-owner-shape-'+d.source+'-'+c;q.prompt={attribution:q.prompt.attribution,blocks:structuredClone(b.prompt)};q.choices=b.choices.map((blocks,i)=>({id:'owner-choice-'+i,content:{attribution:q.prompt.attribution,blocks:structuredClone(blocks)}}));q.correctAnswer={choiceId:q.choices[b.correctIndex!].id,attribution:q.correctAnswer.attribution};q.explanation={attribution:q.explanation.attribution,blocks:[{type:'paragraph',text:b.explanation}]};
  schema('question',q);for(const block of [...b.prompt,...b.choices.flat(),...(b.contexts??[]).flatMap(x=>x.blocks)])if(block.type==='formula'&&block.format==='latex'){validateFormula(block.text);formulas++;}checked++;
 }
 assert.equal(checked,236);assert.equal(formulas,8);
 const original=defs[6].build([0]),formula=original.prompt.find(p=>p.type==='formula');assert(formula?.type==='formula');assert.equal(formula.text,String.raw`F(x,y)=\begin{cases}x&(y=0)\\F(y,x\operatorname{mod}y)&(y>0)\end{cases}`);assert.equal(formula.alt,'F(x,y)は，y=0のときx，y>0のときF(y,x mod y)である。');
 assert.throws(()=>validateFormula(formula.text.replace('(y=0)','(y=0\\text{ のとき})')),{code:'MATH_SYNTAX'});assert.throws(()=>validateFormula(formula.text.replace('\\operatorname{mod}','\\bmod')),{code:'MATH_COMMAND'});
 const invalid=structuredClone(source);invalid.prompt={attribution:invalid.prompt.attribution,blocks:[{...formula,text:formula.text.replace('(y=0)','(y=0\\text{ のとき})')}]};assert.throws(()=>schema('question',invalid),{code:'SCHEMA'});
});

test('every finite history pair leaves a real candidate after current/prior input and last-answer exclusion, without counting shuffled choices',()=>{
 for(const d of defs){const bodies=Array.from({length:d.fields[0].maximum+1},(_,c)=>d.build([c])),answers=bodies.map(b=>JSON.stringify(b.choices[b.correctIndex!])),meaning=bodies.map(b=>JSON.stringify({prompt:b.prompt,choices:b.choices.map(cs=>JSON.stringify(cs)).sort()}));assert.equal(new Set(meaning).size,bodies.length,d.source+' no order-only duplicates');if(d.answerVariation!=='fixed')assert(new Set(answers).size>=2,d.source);
  for(let a=0;a<bodies.length;a++)for(let last=0;last<bodies.length;last++){if(a===last)continue;const eligible=bodies.flatMap((_,i)=>i!==a&&i!==last&&(d.answerVariation==='fixed'||answers[i]!==answers[last])?[i]:[]);assert(eligible.length>0,d.source+': history '+a+','+last);}
 }
});

test('the managed sampler reaches all245 real candidates, is deterministic and rejects invalid indices/arity; scaffolds are not catalog admission',async()=>{
 const beforeDefs=additionalDefinitions.slice(),beforeContracts=additionalContracts.slice();try{const templates=defs.map(addReviewedStemCase).map(d=>({id:'template-source-'+d.source,revision:1,generatorRef:{id:'generator-source-'+d.source,version:additionalVersion(d)},parameterDomain:{values:{length:1,minimum:0,maximum:d.fields[0].maximum},fields:d.fields},referenceParameters:{values:[0]}} as Template));ensureStage3MorningGenerators({templates}as Bundle);
 for(const t of templates){const reached=new Set<number>();for(let s=0;s<128;s++){const seed=s.toString(16).padStart(32,'0'),a=await parametersForSeed(seed,t),b=await parametersForSeed(seed,t);assert.deepEqual(a,b);checkParameters(t,a.values);assert.equal(a.values.length,1);reached.add(a.values[0]);}assert.equal(reached.size,t.parameterDomain.values.maximum+1,t.id);}
 }finally{additionalDefinitions.splice(0,additionalDefinitions.length,...beforeDefs);additionalContracts.splice(0,additionalContracts.length,...beforeContracts);}
 for(const d of defs)for(const v of [[],[0,1],[-1],[d.fields[0].maximum+1],[.5],[NaN],[Infinity]])assert.throws(()=>d.build(v),/PARAMETER_CONSTRAINT/);
});

test('every one of236 finite bodies has a registered independent semantic route and reviewed abbreviations remain answer-side only',()=>{
 const total=defs.reduce((sum,d)=>sum+d.fields[0].maximum+1,0);assert.equal(total,236);assert.equal(done.size,total);assert.deepEqual([...new Set([...done].map(x=>Number(x.split('/')[0])))].sort((a,b)=>a-b),Array.from({length:40},(_,i)=>i+1));for(const t of legacy2016AutumnAm0140StudyTerms){assert(t.meaning.length>10);assert(t.sources?.every(s=>/^2016h28a-fe-am-([1-9]|[1-3]\d|40)$/.test(s)));if(/^[A-Z][A-Z0-9/-]+$/.test(t.term))assert(t.expansion||['REDO・UNDO'].includes(t.term));}
 for(const d of defs){const b=d.build([0]);assert(!text(b.prompt).includes('Central Processing Unit'));assert(!text(b.prompt).includes('Public Key Infrastructure'));}
});
