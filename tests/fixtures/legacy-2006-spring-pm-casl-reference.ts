const maskWord = (number: number) => number & 0xffff;
const signed = (word: number) => word & 0x8000 ? word - 0x10000 : word;
const storage = 0x6000;
type Opcode = { label?: string; operation: string; parameters: string[]; number?: number };

export function assembleArithmetic(lines: string[], keys: Record<string, string>) {
  const assembly: Opcode[] = [];
  const jumps = new Map<string, number>();
  const locations = new Map<string, number>();
  for (const line of lines.join('\n').split('\n')) {
    const number = /^\s*(\d+)  /.exec(line);
    const text = line.slice(number?.[0].length ?? 0).split(';', 1)[0]
      .replace(/\[(a|b|設問2)\]/g, (_whole, key: string) => keys[key]);
    for (const segment of text.split('\n')) {
      if (!segment.trim()) continue;
      const words = segment.trim().split(/\s+/);
      const opcodes = /^(START|RPUSH|LD|ST|LAD|SLL|SRA|SRL|JZE|JPL|JMI|JNZ|JOV|JUMP|OR|XOR|ADDL|SUBL|CALL|RET|RPOP|DS|END|PUSH|POP|NOP)$/;
      const label = opcodes.test(words[0]) ? undefined : words.shift();
      const operation = words.shift()!;
      if (label && operation === 'DS') locations.set(label, storage + 4 + locations.size);
      if (label) jumps.set(label, assembly.length);
      assembly.push({ label, operation, parameters: words.join('').split(','), number: number ? Number(number[1]) : undefined });
    }
  }
  return function run(entry: 'MULT32' | 'ADD32' | 'FACT', word: number, operand: number) {
    const initial = [operand & 0xffff, entry === 'ADD32' ? operand >>> 16 : operand, storage, 7, 8, 9, 10, 11];
    const registers = initial.slice();
    const stack: number[] = [-1], mem = new Map([[storage, word >>> 16], [storage + 1, word & 0xffff]]);
    let cursor = jumps.get(entry)!, sf = false, zf = false, of = false, entries = 0, terminalReturns = 0;
    const reg = (token: string) => Number(token.slice(2));
    const address = (token: string, index?: string) => maskWord((locations.get(token) ?? Number(token)) + (index ? registers[reg(index)] : 0));
    const read = (token: string, index?: string) => token.startsWith('GR') ? registers[reg(token)]
      : token.startsWith('=') ? maskWord(Number(token.slice(1))) : mem.get(address(token, index)) ?? 0;
    function flags(value: number, overflow = false) {
      sf = (value & 0x8000) !== 0;
      zf = maskWord(value) === 0;
      of = overflow;
    }
    const set = (r: number, value: number, overflow = false) => {
      flags(value, overflow);
      registers[r] = maskWord(value);
    };
    for (let count = 0; count < 2200; count++) {
      const item = assembly[cursor++];
      if (!item) return null;
      const { operation, parameters: [a, b, c] } = item;
      const r = reg(a), current = registers[r];
      const jump = () => { cursor = jumps.get(a)!; };
      if (item.label === 'RMAIN') entries++;
      if (entry === 'FACT' && item.number === 11 && operation === 'RET') terminalReturns++;
      switch (operation) {
        case 'START': case 'NOP': break;
        case 'LD': set(r, read(b, c)); break;
        case 'ST': mem.set(address(b, c), current); break;
        case 'LAD': registers[r] = address(b, c); break;
        case 'SLL': {
          const count = address(b, c);
          set(r, count >= 16 ? 0 : current << count, count > 0 && count <= 16 && ((current >>> (16 - count)) & 1) !== 0);
          break;
        }
        case 'SRL': {
          const count = address(b, c);
          set(r, count >= 16 ? 0 : current >>> count, count > 0 && count <= 16 && ((current >>> (count - 1)) & 1) !== 0);
          break;
        }
        case 'SRA': set(r, signed(current) >> Math.min(address(b, c), 16)); break;
        case 'OR': set(r, current | read(b, c)); break;
        case 'XOR': set(r, current ^ read(b, c)); break;
        case 'ADDL': {
          const result = current + read(b, c);
          set(r, result, result > 0xffff);
          break;
        }
        case 'SUBL': {
          const result = current - read(b, c);
          set(r, result, result < 0);
          break;
        }
        case 'JZE': if (zf) jump(); break;
        case 'JPL': if (!sf && !zf) jump(); break;
        case 'JMI': if (sf) jump(); break;
        case 'JNZ': if (!zf) jump(); break;
        case 'JOV': if (of) jump(); break;
        case 'JUMP': jump(); break;
        case 'CALL': stack.push(cursor); jump(); break;
        case 'RPUSH': stack.push(...registers.slice(1)); break;
        case 'RPOP': for (let i = 7; i > 0; i--) registers[i] = stack.pop()!; break;
        case 'PUSH': stack.push(address(a, b)); break;
        case 'POP': registers[r] = stack.pop()!; break;
        case 'RET': {
          const next = stack.pop();
          if (next === -1) return { word: (mem.get(storage) ?? 0) * 0x10000 + (mem.get(storage + 1) ?? 0),
            entries, terminalReturns, preserved: registers.slice(1).every((value, j) => value === initial[j + 1]) };
          if (next === undefined) return null;
          cursor = next;
          break;
        }
        default: return null;
      }
    }
    return null;
  };
}
