import { code, p, table } from './definition';
import { draw, scoreConditions } from './legacy-2005-autumn-pm-06-09-figures';
import { bank, draftQuestion, numbered, type Page } from './legacy-2005-autumn-pm-06-09-support';

const fileInstructions = [
  'INITIALIZE SORT-REC',
  'MOVE SPACE TO READ-STATUS',
  'MOVE SPACE TO SORT-REC',
  'MOVE STUDENT-ID TO SORT-REC',
  'PERFORM RELEASE-DATA',
  'SET AT-END TO TRUE',
];

const statisticsInstructions = [
  'COMPUTE STUDENT-TOTAL = STUDENT-TOTAL + 1',
  'COMPUTE STUDENT-TOTAL = STUDENT-TOTAL + K',
  'COMPUTE SUB-TOTAL(K) = SUB-TOTAL(K) + SCORE(K)',
  'MOVE K TO STUDENT-TOTAL',
  'MOVE SCORE(K) TO SUB-TOTAL(K)',
  'MOVE TOTAL TO SUB-TOTAL(K)',
];

function program(subjects: number): string[] {
  return [
    'DATA DIVISION.',
    'FILE SECTION.',
    'FD IN-FILE.',
    '01 IN-REC               PIC X(' + (24 + 3 * subjects) + ').',
    'FD OUT-FILE.',
    '01 OUT-REC              PIC X(27).',
    'SD SORT-FILE.',
    '01 SORT-REC.',
    '    02 CLASS-NO         PIC 9(2).',
    '    02 STUDENT-NO       PIC 9(2).',
    '    02 STUDENT-NAME     PIC X(20).',
    '    02 TOTAL            PIC 9(3).',
    'WORKING-STORAGE SECTION.',
    '01 W-IN-REC.',
    '    02 STUDENT-ID.',
    '        03 CLASS-NO     PIC 9(2).',
    '        03 STUDENT-NO   PIC 9(2).',
    '        03 STUDENT-NAME PIC X(20).',
    '    02 SCORE            PIC 9(3) OCCURS ' + subjects + '.',
    '01 READ-STATUS          PIC X(1) VALUE SPACE.',
    '    88 AT-END           VALUE "E".',
    '01 K                    PIC 9(1).',
    'PROCEDURE DIVISION.',
    'SORT-PROCEDURE.',
    '    SORT SORT-FILE DESCENDING KEY TOTAL',
    '         INPUT PROCEDURE IS READ-DATA',
    '         GIVING OUT-FILE.',
    '    STOP RUN.',
    'READ-DATA.',
    '    OPEN INPUT IN-FILE.',
    '    PERFORM UNTIL AT-END',
    '        READ IN-FILE AT END',
    '            ［a］',
    '        NOT AT END',
    '            MOVE IN-REC TO W-IN-REC',
    '            PERFORM RELEASE-DATA',
    '        END-READ',
    '    END-PERFORM.',
    '    CLOSE IN-FILE.',
    'RELEASE-DATA.',
    '    ［b］.',
    '    MOVE ZERO TO TOTAL.',
    '    PERFORM VARYING K FROM 1 BY 1 UNTIL K > ' + subjects,
    '        COMPUTE TOTAL = TOTAL + SCORE(K)',
    '    END-PERFORM.',
    '    RELEASE SORT-REC.',
  ];
}

export const q7 = draftQuestion(7, 'COBOL：生徒の成績表と科目別学年平均',
  '科目構成とレコード形式', 'a=カ b=エ c=ウ d=ア',
  '原題の順ファイル、学年の生徒数1～9,999人、合計点の降順と平均の小数第2位以下切り捨てを保持する。教科の構成・数および満点を変え、順ファイルのレコード長、得点と小計の配列長、2か所の反復上限を同期する。問う命令の役割が同じため正答記号は固定。',
  index => {
    const { subjects, maximum } = scoreConditions[index];
    const count = subjects.length;
    const lines = numbered(program(count)).split('\n');
    const identifiers = ['クラス番号', '生徒番号', '氏名'];
    const positions = ['2けた', '2けた', '20けた'];
    const pages: Page[] = [
      { page: 29, blocks: [
        p('問7　次の COBOL プログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p('1学年における全生徒のテスト結果が格納されている入力ファイルを読み込み，' + count +
          '科目の合計点を求めるプログラムである。このプログラムでは，学年内の総合順位が分かるよう，合計点の降順に整列して，出力ファイルに格納する。'),
        p('（1）入力ファイル IN-FILE は，次のレコード様式の順ファイルであり，1学年分の各生徒の得点が格納されている。ここで，各科目は' + maximum + '点を満点とする。'),
        table('入力ファイル IN-FILE のレコード様式', [...identifiers, ...subjects], [[...positions, ...subjects.map(() => '3けた')]]),
        p('（2）出力ファイル OUT-FILE は，次のレコード様式の順ファイルであり，' + count + '科目の合計点の降順に格納する。'),
        table('出力ファイル OUT-FILE のレコード様式', [...identifiers, '合計点'], [[...positions, '3けた']]),
        p('〔プログラム〕（行番号）'),
        code(lines.slice(0, 19).join('\n'), 'cobol'),
      ] },
      { page: 30, blocks: [
        code(lines.slice(19).join('\n'), 'cobol'),
        p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      ], banks: [bank('ab', fileInstructions, 'カエ', 'cobol', 1, '解答群')] },
      { page: 31, blocks: [
        p('設問2　プログラムの最後で生徒数及び各科目の学年平均点を表示するようにプログラムを変更する。変更内容を示す次の表中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('なお，生徒の人数は1～9,999とし，平均点は小数第2位以下を切り捨てる。'),
        draw('7-statistics', index),
      ], banks: [bank('cd', statisticsInstructions, 'ウア', 'cobol', 2, '解答群')] },
    ];
    return {
      pages,
      explanation: 'COBOL では READ の AT END で EOF を検出する。a の SET AT-END TO TRUE で READ-STATUS に E が入り，読み込みループが終了する。' +
        'b は24けたの STUDENT-ID を SORT-REC の先頭に転記する。後続の MOVE ZERO と得点加算で合計点を求め，' + count +
        '科目の合計点 TOTAL を降順に SORT する。c は科目をたどるループ内で SCORE(K) を同じ科目の SUB-TOTAL(K) に足す。' +
        'd は科目ごとのループが終わってから実行し，生徒1人につき1回だけ STUDENT-TOTAL を1増やす。' +
        '全生徒の読込み後，科目別小計を人数で割り，PIC 999.9 に小数第1位まで格納する。',
    };
  }, 'fixed');
