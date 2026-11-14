export const formatCases = [
  { base: 10, start: 0, float: '-0.012', digits: 2, examples: [['12.345', 3], ['34.567', 2], ['-12.345', 1], ['0.012', 2], ['0.012', 1], ['-0.012', 1]] },
  { base: 8, start: 1, float: '-9.25', digits: 3, examples: [['9.125', 3], ['20.375', 2], ['-9.125', 1], ['0.09375', 2], ['0.09375', 1], ['-0.09375', 1]] },
  { base: 6, start: 0, float: '35.5', digits: 4, examples: [['9.5', 3], ['20.75', 2], ['-9.5', 1], ['0.125', 2], ['0.125', 1], ['-0.125', 1]] },
  { base: 4, start: 1, float: '67.5', digits: 1, examples: [['11.25', 3], ['14.375', 2], ['-11.25', 1], ['0.125', 2], ['0.125', 1], ['-0.125', 1]] },
] as const;
export function decimalDigits(input: string, base: number, digits: number) {
  const [whole, decimal] = input.replace('-', '').split('.');
  const integer = Number(whole).toString(base);
  const divisor = 10 ** decimal.length;
  let remainder = Number(decimal);
  let fraction = '';
  for (let i = 0; i < digits; i++) {
    remainder *= base;
    fraction += Math.floor(remainder / divisor);
    remainder %= divisor;
  }
  return (input.startsWith('-') ? '−' : '') + integer + '.' + fraction;
}
