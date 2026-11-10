import assert from 'node:assert/strict';

type Instruction = { line: number; op: string; operands: string[] };
const word = (value: number) => value & 0xffff;
const signed = (value: number) => value & 0x8000 ? value - 0x10000 : value;

export function compileBreps(sources: string[]) {
  const programs = new Map<string, Instruction[]>();
  for (const source of sources) {
    const code: Instruction[] = [];
    for (const [index, row] of source.split('\n').entries()) {
      const statement = row.replace(/^\s*\d+ {2}/, '').split(';')[0].trimEnd();
      const start = /^(\w+)\s+START$/.exec(statement);
      if (start) { programs.set(start[1], code); continue; }
      const [, op, operands = ''] = /^\s+(\w+)(?:\s+(.*))?$/.exec(statement) ?? [];
      assert(op, statement);
      if (op !== 'END') code.push({ line: index + 1, op, operands: operands.split(',').map(text => text.trim()).filter(Boolean) });
    }
  }
  return (entry: string, initial: number[], words: number[]) => {
    const registers = initial.slice();
    const memory = new Map(words.map((value, i) => [i + 200, value]));
    const states = new Map<string, number[]>();
    const reg = (name: string) => {
      assert.match(name, /^GR[0-7]$/);
      return Number(name[2]);
    };
    const immediate = (name: string) => {
      if (name.startsWith('#')) return parseInt(name.slice(1), 16);
      assert.match(name, /^-?\d+$/);
      return Number(name);
    };
    const address = (base: string, index?: string) => word(immediate(base) + (index ? registers[reg(index)] : 0));
    const value = (text: string, index?: string) => {
      if (text.startsWith('=')) return immediate(text.slice(1));
      if (text.startsWith('GR')) return registers[reg(text)];
      const location = address(text, index), stored = memory.get(location);
      assert(stored !== undefined, '未配置番地 ' + location);
      return stored;
    };
    function run(name: string) {
      const program = programs.get(name);
      assert(program, name);
      const saves: number[][] = [];
      for (const { line, op, operands: [left, right, index] } of program) {
        const set = (result: number) => { registers[reg(left)] = word(result); };
        const current = () => registers[reg(left)];
        switch (op) {
          case 'RPUSH': saves.push(registers.slice(1)); break;
          case 'RPOP': {
            const saved = saves.pop();
            assert(saved);
            registers.splice(1, 7, ...saved);
            break;
          }
          case 'LD': set(value(right, index)); break;
          case 'LAD': set(address(right, index)); break;
          case 'ST': memory.set(address(right, index), current()); break;
          case 'AND': set(current() & value(right, index)); break;
          case 'OR': set(current() | value(right, index)); break;
          case 'XOR': set(current() ^ value(right, index)); break;
          case 'ADDL': set(current() + value(right, index)); break;
          case 'SUBA':
          case 'SUBL': set(current() - value(right, index)); break;
          case 'SRL': set(Math.floor(current() / 2 ** address(right, index))); break;
          case 'SLL': {
            const amount = address(right, index);
            set(amount < 16 ? current() * 2 ** amount : 0);
            break;
          }
          case 'SRA': set(Math.floor(signed(current()) / 2 ** Math.min(15, address(right, index)))); break;
          case 'CALL': run(left); break;
          case 'RET': assert.equal(saves.length, 0); return;
          default: assert.fail(op);
        }
        states.set(name + ':' + line, registers.slice());
      }
      assert.fail('RETなし ' + name);
    }
    run(entry);
    return { memory: [...memory.entries()].sort((a, b) => a[0] - b[0]), registers, states };
  };
}
