import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { bits, circuitTexts, treeArities, xorCases } from './legacy-2005-autumn-am-01-26-model';
import { finiteIndex } from './legacy-2005-autumn-am-01-26-shared';

export const profiles = {
  'xor-chain': 'legacy-2005-autumn-am-8-xor-chain',
  'full-tree': 'legacy-2005-autumn-am-12-full-tree',
  'gate-legend': 'legacy-2005-autumn-am-16-gate-legend',
  'logic-choice': 'legacy-2005-autumn-am-16-logic-choice',
} as const;
export type FigureKind = keyof typeof profiles;

const models: Record<FigureKind, {count: number; alt: (index: number) => string}> = {
  'xor-chain': {count: 4, alt: i => {
    const {input,a,b,c} = xorCases[i];
    return '左から右への流れ。入力ビット列'+bits(input)+'、ユニットA（内部かぎ'+bits(a)+'）、B（'+bits(b)+'）、C（'+bits(c)+
      '）、出力ビット列'+bits(input^a^b^c)+'。各ユニットは入力と内部かぎの排他的論理和を実行する。';
  }},
  'full-tree': {count: 4, alt: i => {
    const arity=treeArities[i];
    return '図の例は深さk＝2。深さ0に根が1個。根から子'+arity+'個へ線が分かれ、その各々から葉'+arity+
      '個へ線が分かれる。すべての葉は深さ2。';
  }},
  'gate-legend': {count: 1, alt: () => '左からAND（論理積）、OR（論理和）、XOR（排他的論理和）、NOT（否定）の各回路記号。'},
  'logic-choice': {count: 4, alt: i => '上側と下側の2ビットずつを、それぞれXORに接続する。'+circuitTexts[i]},
};

export const legacy2005AutumnAm0126Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as FigureKind[]).map(kind => {
  const {count,alt} = models[kind];
  return {
    profile: profiles[kind], domain: [[0,count-1]],
    validate(values) { finiteIndex(values,count,'FIGURE_PROFILE'); },
    alt(values) { return alt(finiteIndex(values,count,'FIGURE_PROFILE')); },
  };
});
export function draw(kind: FigureKind, index: number, caption: string) {
  const {count,alt}=models[kind];
  finiteIndex([index],count,'FIGURE_PROFILE');
  return {...figure(profiles[kind],[index],caption,alt(index)),captionPresentation:'accessible' as const};
}
