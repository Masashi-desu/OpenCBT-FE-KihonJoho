/** Independent COMET-style 16-bit interpreter, development-only.
 * It parses the actual visible programs. No producer answer/model is imported.
 * Supported instructions are exactly those occurring in the three source programs
 * and all 34 candidates. Uninitialised reads, illegal writes and step exhaustion fail.
 */
export type Instruction={module:string;op:string;args:string[];source:string};
export type MachineProgram={instructions:Instruction[];labels:Map<string,number>;entries:Map<string,number>;data:Map<string,number>};
export function assembleVisiblePrograms(programs:readonly string[]):MachineProgram {
 const instructions:Instruction[]=[],labels=new Map<string,number>(),entries=new Map<string,number>(),data=new Map<string,number>();
 for(const text of programs){let module='';for(const line of text.split('\n')){const plain=line.split(';')[0].trimEnd();if(!plain.trim())continue;
   const m=plain.match(/^(?:(\w+)\s+)?\s*(START|END|DS|RPUSH|RPOP|ADDL|SUBL|LAD|LD|ST|CPL|SLL|SRL|AND|JZE|JNZ|JMI|JPL|JUMP|CALL|RET)(?:\s+(.*))?$/);if(!m)throw Error('BAD_INSTRUCTION:'+line);
   const [,label,op,arg='']=m;if(op==='START'){if(!label||module)throw Error('BAD_START');module=label;entries.set(module,instructions.length);continue;}
   if(!module)throw Error('NO_MODULE');if(op==='END')continue;
   if(op==='DS'){if(!label||arg!=='3')throw Error('BAD_DS');data.set(`${module}:${label}`,0xc000);continue;}
   if(label){const key=`${module}:${label}`;if(labels.has(key))throw Error('DUPLICATE_LABEL');labels.set(key,instructions.length);}
   // A quoted single space is an operand, not whitespace to discard.
   const args=arg.match(/='[^']'|[^,]+/g)?.map(s=>s.trim())??[];
   instructions.push({module,op,args,source:line});
 }}return {instructions,labels,entries,data};
}
export type MachineInput={entry:'DTOB'|'GETWD'|'MULT';text:string;registers?:readonly number[];start?:number;table?:number;maxSteps?:number};
export function runVisibleMachine(program:MachineProgram,input:MachineInput){
 const start=input.start??0x1000,table=input.table??0x9000,r=Array.from(input.registers??[0x4711,start,table,0x9333,0x8444,0x7555,0x6666,0x5777],x=>x&0xffff);
 r[1]=start;if(input.entry==='DTOB')r[2]=input.text.length;else if(input.entry==='GETWD')r[2]=table;
 const before=[...r],memory=new Map<number,number>(),written:number[]=[];for(let i=0;i<input.text.length;i++)memory.set((start+i)&65535,input.text.charCodeAt(i));
 const saved:number[][]=[],returns:number[]=[],writes=new Set<number>();const entry=program.entries.get(input.entry);if(entry===undefined)throw Error('NO_ENTRY');let pc:number=entry,z=false,s=false,of=false,steps=0,halted=false;
 const reg=(a:string)=>{if(!/^GR[0-7]$/.test(a))throw Error('BAD_REGISTER:'+a);return Number(a[2]);};
 const number=(a:string,module:string)=>{if(a.startsWith('#'))return Number.parseInt(a.slice(1),16);if(/^-?\d+$/.test(a))return Number(a);const n=program.data.get(`${module}:${a}`);if(n===undefined)throw Error('BAD_ADDRESS:'+a);return n;};
 const effective=(args:string[],module:string)=>{const n=number(args[0],module)+(args[1]?r[reg(args[1])]:0);return n&65535; /* COMET effective addresses retain the low16 bits. */};
 const value=(args:string[],module:string)=>{const a=args[0];if(/^GR[0-7]$/.test(a))return r[reg(a)];if(a.startsWith('=')){const literal=a.slice(1);return (literal.startsWith("'")?literal.charCodeAt(1):number(literal,module))&65535;}const address=effective(args,module);if(!memory.has(address))throw Error('UNINITIALISED_READ:'+address);return memory.get(address)!;};
 const flags=(n:number,overflow=false)=>{z=n===0;s=(n&0x8000)!==0;of=overflow;};
 for(;steps<(input.maxSteps??200000);steps++){
   const ins:Instruction|undefined=program.instructions[pc];if(!ins)throw Error('PC_RANGE');const {module,op,args}=ins;pc++;
   const branch=()=>{const target=program.labels.get(`${module}:${args[0]}`);if(target===undefined)throw Error('MISSING_LABEL');pc=target;};
   if(op==='RPUSH'){saved.push(r.slice(1));continue;}if(op==='RPOP'){const a=saved.pop();if(!a)throw Error('REGISTER_STACK_UNDERFLOW');r.splice(1,7,...a);continue;}
   if(op==='RET'){const back=returns.pop();if(back===undefined){halted=true;break;}pc=back;continue;}
   if(op==='CALL'){const target:number|undefined=program.labels.get(`${module}:${args[0]}`)??program.entries.get(args[0]);if(target===undefined)throw Error('BAD_CALL');returns.push(pc);pc=target;continue;}
   if(op==='JUMP'){branch();continue;}if(op==='JZE'||op==='JNZ'||op==='JMI'||op==='JPL'){if(op==='JZE'?z:op==='JNZ'?!z:op==='JMI'?s:!s&&!z)branch();continue;}
   const dest=reg(args[0]);
   if(op==='LAD'){r[dest]=effective(args.slice(1),module)&65535;continue;}
   if(op==='ST'){const address=effective(args.slice(1),module);const ct=program.data.get('MULT:CTBL')!;if(!((address>=table&&address<table+32)||(address>=ct&&address<ct+3)))throw Error('WRITE_RANGE:'+address);memory.set(address,r[dest]);writes.add(address);written.push(address);continue;}
   const rhs=op==='SLL'||op==='SRL'?number(args[1],module):value(args.slice(1),module),lhs=r[dest];
   if(op==='LD'){r[dest]=rhs;flags(rhs);continue;}
   if(op==='CPL'){z=lhs===rhs;s=lhs<rhs;of=false;continue;}
   if(op==='ADDL'||op==='SUBL'){const n=op==='ADDL'?lhs+rhs:lhs-rhs;r[dest]=n&65535;flags(r[dest],n<0||n>65535);continue;}
   if(op==='AND'){r[dest]=lhs&rhs;flags(r[dest]);continue;}
   if(op==='SLL'||op==='SRL'){if(rhs<0||rhs>16)throw Error('SHIFT_RANGE');let n=lhs,last=false;for(let j=0;j<rhs;j++){last=op==='SLL'?(n&32768)!==0:(n&1)!==0;n=op==='SLL'?(n*2)&65535:n>>>1;}r[dest]=n;flags(n,last);continue;}
   throw Error('UNSUPPORTED:'+op);
 }
 if(!halted)throw Error('STEP_LIMIT');if(saved.length||returns.length)throw Error('UNBALANCED_STACK');
 return {registers:r,before,memory,writes:[...writes],written,steps:steps+1,flags:{z,s,of}};
}
/** Independent string/BigInt oracle; the source algorithm is not replicated. */
export function decimalReference(text:string){if(!/^\d+$/.test(text))throw Error('INPUT_DIGITS');const n=BigInt(text);if(n>65534n)throw Error('INPUT_VALUE');return Number(n);}
export function tableReference(text:string){if(!/^ *(?:\d+(?: +\d+)*)? *\.$/.test(text))throw Error('INPUT_FORMAT');const values=text.slice(0,-1).trim();return values?values.split(/ +/).map(decimalReference):[];}
