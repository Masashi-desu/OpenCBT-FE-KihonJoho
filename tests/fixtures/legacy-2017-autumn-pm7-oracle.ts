/** Independently fixed QS33–37. No production dependency. */
export const sourceWages=[1400,1200,1600,1800];
export const sourceDevelopment=[5800,6200,1200,12400,2750,4300,1630,1800];
export const sourceAnnualOther=[4800,7320,670,null,1640,520,1280,2160];
export const sourceTable1Labels=[
 '注文に対して提出される注文請書枚数（枚／日）','注文請書の誤りの発生枚数（枚／日）','注文請書と注文書との目視での照合及び再照合の作業に要する時間（分／枚）','誤りが見つかった注文請書の再提出の依頼作業に要する時間（分／枚）','作業に要する人件費（円／時間）',
];
export const qualitative={ab:['増加する','減少するがゼロにならない','不要になる','変わらない'],
 d:['SYS903もSYS907も採用できる','SYS903もSYS907も採用できない','SYS903は採用できるが，SYS907は採用できない','SYS907は採用できるが，SYS903は採用できない'],
 e:['SYS903もSYS905も採用できる','SYS903もSYS905も採用できない','SYS903は採用できるが，SYS905は採用できない','SYS905は採用できるが，SYS903は採用できない'],f:['SYS903とSYS905','SYS903とSYS907','SYS905','SYS907']};
export function annualByEvents(wage:number,documents=200,errors=18,recheckMinutes=5,requestMinutes=10) {
 // Sum each actual task event, independently of production's algebraic expression.
 const minutes=[...Array.from({length:documents},()=>recheckMinutes),...Array.from({length:errors},()=>recheckMinutes),...Array.from({length:errors},()=>requestMinutes)].reduce((s,n)=>s+n,0);
 let yen=0;for(let day=0;day<240;day++)yen+=minutes*wage;
 return yen/60/1000;
}
export function reference(wage:number) {
 const before=annualByEvents(wage),after=annualByEvents(wage,200,3,0,5),benefit=before-after;
 const benefits=sourceAnnualOther.map(n=>n??benefit),required=[0,1,3],optional=[2,4,5,6,7],budget=30000;
 const cost=(indexes:number[])=>indexes.reduce((s,i)=>s+sourceDevelopment[i],0),effect=(indexes:number[])=>indexes.reduce((s,i)=>s+benefits[i],0);
 const combinations=Array.from({length:32},(_,mask)=>{const ids=[...required,...optional.filter((_,i)=>Boolean(mask&(1<<i)))];return {ids,cost:cost(ids),effect:effect(ids)};});
 const feasible=combinations.filter(x=>x.cost<=budget),best=feasible.reduce((a,b)=>a.effect>b.effect?a:b);if(feasible.filter(x=>x.effect===best.effect).length!==1)throw Error('NONUNIQUE_BEST');
 const base=[...required,7],with905=[...base,4],with907=[...base,6],remaining905=budget-cost(with905),remaining907=budget-cost(with907);
 const pairTruth=(p:boolean,q:boolean)=>[p&&q,!p&&!q,p&&!q,q&&!p];
 return {before,after,benefit,benefits,combinations,best,required,base,cost,effect,
 dTruth:pairTruth(sourceDevelopment[2]<=remaining905,sourceDevelopment[6]<=remaining905),
 eTruth:pairTruth(sourceDevelopment[2]<=remaining907,sourceDevelopment[4]<=remaining907),
 abTruth:(current:number,future:number)=>[future>current,future<current&&future>0,future===0,future===current],
 fTruth:[[2,4],[2,6],[4],[6]].map(extra=>{const ids=[...base,...extra];return cost(ids)<=budget&&effect(ids)===best.effect;}),
 cCandidates:[[6608,84],[6608,6524],[7028,6524],[7112,84],[7112,7028]].map(xs=>xs.map(n=>{const product=BigInt(n)*BigInt(wage);if(product%1400n)throw Error('UNEXPECTED_FRACTION');return Number(product/1400n);})),
 };
}
export const officialLabels='ウイエイウイ';
