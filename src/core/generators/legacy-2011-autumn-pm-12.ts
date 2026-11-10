import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { autumn2011PmPageAssetId, autumn2011PmReference } from './legacy-2011-autumn-pm-materials';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-autumn-pm-09-13-support';

export const autumn2011PmDigitReferenceTitle = '数字文字の表現（独自整理）';
export const conversionCases = [0x054D, 0x10000, 0x222B, 0x1869F];
const hex = (n: number, width: number) => n.toString(16).toUpperCase().padStart(width, '0');
const references = [71, 72, 73, 74, 75, 76];
const parameter = languageFigure(12, 'division-parameter', '表1 パラメタの受渡し方法', () => ({
  kind: 'grids', tables: [{ headers: ['方向・項目', '上位語（上位16ビット）', '下位語（下位16ビット）'], rows: [
    ['入力・被除数', 'GR1', 'GR2'], ['入力・除数', 'GR3 が指す語', '直後の語'], ['出力・商', 'GR1', 'GR2'], ['出力・剰余', 'GR4', 'GR5'],
  ] }], note: '除数は連続する2語に上位16ビット，下位16ビットの順に格納し，上位語のアドレスをGR3に設定する。',
}));
const convert = languageFigure(12, 'conversion-example', 'BTODの実行例', index => {
  const value = conversionCases[index];
  const chars = [...String(value).padStart(5, '0')].map(digit => "'" + digit + "'");
  return { kind: 'grids', tables: [
    { headers: ['入力レジスタ', '16進表記'], rows: [['GR1', hex(value >>> 16, 4)], ['GR2', hex(value & 0xFFFF, 4)]] },
    { headers: ['出力領域', '1語目', '2語目', '3語目', '4語目', '5語目'], rows: [['（GR3）→', ...chars]] },
  ] };
});
export const q12Figures = [parameter, convert];

const divStart = `DIV     START                   ; 減算を用いた32ビット除算
        PUSH    0,GR6
        PUSH    0,GR7
        LD      GR6,GR1
        LD      GR7,GR2
        LD      GR1,=#FFFF      ; 商の初期化
        LD      GR2,=#FFFF
LP      LD      GR4,GR6
        LD      GR5,GR7
        ADDL    GR2,=1          ; 商のカウントアップ
        JOV     ADJ1
        JUMP    CONT
ADJ1    ［a］
CONT    SUBL    GR6,0,GR3
        JOV     FIN
        SUBL    GR7,1,GR3
        ［b］
        JUMP    LP
ADJ2    SUBL    GR6,=1
        JOV     FIN
        JUMP    LP
FIN     POP     GR7`;
const divEnd = `        POP     GR6
        RET
        END`;
const upper = `BTOD    START
        RPUSH
        LD      GR6,GR3
        LAD     GR7,4,GR3
        LAD     GR3,UDAT        ; 除数の初期設定
LP      CALL    DIV
        OR      ［c］,='0'
        ST      ［c］,0,GR6     ; 10進数字1文字格納
        CPL     GR6,GR7
        JZE     FIN
        LAD     GR6,1,GR6
        LD      GR1,GR4         ; 被除数の再設定
        LD      GR2,GR5
        ［d］
        JUMP    LP
FIN     RPOP
        RET
UDAT    DC      0
        DC      10000
        DC      0
        DC      1000
        DC      0
        DC      100
        DC      0
        DC      10
        DC      0
        DC      1
        END`;
const lower = `BTOD    START
        RPUSH
        LAD     GR6,4,GR3
        LD      GR7,GR3
        LAD     GR3,DAT
LP      CALL    DIV
        OR      ［e］,='0'
        ST      ［e］,0,GR6
        CPL     GR6,GR7
        JZE     FIN
        LAD     GR6,-1,GR6
        JUMP    LP
FIN     RPOP
        RET
DAT     DC      0
        DC      ［f］
        END`;
export const q12 = createLanguageDefinition(12, 'CASL IIの32ビット除算と10進文字列変換', 'conversionCase', 'abcdef', 'イウイイオイ',
  '32ビットの商・剰余，上位桁／下位桁を求める処理と5語の出力形式を保持し，例示する16進入力と5桁の文字列を変える。解答は各プログラムの命令・レジスタの役割で決まる。',
  index => ({
    pages: [
      page(56, [heading('問12　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'), heading('〔プログラム1の説明〕'),
        p('除算を行う副プログラム DIV である。\n（1）DIV は表1に示すレジスタを介して，被除数と除数を受け取り，商と剰余を返す。数値は全て32ビットの符号なし整数とし，除数は0でないものとする。'),
        parameter.block(index), p('（2）副プログラム DIV から戻るとき，汎用レジスタ GR6，GR7 の内容は元に戻す。'), heading('〔プログラム1〕'), code(divStart, 'casl2')]),
      page(57, [code(divEnd, 'casl2'), p('設問1　プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        p('設問2　10進表記で0～99999の値の整数を32ビット符号なし整数として与えたとき，DIV を用いて10進数文字列に変換する副プログラム BTOD を異なるアルゴリズムで2種類作成した。プログラム2は10進表記の上位桁から求めるものであり，プログラム3は10進表記の下位桁から求めるものである。プログラム2，プログラム3中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        p('（1）BTOD は32ビット符号なし整数の上位語を GR1 に，下位語を GR2 に，変換結果を格納する領域の先頭アドレスを GR3 に設定して呼び出される。\n（2）変換後の10進数文字列は5語の領域に格納される。ただし，5桁に満たない場合は上位桁に“0”が補われる。対象数値が16進表記で ' + hex(conversionCases[index], 8) + ' の場合の実行結果を，次に示す。'),
        convert.block(index), p('（3）副プログラム BTOD から戻るとき，汎用レジスタ GR1～GR7 の内容は元に戻す。')],
        [bank(1, 'a', ['ADDL GR1,0,GR3', 'ADDL GR1,=1', 'ADDL GR2,1,GR3', 'ADDL GR2,=1', 'ADDL GR4,0,GR3', 'ADDL GR5,1,GR3'], 'イ', 'casl2'),
          bank(1, 'b', ['JMI ADJ2', 'JMI CONT', 'JOV ADJ2', 'JOV CONT', 'JPL ADJ2', 'JPL CONT'], 'ウ', 'casl2')], [1, 1]),
      page(58, [heading('〔プログラム2〕'), code(upper, 'casl2'), heading('〔プログラム3〕'), code(lower, 'casl2')]),
      page(59, [], [bank(2, 'ce', ['GR1', 'GR2', 'GR3', 'GR4', 'GR5'], 'イオ', 'casl2'),
        bank(2, 'd', ['LAD GR3,1,GR3', 'LAD GR3,2,GR3', 'LAD GR7,1,GR7', 'LAD GR7,2,GR7', 'LD GR3,1,GR3', 'LD GR3,2,GR3', 'LD GR7,1,GR7', 'LD GR7,2,GR7'], 'イ', 'casl2'),
        bank(2, 'f', ['1', '10', '100', '1000', '10000'], 'イ', 'casl2')]),
    ],
    contexts: [
      autumn2011PmReference('アセンブラ言語の仕様', references),
      { title: autumn2011PmDigitReferenceTitle, presentation: 'text_figure', blocks: [
        p('この問題で使う数字文字は，文字「0」のコード #0030 から「9」のコード #0039 まで連続する。0～9 の数値と #0030 のビットごとの論理和を取ると，対応する1文字のコードになる。'),
      ] },
    ],
    explanation: '商の下位語 GR2 の加算で桁上がりが起きたら GR1 に1を加える。被除数の下位語の減算で借りが生じると論理減算のオーバフローになるので，JOV ADJ2 で上位語から1を引く。上位桁から求める場合は商の下位語 GR2 を文字化し，残りを次に使う。除数1個は2語なので GR3 を2進める。下位桁から求める場合は10で割り，剰余の下位語 GR5 を文字にして右から格納し，商を次の被除数にする。',
  }), { fixedReferenceAssetIds: references.map(autumn2011PmPageAssetId), answerVariation: 'fixed' });
