import { code, p, table } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2013-spring-pm-09-13-support';
import { selectionInstruction } from './legacy-2016-autumn-pm-09-13-support';

export const cableCases = [
  { plan: 1, count: 6, basic: [3000, 5000], low: [1500, 1000, 700, 500], high: [1000, 800, 600, 400], internet: [2500, 3000, 5000, 6000] },
  { plan: 2, count: 7, basic: [3200, 4800], low: [1400, 1050, 750, 500], high: [950, 750, 550, 400], internet: [2400, 3200, 5200, 6200] },
  { plan: 1, count: 11, basic: [3500, 5200], low: [1550, 1100, 800, 500], high: [1000, 850, 650, 450], internet: [2700, 3500, 5400, 6500] },
  { plan: 2, count: 5, basic: [3000, 4400], low: [1400, 1000, 750, 550], high: [1000, 800, 600, 400], internet: [2500, 3200, 5100, 6100] },
] as const;
const firstChannel = [1, 3, 6, 10];
const countOptions = [0, 1, 2, 3, 4, 5, 6, 10];
const kana = 'アイウエオカキク';
const yen = (value: number) => value.toLocaleString('ja-JP') + '円';
const programLineNumbers = (lines: string[], first: number) =>
  lines.map((line, index) => String(first + index).padStart(2, ' ') + '  ' + line).join('\n');
const cableComparisonOptions = [
  'どちらのプランでも有線テレビ視聴料金は等しい',
  'プラン1での有線テレビ視聴料金の方が高い',
  'プラン2での有線テレビ視聴料金の方が高い',
];
export function television(caseIndex: number, plan: 1 | 2) {
  const { basic, count, low, high } = cableCases[caseIndex];
  const prices = plan === 1 ? low : high;
  let remainder = count;
  let fee: number = basic[plan - 1];
  const trace = [];
  for (let index = firstChannel.length - 1; index >= 0; index--) {
    const channels = Math.max(0, remainder - firstChannel[index] + 1);
    remainder -= channels;
    fee += channels * prices[index];
    trace.push(channels);
  }
  return { fee, trace };
}

export const q9 = createLanguageDefinition(9, 'ケーブルテレビとインターネット接続の月額利用料金', '料金表・契約条件', 'abcdef', 'イエエウアウ',
  '契約ごとの料金表とチャンネル数をコードへ反映し，降順の区分別集計を独立した昇順のチャンネル別計算で検算する。', index => {
    const data = cableCases[index];
    const { plan, count, basic, low, high, internet } = data;
    const { fee, trace } = television(index, plan);
    const fee1 = television(index, 1).fee;
    const fee2 = television(index, 2).fee;
    const result = fee1 === fee2 ? 0 : fee1 > fee2 ? 1 : 2;
    const prices = plan === 1 ? low : high;
    const lastTier = trace.findIndex(value => value > 0);
    const otherPlanFee = plan === 1 ? fee2 : fee1;
    const choices = index === 0 ? [6600, 7200, 8000, 9700] : [
      fee, fee - trace[lastTier] * prices[3 - lastTier],
      basic[plan - 1] + count * prices[3 - lastTier],
      fee === otherPlanFee ? basic[plan - 1] + count * prices[0] : otherPlanFee,
    ].sort((a, b) => a - b);
    const first = programLineNumbers([
      '#define BLKNUM 4',
      '/* 基本視聴料金，0は契約なしの場合 */',
      'const int basic_charge[] = {0, ' + basic.join(', ') + '},',
      '          channel_block[BLKNUM] = {1, 3, 6, 10},',
      '          channel_charge[2][BLKNUM] = {{' + low.join(', ') + '},',
      '                                      {' + high.join(', ') + '}};',
      '/* インターネット接続サービス利用料金，',
      '   0は契約なしの場合 */',
      'const int inet_charge[] = {0, ' + internet.join(', ') + '};',
      'int calc_service_fee(int, int, int);',
      'int calc_service_fee(int basic_plan, int channel_num,',
      '                     int inet_plan) {',
      '    int tv_fee, inet_fee;',
      '    int cnum, i;',
    ], 1);
    const second = programLineNumbers([
      '    /* 有線テレビ視聴料金 tv_fee を求める */',
      '    tv_fee = basic_charge[basic_plan];',
      '    if (basic_plan > 0) {',
      '        for (i = BLKNUM - 1; i >= 0; i--) {',
      '            cnum = channel_num - channel_block[i] + 1;',
      '            if (cnum < 0) {',
      '                cnum = 0;',
      '            }',
      '            channel_num -= cnum;',
      '            tv_fee += cnum * channel_charge[basic_plan - 1][i];',
      '        }',
      '    }',
      '    /* インターネット接続サービス利用料金 inet_fee を求める */',
      '    if (inet_plan == [e1]) {',
      '        inet_fee = inet_charge[0];',
      '    } else if (inet_plan == [e2]) {',
      '        if (basic_plan != 0) {',
      '            inet_fee = inet_charge[1];',
      '        } else {',
      '            inet_fee = inet_charge[2];',
      '        }',
      '    } else {',
      '        if (basic_plan [f]) {',
      '            inet_fee = inet_charge[3];',
      '        } else {',
      '            inet_fee = inet_charge[4];',
      '        }',
      '    }',
      '    return tv_fee + inet_fee;',
      '}',
    ], 15);
    return {
      pages: [
        page(44, [
          p(selectionInstruction),
          p('問9　次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\nケーブルテレビ局を運営するU社では，有線テレビ視聴サービスとインターネット接続サービスを提供している。'),
          p('（1）有線テレビ視聴サービスでは，有線テレビ基本視聴契約（以下，基本視聴契約という）を結ぶと視聴できる基本放送チャンネル，及び基本視聴契約に加えて有料放送視聴契約を結ぶと視聴できる有料放送チャンネルを提供している。'),
          p('（2）基本視聴契約にはプラン1，プラン2の2種類があり，プラン2を選ぶと毎月の基本視聴料金はプラン1よりも高くなるが，有料放送視聴料金は割安になる。毎月の基本視聴料金は，表1のとおりである。'),
          table('表1 基本視聴料金表（月額）', ['基本視聴契約', '基本視聴料金'], [['プラン1', yen(basic[0])], ['プラン2', yen(basic[1])]]),
          p('（3）毎月の有料放送視聴料金は，基本視聴契約のプランと視聴契約する有料放送のチャンネル数によって決まる。'),
          p('（4）基本視聴料金と有料放送視聴料金の合計を，有線テレビ視聴料金という。'),
          p('（5）インターネット接続サービスは，インターネット接続契約を結ぶと利用できる。インターネット接続サービスでは，低速回線と高速回線の2種類を提供している。毎月のインターネット接続サービス利用料金は，基本視聴契約の有無，プランの種類によって変わってくる。毎月のインターネット接続サービス利用料金は，表2のとおりである。'),
        ]),
        page(45, [
          table('表2 インターネット接続サービス利用料金表（月額）', ['基本視聴契約＼インターネット接続契約', '低速回線', '高速回線'],
            [['なし', yen(internet[1]), yen(internet[3])], ['プラン1', yen(internet[0]), yen(internet[3])], ['プラン2', yen(internet[0]), yen(internet[2])]]),
          p('（6）毎月の利用料金は，有線テレビ視聴料金とインターネット接続サービス利用料金の合計である。'),
          p('（7）関数 calc_service_fee は，毎月の利用料金を求めるプログラムである。引数及び返却値は，次のとおりである。引数に誤りはないものとする。\n引数 basic_plan 基本視聴契約（0：なし，1：プラン1，2：プラン2）\nchannel_num 視聴契約する有料放送のチャンネル数\ninet_plan インターネット接続契約（0：なし，1：低速回線，2：高速回線）\n返却値 毎月の利用料金'),
          p('〔プログラム〕（行番号）'),
          code(first, 'c'),
        ]),
        page(46, [
          code(second, 'c'),
          p('設問1　有線テレビ視聴料金に関する次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('（1）calc_service_fee(' + plan + ', ' + count + ', 0)を実行した場合，行番号23が2回目に実行されるときの変数cnumの値は［a］となり，3回目に実行されるときの変数cnumの値は［b］となる。また，行番号43が実行されるときの変数tv_feeの値は［c］となる。'),
          p('（2）基本視聴契約がプラン1で有料放送' + count + 'チャンネル分の視聴契約をする場合の有線テレビ視聴料金と，基本視聴契約がプラン2で有料放送' + count + 'チャンネル分の視聴契約をする場合の有線テレビ視聴料金を比較した場合，［d］。'),
        ]),
        page(47, [
          p('設問2　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。ただし，e1とe2に入れる答えは，eに関する解答群の中から組合せとして正しいものを選ぶものとする。'),
        ], [
          bank(1, 'ab', countOptions.map(String), kana[countOptions.indexOf(trace[1])] + kana[countOptions.indexOf(trace[2])]),
          bank(1, 'c', choices.map(String), kana[choices.indexOf(fee)]),
          bank(1, 'd', cableComparisonOptions, kana[result]),
          bank(2, 'e', ['e1：0，e2：1', 'e1：0，e2：2', 'e1：1，e2：0', 'e1：1，e2：2', 'e1：2，e2：0', 'e1：2，e2：1'], 'ア'),
          bank(2, 'f', ['== 0', '== 1', '== 2', '!= 0', '!= 1', '!= 2'], 'ウ', 'c'),
        ], [-1, -1, -1, 0, 0]),
      ],
      explanation: '設問1では10，6，3，1チャンネル目を起点に，多い側の区分から未処理のチャンネルを切り出す。行23の各回のcnumは順に' + trace.join('，') + 'で，プラン' + plan + 'の基本料と各区分の料金を足すと' + yen(fee) + 'になる。プラン1の合計は' + yen(fee1) + '，プラン2は' + yen(fee2) + '。設問2では接続なしの0を最初に処理し，次に低速の1を分ける。残る高速ではプラン2のときだけinet_charge[3]を用いる。',
    };
  });
