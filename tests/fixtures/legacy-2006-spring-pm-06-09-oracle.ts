import assert from 'node:assert/strict';

type XY = readonly [number, number];
type Side = readonly [XY, XY];

export function readNumbered(code: string): string {
  return code.split('\n').map(line => line ? line.slice(4) : '').join('\n');
}

export function fillBlanks(code: string, part: Readonly<Record<string, string>>): string {
  return code.replace(/［([a-z])］/g, (_, slot: string) => {
    assert(slot in part, slot);
    return part[slot];
  });
}

export function readCurveCalls(code: string): Side[] {
  const input = [...code.matchAll(/KochCurve\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*2\s*\);/g)];
  assert.equal(input.length, 4);
  return input.map(([, x1, y1, x2, y2]) => [[Number(x1), Number(y1)], [Number(x2), Number(y2)]]);
}

export function inwardSides(sides: readonly Side[], width: number): string[] {
  const center = width / 2;
  const names = new Set<string>();
  const inward: string[] = [];
  for (const [[x1, y1], [x2, y2]] of sides) {
    assert([x1, x2, y1, y2].every(value => value === 0 || value === width));
    assert.equal(Math.abs(x1 - x2) + Math.abs(y1 - y2), width);
    const name = x1 === x2 ? (x1 ? 'right' : 'left') : (y1 ? 'bottom' : 'top');
    assert(!names.has(name));
    names.add(name);
    // In a screen-coordinate system, negative oriented area means left.
    if ((x2 - x1) * (center - y1) - (y2 - y1) * (center - x1) < 0) inward.push(name);
  }
  return inward.sort();
}

export function idealSegments([from, to]: Side, depth: number): Side[] {
  let segments: Side[] = [[from, to]];
  for (let level = 0; level < depth; level++) {
    segments = segments.flatMap(([[x1, y1], [x2, y2]]) => {
      const x = (x2 - x1) / 3;
      const y = (y2 - y1) / 3;
      const left: XY = [x1 + x, y1 + y];
      const right: XY = [x2 - x, y2 - y];
      const top: XY = [(x1 + x2 + y * Math.sqrt(3)) / 2, (y1 + y2 - x * Math.sqrt(3)) / 2];
      return [[[x1, y1], left], [left, top], [top, right], [right, [x2, y2]]];
    });
  }
  return segments;
}

export const occupiedPatterns = (limit: number): number[][] => {
  const all = Array.from({ length: limit }, (_, index) => index + 1);
  return [
    [], all, [1], [limit], [2], [3], [1, 3, 5, 6, 8, limit - 2, limit],
    all.slice(0, -1), all.slice(0, -2), all.filter(n => n !== 1), all.filter(n => n !== 2 && n !== 3),
  ];
};

export function emptySpaces(occupied: readonly number[], limit: number): string[] {
  const present = new Set(occupied);
  const ranges: number[][] = [];
  for (let n = 1; n <= limit; n++) {
    if (present.has(n)) continue;
    const previous = ranges.at(-1);
    if (previous?.at(-1) === n - 1) previous.push(n);
    else ranges.push([n]);
  }
  const rows = ranges.map(range => String(range[0]).padStart(3) +
    (range.length > 1 ? ' - ' + String(range.at(-1)).padStart(3) : '      '));
  return ['AKI KUKAKU', ...(rows.length ? rows : ['AKI : 0'])];
}

export function observedSpaces(occupied: readonly number[], limit: number, blanks: readonly string[]): string[] {
  const output = ['AKI KUKAKU'];
  let previous = 0, current = 0, switchOn = false, start = 0, end = 0, joined = false;
  const assign = (value: string) => {
    switch (value) {
      case 'COMPUTE M-HAJIME = BANGO - 1': start = current - 1; break;
      case 'COMPUTE M-HAJIME = W-BANGO + 1': start = previous + 1; break;
      case 'COMPUTE M-OWARI = BANGO - 1': end = current - 1; break;
      case 'COMPUTE M-OWARI = W-BANGO + 1': end = previous + 1; break;
      case 'MOVE SPACE TO DISPLAY-SW': switchOn = false; break;
      case 'MOVE SPACE TO MEISAI': start = end = 0; joined = false; break;
      case 'MOVE W-BANGO TO M-HAJIME': start = previous; break;
      case 'MOVE W-BANGO TO M-OWARI': end = previous; break;
      case 'MOVE "ON" TO DISPLAY-SW': switchOn = true; break;
      default: assert.fail(value);
    }
  };
  const edited = (value: number) => value ? String(value).padStart(3) : '   ';
  const record = () => output.push(edited(start) + (joined ? ' - ' : '   ') + edited(end));
  const clearDetail = () => { start = end = 0; joined = false; };

  for (const n of occupied) {
    current = n;
    if (n - previous > Number(blanks[0])) {
      clearDetail();
      assign(blanks[1]);
      if (n - previous > Number(blanks[2])) {
        joined = true;
        assign(blanks[3]);
      }
      record();
      assign(blanks[4]);
    }
    previous = n;
  }
  if (previous !== limit) {
    clearDetail();
    assign(blanks[1]);
    if (previous < limit - 1) {
      joined = true;
      end = limit;
    }
    record();
  } else if (!switchOn) {
    output.push('AKI : 0');
  }
  return output;
}

type Device = { id: string; encrypted: boolean | null; patches: Set<string> };

export function readDevices(code: string): { devices: Device[]; required: string[] } {
  const configs = [...code.matchAll(/pc\[(\d)\] = new (DesktopPC|NotebookPC)\("([^"]+)"(?:, (true|false))?\);/g)];
  const devices = configs.map(([, , type, id, encrypted], index): Device => {
    assert.equal(configs[index][1], String(index));
    const patches = [...code.matchAll(/pc\[(\d)\]\.installPatch\("([^"]+)"\);/g)]
      .filter(match => Number(match[1]) === index).map(match => match[2]);
    return { id, encrypted: type === 'DesktopPC' ? null : encrypted === 'true', patches: new Set(patches) };
  });
  assert.equal(devices.length, 3);
  const required = code.match(/curPatches = \{ ([^}]+) \};/)?.[1].match(/"[^"]+"/g)?.map(entry => entry.slice(1, -1));
  assert(required && required.length === 3);
  return { required, devices };
}

export function deviceStatus(code: string): string {
  const { devices, required } = readDevices(code);
  return devices.map(({ id, encrypted, patches }) => {
    const missing = required.filter(patch => !patches.has(patch));
    const prefix = id + ':';
    const encryptionNeeded = encrypted === false;
    return prefix + (missing.length ? ' requires [' + missing.join(', ') + ']' + (encryptionNeeded ? '\n' : '') : '') +
      (encryptionNeeded ? ' requires encryption tool' : missing.length ? '' : ' secure');
  }).join('\n');
}

export const coordinateDifferences = (input: readonly number[]) => [
  Math.max(input[0], input[2]) - Math.min(input[0], input[2]),
  Math.max(input[1], input[3]) - Math.min(input[1], input[3]),
];

export function countBinaryAdditions(value: number): number {
  let additions = 0;
  for (let factor = 1; factor <= value; factor *= 2) {
    if (Math.floor(value / factor) % 2) additions++;
  }
  return additions;
}

const instructionNames = new Set(['START', 'RPUSH', 'LD', 'SUBA', 'CALL', 'SRL', 'JZE', 'ADDA', 'SLA',
  'JUMP', 'RPOP', 'RET', 'JMI', 'JOV', 'END']);

export function runOblong(code: string, input: readonly number[]): { result: number; additions: number; preserved: boolean; overflow: boolean } | undefined {
  const labels = new Map<string, number>();
  const program = code.split('\n').map((line, i) => {
    const [first, ...rest] = line.split(';', 1)[0].trim().split(/\s+/);
    if (!first || instructionNames.has(first)) return [first, rest.join('')];
    labels.set(first, i);
    return [rest[0], rest.slice(1).join('')];
  });

  const registers = [888, 123, -8, 7, -2, 99, -16, 4];
  const previous = registers.slice(1);
  const stack: number[] = [];
  let ip = 0, of = false, sf = false, zf = false, overflow = false, additions = 0;
  const reg = (token: string) => {
    assert.match(token, /^GR[0-7]$/);
    return Number(token.at(-1));
  };
  const memory = (op: string, index: string | undefined) => {
    if (op.startsWith('=')) return Number(op.slice(1));
    if (op.startsWith('GR')) return registers[reg(op)];
    assert(index && registers[reg(index)] === 123);
    return input[Number(op)];
  };
  const setFlags = (value: number, shifted = false) => {
    of = shifted;
    sf = value < 0;
    zf = value === 0;
  };
  const write = (dst: string, value: number) => {
    const wrapped = ((value + 32768) & 0xffff) - 32768;
    const fellOutsideWord = value !== wrapped;
    overflow ||= fellOutsideWord;
    setFlags(wrapped, fellOutsideWord);
    registers[reg(dst)] = wrapped;
  };
  const jump = (label: string) => {
    const destination = labels.get(label);
    assert.notEqual(destination, undefined, label);
    return destination!;
  };

  for (let step = 0; step < 250; step++) {
    const [instruction, operand] = program[ip];
    const [r, rhs, index] = operand.split(',');
    let next = ip + 1;
    switch (instruction) {
      case 'START': case '': break;
      case 'RPUSH': stack.push(...registers.slice(1)); break;
      case 'RPOP':
        for (let i = 7; i > 0; i--) registers[i] = stack.pop()!;
        break;
      case 'LD': write(r, memory(rhs, index)); break;
      case 'SUBA': write(r, registers[reg(r)] - memory(rhs, index)); break;
      case 'ADDA':
        if (ip === 14) additions++;
        write(r, registers[reg(r)] + memory(rhs, index));
        break;
      case 'SLA': {
        assert.equal(rhs, '1');
        const value = registers[reg(r)];
        const sign = value & 0x8000;
        const nextWord = sign | ((value << 1) & 0x7fff);
        const signed = nextWord - (sign ? 0x10000 : 0);
        registers[reg(r)] = signed;
        overflow ||= signed !== value * 2;
        setFlags(signed, Boolean(value & 0x4000));
        break;
      }
      case 'SRL': {
        assert.equal(rhs, '1');
        const word = registers[reg(r)] & 0xffff;
        const shifted = word >>> 1;
        registers[reg(r)] = shifted;
        setFlags(shifted, Boolean(word & 1));
        break;
      }
      case 'JZE': if (zf) next = jump(r); break;
      case 'JMI': if (sf) next = jump(r); break;
      case 'JOV': if (of) next = jump(r); break;
      case 'JUMP': next = jump(r); break;
      case 'CALL': stack.push(next); next = jump(r); break;
      case 'RET':
        if (!stack.length) return { result: registers[0], additions, overflow,
          preserved: previous.every((value, i) => registers[i + 1] === value) };
        next = stack.pop()!;
        break;
      default: assert.fail(instruction);
    }
    ip = next;
  }
  return undefined;
}
