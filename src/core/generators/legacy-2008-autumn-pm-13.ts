import { code, p } from './definition';
import { bank, createLanguageDefinition, keyFor, languageFigure, page } from './legacy-2008-autumn-pm-10-13-support';
import { autumn2008PmPageAssetId, autumn2008PmReference } from './legacy-2008-autumn-pm-materials';

const references = [64, 65, 66, 67, 68, 69];
const responseCases = [
  [[1, 4, 6, 7], [1, 2, 3, 4], [1, 3, 6]],
  [[2, 4, 7], [3, 6, 8], [2, 4, 5]],
  [[], [1, 2, 9], [2, 10]],
  [[1, 5, 16], [1, 4], [5, 11, 16]],
];
const bits = (positions: number[]) => Array.from({ length: 16 }, (_, index) => positions.includes(index + 1) ? '1' : '0');
const graph = languageFigure(13, 'bar-chart', '図1 グラフの表示形式', () => {
  const columns = [1, 2, 3, 4, 5, 6, 15, 16];
  const heights = [2, 3, 1, 9, 5, 8, 6, 8];
  const withEllipsis = (groups: string[][]) => [...groups.slice(0, 6).flat(), '…', ...groups.slice(6).flat()];
  const rows = Array.from({ length: 9 }, (_, row) => withEllipsis(heights.map(height => ['', height >= 9 - row ? '*' : '', ''])));
  rows.push(withEllipsis(columns.map(number => [...String(number).padStart(2, '0'), ''])));
  return { kind: 'tables', tables: [{ rows }], alt: '横軸は項目01，02，03，04，05，06，…，15，16。各項目は3文字幅で中央の1文字を使い，' +
    '下からそれぞれ' + heights.join('，') + '個の「*」を縦に並べる。「…」は07〜14の省略で，印のないますは空白文字。' };
});
const layout = languageFigure(13, 'one-response-word', '図2 1人分の回答の格納形式', () => {
  const values = [...'1011000101111010'];
  const headings = Array.from({ length: 16 }, (_, i) => i < 6 || i >= 14 ? String(i + 1) : i === 9 ? '…' : '');
  return { kind: 'tables', tables: [{ headings, rows: [values] }],
    alt: '項目番号1〜16が1語の左端から並ぶ。格納例は左から' + values.join('，') + '。' };
});
const responses = languageFigure(13, 'response-memory', '図3 主プログラムから渡されるn人分の回答', () => ({
  kind: 'tables', tables: [{ rows: [['（GR1）＋0', '', '1人目の回答'], ['＋1', '', '2人目の回答'], ['⋮', '⋮', '⋮'], ['＋n−1', '', 'n人目の回答']] }],
  alt: 'アドレス（GR1）＋0に1人目，＋1に2人目，…，＋n−1にn人目の回答を1語ずつ格納。',
}));
const counter = languageFigure(13, 'counter-memory', '図4 集計結果を格納するカウンタ領域', () => ({
  kind: 'tables', tables: [{ rows: [['COUNTR＋0', 'q₁', '項目1に“はい”と答えた人数'], ['＋1', 'q₂', '項目2に“はい”と答えた人数'], ['⋮', '⋮', '⋮'], ['＋15', 'q₁₆', '項目16に“はい”と答えた人数']] }],
  alt: 'COUNTR＋0のq₁は項目1，＋1のq₂は項目2，…，＋15のq₁₆は項目16に「はい」と答えた人数。',
}));
const given = languageFigure(13, 'three-response-words', '図5 3人分の回答', index => ({
  kind: 'tables', tables: [{ rows: responseCases[index].map(bits) }],
  alt: responseCases[index].map((row, person) => (person + 1) + '人目：' + bits(row).join(' ')).join('。') + '。',
}));
export const q13Figures = [graph, layout, responses, counter, given];

const programA = ` 1  SUMMARY START
 2          RPUSH
 3  ; カウンタ領域と出力バッファを初期化
 4          LD      GR2,=0
 5          LD      GR3,=' '
 6          LD      GR4,=0          ; ループカウンタ
 7          LAD     GR5,PBUF        ; 出力バッファのポインタ
 8  LOOP1   ST      GR2,COUNTR,GR4   ; カウンタ領域を初期化
 9          ST      GR3,0,GR5       ; 出力バッファを空白で初期化
10          ST      GR3,1,GR5
11          ST      GR3,2,GR5
12          ［a］                  ; 出力バッファのポインタを更新
13          LAD     GR4,1,GR4       ; ループカウンタを更新
14          CPA     GR4,=16
15          JMI     LOOP1
16  ; 項目ごとに“はい”と答えた人数を集計
17          LD      GR5,=0          ; GR5：“はい”の人数の最大値
18  LOOP2   LD      GR4,=0          ; カウンタ領域のポインタ
19          LD      GR2,0,GR1       ; GR2←1人分の回答
20  LOOP3   SLL     GR2,1           ; 回答は“はい”？
21          ［b］
22          JZE     NEXTW           ; 残りの項目はすべて“いいえ”
23          JUMP    OFF`;
const programB = `24  ON      LD      GR3,COUNTR,GR4   ; カウンタに1を加算
25          ADDA    GR3,=1
26          ST      GR3,COUNTR,GR4
27          CPA     GR3,GR5         ; 最大値と比較
28          JPL     CHANGE
29          JUMP    OFF
30  CHANGE  LD      GR5,GR3         ; 最大値を入替え
31  OFF     LAD     GR4,1,GR4       ; 次の項目
32          JUMP    LOOP3
33  NEXTW   ［c］
34          SUBA    GR0,=1          ; 全回答処理済？
35          JPL     LOOP2
36  ; 集計結果を棒グラフで出力
37          LD      GR5,GR5
38          JZE     FIN
39          LD      GR0,='*'
40  LOOP4   LD      GR3,=1          ; 出力バッファのポインタ
41          LD      GR4,=0          ; カウンタ領域のポインタ
42  LOOP5   CPA     GR5,COUNTR,GR4  ; “はい”の人数と比較
43          JNZ     NOTSET
44          ST      GR0,PBUF,GR3    ; 出力バッファに“*”を設定
45  NOTSET  LAD     GR3,3,GR3       ; 出力バッファのポインタを更新
46          LAD     GR4,1,GR4       ; カウンタ領域のポインタを更新
47          CPA     GR4,=16
48          JMI     LOOP5
49          OUT     PBUF,PLEN
50          SUBA    GR5,=1
51          ［d］
52  FIN     OUT     FOOTER,PLEN
53          RPOP
54          RET
55  COUNTR  DS      16              ; カウンタ領域
56  PLEN    DC      48
57  PBUF    DS      48              ; 出力バッファ
58  FOOTER  DC      '01 02 03 04 05 06 07 08 09 10 11 12 13 '
59          DC      '14 15 16 '
60          END`;

export const q13 = createLanguageDefinition(13, 'CASL II：アンケートのビット集計とグラフ出力', '3人分の回答ビット列', 'abcdef',
  '設問1 aウ bウ cイ dア／設問2 eカ fイ',
  '16項目の1語、左端からの順序、1≦n≦100、CASL IIの60行と付属資料、六つの解答欄を保持。図5の3語を変えて末尾の1の位置と、回答が重なる項目を変える。全0の語と最下位の1を含む。付属資料のJIS X0201符号表・説明を使用しない。',
  index => {
    const words = responseCases[index];
    const shifts = words.map(row => Math.max(0, ...row) + 1);
    const e = shifts.reduce((sum, shift) => sum + shift, 0);
    const f = new Set(words.flat()).size;
    const choices = [
      [4, 6, 11, 16, 17, 20, 48],
      [5, 7, 9, 16, 20, 23, 48],
      [3, 4, 5, 16, 19, 22, 48],
      [3, 5, 8, 16, 36, 39, 48],
    ][index];
    const keys = keyFor(choices.indexOf(e)) + keyFor(choices.indexOf(f));
    return {
      pages: [
        page(56, [
          p('問13 次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('アンケートに対するn人分の回答を集計し，集計結果をグラフで出力する副プログラムSUMMARYである。'),
          p('アンケートの質問は16項目からなり，“はい”又は“いいえ”で答える。副プログラムSUMMARYは，項目ごとに“はい”と答えた人数を集計し，棒グラフで出力する。このグラフの表示形式を図1に示す。横軸は項目番号，縦軸は“はい”と答えた人数であり，一つの“*”が1人を表す。□は空白文字を表す。'),
          graph.block(index),
          p('（1）1人分の回答は図2のように1語に格納され，左端のビットから順に項目番号1〜16に対応している。“はい”が1，“いいえ”が0として格納されている。'),
          layout.block(index),
          p('（2）n人分の回答が，図3のように連続するn語の領域に格納され，その先頭アドレスがGR1に設定されて主プログラムから渡される。'),
          responses.block(index),
        ]),
        page(57, [
          p('（3）値n（1≦n≦100）はGR0に設定されて，主プログラムから渡される。'),
          p('（4）副プログラムSUMMARYは，まず，項目ごとに“はい”と答えた人数を数え，図4に示す16語の領域COUNTRに格納する。'),
          counter.block(index),
          p('次に，この集計結果を図1で示した棒グラフで出力する。グラフは，上から順に1行ずつ出力する（出力行数は，q₁〜q₁₆の最大値に1を加えたものとなる）。'),
          p('（5）副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('〔プログラム〕（行番号）'), code(programA, 'casl2'),
        ]),
        page(58, [
          code(programB, 'casl2'),
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [bank(1, 'a', [1, 2, 3, 4].map(step => 'LAD GR5,' + step + ',GR5'), 'ウ', 'casl2')]),
        page(59, [
          p('設問2 次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('主プログラムから渡されるnの値は3で，3人分の回答は図5のとおりとする。'),
          given.block(index),
          p('このとき，行番号20のSLL命令は［e］回実行され，行番号44のST命令は［f］回実行される。'),
        ], [
          bank(1, 'b', ['JMI ON', 'JNZ ON', 'JOV ON', 'JPL ON'], 'ウ', 'casl2'),
          bank(1, 'c', ['LAD GR1,-1,GR1', 'LAD GR1,1,GR1', 'LAD GR2,-1,GR2', 'LAD GR2,1,GR2'], 'イ', 'casl2'),
          bank(1, 'd', ['JPL LOOP4', 'JPL LOOP5', 'JZE LOOP4', 'JZE LOOP5'], 'ア', 'casl2'),
          { ...bank(2, 'ef', choices.map(String), keys), label: '解答群' },
        ], [-1, -1, -1, 3]),
      ],
      contexts: [autumn2008PmReference('アセンブラ言語の仕様（COMET II・CASL II）', references)],
      explanation: 'a：1項目は表示の3文字を使うので，初期化ポインタを3進める。b：SLLで左端から送り出したビットがOFに入る。OF＝1ならJOVで該当項目を加算する。c：次の回答は連続領域の次の1語なのでGR1を1進める。d：残りの高さが正の間は，各行の位置を初期化するLOOP4へ戻る。e：各語の最後の1を送り出した後，0を送り出して残りが0と分かるまで進む。各回数は' +
        shifts.join('，') + 'で，合計は' + e + '回。f：各項目はその人数と現在の行が等しくなったとき1回だけ「*」を設定し，以降の行にもその印が残る。1人以上が「はい」と答えた' + f + '項目で計' + f + '回実行する。',
    };
  }, { fixedReferenceAssetIds: references.map(autumn2008PmPageAssetId) });
