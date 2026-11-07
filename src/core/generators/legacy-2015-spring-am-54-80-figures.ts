import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { planningSalesAlt, planningSalesValues } from './legacy-2017-autumn-planning-model';

export const spring2015Am54Profile = 'legacy-2015-spring-am-54-arrow-network';
export const spring2015Am64Profile = 'legacy-2015-spring-am-64-sales-time';
export const spring2015Am54Durations = [
  [3, 6, 8, 6, 5, 14, 11, 15, 5], [4, 7, 10, 4, 4, 16, 10, 15, 7],
  [2, 4, 10, 5, 7, 12, 10, 16, 5], [2, 4, 7, 6, 5, 16, 9, 13, 3],
  [4, 7, 10, 7, 4, 16, 9, 16, 4], [5, 4, 6, 7, 6, 14, 11, 15, 5],
  [1, 8, 10, 6, 4, 16, 9, 15, 3], [3, 4, 6, 5, 3, 12, 10, 13, 4],
] as const;

export function spring2015Am5480Condition(values: readonly number[], size: number) {
  const descriptor = Object.getOwnPropertyDescriptor(values, '0');
  if (!Array.isArray(values) || values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !descriptor ||
    !('value' in descriptor) || !Number.isInteger(descriptor.value) || descriptor.value < 0 || descriptor.value >= size)
    throw new Error('PARAMETER_CONSTRAINT');
  return descriptor.value as number;
}

export function spring2015Am54Alt(values: readonly number[]) {
  const [a, b, c, d, e, f, g, h, i] = spring2015Am54Durations[spring2015Am5480Condition(values, spring2015Am54Durations.length)];
  return 'アローダイアグラム。無番号の円が結合点を表す。開始からA ' + a + '日で左の分岐へ進む。' +
    'そこからB ' + b + '日で次の結合点、E ' + e + '日で下の結合点、F ' + f + '日で上を回ってCの終点へ進む。' +
    'Eの終点からBの終点へ破線のダミー作業。Bの終点からC ' + c + '日でCの終点へ、G ' + g +
    '日で上の結合点へ、H ' + h + '日で下を回ってDの終点へ進む。' +
    'Gの終点からCの終点へ破線のダミー作業。Cの終点からD ' + d + '日でDの終点、そこからI ' + i +
    '日で終了。凡例は実線矢印の上が作業名・下が作業日数、破線矢印がダミー作業。';
}

export const legacy2015SpringAm5480Figures: BookletFigureDefinition[] = [
  {
    profile: spring2015Am54Profile, domain: [[0, spring2015Am54Durations.length - 1]],
    validate: values => { spring2015Am5480Condition(values, spring2015Am54Durations.length); }, alt: spring2015Am54Alt,
  },
  {
    profile: spring2015Am64Profile, domain: [[0, 2]],
    validate: values => { spring2015Am5480Condition(values, 3); planningSalesValues(values); }, alt: planningSalesAlt,
  },
];
