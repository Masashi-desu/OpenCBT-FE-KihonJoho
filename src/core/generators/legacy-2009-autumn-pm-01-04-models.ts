export const additions = [
  { a: -1, b: -2, blankRow: 7 }, { a: 1, b: 5, blankRow: 5 },
  { a: -3, b: -3, blankRow: 0 }, { a: 2, b: 3, blankRow: 3 },
] as const;
export const binary = [0, 1] as const;
export const triples = binary.flatMap(c => binary.flatMap(x => binary.map(y => [c, x, y] as const)));
export const carryChoices = ['0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011'];
export function partialCarry(c: number, x: number, y: number) {
  const subtotal = x + y;
  return [Math.floor(subtotal / 2), Math.floor((subtotal % 2 + c) / 2)];
}
export function rippleCarry(a: number, b: number) {
  let carry = 0;
  return Array.from({ length: 4 }, (_, position) => {
    const sum = ((a >> position) & 1) + ((b >> position) & 1) + carry;
    carry = Math.floor(sum / 2);
    return carry;
  }).join('');
}

export const packets = [
  { header: 150, max: 1478, rate: 100, frequencies: [70, 25, 4, 1] },
  { header: 160, max: 1440, rate: 80, frequencies: [75, 20, 4, 1] },
  { header: 132, max: 1572, rate: 120, frequencies: [65, 27, 6, 2] },
  { header: 144, max: 1264, rate: 80, frequencies: [80, 15, 4, 1] },
] as const;
export const differenceWidths = [8, 16, 24, 32] as const;
export const prefixes = ['0', '10', '110', '111'] as const;
export const widthWithPrefix = differenceWidths.map((width, i) => width + prefixes[i].length);
export const formatted = (value: number) => value.toLocaleString('en-US');
