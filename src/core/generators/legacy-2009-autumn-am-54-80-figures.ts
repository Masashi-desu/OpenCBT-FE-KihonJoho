import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';

export const factoryCases = [
  { hours: 200, profits: [1800, 2500, 3000], minutes: [6, 10, 15], caps: [1000, 900, 500], options: [2625000, 3000000, 3150000, 3300000] },
  { hours: 180, profits: [1600, 3000, 3300], minutes: [6, 10, 15], caps: [1000, 600, 500], options: [2856000, 3080000, 3240000, 3400000] },
  { hours: 210, profits: [1800, 2400, 4800], minutes: [6, 10, 15], caps: [1000, 900, 400], options: [3384000, 3600000, 3864000, 4032000] },
  { hours: 180, profits: [1800, 2600, 4200], minutes: [6, 10, 15], caps: [800, 600, 600], options: [3000000, 3120000, 3240000, 3960000] },
];
export const products = ['製品X', '製品Y', '製品Z'] as const;
export const integerText = (n: number) => n.toLocaleString('en-US');
export function factoryRows(index: number) {
  const { profits, minutes, caps } = factoryCases[index];
  return [
    ['1個当たりの利益（円）', ...profits.map(integerText)],
    ['1個当たりの組立て所要時間（分）', ...minutes.map(integerText)],
    ['月間需要量上限（個）', ...caps.map(integerText)],
  ];
}

export const requirementsCases = [
  { shipment: 300, usage: [3, 2, 1, 2], stock: [100, 100, 300, 400], options: [200, 600, 900, 1500] },
  { shipment: 400, usage: [2, 1, 2, 1], stock: [100, 200, 400, 450], options: [300, 700, 1100, 1600] },
  { shipment: 350, usage: [2, 2, 2, 1], stock: [50, 100, 300, 450], options: [300, 700, 1300, 1600] },
  { shipment: 450, usage: [3, 1, 1, 2], stock: [150, 200, 400, 800], options: [600, 700, 1000, 1200] },
];
export const inventoryNames = ['A', 'a', 'b', 'c'] as const;
export function compositionRows(index: number) {
  const [aPerA, bPerA, bPerAComponent, cPerAComponent] = requirementsCases[index].usage;
  return [['A', aPerA, bPerA, ''], ['a', '', bPerAComponent, cPerAComponent]];
}

type Point = readonly [number, number];
const originalScatter: readonly Point[] = [
  [27, 121], [34, 109], [54, 101], [56, 87], [59, 117], [74, 112], [80, 97], [83, 77],
  [91, 103], [98, 120], [100, 70], [112, 90], [115, 109], [115, 55], [132, 113], [132, 80],
  [136, 66], [136, 49], [148, 35], [151, 87], [161, 74], [161, 55], [165, 103], [175, 79],
  [180, 44], [188, 83], [196, 64], [196, 32], [201, 54], [217, 60], [218, 22], [219, 46], [241, 24],
];
export const scatterCases: readonly (readonly Point[])[] = [
  originalScatter,
  [[28, 30], [39, 43], [51, 34], [60, 56], [68, 51], [74, 64], [78, 39], [87, 74], [100, 53], [109, 68],
    [114, 89], [125, 61], [127, 82], [145, 74], [148, 98], [151, 114], [166, 87], [169, 101], [184, 121],
    [193, 103], [210, 110], [218, 132], [231, 119], [242, 141]],
  [[28, 130], [35, 106], [44, 114], [52, 139], [61, 97], [70, 119], [80, 103], [94, 84], [102, 105], [107, 119],
    [113, 91], [123, 84], [134, 101], [145, 73], [153, 57], [162, 78], [177, 58], [184, 72], [199, 42], [209, 65],
    [220, 27], [232, 52], [240, 37]],
  [[27, 43], [35, 58], [48, 39], [55, 48], [68, 68], [74, 48], [89, 63], [99, 80], [108, 58], [118, 77],
    [132, 70], [140, 94], [147, 59], [154, 84], [163, 107], [172, 75], [180, 95], [191, 107], [202, 95],
    [216, 130], [224, 110], [234, 121], [240, 108]],
];

export type Company = 'A' | 'B' | 'C';
type Contract = { left: Company; right: Company; kind: '請負契約' } | {
  left: Company; right: Company; kind: '派遣契約'; employer: Company; client: Company;
};
export const contractCases: readonly { order: readonly [Company, Company, Company]; links: readonly [Contract, Contract]; }[] = [
  { order: ['A', 'B', 'C'], links: [
    { left: 'A', right: 'B', kind: '請負契約' },
    { left: 'B', right: 'C', kind: '派遣契約', employer: 'C', client: 'B' },
  ] },
  { order: ['A', 'B', 'C'], links: [
    { left: 'A', right: 'B', kind: '派遣契約', employer: 'B', client: 'A' },
    { left: 'B', right: 'C', kind: '請負契約' },
  ] },
  { order: ['A', 'B', 'C'], links: [
    { left: 'A', right: 'B', kind: '請負契約' },
    { left: 'B', right: 'C', kind: '請負契約' },
  ] },
  { order: ['B', 'A', 'C'], links: [
    { left: 'B', right: 'A', kind: '請負契約' },
    { left: 'A', right: 'C', kind: '派遣契約', employer: 'C', client: 'A' },
  ] },
];
export function contractDescription(index: number, link: Contract) {
  return index === 0 || link.kind === '請負契約'
    ? link.kind
    : link.kind + '（派遣元：' + link.employer + '社，派遣先：' + link.client + '社）';
}

const domain = [[0, 3]] as const;
function validate(values: number[]) {
  if (values.length !== 1 || !Number.isInteger(values[0]) || values[0] < 0 || values[0] > 3)
    throw new DataError('FIGURE_PROFILE', '2009年度秋期旧午前の図の入力値が範囲外です');
}

export const factoryFigure: BookletFigureDefinition = {
  profile: 'legacy-2009-autumn-am-72-factory-capacity', domain, validate,
  alt([index]) {
    return '製品別の組立て表。左から' + products.join('，') + '。'
      + factoryRows(index).map(([title, ...cells]) => title + '：' + cells.join('，') + '。').join('');
  },
};
export const requirementsFigure: BookletFigureDefinition = {
  profile: 'legacy-2009-autumn-am-73-parts-requirements', domain, validate,
  alt([index]) {
    const composition = compositionRows(index).map(([item, ...counts]) =>
      item + '：' + counts.map((count, part) => inventoryNames[part + 1] + (count === '' ? 'は空欄' : 'が' + count + '個')).join('，') + '。').join('');
    const inventory = requirementsCases[index].stock.map((count, item) => inventoryNames[item] + 'が' + count + '個').join('，');
    return '構成表（単位 個）。列は品名と構成部品a，b，c。' + composition + '在庫表（単位 個）。' + inventory + '。';
  },
};
export const scatterFigure: BookletFigureDefinition = {
  profile: 'legacy-2009-autumn-am-76-quality-scatter', domain, validate,
  alt([index]) {
    const pointRanges = [[], [], []] as number[][];
    for (const [x, y] of scatterCases[index]) pointRanges[x < 95 ? 0 : x < 175 ? 1 : 2].push(y);
    return '横軸x，縦軸y，原点0の散布図。目盛なし。'
      + pointRanges.map((ys, region) => ['左側', '中央', '右側'][region] + 'の'
        + ys.length + '点は，縦軸の表示範囲の下端からおよそ'
        + Math.round(Math.min(...ys) / 21) * 10 + '〜' + Math.round(Math.max(...ys) / 21) * 10 + '％の高さに分布する。').join('');
  },
};
export const contractFigure: BookletFigureDefinition = {
  profile: 'legacy-2009-autumn-am-80-contract-chain', domain, validate,
  alt([index]) {
    const { order, links } = contractCases[index];
    const companies = order.map(company => company + '社' + (company === 'A' ? '（発注元）' : ''));
    return '左から' + companies.join('，') + '。'
      + links.map(link => link.left + '社と' + link.right + '社は双方向の矢印で結ばれ，' + contractDescription(index, link) + '。').join('');
  },
};

export const legacy2009AutumnAm5480Figures = [
  factoryFigure, requirementsFigure, scatterFigure, contractFigure,
] as const;
