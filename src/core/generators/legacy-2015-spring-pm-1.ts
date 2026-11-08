import { p, strings, table } from './definition';
import { routes } from './legacy-2015-spring-pm-01-04-models';
import { spring2015Pm0104Diagram as figure, spring2015Pm0104Profiles as profiles } from './legacy-2015-spring-pm-01-04-figures';
import { answers, bank, define, single } from './legacy-2015-spring-pm-01-04-shared';
import allBanks from './legacy-2015-spring-pm-01-04-banks.json';

const choices = allBanks[0] as { route: string[]; attack: string[]; download: string[]; incident: string[] };
const title = 'インターネットを利用した受注管理システムのセキュリティ';
const transport = [
  'RPSには，ディジタル証明書を設定しておく。受注管理システムを利用する取引先の担当者は，取引先PCのブラウザからRPSを経由して受注管理アプリケーションにアクセスし，ログイン画面で利用者IDとパスワードを入力してログインする。その際，取引先PCのブラウザからの通信には，HTTP over SSL/TLS（以下，HTTPSという）を使用する。RPSではディジタル証明書を使って，HTTPSからHTTPにプロトコルを変換する。',
  'RPSには，ディジタル証明書を設定しておく。取引先の担当者は，取引先PCのブラウザからRPSを経由して受注管理アプリケーションへアクセスし，利用者IDとパスワードでログインする。取引先PCからRPSまではHTTP over SSL/TLS（以下，HTTPSという）を用いる。RPSで一旦復号し，RPSからWebサーバへはFW1とFW2を経由する別のHTTPS接続で通信する。',
  '取引先の担当者は，取引先PCのブラウザからFW3，FW1，RPSを経由して受注管理アプリケーションへアクセスし，利用者IDとパスワードでログインする。取引先PCからのHTTP over SSL/TLS（以下，HTTPSという）はFW3のディジタル証明書を用いてFW3で終端する。この設問の構成では，FW3からRPSまでと，RPSからFW1及びFW2を経由してWebサーバまではHTTPを用いる。',
];
const routeAnswers = [1, 3, 0];
const routeExplanations = [
  '取引先PCからRPSまでの1，2，3がHTTPS。RPSで復号し，その後の4と5はHTTP。',
  '取引先PCからRPSの1，2，3と，RPSからWebサーバへFW1・FW2を経由する3，4，5がHTTPS。両方に含まれる3は一度だけ数える。',
  '取引先PCとFW3間の1がHTTPS。FW3で終端し，その後はRPSを経由してWebサーバまでHTTPなので2〜5は含まれない。',
];

export function spring2015Pm1Pages(index: number) {
  return [
    [
      p('次の問1は必須問題です。必ず解答してください。'),
      p('問1　' + title + 'に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('製造業のK社では，インターネットを利用した受注管理システムを開発している。受注管理システムは，取引先も利用するので，セキュリティ上の欠陥があった場合，自社だけでなく取引先にも損害を与える可能性がある。そこで，K社は，セキュリティ診断サービスを行っているZ社に，受注管理システムの脆弱性診断を依頼した。'),
      p('〔受注管理システム〕'),
      p('受注管理システムのアプリケーション（以下，受注管理アプリケーションという）は，Webサーバ上で稼働する。受注や出荷などの情報は，データベース（以下，DBという）サーバ上で稼働する受注情報DBに格納され，受注管理アプリケーションから，参照，更新される。取引先PCにダウンロードできるファイルや，取引先PCからアップロードされたファイルは，Webサーバに接続されているディスクに格納される。受注管理システムの構成を図1に示す。'),
      figure(profiles.network, '図1　受注管理システムの構成'),
    ],
    [
      p(transport[index]),
      p('〔Z社の脆弱性診断の結果〕'),
      p('受注管理アプリケーションには，想定していない操作をDBサーバに実行させて，DBに不正アクセスするような［a］については，対策がされている。しかし，Z社の脆弱性診断の結果，受注管理アプリケーションに対策が必要なセキュリティ上の脆弱性が複数指摘された。表1にZ社からの指摘事項（抜粋）を示す。'),
      figure(profiles.report, '表1　Z社からの指摘事項（抜粋）'),
      p('K社は，表1中の下線①及び②に対策を行った。さらに，Z社からのその他の指摘事項にも対策を行って，K社は，受注管理システムの運用を開始することにした。'),
    ],
    [
      p('設問1　図1中の通信経路を表2に示す1〜5とした場合，取引先PCからWebサーバにアクセスするときに，HTTPSが通信に使われる通信経路だけを全て示す正しい答えを，解答群の中から選べ。'),
      table('表2　各機器の間の通信経路', ['経路番号', '通信経路'],
        routes.map(([a, b], i) => [String(i + 1), a + 'と' + b + 'との間'])),
      ...bank('解答群', choices.route),
      p('設問2　本文中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      ...bank('a，bに関する解答群', choices.attack),
    ],
    [
      p('設問3　表1中の下線①の対策として適切な答えを，解答群から選べ。'),
      ...bank('解答群', choices.download),
      p('設問4　表1中の下線②の脆弱性から考えられるセキュリティ事故として適切な答えを，解答群の中から選べ。'),
      ...bank('解答群', choices.incident),
    ],
  ];
}

export const legacy2015SpringPm1Definition = define(
  1, title, '設問1=イ、設問2 a=イ・b=ウ、設問3=ウ、設問4=イ',
  'HTTPSの終端と復号後の区間', transport.length,
  '構成図・経路番号と解答欄を保ち、HTTPSを終端する機器と終端後に再暗号化するかを変えています。',
  '印刷p.5〜8／物理p.6〜9、5欄。全7経路集合、攻撃名の共有8択、対策と事故の各4択を原順に維持する。',
  index => ({
    prompt: spring2015Pm1Pages(index).flat(),
    ...answers([choices.route, choices.attack, choices.download, choices.incident].map(strings), [
      single('s1', '設問1', 0, routeAnswers[index]), single('a', '設問2 a', 1, 1), single('b', '設問2 b', 1, 2),
      single('s3', '設問3', 2, 2), single('s4', '設問4', 3, 1),
    ]),
    explanation: '設問1：' + routeExplanations[index] + '\n' +
      '設問2：aは入力からSQL命令を注入してDBへ想定外の処理をさせるSQLインジェクション。bは利用者のブラウザでページ内のスクリプトを実行させるクロスサイトスクリプティング。\n' +
      '設問3：取引先ごとにサーバ側で許可したフォルダへ限定し，ファイル名だけを受け取る。入力から絶対パスや親ディレクトリへの移動を許さず，サーバの全ファイル一覧も公開しない。\n' +
      '設問4：連続して失敗してもロックされなければ，候補を自動で繰り返し試せる。他の三つは既知又は入手したパスワードで，連続失敗を許す条件に特有の事故ではない。',
  }),
);
