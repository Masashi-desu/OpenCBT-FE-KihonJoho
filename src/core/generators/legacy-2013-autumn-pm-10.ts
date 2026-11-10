import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2013-autumn-pm-09-13-support';
import { courtConditions } from './legacy-2013-autumn-pm-09-13-models';
import { languageFigure } from './legacy-2013-autumn-pm-09-13-figures';

const data = ` 1 DATA DIVISION.
 2 FILE SECTION.
 3 FD RSV-FILE.
 4 01 RSV-REC.
 5    02 RSV-DATE      PIC X(8).
 6    02 RSV-AREA.
 7       03 RSV-COURT  OCCURS 4.
 8          04 RSV-RNO    PIC 9(6) OCCURS 9.
 9 WORKING-STORAGE SECTION.
10 77 W-CHK        PIC 9(1).
11    88 CHK-OK    VALUE 0.
12    88 CHK-NG    VALUE 1.
13 77 COURT-CNT    PIC 9(1).
14 77 TIME-CNT     PIC 9(2).
15 77 TIME-START   PIC 9(2).
16 77 TIME-END     PIC 9(2).
17 77 KEEP-COURT   PIC 9(1).
18 77 BKUP-AREA    PIC X(54).
19 LINKAGE SECTION.
20 01 PRM-DATA.
21    02 PRM-RNO       PIC 9(6).
22    02 PRM-NUM       PIC 9(1).
23    02 PRM-DATE      PIC 9(8).
24    02 PRM-TIME      PIC 9(2).`;

const procedures = `25    02 PRM-HOURS     PIC 9(1).
26 01 RET-DATA.
27    02 RET-RSLT      PIC 9(1).
28       88 RSV-OK    VALUE 0.
29       88 RSV-NG    VALUE 9.
30    02 RET-COURT.
31       03 COURT-NO      PIC 9(1) OCCURS 4.
32 PROCEDURE DIVISION USING PRM-DATA RET-DATA.
33 MAIN-PROC.
34     SET RSV-OK TO TRUE.
35     INITIALIZE RET-COURT.
36     OPEN I-O RSV-FILE.
37     MOVE PRM-DATE TO RSV-DATE.
38     READ RSV-FILE
39         INVALID KEY      INITIALIZE RSV-AREA
40                          MOVE PRM-DATE TO RSV-DATE
41                          PERFORM RSV-PROC
42                          WRITE RSV-REC END-WRITE
43         NOT INVALID KEY  PERFORM RSV-PROC
44                          IF RSV-OK THEN
45                             REWRITE RSV-REC END-REWRITE
46                          END-IF
47     END-READ.
48     CLOSE RSV-FILE.
49     EXIT PROGRAM.
50 RSV-PROC.
51     MOVE ZERO TO KEEP-COURT.
52     ［a］.
53     COMPUTE TIME-END = TIME-START + PRM-HOURS.
54     PERFORM VARYING COURT-CNT FROM 1 BY 1
55             UNTIL COURT-CNT > 4 OR PRM-NUM = KEEP-COURT
56         ［b］
57         MOVE RSV-COURT(COURT-CNT) TO BKUP-AREA
58         PERFORM VARYING TIME-CNT FROM TIME-START BY 1
59                 UNTIL CHK-NG OR TIME-CNT >= TIME-END
60             IF RSV-RNO(COURT-CNT TIME-CNT) = ZERO THEN
61                 MOVE PRM-RNO TO RSV-RNO(COURT-CNT TIME-CNT)
62             ELSE
63                 SET CHK-NG TO TRUE
64                 ［c］
65             END-IF
66         END-PERFORM
67         IF CHK-OK THEN
68             ADD 1 TO KEEP-COURT
69             MOVE COURT-CNT TO COURT-NO(KEEP-COURT)
70         END-IF
71     END-PERFORM.
72     IF ［d］ THEN
73         SET RSV-NG TO TRUE
74         INITIALIZE RET-COURT
75     END-IF.`;

function sideTest(left: number[], right: number[]) {
  const prefix = '(COURT-NO(1) = ', suffix = '(COURT-NO(2) = ';
  const fromTo = (a: number[], b: number[]) => '(' + prefix + a.join(' OR ') + ') AND ' + suffix + b.join(' OR ') + '))';
  return Math.max(...left) < Math.min(...right) ? fromTo(left, right)
    : '(' + fromTo(left, right) + ' OR ' + fromTo(right, left) + ')';
}

export const autumn2013Pm10 = createLanguageDefinition(10, 'テニスコートの予約（COBOL）', '営業開始時刻とコート配置',
  'abcdefg', '設問1 a=ア，b=ク，c=イ，d=エ／設問2 e/f/g=ア・オ・カ（順不同）',
  '開始時刻、フェンス両側の配置と警告結果コードを変え、索引ファイル図と条件式を更新します。4面・9枠の記録、時刻の1始まり添字、部分確保の復元、同日のレコードの書込み／再書込み、設問2のe・f・gの順不同を保持します。',
  index => {
    const { opening, left, right, resultCode } = courtConditions[index];
    const across = sideTest(left, right);
    return {
      pages: [
        page(50, [
          p('問10　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕X社は事業所内の4面のテニスコートの予約・キャンセル・空き状況確認を行うシステムを開発する。本プログラムは予約を受け付けるサブプログラムで、利用希望者の予約情報をパラメタで受け取り、予約管理ファイルの予約状況と照合して、予約結果をパラメタで呼出し元に返す。'),
          p('（1）プログラムには二つのパラメタがある。各パラメタの様式は図1のとおりである。'),
          languageFigure(10, 'parameters', index, '図1　パラメタの様式'),
          p('①予約番号には、予約希望に一意に割り振られる000001〜999999の番号を格納する。②希望面数には希望する面数を格納する。③希望日には西暦の年、月、日をそれぞれ4桁、2桁、2桁で格納する。④希望時刻には利用開始の“時”を24時間表記で格納する。利用可能な時間帯は' + opening + '時から' + (opening + 9) + '時までで、1時間単位で予約できる。⑤希望時間には希望する利用時間数を格納する。'),
          p('⑥結果には希望どおりに予約できた場合は0を、できなかった場合は9を設定する。⑦予約コートには予約できたコートのコート番号を設定する。例えば3番コートを予約した場合は3000、1番と2番なら1200、予約できなければ0000を設定する。⑧コートは1〜4番の順に検索し、番号の小さいコートから確保する。'),
        ]),
        page(51, [
          p('⑨予約情報の各項目の値は呼出し側プログラムで検査するので、①〜⑤で示した範囲外の値が設定されることはない。'),
          p('（2）予約管理ファイルは、日付を主キーとする図2のレコード様式の索引ファイルで、予約状況の管理に用いる。'),
          languageFigure(10, 'reservation-record', index, '図2　予約管理ファイルのレコード様式'),
          p('①日付には年、月、日をそれぞれ4桁、2桁、2桁の西暦で格納する。②各予約枠には、予約済みなら予約番号、空いていれば0を格納する。③予約が入っていない日付をキーとするレコードは存在しない。'),
          p('〔プログラム〕（行番号）'), code(data, 'cobol'),
        ]),
        page(52, [code(procedures, 'cobol')]),
        page(53, [
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　運用開始後、“隣り合わせのコートを希望する機能が欲しい”という要望があった。コートの配置は図3のとおりで、2面を予約した利用者にフェンスを挟んだコート、例えば' + left[0] + '番と' + right[0] + '番が割り当てられたことがあった。'),
          p('パラメタにPRM-NEXTを加え、1が設定されている場合、確保できたコートがフェンスを挟むなら予約せず、結果に' + resultCode + 'を設定して返すように変更する。ただし、3面以上の予約なら、フェンスを挟んでいても予約する。表1中の空欄に入れる正しい答えを選べ。'),
        ], [
          bank(1, 'abc', [
            'COMPUTE TIME-START = PRM-TIME - ' + (opening - 1),
            'MOVE BKUP-AREA TO RSV-COURT(COURT-CNT)', 'MOVE COURT-CNT TO KEEP-COURT',
            'MOVE PRM-TIME TO TIME-CNT', 'MOVE RSV-RNO(COURT-CNT TIME-CNT) TO PRM-RNO',
            'MOVE TIME-CNT TO COURT-CNT', 'SET CHK-NG TO TRUE', 'SET CHK-OK TO TRUE',
          ], 'アクイ', 'cobol'),
          bank(1, 'd', ['CHK-NG', 'CHK-OK', 'KEEP-COURT NOT = ZERO', 'PRM-NUM NOT = KEEP-COURT', 'PRM-NUM = KEEP-COURT'], 'エ', 'cobol'),
        ], [0, 0]),
        page(54, [
          languageFigure(10, 'fence-layout', index, '図3　テニスコートの配置'),
          languageFigure(10, 'program-changes', index, '表1　プログラムの変更内容'),
        ], [{
          ...bank(2, 'efg', [across, '(COURT-CNT = 3 OR 4)',
            '(COURT-NO(1) = ' + [left[0], right[0]].join(' OR ') + ')', 'NEXT-OFF',
            'NEXT-ON', 'PRM-NUM = 2', 'RSV-OK'], 'アオカ', 'cobol'),
          unordered: true,
        }]),
      ],
      explanation: '予約開始の' + opening + '時台は表の添字1なので、時刻から' + (opening - 1) + 'を引く。次のコートを調べる前にCHK-OKに戻す。途中の1枠でも予約済みなら、確保前のコートの全枠をBKUP-AREAから復元する。希望面数と確保面数が異なる場合だけ結果9とし、確保結果を消去する。希望どおりに確保できた場合、隣接希望があり、希望面数が2で、選んだ番号の組がフェンス両側（' + left.join('・') + '対' + right.join('・') + '）なら結果' + resultCode + 'を返し、そのレコードを書き換えない。三つのAND条件は順不同である。',
    };
  });
