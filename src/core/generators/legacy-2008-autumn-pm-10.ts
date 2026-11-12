import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page, standaloneBank } from './legacy-2008-autumn-pm-10-13-support';

const samplePairs = [
  ['FE', ' 2', '00', '8 ', 'FA', 'LL', ' E', 'XA', 'M.'],
  ['79', '8A', '66', 'GX', 'FG', 'WW', 'W.', '7F', '6E'],
  ['EA', 'E0', 'EE', '6V', '68', '88', 'XH', '7F', '6.'],
  ['EF', 'A0', 'FF', 'B7', '76', 'BB', 'Y8', 'N7', '9H'],
];
const sampleBreaks = [7, 5, 9, 3];
const alphabet = Array.from({ length: 95 }, (_, index) => String.fromCharCode(32 + index))
  .filter(symbol => !['$', '@', String.fromCharCode(96)].includes(symbol));
const shown = ['78923456', ' 01XYZ,.', 'NVWIJKLM', 'FGHABCDE'];
const known = new Set(shown.flatMap(row => [...row]));
const remainder = alphabet.filter(symbol => !known.has(symbol));
const rowWidth = 23;
const rowCount = 4;
const sourceTable = shown.map((row, i) => [...row.slice(0, 3), ...remainder.slice(i * 15, (i + 1) * 15), ...row.slice(3)]);
const steps = (index: number) => ({ row: index >= 2 ? -1 : 1, column: index % 2 === 1 ? -1 : 1 });
const display = (text: string) => text.replaceAll(' ', '△');
const wrap = (index: number, step: number, max: number) => (index + step + max) % max;

function pairResult(pair: string, index: number) {
  const { row, column } = steps(index);
  const points = [...pair].map(character => {
    const r = sourceTable.findIndex(line => line.includes(character));
    return { r, c: sourceTable[r].indexOf(character) };
  });
  const [left, right] = points;
  const sameRow = left.r === right.r;
  const sameColumn = left.c === right.c;
  const kind = sameRow && sameColumn ? 0 : sameRow ? 1 : sameColumn ? 2 : 3;
  const result = points.map(({ r, c }, i) => sourceTable[sameColumn ? wrap(r, row, rowCount) : r]
    [sameRow ? wrap(c, column, rowWidth) : points[1 - i].c]).join('');
  return { pair, kind, result };
}

const rules = languageFigure(10, 'substitution-steps', '図1 換字の例', index => {
  const { row, column } = steps(index);
  const vertical = row === 1 ? '下' : '上';
  const horizontal = column === 1 ? '右' : '左';
  return { kind: 'cipher-steps', rowStep: row, columnStep: column,
    alt: '4枚の換字表。行は0〜3，列は0〜22。③同一文字（◇）は1行' + vertical + 'で1列' + horizontal + '（◆）へ移す。④同じ行の○と□を各々1列' +
      horizontal + 'の●と■にする。⑤同じ列の○と□を各々1行' + vertical + 'の●と■にする。⑥○と□を各々同じ行の相手の列の●と■へ移す。' };
});
const examples = languageFigure(10, 'cipher-example', '図2 換字表を用いた暗号化の例', index => {
  const outputs = samplePairs[index].map(pair => pairResult(pair, index));
  const text = display(outputs.map(row => row.pair).join(''));
  const cipher = display(outputs.map(row => row.result).join(''));
  const tableRows = shown.map((row, rowIndex) => [String(rowIndex), ...row.slice(0, 3), '…', ...row.slice(3)].map(display));
  const categories = ['2文字が同一の場合', '2文字が同じ行にある場合', '2文字が同じ列にある場合', 'その他の場合'];
  const groupOrder = [0, 2, 1, 3];
  const exampleRows = groupOrder.flatMap(kind => outputs.filter(row => row.kind === kind).map(row => [categories[kind], ...display(row.pair), '→', ...display(row.result)]));
  return {
    kind: 'tables', tables: [
      { rows: [['平文：', text], ['暗号文：', cipher]] },
      { label: 'ctbl［行］［列］', headings: ['', '0', '1', '2', '…', '18', '19', '20', '21', '22'], rows: tableRows },
      { headings: ['場合', '平文', '', '', '暗号文', ''], rows: exampleRows },
    ],
    alt: '平文：' + text + '。暗号文：' + cipher + '。ctblの列0，1，2，…，18，19，20，21，22。各行：' +
      tableRows.map(row => row.join(' ')).join('／') + '。換字：' +
      exampleRows.map(([category, a, b, , c, d]) => category + ' ' + a + b + '→' + c + d).join('。') + '。△は空白文字。',
  };
});
const newExample = languageFigure(10, 'newlines-example', '図3 新しい方法での暗号化の例', index => {
  const outputs = samplePairs[index].map(pair => pairResult(pair, index));
  const plain = display(outputs.map(row => row.pair).join(''));
  const cipher = display(outputs.map(row => row.result).join(''));
  const at = sampleBreaks[index];
  const putBreaks = (value: string) => value.slice(0, at) + '↓\n      ↓\n      ' + value.slice(at) + '↓';
  const text = '平文：' + putBreaks(plain) + '\n\n暗号文：' + putBreaks(cipher);
  return { kind: 'output', text, alt: text + '\n△は空白文字，↓は改行文字。' };
});

const programStart = ` 1  #include <stdio.h>
 2
 3  #define ROWS  4    /* 換字表の行数 */
 4  #define COLS 23    /* 換字表の列数 */
 5
 6  void encrypt_text(const char *, const char *,
 7                    const char[ROWS][COLS]);
 8
 9  void encrypt_text(const char *in_filename,
10                    const char *out_filename,
11                    const char ctbl[ROWS][COLS]){
12      FILE *ifp, *ofp;
13      char ch[2];
14      int col[2], row[2], flg, i, sts;
15
16      ifp = fopen(in_filename, "r");
17      ofp = fopen(out_filename, "w");`;
const offset = (axis: 'row' | 'col', index: number, step: number) =>
  axis + '[' + index + ']+' + (step === 1 ? '1' : (axis === 'row' ? 'ROWS' : 'COLS') + '-1');

function programBody(index: number) {
  const { row, column } = steps(index);
  return `18      do{
19          sts = fgetc(ifp);
20          if(sts != EOF){
21              ch[0] = sts;
22              sts = fgetc(ifp);
23              if(［a］){    /* 文字数が奇数の場合 */
24                  ch[1] = ' ';
25              }else{
26                  ch[1] = sts;
27              }
28              for(i = 0; i < 2; i++){
29                  flg = 0;
30                  for(row[i] = 0; row[i] < ROWS; row[i]++){
31                      for(col[i] = 0; col[i] < COLS; col[i]++){
32                          if(ch[i] == ctbl[row[i]][col[i]]){
33                              flg = 1;
34                              break;
35                          }
36                      }
37                      if(flg != 0) break;
38                  }
39              }
40              if(［b］){
41                  if(［c］){    /* 2文字が同一の場合 */
42                      ch[0] = ch[1] = ［d］;
43                  }else{        /* 2文字が同じ行にある場合 */
44                      ch[0] = ctbl[row[0]][(${offset('col', 0, column)}) % COLS];
45                      ch[1] = ctbl[row[1]][(${offset('col', 1, column)}) % COLS];
46                  }
47              }else if(［c］){    /* 2文字が同じ列にある場合 */
48                  ch[0] = ctbl[(${offset('row', 0, row)}) % ROWS][col[0]];
49                  ch[1] = ctbl[(${offset('row', 1, row)}) % ROWS][col[1]];
50              }else{
51                  ch[0] = ctbl[row[0]][col[1]];
52                  ch[1] = ctbl[row[1]][col[0]];
53              }
54              fputc(ch[0], ofp);
55              fputc(ch[1], ofp);
56          }
57      }while(sts != EOF);
58      fclose(ifp);
59      fclose(ofp);
60  }`;
}
const nl = String.raw`'\n'`;
const changes = [
  ['行番号14と15の間に追加', 'int cnt2;'],
  ['行番号19を変更', `sts = fgetc(ifp);
while((char)sts == ${nl}){
    fputc(${nl}, ofp);
    sts = fgetc(ifp);
}`],
  ['行番号22を変更', `cnt2 = 0;
sts = fgetc(ifp);
while((char)sts == ${nl}){
    cnt2++;
    sts = fgetc(ifp);
}`],
  ['［e］の間に追加', `for( ; cnt2 > 0; cnt2--){
    fputc(${nl}, ofp);
}`],
];

const modifications = languageFigure(10, 'program-modifications', '表 プログラムの変更内容', () => ({
  kind: 'tables', tables: [{ headings: ['処置', '変更内容'], rows: changes, codeColumns: [1] }],
  alt: changes.map(([position, source]) => position + '\n' + source).join('\n\n'),
}));
export const q10Figures = [rules, examples, newExample, modifications];

export const q10 = createLanguageDefinition(10, 'C：換字表による2文字ずつの暗号化', '換字の方向と改行の位置', 'abcde',
  '設問1 aカ bカ cエ dエ／設問2 eイ',
  '4行23列と92文字、2文字ずつの4分岐、周期境界・奇数時の空白・改行保持と、60行・変更表・5欄を保持。行と列をずらす方向、全分岐の例と改行位置を連動させる。',
  index => {
    const { row, column } = steps(index);
    const vertical = row === 1 ? '下' : '上';
    const horizontal = column === 1 ? '右' : '左';
    const rowOffset = offset('row', 0, row);
    const columnOffset = offset('col', 0, column);
    const rowUnit = row === 1 ? '+1' : '-1';
    const columnUnit = column === 1 ? '+1' : '-1';
    const chars = alphabet.filter(character => !/^[A-Za-z0-9 ]$/.test(character));
    return {
      pages: [
        page(38, [
          p('問10 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('与えられた平文を，換字表を用いて暗号文に変換する関数encrypt_textである。'),
          p('（1）関数encrypt_textの引数は，次のとおりである。ただし，ファイル名に誤りはないものとする。'),
          code('in_filename   平文が格納されているファイル名\nout_filename  暗号文を格納するファイル名\nctbl          換字表', 'text'),
          p('（2）平文に含まれるものは，次の92種類の文字である。'),
          p('① 英字 A〜Z，a〜z\n② 数字 0〜9\n③ 記号 ' + chars.join(' ') + '\n④ 空白文字'),
          p('（3）換字表は，平文に含まれる92種類の文字を格納した4行23列の2次元文字型配列である。換字表のすべての要素には，異なる文字が格納される。'),
          p('（4）換字による暗号化は，次のとおりに行う。ただし，換字表の最下行（行3）の下には最上行（行0）が，最右列（列22）の右には最左列（列0）があるものとして処理を行う。' +
            (index === 0 ? '' : ' 上方向・左方向にも同様につながり，行0の上には行3，列0の左には列22がある。')),
          p('① 平文の先頭から2文字ずつを取り出し，②〜⑥の処理を行う。平文の文字数が奇数の場合は，最後の1文字について，後ろに空白文字1文字を追加して2文字にして処理を行う。'),
          p('② それぞれの文字について，換字表の中の位置（行と列）を求める。'),
          p('③ 2文字が同じ位置にある（同一の文字である）場合\nそれぞれの文字を，換字表の' + horizontal + vertical + '（1行' + vertical + 'で1列' + horizontal + '）にある文字に置き換える。換字の例を図1中の③に示す。'),
        ]),
        page(39, [
          p('④ 2文字が同じ行にある場合\nそれぞれの文字を，換字表の' + horizontal + '隣（同じ行の1列' + horizontal + '）にある文字に置き換える。換字の例を図1中の④に示す。'),
          p('⑤ 2文字が同じ列にある場合\nそれぞれの文字を，換字表の真' + vertical + '（1行' + vertical + 'の同じ列）にある文字に置き換える。換字の例を図1中の⑤に示す。'),
          p('⑥ その他の場合\nそれぞれの文字を，換字表の同じ行で，他方の文字と同じ列にある文字に置き換える。換字の例を図1中の⑥に示す。'),
          rules.block(index),
        ]),
        page(40, [
          p('（5）換字表を用いた暗号化の例を図2に示す。'), examples.block(index),
          p('〔プログラム〕（行番号）'), code(programStart, 'c'),
        ]),
        page(41, [code(programBody(index), 'c')]),
        page(42, [
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2 次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('（1）平文に含まれる文字として改行文字を追加し，換字による暗号化を次のとおりに変更する。'),
          p('（新しい方法）平文から改行文字を除いた文を従来の換字規則で暗号化し，平文と同じ位置に改行文字を挿入したものを暗号文とする。'),
        ], [
          bank(1, 'a', ["ch[0] != ' '", 'ch[0] != ch[1]', "ch[0] == ' '", 'ch[0] == ch[1]', 'sts != EOF', 'sts == EOF'], 'カ', 'c'),
          bank(1, 'bc', ['ch[0] != ch[1]', 'ch[0] == ch[1]', 'col[0] != col[1]', 'col[0] == col[1]', 'row[0] != row[1]', 'row[0] == row[1]'], 'カエ', 'c'),
          bank(1, 'd', [
            'ctbl[(' + columnOffset + ') % ROWS][(' + rowOffset + ') % COLS]',
            'ctbl[col[0]' + columnUnit + '][row[0]' + rowUnit + ']', 'ctbl[col[0]][row[0]]',
            'ctbl[(' + rowOffset + ') % ROWS][(' + columnOffset + ') % COLS]',
            'ctbl[row[0]' + rowUnit + '][col[0]' + columnUnit + ']',
          ], 'エ', 'c'),
        ], [0, 0, 0]),
        page(43, [
          p('（2）図2の換字表を用いた新しい方法での暗号化の例を図3に示す。'), newExample.block(index),
          p('（3）これに対応するために，プログラムを表のとおりに変更する。'),
          modifications.block(index),
        ], [standaloneBank(2, [53, 54, 55, 56, 57].map(line => '行番号' + line + 'と' + (line + 1)), 'イ')].map(bank => ({ ...bank, fields: 'e' }))),
      ],
      explanation: 'a：2文字目を読み込めずstsがEOFなら，末尾を空白で補う。b：先に2文字の行番号が等しいかを調べる。c：列番号も等しければ同一文字，行が異なり列番号が等しければ同じ列の文字である。d：同一文字は行を1行' + vertical +
        '，列を1列' + horizontal + 'に移す。行・列をそれぞれの要素数で循環させる。e：2文字の間で読み飛ばした改行は，1文字目の暗号文字を出す行54と，2文字目を出す行55の間に出力する。',
    };
  });
