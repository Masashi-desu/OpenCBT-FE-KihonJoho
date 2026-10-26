import test from'node:test';import assert from'node:assert/strict';import{createElement}from'react';import{renderToStaticMarkup}from'react-dom/server';
import{legacy2017Pm12Definition as d}from'../src/core/generators/legacy-2017-pm12';
import{legacy2017Pm12Profiles}from'../src/core/generators/legacy-2017-pm12-data';
import{Legacy2017Pm12Figure}from'../src/ui/Legacy2017Pm12Figure';
import{assertPm12Body,pm12Inputs,pm12Programs,pm12ProgramMarkup,pm12Words,pm12WordNumber,pm12InterpretAdd,pm12InterpretMul}from'./fixtures/legacy-2017-pm12-oracle';
const fillAdd=(text:string,holes=[4,2,1])=>{const ab=['AND GR5,=1','CPL GR3,=0','CPL GR3,GR1','CPL GR3,GR2','LD GR5,=1'],c=['JOV LOOP','JUMP LOOP','JZE LOOP'];return text.replaceAll('[a]',ab[holes[0]]).replaceAll('[b]',ab[holes[1]]).replaceAll('[c]',c[holes[2]]);};
const fillMul=(text:string,e=0,f=4)=>{const ef=['JMI LOWORD','JNZ LOWORD','JPL LOWORD','JZE LOWORD','LAD GR2,TEMP','LD GR2,=1','LD GR2,GR3','LD GR2,TEMP'];return text.replace('[e]',ef[e]).replace('[f]',ef[f]);};
test('PM12全8数値条件/原全命令/6欄22固有択35参照/固定抜粋資料を原形式で照合',()=>{for(let v=0;v<8;v++)assertPm12Body(d.build([v]),v);for(const p of [[],[0,1],[-1],[8],[NaN],[.5]])assert.throws(()=>d.build(p),/PARAMETER_CONSTRAINT/);});
test('ADD64の実表示命令を解釈し、独立BigInt加算と2回目行7・GR1〜7保存を全条件照合',()=>{
 for(let v=0;v<8;v++){const [a]=pm12Programs(d.build([v])),[left,right]=pm12Inputs[v],r=pm12InterpretAdd(fillAdd(a),left,right);assert.deepEqual(r.words,pm12Words(pm12WordNumber(left)+pm12WordNumber(right)));assert.deepEqual(r.registers,r.before);assert.deepEqual(r.writes,[100,101,102,103]);assert.equal(r.trace.length,4);const carry=Number((BigInt(left[3])+BigInt(right[3]))/65536n);assert.equal(r.trace[1],left[2]+carry);}
 const [a]=pm12Programs(d.build([0]));for(const n of [0n,1n,65535n,65536n,0x123456789abcdefn,(1n<<63n)-1n]){const words=pm12Words(n),r=pm12InterpretAdd(fillAdd(a),words,words,true);assert.deepEqual(r.words,pm12Words(n*2n));assert.deepEqual(r.registers,r.before);}
});
test('a/b/c全5/5/3択を数値とアドレスの反例集合で検証し、正しい命令を唯一にする',()=>{
 const [a]=pm12Programs(d.build([0])),counts=[5,5,3],correct=[4,2,1],truth=counts.map(n=>Array(n).fill(true));
 const cases=[...pm12Inputs.map(([x,y])=>[x,y]),[[0,0,0xffff,0xffff],[0,0,0,1]],[[0,0,0,0],[0,0,0,0]],[[0,0,0xffff,0xffff],[0,0,0xffff,0xffff]]] as [readonly number[],readonly number[]][];
 for(const [left,right] of cases)for(let slot=0;slot<3;slot++)for(let option=0;option<counts[slot];option++){const h=[...correct];h[slot]=option;let same=false;try{const r=pm12InterpretAdd(fillAdd(a,h),left,right);same=JSON.stringify(r.words)===JSON.stringify(pm12Words(pm12WordNumber(left)+pm12WordNumber(right)))&&JSON.stringify(r.registers)===JSON.stringify(r.before)&&JSON.stringify(r.writes)==='[100,101,102,103]'&&r.trace.length===4;}catch{}truth[slot][option]&&=same;}
 assert.deepEqual(truth.map(row=>row.map((b,i)=>b?i:-1).filter(i=>i>=0)),[[4],[2],[1]]);
});
test('MUL32実表示命令を独立BigInt乗算と境界/全ビット/疑似乱数で検算し、レジスタを保存',()=>{
 const [a,m]=pm12Programs(d.build([0])),add=fillAdd(a),mul=fillMul(m),numbers=[0n,1n,2n,65535n,65536n,0x7fffffffn,0x80000000n,0xffffffffn,...Array.from({length:32},(_,i)=>1n<<BigInt(i))];
 const pairs=numbers.flatMap((x,i)=>[[x,numbers[(i*7+3)%numbers.length]],[x,0xffffffffn]]);let state=1234567;for(let i=0;i<128;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;const x=BigInt(state);state=(Math.imul(state,1664525)+1013904223)>>>0;pairs.push([x,BigInt(state)]);}
 for(const [x,y]of pairs){const r=pm12InterpretMul(mul,add,x,y);assert.deepEqual(r.words,pm12Words(x*y),`${x}*${y}`);assert.deepEqual(r.registers,r.before);}
});
test('e/f共通8択の全命令を同じ欄へ試し、低位/上位の境界と2倍化の一意性を検証',()=>{
 const [a,m]=pm12Programs(d.build([0])),add=fillAdd(a),truth=[Array(8).fill(true),Array(8).fill(true)];
 for(const [x,y] of [[1n,0xffffffffn],[0xffffffffn,1n],[0x12345678n,0x87654321n],[65535n,65536n],[0x80000000n,0x80000000n]])for(let slot=0;slot<2;slot++)for(let option=0;option<8;option++){let same=false;try{const r=pm12InterpretMul(fillMul(m,slot===0?option:0,slot===1?option:4),add,x,y);same=JSON.stringify(r.words)===JSON.stringify(pm12Words(x*y));}catch{}truth[slot][option]&&=same;}
 assert.deepEqual(truth.map(row=>row.map((b,i)=>b?i:-1).filter(i=>i>=0)),[[0],[4]]);
});
test('3図×全8条件はビッグエンディアンの全語/番地を本文側で表示し、答えを先出ししない',()=>{for(let v=0;v<8;v++)for(const profile of legacy2017Pm12Profiles){const html=renderToStaticMarkup(createElement(Legacy2017Pm12Figure,{profile,values:[v]}));assert(html.includes('data-legacy-pm12-profile'));assert(!html.includes('繰上がり'));assert(!html.includes('正答'));if(profile.endsWith('values'))assert.equal((html.match(/#[0-9A-F]{4}/g)??[]).length,8);}});
test('原24/41行・4/2空欄・右注記7単位/14マーカー/3括弧の範囲を実SVG DOMで検査',()=>{
 const add=pm12ProgramMarkup('add64'),mul=pm12ProgramMarkup('mul32');
 assert.equal((add.match(/data-pm12-code-line=/g)??[]).length,24);assert.equal((add.match(/data-pm12-line-number=/g)??[]).length,24);
 assert(add.includes('data-pm12-line-number-heading="true">（行番号）</text>'));
 assert.deepEqual([...add.matchAll(/data-pm12-hole="([a-f])"/g)].map(m=>m[1]),['a','a','b','c']);
 assert.equal((mul.match(/data-pm12-code-line=/g)??[]).length,41);assert.equal((mul.match(/data-pm12-line-number=/g)??[]).length,0);
 assert.deepEqual([...mul.matchAll(/data-pm12-hole="([a-f])"/g)].map(m=>m[1]),['e','f']);
 assert.deepEqual([...mul.matchAll(/data-pm12-note-range="([^"]+)"/g)].map(m=>m[1]),['3:3','4:7','9:10','11:14','15:15','16:16','36:36']);
 assert.deepEqual([...mul.matchAll(/data-pm12-brace-range="([^"]+)"/g)].map(m=>m[1]),['4:7','9:10','11:14']);
 assert.equal((mul.match(/data-pm12-comment-marker=/g)??[]).length,14);
 for(const s of ['TEMPから始まる4語の領域のうちの','GR3から始まる4語の領域に0を格納','GR4に退避した値をGR2に復帰'])assert(mul.includes(s));
});
test('同一領域例外/保存レジスタ/末尾語/共有群/抜粋資料を壊す負例を拒否',()=>{for(const change of [(b:ReturnType<typeof d.build>)=>{b.answerParts![1].choiceIds.reverse();},(b:ReturnType<typeof d.build>)=>{b.contexts![0].blocks.pop();},(b:ReturnType<typeof d.build>)=>{b.prompt=b.prompt.filter(x=>x.type!=='paragraph'||!x.text.includes('GR1とGR2の値が等しい'));},(b:ReturnType<typeof d.build>)=>{const p=b.prompt.find(x=>x.type==='diagram'&&x.caption==='プログラム1');assert(p?.type==='diagram');p.alt=p.alt.replace('GR3,3,GR1','GR3,2,GR1');}]){const b=d.build([0]);change(b);assert.throws(()=>assertPm12Body(b,0));}});
test('Q12の原図captionは下、群とプログラム見出しは上へ可視表示',()=>{for(const profile of legacy2017Pm12Profiles){const html=renderToStaticMarkup(createElement(Legacy2017Pm12Figure,{profile,values:[0]})),where=profile.endsWith('-bank')||profile.includes('-program-')?'top':'bottom';assert(new RegExp(`<p[^>]*data-pm12-caption="${where}"[^>]*>[^<]+<\\/p>`).test(html));}});
