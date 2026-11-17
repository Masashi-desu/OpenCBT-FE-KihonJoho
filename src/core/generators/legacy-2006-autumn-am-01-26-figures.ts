import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2006-autumn-am-01-26-shared';
import { architectureCases,bitsByDisk,floatCases,gateCases,letters,machineCases,pipelineCases,visit,type Expression } from './legacy-2006-autumn-am-01-26-model';

export const profiles={
 float:'legacy-2006-autumn-am-4-float', 'state-legend':'legacy-2006-autumn-am-11-legend',
 states:'legacy-2006-autumn-am-11-states',tree:'legacy-2006-autumn-am-12-tree',
 gates:'legacy-2006-autumn-am-17-legend',circuit:'legacy-2006-autumn-am-17-circuit',
 pipe:'legacy-2006-autumn-am-18-pipeline',architecture:'legacy-2006-autumn-am-20-architecture',
 disk:'legacy-2006-autumn-am-23-disk',
} as const;
export type FigureKind=keyof typeof profiles;
export function treeText(node:Expression):string{
 const [name,left,right]=node;
 return left&&right?name+'（左：'+treeText(left)+'、右：'+treeText(right)+'）':name;
}
const parts:Record<FigureKind,{count:number;alt:(i:number)=>string}>={
 float:{count:4,alt:i=>{
  const {width,exponent,bias}=floatCases[i];
  return 'ビット番号0が仮数の符号S（0が非負、1が負）。1〜'+exponent+'が指数部E（実際の指数に'+bias+'を加算。0≦E≦'+(2**exponent-1)+'）。'+
   (exponent+1)+'〜'+(width-1)+'が絶対値表現の仮数部M。';
 }},
 'state-legend':{count:1,alt:()=> '黒い矢印の付いた円は初期状態、二重丸は受理状態。'},
 states:{count:4,alt:i=>{
  const {run,repeat}=machineCases[i];
  return '最初に左の状態。'+run+'を読むたびに次の状態へ進み、'+repeat+'回連続すると二重丸の受理状態に入る。途中と受理状態では'+(1-run)+
   'で左の初期状態へ戻る。受理状態の次に'+run+'を読むと右下の状態へ行き、0でも1でもとどまる。';
 }},
 tree:{count:4,alt:i=>{
  const node=letters[i][0];
  return '輪郭に沿い、左の枝を先に進んで右の枝をたどり、最後に根から出る。根：'+treeText(node)+'。前置記法 '+visit(node,0)+
   '。中置記法 '+visit(node,1)+'。後置記法 '+visit(node,2)+'。';
 }},
 gates:{count:1,alt:()=> '平らな入力側と丸い出力側はAND、曲がった入力側と先の尖った出力側はOR、三角の先に小円はNOT。'},
 circuit:{count:4,alt:i=>{
  const {firstAnd,secondOr}=gateCases[i];
  return '入力AとBを'+(firstAnd?'AND':'OR')+'に入れ、出力はP。Pと入力Cを'+(secondOr?'OR':'AND')+'に入れ、出力はQ。QをNOTに入れ、出力はR。';
 }},
 pipe:{count:16,alt:i=>'命令別の開始位置：'+pipelineCases[Math.floor(i/4)].options[i%4].join('、')+'。行は上から命令1、2、3。各行はF D A R E。'},
 architecture:{count:4,alt:i=>{
  const {cache,memory}=architectureCases[i];
  return 'CPU内部にキャッシュメモリ '+cache+'kバイト。CPUは外部の主記憶 '+memory+'Mバイトと接続している。';
 }},
 disk:{count:4,alt:i=>'制御装置から各データディスクへ接続。'+bitsByDisk(i).map((row,j)=>
  'データディスク'+(j+1)+'：'+row.map(n=>'b'+n).join('、')+'。').join('')},
};
export const legacy2006AutumnAm0126Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
 const {count,alt}=parts[kind];
 return {profile:profiles[kind],domain:[[0,count-1]],validate(values){finiteIndex(values,count,'FIGURE_PROFILE');},
  alt(values){return alt(finiteIndex(values,count,'FIGURE_PROFILE'));}};
});
export function draw(kind:FigureKind,i:number,caption:string){
 const {count,alt}=parts[kind];finiteIndex([i],count,'FIGURE_PROFILE');
 return {...figure(profiles[kind],[i],caption,alt(i)),captionPresentation:'accessible' as const};
}
