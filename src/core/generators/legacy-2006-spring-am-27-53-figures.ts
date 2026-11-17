import { figure } from './definition';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

export const names=['36-flow-a','36-flow-i','36-flow-u','36-flow-e','39-uml','42-subtract','44-quality','46-critical','48-jan','49-charge-a','49-charge-i','49-charge-u','49-charge-e'] as const;
export type FigureName=typeof names[number];
export const profile=(name:FigureName)=>'legacy-2006-spring-am-'+name;
export const controlNames=['36-flow-a','36-flow-i','36-flow-u','36-flow-e'] as const;
export const chargeNames=['49-charge-a','49-charge-i','49-charge-u','49-charge-e'] as const;
const letters='アイウエ';
export const plotCurves=[
  [140,99,56,11],[0,55,118,118],[0,62,108,133],[0,22,57,139],
];
export const classRelations=[
  ['A','B'],['C','A'],['D','B'],['C','D'],
] as const;
export const classCases = [
  [0,1,2,3],[1,3,2,0],[3,0,1,2],[0,2,3,1],
] as const;
export const edges=[
  [0,1],[1,2],[1,3],[1,4],[3,2],[4,7],[2,5],[2,6],[3,8],[7,9],[6,8],[5,8],[9,10],[8,10],
] as const;
export const dayCases=[
  [5,15,10,4,8,15,12,7,24,13,10,7,5,3],
  [5,18,9,4,5,11,14,6,18,10,9,8,4,5],
  [6,17,9,5,6,10,10,12,20,13,11,7,4,5],
  [6,14,10,5,6,13,10,8,29,11,9,7,4,4],
] as const;
export const coordinateTable:readonly (readonly[number,number])[]=[
  [26,155],[114,155],[245,56],[245,155],[178,260],[433,56],[350,103],[355,260],[433,155],[537,260],[630,155],
];
export const qualityCases=[
  {density:10,sizes:[30,20],testCounts:[300,200],open:[0,0],figures:[[0,10,75,102,108],[0,7,37,72,110]]},
  {density:8,sizes:[25,15],testCounts:[200,120],open:[2,1],figures:[[0,12,42,74,112],[0,5,27,61,103]]},
  {density:12,sizes:[20,20],testCounts:[240,240],open:[0,0],figures:[[0,34,85,103,103],[0,34,86,103,103]]},
  {density:10,sizes:[25,35],testCounts:[300,410],open:[0,0],figures:[[0,45,94,109,109],[0,21,82,124,124]]},
];
export const codeCases=['123456789012','631752048103','506381097343','205976314523'];
export const flowAlt='開始→① aをm，bをnへ代入→② mとnを比較。等しければ⑥ mの値を印字→終了。異なるなら③ mとnを比較し，mが大きければ④ m−nをmへ代入，mが小さければ⑤ n−mをnへ代入。④又は⑤の後は②へ戻る。';
export const controlPaths=[
  '上から条件へ入り，下と右へ分かれる。各経路に処理が一つあり，その後に下で合流する。',
  '上からまず処理へ入り，その後に条件がある。条件から左へ回って処理の前に戻る経路と，下に抜ける経路がある。',
  '上から条件へ入り，下には処理が一つある。右の経路は処理を通らず，その下で合流する。',
  '上から条件へ入り，下には処理が一つある。処理の後は左へ回って条件の前に戻る。条件から右に進む経路は下に抜ける。',
];
export const chargeAlts=[
  '縦軸の正の位置から，直線で右下に向かう。',
  '原点から一定の傾きで上がり，途中から水平になる。',
  '原点から右上に伸び，途中で二度折れ，傾きが段階的に小さくなる。',
  '原点から右上に伸び，途中で二度折れ，傾きが段階的に大きくなる。',
];
const umlTerminators=[
  '実線の先に開いた矢印','実線の起点に白いひし形，先に開いた矢印','点線の先に開いた矢印','実線の先に白い三角形',
];

function caption(name:FigureName){
  const control=controlNames.indexOf(name as typeof controlNames[number]),charge=chargeNames.indexOf(name as typeof chargeNames[number]);
  if(control>=0) return '選択肢'+letters[control]+'の流れ図';
  if(charge>=0) return '選択肢'+letters[charge]+'の使用量と利用料金';
  const labels={'39-uml':'UMLのクラス図','42-subtract':'減算を繰り返す流れ図','44-quality':'サブシステム a，b のバグ検出状況','46-critical':'開発作業のアローダイアグラム','48-jan':'JANコードの図'};
  return labels[name as keyof typeof labels];
}
export function alt(name:FigureName,index:number):string {
  const control=controlNames.indexOf(name as typeof controlNames[number]),charge=chargeNames.indexOf(name as typeof chargeNames[number]);
  if(control>=0) return controlPaths[control];
  if(charge>=0) return '横軸は使用量，縦軸は利用料金，原点は0。'+chargeAlts[charge];
  switch(name) {
    case '39-uml':return classRelations.map(([a,b],i)=>'クラス'+a+'からクラス'+b+'：'+umlTerminators[classCases[index][i]]).join('。')+'。';
    case '42-subtract':return flowAlt;
    case '44-quality': {
      const descriptions=[
        ['S字状に上がり，終盤はほぼ水平','終盤まで右上がり'],
        ['終盤まで右上がり','終盤まで右上がり'],
        ['終盤は水平になり，終点は b と同じ高さ','終盤は水平になり，終点は a と同じ高さ'],
        ['終盤は水平になり，終点は b より低い','終盤は水平になり，終点は a より高い'],
      ][index];
      return '両グラフの横軸は時間，縦軸は検出数累積。サブシステム a は'+descriptions[0]+'。サブシステム b は'+descriptions[1]+'。';
    }
    case '46-critical':return '各丸を説明用の番号で区別する。0が起点，10が終点。各作業の起点→終点・日数：'+edges.map(([a,b],i)=>String.fromCharCode(65+i)+' '+a+'→'+b+'（'+dayCases[index][i]+'日）').join('，')+'。';
    case '48-jan':return 'バーコードの下に左から '+[...codeCases[index]].join(' ')+'。図の右端に検査数字を付加する位置の矢印。';
    default:throw Error(name);
  }
}
export const drawing=(name:FigureName,index:number)=>figure(profile(name),[index],caption(name),alt(name,index));
export const legacy2006SpringAm2753Figures:readonly BookletFigureDefinition[]=names.map(name=>({
  profile:profile(name),domain:[[0,3]],
  validate(values){selectCase(values,4);},alt:values=>alt(name,selectCase(values,4)),
}));
