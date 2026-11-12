import { p, strings, table } from './definition';
import { answers, bank, define, format, single } from './legacy-2008-autumn-pm-01-05-shared';
import { draw } from './legacy-2008-autumn-pm-01-05-figures';

const examples = [
  { rate: 20, calls: [20, 20, 20, 10, 10, 10] },
  { rate: 24, calls: [18, 12, 20, 8, 6, 8] },
  { rate: 16, calls: [30, 18, 24, 6, 4, 8] },
  { rate: 32, calls: [16, 10, 12, 6, 8, 4] },
] as const;

function traffic(index: number) {
  const { rate, calls } = examples[index];
  const [hx, hy, hz, xy, xz, yz] = calls;
  const offices = hx + hy + hz, branches = xy + xz + yz;
  const initial = (offices + 2 * branches) * rate, x = (hx + xy + xz) * rate, direct = offices * rate;
  const options = [
    ['1/4', '1/2', '2', '4'],
    [x / 2, x, direct, initial].map(format),
    [x / 2, direct, (offices + branches) * rate, initial].map(format),
    ['1/4倍', '1/2倍', '同じ', '2倍', '4倍'],
  ];
  return { rate, hx, hy, hz, xy, xz, yz, initial, x, direct, options };
}

export function autumn2008Pm1Pages(index: number) {
  const { rate, hx, hy, hz, xy, xz, yz, initial, options } = traffic(index);
  return [[
    p('問1　通信ネットワークに関する次の記述を読んで，設問1，2に答えよ。'),
    p('A社は，本社及び三つの支店から成り，合計4か所の拠点を結ぶ通信ネットワークを構築している。支店同士は直接通信できず，本社に設置されたルータを経由して通信する。ネットワーク構成を図1に，支店間の通信経路を図2に示す。'),
    draw('topology', 0, '図1　ネットワーク構成'),
    draw('topology', 1, '図2　支店間の通信経路'),
    p('A社は，通信ネットワーク上にIP電話による内線網を構築し，拠点間の通話を行っている。ピーク時における各拠点間の同時通話数は，表のとおりである。'),
    table('表　ピーク時における各拠点間の同時通話数', ['拠点', '支店X', '支店Y', '支店Z'], [
      ['支店Y', '', '', String(yz)], ['支店X', '', String(xy), String(xz)], ['本社', String(hx), String(hy), String(hz)],
    ]),
    p('なお，1通話が使用するビット速度（帯域幅）は，データ圧縮をするので送話，受話ともに' + rate + 'kビット／秒であり，通話接続の制御に伴う通信量は無視できるものとする。'),
  ], [
    p('設問1　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('支店X，Y間の通話には，支店Xから支店Yに向かう音声と，支店Yから支店Xに向かう音声による通信が発生する。支店間の通信は本社に設置されたルータを必ず経由するので，これらの通信は本社のアクセスポイントとルータとの間wを往復する。したがって，支店X，Y間の通話について，wのトラフィックは，支店Xとアクセスポイントとの間xの［a］倍である。'),
    p('IP電話のピーク時のトラフィックは，wでは，上り下りとも' + format(initial) + 'kビット／秒であり，xでは，上り下りとも［b］kビット／秒である。ただし，拠点からアクセスポイントに向かう通信を上り，アクセスポイントから拠点に向かう通信を下りとする。'),
    ...bank('aに関する解答群', options[0]), ...bank('bに関する解答群', options[1]),
    p('設問2　A社は支店間の通信形態を見直して，本社のルータを経由せずに，支店同士が直接通信できるようにする。次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('通信形態の見直しによって，想定されるピーク時のIP電話によるトラフィックは，本社のアクセスポイントとルータとの間wでは，上り下りとも［c］kビット／秒となる。各支店とアクセスポイントとの間（x，y，z）のトラフィックは，見直し前と比べて［d］である。'),
    ...bank('cに関する解答群', options[2]), ...bank('dに関する解答群', options[3]),
  ]];
}

export const legacy2008AutumnPm1Definition = define(1, '拠点間IP電話のトラフィック',
  '設問1 a=ウ・b=イ・設問2 c=イ・d=ウ',
  '拠点別の同時通話数と音声帯域', '本社・支店間と支店同士の同時通話数、送受話のビット速度を変更します。',
  'p.4〜5。wを往復する支店間の経路、x/y/zとの比較、方向定義、制御通信の除外を維持。', index => {
    const { rate, hx, hy, hz, xy, xz, x, direct, options } = traffic(index);
    return {
      prompt: autumn2008Pm1Pages(index).flat(),
      ...answers(options.map(strings), [
        single('a', '設問1 a', 0, 2), single('b', '設問1 b', 1, 1),
        single('c', '設問2 c', 2, 1), single('d', '設問2 d', 3, 2),
      ]),
      explanation: '支店間の一通話は2方向の音声をもち，どちらの音声も本社リンクwを往復する。支店Xのxは各方向につき一度だけなので，wの各方向はxの2倍となる。xの通話数は' +
        hx + '＋' + xy + '＋' + xz + 'で，ビット速度' + rate + 'kビット／秒を掛けると' + format(x) +
        'kビット／秒。直接通信に変えると本社のwを通るのは本社との通話' + hx + '＋' + hy + '＋' + hz + '本だけなので' +
        format(direct) + 'kビット／秒になる。各支店の送受話は見直し後もそれぞれのアクセスポイントとの間を通るため，各支店リンクのトラフィックは同じである。',
    };
  });
