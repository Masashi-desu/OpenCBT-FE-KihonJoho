const toWord=(value:number)=>value&0xffff;
const signed=(value:number)=>value>=0x8000?value-0x10000:value;
const targetAddress=0x2000;
interface Instruction{op:string;args:string[]}
export function assembleCasl(sources:string[],key:Record<string,string>) {
  const labels=new Map<string,number>(), instructions:Instruction[]=[];
  for(const row of sources.join('\n').split('\n')) {
    const instruction=row.split(';')[0].trimEnd().replace(/［([abcd])］/g,(_,char:string)=>key[char]);
    if(!instruction.trim()) continue;
    const [first,...tail]=instruction.trim().split(/\s+/), [op,...rest]=/^[A-Z]/.test(instruction)?tail:[first,...tail];
    if(/^[A-Z]/.test(instruction)) labels.set(first,instructions.length);
    instructions.push({op,args:rest.join('').split(',')});
  }
  return function run(entry:'BREP'|'ROTSL',initial:number,wanted:number,replacement:number,width:number,rotate=0){
    const externalRegisters=[rotate,targetAddress,wanted,replacement,width,123,456,789];
    const registers=[...externalRegisters], stack=[-1], rotationSteps:number[]=[];
    let memory=initial, next=labels.get(entry)!, sf=false,zf=false;
    const reg=(text:string)=>Number(text?.slice(2));
    const address=(text:string,index?:string)=>toWord(Number(text)+(index?registers[reg(index)]:0));
    const read=(text:string,index?:string)=>{
      if(text.startsWith('GR')) return registers[reg(text)];
      if(text.startsWith('=#')) return parseInt(text.slice(2),16);
      if(text.startsWith('=')) return toWord(Number(text.slice(1)));
      if(address(text,index)!==targetAddress) throw Error('out of target memory');
      return memory;
    };
    const set=(register:number,value:number)=>{
      registers[register]=toWord(value);
      sf=registers[register]>0x7fff;
      zf=registers[register]===0;
    };
    try {
      for(let cycles=0;cycles<1024;cycles++){
        const instruction=instructions[next++];
        if(!instruction) return null;
        const {op,args:[x,y,z]}=instruction, r=reg(x), a=registers[r];
        switch(op){
          case 'START':break;
          case 'LD':set(r,read(y,z));break;
          case 'ST':if(address(y,z)!==targetAddress)return null;memory=a;break;
          case 'RPUSH':stack.push(...registers.slice(1));break;
          case 'RPOP':
            for(let i=7;i>=1;i--){if(stack.length<2)return null;registers[i]=stack.pop()!;}
            break;
          case 'RET': {
            const destination=stack.pop();
            if(destination===-1) return {word:memory,steps:rotationSteps,preserved:registers.slice(1).every((v,j)=>v===externalRegisters[j+1])};
            if(destination===undefined)return null;
            next=destination;break;
          }
          case 'CPL':{const other=read(y,z);sf=a<other;zf=a===other;break;}
          case 'CPA':{const other=signed(read(y,z));sf=signed(a)<other;zf=signed(a)===other;break;}
          case 'SRA':set(r,signed(a)>>Math.min(address(y,z),16));break;
          case 'SLL':{const n=address(y,z);set(r,n>=16?0:a<<n);break;}
          case 'SRL':{const n=address(y,z);set(r,n>=16?0:a>>>n);break;}
          case 'SUBA':set(r,signed(a)-signed(read(y,z)));break;
          case 'AND':set(r,a&read(y,z));break;
          case 'OR':set(r,a|read(y,z));break;
          case 'JUMP':next=labels.get(x)!;break;
          case 'JZE':if(zf)next=labels.get(x)!;break;
          case 'JNZ':if(!zf)next=labels.get(x)!;break;
          case 'JPL':if(!zf&&!sf)next=labels.get(x)!;break;
          case 'JMI':if(sf)next=labels.get(x)!;break;
          case 'CALL':
            if(x==='ROTSL')rotationSteps.push(registers[0]);
            stack.push(next);next=labels.get(x)!;break;
          default:return null;
        }
      }
    } catch {return null;}
    return null;
  };
}

export function replaceNonoverlapping(source:string,find:string,replacement:string) {
  const locations:number[]=[];
  for(let offset=0;offset<=source.length-find.length;){
    const match=source.indexOf(find,offset);
    if(match<0) break;
    locations.push(match);
    offset=match+find.length;
  }
  let expected=source;
  for(const at of locations) expected=expected.slice(0,at)+replacement+expected.slice(at+find.length);
  const attemptedStarts=16-find.length+1-locations.reduce((skipped,position)=>
    skipped+Math.min(find.length-1,16-find.length-position),0);
  return {expected, calls:attemptedStarts+1, locations};
}
