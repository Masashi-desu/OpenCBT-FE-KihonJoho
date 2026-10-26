/** Independent positive-economic-amount oracle, from QS23–27 + physical2 erratum.
 * No production data/model/definition import and no generated expected answer IDs. */
export type Payment={id:string;client:string;date:number;amount:number;allocated:number};
export type Bill={id:string;client:string;month:number;amount:number;settled:number};
export type Allocation={payment:string;bill:string;client:string;amount:number;date:number};
export function intervalOracle(payments:Payment[],bills:Bill[]) {
  const out:Allocation[]=[];
  for(const client of new Set([...payments,...bills].map(x=>x.client))) {
    const ps=payments.filter(p=>p.client===client).sort((a,b)=>a.date-b.date),bs=bills.filter(b=>b.client===client).sort((a,b)=>a.month-b.month);
    let pStart=0;
    for(const p of ps){const pEnd=pStart+p.amount-p.allocated;let bStart=0;
      for(const b of bs){const bEnd=bStart+b.amount-b.settled;const overlap=Math.max(0,Math.min(pEnd,bEnd)-Math.max(pStart,bStart));if(overlap)out.push({payment:p.id,bill:b.id,client,amount:overlap,date:20171031});bStart=bEnd;}pStart=pEnd;}
  }
  return out;
}
/** Literal source-loop path, kept separate from the interval construction. */
export function sourceFlow(payments:Payment[],bills:Bill[]) {
  const ps=structuredClone(payments),bs=structuredClone(bills),allocations:Allocation[]=[];
  const alpha=ps.filter(p=>p.amount>p.allocated).sort((a,b)=>a.client.localeCompare(b.client)||a.date-b.date);
  for(const p of alpha){const beta=bs.filter(b=>b.client===p.client&&b.amount>b.settled).sort((a,b)=>a.month-b.month);let remaining=p.amount-p.allocated;
    for(const b of beta){const needed=b.amount-b.settled;if(remaining>needed){b.settled=b.amount;p.allocated+=needed;allocations.push({payment:p.id,bill:b.id,client:p.client,amount:needed,date:20171031});remaining-=needed;}else{b.settled+=remaining;p.allocated=p.amount;allocations.push({payment:p.id,bill:b.id,client:p.client,amount:remaining,date:20171031});break;}}
  }
  return {payments:ps,bills:bs,allocations};
}
export function comparison(text:string,total:number,done:number,kind:'payment'|'bill') {
  const names:Record<string,number>=kind==='payment'?{'入金額':total,'充当額':done}:{'月間買上げ額':total,'消込額':done};
  const m=/^(.+?)(＝|＞|＜|≧|≦)(.+)$/.exec(text);if(!m)throw Error('UNREVIEWED_COMPARISON');
  const value=(s:string)=>s==='0'?0:names[s];const a=value(m[1]),b=value(m[3]);if(a===undefined||b===undefined)throw Error('UNREVIEWED_OPERAND');
  return m[2]==='＝'?a===b:m[2]==='＞'?a>b:m[2]==='＜'?a<b:m[2]==='≧'?a>=b:a<=b;
}
export function arithmetic(text:string,payment:[number,number],bill:[number,number]) {
  const amounts:Record<string,number>={'[入金].入金額':payment[0],'[入金].充当額':payment[1],'[月間買上げ].月間買上げ額':bill[0],'[月間買上げ].消込額':bill[1]};
  const m=/^(.+?)(＋|−)(.+)$/.exec(text);if(!m||amounts[m[1]]===undefined||amounts[m[3]]===undefined)throw Error('UNREVIEWED_EXPRESSION');return m[2]==='＋'?amounts[m[1]]+amounts[m[3]]:amounts[m[1]]-amounts[m[3]];
}
// Independent relational counterexample: two allocations from one payment and
// two payments into one monthly purchase, all on the same date and amount.
export const joinedKeyRows=[
  {'入金番号':'P1','月間買上げ番号':'M1','得意先ID':'C1','消込充当額':'10','消込日':'20171031'},
  {'入金番号':'P1','月間買上げ番号':'M2','得意先ID':'C1','消込充当額':'10','消込日':'20171031'},
  {'入金番号':'P2','月間買上げ番号':'M2','得意先ID':'C1','消込充当額':'10','消込日':'20171031'},
  {'入金番号':'P3','月間買上げ番号':'M3','得意先ID':'C2','消込充当額':'10','消込日':'20171031'},
];
export function keyWitness(pair:string[]) {
  if(pair.length!==2||pair.some(p=>!Object.hasOwn(joinedKeyRows[0],p)))return {valid:false,reason:'not an attribute defined for this relation'};
  const keys=joinedKeyRows.map(row=>pair.map(p=>(row as Record<string,string>)[p]).join('|'));
  return {valid:new Set(keys).size===keys.length,reason:'independent many-to-many rows'};
}
export const orderCases:Bill[][]=[
  [{id:'M2',client:'C1',month:201702,amount:100,settled:40},{id:'M1',client:'C1',month:201701,amount:200,settled:10},{id:'M3',client:'C1',month:201703,amount:80,settled:60}],
  [{id:'M3',client:'C1',month:201703,amount:200,settled:10},{id:'M1',client:'C1',month:201701,amount:80,settled:60},{id:'M2',client:'C1',month:201702,amount:100,settled:40}],
];
export function ordered(text:string,rows:Bill[]) {
  const m=/^(買上げ年月|消込額|月間買上げ額|得意先ID)の(昇順|降順)$/.exec(text);if(!m)throw Error('UNREVIEWED_ORDER');
  const key={'買上げ年月':'month','消込額':'settled','月間買上げ額':'amount','得意先ID':'client'}[m[1]] as keyof Bill;
  return [...rows].sort((a,b)=>{const l=a[key],r=b[key];return (l<r?-1:l>r?1:0)*(m[2]==='昇順'?1:-1);});
}
