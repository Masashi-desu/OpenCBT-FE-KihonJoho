// Audit-only source-derived COMET numeric subset. Concrete word addresses, PR/SP,
// literal pools, seven PUSH/POP expansions, linked CALL/RET. Not a binary emulator.
const ops=new Set('LD ST LAD ADDA ADDL SUBA SUBL AND OR XOR CPA CPL SLA SRA SLL SRL JMI JNZ JZE JUMP JPL JOV CALL RET PUSH POP RPUSH RPOP'.split(' '));
const u=(n:number)=>n&65535,s=(n:number)=>(n&32768)?n-65536:n,num=(x:string)=>x.startsWith('#')?parseInt(x.slice(1),16):Number(x),reg=(x:string)=>{if(!/^GR[0-7]$/.test(x))throw Error('REG '+x);return Number(x[2]);};
export function assemble(programs:string[]){let addr=0x100;const symbols=new Map<string,number>(),instructions=new Map<number,{op:string;args:string[];next:number;scope:number}>(),initial=new Map<number,number>(),literals:{scope:number;value:string;address:number}[]=[],exports=new Map<string,number>();
 for(let scope=0;scope<programs.length;scope++){
 const lines:{label?:string;op:string;args:string[]}[]=[];
 for(const raw of programs[scope].split('\n')){const line=raw.split(';')[0].trim();if(!line)continue;const bits=line.split(/\s+/);let label:string|undefined;if(!ops.has(bits[0])&&!['START','END','DS','DC'].includes(bits[0]))label=bits.shift();const op=bits.shift()!,args=bits.join('').split(',').filter(Boolean);if(op==='RPUSH')for(let i=1;i<=7;i++)lines.push({label:i===1?label:undefined,op:'PUSH',args:['0','GR'+i]});else if(op==='RPOP')for(let i=7;i>=1;i--)lines.push({label:i===7?label:undefined,op:'POP',args:['GR'+i]});else lines.push({label,op,args});}
 const pending:{key:string;value:string}[]=[];
 for(const line of lines){if(line.label)symbols.set(scope+':'+line.label,addr);if(line.op==='START'){if(line.label)exports.set(line.label,addr);continue;}if(line.op==='END'){for(const item of pending){symbols.set(item.key,addr);initial.set(addr,num(item.value));literals.push({scope,value:item.value,address:addr++});}continue;}if(line.op==='DS'){for(let i=0;i<num(line.args[0]);i++)initial.set(addr++,0);continue;}if(line.op==='DC'){for(const arg of line.args)initial.set(addr++,u(num(arg)));continue;}
 for(const x of line.args)if(x.startsWith('=')){const key=scope+':'+x;if(!pending.some(v=>v.key===key))pending.push({key,value:x.slice(1)});}
 const one=['RET','POP'].includes(line.op)||['LD','ADDA','ADDL','SUBA','SUBL','AND','OR','XOR','CPA','CPL'].includes(line.op)&&/^GR/.test(line.args[1]);const next=addr+(one?1:2);instructions.set(addr,{...line,next,scope});addr=next;
 }
 }
 return{symbols,instructions,initial,exports,literals,end:addr};
}
export function run(machine:ReturnType<typeof assemble>,a:number,b:number,entry='ADDP',trace=false){const mem=new Map(machine.initial),gr=Array.from({length:8},(_,i)=>i===1?a:i===2?b:0x5000+i),before=[...gr];let sp=0xfeff,pr=machine.exports.get(entry)!,of=0,sf=0,zf=0,steps=0;mem.set(sp,0xffff);const events:any[]=[];
 const address=(x:string,scope:number,index?:string)=>{const base=/^#|^-?\d+$/.test(x)?num(x):machine.symbols.get(scope+':'+x)??machine.exports.get(x);if(base===undefined)throw Error('ADDRESS '+x);if(index&&index==='GR0')throw Error('INDEX_GR0');return u(base+(index?gr[reg(index)]:0));};
 const set=(r:number,n:number,o=0)=>{gr[r]=u(n);of=o;sf=Number((gr[r]&32768)!==0);zf=Number(gr[r]===0);};const push=(v:number)=>{sp=u(sp-1);mem.set(sp,u(v));},pop=()=>{const v=mem.get(sp);if(v===undefined)throw Error('STACK');sp=u(sp+1);return v;};
 while(pr!==0xffff){if(++steps>1500)throw Error('NONTERMINATING');const pc=pr,ins=machine.instructions.get(pr);if(!ins)throw Error('EXECUTE_DATA '+pr);const{op,args,scope}=ins;pr=ins.next;const oldSP=sp;
 if(op==='CALL'){push(pr);pr=address(args[0],scope,args[1]);}
 else if(op==='RET')pr=pop();
 else if(op==='PUSH')push(address(args[0],scope,args[1]));
 else if(op==='POP')gr[reg(args[0])]=pop();
 else if(op[0]==='J'){if(op==='JUMP'||op==='JMI'&&sf===1||op==='JPL'&&sf===0&&zf===0||op==='JZE'&&zf===1||op==='JNZ'&&zf===0||op==='JOV'&&of===1)pr=address(args[0],scope);}
 else{const r=reg(args[0]),left=gr[r],value=/^GR/.test(args[1])?gr[reg(args[1])]:mem.get(address(args[1],scope,args[2]))??0;
 if(op==='ST')mem.set(address(args[1],scope,args[2]),left);
 else if(op==='LAD')gr[r]=address(args[1],scope,args[2]);
 else if(op==='LD')set(r,value);
 else if(op==='CPA'||op==='CPL'){const x=op==='CPA'?s(left):left,y=op==='CPA'?s(value):value;of=0;sf=Number(x<y);zf=Number(x===y);}
 else if(['AND','OR','XOR'].includes(op))set(r,op==='AND'?left&value:op==='OR'?left|value:left^value);
 else if(['ADDA','ADDL','SUBA','SUBL'].includes(op)){const signed=op.endsWith('A'),x=signed?s(left):left,y=signed?s(value):value,n=op.startsWith('ADD')?x+y:x-y;set(r,n,Number(n<(signed?-32768:0)||n>(signed?32767:65535)));}
 else if(['SLL','SRL','SLA','SRA'].includes(op)){const count=address(args[1],scope,args[2]);let v=left,out=0;for(let i=0;i<count;i++){if(op==='SLL'){out=v>>>15;v=u(v*2);}else if(op==='SRL'){out=v&1;v>>>=1;}else if(op==='SLA'){out=v>>>14&1;v=(v&32768)|(v<<1&32767);}else{out=v&1;v=(v&32768)|(v>>>1);}}set(r,v,out);}
 else throw Error('OP '+op);}
 if(trace)events.push({pc,spBefore:oldSP,sp,pr,op,args,gr:[...gr],flags:{of,sf,zf}});
 }
 return{word:gr[0],gr,before,sp,pr,steps,events,stackMemory:[...mem].filter(([a])=>a>=0xfee0)};
}
