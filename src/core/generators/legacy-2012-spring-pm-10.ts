import { code, p, table } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2012-spring-pm-09-13-support';

const ageGroups = ['4〜12歳', '13〜18歳', '19〜29歳', '30〜49歳', '50歳以上'];
const ageMarks = ['@', '*', '+', '=', '-'];
const hours = [10, 9, 8, 11] as const;
const displayCases = [
  { total: 2012, ages: [[3, 2, 2, 2, 1], [4, 3, 2, 2, 1], [0, 1, 3, 1, 0]], facilities: [16, 7, 10] },
  { total: 2425, ages: [[2, 4, 1, 3, 0], [3, 4, 2, 3, 1], [0, 2, 4, 1, 0]], facilities: [14, 8, 11] },
  { total: 2030, ages: [[1, 2, 2, 2, 0], [3, 2, 3, 2, 0], [0, 1, 2, 1, 0]], facilities: [11, 6, 12] },
  { total: 2871, ages: [[4, 2, 1, 1, 1], [5, 4, 1, 2, 2], [0, 2, 3, 2, 0]], facilities: [18, 9, 13] },
] as const;
const scale = '----+----1----+----2----+----3----+----4----+----5';
const visitorRecord = languageFigure(10, 'visitor-record', '図1 入園者ファイルのレコード様式', () => ({
  kind: 'grids', tables: [{ headers: ['入園者番号', '年齢層コード'], rows: [['4桁', '1桁']] }],
}));
const eventRecord = languageFigure(10, 'event-record', '図2 イベントファイルのレコード様式', () => ({
  kind: 'grids', tables: [{ headers: ['入園者番号', 'イベントコード', '時刻', '金額'], rows: [['4桁', '2桁', '6桁', '6桁']] }],
}));
const guestOutput = languageFigure(10, 'guest-output', '図3 集計結果の表示例', i => {
  const item = displayCases[i];
  const bar = (n: number) => item.ages[n].map((count, j) => ageMarks[j].repeat(count)).join('');
  return { kind: 'output', text: `TOTAL GUESTS  ${item.total}
STAY GUESTS
         ${scale}
${String(hours[i]).padStart(2, '0')}:00-59 ${bar(0)}
${String(hours[i] + 1).padStart(2, '0')}:00-59 ${bar(1)}
     ⋮
${hours[i] + 9}:00-59 ${bar(2)}` };
});
const facilityOutput = languageFigure(10, 'facility-output', '図4 遊戯施設利用状況の表示例', i => ({
  kind: 'output', text: `RECREATIONAL FACILITIES
    ${scale}
03: ${'#'.repeat(displayCases[i].facilities[0])}
04: ${'#'.repeat(displayCases[i].facilities[1])}
 ⋮
08: ${'#'.repeat(displayCases[i].facilities[2])}`,
}));
const facilityChanges = languageFigure(10, 'program-changes', '表3 プログラムの変更', () => ({
  kind: 'grids', tables: [{
    headers: ['処置', '変更内容'], rows: [
      ['行番号48と49の間に追加', `01 .
   02 FAC-CNT     PIC 9(4) OCCURS 6 VALUE ZERO.
01 FAC-HEADER.
   02 FAC-NO      PIC 9(2).
   02             PIC X(2) VALUE ": ".
01 FAC-MARK    PIC X(50) VALUE ALL "#".`],
      ['行番号76と77の間に追加', `    WHEN E-FAC
        ［f］`],
      ['行番号94の後ろに追加', `DISPLAY "RECREATIONAL FACILITIES".
DISPLAY "    " HD-SCALE.
PERFORM ［g］
    COMPUTE MARK-CNT = FAC-CNT(FAC-NO - 2) / 100
    IF MARK-CNT NOT = 0 THEN
        DISPLAY FAC-HEADER FAC-MARK(1:MARK-CNT)
    END-IF
END-PERFORM.`],
    ],
  }],
}));
export const q10Figures = [visitorRecord, eventRecord, guestOutput, facilityOutput, facilityChanges];

const firstCode = ` 1 DATA DIVISION.
 2 FILE SECTION.
 3 FD GUEST.
 4 01 G-REC.
 5    02 G-NO           PIC X(4).
 6    02 G-AGE          PIC 9(1).
 7 FD EVENT.
 8 01 E-REC.
 9    02 E-NO           PIC 9(4).
10    02 E-CODE         PIC 9(2).
11       88 E-ENTER        VALUE 1.
12       88 E-EXIT         VALUE 2.
13       88 E-FAC          VALUE 3 THRU 8.
14       88 E-MEAL         VALUE 9.
15       88 E-SHOP         VALUE 10.
16    02 E-TIME.
17       03 E-HH           PIC 9(2).
18       03 E-MMSS         PIC 9(4).
19    02 E-SALES        PIC 9(6).
20 WORKING-STORAGE SECTION.
21 77 READ-FLAG        PIC X(1) VALUE SPACE.
22    88 EOF              VALUE "E".`;
const middleCode = (open: number) => `23 77 CR-HH          PIC 9(2) VALUE ${open}.
24 77 I              PIC 9(2).
25 77 J              PIC 9(2).
26 77 MARK-CNT       PIC 9(2).
27 77 MARK-POS       PIC 9(2).
28 77 TOTAL-GUEST    PIC 9(4) VALUE 0.
29 77 TOTAL-GUEST-X  REDEFINES TOTAL-GUEST PIC X(4).
30 01 STAY-GUEST.
31    02 STAY-CNT       PIC 9(4) OCCURS 5 VALUE ZERO.
32 01 PRT-GUEST.
33    02 PRT-TIME       OCCURS 10.
34       03 PRT-AGE        PIC 9(4) OCCURS 5 VALUE ZERO.
35 01 HD-SCALE     PIC X(50) VALUE
36     "${scale}".
37 01 LHEADER.
38    02 LHD-HH         PIC 9(2).
39    02                PIC X(7) VALUE ":00-59".
40    02 LHD-MARK       PIC X(50).
41 01 AGE-MARK.
42    02 KIDS-M         PIC X(50) VALUE ALL "@".
43    02 STUDENT-M      PIC X(50) VALUE ALL "*".
44    02 YOUNG-M        PIC X(50) VALUE ALL "+".
45    02 ADULT-M        PIC X(50) VALUE ALL "=".
46    02 OLD-M          PIC X(50) VALUE ALL "-".
47 01 REDEFINES AGE-MARK.
48    02 MARK           PIC X(50) OCCURS 5.
49 PROCEDURE DIVISION.
50 MAIN-PROC.
51     OPEN INPUT GUEST EVENT.
52     PERFORM UNTIL EOF
53         READ EVENT
54             AT END
55                 SET EOF TO TRUE
56             NOT AT END
57                 IF CR-HH NOT = E-HH THEN
58                     PERFORM VARYING CR-HH FROM CR-HH BY 1
59                             UNTIL CR-HH = E-HH
60                         ［a］
61                     END-PERFORM
62                 END-IF
63                 PERFORM SUM-PROC
64         END-READ
65     END-PERFORM.
66     CLOSE GUEST EVENT.
67     PERFORM PRT-PROC.
68     STOP RUN.
69 SUM-PROC.
70     MOVE E-NO TO G-NO.
71     READ GUEST.
72     EVALUATE TRUE
73         WHEN E-ENTER`;
const endCode = (open: number) => `74             ADD 1 TO ［b］ ［c］ ［d］
75         WHEN E-EXIT
76             SUBTRACT 1 FROM STAY-CNT(G-AGE)
77     END-EVALUATE.
78 PRT-PROC.
79     DISPLAY "TOTAL GUESTS  " TOTAL-GUEST-X.
80     DISPLAY "STAY GUESTS".
81     DISPLAY "         " HD-SCALE.
82     PERFORM VARYING I FROM 1 BY 1 UNTIL I > 10
83         MOVE 1 TO MARK-POS
84         COMPUTE LHD-HH = I + ${open - 1}
85         MOVE SPACE TO LHD-MARK
86         PERFORM VARYING J FROM 1 BY 1 UNTIL J > 5
87             COMPUTE MARK-CNT = PRT-AGE(I, J) / 100
88             IF MARK-CNT > 0 THEN
89                 MOVE MARK(J)(1:MARK-CNT) TO LHD-MARK(MARK-POS:)
90                 ［e］
91             END-IF
92         END-PERFORM
93         DISPLAY LHEADER
94     END-PERFORM.`;

export const q10 = createLanguageDefinition(10, '入園者と遊戯施設の利用状況の集計', '開園時刻・滞在者と施設利用の出力例',
  'abcdefg', '設問1 a=ウ，b・c・d=エ・キ・ク（順不同），e=ウ／設問2 f=イ，g=オ',
  '原冊子p.47〜53。年齢層・イベントコード・索引／順ファイル・時刻順・退園時刻を含む集計・100人未満の切捨てと棒の省略を維持。開園時刻を1時間刻みで変更して当該時の添字と次時間帯の添字を同期。原解答の順不同はb/c/dに限定。原問の行番号・プログラム変更の挿入位置・空欄の配置を保つ。', i => {
    const open = hours[i], curr = 'CR-HH - ' + (open - 1), next = 'CR-HH - ' + (open - 2);
    const rows = ['入園', '退園', '観覧車', 'ゴーカート', 'ジェットコースター', 'メリーゴーランド', 'ウォータースライダー', 'お化け屋敷', 'レストラン', 'ショップ']
      .map((label, j) => [label, String(j + 1).padStart(2, '0'), j === 0 ? 'ICカード発行' : j === 1 ? 'ICカード返却' : j < 8 ? '遊戯施設利用' : j === 8 ? '飲食' : '購入']);
    return { pages: [
      page(47, [
        p('問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'), heading('〔プログラムの説明〕'),
        p('ある遊園地では，ICカードを利用した精算システムを導入した。入園時に，入園者から入園料を受け取ると，入園者番号を記録したICカードを渡し，入園者番号と年齢層の情報を入園者ファイルに格納する。各施設では，提示されたICカードから入園者番号を読み取り，施設利用実績をイベントファイルに格納する。退園時に，入園者からICカードが返却されたときに，施設利用料金を一括で徴収する。'),
        p('このプログラムは，入園者ファイル及びイベントファイルに格納されたデータを読み込み，入園者に関する情報を集計して表示する。'),
        p('（1）入園者ファイルは，図1に示すレコード様式の，入園者番号を主キーとする索引ファイルである。ファイルは，営業日ごとに作成する。'),
        visitorRecord.block(i),
        p('① 入園者番号は，営業日ごとに一意となる，1から始まる4桁の数字である。'),
        p('② 年齢層コードには，4〜12歳は1，13〜18歳は2，19〜29歳は3，30〜49歳は4，50歳以上は5を格納する。4歳未満は入園料及び遊戯施設利用料金が無料となるので，ICカードは発行せず，入園者ファイルにも格納しない。'),
        p('（2）イベントファイルは，図2に示すレコード様式の順ファイルである。入園者のICカード利用状況（以下，イベントという）を格納する。ファイルは，営業日ごとに作成する。'),
        eventRecord.block(i),
      ]),
      page(48, [
        p('① イベントコードには，発生したイベントに応じて，表1に示すイベントコードを格納する。'),
        table('表1 イベントとイベントコード', ['イベント', 'イベントコード', '補足'], rows),
        p('② 時刻には，イベントが発生した時刻の時，分，秒を24時間表記で格納する。時系列で格納するので，レコードは時刻の昇順になっている。'),
        p(`なお，この遊園地は${open}時に開園し，全ての入園者は${open + 10}時になるまでに退園する。${open + 10}時台の時刻が格納されることはない。`),
        p('③ 金額には，該当するイベントを利用した際の金額を格納する。なお，入退園（イベントコード01，02）の場合は，0を格納する。'),
        p('④ 一旦退園した入園者が，その日のうちに同じ入園者番号で再入園することはない。'),
        p('（3）集計結果の表示例を図3に示す。'), guestOutput.block(i),
      ]),
      page(49, [
        p('① TOTAL GUESTSには，入園者数を表示する。1日の入園者数が5,000人を超えることはない。'),
        p(`② STAY GUESTSには，左端に表示した時間帯の滞在者数を，年齢層別に棒グラフで表示する。例えば，${open}時ちょうどに入園し，${open + 1}時ちょうどに退園した者は，${open}時台と${open + 1}時台の滞在者として数える。`),
        p('③ 棒グラフを構成する各記号は，表2に示すとおり滞在者の年齢層と対応している。記号一つは100人を表し，100人未満の端数は切り捨てる。'),
        table('表2 年齢層と対応する記号', ['年齢層', '記号'], ageGroups.map((group, j) => [group, ageMarks[j]])),
        heading('〔プログラム〕（行番号）'), code(firstCode, 'cobol'),
      ]),
      page(50, [code(middleCode(open), 'cobol')]),
      page(51, [
        code(endCode(open), 'cobol'), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      ], [
        bank(1, 'a', [
          `MOVE STAY-CNT(CR-HH) TO PRT-AGE(${next}, E-HH)`,
          `MOVE STAY-CNT(${next}) TO PRT-TIME(CR-HH)`,
          `MOVE STAY-GUEST TO PRT-TIME(${next})`,
          `MOVE ZERO TO PRT-AGE(${next}, CR-HH)`,
        ], 'ウ', 'cobol'),
        { ...bank(1, 'bcd', ['CR-HH', 'I', 'J', `PRT-AGE(${curr}, G-AGE)`, `PRT-AGE(G-AGE, ${curr})`, 'STAY-CNT(CR-HH)', 'STAY-CNT(G-AGE)', 'TOTAL-GUEST'], 'エキク', 'cobol'), unordered: true },
      ]),
      page(52, [
        p('設問2 各遊戯施設の延べ利用者数を集計し，図4に示すグラフを追加表示するようにプログラムを変更した。表3中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        heading('〔グラフの説明〕'),
        p('（1）左端に表示したイベントコードに対応する遊戯施設を利用した延べ人数を表示する。記号 # 一つは100人を表し，100人未満の端数は切り捨てる。一つの遊戯施設の延べ利用者数が5,000人を超えることはない。'),
        p('（2）延べ利用者数が100人未満の遊戯施設の行は表示しない。'), facilityOutput.block(i),
      ], [bank(1, 'e', ['ADD J TO MARK-CNT', 'ADD J TO MARK-POS', 'ADD MARK-CNT TO MARK-POS', 'ADD MARK-POS TO MARK-CNT'], 'ウ', 'cobol')], [-1]),
      page(53, [facilityChanges.block(i)], [
        bank(2, 'f', ['ADD 1 TO FAC-CNT(E-CODE)', 'ADD 1 TO FAC-CNT(E-CODE - 2)', 'ADD G-AGE TO FAC-CNT(E-CODE)', 'ADD G-NO TO FAC-CNT(E-CODE)', 'ADD STAY-CNT(G-AGE) TO FAC-CNT(E-CODE)'], 'イ', 'cobol'),
        bank(2, 'g', ['6 TIMES', 'UNTIL FAC-NO > 6 AND MARK-CNT > 50', 'UNTIL FAC-NO > 6 OR MARK-CNT > 50', 'VARYING FAC-NO FROM 1 BY 1 UNTIL FAC-NO > 6', 'VARYING FAC-NO FROM 3 BY 1 UNTIL FAC-NO > 8'], 'オ', 'cobol'),
      ]),
    ], explanation: `営業開始の${open}時台は添字1なので，現在の時台は${curr}，次の時台は${next}。時台が進むたびに，その時点の全ての年齢層の残留人数を次の時台へ一括でコピーする。入園イベントでは現在時台の年齢層別人数，現時点の滞在人数，一日全体の入園人数をそれぞれ1増やす。これら三つの加算対象は順不同。退園時は現時点の滞在人数だけを減らすので，退園した時台にもその人が数えられる。eは表示済みの記号数だけ次の描画位置を進める。遊戯施設のイベントコード3〜8に2を引いて添字1〜6を得るため，fは該当施設に1を加え，gは施設コード3から8までを順に処理する。` };
  });
