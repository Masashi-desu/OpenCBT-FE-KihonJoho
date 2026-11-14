import { code, p, table } from './definition';
import { autumn2007PmPageAssetId, autumn2007PmReference } from './legacy-2007-autumn-pm-materials';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2007-autumn-pm-10-13-support';

const originalRows = [
  '1000101001001001', '0100101001001010', '0000101001101100', '0000101001001010',
  '0000001100011000', '0010111100101110', '0000101001001001', '0001101010001110',
  '1000001101001000', '0010001000101100', '0001011000101010', '0000101000101000',
  '1111111111111111', '0010001000001010', '0100001010101011', '1000001011001011',
].map(row => [...row].map(Number));

const alternatives = [
  { completeRows: [12], bits: [9, 3], downLeft: true, downRight: false },
  { completeRows: [3, 10], bits: [14, 8, 1], downLeft: false, downRight: true },
  { completeRows: [], bits: [12, 6, 0], downLeft: true, downRight: true },
  { completeRows: [0, 5, 14], bits: [11, 4], downLeft: false, downRight: false },
];
const bitValue = (columns: number[]) => columns.reduce((mask, bit) => mask | 1 << bit, 0);
const hex = (value: number) => '#' + value.toString(16).toUpperCase().padStart(4, '0');
export const q13Matrix = languageFigure(13, 'bit-matrix', '図 ビットの配列例', index => {
  const { completeRows, bits, downLeft, downRight } = alternatives[index];
  const shaded = (row: number, column: number) =>
    completeRows.includes(row) || bits.includes(15 - column) || downLeft && column === 15 - row || downRight && column === row;
  const shades = Array.from({ length: 16 }, (_, i) => Array.from({ length: 16 }, (_, j) => shaded(i, j)));
  const rows = index === 0 ? originalRows : shades.map((row, i) => row.map((on, j) => Number(on || (i * 5 + j * 3 + index) % 11 < 3)));
  return { kind: 'matrix', rows, shades,
    alt: '16語×16ビット。表示順はビット番号15から0。GR1は語0を指す。\n' +
      rows.map((row, i) => '語' + i + '：' + row.join('')).join('\n') + '\n網掛け：' +
      [completeRows.length ? '語' + completeRows.join('・') : '', 'ビット' + bits.join('・') + 'の列',
        downLeft ? '左下がり対角線' : '', downRight ? '右下がり対角線' : ''].filter(Boolean).join('、') + '。' };
});

const main = ` 1  BTEST  START
 2         RPUSH
 3         LD     GR0,=0
 4         LD     GR2,=#0001     ; 左下がり対角線の検査用ビット
 5         LD     GR3,=#8000     ; 右下がり対角線の検査用ビット
 6         LD     GR4,=#FFFF     ; 列の検査用ビット
 7         LD     GR5,=16        ; ループカウント
 8  LOOP1  LD     GR6,0,GR1
 9         AND    GR2,GR6       ; ⎫ GR6中で検査用ビットに
10         AND    GR3,GR6       ; ⎬ 対応するビットが0であれば
11         AND    GR4,GR6       ; ⎭ 検査用ビットを0にする。
12         CPL    GR6,=#FFFF     ; 行のビットはすべて1か？
13         ［a］
14         ADDA   GR0,=1         ; 行のカウント
15  NWORD  SUBA   GR5,=1         ; 全語処理済み？
16         ［b］
17         SLL    GR2,1          ; ⎫ 対角線の検査用ビットを
18         SRL    GR3,1          ; ⎭ 1ビットずつシフト
19         LAD    GR1,1,GR1      ; ポインタを次の語に位置付ける。
20         JUMP   LOOP1
21  CHECK  CALL   SETGR0         ; 列と対角線についてGR0に結果を設定
22         RPOP
23         RET
24         END`;
const setgr0 = `SETGR0 START
LOOP2  SLL    GR4,1      ; 列の検査用ビットのうち1であるビットを数える。
       JOV    COUNT
       ［g］
       JUMP   XCHECK
COUNT  ADDA   GR0,=1     ; 列のカウント
       JUMP   LOOP2
XCHECK ［h］            ; 対角線の検査用ビットをシフト
       ADDA   GR0,GR2
       ADDA   GR0,GR3
       RET
       END`;
const references = [56, 57, 58, 59, 60, 61];
const choicesAB = ['JMI    LOOP1', 'JNZ    CHECK', 'JNZ    NWORD', 'JPL    LOOP1', 'JZE    CHECK', 'JZE    NWORD'];
const diagonals = ['#0000', '#0001', '#8000', '#8001'];
const letter = 'アイウエ';

export const q13 = createLanguageDefinition(13, 'CASL II：全ビットが1の行・列・対角線を数える', 'ビット配列の行・列・対角線', 'abcdefgh',
  '設問1 aウ bオ・設問2 cイ dウ eア fア・設問3 gイ hエ',
  'p50〜52。16語の16ビット配列から，全て1の行，列，対角線を数える。行，列，対角線の位置と本数を変える。原図の網掛けを保持し，レジスタ4本と命令分岐を独立した参照で検算する。p58下部のJIS符号表は参照しない。',
  index => {
    const { completeRows, bits, downLeft, downRight } = alternatives[index];
    const mask = bitValue(bits);
    const absent = Array.from({ length: 16 }, (_, i) => 1 << i).filter(value => !(mask & value));
    const fOptions = index === 0 ? ['#0208', '#8208', '#82CB', '#FFFF'] :
      [mask, mask | absent.at(-1)!, mask | absent[0], 0xffff].sort((a, b) => a - b).map(hex);
    const cKey = letter[completeRows.length];
    const dKey = downLeft ? 'ウ' : 'ア';
    const eKey = downRight ? 'イ' : 'ア';
    const count = completeRows.length + bits.length + Number(downLeft) + Number(downRight);
    return {
      pages: [
        page(50, [
          p('問13 次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('〔プログラムの説明〕\n連続する16語を16×16ビットからなる2次元配列とみなし，この配列の中で，1であるビットが16個並んでいる行，列及び対角線の本数を数える副プログラムBTESTである。図の例では網掛けの部分が該当し，本数は' + count + 'である。'),
          q13Matrix.block(index),
          p('（1）語0のアドレスがGR1に設定されて，主プログラムから渡される。\n（2）本数を数えた結果はGR0に設定して，主プログラムに返す。\n（3）行番号21で呼び出される副プログラムSETGR0は，副プログラムBTESTから渡されたGR0，GR2，GR3，GR4の内容を基に，列及び対角線の本数を加えた結果をGR0に設定する。\n（4）副プログラムBTESTから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ]),
        page(51, [
          p('〔プログラム1〕\n（行番号）'), code(main, 'casl2'),
          p('設問1 プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2 配列の内容が図のとおりであった場合，行番号21のCALL命令実行直前における，次の表に示すレジスタの内容として正しい答えを，解答群の中から選べ。'),
          table('レジスタの内容', ['レジスタ', '内容'], [['GR0', '［c］'], ['GR2', '［d］'], ['GR3', '［e］'], ['GR4', '［f］']]),
        ], [{ ...bank(1, 'ab', choicesAB, 'ウオ', 'casl2'), label: '解答群' }], [2]),
        page(52, [
          p('設問3 副プログラムSETGR0を次に示す。プログラム2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('〔プログラム2〕'), code(setgr0, 'casl2'),
        ], [
          bank(2, 'c', ['#0000', '#0001', '#0002', '#0003'], cKey, 'casl2'),
          bank(2, 'de', diagonals, dKey + eKey, 'casl2'),
          bank(2, 'f', fOptions, letter[fOptions.indexOf(hex(mask))], 'casl2'),
          bank(3, 'g', ['JMI    LOOP2', 'JNZ    LOOP2', 'JPL    LOOP2', 'JZE    LOOP2'], 'イ', 'casl2'),
          bank(3, 'h', ['SLL    GR2,14', 'SLL    GR2,15', 'SRL    GR2,14', 'SRL    GR2,15'], 'エ', 'casl2'),
        ], [-1, -1, -1, 2, 2]),
      ],
      contexts: [autumn2007PmReference('アセンブラ言語の仕様（文字の符号表を除く）', references)],
      explanation: 'a：GR6が#FFFF以外なら行を数えずNWORDへ進む。b：残りの語が0でCHECKに移る。c：すべて1の行は' + completeRows.length +
        '本。d，e：対角線の1を全行で保存できた場合，最後に左下がりは最上位ビット，右下がりは最下位ビットだけが残る。' +
        'f：GR4は16語のビット論理積で' + hex(mask) + '。g：列の左シフト後，OFが立たず残りビットが0でなければ続ける。h：GR2の最上位ビットを論理右シフト15で0又は1にし，GR3と合わせて加える。',
    };
  }, { fixedReferenceAssetIds: references.map(autumn2007PmPageAssetId) });
