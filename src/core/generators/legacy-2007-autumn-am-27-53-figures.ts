import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export const projectActivities = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export const projectCases = [
  { days: [5, 3, 5, 10, 5, 12, 3, 6], newD: 6 },
  { days: [4, 5, 6, 9, 4, 12, 4, 5], newD: 5 },
  { days: [6, 4, 5, 12, 3, 13, 4, 4], newD: 7 },
  { days: [4, 3, 6, 8, 5, 9, 4, 7], newD: 4 },
] as const;
export const projectEdges = [
  [0, 1, 0], [1, 2, 1], [1, 3, 2], [3, 2, 3], [2, 4, 4], [3, 5, 5], [4, 6, 6], [5, 6, 7], [4, 5, -1],
] as const;

export const chartLabels = ['検出バグ数', '未消化テスト項目数', '未解決バグ数'] as const;
export const chartCases = [
  { found: [0, 6, 26, 69, 83, 86, 86, 86], pending: [98, 91, 72, 55, 45, 39, 39, 39], open: [0, 6, 17, 9, 4, 11, 11, 11] },
  { found: [0, 10, 28, 44, 52, 52, 52, 52], pending: [98, 90, 80, 64, 53, 40, 28, 17], open: [0, 8, 14, 10, 7, 5, 2, 0] },
  { found: [0, 4, 11, 17, 21, 39, 61, 86], pending: [98, 91, 82, 73, 68, 68, 68, 68], open: [0, 2, 5, 8, 10, 20, 33, 47] },
  { found: [0, 7, 19, 29, 35, 40, 45, 50], pending: [98, 90, 80, 70, 60, 50, 40, 30], open: [0, 4, 10, 5, 0, 0, 0, 0] },
] as const;

const figureKinds = ['directory', 'availability', 'control-chart', 'arrow-diagram'] as const;
type FigureKind = typeof figureKinds[number];
const drawingQuestions: Record<FigureKind, number> = { directory: 30, availability: 34, 'control-chart': 47, 'arrow-diagram': 48 };
export const profile = (kind: FigureKind) => 'legacy-2007-autumn-am-' + drawingQuestions[kind] + '-' + kind;
export const captions: Record<FigureKind, string> = {
  directory: 'ディレクトリの構造', availability: 'コンピュータA〜Cの接続',
  'control-chart': 'プログラムテストの管理図', 'arrow-diagram': '作業A〜Hのアローダイアグラム',
};

function trend(values: readonly number[]) {
  if (values.at(-1) === values.at(-3)) return values.at(-1) === 0 ? '0で横ばい' : '0より上で横ばい';
  return values.at(-1)! > values.at(-3)! ? '増加中' : values.at(-1) === 0 ? '0まで減少' : '減少中';
}

export function drawingAlt(kind: FigureKind, index: number): string {
  switch (kind) {
    case 'directory':
      return 'ルートの下にAとBがあり，各階層の各ディレクトリは第3階層まで同名の子AとBをもつ。';
    case 'availability':
      return 'AとBは上下の並列経路に置かれ，共通の分岐と合流をもつ。合流の右にCが直列でつながる。';
    case 'control-chart': {
      const { found, pending, open } = chartCases[index];
      return '横軸は時間，左縦軸はテスト項目数，右縦軸はバグ数。右端で，' + chartLabels[0] + 'は' +
        trend(found) + '，' + chartLabels[1] + 'は' + trend(pending) + '，' + chartLabels[2] + 'は' + trend(open) + '。';
    }
    case 'arrow-diagram': {
      const durations = projectCases[index].days;
      const activity = (number: number) => projectActivities[number] + '（' + durations[number] + '日）';
      return '始点から' + activity(0) + 'へ。その先で' + activity(1) + 'と' + activity(2) + 'に分岐する。' +
        'Cの後に' + activity(3) + 'があり，Bの後と合流する。BとDの後に' + activity(4) + '，Cの後に' + activity(5) +
        '。Eの後の' + activity(6) + 'とFの後の' + activity(7) + 'が終点に至る。Eの後の結節点からFの後の結節点へ，破線のダミー作業が向かう。';
    }
  }
}

function maximum(kind: FigureKind): number {
  return kind === 'directory' || kind === 'availability' ? 0 : 3;
}

export const legacy2007AutumnAm2753Figures: readonly BookletFigureDefinition[] = figureKinds.map(kind => ({
  profile: profile(kind),
  domain: [[0, maximum(kind)]],
  validate(values) {
    if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > maximum(kind))
      throw new DataError('FIGURE_PROFILE', '図の値が登録された入力域と一致しません。');
  },
  alt: ([index]) => drawingAlt(kind, index),
}));

export const drawing = (kind: FigureKind, index: number) => ({
  ...figure(profile(kind), [index], captions[kind], drawingAlt(kind, index)),
  captionPresentation: 'accessible' as const,
});
