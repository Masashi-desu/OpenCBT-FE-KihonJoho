import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { matchCases } from './legacy-2008-spring-pm-2-model';
import { backupCases } from './legacy-2008-spring-pm-3-model';
import { listCases, nextAfterMoving } from './legacy-2008-spring-pm-4-model';
import { interimAFields, interimBFields, productFields, reportHeaders, saleCases, saleFields, saleFlowSteps } from './legacy-2008-spring-pm-5-model';

export const profiles = {
  match: 'legacy-2008-spring-pm-2-match',
  backup: 'legacy-2008-spring-pm-3-backup',
  list: 'legacy-2008-spring-pm-4-list',
  saleRecord: 'legacy-2008-spring-pm-5-sale-record',
  productRecord: 'legacy-2008-spring-pm-5-product-record',
  saleReport: 'legacy-2008-spring-pm-5-sale-report',
  interimRecords: 'legacy-2008-spring-pm-5-interim-records',
  saleFlow: 'legacy-2008-spring-pm-5-sale-flow',
  saleExtension: 'legacy-2008-spring-pm-5-sale-extension',
} as const;
type Kind = keyof typeof profiles;

export function matchSpans(index: number) {
  const { text, pattern } = matchCases[index];
  const spans: { start: number; overlaps: boolean }[] = [];
  let consumed = 0;
  for (let start = 0; start + pattern.length <= text.length; start++) {
    if (!text.startsWith(pattern, start)) continue;
    const overlaps = start < consumed;
    spans.push({ start, overlaps });
    if (!overlaps) consumed = start + pattern.length;
  }
  return spans;
}

export function listDrawing(value: number) {
  const index = Math.floor(value / 3), stage = value % 3;
  const { base, initial, trial } = listCases[index];
  const strings = stage === 2 ? trial : initial;
  const { first, next } = stage === 1 ? nextAfterMoving(index) : {
    first: base, next: strings.map((_, offset) => offset + 1 === strings.length ? -1 : base + offset + 1),
  };
  return { base, stage, strings, first, next };
}

const recordNote = (fields: string[], keys: number) =>
  '左から' + fields.join('，') + '。' + (keys ? '下線のキー項目は' + fields.slice(0, keys).join('，') + '。' : '');
const one = (alt: string) => ({ count: 1, alt: () => alt });
const descriptors: Record<Kind, { count: number; alt: (index: number) => string }> = {
  match: { count: 4, alt: index => {
    const { text, pattern } = matchCases[index], spans = matchSpans(index);
    return 'SourceText：' + [...text].join('｜') + '。先頭6文字の上に丸数字①〜⑥を付す。Pattern：' + [...pattern].join('｜') +
      '。一致部分の下線は' + spans.map(({ start, overlaps }) => (start + 1) + '〜' + (start + pattern.length) + '文字目（' +
        (overlaps ? '二重下線' : '下線') + '）').join('，') + '。';
  } },
  backup: { count: 4, alt: index => {
    const { total, size } = backupCases[index], quantity = (size / 10).toFixed(1) + 'Gバイト';
    return '全体' + total + 'Gバイト。上から土曜日，金曜日，木曜日，水曜日，火曜日，月曜日のファイル群と共通ファイル（' +
       quantity + '）。曜日ごとにファイル群の一部を網掛けし，共通ファイル全体も網掛けする。注　網掛けの部分は，更新領域（' + quantity + '）を表す。';
  } },
  list: { count: 12, alt: value => {
    const { first, base, next, stage, strings } = listDrawing(value);
    return (stage === 0 ? 'Listsize：' + strings.length + '。' : '') + 'First：' + first +
      '。List の各枠を添字：Next，Valueの順で示す。' +
      strings.map((string, i) => (base + i) + '：' + next[i] + '，' + string).join('。') +
      '。Firstから添字' + first + 'へ矢印。各Nextが指す添字へ矢印を結び，−1は末尾。';
  } },
  saleRecord: { count: 4, alt: index => recordNote(saleFields(index), 2) },
  productRecord: one(recordNote(productFields, 1)),
  saleReport: { count: 4, alt: index => {
    const { date, from, to, group, rows } = saleCases[index];
    return '作成日：' + date + '。販売構成一覧。集計期間：' + from + '〜' + to + '。集計種別：' + group +
      '。列は左から' + reportHeaders(index).join('，') + '。' + rows.map(row => row.join('，')).join('。') + '。以降省略。';
  } },
  interimRecords: one('中間ファイルA。' + recordNote(interimAFields, 0) + '中間ファイルB。' + recordNote(interimBFields, 0)),
  saleFlow: one(saleFlowSteps.join('→') +
    '。販売ファイルは期間のレコード抽出に，商品ファイルは突合せに入力。利用者指定値から集計項目の選択と一覧作成に入力。整列1は商品コード昇順，整列2は［a］昇順，整列3は［b］降順。集計から中間ファイルDを出力し，構成比率の算出で参照。αは抽出した販売データから中間ファイルBの出力まで。'),
  saleExtension: one('抽出した販売データと利用者指定値から［d］を判定。Yesでは［c］へ進む。Noでは整列1→商品ファイルとの突合せ→中間ファイルA→集計項目の選択。商品ファイルを突合せ，利用者指定値を集計項目の選択で参照。両枝は中間ファイルBの手前で合流する。'),
};
function readIndex(kind: Kind, values: number[]) {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
      !Number.isSafeInteger(item.value) || item.value < 0 || item.value >= descriptors[kind].count) throw Error('FIGURE_PROFILE');
  return item.value as number;
}
export const legacy2008SpringPm0105Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => ({
  profile: profiles[kind], domain: [[0, descriptors[kind].count - 1]],
  validate: values => { readIndex(kind, values); },
  alt: values => descriptors[kind].alt(readIndex(kind, values)),
}));
export function draw(kind: Kind, index: number, caption: string) {
  const values = [index];
  return figure(profiles[kind], values, caption, descriptors[kind].alt(readIndex(kind, values)));
}
