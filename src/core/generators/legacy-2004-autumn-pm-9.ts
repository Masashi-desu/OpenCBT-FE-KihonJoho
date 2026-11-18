import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2004-autumn-pm-06-09-support';
import { compressed, draw, stringsWithSpaces } from './legacy-2004-autumn-pm-06-09-figures';
import { autumn2004PmReference } from './legacy-2004-autumn-pm-materials';

const page33 = `SPCSUP  START
        RPUSH
        LD    GR2,GR1         ; 転送元ポインタ（GR2）初期化
        LD    GR3,GR1         ; 転送先ポインタ（GR3）初期化
        LD    GR4,GR1         ; ┐
        [a]                  ; ┘ 文字列終了位置ポインタ（GR4）初期化
        LD    GR6,=0          ; 連続空白識別フラグ（GR6）初期化

LP      LAD   GR2,1,GR2
        LD    GR5,0,GR2
        CPL   GR5,' '
        [b]
        LD    GR6,GR6
        JNZ   CONT
        [c]
        JUMP  CHMOVE`;
const page34 = `RESET   LD    GR6,=0
CHMOVE  LAD   GR3,1,GR3
        ST    GR5,0,GR3
CONT    CPL   GR2,GR4
        JMI   LP
        SUBL  GR3,GR1         ; 新文字列長の算出
        ST    GR3,0,GR1
        RPOP
        RET
        END`;

export const q9 = draftQuestion(9, 'CASL IIで連続する空白を詰める', '連続空白の位置と長さ', 'イウエ',
  '正の長さの文字列を同じ領域で処理する。先頭・内部・末尾の連続空白や全てが空白の場合へ実行例の入力を変え、長さ、処理結果及び可視化を同期する。原題と同じ終了位置、非空白の分岐、連続フラグの三つの空欄を保つ。', index => {
    const input = stringsWithSpaces[index];
    const length = compressed(input).length;
    return {
      pages: [
        { page: 33, blocks: [
          p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),
          p('文字列中の二つ以上連続する間隔文字（以下空白という）を一つに詰める副プログラムSPCSUPである。'),
          p('（1）主プログラムは，先頭に文字列長，その後に文字列が格納された領域の先頭アドレスをGR1に設定して，副プログラムSPCSUPを呼ぶ。'),
          draw('9-input-layout', index),
          p('（2）副プログラムSPCSUPは，文字列中の空白を詰めた後，文字列長を再設定する。'),
          p('（3）副プログラムSPCSUPから戻るとき，汎用レジスタの内容は元に戻す。'),
          draw('9-space-example', index),
          p('〔プログラム〕'), code(page33, 'casl2'),
        ] },
        { page: 34, blocks: [code(page34, 'casl2'), p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')], banks: [
          bank('a', ['ADDL  GR3,0,GR1', 'ADDL  GR4,0,GR1', 'LAD   GR1,1,GR1', 'LAD   GR3,1,GR3', 'LAD   GR4,1,GR4'], 'イ', 'casl2'),
          bank('b', ['JNZ   CHMOVE', 'JNZ   CONT', 'JNZ   RESET', 'JZE   CHMOVE', 'JZE   CONT', 'JZE   RESET'], 'ウ', 'casl2'),
          bank('c', ['LAD   GR2,1,GR2', 'LAD   GR3,1,GR3', 'LD    GR6,1', 'LD    GR6,=1'], 'エ', 'casl2'),
        ] },
      ],
      contexts: [autumn2004PmReference('アセンブラ言語の仕様', [58, 59, 60, 61, 62, 63])],
      explanation: 'GR1が指す先頭語には' + input.length + 'があり，文字はGR1＋1からGR1＋' + input.length +
        'までにある。ADDLで先頭アドレスに長さを足してGR4に末尾を記憶する。空白以外はJNZ RESETで連続フラグGR6を0にして転送する。空白の先頭ではGR6をリテラルの1で立てて転送し，連続する空白は転送しない。最後の出力位置GR3からGR1を引いた値が新しい長さで，実行例では' +
        length + 'になる。領域の先頭にこの長さを書き，RPOPで呼出し時のGRを復元する。',
    };
  }, 'fixed');
