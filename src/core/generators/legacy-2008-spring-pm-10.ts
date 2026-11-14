import { code, p, table } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2008-spring-pm-10-13-support';

const examples = [
  { base: 10, sample: '0.2{142857}', entries: ['32', '5.237', '0.875', '1.{3}'] },
  { base: 8, sample: '0.1{25}', entries: ['17', '5.236', '0.64', '3.{2}'] },
  { base: 6, sample: '0.4{13}', entries: ['21', '3.521', '0.43', '2.{4}'] },
  { base: 9, sample: '0.3{18}', entries: ['28', '4.176', '0.63', '3.{2}'] },
];

const mark = (char: string) => '［' + char + '］';
export const q10Figure = languageFigure(10, 'fraction-digits', '図 循環小数の小数表記', index => {
  const { base, sample } = examples[index];
  const [, prefix, cycle] = /\.(\d+)\{(\d+)\}/.exec(sample)!;
  return { kind: 'fraction', n: prefix.length, k: cycle.length, digits: 'X＝0.' + prefix + cycle.repeat(2) + '…',
    alt: `${base}進数の小数。小数点の後の${prefix}は循環節を除く小数部，${cycle}が循環節で，同じ${cycle}を繰り返す。` };
});

function greatestCommonDivisor(a: number, b: number) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function fraction(text: string, base: number) {
  const [, whole, prefix = '', cycle = ''] = /^(\d+)(?:\.(\d*)(?:\{(\d+)\})?)?$/.exec(text)!;
  const scale = base ** prefix.length;
  const fixed = Number.parseInt(whole + prefix, base);
  const repeatPower = base ** cycle.length;
  const numerator = cycle ? fixed * (repeatPower - 1) + Number.parseInt(cycle, base) : fixed;
  const denominator = cycle ? scale * (repeatPower - 1) : scale;
  const divisor = greatestCommonDivisor(numerator, denominator);
  return { numerator, denominator, formatted: `${numerator / divisor}/${denominator / divisor}` };
}

function program(base: number) {
  return String.raw`#include <stdio.h>
#include <ctype.h>

void tofraction(char *);
long power${base}(int);
long gcd(long, long);

void tofraction(char *str){
    long numerator = 0;     /* 分子 */
    long denominator;       /* 分母 */
    int flag = 0;
    int n = 0;              /* 循環節を除く小数部のけた数 */
    int k = 0;              /* 循環節のけた数 */
    long measure;           /* 分子と分母の最大公約数 */

    while(${mark('a')}){
        if(isdigit(*str)){  /* ${base}進数字か？ */
            numerator ${mark('b')};
            numerator += *str - '0';
            if (flag == 1) n++;
            if (flag == 2) k++;
        }else if(*str == '.'){
            flag = 1;
        }else if(*str == '{'){
            flag = 2;
        }
        ${mark('c')};
    }

    if(flag ${mark('d')}) {        /* 有限小数又は整数の場合 */
        denominator = power${base}(n);
    }else{                  /* 循環小数の場合 */
        denominator = ${mark('e')};
        numerator  -= ${mark('f')};
    }
    measure = gcd(numerator, denominator);
    numerator /= measure;
    denominator /= measure;
    printf("= %ld/%ld\n", numerator, denominator);
}`;
}

export const q10 = createLanguageDefinition(10, 'C：整数・有限小数・循環小数から既約分数へ変換', '位取りの基数と循環節', 'abcdef',
  'aア bア cウ dウ eエ fエ',
  '整数・有限小数・循環小数を文字列で入力し既約分数に変換する原形式を保持。10/8/6/9進ごとに有効数字の範囲、入力例、循環節、基数の累乗、各候補の演算を連動。数字9個以下。Cの全候補を独立した有理数計算との比較に用いる。',
  index => {
    const { base, sample, entries } = examples[index];
    const selected = fraction(sample, base);
    const [, prefix, cycle] = /\.(\d+)\{(\d+)\}/.exec(sample)!;
    const digits = '0.' + prefix + cycle.repeat(2) + '…';
    const upper = base ** (prefix.length + cycle.length);
    const lower = base ** prefix.length;
    const upperDigits = prefix + cycle + '.' + cycle.repeat(2) + '…';
    const lowerDigits = prefix + '.' + cycle.repeat(2) + '…';
    const power = 'power' + base;
    return {
      pages: [
        page(35, [
          p('問10 次のCプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),
          p(`（1）正の${index === 0 ? '' : base + '進'}有限小数又は循環小数を，10進整数の既約分数（分子と分母に共通の約数が1以外にない分数）に変換するプログラムである。`),
          p(`（2）有限小数とは，小数点以下のけた数が有限である小数をいう。一方，循環小数とは，小数部の特定の位置以降，同じ数字列が無限に繰り返される小数をいう。例えば，${selected.formatted}は${index === 0 ? '' : base + '進数で'}${digits}と表記され，${cycle}が繰り返されるので循環小数である。このような繰り返しの部分を循環節と呼ぶ。`),
          p(`（3）プログラムでは，循環節を除く小数部のけた数がn，循環節のけた数がkの場合，その小数を${base}^(n+k)倍したものから${base}^n倍したものを引くと，整数となることを用いて既約分数への変換を行う。${selected.formatted}の小数表記を図に示す。`),
          q10Figure.block(index),
          p(`この場合，n＝${prefix.length}，k＝${cycle.length}なので，${base}^(n+k)Xから${base}^nXを引く。下記の式の係数は10進，右辺の値は${base}進で示す。`),
          code(`${upper}X ＝ ${upperDigits}\n−\n${lower}X ＝ ${lowerDigits}\n─────────────────\n${upper - lower}X ＝ ${selected.numerator.toString(base)}`, 'text'),
          p(`したがって${index === 0 ? '，' : '，10進数の分数で'}X＝${selected.numerator}/${selected.denominator}となる。分子と分母の最大公約数で約分すると，X＝${selected.formatted}を得る。`),
        ]),
        page(36, [
          p(`（4）プログラムへの入力では，循環節を“{”と“}”で囲んで表す。例えば，${digits}は${sample}と入力する。`),
          p('（5）プログラムへは，整数（小数点を含まない）を入力することもできる。'),
          p('（6）プログラムの実行例を表に示す。'),
          table('表 プログラムの実行例', ['入力', '出力'], [...entries, sample].map(text => [text, '= ' + fraction(text, base).formatted])),
          p('（7）プログラム中で定義されている関数の仕様は，次のとおりである。'),
          code('void tofraction(char *str);', 'c'),
          p(`引数：整数，有限小数，循環小数のいずれかを表現した文字列str。\n機能：strを既約分数に変換して表示する。strに含まれる数字は9個以下とする。また，誤った文字列が与えられることはない。${index === 0 ? '' : ' 数字は0〜' + (base - 1) + 'を使用する。'}`),
          p('（8）次の関数があらかじめ定義されているものとする。'),
          code('① long gcd(long a, long b);', 'text'),
          p('引数：自然数a，b。\n返却値：aとbの最大公約数。'),
          code(`② long ${power}(int num);`, 'text'),
          p(`引数：0〜9の整数num。\n返却値：${base}のnum乗。`),
          p('（9）次のライブラリ関数を用いる。'),
          code('int isdigit(int c);', 'c'),
          p(`返却値：文字cが10進数字であれば0以外，そうでなければ0。${index === 0 ? '' : ' 入力には' + base + '進数で許された文字だけが現れる。'}`),
        ]),
        page(37, [p('〔プログラム〕'), code(program(base), 'c')]),
        page(38, [p('設問 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', [String.raw`*str != '\0'`, "*str != '0'", String.raw`str != '\0'`, "str != '0'"], 'ア', 'c'),
          bank(1, 'b', ['*=', '+=', '/=', '-=', '%='].map(op => op + ' ' + base), 'ア', 'c'),
          bank(1, 'c', ['(*str)++', '(*str)--', 'str++', 'str--'], 'ウ', 'c'),
          bank(1, 'd', ['!= 0', '!= 1', '!= 2', '== 0', '== 1', '== 2'], 'ウ', 'c'),
          bank(1, 'e', [`${power}(k)`, `${power}(n) * ${power}(k)`, `(${power}(n) - 1) * ${power}(k)`, `${power}(n) * (${power}(k) - 1)`], 'エ', 'c'),
          bank(1, 'f', [`denominator / ${power}(n)`, `denominator / ${power}(k)`, `numerator / ${power}(n)`, `numerator / ${power}(k)`], 'エ', 'c'),
        ]),
      ],
      explanation: `a：終端のヌル文字まで1文字ずつ読む。b：既に読んだ数字を${base}倍してから，末尾に次の数字を加える。c：ポインタを1文字進める。d：flagが2になるのは循環節を読み始めたときだけで，整数と有限小数では2未満のままである。e：循環部分が差で消えるので，分母は${base}^(n+k)−${base}^n＝${base}^n×(${base}^k−1)。f：全ての数字を連結したnumeratorを${base}^kで整数除算すると，循環節のkけたを取り除ける。例の${sample}は${selected.numerator}/${selected.denominator}を約分して${selected.formatted}となる。`,
    };
  }, { answerVariation: 'fixed' });
