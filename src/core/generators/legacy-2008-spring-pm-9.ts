import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2008-spring-pm-06-09-support';
import { tokenCases } from './legacy-2008-spring-pm-06-09-model';
import { drawing } from './legacy-2008-spring-pm-06-09-figures';
import { spring2008PmReference } from './legacy-2008-spring-pm-materials';

const caslReferencePages = [55, 56, 57, 58, 59, 60] as const;
const caslReference = () => spring2008PmReference('アセンブラ言語の仕様', caslReferencePages);

export function tokenProgram(index: number): string {
  const { terminal } = tokenCases[index];
  return `TOKEN   START
        RPUSH
        LD    GR3,=-1     ; 単語の処理中を示すフラグの初期化
;                             0: 数字だけの単語を処理中である。
;                             1: 英字を含む単語を処理中である。
;                            -1: 単語の処理中ではない。
        LAD   GR1,-1,GR1
LP      LAD   GR1,1,GR1
        LD    GR4,0,GR1   ; 1文字を取り出す。
        CPL   GR4,='${terminal}'   ; 終了判定
        JZE   FIN
        CPL   GR4,=' '
        ［a］
        CALL  SETTKN
        JUMP  LP
ALNUM   LD    GR3,GR3     ; 単語の処理中？
        JPL   LP          ; 英字を含む単語を処理中なら LP へ
        JZE   ACHK        ; 数字だけの単語を処理中なら ACHK へ
        ［b］
        LD    GR6,GR1     ; 単語の先頭アドレスを退避
ACHK    CPL   GR4,='A'   ; 検査対象文字は数字？
        JMI   LP         ; 数字の場合，次の文字の取出しへ
        LD    GR3,=1     ; 英字の場合
        JUMP  LP
;
FIN     CALL  SETTKN
        LD    GR5,=-1
        ST    GR5,0,GR2   ; 終了マークを格納
        RPOP
        RET
;
SETTKN  LD    GR3,GR3     ; 単語の処理中？
        JMI   FIN2       ; 処理中でなければ何もしない。
        ST    GR6,0,GR2   ; 単語の先頭アドレスを管理テーブルに格納
        LD    GR5,GR1
        SUBL  GR5,GR6     ; 単語の長さを計算
        ST    GR5,1,GR2   ; 単語の長さを格納
        ST    GR3,2,GR2   ; 単語の属性を格納
        LD    GR3,=-1    ; 単語の処理中状態を解除
        ［c］
FIN2    RET
        END`;
}
export const q9 = draftQuestion(9, 'CASL II：文字列から単語を切り出し管理テーブルに格納する',
  '終了文字・表要素の予約語数・文字列と開始アドレス', 'aイ bウ cエ',
  '英数字の連続を区切り，先頭アドレス・長さ・英字の有無を格納する。空白と終了文字の両経路・GR1〜GR7の復元・3欄の命令補完を維持。終了文字，例の先頭アドレスと文字列，構造体末尾の予約語数を変え，表の更新幅と選択肢を同じ条件から反映する。比較には対象文字の相対順だけを用い，符号値の表は収録しない。', (index, original) => {
    const { terminal, padding, address } = tokenCases[index];
    const step = 3 + padding;
    return {
      pages: [
        { page: 32, blocks: [
          p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),
          p('文字列中の単語を切り出して，単語管理テーブルを作成する副プログラム TOKEN である。'),
          p('(1) 文字列は英字，数字，空白文字（間隔文字）の0文字以上の並びで，最後に' +
            (terminal === '.' ? 'ピリオド' : '終了文字 “' + terminal + '”') + 'が置かれる。単語は，1文字以上の空白文字で区切られた英数字の並びとする。'),
          p('(2) 単語管理テーブルには，文字列中に現れる単語ごとに，' + step + '語からなる要素を作成し，単語の先頭アドレス，長さ，属性の順に格納する。属性は，単語が数字だけからなるときは0，英字が含まれるときは1とする。' +
            (padding === 0 ? '' : '残る' + padding + '語は予約領域として書き換えない。') +
            '単語の切出しが終了したとき，単語管理テーブルの終了を示すマークとして−1を格納する。'),
          p('(3) 主プログラムは，文字列の先頭アドレスをGR1に，単語管理テーブルの先頭アドレスをGR2に設定して，TOKENを呼ぶ。'),
          p('(4) 副プログラム TOKEN から戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('副プログラム TOKEN の実行例を図に示す。'),
          drawing('9-execution', index),
        ] },
        { page: 33, blocks: [p('〔プログラム〕'), code(tokenProgram(index), 'casl2')] },
        { page: 34, blocks: [p('設問　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], banks: [
          bank('a', ['JNZ   ACHK', 'JNZ   ALNUM', 'JNZ   LP', 'JZE   ACHK', 'JZE   ALNUM', 'JZE   LP'], 'イ', 'casl2'),
          bank('b', ['JMI   ALNUM', 'JMI   LP', 'LD    GR3,=0', 'LD    GR3,=1', 'LD    GR3,0', 'LD    GR3,1'], 'ウ', 'casl2'),
          bank('c', ['LAD   GR1,1,GR1', 'LAD   GR1,' + step + ',GR1', 'LAD   GR2,1,GR2', 'LAD   GR2,' + step + ',GR2',
            'LD    GR1,GR6', 'LD    GR2,GR6'], 'エ', 'casl2'),
        ] },
      ],
      contexts: [caslReference()],
      explanation: [
        'a：終了文字を先に判定した後，空白と比較して一致しなければ英数字なのでJNZ ALNUMで進む。空白なら現在の単語を確定する。',
        'b：未処理状態（GR3が−1）で英数字を受けたら，まず属性候補を示すGR3を即値0にする。続いてGR6に先頭アドレスを記録する。数字は英字Aより前の符号順にあるため，数字なら0のまま，英字なら1へ更新する。',
        'c：先頭アドレスから現位置までの差が長さになる。1要素は' + step + '語なのでGR2だけを' + step + '進める。',
        '図の入力例では，先頭アドレスは' + address + '。終了文字でも直前の単語を取りこぼさず，終了マークを置く。RPUSHとRPOPで呼出し前のGR1〜GR7を復元する。',
      ].join('\n'),
    };
  });
