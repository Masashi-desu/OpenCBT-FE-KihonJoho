import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { canteenTables, floatingData, optimizedPrograms, optimizerData, transferData } from './legacy-2012-spring-pm-01-04-models';

export const profiles = {
  float: 'legacy-2012-spring-pm-1-float-bits',
  optimize: 'legacy-2012-spring-pm-2-optimization-table',
  inline: 'legacy-2012-spring-pm-2-inline-steps',
  canteen: 'legacy-2012-spring-pm-3-canteen-tables',
  transfer: 'legacy-2012-spring-pm-4-transfer-sequence',
} as const;

export function floatAlt([index, item]: number[]) {
  if (item === 0)
    return '上段はビット番号31，30，29，28，27，26，25，24，23，22，21，…，0。' +
      'ビット31は符号部，ビット30〜23は指数部（8ビット），ビット22〜0は仮数部（23ビット）。';
  const word = floatingData(index).bitWords[item - 1];
  return '上位のビット31から0まで，符号部 ' + word[0] + '，指数部 ' + word.slice(1, 9) + '，仮数部 ' + word.slice(9) + '。';
}

export function optimizationAlt() {
  return ['最適化の方法｜プログラム1の変換',
    ...optimizedPrograms.map((program, index) => '①②③'[index] + '\n' + program)].join('\n');
}

export function inlineAlt([index]: number[]) {
  const { argument, panels, func } = optimizerData(index);
  return '左から四つの枠があり，①，②，③の矢印で順に結ばれる。最初の関数呼出しと，①・②の先の枠内の展開部分は破線で囲まれる。\n' +
    panels.map((panel, i) => i ? '矢印' + '①②③'[i - 1] + 'の先\n' + panel : panel).join('\n') +
    '\n下段の関数の枠から，矢印func(' + argument + ')のインライン展開が①の先の枠を指す。\n' + func;
}

export function canteenAlt([index, group]: number[]) {
  return canteenTables(index, group === 1).map(item => [
    item.title,
    item.columns.map((column, n) => item.keyColumns.includes(n) ? column + '（下線）' : column).join('｜'),
    ...item.rows.map(row => row.join('｜')),
  ].join('\n')).join('\n');
}

export function transferAlt([index, enlarged]: number[]) {
  const { tx, ack, gap } = transferData(index);
  const legend = '白抜きの長方形はパケットの送受信，塗りつぶした長方形はACKの送受信。';
  return enlarged === 0
    ? '左は端末A，右は端末B。時系列は上から下へ。パケット(1)，(2)，(3)の矢印はAからBへ，ACK(1)，(2)はBからAへ向かう。' +
      'A側で，パケット1個の送信時間は' + tx + 'ミリ秒，ACK1個の受信時間は' + ack + 'ミリ秒，ACK受信完了から次のパケット送信開始までの間隔は' + gap +
      'ミリ秒。パケット(1)の後にACK(1)を受信してからパケット(2)を送り，ACK(2)を受信してからパケット(3)を送る。' + legend
    : '左は端末A，右は端末B。AからBへパケット(1)，(2)を続けて送り，BからAへACK(1)，(2)が返る。' +
      'パケット(1)の送信終了から(2)の送信開始までの間隔は' + gap + 'ミリ秒。ACK(1)受信後にパケット(3)，ACK(2)受信後にパケット(4)を送り，' +
      'ACK(3)，(4)が返った後も同様にパケット(5)，(6)を送る。一方の端末のパケットとACKの送受信は重なることがある。' + legend;
}

const rows = [
  { profile: profiles.float, domain: [[0, 3], [0, 11]], alt: floatAlt },
  { profile: profiles.optimize, domain: [[0, 0]], alt: optimizationAlt },
  { profile: profiles.inline, domain: [[0, 3]], alt: inlineAlt },
  { profile: profiles.canteen, domain: [[0, 3], [0, 1]], alt: canteenAlt },
  { profile: profiles.transfer, domain: [[0, 3], [0, 1]], alt: transferAlt },
] satisfies Array<Omit<BookletFigureDefinition, 'validate'>>;

export const legacy2012SpringPm0104Figures: BookletFigureDefinition[] = rows.map(row => ({
  ...row,
  validate(values) {
    if (!Array.isArray(values) || values.length !== row.domain.length || Reflect.ownKeys(values).length !== values.length + 1)
      throw Error('FIGURE_PROFILE');
    for (const [index, [min, max]] of row.domain.entries()) {
      const item = Object.getOwnPropertyDescriptor(values, String(index));
      if (!item || !('value' in item) || !Number.isInteger(item.value) || item.value < min || item.value > max)
        throw Error('FIGURE_PROFILE');
    }
  },
}));

export function draw(profile: keyof typeof profiles, values: number[], caption: string) {
  const definition = legacy2012SpringPm0104Figures.find(item => item.profile === profiles[profile])!;
  definition.validate(values);
  return figure(definition.profile, values, caption, definition.alt(values));
}
