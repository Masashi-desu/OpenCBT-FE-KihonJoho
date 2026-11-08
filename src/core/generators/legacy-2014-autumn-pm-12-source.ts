import { ask, bank, code, heading, p, page, panel } from './legacy-2014-autumn-pm-09-13-source';

const assembly = (text: string) => code(text, 'casl2');

export const autumn2014Pm12Pages = [
  page(66,
    heading('問12　次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
    heading('〔プログラム1の説明〕'),
    p('n個の要素（大きさ1語）から成る配列に格納されているデータを，バブルソートによって昇順に並べ替える副プログラムSORTである。'),
    panel('sort-array','図1　配列内のデータの並べ替え（n＝5の例）'),
    p('(1) 配列の先頭アドレスはGR1に設定されて，主プログラムから渡される。'),
    p('(2) 配列の要素数n（n≧2）はGR2に設定されて，主プログラムから渡される。'),
    p('(3) 配列に格納されているデータは，符号なしの整数とみなして並べ替える。'),
    p('(4) 副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
    heading('〔プログラム1〕'),p('（行番号）'),
    assembly(` 1 SORT  START
 2       RPUSH
 3       SUBA GR2,=1       ; ループのカウンタ1を設定
 4 LOOP1 LD   GR3,GR2     ; ループのカウンタ2を設定
 5       LD   GR4,GR1     ; GR4←比較する要素のアドレス
 6 LOOP2 LD   GR5,0,GR4
 7       CPL  GR5,1,GR4   ; 二つの要素を比較
 8       [a]
 9       LD   GR6,1,GR4   ; 二つの要素を入れ替え
10       ST   GR5,1,GR4
11       ST   GR6,0,GR4
12 CONT  ADDA GR4,=1
13       SUBA GR3,=1
14       JPL  LOOP2`)),
  page(67,
    assembly(`15       SUBA GR2,=1
16       [b]
17       RPOP
18       RET
19       END`),
    heading('設問1'),p('プログラム1中の'+ask),bank('ab'),
    heading('設問2'),p('次の記述中の'+ask),
    p('主プログラムから渡された配列の要素数nが4で，配列の内容が図2のとき，行番号7のCPL命令は［c］回実行され，行番号11のST命令は［d］回実行される。'),
    panel('count-array','図2　主プログラムから渡された配列の内容'),bank('cd'),
    heading('設問3'),
    p('m個の数字列を入力し，副プログラムSORTを使って，昇順に並べ替えて出力する主プログラムMAINを作成した。プログラム2中の'+ask)),
  page(68,
    p('(1) 入力する数字列は4桁以内とする。'),
    p('(2) 2≦m≦100とする。'),
    p('(3) 出力する数字列は4桁で，左のゼロは空白で表示する。'),
    panel('digits','図3　入力数字列と出力数字列（m＝5の例）'),
    p('(4) 主プログラムMAINは入力した数字列を，1語長の2進化10進数に変換して配列に格納し，並べ替えを行う。図4に，数字列\'298\'を変換した2進化10進数の例を示す。'),
    panel('bcd','図4　2進化10進数の例'),
    heading('〔プログラム2〕'),
    assembly(`MAIN  START
      LD   GR2,=0        ; 数字列のカウンタを初期化
LOOP3 IN   BUF,ILEN
      LD   GR0,ILEN
      JMI  EOF
      LD   GR3,=0        ; 配列に格納する内容を初期化
      LAD  GR4,BUF
LOOP4 LD   GR5,0,GR4     ; GR5←数字
      AND  GR5,=#000F    ; 数字の数値化
      SLL  GR3,4         ; 処理済の内容を桁上げ
      OR   GR3,GR5       ; 空いた右端4ビットに数値を格納
      ADDA GR4,=1
      SUBA GR0,=1
      JNZ  LOOP4
      ST   GR3,ARRAY,GR2 ; 2進化10進数にした数字列を格納
      ADDA GR2,=1
      JUMP LOOP3
EOF   LAD  GR1,ARRAY`)),
  page(69,
    assembly(`      CALL SORT
      LD   GR4,=' '       ; 空白文字を設定
LOOP5 LD   GR0,0,GR1
      LD   GR5,=3         ; ループのカウンタを設定
LOOP6 LD   GR3,GR0
      [e]
      OR   GR3,=#0030    ; 数値の数字化
      ST   GR3,BUF,GR5   ; バッファに数字を設定
      SUBA GR5,=1
      JMI  WRITE
      [f]
      JNZ  LOOP6
LOOP7 ST   GR4,BUF,GR5   ; バッファに空白を設定
      SUBA GR5,=1
      JMI  WRITE
      JUMP LOOP7
WRITE OUT  BUF,OLEN
      LAD  GR1,1,GR1
      SUBA GR2,=1
      JNZ  LOOP5
      RET
BUF   DS   256
ILEN  DS   1
OLEN  DC   4
ARRAY DS   100
      END`),
    bank('ef')),
];
