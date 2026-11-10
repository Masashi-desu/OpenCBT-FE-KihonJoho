import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const autumn2013Am2753Profiles = {
  uml: 'legacy-2013-autumn-am-46-class-relations',
  staffing: 'legacy-2013-autumn-am-53-staffing-network',
} as const;

export const autumn2013ClassRelations = [
  { parent: '自動車', related: ['車検証'], notation: 'association' },
  { parent: '自動車', related: ['スポーツカー'], notation: 'generalization' },
  { parent: '自動車', related: ['タイヤ', 'エンジン'], notation: 'composition' },
  { parent: '自動車', related: ['ドライバ'], notation: 'dependency' },
] as const;

export const autumn2013WorkCases = [
  { days: [3, 1, 1, 3, 4], helperFirst: 2, helperLast: 6 },
  { days: [3, 2, 1, 3, 4], helperFirst: 2, helperLast: 6 },
  { days: [3, 2, 1, 3, 4], helperFirst: 2, helperLast: 7 },
  { days: [3, 2, 1, 4, 4], helperFirst: 1, helperLast: 9 },
] as const;

export const autumn2013Events = [[35, 103], [167, 31], [167, 175], [308, 103], [442, 31], [442, 175]] as const;
export const autumn2013RealArrows = [
  { name: 'A', from: 0, to: 1, label: [90, 59], duration: [99, 84] },
  { name: 'B', from: 0, to: 2, label: [103, 134], duration: [92, 155] },
  { name: 'C', from: 2, to: 3, label: [233, 132], duration: [242, 155] },
  { name: 'D', from: 3, to: 4, label: [367, 59], duration: [376, 84] },
  { name: 'E', from: 3, to: 5, label: [377, 134], duration: [366, 155] },
] as const;
export const autumn2013DummyArrows = [[1, 2], [4, 5]] as const;

export function autumn2013UmlAlt([index]: number[]) {
  const { parent, related, notation } = autumn2013ClassRelations[index];
  const top = parent + 'の区画付きクラスを上に置く。';
  switch (notation) {
    case 'association': return top + '下に' + related[0] + 'を置き、両端に多重度1を付けた実線でつなぐ。';
    case 'generalization': return top + '下の' + related[0] + 'から上へ実線を引き、' + parent + '側に白抜き三角形を置く。';
    case 'composition': return top + '下の' + related.join('と') + 'を折れ線でつなぐ。' + parent + '側は黒塗りひし形と多重度1、下側は多重度*。';
    case 'dependency': return top + '下の' + related[0] + 'から上へ破線を引き、' + parent + '側に開いた矢印を置く。';
  }
}

export function autumn2013StaffingAlt([index]: number[]) {
  const [a, b, c, d, e] = autumn2013WorkCases[index].days;
  return '左の開始円から、上に作業A（' + a + '日）、下に作業B（' + b + '日）が延びる。Aの終点からBの終点へ下向きの破線のダミー作業。' +
    'Bの終点から中央へ作業C（' + c + '日）。中央から上に作業D（' + d + '日）、下の終了円へ作業E（' + e +
    '日）が延びる。Dの終点から終了円へ下向きの破線のダミー作業。凡例は矢線の上に作業名、下に日数、破線はダミー作業。';
}

function indexed(profile: string, count: number, alt: (values: number[]) => string): BookletFigureDefinition {
  return {
    profile, domain: [[0, count - 1]], alt,
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= count)
        throw new DataError('FIGURE_PROFILE', '図の条件が候補の範囲外です。');
    },
  };
}

export const legacy2013AutumnAm2753Figures = [
  indexed(autumn2013Am2753Profiles.uml, autumn2013ClassRelations.length, autumn2013UmlAlt),
  indexed(autumn2013Am2753Profiles.staffing, autumn2013WorkCases.length, autumn2013StaffingAlt),
];
