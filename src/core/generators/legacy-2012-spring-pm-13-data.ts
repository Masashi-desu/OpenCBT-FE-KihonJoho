type Loan = { reader: number; day: number };
const profiles = ['教員', '大学院生', '学部生', 'その他'];
const names = ['プログラミング入門', 'ネットワーク', '情報科学入門', 'データベース', '統計入門', '情報セキュリティ'];
const examples = [
  { today: 15, policies: [[20, 28], [10, 28], [5, 14], [3, 7]], selected: 2, requested: [170, 40], offsets: [-38, -2, -18] },
  { today: 16, policies: [[22, 25], [11, 26], [6, 12], [3, 8]], selected: 3, requested: [171, 3], offsets: [-36, -1, -19] },
  { today: 18, policies: [[19, 30], [9, 24], [5, 12], [4, 8]], selected: 4, requested: [172, 4], offsets: [-40, -4, -21] },
  { today: 22, policies: [[21, 24], [10, 25], [4, 10], [3, 6]], selected: 5, requested: [173, 1], offsets: [-30, -3, -12] },
] as const;
export const bookExamples = examples;

export function readerProfile(reader: number) {
  if (reader === 1) return 2;
  if (reader === 2 || reader === 4) return 0;
  if (reader === 3) return 1;
  return 3;
}
export function loanEntries(index: number) {
  const { offsets } = examples[index];
  const loans = new Map<number, Loan>([
    [2, { reader: 4, day: offsets[0] }], [3, { reader: 4, day: offsets[0] }],
    [5, { reader: 37, day: offsets[1] }], [6, { reader: 2, day: offsets[2] }],
    [8, { reader: 1, day: -25 }], [9, { reader: 4, day: -5 }],
    [200, { reader: 2, day: offsets[2] }],
  ]);
  for (let book = 10; book <= 19; book++) loans.set(book, { reader: 2, day: -10 });
  return loans;
}
function date(index: number, offset: number) {
  const day = new Date(Date.UTC(2011, 5, examples[index].today + offset));
  return day.toISOString().slice(2, 10);
}
function loanDateFields(index: number, loan: Loan | undefined) {
  if (!loan) return ['', '', '', ''];
  const limit = examples[index].policies[readerProfile(loan.reader)][1];
  return [String(loan.reader), date(index, loan.day), date(index, loan.day + limit), String(Math.max(0, -(loan.day + limit)))];
}
export function booksSheet(index: number) {
  const loans = loanEntries(index);
  return {
    headers: ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    rows: [
      ['1', '図書ID', '図書名', '利用者ID', '貸出日', '返却期日', '延滞日数', '', '日付', date(index, 0)],
      ...names.map((name, i) => [String(i + 2), String(i + 1), name, ...loanDateFields(index, loans.get(i + 1)), '', '', '']),
      ['⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '', '', ''],
      ['201', '200', '論理学応用', ...loanDateFields(index, loans.get(200)), '', '', ''],
      ['202', '', '', '', '', '', '', '', '', ''],
      ['203', '図書ID', String(examples[index].requested[0]), '利用者ID', String(examples[index].requested[1]), '', '', '', '', ''],
    ],
  };
}
export function usersSheet(index: number) {
  const loans = [...loanEntries(index).values()];
  const users = ['情報一郎', '情報二郎', '情報三郎', '情報四郎'];
  return {
    headers: ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    rows: [
      ['1', '利用者ID', '氏名', '属性', '残り貸出冊数', '延滞状態', '', '属性', '貸出上限冊数', '貸出日数'],
      ...users.map((name, i) => {
        const category = readerProfile(i + 1), [max, limit] = examples[index].policies[category];
        const borrowed = loans.filter(loan => loan.reader === i + 1);
        return [String(i + 2), String(i + 1), name, profiles[category], String(max - borrowed.length),
          borrowed.some(loan => loan.day + limit < 0) ? '*' : '', '', profiles[i], ...examples[index].policies[i].map(String)];
      }),
      ['⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '', '', '', ''],
      ['51', '50', '情報花子', 'その他', String(examples[index].policies[3][0]), '', '', '', '', ''],
    ],
  };
}

const selectedBooks = [3, ...Array.from({ length: 24 }, (_, i) => 21 + i)];
const firstBookReaders = [48, 5, 6, 7, 8, 9, 10, 11, 12];
const fourthBookReaders = [50, 13, 14, 15, 16, 17, 18, 19, 20];
export function historyByReader(index: number) {
  return Array.from({ length: 50 }, (_, row) => {
    const reader = row + 1;
    if (reader === 2) return new Set(selectedBooks);
    const takesThird = reader === 1 || reader === 4;
    const overlaps = reader === 1 ? 10 : reader === 3 ? 12 : reader === 4 ? 8 : reader === 49 ? 11 :
      reader === 50 ? 13 : reader === 20 ? 15 : firstBookReaders.includes(reader) ? 14 : 12;
    const history = new Set(selectedBooks.slice(1 + index, 1 + index + overlaps - Number(takesThird)));
    if (takesThird) history.add(3);
    if (firstBookReaders.includes(reader)) history.add(1);
    if (reader === 4 || reader === 49) history.add(2);
    if (fourthBookReaders.includes(reader)) history.add(4);
    if (reader === 1) history.add(200);
    return history;
  });
}

export function recommendations(index: number) {
  const selected = examples[index].selected - 1;
  const loans = loanEntries(index);
  const history = historyByReader(index);
  const overlap = history.map((read, j) => j === selected ? 0 :
    [...history[selected]].filter(book => read.has(book)).length);
  const recommendation = (book: number) => loans.has(book) || history[selected].has(book) ? 0 :
    overlap.reduce((sum, count, j) => sum + (history[j].has(book) ? count : 0), 0);
  return { history, overlap, recommendation };
}
export function historySheet(index: number) {
  const { history, overlap, recommendation } = recommendations(index);
  const columns = [1, 2, 3, 4, 48, 49, 50];
  const visible = (read: (j: number) => string) => [...columns.slice(0, 4).map(read), '…', ...columns.slice(4).map(read)];
  const toFraction = (count: number) => String(count / 200);
  const row = (book: number) => [String(book + 1), String(book),
    ...visible(j => history[j - 1].has(book) ? '1' : '0'), toFraction(recommendation(book))];
  return {
    headers: ['', 'A', 'B', 'C', 'D', 'E', '…', 'AW', 'AX', 'AY', 'AZ'],
    rows: [
      ['1', '図書ID＼利用者ID', ...visible(String), '推薦度'],
      ...[1, 2, 3, 4].map(row),
      ['⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮', '⋮'],
      row(200), ['202', '類似度', ...visible(j => toFraction(overlap[j - 1])), ''],
      ['203', '', '', '', '', '', '', '', '', '', ''],
      ['204', '利用者ID', String(examples[index].selected), '', '', '', '', '', '', '', ''],
    ],
  };
}
