import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

import { DataError } from '../errors';
export const evaluationNames = ['省力化', '期間短縮', '資源削減'];
const initialScores = [[6, 8, 2, 5], [5, 5, 9, 5], [6, 4, 7, 6]];
export const evaluationCases = [
  { weights: [4, 3, 3], scores: initialScores },
  { weights: [4, 1, 5], scores: initialScores },
  { weights: [2, 5, 3], scores: [[6, 8, 2, 4], ...initialScores.slice(1)] },
  { weights: [3, 3, 4], scores: [[6, 8, 2, 7], [5, 5, 9, 7], [6, 4, 7, 7]] },
];

export const procurementLetters = ['a', 'b', 'c', 'd'];

export const portfolioCases = [
  { shareOnVertical: false, verticalHighOnTop: true, horizontalHighOnLeft: true },
  { shareOnVertical: true, verticalHighOnTop: true, horizontalHighOnLeft: true },
  { shareOnVertical: false, verticalHighOnTop: true, horizontalHighOnLeft: false },
  { shareOnVertical: true, verticalHighOnTop: false, horizontalHighOnLeft: false },
];

export function portfolioQuadrants(index: number) {
  const { shareOnVertical, verticalHighOnTop, horizontalHighOnLeft } = portfolioCases[index];
  return [true, false].flatMap(top => [true, false].map(left => {
    const verticalHigh = top === verticalHighOnTop;
    const horizontalHigh = left === horizontalHighOnLeft;
    const growthHigh = shareOnVertical ? horizontalHigh : verticalHigh;
    const shareHigh = shareOnVertical ? verticalHigh : horizontalHigh;
    return growthHigh ? (shareHigh ? '花形' : '問題児') : (shareHigh ? '金のなる木' : '負け犬');
  }));
}

const initialRates = [[5, 3, 1, 1], [1, 6, 1, 1], [1, 1, 3, 3]];
export const existingProducts = ['A', 'B', 'C'];
export const newProducts = ['P', 'Q', 'R', 'S'];
export const customerCases = [
  { population: [10000, 20000, 80000], rates: initialRates, newCustomers: [5000, 7000, 13000, 23000], claim: 1000 },
  { population: [20000, 30000, 70000], rates: [[4, 2, 2, 1], [1, 5, 1, 1], [1, 1, 3, 3]], newCustomers: [5000, 7000, 13000, 22000], claim: 4000 },
  { population: [30000, 20000, 60000], rates: [[5, 3, 1, 1], [1, 7, 1, 1], [1, 1, 3, 3]], newCustomers: [17000, 7000, 13000, 20000], claim: 1000 },
  { population: [30000, 20000, 60000], rates: initialRates, newCustomers: [7000, 7000, 13000, 20000], claim: 3000 },
];
export const integerText = (value: number) => value.toLocaleString('en-US');
export const rateText = (tenths: number) => (tenths / 10).toFixed(1);
export const projectedCustomers = (index: number, product: number, prior: number) =>
  customerCases[index].population[prior] * customerCases[index].rates[prior][product] / 10;
export const retainedCustomers = (index: number, product: number) =>
  existingProducts.reduce((sum, _, prior) => sum + projectedCustomers(index, product, prior), 0);

const domain = [[0, 3]] as const;
function validate(values: number[]) {
  if (values.length !== 1 || !Number.isInteger(values[0]) || values[0] < 0 || values[0] > 3)
    throw new DataError('FIGURE_PROFILE', '2010年度春期旧午前の図の入力値が範囲外です');
}
export const weightedEvaluationFigure: BookletFigureDefinition = {
  profile: 'legacy-2010-spring-am-63-weighted-evaluation',
  domain,
  validate,
  alt([index]) {
    const { weights, scores } = evaluationCases[index];
    return '改善案の表。列は評価項目、評価項目の重み、改善案（案1、案2、案3、案4）。'
      + evaluationNames.map((name, row) => name + '：重み' + weights[row] + '、点数 ' + scores[row].join('、') + '。').join('');
  },
};
export const procurementFigure: BookletFigureDefinition = {
  profile: 'legacy-2010-spring-am-67-procurement-flow',
  domain,
  validate,
  alt: () => '左から右への矢印で五つの箱をつなぐ。提案評価方法の決定 → a → b → c → d。',
};
export const portfolioFigure: BookletFigureDefinition = {
  profile: 'legacy-2010-spring-am-68-portfolio-matrix',
  domain,
  validate,
  alt([index]) {
    const state = portfolioCases[index];
    const quadrants = portfolioQuadrants(index);
    return 'PPMの2行2列の表。縦軸aは上から' + (state.verticalHighOnTop ? '高、低' : '低、高')
      + '。横軸bは左から' + (state.horizontalHighOnLeft ? '高、低' : '低、高')
      + '。左上 ' + quadrants[0] + '、右上 ' + quadrants[1] + '、左下 ' + quadrants[2] + '、右下 ' + quadrants[3] + '。';
  },
};
export const customerTransitionFigure: BookletFigureDefinition = {
  profile: 'legacy-2010-spring-am-70-customer-transition',
  domain,
  validate,
  alt([index]) {
    const { population, rates, newCustomers } = customerCases[index];
    return '購入の試算表。列は現在の商品、人数、新商品P、Q、R、S。現在の顧客は新商品ごとに購入割合を表示。'
      + existingProducts.map((name, row) => name + '：' + integerText(population[row]) + '人、' + rates[row].map(rateText).join('、') + '。').join('')
      + '既存顧客人数：' + newProducts.map((_, column) => integerText(retainedCustomers(index, column))).join('、')
      + '。新規顧客人数：' + newCustomers.map(integerText).join('、') + '。';
  },
};
export const legacy2010SpringAm5480Figures = [weightedEvaluationFigure, procurementFigure, portfolioFigure, customerTransitionFigure] as const;
