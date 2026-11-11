import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page, standaloneBank } from './legacy-2010-spring-pm-09-13-support';

const cases = [
  { capacity: 99, authorisationThreshold: 2, missing: 2, invalid: 1, deny: 3, full: 4, includeAtTime: false },
  { capacity: 30, authorisationThreshold: 1, missing: 4, invalid: 2, deny: 1, full: 3, includeAtTime: true },
  { capacity: 48, authorisationThreshold: 3, missing: 1, invalid: 3, deny: 4, full: 2, includeAtTime: false },
  { capacity: 72, authorisationThreshold: 2, missing: 3, invalid: 4, deny: 2, full: 1, includeAtTime: true },
];

const record = (suffix: string, title: string, fields: string[], widths: string[]) => languageFigure(10, suffix, title,
  () => ({ kind: 'tables', tables: [{ headers: fields, rows: [widths.map(width => width + 'けた')] }] }));
const params = record('parameter', '図1 パラメタの形式', ['処理コード', '従業員番号', '結果コード'], ['1', '8', '1']);
const employee = record('employee-record', '図2 従業員ファイルのレコード様式', ['従業員番号', '職級', '資格'], ['8', '1', '1']);
const log = record('log-record', '図3 入退室ログファイルのレコード様式', ['従業員番号', '入退室コード', '入退室日時'], ['8', '1', '14']);
export const q10Figures = [params, employee, log];

const classes = ['一般社員', '係長', '課長', '部長'];
const cols = (text: string) => code(text, 'cobol');

export const q10 = createLanguageDefinition(10, 'COBOL：入退室の許可とログからの在室者抽出', '収容人数・資格判定対象・結果コード・検索日時の境界', 'ab2cdef',
  '設問1 aイ bア／設問2 イ／設問3 cオ dウ eエ fイ', '二つのプログラム、2件のレコード様式、1件のパラメタ、COBOLの区切りと継続行、三設問・7欄を保つ。収容人数、職級の資格判定範囲、結果コード、指定日時を含める境界を変える。', index => {
    const { capacity, authorisationThreshold: level, missing, invalid, deny, full, includeAtTime } = cases[index];
    const consulted = classes.slice(0, level).join('、');
    const automatic = classes.slice(level).join('、');
    const cut = includeAtTime ? '指定した日時又はそれより前に入室し，かつ，指定した日時より後に退室した' : '指定した日時より前に入室し，かつ，指定した日時か，それより後に退室した';
    return {
      pages: [
        page(55, [
          p('問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('〔プログラム1の説明〕G社では，IDカード操作によって資格保有者以外の立入りを禁止し，入室者の入退室日時を記録するセキュリティルームを設置した。プログラム1は管理システムのサブプログラムであり，処理コードと従業員番号を受け取り，結果コードを返す。'),
          p('（1）パラメタの形式は図1のとおりである。'), params.block(index),
          p('① 処理コードには，入室時に1，退室時に2を設定する。'),
          p('② 結果コードは，入室を許可する場合は0，許可しない場合は事象に対応するコード，退室時は0を設定する。'),
          p('（2）従業員ファイルは従業員番号をキーとする，図2のレコード様式の索引ファイルである。'), employee.block(index),
          p('① 従業員番号には一意な8けたの数字が設定され，従業員番号0の従業員はいない。'),
          p('② 職級は一般社員，係長，課長，部長の順に1，2，3，4を設定する。'),
          p(`③ ${consulted}の資格には，申請で入室を許可された場合は1，許可されていない場合は0を設定する。${automatic}の資格の値は不定である。`),
          p(`（3）入室できるのは，${automatic}と，入室を許可された${consulted}である。`),
        ]),
        page(56, [
          p(`（4）同時に在室できる人員は${capacity}名までとする。`),
          p('（5）入室者の入退室日時を記録する入退室ログファイルは図3のレコード様式の順ファイルである。'), log.block(index),
          p('① 入退室コードは入室記録なら1，退室記録なら2を設定する。'),
          p('② 入退室日時は西暦の日付と24時間表記の時刻を格納し，組込み関数CURRENT-DATEの先頭14文字を使用する。'),
          p('③ レコードは入退室時に出力するので，ファイル中の全レコードは入退室日時の昇順に整列されている。'),
          p('④ 月末深夜のメンテナンスで一時運用を停止して，新しいログファイルに切り換える。開始時には室内を無人にし，完了まで入室を禁止する。同一人物の入室・退室のレコードは必ず対で格納される。'),
          p('（6）このプログラムは，最初の呼出し以外にはCANCEL文などによって初期状態にならない。'),
          p('（7）本人のIDカードを使って1人ずつ入退室し，すべての入退室を記録する。'),
          p('〔プログラム1〕'),
          cols(`DATA DIVISION.
FILE SECTION.
FD  EMPLOYEE.
01  EMP-REC.
    02  EMP-KEY.
        03  EMP-NO       PIC 9(8).
    02  EMP-CLASS        PIC 9(1).
    02  EMP-QUAL         PIC 9(1).
FD  LOG-FILE.
01  LOG-REC.
    02  LOG-EMP          PIC 9(8).
    02  LOG-CD           PIC 9(1).
    02  LOG-TIME         PIC X(14).`),
        ]),
        page(57, [
          cols(`WORKING-STORAGE SECTION.
01  CNT                  PIC 9(3) VALUE ZERO.
LINKAGE SECTION.
01  PRM.
    02  PRM-CD           PIC 9(1).
        88 CD-ENTER        VALUE 1.
        88 CD-EXIT         VALUE 2.
    02  PRM-EMP          PIC 9(8).
    02  PRM-RTN          PIC 9(1).
PROCEDURE DIVISION USING PRM.
CTL-PROC SECTION.
    MOVE ZERO TO PRM-RTN.
    EVALUATE TRUE
       WHEN CD-ENTER PERFORM QUAL-CHECK
       WHEN CD-EXIT  PERFORM REC-LOG
                     SUBTRACT 1 FROM CNT
       WHEN OTHER    MOVE ${invalid} TO PRM-RTN
    END-EVALUATE.
    EXIT PROGRAM.
QUAL-CHECK SECTION.
    OPEN INPUT EMPLOYEE.
    MOVE PRM-EMP TO EMP-NO.
    READ EMPLOYEE
       INVALID KEY
          MOVE ${missing} TO PRM-RTN
       NOT INVALID KEY
          EVALUATE TRUE
             WHEN ［a］
                MOVE ${deny} TO PRM-RTN
             WHEN CNT >= ${capacity}
                MOVE ${full} TO PRM-RTN
             WHEN OTHER
                PERFORM REC-LOG
                ［b］
          END-EVALUATE
    END-READ.
    CLOSE EMPLOYEE.
REC-LOG SECTION.
    OPEN EXTEND LOG-FILE.
    MOVE PRM-EMP TO LOG-EMP.
    MOVE PRM-CD TO LOG-CD.
    MOVE FUNCTION CURRENT-DATE TO LOG-TIME.
    WRITE LOG-REC.
    CLOSE LOG-FILE.`),
        ]),
        page(58, [
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2 パラメタで渡された従業員番号が，従業員ファイル中に存在しなかった場合に設定する結果コードを，解答群の中から選べ。'),
          p(`設問3 プログラム1が作成したある月の入退室ログファイルを読み込み，指定した日時にセキュリティルーム内にいた全員の従業員番号を表示するプログラム2を作成した。${cut}全従業員の番号を表示する。プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。`),
          p('〔プログラム2〕'),
          cols(`DATA DIVISION.
FILE SECTION.
FD  LOG-FILE.
01  LOG-REC.
    02  LOG-EMP          PIC 9(8).
    02  LOG-CD           PIC 9(1).
        88 CD-ENTER        VALUE 1.
        88 CD-EXIT         VALUE 2.
    02  LOG-TIME         PIC X(14).`),
        ], [
          bank(1, 'a', [`EMP-CLASS <= ${level}`, `EMP-CLASS <= ${level} AND EMP-QUAL = 0`, `EMP-CLASS <= ${level} OR EMP-QUAL = 0`, 'EMP-QUAL = 0'], 'イ', 'cobol'),
          bank(1, 'b', ['ADD 1 TO CNT', 'MOVE ZERO TO CNT', 'SET CD-ENTER TO TRUE', 'SET CD-EXIT TO TRUE'], 'ア', 'cobol'),
          standaloneBank(2, ['1', '2', '3', '4'], 'アイウエ'[missing - 1]),
        ], [0, 0, 1]),
        page(59, [
          cols(`WORKING-STORAGE SECTION.
77  CNT                  PIC 9(3).
77  SRCH-FLAG            PIC X(1).
    88 SRCH-END            VALUE "E".
01  STAY-ROOM.
    02  EMP-NO           PIC 9(8) OCCURS ${capacity}.
LINKAGE SECTION.
01  PRM-TIME          PIC X(14).
PROCEDURE DIVISION USING PRM-TIME.
MAIN-PROC SECTION.
    MOVE SPACE TO SRCH-FLAG.
    PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > ${capacity}
       MOVE ZERO TO EMP-NO(CNT)
    END-PERFORM.
    OPEN INPUT LOG-FILE.
    READ LOG-FILE AT END SET SRCH-END TO TRUE.
    PERFORM UNTIL SRCH-END
       IF ［c］ THEN
          PERFORM PROC-DISP
          SET SRCH-END TO TRUE
       ELSE
          EVALUATE TRUE
             WHEN CD-ENTER PERFORM PROC-ENTER
             WHEN CD-EXIT  PERFORM PROC-EXIT
          END-EVALUATE
          READ LOG-FILE AT END SET SRCH-END TO TRUE
       END-IF
    END-PERFORM.
    CLOSE LOG-FILE.
    EXIT PROGRAM.
PROC-ENTER SECTION.
    PERFORM VARYING CNT FROM 1 BY 1 UNTIL ［d］
       CONTINUE
    END-PERFORM.
    MOVE LOG-EMP TO EMP-NO(CNT).
PROC-EXIT SECTION.
    PERFORM VARYING CNT FROM 1 BY 1 UNTIL ［e］
       CONTINUE
    END-PERFORM.
    MOVE ZERO TO EMP-NO(CNT).
PROC-DISP SECTION.
    PERFORM VARYING CNT FROM 1 BY 1 UNTIL ［f］
       IF EMP-NO(CNT) NOT = ZERO THEN
          DISPLAY EMP-NO(CNT)
       END-IF
    END-PERFORM.`),
        ]),
        page(60, [], [
          bank(3, 'c', ['LOG-TIME < PRM-TIME', 'LOG-TIME <= PRM-TIME', 'LOG-TIME = PRM-TIME', 'LOG-TIME > PRM-TIME', 'LOG-TIME >= PRM-TIME'],
            includeAtTime ? 'エ' : 'オ', 'cobol'),
          bank(3, 'def', [`CNT < ${capacity}`, `CNT > ${capacity}`, 'EMP-NO(CNT) = ZERO', 'LOG-EMP = EMP-NO(CNT)',
            'LOG-EMP = ZERO', 'LOG-EMP NOT = EMP-NO(CNT)', 'LOG-EMP NOT = ZERO', 'SRCH-END'], 'ウエイ', 'cobol'),
        ]),
      ],
      explanation: `a：職級${level}以下かつ資格が0なら入室を拒否する。上位の職級は資格値が不定で，資格だけでは判定できない。b：許可しログを書いた入室者について在室者を1人増やす。設問2：従業員ファイルでINVALID KEYとなり，結果コード${missing}を返す。c：ログは日時昇順であり，${includeAtTime ? '指定日時と同時のログまで適用するので，指定日時を超えたところ' : '指定日時と同時のログは適用しないので，指定日時以上に達したところ'}で表示する。d：入室時は表の値が0の最初の欄へ登録する。e：退室時は同じ従業員番号がある欄を探して0にする。f：${capacity}番目も表示対象なので，添字が${capacity}を超えたときに終了する。`,
    };
  });
