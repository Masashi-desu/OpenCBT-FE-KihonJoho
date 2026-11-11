import assert from 'node:assert/strict';

type Scalar = string | number | boolean;
type Value = Scalar | Scalar[][];
export type Sheet = Scalar[][];
type Sheets = Record<string, Sheet>;

function coordinates(token: string, dx: number, dy: number) {
  const m = /^(値上!)?(\$?)([A-I])(\$?)(\d+)$/.exec(token);
  assert.ok(m, token);
  return [m[1] ? '値上' : '', m[3].charCodeAt(0) - 65 + (m[2] ? 0 : dx), Number(m[5]) - 1 + (m[4] ? 0 : dy)] as const;
}
type Point = ReturnType<typeof coordinates>;
const number = (value: Value) => {
  assert.equal(typeof value, 'number');
  assert.ok(Number.isFinite(value));
  return value as number;
};
function matrix(value: Value): Scalar[][] {
  assert.ok(Array.isArray(value));
  return value;
}

export function sheetFromAlt(alt: string): Sheet {
  return alt.split('\n').slice(1).filter(line => /^\d+｜/.test(line)).map(line => line.split('｜').slice(1).map(text => {
    if (/^[-−]?[\d,.]+%?$/.test(text)) return Number(text.replaceAll(',', '').replace('−', '-').replace('%', '')) / (text.endsWith('%') ? 100 : 1);
    return text;
  }));
}
export function evaluate(text: string, sheets: Sheets, sheet: string, dx: number, dy: number): Value {
  const source = text.replace(/\s/g, '');
  const tokens = source.match(/(?:値上!)?\$?[A-I]\$?\d+|水平照合|垂直照合|IF|\d+(?:\.\d+)?|[,()+*/=〜-]/g) ?? [];
  assert.equal(tokens.join(''), source);
  let i = 0;
  const take = (token: string) => assert.equal(tokens[i++], token);
  const cell = ([qualified, col, row]: Point): Scalar => {
    const target = sheets[qualified || sheet][row]?.[col];
    assert.notEqual(target, undefined);
    return target;
  };
  const functions: Record<string, (values: Value[]) => Value> = {
    垂直照合([value, rows, column]) {
      const found = matrix(rows).find(row => row[0] === value);
      const output = found?.[number(column) - 1];
      assert.notEqual(output, undefined);
      return output!;
    },
    水平照合([value, rows, row]) {
      const table = matrix(rows);
      const output = table[number(row) - 1]?.[table[0].indexOf(value as Scalar)];
      assert.notEqual(output, undefined);
      return output!;
    },
  };
  type Expression = () => Value;
  function primary(): Expression {
    const token = tokens[i++];
    if (token === '(') {
      const value = expression(0);
      take(')');
      return value;
    }
    if (token === '-') {
      const value = primary();
      return () => -number(value());
    }
    if (token === 'IF' || Object.hasOwn(functions, token)) {
      take('(');
      const args = [expression(0)];
      while (tokens[i] === ',') { i++; args.push(expression(0)); }
      take(')');
      return () => token === 'IF' ? (args[0]() ? args[1]() : args[2]()) : functions[token](args.map(arg => arg()));
    }
    if (/^\d/.test(token)) return () => Number(token);
    const start = coordinates(token, dx, dy);
    if (tokens[i] !== '〜') return () => cell(start);
    i++;
    const [, endCol, endRow] = coordinates(tokens[i++], dx, dy);
    return () => Array.from({ length: endRow - start[2] + 1 }, (_, row) =>
      Array.from({ length: endCol - start[1] + 1 }, (_, col) => cell([start[0], start[1] + col, start[2] + row])));
  }
  const precedence: Record<string, number> = { '=': 1, '+': 2, '-': 2, '*': 3, '/': 3 };
  const apply: Record<string, (a: Value, b: Value) => Value> = {
    '=': (a, b) => a === b, '+': (a, b) => number(a) + number(b), '-': (a, b) => number(a) - number(b),
    '*': (a, b) => number(a) * number(b), '/': (a, b) => number(a) / number(b),
  };
  function expression(minimum: number): Expression {
    let left = primary();
    while (precedence[tokens[i]] >= minimum) {
      const operator = tokens[i++], before = left;
      const right = expression(precedence[operator] + 1);
      left = () => apply[operator](before(), right());
    }
    return left;
  }
  const value = expression(0);
  assert.equal(i, tokens.length);
  return value();
}
