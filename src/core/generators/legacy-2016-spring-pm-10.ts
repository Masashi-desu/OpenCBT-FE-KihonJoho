import { code, field, p, table, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, choiceBankText, heading, pageAlt, selectCase, springLanguageDiagram } from './legacy-2016-spring-pm-09-13-support';
import type { SourcePage } from './legacy-2016-autumn-pm-09-13-support';

const conditions = [7, 5, 6, 8].flatMap(days => [6, 7, 8].map(rooms => ({days, rooms})));
const optionsA = ['ADD 1 TO GET-ROOM', 'ADD 1 TO PRM-FREE', 'MOVE PRM-NO TO RSV-NO(CNT)', 'MOVE ZERO TO RSV-NO(CNT)'];
const optionsD = ['行番号25と26の間', '行番号35と36の間', '行番号37と38の間', '行番号46と47の間'];
const optionsF = ['QUOTIENT > 100', 'QUOTIENT > 400', 'URU-SUPPLY = ZERO', 'URU-SUPPLY NOT = ZERO'];
const declarations = `01 MONTH-TABLE.
   02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".
   02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2).
77 URU-SUPPLY  PIC 9(1).
77 QUOTIENT    PIC 9(3).`;
const cancelParam = `   02 PRM-CANCEL.
      03 CAN-YYYY  PIC 9(4).
      03 CAN-MM    PIC 9(2).
      03 CAN-DD    PIC 9(2).`;
const calculate = `IF PRM-RSLT = ZERO THEN
    PERFORM SET-CANCEL
ELSE
    MOVE ZERO TO PRM-CANCEL
END-IF.`;

export function spring2016Pm10Program(rooms: number) {
  return ` 1  DATA DIVISION.
 2  FILE SECTION.
 3  FD RSV-FILE.
 4  01 RSV-REC.
 5     02 RSV-DATE       PIC X(8).
 6     02 RSV-ROOM       OCCURS ${rooms}.
 7        03 RSV-NO      PIC 9(6).
 8  WORKING-STORAGE SECTION.
 9  77 CNT              PIC 9(1).
10  77 GET-ROOM         PIC 9(1).
11  LINKAGE SECTION.
12  01 PRM1.
13     02 PRM-NO         PIC 9(6).
14     02 PRM-DATE       PIC 9(8).
15     02 PRM-ROOM       PIC 9(1).
16  01 PRM2.
17     02 PRM-RSLT       PIC 9(1).
18     02 PRM-FREE       PIC 9(1).
19  PROCEDURE DIVISION USING PRM1 PRM2.
20  MAIN-PROC.
21      OPEN I-O RSV-FILE.
22      MOVE PRM-DATE TO RSV-DATE.
23      READ RSV-FILE INVALID KEY     PERFORM RSV-PROC
24                    NOT INVALID KEY PERFORM CHK-PROC
25      END-READ.
26      CLOSE RSV-FILE.
27      EXIT PROGRAM.
28  RSV-PROC.
29      INITIALIZE RSV-REC.
30      MOVE PRM-DATE TO RSV-DATE.
31      PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > PRM-ROOM
32          [a]
33      END-PERFORM.
34      WRITE RSV-REC.
35      MOVE ZERO TO PRM-RSLT PRM-FREE.
36  CHK-PROC.
37      MOVE ZERO TO GET-ROOM PRM-FREE.
38      PERFORM VARYING CNT FROM 1 BY 1 UNTIL [b]
39          IF RSV-NO(CNT) = ZERO THEN
40              IF PRM-ROOM > GET-ROOM THEN
41                  MOVE PRM-NO TO RSV-NO(CNT)
42                  ADD 1 TO GET-ROOM
43              END-IF
44              ADD 1 TO PRM-FREE
45          END-IF
46      END-PERFORM.
47      IF [c] THEN
48          REWRITE RSV-REC
49          MOVE ZERO TO PRM-RSLT PRM-FREE
50      ELSE
51          MOVE 9 TO PRM-RSLT
52      END-IF.`;
}
function cancelProgram(days: number) {
  return `SET-CANCEL.
    MOVE PRM-DATE TO PRM-CANCEL.
    IF CAN-DD > ${days} THEN
        SUBTRACT ${days} FROM CAN-DD
    ELSE
        IF CAN-MM = 1 THEN
            SUBTRACT 1 FROM CAN-YYYY
            MOVE 12 TO CAN-MM
            COMPUTE CAN-DD = 31 + CAN-DD - ${days}
        ELSE
            SUBTRACT 1 FROM CAN-MM
            [e]
            IF CAN-MM = 2 THEN
                DIVIDE CAN-YYYY BY 4
                       GIVING QUOTIENT REMAINDER URU-SUPPLY
                IF [f] THEN
                    ADD 1 TO CAN-DD
                END-IF
            END-IF
        END-IF
    END-IF.`;
}
const conditionBank = (rooms: number) => [
  'CNT > ' + rooms, 'CNT > GET-ROOM', 'CNT > PRM-ROOM',
  'GET-ROOM < PRM-ROOM', 'GET-ROOM = PRM-ROOM', 'GET-ROOM > PRM-ROOM',
];
const dayBank = (days: number) => [
  `COMPUTE CAN-DD = 30 + CAN-DD - ${days}`,
  `COMPUTE CAN-DD = MONTH-ELM(CAN-MM - 1) - ${days}`,
  `COMPUTE CAN-DD = MONTH-ELM(CAN-MM) + CAN-DD - ${days}`,
  `SUBTRACT ${days} FROM CAN-DD`,
];
export function spring2016Pm10ChangeTable(values: number[]) {
  const {days} = conditions[selectCase(values, conditions.length)];
  return [
    ['行番号10と11の間に追加', declarations], ['行番号18と19の間に追加', cancelParam],
    ['［d］に追加', calculate], ['行番号52の後ろに追加', cancelProgram(days)],
  ];
}
export const spring2016Pm10ChangeTableAlt = (values: number[]) =>
  '処置｜変更内容\n' + spring2016Pm10ChangeTable(values).map(row => row.join('｜')).join('\n\n');
function pages(index: number): SourcePage[] {
  const {rooms, days} = conditions[index], program = spring2016Pm10Program(rooms).split('\n');
  return [
    {page: 46, blocks: [
      p('問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
      heading('〔プログラムの説明〕'),
      p(`Z社では，従業員向けの福利厚生施設として，${rooms}部屋の客室を有する保養所を運営している。1部屋には4人まで宿泊可能で，宿泊希望者は1〜${rooms}までの部屋数を指定できる。宿泊日数は1泊だけである。このプログラムは宿泊予約を管理するサブプログラムであり，予約情報を受け取り，予約結果を呼出し元へ返す。`),
      p('(1) このプログラムのパラメタは二つで，各パラメタの様式は，図1のとおりである。'),
      table('図1 パラメタの様式・予約情報', ['予約番号', '希望日', '部屋数'], [['6桁', '8桁', '1桁']]),
      table('図1 パラメタの様式・予約結果', ['結果', '空き部屋数'], [['1桁', '1桁']]),
      p('① 予約番号には，予約希望に対して一意に割り振られた000001〜999999の番号が格納されている。'),
      p('② 希望日には，宿泊する日の年，月，日が，それぞれ西暦の4桁，2桁，2桁で格納されている。'),
      p('③ 部屋数には，希望する部屋数が格納されている。'),
      p('④ 結果には，希望どおりに予約できた場合は0を，できなかった場合は9を設定する。'),
      p('⑤ 空き部屋数には，希望どおりに予約できなかった場合に，希望日の空き部屋数を設定する。例えば，3部屋を希望している場合に2部屋しか空きがなかったときは，2を設定する。希望どおりに予約できた場合は，0を設定する。'),
      p('⑥ 予約情報に誤りはないものとする。'),
    ]},
    {page: 47, blocks: [
      p('(2) 予約ファイルは，日付を主キーとする図2に示すレコード様式の索引ファイルであり，予約状況を管理する。'),
      table('図2 予約ファイルのレコード様式・予約状況', ['日付', ...Array.from({length: rooms}, (_, i) => '部屋' + (i + 1))],
        [['8桁', ...Array(rooms).fill('6桁')]]),
      p('① 日付には，年，月，日が，それぞれ西暦の4桁，2桁，2桁で格納されている。'),
      p(`② 部屋1〜${rooms}のうち，予約済みの部屋には予約番号が格納される。予約が入っていない部屋には0が格納されている。`),
      p('③ 予約が1部屋も入っていない日のレコードは存在しない。'),
      heading('〔プログラム〕'),
      code(program.slice(0, 23).join('\n'), 'cobol'),
    ]},
    {page: 48, blocks: [
      code(program.slice(23).join('\n'), 'cobol'),
      p('設問1 プログラム中の［a］〜［c］に入れる正しい答えを，解答群の中から選べ。'),
    ], banks: [choiceBankText('a', optionsA)]},
    {page: 49, blocks: [
      p(`設問2 予約をキャンセルする場合は，宿泊する日の${days}日前からキャンセル料が発生する。希望どおり予約できた場合には，キャンセル料の発生開始日もパラメタで返すように，プログラムを変更する。キャンセル料の発生開始日の年，月，日は，それぞれ西暦の4桁，2桁，2桁で表し，予約できなかった場合には0を設定する。キャンセル料の発生開始日を求める処理は2016年〜2099年で動作を保証する。表中の［d］〜［f］に入れる正しい答えを，解答群の中から選べ。`),
      springLanguageDiagram(10, 'change-table', index, '表1 プログラムの変更内容', spring2016Pm10ChangeTableAlt([index])),
    ]},
    {page: 50, blocks: [], banks: [choiceBankText('d', optionsD), choiceBankText('e', dayBank(days)), choiceBankText('f', optionsF)]},
  ];
}
export function spring2016Pm10OriginalPageAlt() {
  const source = pages(0), rows = spring2016Pm10ChangeTable([0]);
  const program = rows[3][1].split('\n');
  rows[3][1] = program.slice(0, 9).join('\n');
  source[3].blocks[1] = table('表1 プログラムの変更内容', ['処置', '変更内容'], rows);
  const alt = pageAlt(source);
  alt[49] = choiceBankText('b，c', conditionBank(6)) + '\n\n' + alt[49];
  alt[50] = program.slice(9).join('\n') + '\n\n' + alt[50];
  return alt;
}
function build(values: number[]): GeneratedBody {
  const index = selectCase(values, conditions.length), {days, rooms} = conditions[index];
  return answerBody(pages(index).flatMap(page => page.blocks), [
    {names: ['a'], labels: ['設問1 a'], options: optionsA, keys: [2], language: 'cobol'},
    {names: ['b', 'c'], labels: ['設問1 b', '設問1 c'], options: conditionBank(rooms), keys: [0, 4], language: 'cobol'},
    {names: ['d'], labels: ['設問2 d'], options: optionsD, keys: [0]},
    {names: ['e'], labels: ['設問2 e'], options: dayBank(days), keys: [2], language: 'cobol'},
    {names: ['f'], labels: ['設問2 f'], options: optionsF, keys: [2], language: 'cobol'},
  ], `a：希望日のレコードがないので，初期化後に希望部屋数だけ予約番号を入れて新規登録する。b：既存レコードでは部屋1から部屋${rooms}までを調べる。希望数を確保しても，判定は全室を見て空き部屋数を数える構造である。c：確保数が希望数と同じ場合だけREWRITEで永続化する。不足時にはファイルを変更せず，結果9と元の空き部屋数を返す。\nd：25行目でREADの分岐が終わり，結果が確定する。26行目の前に置けば成功・失敗の両方を扱える。e：日が${days}以下なら前月へ移動しているので，前月の日数に当初の日を加えて${days}を引く。CAN-MMを既に1減らしたため，MONTH-ELM(CAN-MM)を読む。f：2016〜2099年には100で割り切れる年がないので，4で割った余りが0の2月だけ1日を足す。例えば2020年3月1日から${days}日前は2月${30 - days}日になる。1月の繰下げでは前年12月の日数31を使う。`);
}
export const legacy2016SpringPm10Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-10', title: '旧制度・午後：COBOLによる宿泊予約の管理',
  fields: [field('施設とキャンセル条件の番号', 0, 11)], reference: [0], version: '3.6.0',
  sourceAnswer: '設問1 a=ウ，b=ア，c=オ／設問2 d=ア，e=ウ，f=ウ',
  publicNotes: '予約ファイルの更新・取消日計算の形式を保ち，客室数とキャンセル料が発生する日数を変更します。',
  notes: 'PDF p46–50、原6欄。客室6–8と取消5–8日の12候補。CNTは容量+1が1桁、希望範囲とOCCURS・図を同じ入力で変更。正常な予約情報・1泊・主キー・未予約日のレコードなし、確保不足は非永続化。年2016–2099、閏日と前年への繰下げを独立Gregorian暦で検算し、全候補の予約状態・空欄を検査。',
  build,
};
