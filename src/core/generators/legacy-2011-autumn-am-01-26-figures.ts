import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { caseIndex, source } from './legacy-2011-autumn-am-01-26-shared';

export const profiles2011AutumnAm0126 = {
  fixedPoint: 'legacy-2011-autumn-am-2-fixed-point',
  stacks: 'legacy-2011-autumn-am-5-stacks',
  rotation: 'legacy-2011-autumn-am-7-rotation',
  addressing: 'legacy-2011-autumn-am-9-addressing',
  cache: 'legacy-2011-autumn-am-11-access-table',
  routes: 'legacy-2011-autumn-am-19-line-routes',
  task: 'legacy-2011-autumn-am-20-task-states',
  gate: 'legacy-2011-autumn-am-26-logic-gate',
} as const;
type FigureKind = keyof typeof profiles2011AutumnAm0126;

export const stackCases = [
  { top: 'abcd', target: 'bcda' }, { top: 'cdab', target: 'dbac' },
  { top: 'bdac', target: 'dabc' }, { top: 'dacb', target: 'adbc' },
] as const;

export const rotationWidths = [1, 2, 3, 4] as const;
export function rotationCopies(index: number) {
  return Array.from({ length: rotationWidths[index] }, (_, j) =>
    'TANGO[n' + (j ? '＋' + j : '') + '] → TANGO[' + j + ']');
}

export const addresses = [
  { mode: 'indirect', operand: 20, effective: 25, register: '' },
  { mode: 'indexed', operand: 40, effective: 43, register: '指標レジスタ' },
  { mode: 'relative', operand: 5, effective: 45, register: 'プログラムカウンタ' },
  { mode: 'direct', operand: 30, effective: 30, register: '' },
] as const;

export const cacheCases = [
  { a: 15, b: 30, c: [20, 60, 70], d: [10, 90, 80] },
  { a: 15, b: 25, c: [15, 60, 70], d: [10, 50, 80] },
  { a: 28, b: 42, c: [10, 80, 60], d: [15, 80, 65] },
  { a: 34, b: 46, c: [15, 80, 65], d: [10, 90, 70] },
] as const;
export function cacheRows(index: number) {
  const { a, b, c, d } = cacheCases[index];
  return [['A', 'なし', '―', '―', String(a)], ['B', 'なし', '―', '―', String(b)],
    ['C', 'あり', ...c.map(String)], ['D', 'あり', ...d.map(String)]];
}

export const routeCases = [
  { origin: '東京', via: '大阪', dest: '福岡', availability: 0.9 },
  { origin: '仙台', via: '東京', dest: '名古屋', availability: 0.8 },
  { origin: '札幌', via: '仙台', dest: '東京', availability: 0.7 },
  { origin: '広島', via: '岡山', dest: '大阪', availability: 0.6 },
] as const;

export const taskStates = ['入口', '実行可能状態', '実行状態', '待ち状態', '出口'] as const;
export const taskEdges = [[0, 1], [1, 2], [2, 1], [2, 3], [3, 1], [2, 4]] as const;
export const gateKinds = ['and', 'nand', 'or', 'nor'] as const;

const descriptions: Record<FigureKind, { count: number; caption: string; alt(index: number): string }> = {
  fixedPoint: { count: 1, caption: '8ビット固定小数点形式', alt: () => source[2].material },
  stacks: { count: stackCases.length, caption: '二つのスタックの初期状態',
    alt: index => 'スタック1は上から' + [...stackCases[index].top].join('，') + '。スタック2は空。' },
  rotation: { count: rotationWidths.length, caption: '単語表を再構成する流れ図',
    alt: index => index === 0 ? source[7].material : '開始。' + rotationCopies(index).join('。') +
      '。ループ i：n−1，−1，0の内部で空欄aを実行し，ループ終端の後で終了。注記　ループにおける条件は，変数名：初期値，増分，終値を示す。' },
  addressing: { count: addresses.length, caption: '命令から主記憶を参照する経路',
    alt(index) {
      const { mode, operand, effective, register } = addresses[index];
      if (mode === 'indirect') return source[9].material;
      const field = '命令部の右のアドレス部に' + operand + '。';
      const target = '主記憶のアドレス' + effective + 'にデータがある。';
      return register ? field + register + 'の値' + (effective - operand) +
        'とアドレス部の値を加算して，' + target : field + 'アドレス部の矢印が直接向かう' + target;
    },
  },
  cache: { count: cacheCases.length, caption: 'キャッシュメモリと主記憶のアクセス条件',
    alt: index => '列は構成，キャッシュメモリの有無・アクセス時間（ナノ秒）・ヒット率（％），主記憶のアクセス時間（ナノ秒）。\n' +
      cacheRows(index).map(row => row.join('｜')).join('\n') },
  routes: { count: routeCases.length, caption: '直接回線と迂回回線',
    alt(index) {
      const { origin, via, dest } = routeCases[index];
      return '左下の' + dest + 'と右下の' + origin + 'を実線で結ぶ。上の' + via + 'と' + dest + '，' + via + 'と' +
        origin + 'をそれぞれ破線で結ぶ。';
    } },
  task: { count: 1, caption: 'マルチタスクの状態遷移', alt: () => source[20].material },
  gate: { count: gateKinds.length, caption: '入力A・Bから出力Xへの論理回路', alt: index => source[26].choices[index] },
};

export const legacy2011AutumnAm0126Figures: readonly BookletFigureDefinition[] =
  (Object.keys(profiles2011AutumnAm0126) as FigureKind[]).map(kind => {
    const { count, alt } = descriptions[kind];
    return {
      profile: profiles2011AutumnAm0126[kind], domain: [[0, count - 1]],
      validate: values => { caseIndex(values, count, 'FIGURE_PROFILE'); },
      alt: values => alt(caseIndex(values, count, 'FIGURE_PROFILE')),
    };
  });

export function autumn2011AmDiagram(kind: FigureKind, index: number) {
  const { count, caption, alt } = descriptions[kind], values = [index];
  return { ...figure(profiles2011AutumnAm0126[kind], values, caption, alt(caseIndex(values, count, 'FIGURE_PROFILE'))),
    captionPresentation: 'accessible' as const };
}
