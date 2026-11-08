import { ask, bank, code, heading, p, page, panel, table } from './legacy-2014-autumn-pm-09-13-source';

const cobol = (text: string) => code(text, 'cobol');
export const autumn2014Pm10Changes = [`77 IX-AMOUNT    PIC 9(2).
77 Z-TOTAL      PIC 9(8).
77 Z-YEAR       PIC 9(8).`,`01 PRINT-TABLE.
   02 PRINT-LINE  OCCURS 24.
      03          PIC X(6).
      03 PRINT-ELM OCCURS 12.
         04 PRINT-MK PIC X(2).
         04          PIC X(1).`,`MOVE ZERO TO Z-TOTAL Z-YEAR.
PERFORM VARYING IX-AMOUNT FROM 1 BY 1 UNTIL IX-AMOUNT > 12
    [d]
END-PERFORM.
PERFORM VARYING IX-COL FROM 1 BY 1 UNTIL IX-COL > 12
    COMPUTE IX-LINE =
        (AMOUNT-MONTH(IX-AMOUNT) + 499999) / 500000
    MOVE ALL "*" TO [c]
    [e]
    COMPUTE IX-LINE = (Z-TOTAL + 499999) / 500000
    MOVE ALL "@" TO [c]
    [f]
    COMPUTE IX-LINE = (Z-YEAR + 499999) / 500000
    MOVE ALL "#" TO [c]
    ADD 1 TO IX-AMOUNT
END-PERFORM.
PERFORM VARYING IX-LINE FROM 24 BY -1 UNTIL IX-LINE = 0
    WRITE P-REC FROM PRINT-LINE(IX-LINE)
END-PERFORM.`];

export const autumn2014Pm10Pages = [
  page(53,
    heading('問10　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    heading('〔プログラムの説明〕'),
    p('X社では，特定の商品の売上傾向を分析するために，2年分の売上についてグラフ化することにした。このプログラムは，分析する商品の商品コードをパラメタで受け取り，全ての商品の売上データが記録されている売上ファイルから当該商品の売上を月ごとに集計して，結果を図1に示すように印字する。'),
    panel('monthly-chart','図1　売上グラフの例'),
    p('(1) 売上グラフは，2012年4月〜2014年3月の各月の売上を表す。'),
    p('① 縦軸の数値は売上金額（単位は万円）で，下段から，1〜100,000円，100,001〜200,000円，…，900,001〜1,000,000円を表す。'),
    p('② 横軸の数値は月で，左端から，2012年4月，2012年5月，…，2014年3月を表す。'),
    p('③ 縦軸と横軸の数値は，用紙にあらかじめ印字されている。'),
    p('(2) 売上ファイルは，図2に示すレコード様式の順ファイルで，X社が扱う全ての商品の2012年4月〜2014年3月の各営業日の売上データが格納されている。レコードは売上日の昇順に整列されている。'),
    table('図2　売上ファイルのレコード様式',['売上日','商品コード','個数','売上金額','取引先コード'],[['8桁','5桁','4桁','8桁','4桁']])),
  page(54,
    p('① 売上日には，年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納されている。'),
    p('② 商品コードには，販売した商品のコードが格納されている。商品コードは，商品ごとに一意に割り当てられている。'),
    p('③ 取引先コードには，商品を販売した取引先のコードが格納されている。取引先コードは，取引先ごとに一意に割り当てられている。'),
    p('④ 各商品の月ごとの売上金額は，1〜999,999円とする。'),
    heading('〔プログラム〕'), p('（行番号）'), cobol(` 1  DATA DIVISION.
 2  FILE SECTION.
 3  FD S-FILE.
 4  01 S-REC.
 5     02 S-DATE.
 6        03 S-YYYY     PIC 9(4).
 7        03 S-MM       PIC 9(2).
 8        03 S-DD       PIC 9(2).
 9     02 S-GOODS       PIC 9(5).
10     02 S-QUANTITY    PIC 9(4).
11     02 S-AMOUNT      PIC 9(8).
12     02 S-CUSTOMER    PIC 9(4).
13  FD P-FILE.
14  01 P-REC            PIC X(80).
15  WORKING-STORAGE SECTION.
16  77 EOF-FLAG         PIC X(1).
17     88 S-INIT        VALUE SPACE.
18     88 S-EOF         VALUE "E".
19  77 IX-LINE          PIC 9(2).
20  77 IX-COL           PIC 9(2).
21  77 CR-MONTH         PIC 9(2).
22  01 AMOUNT-DATA.
23     02 AMOUNT-MONTH OCCURS 24 PIC 9(6).
24  01 PRINT-TABLE.
25     02 PRINT-LINE  OCCURS 10.
26        03             PIC X(6).
27        03 PRINT-ELM  OCCURS 24.
28           04 PRINT-MK PIC X(2).
29           04          PIC X(1).
30  LINKAGE SECTION.
31  77 PRM-GOODS        PIC 9(5).
32  PROCEDURE DIVISION USING PRM-GOODS.
33  MAIN-PROC.
34      SET S-INIT TO TRUE.
35      INITIALIZE AMOUNT-DATA.
36      MOVE 4 TO CR-MONTH.`)),
  page(55, cobol(`37      MOVE 1 TO IX-COL.
38      OPEN INPUT  S-FILE
39           OUTPUT P-FILE.
40      PERFORM UNTIL S-EOF
41          READ S-FILE
42              AT END     SET S-EOF TO TRUE
43              NOT AT END IF S-GOODS = PRM-GOODS THEN
44                             PERFORM ADD-PROC
45                         END-IF
46          END-READ
47      END-PERFORM.
48      PERFORM PRINT-PROC.
49      CLOSE S-FILE P-FILE.
50      EXIT PROGRAM.
51  ADD-PROC.
52      IF CR-MONTH NOT = S-MM THEN
53          [a]
54          ADD 1 TO IX-COL
55      END-IF.
56      [b].
57  PRINT-PROC.
58      MOVE SPACE TO PRINT-TABLE.
59      PERFORM VARYING IX-COL FROM 1 BY 1 UNTIL IX-COL > 24
60          COMPUTE IX-LINE = (AMOUNT-MONTH(IX-COL) + 99999) / 100000
61          MOVE ALL "*" TO [c]
62      END-PERFORM.
63      PERFORM VARYING IX-LINE FROM 10 BY -1 UNTIL IX-LINE = 0
64          WRITE P-REC FROM PRINT-LINE(IX-LINE)
65      END-PERFORM.`)),
  page(56, heading('設問1'), p('プログラム中の' + ask), bank('ab'), bank('c')),
  page(57,
    heading('設問2'), p('図1に示すグラフでは，季節変動がある商品の中長期的な傾向の分析は難しいことが分かった。そこで，図3に示すZチャートを表示するようにプログラムを変更することにした。表1中の' + ask + 'ここで，表1中の［c］には設問1の正しい答えが入っているものとする。'),
    panel('z-chart','図3　Zチャートの例'),
    heading('〔Zチャートの説明〕'),
    p('ある月を起点に，各月の売上，起点からの売上累計，その月を含む過去1年間の売上合計を表すグラフである。これら三つのグラフを重ね合わせるとZの形になることからZチャートと呼ばれ，季節変動のある商品の売上傾向を分析する際などに用いられる。')),
  page(58,
    heading('〔図3の説明〕'),
    p('(1) 縦軸の数値は売上金額（単位は万円）で，下段から，1〜500,000円，500,001〜1,000,000円，…，11,500,001〜12,000,000円を表す。'),
    p('(2) 横軸の数値は月で，左端から，2013年4月，2013年5月，…，2014年3月を表す。'),
    p('(3) 2013年4月を起点として，各月の売上，起点からの売上累計，その月を含む過去1年間の売上合計を，それぞれ記号“*”，“@”，“#”で印字する。ここで，印字が重なる場合は，優先順位（“#”＞“@”＞“*”）の高い方を印字する。'),
    p('(4) 縦軸と横軸の数値は，用紙にあらかじめ印字されている。'),
    panel('changes','表1　プログラムの変更内容')),
  page(59, bank('def')),
];
