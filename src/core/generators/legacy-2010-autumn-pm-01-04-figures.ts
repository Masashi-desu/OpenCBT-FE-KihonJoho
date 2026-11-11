import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { crcCase, digits, divideBits, normalizedTables, rawDatabaseRows, segments, thermometerCase } from './legacy-2010-autumn-pm-01-04-models';

export const profiles = {
  thermometer: 'legacy-2010-autumn-pm-1-thermometer',
  digit: 'legacy-2010-autumn-pm-1-digit',
  interrupt: 'legacy-2010-autumn-pm-1-interrupt',
  bcd: 'legacy-2010-autumn-pm-1-bcd',
  shapeWord: 'legacy-2010-autumn-pm-1-shape-word',
  database: 'legacy-2010-autumn-pm-2-database',
  normalization: 'legacy-2010-autumn-pm-2-normalization',
  crc: 'legacy-2010-autumn-pm-3-crc',
  authenticationNetwork: 'legacy-2010-autumn-pm-4-authentication-network',
  authenticationFlow: 'legacy-2010-autumn-pm-4-authentication-flow',
} as const;
export function digitAlt(digit: number) {
  return segments.map((name, i) => name + 'は' + (digits[digit].includes('abcdefgh'[i]) ? '点灯' : '消灯')).join('，') + '。';
}
const descriptors = {
  thermometer: { maximum: 3, alt: ([index]: number[]) => {
    const { demo, interval } = thermometerCase(index);
    return 'CPU，タイマ（' + interval + '秒間隔で割り込む），A/D変換器，出力ポートはバスで接続。温度検出器の出力はA/D変換器へ入る。' +
      '出力ポート15〜8が上位けた，7〜0が下位けたの7セグメントLEDに結線される。' +
      segments.map((name, i) => 'ビット' + (15 - i) + 'と' + (7 - i) + 'はそれぞれ上位・下位の' + name + 'へ結線').join('。') +
      '。上位は' + demo[0] + '，下位は' + demo[1] + 'を表示。凡例は中空のセグメントと円が消灯，塗りつぶしたセグメントと円が点灯。';
  } },
  digit: { maximum: 3, alt: ([index]: number[]) => digitAlt(thermometerCase(index).digit) },
  interrupt: { maximum: 3, alt: ([index]: number[]) => '開始→GR←1→［a］（A/D変換開始）→［b］→GR＝0の判定（A/D変換中？）。Yesは［b］へ戻り，NoはINPUT ' +
    thermometerCase(index).ports[2] + '（変換データ読込み）→CALL DISPLAY（LED表示）→終了。' },
  bcd: { maximum: 0, alt: () => 'GRは左からビット15〜0。上位の4ビットは0000，次の4ビットは上位けたBCD，次の4ビットは0000，最後の4ビットは下位けたBCD。' },
  shapeWord: { maximum: 0, alt: () => 'GRは左からビット15〜0。ビット15〜8が上位けたの形状データ，ビット7〜0が下位けたの形状データ。' },
  database: { maximum: 0, alt: () => '一つのレコードの連続した項目を上下2行に折り返す。上段は' + rawDatabaseRows[0].join('，') +
    '。下段は' + rawDatabaseRows[1].join('，') + '。受付番号に主キーの下線，類似受付番号には繰返し項目の括弧。' },
  normalization: { maximum: 0, alt: () => normalizedTables.map(({ title, columns, keys }) =>
    title + 'は' + columns.join('，') + '。' + columns.slice(0, keys).join('及び') + 'に主キーの下線。').join('\n') },
  crc: { maximum: 3, alt: ([index]: number[]) => {
    const { demo, mask } = crcCase(index), { rows, remainder } = divideBits(demo + '00', mask);
    return '符号計算対象の8ビット' + demo + 'の右端に2ビットの0を付加。最も左にある1の位置pを矢印で示す。' +
      rows.map((row, i) => i === 0 ? '開始 ' + row.value : '左から' + (row.position + 1) + '番目にマスク' + mask +
        'を合わせた' + row.aligned + 'とXORを取り，' + row.value).join('。\n') +
      '。右端の2ビット以外がすべて0になるまで繰り返す。右端2ビット' + remainder + 'が符号。';
  } },
  authenticationNetwork: { maximum: 0, alt: () => 'クライアント群C₁，C₂，…，CₘとAPサーバ群S₁，S₂，…，Sₙがネットワーク接続される。認証サイト内の認証サーバA，鍵データベースD，チケット発行サーバTはサイト内ネットワークに接続し，外側の同じネットワークへ接続する。' },
  authenticationFlow: { maximum: 0, alt: () => '認証サイト内の左から認証サーバA，鍵データベースD，チケット発行サーバT。利用者が操作するクライアントCは下左，APサーバSは下右。通信RはAからDの参照と応答，TからDの参照と応答。通信①はC→A，通信②はA→C，通信③はC→T，通信④はT→C，通信⑤はC→S。' },
} as const;
type Kind = keyof typeof profiles;
function validate(kind: Kind, values: number[]) {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
    !Number.isInteger(item.value) || item.value < 0 || item.value > descriptors[kind].maximum) throw Error('FIGURE_PROFILE');
}
export const legacy2010AutumnPm0104Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => ({
  profile: profiles[kind], domain: [[0, descriptors[kind].maximum]], validate: values => validate(kind, values),
  alt: values => descriptors[kind].alt(values),
}));
export function draw(kind: Kind, index: number, caption: string) {
  const values = [index];
  validate(kind, values);
  return figure(profiles[kind], values, caption, descriptors[kind].alt(values));
}
