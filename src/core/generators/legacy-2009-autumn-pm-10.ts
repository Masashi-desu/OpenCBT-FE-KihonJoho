import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-autumn-pm-09-13-support';

const branches = ['A', 'B', 'C', 'D', 'E'];
const cases = [
  { current: [23000000, 10200000, 32100000, 18700000, 9800000], previous: [23720000, 10310000, 28410000, 18540000, 10550000], sort: '売上金額の降順', key: 'ウ' },
  { current: [27000000, 14400000, 32000000, 12200000, 19500000], previous: [25000000, 16000000, 30000000, 10000000, 20000000], sort: '売上金額の昇順', key: 'ア' },
  { current: [11500000, 28300000, 10500000, 24500000, 18300000], previous: [0, 26000000, 10000000, 25100000, 15900000], sort: '支店コードの昇順', key: 'イ' },
  { current: [16500000, 31400000, 22700000, 20400000, 14700000], previous: [0, 0, 0, 0, 0], sort: '支店コードの降順', key: 'エ' },
];
const amountText = (value: number) => value.toLocaleString('en-US').padStart(11);
const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);
const ratioText = (current: number, previous: number) => previous === 0
  ? ' ( - %)' : ' (' + String(Math.floor(current * 100 / previous)).padStart(3) + '%)';
function output(index: number, ratio: boolean) {
  const { current, previous, key } = cases[index];
  const order = [0, 1, 2, 3, 4];
  if (key === 'ア') order.sort((a, b) => current[a] - current[b]);
  if (key === 'ウ') order.sort((a, b) => current[b] - current[a]);
  if (key === 'エ') order.reverse();
  const lines = order.map(branch => branches[branch] + '-BRANCH   ' + amountText(current[branch])
    + (ratio ? ratioText(current[branch], previous[branch]) : ''));
  const sum = total(current);
  return [...lines, '-'.repeat(ratio ? 29 : 22), 'TOTAL      ' + amountText(sum)
    + (ratio ? ratioText(sum, total(previous)) : '')].join('\n');
}

const salesLayout = languageFigure(10, 'sales-record', '図1 売上伝票ファイルのレコード様式', () => ({
  kind: 'tables',
  tables: [{ headers: ['伝票番号', '売上日', '支店コード', '売上金額'], rows: [['6けた', '8けた', '2けた', '6けた']] }],
}));
const masterLayout = languageFigure(10, 'master-record', '図2 売上マスタファイルのレコード様式', () => ({
  kind: 'tables',
  tables: [{
    headers: ['売上年月', '売上金額', '', '', '', '', '売上合計金額'],
    rows: [['6けた', ...branches.map(branch => branch + '支店\n8けた'), '9けた']],
    merges: [{ row: -1, column: 1, rowSpan: 1, colSpan: 5 }],
  }],
}));
const currentOutput = languageFigure(10, 'monthly-output', '図3 集計結果の表示例', index => ({
  kind: 'output', text: output(index, false),
}));
const priorOutput = languageFigure(10, 'comparative-output', '図4 対前年同月比を追加した集計結果の表示例', index => ({
  kind: 'output', text: output(index, true),
}));

const declarations = ` 1  DATA DIVISION.
 2  FILE SECTION.
 3  SD  SORT-FILE.
 4  01  SORT-REC.
 5      02  SORT-BR            PIC 9(2).
 6      02  SORT-AMOUNT        PIC 9(8).
 7  FD  SALES-FILE.
 8  01  SALES-REC.
 9      02  SALES-NO           PIC 9(6).
10      02  SALES-DATE.
11          03  SALES-YYYYMM   PIC 9(6).
12          03  SALES-DD       PIC 9(2).
13      02  SALES-BR           PIC 9(2).
14      02  SALES-AMOUNT       PIC 9(6).
15  FD  MAST-FILE.
16  01  MAST-REC.
17      02  MAST-KEY.
18          03  KEY-YYYYMM     PIC 9(6).
19      02                     PIC X(49).
20  WORKING-STORAGE SECTION.
21  01  W-MAST.
22      02  MAST-YYYYMM        PIC 9(6).
23      02  MAST-BRANCH.
24          03  MAST-AMOUNT    PIC 9(8) OCCURS 5.
25          03  MAST-TOTAL     PIC 9(9).
26  77  CNT                    PIC 9(2).
27  77  AMOUNT                 PIC ZZZ,ZZZ,ZZ9.
28  77  READ-FLAG              PIC X(1) VALUE SPACE.
29      88  DATA-EOF           VALUE "E".
30  77  SORT-FLAG              PIC X(1) VALUE SPACE.
31      88  SORT-EOF           VALUE "E".`;
const procedure = `32  01  BRANCH                 PIC X(55) VALUE
33          "A-BRANCH   B-BRANCH   C-BRANCH   D-BRANCH   E-BRANCH".
34  01  HEADER REDEFINES BRANCH.
35      02  BR-NAME            PIC X(11) OCCURS 5.
36  PROCEDURE DIVISION.
37  MAIN-PROC.
38      INITIALIZE W-MAST.
39      OPEN INPUT SALES-FILE I-O MAST-FILE.
40      READ SALES-FILE
41           AT END     SET DATA-EOF TO TRUE
42           NOT AT END ［a］
43                      MOVE SALES-AMOUNT TO MAST-AMOUNT(SALES-BR)
44      END-READ.
45      PERFORM UNTIL DATA-EOF
46          READ SALES-FILE
47               AT END     SET DATA-EOF TO TRUE
48               NOT AT END ADD SALES-AMOUNT TO MAST-AMOUNT(SALES-BR)
49          END-READ
50      END-PERFORM.
51      PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > 5
52          ［b］
53      END-PERFORM.
54      WRITE MAST-REC FROM W-MAST
55          INVALID KEY     DISPLAY "** ERROR OCCURRED **"
56          NOT INVALID KEY PERFORM PRT-PROC
57      END-WRITE.
58      CLOSE SALES-FILE MAST-FILE.
59      STOP RUN.
60  PRT-PROC.
61      SORT SORT-FILE ［c］
62                     INPUT  PROCEDURE IS IN-PROC
63                     OUTPUT PROCEDURE IS OUT-PROC.
64  IN-PROC.
65      PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > 5
66          MOVE CNT TO SORT-BR
67          ［d］
68          RELEASE SORT-REC
69      END-PERFORM.
70  OUT-PROC.
71      PERFORM UNTIL SORT-EOF
72          RETURN SORT-FILE
73              AT END     SET SORT-EOF TO TRUE
74              NOT AT END MOVE SORT-AMOUNT TO AMOUNT
75                         DISPLAY BR-NAME(SORT-BR) AMOUNT
76          END-RETURN
77      END-PERFORM.
78      DISPLAY "----------------------".
79      MOVE MAST-TOTAL TO AMOUNT.
80      DISPLAY "TOTAL      " AMOUNT.`;
const outputChanges = `    ［e］.
    COMPUTE KEY-YYYYMM = MAST-YYYYMM - 100.
    READ MAST-FILE INVALID KEY     INITIALIZE W-MAST
                   NOT INVALID KEY MOVE MAST-REC TO W-MAST.
    PERFORM UNTIL SORT-EOF
        RETURN SORT-FILE
        AT END SET SORT-EOF TO TRUE
        NOT AT END
            MOVE SORT-AMOUNT TO AMOUNT
            IF MAST-AMOUNT(SORT-BR) = ZERO THEN
                DISPLAY BR-NAME(SORT-BR) AMOUNT " ( - %)"
            ELSE
                ［f］
                DISPLAY BR-NAME(SORT-BR) AMOUNT " (" RATIO "%)"
            END-IF
        END-RETURN
    END-PERFORM.
    DISPLAY "-----------------------------".
    MOVE THIS-TOTAL TO AMOUNT.
    IF MAST-TOTAL = ZERO THEN
        DISPLAY "TOTAL      " AMOUNT " ( - %)"
    ELSE
        ［g］
        DISPLAY "TOTAL      " AMOUNT " (" RATIO "%)"
    END-IF.`;
const changes = languageFigure(10, 'program-changes', '表 プログラムの変更内容', () => ({
  kind: 'tables', tables: [{ headers: ['処置', '変更内容'], rows: [
    ['行番号27と28の間\nに追加', '77  THIS-TOTAL   PIC 9(9).\n77  RATIO        PIC ZZ9.'],
    ['行番号71〜80を\n変更', outputChanges],
  ] }],
}));
export const q10Figures = [salesLayout, masterLayout, currentOutput, priorOutput, changes];

export const q10 = createLanguageDefinition(10, 'COBOL：支店別売上の月次集計と対前年同月比',
  '支店の売上金額、整列条件、前年同月比', 'abcdefg', '設問1 aキ bア cウ dエ／設問2 eウ fウ gオ',
  '伝票とマスタの各レコード様式、行番号1〜80、支店別の集計・SORTと前年同月比、2設問7欄を維持する。4種の整列条件と売上をバインドし、前年同月比のゼロや読取り失敗も検算する。',
  (index, original) => {
    const state = cases[index];
    const sortInstruction = index === 0 ? '当該月の支店別売上金額を降順に整列して表示する。'
      : '当該月の支店別売上金額を' + state.sort + 'に整列して表示する。';
    return {
      pages: [
        page(44, [
          p('問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('売上伝票ファイルに記録された各支店（A〜E）の月単位の売上情報を支店ごとに集計して，売上マスタファイルに格納する月次処理のプログラムである。'),
          p('なお，集計した当該月の売上データは画面にも表示する。'),
          p('（1）売上伝票ファイルは，図1に示すレコード様式の順ファイルである。'), salesLayout.block(index),
          p('① 売上伝票ファイルには，ある月の1か月分の売上データを格納する。'
            + (original ? '' : 'このファイルに売上データが1件以上ある月について考える。')),
          p('② 伝票番号には，6けたの数字を格納する。'),
          p('③ 売上日には，西暦年を4けた，月，日をそれぞれ2けたの数字で格納する。なお，一つのファイルに含まれるレコードの西暦年と月は，それぞれすべて等しい。'),
          p('④ 支店コードは，A〜Eの支店に対して昇順に割り当てた1〜5の数字である。'),
          p('（2）売上マスタファイルは，図2に示すレコード様式の，売上年月を主キーとする索引ファイルである。'),
          masterLayout.block(index),
          p('① 売上年月には，西暦年が4けた，月が2けたの数字を格納する。'),
          p('② 売上金額には，当該月の各支店の売上金額を格納する。'),
          p('③ 売上合計金額には，当該月の全支店の売上金額の合計を格納する。'),
          p('④ 各支店の1か月分の売上金額は，8けたを超えないものとする。'),
        ]),
        page(45, [p('（3）集計結果の表示例を図3に示す。'), currentOutput.block(index), p('① ' + sortInstruction),
          p('② TOTALには，売上合計金額を表示する。'), p('〔プログラム〕（行番号）'), code(declarations, 'cobol')]),
        page(46, [code(procedure, 'cobol')]),
        page(47, [
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2 各支店の当該月の売上金額に加えて対前年同月比を表示するようにプログラムを変更する。このとき，前年同月の売上金額がゼロであるか又は情報の取得に失敗した場合は，“（ - ％）”と表示する。集計結果の表示例を，図4に示す。次の表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('なお，対前年同月比は，999％を超えないものとする。'), priorOutput.block(index),
        ], [
          bank(1, 'abd', ['ADD MAST-AMOUNT(CNT) TO MAST-TOTAL', 'ADD SALES-AMOUNT TO MAST-TOTAL',
            'ADD SALES-AMOUNT TO SORT-AMOUNT', 'MOVE MAST-AMOUNT(CNT) TO SORT-AMOUNT', 'MOVE SALES-AMOUNT TO SORT-AMOUNT',
            'MOVE SALES-BR TO SORT-BR', 'MOVE SALES-YYYYMM TO MAST-YYYYMM'], 'キアエ', 'cobol'),
          bank(1, 'c', ['ASCENDING KEY SORT-AMOUNT', 'ASCENDING KEY SORT-BR', 'DESCENDING KEY SORT-AMOUNT',
            'DESCENDING KEY SORT-BR'], state.key, 'cobol'),
        ], [0, 0]),
        page(48, [changes.block(index)], [
          bank(2, 'e', ['MOVE MAST-AMOUNT(CNT) TO THIS-TOTAL', 'MOVE MAST-REC TO W-MAST',
            'MOVE MAST-TOTAL TO THIS-TOTAL', 'MOVE W-MAST TO MAST-REC'], 'ウ', 'cobol'),
          bank(2, 'fg', ['COMPUTE RATIO = MAST-AMOUNT(SORT-BR) * 100 / SORT-AMOUNT',
            'COMPUTE RATIO = MAST-TOTAL * 100 / THIS-TOTAL', 'COMPUTE RATIO = SORT-AMOUNT * 100 / MAST-AMOUNT(SORT-BR)',
            'COMPUTE RATIO = SORT-AMOUNT * 100 / MAST-TOTAL', 'COMPUTE RATIO = THIS-TOTAL * 100 / MAST-TOTAL'], 'ウオ', 'cobol'),
        ]),
      ],
      explanation: 'a：最初の伝票から年と月をマスタへ格納する。b：支店ごとの集計額をすべて足す。c：' + state.sort
        + 'にするSORTのキーと方向を選ぶ。d：支店コードと対応する売上をSORT-RECへ組み合わせる。'
        + 'e：前年のマスタを読む前に，当年合計をTHIS-TOTALへ移す。f：同じ支店の当年金額を前年金額で割って100倍する。'
        + 'g：全支店合計同士で同じ計算をする。前年がゼロか読取りに失敗したときは割算を行わない。',
    };
  });
