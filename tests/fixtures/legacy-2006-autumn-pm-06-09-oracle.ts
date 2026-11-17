// Independent observers for the three publication candidates.
// Each operates on small explicit states or interprets displayed instructions.
export function matchingDigits(target:string,guess:string) {
  const exact=[...guess].filter((digit,i)=>target.at(i)===digit).length;
  const common=[...guess].filter(digit=>target.includes(digit)).length;
  return {hit:exact,blow:common-exact,matched:exact===target.length};
}
export type Guess = {hit:number;blow:number;matched:boolean};
export function candidateMatch(target:string,guess:string,c:string,d:string,e:string):Guess {
  const arrays:Record<string,string>={target,num:guess};
  const equal=/^(target|num)\[([ij])\] == (target|num)\[([ij])\]$/.exec(c);
  const positions=/^i (==|!=|<=|<|>=|>) j$/.exec(d);
  const ending=/^(numHit(?: \+ numBlow)?) (==|!=|>=|>) (DIGITS|numBlow)$/.exec(e);
  if(!equal||!positions||!ending) throw Error('Missing checked C expression');
  const relation=(op:string,l:number,r:number)=>{
    switch(op) {
      case '==':return l===r;
      case '!=':return l!==r;
      case '<':return l<r;
      case '<=':return l<=r;
      case '>':return l>r;
      case '>=':return l>=r;
      default:throw Error('Unknown relation '+op);
    }
  };
  let hit=0,blow=0;
  for(const [i] of [...target].entries()) for(const [j] of [...guess].entries()) {
    const cell=(side:string,index:string)=>arrays[side][index==='i'?i:j];
    if(cell(equal[1],equal[2])!==cell(equal[3],equal[4])) continue;
    if(relation(positions[1],i,j)) hit++;
    else blow++;
  }
  return {hit,blow,matched:relation(ending[2],ending[1].includes('+')?hit+blow:hit,ending[3]==='DIGITS'?target.length:blow)};
}

export const valuesForWord=(word:number)=>word.toString(2).padStart(16,'0');
export const numberForWord=(word:string)=>parseInt(word,2);
export const packFields=(left:number,right:number,m:number,n:number)=>
  numberForWord((valuesForWord(left).slice(0,m)+valuesForWord(right).slice(0,n)).padEnd(16,'0'));

export function expectedSplit(word:number,m:number,n:number,d1:number,d2:number,preserve:boolean) {
  const bits=valuesForWord(word),tail=(original:number,width:number)=>preserve?valuesForWord(original).slice(width):'0'.repeat(16-width);
  return [numberForWord(bits.slice(0,m)+tail(d1,m)),numberForWord(bits.slice(m,m+n)+tail(d2,n))];
}

const read=(token:string)=>Number(token.at(-1));
type Instruction={operation:string;register:number;operand:string[]};
export function assemble(program:string):Instruction[] {
  return program.split('\n').flatMap(line=>{
    const stripped=line.split(/[;←]/)[0].trim();
    if(!stripped||/^(COMBINE|DIVIDE)\s+START$/.test(stripped)) return [];
    const [operation,rest]=stripped.split(/\s+/,2);
    const [register,...operand]=(rest??'').split(',');
    return [{operation,register:read(register),operand}];
  });
}

const initialRegisters=(input:number,m:number,n:number)=>[input,3401,m,4307,n,0xf135,0x24fe,0xf00c];
export function runCasl(instructions:Instruction[],input:number,m:number,n:number,word1:number,word2:number) {
  const registers=initialRegisters(input,m,n);
  let saved:number[]=[];
  const memory=new Map([[3401,word1],[4307,word2]]);
  const indexAddress=(operand:string[])=>Number(operand[0])+(operand.length===2?registers[read(operand[1])]:0);
  const source=(operand:string[])=>{
    const token=operand[0];
    if(token[0]==='=') return token[1]==='#'?parseInt(token.slice(2),16):Number(token.slice(1));
    if(token.startsWith('GR')) return registers[read(token)];
    return memory.get(indexAddress(operand))??0x9999;
  };
  for(const {operation,register:r,operand} of instructions) switch(operation) {
    case 'RPUSH':saved=registers.slice(1);break;
    case 'RPOP':registers.splice(1,7,...saved);break;
    case 'RET':return {registers,words:[memory.get(3401)!,memory.get(4307)!]};
    case 'LD':registers[r]=source(operand);break;
    case 'ST':memory.set(indexAddress(operand),registers[r]);break;
    case 'SUBL':registers[r]=(registers[r]-source(operand))&0xffff;break;
    case 'AND':registers[r]&=source(operand);break;
    case 'OR':registers[r]|=source(operand);break;
    case 'SRL': {
      const count=indexAddress(operand);
      registers[r]=count>=16?0:Math.floor(registers[r]/2**count);
      break;
    }
    case 'SLL': {
      const count=indexAddress(operand);
      registers[r]=count>=16?0:(registers[r]*2**count)%65536;
      break;
    }
    default: throw Error(operation);
  }
  throw Error('Program did not return');
}
export const savedRegisters=(m:number,n:number)=>initialRegisters(0,m,n).slice(1);
export function withBlanks(lines:string,answers:Record<string,string>) {
  return lines.replace(/[［]([a-e])[］]/g,(_,slot:string)=>answers[slot]);
}

/** Indexed file operations in portable COBOL. The result is an error instead
 * of relying on the contents of an FD record area after a successful WRITE. */
export function compactIndexedFile(before:readonly string[],deletedIndex:number,sequence:string){
  const file=new Map(before.map((value,index)=>[index+1,value]));
  file.delete(deletedIndex);
  for(let k=deletedIndex+1;k<=before.length;k++) {
    let key=k;
    const value=file.get(k);
    if(!value) break;
    let available=true;
    for(const step of sequence.split('→')) {
      if(!available) return 'unavailable record area';
      switch(step) {
        case '①':key--;break;
        case '②':key++;break;
        case '③':if(!file.delete(key)) return 'invalid key';break;
        case '④':if(!file.has(key)) return 'invalid key';file.set(key,value);available=false;break;
        case '⑤':if(file.has(key)) return 'duplicate key';file.set(key,value);available=false;break;
        default:throw Error(step);
      }
    }
  }
  return [...file].sort(([first],[second])=>first-second);
}
