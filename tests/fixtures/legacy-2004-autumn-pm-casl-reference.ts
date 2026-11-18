/** CASL II subset for verifying the displayed TIME and EKIDEN listings. */
type Instruction = { op: string; args: string[] };
type Module = { instructions: Instruction[]; labels: Map<string, number> };
const opcodes = new Set('START END DS DC RPUSH RPOP LD ST LAD ADDL ADDA SUBA CPA CPL OR JMI JNZ JPL JZE JUMP CALL RET OUT'.split(' '));
const word = (value: number) => value & 0xffff;
const signed = (value: number) => value < 0x8000 ? value : value - 0x10000;

function compile(text: string, answers: Record<string, string>, initial: Uint16Array, firstAddress: number): Module {
  const instructions: Instruction[] = [], labels = new Map<string, number>();
  let address = firstAddress;
  for (const raw of text.split('\n')) {
    const row = raw.replace(/^\s*\d+\s+/, '').split(';')[0].trim()
      .replace(/\[([abcd])\]/, (_, name: string) => answers[name]);
    const tokens = /^([A-Z][A-Z0-9]*)(?:\s+(.*))?$/.exec(row);
    if (!tokens) throw Error(row);
    let operation = tokens[1], argument = tokens[2] ?? '';
    if (!opcodes.has(operation)) {
      const label = operation;
      const rest = /^([A-Z][A-Z0-9]*)(?:\s+(.*))?$/.exec(argument);
      if (!rest) throw Error(row);
      operation = rest[1];
      argument = rest[2] ?? '';
      labels.set(label, operation === 'DC' || operation === 'DS' ? address : instructions.length);
    }
    if (operation === 'DS') {
      address += Number(argument);
    } else if (operation === 'DC') {
      if (argument.startsWith("'")) {
        for (const character of argument.slice(1, -1)) initial[address++] = character.charCodeAt(0);
      } else {
        for (const value of argument.split(',')) initial[address++] = word(Number(value));
      }
    } else if (operation !== 'START' && operation !== 'END') {
      instructions.push({ op: operation, args: argument ? argument.split(',').map(value => value.trim()) : [] });
    }
  }
  return { instructions, labels };
}

export function makeTimer(timer: string, relay: string, answers: Record<string, string>) {
  const image = new Uint16Array(65536);
  const time = compile(timer, answers, image, 0x1000), ekiden = compile(relay, answers, image, 0x2000);
  return function run(input: string[][]) {
    const memory = image.slice(), base = 0x4400, output = 0x5600;
    const seed = [17, base, base + input[0][0].length, output, 5, 6, 7, 8], r = [...seed];
    const stack: number[][] = [];
    [...input.flat().join('')].forEach((ch, i) => { memory[base + i] = ch.charCodeAt(0); });
    let adjustments = 0, steps = 0, printed = '';
    let flag = 0;
    function runModule(module: Module) {
      const register = (name: string) => Number(name.slice(2));
      const address = (name: string, index?: string) => word((module.labels.get(name) ?? Number(name)) + (index ? r[register(index)] : 0));
      const value = (name: string, index?: string) => name.startsWith("='") ? name.charCodeAt(2)
        : name.startsWith('=') ? word(Number(name.slice(1)))
        : name.startsWith('GR') ? r[register(name)] : memory[address(name, index)];
      const jump = (label: string) => {
        const where = module.labels.get(label);
        if (where === undefined) throw Error(label);
        return where;
      };
      let pc = 0;
      for (;;) {
        if (++steps > 7000) throw Error('命令数制限');
        const instruction = module.instructions[pc++];
        if (!instruction) throw Error('実行する命令がありません');
        const { op, args: [a, b, c] } = instruction;
        const index = a?.startsWith('GR') ? register(a) : 0;
        const previous = r[index];
        const store = (next: number) => { r[index] = word(next); flag = Math.sign(signed(r[index])); };
        switch (op) {
          case 'RPUSH': stack.push(r.slice(1)); break;
          case 'RPOP': r.splice(1, 7, ...stack.pop()!); break;
          case 'LD': store(value(b, c)); break;
          case 'LAD': r[index] = address(b, c); break;
          case 'ST': memory[address(b, c)] = previous; break;
          case 'ADDL': store(previous + value(b, c)); break;
          case 'ADDA':
            if (module === time && b === 'ADD') adjustments++;
            store(previous + value(b, c));
            break;
          case 'SUBA': store(previous - value(b, c)); break;
          case 'CPA': flag = Math.sign(signed(previous) - signed(value(b, c))); break;
          case 'CPL': flag = Math.sign(previous - value(b, c)); break;
          case 'OR': store(previous | value(b, c)); break;
          case 'JMI': if (flag < 0) pc = jump(a); break;
          case 'JPL': if (flag > 0) pc = jump(a); break;
          case 'JZE': if (flag === 0) pc = jump(a); break;
          case 'JNZ': if (flag !== 0) pc = jump(a); break;
          case 'JUMP': pc = jump(a); break;
          case 'CALL': if (a !== 'TIME') throw Error(a); else runModule(time); break;
          case 'OUT': printed = String.fromCharCode(...memory.slice(address(a), address(a) + memory[address(b)])); break;
          case 'RET': return;
          default: throw Error(op);
        }
      }
    }
    runModule(input.length === 1 ? time : ekiden);
    return { adjustments, printed, difference: String.fromCharCode(...memory.slice(output, output + input[0][0].length)),
      restored: stack.length === 0 && r.slice(1).every((value, i) => value === seed[i + 1]), gr0: r[0] };
  };
}
