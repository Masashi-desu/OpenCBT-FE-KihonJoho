import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { caseIndex } from './legacy-2012-autumn-am-01-26-shared';

export const profiles2012AutumnAm0126 = {
  binarySearch: 'legacy-2012-autumn-am-6-binary-search',
  reliability: 'legacy-2012-autumn-am-15-redundancy',
  nand: 'legacy-2012-autumn-am-22-nand-circuit',
  logicChoice: 'legacy-2012-autumn-am-22-logic-choice',
} as const;
type FigureKind = keyof typeof profiles2012AutumnAm0126;

export const searchCases = [
  { descending: false, exclusive: false },
  { descending: true, exclusive: false },
  { descending: false, exclusive: true },
  { descending: true, exclusive: true },
] as const;

export const reliabilityCases = [
  { common: 1, upper: 2, lower: 2 },
  { common: 1, upper: 2, lower: 3 },
  { common: 2, upper: 2, lower: 2 },
  { common: 2, upper: 2, lower: 3 },
] as const;

// 0 and 1 are the two input terminals, 2 onward are gates in connection order.
export const nandCases: readonly (readonly (readonly [number, number])[])[] = [
  [[0, 0], [1, 1], [2, 3]],
  [[0, 1], [2, 2]],
  [[0, 1], [2, 2], [3, 3]],
  [[0, 0], [1, 1], [2, 3], [4, 4]],
];

const firstNand = 'Xを上側のNANDの両入力、Yを下側のNANDの両入力に接続する。これら二つの出力を、右側のNANDの二入力に接続する。';
const chainedNand = 'XとYを左側のNANDの二入力に接続する。その出力を次のNANDの両入力に接続する。';
const output = '末端のNANDの出力がZ。';
const nandAlts = [
  firstNand + output,
  chainedNand + output,
  chainedNand + 'その出力をさらに次のNANDの両入力に接続する。' + output,
  firstNand + 'その出力をさらに次のNANDの両入力に接続する。' + output,
];

const logicChoiceAlts = [
  'XとYの論理積', 'XとYの論理和', 'XとYの論理積全体の否定', 'XとYの論理和全体の否定',
];

const descriptions = {
  binarySearch: {
    count: searchCases.length,
    caption: '2分探索の流れ図',
    alt(index: number) {
      const { descending, exclusive } = searchCases[index];
      const { exhausted, continueSearch, highUpdate, highBranch, lowBranch, end } = searchFlowLabels(index);
      return '開始。1 → x，' + end + ' → y。xとyを比較し、' + exhausted + 'なら0 → mを実行して終了。' +
        continueSearch + 'なら空欄aを実行してkとA(m)を比較する。一致すれば終了。' +
        'k ' + highBranch + ' A(m)なら' + highUpdate + '、k ' + lowBranch + ' A(m)ならm＋1 → xとし、いずれもxとyの比較に戻る。' +
        '配列は' + (descending ? '降順。' : '昇順。') + (exclusive ? '上端yを探索範囲に含めない。' : '上下の端点を探索範囲に含める。');
    },
  },
  reliability: {
    count: reliabilityCases.length,
    caption: '多重化システムの構成',
    alt(index: number) {
      const { common, upper, lower } = reliabilityCases[index];
      return '入口から稼働率Pの' + common + '台を直列に通って上下に分岐する。上側はPの' + upper +
        '台を直列、下側はPの' + lower + '台を直列に接続し、上下は出口で合流する。';
    },
  },
  nand: { count: nandCases.length, caption: 'NANDの組合せ回路', alt: (index: number) => nandAlts[index] },
  logicChoice: { count: logicChoiceAlts.length, caption: '論理式', alt: (index: number) => logicChoiceAlts[index] },
};

export function searchFlowLabels(index: number) {
  const { descending, exclusive } = searchCases[index];
  return {
    exhausted: exclusive ? 'x ≧ y' : 'x ＞ y',
    continueSearch: exclusive ? 'x ＜ y' : 'x ≦ y',
    highUpdate: exclusive ? 'm → y' : 'm−1 → y',
    highBranch: descending ? '＞' : '＜',
    lowBranch: descending ? '＜' : '＞',
    end: exclusive ? 'n＋1' : 'n',
  };
}

export const legacy2012AutumnAm0126Figures: readonly BookletFigureDefinition[] =
  (Object.keys(profiles2012AutumnAm0126) as FigureKind[]).map(kind => {
    const { count, alt } = descriptions[kind];
    return {
      profile: profiles2012AutumnAm0126[kind], domain: [[0, count - 1]],
      validate: values => { caseIndex(values, count, 'FIGURE_PROFILE'); },
      alt: values => alt(caseIndex(values, count, 'FIGURE_PROFILE')),
    };
  });

export function autumn2012AmDiagram(kind: FigureKind, index: number) {
  const { caption, alt, count } = descriptions[kind];
  const values = [index];
  return { ...figure(profiles2012AutumnAm0126[kind], values, caption, alt(caseIndex(values, count, 'FIGURE_PROFILE'))),
    captionPresentation: 'accessible' as const };
}
