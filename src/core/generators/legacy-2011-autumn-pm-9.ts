import { code, p } from './definition';
import { heading, selectionInstruction } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, page } from './legacy-2011-autumn-pm-09-13-support';

export const rationalCases = [
  { trace: [3, 8], exact: [1, 8], cyclic: [3, 22], limited: [19, 131] },
  { trace: [1, 2], exact: [7, 16], cyclic: [7, 30], limited: [23, 149] },
  { trace: [1, 4], exact: [11, 40], cyclic: [7, 11], limited: [17, 179] },
  { trace: [7, 16], exact: [3, 20], cyclic: [5, 12], limited: [39, 193] },
];
const program1 = String.raw`#include <stdio.h>
void printRational(int, int);
void printRational(int x, int y) {
    putchar('0');
    putchar('.');
    while (x > 0) {
        putchar('0' + (x * 10 / y));
        x = x * 10 % y;
    }
    putchar('\n');
}`;
const numbered = (program: string) => program.split('\n').map((line, index) => String(index + 1).padStart(2) + '  ' + line + (index < 2 ? '\n' : '')).join('\n');
const program2 = String.raw`#include <stdio.h>

#define DIGITMAX 100  /* 出力する小数点以下の最大桁数 */

void recurringDecimal(int, int);

void recurringDecimal(int x, int y) {
    int xHistory[DIGITMAX];
    int i, ri = 0, startRepeat = -1;

    /* 出力様式の決定 */
    while ((x > 0) && (ri < DIGITMAX) && (［d］)) {
        xHistory[ri] = x;
        ri++;
        x = x * 10 % y;
        for (i = 0; ［e］; i++) {
            if (xHistory[i] == x) {
                startRepeat = i;
            }
        }
    }
    /* 小数点数の出力 */
    putchar('0');
    putchar('.');
    for (i = 0; i < ri; i++) {
        if (［f］) {
            putchar('[');
        }
        putchar(［g］);
    }
    if (startRepeat >= 0) {
        putchar(']');
    } else {
        if ((ri >= DIGITMAX) && (x > 0)) {
            putchar('.');
            putchar('.');
            putchar('.');
        }
    }
    putchar('\n');
}`;
const aOptions = [
  '乗算が除算よりも先に実行されるが，正しい値が出力される',
  '乗算が除算よりも先に実行され，正しい値が出力されない',
  '除算が乗算よりも先に実行されるが，正しい値が出力される',
  '除算が乗算よりも先に実行され，正しい値が出力されない',
];
const numeric = Array.from({ length: 10 }, (_, digit) => String(digit));
const controls = ['i == 0', 'i < DIGITMAX', 'i < ri', 'i >= 0', 'ri < DIGITMAX', 'ri > 0', 'startRepeat == -1', 'startRepeat >= 0', 'startRepeat > i'];
const opens = ['i == startRepeat', 'i == startRepeat + 1', 'i == startRepeat - i', 'i < startRepeat', 'startRepeat < 0', 'startRepeat >= 0'];
const numerators = ['x', 'xHistory[i]', 'xHistory[ri]', 'xHistory[startRepeat]'];
const digitExpressions = [...numerators.map(value => value + ' * 10 / y'), ...numerators.map(value => "'0' + " + value + ' * 10 / y')];

function decimal([x, y]: number[]) {
    const history = new Map<number, number>();
    let digits = '';
    while (x && digits.length < 100 && !history.has(x)) {
        history.set(x, digits.length);
        digits += Math.floor(x * 10 / y);
        x = x * 10 % y;
    }
    const repeat = history.get(x);
    return repeat === undefined
      ? '0.' + digits + (x ? '...' : '')
      : '0.' + digits.slice(0, repeat) + '[' + digits.slice(repeat) + ']';
}
const call = (name: string, pair: number[]) => name + '(' + pair.join(', ') + ')';
const kana = 'アイウエオカキクケコ';

export const q9 = createLanguageDefinition(9, 'Cの有限小数・循環小数の出力', 'decimalCase', 'abcdefg', 'エキオキウアカ',
  '演算式，有限小数のループ追跡，余りの履歴を用いる循環小数の処理を保持し，分子・分母と三種類の出力例を変える。',
  index => {
    const { trace, exact, cyclic, limited } = rationalCases[index];
    const second = trace[0] * 10 % trace[1];
    const checks = decimal(trace).length - 1;
    const example = (pair: number[]) => call('recurringDecimal', pair);
    const long = decimal(limited);
    return {
      pages: [
        page(39, [p(selectionInstruction), heading('問9　次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          heading('〔プログラム1の説明〕'), p('二つの整数 x，y（0＜x＜y）を受け取り，x／y の値を10進小数として出力するプログラムである。'),
          p('（1）関数 printRational の引数は，次のとおりである。ここで，引数の値に誤りはないものとする。\nx：分子を表す正の整数\ny：分母を表す正の整数\nただし，x／y は有限小数（小数点以下の桁数が有限桁である小数）であり，循環小数（小数部のある桁以降で，同じ数字の列が無限に繰り返される小数）ではないものとする。'),
          p('（2）次の手順で x／y を10進小数として出力する。\n① “0.”を出力する。\n② x が0になるまで，次の③，④を繰り返す。\n③ x を10倍した値を y で割った商を出力する。\n④ x を10倍した値を y で割った余りを新たに x とする。'),
          heading('〔プログラム1〕（行番号）'), code(numbered(program1), 'c')]),
        page(40, [p('設問1　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p("（1）プログラム1の行番号7では小数点以下の各桁の数字を出力している。この行を“putchar('0' + (x / y * 10));”に変えると［a］。"),
          p('（2）' + call('printRational', trace) + ' を実行した場合，行番号6の条件判定が2回目に行われるときの x の値は［b］であり，プログラムが終了するまでに，行番号6の条件判定は［c］回行われる。'),
          p('設問2　次の説明を読み，プログラム2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('x／y が循環小数となる x と y を引数に指定して関数 printRational を実行した場合，ある桁以降で同じ数字の列を無限に繰り返し出力し続け，プログラムは終了しない。この繰り返し出力される同じ数字の列を循環節と呼ぶ。最初に現れる循環節を“[”と“]”で囲んで出力するプログラムを作成した。'),
          heading('〔プログラム2の説明〕'), p('（1）関数 recurringDecimal の引数は，次のとおりである。ここで，引数の値に誤りはないものとする。\nx：分子を表す正の整数')],
          [bank(1, 'a', aOptions, 'エ'), bank(1, 'bc', numeric, kana[second] + kana[checks])], [2, 2]),
        page(41, [p('y：分母を表す正の整数\n（2）x／y の値によって次のように場合分けを行い，それぞれ別の様式の小数点数を出力する。'),
          p('① 小数点以下100桁までに割り切れる場合\n小数点数をそのまま出力する。例えば，' + example(exact) + ' を実行した場合，次のように出力する。'), code(decimal(exact), 'text'),
          p('② 小数点以下100桁までの間に循環節がある場合\n最初の循環節の直前までの小数点数を出力し，その後に循環節の数字の列を“[”と“]”で囲んで出力する。例えば，' + example(cyclic) + ' を実行した場合，次のように出力する。'), code(decimal(cyclic), 'text'),
          p('③ その他の場合\n小数点以下100桁までの小数点数を出力し，その後に“...”を続けて出力する。例えば，' + example(limited) + ' を実行した場合，次のように出力する。'), code(long.slice(0, 56) + '\n' + long.slice(56), 'text'),
          p('（3）関数 recurringDecimal は，x／y の値によって出力様式を決める部分と小数点数を出力する部分の二つに分かれている。\n（4）x／y の値によって出力様式を決める手順は，次のとおりである。\n① 大きさ100の配列 xHistory と変数 ri を用意する。\n② ri を0とする。\n③ xHistory[ri] に x を格納し，ri を1増やす。\n④ x を10倍した値を y で割った余りを新たに x とする。\n⑤ x が0になった場合，出力様式は（2）の①とする。\n⑥ x と同じ値をもつ xHistory[i]（0≦i＜ri）があるかどうかを調べる。\n⑦ 同じ値をもつものがある場合，出力様式は（2）の②とする。このとき，x／y の値の小数点以下第 i＋1 位から第 ri 位までの数字の列が最初の循環節となる。')]),
        page(42, [p('⑧ 同じ値をもつものがない場合，ri が100以上であれば出力様式は（2）の③とする。そうでなければ，③に戻る。'), heading('〔プログラム2〕'), code(program2, 'c')]),
        page(43, [], [bank(2, 'de', controls, 'キウ', 'c'), bank(2, 'f', opens, 'ア', 'c'), bank(2, 'g', digitExpressions, 'カ', 'c')]),
      ],
      explanation: 'Cの整数の乗除算は同じ優先順位で左から評価する。x＜y なので x / y * 10 の最初の除算は0になり，正しい値は出ない。初回の更新後の x は ' + second + '。小数部を ' + (checks - 1) + ' 桁出力し，終了時の偽も数えるので条件判定は ' + checks + ' 回である。循環位置が未確定の間だけ処理し，履歴の有効範囲 i＜ri を探す。同じ余りが最初に記録された添字の直前に「[」を出し，その添字の余り xHistory[i] から桁を求め，文字コード ' + "'0'" + ' を足して出力する。'
    };
  });
