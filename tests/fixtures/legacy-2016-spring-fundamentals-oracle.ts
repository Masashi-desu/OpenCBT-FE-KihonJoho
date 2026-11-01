import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
import type {Block} from '../../src/core/types';
import facts from './legacy-2016-spring-fundamentals-source-facts.json';
import contracts from './legacy-2016-spring-fundamentals-input-contracts.json';
export const oracleText=(bs:Block[])=>bs.map(b=>b.type==='paragraph'||b.type==='code'?b.text:b.type==='list'?b.items.join('\n'):b.type==='table'?b.rows.map(r=>r.join('|')).join('\n'):'').join('\n');
export function independentTreeRanks(paths:readonly string[]){
 assert.equal(paths.length,10);assert.equal(new Set(paths).size,10);assert(paths.includes(''));
 for(const p of paths){assert(/^[LR]*$/.test(p));assert(p.length<=4);if(p)assert(paths.includes(p.slice(0,-1)));}
 // Each node lies at a distinct dyadic coordinate. Sorting positions gives the
 // total BST inequality order, independently of producer's in-order recursion.
 const x=(path:string)=>{let value=0,step=1;for(const d of path){value+=(d==='L'?-1:1)*step;step/=2;}return value;};
 return Object.fromEntries([...paths].sort((a,b)=>x(a)-x(b)).map((p,i)=>[p,i+1]));
}
export function independentFactorialTrace(n:number,slot:number,addend:string){
 assert(Number.isInteger(n)&&n>=0);let calls=0;const seen=new Set<number>();let at=n;
 while(at>0){if(seen.has(at))return {status:'cycle',at,calls,baseCalls:0} as const;seen.add(at);calls++;at=slot===1||slot===3?at:at-1;}
 if(slot===0){let value=1;for(let i=1;i<=n;i++)value+=addend==='n'?i:Number(addend);return {status:'value',value,calls,baseCalls:1} as const;}
 let value=1;for(let i=1;i<=n;i++)value*=i;return {status:'value',value,calls,baseCalls:1} as const;
}
export function independentDivision(x:number,y:number,c:number,s:number){assert(Number.isInteger(x)&&x>=0&&Number.isInteger(y)&&y>=0);if(y===0)return {status:'nonterminating',r:x,qUnbounded:true} as const;let rem=x,k=0;while(rem>=y){rem-=y;k++;}return {status:'value',q:c+s*k,r:rem,k} as const;}
/** The producer uses exponentiation. This reference instead appends zero bits
 * to the actual positive input and performs the stated addition repeatedly. */
export function independentShiftThenAdd(x:number,s:number,k:number){
 assert(Number.isInteger(x)&&x>0&&Number.isInteger(s)&&s>=1&&s<=3&&Number.isInteger(k)&&k>=1&&k<=4);
 let result=parseInt(x.toString(2)+'0'.repeat(s),2);
 for(let i=0;i<k;i++)result+=x;
 return result;
}
export function assertSpring2016Body(n:number,b:GeneratedBody,values:readonly number[],treePaths?:readonly string[]){
 const cs=b.choices.map(oracleText);assert.equal(cs.length,4);assert.equal(new Set(cs).size,4);assert.equal(b.correctIndex,[2,2,3,2,0,3,2,1][n-1]);assert(b.explanation.length>50);assert(![...b.prompt,...b.choices.flat()].some(b=>b.type==='image'));
 const prompt=oracleText(b.prompt.filter(b=>b.type==='paragraph'||b.type==='code'));
 if([2,5,7,8].includes(n)){const block=b.prompt[1];assert(block?.type==='diagram');assert.equal(block.rendererRef.id,'renderer-source-figures');assert.equal(block.rendererRef.version,'1.0.0');assert(block.scene.kind==='source_figure');assert.equal(block.scene.profile,({2:'legacy-2016-spring-dfa',5:'legacy-2016-spring-bst',7:'legacy-2016-spring-factorial',8:'legacy-2016-spring-division'} as Record<number,string>)[n]);assert.deepEqual(block.scene.values,n===2?[values[0]]:n===7?[0]:values);assert(block.alt.length>40);}
let truth:boolean[]=[];
 if(n===1){const [s,k]=values;assert(Number.isInteger(s)&&s>=1&&s<=3&&Number.isInteger(k)&&k>=1&&k<=4);assert(prompt.includes(`レジスタの値を${s}ビット左にシフトして，${k===1?'x':`${k}×x`} を加える`));const factor=parseInt('1'+'0'.repeat(s),2),numeric=cs.map(Number);assert.deepEqual(numeric,[s+k,factor,factor+k,factor+k+k]);for(const [i,x]of numeric.entries()){assert(x>=2&&x<=16);assert.equal(cs[i],String(x));}truth=numeric.map(z=>Array.from({length:31},(_,i)=>i+1).every(x=>z*x===independentShiftThenAdd(x,s,k)));assert(prompt.includes('正の整数 x')&&prompt.includes('あふれ（オーバフロー）は，発生しない'));assert(!/符号|8ビット|チャネル/.test(prompt));assert(b.explanation.includes(`左へ${s}ビットのシフトは2の${s}乗倍なので${factor}x。`)&&b.explanation.includes(`元のxの${k}倍を加えると${factor+k}xになる。`));}
 if(n===2){assert.equal(prompt,facts.questions['2'].prompt);const[a]=values;const matrix=a===1?[[0,1],[2,1],[2,2]]:[[1,0],[1,2],[2,2]];const ends=cs.map(word=>{assert(/^[01]{4}$/.test(word));let state=0;for(const bit of word)state=matrix[state][Number(bit)];return state;});assert.deepEqual(ends,[0,1,2,1]);truth=ends.map(x=>x===2);}
 if(n===3){const[order,minTail,a,bn]=values;assert(prompt.includes(`正規表現 ${order?'[0-9]':'[A-Z]'}+${order?'[A-Z]':'[0-9]'}${minTail?'+':'*'}`));const first=(ch:string)=>order?/^[0-9]$/.test(ch):/^[A-Z]$/.test(ch),second=(ch:string)=>order?/^[A-Z]$/.test(ch):/^[0-9]$/.test(ch);truth=cs.map(str=>{let i=0;while(i<str.length&&first(str[i]))i++;return i>0&&str.length-i>=minTail&&[...str.slice(i)].every(second);});assert(![...cs[0]].some(first));assert(cs[1].includes('+'));assert(cs[2].endsWith('*'));assert(cs.every(s=>s.length<=6));assert.equal(cs[3].length,a+bn);assert(bn>=minTail);const rule=b.prompt[1];assert(rule.type==='list');assert.deepEqual(rule.items,facts.questions['3'].rules);}
 if(n===4){const[bits,rate]=values;const target=1e6/(rate/bits);truth=cs.map(x=>Number(x)===target);assert.deepEqual(cs,target===125?['15.6','46.8','125','128']:['31.2','93.6','250','256']);assert(prompt.includes(`${bits}ビット`)&&prompt.includes(rate.toLocaleString('en-US')+'ビット／秒')&&prompt.includes('圧縮せず')&&prompt.includes('リアルタイム'));assert(!/チャネル|標本数|丸め/.test(prompt));}
 if(n===5){assert(treePaths);assert.equal(prompt,facts.questions['5'].prompt);const ranks=independentTreeRanks(treePaths),a=ranks.R,bv=ranks.RRL,tuples=cs.map((x,i)=>{assert.equal(b.choices[i].length,1);assert.equal(b.choices[i][0].type,'paragraph');const match=/^a=([1-9])，b=([1-9])$/.exec(x);assert(match,'Q5 original expression choice, no auxiliary table/header/caption');return [Number(match[1]),Number(match[2])];});assert.deepEqual(tuples,[[a,bv],[a,bv+1],[a+1,bv+1],[a+1,bv+2]]);assert(tuples.flat().every(v=>v>0&&v<=9));truth=tuples.map(([u,v])=>u===a&&v===bv);}
 if(n===6){const[c,u,v,m,k]=values;assert.equal(prompt,`2次元の整数型配列 a の各要素 a(i，j) の値は，${c}i+j である。このとき，a(a(${u}，${u})×${m}，a(${v}，${v})+${k}) の値は幾つか。`);const inner1=u*(c+1),inner2=v*(c+1),i=inner1*m,j=inner2+k;assert([inner1,inner2,i,j].every(x=>x>=1&&x<=9));const correct=(c*i)+j;const numeric=cs.map(Number);assert.deepEqual(numeric,[c*i,c*i+k,c*i+inner2,correct]);assert(numeric.every(x=>x>=10&&x<=99));truth=numeric.map(x=>x===correct);assert(!/格納|上限|行優先|列優先/.test(prompt));}
 if(n===7){assert.equal(prompt,facts.questions['7'].prompt);const term=['n','1','2','3'][values[0]];assert.deepEqual(cs,[`${term}+F(n-1)`,'n-1+F(n)','n×F(n-1)','(n-1)×F(n)']);assert.equal(independentFactorialTrace(0,0,term).calls,0);assert.equal(independentFactorialTrace(0,2,term).calls,0);assert.equal(independentFactorialTrace(1,1,term).status,'cycle');assert.equal(independentFactorialTrace(1,3,term).status,'cycle');truth=cs.map((_,slot)=>{for(let n=0;n<=12;n++){let fac=1;for(let i=n;i>1;i--)fac*=i;const got=independentFactorialTrace(n,slot,term);if(got.status!=='value'||got.value!==fac)return false;}return true;});}
 if(n===8){assert.equal(prompt,facts.questions['8'].prompt);const[c,s]=values;const affine=(label:string)=>c===0?(s===1?label:`${s}×(${label})`):`${c}+${s===1?'':`${s}×`}(${label})`;const qr=[['x÷yの余り','x÷yの商'],['x÷yの商','x÷yの余り'],['y÷xの余り','y÷xの商'],['y÷xの商','y÷xの余り']];assert.deepEqual(cs,qr.map(([u,v])=>`${affine(u)}|${v}`));for(const ch of b.choices){assert.equal(ch.length,1);const table=ch[0];assert(table.type==='table');assert.deepEqual(table.columns,['qの値','rの値']);assert.equal(table.rows.length,1);}const failures=Array(4).fill(0);for(let x=1;x<=25;x++)for(let y=1;y<=12;y++){const actual=independentDivision(x,y,c,s);assert(actual.status==='value');const div=(a:number,b:number)=>{const d=independentDivision(a,b,0,1);assert(d.status==='value');return [d.q,d.r];};const[q,r]=div(x,y),[u,v]=div(y,x);const rows=[[c+s*r,q],[c+s*q,r],[c+s*v,u],[c+s*u,v]];rows.forEach(([cq,cr],i)=>{if(actual.q!==cq||actual.r!==cr)failures[i]++;});assert.equal(actual.r,x-actual.k*y);assert(actual.r>=0&&actual.r<y);}
 truth=failures.map(x=>x===0);assert.equal(independentDivision(5,0,c,s).status,'nonterminating');assert(b.explanation.includes('正整数')&&b.explanation.includes('y=0')&&b.explanation.includes('自然数'));}
 assert.deepEqual(truth,Array.from({length:4},(_,i)=>i===b.correctIndex),`all four choice truth Q${n}`);
 if(JSON.stringify(values)===JSON.stringify(contracts.internalReferences[n-1])){const raw=(facts.questions as Record<string,{choices:unknown[]}>)[String(n)].choices;const expected=raw.map(x=>Array.isArray(x)?n===5?`a=${x[0]}，b=${x[1]}`:x.join('|'):String(x));assert.deepEqual(cs,expected,'all original reference choices');assert.equal(prompt,(facts.questions as Record<string,{prompt:string}>)[String(n)].prompt,'original reference prompt');}
 return truth;
}
