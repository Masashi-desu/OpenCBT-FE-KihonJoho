import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { decodedChoiceRuns, imageCases, imageRows } from './legacy-2009-spring-pm-01-04-models';

export const profiles = {
  pixelPicture: 'legacy-2009-spring-pm-1-pixel-picture',
  bitGrid: 'legacy-2009-spring-pm-1-bit-grid',
  codeFormat: 'legacy-2009-spring-pm-1-code-format',
  recipeEr: 'legacy-2009-spring-pm-3-recipe-er',
  network: 'legacy-2009-spring-pm-4-network',
} as const;

export function pixelRows(value: number) {
  const index = Math.floor(value / 5), position = value % 5;
  return imageRows(position === 0 ? imageCases[index].example : decodedChoiceRuns(index)[position - 1]);
}

export const erOptions = [
  { from: '分量', to: '商品', relation: '料理', cardinality: '1対1' },
  { from: '料理', to: '商品', relation: '分量', cardinality: '多対多' },
  { from: '料理', to: '分量', relation: '商品', cardinality: '1対1' },
] as const;

type Kind = keyof typeof profiles;
const descriptors: Record<Kind, { count: number; alt: (index: number) => string }> = {
  pixelPicture: { count: imageCases.length * 5, alt: value => {
    const rows = pixelRows(value);
    return '上から' + rows.length + '行、左から8列。白は0，黒は1。各行：' + rows.join('／') + '。';
  } },
  bitGrid: { count: imageCases.length, alt: index =>
    '上から8行、各行は左から8ビット。各行：' + imageRows(imageCases[index].example).join('／') + '。' },
  codeFormat: { count: 1, alt: () =>
    '左から（a）けた数情報（m−2）ビット，（b）区切り1ビット，（c）ランレングス情報mビット。' },
  recipeEr: { count: erOptions.length, alt: index => {
    const { from, to, relation, cardinality } = erOptions[index];
    return from + 'と' + to + 'の間を' + (cardinality === '多対多' ? '両方向矢印' : '矢印のない直線') +
      'で接続し，関連名は' + relation + '。関連は' + cardinality + '。';
  } },
  network: { count: 1, alt: () =>
    'インターネットからルータとファイアウォールAを経てDMZに接続する。DMZにWebサーバとメールサーバが接続する。DMZからファイアウォールBを経て社内LANに接続し，社内LANにDBサーバと管理用PCが接続する。' },
};

function validate(kind: Kind, values: number[]) {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
      !Number.isSafeInteger(item.value) || item.value < 0 || item.value >= descriptors[kind].count) throw Error('FIGURE_PROFILE');
}
export const legacy2009SpringPm0104Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => ({
  profile: profiles[kind], domain: [[0, descriptors[kind].count - 1]], validate: values => validate(kind, values),
  alt: values => { validate(kind, values); return descriptors[kind].alt(values[0]); },
}));

export function draw(kind: Kind, index: number, caption: string) {
  const values = [index];
  validate(kind, values);
  return figure(profiles[kind], values, caption, descriptors[kind].alt(index));
}
