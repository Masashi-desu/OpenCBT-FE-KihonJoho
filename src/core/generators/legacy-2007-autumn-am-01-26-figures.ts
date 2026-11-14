import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2007-autumn-am-01-26-shared';

export const profiles = {
  tree: 'legacy-2007-autumn-am-12-tree',
  flow: 'legacy-2007-autumn-am-14-flow',
  legend: 'legacy-2007-autumn-am-17-legend',
  gate: 'legacy-2007-autumn-am-17-gate',
  address: 'legacy-2007-autumn-am-18-address',
} as const;
export type FigureKind = keyof typeof profiles;
export type Tree = string | readonly [string, Tree, Tree];
export const trees: readonly (readonly [string, Tree, Tree])[] = [
  ['＋', 'a', ['＊', ['−', 'b', 'c'], 'd']],
  ['−', ['＋', 'a', ['＊', 'b', 'c']], 'd'],
  ['＊', ['−', ['＋', 'a', 'b'], 'c'], 'd'],
  ['＋', ['−', 'a', 'b'], ['＊', 'c', 'd']],
];
export const flowCases = [[false, false], [true, false], [false, true], [true, true]] as const;
export const gateNames = ['AND', 'OR', 'NAND', 'NOR'] as const;
export const addressCases = [
  { field: 'レジスタ番号', register: 2, constant: 100, value: 50, effective: 150, plus: true,
    label: 'レジスタ番号', explanation: '命令で指定した指標レジスタの値50を命令のアドレス定数100に加えるので，指標付きアドレス指定方式である' },
  { field: '指定なし', register: null, constant: 80, value: 52, effective: 132, plus: true,
    label: 'プログラムカウンタ', explanation: 'プログラムカウンタ52に命令のアドレス定数80を加えるので，相対アドレス指定方式である' },
  { field: '指定なし', register: null, constant: 180, value: null, effective: 180, plus: false,
    label: 'レジスタ番号', explanation: '命令のアドレス定数180をそのまま主記憶の番地に使うので，直接アドレス指定方式である' },
  { field: 'レジスタ番号', register: 1, constant: null, value: 120, effective: 120, plus: false,
    label: 'レジスタ番号', explanation: '命令で指定したレジスタ1の内容120をそのまま主記憶の番地に使うので，レジスタ間接アドレス指定方式である' },
] as const;

function describeTree(node: Tree): string {
  if (typeof node === 'string') return node;
  const [mark, left, right] = node;
  return mark + '（左：' + describeTree(left) + '、右：' + describeTree(right) + '）';
}

const descriptors: Record<FigureKind, { count: number; alt: (index: number) => string }> = {
  tree: { count: trees.length, alt: index => '根：' + describeTree(trees[index]) },
  flow: { count: flowCases.length, alt: index => {
    const [, zero] = flowCases[index];
    return '開始。' + (zero ? '0→lo，n−1→hi' : '1→lo，n→hi') +
      '。(lo＋hi)／2→k。A(k)とxを比較し，等しければxは存在する，小さければa，大きければb。a・bの後でlo≦hiならkの計算に戻る。lo＞hiならxは存在しない。終了。';
  } },
  legend: { count: 1, alt: () => '凡例。D形がAND，出入口の縁が曲線で右端が尖る形がOR，各形の出力に小円が付くとNAND又はNOR，三角形の出力に小円が付くとNOT。' },
  gate: { count: gateNames.length, alt: index => {
    const gate = gateNames[index];
    return '入力XとYは上段の' + gate + 'に接続。XとYをそれぞれNOTに通した出力は下段の' +
      gate + 'に接続。上下の出力を最終段の' + gate + 'に接続し，その出力がZ。';
  } },
  address: { count: addressCases.length, alt: index => {
    const { register, constant, value, label, effective, plus } = addressCases[index];
    const operation = plus ? '両方を加算する。' : 'この値をそのまま番地に使う。';
    return '命令部の右にレジスタ番号欄とアドレス定数欄。レジスタ番号：' + (register ?? 'なし') +
      '。アドレス定数：' + (constant ?? 'なし') + '。' + (value === null ? '' :
        (register === null ? label : '指定したレジスタ' + register) + 'の値は' + value + '。') +
      operation + '主記憶の' + effective + '番地にある処理対象データを参照。';
  } },
};
export const legacy2007AutumnAm0126Figures: readonly BookletFigureDefinition[] = Object.keys(profiles).map(key => {
  const kind = key as FigureKind;
  const { count, alt } = descriptors[kind];
  return {
    profile: profiles[kind], domain: [[0, count - 1]],
    validate: values => { finiteIndex(values, count, 'FIGURE_PROFILE'); },
    alt: values => alt(finiteIndex(values, count, 'FIGURE_PROFILE')),
  };
});
export function draw(kind: FigureKind, index: number, caption: string) {
  const { count, alt } = descriptors[kind];
  const values = [index];
  finiteIndex(values, count, 'FIGURE_PROFILE');
  return { ...figure(profiles[kind], values, caption, alt(index)), captionPresentation: 'accessible' as const };
}
