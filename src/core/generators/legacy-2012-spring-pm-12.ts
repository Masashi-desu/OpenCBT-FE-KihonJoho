import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2012-spring-pm-09-13-support';
import { spring2012PmPageAssetId, spring2012PmReference } from './legacy-2012-spring-pm-materials';

const pairs = [['9462', '673'], ['4123', '204'], ['4167', '218'], ['9876', '789']] as const;
const sums = [
  ['9134', '987', '57', '2', '36'], ['8162', '254', '86', '4', '53'],
  ['9628', '719', '42', '8', '65'], ['7527', '874', '28', '5', '71'],
] as const;
const addition = languageFigure(12, 'digit-addition', '図1 二つの数字列の加算の例', i => ({
  kind: 'digits', inputs: pairs[i], output: String(Number(pairs[i][0]) + Number(pairs[i][1])), layout: 'pair',
}));
const summation = languageFigure(12, 'digit-summation', '図2 数字列1〜5の総和の例', i => ({
  kind: 'digits', inputs: sums[i], output: String(sums[i].reduce((sum, value) => sum + Number(value), 0)), layout: 'list',
}));
export const q12Figures = [addition, summation];
export const spring2012PmDigitReferenceTitle = '数字文字の表現（独自整理）';
const assemblyPages = [76, 77, 78, 79, 80, 81];

function countCarries(left: string, right: string) {
  let carry = 0, count = 0;
  for (let i = 1; i <= Math.max(left.length, right.length); i++) {
    carry = Number(Number(left.at(-i) ?? 0) + Number(right.at(-i) ?? 0) + carry >= 10);
    count += carry;
  }
  return count;
}

const addProgram = ` 1  ADDC     START
 2           RPUSH
 3           CPA    GR4,GR5
 4           JPL    CONT
 5           PUSH   0,GR4       ; ┐
 6           LD     GR4,GR5     ; │
 7           POP    GR5         ; ├ GR4≧GR5となるように
 8           PUSH   0,GR1       ; │ 数字列1と数字列2のポインタ
 9           LD     GR1,GR2     ; │ を入替え
10           POP    GR2         ; ┘
11  CONT     ADDA   GR1,GR4
12           ADDA   GR2,GR5
13           LD     GR0,=0      ; 桁上げフラグを初期化
14           PUSH   0           ; スタックデータの終わりの印
15  LOOP1    LAD    GR2,-1,GR2
16           LD     GR6,0,GR2
17           AND    GR6,=#000F
18  LOOP2    LAD    GR1,-1,GR1
19           ADDA   GR6,0,GR1   ; 1桁加算
20           ADDA   GR6,GR0     ; 桁上げフラグを加算
21           CPA    GR6,='9'    ; 桁上げ？
22           JPL    CARRY
23           LD     GR0,=0      ; 桁上げフラグをクリア
24           JUMP   NEXT
25  CARRY    LD     GR0,=1      ; 桁上げフラグを設定
26           ［a］
27  NEXT     PUSH   0,GR6       ; 加算結果1桁を保存
28           ［b］
29           JZE    END1
30           ［c］
31           JPL    LOOP1
32           LD     GR6,=0
33           JUMP   LOOP2
34  END1     LD     GR0,GR0     ; 左端を桁上げ？
35           JZE    NOCARRY
36           LD     GR1,='1'    ; 左端に'1'を追加
37  LOOP3    ST     GR1,0,GR3
38           LAD    GR3,1,GR3
39  NOCARRY  POP    GR1         ; 加算結果1桁取り出し
40           LD     GR1,GR1
41           JZE    END2
42           ADDA   GR0,=1
43           JUMP   LOOP3
44  END2     RPOP
45           RET
46           END`;

const sumProgram = `SUMC   START
       LAD   GR1,BUF1    ; 数字列1のポインタを設定
       IN    BUF1,LEN1   ; 最初の数字列を入力し数字列1とする
       LD    GR4,LEN1    ; 数字列1の長さを設定
       LAD   GR3,BUF3    ; BUF3を総和の領域として設定
       LAD   GR2,BUF2    ; 数字列2のポインタを設定
LOOP   IN    BUF2,LEN2   ; 次の数字列を入力し数字列2とする
       LD    GR5,LEN2    ; 数字列2の長さを設定
       JMI   FIN1        ; 入力終了
       CALL  ADDC
       ［e］
       PUSH  0,GR1       ; ┐ 総和の領域のポインタと
       LD    GR1,GR3     ; ├ 数字列1のポインタを入替え
       POP   GR3         ; ┘
       JUMP  LOOP
FIN1   ［f］
       CPA   GR1,GR3     ; 総和の領域を判定
       JZE   FIN2
       ST    GR4,LEN1
       OUT   BUF1,LEN1
       JUMP  FIN3
FIN2   ST    GR4,LEN3
       OUT   BUF3,LEN3
FIN3   RET
BUF1   DS    256         ; 数字列1又は総和
BUF2   DS    256         ; 数字列2
BUF3   DS    256         ; 総和又は数字列1
LEN1   DS    1
LEN2   DS    1
LEN3   DS    1
       END`;

export const q12 = createLanguageDefinition(12, 'アセンブラによる数字列の加算と総和', '数字列の値・桁上げ回数・総和の入力',
  'abcdef', '設問1 a=ケ，b=ア，c=エ／設問2 d=エ／設問3 e=オ，f=ウ',
  '原冊子p.59〜62。正の10進数・先頭に0なし・1語1文字・256桁以内・GR1〜GR7の復元・スタック終端を維持。4桁と3桁の例で桁上げを0〜4回の範囲で変え、5列の総和を独立に計算する。原表の3×3命令群と行番号・注記を保持。JISの原表と引用部分は転載せず，必要な数字文字の事実だけを独立して整理する。', i => ({
    pages: [
      page(59, [
        p('問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
        heading('〔プログラム1の説明〕'),
        p('主プログラムから渡された二つの数字列（数字列1と数字列2）をそれぞれ正の10進数とみなして加算し，結果を数字列で返す副プログラムADDCである。二つの数字列の加算の例を図1に示す。'),
        addition.block(i),
        p('（1）汎用レジスタGR1〜GR5には，それぞれ次の内容が設定されて，主プログラムから渡される。'),
        code(`GR1：数字列1の先頭アドレス
GR2：数字列2の先頭アドレス
GR3：結果領域の先頭アドレス
GR4：数字列1の長さ（文字数）
GR5：数字列2の長さ（文字数）`, 'text'),
        p('（2）数字は1語に1文字格納する。'),
        p('（3）結果の数字列は結果領域に格納し，長さ（文字数）はGR0に設定して，主プログラムに返す。'),
        p('（4）数字列1と数字列2の長さ（文字数）は，それぞれ1以上とする。'),
        p('（5）数字列1と数字列2の左端の文字は“0”でないものとする。'),
        p('（6）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
      ]),
      page(60, [heading('〔プログラム1〕（行番号）'), code(addProgram, 'casl2')]),
      page(61, [
        p('設問1 プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        p('設問2 次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。図1の数字列1と数字列2を引数として副プログラムADDCを実行した場合，行番号25のLD命令は［d］回実行される。'),
        p('設問3 副プログラムADDCを使用して，n個（n≧1）の数字列を入力し，総和を求めて数字列で出力するプログラムSUMCを作成した。n=5の場合の例を図2に示す。プログラム2中の空欄に入れる正しい答えを，解答群の中から選べ。なお，入力される数字列，総和は256桁以内に収まるものとする。'),
        summation.block(i),
      ], [
        bank(1, 'abc', [4, 5, 6].flatMap(reg => [1, 9, 10].map(value => `SUBA  GR${reg},=${value}`)), 'ケアエ', 'casl2'),
        bank(2, 'd', ['0', '1', '2', '3', '4'], 'アイウエオ'[countCarries(pairs[i][0], pairs[i][1])]),
      ], [0, 1]),
      page(62, [heading('〔プログラム2〕'), code(sumProgram, 'casl2')], [
        bank(3, 'ef', ['LAD   GR3,BUF1', 'LAD   GR3,BUF2', 'LAD   GR3,BUF3', 'LD    GR3,GR0', 'LD    GR4,GR0', 'LD    GR5,GR0'], 'オウ', 'casl2'),
      ]),
    ],
    contexts: [spring2012PmReference('アセンブラ言語の仕様（公式付属資料・文字コード節を除く）', assemblyPages), {
      title: spring2012PmDigitReferenceTitle, presentation: 'text',
      blocks: [p('数字文字は1語に1文字を格納する。文字“0”の値は16進数の #0030 で，“1”から“9”までは値が順に1ずつ増える。数字文字の値と #000F の論理積を取ると，その文字が表す0〜9の数値を取り出せる。INで入力の終わりを検出したときは長さの格納語が−1になる。')],
    }],
    explanation: `短い方の数字文字の下位4ビットと，長い方の数字文字，前の桁上げを足す。文字“9”を超えたときは桁上げを1とし，aでGR6から10を引いて結果の数字文字を作る。bとcでは長い方GR4と短い方GR5の残り桁をそれぞれ1減らす。図1の${pairs[i][0]}と${pairs[i][1]}の加算で行25を通るのは${countCarries(pairs[i][0], pairs[i][1])}回である。SUMCではADDCがGR0で返した桁数をeでGR4に移し，出力領域を次の加算の数字列1へ切り替える。入力終了時のfはGR3をBUF3の先頭にし，現在の数字列1がBUF3かBUF1かを比較する。`,
  }), { fixedReferenceAssetIds: assemblyPages.map(spring2012PmPageAssetId) });
