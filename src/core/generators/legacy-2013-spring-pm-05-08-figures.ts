import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import {
  spring2013Pm7Sales, spring2013Pm7Years, spring2013Pm8Evaluate, spring2013Pm8Input,
} from './legacy-2013-spring-pm-05-08-model';
import {
  spring2013Pm8AddCondition, spring2013Pm8Declarations, spring2013Pm8Program, spring2013Pm8UpdateProgram,
} from './legacy-2013-spring-pm-05-08-programs';

export const spring2013Pm5RecordLayouts = {
  '5-master-layout': { fields: ['証券番号', '契約年月日', '終了年月日', '月払保険料', '保障額', '社員ID', '満了年月日'], keyCount: 1 },
  '5-change-layout': { fields: ['異動年月日', '証券番号', '異動事由', '月払保険料', '保障額', '社員ID', '満了年月日'], keyCount: 2 },
  '5-pay-layout': { fields: ['支給年月', '社員ID', '歩合給額'], keyCount: 2 },
} as const;
const keyAlt = (id: keyof typeof spring2013Pm5RecordLayouts) => {
  const { fields, keyCount } = spring2013Pm5RecordLayouts[id];
  return fields.join('｜') + '。注記　下線はキー項目を表す。下線は' + fields.slice(0, keyCount).join('と') + '。';
};

export const spring2013Pm8PurchaseColumns = ['ptr', '品番', '品名', '単価', '数量', '金額'];
export const spring2013Pm8SpecialColumns = ['品番', '品名', '単価', '数量'];
export function spring2013Pm8PurchaseFigure(variant: number, after: boolean) {
  const input = spring2013Pm8Input(variant);
  const result = after ? spring2013Pm8Evaluate(input.rows, input.head, input.promo) : input;
  return { head: result.head, length: result.rows.length, headChanged: result.head !== input.head, lengthChanged: result.rows.length !== input.rows.length,
    rows: result.rows.map((row, i) => ({
      values: [row.ptr, row.code, row.name, row.price, row.count, row.price * row.count].map(String),
      changed: !input.rows[i] ? [0, 1, 2, 3, 4, 5] : input.rows[i].ptr !== row.ptr ? [0] : [],
    })),
  };
}
export function spring2013Pm8SpecialFigure(variant: number, after: boolean) {
  const { rows, head, promo } = spring2013Pm8Input(variant);
  const result = after ? spring2013Pm8Evaluate(rows, head, promo) : { targets: promo.targets.map(() => 0), count: 0 };
  return { designated: promo.designated, length: promo.targets.length,
    targets: promo.targets.map((code, i) => ({ code, count: result.targets[i] })),
    special: [promo.code, promo.name, promo.price, result.count].map(String),
    countChanged: result.count !== 0,
  };
}
const purchaseAlt = (variant: number, after: boolean) => {
  const { head, length, rows, headChanged, lengthChanged } = spring2013Pm8PurchaseFigure(variant, after);
  const mark = (value: number | string, changed: boolean) => value + (changed ? '（網掛け）' : '');
  return [
    'ptr起点｜' + mark(head, headChanged), '購入行数｜' + mark(length, lengthChanged), spring2013Pm8PurchaseColumns.join('｜'),
    ...rows.map(({ values, changed }, i) => '購入[' + (i + 1) + ']｜' + values.map((value, j) => mark(value, changed.includes(j))).join('｜')),
    '…（後続の空欄）',
  ].join('\n');
};
const specialAlt = (variant: number, after: boolean) => {
  const { designated, length, targets, special, countChanged } = spring2013Pm8SpecialFigure(variant, after);
  return [
    '指定数量｜' + designated, '対象行数｜' + length, '品番｜数量',
    ...targets.map(({ code, count }, i) => '対象[' + (i + 1) + ']｜' + code + '｜' + count + (count ? '（網掛け）' : '')),
    '…（後続の空欄）', spring2013Pm8SpecialColumns.join('｜'), '特売｜' + special.join('｜') + (countChanged ? '（数量に網掛け）' : ''),
  ].join('\n');
};

type Drawing = { caption: string; max?: number; alt: (variant: number) => string };
export const spring2013Pm0508Drawings = {
  '5-master-layout': { caption: '図1 契約マスタのレコード様式', alt: () => keyAlt('5-master-layout') },
  '5-change-layout': { caption: '図2 異動ファイルのレコード様式', alt: () => keyAlt('5-change-layout') },
  '5-pay-layout': { caption: '図4 歩合給ファイルのレコード様式', alt: () => keyAlt('5-pay-layout') },
  '5-update-workflow': { caption: '図3 契約マスタ更新処理の流れ', alt: () =>
    '異動ファイルを処理1に入力。左から処理1、処理2、中間ファイルT1、処理3、新契約マスタが接続。旧契約マスタも処理3に入力。' },
  '5-pay-workflow': { caption: '図5 歩合給計算処理の流れ', alt: () =>
    '契約マスタを処理4に入力。左から処理4、処理5、中間ファイルT2、処理6、歩合給ファイルが接続。' },
  '5-merge-flow': { caption: '図6 処理3の流れ図', alt: () => [
    '開始。T1から1レコードを読み込む。旧契約マスタから1レコードを読み込む。',
    '突合せの繰返しの終了条件は（旧契約マスタ＝EOF）かつ（T1＝EOF）。',
    'T1≠EOF：Noなら［e］へ。Yesなら旧契約マスタ≠EOFを判定。',
    '旧契約マスタ≠EOF：Noなら［g］へ。YesならT1の証券番号と旧契約マスタの証券番号を比較。',
    'T1の証券番号が大きければ［e］、等しければ［f］、小さければ［g］。',
    '［e］の後は旧契約マスタから1レコードを読み込む。',
    '［f］の後はT1から1レコードを読み込んでから旧契約マスタから1レコードを読み込む。',
    '［g］の後はT1から1レコードを読み込む。各分岐から突合せの末尾に合流し、終了条件まで繰り返す。終了。',
  ].join('\n') },
  '7-market-chart': { caption: '図1 2002～2011年の各国における清涼飲料の年間販売数量の推移', max: 3, alt: (variant: number) => {
    const { rows } = spring2013Pm7Sales(variant);
    return ['折れ線グラフ。縦軸は百万箱（0～200、20刻み）、横軸は年。' +
      (variant === 0 ? '図の目盛りから読み取った概数。C国の2010・2011年は表1の値。' : ''),
    '年｜' + spring2013Pm7Years.join('｜'), ...rows.map((row, i) => 'ABCDE'[i] + '国（' +
      ['黒ひし形', '白四角', '黒丸', '白ひし形', '黒三角'][i] + '）｜' + row.join('｜'))].join('\n');
  } },
  '8-declarations': { caption: '購入情報・特売情報の大域宣言', alt: () => spring2013Pm8Declarations },
  '8-purchases-before': { caption: '図1 購入情報のデータ例', max: 3, alt: (variant: number) => purchaseAlt(variant, false) },
  '8-special-before': { caption: '図2 特売情報のデータ例', max: 3, alt: (variant: number) => specialAlt(variant, false) },
  '8-purchases-after': { caption: '図3 図1の購入情報のデータ例（実行後）', max: 3, alt: (variant: number) => purchaseAlt(variant, true) },
  '8-special-after': { caption: '図4 図2の特売情報のデータ例（実行後）', max: 3, alt: (variant: number) => specialAlt(variant, true) },
  '8-program': { caption: '選択型特売のプログラム', alt: () =>
    spring2013Pm8Program + '\n更新部の「特売.数量 > 0」は点線枠。' },
  '8-add-condition': { caption: '点線枠を置き換える条件式', alt: () => spring2013Pm8AddCondition },
  '8-update-program': { caption: 'プログラムの末尾に追加する処理', alt: () => spring2013Pm8UpdateProgram },
} satisfies Record<string, Drawing>;
export type Spring2013Pm0508Drawing = keyof typeof spring2013Pm0508Drawings;
export const spring2013Pm0508Profile = (id: Spring2013Pm0508Drawing) => 'legacy-2013-spring-pm-' + id;
const drawingIds = Object.keys(spring2013Pm0508Drawings) as Spring2013Pm0508Drawing[];
export const legacy2013SpringPm0508Figures: BookletFigureDefinition[] = drawingIds.map(id => {
  const { alt, max = 0 }: Drawing = spring2013Pm0508Drawings[id];
  return { profile: spring2013Pm0508Profile(id), domain: [[0, max]],
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > max) throw Error('FIGURE_PROFILE');
    },
    alt: ([variant]) => alt(variant),
  };
});
export function spring2013Pm0508Figure(id: Spring2013Pm0508Drawing, variant = 0) {
  const { caption, alt, max = 0 }: Drawing = spring2013Pm0508Drawings[id];
  const input = max ? variant : 0;
  return figure(spring2013Pm0508Profile(id), [input], caption, alt(input));
}
