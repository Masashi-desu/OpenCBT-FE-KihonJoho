import { figure, p, strings } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { finite, original } from './legacy-2005-spring-am-27-53-shared';

function managed<T extends { alt: string }>(profile: string, caption: string, read: (index: number) => T) {
  const panel = (values: number[]) => read(selectCase(values, 4));
  const validate = (values: number[]) => { selectCase(values, 4); };
  const alt = (values: number[]) => panel(values).alt;
  const definition = { profile, domain: [[0, 3]], validate, alt } as const satisfies BookletFigureDefinition;
  return { ...definition, panel, block: (index: number) => figure(profile, [index], caption, alt([index])) };
}

export const entities = {
  product: '商品',
  supplier: '仕入先',
  orderLine: '発注明細',
  order: '発注',
  delivery: '納品',
  deliveryLine: '納品明細',
} as const;
export type Entity = keyof typeof entities;
type Edge = { from: Entity; to: Entity; twoWay?: boolean };

const orders: readonly Edge[][] = [
  [{ from: 'product', to: 'supplier', twoWay: true }, { from: 'supplier', to: 'order' }, { from: 'order', to: 'orderLine' }],
  [{ from: 'supplier', to: 'product' }, { from: 'supplier', to: 'order', twoWay: true }, { from: 'order', to: 'orderLine' }],
  [{ from: 'product', to: 'supplier', twoWay: true }, { from: 'supplier', to: 'order', twoWay: true }, { from: 'orderLine', to: 'order' }],
  [{ from: 'product', to: 'supplier', twoWay: true }, { from: 'supplier', to: 'order', twoWay: true },
    { from: 'order', to: 'orderLine' }, { from: 'orderLine', to: 'deliveryLine' }],
];

const sharedEdges: readonly Edge[] = [
  { from: 'product', to: 'orderLine' }, { from: 'product', to: 'deliveryLine' },
  { from: 'supplier', to: 'delivery' }, { from: 'order', to: 'delivery' },
  { from: 'delivery', to: 'deliveryLine' },
];

export const erNotation = {
  one: 'エンティティAのデータ1個に対して，エンティティBのデータがn個（n≧0）対応し，また，エンティティBのデータ1個に対して，エンティティAのデータが1個対応する。',
  many: 'エンティティAのデータ1個に対して，エンティティBのデータがn個（n≧0）対応し，また，エンティティBのデータ1個に対して，エンティティAのデータがm個（m≧0）対応する。',
};
export const relationFigure = managed('legacy-2005-spring-am-41-entity-relationships', '表記法とE-R図', index => {
  const edges = [...orders[index], ...sharedEdges];
  return {
    edges,
    alt: ['表記法：A→B。' + erNotation.one, 'A↔B。' + erNotation.many,
      'E-R図：' + edges.map(({ from, to, twoWay }) => entities[from] + (twoWay ? '↔' : '→') + entities[to]).join('、') + '。'].join('\n'),
  };
});

const history = [
  { detected: [8, 18, 36, 67, 82, 86, 86, 86], untested: [98, 91, 74, 59, 45, 38, 38, 38], unresolved: [7, 10, 18, 11, 8, 12, 12, 12] },
  { detected: [8, 15, 31, 54, 68, 72, 72, 72], untested: [98, 90, 72, 57, 36, 26, 13, 0], unresolved: [7, 10, 17, 16, 13, 10, 5, 0] },
  { detected: [8, 15, 31, 45, 52, 61, 73, 86], untested: [98, 90, 72, 55, 39, 33, 33, 33], unresolved: [7, 10, 18, 15, 16, 21, 31, 46] },
  { detected: [8, 18, 31, 45, 52, 60, 69, 78], untested: [98, 90, 72, 55, 45, 37, 28, 19], unresolved: [7, 9, 14, 16, 12, 6, 3, 0] },
];

export const seriesLabels = { detected: 'バグ検出数', untested: '未消化テスト項目数', unresolved: '未解決バグ数' } as const;
export type Series = keyof typeof seriesLabels;
const finalRegion = [
  '後半は3本すべて横ばい。未消化テスト項目数と未解決バグ数は0より上。',
  '後半、バグ検出数は横ばい。未消化テスト項目数と未解決バグ数はともに減少して、0に達する。',
  '後半、バグ検出数は増加し、未消化テスト項目数は横ばい、未解決バグ数は増加する。',
  '後半、バグ検出数は増加し、未消化テスト項目数はそれと同じ傾きの大きさで減少する。未解決バグ数は0に達する。',
];
export const defectFigure = managed('legacy-2005-spring-am-45-defect-progress', 'バグ管理図', index => ({
  series: history[index], alt: '横軸は時間。縦軸はテスト項目数とバグ数。上昇するバグ検出数の線と下降する未消化テスト項目数の線が途中で交差する。未解決バグ数の線は前半で増えた後に減る。' + finalRegion[index],
}));

export const legacy2005SpringAm2753Figures = [relationFigure, defectFigure] as const;

const relationReasons = [
  '仕入先から発注への片向きの矢印は、発注一件に対して仕入先一件を表す。商品と仕入先は多対多で、発注には複数の発注明細が対応し得る。発注明細と納品明細の1対1を定める線はない。',
  '仕入先から商品への片向きの矢印では、商品一件から見た仕入先は一件である。仕入先と発注は両矢印になっているため、一つの発注に複数の仕入先が対応し得る。',
  '発注明細から発注への片向きの矢印は、発注一件に対して発注明細一件を表す。発注明細一件に対応する商品も一件なので、一つの発注で扱う商品は一種類である。',
  '発注明細から納品明細への片向きの矢印は、納品明細一件に対して発注明細一件を表す。発注から発注明細への線は、発注一件に複数の明細が対応し得ることを示す。',
];

const defectReasons = [
  '横ばいの間、テストの残りは0より多いままで、新たに消化した項目はない。未解決バグも残っているので、バグの解決待ちでテストが止まっている可能性がある。図は停滞の原因までは特定しない。',
  'テストの残りは減っているので、項目が消化されている。バグ検出数が横ばいで、新たな検出はない。未解決バグも減少している。',
  'テストの残りが変わらないので、テスト項目の消化は進んでいない。バグ検出数と未解決バグ数は増えており、未消化の項目の実行中などにバグの検出が続いている。',
  '後半ではバグ検出数の増加と未消化テスト項目数の減少は同じペースである。未解決バグ数の線は最後に横軸へ達するので、未解決件数は0と読める。',
];

export const figureDefinitions = [
  finite(41, '商品の仕入れと発注・納品における関係の多重度', 'エ',
    '片矢印（反対側が1）と両矢印の原凡例を図内に保つ。商品・仕入先・発注・明細間の多重度を変え、四つの制約の成立を図と対応させる。', index => {
      const choices = [...original(41).choices];
      if (index === 3) choices[1] = '一つの納品明細は，必ず一つの発注明細に対応する。';
      return { prompt: [p(original(41).prompt), relationFigure.block(index)], choices: strings(choices),
        correctIndex: [3, 0, 2, 1][index], explanation: relationReasons[index] };
    }),
  finite(45, '時間に対するテスト項目とバグの推移', 'ア',
    '時間と三系列の原図を保持し、後半のテスト消化・新規検出・解決状況が異なる四つを出題する。図は原因の断定を求めず、既知の未解決件数と変化を推測に使う。', index => {
      const choices = [...original(45).choices];
      if (index > 0) {
        choices[1] = 'テスト項目の消化が進んでおり，後半に新たなバグが検出されていない。';
        choices[3] = '後半に新たに検出したバグ数と消化したテスト項目数が同じペースで変化し，未解決バグがなくなった。';
      }
      const stem = index === 0 ? original(45).prompt
        : 'バグ管理図において，図のようにバグ数と未消化テスト項目数が推移している。この状況から推測できることとして，適切なものはどれか。';
      return { prompt: [p(stem), defectFigure.block(index)], choices: strings(choices), correctIndex: index,
        explanation: defectReasons[index] };
    }),
];
