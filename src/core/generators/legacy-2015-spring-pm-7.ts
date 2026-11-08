import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field } from './definition';
import { spring2015Pm0508Banks as banks, spring2015Pm0508Source as source } from './legacy-2015-spring-pm-05-08-source';
import {
  spring2015Pm0508Body as body, spring2015Pm0508Choices as choices, spring2015Pm0508Figure as figure,
  spring2015Pm0508Index as index, spring2015Pm0508Prompt as prompt, spring2015PmNumber as format,
} from './legacy-2015-spring-pm-05-08-shared';

const cases = [
  { aStart: 15000, aRevised: 14500, aEffect: 5000, bExtra: 4000, bRevised: 3100 },
  { aStart: 15000, aRevised: 14500, aEffect: 5000, bExtra: 4000, bRevised: 1800 },
  { aStart: 15000, aRevised: 14500, aEffect: 5000, bExtra: 3400, bRevised: 3000 },
  { aStart: 15500, aRevised: 14900, aEffect: 5100, bExtra: 3900, bRevised: 3000 },
] as const;
export const spring2015Pm7DiscountHundredths = [100, 91, 83, 75, 68, 62] as const;
const analysisFee = 100;
const years = source['q7-flow'].years;
type CashFlow = { out: number[]; in: (number | null)[]; flow: number[] };
type Present = CashFlow & { pvHundredths: number[] };
const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
const cashFlow = (out: number[], income: (number | null)[]): CashFlow =>
  ({ out, in: income, flow: out.map((cost, i) => (income[i] ?? 0) - cost) });
function planA(initial: number, effect: number) {
  return cashFlow([initial, 800, 800, 800, 800, 800], [null, effect, effect, effect, effect, effect]);
}
function planB(extra: number, fee = 0) {
  return cashFlow([10000 + fee, 600, 600, 600 + extra, 800, 800], [null, 3700, 3700, 3700, 5000, 5000]);
}
function payback({ flow }: CashFlow) {
  let cumulative = 0;
  return flow.findIndex(amount => (cumulative += amount) > 0);
}
function present(flow: CashFlow): Present {
  return { ...flow, pvHundredths: flow.flow.map((amount, i) => amount * spring2015Pm7DiscountHundredths[i]) };
}
export function spring2015Pm7Round(hundredths: number) {
  const magnitude = Math.floor((Math.abs(hundredths) + 50) / 100);
  return hundredths < 0 && magnitude !== 0 ? -magnitude : magnitude;
}
const npv = (value: Present) => spring2015Pm7Round(sum(value.pvHundredths));

export function spring2015Pm7Model(values: number[]) {
  const profile = index(values, cases.length), c = cases[profile];
  const a = planA(c.aStart, c.aEffect), b = planB(c.bExtra);
  const recoverA = payback(a), recoverB = payback(b);
  const beforeA = present(planA(c.aStart + analysisFee, c.aEffect)), beforeB = present(planB(c.bExtra, analysisFee));
  const afterA = present(planA(c.aRevised + analysisFee, c.aEffect)), afterB = present(planB(c.bRevised, analysisFee));
  const npvs = { beforeA: npv(beforeA), beforeB: npv(beforeB), afterA: npv(afterA), afterB: npv(afterB) };
  const cdBank = [npvs.beforeB, npvs.afterB, npvs.afterA, npvs.afterA + analysisFee].sort((a, b) => a - b);
  if (new Set(cdBank).size !== 4 || npvs.beforeA <= npvs.beforeB || !banks[7].a.includes(recoverB as 3 | 4 | 5 | 6))
    throw new Error('PARAMETER_CONSTRAINT');
  return {
    ...c, a, b, recoverA, recoverB, beforeA, beforeB, afterA, afterB, npvs, cdBank,
    paybackChoice: recoverB > recoverA ? 0 : recoverB < recoverA ? 3 : 4,
    npvChoice: npvs.afterA > npvs.afterB ? 0 : npvs.afterA < npvs.afterB ? 2 : 1,
  };
}

export function spring2015Pm7Outline(values: number[]) {
  const m = spring2015Pm7Model(values);
  return [
    ['投資額', '初期開発費', '（平成27年度に発生） ' + format(m.aStart), '（平成27年度に発生） 10,000'],
    ['投資額', '追加開発費', '0', '（平成30年度に発生） ' + format(m.bExtra)],
    ['投資額', '年間運用費', '（平成28〜32年度） 800', '（平成28〜30年度） 600\n（平成31，32年度） 800'],
    ['効果額', '各年度での効果額', '（平成28〜32年度） ' + format(m.aEffect), '（平成28〜30年度） 3,700\n（平成31，32年度） 5,000'],
  ];
}

export const spring2015Pm7YearLabels = years.map((year, i) => '平成' + year + '年度（' + (i === 0 ? '現在' : i + '年目') + '）');
export const spring2015Pm7FlowLabels = ['キャッシュアウト', 'キャッシュイン', 'キャッシュフロー', 'キャッシュフローの現在価値'];
export const spring2015Pm7Display = (value: number | string | null) =>
  value === null ? '' : typeof value === 'string' ? value : format(value).replace('-', '−');

export function spring2015Pm7DisplayFlows(values: number[], includePresent: boolean) {
  const m = spring2015Pm7Model(values);
  return (includePresent ? [m.beforeA, m.beforeB] : [m.a, m.b]).map(plan => {
    const rows: (readonly (number | string | null)[])[] = [plan.out, plan.in, plan.flow];
    if ('pvHundredths' in plan)
      rows.push((plan as Present).pvHundredths.map((value, i) => i === 2 || i === 3 ? '網掛け' : value / 100));
    return rows;
  });
}

function flowsAlt(values: number[], withPresent: boolean) {
  return '単位は万円。列は' + spring2015Pm7YearLabels.join('，') + '。' +
    spring2015Pm7DisplayFlows(values, withPresent).map((rows, i) => (i === 0 ? 'A' : 'B') + '案。' +
      rows.map((row, j) => spring2015Pm7FlowLabels[j] + '：' +
        row.map(value => spring2015Pm7Display(value) || '空欄').join('，')).join('。')).join('。') +
    (withPresent ? '。注記　網掛けは表示していない。' : '。');
}

function build(values: number[]) {
  const m = spring2015Pm7Model(values);
  const blocks = prompt(7, values, id => {
    if (id === 'q7-outline') return figure(7, 'outline', values, source[id].caption, '単位は万円。A案とB案。' +
      spring2015Pm7Outline(values).map(row => row.join('／')).join('。') + '。');
    if (id === 'q7-flow') return figure(7, 'flow', values, source[id].caption, flowsAlt(values, false));
    if (id === 'q7-pv') return figure(7, 'pv', values, source[id].caption, flowsAlt(values, true));
    throw new Error('SOURCE_FORMAT');
  }, text => text.replace('A案の投資回収期間は4年', 'A案の投資回収期間は' + m.recoverA + '年')
    .replace('A案のNPVが818万円', 'A案のNPVが' + format(m.npvs.beforeA) + '万円')
    .replace('初期開発費は14,500万円', '初期開発費は' + format(m.aRevised) + '万円')
    .replace('追加開発費は3,100万円', '追加開発費は' + format(m.bRevised) + '万円')
    .replace('B案のNPVは754万円', 'B案のNPVは' + format(m.npvs.afterB) + '万円'));
  const totalByYear = ({ flow }: CashFlow) => flow.map((_, i) => spring2015Pm7Display(sum(flow.slice(0, i + 1)))).join('，');
  return body(blocks, [
    { id: 'a', choices: choices(banks[7].a) }, { id: 'b', choices: choices(banks[7].b) },
    { id: 'cd', choices: choices(m.cdBank.map(format)) }, { id: 'e', choices: choices(banks[7].e) },
  ], [
    { id: 'a', bank: 'a', correct: banks[7].a.indexOf(m.recoverB as 3 | 4 | 5 | 6) },
    { id: 'b', bank: 'b', correct: m.paybackChoice },
    { id: 'c', bank: 'cd', correct: m.cdBank.indexOf(m.npvs.beforeB) },
    { id: 'd', bank: 'cd', correct: m.cdBank.indexOf(m.npvs.afterA) },
    { id: 'e', bank: 'e', correct: m.npvChoice },
  ],
  '年度末ごとの累計額（現在から5年目まで）はA案が' + totalByYear(m.a) + '万円，B案が' + totalByYear(m.b) +
  '万円。最初にプラスになるのはA案' + m.recoverA + '年目，B案' + m.recoverB + '年目なので，' +
  banks[7].b[m.paybackChoice] + '。NPVには両案の現在の要求分析費100万円を含める。' +
  '指定の現在価値係数を各年のフローに掛けてから合計し，千円の位を四捨五入する。要求分析結果の反映前はA案' +
  format(m.npvs.beforeA) + '万円，B案' + format(m.npvs.beforeB) + '万円である。反映後はA案の初期開発費を' + format(m.aRevised) +
  '万円に，B案の3年目の追加開発費を' + format(m.bRevised) + '万円に置き換える。' +
  'A案のNPVは' + format(m.npvs.afterA) + '万円，B案は' + format(m.npvs.afterB) + '万円なので，' + banks[7].e[m.npvChoice] + '。');
}

export const legacy2015SpringPm7Definition: AfternoonBookletDefinition = {
  source: '2015h27h-fe-pm-7', title: 'システム開発の投資評価',
  version: '3.7.0', reference: [0], fields: [field('初期・追加開発費と要求分析後の見積り', 0, cases.length - 1)],
  sourceAnswer: 'ウ／ア／ア／ウ／ア',
  notes: '物理33–36／冊子32–35。a/b/eは別の解答群、c/dは解答群を共有。5年・年度末・累計が厳密にプラス・分析費100・10%の原指定係数を保持。正確な10%の累乗で係数を置き換えず、百倍整数で現在価値を総和して最後に万円へ丸める。2/3年目の現在価値は表示しない。4条件で回収の同年と反映後の採用逆転を含め、表示値・全択の衝突を独立検算する。',
  publicNotes: '初期・追加開発費と要求分析後の見積りを変更し，投資回収期間，正味現在価値，採用案を同じ条件から求めます。',
  build,
};
