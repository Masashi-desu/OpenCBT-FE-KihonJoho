import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-autumn-pm-09-13-support';
import { autumn2009PmPageAssetId, autumn2009PmReference } from './legacy-2009-autumn-pm-materials';

const pagesForCasl = [66, 67, 68, 69, 70, 71];
const cases = [
  { position: 55, width: 12, bits: '101100011101' },
  { position: 37, width: 13, bits: '1101011100101' },
  { position: 59, width: 10, bits: '1011000110' },
  { position: 25, width: 14, bits: '10011101101101' },
];
const countOptions = [1, 5, 7, 9, 11, 15];
const kana = 'アイウエオカ';
const wordText = (word: number) => (word & 0xffff).toString(2).padStart(16, '0');
const replacement = languageFigure(12, 'replacement-span', '図1 置換えの概要',
  () => ({ kind: 'bits', diagram: 'replacement' }));
const register = languageFigure(12, 'packed-register', '図2 ビット列BとGR0の関係',
  () => ({ kind: 'bits', diagram: 'register' }));
export const q12Figures = [replacement, register];

const program = ` 1  REPLACE START
 2          RPUSH
 3          LD     GR4,GR2      ; GR4←p
 4          SRL    GR4,4        ; GR4←p/16
 5          ADDA   GR1,GR4      ; GR1を置換え対象語（第i語）に位置付ける。
 6          AND    GR2,=#000F
 7          LD     GR4,=16
 8          SUBA   GR4,GR2
 9          LD     GR5,GR0
10          LD     GR6,=#8000
11          SUBA   GR3,=1
12          SRA    GR6,0,GR3
13          LD     GR7,GR6
14          SRL    GR0,0,GR2
15          SRL    GR6,0,GR2
16          SLL    GR5,0,GR4
17          SLL    GR7,0,GR4
18          LD     GR2,0,GR1
19          ［e］  GR6,GR2      ; ⎫ 第i語のうち
20          ［f］  GR2,GR6      ; ⎭ ビット列Bを入れる部分を0にする。
21          OR     GR2,GR0
22          ST     GR2,0,GR1
23          LD     GR2,1,GR1
24          ［e］  GR7,GR2      ; ⎫ 第（i＋1）語のうち
25          ［f］  GR2,GR7      ; ⎭ ビット列Bを入れる部分を0にする。
26          OR     GR2,GR5
27          ST     GR2,1,GR1
28          RPOP
29          RET
30          END`;

export const q12 = createLanguageDefinition(12, 'CASL II：語境界をまたぐビット列の置換え',
  '置換え位置・長さ・ビット列B', 'abcdef', '設問1 aウ bエ cイ dウ／設問2 eイ fキ（順不同）',
  '16ビット語・左詰め・行番号1〜30とプログラムのコメントの対応・6欄を維持する。p，q，GR0を変え，GR2／GR4と二つの語へ配分するビットの追跡を変える。e／fは別欄の順不同。文字表は使わない。',
  (index, original) => {
    const { position, width, bits } = cases[index];
    const offset = position % 16, firstCapacity = 16 - offset;
    const input = bits.padEnd(16, '0');
    const originalWord = Number.parseInt(input, 2);
    const words = [
      originalWord >>> firstCapacity,
      originalWord >>> offset,
      originalWord << firstCapacity,
      originalWord << offset,
    ].map(wordText);
    const countKeys = kana[countOptions.indexOf(offset)] + kana[countOptions.indexOf(firstCapacity)];
    return {
      unordered: 'ef',
      pages: [
        page(56, [
          p('問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('連続したn語を16×nビットのビット列とみなし，ビット列Aとする。ビット列Aの（p＋1）ビット目からのqビットを，別のqビットのビット列Bで置き換える副プログラムREPLACEである。置換えの概要を図1に示す。'),
          p('ここで，p≧0，1≦q≦16，p＋q≦16×nとする。' +
            (original ? '' : '副プログラムから参照する語は読み書き可能な領域に置く。ビット列Aの直後の1語もアクセスできるものとする。')),
          replacement.block(index),
          p('（1）ビット列Aの先頭アドレスは，GR1に設定されて主プログラムから渡される。'),
          p('（2）ビット列BはGR0に左詰めで設定され，GR0の残りの部分は0で埋められて主プログラムから渡される。ビット列BとGR0の関係を図2に示す。'),
          register.block(index),
          p('（3）値pはGR2に，値qはGR3に設定されて主プログラムから渡される。'),
          p('（4）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        ]),
        page(57, [p('〔プログラム〕（行番号）'), code(program, 'casl2')]),
        page(58, [
          p('設問1 次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('主プログラムから渡されたp，qの値及びGR0の内容は，次のとおりであった。'),
          code(`p：   ${position}\nq：   ${width}\nGR0： ${input}`, 'text'),
          p('行番号8のSUBAの実行直後におけるGR2の値は［a］であり，GR4の値は［b］である。'),
          p('行番号17のSLLの実行直後におけるGR0の内容は［c］であり，GR5の内容は［d］である。'),
          p('設問2 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'ab', countOptions.map(String), countKeys),
          bank(1, 'cd', words, 'イウ', 'casl2'),
          { ...bank(2, 'ef', ['ADDL', 'AND', 'LD', 'OR', 'SLL', 'SRL', 'XOR'], 'イキ', 'casl2'), label: '解答群' },
        ], [4, 4, 5]),
      ],
      contexts: [autumn2009PmReference('アセンブラ言語の仕様', pagesForCasl)],
      explanation: `a：p＝${position}の下位4ビットを取ると，語内で先行する${offset}ビットになる。b：その語に残るビット数は16−${offset}＝${firstCapacity}。c：GR0を${offset}ビット論理右シフトして${words[1]}。d：元のGR0をGR5に退避してから${firstCapacity}ビット論理左シフトして${words[2]}。e・f：マスクMと元の語Wについて，(M AND W) XOR W又は(M XOR W) AND Wを計算するとMが1の位置だけ0になる。その結果と配分したビットをORで合わせる。`
        + (original ? '原資料の条件では対象が最終語で収まる場合もあるが，掲載プログラムはその場合も行23・27で次の語にアクセスする。' : ''),
    };
  }, { fixedReferenceAssetIds: pagesForCasl.map(autumn2009PmPageAssetId) });
