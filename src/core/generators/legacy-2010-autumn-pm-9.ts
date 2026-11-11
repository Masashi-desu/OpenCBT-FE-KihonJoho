import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2010-autumn-pm-09-13-support';

const routes = [
  { stopCount: 10, busCount: 5, departing: 5 }, { stopCount: 9, busCount: 4, departing: 4 },
  { stopCount: 11, busCount: 6, departing: 6 }, { stopCount: 12, busCount: 7, departing: 7 },
] as const;
const routeFigure = languageFigure(9, 'route', '図1 路線表routeのデータ', index => ({ kind: 'route', stopCount: routes[index].stopCount }));
const positionFigure = languageFigure(9, 'position-example', '図2 変数busstop，preceding及びsucceedingの例', index => {
  const { departing } = routes[index];
  return { kind: 'bus-positions', departing, preceding: departing + 1, succeeding: departing - 2 };
});
const busStop = `typedef struct {
    int  std_time;   /* 前のバス停からこのバス停までの
                       標準所要時間（分） */
    int  wait_time;  /* 到着待ち時間（分） */
} BUSSTOP;`;
const bus = `typedef struct {
    int  id;         /* バスの車体番号 */
    int  cur_pos;    /* バスの走行位置 */
} BUS;`;
const programStart = (stopCount: number, busCount: number) => ` 1  #define STPNUM ${stopCount}       /* バス停の個数 */
 2  #define BUSNUM  ${busCount}       /* バスの台数 */

 3  typedef struct {
 4      int  std_time;      /* 前のバス停からこのバス停までの
 5                             標準所要時間（分） */
 6      int  wait_time;     /* 到着待ち時間（分） */
 7  } BUSSTOP;

 8  typedef struct {
 9      int  id;            /* バスの車体番号 */
10      int  cur_pos;       /* バスの走行位置 */
11  } BUS;

12  void update_wait_time(int, int, BUSSTOP[STPNUM], BUS[BUSNUM]);

13  void update_wait_time(int bus_id, int busstop,
14                       BUSSTOP route[STPNUM], BUS bus[BUSNUM]) {
15      int preceding = STPNUM - 1, succeeding = -1, i, j;`;
const programEnd = `16      /* バスの走行位置，succeedingとprecedingの更新 */
17      for (j = 0; j < BUSNUM; j++) {
18          if (［a］) {
19              bus[j].cur_pos = busstop;
20          } else {
21              if (bus[j].cur_pos < busstop) {
22                  if (succeeding < bus[j].cur_pos) {
23                      succeeding = ［b］;
24                  }
25              } else {
26                  if (preceding > bus[j].cur_pos) {
27                      preceding = ［b］;
28                  }
29              }
30          }
31      }

32      /* このバス停の到着待ち時間の計算 */
33      if (［c］) {
34          route[busstop].wait_time = 0;
35      } else {
36          route[busstop].wait_time = route[busstop].std_time
37                                  + route[busstop - 1].wait_time;
38      }

39      /* 次のバス停からprecedingが示すバス停までの到着待ち時間の計算 */
40      for (i = busstop + 1; i <= preceding; i++) {
41          route[i].wait_time = route[i].std_time;
42          if (i != busstop + 1) {
43              route[i].wait_time ［d］;
44          }
45      }
46  }`;
const addedStructs = `typedef struct {
    int  std_time;    /* 前のバス停からこのバス停までの
                        標準所要時間（分） */
    int  wait_time;   /* 到着待ち時間（分） */
    int  delay_time;  /* 次に到着するバスの運行遅延時間（分） */
} BUSSTOP;

typedef struct {
    int  id;         /* バスの車体番号 */
    int  cur_pos;    /* バスの走行位置 */
    int  cur_delay;  /* バスの運行遅延時間（分） */
} BUS;

void update_wait_time(int, int, int, BUSSTOP[STPNUM], BUS[BUSNUM]);

void update_wait_time(int bus_id, int busstop, int act_time,
                      BUSSTOP route[STPNUM], BUS bus[BUSNUM]) {`;
const programChange = languageFigure(9, 'program-change', '表 プログラムの変更内容', () => ({
  kind: 'tables',
  tables: [{ headers: ['処置', '変更内容'], rows: [
    ['行番号3〜14を\n変更', addedStructs],
    ['行番号15と16の\n間に追加', '    int delay_preceding, delay_succeeding = 0;'],
    ['行番号19と20の\n間に追加', '    bus[j].cur_delay ［e］;\n    delay_preceding ［f］;'],
    ['行番号23と24の\n間に追加', '    delay_succeeding ［f］;'],
    ['行番号38と39の\n間に追加', '    route[busstop].delay_time = delay_succeeding;'],
    ['行番号44と45の\n間に追加', '    route[i].delay_time = delay_preceding;'],
  ] }],
}));
export const autumn2010Pm9Figures = [routeFigure, positionFigure, programChange];

export const q9 = createLanguageDefinition(9, 'C：バスの到着待ち時間と遅延', '停留所数・運行車両数・発車位置', 'abcdef',
  '設問1 a=ア、b=ウ、c=エ、d=イ／設問2 e=エ、f=イ',
  '原39〜45頁・6欄34固有択34参照。0始点、終点−1までで発車、終点で到着、未発車−1、車体番号と添字の区別、同時イベントは添字順、同一区間に複数台なし、乗降時間0、定刻前発車なし、分単位、行番号1〜46と変更表の挿入位置を維持。停留所数・台数・発車例を同期変更。一般式を埋める各欄の正答内容は固定。全択は到着元の直接検索と区間時間・累積遅延の独立計算で検査。',
  index => {
    const { stopCount, busCount, departing } = routes[index];
    const last = stopCount - 1;
    return {
      pages: [
        page(39, [p('次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。'),
          p('次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p(`〔プログラムの説明〕\n${busCount}台のバスが走行する路線上の${stopCount}か所の停留所（以下，バス停という）のそれぞれに取り付けられた表示装置に，バスの運行時間中，次のバスが到着するまでの待ち時間（以下，到着待ち時間という）を分単位で表示するシステムがある。関数update_wait_timeは，このシステムにおいて，各バス停に表示する到着待ち時間を計算するプログラムである。表示する到着待ち時間は，関数update_wait_timeが実行されたときに更新される。`),
          p('（1）関数update_wait_timeの引数は，次のとおりである。ここで，引数の値に誤りはないものとする。'),
          code('bus_id    バスの車体番号\nbusstop   バス停の番号\nroute     路線表（構造体BUSSTOPの配列）\nbus       路線上を走行するバスの一覧（構造体BUSの配列）', 'text'),
          p('（2）構造体BUSSTOPの構造は，次のとおりである。'), code(busStop, 'c'),
          p('（3）構造体BUSの構造は，次のとおりである。'), code(bus, 'c')]),
        page(40, [p(`（4）路線表routeは，バス停の番号（以下，バス停番号という）0〜${last}を添字とする配列である。routeには，図1のようにデータを格納する。`),
          routeFigure.block(index),
          p(`① route[i].std_time（i＝1，2，…，${last}）は，前のバス停（i−1）からこのバス停iまでの標準所要時間である。バス停0におけるroute[0].std_timeの値は0とする。\n② 各バス停iの到着待ち時間route[i].wait_time（i＝1，2，…，${last}）は，次に到着するバスが最後に発車したバス停aからこのバス停iまでの標準所要時間route[k].std_time（k＝a＋1，…，i）の合計である。乗客の乗降にかかる時間は0とする。バス停0におけるroute[0].wait_timeの値は0とする。次に到着するバスがバス停0を発車していないとき，そのバス停iにおける到着待ち時間route[i].wait_timeには0を格納する。`),
          p(`（5）バスの走行位置bus[j].cur_pos（j＝0，1，…，${busCount - 1}）には，走行中の区間番号を格納する。あるバス停から次のバス停までの区間に対する区間番号には，区間の始まりとなるバス停番号を割り当てる。バス停0を発車していないバスの走行位置bus[j].cur_posには−1を格納する。また，バス停${last}に到着したバスの走行位置bus[j].cur_posには${last}を格納する。`),
          p(`（6）プログラム中で使われる変数precedingとsucceedingの意味は次のとおりである。\npreceding　busstopが示すバス停を直前に発車したバスが走行中の区間番号を格納する。busstopが示すバス停からバス停${last}までの区間に走行中のバスがない場合は${last}とする。\nsucceeding　busstopが示すバス停に次に到着するバスが走行中の区間番号を格納する。バス停0からbusstopが示すバス停までの区間に走行中のバスがない場合は−1とする。`),
          p(`バス停${departing}をバスBが発車するとき，バス停${departing}を直前に発車したバスAが区間${departing + 1}を走行し，次にバス停${departing}に到着するバスCが区間${departing - 2}を走行しているときの例を，図2に示す。`)]),
        page(41, [positionFigure.block(index),
          p(`（7）関数update_wait_timeは，バスがバス停0〜${last - 1}を発車するとき又はバス停${last}に到着したときに呼び出され，bus_idで識別されるバスの走行位置を更新し，busstopが示すバス停からprecedingが示す区間の始まりとなるバス停までの，各バス停に表示する到着待ち時間route[i].wait_time（i＝busstop，…，preceding）を計算する。\nなお，複数台のバスがバス停0〜${last - 1}の異なるバス停を同時に発車する場合，又はあるバスがバス停${last}に到着したときに別のバスがバス停0〜${last - 1}を発車する場合には，関数update_wait_timeは，バスの一覧busの添字の昇順に1台分ずつ実行される。\n（8）一つの区間を複数台のバスが同時に走ることはない。`),
          p('〔プログラム〕（行番号）'), code(programStart(stopCount, busCount), 'c')]),
        page(42, [code(programEnd, 'c'), p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['bus_id == bus[j].id', 'bus_id != bus[j].id', 'bus_id == j', 'bus_id != j'], 'ア', 'c'),
          bank(1, 'b', ['-1', 'busstop', 'bus[j].cur_pos', 'bus[j].cur_pos + 1', 'bus[j].cur_pos - 1', 'j'], 'ウ', 'c'),
        ]),
        page(43, [p('設問2　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('サービス向上のため，路線上のそれぞれのバス停に取り付けられた表示装置に，到着待ち時間に加えて，そのバスの運行遅延時間を分単位で表示することにした。そのために，関数update_wait_timeに，各バス停に表示する運行遅延時間を計算する処理を追加する。ここで，プログラム中の［a］〜［d］には，正しい答えが入っているものとする。'),
          p(`（1）バスの運行遅延時間は，バス停0から最後に発車したバス停までの標準所要時間の合計と実際にかかった時間の合計の差である。\n（2）関数update_wait_timeの引数に，前のバス停からの実際にかかった時間（分）act_timeを追加する。ここで，引数の値に誤りはないものとする。\n（3）構造体BUSSTOPの要素に，次に到着するバスの運行遅延時間（分）delay_timeを追加する。\n（4）構造体BUSの要素に，バスの運行遅延時間（分）cur_delayを追加する。\n（5）バスが定刻よりも早くバス停0〜${last - 1}を発車することはない。\n（6）処理の追加に対応するために，プログラムを表のとおりに変更する。`)], [
            bank(1, 'c', ['preceding == -1', 'preceding == STPNUM - 1', 'preceding != -1', 'succeeding == -1', 'succeeding == 0', 'succeeding != 0'], 'エ', 'c'),
            bank(1, 'd', ['+= route[i - 1].std_time', '+= route[i - 1].wait_time', '+= route[i].std_time', '= route[i - 1].std_time', '= route[i - 1].wait_time', '= route[i].std_time'], 'イ', 'c'),
          ], [-1, -1]),
        page(44, [programChange.block(index)], [
          bank(2, 'e', ['= act_time - route[busstop].std_time', '= bus[j - 1].cur_delay', '= route[busstop].delay_time', '+= act_time - route[busstop].std_time', '+= bus[j - 1].cur_delay', '+= route[busstop].delay_time'], 'エ', 'c'),
        ]),
        page(45, [], [bank(2, 'f', ['= act_time', '= bus[j].cur_delay', '= route[busstop].delay_time', '+= act_time', '+= bus[j].cur_delay', '+= route[busstop].delay_time'], 'イ', 'c')]),
      ],
      explanation: `aは車体番号とbus[j].idを照合する。区間番号を添字と混同しない。bはbus[j].cur_posで，発車停留所より手前の最大区間と先の最小区間を見つける。図2ならbusstop=${departing}，succeeding=${departing - 2}，preceding=${departing + 1}。cはsucceeding == -1。後続車がまだ走行していないときは発車停留所の待ち時間を0にする。dは前の停留所の累積待ち時間を加える。eは今回の実時間−標準時間を対象車の累積遅延へ加算する。fは対象車又は後続車の累積遅延をdelay_preceding又はdelay_succeedingへ代入する。以前の候補車の遅延を加算する必要はない。`,
    };
  }, { answerVariation: 'fixed' });
