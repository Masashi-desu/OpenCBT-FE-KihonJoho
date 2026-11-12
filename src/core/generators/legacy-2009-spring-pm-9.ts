import { code, p, table } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-spring-pm-09-13-support';

const cases = [
  { dirs: ['a', 'b', 'c', 'd', 'e', 'f'], files: ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'], up: 4, target: 'd', baseDepth: 3, suffix: 'd' },
  { dirs: ['m', 'n', 'p', 'q', 'r', 's'], files: ['log1.txt', 'log2.txt', 'log3.txt', 'log4.txt'], up: 2, target: 'r', baseDepth: 3, suffix: 'q' },
  { dirs: ['p', 'q', 'r', 's', 't', 'u'], files: ['data1.txt', 'data2.txt', 'data3.txt', 'data4.txt'], up: 1, target: 'u', baseDepth: 2, suffix: 't' },
  { dirs: ['k', 'l', 'm', 'n', 'p', 'q'], files: ['item1.txt', 'item2.txt', 'item3.txt', 'item4.txt'], up: 3, target: 'q', baseDepth: 2, suffix: 'p' },
];

export const pathTree = languageFigure(9, 'directory-tree', '図 階層構造をもつファイルシステムの例', index => {
  const { dirs: [a, b, c, d, e, f], files } = cases[index];
  return { kind: 'tree', nodes: [
    { label: '/', x: 362, y: 40, kind: 'directory' },
    { label: a, x: 260, y: 100, kind: 'directory', parent: 0 },
    { label: f, x: 485, y: 100, kind: 'directory', parent: 0 },
    { label: b, x: 148, y: 160, kind: 'directory', parent: 1 },
    { label: files[1], x: 260, y: 160, kind: 'file', parent: 1 },
    { label: d, x: 383, y: 160, kind: 'directory', parent: 1 },
    { label: c, x: 36, y: 220, kind: 'directory', parent: 3 },
    { label: files[0], x: 148, y: 220, kind: 'file', parent: 3 },
    { label: files[2], x: 260, y: 220, kind: 'file', parent: 3 },
    { label: e, x: 500, y: 220, kind: 'directory', parent: 5 },
    { label: files[3], x: 500, y: 280, kind: 'file', parent: 9 },
  ] };
});
export const q9Figures = [pathTree];

export const convertFirst = `#include <string.h>

void convert(const char*, const char*, char*);

void convert(const char *path, const char *base, char *result){

    const char *pp, *bp;
    char *rp;
    int length;

    /* path が絶対パス表記の場合 */
    if(*path == '/'){
        ［a］;
        return;
    }`;
export const convertLast = String.raw`    /* path がカレントディレクトリの場合 */
    if(!strcmp(path, ".") || !strcmp(path, "./")){
        ［b］;
        return;
    }

    length = strlen(base);
    bp = base + length;   /* bp は文字列 base の終端を指す。 */
    if(*(bp - 1) == '/')
        --bp;

    /* path の先頭部にある".."又は"../"を解析することで，
       base のパス表記のうち，どこまで result と共通になるかを調べる。 */
    for(pp = path; *pp != '\0' && *pp == '.';){
        if(!strncmp(pp, "../", 3)){
            pp += 3;
            while(bp > base && *--bp != '/');
        }else if(!strncmp(pp, "./", 2)){
            pp += 2;
        }else if(!strncmp(pp, "..\0", 3)){
            pp += 2;
            while(bp > base && *--bp != '/');
        }else{
            break;
        }
    }
    /* base のパス表記と共通な部分を result に複写する。 */
    length = ［c］;
    strncpy(result, base, length);

    rp = ［d］;
    *rp++ = '/';

    /* path の文字列のうち，先頭部分の"./"や"../"を除いた残りの
       部分（pp が指す文字列）を，result の文字列に追加する。 */
    strcpy(rp, pp);
    return;
}`;

const copy = ['strcpy(base, path)', 'strcpy(base, result)', 'strcpy(path, base)', 'strcpy(path, result)', 'strcpy(result, base)', 'strcpy(result, path)'];
const difference = ['bp - base', 'bp - path', 'pp - base', 'pp - path'];
const offset = ['base + length', 'bp + length', 'path + length', 'pp + length', 'result + length'];
const c = (source: string) => code(source, 'c');
const labels = 'アイウエオカ';

export const q9 = createLanguageDefinition(9, 'C：相対パスから絶対パスへの変換', 'ファイルシステム・親階層の回数・基準パス', 'abcdefg',
  '設問1 aカ bオ cア dオ／設問2 eオ fイ gア',
  'Cの字下げ，親・現在・絶対パス，変換例と引数列を維持。親移動がルートに達する場合と達しない場合，基準の末尾の区切り，追記するパスを組み合わせる。',
  index => {
    const { dirs: [a, b, leaf, d, e], files, up, target, baseDepth, suffix } = cases[index];
    const original = index === 0;
    const stem = '/' + [a, b, leaf].slice(0, baseDepth).join('/');
    const distant = '../'.repeat(up) + target + '/';
    const remained = [a, b, leaf].slice(0, Math.max(0, baseDepth - up));
    const resolved = '/' + [...remained, target].join('/') + '/';
    const distractors = ['../' + target + '/', distant, '/', '/../' + target + '/', '/' + target + '/', target + '/'];
    if (!original) {
      // The root- and path-related alternatives keep their roles when the result stays below root.
      distractors[0] = '/'+ a + '/' + target + '/';
      if (!distractors.includes(resolved)) distractors[3] = resolved;
    }
    const short = stem + '/' + suffix;
    const merged = stem + suffix;
    const exampleBase = '/' + a + '/' + d + '/' + e;
    const inner = '/' + a + '/' + b;
    const current = inner + '/' + leaf + '/';
    const tableOne = [
      ['../../' + b + '/' + leaf + '/', exampleBase + '/', current],
      [b + '/' + files[0], '/' + a + '/', inner + '/' + files[0]],
      [leaf + '/', inner + '/', current],
      [files[0], inner + '/', inner + '/' + files[0]],
      ['./', current, current],
      [exampleBase + '/' + files[3], current, exampleBase + '/' + files[3]],
    ];
    return {
      pages: [
        page(34, [
          p('次の問9から問13までの5問については，この中から1問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。'),
          p('問9 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'), p('与えられたパスを絶対パスに変換する関数convertである。'),
          p('階層構造をもつファイルシステムにおいて，ファイルやディレクトリを特定する文字列をパスという。ルートディレクトリを基準としたパスを絶対パスと呼び，“/”から始まり，各階層を“/”で区切っていく。与えられたパスがディレクトリのとき，最後の“/”はあってもなくてもよい。例えば，図のディレクトリ' + e + 'の絶対パスは“' + exampleBase + '”又は“' + exampleBase + '/”で示す。'),
          p('一方，カレントディレクトリを基準としたパスを相対パスと呼び，相対パスを指定するときに階層を一つ上にたどる場合は“..”を用いる。例えば，図においてディレクトリ' + leaf + 'をカレントディレクトリにした場合，ファイル' + files[0] + 'の相対パスは“../' + files[0] + '”，ディレクトリ' + e + 'の相対パスは“../../' + d + '/' + e + '”又は“../../' + d + '/' + e + '/”となる。また，カレントディレクトリ自身は“.”又は“./”で示す。'),
          pathTree.block(index),
        ]),
        page(35, [
          p('（1）関数の仕様は，次のとおりである。'),
          c('void convert(const char *path,\n             const char *base,\n             char *result);'),
          p('引数：path 変換前のパス，base カレントディレクトリの絶対パス，result 変換後の絶対パス。'),
          p('機能：pathが相対パス表記であれば，baseを基準にした絶対パス表記に変換し，resultに格納する。pathが絶対パス表記であれば，resultにはbaseに関係なくpathをそのまま格納する。'),
          p('返却値：なし。'),
          p('ただし，resultが参照する領域は，変換後の文字列を格納するのに十分であるとする。また，冗長なパス又はパスとして認識できない文字列が引数として与えられることはないものとする。'),
          p('（2）ファイルシステム上に，指定されたディレクトリやファイルが実際に存在するかどうかのチェックは行わない。'),
          p('（3）変換例を表1に示す。'), table('表1 変換例', ['path', 'base', 'result'], tableOne),
        ]),
        page(36, [
          p('（4）次のライブラリ関数を用いる。'),
          c('unsigned int strlen(const char *s);'), p('機能：文字列sの長さを計算する。返却値：終端を示すナル文字に先行する文字の個数を返す。'),
          c('int strcmp(const char *s1, const char *s2);'), p('機能：文字列s1と文字列s2を比較する。返却値：s1とs2が同一文字列の場合は0，それ以外の場合は0以外を返す。'),
          c('int strncmp(const char *s1, const char *s2, int n);'), p('機能：文字列s1と文字列s2を先頭からn文字，又はナル文字までを比較する。返却値：比較したn文字が同一の場合は0を，それ以外の場合（比較が途中で終了した場合も含む）は0以外を返す。'),
          c('char *strcpy(char *s1, const char *s2);'), p('機能：文字列s1に文字列s2をナル文字まで複写する。返却値：s1'),
          c('char *strncpy(char *s1, const char *s2, int n);'), p('機能：文字列s1に文字列s2をn文字複写する。s2の長さがn以上の場合はn文字目までを複写し，n未満の場合は残りをナル文字で埋める。返却値：s1'),
          p('〔プログラム〕'), c(convertFirst),
        ]),
        page(37, [c(convertLast), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [bank(1, 'ab', copy, 'カオ', 'c')]),
        page(38, [
          p('設問2 表2の引数列で関数convertを呼んだときのプログラムの動作について，表2中の空欄に入れる正しい答えを，解答群の中から選べ。ただし，プログラム中の［a］〜［d］には正しい答えが入っているものとする。'),
          table('表2 引数列', ['path', 'base', 'result'], [[distant, stem + '/', '［e］'], [suffix + '/', stem, '［f］'], [suffix, stem + '/', '［g］']]),
        ], [bank(1, 'c', difference, 'ア', 'c'), bank(1, 'd', offset, 'オ', 'c'),
          bank(2, 'e', distractors, labels[distractors.indexOf(resolved)], 'c'),
          bank(2, 'fg', [short, short + '/', merged, merged + '/', suffix, suffix + '/'], 'イア', 'c')], [-1, -1, 1, 1]),
      ],
      explanation: 'a：絶対表記ならpathを，b：現在位置の指定ならbaseを，どちらもresultへナル文字まで複写する。'
        + 'c：baseの先頭から共通部分の終端bpまでの距離を求める。d：その文字数だけ書いたresultの直後から，区切りと残りのpathを書き込む。'
        + 'e：親への移動はルートで止まり，残った階層に' + target + '/を続けると' + resolved + 'となる。f：baseの最後に必要な区切りを付け，入力の末尾スラッシュを残すので'
        + short + '/。g：baseの末尾の区切りを重複させず，入力の末尾にスラッシュがないので' + short + 'となる。',
    };
  });
