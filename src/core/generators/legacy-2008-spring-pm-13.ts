import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2008-spring-pm-10-13-support';
import { spring2008PmPageAssetId, spring2008PmReference } from './legacy-2008-spring-pm-materials';

const references = [55, 56, 57, 58, 59, 60];
const examples = [
  { base: 10, shift: 1, max: 100, inputs: [85, 7, 100, 63, 40] },
  { base: 6, shift: 1, max: 100, inputs: [68, 0, 37, 52, 35] },
  { base: 4, shift: 1, max: 63, inputs: [27, 6, 63, 33, 22] },
  { base: 8, shift: 2, max: 100, inputs: [82, 5, 8, 73, 100] },
];
const exampleOutput = (sequence: readonly number[], base: number) => [
  Math.max(...sequence), Math.min(...sequence), Math.floor(sequence.reduce((sum, value) => sum + value, 0) / sequence.length),
].map(value => value.toString(base).padStart(3));
const records = (index: number) => {
  const { base, inputs } = examples[index];
  return { inputs: inputs.map(value => value.toString(base)), outputs: exampleOutput(inputs, base) };
};
const input = languageFigure(13, 'input-file', '図1 入力ファイルの例', index => {
  const { inputs } = records(index);
  return { kind: 'records', inputs, outputs: [],
    alt: inputs.map((value, i) => `レコード${i + 1}：${[...value].join('，')}`).join('\n') };
});
const output = languageFigure(13, 'sample-output', '図2 出力の例', index => {
  const { outputs } = records(index);
  return { kind: 'records', inputs: [], outputs,
    alt: ['最大値', '最小値', '平均値'].map((label, i) =>
      label + '：' + [...outputs[i]].map(cell => cell === ' ' ? '空白' : cell).join('，')).join('\n') + '。全行とも右詰め。' };
});
export const q13Figures = [input, output];

const main = `MAIN    START
        CALL  INPUT
        ST    GR0,MAX
        ST    GR0,MIN
        LD    GR2,GR0      ; 合計値を初期化
        LD    GR1,=1       ; カウンタを初期化
LOOP1   CALL  INPUT
        LD    GR0,GR0      ; 入力値
        JMI   FIN1         ; ファイルの終わり
        ADDA  GR2,GR0
        ADDA  GR1,=1
        CPA   GR0,MAX
        JPL   HIGH
        CPA   GR0,MIN
        JMI   LOW
        JUMP  LOOP1
HIGH    ST    GR0,MAX
        JUMP  LOOP1
LOW     ST    GR0,MIN
        JUMP  LOOP1
FIN1    CALL  DIVIDE
        LD    GR1,MAX
        CALL  PRINT        ; 最大値を出力
        LD    GR1,MIN
        CALL  PRINT        ; 最小値を出力
        ［a］
        CALL  PRINT        ; 平均値を出力
        RET
MAX     DS    1
MIN     DS    1
        END`;
const divide = `DIVIDE  START
        LD    GR3,=0       ; 商 ← 0
LOOP3   CPA   GR2,GR1
        ［d］
        ADDA  GR3,=1
        SUBA  GR2,GR1
        JUMP  LOOP3
FIN3    RET
        END`;
function inputProgram(base: number, shift: number) {
  return `INPUT   START
        RPUSH
        IN    IBUF,ILEN    ; レコードを入力
        LD    GR0,ILEN
        JMI   FIN2         ; ファイルの終わり
        LD    GR1,=0       ; けた数のカウンタ
        LD    GR4,=0       ; 数値の初期化
LOOP2   LD    GR3,IBUF,GR1
        AND   GR3,=#000F   ; 数字を数値に変換
        LD    GR5,GR4
        ［b］              ; ⎫
        SLL   GR4,${shift}        ; ⎬ GR4の内容を${base}倍する。
        ADDA  GR4,GR5      ; ⎭
        ADDA  GR4,GR3
        ADDA  GR1,=1
        CPA   GR1,GR0
        ［c］
        LD    GR0,GR4
FIN2    RPOP
        RET
ILEN    DS    1
IBUF    DS    256
        END`;
}
function printProgram(base: number) {
  return `PRINT   START
        RPUSH
        LD    GR4,=3       ; 出力けた数
        LD    GR2,GR1      ; 被除数 ← 数値
        LD    GR1,=${base}      ; 除数 ← ${base}
LOOP4   CALL  DIVIDE       ; 数値 / ${base}
        OR    GR2,=#0030   ; 剰余を数字に変換
        SUBA  GR4,=1
        ST    GR2,OBUF,GR4
        LD    GR2,GR3      ; 被除数 ← 商
        ［e］              ; 商 = 0？
        LD    GR2,=#0020   ; GR2 ← 空白文字
LOOP5   SUBA  GR4,=1       ; ⎫
        ［f］              ; ⎪
        ST    GR2,OBUF,GR4 ; ⎬ 残りのけた位置に空白文字を入れる。
        JUMP  LOOP5       ; ⎭
FIN4    OUT   OBUF,OLEN
        RPOP
        RET
OLEN    DC    3
OBUF    DS    3
        END`;
}

export const q13 = createLanguageDefinition(13, 'CASL II：数字列から最大・最小・平均を集計して出力', '入出力の基数とシフト量・入力ファイル', 'abcdef',
  'aウ bウ cイ dア eエ fア',
  '数字列入力、最大値・最小値・切捨て平均の3出力、4プログラムと6欄を保持。入出力の基数10/6/4/8と既存シフト量・入力レコードを変え、出力型と答えを連動する。数字0〜9と空白の符号値は元プログラム中の固定値で処理でき、冊子p.57下部のJIS符号表を参照しない。',
  index => {
    const sample = examples[index];
    const { base, shift, max, inputs } = sample;
    const digitLimit = index === 0 ? '' : ` 使用する数字は0〜${base - 1}とする。`;
    const [maximum, minimum, mean] = exampleOutput(inputs, base);
    const readShift = Math.log2(base - 2 ** shift);
    return {
      pages: [
        page(50, [
          p('問13 次のアセンブラプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),
          p(`（1）プログラムMAINは，入力ファイル中の1〜3けたの数字列からなるレコードを入力し，入力した数字列を${base}進数値とみなしたときの最大値，最小値及び平均値を${base}進数の数字列で出力する。入力ファイルの例を図1に，このときの出力の例を図2に示す。${digitLimit}`),
          input.block(index), output.block(index),
          p(`① 0≦入力レコードの数値≦${max}とする。${index === 0 ? '' : ' この範囲の上限は10進表記である。'}\n② 1≦レコード数≦100とする。\n③ 平均値は小数点以下を切り捨てる。`),
          p('（2）プログラムMAINは，三つの副プログラムINPUT，DIVIDE及びPRINTを使用する。'),
          p('（3）副プログラムINPUTは，入力ファイルからレコードを入力する。\n① 入力したレコードの数字列を2進数に変換し，GR0に設定して，主プログラムに戻る。\n② ファイルの終わりを検出した場合は，GR0に−1を設定して，主プログラムに戻る。\n③ 副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('（4）副プログラムDIVIDEは，除算を行う。\n① 被除数はGR2に，除数はGR1に設定されて，主プログラムから渡される。GR1＞0，GR2≧0とする。\n② 商をGR3に，剰余をGR2に設定して，主プログラムに戻る。\n③ 副プログラムは，GR2，GR3以外の汎用レジスタの内容は変更しない。'),
        ]),
        page(51, [
          p(`（5）副プログラムPRINTは，2進数nを3けたの${base}進数の数字列に変換して出力する。\n① nはGR1に設定されて，主プログラムから渡される。\n② 出力する数字列は右詰めにし，全体で3文字になるように左端から空白文字を補う。\n③ 副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。`),
          p('〔プログラム1〕'), code(main, 'casl2'),
        ]),
        page(52, [p('〔プログラム2〕'), code(inputProgram(base, shift), 'casl2'), p('〔プログラム3〕'), code(divide, 'casl2')]),
        page(53, [p('〔プログラム4〕'), code(printProgram(base), 'casl2'), p('設問 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['LD    GR1,GR0', 'LD    GR1,GR2', 'LD    GR1,GR3', 'LD    GR2,GR0', 'LD    GR2,GR1', 'LD    GR2,GR3'], 'ウ', 'casl2'),
          bank(1, 'b', ['SLL   GR5,1', 'SLL   GR5,2', 'SLL   GR5,3', 'SRL   GR5,1', 'SRL   GR5,2', 'SRL   GR5,3'], 'アイウ'[readShift - 1], 'casl2'),
          bank(1, 'c', ['JMI   FIN2', 'JMI   LOOP2', 'JPL   FIN2', 'JPL   LOOP2', 'JZE   FIN2', 'JZE   LOOP2'], 'イ', 'casl2'),
        ]),
        page(54, [], [
          bank(1, 'd', ['JMI   FIN3', 'JNZ   FIN3', 'JPL   FIN3', 'JZE   FIN3'], 'ア', 'casl2'),
          bank(1, 'ef', ['JMI   FIN4', 'JMI   LOOP4', 'JNZ   FIN4', 'JNZ   LOOP4', 'JPL   FIN4', 'JZE   LOOP4'], 'エア', 'casl2'),
        ]),
      ],
      contexts: [spring2008PmReference('アセンブラ言語の仕様（文字の符号表を除く）', references)],
      explanation: `a：DIVIDEが返す平均の商はGR3なので，PRINTの引数GR1へ移す。b：読取り済みの値をGR4の左${shift}ビットの${2 ** shift}倍とGR5の左${readShift}ビットの${2 ** readShift}倍の和によって${base}倍にする。続いて現在の数字を加える。c：桁カウンタGR1が入力桁数GR0より小さい間だけ次の桁へ進む。d：被除数GR2が除数GR1を下回れば，それ以上引けないので商と余りを返す。e：右端に一桁書いた後，商が0でなければ次の桁を求める。f：左側を補う空白を書き込むときは，位置GR4が負になったら出力へ進む。例の最大・最小・平均の出力は順に「${maximum}」「${minimum}」「${mean}」で，平均では小数点以下を切り捨てる。`,
    };
  }, { fixedReferenceAssetIds: references.map(spring2008PmPageAssetId) });
