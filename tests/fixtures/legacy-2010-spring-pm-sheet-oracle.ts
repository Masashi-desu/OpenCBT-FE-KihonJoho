import assert from 'node:assert/strict';

type Cell = number | string | boolean;
type Value = Cell | Value[];
export type Sheet = Cell[][];
type Sheets = Record<string, Sheet>;

export function sheetFromAlt(alt: string): Sheet {
  return alt.split('\n').filter(line => /^\d+｜/.test(line)).map(line => line.split('｜').slice(1).map(value =>
    /^−?[\d,]+$/.test(value) ? Number(value.replaceAll(',', '').replace('−', '-')) : value));
}

type Point = { sheet: string; x: number; y: number };
function point(token: string, dx: number, dy: number): Point {
  const match = /^(?:(メニュー|伝票)!)?(\$?)([A-J])(\$?)(\d+)$/.exec(token);
  assert.ok(match, token);
  const [, sheet, lockColumn, column, lockRow, row] = match;
  return { sheet, x: column.charCodeAt(0) - 65 + (lockColumn ? 0 : dx), y: Number(row) - 1 + (lockRow ? 0 : dy) };
}
const number = (value: Value): number => {
  assert.equal(typeof value, 'number');
  return value as number;
};
const list = (value: Value) => { assert.ok(Array.isArray(value)); return value; };
const compare = (operator: Value, a: Value, b: Value) => {
  if (operator === '＝') return a === b;
  if (operator === '≠') return a !== b;
  throw new Error('Unknown comparison');
};

export function evaluate(source: string, sheets: Sheets, defaultSheet: string, dx = 0, dy = 0): Value {
  const cleaned = source.replace(/\s/g, '');
  const tokens = cleaned.match(/(?:メニュー!|伝票!)?\$?[A-J]\$?\d+|複数条件照合合計|照合一致|照合合計|論理積|論理和|配列|IF|'[^']*'|\d+(?:\.\d+)?|[,()＋−＊＝≧≦〜]/g) ?? [];
  assert.equal(tokens.join(''), cleaned);
  let position = 0;
  const take = (token: string) => assert.equal(tokens[position++], token);
  const readCell = ({ sheet, x, y }: Point) => {
    const value = sheets[sheet || defaultSheet]?.[y]?.[x];
    assert.notEqual(value, undefined);
    return value!;
  };
  function selectedSum(matrix: Value, accepts: (i: number, j: number) => boolean) {
    let total = 0;
    list(matrix).forEach((row, i) => list(row).forEach((value, j) => { if (accepts(i, j)) total += number(value); }));
    return total;
  }
  const functions: Record<string, (values: Value[]) => Value> = {
    照合一致([wanted, range]) {
      const offset = list(range).flat().findIndex(value => value === wanted);
      assert.ok(offset >= 0);
      return offset + 1;
    },
    配列([range, row, col]) {
      const value = list(list(range)[number(row) - 1])[number(col) - 1];
      assert.notEqual(value, undefined);
      return value;
    },
    照合合計([wanted, range, values]) {
      return selectedSum(values, (i, j) => list(list(range)[i])[j] === wanted);
    },
    複数条件照合合計([left, right, values]) {
      const [wanted1, compare1, range1] = list(left);
      const [wanted2, compare2, range2] = list(right);
      return selectedSum(values, (i, j) => compare(compare1, list(list(range1)[i])[j], wanted1)
        && compare(compare2, list(list(range2)[i])[j], wanted2));
    },
    論理積: values => values.every(Boolean),
    論理和: values => values.some(Boolean),
  };
  type Eval = () => Value;
  function argumentsAfterOpening(): Eval[] {
    const args = [expression(0)];
    while (tokens[position] === ',') { position++; args.push(expression(0)); }
    take(')');
    return args;
  }
  function atom(): Eval {
    const token = tokens[position++];
    if (token === '(') {
      const args = argumentsAfterOpening();
      return args.length === 1 ? args[0] : () => args.map(arg => arg());
    }
    if (token === 'IF' || Object.hasOwn(functions, token)) {
      take('(');
      const args = argumentsAfterOpening();
      return token === 'IF' ? () => args[0]() ? args[1]() : args[2]() : () => functions[token](args.map(arg => arg()));
    }
    if (/^\d/.test(token)) return () => Number(token);
    if (token.startsWith("'")) return () => token.slice(1, -1);
    const start = point(token, dx, dy);
    if (tokens[position] !== '〜') return () => readCell(start);
    position++;
    const end = point(tokens[position++], dx, dy);
    return () => Array.from({ length: end.y - start.y + 1 }, (_, i) =>
      Array.from({ length: end.x - start.x + 1 }, (_, j) => readCell({ sheet: start.sheet, x: start.x + j, y: start.y + i })));
  }
  const priorities: Record<string, number> = { '＝': 1, '≧': 1, '≦': 1, '＋': 2, '−': 2, '＊': 3 };
  const operations: Record<string, (a: Value, b: Value) => Value> = {
    '＝': (a, b) => a === b, '≧': (a, b) => number(a) >= number(b), '≦': (a, b) => number(a) <= number(b),
    '＋': (a, b) => number(a) + number(b), '−': (a, b) => number(a) - number(b), '＊': (a, b) => number(a) * number(b),
  };
  function expression(minimum: number): Eval {
    let result = atom();
    while (priorities[tokens[position]] >= minimum) {
      const operator = tokens[position++];
      const right = expression(priorities[operator] + 1);
      const left = result;
      result = () => operations[operator](left(), right());
    }
    return result;
  }
  const result = expression(0);
  assert.equal(position, tokens.length);
  return result();
}
