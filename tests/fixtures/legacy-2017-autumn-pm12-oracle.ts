/** Independent test-only numeric CASL interpreter and bit-string reference.
 * No generator imports, Unicode/character-code table, DC character or IO operation.
 * Chosen test addresses are test harness data, not fixed values in the paper. */
export type BitCase={alpha:readonly number[];beta:string;gamma:string};
export const reviewedAutumnPm12Cases:BitCase[]=[
 {alpha:[0xFFF3,0x7FFF],beta:'11011',gamma:'11110'},
 {alpha:[0xFFFF,0xBFFF],beta:'11011',gamma:'01101'},
 {alpha:[0xFFFE,0x7FFF],beta:'110011',gamma:'111001'},
 {alpha:[0xFFFF,0x3FFF],beta:'110011',gamma:'101110'},
 {alpha:[0xFFFE,0xFFFF],beta:'10111',gamma:'01110'},
 {alpha:[0xFFFF,0x7FFF],beta:'10111',gamma:'11100'},
 {alpha:[0xFFFD,0x7FFF],beta:'101011',gamma:'011110'},
 {alpha:[0xFFFE,0xBFFF],beta:'101011',gamma:'110100'},
];
export function bitStringReference(c:BitCase){
 if(c.alpha.length!==2||c.alpha.some(n=>!Number.isInteger(n)||n<0||n>65535)||!/^([01]){1,16}$/.test(c.beta)||c.beta.length!==c.gamma.length||!/^[01]+$/.test(c.gamma))throw Error('ORACLE_INPUT');
 const text=c.alpha.map(n=>n.toString(2).padStart(16,'0')).join(''),p=text.indexOf(c.beta),out=p<0?text:text.slice(0,p)+c.gamma+text.slice(p+c.beta.length),k=p+c.beta.length-16;
 return{p,after:[parseInt(out.slice(0,16),2),parseInt(out.slice(16),2)],maskAfter23:p>=0&&p<16&&k>0?parseInt('1'.repeat(k)+'0'.repeat(16-k),2):undefined};
}
type Ins={label:string;op:string;args:string[];line:number};type Module={name:string;instructions:Ins[];labels:Map<string,number>};
const ops=new Set(['START','END','RPUSH','RPOP','LD','LAD','ST','AND','OR','XOR','SUBA','ADDL','CPA','CPL','SLL','SRL','SRA','JMI','JPL','JOV','JZE','JUMP','CALL','RET']);
function parse(text:string):Module{
 const instructions:Ins[]=[],labels=new Map<string,number>();let name='';
 for(const[at,full]of text.split('\n').entries()){
  const code=full.split(';')[0].trim();if(!code)continue;
  const words=code.split(/\s+/);let label='',op=words.shift()!;if(!ops.has(op)){label=op;op=words.shift()??'';}
  if(!ops.has(op))throw Error(`NON_NUMERIC_OR_UNKNOWN_OPCODE:${op}`);
  if(op==='START'){name=label;continue;}if(op==='END')continue;
  if(label){if(labels.has(label))throw Error('DUPLICATE_LABEL');labels.set(label,instructions.length);}
  const args=words.join('').split(',').filter(Boolean);if(args.some(a=>!/^GR[0-7]$|^=?-?\d+$|^=?#[\dA-F]+$|^[A-Z][A-Z\d]*$/.test(a)))throw Error('NON_NUMERIC_OPERAND');
  instructions.push({label,op,args,line:at+1});
 }
 if(!name||!instructions.length)throw Error('MODULE');return{name,instructions,labels};
}
const u=(x:number)=>x&65535,s=(x:number)=>(x&32768)?x-65536:x;
export function runNumericCasl(program1:string,program2:string,c:BitCase,entry:'BSRH'|'BREP'='BREP',base=0x100){
 const modules=new Map([parse(program1),parse(program2)].map(m=>[m.name,m]));if(!modules.has('BSRH')||!modules.has('BREP'))throw Error('MODULE');
 bitStringReference(c);if(!Number.isInteger(base)||base<0||base>65534)throw Error('ADDRESS');
 const registers=[0x1234,base,parseInt(c.beta.padEnd(16,'0'),2),c.beta.length,parseInt(c.gamma.padEnd(16,'0'),2),0x5A5A,0x6A6A,0x7A7A],incoming=[...registers],memory=new Map([[base,c.alpha[0]],[base+1,c.alpha[1]]]),writes:{address:number;value:number}[]=[],saved:number[][]=[],calls:{module:string;pc:number}[]=[],trace:{module:string;line:number;registers:number[]}[]=[];
 let module=modules.get(entry)!,pc=0,of=false,sf=false,zf=false,steps=0,maskAfter23:number|undefined;
 const flags=(value:number,overflow=false)=>{of=overflow;sf=!!(value&32768);zf=value===0;};
 const reg=(a:string)=>{if(!/^GR[0-7]$/.test(a))throw Error('REGISTER');return Number(a[2]);};
 const numeric=(a:string)=>{if(!/^-?\d+$|^#[\dA-F]+$/.test(a))throw Error('NUMERIC');return a[0]==='#'?parseInt(a.slice(1),16):Number(a);};
 const address=(a:string,index?:string)=>u(numeric(a)+(index?registers[reg(index)]:0));
 const value=(a:string,index?:string)=>a.startsWith('=')?u(numeric(a.slice(1))):/^GR/.test(a)?registers[reg(a)]:(()=>{const addr=address(a,index);if(!memory.has(addr))throw Error('UNINITIALIZED_MEMORY');return memory.get(addr)!;})();
 const target=(label:string)=>{const n=module.labels.get(label);if(n===undefined)throw Error('LABEL');return n;};
 while(true){if(++steps>20000)throw Error('STEP_LIMIT');const ins=module.instructions[pc++];if(!ins)throw Error('PC');const[a,b,d]=ins.args;let result:number;
  switch(ins.op){
   case'RPUSH':saved.push(registers.slice(1));break;
   case'RPOP':{const values=saved.pop();if(!values)throw Error('STACK');registers.splice(1,7,...values);break;}
   case'LD':result=value(b,d);registers[reg(a)]=result;flags(result);break;
   case'LAD':registers[reg(a)]=address(b,d);break;
   case'ST':{const addr=address(b,d);if(!memory.has(addr))throw Error('WRITE_OUTSIDE_ALPHA');result=registers[reg(a)];memory.set(addr,result);writes.push({address:addr,value:result});break;}
   case'AND':case'OR':case'XOR':{const x=registers[reg(a)],y=value(b,d);result=u(ins.op==='AND'?x&y:ins.op==='OR'?x|y:x^y);registers[reg(a)]=result;flags(result);break;}
   case'SUBA':case'ADDL':{const x=registers[reg(a)],y=value(b,d),signed=s(x)-s(y),unsigned=x+y;result=u(ins.op==='SUBA'?signed:unsigned);registers[reg(a)]=result;flags(result,ins.op==='SUBA'?signed< -32768||signed>32767:unsigned>65535);break;}
   case'CPA':case'CPL':{const x=registers[reg(a)],y=value(b,d);of=false;sf=ins.op==='CPA'?s(x)<s(y):x<y;zf=x===y;break;}
   case'SLL':case'SRL':case'SRA':{let x=registers[reg(a)];const count=address(b,d);of=false;for(let i=0;i<Math.min(count,17);i++){if(ins.op==='SLL'){of=!!(x&32768);x=u(x*2);}else{of=!!(x&1);x=ins.op==='SRL'?x>>>1:(x>>>1)|(x&32768);}}registers[reg(a)]=x;const carry=of;flags(x,carry);break;}
   case'JMI':if(sf)pc=target(a);break;
   case'JPL':if(!sf&&!zf)pc=target(a);break;
   case'JOV':if(of)pc=target(a);break;
   case'JZE':if(zf)pc=target(a);break;
   case'JUMP':pc=target(a);break;
   case'CALL':calls.push({module:module.name,pc});if(modules.has(a)){module=modules.get(a)!;pc=0;}else pc=target(a);break;
   case'RET':{const dest=calls.pop();if(!dest){if(saved.length)throw Error('UNBALANCED_RPUSH');return{p:s(registers[0]),after:[memory.get(base)!,memory.get(base+1)!],registers,incoming,writes,steps,trace,maskAfter23};}module=modules.get(dest.module)!;pc=dest.pc;break;}
   default:throw Error('OPCODE');
  }
  trace.push({module:module.name,line:ins.line,registers:[...registers]});if(module.name==='BREP'&&ins.line===23)maskAfter23=registers[6];
 }
}
/** Cases cover first/second/cross word, absent, all legal n and p, zeros/ones,
 * overlapping matches and maximum numeric addresses; not all 2^32 inputs. */
export function boundaryBitCases(){
 const cases:BitCase[]=[...reviewedAutumnPm12Cases];
 for(let n=1;n<=16;n++)for(let at=0;at<=32-n;at++)for(const bit of['0','1']){
  const beta=bit.repeat(n),outside=bit==='0'?'1':'0',text=outside.repeat(at)+beta+outside.repeat(32-n-at),gamma=outside.repeat(n);
  cases.push({alpha:[parseInt(text.slice(0,16),2),parseInt(text.slice(16),2)],beta,gamma});
 }
 for(let n=1;n<=16;n++)cases.push({alpha:[0,0],beta:'1'.repeat(n),gamma:'0'.repeat(n)});
 return cases;
}
/** Source-reviewed six roles, derived with literal bit strings independently of
 * production bit shifts/options. n comes from the displayed beta's bit count. */
export function autumnPm12MaskRoleReference(c:BitCase){const r=bitStringReference(c),n=c.beta.length,k=r.p+n-16;if(r.p<0||r.p>=16||k<2||k>15)throw Error('REFERENCE_CROSS_WORD_DOMAIN');const low=(count:number)=>'0'.repeat(16-count)+'1'.repeat(count),high=(count:number)=>'1'.repeat(count)+'0'.repeat(16-count),bits=[low(k-1),low(k),high(k-2),high(k-1),high(k),high(k+1)],values=bits.map(s=>parseInt(s,2)),texts=values.map(n=>'#'+n.toString(16).toUpperCase().padStart(4,'0'));return{p:r.p,n,k,bits,values,texts,truth:values.map(n=>n===r.maskAfter23)};}
