import { p, table } from './definition';
import { bank, changeTableFigure, numbered, page, springLanguageFigure, springLanguageQuestion } from './legacy-2006-spring-pm-10-13-support';

const stations = 'ABCDEFGHIJ';
const conditions = [
  { entry: 2, exit: 4, minutes: 415, sectionTime: 10, durations: '080611071009081013' },
  { entry: 5, exit: 2, minutes: 400, sectionTime: 20, durations: '120807101509071108' },
  { entry: 1, exit: 3, minutes: 416, sectionTime: 8, durations: '070905111008091206' },
  { entry: 4, exit: 1, minutes: 469, sectionTime: 15, durations: '110806121007100912' },
] as const;

function displayTime(time: number) {
  return String(Math.floor(time / 60)).padStart(2, '0') + ':' + String(time % 60).padStart(2, '0');
}

function report(index: number, example: boolean) {
  const trip = conditions[index];
  const up = trip.entry < trip.exit;
  const crossings = Array.from({ length: Math.abs(trip.exit - trip.entry) }, (_, step) => {
    const section = up ? trip.entry + step : trip.entry - step - 1;
    return { hour: Math.floor((trip.minutes + step * trip.sectionTime) / 60), section, way: up ? 'UP' : 'DOWN' };
  });
  const hours = [...new Set([6, 7, ...crossings.map(row => row.hour)])].sort((a, b) => a - b);
  const sectionNames = ['A-B', 'B-C', 'C-D', 'D-E', '…', 'I-J'];
  const sectionIds = [1, 2, 3, 4, -1, 9];
  const rows = [...hours, 0, 23].flatMap(hour => hour === 0 ? [{ title: '…', way: '', cells: [] }] : ['UP', 'DOWN'].map(way => ({
    title: way === 'UP' ? displayTime(hour * 60) : '',
    way, cells: sectionIds.map(section => ({
      label: section < 0 ? '…' : 'ZZZ,ZZ9',
      highlight: example && crossings.some(hit => hit.hour === hour && hit.way === way && hit.section === section),
    })),
  })));
  const countedSections = crossings.map(({ hour, section, way }) =>
    displayTime(hour * 60) + ' ' + way + ' ' + stations[section - 1] + '-' + stations[section]).join('，');
  return { rows, sectionNames, countedSections,
    alt: 'TIMEとUP／DOWN別にA-B，B-C，C-D，D-E，…，I-Jの区間利用者数を形式ZZZ,ZZ9で表示する。' +
      (example ? 'この乗客を数える網掛けは' + countedSections + '。'
        : '06:00から23:00まで，各時台を上りと下りの2行で表示する。') };
}

export const trainReport = springLanguageFigure(11, 'layout', '印字様式', index => report(index, false));
export const countedTrip = springLanguageFigure(11, 'counted', '例の乗客が利用した区間', index => report(index, true));
export const timeTableChanges = changeTableFigure(11, index => [
  ['行番号40と41\nの間に追加', `01 TIME-TABLE.
   02 TIME-DATA PIC X(18) VALUE "${conditions[index].durations}".
   02 SECT-MM REDEFINES TIME-DATA PIC 9(2) OCCURS 9.`],
  ['行番号64と65\nの間に追加', 'COMPUTE TIME-CNT = [e]'],
  ['行番号66と67\nの間に追加', 'COMPUTE TIME-CNT = [f]'],
  ['行番号68を削除', ''],
]);

const dataDivision = `DATA DIVISION.
FILE SECTION.
FD  IN-FILE.
01  IN-REC       PIC X(8).
FD  PR-FILE.
01  PR-REC       PIC X(100).
WORKING-STORAGE SECTION.
01  W-IN-REC.
    02 IN-STATION   PIC 9(2).
    02 OUT-STATION  PIC 9(2).
    02 IN-TIME.
       03 IN-HH        PIC 9(2).
       03 IN-MM        PIC 9(2).
01  COUNT-TABLE.
    02 UP-TABLE    OCCURS 18.
       03 UP-PASSENGER   OCCURS 9 PIC 9(6) VALUE ZERO.`;

function mainProgram(sectionTime: number) {
  return `    02 DOWN-TABLE  OCCURS 18.
       03 DOWN-PASSENGER OCCURS 9 PIC 9(6) VALUE ZERO.
77  READ-SW        PIC X(1) VALUE SPACE.
    88 AT-END      VALUE "E".
77  WAY            PIC S9(1).
    88 UP-WAY      VALUE 1.
    88 DOWN-WAY    VALUE -1.
77  TIME-IDX       PIC S9(2).
77  TIME-CNT       PIC S9(2).
77  SECT-IDX       PIC S9(2).
01  W-PR-HEADER.
    02              PIC X(15) VALUE "TIME".
    02              PIC X(50) VALUE
       "A-B        B-C        C-D        D-E        E-F".
    02              PIC X(35) VALUE
       "F-G        G-H        H-I        I-J".
01  W-PR-REC.
    02 PR-TIME.
       03 PR-HH     PIC 9(2).
       03 PR-MM     PIC X(4).
    02 PR-WAY       PIC X(4).
    02              OCCURS 9.
       03           PIC X(3) VALUE SPACE.
       03 PR-PASSENGER PIC ZZZ,ZZ9.
PROCEDURE DIVISION.
MAIN-PROCEDURE.
    OPEN INPUT IN-FILE OUTPUT PR-FILE.
    PERFORM TEST BEFORE UNTIL AT-END
        READ IN-FILE AT END SET AT-END TO TRUE
            NOT AT END MOVE IN-REC TO W-IN-REC
                       PERFORM COUNT-PASSENGER
        END-READ
    END-PERFORM.
    PERFORM PRINT-DATA.
    CLOSE IN-FILE PR-FILE.
    STOP RUN.
COUNT-PASSENGER.
    IF [a] THEN
        SET UP-WAY TO TRUE
    ELSE
        SET DOWN-WAY TO TRUE
    END-IF.
    COMPUTE TIME-IDX = IN-HH - 5.
    MOVE IN-MM TO TIME-CNT.
    PERFORM VARYING SECT-IDX FROM IN-STATION BY WAY
        UNTIL SECT-IDX = OUT-STATION
        IF UP-WAY THEN
            ADD 1 TO UP-PASSENGER(TIME-IDX, SECT-IDX)
        ELSE
            ADD 1 TO DOWN-PASSENGER([b])
        END-IF
        COMPUTE TIME-CNT = TIME-CNT + ${sectionTime}`;
}

const endProgram = `        IF [c] THEN
            COMPUTE TIME-IDX = TIME-IDX + 1
            COMPUTE TIME-CNT = TIME-CNT - 60
        END-IF
    END-PERFORM.
PRINT-DATA.
    WRITE PR-REC FROM W-PR-HEADER.
    PERFORM VARYING TIME-IDX FROM 1 BY 1
        UNTIL TIME-IDX > 18
        COMPUTE PR-HH = TIME-IDX + 5
        MOVE ":00" TO PR-MM
        MOVE "UP" TO PR-WAY
        PERFORM VARYING SECT-IDX FROM 1 BY 1
            UNTIL SECT-IDX > 9
            MOVE UP-PASSENGER(TIME-IDX, SECT-IDX)
                TO PR-PASSENGER([d])
        END-PERFORM
        WRITE PR-REC FROM W-PR-REC
        MOVE SPACE TO PR-TIME
        MOVE "DOWN" TO PR-WAY
        PERFORM VARYING SECT-IDX FROM 1 BY 1
            UNTIL SECT-IDX > 9
            MOVE DOWN-PASSENGER(TIME-IDX,
                                SECT-IDX)
                TO PR-PASSENGER([d])
        END-PERFORM
        WRITE PR-REC FROM W-PR-REC
    END-PERFORM.`;

const comparisons = ['IN-STATION < 5', 'IN-STATION < OUT-STATION', 'IN-STATION > 5', 'IN-STATION > OUT-STATION',
  'TIME-CNT = 60', 'TIME-CNT >= 60', 'TIME-IDX = 0', 'TIME-IDX NOT = 0'];
const subscripts = ['SECT-IDX', 'SECT-IDX,TIME-IDX', 'TIME-IDX - 1,SECT-IDX', 'TIME-IDX + 1,SECT-IDX',
  'TIME-IDX', 'TIME-IDX,SECT-IDX - 1', 'TIME-IDX,SECT-IDX + 1', 'TIME-IDX,SECT-IDX'];
const elapsed = ['60 - SECT-MM(SECT-IDX)', '60 - SECT-MM(TIME-IDX)', 'TIME-CNT + SECT-MM(SECT-IDX)',
  'TIME-CNT + SECT-MM(SECT-IDX + 1)', 'TIME-CNT + SECT-MM(SECT-IDX - 1)',
  'TIME-CNT + SECT-MM(TIME-IDX)', 'TIME-CNT + SECT-MM(TIME-IDX + 1)', 'TIME-CNT + SECT-MM(TIME-IDX - 1)'];

export const q11 = springLanguageQuestion(11, '鉄道の区間利用者数の集計', '入出場駅・時刻と区間所要時間', 'abcdef', 'イカカアウオ',
  '入出場駅、方向、入場時刻、一定の所要時間及び区間別のテーブル値を四つの条件で差し替える。時間帯の境界、上り・下り、1起点の添字、時間表で定める区間を保持し、構文の正答位置を固定する。999,999人までの6桁表示、営業時間、行番号と空欄、全候補の役割を維持する。', index => {
    const trip = conditions[index];
    const tripText = displayTime(trip.minutes).replace(':', '時') + '分に' + stations[trip.entry - 1] + '駅から入場し，' + stations[trip.exit - 1] + '駅で出場';
    const recordColumns = ['入場駅', '出場駅', '入場時刻'];
    const exampleRecord = [String(trip.entry).padStart(2, '0'), String(trip.exit).padStart(2, '0'), displayTime(trip.minutes).replace(':', '')];
    return {
      pages: [
        page(43, [
          p('問11　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\nA〜Jの10駅を結ぶ路線において，利用者の入場駅，出場駅及び入場時刻が1日分記録された乗客ファイルを読み込み，各駅間の区間利用者数を集計して印字する。'),
          p('（1）乗客ファイル（IN-FILE）は次のレコード様式の順ファイルであり，乗客1人の1回の利用に対して一つのレコードが作成される。'),
          table('乗客ファイルのレコード様式', recordColumns, [['2けた', '2けた', '4けた']]),
          p('① 上り及び下り列車の利用者が順不同で格納される。\n② 入場時刻はHHMM形式で，HHは24時間表現の時，MMは分を表す。各駅は午前6時に開場し，午前0時に閉鎖する。閉鎖中，乗客は駅及び列車内にとどまれない。\n③ 入場駅及び出場駅は対応する番号01〜10で格納され，両者は異なる。A駅は01，B駅は02，C駅は03，D駅は04，…，J駅は10である。'),
          p('例：' + tripText + 'した場合のレコード。'),
          table('例の記録', recordColumns, [exampleRecord]),
          p('（2）印字様式は，次のとおりとする。'),
          trainReport.block(index),
        ]),
        page(44, [
          p('① TIMEは，印字された時間帯の利用であることを表す。例えば，07時00分〜07時59分の利用ならば，07:00の行に集計する。\n② A-BからI-Jの各列は区間を表す。例えばA-BはA駅からB駅までの区間を表す。\n③ UPは上り（A駅からJ駅の方向），DOWNは下り（J駅からA駅の方向）を表す。\n④ 利用者数は入場時刻を基にした経過時間及び乗車区間で集計する。各駅間の区間所要時間は' + trip.sectionTime + '分とし，待ち時間や乗換えは考慮しない。' + tripText + 'した場合は，下の網掛け部分を1名が利用したとみなし，各要素にカウントする。人数は999,999以下とする。'),
          countedTrip.block(index), p('〔プログラム〕'), numbered('cobol', 1, dataDivision),
        ]),
        page(45, [numbered('cobol', 17, mainProgram(trip.sectionTime))]),
        page(46, [numbered('cobol', 69, endProgram),
          p('設問1　プログラム中の［a］〜［d］に入れる正しい答えを，解答群の中から選べ。')],
        [bank(1, 'ac', comparisons, 'イカ', 'cobol'), bank(1, 'bd', subscripts, 'カア', 'cobol')]),
        page(47, [
          p('設問2　区間利用者数をより正確に集計するため，各駅間の所要時間を分単位で保持するテーブルを用意し，そのテーブルから経過時間を求めるようプログラムを変更したい。表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          timeTableChanges.block(index),
        ], [{ ...bank(2, 'ef', elapsed, 'ウオ', 'cobol'), ownLabel: '設問2 解答群' }]),
      ],
      explanation: '駅番号が増える方向が上りである。上りでは現在駅の番号，下りでは現在駅の番号−1が区間の列になる。TIME-CNTが60以上になったときにTIME-IDXを進め，60を引く。表示用の1行には区間の添字だけを使う。設問2で区間別の時間を使う場合も，同じ上り・下りの区間番号をSECT-MMに渡す。例で数える区間は' + countedTrip.panel([index]).countedSections + 'である。',
    };
  }, { answerVariation: 'fixed' });
