import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const legacy2015AutumnAm2753Profiles = {
  relation: 'legacy-2015-autumn-am-27-relation',
  branch: 'legacy-2015-autumn-am-47-branch-coverage',
  network: 'legacy-2015-autumn-am-51-arrow-network',
};

const order = '注文番号', item = '商品番号', customer = '顧客番号', quantity = '数量';
export const normalizationCosts = [
  { value: '販売単価', determinant: [order, item] },
  { value: '商品定価', determinant: [item] },
  { value: '注文全体の送料', determinant: [order] },
] as const;
type Relation = { name: string; attributes: readonly string[]; primaryKey: readonly string[] };

export function orderRelations(index: number): Relation[] {
  const { value, determinant } = normalizationCosts[index];
  const detailValues = determinant.length === 2 ? [quantity, value] : [quantity];
  const name = '注文明細';
  return [
    { name: '注文記録', attributes: [order, '注文日', customer, '顧客名', item, '商品名', quantity, value], primaryKey: [] },
    { name, attributes: [order, ...detailValues], primaryKey: [order] },
    { name, attributes: [order, customer, ...detailValues], primaryKey: [order, customer] },
    { name, attributes: [order, customer, item, '顧客名', quantity, value], primaryKey: [order, customer, item] },
    { name, attributes: [order, item, ...detailValues], primaryKey: [order, item] },
  ];
}

export function relationAlt(index: number, option: number): string {
  const { name, attributes, primaryKey } = orderRelations(index)[option];
  const keys = primaryKey.length ? `。実線の下線は${primaryKey.join('，')}` : '';
  return `${name}（${attributes.join('，')}）${keys}`;
}

export const branchConditions = ['A OR B', 'A AND B', '(NOT A) OR B'] as const;
export const arrowEdges = [[1, 2], [2, 3], [2, 4], [2, 5], [3, 6], [4, 6], [5, 6], [6, 7]] as const;
export const arrowDummies = [[3, 4], [4, 5]] as const;
export const arrowDays = [
  [30, 5, 30, 20, 40, 25, 30, 30],
  [25, 5, 30, 20, 40, 25, 30, 30],
  [30, 5, 30, 20, 60, 25, 30, 30],
  [30, 5, 30, 20, 40, 40, 30, 30],
] as const;

export function branchAlt(index: number): string {
  return `流れ図。上から判定「${branchConditions[index]}」へ進む。真の経路は下の命令を実行する。偽の経路は右に進んで命令を迂回し、その下で合流する。`;
}

export function arrowAlt(index: number): string {
  const activities = arrowEdges.map(([start, end], edge) => `${start}から${end}へ${arrowDays[index][edge]}日`).join('、');
  return `アローダイアグラム。左から節点1、2、中央上に3、中央に4、中央下に5、右に6、右端に7。実線の作業は${activities}。破線のダミー作業は3から4と4から5。実線の数字は所要日数。`;
}

function definition(profile: string, count: number, describe: (index: number) => string): BookletFigureDefinition {
  return {
    profile,
    domain: [[0, count - 1]],
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= count) throw Error('PARAMETER_CONSTRAINT');
    },
    alt: ([index]) => describe(index),
  };
}

export const legacy2015AutumnAm2753Figures: readonly BookletFigureDefinition[] = [
  {
    profile: legacy2015AutumnAm2753Profiles.relation,
    domain: [[0, normalizationCosts.length - 1], [0, 4]],
    validate([index, option, ...extra]) {
      if (extra.length || !Number.isSafeInteger(index) || index < 0 || index >= normalizationCosts.length ||
        !Number.isSafeInteger(option) || option < 0 || option > 4) throw Error('PARAMETER_CONSTRAINT');
    },
    alt: ([index, option]) => relationAlt(index, option),
  },
  definition(legacy2015AutumnAm2753Profiles.branch, branchConditions.length, branchAlt),
  definition(legacy2015AutumnAm2753Profiles.network, arrowDays.length, arrowAlt),
];
