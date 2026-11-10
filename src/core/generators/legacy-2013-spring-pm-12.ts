import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2013-spring-pm-09-13-support';
import { languageFigure } from './legacy-2013-spring-pm-09-13-figures';
import { bitCases, brepOperands, hexWord } from './legacy-2013-spring-pm-09-13-models';
import { spring2013PmPageAssetId, spring2013PmReference } from './legacy-2013-spring-pm-materials';

const pages = [73, 74, 75, 76, 77, 78];
const references = spring2013PmReference('IPA公式 COMET II・CASL IIの仕様', pages);
const literals = [0x0001, 0x000f, 0x7fff, 0x8000, 0xf000, 0xffff].map(value => '=' + hexWord(value));

const first = [
  ' 1  BREP    START',
  ' 2          RPUSH',
  ' 3          LD      GR4,GR0',
  ' 4          LD      GR5,GR0',
  ' 5          LD      GR6,[a]        ; MASK パターン生成の準備',
  ' 6          LAD     GR3,-1,GR3',
  ' 7          SRA     GR6,0,GR3      ; GR6 ← q ビットの MASK パターン生成',
  ' 8          LD      GR7,GR6',
  ' 9          LD      GR3,=16',
  '10          SUBA    GR3,GR2        ; GR3 ← 16 − p',
  '11          SRL     GR4,0,GR2      ; 1 語目用置換文字列の準備',
  '12          SLL     GR5,0,GR3      ; 2 語目用置換文字列の準備',
  '13          SRL     GR6,0,GR2      ; 1 語目用 MASK パターン生成',
  '14          SLL     GR7,0,GR3      ; 2 語目用 MASK パターン生成',
  '15          LD      GR2,0,GR1       ; 1 語目の処理',
  '16          XOR     GR6,=#FFFF',
  '17          AND     GR2,GR6',
  '18          [b]     GR2,GR4',
  '19          ST      GR2,0,GR1',
  '20          LD      GR2,1,GR1       ; 2 語目の処理',
  '21          XOR     GR7,=#FFFF',
  '22          AND     GR2,GR7',
  '23          [b]     GR2,GR5',
  '24          ST      GR2,1,GR1',
  '25          RPOP',
  '26          RET',
  '27          END',
].join('\n');
const second = [
  'XBREP   START',
  '        RPUSH',
  '        LD      GR7,GR2',
  '        [e]',
  '        ADDL    GR1,GR7',
  '        AND     GR2,[f]',
  '        CALL    BREP',
  '        RPOP',
  '        RET',
  '        END',
].join('\n');

export const q12 = createLanguageDefinition(12, '連続語の部分ビット列を置き換えるBREPとXBREP', 'ビット位置・置換幅・置換ビット列', 'abcd3ef', 'エウイウアカイ',
  'p，qとGR0の値を変え，CASL IIのビット演算と独立したビット列の切り貼りで，語境界を含む全ての位置と幅を照合する。', index => {
    const { offset, width, replacement, options } = bitCases[index];
    const { replacements: [gr4], masks: [gr6] } = brepOperands(offset, width, replacement);
    const keys = [gr4, gr6].map(value => 'アイウエオカキク'[(options as readonly number[]).indexOf(value)]).join('');
    return {
      pages: [
        page(58, [
          p('問12　次のアセンブラプログラムの説明及びプログラムを読んで，設問1～4に答えよ。'),
          p('〔プログラム1の説明〕\n連続する2語から成るビット列αについて，左端のビット位置を0としたとき，ビット位置pから始まるqビットを，別のビット列βで置き換える副プログラムBREPである。ここで，0≦p＜16，1≦q≦16とする。置換えの概要を図1に示す。'),
          languageFigure(12, 'bit-replacement', index, '図1 置換えの概要'),
          p('（1）ビット列αの先頭アドレスはGR1に，pはGR2に，qはGR3に，それぞれ設定されて主プログラムから渡される。\n（2）ビット列βはGR0に左詰めで設定され，GR0の残りの部分は0で埋められて主プログラムから渡される。\n（3）副プログラムから戻るとき，汎用レジスタGR1～GR7の内容は元に戻す。'),
        ]),
        page(59, [
          p('〔プログラム1〕（行番号）'), code(first, 'casl2'),
          p('設問1　プログラム1中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', literals, 'エ', 'casl2'),
          bank(1, 'b', ['AND', 'LD', 'OR', 'SUBA', 'SUBL'], 'ウ', 'casl2'),
        ]),
        page(60, [
          p('設問2　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。\n主プログラムから渡されたp，qの値及びビット列βが，次のとおりであった。'),
          code('p（GR2）：' + offset + '\nq（GR3）：' + width + '\nβ（GR0）：' + hexWord(replacement), 'text'),
          p('このとき，プログラム1の行番号14のSLL命令を実行した直後におけるGR4の内容は［c］であり，GR6の内容は［d］である。'),
          p('設問3　プログラム1の行番号16，17を，同じ効果をもつ次の命令で置き換えた。［　］に入れる正しい答えを，解答群の中から選べ。'),
          code('16          [　]    GR6,GR2\n17          XOR     GR2,GR6', 'casl2'),
        ], [
          bank(2, 'cd', options.map(hexWord), keys, 'casl2'),
          bank(3, '3', ['AND', 'LD', 'OR', 'SUBA', 'SUBL', 'XOR'], 'ア', 'casl2'),
        ], [2, 4]),
        page(61, [
          p('設問4　ビット列αを連続するn語（n＞1）から成るビット列とした場合に同様の置換えを行う副プログラムXBREPを，BREPを使用して作成した。ここで，0≦p＜16×（n−1），1≦q≦16とし，それ以外の仕様はBREPと同じとする。プログラム2中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('〔プログラム2〕'), code(second, 'casl2'),
        ], [
          bank(4, 'e', ['SLL GR2,4', 'SLL GR3,4', 'SLL GR7,4', 'SRL GR2,4', 'SRL GR3,4', 'SRL GR7,4'], 'カ', 'casl2'),
          bank(4, 'f', literals, 'イ', 'casl2'),
        ]),
      ],
      contexts: [references],
      explanation: '最上位だけが1の#8000をq−1だけ算術右シフトして，左からqビットが1のマスクを作る。pビット右シフトした1語目の置換用データは' + hexWord(gr4) + '，マスクは' + hexWord(gr6) + '。元のデータと反転マスクのANDで置換箇所を消し，ORで新しいビットを重ねる。元のデータとマスクのANDを元のデータへXORしても，同じ箇所を0にできる。XBREPではGR7を論理右シフト4ビットして語の位置を求め，pの下位4ビットをANDで取り出して語内の位置を求める。',
    };
  }, pages.map(spring2013PmPageAssetId));
