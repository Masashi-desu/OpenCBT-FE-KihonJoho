import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-autumn-pm-09-13-support';
import { autumn2009PmPageAssetId, autumn2009PmReference } from './legacy-2009-autumn-pm-materials';

const pagesForSheet = [72, 73, 74];
const policies = [
  { start: 10, end: 17, lunch: 12, limit: 5 },
  { start: 9, end: 16, lunch: 11, limit: 4 },
  { start: 11, end: 18, lunch: 13, limit: 6 },
  { start: 8, end: 15, lunch: 12, limit: 3 },
];
const pad = (value: number) => String(value).padStart(2, '0');
const hhmm = (minutes: number) => Math.floor(minutes / 60) + ':' + pad(minutes % 60);
const sept = (day: number) => '2009-09-' + pad(day);
const nov = (day: number) => '2009-11-' + pad(day);

const originalAttendance = [
  ['4', sept(1), '1', '10:00', '17:15', '6:15', '0', '0'],
  ['5', sept(2), '0', '', '', '0:00', '0', '0'],
  ['6', sept(3), '1', '10:00', '12:30', '2:00', '0', '1'],
  ['7', sept(4), '1', '', '', '0:00', '0', '3'],
  ['8', sept(5), '1', '12:15', '17:00', '4:00', '1', '0'],
  Array<string>(8).fill('⋮'),
  ['33', sept(30), '1', '9:30', '17:00', '6:30', '0', '0'],
  ['34', sept(31), '0', '', '', '0:00', '0', '0'],
  ['35', '', '', '', '合計', '106:20', '', '6'],
];
type Shift = { scheduled: number; arrived: number | null; left: number | null; reason: number };
function attendanceInputs(index: number): Shift[] {
  const { start, end, lunch } = policies[index];
  const begin = start * 60, finish = end * 60;
  const inShift = (arrived: number, left: number, reason = 0) => ({ scheduled: 1, arrived, left, reason });
  const off = { scheduled: 0, arrived: null, left: null, reason: 0 };
  const absent = { ...off, scheduled: 1 };
  const unshown = Array.from({ length: 24 }, (_, slot) => {
    const day = slot + 6;
    if (day % 4 === 0) return off;
    if (day % 11 === 0) return absent;
    return inShift(begin + (day % 5) * 5, finish - (day % 3) * 15, day % 7 === 0 ? 1 : 0);
  });
  return [
    inShift(begin, finish + 15), off, inShift(begin, lunch * 60 + 30), absent,
    inShift(lunch * 60 + 15, finish, 1), ...unshown, inShift(begin - 30, finish), off,
  ];
}
function attendanceRows(index: number) {
  if (index === 0) return originalAttendance;
  const { start, end, lunch } = policies[index];
  let hoursTotal = 0, penaltyTotal = 0;
  const rows = attendanceInputs(index).map(({ scheduled, arrived, left, reason }, day) => {
    const begin = arrived ?? 0, finish = left ?? 0;
    const lunchBegin = lunch * 60, lunchEnd = lunchBegin + 60;
    const worked = Math.min(finish, lunchBegin) - Math.min(begin, lunchBegin)
      + Math.max(finish, lunchEnd) - Math.max(begin, lunchEnd);
    const penalty = reason !== 0 || !scheduled ? 0 : arrived === null ? 3 : begin > start * 60 || finish < end * 60 ? 1 : 0;
    hoursTotal += worked;
    penaltyTotal += penalty;
    return [String(day + 4), sept(day + 1), String(scheduled), arrived === null ? '' : hhmm(arrived),
      left === null ? '' : hhmm(left), hhmm(worked), String(reason), String(penalty)];
  });
  return [...rows.slice(0, 5), Array<string>(8).fill('⋮'), ...rows.slice(-2),
    ['35', '', '', '', '合計', hhmm(hoursTotal), '', String(penaltyTotal)]];
}
const attendance = languageFigure(13, 'attendance-sheet', '図1 ワークシート“勤怠管理”の例', index => ({
  kind: 'tables', tables: [{
    headers: ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    rows: [
      ['1', 'ID', '0004', '', '氏名', '情報太郎', '', ''], ['2', '', '', '', '', '', '', ''],
      ['3', '日付', '出社予定', '出社時刻', '退社時刻', '勤務時間', '勤怠理由', 'ペナルティ'],
      ...attendanceRows(index),
    ],
  }],
}));

const people = Array.from({ length: 15 }, (_, i) => i);
const personColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', '…', 'P'];
const personIds = ['0001', '0002', '0003', '0004', '0005', '0006', '0007', '…', '0015'];
const showPeople = (data: readonly number[]) => [...data.slice(0, 7).map(String), '…', String(data[14])];
const sparse = (visible: number[]) => [...visible.slice(0, 7).map(String), '…', String(visible[7])];
const shownDays = [1, 2, 3, 30, 31];
const originalSurvey = [
  [1, 0, 0, 1, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 0],
  [0, 0, 1, 0, 1, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const originalAssigned = [
  [1, 0, 0, 0, 1, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 0, 1, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const penalties = [
  [],
  [2, 0, 3, 1, 0, 0, 1, 4, 0, 3, 1, 2, 0, 2, 0],
  [0, 1, 2, 1, 2, 3, 1, 0, 3, 1, 4, 3, 2, 0, 0],
  [0, 1, 0, 3, 1, 2, 3, 0, 4, 2, 4, 0, 5, 0, 1],
];
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const sortRank = (values: readonly number[], target: number) => 1 + values.filter(value => value < target).length;
function assignment(index: number) {
  const priorPenalty = penalties[index];
  const priorRank = priorPenalty.map(value => sortRank(priorPenalty, value));
  const availability = Array.from({ length: 31 }, (_, day) => people.map(person => day === 30
    ? 0 : Number(((day * 11 + person * 7 + index * 3 + day * (person + 1)) % 17) < 8 + (day % 4))));
  const totals = people.map(() => 0);
  const assigned = availability.map(day => {
    const scores = people.map(person => (((1 - day[person]) * 100 + priorRank[person]) * 100
      + totals[person]) * 100 + person + 1);
    const decisions = people.map(person => Number(day[person] === 1 && sortRank(scores, scores[person]) <= policies[index].limit));
    decisions.forEach((assigned, person) => { totals[person] += assigned; });
    return decisions;
  });
  return { priorPenalty, priorRank, availability, assigned, totals };
}
function assignmentRows(index: number, result: boolean) {
  const generated = index === 0 ? undefined : assignment(index);
  const data = generated
    ? (result ? generated.assigned : generated.availability)
    : (result ? originalAssigned : originalSurvey);
  const dayRows = shownDays.map((day, i) => {
    const row = generated ? data[day - 1] : data[i];
    const dailyTotal = generated ? sum(row) : [5, 4, 5, 5, 0][i];
    return [String(day + 2), nov(day), ...(generated ? showPeople(row) : sparse(row)), ...(result ? [String(dailyTotal)] : [])];
  });
  dayRows.splice(3, 0, ['⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '…', '⋮', ...(result ? ['⋮'] : [])]);
  const headers = ['', 'A', ...personColumns, ...(result ? ['Q'] : [])];
  const rows = [
    ['1', '', 'ID', '', '', '', '', '', '', '', '', ...(result ? [''] : [])],
    ['2', '日付', ...personIds, ...(result ? ['合計'] : [])], ...dayRows,
  ];
  if (result) rows.push(
    ['34', '合計', ...(generated ? showPeople(generated.totals) : sparse([21, 6, 8, 1, 16, 14, 9, 17])), ''],
    Array<string>(headers.length).fill('').map((value, i) => i === 0 ? '35' : value),
    ['36', '経験順位', ...showPeople(people.map(i => i + 1)), ''],
    ['37', '先々月ペナルティ', ...(generated ? showPeople(generated.priorPenalty) : sparse([0, 3, 2, 6, 0, 0, 1, 0])), ''],
    ['38', '先々月ペナルティ順位', ...(generated ? showPeople(generated.priorRank) : sparse([1, 12, 9, 14, 1, 1, 7, 1])), ''],
  );
  return { headers, rows, merges: [{ row: 0, column: 2, rowSpan: 1, colSpan: 9 }] };
}
const survey = languageFigure(13, 'availability-sheet', '図2 ワークシート“勤務可能調査”の例', index => ({
  kind: 'tables', tables: [assignmentRows(index, false)],
}));
const assigned = languageFigure(13, 'assignment-sheet', '図3 ワークシート“出勤割当表”の例', index => ({
  kind: 'tables', tables: [assignmentRows(index, true)],
}));
const codeExample = languageFigure(13, 'rank-digits', '評価値の7けたの内訳', index => ({
  kind: 'digits', digits: ['1120713', '0090312', '1070514', '0110810'][index],
}));
const rankFunction = languageFigure(13, 'rank-function', '表 ワークシート“出勤割当表”で用いる関数', () => ({
  kind: 'tables', tables: [{
    headers: ['書式', '説明'],
    rows: [['順位(照合値,照合範囲,順序)', '順序に0又は1を指定したとき，照合範囲をそれぞれ昇順又は降順に整列し，照合値の順位を返す。照合範囲の中に同じ値が複数個ある場合は同順位とし，次の順位は同順位の個数を加えた値となる。']],
  }],
}));
export const q13Figures = [attendance, survey, assigned, codeExample, rankFunction];

const ss = (text: string) => code(text, 'text');
export const q13 = createLanguageDefinition(13, '表計算：勤怠集計と優先順位による出勤割当て',
  '始業・終業・昼休みの時刻、各日の上限人数', 'abcdefgh', '設問1 aオ bイ cイ／設問2 dウ eイ fキ gイ hキ（g・h順不同）',
  '勤怠、勤務可能調査、出勤割当の疎な紙面を保ち、勤務時刻・昼休み・上限人数と式を変える。日単位の割当て・先々月順位・前日までの回数・経験の順は固定する。g／hは別欄の順不同。原図の省略部分は復元せず，生成版では別の入力で全月を計算する。',
  (index, original) => {
    const { start, end, lunch, limit } = policies[index];
    const resume = lunch + 1;
    const onTime = `論理積(C4≦(${start}/24),D4≧(${end}/24))`;
    const violation = `論理和(C4>(${start}/24),D4<(${end}/24))`;
    return {
      unordered: 'gh',
      pages: [
        page(59, [
          p('問13 次の表計算及びワークシートの説明を読んで，設問1，2に答えよ。'),
          p('〔表計算の説明〕'),
          p('ある企業では，アルバイトの勤務を管理するための勤怠管理表と出勤割当表の作成を手作業で行っていたが，これを表計算ソフトで行うことにした。'),
          p('〔ワークシート：勤怠管理〕'),
          p('（1）表計算ソフトのワークシート“勤怠管理”を作成した。その例を図1に示す。'), attendance.block(index),
          p('（2）時刻及び時間の表記はh:mm，hh:mm又はhhh:mmで表示されるが，内部では24時間を1とする実数値で記録されている。例えば，10:30は10.5/24＝0.4375，18:00は18/24＝0.75である。計算にはこの数値を利用する。'),
          p('（3）図1中の各項目の説明は，次のとおりである。'),
          p('ID，氏名：アルバイトの識別番号と氏名である。'),
          p('日付：1か月分の日付がyyyy-mm-ddの形式で表示される。日数30日以下の月でも31日まで列挙する。'),
          p('出社予定：出社予定日には1を，出社予定でない日や2009-09-31のように存在しない日には0を格納する。'),
        ]),
        page(60, [
          p(`出社時刻：始業時刻は${start}時である。${start}時に遅れた場合は遅刻扱いとなる。出社しなかった日，又は存在しない日のセルは空白とする。`),
          p(`退社時刻：終業時刻は${end}時である。${end}時前の退社は早退扱いとなる。出社しなかった日，又は存在しない日のセルは空白とする。`),
          p(`勤務時間：出社してから退社するまでの時間である。ただし，${lunch}時から${resume}時までは昼休みであり，この時間は勤務時間に含まれない。出社しなかった日は0:00が表示される。また，日をまたいで勤務することはない。`),
          p('勤怠理由：初期値は0である。欠勤，遅刻，早退について正当な理由がある場合は1を設定する。'),
          p('ペナルティ：正当な理由なく出社予定日に欠勤した場合は3を，正当な理由なく遅刻又は早退した場合は1を表示する。これら以外の場合は0を表示する。'
            + (original ? '' : '遅刻・早退は出社予定日について判定する。')),
          p('合計（勤務時間）：当該月の勤務時間の合計を表示する。'),
          p('合計（ペナルティ）：当該月のペナルティの合計を表示する。'),
          p('ペナルティの合計は，出勤割当表を作成するときに利用する。'),
          p('設問1 ワークシート“勤怠管理”に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('各日のペナルティを算出するために，ワークシート“勤怠管理”のセルG4には次の式を入力し，セルG5〜G34に複写する。'),
          ss('IF(F4＝1,0,IF(［a］,3,\n              IF(［b］,1,0)))'),
          p('ペナルティの合計を算出するために，セルG35には次の式を入力する。'), ss('合計(G4〜G34)'),
          p('各日の勤務時間を算出するために，ワークシート“勤怠管理”のセルE4には次の式を入力し，セルE5〜E34に複写する。算術演算のとき，空白セルは0として取り扱われる。'),
          ss('［c］'), p('勤務時間の合計を算出するために，セルE35には次の式を入力する。'), ss('合計(E4〜E34)'),
        ]),
        page(61, [
          p('〔ワークシート：勤務可能調査〕'),
          p('月末になると翌月の出勤割当表の作成に先立って，アルバイトの申告した勤務可能日に基づいて，ワークシート“勤務可能調査”を作成する。その例を図2に示す。ワークシート“勤務可能調査”では，勤務可能なことを1で，勤務不可能なことを0で表す。また，存在しない日は，全員が0となる。'),
          p('なお，アルバイトは15名とする。'),
        ], [
          bank(1, 'a', [
            "否定(論理積(B4＝0,C4＝''))", "否定(論理積(B4＝1,C4＝''))", "否定(論理和(B4＝0,C4＝''))",
            "否定(論理和(B4＝1,C4＝''))", "論理積(B4＝1,C4＝'')", "論理和(B4＝1,C4＝'')",
          ], 'オ', 'text'),
          bank(1, 'b', [`論理積(B4＝1,${onTime})`, `論理積(B4＝1,${violation})`, onTime,
            `論理和(B4＝1,${onTime})`, `論理和(B4＝1,${violation})`, violation], 'イ', 'text'),
          bank(1, 'c', ['D4－C4－1/24',
            `最小(D4,${lunch}/24)－最小(C4,${lunch}/24)＋最大(D4,${resume}/24)－最大(C4,${resume}/24)`,
            `最小(D4,${resume}/24)－最小(C4,${lunch}/24)－1/24`,
            `最小(D4,${resume}/24)－最大(C4,${lunch}/24)－1/24`,
            `最大(D4,${lunch}/24)－最小(C4,${lunch}/24)＋最大(D4,${resume}/24)－最小(C4,${resume}/24)`,
            `最大(D4,${resume}/24)－最小(C4,${lunch}/24)－1/24`,
            `最大(D4,${resume}/24)－最大(C4,${lunch}/24)－1/24`], 'イ', 'text'),
        ], [-1, -1, -1]),
        page(62, [
          survey.block(index), p('〔ワークシート：出勤割当表〕'),
          p('（1）ワークシート“勤務可能調査”に基づいて，ワークシート“出勤割当表”を作成する。その例を図3に示す。ワークシート“出勤割当表”では，勤務を割り当てた場合を1で，割り当てなかった場合を0で表す。'),
          assigned.block(index), p('（2）図3中の各項目の説明は，次のとおりである。'),
          p('経験順位：業務経験が長い人ほど小さい値が入力されている。同順位の人はいない。'),
          p('先々月ペナルティ：各アルバイトの先々月のペナルティの合計が入力されている。'),
          p('先々月ペナルティ順位：各アルバイトの先々月ペナルティを昇順に順位付けする。先々月ペナルティが同じ場合は同順位となる。'),
        ]),
        page(63, [
          p('（3）出勤割当表の作成は，月初から月末まで順番に1日分ずつ次の規則に基づいて行う。'),
          p(`（a）その日に出社可能な人が${limit}人以下の場合は，その全員を割り当てる。`),
          p(`（b）その日に出社可能な人が${limit}人より多い場合は，その中から次の優先順位で${limit}人を割り当てる。`),
          p('① 先々月ペナルティ順位がより小さい。'),
          p('② ①が等しい場合は，既に割当てが決められた期間（月初から前日まで）に割り当てられた回数がより少ない。'),
          p('③ ①，②がともに等しい場合は，経験順位がより小さい。'),
          p('（4）（3）の規則を定式化するために，出社の可否，先々月ペナルティ順位，前日までの割当回数，経験順位からなる次のような7けたの数値（以下，評価値という）を定義する。'),
          codeExample.block(index),
          p('この評価値が小さい人から，順番に出勤を割り当てる。評価値の計算には，ワークシート“出勤割当表”の列AB〜APを使用する。'),
          p('（5）ワークシート“出勤割当表”で用いる関数を表に示す。'), rankFunction.block(index),
          p('（6）複数のワークシート間でデータを参照する場合には，“ワークシート名！セル”又は“ワークシート名！セル範囲”という形式で指定する。'),
        ]),
        page(64, [
          p('設問2 ワークシート“出勤割当表”に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('先々月ペナルティ順位を算出するために，ワークシート“出勤割当表”のセルB38には次の式を入力し，セルC38〜P38に複写する。'),
          ss('順位(B37,$B37〜$P37,0)'),
          p('次に，セルAB3〜AP33に評価値を設定する。'),
          p('セルAB3には次の式を入力し，セルAC3〜AP3に複写する。'),
          ss('(((1－勤務可能調査!B3)*100＋［d］)*100)*100＋［e］'),
          p('セルAB4には次の式を入力し，セルAB4〜AP33に複写する。'),
          ss('(((1－勤務可能調査!B4)*100＋［d］)*100＋［f］)*100\n＋［e］'),
          p('出勤者を決定するために，セルB3には次の式を入力し，セルB3〜P33に複写する。'),
          ss('IF(論理積(［g］,\n          ［h］),1,0)'),
          p('各アルバイトの割当日数の合計を算出するために，セルB34には次の式を入力し，セルC34〜P34に複写する。'),
          ss('合計(B3〜B33)'),
          p('各日の合計割当人数を算出するために，セルQ3には次の式を入力し，セルQ4〜Q33に複写する。'),
          ss('合計(B3〜P3)'),
        ], [
          { ...bank(2, 'def', ['B$3', 'B$36', 'B$38', 'B3', 'B36', 'B38', '合計(B$3〜B3)', '合計(B$3〜$B3)'], 'ウイキ', 'text'), label: 'd〜fに関する解答群' },
        ]),
        page(65, [], [
          bank(2, 'gh', [
            '勤務可能調査!B3＝0', '勤務可能調査!B3＝1',
            `合計($B3〜$P3)≦${limit}`, `合計($B3〜$P3)≧${limit}`,
            `合計(勤務可能調査!$B3〜$P3)≦${limit}`, `合計(勤務可能調査!$B3〜$P3)≧${limit}`,
            `順位(AB3,$AB3〜$AP3,0)≦${limit}`, `順位(AB3,$AB3〜$AP3,1)≦${limit}`,
            `順位(B3,$B3〜$P3,0)≦${limit}`, `順位(B3,$B3〜$P3,1)≦${limit}`,
          ], 'イキ', 'text'),
        ]),
      ],
      contexts: [autumn2009PmReference('表計算ソフトの機能・用語', pagesForSheet)],
      explanation: `a：出社予定が1で出社時刻が空白のときに欠勤と判定する。b：出社予定日に限り，出社が${start}時より後か退社が${end}時より前なら遅刻又は早退である。c：${lunch}時までの勤務時間と${resume}時からの勤務時間を別々に求めて足せば，昼休みを含めずに済む。d：ペナルティ順位の行38を固定する。e：経験順位の行36を固定する。f：先頭行3を固定し，末尾は複写先の前日に相対移動させる。g・h：勤務可能であり，評価値の昇順で上位${limit}人以内なら割り当てる。論理積なので二つの条件の順は問わない。`,
    };
  }, { fixedReferenceAssetIds: pagesForSheet.map(autumn2009PmPageAssetId) });
