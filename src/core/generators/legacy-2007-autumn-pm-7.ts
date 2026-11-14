import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2007-autumn-pm-06-09-support';
import { drawing } from './legacy-2007-autumn-pm-06-09-figures';
import { healthCases } from './legacy-2007-autumn-pm-06-09-model';

function healthListing(years: number) {
  return ` 1  DATA DIVISION.
 2  FILE SECTION.
 3  FD  MAST-FILE.
 4  01  MAST-REC.
 5      02  MAST-ENO          PIC X(6).
 6      02  MAST-HEALTH       OCCURS ${years}.
 7          03  MAST-HEIGHT   PIC 9(3)V9(1).
 8          03  MAST-WEIGHT   PIC 9(3)V9(1).
 9          03  MAST-HIGH-BP  PIC 9(3).
10          03  MAST-LOW-BP   PIC 9(3).
11  FD  YEAR-FILE.
12  01  YEAR-REC.
13      02  YEAR-ENO          PIC X(6).
14      02  YEAR-HEALTH.
15          03  YEAR-HEIGHT   PIC 9(3)V9(1).
16          03  YEAR-WEIGHT   PIC 9(3)V9(1).
17          03  YEAR-HIGH-BP  PIC 9(3).
18          03  YEAR-LOW-BP   PIC 9(3).
19  WORKING-STORAGE SECTION.
20  77  READ-FLAG             PIC X(1) VALUE SPACE.
21      88  YEAR-EOF          VALUE "E".
22  77  CNT                   PIC 9(1).
23  PROCEDURE DIVISION.
24  MAIN-PROC.
25      OPEN I-O MAST-FILE INPUT YEAR-FILE.
26      PERFORM UNTIL YEAR-EOF
27        READ YEAR-FILE AT END SET YEAR-EOF TO TRUE
28                       NOT AT END PERFORM READ-MAST-PROC
29        END-READ
30      END-PERFORM.
31      CLOSE MAST-FILE YEAR-FILE.
32      STOP RUN.
33  READ-MAST-PROC.
34      ［a］.
35      READ MAST-FILE
36        INVALID KEY DISPLAY "ERROR EMPLOYEE-NO " YEAR-ENO
37        NOT INVALID KEY PERFORM UPDT-PROC
38      END-READ.
39  UPDT-PROC.
40      PERFORM VARYING CNT FROM ${years - 1} BY -1 UNTIL CNT = 0
41        ［b］
42      END-PERFORM.
43      MOVE YEAR-HEALTH TO MAST-HEALTH(1).
44      REWRITE MAST-REC.`;
}
const choicesAB = [
  'MOVE MAST-HEALTH(CNT + 1) TO MAST-HEALTH(CNT)',
  'MOVE MAST-HEALTH(CNT - 1) TO MAST-HEALTH(CNT)',
  'MOVE MAST-HEALTH(CNT) TO MAST-HEALTH(CNT + 1)',
  'MOVE MAST-HEALTH(CNT) TO MAST-HEALTH(CNT - 1)',
  'MOVE YEAR-ENO TO MAST-ENO',
  'MOVE YEAR-HEALTH TO MAST-HEALTH',
  'MOVE YEAR-HEALTH TO MAST-HEALTH(CNT)',
];
const placements = ['行番号26と27の間', '行番号30と31の間', '行番号37と38の間', '行番号39と40の間'];

export const q7 = draftQuestion(7, 'COBOL：健康診断の履歴を更新し体重の増減を検出する',
  '保存年数と体重差のしきい値・比較する側', '設問1 aオ bウ／設問2 cエ dウ',
  '従業員番号の索引参照，新しい診断に備えた後ろ向きのコピー，更新前の昨年記録による体重差チェックを保つ。保存年数，増減のしきい値，OR条件で先に示す変化方向と補完する方向を変える。',
  (index) => {
    const { years, threshold } = healthCases[index];
    const year = index === 3 ? '増加' : '減少';
    const choicesD = [
      'MAST-WEIGHT(1) <= MAST-WEIGHT(2) - ' + threshold,
      'MAST-WEIGHT(1) >= MAST-WEIGHT(2) - ' + threshold,
      index === 3 ? 'YEAR-WEIGHT >= MAST-WEIGHT(1) + ' + threshold : 'YEAR-WEIGHT <= MAST-WEIGHT(1) - ' + threshold,
      'YEAR-WEIGHT >= MAST-WEIGHT(1) - ' + threshold,
    ];
    return {
      pages: [
        { page: 26, blocks: [
          p('問7　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('ある会社では，1年に1回，従業員の定期健康診断を実施し，過去' + years + '年分の診断結果をマスタファイルに保管している。'),
          p('このプログラムは，別のファイルに記録された今年度の診断結果を，マスタファイルに反映する。'),
          p('(1) マスタファイルは，次のレコード様式の索引ファイルであり，主レコードキーは従業員番号である。'),
          drawing('7-master', index),
          p('① 従業員1人に対して1レコードとする。従業員番号が重複することはない。'),
          p('② レコードには，過去' + years + '年分の診断結果が左から受診年の新しい順で格納されている。各レコードには少なくとも過去1年分の診断結果が格納されており，就業年数が' + years + '年に満たない場合は残りの領域に空白が詰められている。'),
          p('③ 診断結果の各項目はいずれも数字で，身長はcm単位，体重はkg単位で，それぞれ小数点以下1けたまで記録され，血圧はmmHg単位の整数として記録されている。'),
          p('(2) 今年度の診断結果は，次のレコード様式の順ファイルであり，すべての従業員の情報が順不同で記録されている。同じ従業員番号のレコードが重複して存在することはない。'),
          drawing('7-year', index),
        ] },
        { page: 27, blocks: [p('〔プログラム〕'), p('（行番号）'), code(healthListing(years), 'cobol')] },
        { page: 28, firstBanksAfter: 1, blocks: [
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　今年度の診断結果をマスタファイルに反映するときに，昨年の体重と比較して' + threshold +
            ' kg以上の増減がある従業員をチェックし，対象者の従業員番号を表示するように，プログラムを変更したい。次の表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          drawing('7-change', index),
        ], banks: [
          bank('ab', choicesAB, 'オウ', 'cobol', 1, '解答群'),
          bank('c', placements, 'エ', undefined, 2),
          bank('d', choicesD, 'ウ', 'cobol', 2),
        ] },
      ],
      explanation: [
        'a：これから読む索引ファイルの主レコードキーに，今年度レコードの従業員番号を移す。',
        'b：履歴を新しい側から順に書き換えると古い値を失う。' + (years - 1) + 'から1への降順で，位置CNTの診断結果を位置CNT＋1へ移す。',
        'c：対象の従業員レコードが見つかり，昨年の診断結果がまだ位置1にある行番号39と40の間で比較する。',
        'd：既に示されている条件の反対側にある' + year + 'を検出する。差が' + threshold + ' kgちょうどの場合も対象となる。更新後に比較すると位置1には今年度の体重が入る。',
      ].join('\n'),
    };
  });
