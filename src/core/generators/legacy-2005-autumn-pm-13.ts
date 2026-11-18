import { code, p, table } from './definition';
import { autumn2005PmPageAssetId, autumn2005PmReference } from './legacy-2005-autumn-pm-materials';
import { autumnLanguageFigure, autumnLanguageQuestion, bank, numbered, page } from './legacy-2005-autumn-pm-10-13-support';

const appendixPages = [62, 63, 64, 65, 66, 67];
const cases = [
  { word: 0x1ad6, n: 4, pattern: 0xd, groups: 64 },
  { word: 0x751c, n: 3, pattern: 0x6, groups: 32 },
  { word: 0xa583, n: 6, pattern: 0x30, groups: 48 },
  { word: 0xc525, n: 6, pattern: 0x29, groups: 80 },
] as const;

const binary = (value: number) => value.toString(2).padStart(16, '0');
const hex = (value: number) => (value & 0xffff).toString(16).toUpperCase().padStart(4, '0');

function searchExample(index: number) {
  const { word, n, pattern } = cases[index], bits = binary(word);
  const first = bits.indexOf(binary(pattern).slice(-n));
  if (first < 0) throw Error('照合例に一致箇所がありません');
  return { first, n, word, pattern,
    params: [bits, binary(n), binary(pattern)] };
}

export const bitSearchFigure = autumnLanguageFigure(13, 'comparison-example', '照合の向きとパラメタの例', index => {
  const { first, n, params } = searchExample(index);
  return { first, n, params, alt: 'ビット番号15から0の方向へ照合する。検索対象語 ' + params[0] +
    '、n ' + params[1] + '、右詰めのビットパターン ' + params[2] + '。一致部分はビット番号' +
    (15 - first) + 'から' + (16 - first - n) + 'まで。' };
});
export const seatTableFigure = autumnLanguageFigure(13, 'seat-word-layout', '指定席管理表の形式', index => {
  const { groups } = cases[index], last = 16 * groups - 1;
  return { groups, last, alt: '指定席管理表（' + groups + '語）。左から座席番号0，16，…，' + last +
    '。各語のビット番号は左から15〜0で、ビットの値1は空席、0は予約済。' };
});

const searchProgram = `BPSRH  START
       RPUSH
       LD   GR6,1,GR1
       LAD  GR7,16
       SUBA GR7,GR6   ; GR7 ← (16－n)
       LD   GR2,2,GR1
       SLL  GR2,0,GR7 ; ビットパターンを左詰めに
       LAD  GR4,-1
       [a]            ; マスクパターンの生成
       LAD  GR0,-1    ; 戻り値の初期化
       LAD  GR3,0     ; 照合位置ポインタの初期化
       LD   GR5,0,GR1
LOOP   LD   GR6,GR5   ; GR6は作業用として使用
       AND  GR6,GR4
       CPL  GR6,GR2   ; ビットパターンとの照合
       JZE  FIND
       LAD  GR3,1,GR3 ; 次の照合位置を設定
       CPA  GR3,GR7   ; 未照合部分がnビット以上あるか？
       JPL  EXIT
       [b]
       JUMP LOOP
FIND   LAD  GR0,15    ; ビット番号の算出
       SUBA GR0,GR3
EXIT   RPOP
       RET
       END`;

const reserveStart = (groups: number, width: number, offset: number) => `RESERVE START
        RPUSH
        LD   GR6,GR1     ; nの保存
        LAD  GR1,PARAM
        ST   GR6,1,GR1   ; BP1SRH呼出しパラメタ準備 (1)
        ST   GR2,TBLADD  ; 指定席管理表の開始アドレス保存
        LAD  GR4,${groups},GR2  ; 検索終了アドレスの設定
        LAD  GR0,-1      ; 戻り値の初期化
LOOP    CPL  GR2,GR4     ; 検索終了？
        JZE  EXIT
        LD   GR5,0,GR2   ; 指定席管理表から1語取出し
        ST   GR5,0,GR1   ; BP1SRH呼出しパラメタ準備 (2)
        CALL BP1SRH      ; 1語中の空席を検索
        CPA  GR0,=-1
        JNZ  FIND
        LAD  GR2,1,GR2   ; 次の語の検索へ
        JUMP LOOP
FIND    LAD  GR3,15
        SUBA GR3,GR0     ; GR3 ← (15－GR0)
        LAD  GR7,#8000
        SRA  GR7,-1,GR6
        [c]
        XOR  GR7,=#FFFF  ; GR7 ← ${'1'.repeat(offset) + '0'.repeat(width) + '1'.repeat(16 - offset - width)}（GR0＝${15 - offset}，n＝${width}の場合）`;

const reserveEnd = `        AND  GR5,GR7     ; 予約済に設定
        ST   GR5,0,GR2
        SUBL GR2,TBLADD  ; 座席番号の算出
        [d]
        ADDA GR2,GR3
        LD   GR0,GR2
EXIT    RPOP
        RET
TBLADD  DS   1
PARAM   DS   2           ; BP1SRH呼出し用パラメタ領域
        END`;

const maskOptions = [
  'SLL GR4,0,GR6', 'SLL GR4,0,GR7', 'SRA GR4,0,GR6',
  'SRA GR4,0,GR7', 'SRL GR4,0,GR6', 'SRL GR4,0,GR7',
];
const nextOptions = [
  'LD GR5,1,GR2', 'SLL GR3,1', 'SLL GR5,1', 'SRL GR3,1',
  'SRL GR5,0,GR2', 'SRL GR5,0,GR3', 'SRL GR5,1',
];
const reserveMaskOptions = [
  'AND GR5,GR3', 'AND GR5,GR7', 'OR GR5,GR3', 'OR GR5,GR7', 'SRA GR7,0,GR3', 'SRL GR7,0,GR3',
];
const seatNumberOptions = [
  'SLL GR2,1', 'SLL GR2,2', 'SLL GR2,4', 'SLL GR3,1', 'SLL GR3,2', 'SLL GR3,4',
];

export const q13 = autumnLanguageQuestion(13, 'ビットパターンの照合と指定席の予約', '検索するビットパターン・検索対象語・指定席管理表の語数', 'ab2cd', 'イウオカウ',
  '16ビットの語長、上位からの照合、失敗の−1、GR1〜GR7の復元、連続空席が語境界をまたがないことを保持する。照合対象語・照合幅・パターン・指定席管理表の語数を組で変える。4桁16進の五つの候補は、入力パターン、未シフト語、nビット左シフト語、左詰めパターン、照合成功時の語の役割を維持する。', (index, original) => {
    const { first, n, word, pattern, params } = searchExample(index);
    const { groups } = cases[index];
    const seats = 16 * groups, last = seats - 1;
    const numericOptions = [pattern, word, word << n, pattern << (16 - n), word << first].map(hex);
    return {
      contexts: [autumn2005PmReference('アセンブラ言語の仕様（CASL II・COMET II）', appendixPages)],
      pages: [
        page(57, [
          p('問13　次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('〔プログラムの説明〕\n1語の中から指定されたビットパターンを検索する副プログラムBPSRHである。'),
          p('（1）主プログラムは，パラメタ領域の先頭番地をGR1に設定して，BPSRHを呼ぶ。パラメタの形式は次のとおりである。'),
          table('BPSRHに渡すパラメタ', ['番地', '内容'], [
            ['（GR1）＋0', '検索対象語'], ['＋1', 'n：ビットパターンのビット数（1≦n≦16）'],
            ['＋2', 'ビットパターン（右詰め）'],
          ]),
          p('（2）BPSRHは，検索対象語の上位ビットからビットパターンと照合し，最初に一致した部分の最上位のビット番号をGR0に設定して主プログラムに戻る。一致した部分がない場合は，−1をGR0に設定して主プログラムに戻る。次の例では，GR0には，一致した部分の最上位のビット番号' + (15 - first) + 'が設定される。'),
          bitSearchFigure.block(index),
          p('（3）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ]),
        page(58, [
          p('〔プログラム〕\n（行番号）'), numbered('casl2', 1, searchProgram),
          p('設問1　プログラム中の［a］，［b］に入れる正しい答えを，解答群の中から選べ。'),
        ], [bank(1, 'a', maskOptions, 'イ', 'casl2'), bank(1, 'b', nextOptions, 'ウ', 'casl2')]),
        page(59, [
          p('設問2　次のパラメタが渡され，ラベルFINDに制御が移ったときの，GR5の値の16進表記として正しい答えを，解答群の中から選べ。'),
          table('設問2のパラメタ', ['番地', '値'], params.map((value, i) => [i === 0 ? '（GR1）＋0' : '＋' + i, value])),
        ], [{ ...bank(2, '2', numericOptions, 'オ'), ownLabel: '解答群' }]),
        page(59, [
          p('設問3　1の連続するビットパターンに特化した検索を行う副プログラムBP1SRHを使用して，映画館の指定席を予約する副プログラムRESERVEを作成した。RESERVE中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('（1）映画館の指定席は' + String(seats).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '席あり，座席番号は0〜' + last + 'である。また，指定席は座席番号順に16席ごとにグループ化されている。指定席管理表は連続する' + groups + '語からなり，先頭の語のビット番号15が座席番号0の状態を，末尾の語のビット番号0が座席番号' + last + 'の状態を表す。指定席管理表の対応するビットが1のとき空席，0のとき予約済を表す。'),
          seatTableFigure.block(index),
          p('（2）主プログラムは，予約すべき席数n（1≦n≦16）をGR1に，指定席管理表の開始アドレスをGR2に設定して，RESERVEを呼ぶ。'),
          ...(original ? [p('（3）RESERVEは，指定された数の席を連続して，かつグループをまたがらないで確')] : []),
        ]),
        page(60, [
          p((original ? '保する。' : '（3）RESERVEは，指定された数の席を連続して，かつグループをまたがらないで確保する。') + '座席番号0から順に空席を探し，見つかれば “予約済” の状態にして，確保された一番若い番号の座席番号をGR0に設定し，主プログラムに戻る。確保できなければ，−1をGR0に設定して主プログラムに戻る。'),
          p('（4）RESERVEから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('（5）BP1SRHに与えるパラメタは，次の形式とする。'),
          table('BP1SRHに渡すパラメタ', ['番地', '内容'], [
            ['（GR1）＋0', '検索対象語'], ['＋1', 'n：連続する1のビットの個数（1≦n≦16）'],
          ]),
          p('BP1SRHは，BPSRHの行番号6〜9を次の三つの命令で置き換えたプログラムである。'),
          code('LAD  GR2,#8000\nSRA  GR2,-1,GR6\nLD   GR4,GR2', 'casl2'),
          p('〔プログラム〕'), code(reserveStart(groups, n, first), 'casl2'),
        ]),
        page(61, [code(reserveEnd, 'casl2')], [
          bank(3, 'c', reserveMaskOptions, 'カ', 'casl2'), bank(3, 'd', seatNumberOptions, 'ウ', 'casl2'),
        ]),
      ],
      explanation: 'GR4を16−nだけ論理左シフトすると上位nビットだけが1になる。GR5を1ビットずつ左シフトして比較すると，例では' +
        first + '回のシフト後に最初の一致が見つかり，GR5は16進で' + hex(word << first) + '，GR0は' + (15 - first) +
        'になる。予約時は上位nビットの連続した1をGR3だけ論理右シフトし，反転してからGR5との論理積で該当席だけを0にする。管理表は' +
        groups + '語×16席なので，座席番号は語の添字を4ビット左シフトした値に語内の位置GR3を足す。',
    };
  }, { fixedReferenceAssetIds: appendixPages.map(autumn2005PmPageAssetId) });
