export type Policy = readonly [key: string, start: string, end: string, premium: number, insured: number, employee: string, maturity: string];
type Event = readonly [key: string, kind: '新契約' | '減額' | '増額' | '終了', premium: number, insured: number | '', employee: string, maturity: string];
const date = '2013/04/30';
const newMaturity = '2022/12/29';
const employeeA = 'A00001';
const employeeB = 'B00001';
export const spring2013Pm5Employees = [employeeA, employeeB];
export const spring2013Pm5Date = date;

const policyKey = (number: number) => String(4157000 + number).padStart(10, '0');
const master: readonly Policy[] = [
  [policyKey(1), '2012/12/01', '2013/03/31', 0, 1000000, employeeB, '2022/07/31'],
  [policyKey(2), '2013/01/04', '', 25000, 6000000, employeeB, '2022/09/03'],
  [policyKey(3), '2013/01/15', '', 45000, 10000000, employeeA, '2022/09/14'],
  [policyKey(4), '2013/02/01', '', 8000, 2000000, employeeA, '2022/09/30'],
  [policyKey(5), '2013/02/15', '', 15000, 3000000, employeeB, '2022/10/14'],
  [policyKey(6), '2013/02/24', '', 24000, 5500000, employeeA, '2022/10/23'],
  [policyKey(7), '2013/03/01', '', 42000, 8000000, employeeA, '2022/10/31'],
  [policyKey(8), '2013/03/15', '', 3000, 1000000, employeeB, '2022/11/14'],
  [policyKey(9), '2013/03/29', '', 30000, 7000000, employeeA, '2022/11/28'],
];
const changes: readonly Event[] = [
  [policyKey(10), '新契約', 30000, 7000000, employeeA, newMaturity],
  [policyKey(11), '新契約', 20000, 4000000, employeeA, newMaturity],
  [policyKey(12), '新契約', 10000, 2500000, employeeB, newMaturity],
  [policyKey(6), '減額', 22000, 5000000, '', ''],
  [policyKey(7), '増額', 50000, 12000000, '', ''],
  [policyKey(9), '増額', 40000, 8000000, '', ''],
  [policyKey(2), '終了', 0, '', '', ''],
  [policyKey(3), '終了', 0, '', '', ''],
];
export function spring2013Pm5Input(variant: number) {
  const noFebruaryA = variant === 1 || variant === 4 || variant === 5;
  const noMarchB = variant === 2 || variant === 5;
  const higherPremiumB = variant === 3 || variant === 4;
  const policies = master.map((row, i): Policy => {
    const [key, start, end, premium, insured, employee, maturity] = row;
    const changedStart = noFebruaryA && i === 3 ? '2013/01/21'
      : noFebruaryA && i === 5 ? '2013/03/01'
        : noMarchB && i === 7 ? '2013/04/01' : noMarchB && i === 8 ? '2013/04/03' : start;
    return [key, changedStart, end, premium, insured, employee, maturity];
  });
  const events = changes.map((row, i): Event => i === 2 && higherPremiumB
    ? [row[0], row[1], 35000, row[3], row[4], row[5]] : row);
  return { policies, events };
}
export function spring2013Pm5Updated(variant: number): Policy[] {
  const { policies, events } = spring2013Pm5Input(variant);
  const daily = [...events].sort(([a], [b]) => a.localeCompare(b));
  let oldIndex = 0, dailyIndex = 0;
  const updated: Policy[] = [];
  while (oldIndex < policies.length || dailyIndex < daily.length) {
    const old = policies[oldIndex], change = daily[dailyIndex];
    if (!change || old && old[0] < change[0]) {
      updated.push(old);
      oldIndex++;
    } else if (!old || change[0] < old[0]) {
      const [key, , premium, insured, employee, maturity] = change;
      if (change[1] !== '新契約' || insured === '') throw Error('PARAMETER_CONSTRAINT');
      updated.push([key, date, '', premium, insured, employee, maturity]);
      dailyIndex++;
    } else {
      const [key, kind, premium, insured] = change;
      updated.push([key, old[1], kind === '終了' ? date : old[2], premium, insured === '' ? old[4] : insured, old[5], old[6]]);
      oldIndex++;
      dailyIndex++;
    }
  }
  return updated;
}
export function spring2013Pm5Payroll(variant: number) {
  const updated = spring2013Pm5Updated(variant);
  return spring2013Pm5Employees.map(employee => {
    const active = updated.filter(row => row[2] === '' && row[5] === employee);
    const months = [...new Set(updated.filter(row => row[5] === employee).map(row => row[1].slice(0, 7)))].sort();
    const continuous = ['2013/02', '2013/03', '2013/04'].every(month => months.includes(month));
    const premium = active.reduce((sum, row) => sum + row[3], 0);
    const base = Math.floor(active.length / 5) * 10000 + Math.floor(premium / 50000) * 5000;
    return { employee, active: active.length, premium, months, continuous, base, paid: continuous ? base ? base * 6 / 5 : 5000 : base };
  });
}

type TeamRecord = readonly [size: number, hours: number, defects: number];
export const spring2013Pm6TeamCases: readonly (readonly TeamRecord[])[] = [
  [[40, 112, 168], [25, 88, 88], [20, 50, 70], [15, 45, 60]],
  [[40, 120, 168], [25, 72, 88], [20, 50, 75], [15, 45, 70]],
  [[40, 110, 145], [25, 88, 94], [20, 62, 85], [15, 44, 51]],
  [[40, 115, 141], [25, 78, 100], [20, 55, 69], [15, 50, 62]],
];
export const spring2013Pm6WeekSizes = [5, 7, 4, 2] as const;
export const spring2013Pm6WeekCases: readonly (readonly number[])[] = [[8, 11, 8, 2], [6, 9, 3, 3], [8, 11, 8, 6], [8, 11, 8, 4]];

export function spring2013Pm6Review(variant: number) {
  const teams = spring2013Pm6TeamCases[variant].map(([size, hours, defects], i) => ({
    team: 'PQRS'[i], size, hours, defects,
    hoursIn: hours >= 3 * size && hours * 5 <= 18 * size,
    defectsIn: defects * 5 >= 18 * size && defects * 5 <= 22 * size,
  }));
  const accepted = teams.filter(row => row.hoursIn && row.defectsIn).map(row => row.team);
  const rejected = teams.filter(row => !row.hoursIn && !row.defectsIn).map(row => row.team);
  const weeks = spring2013Pm6WeekCases[variant].map((defects, i) => {
    const size = spring2013Pm6WeekSizes[i];
    const lower = defects * 10 < 12 * size, upper = defects * 10 > 18 * size;
    const required = lower || upper ? Math.floor((lower ? 27 : 33) * size / 10) + 1 : null;
    return { size, defects, lower, upper, required, remaining: required === null ? 0 : required - defects };
  });
  const totals = weeks.reduce((a, row) => [a[0] + row.size, a[1] + row.defects], [0, 0]);
  const totalOutcome = totals[1] * 10 < 12 * totals[0] ? 1 : totals[1] * 10 > 18 * totals[0] ? 2 : 0;
  const trend = weeks.slice(1).map((row, i) => Math.sign(row.defects * weeks[i].size - weeks[i].defects * row.size));
  const weekOutcome = trend.every(sign => sign === 1) ? 0 : trend.every(sign => sign === -1) ? 1
    : weeks.some(row => row.upper) ? weeks.some(row => row.lower) ? 2 : 4 : 3;
  return { teams, accepted, rejected, weeks, totals, totalOutcome, weekOutcome,
    remaining: weeks.reduce((sum, row) => sum + row.remaining, 0) };
}

const baseSales: readonly (readonly number[])[] = [
  [100, 120, 136, 148, 158, 166, 174, 179, 182, 184],
  [8, 9, 11, 13, 16, 22, 30, 39, 54, 80],
  [18, 30, 45, 80, 100, 118, 130, 133, 131, 126],
  [68, 73, 66, 80, 77, 92, 90, 86, 100, 115],
  [34, 38, 48, 60, 75, 96, 120, 140, 155, 175],
];
type ForecastRow = readonly [gdpTenths: number, populationTenths: number, price: number];
export const spring2013Pm7Forecasts: readonly (readonly ForecastRow[])[] = [
  [[65, 271, 10], [70, 270, 12], [72, 268, 13]],
  [[65, 271, 10], [67, 269, 11], [75, 269, 12]],
  [[65, 271, 12], [66, 269, 10], [67, 267, 9]],
  [[65, 271, 10], [71, 270, 12], [75, 269, 11]],
];
export const spring2013Pm7Years = Array.from({ length: 10 }, (_, i) => 2002 + i);
export function spring2013Pm7Sales(variant: number) {
  const rows = baseSales.map(row => [...row]);
  if (variant === 1) {
    rows[2].splice(7, 3, 160, 172, 167);
    rows[3][7] = 92;
  } else if (variant === 2) {
    rows[0][1] = 105;
    rows[1][1] = 6;
    rows[3][1] = 32;
  } else if (variant === 3) {
    rows[1].splice(0, 7, 23, 25, 27, 29, 31, 34, 36);
    rows[2].splice(0, 2, 14, 33);
    rows[3][7] = 92;
  }
  return { rows, cQuantity: rows[2].slice(8), cRevenue: variant === 1 ? [131, 143] : [104, 113] };
}
const increasing = (values: readonly number[]) => values.slice(1).every((value, i) => value > values[i]);
export function spring2013Pm7Market(variant: number) {
  const { rows } = spring2013Pm7Sales(variant);
  const totals = spring2013Pm7Years.map((_, i) => rows.reduce((sum, row) => sum + row[i], 0));
  const countryTotals = rows.map(row => row.reduce((a, b) => a + b, 0));
  const ratioComparison = (i: number, j: number) => rows[i][9] * rows[j][0] - rows[j][9] * rows[i][0];
  const deltas = rows.map(row => row[9] - row[0]);
  const upCountries = rows.map(increasing);
  const rankChanges = spring2013Pm7Years.slice(1).filter((year, previous) =>
    rows.some((row, i) => rows.slice(i + 1).some(other =>
      Math.sign(row[previous] - other[previous]) !== Math.sign(row[previous + 1] - other[previous + 1]))));
  const others = (i: number, compare: (j: number) => boolean) => rows.every((_, j) => j === i || compare(j));
  const truth = [
    increasing(totals),
    rankChanges.length === 2 && rankChanges[0] === 2005 && rankChanges[1] === 2009,
    others(0, j => countryTotals[0] > countryTotals[j] && ratioComparison(0, j) > 0),
    others(1, j => countryTotals[1] < countryTotals[j] && ratioComparison(1, j) > 0),
    deltas[2] < 0 && others(2, j => deltas[j] >= 0),
    increasing(rows[3].slice(6)) && others(3, j => ratioComparison(3, j) < 0),
    others(4, j => deltas[4] > deltas[j]),
    upCountries.filter(Boolean).length === 2,
  ];
  const forecasts = spring2013Pm7Forecasts[variant].map(([gdp, population, price]) => {
    const volume = 16 * gdp + 35 * population - 8720;
    return { volume, revenue: volume * price };
  });
  const direction = ([first, middle, last]: readonly number[]) => first > middle ? middle > last ? 0 : 2 : middle < last ? 1 : 3;
  return { truth, totals, countryTotals, deltas, upCountries, rankChanges, forecasts,
    volumeDirection: direction(forecasts.map(row => row.volume)), revenueDirection: direction(forecasts.map(row => row.revenue)) };
}

export type Product = Readonly<{ code: number; name: string; price: number; count: number }>;
export type Purchase = Product & Readonly<{ ptr: number }>;
type Promo = Product & Readonly<{ designated: number; targets: readonly number[] }>;
const products: readonly Product[] = [
  { code: 222, name: 'B社緑茶500 ml', price: 140, count: 5 },
  { code: 111, name: 'A社牛乳1000 ml', price: 200, count: 2 },
  { code: 335, name: 'C社めんつゆ300 g', price: 150, count: 1 },
  { code: 224, name: 'B社麦茶500 ml', price: 140, count: 2 },
  { code: 333, name: 'C社うどん2食入', price: 180, count: 2 },
];
export function spring2013Pm8Input(variant: number) {
  const counts = [[5, 2, 1, 2, 2], [4, 3, 1, 5, 2], [2, 2, 1, 3, 3], [1, 2, 1, 1, 2]][variant];
  const rows = products.map((product, i): Purchase => ({ ...product, count: counts[i], ptr: [4, 1, 0, 5, 3][i] }));
  const promo: Promo = { code: [229, 100, 340, 225][variant], name: 'B社お茶3本100円引', price: -100, count: 0,
    designated: 3, targets: [222, 223, 224] };
  return { rows, head: 2, promo };
}

export function spring2013Pm8Evaluate(rows: readonly Purchase[], head: number, promo: Promo) {
  const targets = promo.targets.map(() => 0);
  let index = head, target = 0;
  while (index && target < targets.length) {
    const row = rows[index - 1], productCode = promo.targets[target];
    if (row.code === productCode) targets[target] = row.count;
    if (row.code <= productCode) index = row.ptr;
    if (row.code >= productCode) target++;
  }
  const count = Math.floor(targets.reduce((sum, qty) => sum + qty, 0) / promo.designated);
  const result = rows.map(row => ({ ...row }));
  let previous = 0;
  index = head;
  while (index && result[index - 1].code < promo.code) {
    previous = index;
    index = result[index - 1].ptr;
  }
  const existing = index !== 0 && result[index - 1].code === promo.code;
  if (count > 0 && !existing) {
    const nextRow = result.length + 1;
    if (previous) result[previous - 1].ptr = nextRow;
    else head = nextRow;
    result.push({ code: promo.code, name: promo.name, price: promo.price, count, ptr: index });
  } else if (count > 0 && existing) {
    result[index - 1].count = count;
  } else if (existing) {
    const successor = result[index - 1].ptr;
    if (previous) result[previous - 1].ptr = successor;
    else head = successor;
  }
  return { rows: result, head, targets, count };
}
