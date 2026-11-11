import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, figureBank, languageFigure, page } from './legacy-2011-special-pm-09-13-support';
import { special2011PmPageAssetId, special2011PmReference } from './legacy-2011-special-pm-materials';

const originalWords = [0xfffc, 0xfffc, 0xfffc, 0x0700, 0x0700, 0x0700, 0xfffc, 0xfffc,
  0xfffc, 0x071c, 0x071c, 0x071c, 0xffff, 0xffff, 0xffff, 0x0000];
export const bitmapCases = [
  { example: 8, words: originalWords },
  { example: 6, words: [0xffe0, 0xffe0, 0xc060, 0xc060, 0xc060, 0xfffe, 0xfffe, 0x0066,
    0x0066, 0x7fe6, 0x7fe6, 0x6066, 0x607e, 0x607e, 0x6000, 0x6000] },
  { example: 10, words: [0x7fff, 0x7fff, 0x7183, 0x7183, 0x7183, 0x7f83, 0x7f83, 0x0183,
    0x01ff, 0x01ff, 0x7f80, 0x7f80, 0x7180, 0x718e, 0x7f8e, 0x7f80] },
  { example: 12, words: [0xe038, 0xe038, 0xe038, 0xfff8, 0xfff8, 0xe008, 0xe008, 0xe008,
    0xffff, 0xffff, 0x0607, 0x0607, 0x07ff, 0x07ff, 0x0607, 0x0607] },
] as const;
const pixel = (words: readonly number[], row: number, column: number) => (words[row] >>> (15 - column)) & 1;
function buildWords(read: (row: number, column: number) => number) {
  return Array.from({ length: 16 }, (_, row) =>
    Array.from({ length: 16 }, (_, column) => read(row, column) << (15 - column)).reduce((value, bit) => value | bit, 0));
}
function rotate(words: readonly number[], size: number) {
  return buildWords((row, column) => row < size && column < size
    ? pixel(words, size - 1 - column, row)
    : pixel(words, row, column));
}
function transformed(words: readonly number[], option: number) {
  switch (option) {
    case 0: return buildWords((row, col) => pixel(words, col, row));
    case 1: return buildWords((row, col) => pixel(words, col, 15 - row));
    case 2: return buildWords((row, col) => pixel(words, 15 - col, 15 - row));
    case 3: return buildWords((row, col) => pixel(words, 15 - row, 15 - col));
    default: throw Error('SOURCE_FORMAT');
  }
}
export const rotationWhole = languageFigure(12, 'rotate-example', '図1　図形の回転の実行例', index => {
  const { words } = bitmapCases[index];
  return { kind: 'bitmaps', pictures: [{ label: '回転前（GR1）', words }, { label: '回転後（GR2）', words: rotate(words, 16) }], axes: true };
});
export const rotationPart = languageFigure(12, 'partial-example', '図2　左上部分だけを回転した実行例', index => {
  const { words, example } = bitmapCases[index];
  return { kind: 'bitmaps', pictures: [{ label: '回転前（GR1）', words }, { label: '回転後（GR2）', words: rotate(words, example) }], scope: example, axes: true };
});
const rotationChoices = ['a', 'i', 'u', 'e'].map((suffix, option) =>
  languageFigure(12, 'rotation-choice-' + suffix, '図形', index => ({ kind: 'bitmaps',
    pictures: [{ label: '', words: transformed(bitmapCases[index].words, option) }] })));
export const q12Figures = [rotationWhole, ...rotationChoices, rotationPart];

const numbered = (text: string) => text.split('\n').map((line, i) => String(i + 1).padStart(2) + '  ' + line).join('\n');
export const rotationProgram1 = numbered(`ROTATE  START
        RPUSH
        LD      GR3,=16
LOOP1   LD      GR4,=16
        LD      GR5,GR2         ; GR5 ← 結果の領域のアドレス
        LD      GR6,0,GR1       ; GR6 ← 元の図形の先頭語の内容
LOOP2   LD      GR7,0,GR5       ; GR7 ← 結果の領域の1語の内容
        SRL     GR7,1
        SLL     GR6,1
        JOV     ON
        JUMP    CONT
ON      OR      GR7,=#8000
CONT    ST      GR7,0,GR5       ; 処理した1語を結果の領域に格納
        ［a］
        SUBA    GR4,=1
        JNZ     LOOP2
        ［b］
        SUBA    GR3,=1
        JNZ     LOOP1
        RPOP
        RET
        END`);
export const rotationProgram2 = `        ST      GR3,N          ; nを保存
        LD      GR4,GR3        ; GR4 ← n
        LD      GR5,GR1        ; GR5 ← 元の図形のアドレス
        LD      GR6,GR2        ; GR6 ← 結果の領域のアドレス
        LD      GR7,=16
        SUBA    GR7,GR3        ; GR7 ← 16-n
SHIFT   LD      GR0,0,GR5      ; GR0 ← 元の図形の1語の内容
        ［c］
        ST      GR0,0,GR6      ; 結果の領域 ← GR0
        LAD     GR5,1,GR5      ; 元の図形の1語のアドレス更新
        LAD     GR6,1,GR6      ; 結果の領域の1語のアドレス更新
        SUBA    GR4,=1         ; n語処理済み？
        JNZ     SHIFT
COPY    SUBA    GR7,=1         ; 残りの語の内容を結果の領域に複写
        ［d］
        LD      GR0,0,GR5
        ST      GR0,0,GR6
        LAD     GR5,1,GR5
        LAD     GR6,1,GR6
        JUMP    COPY
N       DS      1
LOOP1   LD      GR4,N`;
export const rotationBanks = {
  ab: ['GR1', 'GR2', 'GR5'].flatMap(reg => [-1, 1].map(delta => `LAD     ${reg},${delta},${reg}`)),
  c: ['SLL', 'SRL'].flatMap(op => [-1, 0].map(delta => `${op}     GR0,${delta},GR3`)),
  d: ['JMI', 'JNZ', 'JPL', 'JZE'].map(op => `${op}     LOOP1`),
};
export const caslPages = [70, 71, 72, 73, 74, 75];
const caslReference = special2011PmReference('IPA公式付属資料　アセンブラ言語（CASL II）の仕様', caslPages);

export const q12 = createLanguageDefinition(12, 'CASL IIでビット図形を90度回転する', 'bitmapAndScope', 'ab2cd', 'カイウイア',
  '16語×16ビット、ビット15が左、プログラム1の全域回転・シフト命令置換による図形四択・プログラム2の部分回転を維持する。ビット図と図2のnを変更する。文字コードの読取りは用いない。',
  index => {
    const { example } = bitmapCases[index];
    return {
      pages: [
        page(57, [heading('問12　次のアセンブラプログラムの説明及びプログラムを読んで，設問1～3に答えよ。'),
          heading('〔プログラム1の説明〕'),
          p('連続する16語に格納した16×16ドットの白黒の図形を，時計回りに90度回転する副プログラム ROTATE である。図形の回転の実行例を図1に示す。このとき，1ドットを1ビットで表し，白は0，黒は1が格納されている。'),
          p('（1） 図形を表す16語の先頭アドレスはGR1に設定されて，主プログラムから渡される。\n（2） 回転した結果の図形を格納する領域の先頭アドレスはGR2に設定されて，主プログラムから渡される。\n（3） 元の図形と回転した図形は，異なる領域に格納される。\n（4） 副プログラムから戻るとき，汎用レジスタGR1～GR7の内容は元に戻す。'),
          rotationWhole.block(index)]),
        page(58, [heading('〔プログラム1〕（行番号）'), code(rotationProgram1, 'casl2'),
          p('設問1　プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　行番号9を次のとおりに変更し，図1の回転前を元の図形として実行した。実行結果の図形として正しい答えを，解答群の中から選べ。'),
          code('        SRL     GR6,1', 'casl2')], [{ ...bank(1, 'ab', rotationBanks.ab, 'カイ', 'casl2'), label: '解答群' },
          figureBank(2, '2', rotationChoices.map(figure => figure.block(index)), 'ウ')], [2, 4]),
        page(59, [
          p(`設問3　プログラム1中の行番号3，4をプログラム2に置き換えて，16×16ドットの図形のうち左上のn×nドットの部分だけを時計回りに90度回転するプログラムとした。左上の${example}×${example}ドットの部分だけを回転した実行例を図2に示す。`),
          p('値n（1≦n≦16）はGR3に設定されて主プログラムから渡される。'),
          p('置換え後のプログラムは，まず，回転の対象とならないドット（元の図形の上n語の右（16－n）ビットと下（16－n）語の全ビット）を結果の領域の適切な場所に複写する。その後，左上のn×nドットの部分を回転して結果の領域に格納する。'),
          p('プログラム2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          { ...rotationPart.block(index), caption: `図2　左上の${example}×${example}ドットの部分だけを回転した実行例` } as ReturnType<typeof rotationPart.block>]),
        page(60, [heading('〔プログラム2〕'), code(rotationProgram2, 'casl2')], [
          bank(3, 'c', rotationBanks.c, 'イ', 'casl2'), bank(3, 'd', rotationBanks.d, 'ア', 'casl2')]),
      ],
      contexts: [caslReference],
      explanation: '内側では結果の各語を順に更新するためGR5を1増やす（a）。外側では元の次の語を読むためGR1を1増やす（b）。行番号9がSRLなら元の各語の右端から順にビットを取り出す一方，結果の各語には上から読んだ行のビットを左端に入れる。設問2では時計回りに回転した結果の上下が反転した図になる。設問3では後からn回右シフトしても元の右側が残るよう，先に元の語をnビット左へシフトする（c）。COPYのSUBAで残り回数を1減らして負になったときだけ複写を終える（d）。',
    };
  }, { fixedReferenceAssetIds: caslPages.map(special2011PmPageAssetId) });
