import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { accounts, breakEvenCases, incomeCases, procurementSteps, productionRows, subtotalAfter } from './legacy-2012-spring-am-54-80-models';

export const spring2012Am5480Profiles = {
  procurement: 'legacy-2012-spring-am-66-procurement',
  production: 'legacy-2012-spring-am-72-production',
  income: 'legacy-2012-spring-am-76-profit-loss',
  breakEven: 'legacy-2012-spring-am-77-break-even',
} as const;

function definition(profile: string, last: number, describe: (index: number) => string): BookletFigureDefinition {
  const domain = [[0, last]] as const;
  function validate(values: number[]) {
    if (!Array.isArray(values) || values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > last)
      throw new DataError('FIGURE_PROFILE', '2012年度春期旧午前の図表の入力が範囲外です');
  }
  return { profile, domain, validate, alt(values) { validate(values); return describe(values[0]); } };
}

export const legacy2012SpringAm5480Figures = [
  definition(spring2012Am5480Profiles.procurement, 0, () => 'aからdに向かって矢印で順に接続。' +
    procurementSteps.map((step, index) => 'abcd'[index] + '：' + step).join('')),
  definition(spring2012Am5480Profiles.production, 0, () => '列は生産方式a，b，c，d。' +
    productionRows.map(([heading, ...row]) => heading + '：' + row.join('，') + '。').join('')),
  definition(spring2012Am5480Profiles.income, incomeCases.length - 1, index => '損益計算書。単位は百万円。' +
    accounts.map(([section, label], i) => section + ' ' + label + ' ' + incomeCases[index][i].toLocaleString('ja-JP') + '。' +
      (subtotalAfter.some(position => position === i) ? '直後に数値が伏せられた枠。' : '')).join('')),
  definition(spring2012Am5480Profiles.breakEven, breakEvenCases.length - 1, index => {
    const { threshold, fixed } = breakEvenCases[index];
    return '横軸は売上高，縦軸は収益・費用。' + fixed.map((value, company) => 'AB'[company] +
      '社：収益線は原点を通り，費用線の縦軸切片は' + value + '。二直線の交点は売上高' + threshold +
      '，収益・費用' + threshold + '。').join('');
  }),
] as const;
