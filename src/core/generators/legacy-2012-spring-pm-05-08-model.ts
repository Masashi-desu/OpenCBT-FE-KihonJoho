import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';

export const spring2012Pm0508Case = (values: number[]) => autumn2015PmCase(values, 3);

const schoolNames = ['東南高校', '東西高校', '西北高校', '南西高校', '北北学園', '南南学園'];
const currentCounts = [82, 80, 80, 73, 60, 60];
const previousCounts = [62, 96, 68, 64, 70, 0];
const codeDirections = ['昇順', '昇順', '降順', '降順'] as const;
const outputDirections = ['昇順', '降順', '昇順', '降順'] as const;
const previousDirections = ['降順', '降順', '降順', '昇順'] as const;
const currentShifts = [0, 3, 5, 7];
const previousShifts = [0, 2, 4, 6];

type School = { code: string; name: string; current: number; previous: number };
function ranked(rows: readonly School[], field: 'current' | 'previous') {
  const ranks = new Map<string, number>();
  let last = -1, rank = 0;
  rows.forEach((row, index) => {
    if (row[field] !== last) {
      rank = index + 1;
      last = row[field];
    }
    ranks.set(row.code, rank);
  });
  return ranks;
}

export function applicantModel(index: number) {
  const codeDirection = codeDirections[index], outputDirection = outputDirections[index], previousDirection = previousDirections[index];
  const exampleSchools = schoolNames.map((name, i) => ({
    code: 'S0' + (i + 1), name, current: currentCounts[i] + currentShifts[index],
    previous: previousCounts[i] ? previousCounts[i] + previousShifts[index] : 0,
  }));
  // One complete population consistent with the visible totals and prior-year ranks.
  // The paper shows only the top six schools and the remaining aggregate.
  const otherPrevious = [80, 63, 63, ...Array(51).fill(49), 18] as number[];
  const all = [...exampleSchools, ...otherPrevious.map((count, i) => ({
    code: 'T' + (i + 10), name: '非表示校' + (i + 1), current: i < 26 ? 49 : 48,
    previous: count + previousShifts[index],
  }))];
  const order = [...all].sort((left, right) =>
    right.current - left.current || (right.previous - left.previous) * (previousDirection === '降順' ? 1 : -1) ||
    left.code.localeCompare(right.code, 'en') * (outputDirection === '昇順' ? 1 : -1));
  const ranks = ranked(order, 'current');
  const priorRanks = ranked(all.filter(row => row.previous > 0).sort((left, right) => right.previous - left.previous), 'previous');
  const visible = order.filter(row => ranks.get(row.code)! <= 5);
  const remaining = order.filter(row => ranks.get(row.code)! > 5);
  const sum = (rows: readonly School[], field: 'current' | 'previous') => rows.reduce((total, row) => total + row[field], 0);
  const data = (extra: boolean) => [
    ...visible.map(row => [String(ranks.get(row.code)), row.name, String(row.current),
      ...(extra ? [String(priorRanks.get(row.code) ?? '')] : []), String(row.previous)]),
    ['', 'その他計', String(sum(remaining, 'current')), ...(extra ? [''] : []), String(sum(remaining, 'previous'))],
    ['', '合計', String(sum(order, 'current')), ...(extra ? [''] : []), String(sum(order, 'previous'))],
  ];
  return { codeDirection, outputDirection, previousDirection, all, data };
}

const plans = [[0,25,25],[20,40,40],[20,40,40],[20,40,40]] as const;
const progressCases = [
  { first: [0,25,20,15], remaining1: [50,75,80,85], remaining2: [20,35,45,40] },
  { first: [0,15,20,20], remaining1: [50,85,80,80], remaining2: [18,42,45,40] },
  { first: [0,20,15,25], remaining1: [50,80,85,75], remaining2: [23,43,46,34] },
  { first: [0,20,20,20], remaining1: [50,80,80,80], remaining2: [26,44,35,37] },
] as const;

export const sum = (items: readonly number[]) => items.reduce((total, item) => total + item, 0);
const round = (value: number, digits: number) => {
  const scale = 10 ** digits;
  return Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * scale) / scale;
};

export const members = ['A', 'B', 'C', 'D'] as const;

export function progressModel(index: number) {
  const c = progressCases[index];
  const individual = plans.map(([planned1, planned2, planned3], i) => ({
    plan: [planned1, planned2, planned3], total: planned1 + planned2 + planned3,
    actual: [c.first[i], c.first[i] + planned2], remaining: [c.remaining1[i], c.remaining2[i]],
  }));
  const team = {
    plan: [0, 1, 2].map(i => sum(individual.map(row => row.plan[i]))),
    total: sum(individual.map(row => row.total)),
    actual: [0, 1].map(i => sum(individual.map(row => row.actual[i]))),
    remaining: [0, 1].map(i => sum(individual.map(row => row.remaining[i]))),
  };
  const planned = (row: typeof team, week: number) => round(100 * sum(row.plan.slice(0, week + 1)) / row.total, 1);
  const actual = (row: typeof team, week: number) => round(100 * row.actual[week] / (row.actual[week] + row.remaining[week]), 1);
  const ratio = (row: typeof team, week: number) => round((row.actual[week] + row.remaining[week]) / row.total, 2);
  const records = [...individual, team];
  const planRows = records.map((row, i) => [i === 4 ? '合計' : 'UI設計' + (i + 1), members[i] ?? '',
    ...row.plan.flatMap((hours, week) => [String(hours), planned(row, week).toFixed(1)]), String(row.total)]);
  const actualRows = records.map((row, i) => [i === 4 ? '合計' : 'UI設計' + (i + 1), members[i] ?? '',
    String(row.total), ...[0, 1].flatMap(week => [String(row.actual[week]), String(row.remaining[week])])]);
  const delayed = [0, 1].map(week => members.filter((_, i) =>
    individual[i].actual[week] > 0 && actual(individual[i], week) < planned(individual[i], week)));
  const trend = [0, 1].map(week => Math.sign(actual(team, week) - planned(team, week)));
  const increased = individual.filter(row => ratio(row, 1) > ratio(row, 0)).length;
  const helper = members.filter((_, i) => individual[i].remaining[1] < individual[i].plan[2])
    .sort((left, right) => actual(individual[members.indexOf(right)], 1) - actual(individual[members.indexOf(left)], 1))[0];
  return {
    planRows, actualRows, individual, team, delayed, trend, increased, helper,
    planTeam: [0, 1].map(week => planned(team, week)),
    actualTeam: [0, 1].map(week => actual(team, week)),
    ratios: [0, 1].map(week => ratio(team, week)),
  };
}

export const investmentCases = [
  { lump: 750, early: 500, late: 300, discount: .08, extraCost: 50, extraSaving: 5 },
  { lump: 730, early: 520, late: 280, discount: .08, extraCost: 40, extraSaving: 15 },
  { lump: 740, early: 500, late: 300, discount: .08, extraCost: 65, extraSaving: 8 },
  { lump: 780, early: 520, late: 300, discount: .10, extraCost: 30, extraSaving: 12 },
] as const;

export function investmentModel(index: number) {
  const c = investmentCases[index];
  const years = Array.from({ length: 9 }, (_, i) => 2012 + i);
  const plans = [[c.lump, 0], [c.early, c.late]];
  const cash = (plan: number[], duration: number, withExtra = false) => years.map((_, i) => {
    const firstInvestment = plan[0] + (withExtra ? c.extraCost : 0);
    const investment = i === 0 ? firstInvestment : i === 3 ? plan[1] : 0;
    const depreciation = (i >= 1 && i <= duration ? firstInvestment / duration : 0)
      + (i >= 4 && i <= 3 + duration ? plan[1] / duration : 0);
    const saving = i === 0 ? 0 : (i < 4 ? 200 : 300) + (withExtra ? c.extraSaving : 0);
    const tax = round((saving - depreciation) * .4, 4);
    const afterTax = round(saving - tax, 4);
    const effect = round(afterTax - investment, 4);
    const pv = round(effect / (1 + c.discount) ** i, 1);
    return { investment, depreciation, saving, tax, afterTax, effect, pv };
  });
  const [lump, split] = plans.map(plan => cash(plan, 4));
  const [lumpLong, splitLong] = plans.map(plan => cash(plan, 5));
  const npv = (rows: typeof lump) => round(sum(rows.map(row => row.pv)), 1);
  return {
    ...c, years, lumpRows: lump, splitRows: split, longRows: lumpLong,
    addedLump: index === 0 ? 361.9 : npv(cash(plans[0], 4, true)),
    addedSplit: index === 0 ? 370 : npv(cash(plans[1], 4, true)),
    lumpNpv: npv(lump), splitNpv: npv(split), longNpv: [npv(lumpLong), npv(splitLong)],
  };
}

export const pvRound = (value: number) => round(value, 1);
export const money = (millions: number) => {
  const units = Math.round(millions * 100);
  const high = Math.floor(units / 10000);
  const low = units % 10000;
  return (high ? high + '億' : '') + (low ? low.toLocaleString('ja-JP') + '万' : '') + '円';
};

export const bitCases = [
  { samples: [['01010101','11100000'],['00110011','00010001']], two: [1,1,4,3,1,1,2], three: [1,1,2,1,3,2], trace: '01101010' },
  { samples: [['11000110','00111000'],['10101101','10000101']], two: [1,1,3,2,1,1,2], three: [2,1,2,1,3,2], trace: '11011010' },
  { samples: [['10010110','10011000'],['01001111','01000101']], two: [2,1,4,3,2,1,2], three: [1,1,3,1,3,2], trace: '01110100' },
  { samples: [['01011000','01100010'],['10011110','10000110']], two: [1,2,5,3,1,1,2], three: [1,2,2,2,2,2], trace: '10110100' },
] as const;
export const binary = (value: number) => (value & 255).toString(2).padStart(8, '0');
export const asBits = (value: string) => Number.parseInt(value, 2);

export function bitModel(index: number) {
  const c = bitCases[index], input = asBits(c.trace);
  const [load, zero, loop, branch, increment, shift, end] = c.two;
  const [load3, zero3, loop3, increment3, clear3, end3] = c.three;
  const min2 = load + zero + loop + 8 * (loop + branch + shift) + end;
  const min3 = load3 + zero3 + loop3 + end3;
  const first = input & (input - 1);
  const second = first & (first - 1);
  return { ...c, min2, max2: min2 + 8 * increment, min3, max3: min3 + 8 * (loop3 + increment3 + clear3),
    first: binary(first), second: binary(second) };
}
