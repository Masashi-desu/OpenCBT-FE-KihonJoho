import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

export const courseCases = [
  { beginner: 6, intermediate: 10, advanced: 12, beginnerMinimum: 4, intermediateMinimum: 7, pass: 60, honor: 90, honorMonths: 24, retryMonths: 12 },
  { beginner: 5, intermediate: 8, advanced: 12, beginnerMinimum: 4, intermediateMinimum: 6, pass: 65, honor: 85, honorMonths: 18, retryMonths: 9 },
  { beginner: 6, intermediate: 9, advanced: 12, beginnerMinimum: 5, intermediateMinimum: 7, pass: 70, honor: 90, honorMonths: 21, retryMonths: 10 },
  { beginner: 7, intermediate: 10, advanced: 12, beginnerMinimum: 5, intermediateMinimum: 8, pass: 60, honor: 85, honorMonths: 20, retryMonths: 11 },
] as const;

export const tapeCases = [
  { shipFirst: 6, moveFirst: 5, loan: 1, purchase: 20, returned: 2, moveSecond: 20, use: 18, shipSecond: 15 },
  { shipFirst: 7, moveFirst: 4, loan: 1, purchase: 19, returned: 2, moveSecond: 21, use: 15, shipSecond: 14 },
  { shipFirst: 8, moveFirst: 6, loan: 2, purchase: 22, returned: 2, moveSecond: 23, use: 18, shipSecond: 16 },
  { shipFirst: 5, moveFirst: 7, loan: 1, purchase: 21, returned: 1, moveSecond: 22, use: 17, shipSecond: 16 },
] as const;

export function tapeState(index: number) {
  const c = tapeCases[index];
  const discarded = 8 + c.moveFirst;
  const unused = 12 + c.purchase - c.use;
  const loanLedger = 4 + c.loan - c.returned;
  const loanConfirmed = loanLedger - 1;
  const shipped = c.shipFirst + c.shipSecond;
  const total = 1060 + c.purchase - discarded - shipped;
  const rack = 1036 - c.shipFirst - c.moveFirst - c.loan + c.returned - c.moveSecond + c.use - c.shipSecond;
  return { ...c, discarded, unused, loanLedger, loanConfirmed, shipped, total, rack };
}

const ascending = (numbers: number[]) => [...new Set(numbers)].sort((a, b) => a - b);

export function tapeChoices(index: number) {
  const { moveFirst, moveSecond, discarded, unused, loanLedger, loanConfirmed, total, use } = tapeState(index);
  const small = ascending([0, loanConfirmed, loanLedger, moveFirst, discarded, unused, moveSecond, moveFirst + moveSecond, 8 + moveSecond]);
  const large = ascending([total - use, total - 12, total - (moveSecond - discarded), total, total + moveSecond - discarded, total + 8]);
  if (small.length !== 9 || large.length !== 6) throw Error('PARAMETER_CONSTRAINT');
  return { small, large };
}

const stockCases = [
  { initialInspection: 1000, damaged19: 20, damaged20: 40, plannedA: 1500, plannedB: 120 },
  { initialInspection: 900, damaged19: 40, damaged20: 40, plannedA: 1000, plannedB: 120 },
  { initialInspection: 1100, damaged19: 60, damaged20: 100, plannedA: 1490, plannedB: 110 },
  { initialInspection: 1200, damaged19: 0, damaged20: 80, plannedA: 1000, plannedB: 110 },
] as const;
type Stock = readonly [inspection: number, good: number, bad: number];
type Changes = readonly [production: number, passed: number, failed: number, returned: number, damaged: number, discarded: number, shipped: number];

function postStock([inspection, good, bad]: Stock, [production, passed, failed, returned, damaged, discarded, shipped]: Changes): Stock {
  return [inspection + production + returned - passed - failed, good + passed - damaged - shipped, bad + failed + damaged - discarded];
}

export function stockModel(index: number) {
  const c = stockCases[index];
  const openingA: Stock = [c.initialInspection, 3000, 180], openingB: Stock = [240, 280, 30];
  const day19A: Changes = [1800, 1600, 100, 50, c.damaged19, 180, 1700];
  const day20A: Changes = [1800, 800, 0, 100, c.damaged20, 0, 1400];
  const day19B: Changes = [150, 180, 10, 20, 30, 0, 160];
  const day20B: Changes = [0, 140, 0, 10, 20, 0, 130];
  const stock19A = postStock(openingA, day19A), stock19B = postStock(openingB, day19B);
  const stock20A = postStock(stock19A, day20A), stock20B = postStock(stock19B, day20B);
  function next([inspection, good]: Stock, planned: number) {
    if (good < planned) return 2;
    return good < planned * 2 || inspection + good < planned * 3 ? 0 : 1;
  }
  return { ...c, openingA, openingB, day19A, day20A, day19B, day20B, stock19A, stock20A, stock19B, stock20B,
    nextA: next(stock20A, c.plannedA), nextB: next(stock20B, c.plannedB) };
}

const railwayCases = [
  { edges: [18, 17, 14, 13, 16, 12], segmentB: [15, 10, 20], trunkCount: 5 },
  { edges: [16, 17, 14, 13, 20, 12], segmentB: [14, 12, 18], trunkCount: 4 },
  { edges: [21, 15, 16, 14, 17, 13], segmentB: [16, 11, 19], trunkCount: 6 },
  { edges: [16, 15, 15, 11, 17, 13], segmentB: [13, 14, 21], trunkCount: 7 },
] as const;

export const stationPairs = [[1, 2], [2, 3], [1, 4], [3, 4], [2, 5], [4, 5]] as const;
export const unknownDistance = 999;

export function railwayModel(index: number) {
  const { edges, segmentB, trunkCount } = railwayCases[index];
  const size = 5;
  const distances:number[][] = Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => i === j ? 0 : unknownDistance));
  stationPairs.forEach(([from, to], i) => {
    distances[from - 1][to - 1] = distances[to - 1][from - 1] = edges[i];
  });
  const snapshot = () => distances.map(row => [...row]);
  const stages = [snapshot()];
  for (let via = 0; via < size; via++) {
    for (let from = 0; from < size; from++) {
      for (let to = 0; to < size; to++) {
        distances[from][to] = Math.min(distances[from][to], distances[from][via] + distances[via][to]);
      }
    }
    stages.push(snapshot());
  }
  const a = stages[2][0][2], b = stages[2][2][4];
  const choices = ascending([a, b, stages[2][0][4], unknownDistance]);
  if (choices.length !== 4) throw Error('PARAMETER_CONSTRAINT');
  let threshold = trunkCount;
  while (threshold ** 2 <= trunkCount ** 2 + threshold * 5) threshold++;
  const limits = [trunkCount + 1, threshold - 1, threshold, threshold + trunkCount];
  if (ascending(limits).length !== 4) throw Error('PARAMETER_CONSTRAINT');
  return { edges, segmentB, trunkCount, stages, a, b, choices, threshold, limits };
}

export function autumn2012Pm0508Case(values: readonly number[]): number {
  return selectCase(values, courseCases.length);
}
