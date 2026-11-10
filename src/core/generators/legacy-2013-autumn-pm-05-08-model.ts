export const autumn2013Pm5Tests = [
  [[11, 9, 19, 10, 10], [11, 10, 20, 11, 11]],
  [[12, 10, 19, 11, 10], [12, 9, 20, 12, 11]],
  [[15, 10, 20, 9, 12], [13, 8, 19, 12, 10]],
] as const;

export function shortCircuitSkips([x, a, , c]: readonly number[]) {
  if (x <= 10) throw Error('PARAMETER_CONSTRAINT');
  return [a < 10 ? 'b＜20' : '', c <= 10 ? 'd＞10' : ''].filter(Boolean);
}

export const autumn2013Pm5FlowEdges = [
  ['S', '1'], ['1', '2'], ['1', 'E'], ['2', 'c'], ['c', 'upper'], ['c', 'middle'],
  ['upper', 'd'], ['upper', 'middle'], ['middle', '7'], ['d', '7'],
  ['7', 'e'], ['7', 'f'], ['f', '9'], ['f', 'e'], ['e', 'left'], ['left', '1'], ['9', 'E'],
] as const;

export const autumn2013Pm6Actuals = [
  { week1: 40, week2: 50, commonRate: 10, uniqueRate: 8 },
  { week1: 44, week2: 38, commonRate: 9, uniqueRate: 9 },
  { week1: 43, week2: 44, commonRate: 7, uniqueRate: 9 },
] as const;

const commonPrograms = 30, totalPrograms = 120, weeklyCapacity = 10 * 8 * 5;
const standardDesign = 8, programmingInitial = 10, programmingCommon = 8, programmingUnique = 9;
export const autumn2013Pm6DesignPlan = [50, 50, 20] as const;
export const autumn2013Pm6ProgrammingPlan = [24, 40, 40, 16] as const;
export const autumn2013Pm6BalancedPlan = [10, 38, 36, 36] as const;

export function autumn2013Pm6Work(index: number) {
  const { week1, week2, commonRate, uniqueRate } = autumn2013Pm6Actuals[index];
  const actualCounts = [week1, week2];
  const hours = [commonPrograms * commonRate + (week1 - commonPrograms) * uniqueRate, week2 * uniqueRate];
  const remaining = totalPrograms - week1 - week2;
  const difference = 100 * (autumn2013Pm6DesignPlan[0] + autumn2013Pm6DesignPlan[1] - week1 - week2) / totalPrograms;
  const category = commonRate > standardDesign ? (uniqueRate > standardDesign ? 1 : 0) : 2;
  const revisedHours = commonPrograms * programmingCommon + (totalPrograms - commonPrograms) * programmingUnique;
  const commonAfterThird = commonPrograms - autumn2013Pm6BalancedPlan[0];
  const fourth = commonAfterThird + Math.floor((weeklyCapacity - commonAfterThird * programmingCommon) / programmingUnique);
  const fifth = Math.floor(weeklyCapacity / programmingUnique);
  const sixth = totalPrograms - autumn2013Pm6BalancedPlan[0] - fourth - fifth;
  const [, fourthBalanced, fifthBalanced, sixthBalanced] = autumn2013Pm6BalancedPlan;
  const balancedHours = [
    commonAfterThird * programmingCommon + (fourthBalanced - commonAfterThird) * programmingUnique,
    fifthBalanced * programmingUnique, sixthBalanced * programmingUnique,
  ];
  return {
    actualCounts, hours, remaining, difference, category, remainingHours: remaining * uniqueRate,
    commonRate, uniqueRate, saving: totalPrograms * programmingInitial - revisedHours, revisedHours,
    fastest: [fourth, fifth, sixth],
    balancedHours, spread: Math.max(...balancedHours) - Math.min(...balancedHours),
  };
}

type StockRow = readonly [turnover: number, safety: number, ratio: number];
type Stocks = { k: readonly StockRow[]; l: readonly StockRow[] };
const lBase = [[90, 445, .9], [5, 25, .1], [0, 0, 0], [0, 0, 0], [0, 0, 0]] as const;
const lOther = [[90, 425, .9], [10, 25, .1], [0, 0, 0], [0, 0, 0], [0, 0, 0]] as const;
export const autumn2013Pm7Stocks: readonly Stocks[] = [
  { k: [[25, 100, .2], [30, 150, .3], [20, 100, .2], [10, 70, .2], [10, 50, .1]], l: lBase },
  { k: [[20, 90, .2], [20, 90, .2], [20, 90, .2], [20, 90, .2], [20, 90, .2]], l: lOther },
  { k: [[30, 150, .3], [35, 130, .3], [20, 80, .2], [10, 50, .1], [5, 40, .1]], l: lOther },
];
const rootHundredths: Readonly<Record<number, number>> = { 0: 0, .1: 32, .2: 45, .3: 55, .9: 95 };
export function autumn2013Pm7Total(rows: readonly StockRow[]) {
  let turnover = 0, safety = 0, denominator = 0;
  for (const [t, s, ratio] of rows) {
    turnover += t;
    safety += s;
    denominator += rootHundredths[ratio];
  }
  return { turnover, safety, denominator, original: turnover + safety, after: Math.round(turnover + safety * 100 / denominator) };
}

export const autumn2013Pm8Inputs = [
  'ABCDEFGABCDEABCDFEFGABCD',
  'ABCDEFABCDEABCDFEFABCD',
  'ABCDEFABCDEABCDEFABCD',
  'ABCDEABCDABCDE',
] as const;

export function autumn2013Pm8Compress(text: string) {
  const chunks: string[] = [];
  let literals = 0;
  for (let position = 0; position < text.length;) {
    let matchLength = 3, matchDistance = 0;
    for (let distance = 4; distance <= Math.min(26, position); distance++) {
      let length = 0;
      while (length < distance && position + length < text.length &&
          text[position + length] === text[position - distance + length]) length++;
      if (length > matchLength) {
        matchLength = length;
        matchDistance = distance;
      }
    }
    if (matchDistance) {
      chunks.push('$' + String.fromCharCode(64 + matchDistance, 64 + matchLength));
      position += matchLength;
    } else {
      chunks.push(text[position++]);
      literals++;
    }
  }
  return { chunks, literals };
}
