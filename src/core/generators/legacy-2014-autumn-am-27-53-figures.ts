import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const legacy2014AutumnAmCriticalPathProfile = 'legacy-2014-autumn-am-52-critical-path';

// Original event layout. Labels follow the source's side of the activity arrow.
export const criticalPathNodes = [
  [36, 126], [122, 126], [228, 42], [228, 127], [174, 212], [307, 213],
  [390, 43], [309, 86], [390, 127], [409, 213], [493, 127],
] as const;

export const criticalPathEdges = [
  ['A', 0, 1, 5, 70, 116, 70, 143], ['B', 1, 2, 15, 174, 71, 179, 92],
  ['C', 1, 3, 10, 181, 116, 181, 143], ['D', 1, 4, 4, 156, 167, 147, 185],
  ['E', 3, 2, 8, 219, 96, 238, 96], ['F', 4, 5, 15, 229, 207, 229, 229],
  ['G', 2, 6, 12, 315, 35, 315, 57], ['H', 2, 7, 7, 273, 62, 268, 82],
  ['I', 3, 8, 24, 288, 116, 288, 143], ['J', 5, 9, 13, 356, 207, 356, 229],
  ['K', 7, 8, 10, 345, 96, 337, 115], ['L', 6, 8, 7, 399, 75, 381, 75],
  ['M', 9, 10, 5, 443, 166, 452, 186], ['N', 8, 10, 3, 434, 116, 434, 143],
] as const;

type Activity = typeof criticalPathEdges[number][0];
const changes: ReadonlyArray<Partial<Record<Activity, number>>> = [
  {}, { B: 21 }, { B: 20, H: 12 }, { I: 31 },
];
export const criticalPathCaseCount = changes.length;
export const criticalPathActivities = (input: number) =>
  criticalPathEdges.map(([name, from, to, original, nameX, nameY, daysX, daysY]) => ({
    name, from, to, days: changes[input][name] ?? original, nameX, nameY, daysX, daysY,
  }));

export function criticalPathAlt([input]: number[]) {
  const activities = criticalPathActivities(input);
  const links = activities.map(({ name, from, to, days }) => '節点' + from + 'から節点' + to + 'へ作業' + name + '（' + days + '日）');
  return 'アローダイアグラム。凡例の矢印の上は作業、下は所要日数。節点の番号は説明用。' + links.join('，') + '。';
}

export const legacy2014AutumnAm27To53Figures: BookletFigureDefinition[] = [{
  profile: legacy2014AutumnAmCriticalPathProfile,
  domain: [[0, criticalPathCaseCount - 1]],
  validate(values) {
    if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= criticalPathCaseCount)
      throw new Error('FIGURE_DOMAIN');
  },
  alt: criticalPathAlt,
}];
