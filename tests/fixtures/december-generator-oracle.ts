import assert from "node:assert/strict";
import type { GeneratedBody } from "../../src/core/generators/definition";
import type { Block } from "../../src/core/types";
export const blockText = (b: Block): string => b.type==="paragraph"||b.type==="code"?b.text:b.type==="list"?b.items.join("\n"):b.type==="table"?[...b.columns,...b.rows.flat()].join("\n"):"";
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const rows=(c:Block[])=>c.flatMap(b=>b.type==="table"?b.rows:[]).flat();
const array=(s:string):number[]=>JSON.parse(s.replaceAll("{","[").replaceAll("}","]"));
function unique(b:GeneratedBody,truth:boolean[]){assert.equal(new Set(b.choices.map(c=>JSON.stringify(c))).size,b.choices.length);assert.deepEqual(truth.flatMap((v,i)=>v?[i]:[]),[b.correctIndex]);}
const figure=(b:GeneratedBody,profile:string,values:number[])=>{const f=b.prompt.find(x=>x.type==="diagram");assert(f?.type==="diagram"&&f.scene.kind==="source_figure");assert.equal(f.scene.profile,profile);assert.deepEqual(f.scene.values,values);};
// Tiny arithmetic parser in tests only: recognizes numeric expressions, pow
// and factorial. It neither executes source code nor uses production solvers.
function expression(source:string,env:Record<string,number>,call:(name:string,args:number[])=>number):number {
  const tokens=source.match(/pow|factorial|[a-z]+|\d+(?:\.\d+)?|[(),＋−×÷]/g)!;let at=0;
  function atom():number {const s=tokens[at++];if(s==="("){const n=sum();assert.equal(tokens[at++],")");return n;}if(s==="pow"||s==="factorial"){assert.equal(tokens[at++],"(");const a=[sum()];while(tokens[at]===","){at++;a.push(sum());}assert.equal(tokens[at++],")");return call(s,a);}return s in env?env[s]:Number(s);}
  function product():number {let n=atom();while(tokens[at]==="×"||tokens[at]==="÷"){const op=tokens[at++],v=atom();n=op==="×"?n*v:n/v;}return n;}
  function sum():number {let n=product();while(tokens[at]==="＋"||tokens[at]==="−"){const op=tokens[at++],v=product();n=op==="＋"?n+v:n-v;}return n;}
  const result=sum();assert.equal(at,tokens.length);return result;
}
const powers=(name:string,args:number[])=>{assert.equal(name,"pow");return args[0]**args[1];};
const wordCases=[
  ["apple","april","melon","pen"],["table","tiger","brown","pen"],["plant","plate","brick","go"],
];
// Fixed by source review, independently from production definitions.
export const reviewedMinimaxBoards=["XOXXOO...","XOXXOOO..","XOXXOO.O.","XOXXOO..O","XOXXOOOX.","XOXXOOO.X","XOXXOOX.O","XOXXOO.XO","XOXXOOOXO","XOXXOOOOX","XOXXOOOXO"];
export const reviewedMinimaxEdges=[[0,1],[0,2],[0,3],[1,4],[1,5],[3,6],[3,7],[4,8],[5,9],[7,10]];
function gameValue(board:string,turn:string):number {
  const lines=[board.slice(0,3),board.slice(3,6),board.slice(6),...Array.from({length:3},(_,c)=>board[c]+board[c+3]+board[c+6]),board[0]+board[4]+board[8],board[2]+board[4]+board[6]];
  if(lines.includes("OOO"))return 1;if(lines.includes("XXX"))return -1;if(!board.includes("."))return 0;
  const scores=[...board].flatMap((x,i)=>x==="."?[gameValue(board.slice(0,i)+turn+board.slice(i+1),turn==="O"?"X":"O")]:[]);
  return turn==="O"?Math.max(...scores):Math.min(...scores);
}
// NIST SP800-145 p.3 (2011): service model; DBMS and delegation below are
// explicit fictional contracts, not universal claims about commercial PaaS.
// https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-145.pdf
const responsibilityFacts=[
  {OS:"B社",DBMS:"B社",XSS:"C社",premise:"PaaS上のDBMS"},
  {OS:"C社",DBMS:"B社",XSS:"C社",premise:"OSの導入と運用もC社"},
  {OS:"B社",DBMS:"C社",XSS:"C社",premise:"DBMSはC社がユーザープログラムとして導入・運用"},
];
// Reviewed control/data flow that the independent models below assume. Check
// the displayed program itself, so a stale model cannot certify changed code.
const programPremises:Record<number,RegExp[]>={
  1:[/x ← y\ny ← z\nz ← x\nyの値 と zの値/],
  2:[/if \(num が 空欄a で割り切れる\)/,/elseif \(num が 空欄b で割り切れる\)/,/elseif \(num が 空欄c で割り切れる\)/,/return result/],
  3:[/outの末尾に in\[1\]の値を追加/,/i を 2 から inの要素数/,/tail ← out\[outの要素数\]/,/outの末尾に \(tail ＋ in\[i\]\)の結果を追加/,/return out/],
  4:[/x ← num1/,/y ← num2/,/x ← x − y/,/y ← y − x/,/if \(空欄b\)/,/return x/],
  5:[/return 空欄/],
  6:[/rbyte ← byte/,/r ← 0+\n/,/for \(i を 1 から [4-8] まで 1 ずつ増やす\)\n    空欄\n  endfor\n  return r/],
  7:[/if \(n ＝ [01]\)\n    return 1\n  endif\n  return 空欄/],
  8:[/prioQueue ← PrioQueue\(\)/,/while \(prioQueue.size\(\) が 0 と等しくない\)\n    prioQueue.dequeue\(\)の戻り値を出力/],
  9:[/if \(tree\[n\]の要素数 が 2 と等しい\)\n    order\(tree\[n\]\[1\]\)\n    nを出力\n    order\(tree\[n\]\[2\]\)/,/elseif \(tree\[n\]の要素数 が 1 と等しい\)\n    order\(tree\[n\]\[1\]\)\n    nを出力\n  else\n    nを出力/],
  10:[/listHead ← listHead.next/,/prev ← listHead/,/prev ← prev.next/,/prev.next ← 空欄/],
  11:[/bins ← \{n個の未定義の値\}/,/bins\[data\[i\]\] ← data\[i\]/,/return bins/],
  12:[/i, cnt ← 0/,/if \(s1の要素数 ≠ s2の要素数\)\n    return −1/,/if \(空欄\)\n      cnt ← cnt ＋ 1/,/return cnt ÷ s1の要素数/],
  13:[/while \(low ≦ high\)/,/middle ← \(low ＋ high\) ÷ 2 の商/,/if \(data\[middle\] ＜ target\)/,/elseif \(data\[middle\] ＞ target\)\n      high ← middle\n    else\n      return middle/],
  14:[/i ← \(p × \(sortedDataの要素数 − 1\)\) の小数点以下を切り上げた値/,/return sortedData\[i ＋ 1\]/,/p ← \{0, 0.25, 0.5, 0.75, 1\}/,/rankDataの末尾に findRank\(sortedData, p\[i\]\)の戻り値を追加/],
  16:[/cp ← codePoint/,/for \(i を utf8Bytesの要素数 から 1 まで 1 ずつ減らす\)/,/utf8Bytes\[i\] ← utf8Bytes\[i\] ＋ \(cp ÷ 空欄 の余り\)\n    cp ← cp ÷ 空欄 の商/,/return utf8Bytes/],
};
export function decemberGeneratorOracle(number:number,b:GeneratedBody,v:number[]){
  const prompt=[...b.prompt,...(b.contexts??[]).flatMap(c=>c.blocks)].map(blockText).join("\n"), options=b.choices.map(c=>c.map(blockText).join(""));
  for(const premise of programPremises[number]??[])assert.match(prompt,premise,`Q${number}: reviewed program semantics`);
  assert(b.explanation.length>50);
  if(number===1){
    const values=[...prompt.matchAll(/整数型: ([xyz]) ← (\d+)/g)];assert.equal(values.length,3);
    const env=Object.fromEntries(values.map(m=>[m[1],Number(m[2])]));
    assert.deepEqual(Object.values(env).sort((a,b)=>a-b),[v[0],v[0]+1,v[0]+2]);
    for(const m of prompt.matchAll(/^([xyz]) ← ([xyz])$/gm))env[m[1]]=env[m[2]];
    unique(b,options.map(s=>same(s.split(",").map(Number),[env.y,env.z])));
    assert(b.explanation.includes(`${env.y},${env.z}`));
  }else if(number===2){
    const m=prompt.match(/整数が(\d)で割り切れて(\d)で/)!;assert(m);const [a,d]=[Number(m[1]),Number(m[2])];
    assert.deepEqual([a,d],[[3,5],[2,7],[3,7],[2,5]][v[0]]);
    unique(b,b.choices.map(c=>{const conditions=rows(c);return Array.from({length:a*d*4+1},(_,i)=>i-2*a*d).every(n=>{
      const expected=n%a===0&&n%d===0?`${a}と${d}`:n%a===0?String(a):n%d===0?String(d):"none";
      const found=conditions.find(s=>s.includes("と")?s.split("と").every(x=>n%Number(x)===0):n%Number(s)===0)??"none";
      return found===expected;
    });}));
  }else if(number===3){
    const input=array(prompt.match(/makeNewArray\((\{[^}]+\})\)/)![1]);
    const reviewed=[3,2,1,6,5,4];assert.deepEqual(input,reviewed.map((_,i)=>reviewed[(i+v[0])%6]+v[1]));
    let sum=0;const out:number[]=[];for(const x of input){sum+=x;out.push(sum);}unique(b,options.map(s=>Number(s)===out[4]));
    assert(b.explanation.includes(out.join(", ")));assert(prompt.includes("要素数2以上"));
  }else if(number===4){
    assert(prompt.includes(v[0]?"y ← y − x":"x ← x − y"));
    unique(b,b.choices.map(c=>{const [loop,condition,end]=rows(c);assert.equal(end,loop.startsWith("while")?"endwhile":"endif");
      for(let x0=1;x0<=30;x0++)for(let y0=1;y0<=30;y0++){
        let a=x0,d=y0;while(d)[a,d]=[d,a%d];let x=x0,y=y0,steps=0;
        while(x!==y&&steps++<100){if(steps>1&&!loop.startsWith("while"))break;const first=condition.includes("＜")?x<y:x>y;if(Boolean(first)!==Boolean(v[0]))x-=y;else y-=x;if(x<=0||y<=0)return false;}
        if(x!==a)return false;
      }return true;
    }));
  }else if(number===5){
    const n=v[0];assert(prompt.includes(["","","√","∛","⁴√"][n]));
    unique(b,options.map(s=>[[1,2],[2,3],[3,4],[4,5],[2,7]].every(([x,y])=>{const expected=Math.exp(Math.log(x**n+y**n)/n),actual=expression(s,{x,y},powers);return Math.abs(actual-expected)<=1e-10*Math.max(1,expected);} )));
  }else if(number===6){
    const width=Number(prompt.match(/関数revは(\d)ビット/)![1]);assert.equal(width,v[0]);assert(prompt.includes(`1 から ${width} まで`));
    unique(b,options.map(s=>{
      const lines=s.split("\n");let run:(input:number)=>number;
      if(lines[0].startsWith("r ← (r <<")){
        const shift=Number(lines[0].match(/<< (\d+)/)![1]),right=Number(lines[1].match(/>> (\d+)/)![1]),mask=Number.parseInt(lines[0].match(/∧ ([01]+)/)![1],2);assert.equal(mask,1);
        run=input=>{let r=0;for(let i=0;i<width;i++){r=((r<<shift)|(input&mask))&((1<<width)-1);input>>>=right;}return r;};
      }else{const left=Number(s.match(/<< (\d+)/)![1]),right=Number(s.match(/>> (\d+)/)![1]);run=input=>{for(let i=0;i<width;i++)input=((input<<left)|(input>>>right))&((1<<width)-1);return input;};}
      return Array.from({length:2**width},(_,i)=>i).every(n=>run(n)===parseInt(n.toString(2).padStart(width,"0").split("").reverse().join(""),2));
    }));
    const m=prompt.match(/rev\(([01]+)\)の戻り値は([01]+)/)!;assert(m);assert.equal([...m[1]].reverse().join(""),m[2]);
  }else if(number===7){
    assert(prompt.includes(`n ＝ ${v[0]}`));
    unique(b,options.map(s=>Array.from({length:8-v[0]},(_,i)=>i+v[0]).every(n=>{
      const active=new Set<number>();function f(x:number):number{if(x===v[0])return 1;if(x<v[0]||active.has(x))return NaN;active.add(x);const r=expression(s,{n:x},(name,args)=>{assert.equal(name,"factorial");return f(args[0]);});active.delete(x);return r;}
      return f(n)===Array.from({length:n},(_,i)=>i+1).reduce((a,d)=>a*d,1);
    })));
  }else if(number===8){
    figure(b,"priority-queue-class",v);
    const queues=[[],[],[]] as string[][],taken:string[]=[];
    const take=()=>{const priorities=v[0]?[2,1,0]:[0,1,2],index=priorities.find(i=>queues[i].length)!;return v[1]?queues[index].pop()!:queues[index].shift()!;};
    const code=prompt.split("○prioSched()")[1];assert(code);
    for(const line of code.split("\n")){const m=line.match(/enqueue\("([A-D])", ([1-3])\)/);if(m)queues[Number(m[2])-1].push(m[1]);else if(line.includes("dequeue() /*"))taken.push(take());}
    assert.equal(taken.length,4);const answer:string[]=[];while(queues.some(a=>a.length))answer.push(take());
    unique(b,options.map(s=>same([...s.matchAll(/[“"]([A-D])[”"]/g)].map(m=>m[1]),answer)));assert(b.explanation.includes(answer.join("、")));
  }else if(number===9){
    figure(b,"sample-tree-14",v);const tree:number[][]=JSON.parse(prompt.match(/tree ← (\{.*\}) \/\//)![1].replaceAll("{","[").replaceAll("}","]"));
    assert.equal(tree.length,14);assert.deepEqual(tree.slice(0,3),[[2,3],[4,5],[6,7]]);
    assert.equal(tree.findIndex((r,i)=>i>=3&&r.length===1)+1,v[0]);assert.deepEqual(tree.flat().sort((a,b)=>a-b),Array.from({length:13},(_,i)=>i+2));
    const result:number[]=[],stack:number[]=[];let node:number|undefined=1;
    while(node||stack.length){while(node){stack.push(node);node=tree[node-1][0];}node=stack.pop()!;result.push(node);node=tree[node-1][1];}
    unique(b,options.map(s=>same(s.split("，").map(Number),result)));assert(b.explanation.includes(result.join("、")));
  }else if(number===10){
    const base=v[0];assert(prompt.includes(`pos が ${base} と等しい`));assert(prompt.includes(`i を ${base+1} から pos − 1`));
    unique(b,options.map(s=>{
      for(let length=1;length<=6;length++)for(let target=0;target<length;target++){
        type N={val:number,next?:N};let head:N|undefined;for(let i=length-1;i>=0;i--)head={val:i,next:head};
        if(!target)head=head!.next;else{let prev=head!;for(let i=base+1;i<target+base;i++)prev=prev.next!;
          const parts=s.split(".");let value:N|undefined=parts[0]==="prev"?prev:head;for(const part of parts.slice(1)){assert.equal(part,"next");if(!value)return false;value=value.next;}prev.next=value;}
        const output:number[]=[],seen=new Set<N>();for(let at=head;at;at=at.next){if(seen.has(at))return false;seen.add(at);output.push(at.val);}
        if(!same(output,Array.from({length},(_,i)=>i).filter(i=>i!==target)))return false;
      }return true;
    }));
  }else if(number===11){
    const [n,base]=v;assert(prompt.includes(`要素番号は${base}`));
    unique(b,options.map(s=>{const data=array(s);assert.equal(data.length,n);assert(data.every(x=>x>=base&&x<base+n));const result=Array<number|undefined>(n).fill(undefined);data.forEach(x=>result[x-base]=x);return result.every((x,i)=>x===base+i);}));
  }else if(number===12){
    const base=v[0];assert(prompt.includes(`要素番号は${base}`));assert(prompt.includes("配列の領域外"));assert(prompt.includes("実数として計算"));
    const table=b.prompt.find(x=>x.type==="table");assert(table?.type==="table");const [word,near,other,short]=wordCases[v[1]];
    table.rows.forEach((r,i)=>{const chars=(s:string)=>JSON.parse(s.replaceAll("{","[").replaceAll("}","]")) as string[];const a=chars(r[0]),d=chars(r[1]);assert.equal(a.join(""),word);assert.equal(d.join(""),[word,near,other,short][i]);assert.equal(Number(r[2].replace("−","-")),a.length!==d.length?-1:a.filter((x,j)=>x===d[j]).length/a.length);});
    const words=[1,2,3,4].flatMap(n=>Array.from({length:2**n},(_,i)=>i.toString(2).padStart(n,"0")));
    unique(b,options.map(s=>words.every(a=>words.every(d=>{if(a.length!==d.length)return true;let count=0;for(let i=0;i<a.length;i++){const at=s.includes("s2[cnt]")?count-base:i;if(at<0||at>=d.length)return false;const equal=a[i]===d[at];if(s.includes("≠")?!equal:equal)count++;}return count/a.length===[...a].filter((x,i)=>x===d[i]).length/a.length;}))));
  }else if(number===13){
    const [base,fix]=v;assert(prompt.includes(`low ← ${base}`));assert(prompt.includes(fix?"low ← middle ＋ 1":"low ← middle\n"));
    function loops(data:number[],target:number){let lo=base,hi=data.length+base-1;const seen=new Set<string>();while(lo<=hi){const state=`${lo},${hi}`;if(seen.has(state))return true;seen.add(state);const middle=Math.floor((lo+hi)/2),value=data[middle-base];if(value<target)lo=middle+(fix?1:0);else if(value>target)hi=middle;else return false;}return false;}
    const cases=Array.from({length:7},(_,i)=>i-2).flatMap(a=>[[a],...Array.from({length:6-a},(_,i)=>[a,a+i+1])]).flatMap(data=>Array.from({length:10},(_,i)=>({data,target:i-3})));
    unique(b,options.map((s,i)=>{assert(s.length>5);const matches=cases.filter(({data,target})=>i===0?data.length===1&&target===data[0]:i===1?data.length===2&&target===data[0]:i===2?data.length===2&&(fix?target<data[0]:target===data[1]):data.includes(-1));assert(matches.length);return matches.every(c=>loops(c.data,c.target));}));
  }else if(number===14){
    const input=array(prompt.match(/summarize\((\{[^}]+\})\)/)![1]);assert.deepEqual(input,Array.from({length:10},(_,i)=>(v[0]+i*v[1])/10));
    const expected=[0,1,2,3,4].map(n=>input[Math.floor((n*9+3)/4)]);unique(b,options.map(s=>same(array(s),expected)));assert(b.explanation.includes(expected.join(", ")));
  }else if(number===15){
    figure(b,"sample-minimax",v);const value=v[0]*5,query=[[0,2],[1,2],[1,0]][v[1]],actual=query.map(i=>gameValue(reviewedMinimaxBoards[i+1],"X")*value);
    assert(prompt.includes(`勝ちを${value}`));assert(prompt.includes(`負けを−${value}`));unique(b,b.choices.map(c=>same(rows(c).map(Number),actual)));
    assert(b.explanation.includes(`a=${actual[0]}、b=${actual[1]}`));
  }else if(number===16){
    const count=v[0], initial=array(prompt.match(/utf8Bytes ← (\{[^}]+\})/)![1]);assert.equal(initial.length,count);
    if(count===3){assert(prompt.includes("実際のUTF-8では符号化しない"));assert(prompt.includes("D800(16)〜DFFF(16)"));assert(b.explanation.includes("3バイト整数域"));}
    else{assert(!prompt.includes("サロゲート符号位置"));assert(!b.explanation.includes("本問の3バイト整数域"));assert(b.explanation.includes(`この${count}バイト版`));}
    const min=[0,0,0x80,0x800,0x10000][count],max=[0,0,0x7ff,0xffff,0x10ffff][count];
    assert(prompt.includes(min.toString(16).toUpperCase()+"(16)以上"));assert(prompt.includes(max.toString(16).toUpperCase()+"(16)以下"));
    const samples=new Set<number>([min,min+1,max-1,max,0xD7FF,0xD800,0xDFFF,0xE000].filter(x=>x>=min&&x<=max));
    for(let power=0;power<=20;power++)for(const d of [-1,0,1]){const x=2**power+d;if(x>=min&&x<=max)samples.add(x);}
    for(let n=min;n<=Math.min(max,min+500);n++)samples.add(n);
    // Unicode 16.0 ch.3 tables 3-6/3-7 exclude surrogate code points.
    // https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/
    const pattern=count===2?["110","10"]:count===3?["1110","10","10"]:["11110","10","10","10"];
    unique(b,options.map(s=>Array.from(samples).every(cp=>{
      let remain=cp;const bytes=[...initial];for(let index=count-1;index>=0;index--){const i=index+1,div=s.includes("の")?(s.includes(`${count+1} − i`)?2**(count+1-i):2**i):s.includes("×")?(s.includes(`${count+1} − i`)?(count+1-i)*2:i*2):Number(s);bytes[index]+=remain%div;remain=Math.floor(remain/div);}
      const bits=cp.toString(2).padStart(count===2?11:count===3?16:21,"0");let offset=0;const expected=pattern.map(prefix=>{const width=8-prefix.length,bitsForByte=bits.slice(offset,offset+width);offset+=width;return parseInt(prefix+bitsForByte,2);});
      if(cp<0xD800||cp>0xDFFF)assert.deepEqual(expected,[...new TextEncoder().encode(String.fromCodePoint(cp))]);
      return same(bytes,expected);
    })));
  }else if(number===17){
    const fact=responsibilityFacts[v[0]];assert(prompt.includes(fact.premise));assert(prompt.includes("Webアプリケーションプログラムの脆弱性対策はC社"));
    const issues=b.contexts![1].blocks.map(blockText),types=issues.map(s=>s.includes("OS")?"OS":s.includes("DBMS")?"DBMS":"XSS") as ("OS"|"DBMS"|"XSS")[];
    assert.deepEqual(types,[["OS","XSS","DBMS"],["OS","DBMS","XSS"],["XSS","OS","DBMS"],["XSS","DBMS","OS"],["DBMS","OS","XSS"],["DBMS","XSS","OS"]][v[1]]);
    unique(b,b.choices.map(c=>same(rows(c),types.map(t=>fact[t]))));
  }else if(number===18){
    const risks=b.prompt.filter(x=>x.type==="paragraph").slice(1).map(blockText);assert.equal(risks.length,5);
    // Frozen before/after capability review: newly granted client-developer
    // VPN access increases load; private devices add infection propagation,
    // newly issued company devices add company-device loss. Other actors and
    // the existence of private mail use are unchanged.
    const matches=risks.map(s=>s.includes("可用性")||(!v[0]?s.includes("拡散"):s.includes("A社PCを紛失")));
    assert(prompt.includes(v[0]?"個人所有PCのVPN接続は禁止":"従来の電子メール利用"));
    const labels=["一","二","三","四","五"];
    unique(b,options.map(s=>{const ids=[...s.matchAll(/\(([一二三四五])\)/g)].map(m=>labels.indexOf(m[1]));assert.equal(ids.length,2);return ids.every(i=>matches[i]);}));
  }else if(number===19){
    const table=b.prompt.find(x=>x.type==="table");assert(table?.type==="table");assert(prompt.includes("別の利用者が承認"));assert(prompt.includes("口頭"));assert(prompt.includes("A社が承認"));
    const permissions:Record<string,string[]>={"Z販売課の販売責任者":["○","","○"],"商品ZのB社販売責任者":["○","",""],"商品ZのB社販売担当者":["○","○",""]};
    const holes=["空欄a1","空欄a2"].map(name=>table.rows.find(r=>r[0]===name)!.slice(1));
    unique(b,b.choices.map(c=>rows(c).every((name,i)=>same(permissions[name],holes[i]))));
  }else if(number===20){
    assert(prompt.includes(`${v[1]}名が運用`));assert(prompt.includes("編集した担当者自身"));assert(prompt.includes("8文字"));assert.equal(options.length,7);
    const route=v[0]===1;assert(prompt.includes(route?"機能権限を直接限定できない":"利用者IDごとに機能権限を付与できる"));
    unique(b,options.map(s=>{
      // Model each proposal's allowed functions. A solution must allow an
      // edit and an approval while no person can perform both.
      type F="edit"|"log"|"approve";const full:F[]=["edit","log","approve"];let people:F[][];
      if(s.includes("コンソールだけ"))people=route?[["edit"],["log","approve"]]:[full,full];
      else if(s.includes("機能権限を直接設定")){if(route)return false;people=[["edit"],["log","approve"]];}
      else if(s.includes("ログ確認権限だけ"))people=[["log"],full];
      else people=[full];
      return people.some(p=>p.includes("edit"))&&people.some(p=>p.includes("approve"))&&people.every(p=>!p.includes("edit")||!p.includes("approve"));
    }));
  }else throw Error(`Missing December oracle ${number}`);
}
