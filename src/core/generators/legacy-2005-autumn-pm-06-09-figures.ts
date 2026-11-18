import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

export const scoreConditions = [
  { subjects: ['国語', '数学', '英語', '理科', '社会'], maximum: 100 },
  { subjects: ['数学', '英語', '理科', '情報'], maximum: 80 },
  { subjects: ['国語', '数学', '英語', '物理', '地理', '情報'], maximum: 120 },
  { subjects: ['国語', '数学', '英語', '理科', '社会', '情報', '保健'], maximum: 90 },
] as const;

export function statisticsChanges(index: number): readonly [position: string, instructions: string][] {
  const count = scoreConditions[index].subjects.length;
  return [
    ['行番号22と23の間に追加', [
      '01 STATISTICS.',
      '    02 STUDENT-TOTAL PIC 9(4) VALUE ZERO.',
      '    02 SUB-TOTAL     PIC 9(8) VALUE ZERO OCCURS ' + count + '.',
      '    02 AVERAGE       PIC 999.9.',
    ].join('\n')],
    ['行番号27と28の間に追加', [
      'DISPLAY "STUDENT:".',
      'DISPLAY STUDENT-TOTAL.',
      'DISPLAY "AVERAGE:".',
      'PERFORM VARYING K FROM 1 BY 1 UNTIL K > ' + count,
      '    COMPUTE AVERAGE = SUB-TOTAL(K) / STUDENT-TOTAL',
      '    DISPLAY AVERAGE',
      'END-PERFORM.',
    ].join('\n')],
    ['行番号44と45の間に追加', '［c］'],
    ['行番号46の後に追加', '［d］.'],
  ];
}

export const figureNames = ['7-statistics', '9-shift-mask', '9-shift-data'] as const;
export type FigureName = typeof figureNames[number];
export const figureProfile = (name: FigureName) => 'legacy-2005-autumn-pm-' + name;
export const figureCaption: Record<FigureName, string> = {
  '7-statistics': 'プログラムの変更内容',
  '9-shift-mask': '図1　プログラム1の処理方法',
  '9-shift-data': '図2　プログラム2の処理方法',
};

const illustratedData = [0x3f5a, 0x729d, 0x337e, 0x953b];
export const binaryWord = (data: number): string => data.toString(2).padStart(16, '0');
export function shiftFigure(name: '9-shift-mask' | '9-shift-data', index: number) {
  const shiftMask = name === '9-shift-mask';
  return {
    data: binaryWord(illustratedData[index]),
    mask: binaryWord(shiftMask ? 0x8000 : 1),
    arrowLabel: shiftMask ? 'マスクを右にシフト' : '対象データを右にシフト',
  };
}

export function figureDescription(name: FigureName, index: number): string {
  if (name === '7-statistics')
    return '位置｜プログラムの変更内容\n' +
      statisticsChanges(index).map(([position, instructions]) => position + '\n' + instructions).join('\n');
  const { data, mask, arrowLabel } = shiftFigure(name, index);
  return 'ビット番号は左から15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0。対象データは ' +
    data + '、マスクは ' + mask + '。' + arrowLabel + 'する右向き矢印。';
}

export function draw(name: FigureName, index: number) {
  return figure(figureProfile(name), [index], figureCaption[name], figureDescription(name, index));
}

export const legacy2005AutumnPm0609Figures: readonly BookletFigureDefinition[] = figureNames.map(name => ({
  profile: figureProfile(name),
  domain: [[0, 3]],
  validate(values) { selectCase(values, 4); },
  alt: values => figureDescription(name, selectCase(values, 4)),
}));
