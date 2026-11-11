import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page, standaloneBank } from './legacy-2010-spring-pm-09-13-support';
import { spring2010PmPageAssetId, spring2010PmReference } from './legacy-2010-spring-pm-materials';

const pagesForCasl = [80, 81, 82, 83, 84, 85];
const cases = [
  { exponentBits: 8, bias: 127, exampleExponent: 132, normaliseShift: 2 },
  { exponentBits: 7, bias: 63, exampleExponent: 70, normaliseShift: 1 },
  { exponentBits: 9, bias: 255, exampleExponent: 265, normaliseShift: 3 },
  { exponentBits: 6, bias: 31, exampleExponent: 36, normaliseShift: 4 },
];
const binary = (value: number, digits: number) => value.toString(2).padStart(digits, '0');
const format = languageFigure(12, 'float-format', 'メモリ中の2語の形式', index => {
  const { exponentBits: bits, bias } = cases[index];
  return { kind: 'tables', note: '（ ）内はビット数。', tables: [
    { headers: ['メモリ番地', 'α', 'α', 'α', 'α＋1'], rows: [
      ['格納領域', 'S', '未使用', 'E', 'M'],
      ['ビット数', '（1）', `（${15 - bits}）`, `（${bits}）`, '（16）'],
    ], merges: [{ row: -1, column: 1, rowSpan: 1, colSpan: 3 }] },
    { headers: ['領域', '意味'], rows: [
      ['S', '符号部（正は0，負は1）'], ['未使用', 'ビット0を詰める'],
      ['E', `指数部（0〜${2 ** bits - 1}の符号なし2進整数，実際の指数に${bias}を加算した値）`],
      ['M', '仮数部（2進固定小数点数，最上位ビットの左に小数点があると仮定する）'],
    ] },
  ] };
});
const example = languageFigure(12, 'normalisation', '正規化の例', index => {
  const { exponentBits: bits, exampleExponent, normaliseShift } = cases[index];
  const beforeMantissa = 0x8000 >> normaliseShift;
  return { kind: 'output', text:
    `〔 E＝${binary(exampleExponent, bits)}    M＝${binary(beforeMantissa, 16)} 〕\n             ↓ 正規化（Mを${normaliseShift}ビット左に論理シフトし，Eから${normaliseShift}を減じる）\n〔 E＝${binary(exampleExponent - normaliseShift, bits)}    M＝1000000000000000 〕` };
});
export const q12Figures = [format, example];

const asm = (source: string) => code(source, 'casl2');
function addCode(exponentMask: string) {
  return ` 1  FADD    START                  ; Z ← X ＋ Y
 2          RPUSH
 3          PUSH   0,GR3           ; 結果Zの格納領域の先頭番地を退避
 4          LD     GR4,0,GR1
 5          AND    GR4,=#${exponentMask}      ; Ex: Xの指数
 6          LD     GR5,0,GR2
 7          AND    GR5,=#${exponentMask}      ; Ey: Yの指数
 8          LD     GR6,1,GR1       ; Mx: Xの仮数
 9          LD     GR7,1,GR2       ; My: Yの仮数
10  ; 加算前の準備（指数をそろえる）
11  ; GR4 ← max(Ex,Ey)，GR6 ← 調整済Mx，GR7 ← 調整済My
12          LD     GR3,GR4
13          CPL    GR4,GR5
14          JZE    MADD            ; Ex ＝ Eyの場合
15          JMI    BIGEY           ; Ex ＜ Eyの場合
16          SUBL   GR3,GR5
17          SRL    GR7,0,GR3       ; Myを調整
18          JUMP   MADD
19  BIGEY   ［a］
20          SUBL   GR5,GR3
21          SRL    GR6,0,GR5       ; Mxを調整
22  ; 符号を考慮した仮数の加算
23  ; Sz: Zの符号，Ez: Zの指数，Mz: Zの仮数
24  ; GR4 ← (Sz,Ez)，GR5 ← Mz
25  MADD    LD     GR1,0,GR1       ; Xの符号の検査
26          JMI    XMINUS          ; 負の場合
27          LD     GR2,0,GR2       ; Yの符号の検査
28          ［b］
29          LD     GR5,GR6         ; X ≧ 0，Y ≦ 0の場合
30          SUBL   GR5,GR7         ; Mz ← 調整済Mx − 調整済My
31          JUMP   SCHECK
32  XMINUS  LD     GR2,0,GR2
33          JMI    YMINUS
34          LD     GR5,GR7
35          SUBL   GR5,GR6
36          ［c］
37  YMINUS  OR     GR4,=#8000      ; Szに負符号を設定
38  ADDMXY  LD     GR5,GR6
39          ADDL   GR5,GR7         ; Mz ← 調整済Mx ＋ 調整済My
40          JOV    ADJST           ; けた上がりがある場合の正規化
41          JUMP   NORM`;
}
const normaliseCode = `42  SCHECK  JOV    NEGMZ           ; Mzの符号を検査
43          JUMP   NORM
44  NEGMZ   OR     GR4,=#8000      ; Szに負符号を設定
45          XOR    GR5,=#FFFF      ; Mz ← −Mz
46          ADDL   GR5,=1
47  ; 加算結果の正規化
48  NORM    LD     GR5,GR5         ; ゼロチェック
49          JNZ    LOOP
50          LD     GR4,=0
51          JUMP   FIN
52  LOOP    LD     GR5,GR5         ; 正規化完了？
53          JMI    FIN
54          ［d］
55          SUBL   GR4,=1
56          JUMP   LOOP
57  ADJST   SRL    GR5,1
58          OR     GR5,=#8000      ; Mzの最上位ビットを1に設定
59          ［e］
60  FIN     POP    GR3
61          ST     GR4,0,GR3       ; 結果Zの格納
62          ST     GR5,1,GR3
63          RPOP
64          RET
65          END`;

export const q12 = createLanguageDefinition(12, 'CASL II：浮動小数点加算と正規化', '指数部の長さ・バイアス・正規化前の入力', 'abcde2',
  '設問1 aウ bエ cカ dイ eア／設問2 カ', '符号付き仮数の加減算・上位語の符号と指数・ゼロ処理・行番号1〜65・二設問6欄を維持する。指数ビット幅とマスク、バイアス、正規化例を連動させる。生成側で非零入力の指数Eが1以上であることを明示する。原冊子の公式キーと条件を保存し、境界例を独自解説に記録する。文字表は不要。', (index, original) => {
    const { exponentBits, bias } = cases[index];
    const maxExponent = 2 ** exponentBits - 1;
    const mask = maxExponent.toString(16).toUpperCase().padStart(4, '0');
    return {
      pages: [
        page(67, [
          p('問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕浮動小数点数の加算を行う副プログラムFADDである。'),
          p('（1）浮動小数点数は，メモリ中の連続する2語に次の形式で格納する。'), format.block(index),
          p(`この形式で表される浮動小数点数は（−1）^S × 0.M × 2^(E−${bias})である。S＝E＝M＝0でゼロを表現する（M＝0のときは，必ずS＝E＝0であること）。`),
          ...(original ? [] : [p('ここで，入力する非零の浮動小数点数では，指数部Eは1以上とする。')]),
          p(`（2）FADDは，被加数と加数について，いずれか指数の大きい方にもう一方の指数をそろえてから仮数を加算し，結果がゼロの場合を除き正規化（仮数部の最上位ビットが1となるように指数部を調整）する。指数部調整の過程で，アンダフロー（指数部が0未満）又はオーバフロー（指数部が${maxExponent}を超える）は発生しないものとする。`),
          example.block(index),
          p('（3）FADDは，被加数X，加数Y及び結果Zの格納領域の先頭番地を，それぞれGR1，GR2，GR3に設定して呼び出される。'),
          p('（4）FADDから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ]),
        page(68, [p('〔プログラム〕（行番号）'), asm(addCode(mask))]),
        page(69, [
          asm(normaliseCode), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', ['ADDL GR4,GR5', 'ADDL GR5,GR4', 'LD GR4,GR5', 'LD GR5,GR4', 'SRL GR4,0,GR5', 'SRL GR5,0,GR4'], 'ウ', 'casl2'),
          bank(1, 'b', ['JMI ADDMXY', 'JMI XMINUS', 'JMI YMINUS', 'JPL ADDMXY', 'JPL XMINUS', 'JPL YMINUS'], 'エ', 'casl2'),
        ]),
        page(70, [
          p('設問2 プログラムを減算用に変更する場合，行番号27及び32の直後に追加する命令として正しい答えを，解答群の中から選べ。なお，プログラム中のコメントは適宜読み替えるものとする。'),
        ], [
          bank(1, 'c', ['JOV ADDMXY', 'JOV SCHECK', 'JPL ADDMXY', 'JPL SCHECK', 'JUMP ADDMXY', 'JUMP SCHECK'], 'カ', 'casl2'),
          bank(1, 'd', ['SLL GR5,0,GR4', 'SLL GR5,1', 'SRA GR5,0,GR4', 'SRA GR5,1', 'SRL GR5,0,GR4', 'SRL GR5,1'], 'イ', 'casl2'),
          bank(1, 'e', ['ADDL GR4,=1', 'ADDL GR5,=1', 'SLL GR4,1', 'SLL GR5,1', 'SUBL GR4,=1', 'SUBL GR5,=1'], 'ア', 'casl2'),
          standaloneBank(2, ['AND GR2,=#7FFF', 'AND GR2,=#8000', 'OR GR2,=#7FFF', 'OR GR2,=#8000', 'XOR GR2,=#7FFF', 'XOR GR2,=#8000'], 'カ', 'casl2'),
        ], [-1, -1, -1, 0]),
      ],
      contexts: [spring2010PmReference('アセンブラ言語の仕様', pagesForCasl)],
      explanation: `a：Eyが大きいとき，結果の指数にEyを採用してから指数差だけMxを論理右シフトする。指数を取り出すマスクは#${mask}。b：XとYがともに正ならADDMXYへ分岐する。Yがゼロの場合は加減どちらもMxを保つ。c：Xが負でYが非負の経路では論理減算の借りをSCHECKで調べる。d：最上位ビットが0の非零仮数を1ビット論理左シフトし，指数を1下げる。e：けた上がりを含めて右へ1ビットずらした分，指数を1上げる。設問2：GR2の符号ビットだけをXORで反転すればX−Yとなる。`
        + (original ? '原問の公式解答はこの分岐を想定するが，形式上は正で非零のYにもE＝0が許される。この場合，先頭語が0なのでJPLは分岐せず，誤って減算する。例えば X=(S0,E1,M=#A000)，Y=(S0,E0,M=#8000) では加算結果は(S0,E1,M=#E000)だが，掲載コードでは(S0,E0,M=#C000)となる。' : '生成問題では非零の入力のEを1以上に限定するため，非負のYの先頭語が0になるのは値がゼロのときだけである。'),
    };
  }, { answerVariation: 'fixed', fixedReferenceAssetIds: pagesForCasl.map(spring2010PmPageAssetId) });
