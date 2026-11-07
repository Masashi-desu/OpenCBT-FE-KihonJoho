import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import { autumn2015Pm0508Banks as banks, autumn2015Pm0508Source as source } from './legacy-2015-autumn-pm-05-08-source';
import {
  autumn2015Pm0508Body as body, autumn2015Pm0508Choices as choices, autumn2015Pm0508Figure as figure,
  autumn2015Pm0508Index as index, autumn2015Pm0508Prompt as prompt,
} from './legacy-2015-autumn-pm-05-08-shared';

const divisions = [...banks[7].ac];
const profiles = [
  { sales: [1800, 1000, 600, 500, 100], profits: [140, 120, 10, 40, -10], growth: [0, 5, 10, 0, 50],
    pProfit: 10, rProfit: 20, sMargin: 10, tDelta: 30, timing: [70, 20, 10], early: 70, late: 70 },
  { sales: [1800, 1000, 600, 500, 100], profits: [140, 120, 10, 40, -10], growth: [0, 10, 10, 0, 50],
    pProfit: 10, rProfit: 20, sMargin: 10, tDelta: 35, timing: [70, 20, 10], early: 80, late: 60 },
  { sales: [2000, 1000, 500, 600, 200], profits: [150, 100, 15, 45, -15], growth: [0, 5, 20, 0, 40],
    pProfit: 20, rProfit: 20, sMargin: 10, tDelta: 45, timing: [60, 25, 15], early: 70, late: 50 },
  { sales: [1600, 800, 400, 600, 200], profits: [130, 90, 20, 48, -10], growth: [0, 10, 15, 0, 60],
    pProfit: 20, rProfit: 10, sMargin: 10, tDelta: 30, timing: [75, 15, 10], early: 60, late: 60 },
] as const;
const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
const sourceOuterBoundaries = [[159,254,313,358], [156,246,304,347], [168,257,312,357], [168,252,303,347]];
const sourceInnerBoundaries = [162,252,306,351];
const roundedPercent = (numerator: number, denominator: number) =>
  Math.sign(numerator) * Math.floor((2 * Math.abs(numerator) * 1000 + denominator) / (2 * denominator)) / 10;
const percent = (n: number, d: number) => roundedPercent(n, d).toFixed(1).replace('-', '−');
const billions = (tenths: number) => (tenths / 10).toFixed(1).replace('-', '−');
const choiceIndex = (value: number[], max: number) => index(value, max);

export function autumn2015Pm7Model(values: number[]) {
  const profile = index(values, profiles.length), m = profiles[profile];
  const nextSales = m.sales.map((amount, i) => amount * (100 + m.growth[i]) / 100);
  const nextProfits = [
    m.profits[0] * (100 + m.pProfit) / 100,
    m.profits[1] * (100 + m.growth[1]) / 100,
    m.profits[2] * (100 + m.rProfit) / 100,
    nextSales[3] * m.sMargin / 100,
    m.profits[4] + m.tDelta,
  ];
  const total = sum(m.sales), nextTotal = sum(nextSales), profitTotal = sum(m.profits), nextProfitTotal = sum(nextProfits);
  const increments = nextSales.map((amount, i) => amount - m.sales[i]);
  const sorted = divisions.map((_, i) => i).sort((a, b) => nextProfits[b] - nextProfits[a]);
  const largestMargin = divisions.findIndex((_, i) =>
    nextProfits.every((p, j) => nextProfits[i] * nextSales[j] >= p * nextSales[i]));
  const [early, later, none] = m.timing;
  const paths = [early * m.early, early * (100 - m.early), later * m.late, later * (100 - m.late), none * 100];
  const full = paths[0], low40 = paths[3] + paths[4], low50 = paths[2] + low40;
  const probabilityConditions = [full > 5000, full >= 7000, full < 10000 - full, full < low40, full >= 2 * low50];
  const expectedFactor = sum(paths.map((probability, i) => probability * [100, 80, 50, 40, 0][i]));
  const delta = nextTotal - total;
  const expectedNumerator = total * 1000000 + delta * expectedFactor;
  const expectedBillions = Math.floor((expectedNumerator + 5000000) / 10000000);
  const numericBank = profile === 0 ? [...banks[7].f] : [
    total / 10, nextTotal / 10,
    Math.round((total * 10000 + delta * full) / 100000), Math.round((total + nextTotal) / 20),
    expectedBillions,
  ].sort((a, b) => a - b);
  if (probabilityConditions.filter(Boolean).length !== 1 || new Set(numericBank).size !== 5)
    throw new Error('PARAMETER_CONSTRAINT');
  return { ...m, profile, nextSales, nextProfits, total, nextTotal, profitTotal, nextProfitTotal, increments, sorted,
    largestIncrement: increments.indexOf(Math.max(...increments)), largestMargin, delta,
    paths, full, low40, low50, probabilityConditions, expectedFactor, expectedNumerator, expectedBillions, numericBank };
}

export function autumn2015Pm7Ring(values: number[]) {
  if (values.length !== 2) throw new Error('PARAMETER_CONSTRAINT');
  const m = autumn2015Pm7Model([values[0]]), choice = choiceIndex([values[1]], 4);
  const boundaries = (shares: readonly number[]) =>
    shares.slice(0, -1).map((_, i) => 360 * sum(shares.slice(0, i + 1)) / sum(shares));
  if (m.profile === 0) return { inner: sourceInnerBoundaries, outer: sourceOuterBoundaries[choice] };
  const outer = boundaries(m.nextSales);
  if (choice >= 2) outer[0] += 12;
  if (choice === 0 || choice === 2) outer[3] = 358;
  return { inner: boundaries(m.sales), outer };
}

export function autumn2015Pm7Pareto(values: number[]) {
  if (values.length !== 2) throw new Error('PARAMETER_CONSTRAINT');
  const m = autumn2015Pm7Model([values[0]]), choice = choiceIndex([values[1]], 4);
  const amounts = m.sorted.map(i => m.nextProfits[i]), labels = m.sorted.map(i => divisions[i]);
  if (choice >= 2) [labels[2], labels[3]] = [labels[3], labels[2]];
  const scaled = amounts.map(value => 100 * value / m.nextProfitTotal);
  const curveSource = choice % 2 === 0 ? [...amounts].reverse() : amounts;
  const cumulative = [0, ...curveSource.map((_, i) => 100 * sum(curveSource.slice(0, i + 1)) / m.nextProfitTotal)];
  return { labels, scaled, cumulative };
}

export function autumn2015Pm7Tree(values: number[]) {
  const m = autumn2015Pm7Model(values);
  const probability = [...m.timing, m.early, 100 - m.early, m.late, 100 - m.late, 100];
  return source['q7-f3'].branches.map((branch, i) => ({ ...branch, probabilityPercent: probability[i] }));
}

export function autumn2015Pm7Summary(values: number[]) {
  const m = autumn2015Pm7Model(values);
  const make = (sale: number, profit: number, total: number) => [String(sale / 10), percent(sale, total), billions(profit), percent(profit, sale)];
  const mask = [['', '', '網掛け', '網掛け'], ['網掛け', '網掛け', '', ''], ['網掛け', '網掛け', '', ''],
    ['', '', '網掛け', '網掛け'], ['網掛け', '網掛け', '', '']];
  const rows = divisions.map((name, i) => {
    const before = make(m.sales[i], m.profits[i], m.total);
    const after = make(m.nextSales[i], m.nextProfits[i], m.nextTotal).map((value, col) => mask[i][col] || value);
    return [name, ...before, ...after];
  });
  rows.push(['合計', ...make(m.total, m.profitTotal, m.total), ...make(m.nextTotal, m.nextProfitTotal, m.nextTotal)]);
  return rows;
}

const ringAlt = (model: ReturnType<typeof autumn2015Pm7Ring>) =>
  '真上から時計回りにP灰色、Q縦線、R点、S黒、T白。境界角度の目安。2015年度の内円：' +
  model.inner.map(Math.round).join('、') + '度。2016年度の外円：' + model.outer.map(Math.round).join('、') + '度。';
const paretoAlt = (model: ReturnType<typeof autumn2015Pm7Pareto>) =>
  '縦軸0〜100%。横軸は左から' + model.labels.join('、') + '。棒の高さは約' +
  model.scaled.map(Math.round).join('、') + '%。各棒の右端の折れ線の高さは約' +
  model.cumulative.slice(1).map(Math.round).join('、') + '%。';

function build(values: number[]) {
  const m = autumn2015Pm7Model(values), growth = (i: number) => m.growth[i] ? m.growth[i] + '%増加' : '影響なし';
  const profits = ['営業利益を' + m.pProfit + '%増加', '営業利益率を維持', '営業利益を' + m.rProfit + '%増加',
    '営業利益率を' + m.sMargin + '%に引上げ', '営業利益を' + m.tDelta / 10 + '億円増加'];
  return body(prompt(7, values, id => {
    switch (id) {
      case 'q7-t1': return table(source[id].caption + '（単位：億円）', [...source[id].columns],
        [...divisions.map((name, i) => [name, String(m.sales[i] / 10), String(m.profits[i] / 10).replace('-', '−')]),
          ['合計', String(m.total / 10), String(m.profitTotal / 10)]]);
      case 'q7-t2': return table(source[id].caption, [...source[id].columns], divisions.map((name, i) => [name, growth(i), profits[i]]));
      case 'q7-t3': return figure(7, 'sales-summary', values, source[id].caption, '2015・2016年度について売上高、構成比、営業利益、営業利益率。' +
        autumn2015Pm7Summary(values).map(row => row.join('、')).join('。') + '。網掛け部分は非表示。');
      case 'q7-f1': return figure(7, 'ring-blank', values, source[id].caption, '空欄b。P灰色、Q縦線、R点、S黒、T白の凡例。');
      case 'q7-f2': return figure(7, 'pareto-blank', values, source[id].caption, '営業利益のパレート図が入る空欄d。');
      case 'q7-f3': return figure(7, 'decision-tree', values, source[id].caption,
        '左の機会事象から早期・下半期・未稼働の3枝。' + autumn2015Pm7Tree(values).map(branch =>
          branch.source + '→' + branch.target + '：' + branch.probabilityPercent + '%、' + branch.label).join('。') +
          '。白丸は機会事象ノード、黒丸は終端ノード。');
      default: throw new Error('SOURCE_FORMAT');
    }
  }, text => text.replace('16億円を期待', m.delta / 10 + '億円を期待')), [
    { id: 'ac', choices: choices(banks[7].ac) },
    { id: 'b', choices: Array.from({ length: 4 }, (_, i) => {
      const args = [...values, i];
      return [figure(7, 'ring-choice', args, '売上高の事業部構成比', ringAlt(autumn2015Pm7Ring(args)))];
    }) },
    { id: 'd', choices: Array.from({ length: 4 }, (_, i) => {
      const args = [...values, i];
      return [figure(7, 'pareto-choice', args, '営業利益のパレート図', paretoAlt(autumn2015Pm7Pareto(args)))];
    }) },
    { id: 'e', choices: choices(banks[7].e) }, { id: 'f', choices: choices(m.numericBank) },
  ], [
    { id: 'a', bank: 'ac', correct: m.largestIncrement }, { id: 'b', bank: 'b', correct: 1 },
    { id: 'c', bank: 'ac', correct: m.largestMargin }, { id: 'd', bank: 'd', correct: 1 },
    { id: 'e', bank: 'e', correct: m.probabilityConditions.indexOf(true) },
    { id: 'f', bank: 'f', correct: m.numericBank.indexOf(m.expectedBillions) },
  ],
  '売上高の増加額（P〜Tの順）は' + m.increments.map(n => n / 10).join('，') + '億円で，最大は' + divisions[m.largestIncrement] +
  '事業部。構成比は各年の売上高合計で各部門の売上高を割る。内側は2015年度，外側は2016年度で，Pの灰色とTの白色も実際の割合で比較する。' +
  '営業利益率は各部門の営業利益÷売上高であり，最大は' + divisions[m.largestMargin] + '事業部の' +
  percent(m.nextProfits[m.largestMargin], m.nextSales[m.largestMargin]) + '%。パレート図では利益額の大きい' +
  m.sorted.map(i => divisions[i]).join('，') + 'の順で棒を並べ，各棒までの左からの累積割合を折れ線にする。' +
  '予定どおりの稼働と効果の両方が成立する確率は' + m.timing[0] + '%×' + m.early + '%＝' + m.full / 100 +
  '%。期待どおりにならない確率は' + (10000 - m.full) / 100 + '%，効果40%以下は' + m.low40 / 100 +
  '%，50%以下は' + m.low50 / 100 + '%。5本の経路の確率に効果割合を掛けて合計すると実現度の期待値は' +
  m.expectedFactor / 10000 + '%。これは売上高全体ではなく増加分' + m.delta / 10 + '億円に掛ける。2015年度の' +
  m.total / 10 + '億円を足すと' + m.expectedNumerator / 10000000 + '億円となり，千万円の位を四捨五入して' +
  m.expectedBillions + '億円。');
}

export const legacy2015AutumnPm7Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-7', title: '新システム稼働による業績改善',
  version: '3.7.0', reference: [0], fields: [field('部門の業績と決定木の条件', 0, profiles.length - 1)],
  sourceAnswer: 'ウ／イ／オ／イ／ウ／オ',
  notes: '物理p29–33、6欄。a/c共有5択、二重円図bとパレート図dは各4択、e/f各5択。営業利益と売上・構成比、網掛け、年度内外、○/●、千万円の位で丸めることを保持。4条件で事業部の売上・利益・稼働確率を変更。図は塗り分けと誤答のP過大/T過小、逆累積・S/T相当ラベルの誤りを保持。原の図に数値ラベルがないため各原円弧を読み取った範囲で再作図する。確率5命題は一意性を検算し、収益は億円の小数第1位単位、確率は整数の積で計算。',
  publicNotes: '部門別の売上・営業利益とシステム稼働の確率を変更し，表・グラフ・決定木・正答を同じ条件で更新しました。',
  build,
};
