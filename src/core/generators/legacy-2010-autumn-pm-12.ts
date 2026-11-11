import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2010-autumn-pm-09-13-support';
import { autumn2010PmReference, autumn2010PmPageAssetId } from './legacy-2010-autumn-pm-materials';

const examples = [
  { word: 0xB3D1, words: [0xB3D1, 0x5605, 0x1401, 0x2941, 0xE621, 0x8961], start: 4, length: 9 },
  { word: 0x96A2, words: [0x96A2, 0x23E7, 0xC001, 0x012C, 0x7AFE], start: 0, length: 5 },
  { word: 0x65EC, words: [0x65EC, 0xC706, 0xC321, 0x1901], start: 5, length: 11 },
  { word: 0x87B5, words: [0x87B5, 0x09A0, 0xED01, 0x38F3, 0x2250, 0x0931], start: 3, length: 7 },
] as const;

const bits = (word: number) => word.toString(2).padStart(16, '0');
const reversed = (word: string) => [...word].reverse().join('');
const nibbles = (word: string) => word.match(/.{4}/g)!.join(' ');

const reverseWord = languageFigure(12, 'reverse-word', '図1 ビットの並びを逆転する例', index => {
  const word = bits(examples[index].word);
  return { kind: 'reversal', before: [nibbles(word)], after: [nibbles(reversed(word))] };
});

const reverseWords = languageFigure(12, 'reverse-words', '図2 n語のビット列のビットの並びを逆転', index => {
  if (index === 0) return { kind: 'reversal', labels: ['第1語', '第2語', '第3語', '…', '', '第n語'],
    before: ['1011 …', '0101 …', '', '…', '', '… 0001'], after: ['1000 …', '', '…', '', '… 1010', '… 1101'] };
  const words = examples[index].words.map(bits);
  const flip = [...words].reverse().map(reversed);
  const labels = words.map((_, i) => '第' + (i + 1) + '語');
  return { kind: 'reversal', labels,
    before: words.map((word, i) => i < 2 ? word.slice(0, 4) + ' …' : i === words.length - 1 ? '… ' + word.slice(-4) : ''),
    after: flip.map((word, i) => i === 0 ? word.slice(0, 4) + ' …' : i >= words.length - 2 ? '… ' + word.slice(-4) : '') };
});

const reversePart = languageFigure(12, 'reverse-part', '図3 部分ビット列αのビットの並びを逆転', index => {
  const { word, start, length } = examples[index];
  if (index === 0) return { kind: 'reversal', before: ['', 'α', ''], after: ['', '', ''], scope: [start, length] };
  const binary = bits(word);
  const before = [binary.slice(0, start), binary.slice(start, start + length), binary.slice(start + length)];
  return { kind: 'reversal', before, after: [before[0], reversed(before[1]), before[2]], scope: [start, length], segmented: true };
});
export const autumn2010Pm12Figures = [reverseWord, reverseWords, reversePart];

const program1 = `REVRS    START
         RPUSH
         LD    GR4,=0          ; 結果のビット列を初期化
         LAD   GR2,15          ; ループカウンタ
         LD    GR3,0,GR1       ; GR3 ← ビット列
LOOP     SLL   GR4,1           ; 結果のビット列を左シフト
         SRL   GR3,1           ; 元のビット列を右シフト
         ［a］
         JZE   FIN1            ; 元のビット列の残りのビットはすべてゼロ
         JUMP  OFF
ON       OR    GR4,=#0001
OFF      SUBA  GR2,=1
         JMI   FIN2            ; 16ビット処理済み
         JUMP  LOOP
FIN1     ［b］                  ; 結果のビット列を残りのビット数だけシフト
FIN2     ST    GR4,0,GR1
         RPOP
         RET
         END`;
const program2 = `LREVRS   START
         RPUSH
         LD    GR3,GR1
         LD    GR4,GR2
         SUBA  GR4,=1
         JZE   LOOP2
         ADDA  GR4,GR1
LOOP1    LD    GR5,0,GR3       ; ⎫
         LD    GR6,0,GR4       ; ⎬ GR3が指す語とGR4が指す語の内容を
         ST    GR5,0,GR4       ; ⎪ 入れ替える
         ST    GR6,0,GR3       ; ⎭
         LAD   GR3,1,GR3       ; GR3を次の語に位置付ける
         LAD   GR4,-1,GR4      ; GR4を一つ前の語に位置付ける
         CPA   GR3,GR4
         ［c］
LOOP2    CALL  REVRS
         LAD   GR1,1,GR1
         SUBA  GR2,=1
         ［d］
FIN3     RPOP
         RET
         END`;
const program3 = `PREVRS   START
         RPUSH
         LD    GR4,0,GR1       ; ビット列を保存
         CALL  REVRS           ; ビット列のビットの並びを逆転
         LD    GR5,0,GR1       ; GR5 ← 逆転したビット列
         LD    GR6,=16
         SUBA  GR6,GR3         ; GR6 ← 16-q
         SRL   GR5,0,GR2       ; 逆転した部分ビット列αを右端に移動
         ［e］                  ; 逆転した部分ビット列αを左端に移動
         SRL   GR5,0,GR2       ; 逆転した部分ビット列αをpビット右に移動
         LD    GR6,=#8000
         SRA   GR6,-1,GR3      ; qビット連続した1の並びを作成
         SRL   GR6,0,GR2
         XOR   GR6,=#FFFF
         AND   GR6,GR4         ; 元のビット列中の部分ビット列αにゼロを設定
         ［f］
         ST    GR6,0,GR1
         RPOP
         RET
         END`;

const caslPages = [75, 76, 77, 78, 79, 80];
export const q12 = createLanguageDefinition(12, 'CASL II：語・部分列のビット反転', '1語・連続語・部分ビット列の例', 'abcdef',
  '設問1 a=ウ、b=イ／設問2 c=ア、d=ウ／設問3 e=ウ、f=ア',
  '原59〜62頁・6欄18固有択28参照。1語16ビット、n≥1、p≥0、q>1、p+q≤16、結果は元領域、GR1〜GR7退避・復元、原3図と全コードの字下げ・注記を保持。図で示す1語・連続語・部分列のビット例を変え、同じ命令の一般アルゴリズムを問うため正答命令は固定。付録の文字コード表はビット反転・比較・シフト・レジスタ操作に使わない。前後ビット列と命令の全候補は独立のビット添字、レジスタ・FR・メモリの状態で検算。',
  index => ({
    pages: [
      page(59, [p('次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
        p('〔プログラムの説明〕\n16ビット（1語）からなるビット列のビットの並びを，図1に示すように逆転する副プログラムREVRSである。'),
        reverseWord.block(index),
        p('（1）ビット列を格納している語のアドレスはGR1に設定されて，主プログラムから渡される。\n（2）結果は元の領域に格納して，主プログラムに返す。\n（3）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        p('〔プログラム1〕'), code(program1, 'casl2')]),
      page(60, [p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('設問2　連続したn語（n≧1）を16×nビットのビット列とみなす。副プログラムREVRSを利用して，このビット列のビットの並びを，図2に示すように逆転する副プログラムLREVRSを作成した。'),
        reverseWords.block(index),
        p('主プログラムから渡されるレジスタの内容は，次のとおりとする。'),
        code('GR1：ビット列が格納されている領域の先頭アドレス\nGR2：n', 'casl2'),
        p('副プログラムLREVRS中の［　］に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['JMI   ON', 'JNZ   ON', 'JOV   ON', 'JPL   ON'], 'ウ', 'casl2'),
          bank(1, 'b', ['SLL   GR4,-1,GR2', 'SLL   GR4,0,GR2', 'SRL   GR4,-1,GR2', 'SRL   GR4,0,GR2'], 'イ', 'casl2'),
        ], [0, 0]),
      page(61, [p('〔プログラム2〕'), code(program2, 'casl2'),
        p('設問3　副プログラムREVRSを使用して，16ビット（1語）からなるビット列中の部分ビット列αのビットの並びを，図3に示すように逆転する副プログラムPREVRSを作成した。p，qは，それぞれ部分ビット列の直前までのビット数及び部分ビット列のビット数を表す。\nここで，p≧0，q＞1，p＋q≦16とする。'),
        reversePart.block(index)], [
          bank(2, 'cd', ['JMI   LOOP1', 'JNZ   LOOP1', 'JNZ   LOOP2', 'JPL   LOOP1', 'JZE   FIN3', 'JZE   LOOP2'], 'アウ', 'casl2'),
        ], [1]),
      page(62, [p('主プログラムから渡されるレジスタの内容は，次のとおりとする。'),
        code('GR1：ビット列が格納されている語のアドレス\nGR2：p\nGR3：q', 'casl2'),
        p('副プログラムPREVRS中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('〔プログラム3〕'), code(program3, 'casl2')], [
          bank(3, 'ef', ['OR    GR6,GR5', 'OR    GR6,0,GR1', 'SLL   GR5,0,GR6', 'SLL   GR5,0,GR3'], 'ウア', 'casl2'),
        ]),
    ],
    contexts: [autumn2010PmReference('アセンブラ言語の仕様', caslPages)],
    explanation: `REVRSは右端のビットを一つずつ取り出す。SRLが右端から押し出したビットをOFに記録するので，aはJOV ON。残りがゼロなら，GR2の個数のゼロを左シフトによって末尾に補うため，bはSLL GR4,0,GR2。図1の${nibbles(bits(examples[index].word))}は${nibbles(reversed(bits(examples[index].word)))}になる。LREVRSは両端を交換して二つのアドレスが交差するまで進め，次にすべての語にREVRSをかける。cはGR3＜GR4を判定するJMI LOOP1，dは残り語数がゼロでないときのJNZ LOOP2。PREVRSは全語の反転結果をpビット右へずらして，αの反転を下位qビットに置く。eのSLL GR5,0,GR6が16−qビット左に動かす。pビット右へ戻し，元のαだけをゼロにしたGR6とfのOR GR6,GR5で合成する。文字コードの変換はない。`,
  }), { fixedReferenceAssetIds: caslPages.map(autumn2010PmPageAssetId), answerVariation: 'fixed' });
