import {
  q5StockBanks, q6Counts, q6FunctionNames, q6Percentages, q6Processes, q6Stages, q6Weights, q7BaseWork,
} from './legacy-2014-spring-pm-05-08-source';

export const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
export const shaded = '（網掛け）';
export type Table = { caption: string; columns: string[]; rows: string[][] };
export const q5CLinks = [
  ['顧客', '販売管理', '受注'], ['販売管理', '顧客', '請求'], ['販売管理', '生産管理', '受注情報'],
  ['配送管理', '販売管理', '出荷実績'], ['販売管理', '会計', '売掛情報'], ['会計', '販売管理', '請求情報'],
  ['配送管理', '会計', '配送経費情報'], ['生産管理', '会計', '原価情報'], ['調達管理', '会計', '買掛情報'],
  ['生産管理', '配送管理', '出荷指示'], ['生産管理', '調達管理', '調達指示'], ['調達管理', '生産管理', '入荷実績'],
] as const;
export const q5DLinks = [
  ['販売管理', '顧客', '顧客に請求書を郵送'], ['販売管理', '生産管理', '売掛情報'], ['販売管理', '会計', '売掛情報'],
  ['販売管理', '在庫管理', '出荷指示'], ['在庫管理', '販売管理', '出荷実績'], ['在庫管理', '会計', '配送経費情報'],
  ['生産管理', '会計', '原価情報'], ['調達管理', '会計', '買掛情報'], ['調達管理', '在庫管理', '入荷実績'],
  ['調達管理', '在庫管理', '発注情報'], ['生産管理', '調達管理', '調達指示'], ['生産管理', '在庫管理', '入庫情報'],
  ['生産管理', '在庫管理', '出庫指示'], ['在庫管理', '生産管理', '在庫情報'],
] as const;

export const q5Add: Table = { caption: '表1　追加開発が必要となる機能', columns: ['対象のシステム', '追加開発が必要となる機能'],
  rows: [['販売管理システム', '・端末から受注情報を入力する機能\n・' + shaded], ['［a］システム', '・［b］']] };
export const q5Interface: Table = { caption: '表2　在庫更新のインタフェース仕様の説明', columns: ['設定項目', '説明'], rows: [
  ['品番コード', '更新を行う在庫品の品番コードを設定する'],
  ['在庫区分', '“有効在庫”か“実在庫”のいずれかを設定する'],
  ['入出庫区分', '“入庫”か“出庫”のいずれかを設定する'],
  ['数量', '在庫を増減させる数量'],
] };
export const q5Events = [
  ['生産管理システム', '生産計画時', '有効在庫', '入庫', '生産予定数'],
  ['生産管理システム', '生産計画時', '有効在庫', '出庫', '必要部品数'],
  ['生産管理システム', '生産時', '実在庫', '出庫', '投入数'],
  ['生産管理システム', '製品完成時', '実在庫', '入庫', '完成数'],
  ['調達管理システム', '部品発注時', '有効在庫', '入庫', '発注数'],
  ['調達管理システム', '部品納品時', '実在庫', '入庫', '納品数'],
  ['販売管理システム', '受注時', '有効在庫', '出庫', '受注数'],
  ['配送管理システム', '製品出荷時', '実在庫', '出庫', '出荷数'],
] as const;
const q5Positions = [[0, 5, 6, 7], [0, 4, 6, 7], [0, 5, 6, 3]] as const;
export function q5Data(input: number) {
  const positions = [...q5Positions[input]], choices = q5StockBanks.map(row => [...row]);
  if (input === 1) choices[7][2] = '発注数';
  if (input === 2) choices[2][2] = '完成数';
  const answers = positions.map(pos => {
    const expected = q5Events[pos].slice(2).join('｜');
    const index = choices.findIndex(row => row.join('｜') === expected);
    if (index < 0 || choices.filter(row => row.join('｜') === expected).length !== 1) throw Error('PARAMETER_CONSTRAINT');
    return index;
  });
  return { positions, choices, answers };
}

export const q6Flows = [
  ['オンラインストレージ（入力）', 'データ取込'], ['電子記憶媒体（入力）', 'データ取込'], ['授受リスト（入力）', 'メンテナンス用端末'],
  ['メンテナンス用端末', 'データ取込'], ['メンテナンス用端末', 'データ整備'], ['データ取込', 'エラーファイル'],
  ['データ取込', '名簿マスタ'], ['名簿マスタ', 'データ取込'], ['エラーファイル', 'データ整備'],
  ['データ整備', '名簿マスタ'], ['名簿マスタ', 'データ整備'], ['名簿マスタ', 'データ抽出'], ['抽出条件テーブル', 'データ抽出'],
  ['データ抽出', 'オンラインストレージ（出力）'], ['データ抽出', '電子記憶媒体（出力）'], ['データ抽出', '授受リスト（出力）'],
  ['データ抽出', 'ログデータ'], ['ログデータ', '請求書作成'], ['料金テーブル', '請求書作成'],
  ['請求書作成', '請求書'], ['請求書作成', '請求金額'], ['請求金額', '請求書作成'],
] as const;
const q6Cases = [
  { weights: q6Weights, scope: 80 }, { weights: [3, 2, 6, 10, 5], scope: 95 },
  { weights: [2, 4, 6, 8, 5], scope: 80 },
] as const;
const q6ProductivityTenths = 5;
export const q6Productivity: Table = { caption: '表2　開発生産性の計画値', columns: ['開発生産性計画値'], rows: [['0.5（kステップ／人月）']] };
export const q6SizeColumns = [...q6FunctionNames, '処理別開発規模合計', '処理別工数合計（人月）'];
export function q6Data(input: number) {
  const { weights, scope } = q6Cases[input];
  const scales = q6Counts.map(counts => counts.map((count, i) => count * weights[i]));
  const rowSizes = scales.map(sum), effort = rowSizes.map(size => size / q6ProductivityTenths);
  const totals = q6FunctionNames.map((_, col) => sum(scales.map(row => row[col])));
  const common = totals.map((total, col) => q6Counts.every(row => row[col] > 0) ? total : -1);
  const target = common.indexOf(Math.max(...common));
  const stageEnd = q6Percentages.findIndex((_, i) => sum(q6Percentages.slice(0, i + 1)) === scope);
  const eligible = scales[2][target] * scope / (q6ProductivityTenths * 100);
  return { weights, scope, scales, rowSizes, effort, totals, target, stageEnd, eligible };
}
export const q6Functions = (input: number): Table => ({
  caption: '表1　ファンクション一覧', columns: ['項番', 'ファンクション名', 'ファンクションに対応する開発規模（kステップ）'],
  rows: q6Data(input).weights.map((w, i) => [String(i + 1), q6FunctionNames[i], (w / 10).toFixed(1)]),
});
export const q6VisibleTotals = (input: number) => {
  const data = q6Data(input);
  const rows = q6Counts.map((counts, row) => ({
    process: q6Processes[row],
    count: counts.map((n, col) => row === 2 && col === 1 ? '［a］' : String(n)),
    size: data.scales[row].map((n, col) => row === 2 && col === 1 ? shaded : (n / 10).toFixed(1)),
    total: row === 2 ? shaded : (data.rowSizes[row] / 10).toFixed(1),
    effort: row === 1 ? '［b］' : row === 2 ? shaded : data.effort[row].toFixed(1),
  }));
  return { rows, totals: data.totals.map((n, col) => col === 1 ? shaded : (n / 10).toFixed(1)) };
};
export const q6VisibleStages = (input: number) => q6Data(input).effort.map((effort, row) => ({
  process: q6Processes[row],
  cells: q6Percentages.map((p, col) => (row === 1 && col === 1) || (row === 2 && col === 3) ? shaded : (effort * p / 100).toFixed(2)),
  effort: row === 1 || row === 2 ? shaded : effort.toFixed(1),
}));

export const q7Edges = [[1, 2, 1], [2, 3, 2], [3, 4, 3], [3, 5, 4], [4, 9, 5], [5, 8, 6], [4, 6, 7],
  [6, 7, 9], [9, 10, 10], [8, 10, 11], [10, 11, 12], [11, 12, 13]] as const;
const q7Cases = [{ head: [3, 3, 4], work12: 1 }, { head: [2, 2, 4], work12: 1 }, { head: [4, 4, 5], work12: 2 }];
export const q7Work = (input: number) => {
  const s = q7Cases[input];
  return q7BaseWork.map(([label, time, staff, previous], i) => ({
    id: i + 1, label, duration: i === 11 ? s.work12 : time, staff: i >= 4 && i <= 6 ? s.head[i - 4] : staff, previous: [...previous],
  }));
};
export type Job = ReturnType<typeof q7Work>[number];
export const q7WorkTable = (input: number): Table => ({
  caption: '表1　バージョンアップに必要な作業の一覧', columns: ['作業', '作業内容', '作業時間（時間）', '必要要員数（人）', '先行作業'],
  rows: q7Work(input).map(({ id, label, duration, staff, previous }) =>
    ['No' + id, label, String(duration), String(staff), previous.length ? previous.map(n => 'No' + n).join('，') : '―']),
});
export function q7Earliest(jobs: readonly Job[], shorten: readonly number[] = []) {
  const start: number[] = [0], end: number[] = [0];
  for (const job of jobs) {
    start[job.id] = Math.max(0, ...job.previous.map(p => end[p]));
    end[job.id] = start[job.id] + job.duration * 60 - (shorten.includes(job.id) ? 15 : 0);
  }
  return { start, end, length: Math.max(...end) };
}
export function q7Demand(jobs: readonly Job[], starts: readonly number[], minutes: number) {
  return sum(jobs.filter(job => starts[job.id] <= minutes && minutes < starts[job.id] + job.duration * 60).map(job => job.staff));
}
const q7ScheduleStarts = [[1, 0, 0, 0], [2, 0, 0, 0], [3, 0, 4, 0], [5, 7, 6, 8], [0, -7, 0, 0]];
export function q7VisibleSchedule(input: number) {
  const jobs = q7Work(input), earliest = q7Earliest(jobs);
  return Array.from({ length: 11 }, (_, hour) => ({
    time: hour + 6, tasks: q7ScheduleStarts[hour] ?? null,
    people: hour >= 7 && hour <= 9 ? '［d］' : String(q7Demand(jobs, earliest.start, hour * 60)),
  }));
}

export type Interval = readonly [number, number];
const q8Cases = [
  { requests: [[1, 2], [6, 8]], release: [6, 7], blanks: [0, 3] },
  { requests: [[2, 4], [6, 8]], release: [4, 4], blanks: [1, 2] },
  { requests: [[1, 1], [3, 6]], release: [3, 4], blanks: [0, 1] },
] as const;
export const q8AllocTable: Table = { caption: '表1　関数Allocの空きリスト更新処理', columns: ['引数の状況', '空きリストの更新処理'], rows: [
  ['始点ᵢ＝始点ₚかつ終点ₚ＝終点ᵢ', '組{始点ᵢ，終点ᵢ}を取り除く。'],
  ['始点ᵢ＝始点ₚかつ終点ₚ＜終点ᵢ', '組{始点ᵢ，終点ᵢ}を組' + shaded + 'で置き換える。'],
  ['始点ᵢ＜始点ₚかつ終点ₚ＝終点ᵢ', '組{始点ᵢ，終点ᵢ}を組' + shaded + 'で置き換える。'],
  ['始点ᵢ＜始点ₚかつ終点ₚ＜終点ᵢ', '組{始点ᵢ，終点ᵢ}を二つの組{始点ᵢ，始点ₚ−1}と{終点ₚ＋1，終点ᵢ}で置き換える。'],
] };
export const q8FreeCases = [
  ['終点ᵢ＝始点ₚ−1かつ終点ₚ＋1＝始点ᵢ₊₁', '二つの組{始点ᵢ，終点ᵢ}と{始点ᵢ₊₁，終点ᵢ₊₁}を一つの組', '{始点ᵢ，終点ᵢ₊₁}', 'で置き換える。'],
  ['終点ᵢ＝始点ₚ−1かつ終点ₚ＋1＜始点ᵢ₊₁', '組{始点ᵢ，終点ᵢ}を組', '{始点ᵢ，終点ₚ}', 'で置き換える。'],
  ['終点ᵢ＜始点ₚ−1かつ終点ₚ＋1＝始点ᵢ₊₁', '組{始点ᵢ₊₁，終点ᵢ₊₁}を組', '{始点ₚ，終点ᵢ₊₁}', 'で置き換える。'],
  ['終点ᵢ＜始点ₚ−1かつ終点ₚ＋1＜始点ᵢ₊₁', '組{始点ᵢ，終点ᵢ}の直後に組', '{始点ₚ，終点ₚ}', 'を挿入する。'],
] as const;
export function q8FreeTable(input: number): Table {
  const { blanks } = q8Cases[input];
  return { caption: '表2　関数Freeの空きリスト更新処理', columns: ['引数の状況', '空きリストの更新処理'],
    rows: q8FreeCases.map(([condition, before, result, after], row) =>
      [condition, before + (row === blanks[0] ? '［a］' : row === blanks[1] ? '［b］' : result) + after]) };
}
export const q8Answers = (input: number) => q8Cases[input].blanks.map(row => q8FreeCases[row][2]);
export const interval = ([start, end]: Interval) =>
  '{' + (start === -Infinity ? '−∞' : start) + '，' + (end === Infinity ? '+∞' : end) + '}';
export function q8Example(input: number) {
  const { requests, release } = q8Cases[input];
  const [first, second] = requests;
  const initial: Interval[] = [[-Infinity, Infinity]];
  const allocated: Interval[] = [[-Infinity, first[0] - 1], [first[1] + 1, second[0] - 1], [second[1] + 1, Infinity]];
  const left = allocated[1][1] + 1 === release[0];
  const merged: Interval = left ? [allocated[1][0], release[1]] : [release[0], allocated[1][1]];
  const released: Interval[] = [allocated[0], merged, allocated[2]];
  return { requests, release, initial, allocated, released, merged };
}
export const q8Cells = (input: number, phase: 0 | 1 | 2) => {
  const data = q8Example(input);
  const list = [data.initial, data.allocated, data.released][phase];
  const active = Array.from({ length: 10 }, (_, index) => !list.some(([first, last]) => first <= index && index <= last));
  return { list, active, label: phase === 0 ? '初期状態の空きリスト' : '実行後の空きリスト' };
};
