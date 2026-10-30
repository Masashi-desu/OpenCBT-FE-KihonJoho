/** Test-only interpreter of Q12's displayed CASL subset.
 * It parses the supplied source, including CALL's effective address. Code is
 * relocated to a positive, instruction-address range; this is not an assembler
 * or a claim about real instruction word lengths. No instruction is stubbed.
 */
export interface BitMachineOptions {
  entry?: string;
  initial?: number[];
  regionBase?: number;
  argumentBase?: number;
  codeBase?: number;
  maxSteps?: number;
  trace?: boolean;
}
export function runBitMachine(source: string[], position: number, length: number,
  words: number[], options: BitMachineOptions = {}) {
  const word = (v: number) => v & 0xffff;
  const known = new Set(['RPUSH','RPOP','LD','LAD','ST','ADDL','SUBL','CPL','AND','OR','XOR','SLL','SRL','JMI','JNZ','JZE','JPL','JUMP','CALL','RET']);
  const labels = new Map<string, number>();
  const instructions = new Map<number, { op: string; args: string[]; raw: string }>();
  const mem = new Map<number, number>();
  let address = options.codeBase ?? 0x1000;
  for (const program of source) for (let line of program.split('\n')) {
    line = line.replace(/^\s*\d+\s+/, '').split(';')[0].trim();
    if (!line) continue;
    const tokens = line.split(/\s+/);
    let op = tokens.shift()!;
    if (!known.has(op) && op !== 'END') {
      if (labels.has(op)) throw Error('DUPLICATE_LABEL:' + op);
      labels.set(op, address);
      op = tokens.shift()!;
      if (op === 'START') continue;
      if (op === 'DC') {
        for (const item of tokens.join('').split(',')) mem.set(address++, numeric(item));
        continue;
      }
    }
    if (op === 'END') continue;
    if (!known.has(op)) throw Error('UNSUPPORTED_BIT_INSTRUCTION:' + op);
    instructions.set(address++, {op, args: tokens.join('').split(',').filter(Boolean), raw: line});
  }
  function numeric(value: string) {
    const n = value.startsWith('#') ? parseInt(value.slice(1), 16) : Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) throw Error('BAD_NUMBER:' + value);
    return word(n);
  }
  const initial = options.initial ?? [0x9999, options.argumentBase ?? 0x0800, 0x0202, 0x0303, 0x0404, 0x0505, 0x0606, 0x0707];
  if (initial.length !== 8) throw Error('BAD_INITIAL_REGISTERS');
  const r = initial.map(word), saved = r.slice(1);
  const regionBase = options.regionBase ?? 0x8000, argumentBase = options.argumentBase ?? 0x0800;
  if (position < 0 || position > 65535 || length < 0 || length > 65535 || !Number.isInteger(position) || !Number.isInteger(length)) throw Error('BAD_BIT_ARGUMENT');
  if (position + length > words.length * 16) throw Error('REGION_TOO_SHORT');
  for (let i = 0; i < words.length; i++) mem.set(word(regionBase + i), word(words[i]));
  [regionBase, position, length].forEach((v, i) => mem.set(argumentBase + i, v));
  r[1] = argumentBase;
  const baselineRegisters = r.slice(1), returns: number[] = [], pushes: number[][] = [];
  const writes: {address: number; before: number; after: number}[] = [];
  const trace: {pc: number; instruction: string; registers: number[]; of: number; sf: number; zf: number}[] = [];
  let pc = labels.get(options.entry ?? 'BITSON');
  if (pc === undefined) throw Error('MISSING_ENTRY');
  let sf = 0, zf = 0, of = 0, steps = 0;
  const register = (s: string) => {if (!/^GR[0-7]$/.test(s)) throw Error('BAD_REGISTER:' + s); return Number(s[2]);};
  const flags = (v: number, overflow = 0) => {const n = word(v); sf = n >>> 15; zf = n === 0 ? 1 : 0; of = overflow; return n;};
  const effective = (args: string[]) => word((labels.get(args[0]) ?? numeric(args[0])) + (args[1] ? r[register(args[1])] : 0));
  const load = (args: string[]) => {
    if (args.length === 1 && /^GR[0-7]$/.test(args[0])) return r[register(args[0])];
    if (args[0].startsWith('=')) return numeric(args[0].slice(1));
    const at = effective(args);
    if (!mem.has(at)) throw Error('UNINITIALIZED_READ:' + at);
    return mem.get(at)!;
  };
  for (;;) {
    if (++steps > (options.maxSteps ?? 500000)) throw Error('BIT_MACHINE_STEP_LIMIT');
    const instruction = instructions.get(pc);
    if (!instruction) throw Error('BAD_PROGRAM_COUNTER:' + pc);
    const at = pc++, {op, args} = instruction;
    if (options.trace) trace.push({pc: at, instruction: instruction.raw, registers: r.slice(), of, sf, zf});
    if (op === 'RPUSH') {pushes.push(r.slice(1)); continue;}
    if (op === 'RPOP') {const s = pushes.pop(); if (!s) throw Error('RPUSH_STACK_UNDERFLOW'); r.splice(1, 7, ...s); continue;}
    if (op === 'RET') {if (!returns.length) break; pc = returns.pop()!; continue;}
    if (op === 'CALL') {returns.push(pc); pc = effective(args); continue;}
    if (op.startsWith('J')) {
      const take = op === 'JUMP' || op === 'JMI' && sf === 1 || op === 'JNZ' && zf === 0 || op === 'JZE' && zf === 1 || op === 'JPL' && sf === 0 && zf === 0;
      if (take) pc = effective(args);
      continue;
    }
    const dst = register(args[0]);
    if (op === 'LAD') {r[dst] = effective(args.slice(1)); continue;}
    if (op === 'ST') {const target = effective(args.slice(1)); if (!mem.has(target)) throw Error('UNINITIALIZED_WRITE:' + target); const before = mem.get(target)!; mem.set(target, r[dst]); writes.push({address: target, before, after: r[dst]}); continue;}
    const a = r[dst];
    if (op === 'SLL' || op === 'SRL') {
      const count = effective(args.slice(1));
      const overflow = count === 0 ? 0 : count > 16 ? 0 : op === 'SLL' ? (a >>> (16 - count)) & 1 : (a >>> (count - 1)) & 1;
      r[dst] = flags(count >= 16 ? 0 : op === 'SLL' ? a << count : a >>> count, overflow);
      continue;
    }
    const b = load(args.slice(1));
    if (op === 'LD') r[dst] = flags(b);
    else if (op === 'ADDL') r[dst] = flags(a + b, a + b > 65535 ? 1 : 0);
    else if (op === 'SUBL') r[dst] = flags(a - b, a < b ? 1 : 0);
    else if (op === 'CPL') {sf = a < b ? 1 : 0; zf = a === b ? 1 : 0; of = 0;}
    else if (op === 'AND') r[dst] = flags(a & b);
    else if (op === 'OR') r[dst] = flags(a | b);
    else if (op === 'XOR') r[dst] = flags(a ^ b);
    else throw Error('UNIMPLEMENTED_BIT_INSTRUCTION:' + op);
  }
  if (pushes.length || returns.length) throw Error('UNBALANCED_STACK');
  return {words: words.map((_, i) => mem.get(word(regionBase + i))!), registers: r,
    registersRestored: r.slice(1).every((v, i) => v === baselineRegisters[i]),
    saved, steps, writes, trace, labels: Object.fromEntries(labels)};
}
