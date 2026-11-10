import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2012-spring-pm-01-04-shared';
import { draw } from './legacy-2012-spring-pm-01-04-figures';
import { binaryFraction, floatingData, floatWord, power } from './legacy-2012-spring-pm-01-04-models';

const cChoices = (index: number) => Array.from({ length: 7 }, (_, i) => [
  draw('float', [index, 5 + i], 'cに関する解答群　' + 'アイウエオカキ'[i]),
]);

export function spring2012Pm1Pages(index: number) {
  const { a, exponent, difference, product, numberOptions, aligned, exponentChoices, products } = floatingData(index);
  return [
    [
      p('問1　浮動小数点数に関する次の記述を読んで，設問1，2に答えよ。'),
      p('（1）α×2ᵝの形で表記される浮動小数点数を，図1に示す32ビット単精度浮動小数点形式（以下，単精度表現という）で表現する。ここで，αとβは次の条件を満たすものとする。'),
      p('α＝0，又は 1≦|α|＜2'),
      p('−126≦β≦127'),
      draw('float', [index, 0], '図1　32ビット単精度浮動小数点形式'),
      p('① 符号部（ビット番号31）　αの値が正のとき0，負のとき1が入る。'),
      p('② 指数部（ビット番号30〜23）　βの値に127を加えた値が2進数で入る。'),
      p('③ 仮数部（ビット番号22〜0）　|α|の整数部分1を省略し，残りの小数部分が，ビット番号22に小数第1位が来るような2進数で入る。'),
      p('ただし，αの値が0の場合，符号部，指数部，仮数部ともに0とする。'),
      p('（2）例えば，10進数の0.75を2進数で表すと，(0.11)₂となる。これは(1.1)₂×2⁻¹と表記でき，単精度表現では，図2のとおり，符号部は(0)₂，指数部は−1に127を加えて(01111110)₂となり，仮数部は(1.1)₂の小数部分が入るので，(100⋯0)₂となる。ここで，00⋯0は0が連続していることを表す。'),
    ],
    [
      draw('float', [index, 1], '図2　0.75の単精度表現'),
      p('設問1　次の単精度表現が表す数値として正しい答えを，解答群の中から選べ。'),
      draw('float', [index, 2], '設問1の単精度表現'),
      ...bank('解答群', numberOptions),
      p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      p('二つの浮動小数点数AとBの減算と乗算を行う。'),
      draw('float', [index, 3], 'Aの単精度表現'),
      draw('float', [index, 4], 'Bの単精度表現'),
      p('（1）減算A−Bを，次の手順①〜③で行う。'),
      p('① 指数部の値を大きい方に合わせる。Aが(' + binaryFraction(a) + ')₂×2' + power(exponent) + 'であることから，Bを(［a］)₂×2' + power(exponent) + 'とする。'),
      p('② 減算を行う。'),
      p('((' + binaryFraction(a) + ')₂−(［a］)₂)×2' + power(exponent) + '＝(' + binaryFraction(difference.fraction) + ')₂×2^［b］'),
      p('③ ②の結果を単精度表現する。その結果は［c］となる。'),
      p('（2）乗算A×Bの結果は(［d］)₂×2' + power(product.exponent) + 'となる。'),
    ],
    [
      ...bank('aに関する解答群', aligned),
      ...bank('bに関する解答群', exponentChoices),
      p('cに関する解答群'),
      ...cChoices(index).flat(),
      ...bank('dに関する解答群', products),
    ],
  ];
}

export const legacy2012SpringPm1Definition = define(1, '単精度浮動小数点数', '設問1=オ、設問2 a=ウ・b=イ・c=イ・d=エ',
  '仮数部と指数部の二進数・演算するAとB', '単精度表現のビット列と，減算・乗算する二つの値を変えます。',
  'p.5〜7。符号，指数バイアス127，正規化，ゼロの特例，2進の例とビット番号，5解答欄を保持する。指数の比較，桁をそろえた減算と再正規化，乗算の順。仮数部の比較は小数第2〜5位までの有限2進小数で，原問に見合う負担とする。',
  index => {
    const data = floatingData(index);
    const aligned = binaryFraction(data.b * 2 ** (data.bExponent - data.exponent));
    const selectedWord = floatWord(data.difference.exponent, data.difference.fraction);
    const product = binaryFraction(data.product.fraction);
    const selectedNumber = data.numerator + '×2' + power(data.displayExponent - 3);
    return {
      prompt: spring2012Pm1Pages(index).flat(),
      ...answers([strings(data.numberOptions), strings([...data.aligned]), strings(data.exponentChoices.map(String)), cChoices(index),
        strings([...data.products])], [
        single('1', '設問1', 0, data.numberOptions.indexOf(selectedNumber)),
        single('a', '設問2 a', 1, data.aligned.findIndex(value => value === aligned)),
        single('b', '設問2 b', 2, data.exponentChoices.indexOf(data.difference.exponent)),
        single('c', '設問2 c', 3, data.bitWords.slice(4).indexOf(selectedWord)),
        single('d', '設問2 d', 4, data.products.findIndex(value => value === product)),
      ]),
      explanation: '設問1では格納指数から127を引くと' + data.displayExponent + '，先頭の1を復元した仮数は' + data.numerator +
        '／8なので' + selectedNumber + 'となる。設問2ではBをAの指数' + data.exponent + 'に合わせると仮数は(' + aligned +
        ')₂。A−Bを正規化すると(' + binaryFraction(data.difference.fraction) + ')₂×2' + power(data.difference.exponent) +
        'であり，格納指数は' + (data.difference.exponent + 127) + 'となる。A×Bは仮数同士を掛け，指数を足して正規化すると(' +
        product + ')₂×2' + power(data.product.exponent) + 'となる。',
    };
  });
