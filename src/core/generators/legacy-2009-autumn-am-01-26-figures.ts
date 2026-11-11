import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex, source } from './legacy-2009-autumn-am-01-26-shared';

export const profiles = {
  striping: 'legacy-2009-autumn-am-12-striping',
  availability: 'legacy-2009-autumn-am-16-availability',
  directory: 'legacy-2009-autumn-am-19-directory',
  gate: 'legacy-2009-autumn-am-24-gate',
  adder: 'legacy-2009-autumn-am-25-adder',
} as const;

type FigureKind = keyof typeof profiles;

export const stripeDimensions = [[4, 4], [3, 4], [4, 3], [3, 3]] as const;

export function stripeRows(index: number) {
  const [disks, rows] = stripeDimensions[index];
  return Array.from({ length: rows }, (_, row) => Array.from({ length: disks }, (_, disk) => row * disks + disk));
}

export function bitLabel(index: number) {
  return 'b' + String(index).replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
}

const descriptors = {
  striping: { count: stripeDimensions.length, alt: (index: number) => {
    const rows = stripeRows(index);
    const columns = rows[0].map((_, i) => 'データディスク' + (i + 1) + 'は' + rows.map(row => bitLabel(row[i])).join('・'));
    return '制御装置から' + columns.length + '台のデータディスクに接続する。各ディスクの上から順に，' +
      columns.join('，') + '。隣り合う列の同じ行の境界を点線がつなぐ。';
  } },
  availability: { count: 1, alt: () => source[16].material },
  directory: { count: 1, alt: () => source[19].material.split('\n')[0] },
  gate: { count: 1, alt: () => source[24].material },
  adder: { count: 1, alt: () => source[25].material.split('。選択肢')[0] + '。' },
};

export const legacy2009AutumnAm0126Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as FigureKind[]).map(kind => {
  const { count, alt } = descriptors[kind];
  return {
    profile: profiles[kind],
    domain: [[0, count - 1]],
    validate: values => { finiteIndex(values, count, 'FIGURE_PROFILE'); },
    alt: values => alt(finiteIndex(values, count, 'FIGURE_PROFILE')),
  };
});

export function autumn2009AmDiagram(kind: FigureKind, index: number, caption: string) {
  const { count, alt } = descriptors[kind];
  const values = [index];
  finiteIndex(values, count, 'FIGURE_PROFILE');
  return { ...figure(profiles[kind], values, caption, alt(index)), captionPresentation: 'accessible' as const };
}
