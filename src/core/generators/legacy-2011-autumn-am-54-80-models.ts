export const slaCases = [
  { start: 8, end: 22, days: 30, availablePermille: 995 },
  { start: 9, end: 19, days: 30, availablePermille: 995 },
  { start: 8, end: 20, days: 30, availablePermille: 990 },
  { start: 7, end: 22, days: 30, availablePermille: 990 },
] as const;

export const salesCases = [
  { current: [10000, 20000, 80000], rates: [[5, 3, 1, 1], [1, 6, 1, 1], [1, 1, 3, 3]], newcomers: [5000, 7000, 13000, 23000], claim: 1000 },
  { current: [12000, 25000, 60000], rates: [[4, 2, 2, 2], [1, 5, 1, 2], [1, 1, 3, 3]], newcomers: [6500, 9000, 11000, 21000], claim: 2400 },
  { current: [20000, 20000, 40000], rates: [[5, 2, 1, 2], [1, 5, 1, 2], [1, 1, 3, 3]], newcomers: [4000, 8000, 12000, 13000], claim: 2000 },
  { current: [20000, 30000, 50000], rates: [[3, 4, 2, 1], [1, 5, 2, 1], [1, 1, 3, 3]], newcomers: [6000, 8000, 9000, 14000], claim: 4000 },
] as const;
export function existingBuyers(index: number) {
  const { current, rates } = salesCases[index];
  return [0, 1, 2, 3].map(product => rates.reduce((total, row, previous) =>
    total + current[previous] * row[product] / 10, 0));
}

export const assemblyMinutes = [6, 10, 15] as const;
export const assemblyCases = [
  { hours: 200, profit: [1800, 2500, 3000], cap: [1000, 900, 500] },
  { hours: 180, profit: [1740, 2300, 2550], cap: [900, 810, 400] },
  { hours: 210, profit: [1800, 2300, 2550], cap: [1000, 960, 500] },
  { hours: 220, profit: [1320, 3100, 3150], cap: [900, 960, 520] },
] as const;

export const stockCases = [
  { carried: 400, sales: [5000, 4500, 4800, 4600], inventory: [300, 250, 300, 250], target: 2 },
  { carried: 350, sales: [5200, 4300, 4800, 4500], inventory: [300, 250, 350, 250], target: 0 },
  { carried: 500, sales: [4700, 5150, 4500, 4900], inventory: [400, 350, 300, 250], target: 1 },
  { carried: 400, sales: [5000, 4600, 4950, 4400], inventory: [250, 350, 300, 400], target: 3 },
] as const;

export const depreciationCases = [
  { tenThousands: 100, life: 6, ratePermille: 167, elapsed: 2 },
  { tenThousands: 120, life: 5, ratePermille: 200, elapsed: 1 },
  { tenThousands: 160, life: 8, ratePermille: 125, elapsed: 3 },
  { tenThousands: 150, life: 10, ratePermille: 100, elapsed: 4 },
] as const;

export const earningsCases = [
  { sales: 100, variable: 60, fixed: 30, goal: 18 },
  { sales: 120, variable: 72, fixed: 32, goal: 24 },
  { sales: 90, variable: 45, fixed: 28, goal: 30 },
  { sales: 160, variable: 120, fixed: 30, goal: 20 },
] as const;
