export const subjects = ['国語', '数学', '英語', '理科', '社会'];
export const relations = {
  students: { name: '生徒表', columns: ['生徒番号', '氏名', '住所', '電話番号'], keys: 1 },
  history: { name: '履歴表', columns: ['生徒番号', '年度', '学年', 'クラス', '教員番号'], keys: 2 },
  teachers: { name: '教員表', columns: ['教員番号', '氏名', '住所', '電話番号'], keys: 1 },
  gradesA: { name: '成績表', columns: ['生徒番号', '年度', '試験ID', ...subjects], keys: 3 },
  exams: { name: '試験表', columns: ['試験ID', '試験名'], keys: 1 },
  gradesB: { name: '成績表', columns: ['生徒番号', '年度', '試験ID', '科目ID', '得点'], keys: 4 },
  subjects: { name: '科目表', columns: ['科目ID', '科目名'], keys: 1 },
};
export const teacherNote = '注　教員番号には，担任教員を識別する教員番号が格納されている。';
const cases = [
  { terms: 3, rounds: ['中間', '期末'], forTotal: [2009, 1], exam: '2学期中間', forMean: [2008, 1], name: '情報太郎', counts: [2, 4, 6, 12, 24, 30, 48, 60] },
  { terms: 2, rounds: ['中間', '期末'], forTotal: [2009, 2], exam: '1学期期末', forMean: [2008, 2], name: '情報花子', counts: [2, 4, 6, 10, 12, 20, 24, 40] },
  { terms: 4, rounds: ['中間', '期末'], forTotal: [2009, 3], exam: '4学期期末', forMean: [2008, 3], name: '試験次郎', counts: [2, 4, 8, 16, 24, 32, 40, 80] },
  { terms: 3, rounds: ['初回', '中間', '期末'], forTotal: [2008, 2], exam: '3学期初回', forMean: [2009, 2], name: '記録春子', counts: [3, 6, 9, 15, 18, 27, 45, 90] },
];
export function databaseScenario(index: number) {
  const item = cases[index];
  const exams = Array.from({ length: item.terms }, (_, term) => item.rounds.map(round => (term + 1) + '学期' + round)).flat();
  return { ...item, exams };
}
