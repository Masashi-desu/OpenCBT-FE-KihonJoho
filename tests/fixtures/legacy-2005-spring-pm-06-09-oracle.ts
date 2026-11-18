import assert from 'node:assert/strict';

export type SurveyRecord = readonly [age: number, job: number, purpose: number, copies: number];
export function crossTab(rows: readonly SurveyRecord[], dimension: number, first: 0 | 1, second: 1 | 2): number[][] {
  return Array.from({ length: dimension }, (_, row) => {
    const categories = Array.from({ length: dimension }, (_, col) =>
      rows.filter(record => record[first] === row + 1 && record[second] === col + 1).reduce((sum, record) => sum + record[3], 0));
    return [...categories, rows.filter(record => record[first] === row + 1).reduce((sum, record) => sum + record[3], 0)];
  });
}

const recordFields = ['E-NENREI', 'E-SHOKUGYO', 'E-KYOMI'];
export function aggregate(rows: readonly SurveyRecord[], dimension: number, rule: string) {
  const [, first, second, againFirst, againSecond] = /^COMPUTE B\((E-\w+) (E-\w+)\) = B\((E-\w+) (E-\w+)\) \+ 1$/u.exec(rule)!;
  assert(first === againFirst && second === againSecond);
  const rowField = recordFields.indexOf(first), colField = recordFields.indexOf(second);
  assert(rowField >= 0 && colField >= 0 && rowField !== colField);
  const matrix = Array.from({ length: dimension }, () => Array<number>(dimension).fill(0));
  for (const record of rows) matrix[record[rowField] - 1][record[colField] - 1] += record[3];
  return matrix;
}

export function writeRecordLines(matrix: number[][], skip: number, b: string, c: string) {
  const n = matrix.length;
  const columnValues = new Array<number | undefined>(n);
  let printLine = 1 + skip, x = 0, y = 0, z = -1, sum = 0;
  const printed: { line: number; columns: (number | undefined)[] }[] = [];
  function apply(command: string, cell: number) {
    switch (command) {
      case 'COMPUTE GOKEI = GOKEI + B(X Y)': sum += cell; return;
      case 'COMPUTE GOKEI = NINZUU(Z) + B(X Y)': sum = (columnValues[z] ?? NaN) + cell; return;
      case 'COMPUTE NINZUU(Z) = GOKEI + B(X Y)': columnValues[z] = sum + cell; return;
      case 'MOVE B(X Y) TO GOKEI': sum = cell; return;
      case 'SET X TO Z': x = z; return;
      case 'SET Y TO Z': y = z; return;
      case 'SET Z TO Y': z = y; return;
      // An INDEXED BY name cannot be transferred by MOVE.
      case 'MOVE X TO Z':
      case 'MOVE Y TO Z':
      case 'MOVE Z TO Y': throw Error('INDEX_MOVE');
      default: throw Error('unrecognized instruction');
    }
  }
  try {
    for (let row = 0; row < n; row++) {
      x = row;
      for (let column = 0; column < n; column++) {
        y = column;
        apply(b, matrix[x][y]);
        if (x !== row || y !== column || z < 0 || z >= n) return;
        columnValues[z] = matrix[x][y];
        apply(c, matrix[x][y]);
        if (x !== row || y !== column || !Number.isSafeInteger(sum)) return;
      }
      printLine += 2;
      printed.push({ line: printLine, columns: [...columnValues, sum] });
      sum = 0;
    }
    return printed;
  } catch (error) {
    assert(error instanceof Error && error.message === 'INDEX_MOVE');
    return undefined;
  }
}

type Instruction = { number: number; op: string; args: string[] };
export function assemble(program: string, midpoint: string, direction: string) {
  const labels = new Map<string, number>();
  const instructions: Instruction[] = [];
  for (const raw of program.split('\n')) {
    const [, row, content] = /^\s*(\d+) {2}(.*)$/u.exec(raw)!;
    const statement = content.replace('［a］', midpoint.trim()).replace('［b］', direction.trim()).split(';')[0];
    const tokens = statement.trim().split(/\s+/u);
    if (!/^\s/u.test(statement)) labels.set(tokens.shift()!, instructions.length);
    const [op, argument] = tokens;
    if (op !== 'START' && op !== 'END') instructions.push({ number: Number(row), op, args: argument ? argument.split(',') : [] });
  }
  return { instructions, labels };
}

export function runCasl(assembled: ReturnType<typeof assemble>, key: number, cells: readonly number[], base = 305) {
  const { instructions, labels } = assembled;
  const registers = [91, key, base, 41, 42, 43, 44, 45];
  const reference = registers.slice(1);
  let saved: number[] = [];
  let zero = false, negative = false;
  let pc = 0, rightUpdates = 0;
  const readReg = (register: string) => Number(register.slice(2));
  const address = (displacement: string, index?: string) => (Number(displacement) + (index ? registers[readReg(index)] : 0)) & 0xffff;
  function read(input: string, index?: string): number {
    if (input.startsWith('GR')) return registers[readReg(input)];
    return cells[(address(input, index) - base) & 0xffff];
  }
  for (let step = 0; step < 300; step++) {
    const { number, op, args } = instructions[pc++];
    const [left, right, index] = args;
    if (number === 20) rightUpdates++;
    if (op === 'RPUSH') saved = registers.slice(1);
    else if (op === 'RPOP') registers.splice(1, saved.length, ...saved);
    else if (op === 'RET') {
      assert.deepEqual(registers.slice(1), reference);
      return { quantity: registers[0], rightUpdates };
    } else if (op === 'LAD') registers[readReg(left)] = address(right, index);
    else if (op === 'LD' || op === 'CPL' || op === 'ADDL') {
      const a = registers[readReg(left)], b = read(right, index);
      if (b === undefined) return;
      if (op === 'CPL') {
        zero = a === b;
        negative = a < b;
      } else {
        const value = op === 'LD' ? b : (a + b) & 0xffff;
        registers[readReg(left)] = value;
        zero = value === 0;
        negative = value > 0x7fff;
      }
    } else if (op === 'SRL' || op === 'SLL') {
      const register = readReg(left);
      const value = registers[register];
      const shifted = op === 'SRL' ? value >>> Number(right) : (value << Number(right)) & 0xffff;
      registers[register] = shifted;
      zero = shifted === 0;
      negative = shifted > 0x7fff;
    } else if (op === 'JUMP' || op === 'JZE' || op === 'JPL' || op === 'JMI') {
      if (op === 'JUMP' || (op === 'JZE' && zero) || (op === 'JPL' && !zero && !negative) || (op === 'JMI' && negative)) {
        assert(labels.has(left));
        pc = labels.get(left)!;
      }
    } else throw Error('unknown operation: ' + op);
  }
  return undefined;
}

export function compareInventory(cells: readonly number[], key: number) {
  const entries = Array.from({ length: cells[0] }, (_, i) => [cells[1 + 2 * i], cells[2 + 2 * i]]);
  const quantity = entries.find(([product]) => product === key)?.[1] ?? 0xffff;
  let window = entries;
  let rightUpdates = 0;
  while (window.length) {
    const middle = Math.floor((window.length - 1) / 2);
    if (window[middle][0] === key) break;
    if (window[middle][0] > key) {
      window = window.slice(0, middle);
      rightUpdates++;
    } else window = window.slice(middle + 1);
  }
  return { quantity, rightUpdates };
}
