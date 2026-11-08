import { p, strings, table } from './definition';
import { localDnsHosts } from './legacy-2015-spring-pm-01-04-models';
import { spring2015Pm0104Diagram as figure, spring2015Pm0104Profiles as profiles } from './legacy-2015-spring-pm-01-04-figures';
import { answers, bank, define, single } from './legacy-2015-spring-pm-01-04-shared';
import allBanks from './legacy-2015-spring-pm-01-04-banks.json';

const choices = allBanks[3] as { firstAnswer: string[]; unreachable: string[]; leak: string[]; mitigation: string[] };
const title = 'ホスト名の衝突';
const caseConditions = [
  {
    first: '例えば，新しい正式なTLDとして，“bunkyo”が追加され，インターネット上でホスト名“www.bunkyo”のWebサーバの運用が開始されたとき，A社内の端末のDNSリゾルバに，ホスト名“www.bunkyo”を問い合わせると，［a］が返される。',
    second: 'また，新しく正式なTLDとして，“corp”が追加され，インターネット上でホスト名“www.corp”のWebサーバの運用が開始されたとき，A社内の端末のDNSリゾルバを使っても［b］のIPアドレスを得ることができない。',
    firstKey: 2, secondKey: 3,
    reason: 'a：補完前のwww.bunkyoの問合せが公開DNSで成功するため，www.bunkyo.example.co.jpを試さず公開WebサーバのIPアドレスを返す。\nb：A社のDNSサーバはwww.corpを自分で管理しているので，外部に問合せをせず内部のIPアドレスを返す。',
  },
  {
    first: '例えば，新しい正式なTLDとして，“bunkyo”が追加され，インターネット上で“portal.bunkyo”の運用が開始された。ただし外部DNSには“www.bunkyo”の登録がない。このときA社内の端末のDNSリゾルバに，ホスト名“www.bunkyo”を問い合わせると，［a］が返される。',
    second: 'また，新しく正式なTLDとして，“corp”が追加され，インターネット上でホスト名“www.corp”のWebサーバの運用が開始された。A社のDNSサーバには，この追加後，TLDが“corp”の場合に限って内部の管理表を参照する前に外部のDNSサーバへ転送し，外部で見つかったIPアドレスを優先して返す規則を加えた。このとき，A社内の端末のDNSリゾルバを使っても［b］のIPアドレスを得ることができない。',
    firstKey: 0, secondKey: 1,
    reason: 'a：外部でwww.bunkyoは見つからないので，サーチリストで補完したwww.bunkyo.example.co.jpを再照会し，A社の内部IPアドレスが返る。\nb：追加した規則によりwww.corpは外部へ優先的に転送し，公開側のIPアドレスが返る。内部の同名ホストのIPアドレスを得られない。',
  },
] as const;

export function spring2015Pm4Pages(index: number) {
  const c = caseConditions[index];
  return [
    [
      p('問4　ホスト名の衝突に関する次の記述を読んで，設問1，2に答えよ。'),
      p('DNS（Domain Name System）は，ルートサーバを頂点とする多数のDNSサーバから成る階層的な分散型データベースシステムであり，ホスト名とIPアドレスの変換に使用される。'),
      p('A社は，一般に通用している自社ドメイン“example.co.jp”の他に，正式なTLD（最上位のドメイン）として運用されていない“corp”を，自社のネットワークだけで運用する独自のTLDとして使っている。自社ネットワークに設置しているDNSサーバで，これら二つのドメインのホスト名とIPアドレスの対応を管理している。A社のDNSサーバで管理しているホスト名を，表1に示す。'),
      table('表1　A社のDNSサーバで管理しているホスト名', ['ホスト名'], localDnsHosts.map(host => [host])),
      p('ホスト名に対応するIPアドレスを知りたいアプリケーションは，DNSリゾルバ（各端末で動作し，DNSサーバにIPアドレスの問合せを行うプログラム）に，ホスト名に対応するIPアドレスを問い合わせる。問合せを受けたDNSリゾルバは，A社のDNSサーバに問い合わせる。'),
      p('問合せを受けたDNSサーバは，問い合わせられたホスト名が自分で管理しているホスト名であれば対応するIPアドレスを返す。そうでなければ外部のDNSサーバに問い合わせ，その結果として得られたIPアドレス，又は見つからなかったことを示すエラーのいずれかを返す（図1）。'),
    ],
    [
      figure(profiles.dns, '図1　IPアドレスの問合せ'),
      p('A社では，ドメイン名を補完できるように，各端末のDNSリゾルバの設定で，A社のドメイン“example.co.jp”をサーチリストに登録することを指示している。このため，DNSリゾルバに問合せを行うアプリケーションは，ドメイン名“example.co.jp”を省略しても，ホスト名に対応するIPアドレスを得ることができる。'),
      p('例えば，ホスト名“www.bunkyo.example.co.jp”のIPアドレスを知りたいときは，ホスト名“www.bunkyo”で問い合わせれば，ホスト名“www.bunkyo.example.co.jp”のIPアドレスが，次のようにして得られる（図2）。ここで，“bunkyo”というTLDは存在しないものとする。'),
      p('① アプリケーションが，DNSリゾルバにホスト名“www.bunkyo”のIPアドレスを問い合わせる。'),
      p('② DNSリゾルバは，A社のDNSサーバにホスト名“www.bunkyo”のIPアドレスを問い合わせる。'),
      p('③ ホスト名“www.bunkyo”に対応するIPアドレスが見つからないので，A社のDNSサーバは，エラーをDNSリゾルバに返す。'),
      p('④ エラーを受け取ったDNSリゾルバは，ホスト名“www.bunkyo”に，サーチリストに登録されたドメイン名“example.co.jp”を連結したホスト名“www.bunkyo.example.co.jp”のIPアドレスをA社のDNSサーバに問い合わせる。'),
      p('⑤ A社のDNSサーバは，“www.bunkyo.example.co.jp”のIPアドレスをDNSリゾルバに返す。'),
      p('⑥ DNSリゾルバは，A社のDNSサーバから返された“www.bunkyo.example.co.jp”のIPアドレスをアプリケーションに返す。'),
    ],
    [
      figure(profiles.sequence, '図2　サーチリストを利用したIPアドレスの問合せ'),
      p('近年，多数の正式なTLDが追加されていて，これまでになかった新しいTLDが運用されることによって，名前が衝突するリスクが高まっている。'),
      p(c.first),
      p(c.second),
      p('名前の衝突が起こることによって，本来アクセスしたいサーバにアクセスできないだけではなく，［c］ことによる情報漏えいなど，セキュリティ上のリスクが発生する。'),
    ],
    [
      p('設問1　本文中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      ...bank('aに関する解答群', choices.firstAnswer),
      ...bank('bに関する解答群', choices.unreachable),
      ...bank('cに関する解答群', choices.leak),
      p('設問2　新たなTLDが追加されることによって生じる，名前が衝突するリスクを低減させる対策として適切でない答えを，解答群の中から選べ。'),
      ...bank('解答群', choices.mitigation),
    ],
  ];
}

export const legacy2015SpringPm4Definition = define(
  4, title, '設問1 a=ウ・b=エ・c=イ、設問2=イ',
  '公開DNSの登録と外部への転送優先条件', caseConditions.length,
  '名前解決の図と解答欄を保ち、新TLDで実際に登録される公開ホストと、同名の場合にDNSが優先する応答を変えています。',
  '印刷p.17〜20／物理p.18〜21。サーチリストを使うのは最初の問合せに失敗したとき。後段で条件を変更する場合は、図2の登録前の例と分ける。cの情報漏えいと設問2の否定を保つ。',
  index => {
    const c = caseConditions[index];
    return {
      prompt: spring2015Pm4Pages(index).flat(),
      ...answers([choices.firstAnswer, choices.unreachable, choices.leak, choices.mitigation].map(strings), [
        single('a', '設問1 a', 0, c.firstKey), single('b', '設問1 b', 1, c.secondKey),
        single('c', '設問1 c', 2, 1), single('s2', '設問2', 3, 1),
      ]),
      explanation: c.reason + '\n' +
        'c：利用者が内部サーバを意図して入力した名前から外部のIPアドレスを得ると，外部サーバに意図せず接続して情報を送ることがある。\n' +
        '設問2：独自TLDをやめれば同名の衝突を，サーチリストをやめれば省略名による誤接続を減らせる。一方，外部DNSとの通信を一律に遮断すると通常の公開ホスト名まで解決できず，適切な対策ではない。',
    };
  },
);
