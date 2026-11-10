import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const profiles2011AutumnAm2753 = {
  order:'legacy-2011-autumn-am-28-order-record',
  relation:'legacy-2011-autumn-am-33-multiplicity',
  project:'legacy-2011-autumn-am-51-earliest-node',
} as const;
export const orderFields = [
  ['伝票番号','文字'], ['注文日','文字'], ['商品コード','文字'], ['数量','数値'], ['顧客コード','文字'],
] as const;
export const multiplicities = [
  ['1..*','0..1'], ['1','0..*'], ['1..*','1'], ['1','1..*'],
] as const;
export const projectEdges = [
  {label:'A',from:1,to:2}, {label:'B',from:1,to:3}, {label:'C',from:2,to:3}, {label:'D',from:2,to:4},
  {label:'E',from:2,to:5}, {label:'F',from:3,to:5}, {label:'G',from:4,to:6}, {label:'H',from:5,to:6},
] as const;
export const projectCases = [
  [3,2,1,4,2,2,1,1], [2,1,1,2,3,1,2,1], [3,2,1,2,3,1,1,2], [1,2,1,3,2,1,2,1],
] as const;
export const dummy = {from:4,to:5};

function exact<T>(values: readonly number[], cases: readonly T[]): T {
  const i=values[0];
  if(values.length!==1 || !Number.isSafeInteger(i) || i<0 || i>=cases.length)
    throw new DataError('FIGURE_PROFILE','指定条件の図を表示できません。');
  return cases[i];
}
export const orderAlt = (values: readonly number[]) => {
  exact(values,[0]);
  return '注文データ。'+orderFields.map(([name,kind])=>name+'（'+kind+'）').join('｜')+'。';
};
export const multiplicityAt=(values:readonly number[])=>exact(values,multiplicities);
export const projectAt=(values:readonly number[])=>exact(values,projectCases);
export function relationAlt(values:readonly number[]) {
  const [left,right]=multiplicityAt(values);
  return '左の「納品」と右の「請求」を実線で結ぶ。納品側に'+left+'，請求側に'+right+'。';
}
export function projectAlt(values:readonly number[]) {
  const days=projectAt(values);
  return 'アローダイアグラム。凡例では矢印の上が作業名，下が所要日数。'+projectEdges.map(({label,from,to},i)=>
    '結合点'+from+'→'+to+'に作業'+label+'（'+days[i]+'日）').join('，')+'。結合点4→5の破線はダミー作業。';
}
export const legacy2011AutumnAm2753Figures:readonly BookletFigureDefinition[]=[
  {profile:profiles2011AutumnAm2753.order,domain:[[0,0]],validate(values){orderAlt(values);},alt:orderAlt},
  {profile:profiles2011AutumnAm2753.relation,domain:[[0,multiplicities.length-1]],validate(values){multiplicityAt(values);},alt:relationAlt},
  {profile:profiles2011AutumnAm2753.project,domain:[[0,projectCases.length-1]],validate(values){projectAt(values);},alt:projectAlt},
];
