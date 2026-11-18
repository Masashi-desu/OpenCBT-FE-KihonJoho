import { code, p, table } from './definition';
import { spring2006PmPageAssetId, spring2006PmReference } from './legacy-2006-spring-pm-materials';
import { bank, numbered, page, springLanguageQuestion } from './legacy-2006-spring-pm-10-13-support';

const appendices = [57, 58, 59, 60, 61, 62];
const references = [spring2006PmReference('アセンブラ言語の仕様（CASL II・COMET II）', appendices)];

const multiplyStart = `MULT32   START            ; シフトによる乗算
         RPUSH
         LD   GR5,0,GR2   ; 被乗数の退避  ┐
         ST   GR5,H       ;              │
         LD   GR5,1,GR2   ;              │
         ST   GR5,L       ;              ┘
         LD   GR5,=0      ; 乗算結果格納領域の初期化 ┐
         ST   GR5,0,GR2   ;                        │
         ST   GR5,1,GR2   ;                        ┘`;

const multiplyAndAdd = `         LAD  GR3,15      ; 被乗数シフト用カウンタ初期化
         LAD  GR4,1       ; GR4 ← 16－GR3
         LD   GR6,GR1     ; 乗数をGR6に設定，GR1は作業用に解放
LP       LAD  GR3,-1,GR3  ; GR3＋GR4＝16の関係を維持
         LAD  GR4,1,GR4   ;
         SLL  GR6,1
         JZE  FIN
         JPL  LP          ; 最上位ビットが0なら何もしない
         LD   GR1,H       ; 被乗数の取出し
         LD   GR0,L       ;
         LD   GR5,GR0     ; ┐
         [a]              ; │
         SLL  GR1,0,GR3   ; │ GR3だけ被乗数（32ビット）を左シフト
         SLL  GR0,0,GR3   ; │
         OR   GR1,GR5     ; ┘
         CALL ADD32       ; シフトされた被乗数を中間結果に加算
         JUMP LP
FIN      RPOP
         RET
H        DS   1           ; 被乗数上位語の退避場所
L        DS   1           ; 被乗数下位語の退避場所
;
ADD32    RPUSH            ; Z ← X＋Y
; Xの上位語をXH，下位語をXLなどと表記
         LD   GR4,GR0     ; YLをGR4に設定
         ADDL GR0,1,GR2   ; ZL ← XL＋YL，ZLをGR0に設定
         XOR  GR4,1,GR2   ; けた上がりの判定
         JMI  DIFF        ; ① XLとYLの最上位ビットが，
         XOR  GR4,1,GR2   ;     ともに1のときけた上がり
         JUMP NEXT        ; ② XLとYLの最上位ビットが異なり，
DIFF     XOR  GR4,GR0     ;     ZLの最上位ビットが0のときけた上がり
NEXT     SRL  GR4,15      ; けた上がりをGR4の最下位ビットへ移動
         [b]
         ADDL GR1,0,GR2
         ST   GR1,0,GR2
         ST   GR0,1,GR2
         RPOP
         RET
         END`;

const factorial = `FACT     START
         RPUSH
         CALL RMAIN       ; 再帰処理の本体を呼ぶ
         RPOP
         RET             ; 主プログラムに戻る
RMAIN    LD   GR1,GR1    ; N＝0？
         JNZ  CONT       ; N≠0ならCONTへ
         ST   GR1,0,GR2  ; N＝0の場合
         LD   GR1,=1     ;   F(0)の値（＝1）を
         ST   GR1,1,GR2  ;   計算結果格納領域に設定し
         RET             ;   行番号15に戻る
CONT     PUSH 0,GR1      ; Nの退避（Nはn→n－1→…→1の順に変化）
         LAD  GR1,-1,GR1 ; GR1 ← N－1
         CALL RMAIN      ; F(N－1)を計算し計算結果格納領域に設定
         POP  GR1        ; Nの復元（Nは1→2→…→nの順に変化）
         CALL MULT32     ; F(N－1)×Nを計算し計算結果格納領域に設定
         RET             ; 再帰処理の終了時は行番号4に，
         END             ; それ以外のときは行番号15に戻る`;

const shifts = ['SLL GR5,0,GR3', 'SLL GR5,0,GR4', 'SRA GR5,0,GR3', 'SRA GR5,0,GR4', 'SRL GR5,0,GR3', 'SRL GR5,0,GR4'];
const carryOps = ['ADDL GR0,GR4', 'ADDL GR1,GR4', 'OR   GR0,GR4', 'OR   GR1,GR4', 'SUBL GR0,GR4', 'SUBL GR1,GR4'];
const jumps = ['JOV LP\nJPL ONBIT', 'JOV ONBIT\nJZE FIN', 'JPL FIN\nJOV ONBIT', 'JPL ONBIT\nJZE FIN',
  'JZE FIN\nJOV ONBIT', 'JZE FIN\nJPL ONBIT'];
const factorialInputs = [3, 2, 4, 5];

export const q13 = springLanguageQuestion(13, '32ビットの乗算・加算と階乗の再帰', '階乗を計算する整数', 'ab2cd', 'カイイエア',
  '階乗の入力を2〜5に変え，図示する呼出しと二つの実行回数を更新する。乗算・加算の語長、はみ出たビットの切捨て、呼出し規約、個々の行と分岐、選択肢の式は保持し、階乗の候補は1〜6の元の昇順とする。32ビットの境界値と再帰の終了をCASL IIの命令仕様で独立検算する。', index => {
    const n = factorialInputs[index], trace = Array.from({ length: n + 1 }, (_, i) => n - i);
    const result = trace.slice(0, -1).reduce((total, factor) => total * factor, 1);
    return {
      contexts: references,
      pages: [
        page(53, [
          p('問13　次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('〔プログラムの説明〕\n32ビット符号なし2進整数と15ビット符号なし2進整数の乗算を行う副プログラムMULT32と，32ビット符号なし2進整数同士の加算を行う副プログラムADD32である。'),
          p('（1）MULT32は被乗数の格納領域の先頭番地をGR2に，15ビットの乗数をGR1に設定して呼び出す。32ビットの乗算結果を被乗数の格納領域に上書きする。領域からはみ出した部分は無視する。MULT32はADD32を利用する。'),
          p('（2）ADD32は被加数の領域の先頭番地をGR2に，加数の上位語と下位語をそれぞれGR1とGR0に設定して呼び出す。32ビットの結果を被加数の格納域に上書きする。領域からはみ出した部分は無視する。'),
          p('（3）被乗数と被加数の格納形式を次に示す。'),
          table('格納形式', ['上位語', '下位語'], [['（GR2）＋0', '（GR2）＋1']]),
          p('（4）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('〔プログラム〕'), numbered('casl2', 1, multiplyStart),
        ]),
        page(54, [
          numbered('casl2', 10, multiplyAndAdd),
          p('設問1　プログラム中の［a］と［b］に入れる正しい答えを，解答群の中から選べ。'),
        ], [bank(1, 'a', shifts, 'カ', 'casl2')]),
        page(55, [
          p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('MULT32の受け取る乗数を16ビット符号なし2進整数とするため，行番号10，11を次のとおりに変更する。'),
          numbered('casl2', 10, '         LAD  GR3,16      ; 被乗数シフト用カウンタ初期化\n         LAD  GR4,0       ; GR4 ← 16－GR3'),
          p('さらに，行番号16，17を次の命令群で置き換える。'),
          code('         [設問2]\n         JUMP LP\nONBIT    NOP', 'casl2'),
        ], [bank(1, 'b', carryOps, 'イ', 'casl2')], 0),
        page(55, [], [{ ...bank(2, '2', jumps, 'イ', 'casl2'), ownLabel: '設問2 解答群' }]),
        page(56, [
          p('設問3　次の記述中の［c］と［d］に入れる正しい答えを，解答群の中から選べ。'),
          p('MULT32を使用して，再帰的に階乗計算を行う副プログラムFACTを作成した。'),
          p('（1）正の整数nの階乗F(n)は，F(n)＝n×F(n−1)，ただしF(0)＝1とする。例：F(3)＝3×F(2)＝3×2×F(1)＝3×2×1×F(0)＝3×2×1×1＝6。\n（2）FACTはnをGR1に，計算結果の領域の先頭番地をGR2に設定して呼び出す。1≦n≦12で，32ビット符号なし2進整数の範囲に収まる。計算結果の格納形式はMULT32の被乗数と同じである。\n（3）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          numbered('casl2', 1, factorial),
          p('F(' + n + ')を計算するとき，行番号6のラベルRMAINの命令には［c］回制御が移る。また，行番号11のRET命令は［d］回実行される。'),
        ], [{ ...bank(3, 'cd', ['1', '2', '3', '4', '5', '6'], 'アイウエオカ'[n] + 'ア'), ownLabel: '設問3 解答群' }]),
      ],
      explanation: '下位語から上位語へ移るビットは，下位語を16−GR3ビット論理右シフトして得る。32ビット加算では下位語のけた上がりを高位語GR1へ加えてから高位語同士を加える。16ビット乗数の最上位の1が外へ出て残りが0のときはOFとZFが同時に1になるため，JOVをJZEより先に判定する。階乗のRMAINにはN＝' + trace.join('，') + 'の' + trace.length + '回入り，N＝0のときだけ行11を1回実行する。復帰時に下から掛け戻すとF(' + n + ')＝' + result + 'である。',
    };
  }, { fixedReferenceAssetIds: appendices.map(spring2006PmPageAssetId) });
