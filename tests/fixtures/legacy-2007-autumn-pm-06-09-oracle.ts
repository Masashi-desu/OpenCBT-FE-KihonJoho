export function executeHealth(listing: string, edit: string, choices: readonly string[], previous: readonly (number | null)[],
  yearWeight: number, found: boolean) {
  const count = Number(listing.match(/MAST-HEALTH +OCCURS (\d+)\./)?.[1]);
  const last = Number(listing.match(/VARYING CNT FROM (\d+) BY -1 UNTIL CNT = 0/)?.[1]);
  if (count !== previous.length || !Number.isInteger(last)) throw Error('Invalid COBOL array layout');
  const match = /^行番号(\d+)と(\d+)の間$/.exec(choices[2]);
  if (!match || Number(match[2]) !== Number(match[1]) + 1) throw Error('Invalid COBOL insertion position');
  const editAfter = Number(match[1]);
  const master = [...previous], outputs: string[] = [];
  const rangeOperand = (op: string) => /^(?:YEAR-WEIGHT|MAST-WEIGHT\([12]\))$/.test(op);
  const value = (op: string) => {
    if (op === 'YEAR-WEIGHT') return yearWeight;
    const stored = master[Number(op.at(-2)) - 1];
    if (stored === null || stored === undefined) throw Error('Non-numeric history');
    return stored;
  };
  function guard(condition: string) {
    const comparison = /^(\S+) (<=|>=) (\S+) ([+-]) (\d+)$/.exec(condition);
    if (!comparison || !rangeOperand(comparison[1]) || !rangeOperand(comparison[3])) throw Error('Invalid COBOL comparison');
    const [, left, operator, right, sign, difference] = comparison;
    const cutoff = value(right) + (sign === '+' ? 1 : -1) * Number(difference) * 10;
    return operator === '>=' ? value(left) >= cutoff : value(left) <= cutoff;
  }
  function check(active: boolean) {
    if (!active) throw Error('COBOL data used outside valid read');
    const first = /^IF (.+) OR$/m.exec(edit)?.[1];
    if (!first) throw Error('Missing COBOL edit condition');
    if (guard(first) || guard(choices[3])) outputs.push('HEALTH');
  }
  function index(operand: string, i: number) {
    const calc = /^MAST-HEALTH\(CNT(?: ([+-]) (1))?\)$/.exec(operand);
    if (!calc) throw Error('Invalid COBOL history operand');
    const offset = calc[1] === '+' ? 1 : calc[1] === '-' ? -1 : 0;
    const position = i + offset - 1;
    if (position < 0 || position >= count) throw Error('COBOL subscript outside record');
    return position;
  }
  function move(line: string, i?: number): boolean {
    if (line === 'MOVE YEAR-ENO TO MAST-ENO') return true;
    if (line === 'MOVE YEAR-HEALTH TO MAST-HEALTH') { master.fill(yearWeight); return false; }
    const statement = /^MOVE (.+) TO (.+)$/.exec(line);
    if (!statement || i === undefined) throw Error('Missing valid COBOL MOVE / subscript');
    const [, from, to] = statement;
    const payload = from === 'YEAR-HEALTH' ? yearWeight : master[index(from, i)];
    master[index(to, i)] = payload;
    return false;
  }
  if (editAfter === 26) check(false);
  const movedKey = move(choices[0]);
  if (!movedKey || !found) {
    outputs.push('MISSING');
  } else {
    if (editAfter === 39) check(true);
    for (let i = last; i > 0; i--) move(choices[1], i);
    master[0] = yearWeight;
    if (editAfter === 37) check(true);
  }
  if (editAfter === 30) check(false);
  return { master, outputs };
}

type Instruction = { op: string; operands: string[] };
function assemble(listing: string) {
  const program: Instruction[] = [], address = new Map<string, number>();
  for (const line of listing.split('\n')) {
    const code = line.replace(/^\s*\d+ {2}/, '').split(';', 1)[0].trimEnd();
    const match = /^(?:(\S+)\s+|\s+)(\S+)(?:\s+(.*))?$/.exec(code);
    if (!match) throw Error('Unexpected CASL II listing');
    const [, label, op, operands] = match;
    if (label) address.set(label, program.length);
    if (op !== 'START' && op !== 'END') program.push({ op, operands: operands?.split(',') ?? [] });
  }
  return { program, address };
}
export function parityMachine(listing: string, inputs: readonly number[], endInitial = 0x5817) {
  const { program, address } = assemble(listing);
  const base = 512, end = base + inputs.length;
  const memory = new Map([[base - 1, 0x125A], [end, endInitial], [end + 1, 0x958C]]);
  inputs.forEach((value, i) => memory.set(base + i, value));
  const initial = [0x703, inputs.length, base, 3, 4, 5, 6, 7], register = [...initial], stack: number[] = [];
  let pc = 0, zero = false, negative = false, overflow = false;
  const id = (name: string) => Number(name.slice(2));
  const integer = (operand: string) => operand.startsWith('#') ? Number.parseInt(operand.slice(1), 16) : Number(operand);
  const target = (operand: string, index?: string) => (integer(operand) + (index ? register[id(index)] : 0)) & 0xFFFF;
  const operandValue = (operand: string, index?: string) => {
    if (operand.startsWith('GR')) return register[id(operand)];
    if (operand.startsWith('=')) return integer(operand.slice(1));
    const value = memory.get(target(operand, index));
    if (value === undefined) throw Error('Uninitialized CASL II memory');
    return value;
  };
  const jump = (label: string) => {
    const next = address.get(label);
    if (next === undefined) throw Error('Undefined CASL II label');
    pc = next;
  };
  function store(reg: number, result: number, flag = false) {
    register[reg] = result & 0xFFFF;
    zero = register[reg] === 0;
    negative = (register[reg] & 0x8000) !== 0;
    overflow = flag;
  }
  for (let cycles = 0; cycles < 1024 + inputs.length * 120; cycles++) {
    const { op, operands: [left, right, extra] } = program[pc++];
    const front = id(left ?? 'GR0');
    switch (op) {
      case 'RPUSH': stack.push(...register.slice(1)); break;
      case 'RPOP':
        for (let i = 7; i >= 1; i--) register[i] = stack.pop()!;
        break;
      case 'LAD': register[front] = target(right, extra); break;
      case 'LD': store(front, operandValue(right, extra)); break;
      case 'ADDL': {
        const result = register[front] + operandValue(right, extra);
        store(front, result, result > 0xFFFF);
        break;
      }
      case 'SLL': store(front, register[front] << integer(right), (register[front] & 0x8000) !== 0); break;
      case 'OR': store(front, register[front] | operandValue(right, extra)); break;
      case 'XOR': store(front, register[front] ^ operandValue(right, extra)); break;
      case 'ST': memory.set(target(right, extra), register[front]); break;
      case 'CPL': {
        const comparison = register[front] - operandValue(right, extra);
        zero = comparison === 0; negative = comparison < 0; overflow = false;
        break;
      }
      case 'JPL': if (!zero && !negative) jump(left); break;
      case 'JMI': if (negative) jump(left); break;
      case 'JZE': if (zero) jump(left); break;
      case 'JNZ': if (!zero) jump(left); break;
      case 'JOV': if (overflow) jump(left); break;
      case 'JUMP': jump(left); break;
      case 'RET':
        if (stack.length || initial.some((value, index) => value !== register[index])) throw Error('Registers not restored');
        if (memory.get(base - 1) !== 0x125A || memory.get(end + 1) !== 0x958C) throw Error('Out-of-block write');
        return Array.from({ length: inputs.length + 1 }, (_, offset) => memory.get(base + offset)!);
      default: throw Error('Unexpected CASL II instruction: ' + op);
    }
  }
  throw Error('CASL II did not terminate');
}
