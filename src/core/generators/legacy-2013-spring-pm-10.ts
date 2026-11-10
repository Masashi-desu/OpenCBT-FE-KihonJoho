import { code, p, table } from './definition';
import { languageFigure } from './legacy-2013-spring-pm-09-13-figures';
import { bank, createLanguageDefinition, page } from './legacy-2013-spring-pm-09-13-support';

const referenceData = [
  ['0,20100901,117000', '1,20100401,121000', '0,20060401,151000', '1,20020901,192000', '0,20000401,198000', '1,19980401,254000'],
  ['0,20110401,115000', '1,20110901,132000', '0,20060401,151000', '1,20060401,186000', '0,20010401,195000', '1,19970901,223000'],
  ['0,20120401,102000', '1,20080901,132000', '0,20070401,151000', '1,20050901,186000', '0,20040401,188000', '1,20010901,223000'],
  ['0,20120901,110000', '1,20100401,132000', '0,20080401,151000', '1,20020901,176000', '0,20010401,198000', '1,19950901,254000'],
];
const configuration = [
  { year: 2013, month: 4, day: 1, rate: [5, 10, 15, 20], age: [3, 9] },
  { year: 2015, month: 6, day: 1, rate: [6, 10, 14, 18], age: [2, 8] },
  { year: 2014, month: 7, day: 1, rate: [4, 8, 12, 16], age: [4, 9] },
  { year: 2016, month: 5, day: 1, rate: [7, 11, 15, 19], age: [3, 10] },
] as const;
const currencies = [10000, 5000, 1000, 500, 100];
const kana = 'アイウエ';
const date = (year: number, month: number, day: number) => year + '年' + month + '月' + day + '日';
const lineNumbers = (lines: string[], first: number) =>
  lines.map((line, i) => String(first + i).padStart(2, ' ') + '  ' + line).join('\n');
const record = (row: string, i: number) => String(i + 1).padStart(6, '0') + ',' + row;
const percent = (value: number) => (value / 100).toFixed(2);
const mmdd = (month: number, day: number) => String(month * 100 + day).padStart(4, '0');
export const payrollCases = configuration.map((setup, index) => {
  const { year, month, day, rate, age: [low, high] } = setup;
  const join = (status: number, years: number, beforeAnniversary: boolean, salary: number) =>
    [status, String(year - years - Number(beforeAnniversary)) + mmdd(month, day + Number(beforeAnniversary)), salary].join(',');
  const testGroups = index === 0 ? referenceData : Array.from({ length: 4 }, (_, group) => {
    return [0, 1, 2, 3, 4, 5].map((route, row) => {
      const gap = (group + 4 - index) % 4;
      const routeIndex = gap > 0 && route === [0, 1, 2, 5][gap] ? route - 1 : route;
      const age = [low, low, low + 1, high, high + 1, high + 1 + index][routeIndex];
      return join(routeIndex % 2, age, (row + group) % 2 === 0, 111000 + index * 3000 + group * 2500 + row * 9200);
    });
  });
  const salary = (role: number, enteredYear: number, enteredMonthDay: number, base: number) => {
    const age = year - enteredYear - Number(enteredMonthDay > month * 100 + day);
    const step = age <= low ? 0 : age <= high ? 1 : 2;
    const ratePercent = rate[step + role];
    const payment = Math.floor(base * ratePercent / 10000) * 100;
    let remainder = payment;
    const pieces = currencies.map(unit => {
      const count = Math.floor(remainder / unit);
      remainder -= count * unit;
      return count;
    });
    return { route: 2 * step + role, payment, pieces };
  };
  const groups = testGroups.map(rows => rows.map(record).join('\n'));
  const routes = testGroups.map(rows => rows.map(row => {
    const [role, entered, base] = row.split(',').map(Number);
    return salary(role, Math.floor(entered / 10000), entered % 10000, base);
  }));
  const fullIndex = routes.findIndex(group => new Set(group.map(result => result.route)).size === 6);
  const exampleTotals = index === 0 ? [1415, 267, 2189, 311, 2052] : currencies.map((_, i) =>
    routes[fullIndex].reduce((sum, result) => sum + result.pieces[i], 0));
  return { setup, groups, fullIndex, exampleTotals };
});

export const q10 = createLanguageDefinition(10, '勤続年数と役職による特別給及び金種の集計', '創立記念日・支給条件・テストデータ', 'abc2de', 'イエアイイウ',
  '創立記念日，勤続区分，支給係数とテストレコードを連動させる。暦での勤続判定と独立した最少枚数計算で各分岐と金種集計を検算する。', index => {
    const { setup: { year, month, day, rate, age: [low, high] }, groups, fullIndex, exampleTotals } = payrollCases[index];
    const cutoff = mmdd(month, day);
    const younger = 'UPTO-' + low;
    const middle = 'UPTO-' + high;
    const display = currencies.map((unit, i) => String(unit).padStart(5, '0') + ' : ' + String(exampleTotals[i]).padStart(8, '0')).join('\n');
    const first = lineNumbers([
      'DATA DIVISION.',
      'FILE SECTION.',
      'FD EMP-F.',
      '01 E-REC.',
      '   02 E-NO           PIC 9(6).',
      '   02 E-STATUS       PIC 9(1).',
      '      88 NON-MANAGER VALUE 0.',
      '      88 MANAGER     VALUE 1.',
      '   02 E-JOIN.',
      '      03 E-YEAR      PIC 9(4).',
      '      03 E-MMDD      PIC 9(4).',
      '   02 E-BASE         PIC 9(6).',
      'FD PAY-F.',
      '01 P-REC.',
      '   02 P-NO           PIC 9(6).',
      '   02 P-PAY          PIC 9(6).',
      '   02 P-CUR-TBL.',
      '      03 P-CUR       PIC 9(2) OCCURS 5.',
      'WORKING-STORAGE SECTION.',
      '77 EMP-FLAG          PIC X(1) VALUE SPACE.',
      '   88 EMP-EOF        VALUE "E".',
      '77 W-YEAR            PIC 9(2).',
      '   88 ' + younger.padEnd(15) + 'VALUE 0 THRU ' + low + '.',
      '   88 ' + middle.padEnd(15) + 'VALUE ' + (low + 1) + ' THRU ' + high + '.',
      '   88 UPTO-20        VALUE ' + (high + 1) + ' THRU 20.',
      '77 PAY-RATE          PIC 9V99.',
      '77 W-PAY             PIC 9(6).',
    ], 1);
    const second = lineNumbers([
      '01 CUR-VALUE        PIC X(25) VALUE "1000005000010000050000100".',
      '01 CUR-TBL REDEFINES CUR-VALUE.',
      '   02 CUR-KIND      PIC 9(5) OCCURS 5.',
      '01 CNT              PIC 9(1).',
      'PROCEDURE DIVISION.',
      'MAIN-PROC.',
      '    OPEN INPUT  EMP-F',
      '         OUTPUT PAY-F.',
      '    PERFORM UNTIL EMP-EOF',
      '      READ EMP-F AT END SET EMP-EOF TO TRUE',
      '        NOT AT END MOVE E-NO TO P-NO',
      '                   PERFORM DEC-PROC',
      '                   PERFORM CUR-PROC',
      '                   WRITE P-REC',
      '      END-READ',
      '    END-PERFORM.',
      '    CLOSE EMP-F PAY-F.',
      '    STOP RUN.',
      'DEC-PROC.',
      '    COMPUTE W-YEAR = ' + year + ' - E-YEAR.',
      '    IF [a] THEN',
      '      SUBTRACT 1 FROM W-YEAR',
      '    END-IF.',
      '    EVALUATE TRUE',
      '      WHEN ' + younger.padEnd(8) + 'AND NON-MANAGER',
      '        MOVE ' + percent(rate[0]) + ' TO PAY-RATE',
      '      WHEN ' + younger.padEnd(8) + 'AND MANAGER',
      '      WHEN ' + middle.padEnd(8) + 'AND NON-MANAGER',
      '        MOVE ' + percent(rate[1]) + ' TO PAY-RATE',
      '      WHEN ' + middle.padEnd(8) + 'AND MANAGER',
      '      WHEN UPTO-20 AND NON-MANAGER',
      '        MOVE ' + percent(rate[2]) + ' TO PAY-RATE',
      '      WHEN UPTO-20 AND MANAGER',
      '        MOVE ' + percent(rate[3]) + ' TO PAY-RATE',
      '    END-EVALUATE.',
      '    COMPUTE P-PAY = E-BASE * PAY-RATE.',
      '    DIVIDE 100 INTO P-PAY.',
      '    MULTIPLY 100 BY P-PAY.',
      'CUR-PROC.',
      '    INITIALIZE P-CUR-TBL.',
      '    MOVE 1 TO CNT.',
      '    MOVE P-PAY TO W-PAY.',
      '    PERFORM UNTIL W-PAY = 0',
      '      IF W-PAY >= CUR-KIND(CNT) THEN',
      '        ADD 1 TO P-CUR(CNT)',
      '        [b]',
      '      ELSE',
      '        [c]',
      '      END-IF',
      '    END-PERFORM.',
    ], 28);
    const decisionRows = [
      ['条件1（勤続年数）', low + '年以下', 'Y', 'Y', 'N', 'N', 'N', 'N'],
      ['', (low + 1) + '～' + high + '年', 'N', 'N', 'Y', 'Y', 'N', 'N'],
      ['', (high + 1) + '年以上', 'N', 'N', 'N', 'N', 'Y', 'Y'],
      ['条件2（役職）', '一般職', 'Y', 'N', 'Y', 'N', 'Y', 'N'],
      ['', '管理職', 'N', 'Y', 'N', 'Y', 'N', 'Y'],
      ...[[0], [1, 2], [3, 4], [5]].map((routes, i) => [
        i === 0 ? '動作（支給係数）' : '', percent(rate[i]),
        ...Array.from({ length: 6 }, (_, n) => routes.includes(n) ? 'X' : '－'),
      ]),
    ];
    return {
      pages: [
        page(48, [
          p('問10　次のCOBOLプログラムの説明及びプログラムを読んで，設問1～3に答えよ。'),
          p('〔プログラムの説明〕\n' + date(year - 20, month, day) + 'に創立したX社では，創立20周年の記念日である' + date(year, month, day) + 'に，勤続年数が0～20年の全ての従業員に特別給を支給することにした。特別給は，基本給に，表1に示す決定表によって導出される支給係数を掛け合わせて百円未満を切り捨てた金額であり，創立記念日に上司が現金の入った封筒を部下に手渡す。このプログラムは，従業員ファイルに格納されている従業員の情報を読み込み，各従業員への支給金額と，各金種の必要数を支給ファイルに出力する。ここで，金種は1万円紙幣，5千円紙幣，千円紙幣，5百円硬貨，百円硬貨の5種類とする。'),
          table('表1 支給係数の決定表', ['条件・動作', '値', '1', '2', '3', '4', '5', '6'], decisionRows),
          p('（1）従業員ファイルは，図1に示すレコード様式の順ファイルである。'),
          table('図1 従業員ファイルのレコード様式', ['従業員番号', '役職', '入社日', '基本給'], [['6桁', '1桁', '8桁', '6桁']]),
          p('① 役職には，一般職の場合は0，管理職の場合は1を格納する。\n② 入社日には，入社した年，月，日を，それぞれ4桁，2桁，2桁の西暦で格納する。表1に示す支給係数の決定表の条件1（勤続年数）は，入社日から' + year),
        ]),
        page(49, [
          p(month + '月' + day + '日までの経過年数とする。例えば，入社日が' + date(year - 1, month, day) + 'の場合は1年であり，' + date(year - 1, month, day + 1) + 'の場合は0年である。'),
          p('（2）支給ファイルは，図2に示すレコード様式の順ファイルである。'),
          table('図2 支給ファイルのレコード様式（右の5項目は金種別必要数）', ['従業員番号', '支給金額', '1万円紙幣', '5千円紙幣', '千円紙幣', '5百円硬貨', '百円硬貨'], [['6桁', '6桁', '2桁', '2桁', '2桁', '2桁', '2桁']]),
          p('① 支給金額には，基本給と支給係数から算出した支給金額を格納する。\n② 金種別必要数には，それぞれの金種の必要数を格納する。ここで，必要数の合計が最少となるようにする。'),
          p('〔プログラム〕（行番号）'), code(first, 'cobol'),
        ]),
        page(50, [code(second, 'cobol')]),
        page(51, [
          p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　プログラム中の，支給係数を求めるEVALUATE文について，正しく判定できることを確認するために，従業員ファイルのテストデータを作成した。全ての選択対象（WHEN指定に書かれた作用対象を指す）について真を判定できる組合せを，解答群の中から選べ。ここで，解答群では見やすくするために項目の区切りに“,”を挿入しているが，実際のデータ中には存在しない。'),
        ], [
          bank(1, 'a', ['E-MMDD < ' + cutoff, 'E-MMDD > ' + cutoff, 'W-YEAR < 20', 'W-YEAR >= 20'], 'イ', 'cobol'),
          bank(1, 'bc', ['ADD 1 TO CNT', 'ADD CNT TO P-CUR(CNT)', 'MOVE CUR-KIND(CNT) TO P-CUR(CNT)', 'SUBTRACT CUR-KIND(CNT) FROM W-PAY', 'SUBTRACT P-CUR(CNT) FROM W-PAY'], 'エア', 'cobol'),
          bank(2, '2', groups, kana[fullIndex], 'text'),
        ], [0, 0, 1]),
        page(52, [
          p('設問3　金融機関に現金を用意してもらうために，金種ごとの必要数を集計して，図3に示すとおり画面に表示するようプログラムを変更する。表2中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('図3 画面表示の例'), code(display, 'text'),
          languageFigure(10, 'program-changes', index, '表2 プログラムの変更'),
        ], [
          bank(3, 'd', ['行番号42と43の間に追加', '行番号44と45の間に追加', '行番号46と47の間に追加', '行番号66と67の間に追加'], 'イ'),
          bank(3, 'e', ['ADD 1 TO CUR-TOTAL(CNT)', 'ADD CUR-KIND(CNT) TO CUR-TOTAL(CNT)', 'ADD P-CUR(CNT) TO CUR-TOTAL(CNT)', 'ADD P-PAY TO CUR-TOTAL(CNT)'], 'ウ', 'cobol'),
        ]),
      ],
      explanation: '記念日の月日より入社月日が後の場合にだけ年差から1を引く。残額が現在の金種以上ならその金種を1個使って金額を引き，足りなければ次の金種に進む。設問2では' + kana[fullIndex] + 'が，勤続年数の3区分と一般職・管理職の組合せをそれぞれ満たす。各従業員を処理するたびにP-CUR(CNT)を加算し，全従業員の処理とファイルのクローズが終わってから，STOP RUNの前に1回だけ表示する。',
    };
  });
