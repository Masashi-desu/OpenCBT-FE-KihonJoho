import { DataError } from '../errors';
import { figure } from './definition';

const cases = [
  { tables: [['資産', ['PC番号','建物番号','部屋番号','機種名'], 3], ['部屋', ['建物番号','部屋番号','部屋名'], 2], ['建物', ['建物番号','建物名'], 1]],
    story: '', dependency: ['建物','部屋','資産'] },
  { tables: [['荷物', ['荷物番号','便番号','伝票番号','品名'], 3], ['運送便', ['便番号','出発地'], 1], ['伝票', ['便番号','伝票番号','荷送人'], 2]],
    story: '配送業者は荷物を運送便ごとの伝票で管理する。“荷物”，“運送便”，“伝票”の三つの表を作成した。伝票は便番号と伝票番号の組で識別する。',
    dependency: ['運送便','伝票','荷物'] },
  { tables: [['受講者', ['研修番号','開催番号','社員番号','出席状況'], 3], ['研修', ['研修番号','講座名'], 1], ['開催', ['研修番号','開催番号','開催日'], 2]],
    story: '研修ごとの開催回と，各回の受講者を管理する。“受講者”，“研修”，“開催”の三つの表を作成した。開催回は研修番号と開催番号の組で識別する。',
    dependency: ['研修','開催','受講者'] },
  { tables: [['商品', ['店舗番号','棚番号','商品番号','商品名'], 3], ['売場棚', ['店舗番号','棚番号','棚の区分'], 2], ['店舗', ['店舗番号','店舗名'], 1]],
    story: '店舗ごとの売場棚と，各棚に置く商品を管理する。“商品”，“売場棚”，“店舗”の三つの表を作成した。売場棚は店舗番号と棚番号の組で識別する。',
    dependency: ['店舗','売場棚','商品'] },
] as const;
export const spring2007AmSchemas = (index: number) => cases[index];

export const routeCosts = [
  [6,5,2, 8,8,7,4,6,5,6,8,10, 10,11,7,5,8,3, 4,7],
  [8,4,3, 6,10,8,8,7,4,7,8,11, 8,11,4,7,9,3, 5,8],
  [6,5,4, 9,6,8,4,8,5,4,8,11, 5,11,7,6,9,4, 4,7],
  [3,6,4, 5,7,9,8,4,7,6,5,6, 10,7,4,8,7,5, 4,6],
];
const arcEnds: readonly (readonly [number, number])[] = [
  [0,1],[0,2],[0,3],[1,4],[1,5],[1,6],[2,4],[2,5],[2,6],[3,4],[3,5],[3,6],
  [4,7],[4,8],[5,7],[5,8],[6,7],[6,8],[7,9],[8,9],
];
export const routeNode = (value: number) => value === 0 ? '出発地' : value === 9 ? '目的地' : '中継地' + value;
export const spring2007AmRoutes = (index: number) =>
  arcEnds.map(([from, to], i) => ({ from, to, cost: routeCosts[index][i] }));
const validate = ([index, ...rest]: number[]) => {
  if (rest.length || !Number.isSafeInteger(index) || index < 0 || index > 3)
    throw new DataError('PARAMETER_CONSTRAINT', '2007年度春期旧午前の入力が範囲外です');
};
const domain = [[0, 3]] as const;
const schemaAlt = ([index]: number[]) => spring2007AmSchemas(index).tables.map(([caption, columns, keyCount]) =>
  caption + '：' + columns.map((name, i) => name + (i < keyCount ? '（下線）' : '')).join('、')).join('\n');
const routeAlt = ([index]: number[]) => spring2007AmRoutes(index).map(({ from, to, cost }) =>
  routeNode(from) + '→' + routeNode(to) + '：' + cost).join('。');
export const legacy2007SpringAm5480Figures = [
  { profile: 'legacy-2007-spring-am-63-schema', domain, validate, alt: schemaAlt },
  { profile: 'legacy-2007-spring-am-78-routes', domain, validate, alt: routeAlt },
];
export function spring2007Am5480Figure(number: 63 | 78, index: number, caption: string) {
  const definition = legacy2007SpringAm5480Figures[number === 63 ? 0 : 1];
  return figure(definition.profile, [index], caption, definition.alt([index]));
}
