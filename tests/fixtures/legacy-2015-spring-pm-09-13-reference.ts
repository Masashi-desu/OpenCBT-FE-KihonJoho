import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function temporary<T>(name: string, run: (directory: string) => T): T {
  const directory = mkdtempSync(join(tmpdir(),name));
  try { return run(directory); } finally { rmSync(directory,{recursive:true,force:true}); }
}
export function invoke(command:string,args:string[],cwd:string) {
  const result = spawnSync(command,args,{cwd,encoding:'utf8',timeout:20_000});
  if (result.error) throw result.error;
  return result;
}

export function cipherReference(text:string, rows:string[]) {
  const positionByCharacter = new Map(rows.flatMap((row,y) => [...row].map((character,x) => [character,y*13+x] as const)));
  const output = [...text];
  const included = output.map((character,index) => ({index,id:positionByCharacter.get(character)})).filter(
    (item): item is {index:number;id:number} => item.id !== undefined);
  const row = (id:number) => Math.floor(id / 13);
  const col = (id:number) => id % 13;
  const next = (id:number) => (col(id) + 1) % 13;
  const table = rows.join('');
  const traces = [];
  for (let i = 1; i < included.length; i += 2) {
    const first = included[i-1], second = included[i];
    const x = first.id, y = second.id;
    const pair = x === y ? [((row(x)+1)%5)*13+next(x),((row(y)+1)%5)*13+next(y)] :
      row(x) === row(y) ? [y,x] :
      col(x) === col(y) ? [row(x)*13+next(x),row(y)*13+next(y)] : [row(y)*13+col(x),row(x)*13+col(y)];
    output[first.index] = table[pair[0]];
    output[second.index] = table[pair[1]];
    traces.push({indices:[first.index,second.index],first:[row(x),col(x)],second:[row(y),col(y)],secondOutput:table[pair[1]]});
  }
  const last = included.at(-1);
  if (last && included.length % 2 === 1) output[last.index] = table[64-last.id];
  return { result:output.join(''), traces };
}
export function compileCipher(directory:string,program:string,table:string[]) {
  const source = program + `
#include <stdio.h>
#include <string.h>
int main(int argc, char **argv) {
    char text[1000];
    char grid[5][13] = {${table.map(row=>JSON.stringify(row)).join(',')}};
    if (argc != 2 || strlen(argv[1]) >= sizeof text) return 2;
    strcpy(text, argv[1]);
    enc_str(text, grid);
    fputs(text, stdout);
    return 0;
}`;
  writeFileSync(join(directory,'cipher.c'),source);
  const compile = invoke('cc',['-std=c11','-fsanitize=address,undefined','-fno-omit-frame-pointer','cipher.c','-o','cipher'],directory);
  assert.equal(compile.status,0,compile.stderr);
  return (input:string) => {
    const execution = invoke(join(directory,'cipher'),[input],directory);
    assert.equal(execution.status,0,execution.stderr);
    return execution.stdout;
  };
}

type Shift = [day:number,employee:string,arrival:number,departure:number];
const minutes = (time:number) => Math.floor(time/100)*60+time%100;
const readClock = (minutes:number) => String(Math.floor(minutes/60)).padStart(3,'0') + String(minutes%60).padStart(2,'0');
export function attendanceExpected(shifts:Shift[],cutoff:number) {
  return [...new Set(shifts.map(([,employee])=>employee))].map(employee=>{
    const entries=shifts.filter(shift=>shift[1]===employee);
    const regular=entries.reduce((sum,[,,arrival,departure])=>sum+minutes(departure)-minutes(arrival),0);
    const late=entries.reduce((sum,[,,,departure])=>sum+Math.max(0,minutes(departure)-minutes(cutoff)),0);
    return [employee,readClock(regular),readClock(late)];
  });
}
const dimensions = (value:string) => Number(/^PIC 9\((\d+)\)$/.exec(value)?.[1]);
export function attendanceCandidate(field:number,candidate:string,dateWidth:number,cutoff:number,shifts:Shift[]) {
  if (field === 0) {
    const width = dimensions(candidate);
    return shifts.every(([day]) => {
      const date = '202604'.slice(6 - (dateWidth-2)) + String(day).padStart(2,'0');
      return date.slice(width,width+2) === String(day).padStart(2,'0');
    });
  }
  if (field === 1) {
    const width = dimensions(candidate);
    const group = '11745'.padEnd(width+2,' ');
    return Number(group.slice(0,width))===117 && group.slice(width,width+2)==='45' && width+2===5;
  }
  if (field === 2) {
    const all = '9999'.repeat(62);
    const initialize = candidate.match(/^INITIALIZE ATD-HST(?: REPLACING NUMERIC BY (\d+))?$/);
    const move = candidate.match(/^MOVE (\d+) TO ATD-HST$/);
    const actual = initialize ? (initialize[1] ?? '0000').repeat(62) :
      move ? move[1].padEnd(4*62,' ') : '0'.repeat(4*62);
    return actual === all;
  }
  const totals = new Map<string,[number,number]>();
  for (const [,employee,arrival,departure] of shifts) {
    let [regular,late]=totals.get(employee) ?? [0,0];
    const oldRegular = regular;
    const wholeShift = minutes(departure)-minutes(arrival);
    const total=regular+wholeShift;
    if (field === 3) {
      if(candidate==='W-TIME-ACCUM') regular=total;
      else if(candidate==='HA') regular=minutes(Math.trunc(total/60));
      else if(candidate==='W-MINUTE') regular=minutes(total);
      else regular=minutes(departure);
    } else regular=total;
    if (departure>cutoff) {
      const start = field !== 4 || candidate==='NIGHT-TIME' ? minutes(cutoff) :
        candidate==='ATD-IN(IDX)' ? minutes(arrival) : candidate==='ATD-OUT(IDX)' ? minutes(departure) :
        candidate==='ATD-SUM' ? minutes(Number(readClock(regular).slice(0,4))) : minutes(Number(readClock(late).slice(0,4)));
      const carry = field !== 5 || candidate==='ATD-NIGHTSUM' ? late :
        candidate==='ATD-SUM' ? regular : candidate==='ATD-IN(IDX)' ? minutes(arrival) :
        candidate==='ATD-OUT(IDX)' ? minutes(departure) : minutes(cutoff);
      late = carry + minutes(departure)-start;
    }
    totals.set(employee,[regular,late]);
    assert(regular >= 0 && oldRegular >= 0);
  }
  const expected = attendanceExpected(shifts,cutoff);
  return expected.every(([employee,regular,late])=>{
    const result=totals.get(employee)!;
    return readClock(result[0])===regular && readClock(result[1])===late;
  });
}

const htmlPlain = "!#$%()*+,-.:;=?@[\\]^_`{|}~";
const entityOf = new Map([['<','&lt;'],['>','&gt;'],['&','&amp;'],['"','&quot;']]);
const plain = (c:string) => /^[0-9A-Za-z]$/.test(c);
export function encoderExpected(input:string|null) {
  if (input === null) return '0\tnull\tnull';
  let count=0, html='', js='';
  for (let i=0;i<input.length;i++) {
    const c=input[i], code=input.charCodeAt(i);
    if (plain(c) || htmlPlain.includes(c)) html += c;
    else if (entityOf.has(c)) html += entityOf.get(c);
    else { html += '&#'+code+';'; count++; }
    if (plain(c)) js += c;
    else {
      const hex=code.toString(16).toUpperCase();
      js += (hex.length <= 2 ? '\\x' + hex.padStart(2,'0') : '\\u' + hex.padStart(4,'0'));
    }
  }
  return [count,html,js].join('\t');
}
export function javaCheck(directory:string,programs:string[],answers:string[],inputs:(string|null)[]) {
  const replaced = programs.map(program=>program.replace(/\[([a-e])\]/g,(_,slot:string)=>answers[slot.charCodeAt(0)-97]));
  const filenames=['Encoder.java','HtmlEncoder.java','JavaScriptEncoder.java','HtmlEncoderTest.java'];
  filenames.forEach((filename,i)=>writeFileSync(join(directory,filename),replaced[i]));
  const expressions=inputs.map(input=>input===null?'null':input.length===0?'""':
    'new String(new char[]{'+input.split('').map(c=>'(char)'+c.charCodeAt(0)).join(',')+'})');
  writeFileSync(join(directory,'TestEncoders.java'),`
import java.util.Locale;
class TestEncoders {
    static class Counted extends HtmlEncoder {
        int count;
        protected String encode(char c) {
            ++count;
            return super.encode(c);
        }
    }
    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        HtmlEncoderTest.main(args);
        String[] inputs = {${expressions.join(',')}};
        for (String input : inputs) {
            Counted html = new Counted();
            String result = html.encode(input);
            System.out.println(html.count + "\\t" + result + "\\t" + new JavaScriptEncoder().encode(input));
        }
    }
}`);
  const compile = invoke('javac',['-encoding','UTF-8','--release','8',...filenames,'TestEncoders.java'],directory);
  if (compile.status !== 0) return false;
  const result=invoke('java',['-cp','.','TestEncoders'],directory);
  return result.status===0 && result.stdout===inputs.map(encoderExpected).join('\n')+'\n';
}

const operators = new Set('START END RPUSH RPOP RET LD LAD SUBL ADDL SLL SRL JMI JPL JZE JNZ JOV JUMP CALL PUSH POP'.split(' '));
type Instruction={label?:string;scope:string;opcode:string;args:string[];number?:number};
function assemble(source:string):Instruction[] {
  let scope='';
  return source.split('\n').flatMap(raw=>{
    const match=/^\s*(\d+)\s+(.*)$/.exec(raw);
    const text=(match?.[2]??raw).split(';')[0].trim();
    if(!text)return [];
    const parts=text.split(/\s+/);
    const label=operators.has(parts[0])?undefined:parts.shift();
    const opcode=parts.shift()!;
    assert(operators.has(opcode),opcode);
    if(opcode==='START'){assert(label);scope=label;}
    return [{label,scope,opcode,args:parts.join('').split(','),number:match?Number(match[1]):undefined}];
  });
}
const word = (value:number) => value & 0xffff;
export function factorial(n:number) {
  return Array.from({length:n},(_,index)=>index+1).reduce((product,k)=>product*k,1);
}
export function caslTrace(program:string,entry:string,n:number,multiplier=0) {
  const code=assemble(program);
  const labels=new Map(code.flatMap((line,index)=>line.label?[[line.opcode==='START'?line.label:line.scope+':'+line.label,index] as const]:[]));
  const start=labels.get(entry);
  assert(start!==undefined);
  let pc=start,zero=false,negative=false,overflow=false;
  const stack:number[]=[-1],initial=entry==='MULT'?[n,0,multiplier,0,0x3141,0x99ee,0xff01,0x7722]:[0,n,0x2222,3,0x3141,0x99ee,0xff01,0x7722];
  const registers=[...initial];
  let base:number|undefined, beforeRpop:number|undefined;
  const pushes:{sp:number;value:number}[]=[];
  const register=(arg:string)=>{assert.match(arg,/^GR[0-7]$/);return Number(arg.slice(2));};
  const read=(arg:string)=>arg.startsWith('GR')?registers[register(arg)]:Number(arg.replace('=',''));
  const address=(arg:string,index?:string)=>word(read(arg)+(index?read(index):0));
  const jump=(scope:string,label:string)=>{
    const target=labels.get(scope+':'+label)??labels.get(label);
    assert(target!==undefined,scope+':'+label);pc=target;
  };
  const store=(reg:string,value:number,of=false)=>{
    const result=word(value);
    registers[register(reg)]=result; zero=result===0;negative=result>=0x8000;overflow=of;
  };
  for(let step=0;step<2500;step++){
    const {opcode,args,number,scope}=code[pc++]!;
    const [a,b,c]=args;
    switch(opcode){
      case 'START': break;
      case 'RPUSH':
        stack.push(...registers.slice(1));
        if(entry==='FACT2' && scope==='FACT2' && number===2)base=stack.length;
        break;
      case 'RPOP':
        if(entry==='FACT' && number===12)beforeRpop=registers[2];
        for(let r=7;r>0;r--)registers[r]=stack.pop()!;
        break;
      case 'PUSH':
        stack.push(address(a,b));
        if(number===11 && base!==undefined)pushes.push({sp:base-stack.length,value:stack.at(-1)!});
        break;
      case 'POP': registers[register(a)]=stack.pop()!; break;
      case 'CALL': stack.push(pc);jump(scope,a);break;
      case 'RET':{
        const next=stack.pop()!;
        if(next===-1){
          assert.equal(stack.length,0);
          assert.deepEqual(registers.slice(1),initial.slice(1));
          return {value:registers[0],beforeRpop,pushes};
        }
        pc=next;break;
      }
      case 'LD':store(a,read(b));break;
      case 'LAD':registers[register(a)]=address(b,c);break;
      case 'SUBL':{const value=read(a)-read(b);store(a,value,value<0);break;}
      case 'ADDL':{const value=read(a)+read(b);store(a,value,value>0xffff);break;}
      case 'SLL':case 'SRL':{
        const value=read(a),length=address(b,c);
        const left=opcode==='SLL';
        const of=length>0 && length<=16 && Boolean(value & (1 << (left?16-length:length-1)));
        store(a,length>=16?0:left?value<<length:value>>>length,of);break;
      }
      case 'JPL': if(!zero&&!negative)jump(scope,a);break;
      case 'JMI': if(negative)jump(scope,a);break;
      case 'JNZ': if(!zero)jump(scope,a);break;
      case 'JZE': if(zero)jump(scope,a);break;
      case 'JOV': if(overflow)jump(scope,a);break;
      case 'JUMP':jump(scope,a);break;
      default: throw new Error(opcode);
    }
  }
  throw new Error('CASL step limit');
}

export function gregorianDay(date:string){
  const [year,month,day]=date.split('-').map(Number);
  const prior=year-1, leap=year%4===0 && (year%100!==0||year%400===0);
  const months=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  return prior*365+Math.floor(prior/4)-Math.floor(prior/100)+Math.floor(prior/400)+months.slice(0,month-1).reduce((a,b)=>a+b,0)+day;
}
