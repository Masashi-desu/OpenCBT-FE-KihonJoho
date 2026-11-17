import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { bitExamples, boardCases, boardInstruction, monthOutput, shownSquares } from './legacy-2007-spring-pm-06-09-model';

const figureNames = ['6-course','7-record','7-output','8-output','9-symmetric','9-asymmetric'] as const;
export type FigureName = typeof figureNames[number];
export const profile = (name: FigureName) => 'legacy-2007-spring-pm-' + name;
export const figureCaptions: Record<FigureName,string> = {
  '6-course': '図　双六の例', '7-record': '開票ファイルのレコード様式', '7-output': '選挙速報の表示様式',
  '8-output': 'メソッドmainの実行結果', '9-symmetric': '図　左右対称なビット列の例', '9-asymmetric': '設問3のビット列',
};
export const groupedBits = (bits: string) => [...bits.slice(0,8)].join(' ') + ' ｜ ' + [...bits.slice(8)].join(' ');
export function drawingAlt(name: FigureName, index: number): string {
  switch (name) {
    case '6-course': {
      const { figures } = boardCases[index];
      const rows = shownSquares.map(cell => {
        const instruction = boardInstruction(index, cell);
        return String(cell) + (cell === 0 ? '（ふりだし）' : cell === 23 ? '（上がり）' : instruction ? '（' + instruction + '）' : '');
      });
      rows.splice(10,0,'…');
      return rows.join('→') + '。' + figures.map((cell,i) => 'プレーヤ' + (i+1) + 'の駒：' + cell).join('，') + '。';
    }
    case '7-record': return '地区コード6けた，候補者名20けた，得票数9けた。';
    case '7-output': return '候補者名　　　　　　得票数\nXXX … XXX　　　　ZZZ,ZZZ,ZZ9\n　⋮　　　　　　　　　⋮';
    case '8-output': return monthOutput(index);
    case '9-symmetric': return groupedBits(bitExamples(index).symmetric);
    case '9-asymmetric': {
      const { asymmetric, markers } = bitExamples(index);
      return groupedBits(asymmetric) + '。左から' + (markers[0]+1) + '番目と' + (markers[1]+1) + '番目に▲。';
    }
  }
}
export const drawing = (name: FigureName, index: number) => figure(profile(name),[index],figureCaptions[name],drawingAlt(name,index));
export const legacy2007SpringPm0609Figures: readonly BookletFigureDefinition[] = figureNames.map(name => ({
  profile: profile(name), domain: [[0,3]],
  validate(values) { selectCase(values,4); },
  alt: values => drawingAlt(name, selectCase(values,4)),
}));
