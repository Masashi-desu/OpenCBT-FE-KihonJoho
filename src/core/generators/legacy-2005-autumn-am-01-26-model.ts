export const xorCases = [
  { input: 13, a: 1, b: 5, c: 13, target: 15 },
  { input: 9, a: 2, b: 6, c: 4, target: 3 },
  { input: 3, a: 10, b: 2, c: 6, target: 4 },
  { input: 15, a: 1, b: 7, c: 8, target: 13 },
];
export const bits = (value: number) => value.toString(2).padStart(4, '0');
export const treeArities = [2, 3, 4, 5] as const;
export const circuitKinds = ['AND', 'NOR', 'XOR', 'XNOR'] as const;
export const circuitTexts = [
  '二つのXORの結果をANDへつなぐ。',
  '二つのXORの結果をORへつなぎ、NOTで反転する。',
  '二つのXORの結果をXORへつなぐ。',
  '二つのXORの結果をXORへつなぎ、NOTで反転する。',
] as const;
