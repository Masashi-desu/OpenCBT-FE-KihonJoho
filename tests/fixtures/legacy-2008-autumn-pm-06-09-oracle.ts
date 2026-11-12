// Independent COMET II word-level model for the instruction subset used by Q9.
type ReturnAddress={name:string;position:number};
type State={registers:number[];stack:(number|ReturnAddress)[];work:number};
const WORD=65536;
const bits=(word:number)=>word.toString(2).padStart(16,'0');
function shift(op:string,word:number,count:number) {
  const data=bits(word), amount=Math.min(16,count);
  if(op==='SLL') return Number.parseInt(data.slice(amount).padEnd(16,'0'),2);
  return Number.parseInt(data.slice(0,16-amount).padStart(16,op==='SRA'?data[0]:'0'),2);
}
function parse(program:string) {
  const [name]=program.trimStart().split(/\s+/,1);
  const commands=program.split('\n').slice(1).map(line=>line.split(';')[0].trim()).filter(Boolean)
    .filter(line=>!/^WRK\s+DS\s|^END$/.test(line));
  return {name,commands};
}
const reg=(name:string)=>Number(name.slice(2));
const literal=(value:string)=>value.startsWith('#')?Number.parseInt(value.slice(1),16):Number(value);
export function runCasl(programs:readonly string[],name:string,r1:number,r2=0) {
  const routines=Object.fromEntries(programs.map(parse).map(entry=>[entry.name,entry.commands]));
  const state:State={registers:[0,r1,r2],stack:[],work:0};
  const {registers,stack}=state;
  let cursor:ReturnAddress={name,position:0};
  for(let step=0;step<150;step++) {
    const line=routines[cursor.name]?.[cursor.position++];
    if(!line) throw Error('COMET II: instruction missing');
    const [op,operands]=line.split(/\s+/,2);
    const [a,b,x]=(operands??'').split(',');
    const target=reg(a);
    const source=()=>b.startsWith('GR')?registers[reg(b)]:b==='WRK'?state.work:literal(b.replace(/^=/,''));
    const effective=(address:string,index?:string)=>((literal(address)+(index?registers[reg(index)]:0))%WORD+WORD)%WORD;
    switch(op) {
      case 'PUSH':stack.push(effective(a,b));break;
      case 'POP':{
        const value=stack.pop();
        if(typeof value!=='number') throw Error('COMET II: numeric stack word expected');
        registers[target]=value;
        break;
      }
      case 'LD':registers[target]=source();break;
      case 'LAD':registers[target]=effective(b,x);break;
      case 'ST':if(b!=='WRK')throw Error('COMET II: unexpected memory label');state.work=registers[target];break;
      case 'SUBL':registers[target]=(registers[target]-source()+WORD)%WORD;break;
      case 'SRA':case 'SRL':case 'SLL':registers[target]=shift(op,registers[target],effective(b,x));break;
      case 'AND':registers[target]&=source();break;
      case 'OR':registers[target]|=source();break;
      case 'XOR':registers[target]^=source();break;
      case 'CALL':stack.push(cursor);cursor={name:a,position:0};break;
      case 'RET':{
        const next=stack.pop();
        if(next===undefined) return {gr1:registers[1],gr2:registers[2]};
        if(typeof next==='number') throw Error('COMET II: return address expected');
        cursor=next;
        break;
      }
      default:throw Error('COMET II: unexpected instruction '+op);
    }
  }
  throw Error('COMET II: trace did not terminate');
}
export function maskFromBits(include:(bit:number)=>boolean) {
  return Array.from({length:16},(_,bit)=>include(bit)?2**bit:0).reduce((left,right)=>left+right,0);
}
