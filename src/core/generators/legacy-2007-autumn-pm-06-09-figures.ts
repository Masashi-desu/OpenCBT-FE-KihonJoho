import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { healthCases, healthFields, parityCases, queueIllustration, type Entry } from './legacy-2007-autumn-pm-06-09-model';

const figureNames = ['7-master', '7-year', '7-change', '8-insert', '8-output', '9-parity'] as const;
export type FigureName = typeof figureNames[number];
export const profile = (name: FigureName) => 'legacy-2007-autumn-pm-' + name;
const captions: Record<FigureName, string> = {
  '7-master': 'マスタファイルのレコード様式',
  '7-year': '今年度の診断結果ファイルのレコード様式',
  '7-change': 'プログラムの変更内容',
  '8-insert': '図1　要素を挿入する例',
  '8-output': '図2　実行結果',
  '9-parity': '図　パリティビットと水平パリティ',
};
export const entryText = (entry: Entry) => entry.label + '：' + entry.weight;
export const modificationCode = (index: number) => {
  if (index === 3) return ['IF YEAR-WEIGHT <= MAST-WEIGHT(1) - ' + healthCases[index].threshold + ' OR',
    '   ［d］ THEN', '    DISPLAY "HEALTH CHECK EMPLOYEE-NO " YEAR-ENO', 'END-IF'];
  return ['IF YEAR-WEIGHT >= MAST-WEIGHT(1) + ' + healthCases[index].threshold + ' OR',
    '   ［d］ THEN', '    DISPLAY "HEALTH CHECK EMPLOYEE-NO " YEAR-ENO', 'END-IF'];
};
export function drawingAlt(name: FigureName, index: number): string {
  const record = '従業員番号：6けた。診断結果：' + healthFields.map(field => field.join('：')).join('，') + '。';
  switch (name) {
    case '7-master':
      return record + '診断結果は1年前，2年前，…と新しい順に並び，' + healthCases[index].years + '回繰り返す。';
    case '7-year':
      return record + '診断結果は今年度の1組。';
    case '7-change':
      return '処置：［c］に追加。プログラムの変更内容：\n' + modificationCode(index).join('\n');
    case '8-insert': {
      const { before, after, inserted, comparisons } = queueIllustration(index);
      return '要素：重み。挿入する要素は' + entryText(inserted) + '。挿入前は先頭から' +
        before.map(entryText).join('，') + '。挿入する要素の重みと末尾からの重みの合計の比較は' +
        comparisons.join('，') + '。挿入後は先頭から' + after.map(entryText).join('，') + '。';
    }
    case '8-output':
      return queueIllustration(index).after.map(entry => entry.label).join('\n');
    case '9-parity':
      return '列はビット番号15，14，13，…，0。語0〜3，…，語N−1をブロックに，語Nを水平パリティに用いる。' +
        (index === 0 ? '' : 'この例で省略した中間の語は全ビットが0とする。') +
        parityCases[index].rows.map((row, i) => (['語0','語1','語2','語3','語N−1','語N'][i]) + '：' + [...row].join(' ')).join('。') +
        '。ビット番号15の列は左側の破線で示すパリティビット。ビット番号13の列は網掛け。';
  }
}
export const drawing = (name: FigureName, index: number) => figure(
  profile(name), [index], captions[name], drawingAlt(name, index),
);
export const legacy2007AutumnPm0609Figures: readonly BookletFigureDefinition[] = figureNames.map(name => ({
  profile: profile(name), domain: [[0, 3]],
  validate(values) { selectCase(values, 4); },
  alt: values => drawingAlt(name, selectCase(values, 4)),
}));
