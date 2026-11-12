import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex, source } from './legacy-2008-spring-am-01-26-shared';

export const profiles = {
  scatter: 'legacy-2008-spring-am-8-scatter',
  logic: 'legacy-2008-spring-am-9-logic-expression',
  gcd: 'legacy-2008-spring-am-15-gcd-flow',
} as const;
export const correlations = [0.9, 0.7, -0.9, -0.7] as const;
const xValues = [-5, -3, -1, 1, 3, 5] as const;
const deviations = [1, -2, 1, -1, 2, -1] as const;
const energy = (values: readonly number[]) => values.reduce((sum, x) => sum + x * x, 0);
export function scatter(index: number) {
  const r = correlations[index], direction = r > 0 ? 1 : -1;
  const spread = Math.sqrt(energy(xValues) * (1 / (r * r) - 1) / energy(deviations));
  return { direction, points: xValues.map((x, i) => [x, direction * x + spread * deviations[i]] as const) };
}
type Kind = keyof typeof profiles;
const descriptors: Record<Kind, { count: number; alt: (index: number) => string }> = {
  scatter: { count: 4, alt: index => '横軸 x，縦軸 y。回帰直線と6個の点。' + source[8].choices[index] },
  logic: { count: 4, alt: index => source[9].choices[index] },
  gcd: { count: 1, alt: () => source[15].material },
};

export const legacy2008SpringAm0126Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => {
  const { count, alt } = descriptors[kind];
  return {
    profile: profiles[kind], domain: [[0, count - 1]],
    validate: values => { finiteIndex(values, count, 'FIGURE_PROFILE'); },
    alt: values => alt(finiteIndex(values, count, 'FIGURE_PROFILE')),
  };
});
export function draw(kind: Kind, index: number, caption: string) {
  const { count, alt } = descriptors[kind];
  const values = [index];
  finiteIndex(values, count, 'FIGURE_PROFILE');
  return { ...figure(profiles[kind], values, caption, alt(index)), captionPresentation: 'accessible' as const };
}
