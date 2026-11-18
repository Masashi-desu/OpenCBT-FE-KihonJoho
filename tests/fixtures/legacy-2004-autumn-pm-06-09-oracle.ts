export function referencePrint(records: readonly string[], category: string, head: string) {
  const totals = new Map<string, number>();
  for (const row of records) totals.set(row.slice(5, 8), (totals.get(row.slice(5, 8)) ?? 0) + 1);
  return [head, ...[...totals].sort(([a], [b]) =>
    category.indexOf(a[0]) - category.indexOf(b[0]) || Number(a.slice(1)) - Number(b.slice(1)))
    .map(([key, total]) => key + ' '.repeat(15) + String(total).padStart(3, ' '))];
}

export function printCourseRecords(records: readonly string[], category: string, sessions: number, head: string,
  initial: string, searchItem: string, printCell: string): string[] | undefined {
  if (searchItem !== 'KEN-W3') return undefined;
  const subscripts = /^SU-WK \(([\w-]+) ([\w-]+)\)$/.exec(printCell);
  if (!subscripts) throw Error(printCell);
  const count = Array.from({ length: category.length }, () => Array<number>(sessions).fill(0));
  let index = 0, courseNumber = 0, event = 0;
  for (const record of records) {
    const code = record[5];
    event = Number(record.slice(6, 8));
    switch (initial) {
      case 'SET KEN TO 1': index = 1; break;
      case 'MOVE 1 TO KEN-NO': courseNumber = 1; break;
      case 'SET KEN TO KEN-NO': index = courseNumber; break;
      case 'SET KEN-NO TO KEN': courseNumber = index; break;
      // MOVE cannot replace SET on the index-name and the other SET
      // candidates take an incompatible operand as a subscript or index.
      case 'MOVE 1 TO KEN': case 'MOVE KEN TO KEN-NO': case 'MOVE KEN-NO TO KEN':
      case 'SET KEN TO KEN-N-S': case 'SET KEN-NO TO 1': return undefined;
      default: throw Error(initial);
    }
    if (index < 1) return undefined;
    while (index <= category.length && category[index - 1] !== code) index++;
    if (index > category.length) return undefined;
    courseNumber = index;
    count[courseNumber - 1][event - 1]++;
  }
  const lines = [head];
  for (let row = 1; row <= category.length; row++) {
    for (let column = 1; column <= sessions; column++) {
      // The line is filled with spaces before the non-zero check on [c].
      const values: Record<string, number> = { 'LOOP1': row, 'LOOP2': column,
        'KEN-K-M': event, 'KEN-NO': courseNumber, 'KEN-K-S': 0 };
      const a = values[subscripts[1]], b = values[subscripts[2]];
      if (a < 1 || b < 1 || a > category.length || b > sessions) return undefined;
      const number = count[a - 1][b - 1];
      if (number) lines.push(category[row - 1] + String(column).padStart(2, '0') +
        ' '.repeat(15) + String(number).padStart(3, ' '));
    }
  }
  return lines;
}

type Instruction = { op: string; operands: string[]; label?: string };
export function assemble(program: string, parts: Record<string, string>): Instruction[] {
  return program.split('\n').map(line => line.replace(/\[([abc])\]/g, (_, slot: string) => parts[slot]))
    .map(line => line.split(';')[0]).filter(line => line.trim()).map(line => {
      const hasLabel = /^\w/.test(line);
      const tokens = line.replace("' '", '=32').trim().split(/\s+/);
      const label = hasLabel ? tokens.shift() : undefined;
      const op = tokens.shift()!;
      return { op, label, operands: tokens.join('').split(',') };
    });
}

export function emulate(program: Instruction[], input: string, start = 85): { output: string; length: number; registersRestored: boolean } | undefined {
  const memory = new Map<number, number>([[start, input.length], ...[...input].map((item, i) =>
    [start + i + 1, item.charCodeAt(0)] as const)]);
  const registers = [2, start, 412, 513, 614, 715, 816, 917];
  const entry = [...registers];
  let stack: number[] = [], condition = 0, pc = 0, safe = true;
  const labels = new Map(program.flatMap((instruction, i) => instruction.label ? [[instruction.label, i] as const] : []));
  const reg = (token: string) => /^GR[0-7]$/.test(token) ? Number(token[2]) : undefined;
  const address = (token: string, index?: string) => (Number(token) + (index ? registers[reg(index)!] : 0)) & 65535;
  const read = (token: string, index?: string): number => {
    const r = reg(token);
    if (r !== undefined) return registers[r];
    if (token.startsWith('=')) return Number(token.slice(1));
    const position = address(token, index);
    if (position < start || position >= start + input.length + 1) safe = false;
    return memory.get(position) ?? 0;
  };
  for (let steps = 0; steps < 50 + 20 * input.length && pc < program.length; steps++) {
    const { op, operands: [a, b, c] } = program[pc++];
    const dest = reg(a)!;
    switch (op) {
      case 'START': case 'END': break;
      case 'RPUSH': stack = registers.slice(1); break;
      case 'RPOP': registers.splice(1, stack.length, ...stack); break;
      case 'LAD': registers[dest] = address(b, c); break;
      case 'LD':
        registers[dest] = read(b, c);
        condition = registers[dest] === 0 ? 0 : registers[dest] < 32768 ? 1 : -1;
        break;
      case 'ADDL': registers[dest] = (registers[dest] + read(b, c)) & 65535; break;
      case 'SUBL': registers[dest] = (registers[dest] - read(b, c)) & 65535; break;
      case 'CPL': condition = Math.sign(registers[dest] - read(b, c)); break;
      case 'ST': {
        const location = address(b, c);
        if (location < start || location >= start + input.length + 1) return undefined;
        memory.set(location, registers[dest]);
        break;
      }
      case 'JNZ': if (condition !== 0) pc = labels.get(a)!; break;
      case 'JZE': if (condition === 0) pc = labels.get(a)!; break;
      case 'JMI': if (condition < 0) pc = labels.get(a)!; break;
      case 'JUMP': pc = labels.get(a)!; break;
      case 'RET': {
        const length = memory.get(start)!;
        if (!safe || length > input.length) return undefined;
        let output = '';
        for (let k = 1; k <= length; k++) output += String.fromCharCode(memory.get(start + k)!);
        return { output, length, registersRestored: registers.every((value, i) => value === entry[i]) };
      }
      default: throw Error(op);
    }
    if (!safe) return undefined;
  }
  return undefined;
}

export function referenceSpace(input: string) {
  const selected = [...input].filter((character, i) => character !== ' ' || input[i - 1] !== ' ');
  return { output: selected.join(''), length: selected.length, registersRestored: true };
}
