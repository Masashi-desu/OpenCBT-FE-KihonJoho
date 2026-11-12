import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2008-autumn-am-01-26-shared';

export const profiles = {
  conversion: 'legacy-2008-autumn-am-1-base-conversion',
  grid: 'legacy-2008-autumn-am-7-grid',
  heap: 'legacy-2008-autumn-am-12-heap',
  gateLegend: 'legacy-2008-autumn-am-17-gate-legend',
  parityCircuit: 'legacy-2008-autumn-am-17-parity-circuit',
} as const;

export const conversionCases = [
  { radix: 2, bound: 100, width: 8, reverse: false, label: 'NISHIN' },
  { radix: 2, bound: 64, width: 6, reverse: true, label: 'NISHIN' },
  { radix: 4, bound: 200, width: 4, reverse: false, label: 'YONSHIN' },
  { radix: 8, bound: 350, width: 3, reverse: true, label: 'HACHISHIN' },
] as const;

export const gridCases = [
  { width: 5, height: 4, column: 2, row: 2 },
  { width: 5, height: 4, column: 1, row: 2 },
  { width: 6, height: 4, column: 3, row: 1 },
  { width: 5, height: 5, column: 3, row: 2 },
] as const;

export const heapCases = [
  { values: [9, 11, 14, 24, 25, 19, 28, 29, 34], inserted: 7 },
  { values: [8, 14, 17, 23, 27, 20, 32, 31, 37], inserted: 10 },
  { values: [7, 10, 13, 19, 22, 18, 25, 28, 30], inserted: 16 },
  { values: [11, 14, 16, 24, 28, 20, 29, 32, 35], inserted: 30 },
] as const;

export const parityCases = [
  { bits: 4, even: true }, { bits: 4, even: false },
  { bits: 6, even: true }, { bits: 6, even: false },
] as const;
export const circuitOutputs = [
  { gate: 'AND', inverted: false },
  { gate: 'OR', inverted: true },
  { gate: 'XOR', inverted: false },
  { gate: 'XOR', inverted: true },
] as const;

export const legendItems = [
  ['AND', '論理積素子'], ['OR', '論理和素子'], ['XOR', '排他的論理和素子'], ['NOT', '論理否定器'],
] as const;
export const legendNote = '入力部又は出力部に示されている○印は，論理状態の反転又は否定を表す。';
type Kind = keyof typeof profiles;
const descriptors: Record<Kind, { count: number; alt: (index: number) => string }> = {
  conversion: { count: conversionCases.length, alt: index => {
    const { reverse, width } = conversionCases[index];
    return '開始→jを入力→変換ループ（k：' + (reverse ? width + '，−1，1' : '1，1，' + width) +
      '）→空欄a→空欄b→変換ループ終端→終了。ループ端の繰返し指定は，変数名：初期値，増分，終値を示す。';
  } },
  grid: { count: gridCases.length, alt: index => {
    const { width, height, column, row } = gridCases[index];
    return '横' + width + '区間・縦' + height + '区間の格子。Pは左下，Qは右上。RはPから右へ' + column + '区間，上へ' + row + '区間の交点。';
  } },
  heap: { count: heapCases.length, alt: index => {
    const { values: [root, left, right, ll, lr, rl, rr, first, second] } = heapCases[index];
    return '根' + root + 'の左右の子は' + left + 'と' + right + '。' + left + 'の左右の子は' + ll + 'と' + lr + 'で，' + lr +
      'が位置A。' + right + 'の左右の子は' + rl + 'と' + rr + '。' + ll + 'の左右の子は' + first + 'と' + second +
      '。位置Aの左の子が追加位置＊で，点線で結ばれる。';
  } },
  gateLegend: { count: 1, alt: () => 'D形はAND，入力側に曲線1本がある形はOR，入力側に曲線2本がある形はXOR，出力に白丸が付く三角形はNOT。' + legendNote },
  parityCircuit: { count: circuitOutputs.length * 2, alt: index => {
    const { gate, inverted } = circuitOutputs[index % circuitOutputs.length];
    const groupSize = index < circuitOutputs.length ? 2 : 3;
    return '入力' + (groupSize * 2) + '本を上' + groupSize + '本と下' + groupSize + '本に分ける。各組を' +
      (groupSize === 2 ? 'それぞれXORに入力する。' : '先頭2本のXORと3本目のXORでまとめる。') +
      '上下2組の出力を' + gate + 'に入力し，' + (inverted ? 'その出力をNOTで反転して出力する。' : 'その出力を回路の出力とする。');
  } },
};

export const legacy2008AutumnAm0126Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => {
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
