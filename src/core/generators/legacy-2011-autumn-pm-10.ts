import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-autumn-pm-09-13-support';

export const applicationCases = [
  { order: 'desc', key: 'count', counts: [35, 120, 54, 79] },
  { order: 'asc', key: 'count', counts: [58, 37, 102, 84] },
  { order: 'desc', key: 'segment', counts: [46, 137, 49, 101] },
  { order: 'asc', key: 'segment', counts: [49, 141, 67, 92] },
] as const;
const record = languageFigure(10, 'record-layout', '図1 申込ファイルのレコード様式', () => ({
  kind: 'grids', tables: [{ headers: ['申込番号', '受験区分：試験区分', '受験区分：開催地区分'], rows: [['5桁', '1桁', '2桁']] }],
}));
const sample = languageFigure(10, 'count-printout', '図2 集計表の印字例', index => ({
  kind: 'grids', tables: [{ headers: ['SEGMENT', 'TOTAL'],
    rows: ['A01', 'A02', 'A03', '：', 'H20'].map((label, i) => [label, i === 3 ? '：' : String(applicationCases[index].counts[i === 4 ? 3 : i])]) }],
}));
const before = `DATA DIVISION.
FILE SECTION.
FD  TEST-APPLIC-FILE.
01  TEST-APPLIC-REC.
    02  FILLER       PIC X(05).
    02  TEST-M.
        03  TEST-CATEG-M  PIC X(01).
        03  TEST-PLACE-M  PIC 9(02).
FD  PRINT-TEST-FILE.
01  PRINT-REC.
    02  PRINT-TEST-REC.
        03  TEST-CATEG-S  PIC X(01).
        03  TEST-PLACE-S  PIC 9(02).
    02  FILLER       PIC X(10).
    02  PRINT-S      PIC ZZ9.
WORKING-STORAGE SECTION.
01  FILE-END      PIC X(01) VALUE "N".
01  LOOP1         PIC 9(01).
01  LOOP2         PIC 9(02).
01  TEST-NO       PIC 9(01).
01  TEST-W1.
    02  TEST-W2   PIC X(08) VALUE "ABCDEFGH".
    02  REDEFINES TEST-W2.
        03  TEST-W3 PIC X(01) OCCURS 8 INDEXED BY TEST-IDX.
01  SUM-WK1.
    02  OCCURS 8.
        03  SUM-WK PIC 9(03) OCCURS 20 VALUE ZERO.
01  HEADER       PIC X(16) VALUE "SEGMENT    TOTAL".
PROCEDURE DIVISION.
MAIN-PROC.
    OPEN INPUT TEST-APPLIC-FILE OUTPUT PRINT-TEST-FILE.
    PERFORM SUM-PROC UNTIL FILE-END = "Y".
    PERFORM PRINT-PROC.
    CLOSE TEST-APPLIC-FILE PRINT-TEST-FILE.
    STOP RUN.
SUM-PROC.
    READ TEST-APPLIC-FILE
        AT END
            MOVE "Y" TO FILE-END
        NOT AT END
            ［a］
            SEARCH ［b］
                WHEN TEST-CATEG-M = TEST-W3(TEST-IDX)
                    SET TEST-NO TO TEST-IDX
            END-SEARCH
            ADD 1 TO SUM-WK(TEST-NO TEST-PLACE-M)
    END-READ.`;
const print = `PRINT-PROC.
    WRITE PRINT-REC FROM HEADER AFTER PAGE.
    PERFORM VARYING LOOP1 FROM 1 BY 1 UNTIL LOOP1 > 8
        PERFORM VARYING LOOP2 FROM 1 BY 1 UNTIL LOOP2 > 20
            IF ［c］ NOT = 0 THEN
                MOVE SPACE TO PRINT-REC
                MOVE TEST-W3(LOOP1) TO TEST-CATEG-S
                MOVE LOOP2 TO TEST-PLACE-S
                MOVE ［c］ TO PRINT-S
                WRITE PRINT-REC AFTER 1
            END-IF
        END-PERFORM
    END-PERFORM.`;
const records = `SD  TEST-SORT-FILE.
01  SORT-REC.
    02  SORT-TEST-REC  PIC X(03).
    02  SORT-S         PIC 9(03).
FD  TEST-SUM-FILE.
01  SUM-REC.
    02  SUM-TEST-REC.
        03  TEST-CATEG-S  PIC X(01).
        03  TEST-PLACE-S  PIC 9(02).
    02  SUM-S          PIC 9(03).`;
const change = `PRINT-PROC.
    OPEN OUTPUT TEST-SUM-FILE.
    PERFORM VARYING LOOP1 FROM 1 BY 1 UNTIL LOOP1 > 8
        PERFORM VARYING LOOP2 FROM 1 BY 1 UNTIL LOOP2 > 20
            IF ［c］ NOT = 0 THEN
                MOVE TEST-W3(LOOP1) TO TEST-CATEG-S OF SUM-REC
                MOVE LOOP2 TO TEST-PLACE-S OF SUM-REC
                MOVE ［c］ TO SUM-S
                WRITE SUM-REC
            END-IF
        END-PERFORM
    END-PERFORM.
    CLOSE TEST-SUM-FILE.
    OPEN INPUT TEST-SUM-FILE.
    SORT TEST-SORT-FILE ［d］
        INPUT PROCEDURE IS IN-PROC
        OUTPUT PROCEDURE IS OUT-PROC.
    CLOSE TEST-SUM-FILE.
IN-PROC.
    MOVE "N" TO FILE-END.
    PERFORM UNTIL FILE-END = "Y"
        READ TEST-SUM-FILE
            AT END
                MOVE "Y" TO FILE-END
            NOT AT END
                MOVE SUM-TEST-REC TO SORT-TEST-REC
                MOVE SUM-S TO SORT-S`;
const continued = `                ［e］
        END-READ
    END-PERFORM.
OUT-PROC.
    WRITE PRINT-REC FROM HEADER AFTER PAGE.
    MOVE "N" TO FILE-END.
    PERFORM UNTIL FILE-END = "Y"
        ［f］
            AT END
                MOVE "Y" TO FILE-END
            NOT AT END
                MOVE SPACE TO PRINT-REC
                MOVE SORT-TEST-REC TO PRINT-TEST-REC
                MOVE SORT-S TO PRINT-S
                WRITE PRINT-REC AFTER 1
        ［g］
    END-PERFORM.`;
const changeTable = languageFigure(10, 'change-table', '表1 プログラムの変更内容', () => ({
  kind: 'grids', tables: [{ headers: ['処置', '変更内容'],
    rows: [['行番号2と3\nの間に追加', records], ['行番号48〜\n60を変更', change]] }],
}));
const continuedTable = languageFigure(10, 'change-continuation', '表1 プログラムの変更内容（続き）', () => ({
  kind: 'grids', tables: [{ headers: ['処置', '変更内容'], rows: [['', continued]] }],
}));
export const q10Figures = [record, sample, changeTable, continuedTable];
const numbered = (text: string, start: number) => text.split('\n').map((line, i) => String(start + i).padStart(2) + '  ' + line).join('\n');
const sorts = ['ASCENDING KEY SORT-S', 'ASCENDING KEY SORT-TEST-REC', 'DESCENDING KEY SORT-S', 'DESCENDING KEY SORT-TEST-REC'];
const verbs = ['END-READ', 'END-RETURN', 'READ TEST-SORT-FILE', 'READ TEST-SUM-FILE', 'RELEASE SORT-REC', 'RELEASE SUM-REC', 'RETURN TEST-SORT-FILE', 'RETURN TEST-SUM-FILE'];
const sortKeys = ['ウ', 'ア', 'エ', 'イ'];
const targets = ['申込者数の多い順', '申込者数の少ない順', '受験区分の降順', '受験区分の昇順'];
export const q10 = createLanguageDefinition(10, 'COBOLの申込集計と集計表の整列', 'applicationCase', 'abcdefg', 'エカアウオキイ',
  '表引き・二重ループ・SORT手続きの構造を維持し，印字例の件数と整列キー・方向を変える。', index => ({
    pages: [
      page(44, [heading('問10　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'), heading('〔プログラムの説明〕'),
        p('受験の申込みを登録した申込ファイルから，受験区分別に申込者の人数を集計し，集計表を印字するプログラムである。'),
        p('（1）申込ファイルは図1に示すレコード様式の順ファイルである。'), record.block(index),
        p('① 受験の申込み1件に対して，1件のレコードが作成され，5桁の申込番号が付与される。\n② 受験区分は，試験区分と開催地区分から構成される。\n③ 試験区分は，試験内容に対応付けた A～H のいずれか1文字である。\n④ 開催地区分は，開催地に対応付けた01～20のいずれかの数字である。\n⑤ 各受験区分の申込者数は，999人以下である。\n⑥ 申込ファイルの内容には，誤りはないものとする。'),
        p('（2）集計表の印字例は，図2のとおりである。申込者がいない受験区分は，印字しない。'), sample.block(index)]),
      page(45, [heading('〔プログラム〕（行番号）'), code(numbered(before, 1), 'cobol')]),
      page(46, [code(numbered(print, 48), 'cobol'), p('設問1　プログラムの空欄に入れる正しい答えを，解答群の中から選べ。')], [
        bank(1, 'a', ['MOVE 1 TO TEST-IDX', 'MOVE 1 TO TEST-NO', 'MOVE TEST-IDX TO TEST-NO', 'SET TEST-IDX TO 1', 'SET TEST-IDX TO TEST-CATEG-S', 'SET TEST-IDX TO TEST-NO'], 'エ', 'cobol'),
        bank(1, 'b', ['SUM-WK', 'TEST-IDX', 'TEST-NO', 'TEST-W1', 'TEST-W2', 'TEST-W3'], 'カ', 'cobol'),
        bank(1, 'c', ['SUM-WK(LOOP1 LOOP2)', 'SUM-WK(LOOP2 LOOP1)', 'SUM-WK(TEST-CATEG-M TEST-NO)', 'SUM-WK(TEST-NO TEST-PLACE-M)', 'SUM-WK(TEST-PLACE-M TEST-NO)', 'SUM-WK(TEST-PLACE-S TEST-NO)'], 'ア', 'cobol'),
      ]),
      page(47, [p('設問2　集計表における受験区分の印字を' + targets[index] + 'になるようにプログラムを変更したい。表1に示すプログラムの変更内容の空欄に入れる正しい答えを，解答群の中から選べ。ここで，［c］には設問1の正しい答えが入っているものとする。'), changeTable.block(index)]),
      page(48, [continuedTable.block(index)], [bank(2, 'd', sorts, sortKeys[index], 'cobol'), bank(2, 'efg', verbs, 'オキイ', 'cobol')]),
    ],
    explanation: 'SET TEST-IDX TO 1 で表の先頭から探索し，SEARCH の対象を OCCURS が指定された TEST-W3 とする。出力ループでは試験区分を LOOP1，開催地区分を LOOP2 で走査するので，SUM-WK(LOOP1 LOOP2) がその件数を示す。印字を' + targets[index] + 'にする指定は ' + sorts['アイウエ'.indexOf(sortKeys[index])] + '。入力手続きで RELEASE SORT-REC を使い整列対象を渡し，出力手続きで RETURN TEST-SORT-FILE と END-RETURN により整列済みのレコードを1件ずつ受け取る。',
  }));
