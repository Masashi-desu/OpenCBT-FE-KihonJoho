import { code, list, p, table } from './definition';
import { autumnLanguageFigure, autumnLanguageQuestion, bank, page } from './legacy-2004-autumn-pm-10-13-support';

const originalCase = { channels: 5, sample: 600, stride: 1, base: 600, stations: [1, 2, 3] };
const conditions = [
  { channels: 4, sample: 80, stride: 1, base: 359, stations: [2, 4, 1] },
  { channels: 5, sample: 125, stride: 2, base: 596, stations: [5, 2, 3] },
  { channels: 6, sample: 160, stride: 3, base: 1140, stations: [3, 6, 2] },
  { channels: 7, sample: 250, stride: 5, base: 445, stations: [7, 3, 5] },
];

const two = (value: number) => String(value).padStart(2, '0');
const time = (minute: number) => two(Math.floor(minute / 60)) + two(minute % 60);
function timeline(value: typeof originalCase) {
  const channels = value.stations.map(two);
  const headings = Array.from({ length: 7 }, (_, i) => time(value.base + i * value.stride));
  const segments = [
    [0, 0.5, 2.5], [1, 2.5, 3.25], [2, 3.25, 3.75], [1, 3.75, 13 / 3], [0, 13 / 3, 5.5],
  ];
  const alt = '横軸の検出時刻は ' + headings.join('、') + '。上からチャンネル' + channels.join('、') +
    '。視聴者は第1の目盛と第2の目盛の間に視聴を開始し、チャンネルを上段・中段・下段・中段・上段の順に変える。' +
    '第2、3、6の目盛で上段、第4、5の目盛で中段を検出し、下段を検出する目盛はない。';
  return { channels, headings, segments, alt };
}
export const audienceTimeline = autumnLanguageFigure(11, 'channel-samples', '視聴中のチャンネルと検出時刻',
  index => timeline(conditions[index]));

function banks(sampleSize: string, sum: string, start: string, end: string, counter: string, view: string, program: string) {
  return {
    init: bank(0, 'abd', [
      `COMPUTE ${sum} = ${end} - ${start}`, `INITIALIZE ${counter}`, 'MOVE "N" TO END-OF-FILE',
      'MOVE "Y" TO END-OF-FILE', `MOVE ${sampleSize} TO ${sum}`, `MOVE ZERO TO ${sum}`, `MOVE ZERO TO ${counter}`,
    ], 'イウカ', 'cobol'),
    slots: bank(0, 'ce', [
      `ADD 1 TO COUNT-OF-MINUTE(${view} M)`, `ADD 1 TO COUNT-OF-MINUTE(${view} M + 1)`,
      `ADD 1 TO ${sum}`, `ADD COUNT-OF-MINUTE(${program} M) TO ${sum}`,
      `COMPUTE ${sum} = COUNT-OF-MINUTE(${program} M + 1)`, `COMPUTE ${sum} = COUNT-OF-MINUTE(${view} M) + 1`,
      `MOVE 1 TO COUNT-OF-MINUTE(${view} M)`,
    ], 'アエ', 'cobol'),
    rate: bank(0, 'f', [
      `100 * ${sum} / ((${end} - ${start}) * (${sampleSize} + 1))`,
      `100 * ${sum} / ((${end} - ${start} + 1) * ${sampleSize})`,
      `100 * ${sum} / (${end} - ${start}) / ${sampleSize}`,
      `100 * ${sum} / (${end} - ${start} + 1) / (${sampleSize} + 1)`,
    ], 'イ', 'cobol'),
  };
}
const answer = banks('SAMPLE-SIZE', 'SUMMATION', 'START-MMMM', 'END-MMMM', 'VIEW-COUNT-TABLE', 'VIEW-CHANNEL', 'PROG-CHANNEL');

export const q11 = autumnLanguageQuestion(11, '調査対象世帯の番組別平均視聴率', '調査対象世帯・チャンネルと検出間隔の組', 'abcdef', 'イウアカエイ',
  '検出間隔、標本世帯数、集計対象チャンネル数、視聴の時刻例を本文・図・COBOLへ反映する。6空欄の役割と3解答群は原形式を維持する。',
  (index, original) => {
    const value = original ? originalCase : conditions[index];
    const { channels, sample, stride, base, stations } = value;
    const perDay = 1440 / stride, last = 1440 - stride;
    const view = (channel: number, first: number, end: number) => two(channel) + time(base + first * stride) + time(base + end * stride);
    const records = [view(stations[0], 1, 2), view(stations[1], 3, 4), view(stations[0], 5, 5)].join('\n');
    const sampleTime = stride === 1 ? '毎分00秒' : '00時00分から' + stride + '分ごとの00秒';
    const hhmm = (minute: number) => time(minute).slice(0, 2) + '時' + time(minute).slice(2) + '分';
    const newTitle = original ? 'Sports News' : 'Weather Report';
    const nextTitle = original ? 'Good Morning' : 'Local News';
    const statement = original
      ? '五つのチャンネルのある地域で、同日の視聴データと番組データから番組ごとの平均視聴率を求めて印字する。時刻は1分単位で扱い、例えば10時00分00秒から10時00分59秒までを10時00分と扱う。'
      : channels + 'チャンネルの視聴記録と同日の番組一覧から、各番組の平均視聴率を集計して印字する。1日の枠を00時00分から' + stride +
        '分刻みで設け、各枠の開始ちょうどの視聴を数える。入力の開始・終了時刻はすべてこの刻みの位置にそろう。';
    const range = '入力の時刻は00時00分から' + hhmm(last) +
      'までとし、日をまたがない。開始時刻≦終了時刻であり、検出開始と終了、番組開始と終了は対象枠に含む。';
    const position = (prefix: string, bound: string) => {
      const minutes = `${prefix}-${bound}-HH * 60 + ${prefix}-${bound}-MM`;
      return stride === 1 ? minutes + ' + 1' : '(' + minutes + ') / ' + stride + ' + 1';
    };
    const example = original
      ? 'チャンネルの時間図。世帯は10時00分30秒から10時05分30秒まで視聴する。' + timeline(value).alt
      : 'ある世帯は図の期間中にチャンネルを切り換えた。縦線の時刻で視聴チャンネルを検出する。';
    const display = original
      ? 'channel from - to    rating(%) program-title\n   02   2320 - 2359    8.3    Sports News\n   04   0430 - 0439    1.7    Good Morning\n    ⋮     ⋮      ⋮      ⋮         ⋮'
      : 'channel from - to    rating(%) program-title\n   ' + two(stations[0]) + '   ' + time(base) + ' - ' + time(base + 2 * stride) +
        '    8.3    ' + newTitle + '\n   ' + two(stations[1]) + '   ' + time(base + 3 * stride) + ' - ' + time(base + 5 * stride) + '    ' + (sample === 125 ? '1.6' : '1.7') + '    ' + nextTitle +
        '\n    ⋮     ⋮      ⋮      ⋮         ⋮';
    const pages = [
      page(41, [
        p('次のCOBOLプログラムの説明及びプログラムを読んで、設問に答えよ。'),
        p('〔プログラムの説明〕' + statement),
        table('視聴データファイル（VIEW-FILE）の順ファイルのレコード様式', ['チャンネル番号', '検出開始時刻の時', '分', '検出終了時刻の時', '分'],
          [['2けた', '2けた', '2けた', '2けた', '2けた']]),
        list([sample + '世帯の1日分の視聴データを格納する。',
          '1世帯のテレビは1台とする。チャンネル番号は01〜' + two(channels) + '。',
          '1レコードは一つの世帯が同じチャンネルを検出開始時刻から検出終了時刻まで視聴したことを表す。',
          sampleTime + 'に視聴中のチャンネルを記録する。'], true),
        p(example), ...original ? [] : [audienceTimeline.block(index)],
      ]),
      page(42, [
        p('検出時刻に基づき、図の例を次の3レコードとして記録する。チャンネル' + two(stations[2]) + 'は記録されない。'),
        code(records, 'text'), p(range),
        table('番組データファイル（PROGRAM-FILE）の順ファイルのレコード様式',
          ['チャンネル番号', '番組開始時刻の時', '分', '番組終了時刻の時', '分', '番組名'],
          [['2けた', '2けた', '2けた', '2けた', '2けた', '50けた']]),
        p('視聴データと同じ日の全' + channels + 'チャンネルについて、一つのレコードに一番組の放送開始・終了を記録する。時刻の範囲と開始≦終了の関係は視聴データと同じである。'),
        p('視聴カウント表は' + channels + 'チャンネル×' + perDay.toLocaleString('en-US') + '枠の二次元。チャンネルと各時刻の視聴世帯数を集計する。'),
        p('番組の平均視聴率（％）＝各世帯が番組を視聴した枠数の合計 ÷（標本世帯数 × 番組の放送枠数）× 100。'),
      ]),
      page(43, [
        p('番組データの入力順に、チャンネル、番組開始時刻、番組終了時刻、平均視聴率（小数第1位までのパーセント表示）、番組名を印字する。'), code(display, 'text'),
        p('〔プログラム〕'), code(`DATA DIVISION.
FILE SECTION.
FD  VIEW-FILE.
01  VIEW-REC.
    05  VIEW-CHANNEL               PIC 99.
    05  VIEW-START-HHMM.
        10  VIEW-START-HH          PIC 99.
        10  VIEW-START-MM          PIC 99.
    05  VIEW-END-HHMM.
        10  VIEW-END-HH            PIC 99.
        10  VIEW-END-MM            PIC 99.
FD  PROGRAM-FILE.
01  PROGRAM-REC.
    05  PROG-CHANNEL               PIC 99.
    05  PROG-START-HHMM.
        10  PROG-START-HH          PIC 99.
        10  PROG-START-MM          PIC 99.
    05  PROG-END-HHMM.
        10  PROG-END-HH            PIC 99.
        10  PROG-END-MM            PIC 99.
    05  PROGRAM-TITLE              PIC X(50).
FD  OUT-FILE.
01  OUT-REC                        PIC X(100).
WORKING-STORAGE SECTION.
01  SAMPLE-SIZE                    PIC 9(4) VALUE ${sample}.
01  M                              PIC 9(4).
01  END-OF-FILE                    PIC X.
01  START-MMMM                     PIC 9(4).
01  END-MMMM                       PIC 9(4).
01  SUMMATION                      PIC 9(9) BINARY.
01  PROG-RATING                    PIC ZZ9.9.
01  VIEW-COUNT-TABLE.
    05  CHANNEL                    OCCURS ${channels}.
        10  COUNT-OF-MINUTE        OCCURS ${perDay} PIC 9(4) BINARY.`, 'cobol'),
      ]),
      page(44, [code(`01  O-DATA.
    05  FILLER                     PIC X(3) VALUE SPACE.
    05  O-PROG-CHANNEL             PIC 99.
    05  FILLER                     PIC X(3) VALUE SPACE.
    05  O-PROG-START-HHMM.
        10  O-PROG-START-HH        PIC 99.
        10  O-PROG-START-MM        PIC 99.
    05  FILLER                     PIC X(3) VALUE " - ".
    05  O-PROG-END-HHMM.
        10  O-PROG-END-HH          PIC 99.
        10  O-PROG-END-MM          PIC 99.
    05  FILLER                     PIC X(2) VALUE SPACE.
    05  O-PROG-RATING              PIC ZZ9.9.
    05  FILLER                     PIC X(6) VALUE SPACE.
    05  O-PROGRAM-TITLE             PIC X(50).
01  TITLE-LINE                     PIC X(100)
    VALUE "channel from - to    rating(%) program-title".
PROCEDURE DIVISION.
MAIN-PARAGRAPH.
    PERFORM EXPAND-VIEW-COUNT.
    PERFORM CALCULATE-RATING-AND-PRINT.
    STOP RUN.
EXPAND-VIEW-COUNT.
    [a].
    OPEN INPUT VIEW-FILE.
    MOVE "N" TO END-OF-FILE.
    PERFORM UNTIL END-OF-FILE = "Y"
        READ VIEW-FILE AT END
            MOVE "Y" TO END-OF-FILE
        NOT AT END
            PERFORM SET-VIEW-COUNT
        END-READ
    END-PERFORM.
    CLOSE VIEW-FILE.
CALCULATE-RATING-AND-PRINT.
    OPEN INPUT PROGRAM-FILE OUTPUT OUT-FILE.
    WRITE OUT-REC FROM TITLE-LINE AFTER ADVANCING 1.
    [b].
    PERFORM UNTIL END-OF-FILE = "Y"
        READ PROGRAM-FILE AT END
            MOVE "Y" TO END-OF-FILE
        NOT AT END
            PERFORM CALCULATE-RATING
            MOVE PROG-CHANNEL TO O-PROG-CHANNEL
            MOVE PROG-START-HHMM TO O-PROG-START-HHMM
            MOVE PROG-END-HHMM TO O-PROG-END-HHMM
            MOVE PROG-RATING TO O-PROG-RATING
            MOVE PROGRAM-TITLE TO O-PROGRAM-TITLE
            WRITE OUT-REC FROM O-DATA AFTER ADVANCING 1
        END-READ
    END-PERFORM.
    CLOSE PROGRAM-FILE OUT-FILE.`, 'cobol')]),
      page(45, [code(`SET-VIEW-COUNT.
    COMPUTE START-MMMM = ${position('VIEW', 'START')}.
    COMPUTE END-MMMM   = ${position('VIEW', 'END')}.
    PERFORM VARYING M FROM START-MMMM BY 1 UNTIL M > END-MMMM
        [c]
    END-PERFORM.
CALCULATE-RATING.
    COMPUTE START-MMMM = ${position('PROG', 'START')}.
    COMPUTE END-MMMM   = ${position('PROG', 'END')}.
    [d].
    PERFORM VARYING M FROM START-MMMM BY 1 UNTIL M > END-MMMM
        [e]
    END-PERFORM.
    COMPUTE PROG-RATING ROUNDED
        = [f].`, 'cobol'), p('設問　プログラム中の各空欄に入れる正しい答えを、解答群の中から選べ。')], [answer.init, answer.slots]),
      page(46, [], [answer.rate]),
    ];
    const first = (base + stride) / stride + 1;
    return { pages, explanation:
      'aで表の個々の数値項目をゼロに初期化する。集団項目へのMOVE ZEROは文字の0を詰める。表のBINARY項目へ数値の0を設定するにはINITIALIZEを使う。bで視聴ファイルを読み終えたフラグをNへ戻してから番組ファイルを読む。' +
      '時刻を00時00分からの分数に換算し、' + stride + 'で割ってから1を足すので、00時00分は添字1、' + hhmm(last) + 'は添字' + perDay + 'になる。' +
      '図ではチャンネル' + two(stations[0]) + 'を添字' + first + '、' + (first + 1) + '、' + (first + 4) + 'で数える。cは視聴レコードのチャンネルとその添字の数に1を加える。' +
      'dで番組ごとに合計をゼロへ戻し、eで番組チャンネルの各枠の世帯数を足し合わせる。例えば3枠に3、0、2世帯なら合計は5世帯枠である。' +
      'fの分母は両端を含む放送枠数（終了添字−開始添字＋1）×' + sample +
      '世帯。1枠だけの放送も分母が正となる。100倍して、ROUNDEDでパーセントの小数第1位に丸める。',
    };
  }, { answerVariation: 'fixed' });
