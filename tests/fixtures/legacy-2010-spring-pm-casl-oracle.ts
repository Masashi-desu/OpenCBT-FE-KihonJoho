import assert from 'node:assert/strict';

type FloatWord = readonly [sign: number, exponent: number, mantissa: number];

export function expectedFloat(x: FloatWord, y: FloatWord, subtract: boolean): FloatWord {
  const exponent = Math.max(x[1], y[1]);
  // Align by integer division, which models zero-filled right shifts.
  const atExponent = ([sign, power, fraction]: FloatWord) => (sign ? -1 : 1) * Math.floor(fraction / 2 ** (exponent - power));
  const combined = atExponent(x) + (subtract ? -1 : 1) * atExponent(y);
  if (combined === 0) return [0, 0, 0];
  const adjustment = Math.floor(Math.log2(Math.abs(combined))) - 15;
  return [Number(combined < 0), exponent + adjustment, Math.floor(Math.abs(combined) / 2 ** adjustment)];
}

type Compiled = { opcode: string; operands: string[] };
export function compileCasl(text: string, chosen: Record<string, string>, extra?: string) {
  const labels = new Map<string, number>();
  const compiled: Compiled[] = [];
  for (const row of text.split('\n')) {
    const match = row.match(/^\s*(\d+)\s+(.*?)(?:\s*;.*)?$/);
    if (!match) continue;
    let statement = match[2].trim();
    if (!statement) continue;
    statement = statement.replace(/［([a-e])］/g, (_, name: string) => chosen[name]);
    const tokens = statement.split(/\s+/);
    if (tokens.length > 2 || (tokens.length === 2 && ['START', 'RPUSH', 'RPOP', 'RET', 'END'].includes(tokens[1])))
      labels.set(tokens.shift()!, compiled.length);
    const [opcode, argument] = tokens;
    compiled.push({ opcode, operands: argument?.split(',') ?? [] });
    if (extra && (match[1] === '27' || match[1] === '32')) {
      const [opcode, argument] = extra.split(/\s+/);
      compiled.push({ opcode, operands: argument.split(',') });
    }
  }
  return { labels, compiled };
}

export function runCasl(source: ReturnType<typeof compileCasl>, x: FloatWord, y: FloatWord, bits: number): FloatWord | undefined {
  const registers = [0, 100, 104, 108, 0x1020, 0x3040, 0x5060, 0x7080];
  const original = [...registers];
  const pack = ([sign, exponent, fraction]: FloatWord) => [sign * 32768 + exponent, fraction];
  const memory = new Map<number, number>([[100, pack(x)[0]], [101, x[2]], [104, pack(y)[0]], [105, y[2]]]);
  const stack: number[] = [];
  const exponentMask = 2 ** bits - 1;
  let sf = false, zf = true, of = false;
  const reg = (s: string) => Number(/^GR([0-7])$/.exec(s)?.[1]);
  function read(word: string) {
    if (word.startsWith('GR')) return registers[reg(word)];
    return word.startsWith('#') ? parseInt(word.slice(1), 16) : Number(word);
  }
  function effective(operands: string[]) {
    return (read(operands[0]) + (operands[1] ? read(operands[1]) : 0)) & 0xFFFF;
  }
  function write(r: number, full: number, overflow = false) {
    const result = full & 0xFFFF;
    registers[r] = result;
    sf = Boolean(result & 0x8000);
    zf = result === 0;
    of = overflow;
  }
  function value(operands: string[]) {
    const arg = operands[0];
    if (arg.startsWith('=')) return read(arg.slice(1));
    if (arg.startsWith('GR') && operands.length === 1) return read(arg);
    const content = memory.get(effective(operands));
    if (content === undefined) throw new Error('Unmapped address');
    return content;
  }
  for (let pc = 0, steps = 0; steps < 400; steps++) {
    const step = source.compiled[pc++];
    if (!step) return undefined;
    const { opcode, operands } = step;
    const branch = ({ JUMP: true, JMI: sf, JPL: !sf && !zf, JNZ: !zf, JZE: zf, JOV: of } as Record<string, boolean>)[opcode];
    if (branch !== undefined) {
      if (branch) pc = source.labels.get(operands[0]) ?? -1;
      continue;
    }
    const target = reg(operands[0] ?? '');
    const current = registers[target];
    const rest = operands.slice(1);
    switch (opcode) {
      case 'START': break;
      case 'RPUSH': for (let i = 1; i <= 7; i++) stack.push(registers[i]); break;
      case 'RPOP': for (let i = 7; i >= 1; i--) registers[i] = stack.pop()!; break;
      case 'PUSH': stack.push(effective(operands)); break;
      case 'POP': registers[target] = stack.pop()!; break;
      case 'LD': write(target, value(rest)); break;
      case 'ST': memory.set(effective(rest), current); break;
      case 'AND': write(target, current & value(rest)); break;
      case 'OR': write(target, current | value(rest)); break;
      case 'XOR': write(target, current ^ value(rest)); break;
      case 'ADDL': { const result = current + value(rest); write(target, result, result > 65535); break; }
      case 'SUBL': { const result = current - value(rest); write(target, result, result < 0); break; }
      case 'CPL': { const right = value(rest); sf = current < right; zf = current === right; of = false; break; }
      case 'SRL': write(target, Math.floor(current / 2 ** effective(rest))); break;
      case 'SLL': { const distance = effective(rest); write(target, distance >= 16 ? 0 : current * 2 ** distance); break; }
      case 'SRA': {
        const distance = effective(rest);
        const signed = current >= 32768 ? current - 65536 : current;
        write(target, Math.floor(signed / 2 ** distance));
        break;
      }
      case 'RET': {
        assert.deepEqual(registers, original);
        assert.equal(stack.length, 0);
        const word = memory.get(108), fraction = memory.get(109);
        if (word === undefined || fraction === undefined || (word & 0x7FFF & ~exponentMask)) return undefined;
        return [word >>> 15, word & exponentMask, fraction];
      }
      case 'END': return undefined;
      default: return undefined;
    }
  }
  return undefined;
}
