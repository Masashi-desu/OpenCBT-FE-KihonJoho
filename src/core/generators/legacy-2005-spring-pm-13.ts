import { code, p } from './definition';
import { spring2005PmPageAssetId, spring2005PmReference } from './legacy-2005-spring-pm-materials';
import { bank, numbered, page, springLanguageFigure, springLanguageQuestion } from './legacy-2005-spring-pm-10-13-support';

const appendix = [61, 62, 63, 64, 65, 66];
export const digitCharacterNotesTitle = 'この設問で使う文字の比較と変換';
const characterNotes = {
  title: digitCharacterNotesTitle,
  presentation: 'text' as const,
  blocks: [
    p("数字文字の符号は '0' から '9' まで連続し、数字が大きいほど符号も大きい。例えば '3' と '0' の符号の差は3である。"),
    p("この問題で用いる '-' の符号は '0' より小さく、英大文字 'A' の符号は '9' より大きい。間隔文字は命令中の空白の文字定数と等しい。"),
  ],
};

const cases = [
  { text: ' -5 24- 9', high: 8192 },
  { text: ' -1 2-3', high: 9000 },
  { text: ' 1 234A 5', high: 9200 },
  { text: ' -  ', high: 9750 },
] as const;
const hex = (value: number) => value.toString(16).toUpperCase().padStart(4, '0');

function inspect(text: string) {
  const content = [...text].filter(character => character !== ' ');
  const sign = content[0] === '-';
  const digits = sign ? content.slice(1) : content;
  const invalid = digits.findIndex(character => !/^\d$/.test(character));
  if (invalid === -1 && digits.length !== 0) throw Error('検査対象の文字列にエラーがありません。');
  return { pointer: 1 + Number(sign) + Math.max(invalid, 0),
    line: invalid < 0 ? 37 : digits[invalid] > '9' ? 26 : 28 };
}

export const numberFormatsFigure = springLanguageFigure(13, 'digit-string-layout', '数字列の形式', () => ({
  layouts: [['N', '−', 'x', 'x', '…', 'x', 'x'], ['N', 'x', 'x', '…', 'x', 'x']],
  alt: '先頭の1語はN、その後にN文字が続く。負数の形式はN、負符号（−）、数字、数字、…、数字。符号なしの形式はN、数字、数字、…、数字。Nは文字数（N＞0）、xは数字。負数の形式では負符号をNに含める。',
}));

export const registerWordsFigure = springLanguageFigure(13, 'digit-string-argument', 'NREADから渡された数字列', index => {
  const digits = [...String(cases[index].high) + '0'];
  return { length: digits.length, digits, alt: 'GR1から順に文字数' + digits.length + '、' +
    digits.map(value => "'" + value + "'").join('、') + '。' };
});

const nread = `NREAD  START
       RPUSH
       IN   INBUF,LENG    ; 入力装置から1レコード読込み
       LD   GR2,LENG
       JZE  ERR
       JMI  ERR
       LAD  GR1,INBUF
       ADDL GR2,GR1      ; 入力データ終端アドレスの設定
       LAD  GR3,0        ; 先頭文字確認フラグの初期化
       LAD  GR5,1        ; NUMSTR領域カウンタの初期化
       LAD  GR6,0        ; 数字カウンタの初期化
LOOP   CPL  GR1,GR2      ; 入力データ終端？
       [a]
       LD   GR4,0,GR1    ; 1文字の取出し
       CPL  GR4,=' '     ; 間隔文字ならばスキップ
       JZE  NEXT
       LD   GR3,GR3      ; （間隔文字以外の）先頭文字？
       JNZ  NUMCHK
       LAD  GR3,1
       CPL  GR4,='-'
       JNZ  NUMCHK
       ST   GR4,NUMSTR,GR5 ; 文字'-'の格納
       LAD  GR5,1,GR5
       JUMP NEXT
NUMCHK CPL  GR4,='9'     ; 数字？
       JPL  ERR
       CPL  GR4,='0'
       JMI  ERR
       ST   GR4,NUMSTR,GR5
       LAD  GR5,1,GR5
       LAD  GR6,1,GR6
NEXT   LAD  GR1,1,GR1
       JUMP LOOP
ERR    LAD  GR0,-32768  ; エラー時の処理
       JUMP EXIT
CNV    LD   GR6,GR6
       JZE  ERR
       LAD  GR5,-1,GR5
       ST   GR5,NUMSTR   ; 文字数の格納
       LAD  GR1,NUMSTR
       CALL DTOB        ; DTOB呼出し
EXIT   RPOP
       RET
INBUF  DS   256         ; 入力データ領域
LENG   DS   1
NUMSTR DS   257         ; DTOB呼出しパラメタ領域
       END`;
const dtob = `DTOB   START
       RPUSH
       LD   GR2,0,GR1   ; 文字数の取出し
       ADDL GR2,GR1     ; 文字列終端アドレスの設定
       LAD  GR0,0       ; 戻り値の初期化
       LAD  GR3,0       ; 負符号フラグの初期設定
       LD   GR4,1,GR1   ; 最初の文字の取出し
       CPL  GR4,='-'
       JNZ  LOOP
       LAD  GR3,1       ; 負数であることを記憶
       LAD  GR1,1,GR1
LOOP   LAD  GR1,1,GR1
       CPL  GR1,GR2     ; 変換終了？
       JPL  FIN
       LD   GR4,0,GR1   ; 数字1文字の取出し
       SUBL GR4,='0'    ; 1文字を数値に変換
       SLL  GR0,1       ; ┐
       JMI  ERR         ; │
       LD   GR5,GR0     ; │
       SLL  GR0,1       ; │
       JMI  ERR         ; ├ GR0（上位けたまでの変換値）を10倍する
       SLL  GR0,1       ; │ 〔行番号20〜22は設問3参照〕
       JMI  ERR         ; │
       [b]              ; │
       JMI  ERR         ; ┘
       ADDL GR0,GR4
       JMI  ERR
       JUMP LOOP
ERR    LAD  GR0,-32768  ; −32767〜32767の範囲外ならエラー
       JUMP EXIT
FIN    LD   GR3,GR3     ; 負符号フラグチェック
       JZE  EXIT
       [c]
       ADDA GR0,=1
EXIT   RPOP
       RET
       END`;

const endOptions = ['JNZ NEXT', 'JNZ NUMCHK', 'JPL CNV', 'JPL EXIT', 'JZE CNV', 'JZE EXIT'];
const scaleOptions = ['ADDL GR0,GR4', 'ADDL GR0,GR5', 'ADDL GR5,GR0', 'ADDL GR5,GR4',
  'SLL GR0,1', 'SLL GR4,1', 'SLL GR4,2', 'SLL GR5,1'];
const signOptions = ['AND GR0,=#7FFF', 'AND GR0,GR3', 'OR GR0,=#8000', 'OR GR0,GR3',
  'XOR GR0,=#8000', 'XOR GR0,=#FFFF', 'XOR GR0,GR3'];

export const q13 = springLanguageQuestion(13, 'CASL IIによる10進数の検査と2進変換', '入力の文字列と最後の数字の直前までの値', 'abcdefg', 'オイカエエエウ',
  '入力前処理、文字数、符号、−32767〜32767、IN命令とGR1〜GR7復元を維持。四つの入力で、エラーを起こす文字の位置・種類、または数字の有無を変える。2ビットシフト時に途中の符号の検査を飛ばす現象が起きる値だけを選ぶ。', index => {
    const { text, high } = cases[index];
    const input = text.replaceAll(' ', '△');
    const { line, pointer } = inspect(text);
    const terminal = [5, 6, 26, 28, 37], positions = [1, 2, 4, 5, 6, 7, 8];
    const optimized = (10 * high) & 0xffff;
    return {
      contexts: [spring2005PmReference('アセンブラ言語の仕様（CASL II・COMET II）', appendix), characterNotes],
      pages: [
        page(56, [
          p('問13　次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('〔プログラムの説明〕\n10進数の読取りを行う副プログラムNREADと，NREADから呼ばれる副プログラムDTOBである。'),
          p('（1）NREADは，入力装置から1レコードを読み取り，読み込んだ文字列を2進数に変換し，結果をGR0に格納して，主プログラムに戻る。'),
          p('（2）NREADは，入力された文字列中の間隔文字を読み飛ばし，間隔文字以外について，次の条件を検査する。\n① 最初の文字は数字又は負符号（−）\n② 2番目以降の文字はすべて数字\n③ 一つ以上の数字を含む。'),
          p('条件を満たしていないとき，GR0に−32768を設定して主プログラムに戻る。条件を満たしているとき，DTOBを呼び出し，DTOBの戻り値GR0をそのままNREADの戻り値とする。'),
          p('（3）DTOBは，先頭アドレスをGR1に設定して渡された数字列を2進数に変換し，GR0に格納して呼出し元に戻る。このとき，変換結果が−32767〜32767に収まらない場合はエラーとし，GR0に−32768を設定して呼出し元に戻る。'),
          numberFormatsFigure.block(index),
          p('（4）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ]),
        page(57, [p('〔プログラム1〕\n（行番号）'), numbered('casl2', 1, nread)]),
        page(58, [p('〔プログラム2〕\n（行番号）'), numbered('casl2', 1, dtob)]),
        page(59, [p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')]),
        page(59, [], [bank(1, 'a', endOptions, 'オ', 'casl2'),
          bank(1, 'b', scaleOptions, 'イ', 'casl2'), bank(1, 'c', signOptions, 'カ', 'casl2')]),
        page(59, [
          p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('IN命令によって，文字列“' + input + '”（△は間隔文字）が入力されたとき，〔プログラム1〕のERRへは，行番号［d］の命令から制御が移る。ERRに制御が移ったときのGR5の値は［e］である。'),
        ], [bank(2, 'd', terminal.map(String), 'アイウエオ'[terminal.indexOf(line)]),
          bank(2, 'e', positions.map(String), 'アイウエオカキ'[positions.indexOf(pointer)])]),
        page(60, [
          p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('次の数字列がNREADから渡されたとき，DTOBの戻り値は16進表記で［f］である。ここで，DTOBの一部である行番号20〜22の3行を“SLL GR0,2”の1行で置き換える。同じ文字列がNREADから渡されたとき，DTOBの戻り値は16進表記で［g］となる。'),
          p('なお，いずれの場合も，〔プログラム2〕の行番号15で最後の文字‘0’を取り出したとき，GR0の値は10進表記で' + high + '（16進表記で' + hex(high) + '）となっている。'),
          registerWordsFigure.block(index),
        ], [{ ...bank(3, 'fg', ['0', hex(high), hex(optimized), '8000', 'F000'], 'エウ'), ownLabel: '解答群' }]),
      ],
      explanation: 'NREADは読取り位置が終端と等しくなったときにJZE CNVで変換へ進む。GR5は1から始まり，保存した符号・数字ごとに増える。入力“' + input +
        '”では行' + line + 'でエラーとなり，GR5は' + pointer + 'である。DTOBではシフトで求めた8倍とGR5の2倍を加え，負数のときは全ビットを反転して1を足す。最後の0を処理するとき，行20の1ビットシフトで' +
        hex(high * 4) + 'となり，符号フラグが立つため8000を返す。2ビットシフトに置き換えると途中の符号を確認できず，加算後の下位16ビット' + hex(optimized) + 'を返す。',
    };
  }, { fixedReferenceAssetIds: appendix.map(spring2005PmPageAssetId) });
