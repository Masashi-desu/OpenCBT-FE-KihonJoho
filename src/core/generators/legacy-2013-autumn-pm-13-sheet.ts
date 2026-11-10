const plans = [
  { capacity: 10, leaders: [2, 11, 16, 32, 45], seats: [7, 7, 6, 10, 5] },
  { capacity: 8, leaders: [2, 10, 15, 25, 35], seats: [3, 8, 6, 5, 4] },
  { capacity: 9, leaders: [2, 12, 17, 26, 40], seats: [4, 5, 9, 5, 6] },
  { capacity: 11, leaders: [2, 13, 19, 36, 47], seats: [11, 6, 5, 8, 6] },
];

export function sheetColumn(number: number): string {
  let column = '';
  while (number > 0) {
    number--;
    column = String.fromCharCode(65 + number % 26) + column;
    number = Math.floor(number / 26);
  }
  return column;
}

const baselineValues = [
  [0, 117, 133, 111, 52, 136],
  [117, 0, 0, 133, 133, 157],
  [133, 0, 0, 0, 153, 111],
  [111, 133, 0, 0, 125, 95],
  [52, 133, 153, 125, 0, 150],
  [136, 157, 111, 95, 150, 0],
];
const displayNames = ['佐藤一郎', '鈴木二郎', '高橋三郎', '田中四郎', '伊藤花子', '山本礼子'];

export function groupingSheet(index: number) {
  const { capacity, leaders, seats } = plans[index];
  const students = leaders.length * capacity;
  const ids = Array.from({ length: students }, (_, i) => i + 1);
  const matrix = ids.map(i => ids.map(j => i === j ? 0 :
    index === 0 ? 0 : (Math.min(i, j) * 71 + Math.max(i, j) * 19 + index * 37) % 220));
  const score = (i: number, j: number, value: number) => {
    matrix[i - 1][j - 1] = value;
    matrix[j - 1][i - 1] = value;
  };
  const displayed = [1, 2, 3, 4, students - 1, students];
  const assigned = new Map(leaders.map((leader, group) => [leader, group + 1]));
  assigned.set(1, 5);
  const fullGroup = seats.indexOf(capacity) + 1;
  assigned.set(students - 1, fullGroup);
  assigned.set(students, fullGroup);
  const highStudent = [18, 11, 14, 22][index];
  const tieStudent = [0, 13, 18, 23][index];
  const reserved = new Set([3, 4, highStudent, tieStudent]);
  let next = 1;
  for (let group = 1; group <= leaders.length; group++) {
    let available = seats[group - 1] - [...assigned.values()].filter(value => value === group).length;
    while (available > 0) {
      while (assigned.has(next) || reserved.has(next)) next++;
      if (next > students) throw Error('SHEET_CAPACITY');
      assigned.set(next++, group);
      available--;
    }
  }
  if (index === 0) {
    displayed.forEach((id, row) => displayed.forEach((other, col) => score(id, other, baselineValues[row][col])));
    [0, 71, 76, 0, 0].forEach((value, group) => score(3, leaders[group], value));
    [133, 125, 133, 0, 62].forEach((value, group) => score(4, leaders[group], value));
    const others = ids.filter(id => !assigned.has(id) && !reserved.has(id));
    if (others.length !== 12) throw Error('SOURCE_FORMAT');
    others.forEach((id, i) => score(id, leaders[0], i < 6 ? 140 + i : i < 10 ? 90 + i : 40 + i));
    score(highStudent, leaders[0], 250);
  } else {
    const topGroups = [[1], [3, 5], [2, 4], [4, 5]][index];
    for (const group of topGroups) {
      score(highStudent, leaders[group - 1], 240);
      score(tieStudent, leaders[group - 1], 240);
    }
    score(3, leaders[fullGroup - 1], 300);
  }
  const eligible = ids.map(id => leaders.map((leader, group) =>
    assigned.has(id) || seats[group] === capacity ? -1 : matrix[id - 1][leader - 1]));
  const maxima = eligible.map(row => Math.max(...row));
  const groups = eligible.map((row, i) => row.indexOf(maxima[i]) + 1);
  const ranks = maxima.map(value => 1 + maxima.filter(other => other > value).length);
  const recommendation = ranks.indexOf(1) + 1;
  return {
    students, capacity, leaders, seats, assigned, matrix, eligible, maxima, ranks, groups, recommendation,
    lastRow: students + 2,
    fullRow: students + 3,
    recommendationRow: students + 5,
    lastColumn: sheetColumn(students + 2),
    penultimateColumn: sheetColumn(students + 1),
    displayed,
    displayNames,
  };
}
