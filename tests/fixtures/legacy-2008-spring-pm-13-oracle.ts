import assert from 'node:assert/strict';

type Entry = { name: string; operands: string[] };
type ObjectCode = Map<string, { start: string; code: Entry[]; labels: Map<string, number> }>;
const word = (value: number) => (value + 0x8000 & 0xffff) - 0x8000;
const instructions = new Set(['LD', 'LAD', 'ST', 'CALL', 'RET', 'JUMP', 'JMI', 'JNZ', 'JPL', 'JZE', 'ADDA', 'SUBA', 'CPA', 'AND', 'OR', 'SLL', 'SRL', 'IN', 'OUT', 'RPUSH', 'RPOP']);

function parse(programs: readonly string[], choices: Record<string, string>) {
  const object: ObjectCode = new Map();
  const data = new Map<string, number[]>();
  for (const program of programs) {
    const lines = program.replace(/［([a-f])］/g, (_match, symbol: string) => choices[symbol]).split('\n');
    const [start, marker] = lines.shift()!.trim().split(/\s+/);
    assert.equal(marker, 'START');
    const labels = new Map<string, number>(), code: Entry[] = [];
    for (const raw of lines) {
      const line = raw.split(';')[0].trimEnd();
      if (!line) continue;
      const tokens = line.trim().split(/\s+/);
      const label = /^\S/.test(line) ? tokens.shift() : undefined;
      const name = tokens.shift()!;
      const operands = tokens.join('').split(',');
      if (name === 'END') break;
      if (name === 'DS' || name === 'DC') {
        assert(label);
        const size = Number(operands[0]);
        assert(Number.isSafeInteger(size) && size > 0);
        data.set(label, name === 'DS' ? Array(size).fill(0) : [size]);
        continue;
      }
      if (label) labels.set(label, code.length);
      assert(instructions.has(name), name);
      code.push({ name, operands });
    }
    object.set(start, { start, code, labels });
  }
  return { object, data };
}

export function runCasl(programs: readonly string[], choices: Record<string, string>, records: readonly string[], stepLimit = 500_000) {
  const { object, data } = parse(programs, choices);
  const registers = Array<number>(8).fill(0);
  const output: string[] = [];
  let recordIndex = 0, comparison = 0, steps = 0;
  const register = (name: string) => {
    assert.match(name, /^GR[0-7]$/);
    return Number(name[2]);
  };
  const address = (name: string, index?: string) => {
    const cells = data.get(name);
    const offset = index ? registers[register(index)] : 0;
    assert(cells && offset >= 0 && offset < cells.length, '有効なデータ番地: ' + name + '+' + offset);
    return { cells, offset };
  };
  function value(name: string, index?: string) {
    if (name.startsWith('=')) return name[1] === '#' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
    if (name.startsWith('GR')) return registers[register(name)];
    const ref = address(name, index);
    return ref.cells[ref.offset];
  }
  function execute(program: string) {
    const objectProgram = object.get(program);
    assert(objectProgram, program);
    const { code, labels } = objectProgram;
    let pc = 0;
    const saved: number[][] = [];
    while (pc < code.length) {
      assert(++steps <= stepLimit, 'CASL II実行上限を超過');
      const { name, operands: [a, b, c] } = code[pc++];
      if (name === 'RET') return;
      if (name === 'CALL') { execute(a); continue; }
      if (name === 'IN') {
        const record = records[recordIndex++];
        const buffer = data.get(a), length = data.get(b);
        assert(buffer && length);
        length[0] = record === undefined ? -1 : record.length;
        if (record !== undefined) [...record].forEach((digit, i) => { buffer[i] = digit.charCodeAt(0); });
        continue;
      }
      if (name === 'OUT') {
        const buffer = data.get(a), length = data.get(b);
        assert(buffer && length);
        output.push(String.fromCharCode(...buffer.slice(0, length[0])));
        continue;
      }
      if (name === 'RPUSH') { saved.push(registers.slice(1)); continue; }
      if (name === 'RPOP') { const values = saved.pop(); assert(values); registers.splice(1, 7, ...values); continue; }
      if (name.startsWith('J')) {
        const target = labels.get(a);
        assert(target !== undefined, a);
        if (name === 'JUMP' || name === 'JMI' && comparison < 0 || name === 'JNZ' && comparison !== 0 ||
            name === 'JPL' && comparison > 0 || name === 'JZE' && comparison === 0) pc = target;
        continue;
      }
      const destination = register(a), initial = registers[destination];
      if (name === 'ST') {
        const ref = address(b, c);
        ref.cells[ref.offset] = initial;
        continue;
      }
      if (name === 'CPA') { comparison = Math.sign(initial - value(b, c)); continue; }
      if (name === 'LAD') { registers[destination] = word(Number(b) + (c ? registers[register(c)] : 0)); continue; }
      const source = name === 'SLL' || name === 'SRL' ? Number(b) : value(b, c);
      switch (name) {
        case 'LD': registers[destination] = word(source); break;
        case 'ADDA': registers[destination] = word(initial + source); break;
        case 'SUBA': registers[destination] = word(initial - source); break;
        case 'AND': registers[destination] = word(initial & source); break;
        case 'OR': registers[destination] = word(initial | source); break;
        case 'SLL': registers[destination] = word(initial << source); break;
        case 'SRL': registers[destination] = word((initial & 0xffff) >>> source); break;
        default: assert.fail(name);
      }
      comparison = Math.sign(registers[destination]);
    }
    assert.fail('RETなしで終了: ' + program);
  }
  execute('MAIN');
  return output;
}

export function independentSummary(records: readonly string[], base: number) {
  const values = records.map(record => [...record].reverse().reduce((sum, character, place) => sum + Number(character) * base ** place, 0));
  const ordered = values.slice().sort((a, b) => a - b);
  const mean = Math.trunc(ordered.reduce((a, b) => a + b, 0) / ordered.length);
  return [ordered.at(-1)!, ordered[0], mean].map(value => value.toString(base).padStart(3, ' '));
}
