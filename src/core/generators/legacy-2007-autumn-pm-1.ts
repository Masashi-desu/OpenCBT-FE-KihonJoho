import { p, table } from './definition';
import { answers, define, single } from './legacy-2007-autumn-pm-01-05-shared';

export const binary32ReferenceTitle = '単精度浮動小数点形式の参考表（独立編集）';
export const binary32Reference = () => ({
  title: binary32ReferenceTitle,
  presentation: 'text_figure' as const,
  blocks: [table('ビット番号と各欄の大きさ', ['欄', 'ビット番号', 'ビット数'],
    [['符号部', '31', '1'], ['指数部', '30〜23', '8'], ['仮数部', '22〜0', '23']])],
});

const cases = [
  { decimal: '-0.75', a: 1, e: -1, f: 16, small: [1, 8], large: [3, 8] },
  { decimal: '0.625', a: 0, e: -1, f: 8, small: [0, 16], large: [2, 8] },
  { decimal: '-1.375', a: 1, e: 0, f: 12, small: [-2, 8], large: [1, 16] },
  { decimal: '0.3125', a: 0, e: -2, f: 8, small: [2, 24], large: [4, 0] },
] as const;
const bits = (value: number, digits: number) => value.toString(2).padStart(digits, '0');
const binary32 = (sign: number, exponent: number, fifths: number) =>
  [bits(sign, 1), bits(exponent + 127, 8), bits(fifths, 5) + '…0'].join(' ｜ ');
const pattern = (caption: string, sign: number, exponent: number, fifths: number) =>
  table(caption, ['31', '30〜23', '22〜18 … 0'], [binary32(sign, exponent, fifths).split(' ｜ ')]);

export const autumn2007Pm1 = define(1, '単精度浮動小数点数の表現と加算', 'イウオウ', '単精度表現と加算の条件',
  'IEEE 754単精度を扱う二つの設問。元の3空欄と4択の加算を保つ。',
  '符号、バイアス127、先頭の1の省略を確認する。加算では指数をそろえ、正規化した値を符号・指数・仮数へ戻す。元の図1と独立して編集した欄の範囲だけを解答前に置く。',
  index => {
    const { decimal, a, e, f, small: [smallE, smallF], large: [largeE, largeF] } = cases[index];
    const gap = 2 ** (largeE - smallE);
    const sumF = largeF + (32 + smallF) / gap;
    if (!Number.isInteger(sumF) || sumF >= 32) throw Error('PARAMETER_CONSTRAINT');
    const wrongF = index ? largeF + smallF / gap : 28;
    if (!Number.isInteger(wrongF)) throw Error('PARAMETER_CONSTRAINT');
    const combined = ['0', '1', '01111110', '01111111', '10000000', '11000000'];
    if (index) {
      combined[2] = bits(e + 127, 8);
      combined[3] = bits(e + 128, 8);
      combined[4] = bits(f * 8, 8);
      combined[5] = bits((f + 8) * 8, 8);
      // A fraction byte may look like an exponent. Use distinct alternatives.
      if (new Set(combined).size !== combined.length) throw Error('PARAMETER_CONSTRAINT');
    }
    const patternChoices = [
      pattern('加算結果', 0, smallE, sumF), pattern('加算結果', 0, smallE, wrongF),
      pattern('加算結果', 0, largeE, sumF), pattern('加算結果', 0, largeE, wrongF),
    ];
    const firstBank = combined.map(text => [p(text)]);
    return {
      prompt: [
        p('A×2^Bで表す単精度浮動小数点数では、ビット31が符号部で、非負は0、負は1とする。'),
        p('ビット30〜23の指数部には、指数Bに127を加えた値を2進数で入れる。'),
        p('ビット22〜0の仮数部には、1≦|A|＜2のように正規化し、整数部分の1を省略した2進小数部分を入れる。ビット22が小数第1位である。値が0の場合は各欄を0とする。'),
        p('例えば45.625は2進数で101101.101、正規化すると1.01101101×2^5なので指数部は10000100となる。'),
        table('45.625の例', ['31', '30〜23', '22〜0'], [['0', '10000100', '01101101000000000000000']]),
        p('設問1　同じ方法で10進数の' + decimal + 'を表すと、符号部は（a）、指数部は（b）、仮数部の上位8けた（ビット22〜15）は（c）となる。'),
        p('設問2　次の二つの浮動小数点数を加算した結果を解答群から選べ。'),
        pattern('加える数1', 0, smallE, smallF), pattern('加える数2', 0, largeE, largeF),
      ],
      contexts: [binary32Reference()],
      ...answers([firstBank, patternChoices.map(choice => [choice])], [
        single('a', '設問1 a 符号部', 0, a), single('b', '設問1 b 指数部', 0, 2),
        single('c', '設問1 c 仮数部上位8ビット', 0, 4), single('d', '設問2 加算結果', 1, 2),
      ]),
      explanation:
        decimal + 'の符号は' + a + 'で、絶対値を正規化した指数は' + e + '。127を加えた指数部は' +
        bits(e + 127, 8) + '、整数部の1を除いた仮数部上位8ビットは' + bits(f * 8, 8) + 'になる。' +
        '加算は指数' + largeE + 'にそろえる。小さいほうの仮数を' + gap + 'で割って足すと、整数部の1を除いた仮数は32分の' +
        sumF + 'なので、結果は' + binary32(0, largeE, sumF) + 'となる。',
    };
  });
