import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2009-spring-pm-01-04-shared';
import { networkCases } from './legacy-2009-spring-pm-01-04-models';
import { draw } from './legacy-2009-spring-pm-01-04-figures';

const hosts = ['DBサーバ', 'Webサーバ', '管理用PC', 'メールサーバ', '任意'];
const riskChoices = [
  'Webサイトとやり取りされるデータの盗聴や改ざん',
  'WebサイトへのSQLインジェクション攻撃',
  'インターネットからDMZ内のサーバへの許可されていないポートでの接続',
  'インターネットから社内LANへの不正アクセスによる攻撃',
  'メールによる社内からのファイル流出',
];
function networkCase(index: number) {
  const { smtp, pop, database } = networkCases[index];
  const ports = [22, smtp, 80, pop, database].sort((a, b) => a - b).map(String);
  return { smtp, pop, database, ports };
}

export function spring2009Pm4Pages(index: number, exact = false) {
  const { smtp, pop, database, ports } = networkCase(index);
  const trafficHeaders = ['送信元', 'あて先', 'ポート番号', '動作'];
  return [[
    p('問4　パケットフィルタリングに関する次の記述を読んで，設問1，2に答えよ。'),
    p('X社では，図に示すネットワークを構築し，インターネットへのWebサイトの公開と電子メール（以下，メールという）の送受信を行っている。'),
    draw('network', 0, '図　X社のネットワーク構成'),
    p('X社のネットワークは二つのファイアウォールによって，DMZ及び社内LANの二つのセグメントに分けられている。Webサーバ，メールサーバ及びデータベースサーバ（以下，DBサーバという）は，それぞれ次の役割を果たしている。'),
    p('（1） Webサーバ'),
    p('Webサイトとして，自社の情報をインターネットに公開する。Webサーバ上では，社外との取引情報を処理するプログラムが動作する。このプログラムが利用するデータはDBサーバ上に格納される。'),
    p('（2） メールサーバ'),
    p('社外とのメールの送受信を行う。また，取引先に対してメールを自動配信するプログラムが動作する。メール配信のためのデータはDBサーバ上に格納される。'),
    p('（3） DBサーバ'),
    p('Webサーバ及びメールサーバで利用するデータを格納する。'),
    p('社内LANに接続された管理用PCからは，SSHを使った各サーバへのログイン操作と，メールサーバを介した外部とのメール送受信が可能である。管理用PCから自社Webサーバの参照はできるが，社外Webサイトの利用は許可されていない。'),
    ...(exact ? [] : [p(index === 0 ? '設定は，記載された業務に必要な接続に限り許可する。' :
      '設定は，記載された業務に必要な接続に限り許可する。社外メールの転送はX社と社外の取引先との間で行い，両方向とも表1に示す接続先ポートを取り決めている。取引先側のIPアドレスは固定せず，任意とする。管理用PCとメールサーバの間でも表1のポートを使用する。')]),
  ], [
    p('ネットワーク上で使われるプロトコルとポート番号を表1に示す。'),
    table('表1　プロトコルとポート番号', ['サービス', 'プロトコル', 'ポート番号'], [
      ['Web', 'HTTP', '80'], ['メール転送', 'SMTP', String(smtp)],
      ['セキュアシェル（遠隔ログイン）', 'SSH', '22'], ['メール受信', 'POP3', String(pop)],
      ['DBアクセス', 'DB専用', String(database)],
    ]),
    p('設問1　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。解答は重複して選んでもよい。'),
    p('インターネットとDMZをつなぐファイアウォールAのパケットフィルタリングの設定を表2に示す。また，DMZと社内LANをつなぐファイアウォールBのパケットフィルタリングの設定を表3に示す。'),
    p('フィルタリングの設定ルールは，送信元のIPアドレス，あて先のIPアドレス及び接続先ポート番号を指定して通信の許可／拒否を制御する。設定は上の行のルールから調べて，最初に条件が合致した行の動作を実行する。また，応答パケットについては動的フィルタリング機能によって自動的に許可されるので設定は不要なものとする。'),
    table('表2　ファイアウォールAのフィルタリングの設定', trafficHeaders, [
      ['任意', 'Webサーバ', '80', '許可'], ['任意', 'メールサーバ', String(smtp), '許可'],
      ['［a］', '任意', '［b］', '許可'], ['任意', '任意', '任意', '拒否'],
    ]),
  ], [
    table('表3　ファイアウォールBのフィルタリングの設定', trafficHeaders, [
      ['Webサーバ', 'DBサーバ', String(database), '許可'], ['メールサーバ', 'DBサーバ', String(database), '許可'],
      ['管理用PC', '［c］', '［d］', '許可'], ['管理用PC', 'メールサーバ', '22', '許可'],
      ['管理用PC', 'メールサーバ', String(smtp), '許可'], ['管理用PC', 'Webサーバ', '80', '許可'],
      ['管理用PC', 'Webサーバ', '22', '許可'], ['任意', '任意', '任意', '拒否'],
    ]),
    ...bank('a，cに関する解答群', hosts),
    ...bank('b，dに関する解答群', ports),
    p('設問2　X社のネットワークでは，ファイアウォールによるパケットフィルタリングによって，インターネット接続に伴うセキュリティ上のリスクを低減しているが，パケットフィルタリングは，すべての脅威に対する防御とはならない。パケットフィルタリングによって防ぐことができるセキュリティ上のリスクとして，正しい答えを解答群の中から二つ選べ。'),
    ...bank('解答群', riskChoices),
  ]];
}

export const legacy2009SpringPm4Definition = define(4, 'ファイアウォールのパケットフィルタリング', '設問1 a=エ・b=イ・c=エ・d=エ・設問2=ウ・エ',
  'SMTP・POP3・DBの接続先ポート', '取引先とのメール転送と管理用PCのメール取得に使用する接続先ポートを変更します。',
  'p.15〜17。接続元・接続先・ポートによる先勝ち、応答自動許可、既定拒否、管理用PCのアクセス要件を保持。ポートを専用とする条件を明示。設問2は5択から2つのチェックリストで、パケット内容を判定対象にしない。', index => {
    const { smtp, pop, ports } = networkCase(index);
    const selected = answers([strings(hosts), strings(ports), strings(riskChoices)], [
      single('a', '設問1 a', 0, 3), single('b', '設問1 b', 1, ports.indexOf(String(smtp))),
      single('c', '設問1 c', 0, 3), single('d', '設問1 d', 1, ports.indexOf(String(pop))),
      { ids: ['sub2-first', 'sub2-second'], labels: ['設問2', '設問2・選択2'], bank: 2, correct: [2, 3] },
    ]);
    return {
      prompt: spring2009Pm4Pages(index).flat(), ...selected,
      partAnswers: selected.partAnswers!.map(answer => answer.kind === 'unordered'
        ? { ...answer, presentation: 'checklist' } : answer),
      explanation: 'ファイアウォールAでは，メールサーバから社外にSMTPで新しい接続を開始できるように，送信元をメールサーバ，接続先ポートを' +
        smtp + 'とする。Bでは，管理用PCがメールサーバからメールを取得するため，あて先をメールサーバ，POP3のポートを' +
        pop + 'とする。応答パケットは自動で許可される。未許可ポートのDMZへの接続とインターネットから社内LANへの不正な接続は拒否する。許可されたWebやメールの通信ではパケットの内容で判定しないため，盗聴・改ざん，SQLインジェクション，メール添付による流出をこの設定だけで防ぐことはできない。',
    };
  });
