import { code, p, table } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2007-autumn-pm-10-13-support';

const cases = [
  { company: 'B', bankName: 'C', messages: ['OK', 'UNMATCH', 'NOT PAID', 'NO BILL'], charge: 'CHARGE', feeName: 'W-CHARGE', rule: '' },
  { company: 'D', bankName: 'E', messages: ['SAME AMOUNT', 'AMOUNT ERROR', 'NO DEPOSIT', 'NO INVOICE'], charge: 'FEE1', feeName: 'W-FEE',
    rule: '自社負担となるのは請求額が50,000円以上の取引で，その手数料を440円とする。' },
  { company: 'F', bankName: 'G', messages: ['MATCHED', 'GAP FOUND', 'UNPAID', 'UNKNOWN BILL'], charge: 'FEE2', feeName: 'W-FEE',
    rule: '自社負担となるのは請求額が60,000円以上の取引で，その手数料を330円とする。' },
  { company: 'H', bankName: 'J', messages: ['PAYMENT OK', 'DIFFERENCE', 'NOT RECEIVED', 'BILL MISSING'], charge: 'FEE3', feeName: 'W-FEE',
    rule: '自社負担となるのは請求額が70,000円以上の取引で，その手数料を550円とする。' },
];
const first = ` 1  DATA DIVISION.
 2  FILE SECTION.
 3  FD  BANK-F.
 4  01  BANK-R                     PIC X(43).
 5  SD  SORT-F.
 6  01  SORT-R.
 7      05  BANK-DATE              PIC 9(8).
 8      05  BANK-BILL-CD           PIC X(6).
 9      05  BANK-AMOUNT            PIC 9(9).
10      05  BANK-CUSTOMER-NM       PIC X(20).
11  FD  ACCOUNT-F.
12  01  ACCOUNT-R.
13      05  ACCOUNT-DATE           PIC 9(8).
14      05  ACCOUNT-BILL-CD        PIC X(6).
15      05  ACCOUNT-AMOUNT         PIC 9(9).
16      05  ACCOUNT-CUSTOMER-NM    PIC X(20).
17  FD  PRINT-F.
18  01  PRINT-R                    PIC X(128).
19  WORKING-STORAGE SECTION.
20  01  W-BANK-BILL-CD             PIC X(6).
21  01  W-ACCOUNT-BILL-CD          PIC X(6).
22  01  P-DETAIL.
23      05  P-BILL-CD              PIC X(6).
24      05  FILLER                 PIC X(6).
25      05  P-CUSTOMER-NM          PIC X(20).
26      05  FILLER                 PIC X.
27      05  P-ACCOUNT-AMOUNT       PIC ¥,¥¥¥,¥¥¥,¥¥9.
28      05  FILLER                 PIC X.
29      05  P-BANK-AMOUNT          PIC ¥,¥¥¥,¥¥¥,¥¥9.
30      05  FILLER                 PIC X.
31      05  P-DIFF                 PIC -,---,---,--9.
32      05  FILLER                 PIC X.
33      05  P-MESSAGE              PIC X(30).
34  PROCEDURE DIVISION.
35  MAIN-CTL.
36     SORT SORT-F ASCENDING KEY ［a］
37          USING  BANK-F
38          OUTPUT PROCEDURE MATCH-PROC.
39     STOP RUN.
40  MATCH-PROC.
41     OPEN INPUT  ACCOUNT-F.
42     OPEN OUTPUT PRINT-F.
43     PERFORM RETURN-BANK.
44     PERFORM READ-ACCOUNT.`;
const second = (ok: string) => `45     PERFORM UNTIL W-BANK-BILL-CD    = HIGH-VALUE AND
46                   W-ACCOUNT-BILL-CD = HIGH-VALUE
47       MOVE SPACE TO P-DETAIL
48       EVALUATE TRUE
49          WHEN W-BANK-BILL-CD > W-ACCOUNT-BILL-CD
50               MOVE ACCOUNT-CUSTOMER-NM TO P-CUSTOMER-NM
51               MOVE ACCOUNT-BILL-CD     TO P-BILL-CD
52               MOVE ACCOUNT-AMOUNT      TO P-ACCOUNT-AMOUNT
53               ［b］
54               WRITE PRINT-R FROM P-DETAIL
55               PERFORM READ-ACCOUNT
56          WHEN W-BANK-BILL-CD = W-ACCOUNT-BILL-CD
57               MOVE BANK-CUSTOMER-NM    TO P-CUSTOMER-NM
58               MOVE ACCOUNT-BILL-CD     TO P-BILL-CD
59               MOVE ACCOUNT-AMOUNT      TO P-ACCOUNT-AMOUNT
60               MOVE BANK-AMOUNT         TO P-BANK-AMOUNT
61               IF BANK-AMOUNT - ACCOUNT-AMOUNT = 0 THEN
62                  MOVE "${ok}" TO P-MESSAGE
63               ELSE
64                  ［c］
65               END-IF
66               COMPUTE P-DIFF = BANK-AMOUNT - ACCOUNT-AMOUNT
67               WRITE PRINT-R FROM P-DETAIL
68               PERFORM READ-ACCOUNT
69               PERFORM RETURN-BANK
70          WHEN W-BANK-BILL-CD < W-ACCOUNT-BILL-CD
71               MOVE BANK-CUSTOMER-NM    TO P-CUSTOMER-NM
72               MOVE BANK-BILL-CD        TO P-BILL-CD
73               MOVE BANK-AMOUNT         TO P-BANK-AMOUNT
74               ［d］
75               WRITE PRINT-R FROM P-DETAIL
76               ［e］
77       END-EVALUATE
78     END-PERFORM.
79     CLOSE ACCOUNT-F.
80     CLOSE PRINT-F.
81  *
82  RETURN-BANK.
83     RETURN SORT-F
84        AT END     MOVE HIGH-VALUE   TO W-BANK-BILL-CD
85        NOT AT END MOVE BANK-BILL-CD TO W-BANK-BILL-CD
86     END-RETURN.
87  *
88  READ-ACCOUNT.
89     READ ACCOUNT-F
90        AT END     MOVE HIGH-VALUE      TO W-ACCOUNT-BILL-CD
91        NOT AT END MOVE ACCOUNT-BILL-CD TO W-ACCOUNT-BILL-CD
92     END-READ.`;

function modification(index: number) {
  const { charge, feeName } = cases[index];
  return [
    ['行番号33と34の間に追加', '01  ' + feeName + '         PIC 9(6).'],
    ['［f］及び［g］に追加', 'CALL "' + charge + '" USING ACCOUNT-AMOUNT ' + feeName + '\nCOMPUTE ACCOUNT-AMOUNT =\n         ACCOUNT-AMOUNT - ' + feeName],
  ];
}
export const q11Modification = languageFigure(11, 'modification', 'プログラムの変更表', index => {
  const columns = ['処置', 'プログラムの変更内容'];
  const rows = modification(index);
  return { kind: 'table', columns, rows, codeColumn: 1, alt: [columns, ...rows].map(row => row.join('｜')).join('\n') };
});

export const q11 = createLanguageDefinition(11, 'COBOL：振込データと請求データの突合せ', '確認結果のラベル・請求と振込手数料の条件', 'abcdefg',
  '設問1 aイ bイ cウ dア eオ・設問2 f/g=イ・ウ（順不同、2欄）',
  'p40〜44。二つの順ファイルを請求書コードで突き合わせ，片側のみ／両側の三分岐を処理する。確認メッセージと会社負担額の条件を本文とコードへ反映し，手数料を二重控除しない挿入位置を判定する。f/gは順不同の2欄。',
  index => {
    const { company, bankName, messages: [ok, mismatch, unpaid, unknown], charge, rule } = cases[index];
    const printFormat = ['XXXXXX', 'XXX … XX', '¥,¥¥¥,¥¥¥,¥¥9', '¥,¥¥¥,¥¥¥,¥¥9', '-,---,---,--9', 'XXX … XX'];
    return {
      pages: [
        page(40, [
          p('問11 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\n' + company + '社は，取引先あてに請求書と振込用紙を発行し，取引先はその振込用紙を使って' + bankName +
            '銀行に請求金額を振り込む。このプログラムは，毎月' + bankName + '銀行から受け取る振込データと，社内で管理している請求データの突合せを行って，入金確認リストを印字するものである。突合せキーは，一意に振られている請求書コードである。'),
          p('（1）銀行から受け取る振込データBANK-Fは順ファイルで，レコード様式は，次のとおりである。レコードは，振込日で昇順に整列されている。'),
          table('BANK-Fのレコード様式', ['振込日', '請求書コード', '振込金額', '取引先名'], [['8けた', '6けた', '9けた', '20けた']]),
          p('（2）社内で管理している請求データACCOUNT-Fは順ファイルで，レコード様式は，次のとおりである。レコードは，請求書コードで昇順に整列されている。'),
          table('ACCOUNT-Fのレコード様式', ['請求日', '請求書コード', '請求金額', '取引先名'], [['8けた', '6けた', '9けた', '20けた']]),
          p('（3）入金確認リストの印字様式は，次のとおりである。'),
          table('入金確認リストの印字様式', ['請求書コード', '取引先名', '入金予定金額', '振込金額', '差額', '入金確認結果'], [printFormat, printFormat, Array<string>(6).fill('⋮')]),
          p('① 入金確認リストの見出しは印刷済みとする。\n② 入金予定金額には請求金額を印字する。\n③ 入金確認結果は，次の4種類のいずれかを印字する。'),
          table('入金確認結果', ['印字メッセージ', '意味'], [[ok, '入金予定金額と振込金額が一致'], [mismatch, '金額不一致'], [unpaid, '振込みなし'], [unknown, '請求なし']]),
        ]),
        page(41, [p('〔プログラム〕\n（行番号）'), code(first, 'cobol')]),
        page(42, [code(second(ok), 'cobol')]),
        page(43, [p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['BANK-AMOUNT', 'BANK-BILL-CD', 'BANK-CUSTOMER-NM', 'BANK-DATE'], 'イ', 'cobol'),
          { ...bank(1, 'bcde', [unknown, unpaid, mismatch].map(msg => 'MOVE "' + msg + '" TO P-MESSAGE').concat('PERFORM READ-ACCOUNT', 'PERFORM RETURN-BANK'), 'イウアオ', 'cobol'), label: 'b〜eに関する解答群' },
        ]),
        page(44, [
          p('設問2 ' + company + '社への振込手数料は，取引先が負担していたが，一部の大口取引に対しては，' + company +
            '社が振込手数料を負担することにした。この場合，銀行から受け取る振込金額は，請求金額から振込手数料を差し引いた金額となる。振込手数料の金額とその負担先は，請求金額によって決定される。振込手数料の計算には，次の様式の手数料計算プログラム' + charge + 'を使用する。'),
          code('CALL "' + charge + '" USING 請求金額 振込手数料', 'cobol'),
          p('手数料計算プログラムは，請求金額を基に，振込手数料を返す。ただし，' + company + '社が負担しない場合はゼロを返す。' + rule),
          p('この対応のため，プログラムを変更する。入金確認リストの入金予定金額は請求金額から振込手数料を差し引いた金額を印字する。次の表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          q11Modification.block(index),
        ], [{ ...bank(2, 'fg', ['行番号47と48の間', '行番号49と50の間', '行番号56と57の間', '行番号70と71の間'], 'イウ'), label: '解答群' }]),
      ],
      unordered: 'fg',
      explanation: 'a：二つのファイルで比較の順序をそろえるため，銀行データを請求書コードで並べる。b：請求側だけがあれば「' + unpaid +
        '」。c：両側の金額が異なれば「' + mismatch + '」。d：銀行側だけなら「' + unknown +
        '」。e：銀行側だけの行を処理した後は次の銀行データへ進む。設問2：請求データを使う行49の分岐と行56の分岐で，転記や比較より前に一度だけ手数料を引く。' +
        '行47の直後では銀行側だけが進むたび，同じ請求額から繰り返し手数料を引くことがある。行70の分岐には今回照合すべき請求データがない。',
    };
  }, { answerVariation: 'fixed' });
