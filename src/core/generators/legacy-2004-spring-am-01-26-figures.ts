import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2004-spring-am-01-26-shared';
import { branchCases, branchGates, scans, sumCases, sumRows } from './legacy-2004-spring-am-01-26-models';

export const profiles = {
  'sum-table': 'legacy-2004-spring-am-7-sum-table',
  'branch-tree': 'legacy-2004-spring-am-9-branch-tree',
  'branch-option': 'legacy-2004-spring-am-9-branch-option',
  'array-search': 'legacy-2004-spring-am-15-array-search',
} as const;
export type FigureKind = keyof typeof profiles;
const describe: Record<FigureKind, (index: number) => string> = {
  'sum-table': i => {
    const {a,b,carry}=sumCases[i];
    return '左からA、B、'+a+'と'+b+(carry?'と1':'')+'の和の上位ビットC、下位ビットS。'+sumRows(i).map(row=>row.join('，')).join('／')+'。';
  },
  'branch-tree': i => {
    const [ff,ft,tf,tt]=branchCases[i];
    return '最初にA、次にBの真偽を調べる。Aが真ではBが真ならexit '+tt+'、Bが偽ならexit '+tf+
      '。Aが偽ではBが真ならexit '+ft+'、Bが偽ならexit '+ff+'。';
  },
  'branch-option': i => 'A '+branchGates[i]+' Bが真ならexit 1、偽ならexit 2。',
  'array-search': i => {
    const {begin,bound,limit,continues,step,advance}=scans[i];
    return '開始して'+begin+'→k。k'+limit+bound+'なら終了。k'+continues+bound+
      'ならXとA(k)を比較する。等しければ終了し、異なればk'+advance+step+'→kとしてkと'+bound+'の比較へ戻る。';
  },
};
export const legacy2004SpringAm0126Figures: readonly BookletFigureDefinition[] =
  (Object.keys(profiles) as FigureKind[]).map(kind=>({
    profile: profiles[kind], domain: [[0,3]],
    validate(values) { finiteIndex(values,4,'FIGURE_PROFILE'); },
    alt(values) { return describe[kind](finiteIndex(values,4,'FIGURE_PROFILE')); },
  }));
export function draw(kind: FigureKind, index: number, caption: string) {
  const i = finiteIndex([index],4,'FIGURE_PROFILE');
  return {...figure(profiles[kind],[i],caption,describe[kind](i)),captionPresentation:'accessible' as const};
}
