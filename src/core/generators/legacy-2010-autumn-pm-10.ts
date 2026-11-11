import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2010-autumn-pm-09-13-support';

const conditions = [
  { top: 10, x: 5, y1: 3, y2: 7, low: 10, high: 20 },
  { top: 8, x: 4, y1: 2, y2: 6, low: 20, high: 30 },
  { top: 12, x: 6, y1: 3, y2: 8, low: 10, high: 30 },
  { top: 6, x: 5, y1: 2, y2: 8, low: 20, high: 40 },
] as const;
const format = (value: number) => value.toLocaleString('en-US');
const ratio = (rate: number) => ((100 - rate) / 100).toFixed(1);

function example(index: number, discount: boolean) {
  if (index === 0) return 'A:    187,200\nB:    514,700\n        ⋮\nJ:     95,400\nTOTAL:  3,086,200'
    + (discount ? '  PLAN X:  2,899,400  PLAN Y:  2,814,990' : '')
    + '\n\nB-E:  1,125\nE-B:  1,079\nC-E:    996\n    ⋮';
  const rule = conditions[index];
  const segments = Array.from({ length: 10 }, (_, from) => Array.from({ length: 10 }, (_, to) => {
    const length = Math.abs(to - from);
    return { from, to, length, count: length ? 11 + (from * 7 + to * 3 + index * 13) % 61 : 0, fare: length * 100 };
  })).flat();
  const byExit = Array.from({ length: 10 }, (_, to) => segments.filter(row => row.to === to).reduce((sum, row) => sum + row.count * row.fare, 0));
  const total = byExit.reduce((sum, value) => sum + value, 0);
  const plan = (which: 'X' | 'Y') => segments.reduce((sum, row) => {
    const rate = which === 'X' ? (row.length >= rule.x ? rule.high : 0) : row.length >= rule.y2 ? rule.high : row.length >= rule.y1 ? rule.low : 0;
    return sum + row.count * row.fare * (100 - rate) / 100;
  }, 0);
  const ranking = [...segments].sort((a, b) => b.count - a.count || a.from - b.from || a.to - b.to);
  return `A:    ${format(byExit[0])}\nB:    ${format(byExit[1])}\n        ⋮\nJ:    ${format(byExit[9])}\nTOTAL:  ${format(total)}`
    + (discount ? `  PLAN X:  ${format(plan('X'))}  PLAN Y:  ${format(plan('Y'))}` : '')
    + '\n\n' + ranking.slice(0, 3).map(row => 'ABCDEFGHIJ'[row.from] + '-' + 'ABCDEFGHIJ'[row.to] + ':  ' + format(row.count)).join('\n') + '\n    ⋮';
}
const output = languageFigure(10, 'sales-output', '図1 プログラム実行時の表示例', index => ({ kind: 'output', text: example(index, false) }));
const discountedOutput = languageFigure(10, 'discount-output', '図3 割引プラン適用時の売上を追加表示する場合の表示例', index => ({ kind: 'output', text: example(index, true) }));
const record = languageFigure(10, 'sales-record', '図2 売上ファイルのレコード様式', () => ({
  kind: 'tables', tables: [{ headers: [], rows: [['入車IC\n2けた', '出車IC\n2けた', '通行料\n4けた']], showHeaders: false }],
}));
const program1 = ` 1  DATA DIVISION.
 2  FILE SECTION.
 3  SD  SORT-FILE.
 4  01  SORT-REC.
 5      02  SORT-IN             PIC 9(2).
 6      02  SORT-OUT            PIC 9(2).
 7      02  SORT-DATA           PIC 9(6).
 8  FD  SALES-FILE.
 9  01  SALES-REC.
10      02  SAL-IN              PIC 9(2).
11      02  SAL-OUT             PIC 9(2).
12      02  SAL-TOLL            PIC 9(4).
13  WORKING-STORAGE SECTION.
14  77  LOOP-FLAG               PIC X(1) VALUE SPACE.
15      88  INIT                        VALUE SPACE.
16      88  LOOP-END                    VALUE "E".
17  77  CNT1                    PIC 9(2).
18  77  CNT2                    PIC 9(2).
19  01  .
20      02  IC-TOTAL            PIC 9(6) VALUE ZERO OCCURS 10.
21  77  TOTAL                   PIC 9(8) VALUE ZERO.
22  01  SECT-DATA.
23      02                              OCCURS 10.
24          03  SECT-NUM        PIC 9(5) VALUE ZERO OCCURS 10.
25  77  PREV-NUM                PIC 9(6) VALUE ZERO.
26  01  PRT-IC.
27      02  IC-HEADER           PIC X(1).
28      02                     PIC X(9) VALUE ":".
29      02  IC-SALES            PIC ZZZ,ZZ9.
30  01  PRT-TOTAL.
31      02                     PIC X(7) VALUE "TOTAL:".
32      02  TOTAL-SALES         PIC ZZ,ZZZ,ZZ9.
33  01  PRT-SECT.
34      02  PRT-IN              PIC X(1).
35      02                     PIC X(1) VALUE "-".
36      02  PRT-OUT             PIC X(1).
37      02                     PIC X(2) VALUE ":".
38      02  PRT-NUM             PIC ZZ,ZZ9.
39  01  IC-NAME                 PIC X(10) VALUE "ABCDEFGHIJ".
40  PROCEDURE DIVISION.
41  MAIN-PROC SECTION.
42      OPEN INPUT SALES-FILE.
43      PERFORM UNTIL LOOP-END`;
const program2 = `44         READ SALES-FILE AT END     SET LOOP-END TO TRUE
45                         NOT AT END PERFORM CNT-PROC
46         END-READ
47      END-PERFORM.
48      CLOSE SALES-FILE.
49      PERFORM PRINT-PROC.
50      STOP RUN.
51  CNT-PROC SECTION.
52      ADD SAL-TOLL TO IC-TOTAL(SAL-OUT).
53      ［a］.
54  PRINT-PROC SECTION.
55      PERFORM VARYING CNT1 FROM 1 BY 1 UNTIL CNT1 > 10
56         MOVE IC-NAME(CNT1:1) TO IC-HEADER
57         MOVE IC-TOTAL(CNT1) TO IC-SALES
58         DISPLAY PRT-IC
59         ［b］
60      END-PERFORM.
61      MOVE TOTAL TO TOTAL-SALES.
62      DISPLAY PRT-TOTAL.
63      DISPLAY " ".
64      SORT SORT-FILE ON DESCENDING KEY SORT-DATA
65                     INPUT PROCEDURE IS IN-PROC
66                     OUTPUT PROCEDURE IS OUT-PROC.
67  IN-PROC SECTION.
68      PERFORM VARYING CNT1 FROM 1 BY 1 UNTIL CNT1 > 10
69         PERFORM VARYING CNT2 FROM 1 BY 1 UNTIL CNT2 > 10
70            MOVE CNT1 TO SORT-IN
71            MOVE CNT2 TO SORT-OUT
72            ［c］
73            RELEASE SORT-REC
74         END-PERFORM
75      END-PERFORM.
76  OUT-PROC SECTION.
77      SET INIT TO TRUE.
78      PERFORM VARYING CNT1 FROM 1 BY 1 UNTIL LOOP-END
79         RETURN SORT-FILE
80            AT END
81               SET LOOP-END TO TRUE
82            NOT AT END
83               IF SORT-DATA = ZERO OR
84                  (［d］) THEN
85                  SET LOOP-END TO TRUE
86               ELSE
87                  MOVE IC-NAME(SORT-IN:1) TO PRT-IN
88                  MOVE IC-NAME(SORT-OUT:1) TO PRT-OUT
89                  MOVE SORT-DATA TO PRT-NUM
90                  DISPLAY PRT-SECT
91                  MOVE SORT-DATA TO PREV-NUM
92               END-IF
93         END-RETURN
94      END-PERFORM.`;

const changes = languageFigure(10, 'program-change', '表 プログラムの変更内容', index => {
  const { low, high } = conditions[index];
  return { kind: 'tables', tables: [{ headers: ['処置', '変更内容'], rows: [
    ['行番号25と26の\n間に追加', '77  TOTAL-PLANX          PIC 9(8) VALUE ZERO.\n77  TOTAL-PLANY          PIC 9(8) VALUE ZERO.\n77  DISCOUNT-X           PIC 9V9.\n77  DISCOUNT-Y           PIC 9V9.'],
    ['行番号32と33の\n間に追加', '    02                  PIC X(11) VALUE "    PLAN X:".\n    02  TOTAL-X         PIC ZZ,ZZZ,ZZ9.\n    02                  PIC X(11) VALUE "    PLAN Y:".\n    02  TOTAL-Y         PIC ZZ,ZZZ,ZZ9.'],
    ['［e］の\n間に追加', `IF SAL-IN < SAL-OUT THEN
    COMPUTE CNT1 = SAL-OUT - SAL-IN
ELSE
    COMPUTE CNT1 = SAL-IN - SAL-OUT
END-IF.
EVALUATE CNT1
    WHEN ［f］   MOVE 1.0 TO DISCOUNT-X
                 MOVE ${ratio(low)} TO DISCOUNT-Y
    WHEN ［g］   MOVE ${ratio(high)} TO DISCOUNT-X
                 MOVE ${ratio(low)} TO DISCOUNT-Y
    WHEN ［h］   MOVE ${ratio(high)} TO DISCOUNT-X DISCOUNT-Y
    WHEN OTHER  MOVE 1.0 TO DISCOUNT-X DISCOUNT-Y
END-EVALUATE.
COMPUTE TOTAL-PLANX = TOTAL-PLANX + SAL-TOLL * DISCOUNT-X.
COMPUTE TOTAL-PLANY = TOTAL-PLANY + SAL-TOLL * DISCOUNT-Y.`],
    ['行番号61と62の\n間に追加', 'MOVE TOTAL-PLANX TO TOTAL-X.\nMOVE TOTAL-PLANY TO TOTAL-Y.'],
  ] }] };
});
export const autumn2010Pm10Figures = [output, record, discountedOutput, changes];

const question10 = createLanguageDefinition(10, 'COBOL：有料道路の集計・整列・割引', '表示上位件数と割引区間・率', 'abcdefgh',
  '設問1 a=ウ、b=オ、c=キ、d=イ／設問2 e=イ、f=ウ、g=カ、h=ケ',
  '原46〜51頁・8欄25固有択57参照。A〜Jの10IC、1日1利用1レコード、2/2/4桁、出車側売上、999999円・99999台上限、Uターン/同IC出入なし、台数降順、上位N位の同数含む、ゼロなら終了、全94行と変更表の行番号を維持。上位件数6/8/10/12及びX/Yの距離境界と割引率・表示例を同期する。意味が同じ一般集計文は固定し、距離範囲としきい値は実条件で変える。独立の取引明細集計・順位値・全9区間で検算。',
  index => {
    const { top, x, y1, y2, low, high } = conditions[index];
    const range = (start: number, end: number) => start === end ? String(start) : `${start} THRU ${end}`;
    return {
      pages: [
        page(46, [p('次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\nある有料自動車道路にはA〜Jの順に10か所のインターチェンジ（以下，ICという）があり，すべてのICに自動発券精算システムを導入することにした。すべてのICには一般道路からの出入口があり，利用者は，入ったIC（以下，入車ICという）で発券された通行券を，出たIC（以下，出車ICという）の精算機に投入し，利用区間に応じた通行料を支払う。システムは計算センタとオンラインで結ばれており，通行料は出車ICの売上として売上ファイルに記録される。'),
          p(`このプログラムは，売上ファイルを読み込み，各ICの売上，及び利用区間とその利用台数を台数の多い順に${top}区間まで，図1に示す形式で表示する。`),
          output.block(index), p('（1）売上ファイルは，図2に示すレコード様式の順ファイルである。'), record.block(index),
          p('① 車1台の1回の利用につき1レコードが生成され，一つのファイルには1日分の売上が記録されている。\n② 入車IC及び出車ICには，各ICに対応する01〜10の番号が格納される。Aは01，Bは02，…，Jは10とする。\n（2）各ICの1日の売上は999,999円以下とする。\n（3）1日の利用台数は99,999台以下とする。'),
          p(`（4）利用台数の多い順に${top}区間までを表示する際，${top}区間目と台数が同じ利用区間`)]),
        page(47, [p(`が複数ある場合は，それらの利用区間もすべて表示する。ただし，利用台数がゼロになった場合は，表示が${top}区間に満たなくても処理を終了する。\n（5）Uターン及び同じICからの入出車はないものとする。`), p('〔プログラム〕（行番号）'), code(program1, 'cobol')], undefined, undefined, true),
        page(48, [code(program2, 'cobol')]),
        page(49, [p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　この道路の運営会社では，利用区間に応じた料金の割引きを検討している。売上への影響を検証した上で，次の二つのプランのいずれかを採用することにした。\nなるべく新しいデータで検証するため，ある期間だけプログラムを変更して，それぞれのプランを適用した場合の売上を表示することにした。図3に変更後の表示形式を示す。次の表中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p(`プランX：${x}区間以上利用した場合は${high}％，通行料を割り引く。\nプランY：${y1}〜${y2 - 1}区間利用した場合は${low}％，${y2}区間以上利用した場合は${high}％，通行料を割り引く。`)], [
            bank(1, 'abc', ['ADD SECT-NUM(SAL-IN SAL-OUT) TO TOTAL', 'ADD 1 TO IC-TOTAL(CNT1)', 'ADD 1 TO SECT-NUM(SAL-IN SAL-OUT)', 'ADD IC-TOTAL(CNT1) TO SECT-NUM(SAL-IN SAL-OUT)', 'ADD IC-TOTAL(CNT1) TO TOTAL', 'MOVE IC-TOTAL(CNT1) TO SORT-DATA', 'MOVE SECT-NUM(CNT1 CNT2) TO SORT-DATA'], 'ウオキ', 'cobol'),
            bank(1, 'd', [`CNT1 > ${top} AND PREV-NUM <= ${top}`, `CNT1 > ${top} AND SORT-DATA < PREV-NUM`, `CNT1 > ${top} AND SORT-DATA <= PREV-NUM`, `CNT1 > ${top} AND SORT-DATA >= PREV-NUM`, 'SORT-IN > 10 AND SORT-OUT > 10'], 'イ', 'cobol'),
          ], [0, 0]),
        page(50, [discountedOutput.block(index), changes.block(index)], [
          bank(2, 'e', ['行番号47と48', '行番号53と54', '行番号54と55', '行番号60と61'], 'イ'),
        ]),
        page(51, [], [
          bank(2, 'fgh', [range(1, y1 - 1), String(y1), range(y1, x - 1), range(y1, x), String(x), range(x, y2 - 1), range(x, y2), String(y2), range(y2, 9)], 'ウカケ', 'cobol'),
        ]),
      ],
      explanation: `aは入車IC・出車ICの組ごとに台数を1増やす。bは出車側ごとの売上をTOTALへ合計し，cは各組の台数をSORT-DATAへ移して台数で降順に整列する。dは${top}件目より後で，台数が直前より小さくなったときに終了する。等号で止めると${top}件目と同数の区間を落とす。eは各取引を読み込んだCNT-PROCの53行目と54行目の間で，金額があるごとに割引売上を集計する。fは${y1}〜${x - 1}区間でXが無割引，Yが${low}％引き。gは${x}〜${y2 - 1}区間でXが${high}％引き，Yが${low}％引き。hは${y2}〜9区間で両方が${high}％引き。距離は入出IC番号差の絶対値であり，進行方向には依存しない。`,
    };
  });

export const q10 = {
  ...question10,
  originalPageAlt() {
    const pages = question10.originalPageAlt();
    pages[51] = '問10 設問2の続き。利用区間数の候補。\n' + pages[51];
    return pages;
  },
};
