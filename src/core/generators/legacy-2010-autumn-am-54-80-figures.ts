import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';

type Point = readonly [number, number];
type Four<T> = readonly [T, T, T, T];

function definition(number: number, name: string, describe: (index: number) => string): BookletFigureDefinition {
  const profile = `legacy-2010-autumn-am-${number}-${name}`;
  function validate(values: number[]) {
    if (!Array.isArray(values) || values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > 3)
      throw new DataError('FIGURE_PROFILE', '2010年度秋期旧午前の図の入力が範囲外です');
  }
  return { profile, domain: [[0, 3]], validate, alt(values) { validate(values); return describe(values[0]); } };
}

export const abcCurves: readonly Four<readonly number[]>[] = [
  [[0, 47, 68, 78, 83, 86, 88, 89, 90], [92, 58, 48, 47, 52, 60, 71, 84, 94],
    [5, 15, 45, 79, 90, 76, 42, 14, 5], [70, 19, 10, 10, 10, 10, 10, 48, 89]],
  [[94, 70, 50, 39, 38, 43, 51, 65, 85], [0, 46, 65, 74, 79, 82, 84, 85, 86],
    [7, 15, 36, 74, 92, 80, 49, 20, 8], [74, 23, 12, 12, 12, 12, 12, 41, 77]],
  [[6, 12, 33, 62, 79, 68, 47, 19, 6], [79, 49, 31, 26, 29, 38, 49, 60, 80],
    [0, 24, 43, 58, 70, 79, 86, 91, 94], [82, 30, 14, 14, 14, 14, 14, 47, 91]],
  [[67, 17, 8, 8, 8, 8, 8, 37, 81], [3, 10, 30, 61, 89, 79, 46, 17, 4],
    [78, 54, 45, 42, 44, 49, 61, 76, 96], [0, 18, 35, 51, 65, 76, 84, 89, 92]],
];

const invertedArc: readonly Point[] = [
  [-17,-8],[-14,-4],[-14,-12],[-13,-8],[-10,-5],[-9,2],[-8,-8],[-7,7],[-6,-2],[-5,10],[-4,5],[-2,5],
  [3,11],[3,7],[3,4],[4,-2],[6,8],[6,0],[7,-3],[9,2],[9,-5],[9,-8],[13,-5],[15,-5],[15,-8],[19,-10],
];
const downward: readonly Point[] = [
  [2,20],[2,15],[5,18],[5,13],[7,16],[7,12],[7,20],[10,17],[10,13],[11,9],[13,17],[13,11],
  [13,7],[16,15],[16,12],[16,9],[16,6],[18,8],[18,5],[20,12],[22,9],[22,6],[22,4],[24,7],[26,4],[26,1],
];
const dispersed: readonly Point[] = [
  [-18,-1],[-16,-7],[-14,5],[-13,-9],[-9,10],[-8,-11],[-7,5],[-7,-2],[-4,-5],[-4,-13],[-3,12],[-3,5],
  [3,12],[3,2],[3,-2],[4,-11],[7,7],[7,0],[9,-5],[11,9],[13,3],[13,-2],[13,-8],[17,-5],[18,6],[18,1],
];
const upward: readonly Point[] = [
  [-26,-21],[-25,-17],[-24,-19],[-22,-15],[-21,-12],[-20,-21],[-20,-18],[-20,-9],[-18,-11],[-18,-13],[-17,-16],
  [-16,-9],[-16,-15],[-15,-17],[-14,-12],[-13,-8],[-13,-13],[-11,-5],[-10,-9],[-10,-13],[-8,-10],[-7,-6],[-6,-3],[-4,-7],[-4,-4],[-2,-5],
];

const shifted = (points: readonly Point[], xOffset: number, yOffset: number): Point[] =>
  points.map(([x, y]) => [x + xOffset, y + yOffset]);

export const scatterPlots: readonly Four<readonly Point[]>[] = [
  [invertedArc, downward, dispersed, upward],
  [shifted(upward, 22, 20), shifted(dispersed, 3, -3), shifted(downward, -25, -20), shifted(invertedArc, -4, 3)],
  [shifted(dispersed, -3, 3), shifted(upward, 10, 15), shifted(invertedArc, 4, -3), shifted(downward, -12, -9)],
  [shifted(invertedArc, 2, -4), shifted(dispersed, 1, 2), shifted(upward, 16, 10), shifted(downward, -12, -12)],
];

export const dispatchNames = ['派遣元企業', '派遣先企業', '労働者'] as const;
export const dispatchEdges = [[0, 1], [0, 2], [1, 2]] as const;
export const dispatchTargets = [2, 0, 1, 2] as const;

function abcAlt(index: number, choice: number) {
  return '縦軸は売上高，横軸は商品アイテム。左から右への曲線の高さ（相対値）：'
    + abcCurves[index][choice].join('，') + '。';
}

function scatterAlt(index: number, choice: number) {
  return '目盛は両軸とも−20，−10，0，10，20。点の位置（横，縦）は概数で，'
    + scatterPlots[index][choice].map(([x, y]) => `（${x}，${y}）`).join('，') + '。';
}

const optionSuffix = ['a', 'i', 'u', 'e'] as const;
export const abcChoiceFigures = optionSuffix.map((suffix, choice) => definition(75, `abc-${suffix}`, index => abcAlt(index, choice)));
export const scatterChoiceFigures = optionSuffix.map((suffix, choice) => definition(77, `scatter-${suffix}`, index => scatterAlt(index, choice)));
export const dispatchFigure = definition(80, 'dispatch-relationship', index =>
  '派遣元企業は左上，労働者は左下，派遣先企業は右にある。三者の各組は両向きの矢印で結ばれ，'
  + dispatchEdges[dispatchTargets[index]].map(endpoint => dispatchNames[endpoint]).join('と')
  + 'を結ぶ矢印が太線。');
export const legacy2010AutumnAm5480Figures = [...abcChoiceFigures, ...scatterChoiceFigures, dispatchFigure];
