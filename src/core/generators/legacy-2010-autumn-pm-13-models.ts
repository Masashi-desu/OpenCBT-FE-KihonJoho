import { languageFigure, type LanguageTable } from './legacy-2010-autumn-pm-09-13-support';

export const marketCases = [
  { market: [480, 90], brand: 1, proposal: 1 },
  { market: [420, 80], brand: 0, proposal: 2 },
  { market: [500, 100], brand: 1, proposal: 3 },
  { market: [450, 120], brand: 0, proposal: 1 },
] as const;
export const currentPrices = [600, 800];
export const currentDesire = [0.25, 0.30];
export const priceGrid = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
export const desireGrid = [[35, 30, 25, 20, 14, 9, 4, 2, 0], [28, 33, 35, 33, 30, 29, 25, 20, 18]];
export const currentVolumes = [600, 500];
export const fixedCosts = [15000, 7000];
export const unitMaterials = [0.350, 0.600];
export const unitContainers = [40, 50];
export const administrativeRates = [0.10, 0.20];
export const volumeDeltas = [0, 100, 0, -100];
export const priceDeltas = [0, 200, 100, 0];
export const proposedDesires = [[0.25, 0.15, 0.20, 0.24], [0.30, 0.33, 0.29, 0.27]];
export const advertisingCosts = [150, 300, 500, 1000, 1500, 2000];
export const advertisingEffects = [0.03, 0.05, 0.10, 0.13, 0.16, 0.20];

export const rounded = (value: number, digits = 0) => Math.round((value + Number.EPSILON) * 10 ** digits) / 10 ** digits;
export const format = (value: number, digits = 0) => value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
const percent = (value: number) => Math.round(rounded(value, 2) * 100) + '%';
const headers = (last: number) => ['', ...'ABCDEFGHI'.slice(0, last)];
const sheetRow = (row: number, values: readonly (string | number)[]) => [String(row), ...values.map(String)];

export function proposalResults(index: number, brand: number, proposal: number, advertisingRate = 0, advertisingCost = 0) {
  const capacity = currentVolumes[brand] + volumeDeltas[proposal];
  const price = currentPrices[brand] + priceDeltas[proposal];
  const desire = proposedDesires[brand][proposal] * (1 + advertisingRate);
  const quantity = marketCases[index].market[brand] * desire;
  const revenue = price * quantity;
  const variable = (unitMaterials[brand] * capacity + unitContainers[brand]) * quantity;
  const profit = revenue - variable - fixedCosts[brand] - revenue * administrativeRates[brand] - advertisingCost;
  return { capacity, price, desire, quantity, revenue, variable, profit };
}

export function elasticityTable(): LanguageTable {
  const rows = [
    sheetRow(1, ['ブランド', '普及品', '高級品', '', '']),
    sheetRow(2, ['現行価格（円）', 600, 800, '', '']),
    sheetRow(3, ['購入意向率', '25%', '30%', '', '']),
    sheetRow(4, ['', '', '', '', '']),
    sheetRow(5, ['', '購入意向率', '', '価格弾力性', '']),
    sheetRow(6, ['価格（円）', '普及品', '高級品', '普及品', '高級品']),
    ...priceGrid.map((price, i) => sheetRow(i + 7, [format(price), desireGrid[0][i] + '%', desireGrid[1][i] + '%', ...[0, 1].map(brand =>
      price === currentPrices[brand] ? '−' : percent(-((desireGrid[brand][i] / 100 - currentDesire[brand]) / currentDesire[brand]) / ((price - currentPrices[brand]) / currentPrices[brand])))])),
  ];
  return { headers: headers(5), rows, merges: [{ row: 4, column: 2, rowSpan: 1, colSpan: 2 }, { row: 4, column: 4, rowSpan: 1, colSpan: 2 },
    { row: 0, column: 4, rowSpan: 4, colSpan: 2 }] };
}

export function proposalTable(index: number): LanguageTable {
  const parameterNames = ['容量（ml）', '価格（円）', '市場規模（百万本）', '製造固定費（百万円）', '原料単価（円／ml）', '容器単価（円／本）', '販売管理費比率'];
  const parameters = [currentVolumes, currentPrices, marketCases[index].market, fixedCosts, unitMaterials, unitContainers, administrativeRates];
  const rows = [
    sheetRow(1, ['ブランド', '普及品', '高級品', '', '案', '容量差\n（ml）', '価格差\n（円）', '', '列位置']),
    ...parameters.map((pair, i) => sheetRow(i + 2, [parameterNames[i], ...pair.map(value => i === 6 ? percent(value) : i === 4 ? format(value, 3) : format(value)), '',
      i < 4 ? '案' + (i + 1) : '', i < 4 ? volumeDeltas[i] : '', i < 4 ? priceDeltas[i] : '', '', i < 2 ? i + 2 : ''])),
    sheetRow(9, ['ブランド', ...Array(4).fill('普及品'), ...Array(4).fill('高級品')]),
    sheetRow(10, ['案', ...Array.from({ length: 8 }, (_, i) => '案' + (i % 4 + 1))]),
  ];
  const data = [0, 1].flatMap(brand => [0, 1, 2, 3].map(proposal => proposalResults(index, brand, proposal)));
  const measures: (keyof (typeof data)[number])[] = ['capacity', 'price', 'desire', 'quantity', 'revenue', 'variable', 'profit'];
  rows.push(...['容量（ml）', '価格（円）', '購入意向率', '売上数量（百万本）', '売上金額（百万円）', '製造変動費（百万円）', '利益（百万円）'].map((name, i) =>
    sheetRow(i + 11, [name, ...data.map(item => i === 2 ? percent(item.desire) : format(rounded(item[measures[i]], i === 3 ? 1 : 0), i === 3 && item.quantity % 1 ? 1 : 0))])));
  return { headers: headers(9), rows, merges: [
    { row: 0, column: 4, rowSpan: 8, colSpan: 1 },
    { row: 0, column: 8, rowSpan: 8, colSpan: 1 },
    { row: 5, column: 5, rowSpan: 3, colSpan: 3 },
    { row: 3, column: 9, rowSpan: 5, colSpan: 1 },
  ] };
}

export function advertisingTable(index: number): LanguageTable {
  const { brand, proposal } = marketCases[index];
  const data = advertisingEffects.map((rate, i) => proposalResults(index, brand, proposal, rate, advertisingCosts[i]));
  return { headers: headers(7), rows: [
    sheetRow(1, ['ブランド', brand ? '高級品' : '普及品', '', '', '', '', '']),
    sheetRow(2, ['案', '案' + (proposal + 1), '', '', '', '', '']),
    sheetRow(3, ['広告費（百万円）', ...advertisingCosts.map(value => format(value))]),
    sheetRow(4, ['広告効果率', ...advertisingEffects.map(percent)]),
    sheetRow(5, ['広告実施後の購入意向率', ...data.map(item => percent(item.desire))]),
    sheetRow(6, ['売上数量（百万本）', ...data.map(item => format(rounded(item.quantity, 3), 3))]),
    sheetRow(7, ['売上金額（百万円）', ...data.map(item => format(rounded(item.revenue)))]),
    sheetRow(8, ['製造変動費（百万円）', ...data.map(item => format(rounded(item.variable)))]),
    sheetRow(9, ['利益（百万円）', ...data.map(item => format(rounded(item.profit)))]),
  ] };
}

const analysis = languageFigure(13, 'elasticity-sheet', '図1 ワークシート“価格弾力性分析”', () => ({
  kind: 'tables', tables: [elasticityTable()],
  note: '購入意向率及び価格弾力性は，小数第3位を四捨五入した値を百分率で表示している。',
}));
const proposals = languageFigure(13, 'proposal-sheet', '図2 ワークシート“値上”', index => ({
  kind: 'tables', tables: [proposalTable(index)],
  note: '販売管理費比率及び購入意向率は，小数第3位を四捨五入した値を百分率で表示している。',
}));
const advertising = languageFigure(13, 'advertising-sheet', '図3 ワークシート“広告”', index => ({
  kind: 'tables', tables: [advertisingTable(index)],
  note: '広告効果率及び広告実施後の購入意向率は，小数第3位を四捨五入した値を百分率で表示している。売上数量は，小数第4位を四捨五入した結果を，売上金額，製造変動費及び利益は，小数第1位を四捨五入した結果を表示している。',
}));
const effects = languageFigure(13, 'advertising-effect-table', '表2 広告費ごとの広告効果率', () => ({
  kind: 'tables', tables: [{ headers: ['広告費（百万円）', '広告効果率（％）'], rows: advertisingCosts.map((cost, i) => [format(cost), String(100 * advertisingEffects[i])]) }],
}));
const functionDescription = (vertical: boolean) => vertical
  ? '照合範囲が指す範囲の最左端列を上から下に走査し，照合値と等しい値をもつセルが現れる最初の行を探す。次に，その行内で照合範囲の最左端列から数えた列位置を1，2，3，…とし，指定された列位置のセルの値を関数値として返す。'
  : '照合範囲が指す範囲の最上端行を左から右に走査し，照合値と等しい値をもつセルが現れる最初の列を探す。その列内で照合範囲の最上端行から数えた行位置を1，2，3，…とし，指定された行位置のセルの値を関数値として返す。';
const vertical = languageFigure(13, 'vertical-function', '表1 ワークシート“値上”で用いる関数', () => ({
  kind: 'tables', tables: [{ headers: ['書式', '説明'], rows: [['垂直照合（照合値，\n照合範囲，列位置）', functionDescription(true)]] }],
}));
const horizontal = languageFigure(13, 'horizontal-function', '表3 ワークシート“広告”で用いる関数', () => ({
  kind: 'tables', tables: [{ headers: ['書式', '説明'], rows: [['水平照合（照合値，\n照合範囲，行位置）', functionDescription(false)]] }],
}));
const formula = (suffix: string, caption: string, line: string) => languageFigure(13, suffix, caption, () => ({
  kind: 'formulas', lines: [line],
}));
const proposalFormulas = [
  formula('proposal-lookup', 'セルB11に入力する計算式', 'IF(B$9=$B$1,$B2+垂直照合(［d］),$C2+垂直照合(［d］))'),
  formula('proposal-quantity', 'セルB14に入力する計算式', 'IF(B9=$B1,［e］,［網掛け］)'),
  formula('proposal-variable', 'セルB16に入力する計算式', 'IF(B9=$B1,［網掛け］,［f］)'),
  formula('proposal-profit', 'セルB17に入力する計算式', 'IF(B9=$B1,［g］,［網掛け］)'),
];
const advertisingFormulas = [
  formula('advertising-desire', 'セルB5に入力する計算式', '［h］'),
  formula('advertising-variable', 'セルB8に入力する計算式', 'IF($B1=値上!$B1,［i］,［網掛け］)'),
];
export const autumn2010Pm13Figures = [analysis, proposals, advertising, effects, vertical, horizontal, ...proposalFormulas, ...advertisingFormulas];
export const autumn2010Pm13Panels = { analysis, proposals, advertising, effects, vertical, horizontal, proposalFormulas, advertisingFormulas };
