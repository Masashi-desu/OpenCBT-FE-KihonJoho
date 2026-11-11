import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { caseIndex, source } from './legacy-2010-spring-am-01-26-shared';

export const profiles = {
  cache: 'legacy-2010-spring-am-10-cache',
  tiers: 'legacy-2010-spring-am-14-tiers',
  availability: 'legacy-2010-spring-am-16-availability',
  ledWiring: 'legacy-2010-spring-am-23-led-wiring',
  ledState: 'legacy-2010-spring-am-23-led-state',
  logic: 'legacy-2010-spring-am-26-logic',
} as const;
export type TierLayout = 'bus' | 'separated' | 'direct-db' | 'direct-client';
export type TierDiagram = { layout: TierLayout; upper: string; other: string };

const ap = 'APサーバ', db = 'DBサーバ';
const choice = (layout: TierLayout, upper: string, other: string): TierDiagram => ({ layout, upper, other });
const bus = choice('bus', ap, db);
const separated = choice('separated', db, ap);
const directDb = choice('direct-db', db, ap);
const directClient = choice('direct-client', db, ap);
const invalid = choice('separated', ap, 'プロキシサーバ');
const tierBanks: TierDiagram[][] = [
  [bus, choice('bus', ap, '認証サーバ'), invalid, choice('separated', '全社APサーバ', '部門APサーバ')],
  [bus, directClient, separated, invalid],
  [directDb, separated, bus, invalid],
  [separated, bus, invalid, directClient],
];
export function tierDiagram(index: number) {
  return tierBanks[Math.floor(index / 4)][index % 4];
}

export const ledSegments = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'Dt'];
export const ledOptions = [0xCF, 0x66, 0x6D, 0xA7];
export const gateNames = ['AND', 'OR', 'NAND', 'NOR'];
const gateBanks = [
  [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
  [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
  [[3, 1, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
  [[0, 0, 0], [1, 3, 0], [2, 2, 2], [3, 3, 3]],
];
export function gateDiagram(index: number) {
  return gateBanks[Math.floor(index / 4)][index % 4];
}

function tierAlt(index: number) {
  const { layout, upper, other } = tierDiagram(index);
  switch (layout) {
    case 'bus': return upper + '，' + other + '，クライアントが同じネットワークに接続。';
    case 'separated': return '上のネットワークに' + upper + 'と' + other + '，下のネットワークに' + other + 'とクライアントが接続。';
    case 'direct-db': return other + 'とクライアントは同じネットワークに接続。' + upper + 'は' + other + 'に専用の線で直接接続。';
    case 'direct-client': return upper + 'と' + other + 'は同じネットワークに接続。クライアントは' + other + 'に専用の線で直接接続。';
  }
}
export function ledAlt(mask: number) {
  const part = (on: boolean) => ledSegments.filter((_, i) => Boolean(mask & (1 << i)) === on).join('・') || 'なし';
  return '点灯 ' + part(true) + '。消灯 ' + part(false) + '。';
}
const descriptors = {
  cache: { count: 1, alt: () => 'CPU内部に256kバイトのキャッシュメモリ。CPUと256Mバイトの主記憶を接続。' },
  tiers: { count: 16, alt: tierAlt },
  availability: { count: 4, alt: (index: number) => source[16].choices[index] },
  ledWiring: { count: 1, alt: () => source[23].material },
  ledState: { count: 4, alt: (index: number) => ledAlt(ledOptions[index]) },
  logic: { count: 16, alt: (index: number) => {
    const [upper, lower, last] = gateDiagram(index).map(value => gateNames[value]);
    return '上段' + upper + 'にXとY，下段' + lower + 'にNOT XとNOT Yを入力。両段の出力を' + last + 'に入力してZを得る。';
  } },
} as const;
export type FigureKind = keyof typeof profiles;

export const legacy2010SpringAm0126Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as FigureKind[]).map(kind => {
  const { count, alt } = descriptors[kind];
  return { profile: profiles[kind], domain: [[0, count - 1]], validate: values => { caseIndex(values, count, 'FIGURE_PROFILE'); },
    alt: values => alt(caseIndex(values, count, 'FIGURE_PROFILE')) };
});

export function spring2010AmDiagram(kind: FigureKind, index: number, caption: string, accessibleCaption = false) {
  const { count, alt } = descriptors[kind];
  const values = [index];
  caseIndex(values, count, 'FIGURE_PROFILE');
  const block = figure(profiles[kind], values, caption, alt(index));
  return accessibleCaption ? { ...block, captionPresentation: 'accessible' as const } : block;
}
