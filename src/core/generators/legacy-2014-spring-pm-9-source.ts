import { ask, bank, code, heading, p, page, panel, table } from './legacy-2014-spring-pm-09-13-source';

export const spring2014Pm9Program = String.raw` 1 #include <stdio.h>
 2 #define WLEN_MAX 20 /* 単語の最大長 */
 3 void format_text(char *, char *, int);
 4 void format_text(char *in_file, char *out_file, int width) {
 5     FILE *ifp, *ofp;
 6     int ch,       /* 入力した文字 */
 7         lpos = 0, /* 出力処理をしている行での出力済み文字数 */
 8         sp = 0;   /* strに格納されている文字数 */
 9     char str[WLEN_MAX + 2]; /* 単語を含む出力用文字列 */
10     ifp = fopen(in_file, "r");
11     ofp = fopen(out_file, "w");
12     while ((ch = fgetc(ifp)) != EOF) {
13         if (ch == '\n') {
14             str[sp++] = ch;
15             str[sp] = '\0';
16             fputs(str, ofp);
17             [a];
18             sp = 0;
19         } else if (ch == ' ') {
20             lpos += sp;
21             if (lpos >= width) {
22                 str[sp++] = [b];
23                 lpos = 0;
24             }
25             str[sp] = '\0';
26             fputs(str, ofp);
27             fputc(ch, ofp);
28             lpos++;
29             [c];
30         } else {
31             if ([d]) {
32                 fputc('\n', ofp);
33                 lpos = 0;
34             }
35             str[sp++] = ch;
36         }
37     }
38     str[sp] = '\0';
39     fputs(str, ofp);
40     fclose(ifp);
41     fclose(ofp);
42 }`;
export const spring2014Pm9OriginalInput =
  'The    Information   Technology   Engineers\n' +
  '   Examination   was  first  administered  in  1969. In 1970,\n' +
  ' it became a national examination. \n' +
  '       Since its commencement, the examination has played   \n' +
  '    an important role   in the development of IT    engineers. \n';
export const spring2014Pm9WordExample = 'It is important  to master  a programming language.';
export const spring2014Pm9Pages = [
  page(46,
    p('次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。'),
    p('問9 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    heading('プログラムの説明'),
    p('関数 format_text は，印字したときに単語が行末で切れないようにテキストを編集してファイルに出力するプログラムである。'),
    p('（1）テキストに含まれる文字は，次のものである。\n① 英字 A～Z，a～z\n② 数字 0～9\n③ 記号 ! " # % & \' ( ) * + , - . / : ; < = > ? [ ] ^ _ { | } ~\n④ 空白文字\n⑤ 改行文字'),
    p('（2）単語は，空白文字及び改行文字を含まない文字列であり，空白文字又は改行文字で区切られている。単語の文字数は20以下とする。図1に，テキストに含まれる単語の例を示す。'),
    panel('words','図1 テキストに含まれる単語の例'),
    p('（3）改行文字を除き，1行分として印字できる文字数（以下，最大文字数という）をプログラムの引数で与えるが，その値は40以上とする。単語の途中で最大文字数を超える場合は，単語の直前に改行文字を出力し，その単語が次の行の先頭に印字されるようにする。'),
    p('（4）テキスト中の空白文字及び改行文字は，そのまま出力する。ただし，連続する')),
  page(47,
    p('空白文字を出力している途中で最大文字数を超える場合は改行文字を出力し，最大文字数を超える分は次の行の先頭から印字されるようにする。'),
    p('（5）関数 format_text の引数は次のとおりである。ここで，引数の値に誤りはないものとする。'),
    table('関数 format_text の引数',['引数','内容'],[
      ['in_file','編集前のテキスト（以下，入力テキストという）が格納されているファイル名'],
      ['out_file','編集後のテキスト（以下，出力テキストという）を格納するファイル名'],
      ['width','最大文字数'],
    ]),
    p('（6）プログラムを実行したときは，図2に示すようになる。'),
    panel('wrapping','図2 最大文字数を50とした場合の例')),
  page(48,heading('プログラム'),p('（行番号）'),code(spring2014Pm9Program,'c')),
  page(49,heading('設問1'),p('プログラム中の'+ask),bank('a'),bank('b'),bank('c'),bank('d'),
    heading('設問2'),p('次の記述中の'+ask),
    p('テキストの編集処理のうち，行頭の空白文字に関する処理を変更することになった。これに合わせて関数 format_text に，処理を追加する。ここで，プログラム中の［a］～［d］には正しい答えが入っているものとする。'),
    p('（1）テキストの編集処理の変更内容は，次のとおりである。\n① 入力テキスト中の1文字以上の連続する空白文字列で，印字したときに行頭に来る部分は出力しない。\n② 最初に出力する単語の場合，又は行の先頭に来る単語の場合で直前に出力した単語の最後の文字が“.”であったときは，単語の直前に空白文字を一つ出力する。'),
    p('（2）処理を変更したプログラムを実行したときは，図3に示すようになる。')),
  page(50,panel('indenting','図3 処理を変更し，最大文字数を50とした場合の例'),
    p('（3）処理の変更に対応するために，プログラムを表1のとおりに変更する。'),
    panel('edits','表1 プログラムの変更内容')),
  page(51,bank('e'),bank('f')),
];
export const spring2014Pm9Banks = {
  a: { options: ['lpos = 0','lpos = sp','lpos = width','lpos++','lpos += sp'] },
  b: { options: [String.raw`'\0'`,String.raw`'\n'`,"' '",'ch'] },
  c: { options: ['sp = 0','sp = lpos','sp++','str[lpos] = ch','str[sp++] = ch'] },
  d: { options: ['lpos > 0','lpos >= width','lpos > sp','sp > 0','(lpos + sp) > 0','(lpos + sp) >= width'] },
  e: { options: ['lpos == 0','lpos == sp','lpos != 0','lpos != sp','sp == 0','sp != 0'] },
  f: { options: ["lch = ' '","lch = '.'",'lch = ch',"str[sp++] = ' '",'str[sp++] = lch'] },
};
