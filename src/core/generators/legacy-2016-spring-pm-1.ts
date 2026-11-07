import { field, p, strings, table, variableNotes } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { spring2016PmBank, spring2016PmCase, spring2016PmParts } from './legacy-2016-spring-pm-01-04-shared';
import { spring2016Pm0104Diagram, spring2016Pm0104Profiles } from './legacy-2016-spring-pm-figures-01-04';

export const spring2016Pm1Cases = [
  { oldLength: 6, newLength: 8, completeLeakInvestigation: false },
  { oldLength: 5, newLength: 9, completeLeakInvestigation: true },
  { oldLength: 7, newLength: 10, completeLeakInvestigation: false },
  { oldLength: 8, newLength: 11, completeLeakInvestigation: true },
] as const;

const keyChoices = [
  'TLSを使用していても不正侵入が行われたことから，TLSの使用を直ちに中止し，通常のHTTPで通信を行う。',
  '新たな秘密鍵と公開鍵を生成し，その鍵に対する公開鍵証明書の発行手続を行う。',
  '公開鍵証明書の再発行手続を行い，同じ秘密鍵を使用する。',
  '秘密鍵へのアクセスが確認できていないことから，秘密鍵の変更や公開鍵証明書の再発行は行わず，念のため秘密鍵の保管場所を，ネットワーク経由でアクセスできないディレクトリに変更する。',
];
const portChoices = [
  'TelnetやSSH以外にHTTPも利用できるようにするために，HTTPのポートを開放する。',
  'インターネットからのアクセスをFWで禁止し，TelnetやSSHのポートは閉じる。',
  'システム管理者がどこからでもすぐにA社システムのメンテナンスができるように，TelnetやSSHのポートの開放は継続する。',
  'パスワードやA社システムの実装情報の漏えいを防ぐために，Telnetのポートは閉じ，SSHに限定してポートを開放する。',
];
const accountChoices = [
  '管理者パスワードは変更し，全会員にパスワードの変更を依頼する。',
  '管理者パスワードは変更し，漏えいした会員だけにパスワードの変更を依頼する。',
  '管理者パスワードはそのままにし，全会員にパスワードの変更を依頼する。',
  '管理者パスワードはそのままにし，漏えいした会員だけにパスワードの変更を依頼する。',
];
const superscript = (n: number) => String(n).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);

export const legacy2016SpringPm1Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-1',
  title: 'Webサーバに対する不正侵入とその対策',
  sourceAnswer: 'a=イ、b=イ、c=ア、d=カ、e=オ',
  version: '3.2.0',
  fields: [field('漏えい確認範囲・パスワードの長さ', 0, 3)],
  reference: [0],
  publicNotes: 'ネットワーク構成と二つの表・五つの空欄を保ち、会員情報の漏えいを特定できた範囲と、比較するパスワードの長さを変えています。対策の適用範囲と候補数の比は、本文に示す条件から求めます。',
  notes: variableNotes + ' 原物理6〜9頁の全前提、図1、表1・2、全24択5欄と順序を保持。管理者認証の悪用と秘密鍵の漏えい否定不可、外部保守不要は固定。4条件で漏えい確認の完全性と変更前後の文字数を同時にバインド。指数の差と比で解け、長い累乗を展開する必要はない。辞書排除は再開後の条件であり候補数の比較には入れない。',
  build(values) {
    const { oldLength, newLength, completeLeakInvestigation } = spring2016Pm1Cases[spring2016PmCase(values)];
    const delta = newLength - oldLength;
    const d = ['2×' + newLength, '26', '2×26', (newLength - 1) + '×' + newLength, '10×26', '26' + superscript(delta)];
    const e = ['2', '2×' + newLength, '26', String(26 * newLength), '2' + superscript(newLength), '26' + superscript(newLength)];
    const leak = completeLeakInvestigation
      ? '一部の会員について会員情報が漏えいしたが，調査で漏えいした会員全員を特定でき，それ以外の会員情報は漏えいしていないことを確認した。'
      : '一部の会員については会員情報が漏えいしたことが分かっているが，それ以外の会員については漏えいの有無を特定できていない。';
    return {
      prompt: [
        p('次の問1は必須問題です。必ず解答してください。'),
        p('問1 Webサーバに対する不正侵入とその対策に関する次の記述を読んで，設問に答えよ。'),
        p('A社は，口コミによる飲食店情報を収集し，提供する会員制サービス業者である。会員制サービスを提供するシステム（以下，A社システムという）を図1に示す。'),
        spring2016Pm0104Diagram(spring2016Pm0104Profiles.q1Network, [0], '図1 A社システム'),
        p('(1) FW，Webサーバ及びDBサーバがあり，スマートフォンなどの利用者端末とはインターネットを介して接続されている。'),
        p('(2) WebサーバはDMZに置かれており，DBサーバはLANに置かれている。また，利用者端末からWebサーバへの接続には，セキュリティを考慮してTLSを用いている。'),
        p('(3) 会員登録を行った利用者（以下，会員という）には，IDとパスワードが発行される。'),
        p('(4) DBサーバには，会員情報（氏名，メールアドレス，訪れた飲食店情報，ログイン情報（IDとパスワード）など）と公開情報（飲食店情報，評価情報）が保管されている。'),
        p('(5) 会員は，公開情報を閲覧することができる。また，Webサーバにログインすることで，DBサーバに保管してある自分の会員情報と自らが書き込んだ公開情報の更新，及び新しい公開情報の追加が行える。'),
        p('(6) 非会員は，公開情報の閲覧だけができる。'),
        p('(7) 会員がWebサーバにログインするには，IDとパスワードが必要であり，A社システムはDBサーバに保管してあるログイン情報を用いて認証する。'),
        p('(8) Webサーバ及びDBサーバでは，それぞれでアクセスログ（以下，ログという）が記録されており，システム管理者が定期的に内容を確認している。また，システム管理者は，通常，LANからWebサーバやDBサーバにアクセスして，メンテナンスを行っている。'),
        p('なお，外部からTelnetやSSHでWebサーバに接続して，インターネットを介したリモートメンテナンスが行えるようにしてあるが，現在はリモートメンテナンスの必要性はなくなっている。'),
        p('ある日，システム管理者が，ログの確認において，通常とは異なるログが記録されているのを発見した。そのログを詳しく調査したところ，システム管理者以外の者が管理者IDと管理者パスワードを使ってWebサーバに不正侵入したことが明らかになった。'),
        p('そこで，システム管理者は上司と相談し，会員制サービスを直ちに停止した。次に，今回の不正侵入に対する被害状況の特定と対策の検討を行った。不正侵入による被害状況と対策の一部を抜粋したものを表1に示す。'),
        table('表1 不正侵入による被害状況と対策（抜粋）', ['被害状況', '対策'], [
          ['Webサーバへの不正侵入があったことが確認された。秘密鍵への不正アクセスがあったかは確認できなかった。', '［a］'],
          ['FWを経由し，Webサーバに不正侵入され，さらにそこからDBサーバに不正侵入された。', 'リモートメンテナンス用ポートについて，［b］'],
          [leak, 'パスワードを変更することにし，［c］'],
        ]),
        p('また，パスワードの変更に合わせて，パスワードの強度（パスワードの候補数）の検討を行った。これまでパスワードは，英小文字26文字だけを受け付け，長さは' + oldLength + '文字だった。これに対し，他の3通りのパスワードの強度を比較した。その比較結果を表2に示す。'),
        table('表2 パスワードの強度比較（抜粋）', ['パスワードとして受け付ける文字種と長さ', '強度の比較'], [
          ['(a) 英小文字，' + oldLength + '文字（不正侵入前の設定）', '－'],
          ['(b) 英小文字，' + newLength + '文字', '(a)と比較して［d］倍'],
          ['(c) 英大文字・英小文字，' + newLength + '文字', '(b)と比較して［e］倍'],
          ['(d) 英大文字・英小文字・数字・記号，' + newLength + '文字', '(c)と比較して更に多い'],
        ]),
        p('この強度の比較結果を踏まえ，次のようにA社システムを変更し，対策を実施した後に会員制サービスを再開することにした。'),
        p('(1) パスワードの文字種としては，英大文字と英小文字，数字，記号を受け付ける。'),
        p('(2) 長さが' + newLength + '文字以上16文字以下から成るパスワードを受け付ける。'),
        p('(3) 辞書に登録されている文字列など推測されやすいパスワードは受け付けない。'),
        p('設問 表1，2中の空欄に入れる適切な答えを，解答群の中から選べ。'),
        ...[keyChoices, portChoices, accountChoices, d, e].flatMap((bank, index) =>
          spring2016PmBank('abcde'[index] + 'に関する解答群', bank)),
      ],
      ...spring2016PmParts([keyChoices, portChoices, accountChoices, d, e].map(strings),
        [1, 1, completeLeakInvestigation ? 1 : 0, 5, 4].map((correct, group) => ({ id: 'abcde'[group], group, correct }))),
      explanation: [
        'a：秘密鍵への不正アクセスを否定できない。新しい鍵ペアを生成し，新しい公開鍵に対して証明書の発行手続をする。同じ鍵の再使用や保管場所の移動だけでは既に持ち出された鍵を無効にできず，暗号化を止めれば通信を保護できない。',
        'b：保守はLANから行え，外部保守は不要なので，インターネットからの保守アクセスを遮断し，Telnet・SSHのポートを閉じる。HTTPの追加やSSHの継続では外部からの保守入口が残る。',
        'c：不正に使用された管理者パスワードを変更する。' + (completeLeakInvestigation
          ? '漏えい対象全員を特定済みで，他の会員は漏えいしていないため，漏えいした会員を対象に変更を依頼する。'
          : '他の会員について漏えいを否定できないため，全会員に変更を依頼する。'),
        'd：各位置を独立に26文字から選ぶので，(b)を(a)で割ると 26' + superscript(newLength) + '÷26' + superscript(oldLength) + '＝26' + superscript(delta) + ' 倍になる。文字数の差を指数にする。',
        'e：(c)と(b)の長さは同じで，各位置の選択肢が26文字から52文字に倍増する。比は (52÷26)' + superscript(newLength) + '＝2' + superscript(newLength) + ' 倍になる。単純に2倍したり文字数と2を掛けたりする計算ではない。辞書の条件は再開後の対策であり，表2の理論候補数には含めない。',
        'TLSはTransport Layer Security（通信路の暗号化・認証を行うプロトコル），HTTPはHypertext Transfer Protocol（Webの通信プロトコル），SSHはSecure Shell（暗号化した遠隔接続のプロトコル）。Telnetも遠隔接続用だが通信を暗号化しない。FWはFirewall（通信を制御するファイアウォール），DMZはDemilitarized Zone（公開サーバ用に分離した区画），LANはLocal Area Network（構内ネットワーク），DBはDatabase（データベース），IDはIdentifier（識別子）を指す。',
      ].join('\n'),
    };
  },
};
