import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export const adderCases = [
  { x: '0011', y: '0101', width: 16 },
  { x: '0001', y: '0001', width: 8 },
  { x: '0101', y: '0101', width: 12 },
  { x: '1111', y: '0001', width: 24 },
] as const;

export const stateArcs = [
  { from: 0, to: 0, labels: ['00/0', '01/1', '10/1'] },
  { from: 0, to: 1, labels: ['11/0'] },
  { from: 1, to: 0, labels: ['00/1'] },
  { from: 1, to: 1, labels: ['01/0', '10/0', '11/1'] },
] as const;

export const adderCells = (i: number) => [String(adderCases[i].width - 1), String(adderCases[i].width - 2), '…', '3', '2', '1', '0'];
export const adderGroup = ['下位けたからの繰り上がり c', '入力された1けたの2進数 x', '入力された1けたの2進数 y',
  '加算結果の1けた目 s', '加算結果の繰り上がり c′'];
export const inputExamples = [[1, 0, 1], [1, 1, 1], [0, 1, 1], [1, 1, 0]] as const;

export const newsCategories = ['医療', '教育', '経済', '芸能', 'サイエンス', '社会', 'スポーツ', '政治'];
export const countRows = [
  [0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 2, 2, 6, 8, 2, 4],
  [1, 0, 1, 0, 1, 2, 0, 1, 2, 1, 1],
  [1, 0, 1, 0, 1, 1, 3, 2, 3, 2, 5],
  [0, 1, 2, 0, 1, 0, 2, 3, 5, 4, 3],
  [0, 0, 0, 1, 0, 0, 1, 1, 0, 3, 2],
  [0, 1, 0, 0, 0, 1, 4, 2, 3, 6, 3],
] as const;
export const newsCases = [
  { previous: ['20040401', '2038'], current: ['20040403', '1700'], categories: ['政治', '経済', 'スポーツ'], cutoffHour: 4, limit: 10 },
  { previous: ['20040403', '0905'], current: ['20040403', '1400'], categories: ['スポーツ', 'サイエンス', '社会'], cutoffHour: 4, limit: 9 },
  { previous: ['20040402', '1935'], current: ['20040404', '1610'], categories: ['政治', '芸能', '教育'], cutoffHour: 5, limit: 8 },
  { previous: ['20040402', '2330'], current: ['20040403', '1710'], categories: ['経済', 'スポーツ', '医療'], cutoffHour: 7, limit: 7 },
] as const;

export const recordTitles = ['ニュースファイルのレコード様式', '利用者ファイルのレコード様式', '要求情報の様式',
  '一時ファイルAのレコード様式', '端末種別が“簡易”の場合の様式', '端末種別が“詳細”の場合の様式',
  '設問1の利用者ファイルのレコード', '一時ファイルBのレコード様式', '設問4の利用者ファイルのレコード'];
const classifications = ['分類1', '分類2', '分類3', '分類4', '分類5'];
export function recordFields(condition: number, row: number): string[] {
  const { previous, categories, cutoffHour } = newsCases[condition];
  switch (row) {
    case 0: return ['登録年月日', '登録時刻', '発生年月日', '発生時刻', '分類', '見出し', '概要', '詳細', '画像ファイルのアドレス'];
    case 1: return ['利用者ID', ...classifications, '前回利用年月日', '前回利用時刻'];
    case 2: return ['利用者ID', '端末種別'];
    case 3: return [...classifications, '抽出開始年月日', '抽出開始時刻', '端末種別'];
    case 4: return ['発生年月日', '発生時刻', '分類', '見出し', '概要'];
    case 5: return ['発生年月日', '発生時刻', '分類', '見出し', '詳細', '画像ファイルのアドレス'];
    case 6: return ['XR205', '経済', '芸能', 'NIL', 'NIL', 'NIL', ...previous];
    case 7: return ['発生年月日', '発生時刻', '［c］', '見出し', '概要', '詳細', '画像ファイルのアドレス', '［d］'];
    case 8: return ['DT512', ...categories, 'NIL', 'NIL', '20040401', String(cutoffHour).padStart(2, '0') + '00'];
    default: throw Error('RECORD_LAYOUT');
  }
}

function simpleFigure(profile: string, domain: BookletFigureDefinition['domain'], alt: BookletFigureDefinition['alt']): BookletFigureDefinition {
  return { profile: 'legacy-2004-spring-pm-' + profile, domain, validate() {}, alt };
}
export const exampleFigure = simpleFigure('1-addition-example', [[0, 3]], ([i]) => {
  const [c, x, y] = inputExamples[i], sum = c + x + y;
  return adderGroup.map((label, j) => label + '＝' + [c, x, y, sum % 2, sum >> 1][j]).join('。') + '。';
});
export const statesFigure = simpleFigure('1-states', [[0, 3]], () => '初期状態q₀。' + stateArcs.map(arc =>
  'q' + (arc.from === 0 ? '₀' : '₁') + 'からq' + (arc.to === 0 ? '₀' : '₁') + 'への入力x・yと出力sは' +
  arc.labels.join('，')).join('。') + '。');
export const positionsFigure = simpleFigure('1-bit-array', [[0, 3]], ([i]) =>
  'x，yの入力とsの結果。添字は左から' + adderCells(i).join('，') + '。各配列には' + adderCases[i].width + '個の要素がある。');
export const recordFigure = simpleFigure('5-record-layout', [[0, 3], [0, 8]], ([i, row]) =>
  recordTitles[row] + '。左から' + recordFields(i, row).join('｜') + '。');
export const newsFlowFigure = simpleFigure('5-flow', [[0, 3]], () =>
  '利用者の要求情報→要求受付処理→一時ファイルA→ニュース抽出処理→一時ファイルB→ニュース整列処理→一時ファイルC→結果出力処理→抽出結果。要求受付処理は利用者ファイルに接続し，ニュース抽出処理はニュースファイルに接続。');

export const draw = (definition: BookletFigureDefinition, caption: string, ...values: number[]) =>
  figure(definition.profile, values, caption, definition.alt(values));
export const legacy2004SpringPm0105Figures: readonly BookletFigureDefinition[] =
  [exampleFigure, statesFigure, positionsFigure, recordFigure, newsFlowFigure];
