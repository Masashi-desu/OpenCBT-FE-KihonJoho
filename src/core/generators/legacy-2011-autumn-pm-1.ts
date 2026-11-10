import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2011-autumn-pm-01-04-shared';
import { draw } from './legacy-2011-autumn-pm-01-04-figures';
import { adcModel, binaryWord } from './legacy-2011-autumn-pm-01-04-models';

const sampleChoices = ['011', '100', '101', '110', '111'];
const fourBitChoices = ['1010', '1011', '1100', '1101', '1110'];
const integer = (n: number) => n.toLocaleString('en-US');

export function autumn2011Pm1Pages(index: number, clarify = false) {
  const { fsrV, analog, cd, fsrMv, periodMs, durationS, bitLimit, f } = adcModel(index);
  return [[
    p('問1　A/D変換に関する次の記述を読んで，設問1〜3に答えよ。'),
    p('A/D変換とは，アナログ信号をディジタル信号に変換することであり，標本化，量子化，符号化の3段階で処理する。直流の電圧を例にnビットのA/D変換を説明する。'),
    p('（1）標本化'),
    p('標本化では，時間的に連続したアナログ信号である電圧を一定の時間間隔で測定する。図1では，時間軸をt0，t1，…と等間隔dで区切り，各時刻での電圧をv(t0)，v(t1)，…と表す。'),
    draw('wave', [index, 0], '図1　標本化の例'),
  ], [
    p('（2）量子化'),
    p('量子化では，（1）で標本化して得られた電圧v(t0)，v(t1)，…を刻み幅qの整数倍の値で近似する。'),
    p('量子化を行う場合，まず測定する電圧の最大幅FSRを決める。次に，nビットで量子化するために，FSRを(2ⁿ−1)等分して刻み幅qを求める。このとき，刻み幅qはq＝FSR／(2ⁿ−1)となる。'),
    p('量子化において，近似値として用いられる電圧の値を，小さい方から順にv0＝0，v1＝q，…，vmax＝(2ⁿ−1)qとしたとき，時刻tmにおいて標本化で測定されたアナログ信号の電圧v(tm)について，次の条件を満たすようなN（Nは0以上の整数）を見つけ，電圧N×qを電圧v(tm)の測定値とする。これをnビット量子化という。'),
    p('N×q−q／2≦v(tm)＜N×q＋q／2'),
    p('すなわち，図2右のように電圧軸を刻み幅qでv0，v1，…，vmaxの電圧に分割しておき，v(t0)，v(t1)，…のそれぞれについて，v0〜vmaxのうちで最も近い電圧を測定値とする。例えば，v(t3)の測定値はv2となる。'),
    draw('wave', [index, 1], '図2　量子化の例'),
    p('注記　“○”はv(tm)をqの整数倍で近似した値'),
    p('（3）符号化'),
    p('符号化では，（2）の量子化で用いた電圧v0，v1，…，vmaxに2進符号を対応付ける。この符号によって，各測定値を表す。'),
  ], [
    p('設問1　図2左の電圧v(t0)，v(t1)，…，v(t10)だけの符号化を考える。図2右の電圧v0，v1，…，v7を2進符号000，001，…，111に順に対応付けた場合を表1に示す。'),
    table('表1　電圧と符号の対応', ['電圧(v)', '符号'], [['v0','000'], ['v1','001'], ['v2','010'], ['⋮','⋮'], ['v7','111']]),
    p('図2左のv(t0)，v(t1)，…，v(t10)の各測定値を，表1に基づいて符号化すると表2のようになる。表2中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    draw('adcCodes', [index], '表2　各時刻における測定値の符号化'),
    p('注記　網掛けの部分は表示していない。'),
    ...bank('解答群', sampleChoices),
    p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('アナログ信号の電圧の範囲が0〜' + fsrV + 'Vであるとき，FSRを' + fsrV +
      'Vとし，4ビットで量子化した場合，qは［c］Vである。アナログ信号の電圧' + analog +
      'Vの測定値は［d］Vとなり，表1の場合と同様に2進符号0000，0001，…，1111に順に対応付けて符号化すると［e］となる。'),
    ...bank('c，dに関する解答群', cd),
  ], [
    ...bank('eに関する解答群', fourBitChoices),
    p('設問3　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('FSRが' + integer(fsrMv) + 'ミリVであるアナログ信号の電圧を，' + periodMs + 'ミリ秒間隔で' + durationS +
      '秒間標本化した。このとき，A/D変換後の総データ量を' + integer(bitLimit) +
      'ビット以内に納めることができる刻み幅qの最小値は［f］ミリVである。' +
      (clarify ? 'ここで，測定は開始時刻t0と終了時刻の両方を含む。' : '')),
    ...bank('解答群', f),
  ]];
}

export const legacy2011AutumnPm1Definition = define(1, 'A/D変換の標本化・量子化・符号化', '1a=エ・1b=ウ・2c=イ・2d=キ・2e=ウ・3f=オ',
  '標本点の電圧・量子化の最大幅・標本間隔・総ビット上限',
  '波形の標本値と，量子化の電圧範囲やデータ量の条件を変えます。測定は開始・終了の両時刻を含みます。',
  'p.5〜8。図1/2のt0〜t10とd、連続波形・交差印・○印・電圧尺度qとvmaxの軸の省略、2表、4解答群と6欄。' +
    'q＝FSR/(2ⁿ−1)、下限≦/上限＜、4ビットと3ビットの違いを保持。設問3の開始・終了両時刻を含む条件は公式解答を再現する読み方として派生本文で明示。', index => {
    const data = adcModel(index);
    const a = binaryWord(data.levels[6], 3), b = binaryWord(data.levels[10], 3);
    const c = data.step, d = data.step * data.number, e = binaryWord(data.number, 4), f = data.minStep;
    return {
      prompt: autumn2011Pm1Pages(index, true).flat(),
      ...answers([strings(sampleChoices), strings([...data.cd]), strings(fourBitChoices), strings([...data.f])], [
        single('1a', '設問1 a', 0, sampleChoices.indexOf(a)), single('1b', '設問1 b', 0, sampleChoices.indexOf(b)),
        single('2c', '設問2 c', 1, data.cd.findIndex(value => Number(value) === c)),
        single('2d', '設問2 d', 1, data.cd.findIndex(value => Math.abs(Number(value) - d) < 1e-10)),
        single('2e', '設問2 e', 2, fourBitChoices.indexOf(e)),
        single('3f', '設問3 f', 3, data.f.findIndex(value => Number(value) === f)),
      ]),
      explanation: 'A/D（Analog-to-Digital）はアナログ値をディジタルの符号へ変換する。図2ではt6の○はv' + data.levels[6] +
        '、t10の○はv' + data.levels[10] + 'にあり、表1の並びでそれぞれ' + a + 'と' + b +
        'になる。4ビットでは16個の電圧水準の間が15区間なので、刻み幅は' + data.fsrV + '÷15＝' + c +
        'V。入力' + data.analog + 'Vは、' + data.number + '番目の水準の下端以上かつ上端未満であり、測定値は' +
        Number(d.toFixed(2)) + 'V、符号は' + e + '。FSR（Full-Scale Range）は測定する電圧の最大幅である。' +
        data.durationS + '秒は' + data.durationS * 1000 + 'ミリ秒で、' + data.periodMs + 'ミリ秒ごとに開始・終了も測ると' +
        data.sampleCount + '標本になる。' + integer(data.bitLimit) + 'ビット以内では1標本当たり最大' + data.bits +
        'ビットを使える。ビット数が多いほど刻みが細かくなるので、最小は' + integer(data.fsrMv) + '÷(2^' + data.bits + '−1)＝' + f.toFixed(1) + 'ミリVである。',
    };
  });
