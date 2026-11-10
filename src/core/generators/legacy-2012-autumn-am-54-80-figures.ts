import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { demandCases, investments, profitSeries, quantities, scatterCases, scatterDescription, sellingProbabilities } from './legacy-2012-autumn-am-54-80-models';

export const autumn2012Am5480Profiles = {
  investment: 'legacy-2012-autumn-am-64-investment',
  sales: 'legacy-2012-autumn-am-76-sales-probabilities',
  scatter: 'legacy-2012-autumn-am-77-scatter',
} as const;

function definition(profile: string, domain: BookletFigureDefinition['domain'],
  describe: (values: number[]) => string): BookletFigureDefinition {
  function validate(values: number[]) {
    if (!Array.isArray(values) || values.length !== domain.length || domain.some(([min, max], i) =>
      !Number.isSafeInteger(values[i]) || values[i] < min || values[i] > max))
      throw new DataError('FIGURE_PROFILE', '2012年度秋期旧午前の図表の入力が範囲外です');
  }
  return { profile, domain, validate, alt(values) { validate(values); return describe(values); } };
}

export const legacy2012AutumnAm5480Figures = [
  definition(autumn2012Am5480Profiles.investment, [[0, profitSeries.length - 1]], ([index]) =>
    '各表の年目は0，1，2，3，4，5。年0の利益と年1〜5の投資額は空欄。' +
    profitSeries[index].map((profits, i) =>
      `案件${'abcd'[i]}の年0投資額は${investments[i]}，年1〜5の利益は${profits.join('，')}。`).join('')),
  definition(autumn2012Am5480Profiles.sales, [[0, demandCases.length - 1]], ([index]) =>
    '列の販売個数は4，5，6，7。' + sellingProbabilities(index).map((row, i) =>
      `仕入${quantities[i]}個の行：${row.map(value => value === null ? '―' : value + '％').join('，')}。`).join('')),
  definition(autumn2012Am5480Profiles.scatter, [[0, scatterCases.length - 1], [0, 3]],
    ([index, panel]) => scatterDescription(index, panel)),
] as const;
