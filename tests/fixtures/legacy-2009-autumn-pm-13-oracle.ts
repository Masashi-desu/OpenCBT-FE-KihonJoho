import assert from 'node:assert/strict';

type Review = {
  index: number; source: string; explanation: string;
  attendance: string; availability: string; assigned: string; digits: string;
  getOptions(field: string): string[];
  getSelected(field: string): string;
};
const pad2 = (value: number) => String(value).padStart(2, '0');
const minutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};
const dataRows = (alt: string) => alt.split('\n').map(row => row.split('｜'));

function shiftReference(token: string, deltaColumn: number, deltaRow: number) {
  const match = /^(\$?)([A-Z])(\$?)(\d+)$/.exec(token);
  assert.ok(match);
  const [, colAnchor, col, rowAnchor, row] = match;
  return String.fromCharCode(col.charCodeAt(0) + (colAnchor ? 0 : deltaColumn))
    + (Number(row) + (rowAnchor ? 0 : deltaRow));
}

const priorPenalties = [
  [],
  [2, 0, 3, 1, 0, 0, 1, 4, 0, 3, 1, 2, 0, 2, 0],
  [0, 1, 2, 1, 2, 3, 1, 0, 3, 1, 4, 3, 2, 0, 0],
  [0, 1, 0, 3, 1, 2, 3, 0, 4, 2, 4, 0, 5, 0, 1],
];
const people = Array.from({ length: 15 }, (_, i) => i);
const visible = [0, 1, 2, 3, 4, 5, 6, 14];
function allAvailable(index: number, day: number) {
  const day0 = day - 1;
  return people.filter(person => day <= 30 && ((day0 * (12 + person) + person * 7 + index * 3) % 17) < 8 + (day0 % 4));
}
function assignmentOracle(index: number, cap: number) {
  const penalties = priorPenalties[index];
  const ascending = [...penalties].sort((a, b) => a - b);
  const history = Array.from({ length: 31 }, (_, i) => i + 1).reduce<number[][]>((days, day) => {
    const count = (person: number) => days.filter(assigned => assigned.includes(person)).length;
    const order = allAvailable(index, day).sort((a, b) =>
      penalties[a] - penalties[b] || count(a) - count(b) || a - b);
    return [...days, order.slice(0, cap)];
  }, []);
  return {
    history,
    penaltyRanks: penalties.map(value => 1 + ascending.indexOf(value)),
    totals: people.map(person => history.filter(day => day.includes(person)).length),
  };
}

export function auditShiftSheets(review: Review) {
  const { index, source, getOptions, getSelected, explanation } = review;
  const start = Number(/始業時刻は(\d+)時/.exec(source)?.[1]);
  const end = Number(/終業時刻は(\d+)時/.exec(source)?.[1]);
  const lunch = /ただし，(\d+)時から(\d+)時までは昼休み/.exec(source);
  const limit = Number(/出社可能な人が(\d+)人以下/.exec(source)?.[1]);
  assert.ok(lunch);
  const lunchStart = Number(lunch[1]), lunchEnd = Number(lunch[2]);
  const optionsFor = (field: string, valid: (option: string, position: number) => boolean) => {
    const accepted = getOptions(field).filter(valid);
    assert.deepEqual(accepted, [getSelected(field)], field + 'の全候補を評価');
  };
  optionsFor('a', (option, i) => {
    assert.equal(option, [
      "否定(論理積(B4＝0,C4＝''))", "否定(論理積(B4＝1,C4＝''))", "否定(論理和(B4＝0,C4＝''))",
      "否定(論理和(B4＝1,C4＝''))", "論理積(B4＝1,C4＝'')", "論理和(B4＝1,C4＝'')",
    ][i]);
    return [false, true].every(scheduled => [false, true].every(blank => {
      const possibilities = [!(!scheduled && blank), !(scheduled && blank), !(!scheduled || blank),
        !(scheduled || blank), scheduled && blank, scheduled || blank];
      return possibilities[i] === (scheduled && blank);
    }));
  });
  optionsFor('b', (option, i) => {
    assert.match(option, new RegExp(start + '/24.*' + end + '/24'));
    return [false, true].every(scheduled => [false, true].every(late => [false, true].every(early => {
      const normal = !late && !early;
      const failed = late || early;
      return [scheduled && normal, scheduled && failed, normal, scheduled || normal, scheduled || failed, failed][i]
        === (scheduled && (late || early));
    })));
  });
  const a = lunchStart * 60, b = lunchEnd * 60;
  const clock = [0, a - 90, a - 1, a, a + 1, b - 1, b, b + 1, b + 91];
  optionsFor('c', (option, i) => {
    assert.match(option, /D4/);
    return clock.every(from => clock.filter(to => to >= from).every(to => {
      const intervals = Array.from({ length: to - from }, (_, j) => from + j);
      const minutesWorked = intervals.filter(time => time < a || time >= b).length;
      const possible = [
        to - from - 60, Math.min(to, a) - Math.min(from, a) + Math.max(to, b) - Math.max(from, b),
        Math.min(to, b) - Math.min(from, a) - 60, Math.min(to, b) - Math.max(from, a) - 60,
        Math.max(to, a) - Math.min(from, a) + Math.max(to, b) - Math.min(from, b),
        Math.max(to, b) - Math.min(from, a) - 60, Math.max(to, b) - Math.max(from, a) - 60,
      ];
      return possible[i] === minutesWorked;
    }));
  });
  optionsFor('d', option => !option.includes('合計') && shiftReference(option, 1, 2) === 'C38' && shiftReference(option, 3, 8) === 'E38');
  optionsFor('e', option => !option.includes('合計') && shiftReference(option, 1, 2) === 'C36' && shiftReference(option, 3, 8) === 'E36');
  optionsFor('f', option => {
    const range = /^合計\(([^〜]+)〜([^〜]+)\)$/.exec(option);
    return Boolean(range && shiftReference(range[1], 3, 4) === 'E3' && shiftReference(range[2], 3, 4) === 'E7');
  });
  assert.deepEqual(getOptions('g'), getOptions('h'));
  const expected = ['勤務可能調査!B3＝1', `順位(AB3,$AB3〜$AP3,0)≦${limit}`].sort();
  const possible = getOptions('g');
  assert.equal(possible.length, 10);
  const correctPairs = possible.flatMap((left, i) => possible.slice(i + 1).flatMap(right => {
    const valid = [0, 1, limit, limit + 1, 15].every(availableCount => people.every(person => {
      const available = person < availableCount;
      const ascending = person + 1;
      const evaluate = (candidate: string) => {
        if (/^勤務可能調査!B3＝[01]$/.test(candidate)) return available === candidate.endsWith('1');
        if (/^合計\(勤務可能調査!/.test(candidate)) return candidate.includes('≦') ? availableCount <= limit : availableCount >= limit;
        if (/^順位\(AB3,/.test(candidate)) return candidate.includes(',0)') ? ascending <= limit : 16 - ascending <= limit;
        assert.match(candidate, /^(合計\(\$B3|順位\(B3)/, '割当て結果自体を読む循環参照');
        return undefined;
      };
      const a = evaluate(left), b = evaluate(right);
      return a !== undefined && b !== undefined && (a && b) === (available && ascending <= limit);
    }));
    return valid ? [[left, right].sort()] : [];
  }));
  assert.deepEqual(correctPairs, [expected]);
  assert.deepEqual([getSelected('g'), getSelected('h')].sort(), expected);
  assert.match(explanation, new RegExp('上位' + limit + '人'));
  assert.match(review.digits, /^[01][0-9]{6}の7けた/);

  for (const [row, date, planned, arrived, left, worked, reason, penalty] of dataRows(review.attendance)) {
    if (!/^2009-09-\d+$/.test(date)) continue;
    const span = arrived === '' ? [] : Array.from({ length: minutes(left) - minutes(arrived) }, (_, i) => minutes(arrived) + i);
    assert.equal(minutes(worked), span.filter(minute => minute < a || minute >= b).length, date + '勤務時間');
    const delayed = arrived !== '' && (minutes(arrived) > start * 60 || minutes(left) < end * 60);
    const expectedPenalty = planned === '0' || reason === '1' ? 0 : arrived === '' ? 3 : delayed ? 1 : 0;
    assert.equal(Number(penalty), expectedPenalty, row + '行のペナルティ');
  }
  if (index === 0) {
    assert.ok(review.attendance.includes('106:20'));
    assert.ok(review.assigned.includes('先々月ペナルティ順位｜1｜12｜9｜14｜1｜1｜7｜…｜1'));
    return;
  }
  const modeled = assignmentOracle(index, limit);
  for (const [row, date, ...cells] of dataRows(review.availability)) {
    if (!/^2009-11-\d+$/.test(date)) continue;
    const day = Number(date.slice(-2));
    const declared = allAvailable(index, day);
    assert.deepEqual(cells.filter(value => value !== '…').map(Number), visible.map(person => Number(declared.includes(person))), row);
  }
  for (const [row, date, ...cells] of dataRows(review.assigned)) {
    if (!/^2009-11-\d+$/.test(date)) continue;
    const day = Number(date.slice(-2));
    const assigned = modeled.history[day - 1];
    assert.deepEqual(cells.filter(value => value !== '…').map(Number),
      [...visible.map(person => Number(assigned.includes(person))), assigned.length], row);
  }
  for (const [row, label, values] of [
    ['34', '合計', modeled.totals], ['38', '先々月ペナルティ順位', modeled.penaltyRanks],
  ] as const) {
    const actual = dataRows(review.assigned).find(cells => cells[0] === row);
    assert.deepEqual(actual, [row, label, ...values.slice(0, 7).map(String), '…', String(values[14]), '']);
  }
  assert.ok(review.assigned.includes('2009-11-' + pad2(31) + '｜0｜0｜0｜0｜0｜0｜0｜…｜0｜0'));
}
