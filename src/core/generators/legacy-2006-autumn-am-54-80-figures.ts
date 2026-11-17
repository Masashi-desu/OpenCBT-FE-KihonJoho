import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export type PlotPoint = readonly [number,number];
const dots: readonly (readonly PlotPoint[])[] = [
  [[-9,2],[6,0],[3,11],[-5,10],[5,9],[3,7],[-7,6],[-5,5],[-2,5],[3,4],[-6,-1],[4,-2],[7,-3],[13,-4],[15,-4],[-14,-4],[-10,-5],[10,-5],[-13,-8],[10,-8],[15,-8],[-8,-8],[-17,-8],[19,-10],[-14,-12]],
  [[2,20],[2,15],[7,20],[4,18],[10,17],[12,17],[6,16],[15,15],[10,13],[19,13],[4,13],[15,13],[7,12],[13,11],[16,10],[21,10],[10,9],[17,8],[13,8],[24,7],[15,7],[21,6],[18,5],[26,5],[21,4],[26,2]],
  [[-17,-1],[8,0],[-3,12],[4,12],[-9,10],[11,9],[7,7],[19,6],[-13,5],[-3,5],[-7,5],[13,3],[4,2],[19,1],[-7,-2],[4,-2],[13,-2],[17,-4],[-4,-5],[9,-5],[-15,-7],[13,-8],[-13,-10],[5,-11],[-8,-12],[-3,-13]],
  [[-12,-4],[-2,-4],[-8,-6],[-13,-7],[-17,-7],[-5,-7],[-20,-8],[-10,-8],[-18,-9],[-8,-9],[-15,-10],[-21,-11],[-13,-12],[-19,-12],[-10,-12],[-16,-14],[-22,-15],[-18,-16],[-15,-16],[-25,-17],[-20,-18],[-24,-19],[-20,-21],[-26,-21]],
];
const orders=[[0,1,2,3],[3,0,1,2],[2,3,0,1],[0,1,3,2]];
export const autumn2006AmScatter=(index:number)=>orders[index];
export const autumn2006AmScatterPoints=(option:number,index:number)=>{
  const base=dots[autumn2006AmScatter(index)[option]];
  switch(index) {
    case 1:return base.map(([x,y],j)=>[Math.round(x*0.8)+3,y-2+(j%3-1)] as const);
    case 2:return base.map(([x,y],j)=>[x-1+(j%3-1),Math.round(y*0.8)+3] as const);
    case 3:return base.map(([x,y],j)=>[Math.round(x*0.8)-2,Math.round(y*0.85)-2+(j%3-1)] as const);
    default:return base;
  }
};
const levels=[
  {positions:[10,50],levels:[0.83,0.19]}, {positions:[15,48],levels:[0.74,0.16]},
  {positions:[22,60],levels:[0.69,0.23]}, {positions:[17,43],levels:[0.88,0.28]},
];
export const autumn2006AmOC=(index:number)=>levels[index];

function validate(values:number[]) {
  if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>3)
    throw new DataError('PARAMETER_CONSTRAINT','2006年度秋期旧午前の図の入力が範囲外です');
}
function ocAlt(index:number) {
  const {positions,levels}=autumn2006AmOC(index);
  return '横軸は不良率（％）の0から100，縦軸は合格率の0から1.0。p1とp2が横軸に沿ってこの順にあり，曲線との交点に対応する縦軸の位置は順にL1，L2。L1はL2より上にあり，曲線は(0, 1.0)から(100, 0)へ滑らかに下がる。'+
    (index===0?'':'p1は'+positions[0]+'％，p2は'+positions[1]+'％で，L1は'+levels[0]+'，L2は'+levels[1]+'の位置。');
}
const scatterAlt=(option:number,index:number)=>'横軸・縦軸とも5刻みの目盛。各点を中心から読み取った概略座標（横，縦）：'+
  autumn2006AmScatterPoints(option,index).map(([x,y])=>'('+x+'，'+y+')').join('、')+'。';
const sourceFigures=[
  {suffix:'75-oc',alt:ocAlt},
  ...Array.from({length:4},(_,i)=>({suffix:'77-option-'+String(i+1),alt:(index:number)=>scatterAlt(i,index)})),
];
export const legacy2006AutumnAm5480Figures=sourceFigures.map(({suffix,alt})=>({
  profile:'legacy-2006-autumn-am-'+suffix,domain:[[0,3]] as const,validate,alt:(values:number[])=>{validate(values);return alt(values[0]);},
})) satisfies readonly BookletFigureDefinition[];

export function autumn2006Am5480Figure(suffix:string,index:number,caption:string) {
  const target=legacy2006AutumnAm5480Figures.find(figure=>figure.profile.endsWith('-'+suffix));
  if(!target) throw new DataError('FIGURE_PROFILE','2006年度秋期旧午前の図を特定できません');
  return figure(target.profile,[index],caption,target.alt([index]));
}
