import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2010-spring-pm-01-04-shared';
import { draw } from './legacy-2010-spring-pm-01-04-figures';
import { capacities, probabilities, streamingCase, trafficTable } from './legacy-2010-spring-pm-01-04-queue';

const concurrency = [71, 72, 73, 74, 75];
const trafficMeanings = ['1分当たりに送信される動画の本数', '1分当たりの動画の延べ再生時間',
  'ネットワーク帯域の最大占有率', 'ネットワークの平均消費帯域幅'];

export function spring2010Pm4Pages(index: number) {
  const { rateTenths, requests, duration, stored, allowed, observed, space, bandwidth, waiting } = streamingCase(index);
  return [[
    p('問4　動画のストリーミングサーバの設置計画に関する次の記述を読んで，設問1，2に答えよ。'),
    p('S社は表1に示す要件で動画のストリーミングサーバ（以下，サーバという）の設置を計画している。'),
    draw('requirements', index, '表1　動画ストリーミングの要件'),
    p('設問1　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('サーバに格納される動画のデータ量は約［a］Gバイトであり，サーバから動画を送信するときに要求されるビット速度は，平均で［b］Mビット／秒である。ここで，1Gバイト＝10⁹バイト，1Mビット＝10⁶ビットとする。'),
    ...bank('aに関する解答群', space),
    ...bank('bに関する解答群', bandwidth),
  ], [
    p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('サーバは複数の動画を同時に送信可能である。また，クライアントからの要求はランダムに発生し，サーバが同時に送信可能な本数を上回る要求は待ち行列に入れられ，順次処理されるものとする。'),
    p('このとき，クライアントの要求が待ち行列に入る確率Pは，待ち行列理論によって，二つの引数をとる関数fで計算することができる。引数の一つは，サーバが同時に送信可能な動画の本数nであり，もう一つは，要求されるトラフィックTである。この場合，Tは，［c］で，次の式で計算できる。'),
    p('クライアントからの1分当たりの要求本数 × 動画1本の平均再生時間（分）'),
    p('fを使いP，n，Tの関係を求めたものを，表2に示す。表2の網掛けの部分がTである。表2によれば，要件のとおり，要求が待たされる確率を' +
      allowed + '％以下にするためには，サーバが最低［d］本の動画を同時に送信できなければならないことが分かる。'),
    p('また，仮に，サーバが' + observed + '本の動画を同時に送信できる能力をもつとき，要求が待たされる確率はおよそ［e］％である。'),
    p('なお，回線容量は十分にあり，通信の遅延はないものとする。'),
    draw('queue', 0, '表2　P，n，Tの関係（一部）'),
  ], [
    ...bank('cに関する解答群', trafficMeanings),
    ...bank('dに関する解答群', concurrency),
    ...bank('eに関する解答群', waiting),
  ]];
}

export const legacy2010SpringPm4Definition = define(4, '動画ストリーミングサーバの設置計画', '設問1 a=ウ・b=ウ・設問2 c=イ・d=イ・e=ア',
  'ビット速度，要求件数と再生時間，格納本数，許容確率と観測する同時送信能力',
  '動画の長さ・速度・本数、待たされる確率の要件、同時送信能力を変更します。',
  'p.22〜24。指数分布・再生時間と送信時間の一致・ランダムな到着と順次処理・通信遅延なし・10進単位を保持。待ち行列の原表は網掛けと単位を維持し，表の精度で一意に読める入力にする。', index => {
    const { rateTenths, requests, duration, stored, allowed, observed, space, bandwidth, waiting } = streamingCase(index);
    const traffic = requests * duration, storage = rateTenths * duration * 60 * stored / 80_000;
    const throughput = rateTenths * traffic / 10;
    const allowedColumn = probabilities.indexOf(allowed), minimumRow = trafficTable.findIndex(row => row[allowedColumn] >= traffic);
    const observedRow = trafficTable[capacities.indexOf(observed)], waitColumn = observedRow.indexOf(traffic);
    const min = capacities[minimumRow], wait = probabilities[waitColumn];
    return {
      prompt: spring2010Pm4Pages(index).flat(),
      ...answers([space, bandwidth, trafficMeanings, concurrency, waiting].map(group => strings(group.map(String))), [
        single('a', '設問1 a', 0, space.indexOf(storage)), single('b', '設問1 b', 1, bandwidth.indexOf(throughput)),
        single('c', '設問2 c', 2, 1), single('d', '設問2 d', 3, concurrency.indexOf(min)),
        single('e', '設問2 e', 4, waiting.indexOf(wait)),
      ]),
      explanation: '動画1本は' + (rateTenths / 10) + 'Mビット／秒で' + (60 * duration) + '秒続く。全' + stored +
        '本分のビットを足し，8ビットを1バイト，10⁹バイトを1Gバイトとすると' + storage + 'Gバイト。' +
        '到着は1分当たり' + requests + '本で各' + duration + '分を占めるので，延べ再生時間は1分当たり' + traffic +
        '分となる。これに1本のビット速度を掛けて平均' + throughput + 'Mビット／秒を得る。' +
        '表2のP＝' + allowed + '％列でTが' + traffic + '以上になる最初の行はn＝' + min +
        '。n＝' + observed + 'の行でT＝' + traffic + 'に対応するPは約' + wait + '％である。',
    };
  });
