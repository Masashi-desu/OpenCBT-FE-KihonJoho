import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2012-autumn-pm-09-13-support';
import { autumn2012PmPageAssetId, autumn2012PmReference } from './legacy-2012-autumn-pm-materials';

const program1 = [
  ' 1  POLY    START',
  ' 2          RPUSH',
  ' 3          LD      GR4,=0        ; 計算結果格納レジスタの初期化',
  ' 4  LP1     LD      GR3,GR1',
  ' 5          [a]',
  ' 6          LD      GR0,=1        ; xⁿ の計算開始',
  ' 7  LP2     LD      GR3,GR3',
  ' 8          JZE     BRK           ; xⁿ の計算終了なら BRK へ',
  ' 9          CALL    MULT          ; (GR0) ← (GR0)×(GR2)',
  '10          LAD     GR3,-1,GR3',
  '11          JUMP    LP2',
  '12  BRK     ADDL    GR4,GR0       ; 計算結果格納レジスタに xⁿ の値を加算',
  '13          LAD     GR1,-1,GR1   ; n から 1 を減じ，低次の項の計算へ',
  '14          JUMP    LP1',
  '15  FIN     LD      GR0,GR4',
  '16          RPOP',
  '17          RET',
  '18          END',
].join('\n');
const program2 = [
  'MULT    START               ; シフトによる乗算',
  '        RPUSH',
  '        LD      GR1,GR0',
  '        LD      GR0,=0        ; 乗算結果の初期化',
  '        LD      GR2,GR2',
  'LP      [b]',
  '        LD      GR3,GR2',
  '        AND     GR3,=#0001   ; 最下位ビットのチェック',
  '        JZE     CONT',
  '        ADDL    GR0,GR1',
  'CONT    [c]',
  '        SRL     GR2,1',
  '        JUMP    LP',
  'FIN     RPOP',
  '        RET',
  '        END',
].join('\n');
const program3 = [
  ' 1  POLY2   START',
  ' 2          RPUSH',
  ' 3          CALL    RSUB         ; 再帰処理の本体を呼ぶ',
  ' 4          RPOP',
  ' 5          RET                  ; 主プログラムへ戻る',
  ' 6  RSUB    LD      GR1,GR1       ; n＝0？',
  ' 7          JNZ     CONT         ; n≠0 なら CONT へ',
  ' 8          LD      GR0,=1        ; GR0 ← F(x,0)の値(＝1)',
  ' 9          RET',
  '10  CONT    [　]',
  '11          CALL    RSUB         ; F(x,n−1)を計算',
  '12          CALL    MULT',
  '13          ADDL    GR0,=1',
  '14          RET',
  '15          END',
].join('\n');

const degrees = [
  { degree: 4, counts: [4, 5, 10, 11, 15, 16] },
  { degree: 3, counts: [2, 3, 4, 6, 9, 12] },
  { degree: 5, counts: [5, 6, 10, 14, 15, 25] },
  { degree: 2, counts: [1, 2, 3, 4, 5, 6] },
] as const;
const references = [79, 80, 81, 82, 83, 84];
const marks = 'アイウエオカ';

export const q12 = createLanguageDefinition(12, '多項式を項別と再帰で評価するPOLY', '設問2・4で使う多項式の次数', 'abc23de', 'イカエウアオエ',
  '係数が全て1の多項式、符号なし16ビットの入出力、レジスタ保存、三つの命令列と全解答群の役割を保持する。次数を変え、項別法と再帰法の呼出し回数を変える。', index => {
    const { degree, counts } = degrees[index];
    const directCalls = degree * (degree + 1) / 2;
    const directKey = marks[(counts as readonly number[]).indexOf(directCalls)];
    return {
      pages: [
        page(64, [
          p('問12　次のアセンブラプログラムの説明及びプログラムを読んで，設問1～4に答えよ。'),
          p('〔プログラム1，2の説明〕\n与えられた値 x に対し，係数が全て1である n 次多項式 F(x，n) の値を求める副プログラム POLY である。\n\nF(x，n)＝xⁿ＋xⁿ⁻¹＋…＋x＋1　（n≧1）'),
          p('（1）POLY は，多項式の次数 n が GR1 に，x の値が GR2 に設定されて呼ばれ，計算結果を GR0 に設定して呼出し元に戻る。n は1～32767の整数，x は非負の整数とし，F(x，n) の値が16ビット符号なし2進整数の範囲に収まるように与えられる。POLY は，その中で副プログラム MULT を利用する。\n（2）MULT は，16ビット符号なし2進整数同士の乗算を行う副プログラムであり，被乗数と乗数がそれぞれ GR0，GR2 に設定されて呼ばれ，乗算結果を GR0 に設定して呼出し元に戻る。乗算結果などの桁あふれは発生しないものとする。\n（3）副プログラムから戻るとき，汎用レジスタ GR1～GR7 の内容は元に戻す。'),
          p('〔プログラム1〕（行番号）'), code(program1, 'casl2'),
        ]),
        page(65, [
          p('〔プログラム2〕'), code(program2, 'casl2'),
          p('設問1　プログラム1，2中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　プログラム1の POLY を使用して F(x，' + degree + ') を計算するとき，行番号9の CALL 命令が実行される回数として正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', ['JMI BRK', 'JMI FIN', 'JNZ BRK', 'JNZ FIN', 'JZE BRK', 'JZE FIN'], 'イ', 'casl2'),
          bank(1, 'b', ['JMI CONT', 'JMI FIN', 'JNZ CONT', 'JOV CONT', 'JPL CONT', 'JZE FIN'], 'カ', 'casl2'),
          bank(1, 'c', ['ADDL GR0,GR2', 'LD GR2,GR1', 'OR GR2,=#0001', 'SLL GR1,1', 'SRA GR1,1', 'SRL GR1,1'], 'エ', 'casl2'),
          bank(2, '2', counts.map(String), directKey),
        ], [2, 2, 2, 3]),
        page(66, [
          p('設問3　関数 F(x，n) は，次のように変形できる。\n\nF(x，n)＝x×(xⁿ⁻¹＋xⁿ⁻²＋…＋x＋1)＋1　（n≧1）\n\n更に次のように，再帰的に表現することができる。\n\nF(x，0)＝1\nF(x，n)＝x×F(x，n−1)＋1　（n≧1）\n\nこの再帰表現を実装する，プログラム3の POLY2 を作成した。プログラム3中の［　］に入れる正しい答えを，解答群の中から選べ。ここで，POLY2 は POLY と同様に呼ばれる。'),
          p('〔プログラム3〕（行番号）'), code(program3, 'casl2'),
        ], [bank(3, '3', ['LAD GR1,-1,GR1', 'LAD GR1,1,GR1', 'LD GR1,GR2', 'LD GR2,GR1', 'POP GR1', 'PUSH 0,GR1'], 'ア', 'casl2')]),
        page(67, [
          p('設問4　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。\n\nプログラム3の POLY2 を使用して F(x，' + degree + ') を計算するとき，行番号6のラベル RSUB の行には［d］回制御が移る。また，行番号12の CALL 命令は［e］回実行される。'),
        ], [bank(4, 'de', ['1', '2', '3', '4', '5', '6'], marks[degree] + marks[degree - 1])]),
      ],
      contexts: [autumn2012PmReference('IPA公式 COMET II・CASL IIの仕様', references)],
      explanation: 'POLYでは次数が0の定数項も加算し，次の反復でGR1をGR3へ複写した結果が負になってからFINへ進む。MULTでは乗数が0になればFINへ進む。GR2の最下位ビットを処理した後は，被乗数を左へ1ビット，乗数を右へ1ビットずらす。次数' + degree + 'から0までの各べきの計算に必要な乗算回数の和は' + directCalls + '回。POLY2の再帰ではGR1を1ずつ減らし，次数0の呼出しも含めてRSUBに' + (degree + 1) + '回入る。次数0でGR0に1を設定して直ちに戻るため，行番号12のMULTは' + degree + '回となる。',
    };
  }, { fixedReferenceAssetIds: references.map(autumn2012PmPageAssetId) });
