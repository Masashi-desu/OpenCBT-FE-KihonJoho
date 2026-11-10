import { code, p } from './definition';
import { selectionInstruction } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, page } from './legacy-2013-autumn-pm-09-13-support';
import { dictionaryConditions } from './legacy-2013-autumn-pm-09-13-models';
import { languageFigure } from './legacy-2013-autumn-pm-09-13-figures';

const cSource = `#include <ctype.h>
#include <string.h>

int diccmp(char *, char *);
void diccnv(char *, char *, char *);

int diccmp(char *word1, char *word2) {
    int rc;

    char char1[CAPACITY], char2[CAPACITY], attr1[CAPACITY], attr2[CAPACITY];
    diccnv(word1, char1, attr1);
    diccnv(word2, char2, attr2);
    rc = strcmp(char1, char2);
    if (rc == 0)
        rc = strcmp(attr1, attr2);
    return rc;
}

void diccnv(char *wordx, char *charx, char *attrx) {
    int ch, cpos, wpos;

    cpos = 0;
    wpos = 0;
    while (wpos < LIMIT && (ch = wordx[wpos++]) != '\\0') {
        if (isalpha(ch)) {
            if (islower(ch)) {
                charx[cpos] = ch;
                attrx[cpos] = '0';
            }
            else {
                charx[cpos] = tolower(ch);
                attrx[cpos] = '4';
            }
            ch = wordx[wpos];
            if (ch == '-' || ch == '.') {
                if (ch == '-')
                    attrx[cpos] += 1;
                else
                    attrx[cpos] += 2;
                wpos++;
            }
            cpos++;
        }
    }
    charx[cpos] = '\\0';
    attrx[cpos] = '\\0';
}`;

const permutations = [
  [0, 1, 2, 3], [0, 1, 3, 2], [1, 0, 2, 3],
  [2, 3, 1, 0], [3, 2, 0, 1], [3, 2, 1, 0],
];
const attrOptions = ['01', '02', '11', '22', '41', '42', '55', '66'];
const marks = 'アイウエオカキク';

function wordKey(word: string) {
  let letters = '', attributes = '';
  for (const [, letter, mark] of word.matchAll(/([a-zA-Z])([.-]?)/g)) {
    letters += letter.toLowerCase();
    attributes += String((/[A-Z]/.test(letter) ? 4 : 0) + (mark === '-' ? 1 : mark === '.' ? 2 : 0));
  }
  return { letters, attributes };
}

const compare = (left: string, right: string) => left < right ? -1 : left > right ? 1 : 0;
function diccmp(left: string, right: string) {
  const a = wordKey(left), b = wordKey(right);
  return compare(a.letters, b.letters) || compare(a.attributes, b.attributes);
}

export const autumn2013Pm9 = createLanguageDefinition(9, '辞書順での文字列の比較（C）', '比較する単語と最大長',
  'abcdefg', '設問1 a=ク，b=ア，c=イ／設問2 d=エ／設問3 e=ア，f=エ，g=イ',
  '大文字・小文字と付随記号を含む比較語、4語の大小と文字列の最大長を変えます。コードと入力範囲、異常入力表の長さ境界を同時に更新し、表の網掛け2行、共有解答群、配列終端の条件を保持します。',
  index => {
    const { limit, left, right, order } = dictionaryConditions[index];
    const a = wordKey(left).attributes, b = wordKey(right).attributes;
    const comparison = diccmp(left, right);
    const sorted = order.slice().sort(diccmp);
    const displayOrder = (words: string[]) => words.map(word => '“' + word + '”').join(' ＜ ');
    const possibleOrders = permutations.map(permutation => displayOrder(permutation.map(i => order[i])));
    const e = '空文字列として扱い，プログラムは正常に終了する';
    const f = limit + '文字目（' + limit + '文字目が英字で' + (limit + 1) + '文字目が“−”又は“.”の場合は' + (limit + 1) + '文字目）';
    const g = 'その文字を無視する';
    return {
      pages: [
        page(45, [
          p(selectionInstruction),
          p('問9　次のCプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('二つの英単語を辞書順で比較する関数diccmpを作成した。英大文字・英小文字・記号を含む英単語の並べ方には、文字コード順のほか、英和辞典や書籍の欧文索引のような順序（辞書順）がある。'),
          p('例　4個の単語“A.M.”，“CPU”，“all”及び“best”を並べる方法'),
          p('文字コード順：“A.M.” ＜ “CPU” ＜ “all” ＜ “best”\n辞書順：“all” ＜ “A.M.” ＜ “best” ＜ “CPU”'),
          p('検索などの場合は英単語を辞書順に整列しておくと検索の効率がよく，精度も向上する。関数diccmpは英大文字，英小文字，“-”及び“.”を含む二つの英単語の大小を辞書順で比較する。'),
          p('〔プログラムの説明〕関数diccmpの引数word1，word2は英単語を格納した文字列である。返却値が負の値ならword1＜word2（例：“map”＜“May”）、0ならword1＝word2（例：“Mr.”＝“Mr.”）、正の値ならword1＞word2（例：“U.S.”＞“US”）である。'),
        ]),
        page(46, [
          p('（1）引数word1とword2はいずれも次の条件を満たしている。①各文字は英大文字（A〜Z）、英小文字（a〜z）、“-”又は“.”のいずれかである。英大文字と英小文字を合わせて英字という。②文字列の長さは1以上' + limit + '以下である。③文字列の先頭の文字は英字である。④文字列中の“-”及び“.”の直前の文字は英字である。'),
          p('（2）辞書順での比較の方法。①各引数の文字列から基本文字列と文字情報列を生成する。基本文字列は英字だけを順に取り出して大文字を小文字へ変換した文字列である。文字情報列は基本文字列中の各文字に対応する6種類の情報（大文字，小文字，大文字“-”付き，小文字“-”付き，大文字“.”付き，小文字“.”付き）を表す。記号“-”及び“.”は直前の英字に属する。'),
          languageFigure(9, 'word-encoding', index, '例　引数の文字列 “Fri.”'),
          p('②各引数の基本文字列同士をstrcmpで比較し、異なっていればその返却値（負又は正）を返す。一致していれば文字情報列同士をstrcmpで比較し、その返却値（0、負又は正）を返す。③6種類の文字情報の値の大小関係はプログラム中で定める。'),
          p('（3）ライブラリ関数の概要。isalpha(c)：cが英字なら0以外，それ以外は0。islower(c)：cが英小文字なら0以外，それ以外は0。strcmp(s1, s2)：s1＜s2なら負の値，s1＝s2なら0，s1＞s2なら正の値。tolower(c)：英大文字なら対応する英小文字，それ以外はcを返す。'),
        ]),
        page(47, [
          p('〔プログラム〕'),
          code(cSource.replaceAll('CAPACITY', String(limit + 1)).replace('LIMIT', String(limit)), 'c'),
        ]),
        page(48, [
          p('設問1　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('引数word1の内容を“' + left + '”，word2の内容を“' + right + '”として，関数diccmpを実行した。関数diccmp中のreturn文を実行する時点で，attr1の内容は“［a］”，attr2の内容は“［b］”，rcの内容は［c］となる。'),
          p('設問2　関数diccmpを用いて，4個の単語' + order.map(word => '“' + word + '”').join('，') + 'を相互に比較したとき，その大小関係は［d］となる。'),
          p('設問3　次の表1中の空欄に入れる正しい答えを，解答群の中から選べ。プログラムの説明（1）の①〜④を引数が満たさない場合の動作を表1にまとめた。なお，文字列中の文字は全て1バイト文字とする。'),
        ], [
          bank(1, 'ab', attrOptions, marks[attrOptions.indexOf(a)] + marks[attrOptions.indexOf(b)]),
          bank(1, 'c', ['0', '正の値', '負の値'], comparison === 0 ? 'ア' : comparison > 0 ? 'イ' : 'ウ'),
          bank(2, 'd', possibleOrders, marks[possibleOrders.indexOf(displayOrder(sorted))]),
        ], [1, 1, 2]),
        page(49, [
          languageFigure(9, 'invalid-input', index, '表1　引数が条件を満たさない場合のプログラムの動作'),
        ], [
          bank(3, 'e', [e, '配列に何も値を設定せずに比較をするので，予期できない結果となる',
            '配列の定義範囲外への書込みが発生するので，予期できない結果となる', 'プログラムが終了しない'], 'ア'),
          bank(3, 'f', [limit + '個目の英字', limit + '個目の英字（直後の文字が“−”又は“.”の場合はその文字）',
            limit + '文字目', f], 'エ'),
          bank(3, 'g', ['その文字が“-”，“.”以外の場合はその文字を無視するが，“-”又は“.”の場合は配列の定義範囲外への書込みが発生するので，予期できない結果となる', g,
            '配列の定義範囲外への書込みが発生するので，予期できない結果となる', 'プログラムが終了しない'], 'イ'),
        ]),
      ],
      explanation: '基本文字列は“' + wordKey(left).letters + '”と“' + wordKey(right).letters + '”、文字情報列は“' + a + '”と“' + b + '”。基本文字列を先に比較し，同じ場合に文字情報列を比較するので，返却値は' + (comparison === 0 ? '0' : comparison > 0 ? '正' : '負') + 'である。4語の辞書順は' + displayOrder(sorted) + '。空文字列でも終端のNULが書かれる。先頭が英字でなければ変換・記号確認の分岐へ入らない。ループの位置制限は' + limit + '文字だが，' + limit + '文字目の英字を変換した直後に次の文字を調べ，付随記号なら消費する。',
    };
  });
