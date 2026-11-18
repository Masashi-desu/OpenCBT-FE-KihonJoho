import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const arrowCases = [
  { days: [5, 3, 5, 10, 5, 12, 3, 6], shortenedD: 6 },
  { days: [6, 4, 4, 9, 4, 12, 4, 6], shortenedD: 5 },
  { days: [4, 4, 6, 11, 5, 14, 2, 7], shortenedD: 6 },
  { days: [5, 5, 6, 11, 5, 12, 3, 5], shortenedD: 7 },
] as const;

const route = [[1, 2], [2, 4], [2, 3], [3, 4], [4, 5], [3, 6], [5, 7], [6, 7], [5, 6]] as const;
export function arrowEdges(index: number) {
  return route.map(([from, to], position) => ({
    from, to, days: arrowCases[index].days[position] ?? 0,
    label: 'ABCDEFGH'[position] ? '作業' + 'ABCDEFGH'[position] : 'ダミー作業',
    dummy: position === 8,
  }));
}

type Relation = { label: string; fields: readonly string[]; underlined: readonly number[] };
export const relationCases: readonly { situation: string; tables: readonly Relation[]; references: readonly (readonly [number, number])[] }[] = [
  {
    situation: '事務室が複数の建物に分散している会社で，パソコンの設置場所を管理するデータベースを作ることになった。',
    tables: [
      { label: '資産', fields: ['パソコン番号', '建物番号', '部屋番号', '機種名'], underlined: [0, 1, 2] },
      { label: '部屋', fields: ['建物番号', '部屋番号', '部屋名'], underlined: [0, 1] },
      { label: '建物', fields: ['建物番号', '建物名'], underlined: [0] },
    ],
    references: [[2, 1], [1, 0]],
  },
  {
    situation: '複数の地区に校舎をもつ学校で，教室の所在を管理するデータベースを作ることになった。',
    tables: [
      { label: '地区', fields: ['地区番号', '地区名'], underlined: [0] },
      { label: '教室', fields: ['教室番号', '地区番号', '校舎番号', '教室名'], underlined: [0, 1, 2] },
      { label: '校舎', fields: ['地区番号', '校舎番号', '校舎名'], underlined: [0, 1] },
    ],
    references: [[0, 2], [2, 1]],
  },
  {
    situation: '施設で利用者の借用申請と，その申請に基づく備品の貸出しを管理するデータベースを作ることになった。',
    tables: [
      { label: '申請', fields: ['利用者番号', '申請番号', '申請日'], underlined: [0, 1] },
      { label: '利用者', fields: ['利用者番号', '氏名'], underlined: [0] },
      { label: '貸出', fields: ['貸出番号', '利用者番号', '申請番号', '貸出日'], underlined: [0, 1, 2] },
    ],
    references: [[1, 0], [0, 2]],
  },
  {
    situation: '複数の事業部で別々の製品を扱う会社で，製造部門が取り扱う製品の販売を管理するデータベースを作ることになった。',
    tables: [
      { label: '販売', fields: ['販売番号', '部門番号', '製品番号', '販売日'], underlined: [0, 1, 2] },
      { label: '部門', fields: ['部門番号', '部門名'], underlined: [0] },
      { label: '製品', fields: ['部門番号', '製品番号', '製品名'], underlined: [0, 1] },
    ],
    references: [[1, 2], [2, 0]],
  },
];

export const arrowDiagram: BookletFigureDefinition = {
  profile: 'legacy-2004-autumn-am-54-arrow',
  domain: [[0, 3]],
  validate() {},
  alt: ([index]) => '結合点1から結合点7までの作業の矢印。' + arrowEdges(index).map(({ from, to, label, days, dummy }) =>
    from + 'から' + to + 'は' + label + (dummy ? '（点線，0日）' : '（' + days + '日）')).join('。') + '。',
};

export const relationDiagram: BookletFigureDefinition = {
  profile: 'legacy-2004-autumn-am-70-relations',
  domain: [[0, 3]],
  validate() {},
  alt: ([index]) => relationCases[index].tables.map(({ label, fields, underlined }) =>
    label + '表：' + fields.map((field, ordinal) => field + (underlined.includes(ordinal) ? '（下線）' : '')).join('，')).join('。') + '。',
};
export const legacy2004AutumnAm5480Figures = [arrowDiagram, relationDiagram] as const;
