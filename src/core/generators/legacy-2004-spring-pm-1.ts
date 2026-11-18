import { code, p, strings, table } from './definition';
import { adderCases, draw, exampleFigure, inputExamples, positionsFigure, statesFigure } from './legacy-2004-spring-pm-01-05-figures';
import { answers, asCode, bankBlocks, define, single } from './legacy-2004-spring-pm-01-05-shared';

function carryRoute(x: string, y: string): string {
  const states = ['q₀'];
  let carry = 0;
  for (let i = x.length - 1; i >= 0; i--) {
    carry = (Number(x[i]) + Number(y[i]) + carry) >> 1;
    states.push(carry ? 'q₁' : 'q₀');
  }
  return states.join(' → ');
}

const sequences = [
  'q₀ → q₁ → q₀ → q₀ → q₀', 'q₀ → q₁ → q₀ → q₁ → q₀', 'q₀ → q₁ → q₁ → q₀ → q₀',
  'q₀ → q₁ → q₁ → q₁ → q₀', 'q₀ → q₁ → q₁ → q₁ → q₁',
];
const instructions = ['sw = 0', 'sw = 1', 'sw = s[i]', 'sw ← 0', 'sw ← 1', 'sw ← s[i]',
  'sw ← x[i] and y[i]', 'sw ← x[i] or y[i]'];
const bank = [strings(sequences), asCode(instructions)];
export const spring2004Pm1Pages = (index: number) => {
  const { x, y, width } = adderCases[index];
  const [c, a, b] = inputExamples[index];
  const value = c + a + b;
  return [
    [
      p('次の問1から問5までの5問については，全問解答してください。'),
      p('問1　2進数の加算に関する次の記述を読んで，設問1，2に答えよ。'),
      p('2けた以上の2進数を1けたずつ加算するとき，下位けたからの繰り上がりを考慮すると，1けたの2進数三つを加算する処理（以下，全加算処理という）が必要になる。表は，全加算処理における入力と出力の組合せを示す。'),
      p('例えば，表中の（c，x，y，c′，s）＝（' + [c, a, b, value >> 1, value % 2].join('，') + '）の組合せは，次の計算を表す。'),
      draw(exampleFigure, '繰り上がりを含む加算例', index),
      table('全加算処理の入出力の組合せ', ['c（入力）', 'x（入力）', 'y（入力）', 'c′（出力）', 's（出力）'],
        Array.from({ length: 8 }, (_, radix) => {
          const bits = [radix >> 2, (radix >> 1) & 1, radix & 1], sum = bits.reduce((left, right) => left + right);
          return [...bits, sum >> 1, sum % 2].map(String);
        })),
      p('設問1　2けた以上の2進数に対して，下位けたから1けたずつ全加算処理を行う様子を状態遷移図で示すと，図1のように書くことができる。図1では，入力xとy，出力sの関係を，“/”を使って“xy/s”と表している。また，図1中のq₀及びq₁は，それぞれ，加算処理によって繰り上がりの起こらなかった状態と，繰り上がりの起こった状態を表している。初期状態はq₀である。'),
      p('例えば，“01＋01”の計算を図1を使って考えると，次のようになる。'),
      p('（1）1けた目の加算“1＋1”を行うとき，下位けたからの繰り上がりがないので，cは0であり，状態はq₀である。この状態において，入力x，yは1，1なので，関係“11/0”が適合し，出力sは0となる。また，このときc′は1と'),
    ],
    [
      p('なり，状態はq₀からq₁へ移る。'),
      p('（2）q₁の状態で，2けた目の加算“0＋0”を行う。このときの入力x，yは0，0であり，cは1なので，関係“00/1”が適合し，出力sは1となる。また，このときc′は0となり，状態はq₁からq₀へ移る。'),
      p('図1の状態遷移図を使って，“' + x + '＋' + y + '”の計算を行ったとき，状態はq₀とq₁をどのように遷移するか。正しい答えを，解答群の中から選べ。'),
      draw(statesFigure, '図1　全加算処理の状態遷移図', index),
      ...bankBlocks('解答群', bank[0]),
      p('設問2　次のプログラムの説明を読んで，プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      p('〔プログラムの説明〕'),
      p('図1で示した状態遷移図を基に，' + width + 'ビットの加算処理を行うプログラムである。ここで，図2に示すように，' +
        width + 'ビットの2進数を格納するための' + width + '個の要素をもつ論理型の配列（添字は0から始まる）x，y，sを用いる。プログラム中の論理型の変数及び配列では，1をtrue，0をfalseとして扱う。また，プログラム中のxorは，排他的論理和演算を表している。'),
      p('プログラムの実行後には，xとyの加算結果の下位' + width + 'ビット分がsに格納される。'),
    ],
    [
      draw(positionsFigure, '図2　配列x，y，sの説明', index),
      p('〔プログラム〕'),
      code('○ 論理型：x[' + width + ']，y[' + width + ']，s[' + width + ']，sw\n' +
        '○ 整数型：i\n' +
        '・sw ← 0\n' +
        '■ i：0，i ＜ ' + width + '，1\n' +
        '│   ▲ [a]\n' +
        '│   │  ・s[i] ← x[i] xor y[i]\n' +
        '│   │  ・[b]\n' +
        '│   ├────────\n' +
        '│   │  ・s[i] ← not( x[i] xor y[i] )\n' +
        '│   │  ・[c]\n' +
        '│   ▼\n' +
        '■'),
      ...bankBlocks('解答群', bank[1]),
    ],
  ];
};

export const spring2004Pm1 = define(1, '2進数の全加算処理と繰り上がり', 'エアキク', '加える2進数と論理型配列の長さ',
  '2進加算の例、状態をたどる入力、論理型配列の長さを同期して変える。',
  '二進数を最下位から処理する順、出力を記した遷移図、繰上げ有無の分岐、排他的論理和の空欄と配列の添字を保持する。', index => {
    const { x, y, width } = adderCases[index];
    const route = carryRoute(x, y);
    return {
      prompt: spring2004Pm1Pages(index).flat(),
      ...answers(bank, [single('s', '設問1', 0, sequences.indexOf(route)),
        single('a', '設問2 a', 1, 0), single('b', '設問2 b', 1, 6), single('c', '設問2 c', 1, 7)]),
      explanation: x + 'と' + y + 'の右端から，その桁の2ビットに下位からの繰上げを加える。状態は' + route +
        'となる。繰上げがないかをsw = 0で調べる。swが0の分岐では入力が両方1の場合だけ次へ繰り上がるのでand，swが1の分岐では片方以上が1なら繰り上がるのでorを用いる。加算結果は常に下位' + width + 'ビットを保存する。',
    };
  });
