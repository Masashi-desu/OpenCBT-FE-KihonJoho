import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { GeneratedBody } from '../../src/core/generators/definition';

export function temporary(label: string, action: (folder: string) => void) {
  const folder = mkdtempSync(join(tmpdir(), label));
  try { action(folder); } finally { rmSync(folder, { recursive: true, force: true }); }
}
export const run = (command: string, args: string[], cwd: string, timeout = 12000) => spawnSync(command, args, {
  cwd, encoding: 'utf8', timeout, maxBuffer: 128_000,
  env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=0', UBSAN_OPTIONS: 'halt_on_error=1' },
});
export const fill = (text: string, answers: string[]) => text.replace(/⟦([a-g])⟧/g, (_, field: string) => answers['abcdefg'.indexOf(field)]);
export const codeParts = (item: GeneratedBody, language: string) => item.prompt.flatMap(block =>
  block.type === 'code' && block.language === language ? [block.text] : []);

export function accessOutput(records: string[][], verify: boolean) {
  const pairs = new Map([['11', [0, 1]], ['12', [0, 1]], ['21', [1, 2]], ['22', [1, 2]], ['31', [2, 3]]]);
  const output: { id?: string; name?: string; level: number; text: string }[] = [];
  const print: string[] = [];
  for (const id of new Set(records.map(([id]) => id))) {
    const group = records.filter(([key]) => key === id);
    let room = 0;
    print.push('');
    for (const [index, [, date, time, door, direction, permission, name]] of group.entries()) {
      const pair = pairs.get(door)!;
      const [entry, exit] = direction === 'I' ? pair : [pair[1], pair[0]];
      const card = index ? {} : { id, name };
      const prefix = index ? ' '.repeat(18) : id + '  ' + name + '  ';
      const unmatched = verify && room !== entry;
      if (unmatched) {
        const text = '***** Level ' + room + '-->' + entry;
        output.push({ ...card, level: 1, text });
        print.push(prefix + text);
      }
      const dateText = date.slice(4, 6) + '-' + date.slice(6);
      const timeText = time.slice(0, 2) + ':' + time.slice(2, 4);
      const text = dateText + ' ' + timeText + ' ' + door + ' ' + (permission === 'R' ? '(R)' : '') + (direction === 'I' ? 'IN' : 'OUT');
      output.push({ ...(unmatched ? {} : card), level: pair[1], text });
      print.push((unmatched ? ' '.repeat(18) : prefix) + ' '.repeat((pair[1] - 1) * 20) + text);
      room = permission === 'A' ? exit : entry;
    }
    if (verify && room !== 0) {
      const text = '***** Level ' + room + '-->0';
      output.push({ level: 1, text });
      print.push(' '.repeat(18) + text);
    }
  }
  return { output, stdout: print.length ? print.join('\n') + '\n' : '' };
}

export function cSource(item: GeneratedBody, answers: string[], verify: boolean) {
  const parts = codeParts(item, 'c');
  const insertions: [string, string][] = verify ? [
    ['①', 'int level = 0;'], ['②', 'void checkLevel();\nvoid clearLevel();'],
    [answers[3].at(-1)!, 'checkLevel();'], [answers[4].at(-1)!, 'clearLevel();'],
  ] : [];
  return fill(parts.slice(0, verify ? 3 : 2).join('\n\n'), answers).replace('void main()', 'int main(void)')
    .replace(/^([①②③④⑤⑥⑦⑧]) → (.*)$/gm, (_, label: string, line: string) =>
      [line, ...insertions.filter(([target]) => target === label).map(([, statement]) => statement)].join('\n'));
}

export function compileC(folder: string, program: string) {
  writeFileSync(join(folder, 'program.c'), program);
  return run('cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', '-fsanitize=address,undefined', '-fno-omit-frame-pointer',
    'program.c', '-o', 'program'], folder).status === 0;
}
export function readCLog(folder: string, records: string[][]) {
  const input = records.map(row => row.join('') + '\n').join('');
  writeFileSync(join(folder, 'Access.Log'), input);
  const result = run('./program', [], folder, 1500);
  return result.status === 0 ? result.stdout : undefined;
}

export type SurveyRow = { id: string; marks: number[] };
export function groupedRatings(rows: SurveyRow[], limit: number) {
  return Array.from({ length: 13 }, (_, offset) => offset + 3).flatMap(score => {
    const matches = rows.filter(({ marks }) => marks.reduce((sum, mark) => sum + mark, 0) === score)
      .map(({ id }) => id).sort((a, b) => Number(a) - Number(b));
    return Array.from({ length: Math.ceil(matches.length / limit) }, (_, index) => ({
      score: index === 0 ? score : null,
      ids: matches.slice(index * limit, (index + 1) * limit),
    }));
  });
}

function cobolCondition(text: string, sum: number, last: number, position: number): boolean {
  if (text.includes(' OR ')) return text.split(' OR ').some(part => cobolCondition(part, sum, last, position));
  if (text.includes(' AND ')) return text.split(' AND ').every(part => cobolCondition(part, sum, last, position));
  if (text === 'SRT-SUM NOT = LAST-SUM') return sum !== last;
  const match = /^POS > (\d+)$/.exec(text);
  assert(match);
  return position > Number(match[1]);
}

export function traceCobolGroups(rows: SurveyRow[], key: string, flush: string, heading: string, limit: number) {
  const records = rows.map(({ id, marks }) => ({ id, score: marks[0] + marks[1] + marks[2] }));
  const sortable = (record: { id: string; score: number }) => {
    const score = String(record.score).padStart(2, '0');
    if (key === 'SRT-SUM') return score;
    if (key === 'SRT-ID') return record.id;
    assert.equal(key, 'SRT-REC');
    return score + record.id;
  };
  records.sort((left, right) => sortable(left).localeCompare(sortable(right)));
  const result: { score: number | null; ids: string[] }[] = [];
  let last = 1, position = 1;
  let current: { score: number | null; ids: string[] } = { score: null, ids: [] };
  for (const { id, score } of records) {
    if (cobolCondition(flush, score, last, position)) {
      if (position > 1) result.push(current);
      current = { score: null, ids: [] };
      if (cobolCondition(heading, score, last, position)) current.score = last = score;
      position = 1;
    }
    if (position > limit) return undefined;
    current.ids[position - 1] = id;
    position++;
  }
  result.push(current);
  return result;
}

function numberPicture(pattern: string, value: number) {
  switch (pattern) {
    case '9(4)': return String(value).padStart(4, '0');
    case 'B(3)9': return '   ' + value % 10;
    case 'Z(3)9': return String(value).padStart(4);
    case 'Z(4)': return value === 0 ? '    ' : String(value).padStart(4);
    default: throw new Error('PICTURE');
  }
}
export function cobolHistogramChoice(field: number, candidate: string) {
  const counts = [[0, 19, 20, 21, 940], [1000, 0, 0, 0, 0], [12, 45, 546, 345, 52]];
  if (field === 0) return counts.flat().every(value => numberPicture(candidate, value) === String(value).padStart(4));
  if (field === 1) return counts.every((row, item) => row.every((value, mark) => {
    const i = item + 1, j = mark + 1;
    const positions = candidate === 'CNT-NUM(6 - I, J)' ? [6 - i, j]
      : candidate === 'CNT-NUM(I, 5 - J)' ? [i, 5 - j]
        : candidate === 'CNT-NUM(I, 6 - J)' ? [i, 6 - j] : [i, j];
    return counts[positions[0] - 1]?.[positions[1] - 1] === value;
  }));
  if (field === 2) return [1, 4, 50].every(length => {
    const reference = /^(\d):PLOT-NUM( \+ 1)?$/.exec(candidate);
    return reference && Number(reference[1]) === 1 && length + Number(Boolean(reference[2])) === length;
  });
  const record = { 'HIST-VAL': '5', 'HIST-NUM': '  21', 'HIST-PLOT': '*', 'HIST-REC': '5   21 *' };
  return record[candidate as keyof typeof record] === [record['HIST-VAL'], record['HIST-NUM'], record['HIST-PLOT']].join(' ');
}

export function cacheOrder(requests: number[], limit: number, policy: string) {
  const times = new Map<number, { first: number; last: number }>();
  return requests.map((id, step) => {
    times.set(id, { first: times.get(id)?.first ?? step, last: step });
    const metric = policy === 'LRU' ? 'last' : 'first';
    const order = [...times.keys()].sort((a, b) => times.get(b)![metric] - times.get(a)![metric]);
    if (order.length > limit) times.delete(order.pop()!);
    return policy + ':' + order.join(',');
  });
}

export function javaRun(folder: string, item: GeneratedBody, answers: string[], blockCount: number, blockSize: number, limit: number) {
  const requests = [...Array.from({ length: limit }, (_, index) => index), 0, Math.floor(limit / 2), limit - 1, limit,
    0, 1, blockCount - 1, blockCount - 1, limit + 1, limit];
  const filenames = ['BlockAccessor.java', 'BlockDevice.java', 'Cache.java', 'ListBasedCache.java'];
  codeParts(item, 'java').forEach((text, index) => writeFileSync(join(folder, filenames[index]), fill(text, answers)));
  const harness = [
    'import java.lang.reflect.Field;',
    'import java.lang.reflect.Method;',
    'import java.util.StringJoiner;',
    'public class RunCache {',
    '  public static void main(String[] args) throws Exception {',
    '    Field cacheField = BlockAccessor.class.getDeclaredField("cache");',
    '    cacheField.setAccessible(true);',
    '    for (Cache.Policy policy : Cache.Policy.values()) {',
    '      BlockAccessor accessor = new BlockAccessor(policy);',
    '      ListBasedCache cache = (ListBasedCache) cacheField.get(accessor);',
    '      for (int index : new int[]{' + requests.join(',') + '}) {',
    '        byte[] block = accessor.readBlock(index);',
    '        if (block.length != ' + blockSize + ') throw new AssertionError(index);',
    '        for (byte value : block) if (value != 0) throw new AssertionError(index);',
    '        block[0] = 15;',
    '        StringJoiner entries = new StringJoiner(",");',
    '        for (Object entry : cache.entries) {',
    '          Method getIndex = entry.getClass().getDeclaredMethod("getIndex");',
    '          getIndex.setAccessible(true);',
    '          entries.add(getIndex.invoke(entry).toString());',
    '        }',
    '        System.out.println(policy + ":" + entries);',
    '      }',
    '    }',
    '  }',
    '}',
  ].join('\n');
  writeFileSync(join(folder, 'RunCache.java'), harness);
  if (run('javac', ['--release', '8', '-encoding', 'UTF-8', ...filenames, 'RunCache.java'], folder).status !== 0) return false;
  const execution = run('java', ['-cp', '.', 'RunCache'], folder);
  const expected = ['FIFO', 'LRU'].flatMap(policy => cacheOrder(requests, limit, policy)).join('\n') + '\n';
  return execution.status === 0 && execution.stdout === expected;
}

const wordMask = 0xffff;
const opcodeSet = new Set('START END RPUSH RPOP RET LD ST LAD SUBA SLL SRL OR CPA JMI JPL JZE JNZ JUMP CALL'.split(' '));
const signedWord = (word: number) => word > 0x7fff ? word - 0x10000 : word;
const binaryWord = (word: number) => word.toString(2).padStart(16, '0');
export const insertBits = (words: number[], input: number, offset: number) => {
  const data = words.map(binaryWord).join('');
  const output = data.slice(0, offset) + binaryWord(input) + data.slice(offset);
  return output.match(/.{16}/g)!.map(word => Number.parseInt(word, 2));
};

export function runCasl(program: string, entry: string, input: number, words: number[], offset: number) {
  const instructions: { opcode: string; args: string[] }[] = [];
  const labels = new Map<string, number>();
  for (const line of program.split('\n')) {
    const source = line.replace(/^ *\d+ +/, '').split(';')[0].trim();
    if (!source) continue;
    const words = source.split(/\s+/);
    if (!opcodeSet.has(words[0])) labels.set(words.shift()!, instructions.length);
    const opcode = words.shift()!;
    assert.ok(opcodeSet.has(opcode), opcode);
    if (opcode !== 'START' && opcode !== 'END') instructions.push({ opcode, args: words.join('').split(',') });
  }
  const start = 500, finish = 1500, length = words.length + 1;
  const memory = new Map(words.map((word, index) => [start + index, word]));
  memory.set(finish - 1, 0x5a5a);
  memory.set(finish + length, 0x5a5a);
  const initial = [input, start, offset, finish, words.length, 0x7c91, 0x99ee, 0x5678];
  const registers = [...initial];
  const saved: number[][] = [], returns: number[] = [];
  const beforeOr: number[][] = [];
  const register = (text: string) => {
    assert.match(text, /^GR[0-7]$/);
    return Number(text.slice(2));
  };
  const read = (address: number) => {
    assert.ok(memory.has(address), 'read outside input: ' + address);
    return memory.get(address)!;
  };
  const operand = (arg: string) => arg.startsWith('GR') ? registers[register(arg)] : Number(arg.replace('=', ''));
  const address = (arg: string, index?: string) => (Number(arg) + (index ? operand(index) : 0)) & wordMask;
  const label = (name: string) => {
    assert.ok(labels.has(name), name);
    return labels.get(name)!;
  };
  let pc = label(entry), zero = false, negative = false;
  function flags(value: number) {
    zero = value === 0;
    negative = value < 0;
  }
  function store(target: string, value: number) {
    const word = value & wordMask;
    registers[register(target)] = word;
    flags(signedWord(word));
  }
  for (let steps = 0; steps < 1000; steps++) {
    const { opcode, args } = instructions[pc++];
    const [a, b, c] = args;
    switch (opcode) {
      case 'RPUSH': saved.push(registers.slice(1)); break;
      case 'RPOP': {
        const restored = saved.pop();
        assert(restored);
        registers.splice(1, 7, ...restored);
        break;
      }
      case 'RET': {
        const from = returns.pop();
        if (from !== undefined) {
          pc = from;
          break;
        }
        assert.equal(saved.length, 0);
        assert.equal(memory.get(finish - 1), 0x5a5a);
        assert.equal(memory.get(finish + length), 0x5a5a);
        assert.deepEqual(registers.slice(1), initial.slice(1));
        return { output: Array.from({ length }, (_, i) => read(finish + i)), beforeOr };
      }
      case 'LD': store(a, b.startsWith('GR') || b.startsWith('=') ? operand(b) : read(address(b, c))); break;
      case 'ST': {
        const location = address(b, c);
        assert.ok(location >= finish && location < finish + length, 'write outside output: ' + location);
        memory.set(location, operand(a));
        break;
      }
      case 'LAD': registers[register(a)] = address(b, c); break;
      case 'SUBA': store(a, operand(a) - operand(b)); break;
      case 'CPA': flags(signedWord(operand(a)) - signedWord(operand(b))); break;
      case 'SLL': case 'SRL': {
        const shift = address(b, c);
        store(a, shift >= 16 ? 0 : opcode === 'SLL' ? operand(a) << shift : operand(a) >>> shift);
        break;
      }
      case 'OR':
        if (a === 'GR4') beforeOr.push([operand(a), operand(b)]);
        store(a, operand(a) | operand(b));
        break;
      case 'JMI': if (negative) pc = label(a); break;
      case 'JPL': if (!negative && !zero) pc = label(a); break;
      case 'JZE': if (zero) pc = label(a); break;
      case 'JNZ': if (!zero) pc = label(a); break;
      case 'JUMP': pc = label(a); break;
      case 'CALL': returns.push(pc); pc = label(a); break;
      default: throw new Error(opcode);
    }
  }
  throw new Error('CASL step limit');
}

type StockSet = { parts: { product: number; required: number }[] };
export function stockOracle(lines: { product: number; quantity: number }[], sets: StockSet[]) {
  const stock = Array.from({ length: 50 }, (_, i) =>
    lines.filter(line => line.product === i + 1).reduce((sum, { quantity }) => sum + quantity, 0));
  const amounts = [];
  for (const set of sets) {
    let count = 0;
    while (set.parts.every(({ product, required }) => stock[product - 1] >= required)) {
      for (const { product, required } of set.parts) stock[product - 1] -= required;
      count++;
    }
    amounts.push(count);
  }
  return { amounts, stock };
}

export function macroMinCondition(candidate: string, value: number, current: number) {
  const [left, operator, right] = candidate.split(' ');
  const n = left === 'Num' ? value : current;
  const m = right === 'Set_Num' ? current : Number(right);
  switch (operator) {
    case '<': return n < m;
    case '>': return n > m;
    case '=': return n === m;
    case '≠': return n !== m;
    default: throw new Error(operator);
  }
}

export function macroReduction(candidate: string, stock: number, required: number, sets: number) {
  switch (candidate) {
    case '+ 1': return stock - required + 1;
    case '+ Set_Num': return stock - required + sets;
    case '- 1': return stock - required - 1;
    case '- Set_Num': return stock - required - sets;
    case '* Set_Num': return stock - required * sets;
    case '/ Set_Num': return stock - required / sets;
    default: throw new Error(candidate);
  }
}
