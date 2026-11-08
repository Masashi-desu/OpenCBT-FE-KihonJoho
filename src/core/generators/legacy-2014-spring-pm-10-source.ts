import { ask, bank, code, heading, p, page, panel } from './legacy-2014-spring-pm-09-13-source';

export const spring2014Pm10Program1 = ` 1 DATA DIVISION.
 2 FILE SECTION.
 3 FD MST-FILE.
 4 01 MST-REC.
 5     02 MST-ENUM       PIC 9(6).
 6     02 MST-AVG        PIC 9(3).
 7     02 MST-HST.
 8         03 MST-ELM    OCCURS 5.
 9             04 MST-DATE  PIC 9(8).
10             04 MST-SCORE PIC 9(3).
11 FD SCR-FILE.
12 01 FIRST-REC.
13     02 SCR-DATE       PIC 9(8).
14     02 FILLER         PIC X(1).
15 01 SCR-REC.
16     02 SCR-ENUM       PIC 9(6).
17     02 SCR-SCORE      PIC 9(3).
18 WORKING-STORAGE SECTION.
19 77 SCR-FLAG      PIC X(1) VALUE SPACE.
20    88 SCR-EOF    VALUE "E".
21 77 W-CNT         PIC 9(2).
22 77 TEST-DATE     PIC 9(8).
23 77 SCR-TOTAL     PIC 9(4).
24 77 HST-NUM       PIC 9(1).`;

export const spring2014Pm10Program2 = `25 PROCEDURE DIVISION.
26 MAIN-PROC.
27     OPEN INPUT SCR-FILE
28          I-O   MST-FILE.
29     READ SCR-FILE.
30     MOVE SCR-DATE TO TEST-DATE.
31     PERFORM MATCHING-PROC.
32     CLOSE MST-FILE SCR-FILE.
33     STOP RUN.
34 MATCHING-PROC.
35     PERFORM UNTIL SCR-EOF
36         READ SCR-FILE
37             AT END
38                 SET SCR-EOF TO TRUE
39             NOT AT END
40                 PERFORM [a]
41                     READ MST-FILE END-READ
42                 END-PERFORM
43                 PERFORM UPDATE-PROC
44         END-READ
45     END-PERFORM.
46 UPDATE-PROC.
47     MOVE ZERO TO SCR-TOTAL HST-NUM.
48     PERFORM [b]
49         MOVE MST-ELM(W-CNT) TO MST-ELM(W-CNT + 1)
50         IF [c] THEN
51             ADD 1 TO HST-NUM
52             ADD MST-SCORE(W-CNT) TO SCR-TOTAL
53         END-IF
54     END-PERFORM.
55     MOVE TEST-DATE TO MST-DATE([d]).
56     MOVE SCR-SCORE TO MST-SCORE([d]).
57     COMPUTE MST-AVG = (SCR-TOTAL + SCR-SCORE) / (HST-NUM + 1).
58     REWRITE MST-REC.`;

export const spring2014Pm10Edits = [
  ['行番号2と3の間に追加','SD SRT-FILE.\n01 SRT-REC.\n   02 SRT-ENUM    PIC 9(6).\n   02 SRT-SCORE   PIC 9(3).'],
  ['行番号24と25の間に追加','77 DISP-FLAG    PIC X(1) VALUE SPACE.\n   88 DISP-END  VALUE "E".\n77 PREV-SCORE   PIC 9(3) VALUE ZERO.'],
  ['行番号31を変更','SORT SRT-FILE DESCENDING KEY SRT-SCORE\n    INPUT PROCEDURE IS MATCHING-PROC\n    OUTPUT PROCEDURE IS DISPLAY-PROC.'],
  ['［e］に追加','MOVE SCR-REC TO SRT-REC\nRELEASE SRT-REC'],
  ['行番号58の後ろに追加',`DISPLAY-PROC.
    PERFORM TEST BEFORE
        VARYING W-CNT FROM 1 BY 1 UNTIL DISP-END
        RETURN SRT-FILE
            AT END
                SET DISP-END TO TRUE
            NOT AT END
                IF [f] THEN
                    SET DISP-END TO TRUE
                ELSE
                    DISPLAY SRT-ENUM ": " SRT-SCORE
                    [g]
                END-IF
        END-RETURN
    END-PERFORM.`],
];

export const spring2014Pm10Pages = [
  page(52,p('問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    heading('プログラムの説明'),
    p('X社では，従業員の英語力向上のために，定期的に英語の検定テストを実施している。従業員は誰でも希望すれば受検することができ，直近の5回分の検定結果が得点マスタファイルに記録される。このプログラムは，1回分の検定結果が記録された採点ファイルを読み込み，検定結果を得点マスタファイルに反映する。'),
    p('（1）得点マスタファイルは，図1に示すレコード様式の順ファイルで，従業員の得点履歴を管理する。'),
    panel('master','図1 得点マスタファイルのレコード様式'),
    p('① 全ての従業員に対するレコードが，従業員番号の昇順に格納されている。\n② 平均得点には，得点履歴に記録された得点の平均点が小数点以下切捨てで格納される。\n③ 得点履歴には，直近5回分の受検日と得点が，受検日の降順に格納される。受検回数が5回に満たない場合，残りの得点履歴の受検日及び得点にはゼロが格納される。\n④ 受検日には，年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納される。\n⑤ 得点には，当該受検日の得点が格納される。得点は000～100である。'),
    p('（2）採点ファイルは，図2に示すレコード様式の順ファイルで，英語の検定テストの都度，作成される。')),
  page(53,panel('scoring','図2 採点ファイルのレコード様式'),
    p('① ファイルの先頭レコードには，様式1のレコードが1レコードだけ格納される。受検日には，年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納される。\n② 2レコード目以降には，様式2のレコードが，従業員番号の昇順に格納される。なお，受検は希望者だけなので，この回に受検しなかった従業員のレコードは存在しない。'),
    heading('プログラム'),p('（行番号）'),code(spring2014Pm10Program1,'cobol')),
  page(54,code(spring2014Pm10Program2,'cobol')),
  page(55,heading('設問1'),p('プログラム中の'+ask),bank('ab'),bank('c'),bank('d')),
  page(56,heading('設問2'),
    p('検定結果の反映時に，今回の検定における得点の上位10名の従業員番号と得点を表示するようプログラムを変更する。このとき，10人目の受検者と同得点の受検者が複数いた場合は，当該受検者を全て表示する。表中の'+ask),
    panel('ranking','表1 プログラムの変更内容')),
  page(57,bank('e'),bank('f'),bank('g')),
];
export const spring2014Pm10Banks = {
  ab:{options:['TEST AFTER UNTIL SCR-ENUM = MST-ENUM','TEST AFTER VARYING W-CNT FROM ZERO BY 1 UNTIL W-CNT > 5','TEST BEFORE UNTIL SCR-ENUM NOT = MST-ENUM','TEST BEFORE VARYING W-CNT FROM 1 BY 1 UNTIL W-CNT > 4','TEST BEFORE VARYING W-CNT FROM 4 BY -1 UNTIL W-CNT = ZERO']},
  c:{options:['MST-DATE(W-CNT) = ZERO','MST-DATE(W-CNT) NOT = ZERO','MST-SCORE(W-CNT) = ZERO','MST-SCORE(W-CNT) NOT = ZERO']},
  d:{options:['1','5','HST-NUM','W-CNT']},
  e:{options:['行番号34と35の間','行番号41と42の間','行番号43と44の間','行番号53と54の間']},
  f:{options:['W-CNT = 10 AND SRT-SCORE = PREV-SCORE','W-CNT = 10 AND SRT-SCORE > PREV-SCORE','W-CNT > 10 AND SRT-SCORE < PREV-SCORE','W-CNT > 10 AND SRT-SCORE = PREV-SCORE']},
  g:{options:['ADD 1 TO W-CNT','ADD SRT-SCORE TO PREV-SCORE','MOVE PREV-SCORE TO SRT-SCORE','MOVE SRT-SCORE TO PREV-SCORE']},
};
