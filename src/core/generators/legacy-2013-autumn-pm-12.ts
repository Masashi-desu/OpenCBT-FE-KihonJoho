import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2013-autumn-pm-09-13-support';
import { timeConditions } from './legacy-2013-autumn-pm-09-13-models';
import { languageFigure } from './legacy-2013-autumn-pm-09-13-figures';
import { autumn2013PmPageAssetId, autumn2013PmReference } from './legacy-2013-autumn-pm-materials';

const caslPages = [73, 74, 75, 76, 77, 78];
export const autumn2013PmCaslCodesTitle = '時刻文字列に使う文字と符号値（独自編集）';

const tosec = ` 1 TOSEC   START
 2         RPUSH
 3         LD      GR5,=0
 4         LD      GR2,=4       ; ループ回数
 5         LAD     GR3,VALUE1
 6 LOOP1   LD      GR0,0,GR1    ; GR0←時間の1桁
 7         AND     GR0,=#000F
 8         ADDA    GR0,GR5
 9         SUBA    GR2,=1
10         JZE     FIN
11         LD      GR4,0,GR3    ; GR4←掛ける値
12         LD      GR5,=0
13 LOOP2   SRL     GR4,1        ; GR0×GR4
14         JOV     INCR
15         ［a］
16         LAD     GR3,1,GR3
17         LAD     GR1,1,GR1
18         JUMP    LOOP1
19 INCR    ADDA    GR5,GR0
20 CONT    SLL     GR0,1
21         JUMP    LOOP2
22 FIN     RPOP
23         RET
24 VALUE1  DC      10,6,10
25         END`;

const totime = ` 1 TOTIME  START
 2         RPUSH
 3         LD      GR2,=3       ; ループ回数
 4         LAD     GR3,VALUE2
 5 LOOP3   LD      GR4,0,GR3    ; GR4←割る値
 6         LD      GR5,=0
 7 LOOP4   CPA     GR0,GR4      ; GR0÷GR4
 8         JMI     NEXT
 9         ADDA    GR5,=1
10         SUBA    GR0,GR4
11         JUMP    LOOP4
12 NEXT    OR      ［b］,='0'
13         ST      ［b］,0,GR1
14         LAD     GR3,1,GR3
15         LAD     GR1,1,GR1
16         SUBA    GR2,=1
17         JNZ     LOOP3
18         OR      ［c］,='0'
19         ST      ［c］,0,GR1
20         RPOP
21         RET
22 VALUE2  DC      600,60,10
23         END`;

const average = `AVERAGE START
        RPUSH
        LD      GR2,=4
        LD      GR3,GR1
        LD      GR4,=0
LOOP5   LD      GR1,0,GR3
        CALL    TOSEC
        ［f］
        LAD     GR3,1,GR3
        SUBA    GR2,=1
        JNZ     LOOP5
        ［g］
        LD      GR0,GR4
        LAD     GR1,RESULT
        CALL    TOTIME
        OUT     RESULT,LEN4
        RPOP
        RET
LEN4    DC      4
RESULT  DS      4
        END`;

export const autumn2013Pm12 = createLanguageDefinition(12, '数字列の時間と数値の秒との変換（CASL II）', '命令実行回数を調べる秒数',
  'abcdefg', '設問1 a=イ，b=カ，c=ア／設問2 d=イ，e=ウ／設問3 f=ア，g=キ',
  'TOTIMEへ渡す秒数を変え、表示する候補・反復回数・解説を更新します。元の3本のプログラム、行番号・字下げ・注記、レジスタの復元、4人の平均と1秒未満切捨てを保持します。付属CASL II仕様は文字表を除き、必要な符号値は独立記述を参照できます。',
  index => {
    const { seconds, event } = timeConditions[index];
    const digits = [Math.floor(seconds / 600), Math.floor(seconds / 60) % 10, Math.floor((seconds % 60) / 10), seconds % 10];
    const operations = digits[0] + digits[1] + digits[2];
    const options = (index === 0 ? [3, 6, 7, 10, 19, 272, 274]
      : [3, 6, operations, 10, 19, seconds - digits[3], seconds].sort((a, b) => a - b)).map(String);
    const marks = 'アイウエオカキ';
    return {
      pages: [
        page(60, [
          p('問12　次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('〔プログラム1，2の説明〕図1のように、主プログラムから数字列として渡された100分未満の時間を数値の秒に変換する副プログラムTOSECと、その逆変換を行う副プログラムTOTIMEである。'),
          languageFigure(12, 'time-conversion', index, '図1　数字列の時間と数値の秒との変換'),
          p('m₁m₂は分、s₁s₂は秒を表す。分は0〜99、秒は0〜59の値とする。'),
          p('（1）副プログラムTOSECは、主プログラムから数字列として渡された時間を数値の秒に変換して返す。時間が格納されている領域の先頭アドレスはGR1で渡され、秒をGR0に設定する。'),
          p('（2）副プログラムTOTIMEは、主プログラムから渡された数値の秒を数字列の時間に変換して返す。秒はGR0、結果の数字列の時間を格納する領域の先頭アドレスはGR1で渡される。'),
          p('（3）副プログラムから戻るとき、汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ]),
        page(61, [p('〔プログラム1〕（行番号）'), code(tosec, 'casl2')]),
        page(62, [
          p('〔プログラム2〕（行番号）'), code(totime, 'casl2'),
          p('設問1　プログラム1，2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', ['JMI  CONT', 'JNZ  CONT', 'JUMP CONT', 'JZE  CONT'], 'イ', 'casl2'),
          bank(1, 'bc', ['GR0', 'GR1', 'GR2', 'GR3', 'GR4', 'GR5'], 'カア', 'casl2'),
        ]),
        page(63, [
          p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('プログラム1を1回呼び出したとき，行番号19のADDA命令は［d］回実行される。'),
          p('プログラム2に渡された秒が10進数で' + seconds + 'であるとき，行番号10のSUBA命令は［e］回実行される。'),
          p('設問3　1チーム4名の選手の' + event + 'のタイムの平均値を求めて出力する副プログラムAVERAGEを作成した。プログラム3中の空欄に入れる正しい答えを選べ。'),
          p('（1）主プログラムから、図2に示すデータが格納されている領域の先頭アドレスがGR1で渡される。4名の選手のタイムは図1の数字列の時間の形式で格納されている。'),
          languageFigure(12, 'runner-addresses', index, '図2　主プログラムから渡される4名の選手のデータ'),
          p('（2）平均値は図1の数字列の時間の形式で出力する。1秒未満は切り捨てる。（3）副プログラムから戻るとき、汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ], [bank(2, 'de', options, 'イ' + marks[options.indexOf(String(operations))])], [2]),
        page(64, [p('〔プログラム3〕'), code(average, 'casl2')], [
          bank(3, 'fg', ['ADDA GR4,GR0', 'LD   GR4,GR0', 'SUBA GR4,GR0', 'SLL  GR4,1', 'SLL  GR4,2', 'SRL  GR4,1', 'SRL  GR4,2'], 'アキ', 'casl2'),
        ]),
      ],
      contexts: [
        autumn2013PmReference('アセンブラ言語の仕様（文字表を除く）', caslPages),
        { title: autumn2013PmCaslCodesTitle, blocks: [
          p('この問題の時刻の数字列で使う “0”〜“9” の符号値は、16進数の #0030〜#0039 の連続値である。例えば “0” は #0030、“9” は #0039。時刻の区切りに使われることのある “:” は #003A だが、この問題の数字列に区切り文字は入れない。'),
        ] },
      ],
      explanation: 'TOSECは右シフトで乗数の下位ビットを順に取り出し、0を取り出しても残りがあれば次の桁へ進むのでaはJNZ。係数10、6、10には各2個の1ビットがあり、INCRの加算は合計6回。TOTIMEでは除数600・60・10の順に引いた回数をGR5へ数え、最後に残る1の位はGR0から書く。' + seconds + '秒のSUBA回数は' + digits.slice(0, 3).join('＋') + '＝' + operations + '回。AVERAGEは4件の秒数をGR4に加算し、非負の合計を2ビット論理右シフトして4で割るので、1秒未満が切り捨てられる。',
    };
  }, caslPages.map(autumn2013PmPageAssetId));
