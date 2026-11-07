import { field, p, strings, variableNotes } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { spring2016PmBank, spring2016PmCase, spring2016PmParts } from './legacy-2016-spring-pm-01-04-shared';
import {
  spring2016Pm0104Diagram as diagram, spring2016Pm0104Profiles as f,
  spring2016Pm4Cases, spring2016Pm4Networks, spring2016Pm4Routers,
} from './legacy-2016-spring-pm-figures-01-04';

const groups = [
  ['宛先として格納', '送信元として格納', 'データ部に格納', 'プリアンブルに格納', 'ヘッダ部に格納'],
  ['48', '254', '256', '2³²', '2⁴⁸'],
  ['TCPセグメントとして送信', 'UDPデータグラムとして送信', 'ブロードキャスト', 'ホストBのMACアドレス宛てに送信', 'ユニキャスト'],
  ['ブリッジC', 'ホストD', 'ホストE', 'ホストF', 'ルータG', 'ルータH'],
];

export const legacy2016SpringPm4Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-4',
  title: 'イーサネットを介した通信',
  version: '3.2.0',
  sourceAnswer: '設問1 a=ウ、b=オ、c=ウ／設問2 d=ウ、e=オ',
  fields: [field('ARP要求の送信元と接続先セグメント', 0, 3)],
  reference: [0],
  publicNotes: 'MACアドレス・ARP要求と応答・キャッシュの説明、ネットワーク構成図と五つの空欄を維持します。設問2では送信元ホストと二つのセグメントへの接続を変え、ローカルの宛先と別セグメントへの次ホップを図から判断します。',
  notes: variableNotes + ' 原物理18〜20頁の48bit/8bit毎の16進表記・ARP要求と応答・キャッシュ破棄・送信時の未キャッシュ・全6機器と基幹ネットワークを保持。5欄21固有択27参照、d/e共通銀行は順序固定。生成非基準では経由ルータのアドレスもキャッシュされていないことを解答前に明示。4条件でブリッジに対する送信側と接続ネットワークを変える。ARPは接続区間内の解決として扱い、最終IP宛先との混同を検出する。',
  build(values) {
    const i = spring2016PmCase(values), c = spring2016Pm4Cases[i];
    const router = spring2016Pm4Routers[c.senderNetwork];
    return {
      prompt: [
        p('問4 イーサネットを介した通信に関する次の記述を読んで，設問1，2に答えよ。'),
        p('IPネットワークにおいて，あるホストが別のホストと通信する場合，通信相手のホストのIPアドレスを指定して通信する。下位層にイーサネットを用いるときには，通信相手のホストのMACアドレス，又は通信相手のホストに到達可能なルータのMACアドレスが必要になる。しかし，IPネットワークで通信を行うアプリケーションでは，通信相手のIPアドレスやホスト名を明示的に指定することはあっても，MACアドレスを明示的に指定することはない。したがって，IPアドレスを手掛かりとして必要なMACアドレスを得るために，IPネットワークではARP（アドレス解決プロトコル）というプロトコルが用いられる。'),
        p('〔MACアドレスに関する説明〕'),
        p('イーサネットとIPをOSI基本参照モデルに当てはめた場合，イーサネットは物理層とデータリンク層に該当し，IPはネットワーク層に該当する。つまり，IPネットワークでの通信で取り扱うIPデータグラムを，下位層のイーサネットで送信するためには，IPデータグラムを［a］したイーサネットフレームを送信する。このとき，イーサネットフレームの宛先を表すアドレスとして用いられるのがMACアドレスである。MACアドレスの長さは48ビットであり，表現可能なアドレスの個数は［b］個となる。'),
        p('なお，ここではMACアドレスを表記する際，8ビットごとに2桁の16進数00〜FFで表し，それぞれの間はコロンで区切る。例えば，00:53:00:12:C5:8Aのように表す。'),
        p('〔ARPの機能の説明〕'),
        p('IPアドレスを基にMACアドレスを得るARPの機能は，問合せとして“ARP要求”を送信し，それに対する回答として“ARP応答”を受け取ることで実現される。'),
        p('例えば，セグメント10.1.1.0/24において，ホストA（IPアドレス10.1.1.10，MACアドレス00:53:00:DA:C7:0B）がホストB（IPアドレス10.1.1.20，MACアドレス00:53:00:EC:17:27）宛てにIPデータグラムを送信しようとしたとき，ホストBのMACアドレスはARPによって，次のようにして得られる。'),
        p('(1) ホストAは，IPアドレス10.1.1.20に対するARP要求を送信する。このとき，ARP要求は［c］される。'),
        p('(2) ARP要求を受け取ったホストBは，そのARP要求が自分のIPアドレスに対する問合せであることを確認すると，自分のIPアドレス10.1.1.20とMACアドレス00:53:00:EC:17:27を格納したARP応答を送信する。同じARP要求を受け取ったその他のホストは，それが自分のIPアドレスに対する問合せではないので，無視する。'),
        p('(3) ホストAは，ホストBが送信したARP応答を受け取ることによって，IPアドレス10.1.1.20に対応するMACアドレスが00:53:00:EC:17:27であることが分かる。'),
        p('ホストAは，ホストBのIPアドレスと得られたMACアドレスの対応付けをキャッシュする。キャッシュが破棄されるまで10.1.1.20宛てのIPデータグラムを送る際，イーサネットフレームの宛先MACアドレスとして00:53:00:EC:17:27を使用する。'),
        p('設問1 本文中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ...groups.slice(0, 3).flatMap((group, n) => spring2016PmBank('abc'[n] + 'に関する解答群', group)),
        p('設問2 次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        p('図1は，ある企業の社内ネットワークの構成（一部）である。'),
        diagram(f.q4Network, [i], '図1 ある企業の社内ネットワークの構成（一部）'),
        p('このネットワークにおいて，ホスト' + c.sender + 'が，幾つかの宛先にIPデータグラムを送信しようとするとき，ホスト' + c.sender + 'はARPによって送信に必要なMACアドレスを得る。ここで，ホスト' + c.sender + 'がIPデータグラムを送信しようとしたとき，' + (i === 0 ? '宛先' : '宛先及び経由するルータ') + 'のMACアドレスはホスト' + c.sender + 'にキャッシュされていないものとする。'),
        p('ホスト' + c.local + 'に対してIPデータグラムを送信しようとするとき，ホスト' + c.sender + 'は［d］のIPアドレスに対するARP要求を送信する。'),
        p('ホスト' + c.remote + 'に対してIPデータグラムを送信しようとするとき，ホスト' + c.sender + 'は［e］のIPアドレスに対するARP要求を送信する。'),
        ...spring2016PmBank('設問2 解答群', groups[3]),
      ],
      ...spring2016PmParts(groups.map(strings), [
        { id: 'a', label: '設問1 a', group: 0, correct: 2 },
        { id: 'b', label: '設問1 b', group: 1, correct: 4 },
        { id: 'c', label: '設問1 c', group: 2, correct: 2 },
        { id: 'd', label: '設問2 d', group: 3, correct: groups[3].indexOf('ホスト' + c.local) },
        { id: 'e', label: '設問2 e', group: 3, correct: groups[3].indexOf('ルータ' + router) },
      ]),
      explanation: [
        'a：イーサネットのデータ部に上位層のIPデータグラムを入れる。宛先・送信元はMACアドレスを入れるヘッダの欄で，プリアンブルは同期用である。',
        'b：48ビットの各ビットには0と1の2通りがあるため，ビット列として表現できる個数は2⁴⁸個。48はビット数で，256は8ビット1組の候補数，2³²は32ビットの場合の個数である。',
        'c：宛先のMACアドレスをまだ知らないので，ARP要求を同じネットワーク内へブロードキャストする。ARPはTCP・UDPのデータとして送る方式ではなく，ホストBが自分のIPアドレスへの問合せだけに応答する。',
        'd：ホスト' + c.sender + 'とホスト' + c.local + 'は，ブリッジCでつながる' + spring2016Pm4Networks[c.senderNetwork] + 'の同じIPネットワークにある。そのため宛先のホスト' + c.local + '自身のIPアドレスを問い合わせる。ブリッジCのIPアドレスを問い合わせる必要はない。',
        'e：ホスト' + c.remote + 'は別のIPネットワークにある。最初のイーサネットフレームの宛先は，送信元と同じネットワークに接続するルータ' + router + 'なので，そのインタフェースのIPアドレスをARPで解決する。IPデータグラム自体の宛先はホスト' + c.remote + 'のままである。',
        'IPはInternet Protocol（ネットワーク間でデータを配送するプロトコル），MACはMedia Access Control（媒体アクセス制御），ARPはAddress Resolution Protocol（IPアドレスに対応するリンク層アドレスを解決するプロトコル）。OSIはOpen Systems Interconnection（開放型システム間相互接続）で，TCPはTransmission Control Protocol（到達順序などを制御するトランスポート），UDPはUser Datagram Protocol（コネクションを確立しないトランスポート）。',
      ].join('\n'),
    };
  },
};
