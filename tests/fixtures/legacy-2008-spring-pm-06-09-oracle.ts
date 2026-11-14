/** Executes the displayed COBOL operations before comparing them with an array oracle. */
export function executeSurvey(program: string, answers: readonly string[], ballots: readonly number[][]) {
  const width = Number(/PIC 9\(1\) OCCURS (\d+)\./.exec(program)?.[1]);
  const limit = Number(/IF CHOICE-CNT <= (\d+) THEN/.exec(program)?.[1]);
  const placement = /^行番号(\d+)(?:と(\d+)の間|の次)$/.exec(answers[3]);
  if (!placement || placement[2] && Number(placement[2]) !== Number(placement[1]) + 1)
    throw Error('Unexpected COBOL output placement');
  const printAfterLine = Number(placement[1]);
  if (![32, 36, 41, 45].includes(printAfterLine)) throw Error('Unexpected COBOL output line');
  const totals = Array<number>(width).fill(0);
  const output: (number | number[])[] = [];
  let marked = 0, rejected = 0, position = 0, ballot: number[] = [];

  function read(name: string): number {
    if (name === 'CHOICE-CNT') return marked;
    if (name === 'INV-CNT') return rejected;
    if (name === 'WK-CNT') return position + 1;
    if (position >= width) throw Error('COBOL table index after PERFORM');
    if (name === 'EVENT(WK-CNT)') return ballot[position];
    if (name === 'EVENT-TOTAL(WK-CNT)') return totals[position];
    throw Error('Unexpected COBOL operand ' + name);
  }
  function write(name: string, value: number) {
    if (name === 'CHOICE-CNT') marked = value % 10;
    else if (name === 'INV-CNT') rejected = value % 10000;
    else if (name === 'EVENT-TOTAL(WK-CNT)' && position < width) totals[position] = value % 10000;
    else throw Error('Unexpected COBOL destination ' + name);
  }
  function execute(raw: string) {
    const statement = raw.replace(/\s+/g, ' ').trim();
    const compute = /^COMPUTE (\S+) = (\S+) \+ (\S+)(?: \* (\d+))?$/.exec(statement);
    const move = /^MOVE (\S+) TO (\S+)$/.exec(statement);
    const add = /^ADD (\d+) TO (\S+)$/.exec(statement);
    if (compute) {
      const [, target, left, right, weight = '1'] = compute;
      write(target, read(left) + read(right) * Number(weight));
    } else if (move) {
      write(move[2], read(move[1]));
    } else if (add) {
      write(add[2], read(add[2]) + Number(add[1]));
    } else throw Error('Unexpected COBOL statement ' + statement);
  }
  for (ballot of ballots) {
    if (printAfterLine === 32) output.push(rejected);
    marked = 0;
    for (position = 0; position < width; position++) execute(answers[0]);
    if (printAfterLine === 36) output.push(rejected);
    if (marked <= limit) {
      for (position = 0; position < width; position++) execute(answers[1]);
    } else {
      execute(answers[2]);
    }
    if (printAfterLine === 41) output.push(rejected);
  }
  output.push(totals);
  if (printAfterLine === 45) output.push(rejected);
  return output;
}

function assemble(listing: string) {
  const instructions: { op: string; operands: string[] }[] = [];
  const destinations = new Map<string, number>();
  for (const source of listing.split('\n')) {
    const code = source.replace(/\s+;.*$/, '').trimEnd();
    if (!code.trim() || code.startsWith(';')) continue;
    const match = /^(?:(\S+)\s+|\s+)(\S+)(?:\s+(.*))?$/.exec(code);
    if (!match) throw Error('Unexpected CASL line');
    const [, label, op, operands] = match;
    if (label) destinations.set(label, instructions.length);
    if (op === 'END' || op === 'START') continue;
    instructions.push({ op, operands: operands?.split(',') ?? [] });
  }
  return { instructions, destinations };
}

/** Instruction interpreter for the exact CASL II subset shown on the paper. */
export function executeTokens(listing: string, text: string, base: number, outputBase: number, reserved: number) {
  const { instructions, destinations } = assemble(listing);
  const word = (value: number) => (value + 65536) % 65536;
  const indexOf = (operand: string) => Number(operand.slice(2));
  const rank = (character: string) => character.charCodeAt(0);
  const sentry = 0xABCD;
  const memory = new Map<number, number>([[0, 0x4321], [1, 0x5678]]);
  [...text].forEach((character, offset) => memory.set(base + offset, rank(character)));
  const stride = 3 + reserved;
  for (let offset = 0; offset < Math.max(20, text.length * stride); offset++) memory.set(outputBase + offset, sentry);
  const initial = [0x56, base, outputBase, 3, 4, 5, 6, 7];
  const registers = [...initial];
  const stack: number[] = [];
  let pc = 0, relation = 0;
  const scalar = (value: string) => value.startsWith("'") ? rank(value[1]) : word(Number(value));
  const address = (value: string, index?: string) => word(scalar(value) + (index ? registers[indexOf(index)] : 0));
  const valueOf = (value: string, index?: string) => {
    if (value.startsWith('GR')) return registers[indexOf(value)];
    if (value.startsWith('=')) return scalar(value.slice(1));
    const found = memory.get(address(value, index));
    if (found === undefined) throw Error('uninitialized CASL memory');
    return found;
  };
  const jump = (name: string) => {
    const destination = destinations.get(name);
    if (destination === undefined) throw Error('unknown CASL label ' + name);
    pc = destination;
  };
  function load(register: number, value: number) {
    registers[register] = value;
    relation = value === 0 ? 0 : value < 0x8000 ? 1 : -1;
  }
  for (let steps = 0; steps < 800; steps++) {
    const instruction = instructions[pc++];
    if (!instruction) throw Error('unexpected end of CASL instructions');
    const { op, operands: [a, b, x] } = instruction;
    switch (op) {
      case 'RPUSH':
        stack.push(...registers.slice(1));
        break;
      case 'RPOP':
        if (stack.length < 7) throw Error('CASL stack underflow');
        registers.splice(1, 7, ...stack.splice(-7));
        break;
      case 'LD': load(indexOf(a), valueOf(b, x)); break;
      case 'LAD': registers[indexOf(a)] = address(b, x); break;
      case 'CPL': relation = Math.sign(registers[indexOf(a)] - valueOf(b, x)); break;
      case 'SUBL': load(indexOf(a), word(registers[indexOf(a)] - valueOf(b, x))); break;
      case 'ST': memory.set(address(b, x), registers[indexOf(a)]); break;
      case 'JZE': if (relation === 0) jump(a); break;
      case 'JNZ': if (relation !== 0) jump(a); break;
      case 'JMI': if (relation < 0) jump(a); break;
      case 'JPL': if (relation > 0) jump(a); break;
      case 'JUMP': jump(a); break;
      case 'CALL': stack.push(pc); jump(a); break;
      case 'RET': {
        const next = stack.pop();
        if (next === undefined) {
          if (registers.some((value, index) => value !== initial[index])) throw Error('registers were not restored');
          const count = Array.from({ length: text.length + 1 }, (_, index) => index * stride)
            .find(offset => memory.get(outputBase + offset) === 0xffff);
          if (count === undefined) throw Error('CASL result has no sentinel');
          return Array.from({ length: count + 1 }, (_, offset) => {
            const value = memory.get(outputBase + offset);
            return value === 0xffff ? -1 : value === sentry ? null : value;
          });
        }
        pc = next;
        break;
      }
      default: throw Error('unsupported CASL opcode ' + op);
    }
  }
  throw Error('CASL program did not finish');
}
