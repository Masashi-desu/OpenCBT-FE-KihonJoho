import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { aGrid, aTransform } from './sample-2022-dec-a-data';

export const profiles = {
  array: 'legacy-2015-autumn-am-6-array',
  memory: 'legacy-2015-autumn-am-18-memory',
  logic: 'legacy-2015-autumn-am-23-logic',
} as const;

export const memoryCases = [
  [500, 100, 800, 800],
  [400, 200, 600, 800],
  [600, 100, 400, 800],
  [400, 200, 560, 800],
] as const;

export const logicCases = [
  ['NAND', 'NAND', 'NAND'],
  ['NOR', 'NOR', 'NAND'],
  ['NAND', 'NAND', 'NOR'],
  ['NAND', 'AND', 'NAND'],
] as const;

export const memoryLabels = ['セグメント1', 'セグメント2', 'セグメント3', '空き'] as const;

export function arrayAlt([operation, pattern]: number[]) {
  const first = aGrid(pattern);
  const second = Array.from({ length: 8 }, () => Array<boolean>(8).fill(false));
  first.forEach((row, i) => row.forEach((marked, j) => {
    const [r, c] = aTransform(i, j, operation);
    second[r][c] = marked;
  }));
  const stars = (grid: boolean[][]) => grid.map((row, i) => {
    const columns = row.flatMap((marked, j) => marked ? [j] : []);
    return `行${i}は${columns.length ? '列' + columns.join('、') : '星印なし'}`;
  }).join('。');
  return '図1 流れ図。開始、ループ1（i：0，1，7）、ループ2（j：0，1，7）、空欄a、ループ2終端、ループ1終端、終了。' +
    '行iは上から0〜7、列jは左から0〜7。図2 配列Aの状態。' + stars(first) +
    '。図3 実行後の配列Bの状態。' + stars(second) + '。列を記したマスに星印があり、それ以外のマスは空欄。';
}

export function memoryAlt([index]: number[]) {
  return '横一列のメモリマップ。左から' + memoryCases[index].map((size, i) =>
    `${memoryLabels[i]}が${size}kバイト`).join('、') + '。';
}

export function logicAlt([index]: number[]) {
  const [upper, lower, last] = logicCases[index];
  return `上からAとBを上側の${upper}ゲート、CとDを下側の${lower}ゲートに入れる。` +
    `それぞれの出力を右側の${last}ゲートの上と下の入力へつなぎ、右の出力をXとする。`;
}

function defineFigure(profile: string, domain: BookletFigureDefinition['domain'],
  alt: BookletFigureDefinition['alt']): BookletFigureDefinition {
  return {
    profile, domain, alt,
    validate(values) {
      if (values.length !== domain.length || domain.some(([min, max], i) =>
        !Number.isSafeInteger(values[i]) || values[i] < min || values[i] > max))
        throw new Error('FIGURE_DOMAIN');
    },
  };
}

export const legacy2015AutumnAm0126Figures: BookletFigureDefinition[] = [
  defineFigure(profiles.array, [[0, 3], [0, 2]], arrayAlt),
  defineFigure(profiles.memory, [[0, memoryCases.length - 1]], memoryAlt),
  defineFigure(profiles.logic, [[0, logicCases.length - 1]], logicAlt),
];
