import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

type MarketCell = readonly [number, number];
type MarketShare = readonly [readonly [MarketCell, MarketCell], readonly [MarketCell, MarketCell]];
export const autumn2014Am77Profile = 'legacy-2014-autumn-am-77-market-share';
export const autumn2014Am77Tables: readonly MarketShare[] = [
  [[[40,20],[50,30]],[[30,10],[25,25]]],
  [[[45,30],[35,20]],[[25,40],[50,25]]],
  [[[30,40],[40,35]],[[50,30],[45,20]]],
  [[[35,20],[50,40]],[[25,25],[55,30]]],
  [[[45,15],[50,30]],[[30,40],[35,25]]],
  [[[25,20],[35,35]],[[45,40],[50,25]]],
  [[[55,25],[45,15]],[[30,10],[25,40]]],
  [[[30,40],[35,25]],[[40,25],[45,35]]],
];
export function autumn2014Am77Alt(values: number[]) {
  const rows = autumn2014Am77Tables[selectCase(values, autumn2014Am77Tables.length)];
  return '単位 ％。各セルは左がA社，右がB社の市場シェア。列はB社の戦略b1、戦略b2。\n' +
    rows.map((row,index) => 'A社 戦略a' + (index+1) + '｜' + row.map(pair => pair.join(', ')).join('｜')).join('\n');
}
export const legacy2014AutumnAm5480Figures: BookletFigureDefinition[] = [{
  profile:autumn2014Am77Profile,
  domain:[[0,autumn2014Am77Tables.length-1]],
  validate(values) { selectCase(values,autumn2014Am77Tables.length); },
  alt:autumn2014Am77Alt,
}];
