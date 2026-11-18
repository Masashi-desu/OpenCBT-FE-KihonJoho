import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

export type SurveyCondition = {
  firstRow: number; ages: readonly {label: string; description: string}[];
  jobs: readonly string[]; purposes: readonly string[];
};

const decade = (first: number) => ({ label: first + '代', description: first + '～' + (first + 9) + '歳' });
const others = (limit: number) => ({ label: 'その他', description: 'その他（9歳以下又は' + limit + '歳以上）' });
export const surveyConditions: readonly SurveyCondition[] = [
  { firstRow: 6, ages: [decade(10), decade(20), decade(30), others(40)],
    jobs: ['学生', '自営業', '会社員', 'その他'], purposes: ['体験', 'セミナ', '展示', 'その他'] },
  { firstRow: 5, ages: [decade(10), { label: '20～39歳', description: '20～39歳' }, others(40)],
    jobs: ['学生', '就業者', 'その他'], purposes: ['体験', '展示', 'その他'] },
  { firstRow: 7, ages: [decade(10), decade(20), decade(30), decade(40), others(50)],
    jobs: ['学生', '自営業', '会社員', '公務員', 'その他'], purposes: ['体験', 'セミナ', '展示', '相談', 'その他'] },
  { firstRow: 4, ages: [decade(10), decade(20), decade(30), decade(40), decade(50), others(60)],
    jobs: ['学生', '自営業', '会社員', '公務員', '無職', 'その他'], purposes: ['体験', 'セミナ', '展示', '相談', '実演', 'その他'] },
];

export const stockConditions = [
  { key: 2, products: [1, 3, 5, 7, 8, 9, 11, 13], quantities: [100, 300, 500, 700, 800, 90, 110, 130] },
  { key: 16, products: [2, 4, 6, 8, 10, 12, 14, 16], quantities: [90, 120, 160, 200, 310, 330, 440, 580] },
  { key: 6, products: [3, 5, 6, 10, 12, 19, 24, 27], quantities: [80, 100, 90, 240, 270, 300, 430, 610] },
  { key: 1, products: [4, 8, 11, 16, 18, 21, 25, 28], quantities: [120, 110, 310, 360, 440, 500, 580, 630] },
] as const;

export const formatCells = ['N', '商品番号[1]', '在庫量[1]', '商品番号[2]', '在庫量[2]', '…', '商品番号[N]', '在庫量[N]'];
export const stockCells = (index: number): number[] => {
  const { products, quantities } = stockConditions[index];
  return [products.length, ...products.flatMap((number, i) => [number, quantities[i]])];
};

export const names = ['7-age-form', '7-purpose-form', '9-format', '9-stock-example'] as const;
export type FigureName = typeof names[number];
export const caption: Record<FigureName, string> = {
  '7-age-form': '年代別職業別参加人数表',
  '7-purpose-form': '職業別目的別参加人数表',
  '9-format': '在庫表の様式',
  '9-stock-example': '設問2　GR1とGR2の設定',
};
export const profile = (name: FigureName) => 'legacy-2005-spring-pm-' + name;

export function description(name: FigureName, index: number): string {
  const { ages, jobs, purposes, firstRow } = surveyConditions[index];
  switch (name) {
    case '7-age-form': return caption[name] + '。用紙の' + (firstRow - 2) + '行目に列見出し' +
      [...jobs, '合計'].join('、') + 'がある。' + ages.map(({label}, i) => (firstRow + i * 2) + '行目は' + label).join('、') +
      '。各明細行の職業別人数及び合計の欄に zzz,zz9 の位置を示す。明細行の間に空行が一つある。';
    case '7-purpose-form': return caption[name] + '。列は' + [...purposes, '合計'].join('、') + '。行見出しは' +
      jobs.join('、') + '。人数の印字欄は空白。';
    case '9-format': return '1語ずつ左から ' + formatCells.join('｜') + ' の一行。Nは商品数。';
    case '9-stock-example': return 'GR1は ' + stockConditions[index].key + '。GR2は在庫表の先頭語を指す。左から1語ずつ ' +
      stockCells(index).join('｜') + '。';
  }
}

export const draw = (name: FigureName, index: number) => figure(profile(name), [index], caption[name], description(name, index));
export const legacy2005SpringPm0609Figures: readonly BookletFigureDefinition[] = names.map(name => ({
  profile: profile(name), domain: [[0, 3]],
  validate(values) { selectCase(values, 4); },
  alt: values => description(name, selectCase(values, 4)),
}));
