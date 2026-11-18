import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

const routes = [
  { start: 'a', branches: ['b', 'c'], destination: 'b' },
  { start: 'a', branches: ['b', 'c'], destination: 'c' },
  { start: 'b', branches: ['a', 'c'], destination: 'a' },
  { start: 'c', branches: ['a', 'b'], destination: 'b' },
] as const;
export const autumn2005AmRoute = (index: number) => routes[index];

const xValues = [14,16,19,21,23,25,29,32,35,38,43,45,46,48,51,53,56,58,60,63,66,69,72,75,79,83];
// The paper has uncalibrated axes. These are the plotted positions from the paper,
// rescaled proportionally to fit the SVG. They are not measurement values.
const sourcePoints = [
  [26,93],[29,84],[38,69],[39,77],[44,84],[52,79],[52,69],[59,51],[60,70],
  [67,79],[70,60],[75,70],[76,32],[79,51],[79,42],[84,29],[85,60],[85,69],
  [88,41],[94,41],[95,51],[98,33],[98,20],[104,53],[104,41],[107,23],[113,20],
];
const pointValues = [
  [22,30,18,36,33,26,40,31,42,48,33,48,52,46,55,50,64,51,66,57,69,66,59,73,64,81],
  [71,60,75,56,67,59,76,48,66,65,49,63,43,52,42,64,39,58,53,47,52,35,54,43,32,40],
  [43,36,53,41,62,39,51,50,34,56,48,61,37,58,58,39,55,59,53,61,48,69,57,64,53,77],
];
export function autumn2005AmScatter(index: number) {
  return index === 0
    ? sourcePoints.map(([x, y]) => [Math.round(x * 0.78), Math.round(y * 0.78)] as const)
    : xValues.map((x, i) => [x, pointValues[index - 1][i]] as const);
}

const specifications = {
  '57-network': (index: number) => {
    const { start, branches } = autumn2005AmRoute(index);
    return `端末${start}とルータ${start}は同じLANに接続される。ルータ${start}から専用線が2本延び，ルータ${branches[0]}とルータ${branches[1]}へそれぞれ接続する。各分岐先で同じ文字の端末とルータが同じLANに接続される。`;
  },
  '77-scatter': (index: number) => {
    const points = autumn2005AmScatter(index);
    return '横軸が製造上の要因x，縦軸が品質特性yの散布図。原点を0とする。図の中での相対的な座標は' +
      points.map(([x, y]) => `（${x}，${y}）`).join('，') + `の${points.length}点。`;
  },
};

export type Autumn2005Am5480FigureName = keyof typeof specifications;
export const autumn2005Am5480Profile = (name: Autumn2005Am5480FigureName) => 'legacy-2005-autumn-am-' + name;

export const legacy2005AutumnAm5480Figures: readonly BookletFigureDefinition[] =
  (Object.keys(specifications) as Autumn2005Am5480FigureName[]).map(name => ({
    profile: autumn2005Am5480Profile(name),
    domain: [[0, 3]],
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > 3)
        throw new DataError('FIGURE_PROFILE', '2005年度秋期午前の図の入力域と一致しません');
    },
    alt: ([index]) => specifications[name](index),
  }));

export function autumn2005Am5480Drawing(name: Autumn2005Am5480FigureName, index: number, caption: string) {
  return figure(autumn2005Am5480Profile(name), [index], caption, specifications[name](index));
}
