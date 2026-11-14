export type Node = readonly [number, Node?, Node?];
export const searchTrees: readonly Node[] = [
  [8, [3, [1], [5]], [10, [9], [15, [13]]]],
  [8, [3, [1], [5]], [10, [9], [15, [13]]]],
  [12, [4, [2], [6]], [15, [14], [23, [21]]]],
  [16, [6, [2], [10]], [20, [18], [29, [26]]]],
];
export const insertions = [12, 14, 22, 30];
export function graft(node: Node, target: number, index: number): Node {
  const [value, left, right] = node;
  const anchor = index === 0 ? [9,9,14,18][target] :
    index === 1 ? [10,10,15,20][target] :
    index === 2 ? [13,13,21,26][target] : [15,15,23,29][target];
  if (value === anchor) {
    const insert = insertions[target];
    if (index === 0 || index === 3 || index === 2 && insert > value) return [value, left, [insert]];
    if (index === 1) return [value, [insert, left], right];
    return [value, [insert], right];
  }
  return [value, left && graft(left, target, index), right && graft(right, target, index)];
}
export const matches = [
  ['aababx', 'ab', 1], ['aabba', 'aa', 1], ['bbbab', 'ab', 1], ['xaabbab', 'bab', 0],
] as const;
export const sequences = [
  { seq: 'acbacd', cpi: [6, 2, 4, 8], clock: 10 },
  { seq: 'bcdbda', cpi: [4, 5, 6, 8], clock: 8 },
  { seq: 'dccdba', cpi: [6, 4, 8, 10], clock: 5 },
  { seq: 'acacad', cpi: [5, 3, 9, 4], clock: 6 },
] as const;

export const normalRows = [
  ['0.0', '0.500'], ['0.5', '0.309'], ['1.0', '0.159'], ['1.5', '0.067'],
  ['2.0', '0.023'], ['2.5', '0.006'], ['3.0', '0.001'],
] as const;
