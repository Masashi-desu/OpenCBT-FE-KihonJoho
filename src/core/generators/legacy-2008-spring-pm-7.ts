import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2008-spring-pm-06-09-support';
import { surveyCases } from './legacy-2008-spring-pm-06-09-model';
import { drawing } from './legacy-2008-spring-pm-06-09-figures';

export function surveyProgram(index: number): string {
  const { limit, codes } = surveyCases[index];
  const nameHeader = codes.map(name => name.padEnd(8)).join('').trimEnd();
  return ` 1  DATA DIVISION.
 2  FILE SECTION.
 3  FD  RESULT-FILE.
 4  01  RESULT-REC.
 5      02  EMPLOYEE       PIC X(6).
 6      02  SURVEY         PIC X(5).
 7  WORKING-STORAGE SECTION.
 8  01  SURVEY-DATA.
 9      02  EVENT          PIC 9(1) OCCURS 5.
10  01  TOTAL.
11      02  EVENT-TOTAL    PIC 9(4) OCCURS 5 VALUE ZERO.
12  77  READ-FLAG          PIC X(1) VALUE SPACE.
13      88  DATA-EOF       VALUE "E".
14  77  WK-CNT             PIC 9(1).
15  77  CHOICE-CNT         PIC 9(1).
16  01  HEADER             PIC X(40) VALUE
17                         "${nameHeader}".
18  01  EVENT-HEADER REDEFINES HEADER.
19      02  EVENT-NAME     PIC X(8) OCCURS 5.
20  PROCEDURE DIVISION.
21  MAIN-PROC.
22      OPEN INPUT RESULT-FILE.
23      PERFORM UNTIL DATA-EOF
24        READ RESULT-FILE AT END     SET DATA-EOF TO TRUE
25                         NOT AT END MOVE SURVEY TO SURVEY-DATA
26                                    PERFORM CNT-PROC
27        END-READ
28      END-PERFORM.
29      CLOSE RESULT-FILE.
30      PERFORM PRT-PROC.
31      STOP RUN.
32  CNT-PROC.
33      MOVE ZERO TO CHOICE-CNT.
34      PERFORM VARYING WK-CNT FROM 1 BY 1 UNTIL WK-CNT > 5
35        ［a］
36      END-PERFORM.
37      IF CHOICE-CNT <= ${limit} THEN
38         PERFORM VARYING WK-CNT FROM 1 BY 1 UNTIL WK-CNT > 5
39           ［b］
40         END-PERFORM
41      END-IF.
42  PRT-PROC.
43      PERFORM VARYING WK-CNT FROM 1 BY 1 UNTIL WK-CNT > 5
44       DISPLAY EVENT-NAME(WK-CNT) ": " EVENT-TOTAL(WK-CNT)
45      END-PERFORM.`;
}
export const q7 = draftQuestion(7, 'COBOL：複数選択式アンケートのイベント別集計',
  '選択上限・イベント構成・有効票の加算点', '設問1 aア bエ／設問2 cア dエ',
  '5欄の0/1入力を合計して無効票を除き，イベント別の処理と無効票数の追記を別の段階に保つ。イベント名と選択上限，有効票の配点を同じ値から本文・表示例・選択肢へ反映し，4桁の表示を超えない入力域とする。', (index, original) => {
    const { group: points, limit } = surveyCases[index];
    const weight = points === 1 ? '' : ' * ' + points;
    const maxRecords = points === 1 ? '9,999' : String(Math.floor(9999 / points));
    const abc = [
      'COMPUTE CHOICE-CNT = CHOICE-CNT + EVENT(WK-CNT)',
      'COMPUTE CHOICE-CNT = CHOICE-CNT + EVENT-TOTAL(WK-CNT)',
      'COMPUTE EVENT-TOTAL(WK-CNT)\n   = EVENT-TOTAL(WK-CNT) + CHOICE-CNT' + weight,
      'COMPUTE EVENT-TOTAL(WK-CNT)\n   = EVENT-TOTAL(WK-CNT) + EVENT(WK-CNT)' + weight,
      'MOVE EVENT(WK-CNT) TO CHOICE-CNT',
      'MOVE EVENT(WK-CNT) TO EVENT-TOTAL(WK-CNT)',
    ];
    return {
      pages: [
        { page: 25, blocks: [
          p('問7　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('ある会社の工場では，1年に1回，従業員とその家族向けに工場を開放して様々なイベントを開催している。このプログラムは，イベントに参加した従業員が提出した“楽しかったイベント”のアンケート結果を集計する。'),
          p('(1) アンケート結果ファイルは，図1に示すレコード様式の順ファイルである。'),
          drawing('7-record', index),
          p('① アンケート結果ファイルには，楽しかったイベントに1が，それ以外には0が格納されている。'),
          p('② 楽しかったイベントは' + (original ? '二つ' : limit + '件') + 'まで選択できる。' +
            (original ? '三つ' : (limit + 1) + '件') + '以上のイベントが選択されていた場合は，無効として集計対象から除外する。'),
          p('③ アンケート結果ファイルのレコード数は' + maxRecords + '以下とする。'),
          p('(2) ' + (points === 1 ? '集計結果は，図2に示すとおり画面上に表示する。'
            : '有効なアンケートの各選択イベントに' + points + '点を加え，イベントごとの合計点を図2に示すとおり画面上に表示する。')),
          drawing('7-output', index),
        ] },
        { page: 26, blocks: [p('〔プログラム〕'), p('（行番号）'), code(surveyProgram(index), 'cobol')] },
        { page: 27, firstBanksAfter: 1, blocks: [
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　参考データとして，' + (original ? '三つ' : (limit + 1) + '件') +
            '以上のイベントを選択した無効なアンケート結果の総数を，集計結果の次に表示するようにプログラムを変更する。表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          drawing('7-changes', index),
        ], banks: [
          bank('ab', abc, 'アエ', 'cobol', 1, '解答群'),
          bank('c', ['ADD 1 TO INV-CNT', 'MOVE CHOICE-CNT TO INV-CNT', 'MOVE EVENT-TOTAL(WK-CNT) TO INV-CNT', 'MOVE WK-CNT TO INV-CNT'], 'ア', 'cobol', 2),
        ] },
        { page: 28, altPrefix: '平成20年度春期 基本情報技術者試験 午後問7（COBOL）。印刷28頁は，前の印刷27頁の設問2にある変更の表へ記入する d の解答群。', blocks: [], banks: [
          bank('d', ['行番号32と33の間', '行番号36と37の間', '行番号41と42の間', '行番号45の次'], 'エ', undefined, 2),
        ] },
      ],
      explanation: [
        'a：イベントごとの0又は1をCHOICE-CNTに足して，その回答で選ばれた数を得る。',
        'b：選択数が' + limit + '以下のときだけ，各EVENTの値' + (points === 1 ? '' : 'に' + points + 'を掛けた点数') + 'を対応するEVENT-TOTALへ加える。',
        'c：ELSE側の無効票ごとにINV-CNTを1だけ増やす。選択数やループ変数を代入すると総数を保てない。',
        'd：行番号45で表示用の繰返しを抜けた後に1回だけ表示する。',
      ].join('\n'),
    };
  });
