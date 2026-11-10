import { code, p } from './definition';
import { heading, selectionInstruction } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2012-spring-pm-09-13-support';

const occupied = [
  [4, 5, 7, 8, 10, 13, 15], [3, 4, 7, 8, 10, 15], [3, 7, 8, 10, 13, 15], [3, 4, 7, 8, 13, 15], [3, 4, 7, 8, 10],
];
const scheduleCases = [
  { start: 510, slots: 19, slotNum: 2, busy: occupied },
  { start: 480, slots: 20, slotNum: 3, busy: occupied.map((row, n) => n % 2 ? row : [...row, 18]) },
  { start: 540, slots: 18, slotNum: 2, busy: occupied.map((row, n) => n % 2 ? [...row, 11] : row) },
  { start: 450, slots: 21, slotNum: 3, busy: occupied.map((row, n) => [...row.filter(value => value !== 13), ...(n === 0 ? [2, 19] : [])]) },
];
function clock(start: number) {
  return Math.floor(start / 60) + ':' + String(start % 60).padStart(2, '0');
}
function clockRange(start: number, slots: number) {
  return clock(start) + '〜' + clock(start + slots * 30);
}
function listedSlots(index: number) {
  const { slots, slotNum, busy } = scheduleCases[index];
  const windows: [number, number][] = [];
  let length = 0;
  for (let position = 0; position <= slots; position++) {
    if (position === slots || busy.some(row => row.includes(position))) {
      if (length >= slotNum) windows.push([position - length, length]);
      length = 0;
    } else length++;
  }
  return windows;
}
const schedule = languageFigure(9, 'slot-array', '図1 スケジュール表', index => {
  const { start, slots } = scheduleCases[index];
  const label = (n: number) => clockRange(start + 30 * n, 1) + 'の予定';
  return { kind: 'grids', tables: [{
    headers: ['時間帯番号', '0', '1', '…', String(slots - 2), String(slots - 1)],
    rows: [['予定', label(0), label(1), '…', label(slots - 2), label(slots - 1)]],
  }] };
});
const example = languageFigure(9, 'employee-schedules', '図2 出席社員全員のスケジュールの例', index => {
  const { start, slots, busy } = scheduleCases[index];
  return { kind: 'grids', tables: [[0, 10], [10, slots]].map(([from, to]) => {
    const indices = Array.from({ length: to - from }, (_, i) => i + from);
    return {
      headers: ['時刻', ...indices.map(n => clock(start + n * 30)), clock(start + to * 30)],
      rows: [
        ['時間帯番号', ...indices.map(String), ''],
        ...busy.map((row, i) => ['社員' + 'ABCDE'[i], ...indices.map(n => row.includes(n) ? '×' : '○'), '']),
      ],
    };
  }), note: '「○」は予定が入っていないことを表し，「×」は予定が入っていることを表す。' };
});
const examplesAnswer = languageFigure(9, 'free-slots', '表1 可能時間帯の一覧の例', index => ({
  kind: 'grids', tables: [{ headers: ['可能時間帯', '開始時間帯番号', '時間帯数'],
    rows: listedSlots(index).map(([start, length]) => [clockRange(scheduleCases[index].start + start * 30, length), String(start), String(length)]) }],
}));
export const q9Figures = [schedule, example, examplesAnswer];

const slotType = `typedef struct {
    int s_start;     /* 開始時間帯番号 */
    int s_num;       /* 時間帯数 */
} SLOT;`;

export const q9 = createLanguageDefinition(9, '会議を設定できる時間帯の検索', '通常勤務の開始時刻・時間帯数・社員ごとの予定と会議時間',
  'abcdef', '設問1 a=エ，b=イ，c=ア，d=ウ／設問2 e=ア，f=オ',
  '原冊子p.40〜46。30分の時間帯・ゼロ始まりの番号・連続可能帯・終端−1、必須者と順位付き任意者の処理を維持。通常勤務の開始、時間帯数、会議時間、予定を変える。空欄a〜fの処理が固定なのは、同じCコード構成で変わるのが時間帯と予定であり、正答の初期化・境界・停止判定は不変なため。', i => {
    const { start, slots, slotNum } = scheduleCases[i];
    const header = `#define NUM_DAY ${slots}     /* 1日の時間帯数 */

${slotType}`;
    return { pages: [
      page(40, [
        p(selectionInstruction), p('問9 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        heading('〔プログラム1の説明〕'),
        p(`S社では，通常勤務時間帯（${clockRange(start, slots)}）中の各社員の予定を管理している。関数 allmem_free_slot は，通常勤務時間帯に会議を計画する場合に，出席して欲しい社員（以下，出席社員という）全員の予定が入っていない時間帯を調べるプログラムである。`),
        p('（1）S社では，各社員の予定を30分単位の時間帯ごとに図1に示すスケジュール表で管理している。'),
        schedule.block(i),
        p(`① スケジュール表は大きさ${slots}の整数型配列で，各要素の添字の値は時間帯番号に対応している。`),
        p('② スケジュール表の各要素には，予定が入っている場合には0以外の値が，予定が入っていない場合には0が入る。'),
        p('（2）会議時間は30分以上であり，開始時刻と終了時刻は時間帯の区切りと一致する。'),
        p('（3）関数 allmem_free_slot の引数は次のとおりである。ここで，引数の値に誤りはないものとする。'),
        code(`num       出席社員数
time_tbl  出席社員全員のスケジュール（スケジュール表へのポインタの配列）
slot_num  会議時間（30分単位の時間帯数）
free      会議開催の候補時間帯（SLOT型の配列）`, 'text'),
      ]),
      page(41, [
        p('（4）構造体を使ったSLOT型の定義は次のとおりである。'), code(slotType, 'c'),
        p(`（5）候補時間帯 free には，出席社員全員の予定が入っていない，会議時間以上の連続する時間帯（以下，可能時間帯という）を全て格納する。最後に格納した要素の次の要素の開始時間帯番号には，−1を格納する。例えば，出席社員5名（社員A〜E）の予定が図2のとおりであった場合，会議時間が${slotNum === 2 ? '1時間' : '1時間30分'}（slot_num = ${slotNum}）のとき，可能時間帯の一覧は表1になる。`),
        example.block(i), examplesAnswer.block(i),
      ]),
      page(42, [
        p('（6）関数 allmem_free_slot で使用している関数 search_free_slot の仕様は次のとおりである。'),
        p('機能：スケジュール表から，予定が入っていない，時間帯数以上の連続した時間帯を全て探し出し，空き時間帯に格納する。最後に格納した空き時間帯の要素の次の要素の開始時間帯番号には，−1を格納する。'),
        code(`引数：sch       スケジュール表
      slot_num  時間帯数
      free      空き時間帯（SLOT型の配列）`, 'text'),
        heading('〔プログラム1〕'),
        code(`${header}

void allmem_free_slot(int, int *[], int, SLOT []);
void search_free_slot(int [], int, SLOT []);

void allmem_free_slot(int num, int *time_tbl[], int slot_num,
                      SLOT free[]) {
    int sch[NUM_DAY], i, j;

    for (i = 0; i < NUM_DAY; i++) {
        sch[i] = ［a］;
        for (j = 1; j < num; j++) {
            if (time_tbl[j][i] != 0) {
                sch[i] = 1;
            }
        }
    }
    search_free_slot(sch, slot_num, free);
}

void search_free_slot(int sch[], int slot_num, SLOT free[]) {
    int cnt = 0, free_num = 0, i;

    for (i = 0; i < NUM_DAY; i++) {
        if (sch[i] != 0) {
            if (cnt >= slot_num) {
                free[free_num].s_start = ［b］;
                free[free_num].s_num   = cnt;
                free_num++;
            }
            ［c］;`, 'c'),
      ]),
      page(43, [
        code(`        } else {
            cnt++;
        }
    }
    if (［d］) {
        free[free_num].s_start = NUM_DAY - cnt;
        free[free_num].s_num   = cnt;
        free_num++;
    }
    free[free_num].s_start = -1;
}`, 'c'),
        p('設問1 プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      ], [
        bank(1, 'a', ['0', '1', 'time_tbl[0][0]', 'time_tbl[0][i]'], 'エ', 'c'),
        bank(1, 'b', ['i', 'i - cnt', 'i - cnt + 1', 'i - cnt - 1', 'NUM_DAY - cnt'], 'イ', 'c'),
        bank(1, 'c', ['cnt = 0', 'cnt++', 'cnt--', 'free_num = 0', 'free_num++', 'free_num--'], 'ア', 'c'),
        bank(1, 'd', ['cnt == 0', 'cnt > 0', 'cnt >= slot_num', 'cnt < slot_num', 'free_num == 0', 'free_num > 0'], 'ウ', 'c'),
      ]),
      page(44, [
        p('設問2 出席社員が増え，出席社員全員での会議の計画ができない（可能時間帯がない）場合がでてきた。そこで，出席社員を出席が必須の社員（以下，必須出席社員という）とそれ以外の社員（以下，任意出席社員という）に分け，必須出席社員全員が出席可能な時間帯で会議の計画をすることにした。さらに，任意出席社員について順位付けを行い，順位の高い方から最多の社員が出席可能な時間帯に絞込みを行うことにした。この条件で会議が計画できる時間帯を調べるプログラムを作成した。作成したプログラム中の空欄に入れる正しい答えを，解答群の中から選べ。ここで，［a］には，設問1の正しい答えが入っているものとする。'),
        heading('〔プログラム2の説明〕'),
        p('（1）関数 maxmem_free_slot の引数は次のとおりである。ここで，引数の値に誤りはないものとする。'),
        code(`num       出席社員数
must_num  必須出席社員数
time_tbl  出席社員全員のスケジュール（スケジュール表へのポインタの配列）
slot_num  会議時間（30分単位の時間帯数）
free      会議開催の候補時間帯（SLOT型の配列）`, 'text'),
        p('① 必須出席社員のスケジュール表へのポインタは，time_tblの先頭から人数分が格納されている。'),
        p('② 任意出席社員のスケジュール表へのポインタは，time_tblの必須出席社員のスケジュールに続けて，順位の高い方から順に格納されている。'),
        p('（2）候補時間帯 free には，必須出席社員全員が出席可能な時間帯の中で，任意出席社員の順位の高い方から最多の社員が出席可能な時間帯を全て格納する。最後に格納した要素の次の要素の開始時間帯番号には，−1を格納する。'),
      ]),
      page(45, [
        heading('〔プログラム2〕'),
        code(`${header}

void maxmem_free_slot(int, int, int *[], int, SLOT []);
void search_free_slot(int [], int, SLOT []);

void maxmem_free_slot(int num, int must_num, int *time_tbl[],
                      int slot_num, SLOT free[]) {
    int sch[NUM_DAY], i, j, k;
    SLOT wk_free[2][NUM_DAY + 1];

    /* 必須出席社員全員が出席可能な時間帯を探し出す */
    for (i = 0; i < NUM_DAY; i++) {
        sch[i] = ［a］;
        for (［e］; j++) {
            if (time_tbl[j][i] != 0) {
                sch[i] = 1;
            }
        }
    }
    search_free_slot(sch, slot_num, wk_free[0]);

    /* 任意出席社員の順位の高い方から
       最多の社員が出席可能な時間帯に絞り込む */
    for (j = must_num; j < num; j++) {
        for (i = 0; i < NUM_DAY; i++) {
            if (time_tbl[j][i] != 0) {
                sch[i] = 1;
            }
        }
        search_free_slot(sch, slot_num, wk_free[1]);
        if (［f］) {
            break;
        }
        k = 0;
        do {
            wk_free[0][k] = wk_free[1][k];
        } while (wk_free[1][k++].s_start != -1);
    }

    /* 候補時間帯を格納する */
    k = 0;
    do {
        free[k] = wk_free[0][k];`, 'c'),
      ]),
      page(46, [
        code(`    } while (wk_free[0][k++].s_start != -1);
}`, 'c'),
      ], [
        bank(2, 'e', ['j = 1; j < must_num', 'j = 1; j < num', 'j = 1; j < num - must_num', 'j = must_num; j < num', 'j = num - must_num; j < num'], 'ア', 'c'),
        bank(2, 'f', ['wk_free[1][0].s_num == 0', 'wk_free[1][0].s_num == -1', 'wk_free[1][0].s_num > slot_num', 'wk_free[1][0].s_start == 0', 'wk_free[1][0].s_start == -1', 'wk_free[1][0].s_start > slot_num'], 'オ', 'c'),
      ]),
    ], explanation: `aは社員0のその時間帯の予定から集計を始める。予定がある添字iに達したとき，直前までcnt個続いた空きの開始はi−cntなのでbはi - cnt。予定を境界にcでcntを0へ戻し，勤務時間末尾ではdでcntがslot_num以上のときだけ結果に加える。表1には時間帯番号と長さの組が${listedSlots(i).map(([position, length]) => `（${position}，${length}）`).join('、')}と入る。プログラム2のeは最初の必須出席社員以外の必須者のみを追加する。fは最初の結果のs_startが−1なら候補がなくなったことを示すので，直前の候補を残して任意者の追加を打ち切る。` };
  }, { answerVariation: 'fixed' });
