import { code, p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2012-spring-pm-01-04-shared';
import { draw } from './legacy-2012-spring-pm-01-04-figures';
import { optimizationDescriptions, optimizationNames, optimizerData, originalProgram, signedDisplay } from './legacy-2012-spring-pm-01-04-models';

const precisionChoices = ['桁あふれ', '桁落ち', '情報落ち', '丸め誤差'];
const foldingChoices = optimizationNames.slice(1);
const blank = '次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。';

export function spring2012Pm2Pages(index: number) {
  const { argument, threshold, operands, without, withOptimization, result } = optimizerData(index);
  const [y0, y1, m, n] = operands.map(signedDisplay);
  const results = (items: number[]) => 'x[0]＝' + signedDisplay(items[0]) + '，x[1]＝' + signedDisplay(items[1]);
  return [
    [
      p('問2　コンパイラの最適化に関する次の記述を読んで，設問1〜3に答えよ。'),
      p('コンパイラとは，プログラム言語で記述された原始プログラムを翻訳して目的プログラムを生成するためのソフトウェアである。コンパイラの機能の一つに最適化がある。最適化では，原始プログラムを翻訳する過程で，プログラムの実行時間を短くするために原始プログラムの構造を変換する。最適化の方法の例を表1に示す。'),
      table('表1　最適化の方法の例', ['最適化の方法', '内容'], optimizationNames.map((name, i) => [name, optimizationDescriptions[i]])),
      p('擬似言語の形式で記述したプログラムの一部（以下，プログラム1という）に対して，表1の最適化の方法を複数組み合わせて最適化した例を，表2に示す。'),
      p('〔プログラム1〕'),
      code(originalProgram),
    ],
    [
      draw('optimize', [0], '表2　プログラム1の最適化の例'),
      p('設問1　' + blank),
      p('表2において，最適化の方法を①，②，③の順で適用するとき，②で適用される最適化の方法は［a］であり，③で適用される最適化の方法は［b］である。'),
      ...bank('a，bに関する解答群', optimizationNames),
    ],
    [
      p('設問2　' + blank),
      p('関数のインライン展開の例を図1に示す。図1の関数funcをインライン展開した場合，実引数' + argument +
        'の値が仮引数pに代入され，その値' + argument + 'が関数func内の変数pの値になる（図1①）。次に，［c］の方法を適用することによって，条件式p≧' +
        threshold + 'の判定結果やpを含んだ計算式の計算結果がコンパイル時に確定する（図1②）。その結果，func(' + argument + ')を値' +
        result + 'に置き換えることができる（図1③）。'),
      p('なお，#wはコンパイラが最適化をしたときに生成した整数型の変数である。'),
      draw('inline', [index], '図1　関数のインライン展開の例'),
      ...bank('cに関する解答群', foldingChoices),
    ],
    [
      p('設問3　次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。'),
      p('最適化をしないときと最適化をしたときとで浮動小数点数の演算の結果が異なる場合がある。プログラム1に対して表2の最適化をしなかったものと，最適化をしたものとに，y[0]＝' +
        y0 + '，y[1]＝' + y1 + '，m＝' + m + '，n＝' + n + 'を与えて実行した。その結果のx[0]，x[1]が次のとおりになった。ここで，同一優先順位の算術演算子は，左から順に演算する。'),
      p('最適化をしないとき：　' + results(without)),
      p('最適化をしたとき：　　' + results(withOptimization)),
      p('この実行結果が異なる原因としては，［d］の方法の適用によって演算順序が変化したことで，［e］が発生したからである。ここで，浮動小数点数の演算は単精度（仮数部は23ビット）で計算しているものとする。'),
      ...bank('dに関する解答群', optimizationNames),
      ...bank('eに関する解答群', precisionChoices),
    ],
  ];
}

export const legacy2012SpringPm2Definition = define(2, 'コンパイラの最適化', '設問1 a=カ・b=キ、設問2 c=イ、設問3 d=イ・e=ウ',
  'インライン展開する引数・条件式と単精度の四つの入力値', 'インライン展開の引数と分岐条件，単精度で比較する演算の値を変えます。',
  'p.8〜11。表1の七手法，表2の三段階とループ制御，インライン展開の三変換と#wの注記，左からの演算と仮数部23ビットを保持。整数の加算と比較の大小，単精度の大きな絶対値に足す小さな項を変える。分岐と計算結果は変わるが，②のループ外移動，③のループ展開，定数式の畳込み，共通部分式の削除，小さい項の情報落ちという五つの判定対象は原問の変換段階と出題意図に合わせて固定する。',
  index => {
    const { argument, threshold, result, operands, without, withOptimization } = optimizerData(index);
    return {
      prompt: spring2012Pm2Pages(index).flat(),
      ...answers([strings(optimizationNames), strings(foldingChoices), strings(optimizationNames), strings(precisionChoices)], [
        single('a', '設問1 a', 0, 5), single('b', '設問1 b', 0, 6), single('c', '設問2 c', 1, 1),
        single('d', '設問3 d', 2, 1), single('e', '設問3 e', 3, 2),
      ]),
      explanation: '②ではm＋nの計算をループ外に出し，③では添字0と1の二回分を個別に展開する。インライン展開後は条件' +
        argument + '≧' + threshold + 'と二つの定数同士の和をコンパイル時に計算できるので，定数の畳込みが適用され，結果は' + result +
        'となる。共通部分式の削除では（y[i]＋m）＋nがy[i]＋（m＋n）に変わる。絶対値の大きなmと先に足すと，小さいn（' +
        signedDisplay(operands[3]) + '）は単精度では保持できず情報落ちになる。x[0]は' + signedDisplay(without[0]) + 'から' +
        signedDisplay(withOptimization[0]) + '，x[1]は' + signedDisplay(without[1]) + 'から' + signedDisplay(withOptimization[1]) + 'に変わる。',
    };
  }, { answerVariation: 'fixed' });
