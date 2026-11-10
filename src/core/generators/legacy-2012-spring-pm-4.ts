import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2012-spring-pm-01-04-shared';
import { draw } from './legacy-2012-spring-pm-01-04-figures';
import { transferData } from './legacy-2012-spring-pm-01-04-models';

const boundary = ['n以下の', 'n以上の', 'n未満の', 'nより大きい'];

export function spring2012Pm4Pages(index: number) {
  const { tx, latency, gap, ack, payload, packet, times, buffers } = transferData(index);
  return [
    [
      p('問4　データ転送時のフロー制御に関する次の記述を読んで，設問に答えよ。'),
      p('端末Aから端末Bにデータを転送する。端末Aでは，データを' + payload + 'kバイト単位に分割し，分割したデータをそれぞれ一つずつのパケットに格納して送信する。パケット一つの大きさは' +
        packet + 'kバイトである。端末Bでは，受信したパケットを受信バッファに格納し，受信処理として，パケットの整合性の検査とパケットからのデータ抽出を行う。その後，パケットを正しく受信したことを知らせるために，端末AにACKを送信する。受信処理後は直ちに受信バッファの再利用が可能となる。端末Bの受信バッファの大きさは' +
        packet + 'kバイトである。端末Aでは，端末Bの受信バッファの大きさは判明しているが，端末Bでの各処理に掛かる時間は分からない。'),
      p('端末Aは，送信したパケットに対応する端末BからのACKを受信することで，端末Bの受信バッファに空きができたことを検知し，次のパケットを送信する。'),
      p('端末Aで，パケット1個の送信に掛かる時間は' + tx + 'ミリ秒，ACK受信に掛かる時間は' + ack +
        'ミリ秒，ACKの受信を完了してから次のパケットが送信可能になるまでに掛かる時間は' + gap + 'ミリ秒である。'),
      p('端末Aと端末Bとの間の通信の様子と，端末Aでの各処理に掛かる時間を，図1に示す。'),
      draw('transfer', [index, 0], '図1　端末Aと端末Bとの間の通信の様子'),
    ],
    [
      p('パケット1個の送信を完了してから，対応するACKの受信を開始するまでに掛かる時間は一定で，その時間が' + latency +
        'ミリ秒であったとすると，データ1Mバイトを送信し，次のパケットが送信可能となるまでの時間（以下，データ1Mバイト当たりの転送時間という）は［a］秒である。ここで，1Mバイトは1,000kバイトとし，パケットやACKは確実に相手に届くものとする。'),
      p('データの転送に掛かる時間を短縮するために，端末Bの受信バッファを' + packet * 2 + 'kバイトに拡大した。'),
      p('端末Aは，端末Bの受信バッファに空きがあることが確かなときは，送信したパケットに対応するACKの受信を待たずに次のパケットを送信することができる。すなわち，“送信済みのパケット数 − 受信済みのACK数”が1以下であれば，端末Aは次のパケットを送信できる。パケット1個の送信を完了してから次のパケットが送信可能になるまでに掛かる時間は' +
        gap + 'ミリ秒であり，その他に掛かる時間は受信バッファの大きさが' + packet + 'kバイトのときと同じである。'),
      p('パケットの送信とACKの受信，及びパケットの受信とACKの送信は，並行して行うことができる。このときの通信の様子を，図2に示す。'),
      p('このとき，データ1Mバイト当たりの転送時間は［b］秒である。'),
      draw('transfer', [index, 1], '図2　受信バッファを拡大したときの通信の様子'),
    ],
    [
      p('受信バッファを更に拡大することで，データの転送に掛かる時間を短縮することを考える。受信バッファの大きさを(' +
        packet + '×n)kバイトとすると，“送信済みのパケット数 − 受信済みのACK数”が［c］ときは，端末Aは端末Bの受信バッファにパケット1個分以上の空きがあることが分かるので，次のパケットを送信することができる。'),
      p('各処理に掛かる時間が図1及び図2のとおりであり，パケット1個の送信を完了してから，対応するACKの受信を開始するまでに掛かる時間は一定で，その時間が' +
        latency + 'ミリ秒であったとすると，データ1Mバイト当たりの転送時間は［d］秒まで短くすることができ，このときの最小の受信バッファの大きさは［e］kバイトである。'),
      p('設問　本文中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      ...bank('a，b，dに関する解答群', times),
      ...bank('cに関する解答群', boundary),
      ...bank('eに関する解答群', buffers),
    ],
  ];
}

export const legacy2012SpringPm4Definition = define(4, 'データ転送時のフロー制御', 'a=コ・b=キ・c=ウ・d=エ・e=カ',
  'パケットの送信時間・送信完了からACKの受信開始までの時間', 'パケットの送信時間と，送信完了からACK受信開始までの時間を変えます。',
  'p.16〜18。データ1kバイトとパケット1.2kバイトの区別，1M＝1,000k，確実な到着，並行送受信と次の送信可能時点，ACKの受信・次送信準備を維持。昇順の転送時間10択とバッファ7択は，各条件のパケット個数・通信遅延・誤った換算から作る。',
  index => {
    const { tx, latency, gap, ack, packet, step, cycle, window, perOne, perTwo, fastest, times, buffers } = transferData(index);
    const capacity = Number((window * packet).toFixed(1));
    return {
      prompt: spring2012Pm4Pages(index).flat(),
      ...answers([strings(times), strings(boundary), strings(buffers)], [
        single('a', 'a', 0, times.indexOf(String(perOne))), single('b', 'b', 0, times.indexOf(String(perTwo))),
        single('c', 'c', 1, 2), single('d', 'd', 0, times.indexOf(String(fastest))), single('e', 'e', 2, buffers.indexOf(String(capacity))),
      ]),
      explanation: '1Mバイトのデータは1kバイトずつの1,000パケットで送る。バッファ1個分では一つの送信開始から次の送信可能まで' +
        tx + '＋' + latency + '＋' + ack + '＋' + gap + '＝' + cycle + 'ミリ秒なので' + perOne +
        '秒。バッファ2個分では同じ時間に2パケットを送り，1,000個で' + perTwo + '秒になる。未確認数がn未満なら次の1個分が空く。待ちがなくなると最短間隔は' +
        step + 'ミリ秒で，1,000個当たり' + fastest + '秒。' + cycle + '÷' + step + 'を切り上げた' + window +
        '個分が最低限必要で，' + packet + '×' + window + '＝' + capacity + 'kバイトである。',
    };
  });
