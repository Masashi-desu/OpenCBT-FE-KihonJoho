import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { caseIndex, source } from './legacy-2012-spring-am-01-26-shared';

export const profiles2012SpringAm0126 = {
  graph: 'legacy-2012-spring-am-3-adjacency-choice',
  matrix: 'legacy-2012-spring-am-3-adjacency-matrix',
  vendor: 'legacy-2012-spring-am-5-ticket-state',
  reliability: 'legacy-2012-spring-am-17-site-reliability',
  ledCircuit: 'legacy-2012-spring-am-25-led-circuit',
  ledChoice: 'legacy-2012-spring-am-25-led-choice',
} as const;
type FigureKind = keyof typeof profiles2012SpringAm0126;

export const graphChoices = [
  [[1, 4], [2, 3], [2, 4], [3, 4]],
  [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]],
  [[1, 2], [1, 3], [1, 4], [2, 3]],
  [[1, 2], [1, 3], [2, 4], [3, 4]],
] as const;
export const graphTargets = [3, 1, 0, 2] as const;
export function adjacencyMatrix(index: number) {
  const edges = graphChoices[graphTargets[index]];
  return Array.from({ length: 4 }, (_, row) => Array.from({ length: 4 }, (_, column) =>
    edges.some(([a, b]) => Math.min(row, column) + 1 === a && Math.max(row, column) + 1 === b) ? 1 : 0));
}
export const vertexLabels = ['V₁', 'V₂', 'V₃', 'V₄'] as const;
export const stateLabels = ['Q₀', 'Q₁', 'Q₂', 'Q₃', 'Q₄', 'Q₅', 'Q₆', 'Q₇'] as const;

export const ticketCases = [
  { price: 70, unit: 10, coins: [10, 50, 100], from: 4 },
  { price: 60, unit: 10, coins: [10, 50, 100], from: 0 },
  { price: 60, unit: 10, coins: [10, 50, 100], from: 5 },
  { price: 60, unit: 10, coins: [10, 20, 100], from: 4 },
] as const;

export const siteCases = [
  { disks: 2, sites: [2, 2], allDisks: true },
  { disks: 2, sites: [3, 2], allDisks: true },
  { disks: 3, sites: [2, 2], allDisks: true },
  { disks: 2, sites: [3, 3], allDisks: false },
] as const;

export const ledSegments = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'Dt'] as const;
export const ledMasks = [0xcf, 0x66, 0x6d, 0xa7] as const;

export function ticketEdges(index: number) {
  const { price, unit, coins } = ticketCases[index];
  return Array.from({ length: price / unit }, (_, from) =>
    [...new Set(coins.map(coin => (from * unit + coin >= price ? -1 : from + coin / unit)))]
      .map(to => [from, to] as const)).flat();
}

function ticketAlt(index: number) {
  if (index === 0) return source[5].material;
  const { from } = ticketCases[index], edges = ticketEdges(index);
  const links = edges.filter(([, to]) => to >= 0)
    .map(([start, to]) => stateLabels[start] + 'から' + stateLabels[to]).join('，');
  const toEnd = edges.filter(([, to]) => to < 0).map(([start]) => stateLabels[start]).join('，');
  return '開始矢印はQ₀へ入る。状態間の矢印は' + links + '。' + toEnd +
    'の各状態から二重円Eへ矢印があり，' + stateLabels[from] + 'からEへの矢印が太線で示される。';
}

function siteAlt(index: number) {
  if (index === 0) return source[17].material;
  const { disks, sites: [a, b] } = siteCases[index];
  return '中央のCPUに磁気ディスク' + disks + '台とサイトa・サイトbが接続される。サイトaの端末は' +
    a + '台，サイトbの端末は' + b + '台。装置と1台の稼働率の表は，磁気ディスクD，CPU C，端末T。';
}

const descriptions: Record<FigureKind, { count: number; caption: string; alt(index: number): string }> = {
  graph: { count: graphChoices.length, caption: '無向グラフ', alt: index => source[3].choices[index] },
  matrix: { count: graphTargets.length, caption: '隣接行列A',
    alt: index => '隣接行列A。各行は順に' + adjacencyMatrix(index).map(row => row.join(' ')).join('，') + '。' },
  vendor: { count: ticketCases.length, caption: '切符販売機の状態遷移', alt: ticketAlt },
  reliability: { count: siteCases.length, caption: '磁気ディスクと端末の構成', alt: siteAlt },
  ledCircuit: { count: 1, caption: '7セグメントLED点灯回路', alt: () => source[25].material },
  ledChoice: { count: ledMasks.length, caption: '7セグメントLEDの表示状態', alt: index => source[25].choices[index] },
};

export const legacy2012SpringAm0126Figures: readonly BookletFigureDefinition[] =
  (Object.keys(profiles2012SpringAm0126) as FigureKind[]).map(kind => {
    const { count, alt } = descriptions[kind];
    return {
      profile: profiles2012SpringAm0126[kind], domain: [[0, count - 1]],
      validate: values => { caseIndex(values, count, 'FIGURE_PROFILE'); },
      alt: values => alt(caseIndex(values, count, 'FIGURE_PROFILE')),
    };
  });

export function spring2012AmDiagram(kind: FigureKind, index: number) {
  const { count, caption, alt } = descriptions[kind], values = [index];
  return { ...figure(profiles2012SpringAm0126[kind], values, caption, alt(caseIndex(values, count, 'FIGURE_PROFILE'))),
    captionPresentation: 'accessible' as const };
}
