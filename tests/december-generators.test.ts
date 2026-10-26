import test from "node:test";
import assert from "node:assert/strict";
import { decemberProgramDefinitions } from "../src/core/generators/sample-2022-dec-programs";
import { decemberScenarioDefinitions } from "../src/core/generators/sample-2022-dec-scenarios";
import { decemberBReview as review } from "./fixtures/dec-2022-b-review";
import { decemberGeneratorOracle, blockText, reviewedMinimaxBoards, reviewedMinimaxEdges } from "./fixtures/december-generator-oracle";
import { sampleMinimaxBoards, sampleMinimaxChildren } from "../src/core/generators/sample-2022-dec-data";
const definitions=[...decemberProgramDefinitions,...decemberScenarioDefinitions].sort((a,b)=>Number(a.source.split("-").at(-1))-Number(b.source.split("-").at(-1)));
const normalize=(s:string)=>s.replaceAll("−","-").replace(/[\s]/g,"");
test("all 20 December baselines match the handwritten official choices and independent semantics",()=>{
  assert.equal(definitions.length,20);
  for(const [i,d] of definitions.entries()){
    const original=review.questions[i],b=d.build(d.reference);assert.deepEqual(d.reference,[...original.reference]);
    assert.equal(d.sourceAnswer,original.answer);assert.equal(b.correctIndex,"アイウエオカキクケコ".indexOf(original.answer));
    if(i!==19) assert.deepEqual(b.choices.map(c=>c.flatMap(x=>x.type==="table"?x.rows.flat():[blockText(x)]).map(normalize)),original.choices.map(s=>(typeof s==="string"?[s]:[...s]).map(normalize)),d.source);
    decemberGeneratorOracle(i+1,b,d.reference);
  }
});
for(const [i,d] of definitions.entries())test(`December Q${i+1}: exhaustive declared binding domain and independent solution`,()=>{
  let valid=0;const invalid:number[][]=[];
  const visit=(values:number[])=>{
    if(values.length<d.fields.length){const f=d.fields[values.length];for(let n=f.minimum;n<=f.maximum;n++)visit([...values,n]);return;}
    let b;try{b=d.build(values);}catch(e){assert.equal(i+1,3);assert.equal((e as Error).message,"PARAMETER_CONSTRAINT");invalid.push(values);return;}
    decemberGeneratorOracle(i+1,b,values);valid++;
  };visit([]);
  assert.equal(valid,[24,4,17,2,3,20,4,4,4,2,6,6,4,6,9,6,18,10,3,10][i]);
  if(i===2){assert.equal(invalid.length,1);const [r,s]=invalid[0],input=[3,2,1,6,5,4].map((_,j)=>[3,2,1,6,5,4][(j+r)%6]+s);assert.deepEqual(invalid,[[5,2]]);assert.equal(input[4]+input[5],input.slice(0,3).reduce((a,b)=>a+b,0));}
  else assert.deepEqual(invalid,[]);
});
test("minimax renderer configurations match all reviewed legal moves and terminal states",()=>{
  assert.deepEqual(sampleMinimaxBoards,reviewedMinimaxBoards);
  assert.deepEqual(sampleMinimaxChildren.flatMap((children,i)=>children.map(c=>[i,c])),reviewedMinimaxEdges);
  for(const [from,to] of reviewedMinimaxEdges){const a=reviewedMinimaxBoards[from],b=reviewedMinimaxBoards[to],changed=[...a].flatMap((x,i)=>x!==b[i]?[i]:[]);assert.equal(changed.length,1);assert.equal(a[changed[0]],".");assert.equal(b[changed[0]],from===0||[4,5,7].includes(from)?"O":"X");}
});
test("independent December oracles reject a wrong answer reference for every new series",()=>{
  for(const [i,d] of definitions.entries()){
    const b=d.build(d.reference);b.correctIndex=((b.correctIndex??0)+1)%b.choices.length;
    assert.throws(()=>decemberGeneratorOracle(i+1,b,d.reference),{name:"AssertionError"},d.source);
  }
});
test("a changed displayed algorithm cannot pass using a stale independent model",()=>{
  for(const [number,before,after] of [[3,"tail ＋ in[i]","tail × in[i]"],[9,"nを出力\n    order(tree[n][2])","order(tree[n][2])\n    nを出力"],[14,"return sortedData[i ＋ 1]","return sortedData[i]"]] as const){
    const d=definitions[number-1],b=d.build(d.reference),program=b.prompt.find(x=>x.type==="code"&&x.text.includes(before));assert(program?.type==="code");program.text=program.text.replace(before,after);
    assert.throws(()=>decemberGeneratorOracle(number,b,d.reference),{name:"AssertionError"});
  }
});
