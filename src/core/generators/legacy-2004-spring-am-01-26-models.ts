export const inputs: readonly (readonly [number, number])[] = [[0,0],[0,1],[1,0],[1,1]];

export const sumCases = [
  { a: 'A', b: 'B', carry: 0, negateA: false, negateB: false },
  { a: 'A', b: 'B', carry: 1, negateA: false, negateB: false },
  { a: 'A', b: 'B̅', carry: 0, negateA: false, negateB: true },
  { a: 'A̅', b: 'B̅', carry: 0, negateA: true, negateB: true },
] as const;
export function sumRows(index: number) {
  const item = sumCases[index];
  return inputs.map(([a,b]) => {
    const sum = (item.negateA ? 1-a : a) + (item.negateB ? 1-b : b) + item.carry;
    return [a,b,Math.floor(sum/2),sum%2];
  });
}
export const branchGates = ['AND','XOR','NAND','OR'] as const;
export const branchCases = [[2,1,1,2],[2,2,2,1],[1,1,1,2],[2,1,1,1]] as const;
export const scans = [
  { reverse: false, step: 1, bound: 'N', begin: '1', limit: '＞', continues: '≦', advance: '＋' },
  { reverse: true, step: 1, bound: '1', begin: 'N', limit: '＜', continues: '≧', advance: '−' },
  { reverse: false, step: 2, bound: 'N', begin: '1', limit: '＞', continues: '≦', advance: '＋' },
  { reverse: true, step: 2, bound: '1', begin: 'N', limit: '＜', continues: '≧', advance: '−' },
] as const;

// [cache time ns, hit rate %, memory time ns].
export const memoryRows: readonly (readonly (readonly [number,number,number])[])[] = [
  [[10,60,70],[10,70,70],[20,70,50],[20,80,50]],
  [[12,90,80],[12,60,80],[24,70,60],[24,80,60]],
  [[12,50,90],[12,90,90],[24,70,60],[24,80,60]],
  [[14,60,80],[14,70,80],[22,90,55],[22,60,55]],
];

export const diskCases = [
  { bytes: 200, count: 100000, recordsPerBlock: 10, tracks: 19, sectors: 40, sectorBytes: 256 },
  { bytes: 180, count: 80000, recordsPerBlock: 8, tracks: 15, sectors: 36, sectorBytes: 256 },
  { bytes: 300, count: 120000, recordsPerBlock: 12, tracks: 20, sectors: 45, sectorBytes: 512 },
  { bytes: 220, count: 96000, recordsPerBlock: 12, tracks: 16, sectors: 45, sectorBytes: 256 },
] as const;
