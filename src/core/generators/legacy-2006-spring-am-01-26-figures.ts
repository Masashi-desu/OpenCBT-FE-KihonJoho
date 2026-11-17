import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2006-spring-am-01-26-shared';
import {floatBits, multiplyWidths, nandCases, searchCases, triangleCases, vennCases} from './legacy-2006-spring-am-01-26-model';

export const profiles={
 float:'legacy-2006-spring-am-4-float','float-choices':'legacy-2006-spring-am-4-float-choices',
 venn:'legacy-2006-spring-am-7-venn','triangle-property':'legacy-2006-spring-am-11-triangle-property',
 'triangle-use':'legacy-2006-spring-am-11-triangle-use',search:'legacy-2006-spring-am-14-search',
 multiply:'legacy-2006-spring-am-15-multiply','nand-legend':'legacy-2006-spring-am-16-nand-legend',
 nand:'legacy-2006-spring-am-16-nand',
} as const;
export type FigureKind=keyof typeof profiles;
export const layoutLabel='左からSは符号の1ビット（0：正、1：負）、eは指数の4ビット（2を基数とし負数は2の補数）、fは仮数の11ビット（2進数の絶対値表現）。小数点はfの直前。';
export const triangleSides=['データベースソフト','ワープロソフト','表計算ソフト'];
const parts:Record<FigureKind,{count:number;alt:(i:number)=>string}>={
 float:{count:1,alt:()=>layoutLabel},
 'float-choices':{count:16,alt:i=>{
  const [s,e,f]=floatBits(Math.floor(i/4),i%4);
  return 'S：'+s+'、e：'+e+'、f：'+f+'。';
 }},
 venn:{count:4,alt:i=>{
  const regions=vennCases[i].map(n=>n===0?'A・B・Cのどの円にも属さない':
   ['A','B','C'].map((name,j)=>name+'に属'+((n&(4>>j))?'する':'さない')).join('、'));
  return '長方形の全体集合内にA・B・Cの三円。網掛け領域：'+regions.join('／')+'。';
 }},
 'triangle-property':{count:1,alt:()=> '正三角形内の点から、下辺へx、右辺へy、左辺へzの垂線を引く。三つの長さの和x＋y＋zは一定。'},
 'triangle-use':{count:4,alt:i=>'左辺がワープロソフト、右辺が表計算ソフト、下辺がデータベースソフト。下・左・右の辺までの距離を各点の順に記す。'+
  triangleCases[i].map((a,j)=>'ABCD'[j]+'：'+a.join('、')).join('。')+'。'},
 search:{count:4,alt:i=>{
  const {from,to}=searchCases[i];
  return '開始。'+from+'をx、'+to+'をyに入れる。xとyを比較し、x＞yならmに0を入れて終了。x≦yなら［a］を計算、kとA(m)を比較する。k＝A(m)なら終了。k＜A(m)ならyにm−1、k＞A(m)ならxにm＋1を入れ、xとyの比較へ戻る。';
 }},
 multiply:{count:4,alt:i=>'開始。被乗数をX、乗数をY、0をZ、1をiへ代入。a＝1ならZ＋XをZへ代入し、a≠1ならその操作を飛ばす。どちらも処理bとi＋1→iを行う。i≦'+multiplyWidths[i]+'ならaを判定する位置へ戻り、i＞'+multiplyWidths[i]+'ならZを出力して終了。'},
 'nand-legend':{count:1,alt:()=> '左に2入力、丸みのある右側の出力に否定を表す小円をもつNANDの記号。'},
 nand:{count:4,alt:i=>nandCases[i].map((inputs,index)=>
  (index<2?'第'+(index+1)+'ゲート':'出力Z')+'：NAND('+inputs[0]+','+inputs[1]+')').join('、')+'。N1とN2は、それぞれ第1と第2ゲートの出力。'},
};
export const legacy2006SpringAm0126Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
 const {count,alt}=parts[kind];
 return {profile:profiles[kind],domain:[[0,count-1]],validate(values){finiteIndex(values,count,'FIGURE_PROFILE');},
  alt(values){return alt(finiteIndex(values,count,'FIGURE_PROFILE'));}};
});
export function draw(kind:FigureKind,index:number,caption:string){
 const {count,alt}=parts[kind];finiteIndex([index],count,'FIGURE_PROFILE');
 return {...figure(profiles[kind],[index],caption,alt(index)),captionPresentation:'accessible' as const};
}
