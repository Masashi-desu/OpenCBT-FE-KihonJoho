import { code, p } from './definition';
import { spring2007PmPageAssetId, spring2007PmReference } from './legacy-2007-spring-pm-materials';
import { bank, createLanguageDefinition, languageFigure, page, standaloneBank } from './legacy-2007-spring-pm-10-13-support';

const conditions = [
  { count: 80, width: 2, input: 'C800', example: 'C86E' },
  { count: 64, width: 4, input: 'E400', example: 'B490' },
  { count: 96, width: 8, input: '8200', example: '98E0' },
  { count: 48, width: 1, input: 'F980', example: 'F998' },
];
const bits = (hex: string) => [...parseInt(hex, 16).toString(2).padStart(16, '0')].map(Number);
const references = [55, 56, 57, 58, 59, 60];
export const q13Bitmap = languageFigure(13, 'memory-map', '管理領域のビットと要素領域の対応', index => {
  const { count, width, example } = conditions[index];
  const set = bits(example);
  return { kind: 'bitmap', count, width, bits: set,
    alt: '管理領域の先頭16ビット：' + set.join(' ') + '。要素領域は要素0〜' + (count - 1) + '。1要素は' + width +
      '語で，管理ビットが1なら使用中，0なら未使用。先頭3本の矢印はビット0・1・2と要素0・1・2を対応付ける。' };
});
const elOffset = (command: string, width: number) => width === 1 ? '        NOP' : '        ' + command + '    GR2,' + Math.log2(width);
const first = (width: number) => `MPMGR   START
        RPUSH
        LD     GR1,LTBL,GR1
        ［a］              ; 指定された処理への分岐
; 初期化
MINI    LAD    GR3,0
        LD     GR0,GR3
LP      ST     GR0,MFRG,GR3
        LAD    GR3,1,GR3
        CPA    GR3,MFSZ
        JNZ    LP
        JUMP   FIN
; 要素の割当て
MSER    LAD    GR2,0
        LD     GR0,=-1    ; 戻り値の初期設定
LP1     LD     GR7,MFRG,GR2 ; 管理領域から1語取出し
        LAD    GR3,-1      ; 1語内ビット位置カウンタ初期値
LP2     LAD    GR3,1,GR3
        CPA    GR3,=16     ; 1語分のチェック終了か？
        JZE    CONT
        SLL    GR7,1
        ［b］
        JUMP   FIND
CONT    LAD    GR2,1,GR2
        CPA    GR2,MFSZ    ; 管理領域全体のチェック完了か？
        JZE    FIN
        JUMP   LP1
FIND    LD     GR1,=#8000  ; マスクパターンの生成
        SRL    GR1,0,GR3
        LD     GR7,MFRG,GR2 ; 対象ビットを含む語の取出し
        ［c］
        ST     GR7,MFRG,GR2
        SLL    GR2,4
        ADDL   GR2,GR3      ; 管理領域先頭から通しのビット位置
${elOffset('SLL', width)}        ; 要素領域先頭からの差分
        LAD    GR0,MPDT,GR2
        JUMP   FIN`;
const second = (count: number, width: number) => `; 要素の返却
MREL    LD     GR2,GR0     ; GR2 ← 返却対象アドレス
        LAD    GR7,MPDT
        SUBL   GR2,GR7     ; 要素領域先頭からの差分
${elOffset('SRL', width)}        ; 先頭から通しの要素位置
        LD     GR4,GR2     ; 管理領域先頭から通しのビット位置
        AND    GR4,=#000F  ; 1語内でのビット位置
        LD     GR1,=#8000  ; マスクパターンの生成
        SRL    GR1,0,GR4   ; 例：GR4＝2の場合，GR1 ← 0010000000000000
        ［d］
        SRL    GR2,4       ; 対象ビットを含む語を指すための差分
        LD     GR7,MFRG,GR2
        AND    GR7,GR1     ; 対象ビットを未使用に設定
        ST     GR7,MFRG,GR2
FIN     RPOP
        RET
MFSZ    DC     ${count / 16}         ; 管理領域の大きさ
MFRG    DS     ${count / 16}         ; 管理領域
MPDT    DS     ${count * width}       ; 要素領域
LTBL    DC     MINI      ; 分岐ラベル表
        DC     MSER
        DC     MREL
        END`;
const kana = 'アイウエオカ';

export const q13 = createLanguageDefinition(13, 'CASL II：メモリプールのビット管理', '管理語数・要素の幅・先頭管理語', 'abcd2',
  '設問1 aエ bカ cイ dカ・設問2 ウ',
  'p48〜51。ビットマップによる初期化・割当て・返却、ラベル表とビットマスクを保持。管理語数・1要素の語数・管理語の入力を連動し、全候補と先頭/末尾/枯渇/返却の境界を独立に検算。p57のJIS文字符号表は不要。',
  index => {
    const { count, width, input } = conditions[index];
    const position = bits(input).indexOf(0);
    return {
      pages: [
        page(48, [
          p('次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\nメモリプールの管理を行う副プログラムMPMGRである。MPMGRは，割当て要求に対して，要素領域中の未使用の1要素を割り当てる。また，返却要求に対して，指定された1要素を未使用の状態にする。'),
          p('（1）メモリプールは，要素領域と，それを管理する管理領域からなる。要素領域は連続する' + count + '要素からなり，各要素は連続する' + width + '語からなる。各要素には，管理領域の1ビットずつが先頭から順に対応する。管理領域のビットの値が1のとき，対応する要素領域の要素は使用中とし，管理領域のビットの値が0のとき，対応する要素領域の要素は未使用とする。'),
          q13Bitmap.block(index),
          p('（2）MPMGRは，GR1に設定された値によって，次の処理を行う。括弧内は各処理に対応するラベルである。\n0：初期化（MINI）\nすべての要素を未使用に設定する。\n1：要素の割当て（MSER）\n未使用要素を検索し，見つかればその要素の先頭アドレスをGR0に設定するとともに，その要素を使用中に設定する。未使用要素がなければ，GR0に−1を設定する。\n2：要素の返却（MREL）\nGR0に設定されたアドレスに対応する要素を未使用に設定する。\n（3）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ]),
        page(49, [p('〔プログラム〕'), code(first(width), 'casl2')]),
        page(50, [code(second(count, width), 'casl2'), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['CALL   0,GR1', 'CALL   1,GR1', 'CALL   LTBL,GR1', 'JUMP   0,GR1', 'JUMP   1,GR1', 'JUMP   LTBL,GR1'], 'エ', 'casl2'),
          bank(1, 'b', ['JMI    LP1', 'JMI    LP2', 'JNZ    LP1', 'JNZ    LP2', 'JOV    LP1', 'JOV    LP2'], 'カ', 'casl2'),
          bank(1, 'c', ['AND    GR7,GR1', 'OR     GR7,GR1', 'SLL    GR7,0,GR1', 'SLL    GR7,0,GR3', 'SRL    GR7,0,GR1', 'SRL    GR7,0,GR3'], 'イ', 'casl2'),
          bank(1, 'd', ['AND    GR1,=#8000', 'AND    GR1,=#FFFF', 'OR     GR1,=#8000', 'OR     GR1,=#FFFF', 'XOR    GR1,=#8000', 'XOR    GR1,=#FFFF'], 'カ', 'casl2'),
        ]),
        page(51, [
          p('設問2 管理領域の最初の語の値が#' + input + 'のとき，GR1に1を設定してMPMGRを呼び出した。'),
          p('ラベルFINDに制御が移ったときのGR3の内容として，正しい答えを解答群の中から選べ。'),
        ], [standaloneBank(2, ['0', '1', '2', '3', '4', '5'], kana[position])]),
      ],
      contexts: [spring2007PmReference('アセンブラ言語の仕様（文字の符号表を除く）', references)],
      explanation: 'a：分岐表から取り出したラベルのアドレスへJUMPする。b：SLLで押し出されたビットはOFに入る。1なら使用中なのでJOVで次を調べる。' +
        'c：ORで対象ビットだけを1にする。d：XORでマスクを反転し，ANDで対象ビットだけを0にする。設問2：#' + input + 'の上位から最初に0となるのは' +
        (position + 1) + '番目のビットである。GR3は−1に初期化した後，各ビットの検査前に1を加えるため，FIND到達時は' + position + 'となる。',
    };
  }, { fixedReferenceAssetIds: references.map(spring2007PmPageAssetId) });
