type Rung = readonly [number, number, number];
type LadderCase = { size: number; bottom: number; top: number; rungs: readonly Rung[] };
export const ladderCases: readonly LadderCase[] = [
  { size: 4, bottom: 0, top: 1, rungs: [[0, 1, 0.8], [0, 1, 0.2], [1, 2, 0.4], [2, 3, 0.6], [2, 3, 0.2]] },
  { size: 4, bottom: 0, top: 2, rungs: [[0, 1, 1.6], [2, 3, 0.4], [1, 2, 1.2], [0, 1, 0.8], [1, 2, 0.4]] },
  { size: 4, bottom: 1, top: 3, rungs: [[1, 2, 1.4], [2, 3, 2.6], [0, 1, 2.2], [1, 2, 1.8], [2, 3, 1.4]] },
  { size: 4, bottom: 2, top: 3, rungs: [[0, 1, 2.2], [1, 2, 2.8], [2, 3, 2.6], [1, 2, 2.4], [2, 3, 2.2]] },
];
export const decimalY = (value: number) => value.toFixed(1);

export function ladderPath(index: number, start: number) {
  const { size, bottom, top, rungs } = ladderCases[index];
  const lines = Array.from({ length: size }, () => new Map<number, number>());
  for (const [left, right, y] of rungs) {
    if (left !== right && !lines[left].has(y) && !lines[right].has(y)) {
      lines[left].set(y, right);
      lines[right].set(y, left);
    }
  }
  const path: [number, number][] = [[start, top]];
  let x = start, y = top;
  for (;;) {
    const next = Math.max(bottom, ...[...lines[x].keys()].filter(height => height < y));
    path.push([x, next]);
    if (next === bottom) break;
    x = lines[x].get(next)!;
    y = next;
    path.push([x, y]);
  }
  return path;
}

export const bitCases = [
  { offset: 12, width: 10, replacement: 0xd6c0, options: [0x0000, 0x000d, 0x000f, 0x0035, 0x003f, 0xffc0, 0xfff0, 0xffff] },
  { offset: 8, width: 12, replacement: 0x9a70, options: [0x0000, 0x000f, 0x009a, 0x00ff, 0x7000, 0x9a70, 0xf000, 0xfff0] },
  { offset: 5, width: 9, replacement: 0xb180, options: [0x0000, 0x000f, 0x0180, 0x058c, 0x07fc, 0x0fff, 0xb180, 0xff80] },
  { offset: 13, width: 7, replacement: 0x6a00, options: [0x0000, 0x0003, 0x0007, 0x0035, 0x007f, 0x5000, 0x6a00, 0xfe00] },
] as const;
export const hexWord = (number: number) => '#' + number.toString(16).toUpperCase().padStart(4, '0');

export function brepOperands(p: number, q: number, beta: number) {
  const mask = ((0x8000 << 16) >> (q - 1 + 16)) & 0xffff;
  return {
    replacements: [beta >>> p, (beta << (16 - p)) & 0xffff],
    masks: [mask >>> p, (mask << (16 - p)) & 0xffff],
  };
}
