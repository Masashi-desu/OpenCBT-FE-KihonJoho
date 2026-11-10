import assert from 'node:assert/strict';

type Instruction = { line: number; op: string; args: string[] };
type Program = { code: Instruction[]; branches: Map<string, number> };
const word = (value: number) => value & 0xffff;
const signed = (value: number) => value & 0x8000 ? value - 0x10000 : value;

export function compileComet(listings: string[]) {
  const initialMemory = new Map<number, number>(), addresses = new Map<string, number>();
  const programs = new Map<string, Program>();
  let nextAddress = 700;
  for (const listing of listings) {
    const program: Program = { code: [], branches: new Map() };
    for (const [index, row] of listing.split('\n').entries()) {
      const statement = row.replace(/^\s*\d+\s/, '').split(';')[0].trimEnd();
      if (!statement.trim()) continue;
      const [, label = '', op, operands = ''] = /^(?:(\S+)\s+|\s+)(\S+)(?:\s+(.*))?$/.exec(statement) ?? [];
      assert(op, statement);
      if (op === 'START') { assert(label); programs.set(label, program); continue; }
      if (op === 'END') continue;
      if (op === 'DC' || op === 'DS') {
        addresses.set(label, nextAddress);
        if (op === 'DC') for (const value of operands.split(',')) initialMemory.set(nextAddress++, Number(value));
        else nextAddress += Number(operands);
        continue;
      }
      if (label) program.branches.set(label, program.code.length);
      program.code.push({ line: index + 1, op, args: operands.split(',').map(value => value.trim()).filter(Boolean) });
    }
  }
  return (entry: string, initial: number[], input: ReadonlyMap<number, number>) => {
    const memory = new Map([...initialMemory, ...input]);
    const counts = new Map<string, number>();
    const registers = initial.slice(), output: number[] = [];
    let steps = 0, flag = 0, overflow = false;
    const reg = (text: string) => {
      assert.match(text, /^GR[0-7]$/);
      return Number(text[2]);
    };
    const scalar = (text: string): number => {
      if (text.startsWith('=')) return scalar(text.slice(1));
      if (text.startsWith("'")) return text.charCodeAt(1);
      if (text.startsWith('#')) return parseInt(text.slice(1), 16);
      if (addresses.has(text)) return addresses.get(text)!;
      assert.match(text, /^-?\d+$/);
      return Number(text);
    };
    const address = (text: string, index?: string) => word(scalar(text) + (index === undefined ? 0 : registers[reg(index)]));
    const read = (address: number) => {
      assert(memory.has(address), '未初期化番地 ' + address);
      return memory.get(address)!;
    };
    const value = (text: string, index?: string) => text.startsWith('=') ? scalar(text)
      : text.startsWith('GR') ? registers[reg(text)] : read(address(text, index));
    const set = (index: number, next: number, flags = true, of = false) => {
      registers[index] = word(next);
      if (flags) { flag = Math.sign(signed(registers[index])); overflow = of; }
    };
    function run(name: string) {
      const program = programs.get(name);
      assert(program, name);
      const saves: number[][] = [];
      let pc = 0;
      const jump = (target: string) => {
        const destination = program.branches.get(target);
        assert(destination !== undefined, target);
        pc = destination;
      };
      for (;;) {
        if (++steps > 4000) throw Error('プログラムが停止しない');
        const item = program.code[pc++];
        assert(item, '分岐先が命令範囲外');
        const { op, line, args: [a, b, c] } = item;
        const key = name + ':' + line;
        counts.set(key, (counts.get(key) ?? 0) + 1);
        switch (op) {
          case 'RPUSH': saves.push(registers.slice(1)); break;
          case 'RPOP': {
            const saved = saves.pop();
            assert(saved);
            registers.splice(1, 7, ...saved);
            break;
          }
          case 'LD': set(reg(a), value(b, c)); break;
          case 'LAD': set(reg(a), address(b, c), false); break;
          case 'ST': memory.set(address(b, c), registers[reg(a)]); break;
          case 'AND': set(reg(a), registers[reg(a)] & value(b, c)); break;
          case 'OR': set(reg(a), registers[reg(a)] | value(b, c)); break;
          case 'ADDA': {
            const sum = signed(registers[reg(a)]) + signed(value(b, c));
            set(reg(a), sum, true, sum < -32768 || sum > 32767); break;
          }
          case 'SUBA': {
            const difference = signed(registers[reg(a)]) - signed(value(b, c));
            set(reg(a), difference, true, difference < -32768 || difference > 32767); break;
          }
          case 'CPA': flag = Math.sign(signed(registers[reg(a)]) - signed(value(b, c))); overflow = false; break;
          case 'SRL': {
            const n = registers[reg(a)], bits = scalar(b);
            set(reg(a), n >>> bits, true, Boolean(n & (1 << (bits - 1)))); break;
          }
          case 'SLL': {
            const n = registers[reg(a)], bits = scalar(b);
            set(reg(a), n << bits, true, Boolean(n & (1 << (16 - bits)))); break;
          }
          case 'JZE': if (flag === 0) jump(a); break;
          case 'JNZ': if (flag !== 0) jump(a); break;
          case 'JMI': if (flag < 0) jump(a); break;
          case 'JOV': if (overflow) jump(a); break;
          case 'JUMP': jump(a); break;
          case 'CALL': run(a); break;
          case 'OUT': {
            const start = address(a), length = read(address(b));
            for (let i = 0; i < length; i++) output.push(read(start + i));
            break;
          }
          case 'RET': assert.equal(saves.length, 0); return;
          default: throw Error('未対応命令 ' + op);
        }
      }
    }
    run(entry);
    return { memory, counts, registers, output };
  };
}
