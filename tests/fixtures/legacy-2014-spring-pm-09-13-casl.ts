/** Independent COMET II subset used by the published GETTKN and CALC listings. */
type Instruction = { label:string; op:string; operands:string[] };
type Registers = number[];
type Module = { code:Instruction[]; labels:Map<string,number> };

const word = (value:number)=>value&0xffff;
const signed = (value:number)=>(value&0x8000)?value-0x10000:value;

function moduleOf(text:string):Module {
  const code:Instruction[]=[];
  const labels=new Map<string,number>();
  for(const line of text.split('\n')){
    const statement=line.split(';')[0].trimEnd();
    if(!statement.trim())continue;
    const [,label='',op,args='']=/^(?:(\S+)\s+|\s+)(\S+)(?:\s+(.*))?$/.exec(statement)!;
    if(label)labels.set(label,code.length);
    if(!['START','END','DS','DC'].includes(op))code.push({label,op,operands:args?args.split(',').map(x=>x.trim()):[]});
  }
  return {code,labels};
}

export function executeSpringCasl(program1:string,program2:string,mode:'tokens'|'calc',input:string,base=100){
  const module1=moduleOf(program1), module2=moduleOf(program2);
  const mem=new Map<number,number>();
  [...input].forEach((char,index)=>mem.set(base+index,char.charCodeAt(0)));
  const cells={CTBL:400,LTBL:600};
  for(const [i,name] of [[0,'MULT'],[1,'PLUS'],[3,'MINUS']] as const)mem.set(cells.LTBL+i,module2.labels.get(name)!);
  const nextChars:string[]=[];
  const regs:Registers=[0,base,cells.CTBL,0,0,0,0,0];
  let steps=0;
  function execute(mod:Module){
    const stack:number[]=[];
    const saves:number[][]=[];
    let pc=0, flag=0;
    const regIndex=(operand:string)=>Number(operand.slice(2));
    const scalar=(literal:string):number=>{
      if(literal.startsWith('='))return scalar(literal.slice(1));
      if(literal.startsWith("'"))return literal.charCodeAt(1);
      if(literal.startsWith('#'))return parseInt(literal.slice(1),16);
      if(literal==='CTBL'||literal==='LTBL')return cells[literal];
      if(!/^-?\d+$/.test(literal))throw Error('unsupported operand '+literal);
      return Number(literal);
    };
    const address=(operand:string,index?:string)=>word(scalar(operand)+(index===undefined?0:regs[regIndex(index)]));
    const read=(a:number)=>{
      const value=mem.get(a);if(value===undefined)throw Error('uninitialized address '+a);return value;
    };
    const value=(operand:string,index?:string)=>operand.startsWith('GR')?regs[regIndex(operand)]:
      operand.startsWith('=')?word(scalar(operand)):read(address(operand,index));
    const target=(name:string)=>{
      const destination=mod.labels.get(name);if(destination===undefined)throw Error('unknown label '+name);return destination;
    };
    const set=(register:number,value:number,flags=true)=>{
      regs[register]=word(value);
      if(flags)flag=Math.sign(signed(regs[register]));
    };
    for(;;){
      if(++steps>10000)throw Error('nonterminating program');
      const {op,label,operands:[a,b,c]}=mod.code[pc++];
      const register=a?.startsWith('GR')?regIndex(a):0;
      if(mod===module1&&label==='NEXT')nextChars.push(String.fromCharCode(regs[4]));
      switch(op){
        case 'RPUSH':saves.push(regs.slice(1));break;
        case 'RPOP':regs.splice(1,7,...saves.pop()!);break;
        case 'LAD':set(register,address(b,c),false);break;
        case 'LD':set(register,value(b,c));break;
        case 'ST':mem.set(address(b,c),regs[register]);break;
        case 'CPL':flag=Math.sign(regs[register]-value(b,c));break;
        case 'ADDL':set(register,regs[register]+value(b,c));break;
        case 'SUBL':set(register,regs[register]-value(b,c));break;
        case 'AND':set(register,regs[register]&value(b,c));break;
        case 'SLL':set(register,regs[register]<<scalar(b));break;
        case 'SRL':set(register,regs[register]>>>scalar(b));break;
        case 'JZE':if(flag===0)pc=target(a);break;
        case 'JNZ':if(flag!==0)pc=target(a);break;
        case 'JPL':if(flag>0)pc=target(a);break;
        case 'JMI':if(flag<0)pc=target(a);break;
        case 'JUMP':pc=b===undefined?target(a):address(a,b);break;
        case 'CALL':
          if(a==='GETTKN'){execute(module1);break;}
          if(a==='DTOB'){
            const start=read(regs[1]),length=read(regs[1]+1);
            const digits=Array.from({length},(_,i)=>String.fromCharCode(read(start+i))).join('');
            if(!/^\d+$/.test(digits))throw Error('DTOB argument');
            regs[0]=word(Number(digits));
            break;
          }
          stack.push(pc);pc=target(a);break;
        case 'RET':if(!stack.length)return;pc=stack.pop()!;break;
        default:throw Error('unsupported opcode '+op);
      }
    }
  }
  execute(mode==='tokens'?module1:module2);
  const result:number[]=[];
  for(let addr=cells.CTBL;addr<cells.CTBL+100;addr+=3){
    const marker=mem.get(addr);if(marker===undefined)throw Error('missing token terminator');
    if(marker===0xffff){result.push(-1);break;}
    const length=mem.get(addr+1),kind=mem.get(addr+2);
    if(length===undefined||kind===undefined)throw Error('incomplete token');
    result.push(marker,length,kind);
  }
  return {result,nextChars,registers:regs};
}
