import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-spring-pm-09-13-support';

const cases = [
  { width: 10, order: [0, 1, 2], reverse: true, codes: ['TKY-01', 'OSK-01', 'TKY-02', 'FUK-01', 'NGY-01', 'SAP-01', 'HIR-01'],
    amounts: [13345000, 6350000, 2330000, 1984000, 1453000, 528000, 130000] },
  { width: 8, order: [1, 0, 2], reverse: false, codes: ['ITM-A1', 'ITM-B2', 'ITM-C3', 'ITM-D4', 'ITM-E5', 'ITM-F6', 'ITM-G7'],
    amounts: [6800000, 3100000, 2100000, 1300000, 940000, 460000, 300000] },
  { width: 12, order: [2, 1, 0], reverse: true, codes: ['CST-11', 'CST-12', 'CST-13', 'CST-14', 'CST-15', 'CST-16', 'CST-17'],
    amounts: [2175000, 14300000, 1280000, 455000, 1115000, 235000, 5610000] },
  { width: 9, order: [0, 2, 1], reverse: false, codes: ['KOB-01', 'NAR-01', 'NGN-02', 'KOJ-03', 'OKY-02', 'TKS-01', 'GFM-02'],
    amounts: [1100000, 4200000, 9500000, 1600000, 5400000, 620000, 580000] },
];

const fields = ['販売店コード', '商品コード', '顧客コード'];
const names = ['S-SHOP-CD', 'S-PRODUCT-CD', 'S-CUSTOMER-CD'];
const number = (value: number) => value.toLocaleString('en-US');

const recordLayout = languageFigure(10, 'sales-record-layout', '図1 売上ファイルSALES-Fのレコード様式', index => {
  const { width, order } = cases[index];
  return { kind: 'tables', tables: [{ headers: [...order.map(position => fields[position]), '売上金額'],
    rows: [[...order.map(() => width + 'けた'), '10けた']] }] };
});
const salesReport = languageFigure(10, 'cumulative-sales-report', '図2 売上分析表の例', index => {
  const { codes, amounts, reverse } = cases[index];
  const entries = codes.map((code, i) => ({ code, amount: amounts[i] })).sort((a, b) => (reverse ? -1 : 1) * (a.amount - b.amount));
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  let cumulative = 0;
  const text = [
    'コード       売上金額    累積比率％ 1++++ … +70+++++++++80+++++++++90++++++++100',
    ...entries.map(({ code, amount }) => {
      cumulative += amount;
      const tenths = Math.floor(cumulative * 1000 / total);
      const stars = Math.floor(tenths / 10);
      return code.padEnd(9) + number(amount).padStart(12) + (tenths / 10).toFixed(1).padStart(11)
        + '   ' + '*'.repeat(Math.min(stars, 5)) + ' … ' + '*'.repeat(Math.max(0, stars - 68));
    }),
    'TOTAL    ' + number(total).padStart(12),
  ].join('\n');
  return { kind: 'output', text };
});
const changes = languageFigure(10, 'cobol-revision-table', '表 プログラムの変更内容', () => ({
  kind: 'tables',
  tables: [{ headers: ['処置', '変更内容'], rows: [
    ['行番号8と9の間に追加', '01  SALES-REC-R.\n    05  ［f］.\n    05  FILLER           PIC 9(10).'],
    ['行番号34を変更', 'LINKAGE SECTION.\n01  SUM-CD PIC 9.\nPROCEDURE DIVISION USING SUM-CD.'],
    ['［g］に追加', '       MOVE S-CD(SUM-CD) TO SORT-CD'],
  ], codeColumns: [1] }],
}));
export const q10Figures = [recordLayout, salesReport, changes];
const numbered = (start: number, lines: string) => lines.split('\n').map((line, i) => String(start + i).padStart(3) + ' ' + line).join('\n');
export function salesPrograms(index: number) {
  const { width, order } = cases[index];
  return [
    numbered(1, `DATA DIVISION.
FILE SECTION.
FD  SALES-F.
01  SALES-R.
${order.map(position => '    05  ' + names[position].padEnd(19) + 'PIC X(' + width + ').').join('\n')}
    05  S-SALES            PIC 9(10).
FD  TEMP-F.
01  TEMP-R.
    05  TEMP-CD            PIC X(${width}).
    05  FILLER             PIC X(${width * 2}).
    05  TEMP-SALES         PIC 9(10).
FD  PRINT-F.
01  PRINT-R.
    05  P-CD               PIC X(${width}).
    05  FILLER             PIC X.
    05  P-SALES            PIC Z,ZZZ,ZZZ,ZZ9.
    05  FILLER             PIC X(5).
    05  P-RATIO            PIC ZZ9.9.
    05  FILLER             PIC X(2).
    05  P-ASTER            PIC X(100).
SD  SORT-F.
01  SORT-R.
    05  SORT-CD            PIC X(${width}).
    05  FILLER             PIC X(${width * 2}).
    05  SORT-SALES         PIC 9(10).
WORKING-STORAGE SECTION.
01  EOF-SW                 PIC 9.
01  GROSS-SUM              PIC 9(10).
01  INTERIM-SUM            PIC 9(10).
01  W-SORT-CD              PIC X(${width}).
01  W-RATIO                PIC 999.
PROCEDURE DIVISION.
MAIN-CTL.
    SORT SORT-F ［a］
         INPUT  PROCEDURE  SORT-1-INPUT
         GIVING TEMP-F.
*
    SORT SORT-F ［b］
         INPUT  PROCEDURE  SORT-2-INPUT
         OUTPUT PROCEDURE  SORT-2-OUTPUT.
EXIT PROGRAM.`),
    numbered(44, `*
SORT-1-INPUT.
    OPEN INPUT SALES-F.
    MOVE 0 TO EOF-SW.
    PERFORM UNTIL EOF-SW = 1
       READ SALES-F AT END MOVE 1 TO EOF-SW
            NOT AT END
                MOVE SALES-R TO SORT-R
                RELEASE SORT-R
       END-READ
    END-PERFORM.
    CLOSE SALES-F.
*
SORT-2-INPUT.
    OPEN INPUT TEMP-F.
    MOVE 0 TO GROSS-SUM.
    MOVE 0 TO EOF-SW.
    PERFORM UNTIL EOF-SW = 1
       READ TEMP-F AT END MOVE 1 TO EOF-SW
            NOT AT END
                IF GROSS-SUM = 0 OR
                   W-SORT-CD NOT = TEMP-CD THEN
                   IF GROSS-SUM NOT = 0 THEN
                      RELEASE SORT-R
                   END-IF
                   MOVE TEMP-CD TO W-SORT-CD
                                   SORT-CD
                   ［c］
                ELSE
                   ［d］
                END-IF
                ［e］
       END-READ
    END-PERFORM.
    IF GROSS-SUM NOT = 0 THEN
       RELEASE SORT-R
    END-IF.
    CLOSE TEMP-F.
*
SORT-2-OUTPUT.
    OPEN OUTPUT PRINT-F.
    MOVE 0 TO INTERIM-SUM.
    MOVE 0 TO EOF-SW.
    PERFORM UNTIL EOF-SW = 1
       RETURN SORT-F AT END MOVE 1 TO EOF-SW
              NOT AT END
                  ADD SORT-SALES TO INTERIM-SUM
                  PERFORM DETAIL-PRINT-PROC
       END-RETURN
    END-PERFORM.`),
    numbered(94, `    PERFORM FOOTER-PRINT-PROC.
    CLOSE PRINT-F.
*
DETAIL-PRINT-PROC.
    MOVE SPACE TO PRINT-R.
    MOVE SORT-CD    TO P-CD.
    MOVE SORT-SALES TO P-SALES.
    COMPUTE P-RATIO W-RATIO = INTERIM-SUM * 100 / GROSS-SUM.
    IF W-RATIO > 0 THEN
       MOVE ALL "*" TO P-ASTER(1:W-RATIO)
    END-IF.
    WRITE PRINT-R AFTER 1.
FOOTER-PRINT-PROC.
    MOVE SPACE TO PRINT-R.
    MOVE "TOTAL"    TO P-CD.
    MOVE GROSS-SUM  TO P-SALES.
    WRITE PRINT-R AFTER 1.`),
  ];
}

const cobol = (source: string) => code(source, 'cobol');
const sortOptions = ['ASCENDING KEY SORT-CD', 'ASCENDING KEY SORT-SALES', 'DESCENDING KEY SORT-SALES', 'DESCENDING KEY TEMP-CD'];
const aggregationOptions = ['ADD  TEMP-SALES TO GROSS-SUM', 'ADD  TEMP-SALES TO INTERIM-SUM', 'ADD  TEMP-SALES TO SORT-SALES',
  'MOVE TEMP-SALES TO GROSS-SUM', 'MOVE TEMP-SALES TO INTERIM-SUM', 'MOVE TEMP-SALES TO SORT-SALES'];

export const q10 = createLanguageDefinition(10, 'COBOL：販売データの分類集計と累積比率', 'レコードのキー順・コード長・売上の整列方向', 'abcdefg',
  '設問1 aア bウ cカ dウ eア／設問2 fイ gイ',
  '行番号・段落・整列二段階・キーブレーク・追記位置の形式を維持。対象キーとレコードのコード幅、売上分布、売上金額の整列方向を組み合わせて変更する。',
  index => {
    const { width, order, reverse } = cases[index];
    const [first, second, third] = order.map(position => fields[position]);
    const [setup, procedure, output] = salesPrograms(index);
    const exactType = 'S-CD       PIC X(' + width + ')';
    const direction = reverse ? '多い' : '少ない';
    return {
      pages: [
        page(39, [
          p('問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('売上ファイルを読み込み，' + first + '別に売上集計を行い，売上分析表を印刷する副プログラムである。'),
          p('（1）売上ファイルSALES-Fは順ファイルである。'),
          p('（2）売上ファイルのレコード様式を図1に示す。'), recordLayout.block(index),
          p('① 売上金額はゼロより大きいものとする。'),
          p('② すべてのレコードの売上金額を合計しても10けたを超えないものとする。'),
          p('③ 売上ファイルのデータに誤りはないものとする。'),
          p('（3）' + first + 'で集計して印刷した売上分析表の例を図2に示す。'), salesReport.block(index),
          p('① 売上分析表の見出しは印刷済とする。'),
          p('② 売上分析表は，集計された売上金額の' + direction + '順に整列し，印刷する。'),
          p(index === 0
            ? '③ 累積比率は，当該販売店から上位順位店すべての売上金額の累積を売上金額の総合計で割った比率（％）の小数第2位を切り捨てたものである。'
            : '③ 累積比率は，当該コードとその行より前に並ぶコードすべての売上金額の累積を売上金額の総合計で割った比率（％）の小数第2位を切り捨てたものである。'),
          p('④ 文字“*”の並びは，この累積比率の整数部分の値mをm個の“*”で示したものである。'),
        ]),
        page(40, [p('〔プログラム〕'), p('（行番号）'), cobol(setup)]),
        page(41, [cobol(procedure)]),
        page(42, [cobol(output), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'ab', sortOptions, 'ア' + (reverse ? 'ウ' : 'イ'), 'cobol'),
          { ...bank(1, 'cde', aggregationOptions, 'カウア', 'cobol'), label: 'c〜eに関する解答群' },
        ]),
        page(43, [
          p('設問2 この副プログラムを，' + second + '，' + third + 'での集計にも使えるように変更する。パラメタの値が，1のときは'
            + first + '，2のときは' + second + '，3のときは' + third + 'による集計となるようにする。表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          changes.block(index),
        ], [
          bank(2, 'f', [exactType, exactType + ' OCCURS 3', exactType + ' OCCURS 3 INDEXED BY SUM-CD',
            'S-CD       PIC X(' + width * 2 + ')', 'S-CD       PIC X(' + width * 3 + ')'], 'イ', 'cobol'),
          bank(2, 'g', ['行番号50と51の間', '行番号51と52の間', '行番号66と67の間', '行番号78と79の間'], 'イ'),
        ]),
      ],
      explanation: 'a：SORT-CDで整列すると，同じ集計キーが連続する。b：集計したSORT-SALESの' + (reverse ? '降順' : '昇順') + 'で明細を出力する。'
        + 'c：グループが切り替わると，新しいグループの金額に先頭レコードのTEMP-SALESを代入する。d：同じキーならその金額を加算する。'
        + 'e：キーにかかわらず，全レコードの金額をGROSS-SUMへ加算する。最後のグループはファイル終端で出力する。'
        + 'f：同じレコードの三つのコードを' + width + 'けたずつの配列に重ねて定義し，パラメタを添字として参照する。'
        + 'g：51行でレコード全体を複写した後，52行で整列へ渡す前に，選ばれたコードでSORT-CDを上書きする。',
    };
  });
