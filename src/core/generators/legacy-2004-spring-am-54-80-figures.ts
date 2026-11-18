import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

const activityDays = [
  [3, 6, 8, 6, 5, 14, 11, 15, 5],
  [4, 5, 7, 6, 6, 17, 9, 11, 5],
  [3, 7, 8, 4, 5, 11, 10, 21, 4],
  [5, 7, 8, 6, 6, 13, 12, 16, 4],
] as const;
const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 2], [1, 3], [2, 3], [2, 4], [4, 5]] as const;
const junction = (point: number) => point === 0 ? '開始' : point === 5 ? '終了' : '結合点' + point;
export const workPlan = (i: number) => connections.map(([from, to], slot) => ({
  from, to, days: activityDays[i][slot], name: 'ABCDEFGHI'[slot],
}));
export const activityFigure: BookletFigureDefinition = {
  profile: 'legacy-2004-spring-am-54-activities', domain: [[0, 3]],
  validate() {},
  alt: ([i]) => '作業工程と日数。' + workPlan(i).map(({ from, to, days, name }) =>
    name + 'は' + junction(from) + 'から' + junction(to) + 'へ' + days + '日').join('，') + '。',
};

export const tradeCases = [
  { amounts: [10, 40, -30, 30, 10, -30], costs: [100, 120, 140, 110] },
  { amounts: [12, 36, -28, 28, 12, -30], costs: [110, 130, 160, 120] },
  { amounts: [8, 50, -38, 25, 15, -30], costs: [90, 120, 150, 100] },
  { amounts: [10, 30, -25, 35, 10, -30], costs: [130, 100, 150, 118] },
] as const;
const dates = ['4/1', '4/4', '4/5', '4/7', '4/10', '4/30'];
export const tradeHeader = ['日付', '商品Aの取引内容', '個数（個）', '単価（円）'];
export function trades(condition: number) {
  const { amounts, costs } = tradeCases[condition];
  let purchase = 0;
  return amounts.map((qty, i) => ({ date: dates[i], what: i === 0 ? '繰越在庫' : qty < 0 ? '払出し' : '購入',
    qty: Math.abs(qty), price: qty > 0 ? costs[purchase++] : null }));
}
export const inventoryFigure: BookletFigureDefinition = {
  profile: 'legacy-2004-spring-am-75-inventory', domain: [[0, 3]],
  validate() {},
  alt: ([i]) => tradeHeader.join('｜') + '。' + trades(i).map(row =>
    [row.date, row.what, row.qty, row.price ?? '斜線（記載なし）'].join('｜')).join('。') + '。',
};

type Histogram = readonly [lower: number, upper: number, heights: readonly number[]];
function mirror([lower, upper, heights]: Histogram): Histogram {
  return [heights.length - upper, heights.length - lower, [...heights].reverse()];
}
const normal: Histogram = [1, 12, [0, 1, 2, 4, 6, 8, 12, 10, 6, 4, 2, 0, 0]];
const broad: Histogram = [4, 15, [0, 0, 2, 3, 4, 6, 8, 10, 14, 12, 7, 6, 4, 3, 2, 2, 2, 0]];
const upper: Histogram = [1, 12, [0, 1, 1, 2, 2, 4, 4, 8, 10, 10, 8, 6, 0]];
const bimodal: Histogram = [4, 15, [0, 2, 2, 4, 4, 8, 4, 2, 4, 4, 8, 4, 4, 2, 2, 2, 0]];
const histograms: readonly (readonly Histogram[])[] = [
  [normal, broad, upper, bimodal],
  [mirror([1, 12, [0, 1, 1, 2, 2, 3, 5, 7, 9, 9, 8, 7, 0]]), mirror(broad), mirror(normal), bimodal],
  [[2, 13, [0, 0, 1, 2, 3, 5, 8, 11, 9, 7, 4, 2, 1, 0]],
    [2, 13, [0, 0, 1, 1, 2, 2, 3, 5, 6, 8, 10, 10, 9, 0]], bimodal, broad],
  [broad, [2, 13, [0, 0, 1, 2, 4, 6, 8, 10, 8, 6, 4, 2, 1, 0]], mirror(bimodal),
    mirror([1, 12, [0, 1, 1, 2, 3, 4, 5, 7, 8, 10, 10, 8, 0]])],
];
export const histogram = (condition: number, option: number) => histograms[condition][option];
export const histogramFigure: BookletFigureDefinition = {
  profile: 'legacy-2004-spring-am-77-histogram', domain: [[0, 3], [0, 3]],
  validate() {},
  alt: ([i, slot]) => {
    const [lower, upper, heights] = histogram(i, slot);
    return '縦軸は度数，横軸はバグ摘出率。' + lower + '区間目の直後に管理下限SL，' + upper +
      '区間目の直後に管理上限SU。左からの棒の相対高さは' + heights.join('，') + '（目盛の数値は示さない）。';
  },
};
export const legacy2004SpringAm5480Figures = [activityFigure, inventoryFigure, histogramFigure] as const;
