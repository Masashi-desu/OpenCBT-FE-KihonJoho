import{DataError}from'../errors';
const scenarios=[{months:12,people:[10,5,50,25],high:[false,true,false,true]},{months:12,people:[10,5,50,18],high:[false,true,false,true]},{months:10,people:[10,25,50,35],high:[false,true,false,true]},{months:12,people:[10,25,50,30],high:[false,false,false,true]}]as const;
export const legacy2017Pm1Money=(n:number)=>n.toLocaleString('en-US');
export function legacy2017Pm1Model(value:number){
 if(!Number.isInteger(value)||value<0||value>=scenarios.length)throw new DataError('PARAMETER_CONSTRAINT','PM1の条件番号は0から3の整数です');
 const s=scenarios[value],costs=s.people.map(n=>[100000+50000*s.months,n*500*s.months,n*30000]),selected=costs.map((r,i)=>{const eligible=[0,1,2].filter(k=>!(s.high[i]&&k===1));return eligible.reduce((a,k)=>r[k]<r[a]?k:a,eligible[0]);});
 const dChoices=[30000,costs[0][1],costs[3][1],costs[2][1],costs[3][0],costs[3][2],costs[2][2]].sort((a,b)=>a-b);if(new Set(dChoices).size!==7)throw new DataError('PARAMETER_CONSTRAINT','数値解答群が重複しています');
 return{variant:value,months:s.months,people:[...s.people],high:[...s.high],costs,selected,dChoices,dIndex:dChoices.indexOf(costs[3][selected[3]])};
}
