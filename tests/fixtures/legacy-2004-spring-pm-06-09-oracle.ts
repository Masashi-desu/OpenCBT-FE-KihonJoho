export type Employee = { id: number; grade: number; certifications: number[] };
export type Score = { id: number; grade: number };
export type Certificate = { id: number; category: number };
export type Workbook = { employees: Employee[]; scores: Score[]; qualifications: Certificate[] };
export type MergeResult = { rows: Employee[]; rejected: string[] };
export type MergeChoices = Record<'a' | 'b' | 'c' | 'd' | 'e', string>;

export function referenceMerge(input:Workbook): MergeResult {
  const employees = new Map(input.employees.map(person=>[person.id,{...person,certifications:[...person.certifications]}]));
  const rejected: string[] = [];
  for(const {id,grade} of input.scores){
    const employee = employees.get(id);
    if(employee)employee.grade=grade;
    else rejected.push('EIGO '+id);
  }
  for(const {id,category} of input.qualifications){
    const employee=employees.get(id);
    if(!employee)rejected.push('JOHO '+id);
    else if(employee.certifications.includes(category))rejected.push('KUBUN '+id+' '+category);
    else employee.certifications.push(category);
  }
  return {rows:[...employees.values()],rejected:rejected.sort()};
}

/** 原紙の空欄を候補で補い、比較・終端・固定長の領域を追跡する。 */
export function runCobolMerge(input:Workbook,capacity:number,choice:MergeChoices): MergeResult|undefined {
  const {employees,scores,qualifications}=input;
  const done=Infinity;
  let o=0,e=0,j=0,current=employees[0], work=current?{...current,certifications:[...current.certifications]}:undefined;
  const rows: Employee[] = [];
  const rejected: string[] = [];
  const eEnd=()=>e>=scores.length, jEnd=()=>j>=qualifications.length;
  const currentId=()=>work?.id??done;
  const lastRawE=()=>scores[Math.min(e,scores.length-1)]?.id;
  const lastRawJ=()=>qualifications[Math.min(j,qualifications.length-1)]?.id;
  const ends=choice.a.includes('AND W-E-SBANGO')?()=>!work&&eEnd()&&jEnd()
    : choice.a.includes('AND W-J-SBANGO')?()=>!work||(eEnd()&&jEnd())
    : choice.a.includes('OR W-E-SBANGO')?()=>!work||eEnd()||jEnd()
    : ()=>!work;

  let budget=1+5*(employees.length+scores.length+qualifications.length);
  while(!ends()){
    if(--budget<0)return undefined;
    const oid=currentId(), eid=scores[e]?.id??done;
    if(oid!==eid||oid!==done){
      const operations=(oid===eid?choice.b:oid<eid?choice.c:choice.d).split('\n');
      for(const operation of operations){
        if(operation==='CONTINUE')continue;
        if(operation.includes('DISPLAY "ERROR EIGO')){
          if(eEnd())return undefined;
          rejected.push('EIGO '+eid);
        } else if(operation==='PERFORM READ-EIGOF')e++;
        else if(operation==='PERFORM READ-JOHOF')j++;
        else if(operation==='PERFORM E-RTN'){
          if(eEnd()||!work)return undefined;
          work.grade=scores[e].grade;
        }else throw Error('未知のCOBOL候補 '+operation);
      }
    }
    const jid=qualifications[j]?.id??done;
    if(oid===jid&&oid!==done){
      const qualificationDone=()=>{
        const id=qualifications[j]?.id??done;
        if(choice.e.endsWith(' E-SBANGO'))return id===lastRawE();
        if(choice.e.endsWith(' J-SBANGO'))return id===lastRawJ();
        if(choice.e.includes(' NOT '))return id!==oid;
        return id===oid;
      };
      while(!qualificationDone()){
        if(!work||jEnd()||--budget<0)return undefined;
        const candidate=qualifications[j++];
        let idx=0;
        while(idx<capacity&&work.certifications[idx]!==undefined&&work.certifications[idx]!==candidate.category)idx++;
        if(idx<capacity&&work.certifications[idx]===undefined)work.certifications[idx]=candidate.category;
        else rejected.push('KUBUN '+candidate.id+' '+candidate.category);
      }
    }else if(oid>jid){
      rejected.push('JOHO '+jid);
      j++;
    }
    if(work&&oid<(scores[e]?.id??done)&&oid<(qualifications[j]?.id??done)){
      rows.push(work);
      current=employees[++o];
      work=current?{...current,certifications:[...current.certifications]}:undefined;
    }
  }
  return {rows,rejected:rejected.sort()};
}

type Code = 'PUSH'|'ST'|'LAD'|'AND'|'JZE'|'ADDL'|'POP'|'SRL'|'JNZ'|'LD'|'OR'|'XOR'|'SLL'|'RET';
type Instruction = { code: Code; r: number; operand: number };
export function compileCaslParity(source:string,testInstruction:string,fixInstruction?:string) {
  const labels = new Map<string,number>();
  const rows=source.replace('[s]',testInstruction).split('\n').flatMap(line=>{
    const instruction=line.split(';')[0].trim();
    if(!instruction||instruction.endsWith('START')||instruction.endsWith('DS    1')||instruction==='END')return [];
    const hasLabel=/^[A-Z0-9]+\s+(?:PUSH|POP)\b/.test(instruction)&&!/^(?:PUSH|POP)\b/.test(instruction);
    if(!hasLabel)return [{name:'',text:instruction}];
    const split=instruction.indexOf(' ');
    return [{name:instruction.slice(0,split),text:instruction.slice(split).trim()}];
  });
  for(const [index,row] of rows.entries())if(row.name)labels.set(row.name,index);
  const parsed:Instruction[] = rows.map(({text})=>{
    if(fixInstruction&&/^OR +GR1,=#8000$/.test(text))text=fixInstruction;
    const [,opcode,args='']=text.match(/^(\w+)(?: +(.+))?$/)!;
    const code=opcode as Code;
    if(code==='JZE'||code==='JNZ'){
      const target=labels.get(args);
      if(target===undefined)throw Error('Unknown label '+args);
      return {code,r:0,operand:target};
    }
    if(code==='RET')return {code,r:0,operand:0};
    const [left,right]=args.split(',');
    if(code==='PUSH')return {code,r:Number(right.slice(-1)),operand:Number(left)};
    const r=Number(left.slice(-1));
    const operand=right==='TMP'?0:right?.startsWith('=#')?parseInt(right.slice(2),16):Number(right?.replace(/^=/,'')??0);
    return {code,r,operand};
  });
  return (word:number,saved:number): [number,number]=>{
    const regs=[0,word,saved], stack:number[]=[];
    let zero=false, temp=0, pc=0;
    while(pc<parsed.length){
      const {code,r,operand}=parsed[pc++];
      switch(code){
        case 'PUSH': stack.push((regs[r]+operand)&0xFFFF);break;
        case 'ST':temp=regs[r];break;
        case 'LAD':regs[r]=operand;break;
        case 'JZE':if(zero)pc=operand;break;
        case 'JNZ':if(!zero)pc=operand;break;
        case 'POP':regs[r]=stack.pop()!;break;
        case 'AND':zero=(regs[r]&=operand)===0;break;
        case 'OR':zero=(regs[r]|=operand)===0;break;
        case 'XOR':zero=(regs[r]^=operand)===0;break;
        case 'ADDL':zero=(regs[r]=(regs[r]+operand)&0xFFFF)===0;break;
        case 'LD':zero=(regs[r]=temp)===0;break;
        case 'SRL':zero=(regs[r]>>>=operand)===0;break;
        case 'SLL':zero=(regs[r]=(regs[r]<<operand)&0xFFFF)===0;break;
        case 'RET':return [regs[1],regs[2]];
        default:throw Error('Unknown instruction '+code);
      }
    }
    throw Error('Missing RET');
  };
}

export function referenceParity(input:number,targetOdd:boolean) {
  const bits=(input&0x7FFF).toString(2).split('').filter(bit=>bit==='1').length;
  return (input&0x7FFF)+(Boolean(bits%2)!==targetOdd?0x8000:0);
}
