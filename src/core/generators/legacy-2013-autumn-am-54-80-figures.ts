import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2013Am5480Source as source } from './legacy-2013-autumn-am-54-80-source';
import { autumn2013AmChargeLines, autumn2013AmFishbone, autumn2013AmReceiptCount, autumn2013AmReceiptRows } from './legacy-2013-autumn-am-54-80-models';

export const autumn2013Am5480Profiles = {
  effort: 'legacy-2013-autumn-am-54-effort-table',
  charge: 'legacy-2013-autumn-am-58-charge-chart',
  portfolio: 'legacy-2013-autumn-am-69-portfolio-matrix',
  fishbone: 'legacy-2013-autumn-am-76-fishbone',
  receipt: 'legacy-2013-autumn-am-77-receipt-table',
} as const;

function semanticFigure(profile: string, count: number, describe: (index: number) => string): BookletFigureDefinition {
  return {
    profile,
    domain: [[0, count - 1]],
    validate(values) {
      const index = values[0];
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= count) {
        throw new Error('FIGURE_DOMAIN');
      }
    },
    alt(values) {
      this.validate(values);
      return describe(values[0]);
    },
  };
}

export const legacy2013AutumnAm5480Figures = [
  semanticFigure(autumn2013Am5480Profiles.effort, 1, () => source[54].figure!),
  semanticFigure(autumn2013Am5480Profiles.charge, autumn2013AmChargeLines.length,
    index => '縦軸は利用料金、横軸は使用量。原点は0。' + source[58].choices[index] + '。'),
  semanticFigure(autumn2013Am5480Profiles.portfolio, 1, () => source[69].figure!),
  semanticFigure(autumn2013Am5480Profiles.fishbone, autumn2013AmFishbone.length, index => {
    const { head, branch } = autumn2013AmFishbone[index];
    return `左から右への横矢印の終点に長方形${head}。下方の長方形${branch}から右上へ向かう矢印が横矢印に合流する。`;
  }),
  semanticFigure(autumn2013Am5480Profiles.receipt, autumn2013AmReceiptCount, index =>
    ['日付｜摘要｜受入｜払出｜単価（円）', ...autumn2013AmReceiptRows(index).map(row =>
      [row.date, row.action, row.received, row.issued, row.price].map(value => value ?? '').join('｜'))].join('\n')),
] as const;
