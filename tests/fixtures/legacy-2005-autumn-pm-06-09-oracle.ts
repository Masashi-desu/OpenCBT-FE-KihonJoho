import assert from 'node:assert/strict';

export type Pupil = { id: string; scores: readonly number[] };
type Placement = { id: string; total: number };
type Scores = { records: Placement[]; pupilCount: number; averagesTenths: number[] };

export function scoresFromRows(rows: readonly Pupil[]): Scores {
  const compare = (a: Placement, b: Placement) => b.total - a.total || a.id.localeCompare(b.id);
  return {
    records: rows.map(row => ({ id: row.id, total: row.scores.reduce((sum, value) => sum + value, 0) })).sort(compare),
    pupilCount: rows.length,
    averagesTenths: rows[0].scores.map((_, column) =>
      Number(rows.reduce((sum, row) => sum + 10n * BigInt(row.scores[column]), 0n) / BigInt(rows.length))),
  };
}

// Evaluate the four inserted commands in the order used by the printed COBOL.
// The tests compare this stateful model with the independent row/column calculation above.
export function runCobolInserts(rows: readonly Pupil[], inserts: readonly string[]): Scores | undefined {
  const [eof, copy, subtotal, count] = inserts;
  const subtotals = Array<number>(rows[0].scores.length).fill(0);
  const records: Placement[] = [];
  let status = ' ';
  let pupilCount = 0;
  const execute = (instruction: string, column: number, score: number, total: number) => {
    switch (instruction) {
      case 'COMPUTE STUDENT-TOTAL = STUDENT-TOTAL + 1': pupilCount++; return;
      case 'COMPUTE STUDENT-TOTAL = STUDENT-TOTAL + K': pupilCount += column; return;
      case 'COMPUTE SUB-TOTAL(K) = SUB-TOTAL(K) + SCORE(K)': subtotals[column - 1] += score; return;
      case 'MOVE K TO STUDENT-TOTAL': pupilCount = column; return;
      case 'MOVE SCORE(K) TO SUB-TOTAL(K)': subtotals[column - 1] = score; return;
      case 'MOVE TOTAL TO SUB-TOTAL(K)': subtotals[column - 1] = total; return;
      default: throw new Error('unknown statistics command');
    }
  };
  const release = (row: Pupil) => {
    let id = ' ';
    switch (copy) {
      case 'INITIALIZE SORT-REC': id = '0000'; break;
      case 'MOVE SPACE TO READ-STATUS': status = ' '; break;
      case 'MOVE SPACE TO SORT-REC': break;
      case 'MOVE STUDENT-ID TO SORT-REC': id = row.id; break;
      case 'PERFORM RELEASE-DATA': return false;
      case 'SET AT-END TO TRUE': status = 'E'; break;
      default: throw new Error('unknown file command');
    }
    let total = 0;
    let column = 1;
    for (const value of row.scores) {
      total += value;
      execute(subtotal, column++, value, total);
    }
    records.push({ id, total });
    execute(count, column, 0, total);
    return true;
  };
  for (const row of rows) {
    if (status === 'E') break;
    if (!release(row)) return;
  }
  if (status !== 'E') {
    switch (eof) {
      case 'SET AT-END TO TRUE': status = 'E'; break;
      case 'MOVE SPACE TO READ-STATUS': status = ' '; break;
      case 'PERFORM RELEASE-DATA': if (!release(rows.at(-1)!)) return; break;
      case 'INITIALIZE SORT-REC':
      case 'MOVE SPACE TO SORT-REC':
      case 'MOVE STUDENT-ID TO SORT-REC': break;
      default: throw new Error('unknown file command');
    }
  }
  if (status !== 'E' || pupilCount === 0 || subtotals.some(n => !Number.isSafeInteger(n))) return;
  return {
    records: records.sort((a, b) => b.total - a.total || a.id.localeCompare(b.id)),
    pupilCount,
    averagesTenths: subtotals.map(total => Math.trunc(10 * total / pupilCount)),
  };
}

type Op = 'RPUSH' | 'RPOP' | 'RET' | 'LD' | 'LAD' | 'AND' | 'OR' | 'ADDA' |
  'SRL' | 'JMI' | 'JNZ' | 'JUMP' | 'JZE';
type Instruction = { op: Op; reg: number; operand: number; immediate: boolean; count: boolean };
const operations = new Set<Op>(['RPUSH', 'RPOP', 'RET', 'LD', 'LAD', 'AND', 'OR', 'ADDA', 'SRL', 'JMI', 'JNZ', 'JUMP', 'JZE']);

export function assemble(source: string, branch: string, mask = ''): Instruction[] {
  const labels = new Map<string, number>();
  const pending: { op: Op; args: string[]; count: boolean }[] = [];
  for (const raw of source.replaceAll('［a］', branch.trim()).replaceAll('［b］', mask.trim()).split('\n')) {
    const [statement, annotation] = raw.split('←');
    const [first, second, ...rest] = statement.trim().split(/\s+/u);
    const hasLabel = !/^\s/u.test(statement);
    const op = hasLabel ? second : first;
    const args = (hasLabel ? rest.join('') : [second, ...rest].join('')).split(',');
    if (op === 'DC') {
      labels.set(first, parseInt(args[0].slice(1), 16));
    } else if (op !== 'START' && op !== 'END') {
      if (hasLabel) labels.set(first, pending.length);
      assert(operations.has(op as Op), 'unknown CASL instruction: ' + op);
      pending.push({ op: op as Op, args, count: annotation?.trim() === 'α' || annotation?.trim() === 'β' });
    }
  }
  const register = (name: string) => Number(name.slice(2));
  const numeric = (literal: string): number => {
    if (literal.startsWith('=')) literal = literal.slice(1);
    if (literal.startsWith('#')) return parseInt(literal.slice(1), 16);
    if (/^\d+$/u.test(literal)) return Number(literal);
    return labels.get(literal) ?? NaN;
  };
  return pending.map(({ op, args, count }) => {
    const [first, second] = args;
    const jump = op.startsWith('J');
    if (!jump && !first && second === undefined) return { op, reg: 0, operand: 0, immediate: true, count };
    const immediate = jump || !second.startsWith('GR');
    const operand = jump ? numeric(first) : immediate ? numeric(second) : register(second);
    assert(Number.isInteger(operand), op + ' ' + args.join(','));
    return { op, reg: jump ? 0 : register(first), operand, immediate, count };
  });
}

export function execute(code: readonly Instruction[], word: number) {
  const registers = [65534, word, 22, 33, 44, 55, 66, 77];
  const expected = registers.slice(1);
  let saved: number[] = [];
  let markedCount = 0;
  let cursor = 0;
  let zero = false;
  let sign = false;
  for (let step = 0; step < 160; step++) {
    const { op, reg, operand, immediate, count } = code[cursor++];
    if (count) markedCount++;
    const v = immediate ? operand : registers[operand];
    let flagWord = -1;
    switch (op) {
      case 'RPUSH': saved = registers.slice(1); break;
      case 'RPOP': registers.splice(1, saved.length, ...saved); break;
      case 'RET':
        assert(expected.every((value, i) => registers[i + 1] === value));
        return { count: registers[0], markedCount };
      case 'LD': flagWord = registers[reg] = v; break;
      case 'LAD': registers[reg] = v; break;
      case 'AND': flagWord = registers[reg] &= v; break;
      case 'OR': flagWord = registers[reg] |= v; break;
      case 'ADDA': flagWord = registers[reg] = (registers[reg] + v) & 0xffff; break;
      case 'SRL': flagWord = registers[reg] >>>= v; break;
      case 'JMI': if (sign) cursor = operand; break;
      case 'JNZ': if (!zero) cursor = operand; break;
      case 'JUMP': cursor = operand; break;
      case 'JZE': if (zero) cursor = operand; break;
    }
    if (flagWord >= 0) {
      zero = flagWord === 0;
      sign = flagWord >= 0x8000;
    }
  }
  return undefined;
}
