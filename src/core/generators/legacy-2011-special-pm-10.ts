import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-special-pm-09-13-support';

export const voucherCases = [
  { year: 2011, age: 20, split: 5, medium: 1000, high: 10000, amounts: [1000, 3000, 5000, 10000], stars: [11, 2, 3, 1, 4] },
  { year: 2012, age: 18, split: 4, medium: 750, high: 9000, amounts: [1000, 2500, 4500, 9000], stars: [9, 4, 2, 2, 3] },
  { year: 2010, age: 21, split: 6, medium: 1500, high: 12000, amounts: [1500, 3500, 6000, 11000], stars: [8, 3, 2, 1, 5] },
  { year: 2013, age: 22, split: 7, medium: 1200, high: 11000, amounts: [1500, 4000, 6500, 12000], stars: [10, 1, 4, 2, 3] },
] as const;
const number = (value: number) => value.toLocaleString('ja-JP');
const scale = '----1----2----3----4----5----6----7----8----9----10';

export const voucherHolder = languageFigure(10, 'shareholder-record', '図1　株主ファイルのレコード様式', () => ({
  kind: 'tables', tables: [{ headers: [], showHeaders: false, rows: [['株主番号\n8けた', '保有株数\n6けた', '登録年\n4けた']] }],
}));
export const voucherRecord = languageFigure(10, 'voucher-record', '図2　商品券ファイルのレコード様式', () => ({
  kind: 'tables', tables: [{ headers: [], showHeaders: false, rows: [['株主番号\n8けた', '発行額\n6けた']] }],
}));
export const voucherDecision = languageFigure(10, 'decision-table', '表1　決定表', index => {
  const { medium, high, split, amounts } = voucherCases[index];
  return { kind: 'tables', tables: [{ headers: [], showHeaders: false,
    merges: [{ row: 0, column: 0, rowSpan: 3, colSpan: 1 }, { row: 3, column: 0, rowSpan: 2, colSpan: 1 }, { row: 5, column: 0, rowSpan: 4, colSpan: 1 }],
    rows: [
      ['条件1\n（保有株数）', `${number(medium - 1)}株以下`, 'Y', 'Y', 'N', 'N', 'N', 'N'],
      ['', `${number(medium)}～${number(high - 1)}株`, 'N', 'N', 'Y', 'Y', 'N', 'N'],
      ['', `${number(high)}株以上`, 'N', 'N', 'N', 'N', 'Y', 'Y'],
      ['条件2\n（保有期間）', `${split}年未満`, 'Y', 'N', 'Y', 'N', 'Y', 'N'],
      ['', `${split}年以上`, 'N', 'Y', 'N', 'Y', 'N', 'Y'],
      ...amounts.map((amount, i) => [i === 0 ? '動作\n（発行額）' : '', `${number(amount)}円`, ...[0, 1, 1, 2, 2, 3].map(position => position === i ? 'X' : '－')]),
    ],
  }] };
});
export const voucherGraph = languageFigure(10, 'holding-period-chart', '図3　保有期間別の株主比率の表示例', index => {
  const { stars, age } = voucherCases[index];
  const line = (year: number, count: number) => String(year).padStart(2, '0') + ': ' + '*'.repeat(count);
  return { kind: 'output', text: ['    ' + scale, ...stars.slice(0, 4).map((count, i) => line(i, count)), ' ⋮', line(age, stars[4])].join('\n') };
});
export const voucherPatchStart = languageFigure(10, 'program-change-start', '表2　プログラムの変更', index => {
  const { age } = voucherCases[index];
  const declarations = `77  CNT          PIC 9(2).
77  CNT-ALL      PIC 9(8) VALUE 0.
01  .
    02 CNT-HLD   OCCURS ${age + 1} PIC 9(8) VALUE 0.
01  RATIO        PIC 9(2) VALUE 0.
01  PRT-DATA.
    02 PRT-TERM  PIC 9(2).
    02 PRT-DLIM  PIC X(2).
    02 PRT-EDIT  PIC X(51).
01  PRT-HEAD     PIC X(51) VALUE
    "${scale}".`;
  return { kind: 'tables', tables: [{ headers: ['処置', '変更内容'], rows: [['行番号16と17の間\nに追加', declarations]] }] };
});
export const voucherPatchEnd = languageFigure(10, 'program-change-end', '表2　プログラムの変更（続き）', index => {
  const { age } = voucherCases[index];
  return { kind: 'tables', tables: [{ headers: ['処置', '変更内容'], showHeaders: false, rows: [
    ['行番号26と27の間\nに追加', `    IF CNT-ALL NOT = 0 THEN
       PERFORM GRAPH-PROC
    END-IF.`],
    ['行番号43の後ろに\n追加', `      ［h］.
      ADD 1 TO CNT-ALL.
GRAPH-PROC SECTION.
      MOVE SPACE TO PRT-DATA.
      MOVE PRT-HEAD TO PRT-EDIT.
      DISPLAY PRT-DATA.
      MOVE ":" TO PRT-DLIM.
      PERFORM VARYING CNT FROM 0 BY 1 UNTIL CNT > ${age}
         MOVE SPACE TO PRT-EDIT
         MOVE CNT TO PRT-TERM
         ［i］
         IF RATIO > 0 THEN
            MOVE ALL "*" TO PRT-EDIT(1:RATIO)
         END-IF
         DISPLAY PRT-DATA
      END-PERFORM.`],
  ] }] };
});

function numbered(start: number, code: string) {
  return code.split('\n').map((line, index) => String(start + index).padStart(2) + '  ' + line).join('\n');
}
export function voucherProgram(index: number) {
  const { year, amounts } = voucherCases[index];
  return [
    numbered(1, `DATA DIVISION.
FILE SECTION.
FD  HOLDER.
01  HLD-REC.
    02  HLD-NO         PIC 9(8).
    02  HLD-STOCK      PIC 9(6).
    02  HLD-YEAR       PIC 9(4).
FD  GIFT.
01  GFT-REC.
    02  GFT-NO         PIC 9(8).
    02  GFT-SUM        PIC 9(6).
WORKING-STORAGE SECTION.
77  READ-FLAG          PIC X(1) VALUE SPACE.
    88  EOF            VALUE "E".
77  BASE-YEAR          PIC 9(4) VALUE ${year}.
77  TERM               PIC 9(4).
PROCEDURE DIVISION.
MAIN-PROC SECTION.
    OPEN INPUT HOLDER.
    OPEN OUTPUT GIFT.
    PERFORM UNTIL EOF
       READ HOLDER AT END     SET EOF TO TRUE
                   NOT AT END PERFORM SUM-PROC
       END-READ
    END-PERFORM.
    CLOSE HOLDER GIFT.
    STOP RUN.`),
    numbered(28, `SUM-PROC SECTION.
    MOVE HLD-NO TO GFT-NO.
    COMPUTE TERM = BASE-YEAR - HLD-YEAR.
    EVALUATE HLD-STOCK ALSO TERM
       WHEN ［a］ THRU ［b］ ALSO ［c］ THRU ［d］
          MOVE ${amounts[0]} TO GFT-SUM
       WHEN ［a］ THRU ［b］ ALSO ［e］
       WHEN ［f］ THRU ［g］ ALSO ［c］ THRU ［d］
          MOVE ${amounts[1]} TO GFT-SUM
       WHEN ［f］ THRU ［g］ ALSO ［e］
       WHEN ［e］            ALSO ［c］ THRU ［d］
          MOVE ${amounts[2]} TO GFT-SUM
       WHEN ［e］            ALSO ［e］
          MOVE ${amounts[3]} TO GFT-SUM
    END-EVALUATE.
    WRITE GFT-REC.`),
  ];
}
export function voucherBanks(index: number) {
  const { medium, high, split } = voucherCases[index];
  return {
    ab: [1, 9, 10, 99, medium - 1, medium, 'ANY', 'OTHER'].map(String),
    cde: [0, 1, split - 1, split, 9, 10, 'ANY', 'OTHER'].map(String),
    fg: [medium, 3000, 5000, high - 1, high, 20000, 'ANY', 'OTHER'].map(String),
    h: ['CNT', 'CNT + 1', 'CNT - 1', 'TERM', 'TERM + 1', 'TERM - 1'].map(sub => 'ADD 1 TO CNT-HLD(' + sub + ')'),
    i: [
      ...['CNT', 'CNT + 1', 'CNT - 1'].map(sub => `COMPUTE RATIO = (CNT-ALL * 100 / CNT-HLD(${sub})) / 2`),
      ...['CNT', 'CNT + 1', 'CNT - 1'].map(sub => `COMPUTE RATIO = (CNT-HLD(${sub}) * 100 / CNT-ALL) / 2`),
    ],
  };
}

export const q10 = createLanguageDefinition(10, 'COBOLで商品券の発行と株主比率を集計する', 'voucherThresholds', 'abcdefghi', 'アオアウキアエオオ',
  '決定表の六条件列とEVALUATEの先に一致した条件を保ち、基準年、上限年数、株数と年数の境界、四発行額を変える。配列を1始まりで参照し、棒グラフの端数は切り捨てる。',
  index => {
    const { year, age, split, medium, high } = voucherCases[index];
    const [programA, programB] = voucherProgram(index);
    const options = voucherBanks(index);
    return {
      pages: [
        page(46, [heading('問10　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'), heading('〔プログラムの説明〕'),
          p(`小売業のC社では，自社株主へ株主優待として，自社店舗で利用できる商品券を発行することにした。株主の保有株数と保有期間によって，発行額を決定する。この会社では，毎年3月31日の株取引終了時点で自社株を保有している株主を対象とした株主一覧を作成しており，商品券は，${year}年3月31日に作成した株主一覧に登録されている個人株主に対して発行する。`),
          p('このプログラムは，株主ファイルを読み込み，発行する商品券の発行額を商品券ファイルに出力する。'),
          p(`（1） 株主ファイルは，${year}年3月31日に作成した株主一覧に登録されている個人株主を対象に作成した，図1に示すレコード様式の順ファイルである。`), voucherHolder.block(index),
          p('① 株主番号には，株主に対して一意に割り当てた番号が設定されている。\n② 保有株数には，保有する株数が設定されている。保有株数の最大は999,999とする。\n③ 登録年には，最初に株主一覧に登録された年が設定されている。ただし，株をすべて売却した後に再取得した株主の場合は，再取得後，株主一覧に登録された年が設定される。'),
          p(`（2） 保有期間は，登録年から${year}年までの年数で決定する。例えば，登録年が${year - 5}年の場合は5年である。\n（3） この会社が株式公開したのは${year - age - 1}年4月1日であり，最初に株主一覧へ登録されるのは${year - age}年3月31日である。したがって，最長保有期間は${age}年である。\n（4） 商品券ファイルは，図2に示すレコード様式の順ファイルである。`), voucherRecord.block(index),
          p('発行額には，各株主に対する商品券の発行額を設定する。発行額は，表1に示す決定表によって決まる。')]),
        page(47, [voucherDecision.block(index), heading('〔プログラム〕（行番号）'), code(programA, 'cobol')]),
        page(48, [code(programB, 'cobol'), p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')],
          [bank(1, 'ab', options.ab, 'アオ', 'cobol'), bank(1, 'cde', options.cde, 'アウキ', 'cobol'), bank(1, 'fg', options.fg, 'アエ', 'cobol')]),
        page(49, [p('設問2　保有期間の傾向を確認するため，商品券の発行額の算出と同時に，図3に示す棒グラフを表示するようプログラムを変更したい。表2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          heading('〔グラフの説明〕'), p('（1） 行の先頭に表示してある数字は，保有期間を表す。\n（2） “*”は，当該保有期間に該当する株主比率を表す。\n（3） 株主比率は，2％未満の端数を切り捨て，“*”一つを2％として表示する。\n（4） 目盛りの数字の単位は10％である。'),
          voucherGraph.block(index), voucherPatchStart.block(index)]),
        page(50, [voucherPatchEnd.block(index)], [bank(2, 'h', options.h, 'オ', 'cobol'), bank(2, 'i', options.i, 'オ', 'cobol')]),
      ],
      explanation: `第1範囲は1～${number(medium - 1)}株（a，b），第2範囲は${number(medium)}～${number(high - 1)}株（f，g）。短い保有期間は0～${split - 1}年（c，d）である。先に一致するWHENが選ばれるので，残る条件をANYで受ける（e）。OTHERはALSOで並べる個別条件の値に指定できない。COBOLの添字は1から始まるので，登録はTERM + 1（h），表示はCNT + 1の人数を全人数で割った割合から星の個数を求める（i）。`,
    };
  });

export const q10Figures = [voucherHolder, voucherRecord, voucherDecision, voucherGraph, voucherPatchStart, voucherPatchEnd];
