import test from'node:test';import assert from'node:assert/strict';
import{legacy2017Pm13Definition as d}from'../src/core/generators/legacy-2017-pm13';
import{pm13Inputs,pm13SourceRates,pm13SourceColumns,pm13SourceMacro}from'./fixtures/legacy-2017-pm13-source-review';
import{assertPm13Body,pm13Reference,pm13ReferenceBest,pm13MacroInterpreter,pm13Match,pm13Markup,pm13Cells,pm13ReadMacro}from'./fixtures/legacy-2017-pm13-oracle';
const fmt=(n:number)=>n.toLocaleString('en-US');
test('PM13原9頁の前提/6欄26択/全群/固定資料を8実数値条件でも保持し正答固定を明示する',()=>{
 assert.equal(d.answerVariation,'fixed');const actual=new Set<string>();for(let v=0;v<8;v++){const b=d.build([v]);assertPm13Body(b,v);actual.add(JSON.stringify(b));}assert.equal(actual.size,8);for(const p of [[],[0,0],[-1],[8],[NaN],[Infinity],[.5]])assert.throws(()=>d.build(p),/PARAMETER_CONSTRAINT/);
});
test('5ワークシートの実DOM全数値を別解の重量/料金/最大梱包計画と照合、原3荷物5292円を保持',()=>{
 for(let v=0;v<8;v++){
  const input=pm13Inputs[v],r=pm13Reference(input),products=pm13Cells('legacy-2017-pm13-product-sheet',v),weights=pm13Cells('legacy-2017-pm13-weight-sheet',v),calculation=pm13Cells('legacy-2017-pm13-calculation-sheet',v),packing=pm13Cells('legacy-2017-pm13-packing-sheet',v),rates=pm13Cells('legacy-2017-pm13-rate-sheet',v);
  input.weights.forEach((n,i)=>assert.equal(products.get(`商品重量!B${i+3}`),fmt(n)));
  r.limits.forEach((n,i)=>[i+1,n,input.boxes[i],r.lower[i],r.upper[i]].forEach((x,j)=>assert.equal(weights.get(`重量区分!${'ABCDE'[j]}${i+4}`),fmt(x))));
  ['A','B','C','D','E','F','G','H'].forEach((col,i)=>assert.equal(calculation.get(`料金計算!${col}4`),[input.destination,...input.example.map(fmt),fmt(r.exampleWeight),fmt(r.exampleCategory),fmt(r.examplePacked),fmt(r.exampleRate)][i]));
  for(let row=0;row<5;row++)for(let col=0;col<5;col++)assert.equal(rates.get(`料金表!${'CDEMN'[col]}${row+11}`),fmt(pm13SourceRates[row][col]));
  const displayedColumn=pm13SourceColumns.indexOf(input.column);for(let col=0;col<5;col++)assert.equal(rates.get(`料金表!${'CDEMN'[col]}16`),col===displayedColumn?'1':'');
  r.packages.forEach((pack,i)=>[i+1,...pack.counts,pack.weight,pack.category,pack.rate].forEach((n,j)=>assert.equal(packing.get(`料金計算!${'ABCDEFG'[j]}${i+16}`),fmt(n))));
  assert.equal(packing.get('料金計算!E4'),fmt(r.shippingWeight));assert.equal(packing.get('料金計算!F4'),'×');assert.equal(packing.get('料金計算!G26'),fmt(r.totalRate));
  assert(r.packages.every(p=>p.weight<=r.upper[4]&&p.weight>0));assert(r.packages.length<=10);for(let i=0;i<3;i++)assert.equal(r.packages.reduce((n,p)=>n+p.counts[i],0),input.shipping[i]);
 }
 const original=pm13Reference(pm13Inputs[0]);assert.deepEqual(original.packages,[{counts:[6,1,21],weight:28680,category:5,rate:1944},{counts:[0,28,7],weight:28560,category:5,rate:1944},{counts:[4,7,2],weight:9280,category:3,rate:1404}]);assert.equal(original.totalRate,5292);
});
test('a全6択は列固定/相対複写と空欄を含む12地域ケースで正しい一つだけになる',()=>{
 const truth=Array(6).fill(true);for(let matching=-1;matching<12;matching++)for(let col=0;col<12;col++){
  const count=Number(col===matching),fixed=Number(matching===0),expected=count===1?1:null;
  const result=[count===0?1:null,count===1?1:null,count>1?null:1,fixed===0?null:1,fixed===1?null:1,fixed>1?1:null];result.forEach((x,i)=>truth[i]&&=x===expected);
 }assert.deepEqual(truth,[false,true,false,false,false,false]);
});
test('b全4択は正確な境界/元の数量例で最小重量区分を返し、-1の降順前提違反も拒否',()=>{
 const truth=Array(4).fill(true);for(const input of pm13Inputs){const r=pm13Reference(input);for(const w of [0,1,r.exampleWeight,r.shippingWeight,...r.upper.flatMap(n=>[n-1,n,n+1]),...r.lower]){
  const expected=w===0?'−':r.upper.findIndex(n=>w<=n)>=0?r.upper.findIndex(n=>w<=n)+1:'×';
  for(let i=0;i<4;i++){let actual:number|string|undefined;try{actual=w===0?'−':w>r.upper[4]?'×':pm13Match(w,i<2?r.lower:r.upper,i%2===0?1:-1);}catch{actual='invalid order';}truth[i]&&=actual===expected;}
 }}assert.deepEqual(truth,[true,false,false,false]);
});
test('c全4択は有効/ゼロ/上限超過と発送先空欄/未登録/登録の全状態で照合',()=>{
 const truth=Array(4).fill(true);for(const weight of ['−','×',1,2,3,4,5])for(const destination of ['empty','missing','found']){
  const numeric=typeof weight==='number',sum=destination==='found'?1:0,aNull=destination==='empty',gMissing=!numeric,expected=gMissing||sum===0;
  const values=[!gMissing&&!aNull,(!numeric)&&aNull,gMissing||sum===0,numeric||sum===1];values.forEach((x,i)=>truth[i]&&=x===expected);
 }assert.deepEqual(truth,[false,false,true,false]);
});
test('d全4択は原のC/D/E/M/N列と5区分で位置の逆転/キー列1差を検出',()=>{
 const full=pm13SourceRates.map(row=>Array.from({length:12},(_,i)=>{const source=pm13SourceColumns.indexOf(i+1);return source>=0?row[source]:undefined;})),truth=Array(4).fill(true);
 for(let category=1;category<=5;category++)for(const column of pm13SourceColumns){const expected=full[category-1][column-1],withKey=full.map((row,i)=>[i+1,...row]);
  const values=[withKey[category-1]?.[column-1],withKey[column-1]?.[category-1],full[category-1]?.[column-1],full[column-1]?.[category-1]];values.forEach((x,i)=>truth[i]&&=x===expected);
 }assert.deepEqual(truth,[false,false,true,false]);
});
test('e/fの全4択と8データ条件は別の解析探索と一致する一つだけ。最大値と数量を保存する',()=>{
 const truth=[Array(4).fill(true),Array(4).fill(true)];for(const input of pm13Inputs){const expected=pm13Reference(input).packages.map(p=>({counts:p.counts,weight:p.weight}));assert.deepEqual(pm13MacroInterpreter(input,1,3),expected);
  for(let slot=0;slot<2;slot++)for(let option=0;option<4;option++){let equal=false;try{equal=JSON.stringify(pm13MacroInterpreter(input,slot===0?option:1,slot===1?option:3))===JSON.stringify(expected);}catch{}truth[slot][option]&&=equal;}
 }assert.deepEqual(truth,[[false,true,false,false],[false,false,false,true]]);
 assert.deepEqual(pm13ReferenceBest([2,2,2],[2,3,4],6),{counts:[0,2,0],weight:6});
});
test('マクロの実SVG全31行/7loop/1condition/e-f矩形と元の結合見出し・斜線を保持',()=>{
 assert.deepEqual(pm13ReadMacro(),pm13SourceMacro);const svg=pm13Markup('legacy-2017-pm13-macro',0);
 assert.deepEqual([...svg.matchAll(/data-pm13-frame="([^"]+)"/g)].map(m=>m[1]),['loop:3:5:0','loop:7:31:0','loop:12:26:1','loop:14:25:2','loop:16:24:3','loop:19:21:5','loop:27:29:1','condition:18:23:4']);
 assert.deepEqual([...svg.matchAll(/data-pm13-hole="([ef])"/g)].map(m=>m[1]),['e','f']);assert.equal((svg.match(/data-pm13-marker="■"/g)??[]).length,14);
 const pack=pm13Markup('legacy-2017-pm13-packing-sheet',0);assert(pack.includes('class="legacy-pm13-diagonal"'));assert(pack.includes('x1="0" y1="30" x2="100" y2="0"'));assert(pack.includes('rowSpan="2"')||pack.includes('rowspan="2"'));
 for(const key of 'abcdef'){const html=pm13Markup(`legacy-2017-pm13-${key}-bank`,0);assert(!html.includes('<table'));assert(!html.includes('<details'));assert.equal((html.match(/data-pm13-option=/g)??[]).length,key==='a'?6:4);}
});
test('必要前提/最良更新/列固定/固定資料/原マクロの欠落を受理しない',()=>{
 for(const mutate of [(b:ReturnType<typeof d.build>)=>{b.choices[1]=b.choices[0];},(b:ReturnType<typeof d.build>)=>{b.prompt=b.prompt.filter(x=>x.type!=='paragraph'||!x.text.includes('荷物の数は10個'));},(b:ReturnType<typeof d.build>)=>{b.contexts![0].blocks.pop();},(b:ReturnType<typeof d.build>)=>{b.partAnswers![5]={kind:'choice',partId:'part-f',choiceId:'choice-value-25'};}]){const b=d.build([0]);mutate(b);assert.throws(()=>assertPm13Body(b,0));}
});
test('Q13の原図captionは下、群とマクロ見出しは上へ可視表示',()=>{for(const kind of ['rate-sheet','product-sheet','weight-sheet','calculation-sheet','packing-sheet','macro','a-bank','b-bank','c-bank','d-bank','e-bank','f-bank']){const html=pm13Markup('legacy-2017-pm13-'+kind,0),where=kind.endsWith('-bank')||kind==='macro'?'top':'bottom';assert(new RegExp(`<p[^>]*data-pm13-caption="${where}"[^>]*>[^<]+<\\/p>`).test(html));}});
test('a/b/c/dの原3式は同じ式順と全4矩形を保ち、原にないcaptionを追加しない',()=>{
 const a=pm13Markup('legacy-2017-pm13-a-equation',0),b=pm13Markup('legacy-2017-pm13-b-equation',0),cd=pm13Markup('legacy-2017-pm13-cd-equation',0);
 assert(a.includes('IF(料金計算!$A4=null, null, '));assert(b.includes("IF(E4=0, &#x27;−&#x27;, "));assert(cd.includes(", &#x27;−&#x27;, "));
 assert.deepEqual([a,b,cd].flatMap(html=>[...html.matchAll(/data-pm13-equation-hole="([a-d])"/g)].map(m=>m[1])),['a','b','c','d']);
 for(const html of[a,b,cd]){assert(!html.includes('data-pm13-caption='));assert(!html.includes('<table'));}
});
