import { code, p } from './definition';
import { draw } from './legacy-2005-autumn-pm-06-09-figures';
import { bank, draftQuestion, type Page } from './legacy-2005-autumn-pm-06-09-support';
import { autumn2005PmReference } from './legacy-2005-autumn-pm-materials';

const words = ['0555', '0003', '00B5', '035A'];
const branches = ['JMI    LOOP', 'JNZ    LOOP', 'JUMP   LOOP', 'JZE    LOOP'];
const masks = [
  'AND    GR3,=#0001', 'OR     GR3,=#0001',
  'AND    GR3,=#1000', 'OR     GR3,=#1000',
  'AND    GR3,=#FFFF', 'OR     GR3,=#FFFE',
];
const numbers = ['0', '1', '5', '6', '7', '8', '9', '10', '14', '15'];
const numericSymbols = 'アイウエオカキクケコ';

const program1 = [
  'SFT1    START',
  '        RPUSH',
  '        LD     GR2,MASK',
  '        LAD    GR0,0',
  'LOOP    LD     GR3,GR2     ← α',
  '        AND    GR3,GR1',
  '        JZE    SKIP',
  '        ADDA   GR0,=1',
  'SKIP    SRL    GR2,1',
  '        ［a］',
  '        RPOP',
  '        RET',
  'MASK    DC     #8000',
  '        END',
].join('\n');

const program2 = [
  'SFT2    START',
  '        RPUSH',
  '        LAD    GR0,0',
  'LOOP    LD     GR3,GR1     ← β',
  '        ［b］',
  '        ADDA   GR0,GR3',
  '        SRL    GR1,1',
  '        ［a］',
  '        RPOP',
  '        RET',
  '        END',
].join('\n');

export const q9 = draftQuestion(9, 'CASL II：マスクと右シフトによる1ビット数の計数',
  'プログラム1と2を比較する16ビットの対象データ', 'a=イ b=ア c=ウ d=コ e=イ',
  '原題の2プログラム、2種類の論理右シフト、GR1～GR7の復元、命令αとβの実行回数の差と等しくなる条件、および付属資料を保持。設問2の16進数を変えると、最上位の1のビット位置が変わり、cの答えが変わる。処理方法の図には設問2とは別の対象データを示す。',
  index => {
    const hex = words[index];
    const usedBits = Math.floor(Math.log2(parseInt(hex, 16))) + 1;
    const countDifference = 16 - usedBits;
    const c = numericSymbols[numbers.indexOf(String(countDifference))];
    const pages: Page[] = [
      { page: 37, blocks: [
        p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラム1の説明〕'),
        p('プログラム1（SFT1）は，マスクを右にシフトしながら1語に格納されているデータの中の1であるビットの個数を数えて，GR0に設定する副プログラムである。'),
        draw('9-shift-mask', index),
        p('（1）主プログラムは，GR1に対象データを格納して副プログラムを呼ぶ。'),
        p('（2）対象データの第15ビットから第0ビットまでを順にマスクと照合し，1の個数を数えて，GR0に設定する。'),
        p('（3）副プログラムから戻るとき，汎用レジスタ GR1～GR7 の内容は元に戻す。'),
        p('〔プログラム1〕'),
        code(program1, 'casl2'),
      ] },
      { page: 38, blocks: [
        p('〔プログラム2の説明〕'),
        p('プログラム2（SFT2）は，プログラム1と比べて，命令の実行回数が少なくなるように，対象データを右にシフトしながら常に最下位ビットをマスクと照合し，1の個数を数えて，GR0に設定する副プログラムである。'),
        draw('9-shift-data', index),
        p('〔プログラム2〕'),
        code(program2, 'casl2'),
        p('設問1　プログラム1，プログラム2中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      ], banks: [bank('a', branches, 'イ', 'casl2', 1)] },
      { page: 39, banksBeforeBlocks: [bank('b', masks, 'ア', 'casl2', 1)], blocks: [
        p('設問2　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('主プログラムがGR1に #' + hex + ' を格納して，プログラム1及びプログラム2を呼んだ場合，プログラム1の命令αの実行回数よりもプログラム2の命令βの実行回数の方が［c］回少なくなる。'),
        p('プログラム1の命令αの実行回数とプログラム2の命令βの実行回数が等しくなるのは，主プログラムがGR1に格納したデータのビット番号［d］のビットの値が［e］のときである。'),
      ], banks: [bank('cde', numbers, c + 'コイ', undefined, 2, '解答群')] },
    ];
    return {
      pages,
      explanation: 'CASL II の SRL（論理右シフト）は左端に0を補い，結果が0ならゼロフラグを1にする。' +
        'a の JNZ で1ビット以上残るときに戻る。SFT1は #8000 からマスクを移動するのでαは常に16回実行される。' +
        'SFT2は b の AND GR3,=#0001 で取り出した最下位ビットをGR0に足す。対象データをシフトし，' +
        'データが0になれば終了する。#' + hex + ' の最上位の1はビット' + (usedBits - 1) + 'にあるので，βは' +
        usedBits + '回で，αより' + countDifference + '回少ない。両方が16回になるのはビット15が1のときである。' +
        'RPUSHとRPOPにより，GR0だけに結果を返し，GR1～GR7を呼出し前の内容に戻す。',
      contexts: [autumn2005PmReference('IPA公式付属資料　アセンブラ言語の仕様', [62, 63, 64, 65, 66, 67])],
    };
  });
