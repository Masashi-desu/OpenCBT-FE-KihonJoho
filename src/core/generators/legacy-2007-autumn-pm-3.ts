import { p, strings, table } from './definition';
import { answers, bank, define, format, single } from './legacy-2007-autumn-pm-01-05-shared';
import { draw } from './legacy-2007-autumn-pm-01-05-figures';
import { lineCases } from './legacy-2007-autumn-pm-3-model';

const yearChoices = ['1', '2', '3', '4', '5'];
function inputs(index: number) {
  const line = lineCases[index];
  const stoppedY = line.repairY * line.failuresY;
  const stoppedX = stoppedY * line.multiplier;
  const failuresX = stoppedX / line.repairX;
  const meanX = (line.period - stoppedX) / failuresX;
  const start = line.stableY - line.yearZ + 1;
  const overlap = line.yearX - 2 - line.yearY - (start - 1);
  const meanChoices = [stoppedX, meanX, index === 0 ? 516 : (line.period - stoppedX - stoppedY) / failuresX,
    Math.floor(line.period / failuresX), Math.floor((line.period - 1.5 * stoppedY) / line.failuresY)].map(format);
  const repairChoices = [Math.floor((line.repairY / line.failuresY) * 10) / 10, stoppedY,
    index === 0 ? 1558 : Math.floor((line.period - stoppedY) / line.repairY),
    Math.floor(line.period / line.failuresY), line.period - stoppedY].map(format);
  return { line, stoppedY, stoppedX, failuresX, meanX, start, overlap, meanChoices, repairChoices };
}
export function autumn2007Pm3Pages(index: number, print = true) {
  const { line: { yearX, yearY, yearZ, stableY, period, repairX, repairY, repairZ, multiplier, failuresY }, meanChoices, repairChoices } = inputs(index);
  const pages = [
    [p('通信回線に関する次の記述を読んで，設問に答えよ。'),
      p('A社は，本社と工場を結ぶ，X，Y，Zの3系統の独立した通信回線をもっている。'),
      p('〔回線 X，Y，Z の説明〕'),
      p('（1）X，Y，Zは，それぞれ運用開始年は異なるが，3系統とも運用開始年の1月の始業とともに運用が開始されている。3系統とも，昨年1年間の運用時間は' + format(period) + '時間であった。'),
      p('（2）Xは，導入した年から数えて（導入した年を1年目として）' + (yearX - 1) + '年経過し，' + yearX +
        '年目に入った回線であり，今年の12月いっぱいで運用をやめることになっている。一昨年（' + (yearX - 2) + '年目の1年間）と昨年（' +
        (yearX - 1) + '年目の1年間）の故障頻度は，安定的に推移していたそれまでの数年間より増える傾向にあった。Xの昨年のMTTR（平均修復時間）は' +
        repairX + '時間であり，故障時間の合計はYの' + multiplier + '倍であった。'),
      p('（3）Yは，導入後' + yearY + '年目の回線であり，' + (yearY - stableY) + '年前（' + stableY +
        '年目）から故障頻度は安定している。Yの昨年（' + (yearY - 1) + '年目の1年間）のMTTRは' + repairY + '時間であり，故障回数は' + failuresY + '回であった。'),
      p('（4）Zは，導入後' + yearZ + '年目の最も新しい回線であり，Zの昨年（' + (yearZ - 1) + '年目の1年間）のMTTRは' +
        repairZ + '時間であり，故障頻度はYより高い値であった。'),
      p('〔バスタブ曲線の説明〕'),
      p('ハードウェアの故障頻度は，横軸に導入からの経過時間，縦軸に故障頻度をとると，図のようなバスタブを縦に切った断面のような形状の曲線に従うことが知られており，この曲線をバスタブ曲線と呼んでいる。'),
      p('バスタブ曲線では，運用開始直後から時間の経過とともに故障頻度が減少する期間を初期故障期間，老朽化によって故障頻度が増加する期間を摩耗故障期間，この二つの期間の間で，偶発故障が主になり故障頻度が安定する期間を偶発故障期間と呼ぶ。'),
      p('X，Y，Zの3系統の回線の故障頻度は，同じバスタブ曲線に従うとする。')],
    [draw('bathtub', 0, '図　バスタブ曲線'),
      p('設問　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。解答は，重複して選んでもよい。'),
      p('バスタブ曲線の特徴から，YとZの故障頻度が両方ともに安定する時期は，今年から数えて［a］年目から，［b］年間であるといえる。'),
      p('表中の昨年のXのMTBF（平均故障間隔）は，［c］時間であり，Yの故障時間の合計は，［d］時間である。'),
      p('MTBF，MTTRは，それぞれ次式で求められる。'),
      p('MTBF＝稼働時間の合計／故障回数'),
      p('MTTR＝故障時間の合計／故障回数'),
      table('表　昨年の回線X，Y，Zの運用状況', ['回線', '運用時間', 'MTTR（平均修復時間）', '故障回数', '故障時間の合計', 'MTBF（平均故障間隔）'],
        [['X', format(period), String(repairX), '網掛け', '網掛け', '［c］'],
          ['Y', format(period), String(repairY), String(failuresY), '［d］', '網掛け'],
          ['Z', format(period), String(repairZ), '網掛け', '網掛け', '網掛け']]),
      p('注　網掛けの部分は，表示していない。')],
  ];
  if (print) pages[1].push(...bank('a，bに関する解答群', yearChoices), ...bank('cに関する解答群', meanChoices), ...bank('dに関する解答群', repairChoices));
  return pages;
}
export const autumn2007Pm3 = define(3, '通信回線のバスタブ曲線と平均故障間隔', 'a=ウ／b=ウ／c=イ／d=イ',
  '導入年・故障頻度の時期・運用時間・故障回数と平均修復時間',
  '同じバスタブ曲線から安定期間を特定し，故障回数と稼働時間を求める。',
  '1月開始、導入年を1年目、前年/一昨年の摩耗傾向、両者に共通する安定期間、MTTRとMTBFの分母、表の未表示欄、重複して選べる共有バンクを保持。回線の運用・年度条件と解説を同時に更新。誤答は故障時間の採用、稼働時間からの二重控除、運用時間をそのまま使う場合など。正答は整数となる条件に限定。', index => {
    const { line, stoppedY, stoppedX, failuresX, meanX, start, overlap, meanChoices, repairChoices } = inputs(index);
    return { prompt: autumn2007Pm3Pages(index, false).flat(),
      ...answers([strings(yearChoices), strings(meanChoices), strings(repairChoices)], [single('a', 'a', 0, start - 1),
        single('b', 'b', 0, overlap - 1), single('c', 'c', 1, 1), single('d', 'd', 2, 1)]),
      explanation: 'Yから偶発故障期間の始まりは導入' + line.stableY + '年目、Xから摩耗故障期間の始まりは導入' +
        (line.yearX - 2) + '年目。Zが偶発故障期間に入るのは今年から' + start + '年目で，その後Yが摩耗故障期間に入るまで' +
        overlap + '年間，両方が安定する。Yの故障時間は' + line.repairY + '×' + line.failuresY + '＝' + stoppedY +
        '時間。Xはその' + line.multiplier + '倍の' + stoppedX + '時間，故障回数は' + stoppedX + '÷' + line.repairX +
        '＝' + failuresX + '回である。XのMTBFは（' + format(line.period) + '−' + stoppedX + '）÷' + failuresX + '＝' + format(meanX) + '時間。',
    };
  });
