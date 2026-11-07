import assert from 'node:assert/strict';

/** Forward substitution deliberately differs from the coordinate recursion in Q9. */
export function expandFractal(pattern: number[][], depth: number) {
  let picture = ['*'];
  for (let level = 0; level < depth; level++) {
    picture = picture.flatMap(row => pattern.map(rule =>
      [...row].map(mark => rule.map(value => mark === '*' && value ? '*' : ' ').join('')).join('')));
  }
  return picture;
}
export function readCInitializer(source: string): number[][] {
  const found = /int pat\[(\d+)\]\[(\d+)\]\s*=\s*\{([\s\S]*?)\};/.exec(source);
  assert(found);
  const values = [...found[3].matchAll(/\{([^{}]*)\}/g)].map(m => m[1].split(',').map(Number));
  assert.equal(values.length, Number(found[1]));
  assert(values.every(row => row.length === Number(found[2]) && row.every(value => value === 0 || value === 1)));
  return values;
}

export function calendarBefore(date: string, days: number) {
  const year = Number(date.slice(0, 4)), month = Number(date.slice(4, 6)), day = Number(date.slice(6));
  return new Date(Date.UTC(year, month - 1, day - days)).toISOString().slice(0, 10).replaceAll('-', '');
}
export function reservationOracle(before: number[] | null, total: number, requested: number, id: number) {
  const empty = before?.reduce<number[]>((indices, value, i) => value === 0 ? [...indices, i] : indices, [])
    ?? Array.from({length: total}, (_, i) => i);
  if (empty.length < requested) return { saved: before, status: 9, free: empty.length };
  const saved = before ? [...before] : Array(total).fill(0) as number[];
  empty.slice(0, requested).forEach(i => { saved[i] = id; });
  return { saved, status: 0, free: 0 };
}
export function compiledCancellationCandidate(source: string, monthSource: string) {
  const days = Number(/IF CAN-DD > (\d+)/.exec(source)?.[1]);
  assert(days > 0 && days < 29);
  assert(source.includes(`SUBTRACT ${days} FROM CAN-DD`) && source.includes(`COMPUTE CAN-DD = 31 + CAN-DD - ${days}`));
  const months = (/"(\d{24})"/.exec(monthSource)?.[1] ?? '').match(/.{2}/g)?.map(Number);
  assert.equal(months?.length, 12);
  assert(source.includes('DIVIDE CAN-YYYY BY 4') && source.includes('GIVING QUOTIENT REMAINDER URU-SUPPLY'));
  const dayRule = source.split('\n').find(line => /MONTH-ELM|COMPUTE CAN-DD = 30/.test(line))?.trim();
  const leapRule = /IF (QUOTIENT > (\d+)|URU-SUPPLY (?:NOT )?= ZERO) THEN/.exec(source);
  assert(leapRule);
  return (value: string) => {
    let year = Number(value.slice(0, 4)), month = Number(value.slice(4, 6)), day = Number(value.slice(6));
    if (day > days) day -= days;
    else if (month === 1) { year--; month = 12; day += 31 - days; }
    else {
      month--;
      if (dayRule?.includes('MONTH-ELM(CAN-MM - 1)')) day = months![month - 2] - days;
      else if (dayRule?.includes('MONTH-ELM(CAN-MM)')) day += months![month - 1] - days;
      else if (dayRule?.includes('= 30 +')) day += 30 - days;
      else day -= days;
      if (month === 2) {
        const condition = leapRule[1].startsWith('QUOTIENT')
          ? Math.floor(year / 4) > Number(leapRule[2])
          : leapRule[1].includes('NOT') ? year % 4 !== 0 : year % 4 === 0;
        if (condition) day++;
      }
    }
    return [year, month, day].map(value => String(value).padStart(2, '0')).join('');
  };
}
export function compileReservationCandidate(program: string) {
  const total = Number(/RSV-ROOM\s+OCCURS (\d+)/.exec(program)?.[1]);
  assert(total >= 1 && total < 9);
  const action = /^32\s+(.+)$/m.exec(program)?.[1].trim();
  const test = (expression: string, values: Record<string, number>) => {
    const [left, operation, right] = expression.split(' ');
    const a = values[left], b = values[right] ?? Number(right);
    return operation === '>' ? a > b : operation === '<' ? a < b : a === b;
  };
  const stop = /^38.*UNTIL (.+)$/m.exec(program)?.[1], commit = /^47\s+IF (.+) THEN$/m.exec(program)?.[1];
  assert(action && stop && commit && program.includes('IF RSV-NO(CNT) = ZERO THEN'));
  assert(program.includes('IF PRM-ROOM > GET-ROOM THEN') && program.includes('REWRITE RSV-REC') && program.includes('ADD 1 TO PRM-FREE'));
  return (before: number[] | null, requested: number, id: number) => {
    if (!before) {
      const saved = Array(total).fill(0) as number[];
      for (let i = 0; i < requested; i++) {
        if (action === 'MOVE PRM-NO TO RSV-NO(CNT)') saved[i] = id;
      }
      return { saved, status: 0, free: 0 };
    }
    const working = [...before], values = { CNT: 1, 'GET-ROOM': 0, 'PRM-ROOM': requested };
    let free = 0;
    while (!test(stop, values)) {
      const index = values.CNT - 1;
      if (index >= working.length) throw new Error('invalid 1-based room index');
      if (working[index] === 0) {
        if (requested > values['GET-ROOM']) {
          working[index] = id;
          values['GET-ROOM']++;
        }
        free++;
      }
      values.CNT++;
    }
    return test(commit, values)
      ? { saved: working, status: 0, free: 0 }
      : { saved: before, status: 9, free };
  };
}

type Input = readonly [team: number, seconds: number];
type Registers = number[];
type Operation = {instruction: string; args: string[]; sourceLine: number};
const SIGN = 0x8000, WORD = 0x10000;
const signed = (value: number) => (value & (WORD - 1)) - ((value & SIGN) ? WORD : 0);

/** Interpreter for the exact instruction subset needed by the two source programs.
 * Source operands and line numbers are read, including candidates substituted by tests. */
export function caslRaceRunner(source: string) {
  const labels = new Map<string, number>(), locations = new Map<string, number>(), initial: number[] = [];
  const ops: Operation[] = [];
  for (const raw of source.split('\n')) {
    const numbered = /^\s*(\d+) /.exec(raw);
    let line = raw.slice(numbered?.[0].length ?? 0).split(';')[0].trimEnd();
    const label = /^(\w+)\s+/.exec(line);
    if (label) line = line.slice(label[0].length);
    const match = /^([A-Z]+)(?:\s+(.+))?$/.exec(line.trimStart());
    assert(match, raw);
    const [, instruction, operands] = match;
    const args = operands?.split(',') ?? [];
    if (instruction === 'START' || instruction === 'END') continue;
    if (instruction === 'DC' || instruction === 'DS') {
      if (label) locations.set(label[1], initial.length);
      if (instruction === 'DS') initial.push(...Array(Number(args[0])).fill(0));
      else initial.push(...args.map(value => value.startsWith("'") ? value.charCodeAt(1) : Number(value)));
    } else {
      if (label) labels.set(label[1], ops.length);
      ops.push({instruction, args, sourceLine: Number(numbered?.[1])});
    }
  }
  return (input: Input[], start?: Input) => {
    const r: Registers = Array(8).fill(0), memory = [...initial], output: Input[] = [], text: string[] = [];
    if (start) [r[1], r[2]] = start;
    let last = 0, cursor = 0, inputIndex = 0, subtracts = 0, steps = 0;
    let saved: Registers = [];
    const register = (operand: string) => /^GR[0-7]$/.test(operand) ? Number(operand[2]) : -1;
    const address = ([name, offset]: string[]) => {
      const base = locations.get(name) ?? Number(name);
      const value = base + (offset ? r[register(offset)] : 0);
      if (!Number.isInteger(value) || value < 0 || value >= memory.length) throw new Error('memory address');
      return value;
    };
    const value = (operands: string[]) => {
      const operand = operands[0], number = register(operand);
      if (number >= 0) return r[number];
      if (operand.startsWith('=#')) return parseInt(operand.slice(2), 16);
      if (operand.startsWith('=')) return Number(operand.slice(1));
      return memory[address(operands)];
    };
    const jump = (label: string) => {
      const line = labels.get(label);
      if (line === undefined) throw new Error('unknown label');
      cursor = line;
    };
    while (steps++ < 7500) {
      const {instruction, args, sourceLine} = ops[cursor++];
      const first = args.length ? register(args[0]) : -1;
      const update = (next: number) => { r[first] = signed(next); last = r[first]; };
      switch (instruction) {
        case 'CALL':
          if (args[0] === 'OUTPUT') { output.push([r[1], r[2]]); break; }
          assert.equal(args[0], 'INPUT');
          if (inputIndex === input.length) r[0] = -1;
          else { r[0] = 1; [r[1], r[2]] = input[inputIndex++]; }
          break;
        case 'LD': update(value(args.slice(1))); break;
        case 'LAD': r[first] = address(args.slice(1)); break;
        case 'ADDA': update(r[first] + value(args.slice(1))); break;
        case 'SUBA':
          update(r[first] - value(args.slice(1)));
          if (sourceLine === 12) subtracts++;
          break;
        case 'ST': memory[address(args.slice(1))] = r[first]; break;
        case 'CPA': last = r[first] - value(args.slice(1)); break;
        case 'OR': update(r[first] | value(args.slice(1))); break;
        case 'SRL': update((r[first] & (WORD - 1)) >>> Number(args[1])); break;
        case 'JMI': if (last < 0) jump(args[0]); break;
        case 'JPL': if (last > 0) jump(args[0]); break;
        case 'JZE': if (last === 0) jump(args[0]); break;
        case 'JUMP': jump(args[0]); break;
        case 'RPUSH': saved = r.slice(1); break;
        case 'RPOP': r.splice(1, saved.length, ...saved); break;
        case 'OUT': {
          const start = address([args[0]]), length = memory[address([args[1]])];
          text.push(String.fromCharCode(...memory.slice(start, start + length)));
          break;
        }
        case 'RET': return { output, text, subtracts, registers: r };
        default: throw new Error('unknown operation ' + instruction);
      }
    }
    throw new Error('execution limit');
  };
}
export function standingsOracle(input: Input[], ascending: boolean) {
  const teams = Array.from({length: 9}, (_, index) => index + 1).map(team => ({
    team, total: input.reduce((sum, [code, seconds]) => sum + (code === team ? seconds : 0), 0),
  }));
  return teams.sort((a, b) => a.total - b.total || (ascending ? a.team - b.team : b.team - a.team))
    .map(({team, total}) => [team, Math.floor(total / 8)]);
}

type Sale = {year: number; product: string; price: number; quantity: number};
export function salesOracle(data: Sale[]) {
  const groups = new Map<string, number>();
  for (const {year, product, price, quantity} of data) {
    const key = year + ':' + product;
    groups.set(key, (groups.get(key) ?? 0) + price * quantity);
  }
  return new Map([...groups].map(([key, value]) => [key, Math.floor((value + 500) / 1000)]));
}
export function salesMacroCandidate(source: string, data: Sale[], products: string[]) {
  const lineE = source.split('\n').find(line => /■ 相対\(C2/.test(line));
  const compare = /相対\(C2, (\w+), (\w+)\) ([=≠]) 相対\(販売データ!([BD])2, data_row, 0\)/.exec(lineE ?? '');
  const subtotal = /・subtotal ← subtotal \+\n([^\n]+)/.exec(source)?.[1] ?? '';
  const salesParts = [...subtotal.matchAll(/相対\(販売データ!([AFG])([12]), (data_row|total_row), ([056])\)/g)];
  const advance = /・total_row ← (0|total_row \+ (\d+))\n■$/.exec(source);
  if (!compare || salesParts.length !== 2 || !advance) throw new Error('invalid macro branch');
  const subtotalMap = new Map<string, number>(), cellWrites = new Map<number, number>();
  assert(source.includes('≠ null') && source.includes('四捨五入(subtotal / 1000, 0)') &&
    source.includes('相対(C3, total_row, total_col)'));
  let step = 0, dataRow = 0, totalRow = 0;
  while (dataRow < data.length) {
    const year = data[dataRow].year;
    cellWrites.set(3 + totalRow, year);
    let totalCol = 0;
    while (data[dataRow]?.year === year) {
      let subtotal = 0;
      for (;;) {
        if (step++ > 5000 || totalCol >= products.length) throw new Error('invalid data access');
        const selected = compare[1] === '0' && compare[2] === 'total_col' ? products[totalCol] : undefined;
        const current = compare[4] === 'D' ? data[dataRow]?.product : 1;
        if ((selected === current) !== (compare[3] === '=')) break;
        const [unit, quantity] = salesParts.map(([, base, number, row, column]) => {
          const line = (row === 'data_row' ? dataRow : totalRow) + Number(number) - 2;
          const item = data[line];
          if (!item) throw new Error('outside source data');
          return (base === 'F' || base === 'A' && column === '5') ? item.price : item.quantity;
        });
        subtotal += unit * quantity;
        dataRow++;
      }
      subtotalMap.set(year + ':' + products[totalCol], Math.floor((subtotal + 500) / 1000));
      totalCol++;
    }
    totalRow = advance[1] === '0' ? 0 : totalRow + Number(advance[2]);
  }
  return { subtotalMap, cellWrites };
}
