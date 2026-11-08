import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { spring2014AmCases, spring2014AmEscrowEdges, spring2014AmEscrowLabels, spring2014AmEscrowSteps,
  spring2014AmProfitLoss, spring2014AmScatter } from './legacy-2014-spring-am-54-80-models';

export const spring2014Am5480Profiles = {
  weighted:'legacy-2014-spring-am-62-weighted',escrow:'legacy-2014-spring-am-72-escrow',
  scatter:'legacy-2014-spring-am-77-scatter',profitLoss:'legacy-2014-spring-am-78-profit-loss',
};
export const spring2014AmWeightedCriteria = ['省力化','期間短縮','資源削減'];
const plans = ['案1','案2','案3','案4'];
function weightedAlt(index:number) {
  const [weights,scores] = spring2014AmCases.weighted[index];
  return '評価項目｜評価項目の重み｜改善案（'+plans.join('、')+'）\n'+
    scores.map((row,i)=>[spring2014AmWeightedCriteria[i],weights[i],...row].join('｜')).join('\n');
}
function escrowAlt() {
  return '上にエスクローサービス会社、左下に売り手、右下に買い手。\n'+
    spring2014AmEscrowEdges.map((edge,i)=>spring2014AmEscrowLabels[i]+' '+edge.from+
      ('both' in edge?' ↔ ':' → ')+edge.to+(edge.label?'：'+edge.label:'')).join('\n');
}
function scatterAlt(index:number) {
  return '散布図。横軸x、縦軸y、左下に原点0、目盛なし。描画位置を原点からの相対値で示す。\n'+
    spring2014AmScatter(index).map(([x,y])=>'('+x+','+y+')').join('、');
}
function profitLossAlt(index:number) {
  const model=spring2014AmProfitLoss(index);
  return ['単位 百万円','項目｜内訳｜金額','売上高｜｜'+model.sales,
    '売上原価｜変動費 '+model.productionVariable+'、固定費 '+model.productionFixed+'｜'+model.production,
    '売上総利益｜｜'+model.gross,'販売費・一般管理費｜変動費 '+model.sellingVariable+'、固定費 '+model.sellingFixed+'｜'+model.selling,
    '営業利益｜｜'+model.net].join('\n');
}
function define(profile:string,count:number,describe:(index:number)=>string):BookletFigureDefinition {
  return {profile,domain:[[0,count-1]],validate(values){selectCase(values,count);},alt(values){return describe(selectCase(values,count));}};
}
const p=spring2014Am5480Profiles;
export const legacy2014SpringAm5480Figures = [
  define(p.weighted,spring2014AmCases.weighted.length,weightedAlt),
  define(p.escrow,spring2014AmEscrowSteps.length,escrowAlt),
  define(p.scatter,8,scatterAlt),
  define(p.profitLoss,spring2014AmCases.pl.length,profitLossAlt),
];
