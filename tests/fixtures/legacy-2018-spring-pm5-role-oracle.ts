/** Primary p24–28 role evaluation. No production model/solver import. */
import assert from 'node:assert/strict';
import type {GeneratedBody}from'../../src/core/generators/definition';
type Row={employee:number;month:number;kind:string;course:string};
const masterNames=['従業員マスタ','職位マスタ','所属マスタ','在勤地マスタ'];
const complete=(selected:Set<string>,regular:boolean,manager:boolean)=>{
 const employee=regular||selected.has(masterNames[0]);
 return employee&&selected.has(masterNames[3])&&(!regular||!manager||selected.has(masterNames[1]));
};
const minimal=(selected:Set<string>,regular:boolean,manager:boolean)=>complete(selected,regular,manager)&&![...selected].some(s=>complete(new Set([...selected].filter(x=>x!==s)),regular,manager));
const parseMasters=(s:string)=>{const out=new Set(masterNames.filter(n=>s.includes(n)));assert(out.size>0);assert.equal(s.replace(/従業員マスタ|職位マスタ|所属マスタ|在勤地マスタ|及び|，/g,''),'');return out;};
const rows:Row[]=[{employee:101,month:4,kind:'regular',course:'A'},{employee:202,month:6,kind:'regular',course:'A'},{employee:101,month:5,kind:'recheck',course:'A'}];
const expected=[rows[2],rows[1]];
const latest=(input:Row[])=>input.filter((r,i)=>i===0||input[i-1].employee!==r.employee);
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function independentSpring2018Pm5Roles(body:GeneratedBody){
 const table=body.prompt.find(x=>x.type==='table'&&x.caption.startsWith('表1'));assert(table?.type==='table');const manager=table.rows[2][1].includes('管理職かどうか');
 const options=body.answerParts!.map(p=>p.choiceIds.map(id=>{const blocks=body.choices[Number(id.slice(13))-1];assert.equal(blocks.length,1);assert(blocks[0].type==='paragraph');return blocks[0].text;}));
 const truths:boolean[][]=[options[0].map(s=>minimal(parseMasters(s),true,manager)),options[1].map(s=>minimal(parseMasters(s),false,manager))];
 // One source-valid multi-employee input deliberately interleaves records.
 // Sort order is part of a sequential merge's input contract, not ignored by
 // substituting an associative map that would make descending options pass.
 truths.push(options[2].map(s=>{
  assert.match(s,/^従業員コードの(?:昇順|降順)(?:，実施年月の(?:昇順|降順))?$/);
  const employeeDirection=s.startsWith('従業員コードの降順')?-1:1,monthDirection=s.includes('実施年月の降順')?-1:s.includes('実施年月の昇順')?1:0;
  const sorted=rows.slice().sort((a,b)=>employeeDirection*(a.employee-b.employee)||monthDirection*(a.month-b.month));
  return same(latest(sorted),expected);
 }));
 const sorted=[rows[2],rows[0],rows[1]];
 truths.push(options[3].map(s=>{
  assert.match(s,/^同じ(?:従業員コード|健康診断コース)(?:及び区分)?$/);const key=(r:Row)=>[(s.includes('従業員コード')?r.employee:r.course),...(s.includes('区分')?[r.kind]:[])].join('/');
  return same(sorted.filter((r,i)=>i===0||key(sorted[i-1])!==key(r)),expected);
 }));
 const states=[{blank:true,need:'',missing:true},{blank:false,need:'要',missing:true},{blank:false,need:'否',missing:false},{blank:true,need:'',missing:true},{blank:false,need:'否',missing:false}];
 truths.push(options[4].map(s=>{
  assert.match(s,/^(?:判定結果が空白|再検査要否が“[要否]”|判定結果が空白，又は再検査要否が“[要否]”)$/);
  const test=(r:typeof states[number])=>(s.includes('空白')&&r.blank)||(s.includes('“要”')&&r.need==='要')||(s.includes('“否”')&&r.need==='否');
  return states.every(r=>test(r)===r.missing);
 }));
 for(const [i,truth]of truths.entries()){assert.equal(truth.filter(Boolean).length,1);const a=body.partAnswers![i];assert(a.kind==='choice');assert.equal(a.choiceId,body.answerParts![i].choiceIds[truth.indexOf(true)]);}
 return{manager,truths,expectedUniqueLatestRows:expected,wrongCandidateWitnesses:truths.map(t=>t.filter(v=>!v).length)};
}
