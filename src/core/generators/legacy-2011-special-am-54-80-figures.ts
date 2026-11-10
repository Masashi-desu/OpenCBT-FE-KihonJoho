import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';
import { capacityCases, demandCases, inspectionCases, inventoryMovements, matrixCells, organizationCases, tariffFigures } from './legacy-2011-special-am-54-80-models';

export const formatNumber = (value: number) => value.toLocaleString('ja-JP');

function definition(number: number, suffix: string, buildAlt: (caseIndex: number) => string): BookletFigureDefinition {
  const profile = `legacy-2011-special-am-${number}-${suffix}`;
  function validate(values: number[]) {
    if (!Array.isArray(values) || values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > 3)
      throw new DataError('FIGURE_PROFILE', '2011年度特別試験旧午前の図表の入力が範囲外です');
  }
  return { profile, domain: [[0, 3]], validate, alt(values) { validate(values); return buildAlt(values[0]); } };
}

export const tariffChoiceFigures = [
  definition(57, 'tariff-a', index => tariffAlt(index, 0)),
  definition(57, 'tariff-i', index => tariffAlt(index, 1)),
  definition(57, 'tariff-u', index => tariffAlt(index, 2)),
  definition(57, 'tariff-e', index => tariffAlt(index, 3)),
] as const;

function tariffAlt(index: number, choice: number) {
  const curve = tariffFigures(index)[choice];
  return '縦軸は利用料金，横軸は使用量。原点の目盛は0。折れ線の節を左から相対位置（使用量，利用料金）で示す。'
    + curve.map(([x, y]) => `（${x}，${y}）`).join(' → ');
}

export const growthShareFigure = definition(65, 'growth-share', () =>
  '縦軸は市場成長率（下が低，上が高），横軸は市場占有率（左が小，右が大）。'
  + matrixCells.map(cell => `${cell.label}：成長率${cell.highGrowth ? '高' : '低'}，占有率${cell.highShare ? '大' : '小'}`).join('。'));

export function demandLines(index: number) {
  const { noDemandPrice, observedPrice, observedDemand, targetPrice } = demandCases[index];
  return [
    `（1）設定価格を${formatNumber(noDemandPrice)}円にすると，需要は0個になる。`,
    `（2）設定価格を${formatNumber(observedPrice)}円にすると，需要は${formatNumber(observedDemand)}個になる。`,
    `（3）設定価格を${formatNumber(targetPrice)}円にすると，需要は`,
  ];
}
export const demandFigure = definition(67, 'demand-conditions', index =>
  demandLines(index).join('\n') + '［a］個になる。');

export const capacityColumns = ['工程', '1個製造時間（時間）', '保有機械台数（台）', '生産能力（時間）'] as const;
export function capacityRows(index: number) {
  const { durationTenths, machines, hours } = capacityCases[index];
  return durationTenths.map((duration, i) => ['ABCD'[i], (duration / 10).toFixed(1), String(machines[i]), String(hours[i])]);
}
export const capacityFigure = definition(71, 'production-capacity', index => tableAlt(capacityColumns, capacityRows(index)));

export const organizationFigure = definition(73, 'organization', index => {
  const { nodes, links } = organizationCases[index];
  return nodes.filter(parent => links.some(([from]) => from === parent.id)).map(parent => {
    const children = links.filter(([from]) => from === parent.id).map(([, to]) => nodes.find(node => node.id === to)!.label);
    return `${parent.label}から${children.join('，')}へ指揮線。`;
  }).join('');
});

export const inspectionColumns = ['案', '良品に掛かる費用', '不良品に掛かる費用'] as const;
export function inspectionRows(index: number) {
  return inspectionCases[index].costs.map(([good, defect], i) => ['ABCD'[i], formatNumber(good), formatNumber(defect)]);
}
export const inspectionFigure = definition(75, 'inspection-cost', index => tableAlt(inspectionColumns, inspectionRows(index)));

export const inventoryColumns = ['日付', '摘要', '受入', '払出', '単価（円）'] as const;
export function inventoryRows(index: number) {
  return inventoryMovements(index).map(({ day, label, units, price }) =>
    [String(day), label, units > 0 ? String(units) : '', units < 0 ? String(-units) : '', price === null ? '／' : String(price)]);
}
export const inventoryFigure = definition(76, 'inventory-movements', index =>
  tableAlt(inventoryColumns, inventoryRows(index)).replace('受入｜払出', '受払個数・受入｜受払個数・払出'));

function tableAlt(columns: readonly string[], rows: readonly (readonly string[])[]) {
  return [columns.join('｜'), ...rows.map(row => row.join('｜'))].join('\n');
}

export const legacy2011SpecialAm5480Figures = [
  ...tariffChoiceFigures, growthShareFigure, demandFigure, capacityFigure, organizationFigure, inspectionFigure, inventoryFigure,
] as const;
