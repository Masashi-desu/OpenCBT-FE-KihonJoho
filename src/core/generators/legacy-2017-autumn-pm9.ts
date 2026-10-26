import {field, figure, p, programs, strings, variableNotes, type GenerationDefinition} from './definition';
import {legacy2017AutumnPm9Model as model, legacy2017AutumnPm9Figure as inspect, legacy2017AutumnPm9Profiles as profiles, legacy2017AutumnPm9Abc as banks} from './legacy-2017-autumn-pm9-model';
export const legacy2017AutumnPm9Program = `#include <stdio.h>
#include <ctype.h>
void find_palindrome(const char*);
int is_palindrome(const char*, int);
const char* find_char(const char*, char);
void find_palindrome(const char* text) {
    int i;
    int psize;       /* 文字の並びの長さ */
    const char* ith; /* 文字列textの第i文字へのポインタ */
    const char* hit; /* 第i文字と一致した文字へのポインタ */
    for (i = 0; text[i] != '\\0'; i++) {
        if (!isalnum(text[i])) {
            continue;
        }
        ith = &text[i];
        hit = find_char(ith + 1, *ith);
        while (hit != NULL) {
            psize = [a];
            if (is_palindrome(ith, psize)) {
                while (ith < hit + 1) {
                    putchar(*ith);
                    ith++;
                }
                putchar('\\n');
                return;
            }
            hit = find_char(hit + 1, *ith);
        }
    }
}
int is_palindrome(const char* chars, int size) {
    int l;
    int r;
    for (l = 0, r = size - 1; l < r; l++, r--) {
        while (!isalnum(chars[l])) {
            l++;
        }
        while (!isalnum(chars[r])) {
            r--;
        }
        if ([b]) {
            return 0;
        }
    }
    return 1;
}
const char* find_char(const char* str, char ch) {
    int i;
    for (i = 0; str[i] != '\\0'; i++) {
        if ([c]) {
            return &str[i];
        }
    }
    return NULL;
}`;
export const legacy2017AutumnPm9Changes = [
  ['行番号2と3の間に追加', '#include <string.h>'],
  ['行番号5を変更', 'const char* find_last_char(const char*, char, int);'],
  ['行番号10と11の間に追加', 'unsigned int textlen = strlen(text);'],
  ['行番号16を変更', 'hit = find_last_char(ith + 1, *ith, textlen - i - 1);'],
  ['行番号27を変更', 'hit = find_last_char(ith + 1, *ith, [d]);'],
  ['行番号47〜49を変更', 'const char* find_last_char(const char* str, char ch, int count) {\n    int i;\n    for ([e]; i--) {'],
] as const;
export const legacy2017AutumnPm9Definition: GenerationDefinition = {
  source: '2017h29a-fe-pm-9', title: '旧制度・午後：Cによる回文の探索と表示', version: '3.2.0', fields: [field('設問3の入力文字列条件', 0, 3)], reference: [0], sourceAnswer: '設問1 a=オ、b=カ、c=ウ／設問2 d=オ、e=エ／設問3 f=オ、g=イ',
  notes: variableNotes + ' 秋原46〜52全7頁、C全55行、7欄37択、関数3種とlibrary4種の仕様、表1固定4例、表2変更6項目、全解答群と空白表示を保持。最初の英数字位置を優先し同位置は最短から最長へ変更する問い。変えるのは設問3の文字列（42〜44字）で4候補。原はAdamの後が空白で句点なし、43字。機能上の探索回数・範囲を変更し、全選択肢の値と解説も同期する。表1の固定例は変えない。並べ替え禁止。schema/dispatcher/通常App未登録のprivate準備。C標準機能の短い要約とIPA出題用コードの素材査読は別記録で行う。',
  build(values) {
    const m = model(values), draw = (n: number, group?: number) => {const vs = group === undefined ? values : [m.v, group], f = inspect(profiles[n], vs); return figure(profiles[n], vs, f.caption, f.alt);};
    const all = [...banks.map(b => [...b]), m.f.map(String), m.g.map(String)], counts = all.map(b => b.length), offsets = counts.map((_, i) => counts.slice(0, i).reduce((a, b) => a + b, 0));
    const answers = [4, 5, 2, 4, 3, m.f.indexOf(m.trace.calls.length), 1];
    return {
      prompt: [p('次の問9から問13までの5問については、この中から1問を選択し、選択した問題については、答案用紙の選択欄の（選）をマークして解答してください。なお、2問以上マークした場合には、はじめの1問について採点します。'),
        p('問9 次のCプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。'), p('プログラムの説明'),
        p('文字列の中から、回文（palindrome）を探して表示する関数find_palindromeである。回文とは、先頭から読んだ文字の並びと末尾から読んだ文字の並びが一致する文字の並びのことである。ただし、ここでは次の条件を満たすものとする。'),
        p('・文字列は英字（A〜Z、a〜z）、数字（0〜9）、記号（!"#%&\'()*+,-./:;<=>?[]^_{|}）及び空白文字から成る。'),
        p('・文字の並びを読むとき、英字の大文字と小文字は区別しない。'), p('・文字の並びを読むとき、記号及び空白文字は無視する。'), p('・回文は英数字で始まり英数字で終わる。ただし、英数字1文字は回文ではない。'),
        p('本問のプログラムが表示する回文の例を表1に示す。No.1の文字列ではbc0cbは回文である。c0cも回文であるが、先頭に最も近い文字から始まるものを表示する。No.2では大文字と小文字を区別しないのでBc0Cbは回文である。No.3では大文字と小文字を区別せず、記号と空白文字を無視するのでB!c0 Cbは回文である。No.4では、先頭に最も近いbを先頭とするbc0cbとbc0cb1bc0cbはいずれも回文であるが、開始位置が同じなら最も短いものを表示する。'), draw(0),
        p('(1) 関数find_palindromeの仕様は、次のとおりである。ここで、引数の値に誤りはないものとする。'), p('機能：文字列textの中から回文を探して表示する。複数ある場合、先頭文字位置が文字列の先頭に最も近いものを表示する。同じ先頭位置なら、長さが最も短いものを表示する。'), p('引数：text 文字列。関数find_palindromeは、関数is_palindrome及び関数find_charを使用する。'),
        p('(2) 関数is_palindromeの仕様は、次のとおりである。ここで、引数の値に誤りはないものとする。'), p('機能：文字の並びcharsが回文かどうかを判定する。引数：chars 文字の並び、size 文字の並びcharsの長さ。返却値：回文の場合は1、回文でない場合は0。'),
        p('(3) 関数find_charの仕様は、次のとおりである。ここで、引数の値に誤りはないものとする。'), p('機能：文字列str中で、文字chが最初に現れる位置を求める。ただし、英字の大文字と小文字は区別しない。引数：str 文字列、ch 文字。返却値：文字が現れる場合は最初の位置へのポインタ、現れない場合は空ポインタ。'),
        p('(4) プログラム中で使用しているライブラリ関数の概要は、次のとおりである。'), p('isalnum(ch)：文字chが英数字のとき、0以外の値を返し、それ以外のとき、0を返す。'), p('tolower(ch)：文字chが英大文字のとき、その文字に対応する英小文字を返し、それ以外のとき、文字chを返す。'), p('putchar(ch)：文字chを表示する。'), draw(1),
        p('設問1 プログラム中の［　］に入れる正しい答えを、解答群の中から選べ。'), draw(3, 0), draw(3, 1), draw(3, 2),
        p('設問2 関数find_palindromeが、先頭文字位置が同じ回文が複数ある場合、長さが最も長いものを表示するように、プログラムを変更する。表2中の［　］に入れる正しい答えを、解答群の中から選べ。'),
        p('(1) 関数find_charを、関数find_last_charと置き換える。ここで、引数の値に誤りはないものとする。'), p('機能：文字列strの先頭から文字数count以内の範囲で文字chが現れる最後の位置を求める。ただし、英字の大文字と小文字は区別しない。引数：str 文字列、ch 文字、count 文字数。返却値：文字が現れる場合は最後の位置へのポインタ、現れない場合は空ポインタ。'),
        p('(2) 新たに使用するライブラリ関数strlen(text)は、文字列textの長さ（ただし、終端ナル文字\'\\0\'は含まない）を返す。'), draw(2), draw(3, 3), draw(3, 4),
        p('設問3 次の記述中の［　］に入れる正しい答えを、解答群の中から選べ。'), p('設問2で変更した関数find_palindromeを、次の文字列を引数として実行した。ここで“␣”は空白文字を表す。'), draw(4),
        p('関数find_palindromeが回文の表示を終了するまでに、関数find_last_charは［f］回呼び出され、その最後の呼出しにおける引数countの値は［g］である。'), draw(3, 5), draw(3, 6)],
      choices: [...banks.flatMap(b => programs([...b])), ...strings(m.f.map(String)), ...strings(m.g.map(String))],
      answerParts: counts.map((n, i) => ({id: `part-${'abcdefg'[i]}`, label: `設問${i < 3 ? 1 : i < 5 ? 2 : 3} ${'abcdefg'[i]}`, choiceIds: Array.from({length: n}, (_, j) => `choice-value-${offsets[i] + j + 1}`)})),
      partAnswers: answers.map((n, i) => ({kind: 'choice' as const, partId: `part-${'abcdefg'[i]}`, choiceId: `choice-value-${offsets[i] + n + 1}`})),
      explanation: `a：両端を含む文字数はhit−ith＋1。iや先頭からの位置、差だけでは対象範囲を表せない。b：記号と空白を飛ばした両端を小文字へ揃え、異なれば0を返す。位置l/rの比較や生の文字比較ではない。c：chとstr[i]の両方を小文字へ揃えた一致を調べる。片側だけの変換をOR又はANDで組み合わせると大文字同士等で正しくない。d：今の末尾hitを除いて再探索するので、ith＋1からhit−1までの文字数はpsize−2。textlenやiを使う他の式は探索済み範囲を含む。e：対象の最終添字はcount−1、先頭添字0も含めて下げる。countから始めると範囲外、i>0なら先頭を落とす。f：入力は${m.text.length}文字。呼出しの(start,count,発見位置)は${m.trace.calls.map(c => `(${c.start},${c.count},${c.found === null ? 'なし' : c.found})`).join('→')}。計${m.trace.calls.length}回で、表示する回文は「${m.trace.output}」。開始位置が最も近いものを優先し、その位置では末尾から探す。g：最後のcountは${m.g[1]}。${m.g[0]}は成功した回文について更に再探索するときの長さ、${m.g.slice(2).join('、')}は同じ開始位置での以前の探索範囲であり、終了した時点の値ではない。`,
    };
  },
};
