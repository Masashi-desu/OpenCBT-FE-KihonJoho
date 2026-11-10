import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

const prefix = 'legacy-2013-autumn-am-';
export const autumn2013Am0126Profiles = {
  venn: prefix + '1-venn-shading',
  flow: prefix + '8-equivalent-flowcharts',
  gate: prefix + '25-logic-gate',
} as const;
type FigureKind = keyof typeof autumn2013Am0126Profiles;

export const vennRegions = [
  ['010', '011', '110'],
  ['010', '100', '110'],
  ['011', '110'],
  ['000'],
] as const;

export const logicalGates = ['AND', 'NAND', 'OR', 'NOR'] as const;
export const flowTerms = [
  'Pでない 又は Q',
  'P 又は Q',
  'Pでない 又は Qでない',
  'P 又は Qでない',
] as const;

const vennAlt = (index: number) => {
  const descriptions: Record<string, string> = {
    '000': 'A・B・Cのいずれにも含まれない部分', '010': 'Bだけの部分', '011': 'BとCだけの共通部分',
    '100': 'Aだけの部分', '110': 'AとBだけの共通部分',
  };
  return '長方形の中に三つの円。上がA，左下がB，右下がC。網掛けは' +
    vennRegions[index].map(region => descriptions[region]).join('、') + '。';
};
const flowAlt = (index: number) =>
  '左の流れ図は「' + flowTerms[index] + '」がYesなら処理へ進み、Noなら処理を経由せず終了する。' +
  '右の流れ図は最初にPを判定する。Pのaの枝は右から処理へ合流し、もう一方は下のQの判定へ進む。' +
  'Qのbの枝は左に進み処理を飛ばして終了し、もう一方は下の処理へ進んで終了する。';
const gateAlt = (index: number) => {
  const gate = logicalGates[index];
  return 'AとBを入力しXを出力する' + gate + 'ゲート。' +
    (gate === 'AND' || gate === 'NAND' ? '左辺が直線で右辺が半円の記号。' : '入力側が弧で出力側が尖った記号。') +
    (gate === 'NAND' || gate === 'NOR' ? '出力端に反転を示す小円がある。' : '出力端に小円はない。');
};

const altByKind = { venn: vennAlt, flow: flowAlt, gate: gateAlt };
export const legacy2013AutumnAm0126Figures: BookletFigureDefinition[] =
  (Object.keys(autumn2013Am0126Profiles) as FigureKind[]).map(kind => ({
    profile: autumn2013Am0126Profiles[kind], domain: [[0, 3]],
    validate(values) {
      const index = Object.getOwnPropertyDescriptor(values, '0');
      if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !index || !('value' in index) ||
        !Number.isSafeInteger(index.value) || index.value < 0 || index.value > 3) throw Error('FIGURE_DOMAIN');
    },
    alt(values) { return altByKind[kind](values[0]); },
  }));

export function autumn2013AmDiagram(kind: FigureKind, value: number, caption: string) {
  const definition = legacy2013AutumnAm0126Figures.find(entry => entry.profile === autumn2013Am0126Profiles[kind])!;
  definition.validate([value]);
  return { ...figure(definition.profile, [value], caption, definition.alt([value])), captionPresentation: 'accessible' as const };
}
