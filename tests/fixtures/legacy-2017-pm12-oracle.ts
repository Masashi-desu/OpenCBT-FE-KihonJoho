import assert from 'node:assert/strict';
import type{GeneratedBody}from'../../src/core/generators/definition';
import{createElement}from'react';import{renderToStaticMarkup}from'react-dom/server';
import{Legacy2017Pm12Program}from'../../src/ui/Legacy2017Pm12Program';
/** Reviewed values transcribed from p60; remaining rows are independently chosen carry/no-carry inputs. */
export const pm12Inputs=[
 [[0x3f1d,0xb759,0x2e0c,0xa684],[0x2e0c,0xa684,0x3f1d,0xb759]],
 [[0x3f1d,0xb759,0x2e0c,0x1684],[0x2e0c,0xa684,0x3f1d,0x2759]],
 [[0x1234,0x7ffe,0x2345,0xfffe],[0x2345,0x1234,0x4567,0x0005]],
 [[0x2345,0x3456,0x4567,0x0005],[0x1111,0x2222,0x6789,0xff00]],
 [[0x0001,0xffff,0x1357,0x8000],[0x0002,0x0000,0x2468,0x8000]],
 [[0x0000,0x1234,0x2468,0x7fff],[0x0000,0xabcd,0x3579,0x8000]],
 [[0x3000,0x4567,0x3456,0xf000],[0x1000,0x6789,0x4567,0x1000]],
 [[0x1111,0x2222,0x4568,0x0100],[0x2222,0x3333,0x5678,0x0200]],
] as const;
export const pm12WordNumber=(words:readonly number[])=>words.reduce((n,w)=>n*65536n+BigInt(w),0n);
export function pm12Words(n:bigint,count=4){return Array.from({length:count},(_,i)=>Number((n>>BigInt((count-i-1)*16))&65535n));}
type Env={registers:number[];memory:Map<number,number>;of:boolean;sf:boolean;zf:boolean;trace:number[];steps:number;writes:Set<number>};
type Instruction={label?:string;op:string;args:string[]};
const operations=new Set(['START','END','DS','RPUSH','RPOP','RET','LD','LAD','ST','ADDL','SUBL','CPL','AND','SRL','JOV','JUMP','JZE','JMI','JNZ','JPL','CALL']);
function parse(text:string){
 const instructions:Instruction[]=[];const labels=new Map<string,number>();
 for(const raw of text.split('\n')){const clean=raw.replace(/^\s*\d+\s+/,'').split(';')[0].trim();if(!clean)continue;const words=clean.split(/\s+/),label=operations.has(words[0])?undefined:words.shift(),op=words.shift()!;assert(operations.has(op),op);if(label)labels.set(label,instructions.length);instructions.push({label,op,args:words.join('').split(',').filter(Boolean)});}
 return{instructions,labels};
}
/** Small COMET II interpreter driven by actual displayed instruction text.
 * Reference answers use BigInt and never call this instruction interpreter. */
function execute(text:string,add:string,env:Env){
 const {instructions,labels}=parse(text),r=env.registers,stack:number[][]=[];
 const reg=(s:string)=>{assert(/^GR[0-7]$/.test(s),s);return Number(s.slice(2));};
 const numeric=(s:string)=>s.startsWith('#')?parseInt(s.slice(1),16):Number(s);
 const address=(args:string[])=>{const base=args[0]==='TEMP'?1000:numeric(args[0]);assert(Number.isSafeInteger(base));return (base+(args[1]?r[reg(args[1])]:0))&65535;};
 const read=(args:string[])=>/^GR/.test(args[0])?r[reg(args[0])]:args[0].startsWith('=')?numeric(args[0].slice(1)):(env.memory.get(address(args))??0x5a5a);
 const flags=(n:number,of=false)=>{env.zf=n===0;env.sf=(n&32768)!==0;env.of=of;};
 const jump=(label:string)=>{assert(labels.has(label),label);return labels.get(label)!;};
 for(let pc=0;pc<instructions.length;){if(++env.steps>40000)throw Error('step bound');const {op,args}=instructions[pc];let next=pc+1;
  switch(op){
   case'START':case'END':case'DS':break;
   case'RPUSH':stack.push(r.slice(1));break;
   case'RPOP':{const old=stack.pop();assert(old);old.forEach((n,i)=>r[i+1]=n);break;}
   case'RET':assert.equal(stack.length,0);return;
   case'LD':{const n=read(args.slice(1));r[reg(args[0])]=n;flags(n);break;}
   case'LAD':r[reg(args[0])]=address(args.slice(1));break;
   case'ST':{const a=address(args.slice(1));env.memory.set(a,r[reg(args[0])]);env.writes.add(a);break;}
   case'ADDL':{const target=reg(args[0]),n=r[target]+read(args.slice(1));r[target]=n&65535;flags(r[target],n>65535);if(args.join(',')==='GR0,0,GR3')env.trace.push(r[target]);break;}
   case'SUBL':{const target=reg(args[0]),n=r[target]-read(args.slice(1));r[target]=n&65535;flags(r[target],n<0);break;}
   case'CPL':{const a=r[reg(args[0])],b=read(args.slice(1));env.zf=a===b;env.sf=a<b;env.of=false;break;}
   case'AND':{const target=reg(args[0]);r[target]&=read(args.slice(1));flags(r[target]);break;}
   case'SRL':{const target=reg(args[0]),count=address(args.slice(1));r[target]=count>=16?0:r[target]>>>count;flags(r[target]);break;}
   case'JOV':if(env.of)next=jump(args[0]);break;
   case'JUMP':next=jump(args[0]);break;
   case'JZE':if(env.zf)next=jump(args[0]);break;
   case'JMI':if(env.sf)next=jump(args[0]);break;
   case'JNZ':if(!env.zf)next=jump(args[0]);break;
   case'JPL':if(!env.sf&&!env.zf)next=jump(args[0]);break;
   case'CALL':assert.equal(args[0],'ADD64');execute(add,add,env);break;
   default:throw Error(op);
  }pc=next;
 }
}
function environment(){return{registers:[0x8888,100,200,300,0x4444,0x5555,0x6666,0x7777],memory:new Map<number,number>(),of:false,sf:false,zf:false,trace:[],steps:0,writes:new Set<number>()};}
export function pm12InterpretAdd(program:string,left:readonly number[],right:readonly number[],same=false){
 const env=environment();left.forEach((n,i)=>env.memory.set(100+i,n));right.forEach((n,i)=>env.memory.set((same?100:200)+i,n));if(same)env.registers[2]=100;
 const before=env.registers.slice(1);execute(program,program,env);return{words:Array.from({length:4},(_,i)=>env.memory.get(100+i)!),registers:env.registers.slice(1),before,trace:env.trace,writes:[...env.writes].sort((a,b)=>a-b)};
}
export function pm12InterpretMul(program:string,add:string,left:bigint,right:bigint){
 const env=environment();pm12Words(left,2).forEach((n,i)=>env.memory.set(100+i,n));pm12Words(right,2).forEach((n,i)=>env.memory.set(200+i,n));const before=env.registers.slice(1);execute(program,add,env);return{words:Array.from({length:4},(_,i)=>env.memory.get(300+i)!),registers:env.registers.slice(1),before,steps:env.steps};
}
const hex=(n:number)=>'#'+n.toString(16).toUpperCase().padStart(4,'0');
const decode=(s:string)=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#x27;',"'");
export function pm12ProgramMarkup(kind:'add64'|'mul32'){return renderToStaticMarkup(createElement(Legacy2017Pm12Program,{kind}));}
/** Read the actual visible SVG text/blank boxes/side-note groups, not producer source arrays. */
export function pm12Programs(body:GeneratedBody){
 return(['add64','mul32']as const).map(kind=>{
  const diagram=body.prompt.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile===`legacy-2017-pm12-program-${kind}`);assert(diagram?.type==='diagram');
  const html=pm12ProgramMarkup(kind),rows=[...html.matchAll(/<g data-pm12-code-line="(\d+)"[^>]*>([\s\S]*?)<\/g>/g)];
  const lines=rows.map(([,,fragment],index)=>{assert.equal(Number(rows[index][1]),index+1);
   const text=(name:string)=>{const m=new RegExp(`<text[^>]*data-pm12-source="${name}"[^>]*>([\\s\\S]*?)<\\/text>`).exec(fragment);return m?decode(m[1]):'';};
   const hole=/data-pm12-hole="([a-f])"/.exec(fragment);return[text('label'),hole?`[${hole[1]}]`:text('op'),text('operands')].filter(Boolean).join(' ');
  });
  for(const [,start,,fragment]of html.matchAll(/<g data-pm12-note-range="(\d+):(\d+)"[^>]*>([\s\S]*?)<\/g>/g)){
   const note=[...fragment.matchAll(/<text[^>]*data-pm12-note-line="\d+"[^>]*>([\s\S]*?)<\/text>/g)].map(m=>decode(m[1])).join('');assert(note);lines[Number(start)-1]+=' ; '+note;
  }
  return lines.join('\n');
 });
}
export function assertPm12Body(body:GeneratedBody,v:number){
 const [left,right]=pm12Inputs[v],sum=pm12WordNumber(left)+pm12WordNumber(right);assert(sum<1n<<64n);
 const carry=Number((BigInt(left[3])+BigInt(right[3]))/65536n),dValue=left[2]+carry,counts=[5,5,3,6,8,8],offsets=[0,0,5,8,14,14],correct=[4,2,1,carry?3:2,0,4];
 assert.equal(body.choices.length,22);assert.equal(body.correctIndex,undefined);
 const strings=body.choices.map(c=>{assert.equal(c.length,1);const b=c[0];assert(b.type==='code');return b.text;});
 assert.deepEqual(strings,['AND GR5,=1','CPL GR3,=0','CPL GR3,GR1','CPL GR3,GR2','LD GR5,=1','JOV LOOP','JUMP LOOP','JZE LOOP',...[0,1,left[2],left[2]+1,right[2],right[2]+1].map(hex),'JMI LOWORD','JNZ LOWORD','JPL LOWORD','JZE LOWORD','LAD GR2,TEMP','LD GR2,=1','LD GR2,GR3','LD GR2,TEMP']);
 assert.equal(strings.slice(8,14).filter(s=>s===hex(dValue)).length,1);
 assert.deepEqual(body.answerParts,counts.map((n,i)=>({id:`part-${'abcdef'[i]}`,label:`設問${i<3?1:i===3?2:3} ${'abcdef'[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})));
 assert.deepEqual(body.partAnswers,correct.map((n,i)=>({kind:'choice',partId:`part-${'abcdef'[i]}`,choiceId:`choice-value-${offsets[i]+n+1}`})));
 const text=JSON.stringify(body.prompt);for(const s of ['GR1とGR2の値が等しい場合を除き','桁あふれは発生しない','GR1〜GR7の内容は元に戻す','GR1、GR2及びGR3が指し示す領域は互いに重ならない','連続した2語','連続した4語','行番号7の命令を2回目'])assert(text.includes(s),s);
 assert.equal(body.prompt.filter(b=>b.type==='table').length,0,'source banks are not supplemental tables');
 const banks=[['a、bに関する解答群',0,5],['cに関する解答群',5,8],['dに関する解答群',8,14],['e、fに関する解答群',14,22]] as const;
 for(const [heading,from,to]of banks){const bank=body.prompt.find(b=>b.type==='diagram'&&b.caption===heading);assert(bank?.type==='diagram');strings.slice(from,to).forEach((s,i)=>assert(bank.alt.includes('アイウエオカキク'[i]+' '+s)));}
 const [add,mul]=pm12Programs(body),normal=(s:string)=>s.replace(/^\s*\d+\s+/,'').trim().replace(/\s+/g,' ');
 const addExpected=['ADD64 START','RPUSH','LD GR0,=0','LAD GR3,3,GR1','LAD GR4,3,GR2','LOOP LD GR5,=0','ADDL GR0,0,GR3','JOV OV1','JUMP NOV1','OV1 [a]','NOV1 ADDL GR0,0,GR4','JOV OV2','JUMP NOV2','OV2 [a]','NOV2 ST GR0,0,GR3','LD GR0,GR5','[b]','JZE EXIT','SUBL GR3,=1','SUBL GR4,=1','[c]','EXIT RPOP','RET','END'];
 assert.deepEqual(add.split('\n').map(normal),addExpected);
 const mulExpected=['MUL32 START','RPUSH','LAD GR7,TEMP','LD GR0,0,GR1','ST GR0,2,GR7','LD GR0,1,GR1','ST GR0,3,GR7','LD GR0,=0','ST GR0,0,GR7','ST GR0,1,GR7','ST GR0,0,GR3','ST GR0,1,GR3','ST GR0,2,GR3','ST GR0,3,GR3','LD GR5,=0','LD GR4,GR2','LOOP LD GR6,GR5','SUBL GR6,=16','[e]','LD GR0,0,GR2','SRL GR0,0,GR6','JUMP TESTBIT','LOWORD LD GR0,1,GR2','SRL GR0,0,GR5','TESTBIT AND GR0,=#0001','JZE EXITLOOP','LD GR1,GR3','LAD GR2,TEMP','CALL ADD64','EXITLOOP CPL GR5,=31','JZE EXIT','ADDL GR5,=1','LAD GR1,TEMP','[f]','CALL ADD64','LD GR2,GR4','JUMP LOOP','EXIT RPOP','RET','TEMP DS 4','END'];
 assert.deepEqual(mul.split('\n').map(s=>normal(s.split(';')[0])),mulExpected);
 const addDiagram=body.prompt.find(b=>b.type==='diagram'&&b.caption==='プログラム1'),mulDiagram=body.prompt.find(b=>b.type==='diagram'&&b.caption==='プログラム2');assert(addDiagram?.type==='diagram'&&mulDiagram?.type==='diagram');
 for(const line of addExpected)assert(normal(addDiagram.alt).includes(line),`source alt line ${line}`);
 for(const line of mulExpected)assert(normal(mulDiagram.alt).includes(line),`source alt line ${line}`);
 assert.equal(body.prompt.filter(b=>b.type==='code').length,0);assert.equal(body.prompt.filter(b=>b.type==='diagram').length,9);
 for(const comment of ['初期化','下位2語に格納','上位2語に0を格納','GR3から始まる4語の領域に0を格納','ループカウンタ','GR2の値をGR4に退避','GR4に退避した値をGR2に復帰'])assert(mul.includes(comment),comment);
 assert(body.explanation.includes(`繰上がりは${carry}`));assert(body.explanation.includes(hex(dValue)));
 assert.equal(body.contexts?.length,1);const context=body.contexts![0];assert.equal(context.blocks.length,7);assert.equal(context.blocks[0].type,'paragraph');
 assert.deepEqual(context.blocks.slice(1).map(b=>{assert(b.type==='image');return b.assetId;}),[72,73,74,75,76,77].map(n=>`asset-ipa-2017h29h-fe-pm-12-p${n}${n===74?'-instructions':''}`));
 assert.equal(body.prompt.filter(b=>b.type==='image').length,0);
 assert(!/\b(?:IN|OUT|DC)\b/.test(add+'\n'+mul),'no textual/character/JIS-dependent instruction introduced');
}
