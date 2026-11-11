import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2010-spring-pm-09-13-support';

const cases = [
  { columns: 80, wordLength: 20, references: 50, id: 2, word: 'C++', first: 'Lang', last: 'prog', prefix: 'Develop', suffix: 'compiler' },
  { columns: 64, wordLength: 18, references: 40, id: 14, word: 'Rust', first: 'Learn', last: 'code', prefix: 'Build', suffix: 'library' },
  { columns: 72, wordLength: 22, references: 60, id: 37, word: 'lexer', first: 'Parse', last: 'token', prefix: 'Create', suffix: 'grammar' },
  { columns: 76, wordLength: 24, references: 45, id: 29, word: 'cache', first: 'Fast', last: 'hits', prefix: 'Measure', suffix: 'latency' },
];
const showSpaces = (text: string) => text.replaceAll(' ', '△');
const nbsp = '“△”は空白文字を表す。';
const line = (index: number) => {
  const { first, word, last } = cases[index];
  return first + ' ' + word + '  ' + last;
};
const buffer = languageFigure(9, 'line-buffer', '図1 変数cpos，gappの例', index => {
  const text = line(index);
  return {
    kind: 'tables', note: nbsp + ` gapp＝${text.lastIndexOf(' ')}、cpos＝${text.length}。`,
    tables: [{ caption: `ファイルから英文テキスト“${showSpaces(text)}”までを読み込んだときの変数の内容`,
      headers: ['添字', ...Array.from({ length: text.length + 1 }, (_, position) => String(position))],
      rows: [['linebuf', ...showSpaces(text), ''], ['位置', ...Array.from({ length: text.length + 1 }, (_, position) =>
        position === text.length ? '↑ cpos' : position === text.lastIndexOf(' ') ? '↑ gapp' : '')]] }],
  };
});
const formats = languageFigure(9, 'keyword-format', '図2 キーワードの定義様式と参照様式', index => {
  const limit = cases[index].references - 1;
  return { kind: 'output', text: String.raw`最初の出現場所でのキーワードと参照番号の定義様式：
  \D参照番号\単語\
    参照番号  キーワードの参照番号（0〜${limit}）
    単語      キーワードとする単語
キーワードの参照様式：
  \R参照番号\
    参照番号  キーワードの参照番号（0〜${limit}）` };
});
const definitionExample = languageFigure(9, 'keyword-definition', '図3 キーワードと参照番号を定義している部分の変換例', index => {
  const { first, id, word, last } = cases[index];
  return { kind: 'tables', note: nbsp, tables: [{ headers: [], showHeaders: false, rows: [
    ['入力英文テキスト', showSpaces(String.raw`${first} \D${id}\${word}\  ${last}`)],
    ['出力英文テキスト', showSpaces(line(index))],
  ] }] };
});
const referenceExample = languageFigure(9, 'keyword-reference', '図4 キーワードを参照している部分の変換例', index => {
  const { id, word, prefix, suffix } = cases[index];
  return { kind: 'tables', note: nbsp, tables: [{ headers: [], showHeaders: false, rows: [
    ['入力英文テキスト', showSpaces(String.raw`${prefix}  \R${id}\  ${suffix}`)],
    ['出力英文テキスト', showSpaces(`${prefix}  ${word}  ${suffix}`)],
  ] }] };
});
const q9Figures = [buffer, formats, definitionExample, referenceExample];

function program1(columns: number) {
  return String.raw` 1  #include <stdio.h>

 2  #define COLUMNS ${columns}  /* 1行の最大文字数 */

 3  void printout_text(char *);

 4  void printout_text(char *filename) {
 5      FILE *fp;
 6      char linebuf[COLUMNS + 1];
 7      int ch, ch1, cpos = 0, gapp = -1, i;

 8      fp = fopen(filename, "r");
 9      while ((ch = fgetc(fp)) != EOF) {
10          switch (ch) {
11            case '\n':
12              linebuf[cpos] = '\0';
13              printf("%s\n", linebuf);
14              cpos = 0;
15              gapp = -1;
16              break;
17            case ' ':
18              if (［a］) {
19                  linebuf[cpos] = '\0';
20                  printf("%s\n", linebuf);
21                  cpos = 0;
22              }
23              ［b］;
24              ［c］ = ch;
25              break;`;
}
const program2 = String.raw`26            default:
27              if (［a］) {
28                  i = gapp + 1;
29                  ch1 = linebuf[i];
30                  linebuf[i] = '\0';
31                  printf("%s\n", linebuf);
32                  cpos = 0;
33                  if (i < COLUMNS) {
34                      linebuf[cpos++] = ch1;
35                      ［d］;
36                      while (i < COLUMNS) {
37                          linebuf[cpos++] = linebuf[i++];
38                      }
39                  }
40                  gapp = -1;
41              }
42              ［c］ = ch;
43          } /* switch 文の終わり */
44      }
45      if (cpos > 0) {
46          linebuf[cpos] = '\0';
47          printf("%s", linebuf);
48      }
49      fclose(fp);
50  }`;
const extension = String.raw`case '\\':
    ch1 = fgetc(fp);
    i = 0;
    while ((ch2 = fgetc(fp)) != '\\') {
        i = ［e］;
    }
    if (［f］) {
        j = 0;
        while ((reftbl[i][j++] = fgetc(fp)) != '\\');
        reftbl[i][j - 1] = '\0';
    }
    j = strlen(reftbl[i]);
    if (［g］) {
        linebuf[cpos] = '\0';
        printf("%s\n", linebuf);
        cpos = 0;
        gapp = -1;
    }
    strcpy(&linebuf[cpos], reftbl[i]);
    cpos += j;
    break;`;

export const q9 = createLanguageDefinition(9, 'C：英文の折返しとキーワードの復元', '最大行長・参照範囲・キーワード例', 'abcdefg',
  '設問1 aエ bイ cイ dエ／設問2 eカ fア gウ', '行番号1〜50、改行・字下げ・二つの設問・7欄と各選択肢の役割を維持する。行幅、辞書の長さ・件数、参照番号と例文を同じ箇所へバインドする。処理の不変条件は固定し、境界が変わる4条件を独立計算する。', index => {
    const { columns, wordLength, references, id, word } = cases[index];
    return {
      pages: [
        page(48, [
          p('次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。'),
          p('問9 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕関数printout_textは，ファイルから英文テキストを読み込んで，単語が行末の改行で切れないように整形して出力するプログラムである。'),
          p('（1）引数filenameは英文テキストが格納されているファイル名である。ファイル名に誤りはないものとする。'),
          p(String.raw`（2）英文テキストに含まれる文字は，①英字 A〜Z，a〜z，②数字 0〜9，③記号 !"#%&'()*+,-./:;<=>?[]^_{|}~，④空白文字，⑤改行文字である。`),
          p(`（3）出力する1行の最大文字数（改行文字を含まない）は${columns}文字である。`),
          p('（4）単語は空白文字及び改行文字を含まない文字列であり，1文字以上の連続する空白文字又は改行文字で区切られている。'),
          p('（5）空白文字及び改行文字はそのまま出力する。'),
          p('（6）単語の途中で1行の最大文字数を超える場合は，その単語が次の行の先頭になるように出力する。'),
          p('（7）単語の長さは，1行の最大文字数を超えない。'),
          p('（8）変数cposは出力用行バッファlinebufに次の文字を格納する位置を，変数gappはlinebufに最後に格納した空白文字の位置をもつ。変数cpos，gappの例を図1に示す。'),
        ]),
        page(49, [buffer.block(index), p('〔プログラム〕（行番号）'), code(program1(columns), 'c')]),
        page(50, [code(program2, 'c'), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['cpos < COLUMNS', 'cpos <= COLUMNS', 'cpos > COLUMNS', 'cpos >= COLUMNS',
            'gapp < COLUMNS', 'gapp <= COLUMNS', 'gapp > COLUMNS', 'gapp >= COLUMNS'], 'エ', 'c'),
          bank(1, 'b', ['gapp = -1', 'gapp = cpos', 'gapp = COLUMNS', 'gapp++', 'gapp--'], 'イ', 'c'),
        ]),
        page(51, [
          p('設問2 次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('入力英文テキスト中に複数回出現する単語をキーワードという。最初の出現場所でキーワードと参照番号を定義し，それ以降は参照番号で参照する。整形出力時，参照番号で示されているキーワードは本来の文字列に戻す。ここで，プログラム中の［a］〜［d］には正しい答えが入っているものとする。'),
          p(String.raw`（1）入力英文テキスト中でのキーワードの表現様式は図2のとおり。キーワードの長さは${wordLength}文字以下，個数は${references}以下。入力に追加された文字“\”は，キーワードの定義及び参照以外に使われない。`),
          formats.block(index),
        ], [
          bank(1, 'c', ['linebuf[cpos]', 'linebuf[cpos++]', 'linebuf[gapp]', 'linebuf[gapp++]', 'linebuf[++cpos]', 'linebuf[++gapp]'], 'イ', 'c'),
          bank(1, 'd', ['i = -1', 'i = cpos', 'i = COLUMNS', 'i++', 'i--'], 'エ', 'c'),
        ], [-1, -1]),
        page(52, [
          p('（2）入力英文テキストを，次の規則で出力英文テキストに変換しながら，キーワードを含め単語が行末の改行で切れないように整形して出力する。'),
          p('① キーワードと参照番号を定義している部分については，定義しているキーワードだけを出力英文テキストに残す。変換例を図3に示す。'),
          definitionExample.block(index),
          p('② キーワードを参照している部分については，参照番号に対応するキーワードで置き換える。変換例を図4に示す。'),
          referenceExample.block(index),
          p('③ その他の部分は，〔プログラムの説明〕の（1）〜（8）に従う。'),
          p('（3）キーワード処理に対応するため，プログラムを表のとおりに変更する。'),
          changes.block(index),
        ]),
        page(53, [
          p('〔プログラムの追加部分〕で使用している関数strlenの仕様は次のとおりである。'),
          code('unsigned int strlen(const char *s)', 'c'),
          p('機能：文字列sの長さを求める。返却値：終端を示すナル文字に先行する文字の個数。'),
          p('〔プログラムの追加部分〕'), code(extension, 'c'),
        ], [
          bank(2, 'e', ['ch2', "ch2 - '0'", 'i + ch2', "i + ch2 - '0'", 'i * 10 + ch2', "i * 10 + ch2 - '0'"], 'カ', 'c'),
          bank(2, 'f', ["ch1 == 'D'", "ch1 == 'R'", String.raw`ch1 == '\\'`, 'i == 0', 'i != 0'], 'ア', 'c'),
        ]),
        page(54, [], [bank(2, 'g', ['cpos >= COLUMNS', 'cpos + j >= COLUMNS', 'cpos + j - 1 >= COLUMNS',
          'gapp >= COLUMNS', 'gapp + j - 1 >= COLUMNS'], 'ウ', 'c')]),
      ],
      explanation: `a：次の格納位置cposが${columns}に達すると，そのまま1文字を追加できない。b：空白を書く位置は更新前のcpos。c：格納してからcposを1進める。d：折返し先に最初の1文字を移したので，iを1進めて残りを移す。e：番号はそれまでの値を10倍し，次の文字と'0'の差を加える。例では${id}に復元する。f：Dが辞書を定義する指定で，Rは既存の登録を使う。g：長さjの“${word}”の最後に書く添字はcpos＋j−1。添字${columns}以上なら改行してから格納する。等号だけの位置では，cpos＋jが${columns}なら残りに収まる。冊子で与えたstrlenの説明はナル文字を数えない点が解答に必要で，標準Cの戻り値型はsize_tである。`,
    };
  }, { answerVariation: 'fixed' });

const changes = languageFigure(9, 'change-list', '表 プログラムの変更内容', index => {
  const { wordLength, references } = cases[index];
  return { kind: 'tables', tables: [{ headers: ['処置', 'プログラムの変更内容'], rows: [
    ['行番号1と2の間に追加', '#include <string.h>'],
    ['行番号2と3の間に追加', `#define WORDL ${wordLength}  /* キーワードの最大文字数 */\n#define REFMX ${references}  /* キーワードの最大個数 */`],
    ['行番号7と8の間に追加', 'char reftbl[REFMX][WORDL + 1];\nint ch2, j;'],
    ['行番号25と26の間に追加', '〔プログラムの追加部分〕'],
  ] }] };
});
export const q9AllFigures = [...q9Figures, changes];
