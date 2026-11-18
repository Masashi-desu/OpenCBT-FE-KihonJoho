import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

export const training = [
  { types: 'ABCDEFGH', sessions: 20 },
  { types: 'BCDEFG', sessions: 18 },
  { types: 'ACDFGH', sessions: 23 },
  { types: 'JLMNPRST', sessions: 15 },
] as const;

export const stringsWithSpaces = [' I   AM A  BOY.', '  A  B   ', '        ', 'AA B  CC'] as const;

export function compressed(input: string) {
  return input.replace(/ {2,}/g, ' ');
}

export const figureNames = ['7-record-layout', '9-input-layout', '9-space-example'] as const;
export type FigureName = typeof figureNames[number];
export const caption: Record<FigureName, string> = {
  '7-record-layout': '申込ファイルのレコード様式',
  '9-input-layout': '文字列領域',
  '9-space-example': 'SPCSUPの実行前後',
};
export const profile = (name: FigureName) => 'legacy-2004-autumn-pm-' + name;
export const boxLabel = (input: string) => input === ' ' ? '△' : input;
const characterLabel = (input: string) => input === ' ' ? '空白' : input;
export const exampleCells = (index: number) => {
  const input = stringsWithSpaces[index], output = compressed(input);
  return [[String(input.length), ...input].map(boxLabel), [String(output.length), ...output].map(boxLabel)] as const;
};

export function description(name: FigureName, index: number): string {
  switch (name) {
    case '7-record-layout': return '申込番号5けた、研修番号3けた、その他42けた。研修番号の内訳は内容区分1けた、開催区分2けた。';
    case '9-input-layout': return '先頭語（GR1）に正の文字列長があり、次の語（GR1）＋1から文字列が一文字ずつ並ぶ。';
    case '9-space-example': {
      const input = stringsWithSpaces[index], output = compressed(input);
      return '実行前は先頭語が' + input.length + 'で、' + [...input].map(characterLabel).join('，') + '。実行後は先頭語が' +
        output.length + 'で、' + [...output].map(characterLabel).join('，') + '。図の△は空白を示す。';
    }
  }
}

export const draw = (name: FigureName, index: number) => figure(profile(name), [index], caption[name], description(name, index));
export const legacy2004AutumnPm0609Figures: readonly BookletFigureDefinition[] = figureNames.map(name => ({
  profile: profile(name), domain: [[0, 3]],
  validate(values) { selectCase(values, 4); },
  alt: values => description(name, selectCase(values, 4)),
}));
