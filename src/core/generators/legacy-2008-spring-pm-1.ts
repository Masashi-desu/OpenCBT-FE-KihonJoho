import { p, strings, table } from './definition';
import { answers, bank, define, format, single } from './legacy-2008-spring-pm-01-05-shared';

const disks = [
  { capacity: [60, 80], rates: [4200, 5400], seek: [14, 12], transfer: [20, 30], size: 100, search: 10, hit: 4, fast: 4, slow: 170, block: 2 },
  { capacity: [80, 100], rates: [3600, 6000], seek: [13, 10], transfer: [30, 40], size: 120, search: 12, hit: 3, fast: 6, slow: 146, block: 4 },
  { capacity: [120, 160], rates: [4800, 6000], seek: [15, 12], transfer: [25, 50], size: 150, search: 8, hit: 6, fast: 8, slow: 183, block: 4 },
  { capacity: [150, 200], rates: [3750, 5000], seek: [16, 12], transfer: [40, 50], size: 200, search: 14, hit: 7, fast: 8, slow: 180, block: 8 },
] as const;

function diskTimes(index: number) {
  const input = disks[index];
  const [a, b] = input.rates.map(rate => Math.floor(300000 / rate));
  const [at, bt] = input.transfer.map(rate => Math.floor(input.size * 10 / rate));
  const gain = (input.seek[0] - input.seek[1]) * 10 + a - b + at - bt;
  const expect = input.search + Math.floor((input.hit * input.fast + (10 - input.hit) * input.slow) / 10);
  const bankOne = index === 0 ? [33, 50, 53, 55, 71, 111, 142] :
    [a, at, gain, b, bt, Math.floor(600000 / input.rates[1]), 2 * a].sort((left, right) => left - right);
  const bankTwo = index === 0 ? [70, 80, 103, 113, 132, 142] : [
    input.search + Math.floor(input.hit * input.slow / 10),
    input.search + Math.floor(input.hit * input.fast / 10),
    expect - input.search,
    expect,
    input.search + Math.floor((input.hit * input.slow + (10 - input.hit) * input.fast) / 10),
    input.search + input.slow,
  ].sort((left, right) => left - right);
  return { input, a, b, at, bt, gain, expect, bankOne, bankTwo };
}
const millis = (value: number) => (value / 10).toFixed(1);

export function spring2008Pm1Pages(index: number) {
  const { input, b, bt, bankOne, bankTwo } = diskTimes(index);
  const row = (label: string, values: readonly (string | number)[]) => [label, ...values.map(String)];
  const unitNote = '注　1Gバイト＝1,000Mバイト，1Mバイト＝1,000kバイト';
  const rounding = '解答は小数第2位以下を切り捨てるものとする。';
  return [[
    p('問1　ハードディスク装置に関する次の記述を読んで，設問1，2に答えよ。'),
    p('X社では，ハードディスク装置である製品Aと製品Bを生産している。製品Aと製品Bの仕様を表に示す。'),
    table('表　製品Aと製品Bの仕様', ['仕様', '製品A', '製品B'], [
      row('記憶容量', input.capacity.map(value => value + 'Gバイト')),
      row('回転数', input.rates.map(value => format(value) + '回／分')),
      row('平均位置決め時間', input.seek.map(value => value.toFixed(1) + 'ミリ秒')),
      row('データ転送速度', input.transfer.map(value => value + 'Mバイト／秒')),
    ]),
    p(unitNote),
    p('設問1　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。' + rounding),
    p('製品Aでは，平均回転待ち時間は［a］ミリ秒であり，' + input.size + 'kバイトのデータを転送する時間は［b］ミリ秒である。'),
    p('一方，製品Bでは，平均回転待ち時間が' + millis(b) + 'ミリ秒であり，' + input.size + 'kバイトのデータを転送する時間が' +
      millis(bt) + 'ミリ秒であることから，' + input.size + 'kバイトの平均アクセス時間（平均位置決め時間＋平均回転待ち時間＋データ転送時間）は，製品Aに比べて［c］ミリ秒短い。'),
    ...bank('解答群', bankOne.map(millis)),
  ], [
    p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。' + rounding),
    p('読取り時のアクセス時間を短縮するために，ディスクキャッシュを搭載した製品Cを開発した。ディスクキャッシュへの書込みと読取りは，' +
      input.block + 'kバイトのブロック単位で行う。あるブロックに対するデータの読取り要求があった場合，ディスクキャッシュを検索し，ディスクキャッシュにそのブロックのデータがあればディスクキャッシュ上のデータを返す。ディスクキャッシュ上にそのブロックのデータがなければ，磁気ディスクからデータを読み込み，データを返すと同時にディスクキャッシュ上の最も古いブロックのデータと交換する。'),
    p('ディスクキャッシュを検索する平均時間は' + millis(input.search) + 'ミリ秒，ディスクキャッシュの平均ヒット率は0.' +
      input.hit + '，ディスクキャッシュからの1ブロック当たりのデータの平均読取り時間は' + millis(input.fast) +
      'ミリ秒とする。ディスクキャッシュがヒットしなかったとき，磁気ディスクからの1ブロック当たりのデータの平均読取り時間は，ディスクキャッシュ上の最も古いブロックのデータと交換する時間も含めて' +
      millis(input.slow) + 'ミリ秒とする。このとき，製品Cの1ブロック当たりの読取り時の平均アクセス時間は［d］ミリ秒となる。'),
    ...bank('解答群', bankTwo.map(millis)),
  ]];
}

export const legacy2008SpringPm1Definition = define(1, '平均ディスクアクセス時間とキャッシュ', '設問1 a=オ・b=イ・c=ウ・設問2 d=エ',
  '回転数・転送量・位置決め時間・ヒット率', 'ディスクの回転と転送の条件、ブロックサイズとキャッシュのヒット率・時間を変えます。',
  'p.4〜5。半回転・10進単位・紙面で与えられるBの時間・小数第2位以下切捨て・ヒット／ミス両方での検索を維持。共有7択・6択は原尺度順。', index => {
    const { input, a, b, at, bt, gain, expect, bankOne, bankTwo } = diskTimes(index);
    return {
      prompt: spring2008Pm1Pages(index).flat(),
      ...answers([strings(bankOne.map(millis)), strings(bankTwo.map(millis))], [
        single('a', '設問1 a', 0, bankOne.indexOf(a)), single('b', '設問1 b', 0, bankOne.indexOf(at)),
        single('c', '設問1 c', 0, bankOne.indexOf(gain)), single('d', '設問2 d', 1, bankTwo.indexOf(expect)),
      ]),
      explanation: '1回転の半分を平均して待つので，Aの回転待ちは60,000÷（2×' + format(input.rates[0]) + '）ミリ秒であり，小数第2位以下を切り捨てると' +
        millis(a) + 'ミリ秒。' + input.size + 'kバイトを' + input.transfer[0] + 'Mバイト／秒で転送する時間は' +
        millis(at) + 'ミリ秒。Aの位置決め・回転待ち・転送の和から，与えられたBの回転待ち' + millis(b) + '，転送' +
        millis(bt) + 'と位置決めを合わせた時間を引くと' + millis(gain) +
        'ミリ秒短い。キャッシュ検索は毎回行う。ヒットとミスの読取り時間を各確率で加重して検索時間を加え，切り捨てると' +
        millis(expect) + 'ミリ秒になる。',
    };
  });
