import { p, table } from './definition';
import { calculations2009AutumnAm0126 } from './legacy-2009-autumn-am-01-26-calculations';
import { autumn2009AmDiagram, bitLabel, stripeDimensions } from './legacy-2009-autumn-am-01-26-figures';
import { knowledge2009AutumnAm0126 } from './legacy-2009-autumn-am-01-26-knowledge';
import { body, define, source, textBody } from './legacy-2009-autumn-am-01-26-shared';

const disk = define(12, 'ディスク台数と格納段数', stripeDimensions.length,
  '制御装置、ビット順、列ごとの格納の役割を維持する。格納先の台数と段数を変え、鏡像化などへ別の問いを置換しない。', index => {
    const [disks, rows] = stripeDimensions[index];
    const last = bitLabel(disks * rows - 1);
    const prompt = source[12].prompt.replace('b₁₅', last);
    return textBody([p(prompt), autumn2009AmDiagram('striping', index, 'データの格納順とディスクの接続')],
      source[12].choices, 0, '連続したデータを細かく分け，順に' + disks +
      '台のディスクへ分散させている。異なる部分を複数台で並行に読み書きできる。全データを各台に複製するミラーリングとは異なる。');
  }, true);

const gate = define(24, '出力が指定値になる入力条件', 4,
  '二入力一出力の図と原問の四回路を維持する。出力の判定条件を変える。', index => {
    const cases = [
      ['ともに1のときだけ，出力Xが0', 1, 'NANDはANDの出力を反転する。両入力が1の組合せでは0を出力し，それ以外の三つの組合せでは1を出力する。'],
      ['ともに1のときだけ，出力Xが1', 0, 'ANDはAとBがともに1の場合だけ1を出力する。少なくとも一方の入力が0なら，出力は0である。'],
      ['ともに0のときだけ，出力Xが0', 2, 'ORは少なくとも一方の入力が1なら1を出力し，どちらも0の場合だけ0になる。'],
      ['異なるときだけ，出力Xが1', 3, 'XORはAとBが異なる組合せ（0，1）と（1，0）でだけ1を出力する。二つの入力が同じ組合せでは0を出力する。'],
    ] as const;
    const [condition, answer, explanation] = cases[index];
    return textBody([p('二つの入力と一つの出力をもつ論理回路で，二つの入力A，Bが' + condition + 'になるものはどれか。'),
      autumn2009AmDiagram('gate', 0, '入力A，Bと出力Xをもつ論理回路')], source[24].choices, answer, explanation);
  });

const adder = define(25, '全加算器の入力ビット', 8,
  '全加算器の図、三入力、けた上げ数と和の二列の表を維持する。全入力組合せを使い、選択肢の順番を保つ。', index => {
    const encoded = [5, 0, 1, 2, 3, 4, 6, 7][index];
    const [x, y, z] = [2, 1, 0].map(shift => (encoded >> shift) & 1);
    const total = x + y + z;
    const carry = Math.floor(total / 2), sum = total % 2;
    const choices = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([c, s]) =>
      [table('けた上げ数cと和s', ['c', 's'], [[String(c), String(s)]])]);
    return body([p('図は全加算器を表す論理回路である。図中のxに' + x + '，yに' + y + '，zに' + z +
      'を入力したとき，出力となるc（けた上げ数），s（和）の値はどれか。'), autumn2009AmDiagram('adder', 0, '全加算器')],
      choices, 2 * carry + sum, '三つの入力を足すと' + x + '＋' + y + '＋' + z + '＝' + total +
      'である。2で割った商' + carry + 'がけた上げ数c，余り' + sum + 'が下位桁の和sになる。');
  });

export const legacy2009AutumnAm01To26Definitions = [
  ...calculations2009AutumnAm0126, ...knowledge2009AutumnAm0126, disk, gate, adder,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
