import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { assemblyCases, assemblyMinutes, existingBuyers, salesCases, stockCases } from './legacy-2011-autumn-am-54-80-models';

export type Autumn2011AmFigureTable = {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  note?: string;
};
type Figure = BookletFigureDefinition & { table(values: number[]): Autumn2011AmFigureTable };
export const thousands = (value: number) => value.toLocaleString('ja-JP');

function definition(number: number, suffix: string, build: (index: number) => Autumn2011AmFigureTable): Figure {
  const domain = [[0, 3]] as const;
  function validate(values: number[]) {
    if (!Array.isArray(values) || values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > 3)
      throw new DataError('FIGURE_PROFILE', '2011年度秋期旧午前の図表の入力が範囲外です');
  }
  function table(values: number[]) { validate(values); return build(values[0]); }
  return { profile: `legacy-2011-autumn-am-${number}-${suffix}`, domain, validate, table,
    alt(values) {
      const { columns, rows, note } = table(values);
      return [...(note ? [note] : []), columns.join('｜'), ...rows.map(row => row.join('｜'))].join('\n');
    } };
}

export const legacy2011AutumnAm5480Figures = [
  definition(70, 'customer-migration', i => {
    const { current, rates, newcomers } = salesCases[i];
    return {
      columns: ['', '人数', 'P', 'Q', 'R', 'S'],
      rows: [
        ...rates.map((row, index) => ['ABC'[index], thousands(current[index]), ...row.map(value => (value / 10).toFixed(1))]),
        ['既存顧客人数', '', ...existingBuyers(i).map(thousands)],
        ['新規顧客人数', '', ...newcomers.map(thousands)],
      ],
    };
  }),
  definition(72, 'assembly-profit', i => {
    const { profit, cap } = assemblyCases[i];
    return {
      columns: ['', '製品X', '製品Y', '製品Z'],
      rows: [
        ['1個当たりの利益（円）', ...profit.map(thousands)],
        ['1個当たりの組立て所要時間（分）', ...assemblyMinutes.map(String)],
        ['月間需要量上限（個）', ...cap.map(thousands)],
      ],
    };
  }),
  definition(73, 'inventory-plan', i => {
    const { sales, inventory } = stockCases[i];
    return {
      note: '単位　個',
      columns: ['', '生産計画', '販売計画', '在庫計画'],
      rows: sales.map((value, day) => [`4月${day + 1}日`, 'abcd'[day], thousands(value), thousands(inventory[day])]),
    };
  }),
] as const;
