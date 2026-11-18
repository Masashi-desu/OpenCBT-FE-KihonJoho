/** Bounded executor of the instruction subset in the two displayed programs. */
type Instruction = { line: number; op: string; operands: string[] };
type Module = { instructions: Instruction[]; labels: Map<string, number>; memory: Map<string, number> };
const opcodes = new Set([
  'START', 'END', 'DS', 'RPUSH', 'RPOP', 'IN', 'LD', 'ST', 'LAD', 'ADDL', 'ADDA', 'SUBL',
  'JZE', 'JMI', 'JNZ', 'JPL', 'JUMP', 'CPL', 'SLL', 'AND', 'OR', 'XOR', 'CALL', 'RET',
]);

function compile(text: string, answers: Record<string, string>, firstAddress: number, optimize = false): Module {
  const instructions: Instruction[] = [];
  const labels = new Map<string, number>(), memory = new Map<string, number>();
  let next = firstAddress;
  for (const row of text.split('\n')) {
    const match = /^\s*(\d+)\s+(\S.*?)\s*(?:;.*)?$/.exec(row);
    if (!match) throw Error('行番号を読み取れません: ' + row);
    const line = Number(match[1]);
    if (optimize && (line === 21 || line === 22)) continue;
    const listing = match[2].replace(/\[([abc])\]/, (_, name: string) => answers[name]);
    const tokens = (optimize && line === 20 ? 'SLL GR0,2' : listing).split(/\s+/);
    const label = opcodes.has(tokens[0]) ? undefined : tokens.shift();
    const opcode = tokens.shift()!;
    if (opcode === 'DS') {
      memory.set(label!, next);
      next += Number(tokens[0]);
    } else {
      if (label) labels.set(label, instructions.length);
      if (opcode !== 'START' && opcode !== 'END') {
        // A space inside a character literal is an operand.
        const raw = listing.includes("=' '") ? "GR4,=' '" : tokens.join('');
        instructions.push({ line, op: opcode, operands: raw ? raw.split(',') : [] });
      }
    }
  }
  return { instructions, labels, memory };
}

const word = (value: number) => value & 0xffff;
const signed = (value: number) => value >= 0x8000 ? value - 0x10000 : value;

export function makeConversionMachine(nread: string, dtob: string, answers: Record<string, string>, optimize = false) {
  const scanner = compile(nread, answers, 0x1200), converter = compile(dtob, answers, 0x1800, optimize);
  return function convert(input: string | null, mode: 'read' | 'convert' = 'read', digitZero = 48) {
    const memory = new Uint16Array(65536), stack: number[][] = [];
    const initial = [3311, 0x2000, 532, 765, 987, 219, 512, 4092], registers = [...initial];
    const codeOf = (char: string) => {
      if (char === ' ') return digitZero - 11;
      if (char === '-') return digitZero - 3;
      if (char === 'A') return digitZero + 17;
      return /^\d$/.test(char) ? digitZero + Number(char) : digitZero + 20;
    };
    if (mode === 'convert') {
      memory[initial[1]] = input!.length;
      [...input!].forEach((char, index) => { memory[initial[1] + index + 1] = codeOf(char); });
    }
    let relation = 0, steps = 0;
    let scannerError: { line: number; pointer: number } | undefined;
    let converterError: number | undefined;
    function execute(module: Module) {
      const address = (value: string, index?: string) => word(
        (module.memory.get(value) ?? Number(value)) + (index ? registers[Number(index.slice(2))] : 0));
      const valueOf = (value: string, index?: string) => {
        if (value.startsWith("='")) return codeOf(value.slice(2, -1));
        if (value.startsWith('=#')) return parseInt(value.slice(2), 16);
        if (value.startsWith('=')) return word(Number(value.slice(1)));
        if (value.startsWith('GR')) return registers[Number(value.slice(2))];
        return memory[address(value, index)];
      };
      const store = (register: number, value: number) => {
        registers[register] = word(value);
        relation = Math.sign(signed(registers[register]));
      };
      const jump = (label: string, from: number) => {
        if (label === 'ERR') {
          if (module === scanner) scannerError = { line: from, pointer: registers[5] };
          else converterError = from;
        }
        return module.labels.get(label)!;
      };
      let pc = 0;
      for (;;) {
        if (++steps > 9000) throw Error('停止しない命令列');
        const { line, op, operands: [a, b, c] } = module.instructions[pc++];
        const register = a?.startsWith('GR') ? Number(a.slice(2)) : 0;
        const current = registers[register];
        switch (op) {
          case 'RPUSH': stack.push(registers.slice(1)); break;
          case 'RPOP': registers.splice(1, 7, ...stack.pop()!); break;
          case 'IN': {
            memory[address(b)] = input === null ? word(-1) : Math.min(input.length, 256);
            [...(input ?? '').slice(0, 256)].forEach((char, i) => { memory[address(a) + i] = codeOf(char); });
            break;
          }
          case 'LAD': registers[register] = address(b, c); break;
          case 'LD': store(register, valueOf(b, c)); break;
          case 'ST': memory[address(b, c)] = current; break;
          case 'CPL': relation = Math.sign(current - valueOf(b, c)); break;
          case 'ADDL': case 'ADDA': store(register, current + valueOf(b, c)); break;
          case 'SUBL': store(register, current - valueOf(b, c)); break;
          case 'AND': store(register, current & valueOf(b, c)); break;
          case 'OR': store(register, current | valueOf(b, c)); break;
          case 'XOR': store(register, current ^ valueOf(b, c)); break;
          case 'SLL': {
            const count = address(b, c);
            store(register, count >= 16 ? 0 : current * 2 ** count);
            break;
          }
          case 'JZE': if (relation === 0) pc = jump(a, line); break;
          case 'JMI': if (relation < 0) pc = jump(a, line); break;
          case 'JNZ': if (relation !== 0) pc = jump(a, line); break;
          case 'JPL': if (relation > 0) pc = jump(a, line); break;
          case 'JUMP': pc = jump(a, line); break;
          case 'CALL': if (a !== 'DTOB') throw Error(a); else execute(converter); break;
          case 'RET': return;
          default: throw Error('未対応の命令: ' + op);
        }
      }
    }
    execute(mode === 'read' ? scanner : converter);
    return { value: signed(registers[0]), scannerError, converterError, registersRestored: stack.length === 0 &&
      registers.slice(1).every((part, i) => part === initial[i + 1]) };
  };
}

export function referenceNumber(input: string | null) {
  if (input === null) return -32768;
  const text = input.slice(0, 256).replaceAll(' ', '');
  if (!/^-?\d+$/.test(text)) return -32768;
  const n = BigInt(text);
  return n < -32767n || n > 32767n ? -32768 : Number(n);
}
