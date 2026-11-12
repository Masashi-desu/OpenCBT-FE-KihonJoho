export const printCases = [
  { base: 0, separator: 'NL', margin: 0, width: 0, height: 0, first: 'a', second: 'b' },
  { base: 1, separator: 'NL', margin: 3, width: 12, height: 5, first: 'A', second: 'B' },
  { base: 0, separator: 'LB', margin: 2, width: 15, height: 4, first: 'C', second: 'D' },
  { base: 1, separator: 'LB', margin: 4, width: 10, height: 4, first: 'X', second: 'Y' },
] as const;

export function exampleRows(index: number) {
  const { first, second, width } = printCases[index];
  return width === 0 ? [first.repeat(28) + ' … ' + first.repeat(2), first.repeat(12), second.repeat(28), 'cc …'] :
    [first.repeat(width), first.repeat(4), second.repeat(width - 2), 'cc …'];
}
