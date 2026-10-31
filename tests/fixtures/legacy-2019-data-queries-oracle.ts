import assert from "node:assert/strict";
import type { Block } from "../../src/core/types";
import type { GeneratedBody } from "../../src/core/generators/definition";

const text=(blocks:Block[])=>blocks.map(b=>b.type==="paragraph"||b.type==="code"?b.text:"").join("\n");
const tables=(blocks:Block[])=>blocks.filter((b):b is Extract<Block,{type:"table"}>=>b.type==="table");
const truth=(body:GeneratedBody,values:boolean[])=>{assert.equal(body.choices.length,4);assert.equal(new Set(body.choices.map(c=>JSON.stringify(c))).size,4);assert.deepEqual(values.flatMap((v,i)=>v?[i]:[]),[body.correctIndex]);};

/** Independent, deliberately small interpreter for these four SQL fragments.
 * Data is a counterexample fixture, never shown as extra problem information. */
type ScoreRow={クラス名:string;教科名:string;学生番号:string;点数:number};
function aggregateResult(fragment:string,fn:string,alias:string) {
  const parsed=fragment.match(/^GROUP BY (.+) ORDER BY (.+)$/);assert.ok(parsed);
  const keys=parsed[1].split(/,\s*/),orders=parsed[2].split(/,\s*/).map(t=>{const p=t.match(/^(.+?)( DESC)?$/)!;return{key:p[1],descending:!!p[2]};});
  if(keys.some(key=>!(["クラス名","教科名","学生番号","名前","点数"].includes(key))))return undefined;
  if(!keys.includes("クラス名")||!keys.includes("教科名"))return undefined;
  const rows:ScoreRow[]=[];
  for(const c of ["C1","C2"])for(const subject of ["A科","B科"])for(let student=1;student<=2;student++)rows.push({クラス名:c,教科名:subject,学生番号:String(student),点数:subject==="A科"?70+10*student:10*student});
  const groups=new Map<string,ScoreRow[]>();for(const row of rows){const key=JSON.stringify(keys.map(k=>row[k as keyof ScoreRow]));groups.set(key,[...(groups.get(key)??[]),row]);}
  const result=[...groups.values()].map(group=>{
    const points=group.map(r=>r.点数),sum=points.reduce((s,n)=>s+n,0),value=fn==="AVG"?sum/points.length:fn==="MIN"?Math.min(...points):fn==="MAX"?Math.max(...points):sum;
    return {クラス名:group[0].クラス名,教科名:group[0].教科名,value};
  });
  result.sort((a,b)=>{
    for(const order of orders){const key=order.key;assert(["クラス名","教科名",alias,`${fn}(点数)`].includes(key));
      const av=key==="クラス名"?a.クラス名:key==="教科名"?a.教科名:a.value,bv=key==="クラス名"?b.クラス名:key==="教科名"?b.教科名:b.value;
      if(av!==bv)return(av<bv?-1:1)*(order.descending?-1:1);
    }return 0;
  });return result;
}
export function assertLegacy2019DataQueries(source:string,body:GeneratedBody,v:number[]) {
  assert.match(source,/^2019h31h-fe-am-(27|29|32)$/);
  const prompt=text(body.prompt),number=Number(source.split("-").at(-1));
  assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);assert(body.explanation.length>80);
  if(number===27) {
    const match=prompt.match(/SELECT クラス名, 教科名, (AVG|MIN|MAX|SUM)\(点数\) AS (平均点|最低点|最高点|合計点)\n  FROM 中間テスト\n  ［a］/);assert.ok(match);
    const fn=match[1],alias=match[2];assert.equal(fn,["AVG","MIN","MAX","SUM"][v[0]]);assert.equal(alias,["平均点","最低点","最高点","合計点"][v[0]]);
    assert.ok(prompt.includes("中間テスト（クラス名、教科名、学生番号、名前、点数）"));assert.ok(prompt.includes(`クラスごと、教科ごとの${alias}`));
    const firstDescending=v[1]%2===1,secondDescending=v[1]>=2;
    if(v[1]===0)assert.ok(prompt.includes("クラス名、教科名の昇順"));else assert.ok(prompt.includes(`クラス名の${firstDescending?"降順":"昇順"}、教科名の${secondDescending?"降順":"昇順"}`));
    // Source condition independently determines required rows and ordering.
    const classes=firstDescending?["C2","C1"]:["C1","C2"],subjects=secondDescending?["B科","A科"]:["A科","B科"];
    const expected=classes.flatMap(c=>subjects.map(subject=>({クラス名:c,教科名:subject,value:subject==="A科"?[85,80,90,170][v[0]]:[15,10,20,30][v[0]]})));
    const evaluated=body.choices.map(blocks=>{assert.equal(blocks.length,1);assert.equal(blocks[0].type,"code");return aggregateResult(text(blocks),fn,alias);});
    truth(body,evaluated.map(output=>JSON.stringify(output)===JSON.stringify(expected)));
    assert.equal(evaluated[2]!.length,8);assert.equal(evaluated[3],undefined);assert.notDeepEqual(evaluated[0],expected);
    assert.ok(body.explanation.includes(`GROUP BY`));
  }else if(number===29) {
    const [students,faculties]=tables(body.prompt);assert(students&&faculties);assert.deepEqual(students.columns,["氏名","所属","住所"]);assert.deepEqual(faculties.columns,["学部名","住所"]);
    assert.equal(students.rows.length,4);assert.equal(faculties.rows.length,4);assert.match(prompt,/WHERE 所属 = 学部名 AND 学部\.住所 = '新宿'/);
    assert.deepEqual(students.rows.map(r=>r.slice(0,2)),[["応用花子","理"],["高度次郎","人文"],["午前桜子","経済"],["情報太郎","工"]]);
    const facultyAddresses=[["渋谷","渋谷","渋谷","新宿"],["渋谷","新宿","渋谷","新宿"],["新宿","渋谷","渋谷","新宿"],["新宿","新宿","渋谷","新宿"]];
    assert.deepEqual(faculties.rows.map(r=>r[1]),facultyAddresses[v[0]]);
    assert.deepEqual(students.rows.map(r=>r[2]),Array.from({length:4},(_,i)=>(v[1]>>i)&1?"新宿":"渋谷"));
    // Cartesian product then the displayed two conditions, not a precomputed
    // mask or the production lookup. Student address is deliberately irrelevant.
    const result:string[]=[];
    for(const s of students.rows)for(const f of faculties.rows)if(s[1]===f[0]&&f[1]==="新宿")result.push(s[0]);
    truth(body,body.choices.map(blocks=>{const [candidate]=tables(blocks);assert.equal(candidate.columns[0],"氏名");return JSON.stringify(candidate.rows.flat().sort())===JSON.stringify([...result].sort());}));
    assert.ok(body.explanation.includes("学生自身の住所"));
  }else if(number===32) {
    const parsed=prompt.match(/(\d+\.\d+\.\d+\.\d+)\/(\d+)（サブネットマスク(\d+\.\d+\.\d+\.\d+)）/);assert.ok(parsed);const prefix=+parsed[2],net=parsed[1].split(".").map(Number),mask=parsed[3].split(".").map(Number);
    assert.equal(prefix,v[0]);assert.deepEqual(net,[192,168,0,0]);const bits=mask.map(n=>n.toString(2).padStart(8,"0")).join("");assert.equal(bits,"1".repeat(prefix)+"0".repeat(32-prefix));
    assert.ok(prompt.includes("IPv4ネットワーク")&&prompt.includes("ホストとして使用できる")&&prompt.includes("上限"));
    assert.ok(prompt.includes("全て0のネットワークアドレス")&&prompt.includes("全て1のブロードキャストアドレス")&&prompt.includes("ホストには割り当てない"));
    let all=0,usable=0;const broadcast=net.map((n,i)=>n|(~mask[i]&255));
    for(let x=0;x<=255;x++)for(let y=0;y<=255;y++) {
      const address=[192,168,x,y];if(!address.every((n,i)=>(n&mask[i])===net[i]))continue;all++;
      if(address.every((n,i)=>n===net[i])||address.every((n,i)=>n===broadcast[i]))continue;usable++;
    }
    assert.equal(all-usable,2);const choices=body.choices.map(c=>text(c));assert(choices.every(c=>/^\d+$/.test(c)));assert(choices.every(c=>Number.isInteger(+c)));
    truth(body,choices.map(c=>+c===usable));assert.deepEqual(choices.slice(0,2).map(Number),[prefix,prefix+1]);
    assert.equal(+choices[2]*2+2,usable);assert.ok(Math.min(...choices.filter(c=>+c!==usable).map(c=>Math.abs(+c-usable)))>=2);
    assert.ok(body.explanation.includes(`${usable}`));
  }else throw Error(`No reviewed 2019 data-query oracle: ${source}`);
}
