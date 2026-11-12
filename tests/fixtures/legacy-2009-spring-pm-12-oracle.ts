type Registers = number[];
type Machine = { registers: Registers; memory: Map<number, number>; flags: { zero: boolean; sign: boolean; overflow: boolean }; stack: number[] };
const word = (value: number) => value & 0xffff;
const r = (operand: string) => Number(operand.slice(2));

function assemble(program: string, choices: Record<string, string>) {
  const labels = new Map<string, number>();
  const code: { command: string; args: string[] }[] = [];
  for (const raw of program.split('\n')) {
    let line = raw.split(';', 1)[0].trimEnd();
    if (!line) continue;
    if (!/^\s/.test(line)) {
      const [label, rest] = line.trim().split(/\s+(.+)/);
      labels.set(label, code.length);
      line = rest;
    }
    line = line.trim().replace(/［([a-e])］/, (_, slot) => choices[slot]);
    const [command, args] = line.split(/\s+(.+)/);
    code.push({ command, args: args?.split(',') ?? [] });
  }
  return { labels, code };
}

function run(program: ReturnType<typeof assemble>, machine: Machine, subroutine?: (state: Machine) => boolean) {
  const { registers, memory, flags, stack } = machine;
  const address = (base: string, offset?: string) => word((base === 'SV' ? 600 : Number(base)) + (offset ? registers[r(offset)] : 0));
  const read = (base: string, offset?: string) => base.startsWith('GR') ? registers[r(base)] :
    base.startsWith('=') ? Number(base.slice(1)) : memory.get(address(base, offset)) ?? 0;
  const record = (target: number, raw: number, overflow = false) => {
    registers[target] = word(raw);
    flags.zero = registers[target] === 0;
    flags.sign = (registers[target] & 0x8000) !== 0;
    flags.overflow = overflow;
  };
  let pc = 0;
  for (let steps = 0; steps < 1000 && pc < program.code.length; steps++) {
    const { command, args: [a, b, c] } = program.code[pc++];
    const target = a?.startsWith('GR') ? r(a) : 0;
    const value = registers[target];
    switch (command) {
      case 'START': break;
      case 'LAD': registers[target] = address(b, c); break;
      case 'LD': record(target, read(b, c)); break;
      case 'ST': memory.set(address(b, c), value); break;
      case 'SRL': record(target, value >>> Number(b), ((value >>> (Number(b) - 1)) & 1) !== 0); break;
      case 'SRA': {
        const signed = value >= 32768 ? value - 65536 : value;
        record(target, signed >> Number(b), ((value >>> (Number(b) - 1)) & 1) !== 0);
        break;
      }
      case 'SLL': {
        const shifted = value << Number(b);
        record(target, shifted, (shifted & 0x10000) !== 0);
        break;
      }
      case 'OR': record(target, value | read(b, c)); break;
      case 'ADDL': {
        const sum = value + read(b, c);
        record(target, sum, sum > 65535);
        break;
      }
      case 'JZE': if (flags.zero) pc = program.labels.get(a)!; break;
      case 'JNZ': if (!flags.zero) pc = program.labels.get(a)!; break;
      case 'JMI': if (flags.sign) pc = program.labels.get(a)!; break;
      case 'JPL': if (!flags.zero && !flags.sign) pc = program.labels.get(a)!; break;
      case 'JOV': if (flags.overflow) pc = program.labels.get(a)!; break;
      case 'JUMP': pc = program.labels.get(a)!; break;
      case 'PUSH': stack.push(address(a, b)); break;
      case 'POP': if (stack.length === 0) return false; registers[target] = stack.pop()!; break;
      case 'RPUSH': stack.push(...registers.slice(1)); break;
      case 'RPOP': if (stack.length < 7) return false; registers.splice(1, 7, ...stack.splice(-7)); break;
      case 'CALL': if (a !== 'MULS' || !subroutine?.(machine)) return false; break;
      case 'RET': return true;
      default: return false;
    }
  }
  return false;
}

// Parse the given operand and result offsets. The comparison is with native
// unsigned integer multiplication, without following the program's shifts.
export function verifyProduct(source: string[], choices: Record<string, string>) {
  const [small, full] = source.map(program => assemble(program, choices));
  const operandHigh = Number(source[0].match(/LD +GR4,([01]),GR1/)?.[1]);
  const resultHigh = Number(source[0].match(/ST +GR6,([01]),GR3/)?.[1]);
  const cases = [[0, 0], [1, 1], [1, 32768], [3, 6], [0xffff, 3], [0x8000, 3], [0xffff, 0xffff],
    [0x123456, 17], [0x1234, 0x00020003], [0xffff, 0x10001], [0x00010001, 0x101]];
  return cases.every(([left, right]) => {
    const registers = [7, 100, 200, 300, 44, 55, 66, 77];
    const machine: Machine = { registers: [...registers], memory: new Map(), flags: { zero: false, sign: false, overflow: false }, stack: [] };
    const write = (base: number, value: number, high: number) => {
      machine.memory.set(base + high, value >>> 16);
      machine.memory.set(base + 1 - high, word(value));
    };
    write(100, left, operandHigh);
    write(200, right, operandHigh);
    write(300, 0xffffffff, resultHigh);
    write(600, 0x55664433, resultHigh);
    if (!run(full, machine, state => run(small, state))) return false;
    const high = machine.memory.get(300 + resultHigh)!;
    const low = machine.memory.get(300 + 1 - resultHigh)!;
    return BigInt(high) * 65536n + BigInt(low) === BigInt(left) * BigInt(right) &&
      machine.stack.length === 0 && machine.registers.every((value, index) => value === registers[index]);
  });
}
