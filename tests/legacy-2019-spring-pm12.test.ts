import test from 'node:test';
import assert from 'node:assert/strict';
import{writeSpring2019Evidence}from'./fixtures/legacy-2019-spring-test-workspace';
import {runBitMachine} from './fixtures/legacy-2019-spring-bit-machine';
import {spring2019Pm12Programs as programs, spring2019Pm12Banks as banks, spring2019Pm12Example} from '../src/core/generators/legacy-2019-spring-pm12-model';
import {spring2019Pm12Figure as model} from '../src/core/generators/legacy-2019-spring-pm12-model';
import {legacy2019SpringPm12Definition as definition} from '../src/core/generators/legacy-2019-spring-pm12';
import {Legacy2019SpringPm12Figure as Figure} from '../src/ui/Legacy2019SpringPm12Figure';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import gold from './fixtures/legacy-2019-spring-pm12-source-programs.json';
const official = [4, 4, 4, 5, 1, 4];
function assembled(blanks = official, refactored = false) {
  let main: string = programs[0];
  const bankForPart = [0,1,2,1,3,4];
  for (let i = 0; i < 4; i++) main = main.replace('［' + 'abcd'[i] + '］', banks[bankForPart[i]][blanks[i]]);
  if (!refactored) return [main, programs[1]];
  main = main.replace('BITSON START', banks[3][blanks[4]] + ' START').replaceAll('CALL  SETOP', 'CALL  ' + banks[4][blanks[5]]);
  return [programs[2], main, programs[1]];
}
function reference(words: number[], position: number, length: number, setting = true) {
  const result = words.slice();
  for (let i = position; i < position + length; i++) {
    const wi = Math.floor(i / 16), mask = 1 << (15 - i % 16);
    result[wi] = setting ? result[wi] | mask : result[wi] & ~mask;
  }
  return result;
}
test('Q12 test machine executes logical shift/unsigned comparison/overflow overwrite and relocated indirect CALL', () => {
  const diagnostic = `T START
  RPUSH
  LD GR0,=#8001
  SLL GR0,1
  LAD GR2,0
  CALL STORE
  LD GR0,=#8001
  SRL GR0,1
  LAD GR2,1
  CALL STORE
  LD GR0,=#FFFF
  ADDL GR0,=1
  CPL GR0,=16
  JMI SMALL
  LD GR0,=#BAD
SMALL LAD GR2,2
  CALL STORE
  LAD GR7,STORE
  LD GR0,=5
  LAD GR2,3
  CALL 0,GR7
  RPOP
  RET
STORE RPUSH
  LD GR3,0,GR1
  ADDL GR3,GR2
  ST GR0,0,GR3
  RPOP
  RET
  END`;
  const run = runBitMachine([diagnostic], 0, 0, [0,0,0,0], {entry: 'T', trace: true});
  assert.deepEqual(run.words, [2, 0x4000, 0, 5]);
  assert.equal(run.registersRestored, true);
  assert.ok(run.labels.STORE > 0);
  const branch = run.trace.find(t => t.instruction === 'JMI SMALL')!;
  assert.deepEqual([branch.of, branch.sf, branch.zf], [0,1,0]);
});
test('Q12 official 44/24, CMNT 8/4, zero length, all short word boundaries and all 16 generated diagrams follow an independent bit array', () => {
  const cases: [number, number][] = [[44,24],[8,4]];
  for (let position = 0; position < 48; position++) for (let length = 0; length <= 65; length++) cases.push([position,length]);
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {const v = spring2019Pm12Example([a,b]); cases.push([v.position,v.length]);}
  for (const [position,length] of cases) {
    const words = Array.from({length: 10}, (_, i) => [0,0xffff,0x5555,0xaaaa,0x1234][i%5]);
    for (const refactored of [false,true]) {
      const run = runBitMachine(assembled(official,refactored), position, length, words);
      assert.deepEqual(run.words, reference(words,position,length), `${position}/${length}/${refactored}`);
      assert.equal(run.registersRestored,true);
    }
  }
  assert.deepEqual(spring2019Pm12Example([2,1]), {position:44,length:24,firstWord:2,firstIndex:12,lastWord:4,lastIndex:3,
    rows: Array.from({length:6},(_,i)=>Array.from({length:16},(_,j)=>i*16+j>=44&&i*16+j<68))});
});
test('Q12 records the original unsigned-domain overflow counterexamples without changing official keys, source or premises', () => {
  const failures: {position:number;length:number;requiredRegionWords:number;expectedSetBits:number;actualSetBits:number;writes:number}[] = [];
  const pop = (words: number[]) => words.reduce((sum,w)=>{for(let bit=0;bit<16;bit++)sum+=(w>>>bit)&1;return sum;},0);
  for (let position = 1; position <= 15; position++) for (let length = 65536-position; length <= 65535; length++) {
    const words = Array(Math.ceil((position+length)/16)).fill(0);
    const run = runBitMachine(assembled(),position,length,words);
    const expected = reference(words,position,length);
    assert.notDeepEqual(run.words,expected,`${position}/${length}`);
    assert.equal(run.registersRestored,true);
    failures.push({position,length,requiredRegionWords:words.length,expectedSetBits:pop(expected),actualSetBits:pop(run.words),writes:run.writes.length});
  }
  assert.equal(failures.length,120);
  assert.deepEqual(failures.find(f=>f.position===15&&f.length===65521),{position:15,length:65521,requiredRegionWords:4096,expectedSetBits:65521,actualSetBits:0,writes:1});
  // A nearby large case that does not wrap is a positive boundary witness.
  const safeWords = Array(4096).fill(0), safe = runBitMachine(assembled(),15,65520,safeWords);
  assert.deepEqual(safe.words,reference(safeWords,15,65520));
  assert.equal(safe.registersRestored,true);
  const trace = runBitMachine(assembled(),15,65521,Array(4096).fill(0),{trace:true}).trace;
  const afterAdd = trace.find(t => /CPL\s+GR0,BITSPW/.test(t.instruction))!;
  const afterCpl = trace.find(t => /JMI\s+BREAK/.test(t.instruction))!;
  assert.deepEqual([afterAdd.registers[0],afterAdd.of],[0,1]);
  assert.deepEqual([afterCpl.registers[0],afterCpl.of,afterCpl.sf,afterCpl.zf],[0,0,1,0]);
  writeSpring2019Evidence('q12-unsigned-boundary-witnesses.json',JSON.stringify({
    status:'reproduced-original-program-limit-not-a-changed-official-answer',officialKeys:'オオオカイオ',
    sourcePreserved:true,premisesNotNarrowed:true,generatedInputs:16,
    positiveCases:'44/24; official commentary 8/4; 3168 short pairs × 2 implementations; all 16 finite inputs × 2',
    actualFailures:failures,positiveNearBoundary:{position:15,length:65520,requiredRegionWords:4096},
    trace15_65521:trace,fullUnsignedDomainProved:false,
    conclusion:'ADDL wraps at 65536; the following CPL resets OF and compares the wrapped value. These 120 offset/length frontier pairs satisfy the stated 16bit unsigned arguments and in-region premise. The fixed official hole answers and the preserved source program are distinct from a claim that the completed program is correct over its entire stated domain.'
  },null,2)+'\n');
});
test('Q12 every displayed program line, comment, label, hole and all 27 unique choices retain a separately transcribed source fixture', () => {
  const normalize=(s:string)=>s.replace(/\s/g,'');
  for(let program=0;program<3;program++) {
    const html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm12-program',values:[2,1,program],caption:`〔プログラム${program+1}〕`}));
    const pre=html.match(/<pre>([\s\S]*?)<\/pre>/)![1].replace(/<span[^>]*data-source-blank="([a-f])"[^>]*>[a-f]<\/span>/g,'［$1］').replace(/<[^>]*>/g,'').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&quot;','"');
    assert.deepEqual(pre.split('\n').map(normalize),gold.programs[program].map(normalize));
    assert.deepEqual([...pre.matchAll(/［([a-f])］/g)].map(m=>m[1]),gold.holeSequences[program]);
  }
  assert.deepEqual(banks,gold.banks);
});
test('Q12 all 16 finite examples bind the source paragraph, exact source bank roles, 1536 actual SVG bits and original numeric workload',()=>{
  let cells=0;const signatures=new Set<string>();
  for(let a=0;a<4;a++)for(let b=0;b<4;b++){
    const body=definition.build([a,b]),v=spring2019Pm12Example([a,b]);signatures.add(`${v.position}/${v.length}`);
    assert.equal(body.choices.length,27);assert.deepEqual(body.answerParts!.map(p=>p.choiceIds.length),[6,6,6,6,3,6]);
    assert.deepEqual(body.answerParts![1].choiceIds,body.answerParts![3].choiceIds);
    assert.equal(body.answerParts!.reduce((n,p)=>n+p.choiceIds.length,0),33);
    const text=body.prompt.filter(p=>p.type==='paragraph').map(p=>p.text).join('\n');
    for(const premise of ['対象ビット列はビット領域内に収まる','符号のない数値','ビット長が0','連続した3語','GR1〜GR7','その仕様は変更せず','プログラムは省略','全ビットについて0と1を反転'])assert(text.includes(premise));
    assert(text.includes(`ビット位置が${v.position}でビット長が${v.length}`));
    assert(body.explanation.includes(`図1の${v.position}/${v.length}`));
    // Input values are two digit positions/lengths and two partials plus one full word.
    assert(v.position>=40&&v.position<=46&&v.length>=20&&v.length<=32);
    assert.equal(v.firstWord,2);assert.equal(v.lastWord,4);assert(v.firstIndex>0&&v.lastIndex<15);
    const html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm12-region',values:[a,b,0],caption:'図1 ビット領域及び対象ビット列の例'}));
    const found=[...html.matchAll(/data-bit-cell="(\d),(\d+)" data-bit-selected="(true|false)"/g)];assert.equal(found.length,96);
    for(const cell of found){const i=Number(cell[1])*16+Number(cell[2]);assert.equal(cell[3],String(i>=v.position&&i<v.position+v.length));cells++;}
    assert.equal(found.filter(c=>c[3]==='true').length,v.length);
    assert(body.explanation.includes('原プログラムの範囲上の限界'));assert(body.explanation.includes('65521'));assert.equal(body.partAnswers!.length,6);
  }
  assert.equal(signatures.size,16);assert.equal(cells,1536);
});
test('Q12 every one of the 33 option references has an independent local-role witness and unique official answer, separate from the global program defect',()=>{
  const body=definition.build([2,1]),checks:unknown[]=[];
  const witnesses:[number,number][]=[[44,24],[8,4],[0,0],[15,0],[0,16],[16,16],[15,1],[15,2],[31,1],[32,17],[40,32]];
  for(let part=0;part<6;part++){
    const truth:boolean[]=[];
    for(let choice=0;choice<body.answerParts![part].choiceIds.length;choice++){
      const fill=official.slice();fill[part]=choice;let valid=true,counterexample:unknown=null;
      for(const [position,length] of witnesses){const words=Array.from({length:10},(_,i)=>i%2?0x5555:0xaaaa);
        try{const run=runBitMachine(assembled(fill,part>=4),position,length,words,{maxSteps:10000});
          if(JSON.stringify(run.words)!==JSON.stringify(reference(words,position,length))||!run.registersRestored||length===0&&run.writes.length!==0){valid=false;counterexample={position,length,kind:'memory/zero-length/register-role'};break;}
        }catch(error){valid=false;counterexample={position,length,kind:'instruction/control',message:String(error)};break;}
      }
      truth.push(valid);checks.push({part:'abcdef'[part],choice:'アイウエオカ'[choice],valid,counterexample});
    }
    assert.equal(truth.filter(Boolean).length,1,`${part}:${truth}`);
    assert.equal(truth.indexOf(true),official[part]);
    const answer=body.partAnswers![part];assert(answer.kind==='choice');assert.equal(body.answerParts![part].choiceIds.indexOf(answer.choiceId),truth.indexOf(true));
  }
  assert.equal(checks.length,33);
  // Local a uses the full unsigned position range, independent of BITSON's loop.
  for(let position=0;position<=65535;position++)assert.equal(position>>>4,Math.floor(position/16));
  // Local b/d masks are checked at every 16-bit word offset and in-word length.
  for(let index=0;index<16;index++)for(let length=0;length<=16-index;length++){
    const mask=(((1<<length)-1)<<(16-index-length))&65535;
    let direct=0;for(let bit=index;bit<index+length;bit++)direct|=1<<(15-bit);assert.equal(mask,direct);
  }
  writeSpring2019Evidence('q12-option-witnesses.json',JSON.stringify({officialKeys:'オオオカイオ',globalUnsignedCorrectnessClaimed:false,checks},null,2)+'\n');
});
test('Q12 callback refactoring also supports the independently supplied omitted BITSOFF/RESETOP contract without treating it as original code',()=>{
  const off=`BITSOFF START
 RPUSH
 LAD GR7,RESETOP
 CALL BITSOP
 RPOP
 RET
 END`,reset=`RESETOP START
 RPUSH
 LD GR3,0,GR1
 ADDL GR3,GR2
 XOR GR0,=#FFFF
 AND GR0,0,GR3
 ST GR0,0,GR3
 RPOP
 RET
 END`;
  for(let a=0;a<4;a++)for(let b=0;b<4;b++){
    const v=spring2019Pm12Example([a,b]),words=Array.from({length:8},(_,i)=>i%2?0xffff:0xaaaa);
    const run=runBitMachine([...assembled(official,true),off,reset],v.position,v.length,words,{entry:'BITSOFF'});
    assert.deepEqual(run.words,reference(words,v.position,v.length,false));assert.equal(run.registersRestored,true);
  }
});
test('Q12 managed models reject unknown profiles, wrong arity, fractions, invalid groups and fields',()=>{
  for(const p of ['region','program','bank'])for(const values of [[],[2,1],[2,1,0,0],[-1,0,0],[4,0,0],[0,4,0],[0,.5,0],[NaN,0,0],[0,0,-1],[0,0,.5],[0,0,99]])assert.throws(()=>model('legacy-2019-spring-pm12-'+p,values));
  assert.throws(()=>model('legacy-2019-spring-pm12-unknown',[0,0,0]));
});
