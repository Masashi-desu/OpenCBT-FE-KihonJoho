import { code, p } from './definition';
import { autumn2007PmReference } from './legacy-2007-autumn-pm-materials';
import { bank, draftQuestion } from './legacy-2007-autumn-pm-06-09-support';
import { drawing } from './legacy-2007-autumn-pm-06-09-figures';
import { parityCases } from './legacy-2007-autumn-pm-06-09-model';

const assemblyPages = [56, 57, 58, 59, 60, 61] as const;
function listing(index: number) {
  const { horizontal: h, word: w } = parityCases[index];
  return ` 1  SETPAR  START
 2          RPUSH
 3          LD    GR6,GR2
 4          ADDL  GR6,GR1
 5          LAD   GR${h},0      ; 水平パリティ初期化
 6  LP1     LD    GR1,0,GR2   ; ブロックから1語取出し
 7          LAD   GR${w},0
 8  LP2     SLL   GR1,1
 9          JZE   CONT
10          ［a］
11          XOR   GR${w},=#8000 ; パリティビット調整
12          JUMP  LP2
13  CONT    OR    GR${w},0,GR2
14          ST    GR${w},0,GR2  ; パリティビット設定
15          ［b］            ; 水平パリティ調整
16          LAD   GR2,1,GR2
17          CPL   GR2,GR6     ; ブロックの終端？
18          JNZ   LP1
19          ST    GR${h},0,GR6  ; 水平パリティ設定
20          RPOP
21          RET
22          END`;
}
export const q9 = draftQuestion(9, 'CASL II：各語の偶数パリティと水平パリティを設定する',
  'ビット配置例と二つの演算用レジスタ', '設問1 aカ bカ／設問2 ウ',
  '15ビットデータ，語内のパリティ，行末の水平パリティ，GR1〜GR7復元，偶数から奇数への変更を維持。ビット配置の例と累計・各語用のレジスタを同時に換え，表示された全候補と実行の意味を検査。文字やコード表は使用しない。',
  (index, original) => {
    const { horizontal: h, word: w } = parityCases[index];
    return {
      pages: [
        { page: 33, blocks: [
          p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('連続する' + (original ? 'N語' : 'N語（Nは正の整数）') +
            'のブロックに格納されている各語にパリティビットを設定するとともに，ブロックの直後に1語の水平パリティを設定する副プログラムSETPARである。'),
          p('(1) 各語のビット番号15（図の破線で囲まれた左端ビット）をパリティビットとして使用する。パリティビットの値は偶数パリティとし，各語のビット番号0〜14中の1であるビットの個数が奇数のときは1，偶数のときは0とする。'),
          p('水平パリティの各ビットの値も偶数パリティとし，各語の対応するビット番号中の1であるビットの個数が奇数のときは1，偶数のときは0とする。つまり，図の網掛け部分において，1であるビットの個数が偶数となるように，水平パリティ中のビットを設定する。'),
          drawing('9-parity', index),
          p('(2) 主プログラムは，ブロックの語数NをGR1に，ブロックの開始アドレスをGR2に設定し，ブロックの各語のパリティビットに0を格納して副プログラムSETPARを呼ぶ。'),
          p('(3) 副プログラムから戻るときは，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ] },
        { page: 34, blocks: [
          p('〔プログラム〕'), p('（行番号）'), code(listing(index), 'casl2'),
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], banks: [
          bank('a', ['JMI   CONT','JMI   LP2','JOV   CONT','JOV   LP2','JPL   CONT','JPL   LP2'], 'カ', 'casl2', 1),
          bank('b', ['OR    GR'+h+',0,GR6','OR    GR'+h+',GR'+w,'OR    GR'+w+',0,GR6' ,'OR    GR'+w+',GR'+h,
            'XOR   GR'+h+',0,GR6','XOR   GR'+h+',GR'+w,'XOR   GR'+w+',0,GR6','XOR   GR'+w+',GR'+h], 'カ', 'casl2', 1),
        ] },
        { page: 35, blocks: [
          p('設問2　パリティビットの値として，各語のビット番号0〜14中の1であるビットの個数が奇数のときは0を，偶数のときは1を設定するようにプログラムを変更する。'),
          p('これは，プログラム中の行番号7でGR' + w + 'に設定する値を変更すれば可能である。GR' + w + 'に設定する値として正しい答えを，解答群の中から選べ。'),
        ], banks: [bank('s', ['#0001','#7FFF','#8000','#8001','#FFFE','#FFFF'], 'ウ', 'casl2', 2, '解答群')] },
      ],
      contexts: [autumn2007PmReference('CASL IIの仕様', [...assemblyPages])],
      explanation: [
        'a：論理左シフト後に全ビットが0ならJZEで次の処理へ進む。残りがあり左端ビットが0の場合はJPLで次のシフトへ進み，左端が1のときだけXORでパリティビットを反転する。',
        'b：各語のパリティ込みの値をGR' + w + 'に得たら，水平パリティ用のGR' + h + 'へ累積XORする。異なる語の同じ桁の1が現れるたびに対応する結果ビットが反転し，奇数回で1になる。',
        '設問2：偶数パリティの結果をビット番号15だけ反転するには，最初にその位置だけを1（#8000）にする。残りの15ビットを変更せず，奇数個ならパリティ0，偶数個なら1になる。',
      ].join('\n'),
    };
  });
