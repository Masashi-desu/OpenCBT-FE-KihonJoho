export const imageCases = [
  { example: [27, 27, 10], first: 4, second: 15, short: [7, 31, 2], long: [31, 31, 2], decode: 3 },
  { example: [15, 31, 18], first: 5, second: 14, short: [6, 30, 4], long: [30, 30, 4], decode: 2 },
  { example: [0, 29, 25, 10], first: 6, second: 16, short: [5, 30, 5], long: [29, 30, 5], decode: 1 },
  { example: [24, 16, 24], first: 7, second: 17, short: [4, 31, 5], long: [28, 31, 5], decode: 0 },
] as const;

export function encodeRun(length: number) {
  const literal = length.toString(2).padStart(2, '0');
  return '1'.repeat(literal.length - 2) + '0' + literal;
}
export function imageRows(runs: readonly number[]) {
  const bits = runs.map((n, index) => String(index % 2).repeat(n)).join('');
  return bits.match(/.{8}/g)!;
}
export function decodedChoiceRuns(index: number) {
  const { short, long } = imageCases[index];
  return [short, [0, ...short], long, [0, ...long]];
}

export const networkCases = [
  { smtp: 25, pop: 110, database: 1999 },
  { smtp: 50225, pop: 50110, database: 1999 },
  { smtp: 51225, pop: 51110, database: 2199 },
  { smtp: 52225, pop: 52110, database: 2999 },
] as const;
