import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { caseIndex, source } from './legacy-2010-autumn-am-01-26-shared';

export const profiles2010AutumnAm0126 = {
  storage: 'legacy-2010-autumn-am-15-storage-structure',
  recovery: 'legacy-2010-autumn-am-17-failure-and-recovery',
  series: 'legacy-2010-autumn-am-19-availability-network',
  resources: 'legacy-2010-autumn-am-20-task-resources',
  circuit: 'legacy-2010-autumn-am-24-digital-circuit',
  expression: 'legacy-2010-autumn-am-24-logic-expression',
  lamps: 'legacy-2010-autumn-am-25-lamp-switches',
} as const;

export const taskDurations = [
  [[10, 50, 60], [40, 50, 30]], [[30, 50, 40], [10, 60, 40]],
  [[10, 40, 70], [20, 70, 30]], [[50, 40, 80], [20, 50, 70]],
] as const;
export const recoveryCases = [
  { up: 't', down: 's' }, { up: 's', down: 't' },
  { up: 't', down: 's' }, { up: 's', down: 't' },
] as const;
export const logicCircuits = [
  { middle: 'OR', final: 'OR' }, { middle: 'OR', final: 'NOR' },
  { middle: 'NAND', final: 'OR' }, { middle: 'NOR', final: 'NOR' },
] as const;
export const logicExpressions = [
  ['A·B+!(A·B)', 'A·B+!A·!B', 'A·!B+!A·B', '(!A+B)·(A+!B)'],
  ['A·B+!(A·B)', 'A·B+!A·!B', 'A·!B+!A·B', '(!A+B)·(!A+!B)'],
  ['A·B+!(A·B)', 'A·B+!A·!B', 'A·!B+B·B', '(!A+B)·(!A+!B)'],
  ['A·B+!(A·B)', '!A·B+!B·!B', 'A·!B+!A·B', '(!A+B)·(!A+!B)'],
] as const;
export const gateNames = {
  AND: '論理積', OR: '論理和', NAND: '否定論理積', NOR: '否定論理和',
} as const;
export const lampCases = [
  { invert: [false, false], equalLights: false }, { invert: [true, false], equalLights: false },
  { invert: [false, true], equalLights: true }, { invert: [true, true], equalLights: true },
] as const;

const figures = {
  storage: { count: 4, caption: 'PCとストレージの構成', alt: (i: number) => source[15].choices[i] + '。PCは3台で全てLANにつながる。' },
  recovery: { count: 4, caption: '時間に沿った故障と回復', alt: (i: number) => {
    const { up, down } = recoveryCases[i];
    return '時間は左から右。' + up + '₁の終わりに第1回故障，' + down + '₁の終わりに回復，' +
      up + '₂の終わりに第2回故障，…，回復，' + up + 'ₙの終わりに第n回故障，' + down + 'ₙの終わりに回復。';
  } },
  series: { count: 1, caption: '四つの装置の接続', alt: () => source[19].material },
  resources: { count: 4, caption: 'タスクA・Bの実行順序と時間', alt: (i: number) => taskDurations[i].map((steps, j) =>
    'タスク' + 'AB'[j] + '：' + steps.map((time, step) => (step === 1 ? '資源R ' : 'CPU ') + time + 'ミリ秒').join(' → ') + '。').join('\n') },
  circuit: { count: 4, caption: 'AとBを入力するディジタル回路', alt: (i: number) => {
    const { middle, final } = logicCircuits[i];
    return 'A、Bはそれぞれ分岐し、片方は否定器へ入る。二つの否定器の出力を' + gateNames[middle] +
      'の素子に入力する。その素子の出力とAの論理積、その出力とBの論理積をそれぞれ取り、' +
      '二つの論理積の出力を' + gateNames[final] + 'の素子に入力し、Xを出力する。';
  } },
  expression: { count: 16, caption: 'Xを表す論理式', alt: (i: number) => {
    const expression = logicExpressions[Math.floor(i / 4)][i % 4];
    return 'X＝' + expression.replace(/!\(([^)]+)\)/g, '（$1全体の否定）').replace(/!([AB])/g, '（$1の否定）');
  } },
  lamps: { count: 4, caption: 'スイッチA・Bと照明', alt: (i: number) => {
    const { invert } = lampCases[i];
    return 'スイッチAの信号を' + (invert[0] ? '反転して' : 'そのまま') + '論理回路に入力する。' +
      'スイッチBの信号を' + (invert[1] ? '反転して' : 'そのまま') + '論理回路に入力する。出力を照明につなぐ。';
  } },
} as const;
type FigureKind = keyof typeof figures;

export const legacy2010AutumnAm0126Figures: readonly BookletFigureDefinition[] =
  (Object.keys(figures) as FigureKind[]).map(kind => {
    const { count, alt } = figures[kind];
    return {
      profile: profiles2010AutumnAm0126[kind], domain: [[0, count - 1]],
      validate: values => { caseIndex(values, count, 'FIGURE_PROFILE'); },
      alt: values => alt(caseIndex(values, count, 'FIGURE_PROFILE')),
    };
  });

export function autumn2010AmDiagram(kind: FigureKind, index: number) {
  const { count, caption, alt } = figures[kind];
  return { ...figure(profiles2010AutumnAm0126[kind], [index], caption, alt(caseIndex([index], count, 'FIGURE_PROFILE'))),
    captionPresentation: 'accessible' as const };
}
