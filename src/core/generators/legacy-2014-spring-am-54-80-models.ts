import { autumn2016Am4180Cases } from './legacy-2016-autumn-am-41-80-models';

const fpCases = [
  [500,10,10,10],[600,10,20,10],[560,8,20,10],[540,9,20,15],
  [600,12,20,20],[480,12,20,10],[720,12,10,10],[550,10,15,20],
] as const;
const slaCases = [
  [30,8,22,5],[25,9,21,4],[20,7,20,5],[20,6,21,10],
  [25,6,20,8],[25,7,19,8],[20,8,19,5],[25,8,18,4],
] as const;
const demandCases = [
  [3000,1000,1500,60000],[4000,1000,2000,75000],[3500,1500,2000,80000],[3600,1200,1800,72000],
  [3200,1200,2200,70000],[4500,1500,2500,90000],[3800,1800,2800,90000],[3000,1200,2100,70000],
] as const;
const licenceCases = [
  [6,30,15000,12000,45000],[5,28,15000,12000,46000],[7,31,16000,12500,47000],[4,26,15000,12000,42000],
  [6,34,17000,14000,49000],[5,31,16500,13000,48000],[7,36,17000,13000,50000],[4,27,16000,12500,45000],
] as const;
const profitLossCases = [
  [700,100,200,40,300],[500,100,140,50,140],[600,120,140,60,140],[800,160,140,80,280],
  [600,150,120,90,180],[800,200,140,40,175],[500,100,120,25,180],[700,140,140,70,196],
] as const;
type WeightedCase = readonly [weights:readonly number[],scores:readonly (readonly number[])[]];
const weightedCases:readonly WeightedCase[] = [
  ...autumn2016Am4180Cases.weighted.slice(0,6),
  [[5,3,2],[[7,8,2,5],[6,5,9,5],[7,4,7,6]]],
  [[3,2,5],[[6,8,2,6],[5,5,9,6],[6,4,7,8]]],
];
export const spring2014AmCases = {
  fp:fpCases,sla:slaCases,demand:demandCases,licence:licenceCases,pl:profitLossCases,
  // The two source questions have identical original inputs. Keep the
  // already-reviewed finite alternatives, with this booklet's own wording.
  weighted:weightedCases,production:autumn2016Am4180Cases.production.slice(0,8),
};

export const spring2014AmEscrowSteps = [5,3,4,6];
export const spring2014AmEscrowLabels = ['①','②','③','④','⑤','⑥'];
export const spring2014AmEscrowEdges = [
  {from:'売り手',to:'買い手',both:true,label:'売買の成立'},
  {from:'買い手',to:'エスクローサービス会社',label:'商品代金の払込み'},
  {from:'エスクローサービス会社',to:'売り手',label:''},
  {from:'売り手',to:'買い手',label:''},
  {from:'買い手',to:'エスクローサービス会社',label:''},
  {from:'エスクローサービス会社',to:'売り手',label:''},
] as const;

const originalScatter: ReadonlyArray<readonly [number,number]> = [
  [22,102],[28,92],[46,86],[47,74],[49,98],[63,93],[68,80],[71,65],[78,85],[84,100],[85,59],
  [96,76],[99,45],[99,92],[113,67],[114,95],[116,40],[117,55],[127,28],[130,73],[138,45],[138,61],
  [142,85],[151,65],[154,36],[162,69],[168,52],[168,26],[173,43],[187,49],[187,17],[188,36],[207,19],
];

export function spring2014AmScatter(index:number) {
  if(index===0)return originalScatter;
  return originalScatter.map(([x,y],i):readonly [number,number]=>[
    x+(i%3-1)*(1+index%4),
    (index%2===1?120-y:y)+(i%7-3)*(1+index%3),
  ]);
}

export function spring2014AmProfitLoss(index:number) {
  const [sales,productionVariable,productionFixed,sellingVariable,sellingFixed]=spring2014AmCases.pl[index];
  const production=productionVariable+productionFixed;
  const selling=sellingVariable+sellingFixed;
  return {sales,productionVariable,productionFixed,sellingVariable,sellingFixed,production,selling,
    gross:sales-production,net:sales-production-selling};
}
