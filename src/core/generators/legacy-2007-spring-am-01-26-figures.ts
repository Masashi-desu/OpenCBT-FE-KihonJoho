import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2007-spring-am-01-26-shared';
import { graft, insertions, matches, searchTrees, sequences, type Node } from './legacy-2007-spring-am-01-26-model';

export const profiles = {
  normal: 'legacy-2007-spring-am-8-normal',
  tree: 'legacy-2007-spring-am-12-tree',
  search: 'legacy-2007-spring-am-13-search',
  gate: 'legacy-2007-spring-am-17-gate',
  cycles: 'legacy-2007-spring-am-19-cycles',
} as const;
export type FigureKind = keyof typeof profiles;
export function treeFor(value: number): Node {
  const scenario = Math.floor(value / 5), option = value % 5;
  return option === 0 ? searchTrees[scenario] : graft(searchTrees[scenario], scenario, option - 1);
}
const describe = ([value, left, right]: Node): string =>
  String(value) + (left || right ? '（左：' + (left ? describe(left) : 'なし') + '、右：' + (right ? describe(right) : 'なし') + '）' : '');
const alt: Record<FigureKind, { count: number; read: (index: number) => string }> = {
  normal: { count: 1, read: () => '0を中心に左右対称の正規分布の密度曲線。0より右の位置uを区切りとして、その右側で曲線と横軸に囲まれる裾を網掛けし，面積Pとする。' },
  tree: { count: 20, read: index => '根：' + describe(treeFor(index)) + '。' + (index % 5 ? '追加する値：' + insertions[Math.floor(index / 5)] + '。' : '') },
  search: { count: 4, read: index => {
    const [ , needle, start ] = matches[index];
    return '開始。' + start + '→i、' + start +
      '→j、0→k、' + needle.length + '→jmax。A[i]＝B[j]ならiとjを1ずつ増やす。異なるならi−j＋' +
      (start + 1) + '→i、' + start + '→j。A[i]とB[j]がどちらも△でない場合は比較から繰り返す。B[j]が△ならi−jmax→k。終了。';
  } },
  gate: { count: 1, read: () => '長方形の回路の左から入力Aと入力Bが入り、右から出力Xが出る。' },
  cycles: { count: 4, read: index => '命令の順：' + [...sequences[index].seq].join('→') + '。' },
};
export const legacy2007SpringAm0126Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as FigureKind[]).map(kind => {
  const { count, read } = alt[kind];
  return { profile: profiles[kind], domain: [[0, count - 1]],
    validate: values => { finiteIndex(values, count, 'FIGURE_PROFILE'); },
    alt: values => read(finiteIndex(values, count, 'FIGURE_PROFILE')) };
});
export function draw(kind: FigureKind, index: number, caption: string) {
  const { count, read } = alt[kind];
  const values = [index];
  finiteIndex(values, count, 'FIGURE_PROFILE');
  return { ...figure(profiles[kind], values, caption, read(index)), captionPresentation: 'accessible' as const };
}
