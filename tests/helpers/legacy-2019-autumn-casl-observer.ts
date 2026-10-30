// Read-only test interpreter for the exact numeric instructions occurring in QS64–69.
// Not shipped/runtime code. The independent oracle is ordinary integer decimal arithmetic.
export type Flags={of:number;sf:number;zf:number};
export type CaslTrace={step:number;pc:number;instruction:string;gr:number[];flags:Flags};
const u16=(x:number)=>x&0xffff,s16=(x:number)=>(x&0x8000)?x-0x10000:x;
export const packed=(n:number,negative=n<0)=>{if(!Number.isInteger(n)||Math.abs(n)>999)throw Error('BCD_RANGE');const a=Math.abs(n);return(Math.floor(a/100)<<12)|(Math.floor(a/10)%10<<8)|(a%10<<4)|(negative?13:12);};
export function unpacked(n:number){const s=n&15,a=(n>>>12)*100+((n>>>8)&15)*10+((n>>>4)&15);if((s!==12&&s!==13)||(n>>>12)>9||((n>>>8)&15)>9||((n>>>4)&15)>9)throw Error('INVALID_BCD');return s===13?-a:a;}
const choices={a:['AND GR1,=#000F','AND GR1,=#F000','AND GR1,=#FFFF','OR GR1,=#000F','OR GR1,=#F000','OR GR1,=#FFFF'],b:['JMI MERGE','JNZ MERGE','JPL MERGE','JOV MERGE','JZE MERGE'],c:['SLA GR1,0,GR3','SLL GR1,0,GR3','SLL GR1,=4','SRA GR1,0,GR3','SRL GR1,0,GR3','SRL GR1,=4'],d:['JMI INI','JNZ INI','JOV INI','JPL INI','JZE INI'],e:['JMI MERGE','JNZ MERGE','JOV MERGE','JZE MERGE','SLL GR1,0,GR3','SRL GR1,0,GR3'],f:['ADDA GR1,GR0','ADDL GR1,=1','ADDL GR1,GR0','ADDL GR3,GR0','SUBL GR1,=1','SUBL GR1,GR0'],g:['ADDL GR1,=1','AND GR0,GR2','OR GR1,GR2','SUBL GR1,=1','XOR GR0,GR2'],h:['JMI P2','JNZ P2','JOV P2','JPL P2','JZE P2']};
export const q12Choices=choices;
type Slots=Partial<Record<keyof typeof choices,number>>;
export function q12Program(kind:1|2,slots:Slots={}):string[]{const get=(k:keyof typeof choices,def:number)=>choices[k][slots[k]??def];return[
 'RPUSH',...(kind===2?['CPL GR1,GR2',get('d',3),'LD GR4,GR1','LD GR1,GR2','LD GR2,GR4']:[]),
 'INI: ST GR1,A','ST GR2,B','LAD GR3,4',get('a',0),'ST GR1,RESULT','LD GR1,A','SRL GR1,0,GR3','LD GR2,B','SRL GR2,0,GR3','LOOP: AND GR1,=#000F','AND GR2,=#000F','LAD GR0,0',
 ...(kind===1?['ADDL GR1,GR2','CPL GR1,=10',get('b',0),'SUBL GR1,=10','LAD GR0,1']:['SUBL GR1,GR2','JPL MERGE',get('e',3),'ADDL GR1,=10','LAD GR0,1']),
 'MERGE: '+get('c',1),'OR GR1,RESULT','LAD GR3,4,GR3','CPL GR3,=16','JZE FIN','ST GR1,RESULT','LD GR1,A','SRL GR1,0,GR3','LD GR2,B','SRL GR2,0,GR3',kind===1?'ADDL GR1,GR0':get('f',5),'JUMP LOOP','FIN: LD GR0,GR1',
 ...(kind===2?['CPL GR0,=#000D','JNZ FIN2','LAD GR0,#000C']:[]),'FIN2: RPOP','RET'];}
export function observe(program:readonly string[],input:readonly number[],includeTrace=false){const labels=new Map<string,number>(),code=program.map((s,i)=>{const m=s.match(/^(\w+):\s*(.*)$/);if(m){labels.set(m[1],i);return m[2];}return s;});const gr=Array.from({length:8},(_,i)=>input[i]??(0x1100+i)),before=[...gr],memory=new Map<string,number>(),saved:number[][]=[],trace:CaslTrace[]=[],literals=new Map<number,number>();let flags:Flags={of:0,sf:0,zf:0},pc=0,steps=0;
 const reg=(s:string)=>{if(!/^GR[0-7]$/.test(s))throw Error('REGISTER '+s);return Number(s[2]);};const constant=(s:string)=>s.startsWith('#')?parseInt(s.slice(1),16):Number(s);const operand=(s:string)=>s.startsWith('GR')?gr[reg(s)]:s.startsWith('=')?u16(constant(s.slice(1))):(memory.get(s)??0);
 const set=(r:number,value:number,of=0)=>{gr[r]=u16(value);flags={of,sf:Number((gr[r]&0x8000)!==0),zf:Number(gr[r]===0)};};
 while(pc<code.length){if(++steps>300)throw Error('NONTERMINATING');const instruction=code[pc],parts=instruction.split(' '),op=parts[0],args=(parts[1]??'').split(',');pc++;
 if(op==='RET')break;
 if(op==='RPUSH'){saved.push(gr.slice(1));continue;}if(op==='RPOP'){const s=saved.pop();if(!s)throw Error('STACK');gr.splice(1,7,...s);continue;}
 if(op.startsWith('J')){const yes=op==='JUMP'||op==='JMI'&&flags.sf===1||op==='JPL'&&flags.sf===0&&flags.zf===0||op==='JZE'&&flags.zf===1||op==='JNZ'&&flags.zf===0||op==='JOV'&&flags.of===1;if(yes){const p=labels.get(args[0]);if(p===undefined)throw Error('LABEL');pc=p;}continue;}
 const r=reg(args[0]),v=operand(args[1]),left=gr[r];
 if(op==='ST')memory.set(args[1],left);
 else if(op==='LAD')gr[r]=u16(constant(args[1])+(args[2]?gr[reg(args[2])]:0));
 else if(op==='LD')set(r,v);
 else if(op==='CPL'||op==='CPA'){const a=op==='CPA'?s16(left):left,b=op==='CPA'?s16(v):v;flags={of:0,sf:Number(a<b),zf:Number(a===b)};}
 else if(op==='AND'||op==='OR'||op==='XOR')set(r,op==='AND'?left&v:op==='OR'?left|v:left^v);
 else if(['ADDA','ADDL','SUBA','SUBL'].includes(op)){const signed=op.endsWith('A'),a=signed?s16(left):left,b=signed?s16(v):v,result=op.startsWith('ADD')?a+b:a-b;set(r,result,Number(result<(signed?-32768:0)||result>(signed?32767:65535)));}
 else if(['SLL','SRL','SLA','SRA'].includes(op)){// Literal as shift address is an address, not its stored value; deliberately distinct.
  let n:number;if(args[1].startsWith('=')){if(!literals.has(constant(args[1].slice(1))))literals.set(constant(args[1].slice(1)),0x7000+literals.size);n=literals.get(constant(args[1].slice(1)))!;}else n=u16(constant(args[1])+(args[2]?gr[reg(args[2])]:0));
  let out=0,value=left;for(let i=0;i<n;i++){if(op==='SLL'){out=value>>>15;value=u16(value*2);}else if(op==='SRL'){out=value&1;value=value>>>1;}else if(op==='SLA'){out=(value>>>14)&1;value=(value&0x8000)|((value<<1)&0x7fff);}else{out=value&1;value=(value&0x8000)|(value>>>1);}}set(r,value,out);
 }else throw Error('UNSUPPORTED '+op);
 if(includeTrace)trace.push({step:steps,pc:pc-1,instruction,gr:[...gr],flags:{...flags}});
 }
 if(saved.length)throw Error('UNBALANCED_STACK');return{value:gr[0],gr,before,flags,steps,trace};}
export function observeQ12(kind:1|2,a:number,b:number,slots:Slots={},trace=false){return observe(q12Program(kind,slots),[0,a,b],trace);}
export const repairedQ12Program=()=>q12Program(2,{f:5}).map(s=>s==='SUBL GR1,GR0'?'ADDL GR2,GR0':s);
