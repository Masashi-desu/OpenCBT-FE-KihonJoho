import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { lockTimes, positionLetters, positions, routeColumns, routingCase, transactionCase } from './legacy-2011-special-pm-01-04-models';

export const profiles = {
  instruction: 'legacy-2011-special-pm-1-instruction-bits',
  queues: 'legacy-2011-special-pm-2-scheduling-queues',
  updateSteps: 'legacy-2011-special-pm-3-update-steps',
  lockTimeline: 'legacy-2011-special-pm-3-lock-timeline',
  lockSteps: 'legacy-2011-special-pm-3-lock-insertion-steps',
  networks: 'legacy-2011-special-pm-4-network-structure',
  routeUpdate: 'legacy-2011-special-pm-4-route-update',
} as const;

export const bitSegments = [
  { label: 'op', first: 15, last: 8 }, { label: 'r₁', first: 7, last: 6 },
  { label: 'r₂又はX¹⁾', first: 5, last: 4 }, { label: '0　0　未使用領域', first: 3, last: 2 },
  { label: 'D', first: 1, last: 1 }, { label: 'I', first: 0, last: 0 },
];

export const queueCaptions = ['到着順方式', 'ラウンドロビン方式', '優先度順方式の例'];
export function queueAlt([kind]: number[]) {
  const intro = '○はプロセスを表す。到着したプロセスを登録し，';
  return intro + (kind === 2 ? '優先度10，9，…，1ごとの待ち行列から最も優先度の高い行列の先頭を取り出して実行。'
    : '実行可能状態の待ち行列の先頭から取り出して実行状態になる。') + '実行を終えると終了。' +
    (kind ? '中断したプロセスは登録に戻って待ち行列の末尾に再登録する。' : '');
}
export function transactionUpdateRows(index: number) {
  const { out, inbound } = transactionCase(index);
  return ['−' + out, '＋' + inbound].map(change => [
    '①白絵の具の在庫数データを読み込む。',
    '②白絵の具の在庫数データ ＝',
    '　白絵の具の在庫数データ' + change,
    '③白絵の具の在庫数データを書き込む。',
  ]);
}
export function transactionLockRows(index: number) {
  return transactionCase(index).steps.flatMap((step, i) => {
    const position = positions.indexOf(i);
    return position >= 0 ? [{ position: positionLetters[position] }, { step }] : [{ step }];
  });
}

export function routeUpdateRows(index: number) {
  const { subnet, ip } = routingCase(index);
  const start = [[subnet(0), '―', '0'], [subnet(1), '―', '0']];
  const receive = [[subnet(1), '―', '0'], [subnet(2), '―', '0']];
  const compared = receive.map(row => [row[0], row[1], '1']);
  const reflected = [...start, [subnet(2), ip(1, 1), '1']];
  return { start, receive, compared, reflected };
}

const rowsText = (rows: string[][]) => [routeColumns, ...rows].map(row => row.join('｜')).join('\n');
const descriptors = {
  instruction: { domain: [[0, 0]], alt: () => '1語目：15〜8ビットはop，7〜6はr₁，5〜4はr₂又はX，3〜2は0，0（未使用領域），1はD，0はI。2語目：15〜0はadr。注1）1語命令のときにはr₂，2語命令のときにはX。' },
  queues: { domain: [[0, 2]], alt: queueAlt },
  updateSteps: { domain: [[0, 3]], alt: ([index]: number[]) =>
    transactionUpdateRows(index).map((rows, i) => 'トランザクションT' + (i + 1) + 'の処理順序\n' + rows.join('\n')).join('\n') },
  lockTimeline: { domain: [[0, 0]], alt: () => '時間は右へ進む。●は実行開始，○は白絵の具の在庫数データのロック要求。' +
    'T3の開始，T3の要求，T6の開始，T4の開始，T6の要求，T5の開始，T4の要求，T5の要求の順。T3〜T6の時間線は右に伸びる。' },
  lockSteps: { domain: [[0, 3]], alt: ([index]: number[]) =>
    transactionLockRows(index).map(row => 'step' in row ? row.step : '左向き矢印 ' + row.position).join('\n') },
  networks: { domain: [[0, 3]], alt: ([index]: number[]) => {
    const { subnet, ip } = routingCase(index);
    return Array.from({ length: 4 }, (_, i) => 'ネットワーク' + 'ABCD'[i] + ' ' + subnet(i)).join('，') + '。' +
      Array.from({ length: 3 }, (_, i) => 'ルータ' + (i + 1) + 'はネットワーク' + 'ABCD'[i] + '側が' + ip(i, i) +
        '，ネットワーク' + 'ABCD'[i + 1] + '側が' + ip(i, i + 1) + '。').join('') +
      subnet(0) + 'はネットワークアドレス' + subnet(0).slice(0, -3) + 'とサブネットマスク255.255.255.0を表す。';
  } },
  routeUpdate: { domain: [[0, 3]], alt: ([index]: number[]) => {
    const { start, receive, compared, reflected } = routeUpdateRows(index);
    return '左にルータ1のテーブル，右にルータ2から送信された情報。\n起動直後\n' + rowsText(start) +
      '\n（1）ルータ2はネットワークB及びCにブロードキャストする。\n（2）ルータ1が受信した経路制御情報\n' + rowsText(receive) +
      '\n（2）① 距離に1を加えた更新距離\n' + rowsText(compared).replace('｜距離\n', '｜更新距離\n') +
      '\n（2）② 更新処理：Bの更新距離1は既存の距離0より大きいので保持。\n' + rowsText(start) +
      '\n（2）③ 一致する送信先がないCの行を追加。\n反映直後\n' + rowsText(reflected) +
      '\n追加行の転送先はルータ2のネットワークB側のIPアドレス。注 （1），（2）①〜③は〔テーブルの更新手順〕の（1），（2）①〜③を表す。';
  } },
} as const satisfies Record<keyof typeof profiles, { domain: readonly (readonly [number, number])[]; alt: (values: number[]) => string }>;

type Kind = keyof typeof profiles;
function validate(kind: Kind, values: number[]) {
  const [[minimum, maximum]] = descriptors[kind].domain;
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
    !Number.isInteger(item.value) || item.value < minimum || item.value > maximum) throw Error('FIGURE_PROFILE');
}

export const legacy2011SpecialPm0104Figures: readonly BookletFigureDefinition[] =
  (Object.keys(profiles) as Kind[]).map(kind => ({
    profile: profiles[kind], domain: descriptors[kind].domain,
    validate: values => validate(kind, values),
    alt: values => descriptors[kind].alt(values),
  }));

export function draw(kind: Kind, index: number, caption: string) {
  const values = [index];
  validate(kind, values);
  return figure(profiles[kind], values, caption, descriptors[kind].alt(values));
}

export const originalLockTimes = lockTimes;
