import { ask, bank, code, heading, p, page, panel } from './legacy-2014-spring-pm-09-13-source';

export const spring2014Pm12GetTkn = `GETTKN START
       RPUSH
       LD    GR3,=-1       ; 単語種別の初期化
       LAD   GR1,-1,GR1
LP     LAD   GR1,1,GR1
       LD    GR4,0,GR1     ; 1文字を取り出す
       CPL   GR4,='.'
       JZE   FIN
       CPL   GR4,=' '
       JNZ   ALNUM
       CALL  SETTKN
       [a]
ALNUM  LD    GR3,GR3       ; 単語の処理中？
       JPL   LP            ; 処理中の単語が英字を含む場合はLPへ
       JZE   ACHK          ; 処理中の単語が数字だけから成る場合はACHKへ
       LD    GR3,=0        ; 次の単語の処理開始
                           ; 単語種別を“数字だけから成る”に設定
       LD    GR6,GR1       ; 先頭アドレスを退避
ACHK   CPL   GR4,='9'
       JPL   NEXT
       CPL   GR4,='0'
       JMI   NEXT
       JUMP  LP            ; 取り出した文字が数字の場合はLPへ
NEXT   LD    GR3,=1        ; 単語種別を“英字を含む”に設定
       JUMP  LP
FIN    CALL  SETTKN
       LD    GR5,=-1
       ST    GR5,0,GR2     ; 終端マークを格納
       RPOP
       RET
SETTKN LD    GR3,GR3
       JMI   FIN2          ; 単語処理中でなければ何もしない
       ST    GR6,0,GR2     ; 単語の先頭アドレスを格納
       LD    GR5,GR1
       [b]
       ST    GR5,1,GR2     ; 単語の長さを格納
       ST    GR3,2,GR2     ; 単語の種別を格納
       LD    GR3,=-1       ; 単語種別を初期化（処理中状態を解除）
       LAD   GR2,3,GR2
FIN2   RET
       END`;
export const spring2014Pm12Calc1 = `CALC   START
       RPUSH
       LAD   GR2,CTBL
       CALL  GETTKN
       [c]
       CALL  DTOB          ; 数字文字列1を2進数に変換して
       LD    GR4,GR0       ; GR4に設定
       LD    GR1,3,GR2
       LD    GR3,0,GR1     ; GR3 ← 演算子の文字コード
       SUBL  GR3,='*'
       LAD   GR1,6,GR2
       CALL  DTOB          ; 数字文字列2を2進数に変換して
       LD    GR5,GR0       ; GR5に設定
       [d]
       JUMP  0,GR3         ; 演算子で指定された処理にジャンプ
MULT   LD    GR0,=0        ; 乗算
       LD    GR5,GR5
LP     JZE   FIN
       LD    GR3,GR5
       AND   GR3,=#0001    ; 乗数の最下位ビットのチェック
       JZE   NEXT`;
export const spring2014Pm12Calc2 = `       ADDL  GR0,GR4
NEXT   SLL   GR4,1         ; 被乗数を1ビット左論理シフト
       [e]
       JUMP  LP
PLUS   ADDL  GR4,GR5       ; 加算
       LD    GR0,GR4
       JUMP  FIN
MINUS  SUBL  GR4,GR5       ; 減算
       LD    GR0,GR4
FIN    RPOP
       RET
CTBL   DS    10            ; GETTKN用単語管理テーブル
LTBL   DC    MULT          ; 演算の分岐先アドレステーブル
       DC    PLUS
       DS    1             ; ダミー
       DC    MINUS
       END`;
export const spring2014Pm12Pages = [
  page(65,p('問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1～3に答えよ。'),
    heading('プログラム1の説明'),
    p('文字列中の単語を切り出して，単語管理テーブルを作成する副プログラム GETTKN である。'),
    p('（1）文字列は英字，数字，空白文字の0文字以上の並びで，最後にピリオドが置かれる。単語は，1文字以上の空白文字又はピリオドで区切られた英数字の並びである。英字には，アルファベットの他に，ピリオド以外の記号を含むものとする。文字列表記中の“△”は空白文字を示す。'),
    p('（2）単語管理テーブルには，文字列中に現れる単語ごとに，3語から成る要素を作成し，単語の先頭アドレス，単語の長さ，単語の種別の順に格納する。種別は，単語が数字だけから成るときは0，英字を含むときは1とする。単語の切出しが終了したとき，単語管理テーブルの終端を示すマークとして－1を格納する。'),
    p('（3）主プログラムは，文字列の先頭アドレスを GR1 に，単語管理テーブルの先頭アドレスを GR2 に設定して，GETTKN を呼ぶ。'),
    p('（4）副プログラム GETTKN から戻るとき，汎用レジスタ GR1～GR7 の内容は元に戻す。'),
    p('副プログラム GETTKN の実行例を，図1に示す。'),panel('get-tokens','図1 副プログラム GETTKN の実行例')),
  page(66,heading('プログラム1'),code(spring2014Pm12GetTkn,'casl2')),
  page(67,heading('設問1'),p('プログラム1中の'+ask),bank('a'),bank('b'),
    heading('設問2'),p('次の文字列が与えられ，プログラム1のラベル NEXT が付いた命令を2度目に実行した直後に GR4 に設定されている文字として，正しい答えを，解答群の中から選べ。'),
    panel('trace-tokens','設問2 与えられる文字列'),bank('s2'),
    heading('設問3'),p('GETTKN を使用して，指示に従い2数の和，差，積のいずれかを求める副プログラム CALC を作成した。プログラム2中の'+ask),
    p('（1）主プログラムは，文字列の先頭アドレスを GR1 に設定して，CALC を呼ぶ。CALC は演算結果を GR0 に設定して呼出し元に戻る。文字列の形式を図2に示す。'),
    panel('calc-string','図2 文字列の形式')),
  page(68,
    p('（2）数字文字列は0～65535の整数（符号なしの数字文字列）で1文字以上の文字列とし，演算子は加算（＋），減算（－），乗算（＊）を表す記号1文字とする。演算はそれぞれ論理加算，論理減算，整数の乗算として実行し，桁あふれは発生しないものとする。'),
    p('（3）CALC は，GETTKNで切り出した数字だけから成る単語を2進数に変換するために，別に用意された副プログラム DTOB を呼ぶ。'),
    p('（4）DTOB は，数字文字列格納領域の先頭アドレスと文字列の長さが順に格納された2語から成る領域の先頭アドレスが GR1 に設定されて，呼び出される。DTOB は数字文字列を2進数に変換し，GR0 に設定して呼出し元に戻る。'),
    panel('dtob','DTOBへの引数'),
    p('（5）副プログラム CALC，DTOB から戻るとき，汎用レジスタ GR1～GR7 の内容は元に戻す。'),
    heading('プログラム2'),code(spring2014Pm12Calc1,'casl2')),
  page(69,code(spring2014Pm12Calc2,'casl2'),bank('c'),bank('d'),bank('e')),
];
export const spring2014Pm12Banks = {
  a:{options:['JUMP ACHK','JUMP LP','LAD GR1,-1,GR1','LAD GR1,1,GR1','LD GR4,0,GR1','LD GR4,1,GR1']},
  b:{options:['ADDL GR5,GR6','LAD GR3,1,GR3','SLL GR3,1','SLL GR5,1','SRL GR5,1','SUBL GR5,GR6']},
  s2:{options:['1','2','3','A','B','C']},
  c:{options:['LAD GR1,3,GR2','LD GR1,0,GR2','LD GR1,CTBL','LD GR1,GR2','LD GR2,CTBL','LD GR2,GR1']},
  d:{options:['LAD GR3,LTBL','LAD GR3,LTBL,GR3','LD GR3,LTBL','LD GR3,LTBL,GR3','SLL GR3,1']},
  e:{options:['ADDL GR0,GR5','ADDL GR5,GR4','LD GR5,GR4','SLL GR5,1','SRL GR5,1']},
};
