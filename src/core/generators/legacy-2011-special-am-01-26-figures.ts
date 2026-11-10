import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { caseIndex } from './legacy-2011-special-am-01-26-shared';

export const profiles2011SpecialAm0126 = {
  logic: 'legacy-2011-special-am-1-logic-expression',
  tree: 'legacy-2011-special-am-5-binary-tree',
  flow: 'legacy-2011-special-am-7-sum-flow',
  memory: 'legacy-2011-special-am-10-memory',
  timeline: 'legacy-2011-special-am-18-task-timeline',
  parity: 'legacy-2011-special-am-24-parity',
  adder: 'legacy-2011-special-am-25-half-adder',
} as const;

const masks = [0, 2, 4, 3];
export function logicExpressions(index: number) {
  const mask = masks[index];
  const lit = (variable: string, invert = false) => Boolean(mask & (1 << 'ABC'.indexOf(variable))) !== invert
    ? '\\overline{' + variable + '}' : variable;
  const a = lit('A'), an = lit('A', true), b = lit('B'), bn = lit('B', true), c = lit('C'), cn = lit('C', true);
  const inner = '(' + an + '+' + b + ')\\cdot (' + a + '+' + cn + ')';
  const formulas = ['\\overline{' + inner + '}', a + '\\cdot ' + bn + '+' + an + '\\cdot ' + c,
    an + '\\cdot ' + b + '+' + a + '\\cdot ' + cn, '(' + a + '+' + bn + ')\\cdot (' + an + '+' + c + ')', inner];
  return { a, an, bn, c, formulas };
}

export function logicText(formula: string) {
  return formula.replace(/\\overline\{([ABC])\}/g, '$1の否定').replace(/\\overline\{(.+)\}/g, '全体を否定：$1')
    .replaceAll('\\cdot ', '・');
}

export type Tree = { value: number; left?: Tree; right?: Tree };
type CompactTree = readonly [value: number, left?: CompactTree, right?: CompactTree];
const treeShapes: readonly CompactTree[] = [
  [8, [5, [3], [6]], [10, [7], [12]]],
  [8, [5, [3], [7, [6]]], [10, undefined, [12]]],
  [8, [5, [3, undefined, [7]], [6]], [12, [10]]],
  [8, [5, [3], [7, [6]]], [12, [10]]],
];
export const treeCases = [
  { shift: 0, order: [8, 12, 5, 3, 10, 7, 6] },
  { shift: 1, order: [8, 10, 5, 3, 12, 7, 6] },
  { shift: 2, order: [8, 12, 5, 3, 10, 6, 7] },
  { shift: 3, order: [8, 10, 5, 3, 12, 6, 7] },
] as const;
const treeShapesExtra: readonly CompactTree[] = [
  [8, [5, [3], [6, undefined, [7]]], [12, [10]]],
  [8, [5, [3], [6, undefined, [7]]], [10, undefined, [12]]],
];
export function displayedTrees(index: number): Tree[] {
  const shapes = index < 2 ? treeShapes
    : index === 2 ? [treeShapesExtra[0], treeShapes[1], treeShapes[2], treeShapes[3]]
      : [treeShapes[0], treeShapes[1], treeShapesExtra[1], treeShapes[3]];
  const make = ([value, left, right]: CompactTree): Tree => ({
    value: value + treeCases[index].shift, ...(left ? { left: make(left) } : {}), ...(right ? { right: make(right) } : {}),
  });
  return shapes.map(make);
}
export function treeNotation(tree?: Tree): string {
  return tree ? tree.value + '(' + treeNotation(tree.left) + ',' + treeNotation(tree.right) + ')' : '∅';
}
function treeDescription(tree: Tree): string {
  const desc = (node: Tree): string[] => [
    ...(node.left ? [node.value + 'の左の子は' + node.left.value] : []),
    ...(node.right ? [node.value + 'の右の子は' + node.right.value] : []),
    ...(node.left ? desc(node.left) : []), ...(node.right ? desc(node.right) : []),
  ];
  return '根は' + tree.value + '。' + desc(tree).join('，') + '。';
}

export const flowCases = [
  { max: 100, initial: 1, limit: 100, sum: 'x ＋ i → x', next: 'i ＋ 1 → i' },
  { max: 90, initial: 0, limit: 89, sum: 'x ＋ i → x', next: 'i ＋ 1 → i' },
  { max: 80, initial: 0, limit: 80, sum: 'x ＋ i → i', next: 'i ＋ 1 → i' },
  { max: 60, initial: 0, limit: 60, sum: 'x ＋ i → x', next: 'x ＋ 1 → x' },
] as const;
export function flowFixes(index: number) {
  const { max, limit } = flowCases[index];
  return [
    index === 0 ? 0 : 1, index === 1 ? max : limit - 1,
    index === 2 ? 'x ＋ i → x' : 'x ＋ i → i', index === 3 ? 'i ＋ 1 → i' : 'x ＋ 1 → x',
  ] as const;
}

const baseAddresses = [100, 101, 200, 201, 300, 301, 1200, 1201, 1300, 1301];
export const memoryCases = [
  { register: 1, base: 100, operand: 200 }, { register: 2, base: 99, operand: 201 },
  { register: 3, base: 200, operand: 101 }, { register: 4, base: 201, operand: 100 },
] as const;
export function memoryRows(index: number) {
  const starts = index === 0 ? [1100, 1101, 1200, 1201, 1300, 1301, 2200, 2201, 2300, 2301]
    : index === 1 ? [1120, 1121, 1200, 1201, 1301, 1300, 2210, 2211, 2310, 2311]
      : index === 2 ? [1150, 1151, 1200, 1201, 1300, 1200, 2250, 2251, 2350, 2351]
        : [1170, 1171, 1200, 1201, 1300, 1201, 2270, 2271, 2370, 2371];
  return baseAddresses.map((address, i) => [address, starts[i]] as const);
}

type Job = readonly [number, number, number, number, number];
type Phase = { start: number; end: number; kind: 'CPU' | 'I/O' | '待ち' };
export const taskCases: readonly (readonly [Job, Job])[] = [
  [[2, 8, 3, 4, 3], [2, 4, 2, 4, 3]],
  [[2, 7, 3, 5, 3], [3, 4, 2, 3, 4]],
  [[3, 8, 2, 4, 3], [2, 3, 2, 4, 4]],
  [[2, 7, 4, 3, 3], [3, 5, 2, 3, 4]],
];
export function schedule(tasks: readonly [Job, Job], serialIo: boolean) {
  const rows: Phase[][] = [[], []];
  const resources = [0, 0, 0];
  const cursors = [0, 0];
  const ready = [0, 0];
  let busy = 0;
  while (cursors.some(cursor => cursor < 5)) {
    const active = ready.map((time, task) => cursors[task] < 5 ? time : Infinity);
    const task = active[0] <= active[1] ? 0 : 1;
    const cpu = cursors[task] % 2 === 0;
    const resource = cpu ? 0 : serialIo ? 1 : task + 1;
    const start = Math.max(ready[task], resources[resource]);
    const duration = tasks[task][cursors[task]++];
    const end = start + duration;
    if (start > ready[task]) rows[task].push({ start: ready[task], end: start, kind: '待ち' });
    rows[task].push({ start, end, kind: cpu ? 'CPU' : 'I/O' });
    resources[resource] = ready[task] = end;
    if (cpu) busy += duration;
  }
  return { rows, busy, end: Math.max(...ready) };
}

export type Gate = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR';
export const gateLabels: Record<Gate, string> = {
  AND: '論理積', OR: '論理和', XOR: '排他的論理和', NAND: '否定論理積', NOR: '否定論理和', XNOR: '論理一致',
};
type ParityCircuit = readonly [first: 'XOR' | 'XNOR', second: 'XOR' | 'XNOR', final: 'AND' | 'OR' | 'XOR', inverted: boolean];
const referenceParity: readonly ParityCircuit[] = [
  ['XOR', 'XOR', 'AND', false], ['XOR', 'XOR', 'OR', true],
  ['XOR', 'XOR', 'XOR', false], ['XOR', 'XOR', 'XOR', true],
];
export const parityCases: readonly (readonly ParityCircuit[])[] = [
  referenceParity, referenceParity,
  [['XNOR', 'XOR', 'XOR', false], ['XNOR', 'XOR', 'OR', true],
    ['XNOR', 'XOR', 'AND', false], ['XNOR', 'XOR', 'XOR', true]],
  [['XOR', 'XNOR', 'AND', true], ['XOR', 'XNOR', 'XOR', true],
    ['XOR', 'XNOR', 'OR', false], ['XOR', 'XNOR', 'XOR', false]],
];
export const parityEven = [true, false, true, false] as const;
export function gateOutput(gate: Gate, x: boolean, y: boolean) {
  switch (gate) {
    case 'AND': return x && y;
    case 'OR': return x || y;
    case 'XOR': return x !== y;
    case 'NAND': return !(x && y);
    case 'NOR': return !(x || y);
    case 'XNOR': return x === y;
  }
}
export const adderCases = [
  { swap: false, invertSum: false, invertCarry: false },
  { swap: true, invertSum: false, invertCarry: false },
  { swap: false, invertSum: false, invertCarry: true },
  { swap: true, invertSum: true, invertCarry: false },
] as const;

const figures = {
  logic: { count: 20, caption: '否定線を含む論理式', alt: (i: number) => logicText(logicExpressions(Math.floor(i / 5)).formulas[i % 5]) },
  tree: { count: 16, caption: '2分木', alt: (i: number) => treeDescription(displayedTrees(Math.floor(i / 4))[i % 4]) },
  flow: { count: 4, caption: '整数の総和を求める流れ図', alt: (i: number) => {
    const { initial, limit, sum, next } = flowCases[i];
    return '開始。① ' + initial + ' → x，1 → i。② i：' + limit + 'で判定。iが右辺以下なら③ ' +
      sum + '，④ ' + next + 'を実行して②へ戻る。iが右辺より大きければ終了。';
  } },
  memory: { count: 4, caption: 'ベースレジスタと主記憶の内容', alt: (i: number) => {
    const { register, base } = memoryCases[i];
    return 'ベースレジスタ' + register + 'の値は' + base + '。主記憶の番地と内容は順に' +
      memoryRows(i).map(([address, value]) => address + '：' + value).join('，') + '。';
  } },
  timeline: { count: 4, caption: '入出力装置が同時動作可能なスケジュール', alt: (i: number) =>
    schedule(taskCases[i], false).rows.map((row, j) => {
      const task = j === 0 ? 'A' : 'B';
      return 'タスク' + task + '：' + row.map(({ start, end, kind }) =>
        (kind === 'I/O' ? 'I/O(' + task + ')' : kind) + ' ' + start + '–' + end).join('，');
    }).join('。') + '。時間目盛は等間隔。' },
  parity: { count: 16, caption: '4ビットの入力を受け取る論理回路', alt: (i: number) => {
    const [first, second, final, inverted] = parityCases[Math.floor(i / 4)][i % 4];
    return '第1・第2入力は' + gateLabels[first] + 'へ，第3・第4入力は' + gateLabels[second] + 'へ。' +
      '二つの素子の出力を' + gateLabels[final] + 'に入力し，その出力を' + (inverted ? '否定して' : 'そのまま') + '取り出す。';
  } },
  adder: { count: 4, caption: '半加算器の素子と入出力', alt: (i: number) => {
    const { swap, invertSum, invertCarry } = adderCases[i];
    const sum = 'z（和の1けた目' + (invertSum ? 'の反転' : '') + '）';
    const carry = 'c（けた上げ' + (invertCarry ? 'の反転' : '') + '）';
    return '入力xとyをそれぞれ素子Aと素子Bの両方に接続する。Aの出力は' + (swap ? carry + '，Bの出力は' + sum :
      sum + '，Bの出力は' + carry) + '。';
  } },
} as const;

type FigureKind = keyof typeof figures;

export const legacy2011SpecialAm0126Figures: readonly BookletFigureDefinition[] =
  (Object.keys(figures) as FigureKind[]).map(kind => {
    const { count, alt } = figures[kind];
    return {
      profile: profiles2011SpecialAm0126[kind], domain: [[0, count - 1]],
      validate: values => { caseIndex(values, count, 'FIGURE_PROFILE'); },
      alt: values => alt(caseIndex(values, count, 'FIGURE_PROFILE')),
    };
  });

export function special2011AmDiagram(kind: FigureKind, index: number) {
  const { count, caption, alt } = figures[kind];
  return { ...figure(profiles2011SpecialAm0126[kind], [index], caption, alt(caseIndex([index], count, 'FIGURE_PROFILE'))),
    captionPresentation: 'accessible' as const };
}
