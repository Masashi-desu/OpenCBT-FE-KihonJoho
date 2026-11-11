import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2009-spring-am-01-26-shared';

export const profiles = {
  logicExpression: 'legacy-2009-spring-am-3-logic-expression',
  translation: 'legacy-2009-spring-am-22-translation',
  gateLegend: 'legacy-2009-spring-am-24-gate-legend',
  gateTarget: 'legacy-2009-spring-am-24-gate-target',
  gateChoice: 'legacy-2009-spring-am-24-gate-choice',
  adder: 'legacy-2009-spring-am-25-half-adder',
} as const;

export const transferCases = [
  { steps: ['a', 'b', 'c'], extra: '', description: '' },
  { steps: ['b', 'c', 'a'], extra: '補助ライブラリ', description: '既存のライブラリに加え，補助ライブラリも同じリンカに入力する。' },
  { steps: ['c', 'a', 'b'], extra: '別に翻訳した目的プログラム', description: '別に翻訳済みの目的プログラムもリンカへ渡す。' },
  { steps: ['c', 'b', 'a'], extra: '起動用ライブラリ', description: '起動用のライブラリと共通のライブラリを同じリンカへ渡す。' },
] as const;
export const targetWiring = [
  { topInverted: false, lower: 'B', lowerInverted: true, expression: '(A・B)＋NOT(B)' },
  { topInverted: true, lower: 'B', lowerInverted: true, expression: '(NOT(A)・B)＋NOT(B)' },
  { topInverted: false, lower: 'A', lowerInverted: false, expression: '(A・B)＋A' },
  { topInverted: false, lower: 'A', lowerInverted: true, expression: '(A・B)＋NOT(A)' },
] as const;
export const choiceExpressions = [
  'NOT(A・B)', 'A＋NOT(B)', 'A＋(A・B)', 'NOT(A・NOT(B))',
];
export const adderWiring = [
  { upper: 'z', lower: 'c', inversion: '' }, { upper: 'c', lower: 'z', inversion: '' },
  { upper: 'z', lower: 'c', inversion: 'A' }, { upper: 'z', lower: 'c', inversion: 'B' },
] as const;

type Operator = '＋' | '・';
type Atom = { name: 'A' | 'B' | 'C'; negated: boolean };
type Pair = readonly [Atom, Atom];
const swapOperator = (operator: Operator): Operator => operator === '＋' ? '・' : '＋';
const atom = (name: Atom['name'], negated = false): Atom => ({ name, negated });
const opposite = (pair: Pair): Pair => [{ ...pair[0], negated: !pair[0].negated }, { ...pair[1], negated: !pair[1].negated }];

function expression(left: Pair, leftOp: Operator, outerOp: Operator, right: Pair, rightOp: Operator, complement = false) {
  const literal = ({ name, negated }: Atom) => negated ? 'NOT(' + name + ')' : name;
  const pair = (items: Pair, op: Operator) => {
    const inner = items.map(literal).join(op);
    return outerOp === '・' && op === '＋' ? '(' + inner + ')' : inner;
  };
  const text = pair(left, leftOp) + outerOp + pair(right, rightOp);
  return complement ? 'NOT(' + text + ')' : text;
}
export function logicExpressions(index: number) {
  const left: Pair = index === 1 ? [atom('A'), atom('B', true)] : [atom('A', true), atom('B')];
  const right: Pair = index === 1 ? [atom('A', true), atom('C')] : [atom('A'), atom('C', true)];
  const [first, outer, last] = ([
    ['＋', '・', '＋'], ['＋', '＋', '・'], ['・', '＋', '・'], ['・', '・', '＋'],
  ] as const)[index];
  const negatedOuter = swapOperator(outer);
  const all = [
    expression(left, first, outer, right, last, true),
    expression(opposite(left), swapOperator(first), negatedOuter, opposite(right), swapOperator(last)),
    expression(left, swapOperator(first), negatedOuter, right, swapOperator(last)),
    expression(opposite(left), swapOperator(first), outer, opposite(right), swapOperator(last)),
    expression(left, first, outer, right, last),
  ];
  return { all, outer, negatedOuter };
}

type Kind = keyof typeof profiles;
const descriptors: Record<Kind, { count: number; alt: (index: number) => string }> = {
  logicExpression: { count: 20, alt: index => logicExpressions(Math.floor(index / 5)).all[index % 5] },
  translation: { count: transferCases.length, alt: index => {
    const { steps: [compiled, library, executable], extra } = transferCases[index];
    return '原始プログラム→コンパイラ→' + compiled + '→リンカ→' + executable + '→ローダ。' + library +
      'も上からリンカに入力。' + (extra ? extra + 'もリンカに入力。' : '');
  } },
  gateLegend: { count: 1, alt: () => 'D形は論理積（AND）。入力側が曲線の形は論理和（OR）。出力に白丸が付いた三角形は否定（NOT）。' },
  gateTarget: { count: targetWiring.length, alt: index => {
    const { topInverted, lower, lowerInverted, expression } = targetWiring[index];
    return (topInverted ? 'Aを否定した信号' : 'A') + 'とBをANDに入れる。' + lower +
      (lowerInverted ? 'をNOTに入れる。二つのゲートの出力' : 'の信号を直接分岐し，ANDの出力とともに') +
      'をORに入れてXを得る。X＝' + expression;
  } },
  gateChoice: { count: choiceExpressions.length, alt: index => '回路の出力はX＝' + choiceExpressions[index] + '。' },
  adder: { count: adderWiring.length, alt: index => {
    const { upper, lower, inversion } = adderWiring[index];
    return 'xとyを上の素子Aと下の素子Bに入力する。Aの出力' + (inversion === 'A' ? 'を反転した信号' : '') +
      'は' + upper + '，Bの出力' + (inversion === 'B' ? 'を反転した信号' : '') + 'は' + lower + 'となる。zは和の1けた目，cはけた上げ。';
  } },
};

export const legacy2009SpringAm0126Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => {
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
