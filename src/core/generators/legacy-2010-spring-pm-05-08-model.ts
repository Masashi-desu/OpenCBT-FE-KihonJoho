import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';

export const collection='2010h22h-fe-pm';
export const caseCount=4;
export const caseIndex=(values:number[])=>autumn2015PmCase(values,caseCount-1);
export const digits=['①','②','③','④'] as const;
const deliveryCases=[
  {company:'F社',item:'家具',limit:10,lead:2,carrier:'H社',issue:18,reservations:['1234','1023'],items:[['3456','4567','5999'],['0509','1006']]},
  {company:'J社',item:'家電',limit:8,lead:3,carrier:'K社',issue:19,reservations:['2201','2234'],items:[['4114','4116'],['4051','4053','4057']]},
  {company:'R社',item:'事務機器',limit:9,lead:4,carrier:'P社',issue:20,reservations:['3123','3072'],items:[['6111','6213','6314'],['6002']]},
  {company:'Y社',item:'照明器具',limit:12,lead:5,carrier:'Z社',issue:21,reservations:['4050','4103'],items:[['7010','7040'],['7317','7318']]},
] as const;
export const deliveryAt=(index:number)=>deliveryCases[index];
export const deliveryLead=(lead:number)=>lead===0?'受付日':lead===1?'受付日の翌日':lead===2?'受付日の翌々日':'受付日の'+lead+'日後';
export const deliveryDate=(date:number)=>'2010-04-'+String(date).padStart(2,'0');
export const deliveryDestinations=[['東京都○○区△△1-2-3','情報　花子'],['東京都○○区△△12-34','試験　太郎']];
export const deliveryLayouts=(index:number)=>{
  const {item,limit}=deliveryAt(index);
  return {
    '5-accept':['受付番号','受付日','配達先郵便番号','配達先住所','配達先氏名',item+'の個数',item+'番号1','…',item+'番号'+limit],
    '5-carrier':['業者コード','業者名','業者連絡先'],
    '5-region':['郵便番号','配達可能日','業者コード','配達先件数の上限値'],
    '5-reservation':['予約番号','業者コード','配達予定日','受付番号','配達完了日'],
    '5-totals':['業者コード','配達先件数'],
  } as const;
};

type BugGroup=readonly [design:number,manufacture:number,unit:number,integration:number];
type QualityCase={
  before:readonly number[]; after:readonly number[];
  designRates:readonly number[]; forecastLeft:readonly number[]; groups:readonly BugGroup[];
  fOptions:readonly number[]; hOptions:readonly number[];
};
const qualityCases:readonly QualityCase[]=[
  {before:[4,3,3],after:[5,5,3],designRates:[35,25,28],forecastLeft:[262,170,137],
    groups:[[280,210,160,100],[175,170,100,60],[112,143,90,45]],fOptions:[30,32,34,36,38],hOptions:[66,68,70,72,74]},
  {before:[5,4,3],after:[6,6,3],designRates:[36,25,24],forecastLeft:[220,168,135],
    groups:[[270,235,120,90],[150,166,90,70],[120,130,80,52]],fOptions:[31,33,35,37,39],hOptions:[65,67,69,71,73]},
  {before:[5,3,4],after:[7,4,4],designRates:[36,24,24],forecastLeft:[267,188,133],
    groups:[[288,216,160,100],[168,190,112,63],[132,200,85,42]],fOptions:[30,32,34,36,38],hOptions:[66,68,70,72,74]},
  {before:[4,4,3],after:[5,6,3],designRates:[33,27,28],forecastLeft:[252,174,150],
    groups:[[264,215,144,101],[162,210,102,60],[112,156,87,57]],fOptions:[33,35,37,39,41],hOptions:[66,68,70,72,74]},
];
export function qualityAt(index:number){
  const c=qualityCases[index];
  const total=c.groups.map(row=>row.reduce((sum,value)=>sum+value,0));
  const test=c.groups.map(([, ,unit,integration])=>unit+integration);
  const foundEarly=c.groups.map(([design,manufacture])=>design+manufacture);
  const early=foundEarly.map((number,i)=>100*number/total[i]);
  const winner=early.indexOf(Math.max(...early));
  return {...c,total,test,early,winner,f:Math.round(100*c.groups[1][1]/total[1]),h:Math.round(early[winner])};
}

export const strengths=[
  '生産業務を効率よく行っていることによって，売上総利益率を業界での上位に保っている。',
  '知的財産の件数が，業界平均を上回っている。',
  '就業環境の改善を図るため，従業員満足度に関する調査・分析業務を10年以上継続しており，その結果を業務改善に結び付けるノウハウを蓄積している。',
  '売れ筋製品で使用している特殊な原料について，1社しかない供給業者との独占購入権を保有している。',
];
const weaknesses=[
  '情報システムのアプリケーション開発プロセスの効率が低い。',
  '顧客の製品ブランドに対する好感度が，競合他社と比較して低い。',
  '本社スタッフ部門による営業支援が十分ではない。',
  '物流工程が，周辺環境に配慮したプロセスとなっていない。',
];
const businessCases=[
  {weaknessOrder:[0,1,2,3],entryEasy:true,supplierStrong:true,substitutesMany:true,health:[90,40,3,1]},
  {weaknessOrder:[1,0,2,3],entryEasy:false,supplierStrong:true,substitutesMany:true,health:[90,28,2,1]},
  {weaknessOrder:[0,3,1,2],entryEasy:true,supplierStrong:false,substitutesMany:false,health:[90,43,6,2]},
  {weaknessOrder:[2,0,3,1],entryEasy:false,supplierStrong:false,substitutesMany:true,health:[90,27,6,2]},
] as const;
const rankOptions=['HHH','LLL','HHL','HLL','LHH','LHH','LHL','LLH'] as const;
export function businessAt(index:number){
  const {weaknessOrder,entryEasy,supplierStrong,substitutesMany,health}=businessCases[index];
  const earnings=[health,[240,90,10,11],[500,180,25,18]] as const;
  const rate=earnings.map(([sales,...profits])=>profits.map(profit=>profit/sales));
  const rank=rate[0].map((value,i)=>value>Math.max(rate[1][i],rate[2][i])?'H':value<Math.min(rate[1][i],rate[2][i])?'L':'M').join('');
  return {weaknesses:weaknessOrder.map(i=>weaknesses[i]),weakAsset:weaknessOrder.findIndex(i=>i===1),
    entryEasy,supplierStrong,substitutesMany,earnings,rate,rank,answer:rankOptions.findIndex(value=>value===rank)};
}

const sortCases=[
  {diagram:[5,7,4,2,3,8,1],trace:[3,8,2,7,5,1]},
  {diagram:[7,3,2,5,4,6,1],trace:[4,9,6,8,1,3]},
  {diagram:[4,5,2,8,7,3,1],trace:[6,2,5,9,3,7]},
  {diagram:[6,1,3,7,2,8,5],trace:[8,3,2,6,1,5]},
] as const;
export const sortAt=(index:number)=>sortCases[index];
export const ascending=(data:readonly number[])=>[...data].sort((a,b)=>a-b);
function merge(left:readonly number[],right:readonly number[]){
  let i=0,j=0;
  const output=[];
  while(i<left.length&&j<right.length){
    if(left[i]<right[j])output.push(left[i++]);
    else output.push(right[j++]);
  }
  return [...output,...left.slice(i),...right.slice(j)];
}
export function sortTrace(data:readonly number[],snapshots:number[][]=[]):readonly number[]{
  if(data.length<=1)return [...data];
  const split=Math.floor(data.length/2), result=merge(sortTrace(data.slice(0,split),snapshots),sortTrace(data.slice(split),snapshots));
  snapshots.push(result);
  return result;
}
export function traceChoices(index:number){
  const data=sortAt(index).trace, left=data.slice(0,3), right=data.slice(3), l=ascending(left),r=ascending(right);
  const steps:number[][]=[];
  const all=sortTrace(data,steps), split=(half:readonly number[])=>[half.slice(0,1),half.slice(1,2),half.slice(0,2)];
  return [
    [...split(l),l,...split(r),r,all],
    [...split(left),l,...split(right),r,all],
    steps,
    [left.slice(0,2),l,right.slice(0,2),r,all],
    [l,r,all],
    [left,right,all],
  ].map(groups=>groups.map(group=>group.join(',')).join(' → '));
}
