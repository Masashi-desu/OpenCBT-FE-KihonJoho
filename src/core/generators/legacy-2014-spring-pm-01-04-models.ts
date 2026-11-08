import banks from './legacy-2014-spring-pm-01-04-banks.json';

export const riskStages=[
  ['リスクアセスメントの準備','対象プロジェクトの理解','対象システムの理解'],
  ['リスクの特定','情報資産の洗出し','情報資産の価値の数値化','脅威と脆弱性の数値化'],
  ['リスクの分析評価','リスク値の算出','リスクの評価'],
] as const;
export const riskCases=[
  {limit:12,assets:[3,2,1],threats:[3,1,2,3,2,1,1],dimensions:['A','C','I']},
  {limit:12,assets:[2,3,1],threats:[2,2,1,3,3,1,1],dimensions:['C','I','A']},
  {limit:15,assets:[2,1,3],threats:[2,1,2,2,2,2,2],dimensions:['I','A','C']},
  {limit:9,assets:[3,1,2],threats:[2,2,2,2,2,1,1],dimensions:['A','I','C']},
] as const;
export const vulnerabilities=[2,3,1,2,2,1,3];

export const wordFields=[['op',15,12],['r 又は m',11,10],['x',9,8],['b',7,6],['d',5,0]] as const;
export const hexWord=(value:number)=>value.toString(16).toUpperCase().padStart(4,'0')+'h';
export const machineCases=[
  {instruction:0x1983,registers:[4,3,2,1],memory:[1,15,3,4],branch:0x4815},
  {instruction:0x1984,registers:[4,3,2,1],memory:[3,15,1,4],branch:0x4815},
  {instruction:0x1842,registers:[2,4,3,1],memory:[5,15,3,4],branch:0x4815},
  {instruction:0x1AC3,registers:[2,2,3,1],memory:[3,15,4,4],branch:0x4415},
] as const;
export const machineWords=(branch:number)=>[0x12C0,0x24C0,0x38C2,branch,0x4C16,0x18C3,0x28C1];

export const parallelCases=[
  {duration:[7,90,3],target:5,split:100,extent:'n',reverse:false,groups:[5,5,5,5]},
  {duration:[6,88,6],target:4,split:120,extent:'n−1',reverse:true,groups:[4,6,5,5]},
  {duration:[9,84,7],target:4,split:80,extent:'n−2',reverse:false,groups:[6,4,6,4]},
  {duration:[3,96,1],target:6,split:96,extent:'n−3',reverse:true,groups:[5,4,6,5]},
] as const;
export function partitionSizes(groups:readonly number[]) {
  let first=1;
  return groups.map(count=>{const last=first+count-1;const range=[first,last] as const;first=last+1;return range;});
}
export function loopPrograms(i:number){
  const {extent,reverse}=parallelCases[i];
  const previous=['i: 2, i ≦ n, 1','a[i] ← a[i−1] + b[i]'];
  const following=['i: 1, i ≦ n, 1','a[i] ← a[i+1] + b[i]'];
  return [...(reverse?[following,previous]:[previous,following]),['i: 1, i ≦ '+extent+', 1','a[i] ← a[i+m] + b[i]']];
}
export function parallelIndexRows(i:number) {
  if(i===0)return banks.q3[3].map(row=>row.split(' ').map(Number));
  const bounds=partitionSizes(parallelCases[i].groups);
  const permutation=Array.from({length:20},(_,j)=>(7*j+3*i)%20+1);
  const safe=permutation.slice();safe[1]=safe[0];
  const conflict=(left:number,right:number)=>{
    const row=permutation.slice();
    row[bounds[right][0]-1]=row[bounds[left][1]-1];
    return row;
  };
  const rows=[conflict(0,1),conflict(1,2),conflict(0,3)];
  rows.splice((i+1)%4,0,safe);
  return rows;
}

export function displayedParallelIndexRows(i:number,selection:number) {
  return parallelIndexRows(i).map((cells,j)=>({mark:'アイウエ'[j],cells}))
    .filter((_,j)=>selection===0||j+1===selection);
}
export const parallelAssignments=['a[i] ← b[i] + c[i]','a[ip[i]] ← b[i]'] as const;

export const ethernetCases=[
  {main:4,sapporo:1,osaka:2,hiroshima:1,farMs:45,osakaMs:24,megabytes:1,blockKB:4,batch:10,deadline:8,speeds:[3,4,8,10]},
  {main:8,sapporo:2,osaka:3,hiroshima:2,farMs:40,osakaMs:20,megabytes:1,blockKB:5,batch:8,deadline:7,speeds:[2,3,4,8]},
  {main:6,sapporo:2,osaka:1,hiroshima:2,farMs:32,osakaMs:16,megabytes:1,blockKB:4,batch:5,deadline:8,speeds:[2,3,4,6]},
  {main:8,sapporo:4,osaka:2,hiroshima:2,farMs:48,osakaMs:20,megabytes:2,blockKB:8,batch:10,deadline:8,speeds:[3,4,6,8]},
] as const;
export const sites=['東京本社','札幌営業所','大阪営業所','広島営業所'] as const;
