import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { Block } from '../types';
import { figure } from './definition';
import { pm1Text } from './legacy-2015-autumn-pm-01-04-text';
import {
  autumn2015Pm2CaseCount, autumn2015Pm2VisibleBits, autumn2015Pm2VisibleWord, autumn2015Pm2Words,
  autumn2015Pm3CaseCount, autumn2015Pm3Tables,
} from './legacy-2015-autumn-pm-01-04-models';

const prefix = 'legacy-2015-autumn-pm-';
export const autumn2015Pm0104Profiles = {
  network: prefix + '1-network',
  permissions: prefix + '1-permissions',
  underlined: prefix + '1-underlined',
  bits: prefix + '2-fields',
  word: prefix + '2-word',
  relations: prefix + '3-relations',
  purchase: prefix + '4-purchase',
  methods: prefix + '4-methods',
  html: prefix + '4-html',
} as const;

export const autumn2015Pm1Services = [
  { name: '勤務管理システム', description: '社員の勤務状況を管理するシステム', position: [52, 59], above: true },
  { name: '販売管理システム', description: '顧客からの受注情報を管理するシステム', position: [207, 59], above: true },
  { name: '生産管理システム', description: '製品の製造の進捗状況を管理するシステム', position: [16, 297], above: false },
  { name: '品質管理システム', description: '製品の品質情報を管理するシステム', position: [171, 297], above: false },
] as const;
export const autumn2015Pm1Permissions = {
  columns: ['', 'ログ管理システムへのログイン', 'ログファイルへのアクセス', 'ログ集積ファイルへのアクセス'],
  rows: [
    ['ログ管理者', '可', null, 'RE'],
    ['業務システム管理者', '可', null, 'R'],
    ['検知処理', '［d1］', '［d2］', null],
  ],
  note: '注記　網掛けの部分は表示していない。Rは参照，Eは外部へ出力，Wは書込みを示す。',
} as const;

export const autumn2015Pm4Methods = [
  ['(A)', 'Webブラウザのアドレスバーに表示されるURLの中にセッションIDが含まれる。'],
  ['(B)', 'Webブラウザの設定次第で利用できないことがある。'],
  ['(C)', 'タグ<a>で指定されたリンクのクリックではセッションIDが送信されない。'],
] as const;
export const autumn2015Pm4Html = [
  '<a href="https://www.example.com/?sid=セッションID">top</a>',
  '<input type="hidden" name="sid" value="セッションID">',
] as const;

const f = autumn2015Pm0104Profiles;
export function autumn2015Pm0104FigureAlt(profile: string, values: number[]): string {
  switch (profile) {
    case f.network:
      return autumn2015Pm1Services.map(service => service.name + '：' + service.description + '。').join('') +
        '横方向のネットワーク線に4業務システムのサーバ、ログ管理システムのサーバ、社員が利用する端末が接続する。端末は2個と途中の省略記号で表す。' +
        '各業務サーバ内ではログファイルから検知処理へ太い矢印が向く。四つの検知処理からの矢印は合流し、ログ管理サーバ内の破線枠にある業務別ログファイルに入る。' +
        'そこからログ集積処理、ログ集積ファイル、サーバ外の外部ログ集積ファイルへ順に矢印が向く。太い矢印はログを収集する流れを示す。';
    case f.permissions:
      return autumn2015Pm1Permissions.columns.slice(1).join('、') + '。' +
        autumn2015Pm1Permissions.rows.map(row => row.map(value => value ?? '網掛け').join('、') + '。').join('') +
        autumn2015Pm1Permissions.note;
    case f.underlined:
      return values[0] === 0 ? pm1Text.requirements[6] : pm1Text.s5;
    case f.bits:
      return 'ビット番号31から0までの32ビットを左から並べる。符号部は31、指数部は30〜23の8ビット、仮数部は22〜0の23ビット。';
    case f.word:
      return 'ビット番号 ' + autumn2015Pm2VisibleBits.join('、') + '。値 ' +
        autumn2015Pm2VisibleWord(autumn2015Pm2Words(values[0])[values[1]]).join('、') + '。省略範囲は16〜1。';
    case f.relations:
      return autumn2015Pm3Tables(values[0], values[1]).map(t => t.name + '。列は' + t.columns.join('、') +
        '。下線の主キーは' + t.keys.map(i => t.columns[i]).join('、') + '。' +
        t.rows.map(row => row.join('、') + '。').join('')).join('\n');
    case f.purchase:
      return 'サイトの閲覧開始からお知らせの表示に進み、ログイン前の商品閲覧またはログインに進める。商品閲覧は繰り返せ、そこからもログインへ進める。' +
        'ログインに失敗すればログインに戻り、成功すれば別の商品の閲覧に進む。後者も繰り返せ、商品の選択との間は双方向。' +
        '閲覧と選択のそれぞれから選択済み商品の確認、または上の線でログアウトに進める。確認から注文へ進み、注文から決済へ進める。' +
        '確認、注文、決済からは右側で合流してログアウト、または最上部を経由してログイン後の閲覧へ進める。最上部からの戻り線は一段下のログアウトへの線と接続せずに交差する。ログアウトからサイトの閲覧終了へ進む。';
    case f.methods:
      return '特徴と方法の表。' + autumn2015Pm4Methods.map(row => row.join(' ') + '。').join('') +
        '方法の列は三つの行にまたがる一つの空欄［b］。';
    case f.html:
      return autumn2015Pm4Html[values[0]] + '。セッションIDの箇所に下線。';
    default:
      throw Error('FIGURE_PROFILE');
  }
}

const make = (profile: string, domain: BookletFigureDefinition['domain']): BookletFigureDefinition => ({
  profile, domain, validate: () => {}, alt: values => autumn2015Pm0104FigureAlt(profile, values),
});
export const legacy2015AutumnPm0104Figures: BookletFigureDefinition[] = [
  make(f.network, [[0, 0]]), make(f.permissions, [[0, 0]]), make(f.underlined, [[0, 1]]), make(f.bits, [[0, 0]]),
  make(f.word, [[0, autumn2015Pm2CaseCount - 1], [0, 8]]),
  make(f.relations, [[0, autumn2015Pm3CaseCount - 1], [0, 1]]),
  make(f.purchase, [[0, 0]]), make(f.methods, [[0, 0]]), make(f.html, [[0, 1]]),
];

export function autumn2015Pm0104Diagram(profile: string, values: number[], caption: string, captionHidden = false): Block {
  const block = figure(profile, values, caption, autumn2015Pm0104FigureAlt(profile, values));
  return captionHidden && block.type === 'diagram' ? { ...block, captionPresentation: 'accessible' } : block;
}
