import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';
import { tabExample } from './legacy-2006-autumn-pm-4-model';
import { mixtureLabels } from './legacy-2006-autumn-pm-5-model';

export const profiles={
 'sales-format':'legacy-2006-autumn-pm-2-sales-format',
 'tab-run':'legacy-2006-autumn-pm-4-tab-run',
 'tab-stops':'legacy-2006-autumn-pm-4-tab-stops',
 'needed-file':'legacy-2006-autumn-pm-5-needed-file',
 'ratio-file':'legacy-2006-autumn-pm-5-ratio-file',
 'totals-file':'legacy-2006-autumn-pm-5-totals-file',
 io:'legacy-2006-autumn-pm-5-io',
 hierarchy:'legacy-2006-autumn-pm-5-hierarchy',
 dispatch:'legacy-2006-autumn-pm-5-dispatch',
 'mix-flow':'legacy-2006-autumn-pm-5-mix-flow',
} as const;
export type FigureKind=keyof typeof profiles;
export const salesFields=['伝票番号','日付','氏名','電話番号','住所','販売額','商品名','個数'];
export const neededFields=['製造日','製品コード','ロット番号','牛乳の必要量','牧場区分'];
export const ratioFields=(i:number)=>['製品コード',...mixtureLabels(i).farms.map(name=>name+'牧場の割合')];
export const totalFields=(i:number)=>['製造日',...mixtureLabels(i).farms.map(name=>name+'牧場の総必要量')];
const altText:Record<FigureKind,{count:number; alt:(i:number)=>string}>={
 'sales-format':{count:1,alt:()=> '横一列に'+salesFields.join('、')+'。氏名、電話番号、住所を会員情報、販売額から先を販売情報とする。商品名と個数の組は、販売した商品の数だけ繰り返す。'},
 'tab-run':{count:4,alt:i=>{
  const {input,dst,stops}=tabExample(i);
  return '文字位置は左端の1から右へ順番に数える。Src：'+input.join('、')+'。Dst：'+dst.join('、')+
   '。▼で示すタブ位置は'+stops.join('、')+'。TABはタブ文字、△は間隔文字、EOSは終端。';
 }},
 'tab-stops':{count:4,alt:i=>{
  const {stops}=tabExample(i);
  return stops.map((n,j)=>'TabSet['+(j+1)+']は'+n).join('、')+'、中間を省略し、TabSet[m]は−1。';
 }},
 'needed-file':{count:1,alt:()=>neededFields.join('、')+'を左から順に並べる。'},
 'ratio-file':{count:4,alt:i=>ratioFields(i).join('、')+'を左から順に並べる。'},
 'totals-file':{count:4,alt:i=>totalFields(i).join('、')+'を左から順に並べる。'},
 io:{count:1,alt:()=> '必要量ファイルと標準混合割合ファイルから必要量集計へ矢印が入る。必要量集計から集計ファイルとエラーファイルへ矢印が出る。'},
 hierarchy:{count:1,alt:()=> '頂点は必要量集計。第1階層は初期処理、主処理、終了処理で、主処理は繰返し。主処理の下の第2階層は前処理、集計処理、後処理で、集計処理は繰返し。集計処理の下の第3階層は初期化、必要量計算、集計。必要量計算の下の第4階層は条件分岐で混合、単一、エラー。'},
 dispatch:{count:1,alt:()=> '左は主処理。開始から前処理に入り、必要量ファイルの終わり又は［a］まで集計処理を繰り返す。後処理を実行し、終了する。右は必要量計算。開始後に［b］を判定し、Yesなら混合、Noなら［c］を判定。［c］はYesなら単一、Noならエラー。いずれも必要量計算の終了へ進む。'},
 'mix-flow':{count:4,alt:i=>{
  const {vars,first,second,remainder,volume,percentage}=mixtureLabels(i);
  return '混合の開始→標準混合割合ファイルを読む→'+vars[first]+'←'+volume+'×'+percentage(first)+'÷100→'+
   vars[second]+'←'+volume+'×'+percentage(second)+'÷100→'+vars[remainder]+'←［d］→混合の終了。';
 }},
};
export const legacy2006AutumnPm0105Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
 const {alt,count}=altText[kind];
 const value=(values:number[])=>autumn2015PmCase(values,count-1);
 return {profile:profiles[kind],domain:[[0,count-1]],validate(values){value(values);},alt(values){return alt(value(values));}};
});
export function draw(kind:FigureKind,index:number,caption:string) {
 const {count,alt}=altText[kind];
 autumn2015PmCase([index],count-1);
 return {...figure(profiles[kind],[index],caption,alt(index)),captionPresentation:'accessible' as const};
}
