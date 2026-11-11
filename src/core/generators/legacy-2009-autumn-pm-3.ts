import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2009-autumn-pm-01-04-shared';
import { differenceWidths, formatted, packets, prefixes, widthWithPrefix } from './legacy-2009-autumn-pm-01-04-models';
import { draw } from './legacy-2009-autumn-pm-01-04-figures';

const relations = [
  '1パケットで送信する測定値の個数が多いほど，単位時間当たりの送信量は多くなる。',
  '1パケットで送信する測定値の個数が多いほど，単位時間当たりの送信量は少なくなる。',
  '1パケットで送信する測定値の個数が変わっても，単位時間当たりの送信量は変わらない。',
];
const powers = ['⁷', '¹⁵', '²³', '³¹'];
const ranges = powers.map(exp => '−2' + exp + '〜2' + exp + '−1');

function packetCase(index: number) {
  const { header, max, rate, frequencies } = packets[index];
  const samples = Math.floor((max - header) / 4);
  const seconds = samples / rate;
  const width = widthWithPrefix.reduce((sum, bits, i) => sum + bits * frequencies[i], 0) / 100;
  const optionsA = [seconds / 2, seconds, seconds * 2, seconds * 4, seconds * 8].map(String);
  const optionsBC = [String(rate), String(header), formatted(header * 8), '4n', '32n', rate + 'n', '1/n', rate + '/n', 'n', 'n/' + rate];
  const optionsD = ['9.0', String(width), String(2225 * frequencies[0] / 10_000), '22.25', '32.0'];
  return { header, max, rate, frequencies, samples, seconds, width, optionsA, optionsBC, optionsD };
}

export function autumn2009Pm3Pages(index: number) {
  const { header, max, rate, frequencies, optionsA, optionsBC, optionsD } = packetCase(index);
  return [[
    p('問3　データ送信とその符号化に関する次の記述を読んで，設問1〜3に答えよ。'),
    p('（1） 機器Aにはセンサが一つ接続されており，接続されたセンサから4バイト（1バイトは8ビット）の符号付整数で表される値（以下，測定値という）を1秒当たり' + rate + '回取得する。'),
    p('（2） 機器Aは，図に示す構造のパケットに測定値を格納し，ネットワークを経由して送信する。一つのパケットには，連続する複数の測定値を格納する。ネットワークはデータの送信に十分な帯域をもつ。'),
    p('（3） パケットは，' + header + 'バイトのヘッダと測定値の列で構成される。ただし，パケットの最大長は' + formatted(max) + 'バイトとする。'),
    p('（4） 一つのパケットに格納する測定値の個数はヘッダに格納され，（3）の条件を満たす範囲で，任意に設定できる。'),
    p('（5） 機器Aは，設定した個数分の測定値をセンサから取得後，遅滞なく送信する。'),
    p('（6） 機器Aは，測定値の取得と送信を同時に行うのに十分な能力をもつ。'),
    draw('packet', index, '図　パケットの構造'),
  ], [
    p('設問1　1パケットに格納する測定値の個数と単位時間当たりの送信量（ヘッダと測定値の総量）の関係の記述として正しい答えを，解答群の中から選べ。'),
    ...bank('解答群', relations),
    p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('一つのパケットには，最大［a］秒分の測定値を格納できる。'),
    p('また，測定値の送信に必要なネットワーク帯域wは次の式で表せる。ただし，1パケットに格納する測定値の個数をnとする。'),
    p('w＝［b］×8×（' + header + '＋［c］） ビット／秒'),
    ...bank('aに関する解答群', optionsA),
    ...bank('b，cに関する解答群', optionsBC),
  ], [
    p('設問3　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('測定値の時刻による変動は小さいことが多く，例えば，全体の' + frequencies[0] +
      '％の測定値は一つ前の測定値との差が，−128〜127（' + ranges[0] + '）の範囲にあることが分かった。'),
    p('そこで，測定値を次の方法で圧縮して送ることにする。'),
    p('① パケットの先頭に格納する測定値は，これまでどおり格納する。'),
    p('② 2番目以降に格納する測定値は，一つ前の測定値との差を，表の“圧縮符号のビット長”で示す長さ（差の値によって異なる）に符号化し，パケットにビット単位で詰めて格納する。例えば，2番目以降に格納する測定値のビット数は，一つ前の測定値との差が10ならば9ビットに，200ならば18ビットになる。'),
    p('なお，圧縮後の測定値の列のビット長は，ヘッダに設定する。'),
    table('表　差の符号化方式と出現確率', ['差の範囲', ...ranges.map((range, i) => range + (i ? '（' + ranges[i - 1] + 'は除く）' : ''))], [
      ['圧縮符号', ...prefixes.map((prefix, i) => prefix + '｜差（' + differenceWidths[i] + 'ビット）')],
      ['圧縮符号のビット長', ...widthWithPrefix.map(String)],
      ['出現確率', ...frequencies.map(frequency => frequency + '％')],
    ]),
    p('一つ前の測定値との差の分布は，表の“出現確率”のとおりであるとすると，2番目以降の測定値の圧縮符号のビット長の期待値は，測定値一つ当たり［d］ビットである。'),
    ...bank('解答群', optionsD),
  ]];
}

export const legacy2009AutumnPm3Definition = define(3, 'データ送信とその符号化', '設問1=イ・設問2 a=イ・b=ク・c=エ・設問3 d=イ',
  'パケット長，ヘッダ長，測定回数，差の分布', 'ヘッダ長、最大パケット長、測定頻度、圧縮符号の出現確率を変更します。',
  'p.14〜16。4バイトの符号付整数、ヘッダ、最大長、測定と送信の同時実行、初回は無圧縮、以降は差分をビット単位で連結、圧縮後ビット長と個数をヘッダに記録する条件を保持。関係・式の構成と数値候補の順を保持。', index => {
    const { header, max, rate, frequencies, samples, seconds, width, optionsA, optionsBC, optionsD } = packetCase(index);
    return {
      prompt: autumn2009Pm3Pages(index).flat(),
      ...answers([strings(relations), strings(optionsA), strings(optionsBC), strings(optionsD)], [
        single('sub1', '設問1', 0, 1), single('a', '設問2 a', 1, 1), single('b', '設問2 b', 2, 7),
        single('c', '設問2 c', 2, 3), single('d', '設問3 d', 3, 1),
      ]),
      explanation: '1秒当たりの測定値の総量は一定である。1パケット当たりの個数nが増えると送るヘッダの回数が' + rate +
        '/nに従って減るので，送信量は少なくなる。最大長からヘッダを引くと' + (max - header) + 'バイトで，4バイトずつ入れると' +
        samples + '個，' + samples + '÷' + rate + '＝' + seconds + '秒分である。1パケットは' + header + '＋4nバイトなので帯域は' +
        rate + '/n×8×（' + header + '＋4n）ビット／秒。2番目以降の期待値は' +
        widthWithPrefix.map((bits, i) => bits + '×' + frequencies[i] + '％').join('＋') + '＝' + width + 'ビットとなる。',
    };
  }, { answerVariation: 'fixed' });
