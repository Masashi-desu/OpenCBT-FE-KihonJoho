type Instruction = { op: string; args: string[] };
export function caslMachine(sources: string[], replacements: Record<string,string>, initial: number[]) {
  const program = sources.join('\n').split('\n').map(line => line.split(';')[0].trimEnd()
    .replace(/［([abcd])］/g, (_, id: string) => replacements[id])).filter(Boolean);
  const label = new Map<string,number>(), instructions = new Map<number,Instruction>(), memory = new Map<number,number>();
  const words: [number,string][] = [];
  for (let address=0,i=0;i<program.length;i++) {
    const [first,...tail]=program[i].trim().split(/\s+/), [op,...operands] = /^[A-Z]/.test(program[i]) ? tail : [first,...tail];
    if (/^[A-Z]/.test(program[i])) label.set(first,address);
    const args=operands.join('').split(',');
    if(op==='DC') {words.push([address++,args[0]]);continue;}
    if(op==='DS') {address+=Number(args[0]);continue;}
    instructions.set(address++,{op,args});
  }
  const num=(value:string)=>label.get(value)??(value.startsWith('#')?parseInt(value.slice(1),16):Number(value));
  for (const [address,value] of words) memory.set(address,num(value));
  const mapStart=label.get('MFRG')!, base=label.get('MPDT')!;
  initial.forEach((word,i)=>memory.set(mapStart+i,word));
  const map=()=>initial.map((_,i)=>memory.get(mapStart+i)!);
  const call=(operation:number, param:number) => {
    const values=[param&0xffff,operation,286,318,477,514,767,1023], registers=[...values], stack=[-1];
    const ri=(value:string)=>Number(value.slice(2));
    const addr=(value:string,index?:string)=> (num(value)+(index ? registers[ri(index)] : 0))&0xffff;
    const read=(value:string,index?:string)=>value.startsWith('=')?num(value.slice(1)):
      /^GR/.test(value) ? registers[ri(value)] : (memory.get(addr(value,index))??0);
    let pc=0,zero=false,sign=false,overflow=false,found:number|undefined;
    const set=(destination:number,result:number,carry=false)=>{
      registers[destination]=result&0xffff;
      zero=registers[destination]===0;sign=registers[destination]>=0x8000;overflow=carry;
    };
    for(let step=0;step<6000;step++) {
      if(pc===label.get('FIND')) found=registers[3];
      const row=instructions.get(pc++);
      if(!row) return null;
      const {op,args:[x,y,z]}=row, r=ri(x), a=registers[r];
      switch(op) {
        case 'START':case 'NOP':break;
        case 'RPUSH':stack.push(...registers.slice(1));break;
        case 'RPOP': for(let i=7;i>0;i--) {if(stack.length<2)return null;registers[i]=stack.pop()!;} break;
        case 'RET': {
          const next=stack.pop();
          if(next===-1) return {value:registers[0]===0xffff?-1:registers[0],found, preserved:values.slice(1).every((reg,i)=>reg===registers[i+1])};
          if(next===undefined) return null; pc=next;break;
        }
        case 'LD':set(r,read(y,z));break;
        case 'ST':memory.set(addr(y,z),a);break;
        case 'LAD':registers[r]=addr(y,z);break;
        case 'CPA': {
          const signed=(v:number)=>v>=0x8000?v-0x10000:v, b=read(y,z);
          zero=a===b;sign=signed(a)<signed(b);overflow=false;break;
        }
        case 'AND':set(r,a&read(y,z));break;
        case 'OR':set(r,a|read(y,z));break;
        case 'XOR':set(r,a^read(y,z));break;
        case 'ADDL':{const value=a+read(y,z);set(r,value,value>0xffff);break;}
        case 'SUBL':{const value=a-read(y,z);set(r,value,value<0);break;}
        case 'SLL': {const n=addr(y,z);set(r,n>=16?0:a<<n,n>0&&n<=16&&((a>>(16-n))&1)!==0);break;}
        case 'SRL': {const n=addr(y,z);set(r,n>=16?0:a>>>n,n>0&&n<=16&&((a>>>(n-1))&1)!==0);break;}
        case 'JUMP':pc=addr(x,y);break;
        case 'CALL':stack.push(pc);pc=addr(x,y);break;
        case 'JMI':if(sign)pc=addr(x);break;
        case 'JNZ':if(!zero)pc=addr(x);break;
        case 'JZE':if(zero)pc=addr(x);break;
        case 'JOV':if(overflow)pc=addr(x);break;
        default:return null;
      }
    }
    return null;
  };
  return {call,map,base};
}

export const fromWords=(words:number[])=>words.flatMap(word=>Array.from({length:16},(_,i)=>Boolean(word&(0x8000>>>i))));
export const toWords=(map:boolean[])=>Array.from({length:map.length/16},(_,i)=>map.slice(i*16,i*16+16).reduce((n,bit)=>n*2+Number(bit),0));
