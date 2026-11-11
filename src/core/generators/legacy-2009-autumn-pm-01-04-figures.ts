import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { additions, formatted, packets, partialCarry, triples } from './legacy-2009-autumn-pm-01-04-models';

export const profiles = {
  halfAdder: 'legacy-2009-autumn-pm-1-half-adder',
  fullAdder: 'legacy-2009-autumn-pm-1-full-adder',
  carryTable: 'legacy-2009-autumn-pm-1-carry-table',
  rippleAdder: 'legacy-2009-autumn-pm-1-ripple-adder',
  warehouse: 'legacy-2009-autumn-pm-2-warehouse',
  er: 'legacy-2009-autumn-pm-2-er',
  packet: 'legacy-2009-autumn-pm-3-packet',
  authentication: 'legacy-2009-autumn-pm-4-authentication',
  token: 'legacy-2009-autumn-pm-4-token',
} as const;

export function carryRows(index: number) {
  return triples.map(([c, x, y], row) => [c, x, y, ...(row === additions[index].blankRow ? ['［c］'] : partialCarry(c, x, y))]);
}

export const authenticationFlows = [
  {
    input: ['利用者IDと', 'パスワードを入力'],
    steps: ['利用者ID，パスワード', 'ログインの可否'],
    notes: { 0: ['利用者IDから', 'パスワードを検索して照合'] },
    alt: '端末で利用者IDとパスワードを入力し，サーバへ送信。サーバは利用者IDからパスワードを検索して照合し，ログインの可否を端末へ返す。',
  },
  {
    input: ['利用者IDと', 'パスワードpを入力'],
    steps: ['利用者ID', 'チャレンジ', 'レスポンス', 'ログインの可否'],
    notes: { 0: ['チャレンジcを', 'ランダムに生成'], 2: ['利用者IDからパスワードp′を検索し，', 'h(p′, c)を計算してレスポンスと照合'] },
    client: ['pとcからh(p, c)を', '計算'],
    alt: '端末で利用者IDとパスワードpを入力。端末からサーバへ利用者ID。サーバはチャレンジcをランダムに生成して端末へ返す。端末はpとcからh(p, c)を計算しレスポンスを送る。サーバは利用者IDからパスワードp′を検索しh(p′, c)を計算してレスポンスと照合し，ログインの可否を返す。',
  },
  {
    input: ['トークンのボタンを押し，表示された', 'パスワードg(u, t)と利用者ID uを入力'],
    steps: ['利用者ID，パスワード', 'ログインの可否'],
    notes: { 0: ['利用者ID uと時刻tを使って', 'g(u, t)を生成し，パスワードと照合'] },
    alt: '端末でトークンのボタンを押して表示されたg(u, t)と利用者ID uを入力し，サーバへ送信する。サーバは利用者ID uと時刻tからg(u, t)を生成しパスワードと照合し，ログインの可否を返す。',
  },
];

type Kind = keyof typeof profiles;
const descriptions: Record<Kind, { count: number; alt: (index: number) => string }> = {
  halfAdder: { count: 1, alt: () => 'XとYを二つの回路に同時に入力する。上段は空欄aで出力がZ，下段はANDで出力がCである。交差する二本はつながらない。' },
  fullAdder: { count: 1, alt: () => 'XとYは半加算器1に入る。半加算器1の和とCᵢₙは半加算器2に入り，半加算器2の和がZとなる。半加算器1のけた上がりC₁と半加算器2のけた上がりC₂が空欄bの回路に入り，Cを出力する。' },
  carryTable: { count: additions.length, alt: index => '列はCᵢₙ，X，Y，C₁，C₂。空欄cは同じ行の二列にまたがる。\n' + carryRows(index).map(row => row.join('｜')).join('\n') },
  rippleAdder: { count: 1, alt: () => '左から半加算器，全加算器，全加算器，全加算器。第1段にA₁とB₁が入り，S₁とC₁を出力する。各第2〜4段には同じ添字のAとB及び直前の段のCが入り，同じ添字のSとCを出力する。' },
  warehouse: { count: 1, alt: () => '倉庫は1〜3階に分かれ，各階は四つの区画からなる。区画内に複数の棚を配置する。図は2階の棚を拡大し，棚番号095の4段4列の棚を示す。第3段の箱番号は左から3-1，3-2，3-3，3-4で，書類を箱3-4に入れる。' },
  er: { count: 1, alt: () => '階数→区画→棚→箱→書類預託。部署→書類→書類預託。それぞれ矢印の始点が一，終点が多である。' },
  packet: { count: packets.length, alt: index => {
    const { header, max } = packets[index];
    return '左がヘッダ（' + header + 'バイト），右が測定値の列（4バイト×設定した個数）。全体の最大長は' + formatted(max) + 'バイト。';
  } },
  authentication: { count: authenticationFlows.length, alt: index => authenticationFlows[index].alt },
  token: { count: 1, alt: () => 'トークンに数字13571113を表示した画面とボタンがある。注記は「このボタンを押すとパスワードが表示される。」。' },
};

function validate(kind: Kind, values: number[]) {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
      !Number.isSafeInteger(item.value) || item.value < 0 || item.value >= descriptions[kind].count) throw Error('FIGURE_PROFILE');
}
export const legacy2009AutumnPm0104Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => ({
  profile: profiles[kind], domain: [[0, descriptions[kind].count - 1]], validate: values => validate(kind, values),
  alt: values => { validate(kind, values); return descriptions[kind].alt(values[0]); },
}));
export function draw(kind: Kind, index: number, caption: string) {
  const values = [index];
  validate(kind, values);
  return figure(profiles[kind], values, caption, descriptions[kind].alt(index));
}
