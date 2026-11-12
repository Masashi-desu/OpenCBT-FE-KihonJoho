import assert from 'node:assert/strict';

type Flags = { overflow: boolean; negative: boolean; zero: boolean };

/** Interpret the displayed COMET II instructions. Character literals are symbolic
 * output values. The counts and branches never compare character codes. */
export function runSummary(source: string, words: number[]) {
  const commands = new Map<number, { op: string; operands: string[] }>();
  const targets = new Map<string, number>();
  const offsets = { COUNTR: 0, PLEN: 16, PBUF: 17, FOOTER: 65 };
  const memory = new Map<number, number>();
  const registers = Array<number>(8).fill(0);
  registers[0] = words.length;
  registers[1] = 200;
  words.forEach((word, index) => memory.set(200 + index, word));
  const get = (address: number) => {
    assert.ok(memory.has(address), 'uninitialized memory address ' + address);
    return memory.get(address)!;
  };
  for (const line of source.split('\n')) {
    const [, num, body] = /^(\s*\d+)\s+(.*)$/.exec(line) ?? [];
    assert.ok(num && body !== undefined);
    const words = body.split(';')[0].trim().split(/\s+/);
    if (!words[0]) continue;
    const label = words.length > 1 && /^(SUMMARY|LOOP[1-5]|ON|CHANGE|OFF|NEXTW|NOTSET|FIN|COUNTR|PLEN|PBUF|FOOTER)$/.test(words[0])
      ? words.shift()! : '';
    const op = words.shift()!;
    if (op === 'DS') continue;
    if (op === 'DC') {
      if (label === 'PLEN') memory.set(offsets.PLEN, Number(words[0]));
      else {
        const [, footer] = /DC\s+'(.*)'/.exec(body) ?? [];
        assert.ok(footer);
        const address = label === 'FOOTER' ? offsets.FOOTER : offsets.FOOTER + 39;
        for (const [position, token] of [...footer].entries()) memory.set(address + position, token.charCodeAt(0));
      }
      continue;
    }
    if (op === 'END') continue;
    const lineNumber = Number(num);
    if (label) targets.set(label, lineNumber);
    commands.set(lineNumber, { op, operands: words.join(' ').split(',') });
  }
  const counts = new Map<number, number>();
  const output: string[] = [];
  const original = registers.slice();
  let flags: Flags = { overflow: false, negative: false, zero: false };
  const set = (value: number, overflow = false) => {
    flags = { overflow, negative: (value & 0x8000) !== 0, zero: (value & 0xffff) === 0 };
  };
  const register = (token: string) => Number(token.slice(2));
  const address = (token: string, index?: string) => {
    const location = token in offsets ? offsets[token as keyof typeof offsets] : Number(token);
    return (location + (index ? registers[register(index)] : 0)) & 0xffff;
  };
  const operand = (token: string, index?: string) => {
    if (token.startsWith('GR')) return registers[register(token)];
    if (token.startsWith("='")) return token[2].charCodeAt(0);
    if (token.startsWith('=')) return Number(token.slice(1));
    return get(address(token, index));
  };
  let pc = 1;
  for (let guard = 0; guard < 3000; guard++) {
    const command = commands.get(pc);
    if (!command) { pc++; continue; }
    const { op, operands: [first, second, third] } = command;
    const r = register(first);
    counts.set(pc, (counts.get(pc) ?? 0) + 1);
    if (op === 'RET') {
      assert.deepEqual(registers.slice(1), original.slice(1));
      return { counts, output, counters: Array.from({ length: 16 }, (_, i) => get(i)) };
    }
    let jump = false;
    switch (op) {
      case 'START':
      case 'RPUSH': break;
      case 'RPOP':
        original.slice(1).forEach((value, i) => { registers[i + 1] = value; });
        break;
      case 'LD':
        registers[r] = operand(second, third);
        set(registers[r]);
        break;
      case 'ST':
        memory.set(address(second, third), registers[r]);
        break;
      case 'LAD':
        registers[r] = address(second, third);
        break;
      case 'ADDA':
      case 'SUBA': {
        const raw = registers[r] + (op === 'ADDA' ? 1 : -1) * operand(second, third);
        registers[r] = raw & 0xffff;
        set(raw, raw < -32768 || raw > 32767);
        break;
      }
      case 'SLL': {
        assert.equal(second, '1');
        const previous = registers[r];
        registers[r] = previous * 2 & 0xffff;
        set(registers[r], previous >= 0x8000);
        break;
      }
      case 'CPA':
        set(registers[r] - operand(second, third));
        break;
      case 'JMI': jump = flags.negative; break;
      case 'JNZ': jump = !flags.zero; break;
      case 'JZE': jump = flags.zero; break;
      case 'JOV': jump = flags.overflow; break;
      case 'JPL': jump = !flags.zero && !flags.negative; break;
      case 'JUMP': jump = true; break;
      case 'OUT':
        output.push(Array.from({ length: get(address(second)) }, (_, i) => String.fromCharCode(get(address(first) + i))).join(''));
        break;
      default: assert.fail('unexpected opcode ' + op);
    }
    pc = jump ? (targets.get(first) ?? assert.fail('unknown label ' + first)) : pc + 1;
  }
  throw Error('instruction limit');
}
