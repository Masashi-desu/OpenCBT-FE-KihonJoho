import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2011SpecialPm09To13Definitions as definitions, special2011PmLanguageDrafts as drafts } from '../src/core/generators/legacy-2011-special-pm-09-13';
import { legacy2011SpecialPm0913Figures as figures } from '../src/core/generators/legacy-2011-special-pm-09-13-figures';
import { legacy2011SpecialPm0913FigureRenderers as renderers } from '../src/ui/Legacy2011SpecialPm0913Figures';

const kana = 'アイウエオカキクケコ';
const official = ['オアキエオアイ', 'アオアウキアエオオ', 'ウイウカアアエ', 'カイウイア', 'アキウケアオクケ'];
type Choice = { options: Block[][]; answer: number };
type Answers = Record<string, Choice>;
function getAnswers(body: GeneratedBody): Answers {
  const entries = body.answerParts!.map(part => {
    const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === part.id);
    assert.ok(answer?.kind === 'choice');
    const options = part.choiceIds.map(id => body.choices[Number(id.replace('choice-value-', '')) - 1]);
    return [part.id.slice(5), { options, answer: part.choiceIds.indexOf(answer.choiceId) }];
  });
  return Object.fromEntries(entries);
}
function itemText(block: Block) {
  if (block.type === 'diagram') return block.alt;
  if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'code') return block.text;
  assert.fail('未知の本文構造');
}
function item(body: GeneratedBody, suffix: string) {
  const block = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith('-' + suffix));
  assert.ok(block?.type === 'diagram');
  return block.alt;
}
function all(body: GeneratedBody) { return body.prompt.map(itemText).join('\n'); }
function unique(field: Choice, isValid: (text: string, index: number) => boolean) {
  assert.ok(field.options.length >= 2);
  const distinct = field.options.map(blocks => blocks.map(itemText).join('\n'));
  assert.equal(new Set(distinct).size, distinct.length);
  const accepted = distinct.flatMap((text, index) => isValid(text, index) ? [index] : []);
  assert.deepEqual(accepted, [field.answer], distinct.join('\n'));
}
const number = (text: string) => Number(text.replaceAll(',', ''));
const split = (text: string) => text.split('\n').filter(line => line.includes('｜')).map(line => line.split('｜'));

function seatOracle(body: GeneratedBody, fields: Answers) {
  const program = all(body);
  const free = Number(/reserved == (\d)/.exec(program)![1]);
  assert.ok(program.includes(`${free}は空きを，${1 - free}は予約済`));
  type Seat = { kind: string; status: number };
  const seat = (kind: string, empty = true): Seat => ({ kind, status: empty ? free : 1 - free });
  const layouts = [
    [[seat('A'), seat('A'), seat('B'), seat('A'), seat('A')]],
    [[seat('A'), seat('B'), seat('A'), seat('A')], [seat('A'), seat('A')]],
    [[seat('A'), seat('A', false), seat('A')], [seat('A')], [seat('A'), seat('A')]],
    [[seat('A'), seat('B'), seat('A')], [seat('A'), seat('A', false)]],
    [[], [seat('B'), seat('A'), seat('A'), seat('A')]],
  ];
  const expected = (layout: Seat[][], kind: string, count: number) => {
    for (const [row, seats] of layout.entries()) {
      const sequence = seats.map(seat => seat.status === free ? seat.kind : ' ').join('');
      const at = sequence.indexOf(kind.repeat(count));
      if (at >= 0) return ['ABCDEFGHIJKLMNOPQRSTUVWXYZ'[row], at + 1];
    }
    return ['', 0];
  };
  const run = (layout: Seat[][], kind: string, count: number, actions: string[]) => {
    let found = 0, cnt = 0, no = 0, row = 0;
    const action = (command: string) => {
      switch (command) {
        case 'cnt = 0': cnt = 0; break;
        case 'cnt--': cnt--; break;
        case 'cnt++': cnt++; break;
        case 'found = 0': found = 0; break;
        case 'found = 1': found = 1; break;
        default: assert.fail(command);
      }
    };
    for (; row < layout.length; row++) {
      cnt = 0;
      const seats = layout[row];
      for (no = 0; no < seats.length; no++) {
        if (seats[no].kind === kind && seats[no].status === free) {
          if (++cnt >= count) { action(actions[0]); break; }
        } else action(actions[1]);
      }
      if (found) break;
    }
    if (!found) return ['', 0];
    const values = new Map<string, string | number>([
      ['no', no], ['no - num', no - count], ['no - num + 1', no - count + 1], ['no - num + 2', no - count + 2],
      ['row', row], ['row + 1', row + 1], ['row_s[row]', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[row]], ['row_s[row + 1]', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[row + 1]],
    ]);
    return [values.get(actions[2]), values.get(actions[3])];
  };
  const correct = ['found = 1', 'cnt = 0', 'row_s[row]', 'no - num + 2'];
  [...'abcd'].forEach((id, position) => unique(fields[id], candidate =>
    layouts.every(layout => ['A', 'B'].every(kind => [1, 2, 3, 4].every(count => {
      const trial = correct.map((value, i) => i === position ? candidate : value);
      return JSON.stringify(run(layout, kind, count, trial)) === JSON.stringify(expected(layout, kind, count));
    })))));
  const array = /class_s\[CLSNUM\] = "([A-Z]{4})"/.exec(program)![1];
  const byFee = [...'SABC'];
  const byOpt = (opt: number, missing: string) => {
    const forward = program.includes('if (opt == 0)') ? opt === 0 : opt !== 0;
    const choices = [...array];
    if (!forward) choices.reverse();
    return choices.filter(value => value !== missing);
  };
  unique(fields.e, candidate => byFee.every(missing => {
    const at = byFee.indexOf(missing);
    const alternatives = candidate.startsWith('を除く') ? byFee.filter(value => value !== missing)
      : candidate.includes('一つ料金の高い') ? byFee.slice(Math.max(0, at - 1), at)
      : candidate.includes('一つ料金の安い') ? byFee.slice(at + 1, at + 2)
      : candidate.includes('料金の高い') ? byFee.slice(0, at) : byFee.slice(at + 1);
    return [...alternatives].sort().join() === byOpt(0, missing).sort().join();
  }));
  [0, 1].forEach((opt, i) => unique(fields['fg'[i]], candidate =>
    byFee.every(missing => {
      const rest = byFee.filter(value => value !== missing);
      if (candidate === '安い') rest.reverse();
      return rest.join() === byOpt(opt, missing).join();
    })));
}

function voucherOracle(body: GeneratedBody, fields: Answers) {
  const program = all(body);
  const table = split(item(body, 'decision-table')).filter(row => row.length === 8);
  const small = number(/([\d,]+)株以下/.exec(table[0][1])![1]);
  const large = number(/([\d,]+)株以上/.exec(table[2][1])![1]);
  const splitYear = Number(/(\d+)年未満/.exec(table[3][1])![1]);
  const maxYear = Number(/最長保有期間は(\d+)年/.exec(program)![1]);
  const checkByTable = (stocks: number, term: number) => {
    const bucket = stocks <= small ? 0 : stocks < large ? 1 : 2;
    const column = 2 + 2 * bucket + Number(term >= splitYear);
    const action = table.slice(5).find(row => row[column] === 'X');
    assert.ok(action);
    return number(action[1].slice(0, -1));
  };
  const amounts = [...program.matchAll(/MOVE (\d+) TO GFT-SUM/g)].map(match => Number(match[1]));
  assert.equal(amounts.length, 4);
  const passed = ['1', String(small), '0', String(splitYear - 1), 'ANY', String(small + 1), String(large - 1)];
  const evaluate = (stocks: number, term: number, values: string[]) => {
    const [a, b, c, d, e, f, g] = values;
    const inclusive = (value: number, left: string, right: string) => Number(left) <= value && value <= Number(right);
    if (inclusive(stocks, a, b) && inclusive(term, c, d)) return amounts[0];
    if (inclusive(stocks, a, b) && e === 'ANY' || inclusive(stocks, f, g) && inclusive(term, c, d)) return amounts[1];
    if (inclusive(stocks, f, g) && e === 'ANY' || e === 'ANY' && inclusive(term, c, d)) return amounts[2];
    return e === 'ANY' ? amounts[3] : undefined;
  };
  const stocks = [1, 2, 9, 10, 99, small - 1, small, small + 1, small + 2, 3000, 5000, large - 1, large, large + 1, 999999];
  [...'abcdefg'].forEach((id, position) => unique(fields[id], candidate => {
    const values = passed.map((value, i) => i === position ? candidate : value);
    return stocks.every(count => Array.from({ length: maxYear + 1 }, (_, i) => i).every(term =>
      evaluate(count, term, values) === checkByTable(count, term)));
  }));
  const output = item(body, 'holding-period-chart');
  assert.ok(output.includes('00:'));
  assert.ok(output.includes(String(maxYear).padStart(2, '0') + ':'));
  assert.ok(program.includes(`OCCURS ${maxYear + 1} PIC`));
  const registrations = [0, 0, 0, 0, 1, 3, 5, maxYear];
  const bins = Array.from({ length: maxYear + 1 }, (_, duration) => registrations.filter(term => term === duration).length);
  function evaluateIndex(term: number, counter: number, index: string) {
    const base = index.startsWith('TERM') ? term : counter;
    return base + (index.endsWith('+ 1') ? 1 : index.endsWith('- 1') ? -1 : 0);
  }
  unique(fields.h, candidate => {
    const subscript = /CNT-HLD\(([^)]+)\)/.exec(candidate)![1];
    const counts = Array<number>(maxYear + 2).fill(0);
    for (const term of registrations) {
      const pos = evaluateIndex(term, 0, subscript);
      if (pos < 1 || pos > maxYear + 1) return false;
      counts[pos]++;
    }
    return counts.slice(1).join() === bins.join();
  });
  unique(fields.i, candidate => {
    const subscript = /CNT-HLD\(([^)]+)\)/.exec(candidate)![1];
    return bins.every((count, duration) => {
      const picked = bins[evaluateIndex(0, duration, subscript) - 1];
      const result = candidate.includes('CNT-ALL * 100')
        ? Math.trunc(50 * registrations.length / picked)
        : Math.trunc(50 * picked / registrations.length);
      return result === Math.trunc(50 * count / registrations.length);
    });
  });
}

function javaOracle(body: GeneratedBody, fields: Answers) {
  const program = all(body);
  const widths = [...program.matchAll(/EXT_SIZE = (\d+);/g)].map(match => Number(match[1]));
  assert.equal(widths.length, 2);
  const width = widths[0];
  assert.equal(width, widths[1]);
  unique(fields.a, candidate => [width, width * 2, width * 3].every(length => {
    const newLength = length + width;
    const expressions: Record<string, number> = { 'data.length + length': 2 * length, 'data.length + temp.length': length + newLength,
      length, 'length + EXT_SIZE': newLength, 'length - 1': length - 1, 'temp.length': newLength };
    return expressions[candidate] + Number(program.includes('i <= ［a］')) === length;
  }));
  unique(fields.b, candidate => Array.from({ length: 4 * width + 3 }, (_, index) => index).every(index => {
    const length = 4 * width + 3;
    const entries: Record<string, number> = { index, 'index % EXT_SIZE': index % width, 'index / EXT_SIZE': Math.trunc(index / width),
      length, 'length % EXT_SIZE': length % width, 'length / EXT_SIZE': Math.trunc(length / width) };
    return Math.floor(index / width) * width + entries[candidate] === index && entries[candidate] < width;
  }));
  unique(fields.c, candidate => Array.from({ length: 4 * width + 3 }, (_, length) => length).every(length => {
    const offset = length % width;
    const values: Record<string, number> = { length, 'length + 1': length + 1, 'length - 1': length - 1,
      offset, 'offset + 1': offset + 1, 'offset - 1': offset - 1 };
    return Math.trunc(values[candidate] / width) === Math.max(0, Math.ceil(length / width) - 1);
  }));
  unique(fields.d, candidate => [width + 1, 2 * width, 3 * width + 2].every(length =>
    Array.from({ length: Math.ceil(length / width) }, (_, bucket) => bucket).every(bucket => {
      const len = length - bucket * width;
      const values: Record<string, number> = { len, 'len % EXT_SIZE': len % width, 'len - length': len - length,
        length, 'length % EXT_SIZE': length % width, 'length - len': length - len };
      return values[candidate] === bucket * width;
    })));
  unique(fields.e, candidate => ['ArrayAppendableCharSequence', 'ListAppendableCharSequence'].every(source =>
    (candidate === source || candidate === 'AppendableCharSequence') && candidate !== 'Object'));
  unique(fields.f, candidate => {
    const head = { next: null };
    const values: Record<string, object | null> = { bucketList: head, 'bucketList.next': null, last: null, 'last.next': null, 'new Bucket()': { next: null }, null: null };
    return values[candidate] === head;
  });
  unique(fields.g, candidate => {
    const tail = { next: { next: null } }, head = { next: { next: tail } };
    const values: Record<string, object | null> = { bucketList: head, 'bucketList.next': head.next, last: tail,
      'last.next': tail.next, 'new Bucket()': { next: null }, null: null };
    return values[candidate] === tail.next;
  });
  assert.match(program, /AppendableCharSequence\n {20}implements/);
  assert.match(program, /%n",\n {25}a\.getClass\(\)\.getName\(\),\n {25}n, end - start/);
  const calls = /TIMES = \{\n\s+([\d, ]+)/.exec(program)![1].split(',').map(Number);
  const measurement = split(item(body, 'append-time'));
  assert.deepEqual(measurement[0].slice(1).map(cell => number(cell.slice(0, -1))), calls);
}

function readBitmaps(text: string) {
  const words = [...text.matchAll(/^[01]{16}$/gm)].map(match => parseInt(match[0], 2));
  assert.ok(words.length && words.length % 16 === 0);
  return Array.from({ length: words.length / 16 }, (_, i) => words.slice(i * 16, (i + 1) * 16));
}
function assemblyOracle(body: GeneratedBody, fields: Answers, input: number) {
  const [original, rotated] = readBitmaps(item(body, 'rotate-example'));
  const [same, part] = readBitmaps(item(body, 'partial-example'));
  assert.deepEqual(same, original);
  const text = all(body);
  const scope = Number(/左上の(\d+)×\d+ドットの部分だけを回転した実行例/.exec(text)![1]);
  const program = body.prompt.find(block => block.type === 'code' && block.text.includes('ROTATE  START'));
  assert.ok(program?.type === 'code');
  const lines = program.text.split('\n');
  assert.deepEqual(lines.map(line => Number(line.trim().split(/\s+/)[0])), Array.from({ length: 22 }, (_, i) => i + 1));
  assert.match(lines[13], /^14 {10}［a］$/);
  assert.match(lines[16], /^17 {10}［b］$/);
  assert.ok(text.includes('白は0，黒は1') && text.includes('GR1～GR7の内容は元に戻す'));
  const steps = (instruction: string) => {
    const parsed = /LAD\s+GR([125]),(-?1),GR\1/.exec(instruction);
    assert.ok(parsed);
    return [Number(parsed[1]), Number(parsed[2])] as const;
  };
  const sourcePtr = 0x200, destPtr = 0x500;
  const shift = (word: number, left: boolean) => left ? [(word << 1) & 0xffff, (word & 0x8000) !== 0] as const
    : [word >>> 1, (word & 1) !== 0] as const;
  const machine = (n: number, left: boolean, a: string, b: string, supplied: number[]) => {
    const registers = [0, sourcePtr, destPtr, 0, 0, 0, 0, 0];
    const mem = new Map<number, number>();
    original.forEach((word, i) => mem.set(sourcePtr + i, word));
    supplied.forEach((word, i) => mem.set(destPtr + i, word));
    const advance = (op: string) => { const [register, delta] = steps(op); registers[register] += delta; };
    for (let outer = 0; outer < n; outer++) {
      registers[5] = registers[2];
      registers[6] = mem.get(registers[1]) ?? 0x5aa5;
      for (let inner = 0; inner < n; inner++) {
        const address = registers[5];
        if (address < destPtr || address >= destPtr + 16) return undefined;
        const [result] = shift(mem.get(address)!, false);
        const [source, overflow] = shift(registers[6], left);
        registers[6] = source;
        mem.set(address, result | (overflow ? 0x8000 : 0));
        advance(a);
      }
      advance(b);
    }
    return Array.from({ length: 16 }, (_, i) => mem.get(destPtr + i)!);
  };
  const clockwise = (n: number) => {
    const rows = original.map(word => [...word.toString(2).padStart(16, '0')]);
    const out = rows.map(row => [...row]);
    for (let row = 0; row < n; row++) for (let col = 0; col < n; col++)
      out[col][n - 1 - row] = rows[row][col];
    return out.map(row => parseInt(row.join(''), 2));
  };
  const sameWords = (a: readonly number[] | undefined, b: readonly number[]) => a?.join() === b.join();
  const rightDest = 'LAD GR5,1,GR5', rightSource = 'LAD GR1,1,GR1';
  const init = Array.from({ length: 16 }, () => 0x5aa5);
  assert.deepEqual(rotated, clockwise(16));
  assert.deepEqual(part, clockwise(scope));
  unique(fields.a, candidate => sameWords(machine(16, true, candidate, rightSource, init), rotated));
  unique(fields.b, candidate => sameWords(machine(16, true, rightDest, candidate, init), rotated));
  const variant = machine(16, false, rightDest, rightSource, init)!;
  unique(fields['2'], alt => sameWords(readBitmaps(alt)[0], variant));
  if (input === 0) assert.deepEqual(fields['2'].options.map(choice => readBitmaps(itemText(choice[0]))[0].map(word => word.toString(16)).join(' ')), [
    'e38e e38e e38e e38e e38e fffe fffe fffe e38e e38e e38e e3fe e3fe e3fe e e',
    'e e e3fe e3fe e3fe e38e e38e e38e fffe fffe fffe e38e e38e e38e e38e e38e',
    '7000 7000 7fc7 7fc7 7fc7 71c7 71c7 71c7 7fff 7fff 7fff 71c7 71c7 71c7 71c7 71c7',
    '0 ffff ffff ffff 38e0 38e0 38e0 3fff 3fff 3fff e0 e0 e0 3fff 3fff 3fff',
  ]);
  function setup(n: number, c: string, d: string) {
    const before = Array<number>(16).fill(0x5aa5);
    const amount = n + (c.includes(',-1,') ? -1 : 0);
    for (let row = 0; row < n; row++)
      before[row] = c.startsWith('SLL') ? (original[row] << amount) & 0xffff : original[row] >>> amount;
    let counter = 16 - n, ptr = n;
    while (ptr <= 16) {
      counter--;
      const stop = d.startsWith('JMI') ? counter < 0 : d.startsWith('JNZ') ? counter !== 0 : d.startsWith('JPL') ? counter > 0 : counter === 0;
      if (stop) return before;
      if (ptr === 16) return undefined;
      before[ptr] = original[ptr];
      ptr++;
    }
    return undefined;
  }
  const expected = Array.from({ length: 16 }, (_, i) => clockwise(i + 1));
  const correctShift = 'SLL GR0,0,GR3', correctBranch = 'JMI LOOP1';
  const allScopes = (c: string, d: string) => expected.every((result, i) => {
    const n = i + 1, before = setup(n, c, d);
    return before !== undefined && sameWords(machine(n, true, rightDest, rightSource, before), result);
  });
  unique(fields.c, candidate => allScopes(candidate, correctBranch));
  unique(fields.d, candidate => allScopes(correctShift, candidate));
  assert.deepEqual(body.contexts?.flatMap(context => context.blocks.map(block => block.type === 'image' ? block.assetId : null)),
    ['070', '071', '072-casl-excerpt', '073', '074', '075'].map(id => 'asset-ipa-2011h23tokubetsu-fe-pm-p' + id));
}

function spreadsheetOracle(body: GeneratedBody, fields: Answers) {
  const ratings = split(item(body, 'rating-worksheet')).slice(2).map(([, , , , lower, tier, factor]) =>
    ({ lower: number(lower), tier, factor: number(factor) }));
  const sheet = split(item(body, 'limit-worksheet'));
  const rows = sheet.filter(row => /^K\d+$/.test(row[1]));
  const first = Number(rows[0][0]);
  const terms = split(item(body, 'payment-worksheet')).slice(2).map(row => row.slice(2).map(number));
  const mgmt = split(item(body, 'management-worksheet')).filter(row => /^K\d+$/.test(row[1]));
  const tier = (value: number, group: number) => {
    const subset = ratings.slice(group * 5, group * 5 + 5);
    return subset.reduce((last, entry, index) => value < entry.lower ? last : index, -1);
  };
  const asInt = (value: number) => Math.round(value * 1000) || 0;
  const monthTotal = (money: number[], months: number) => money.reduce((sum, n, i) => sum + (i + 1 <= months ? n : 0), 0);
  const allowed = (balance: number, order: number, limit: number) => limit !== 0 && limit - balance >= order;
  rows.forEach((row, i) => {
    const [, id, current, liabilities, liquid, equity, capital, own, one, two, cap1, cap2, cap] = row;
    assert.equal((100 * number(current) / number(liabilities)).toFixed(1), liquid);
    assert.equal((100 * number(equity) / number(capital)).toFixed(1), own);
    const l = tier(number(liquid), 0), o = tier(number(own), 1);
    const v1 = asInt((number(current) - number(liabilities)) * ratings[l].factor);
    const v2 = asInt(number(equity) * ratings[o + 5].factor);
    assert.deepEqual([one, two, number(cap1), number(cap2), number(cap)],
      [ratings[l].tier, ratings[o + 5].tier, v1, v2, v1 < 0 || v2 < 0 ? 0 : Math.min(v1, v2)]);
    const [, buyer, , side1, side2, , max, month, last, prior, third, balance, order, result] = mgmt[i];
    assert.deepEqual([id, one, two, cap, terms[l][o]], [buyer, side1, side2, max, Number(month)]);
    const pending = monthTotal([last, prior, third].map(number), Number(month));
    assert.equal(number(balance), pending);
    assert.equal(result, allowed(pending, number(order), number(max)) ? '○' : '×');
  });
  const normalized = (formula: string) => formula.replace(/\s/g, '');
  function readLookup(text: string) {
    const match = /([DG])(\d+)，信用度評価基準！\$D\$(\d+)～\$([EF])\$(\d+)，([23])，([01])/.exec(text);
    assert.ok(match);
    const [column, row, start, endColumn, endRow, result, mode] = match.slice(1);
    assert.equal(Number(row), first);
    const group = Number(start) === first - 1 ? 0 : 1;
    assert.equal(Number(start), first - 1 + group * 5);
    assert.equal(Number(endRow), Number(start) + 4);
    assert.equal(Number(result), endColumn === 'E' ? 2 : 3);
    return { column, group, endColumn, mode: Number(mode) };
  }
  const rateData = [[95, 42], [150, 10], [180, 21], [213, 80], [145, 85], [0, 0], [5, 5]];
  const allRules = [0, 1].map(group => [...ratings.slice(group * 5, group * 5 + 5).flatMap(r => [r.lower, r.lower + 0.5]), 251]);
  function evaluateLookup(text: string, d: number, g: number) {
    const shape = readLookup(text);
    const value = shape.column === 'D' ? d : g;
    const at = shape.mode === 1 ? tier(value, shape.group) : ratings.slice(shape.group * 5, shape.group * 5 + 5).findIndex(row => row.lower === value);
    if (at < 0) return undefined;
    const item = ratings[shape.group * 5 + at];
    return shape.endColumn === 'E' ? item.tier : item.factor;
  }
  ['a', 'b', 'c', 'd'].forEach((id, i) => unique(fields[id], candidate => {
    const group = i % 2, factor = i >= 2;
    return [...rateData, ...allRules[group].map(value => group === 0 ? [value, 37] : [160, value])].every(([d, g]) => {
      const item = ratings[group * 5 + tier(group === 0 ? d : g, group)];
      const observed = evaluateLookup(candidate, d, g);
      if (!factor) return observed === item.tier;
      const base = normalized(candidate).split('＊')[0];
      const amount = base.startsWith('（B') ? 157 : base.startsWith('E') ? 211 : 378;
      const expectedBase = group === 0 ? 157 : 211;
      return typeof observed === 'number' && asInt(amount * observed) === asInt(expectedBase * item.factor);
    });
  }));
  unique(fields.e, candidate => [[-50, 10], [10, 12], [0, 21], [-5, -1], [12, 12]].every(values => {
    const picked = candidate.includes('最小') ? Math.min(...values) : Math.max(...values);
    const actual = candidate.startsWith('IF') && picked < 0 ? 0 : picked;
    return actual === Math.max(0, Math.min(...values));
  }));
  unique(fields.f, candidate => {
    const termsRange = /表引き（支払いサイト！\$B\$(\d+)～\$F\$(\d+)，[\s\S]*）/.exec(candidate);
    if (!termsRange) return false;
    assert.equal(Number(termsRange[1]), first - 1);
    assert.equal(Number(termsRange[2]), first + 3);
    const lookups = [...candidate.matchAll(/照合一致（([HI])(\d+)，支払いサイト！\$([AB])\$(\d+)～\$([AF])\$(\d+)，([01])）/g)];
    if (lookups.length !== 2) return false;
    for (const lookup of lookups) {
      const [column, row, lowCol, lowRow, highCol, highRow, mode] = lookup.slice(1);
      assert.equal(Number(row), first);
      if (mode !== '0') return false;
      const expectedRange = column === 'H' ? ['A', first - 1, 'A', first + 3] : ['B', first - 2, 'F', first - 2];
      assert.deepEqual([lowCol, Number(lowRow), highCol, Number(highRow)], expectedRange);
    }
    // Base table happens to be symmetric, but its displayed first axis is 基準1.
    return lookups[0][1] === 'H' && lookups[1][1] === 'I';
  });
  unique(fields.g, candidate => {
    const condition = /条件付合計（N\$(\d+)～P\$(\d+)，'([=＜≦])M(\d+)'，N(\d+)～P(\d+)）/.exec(candidate);
    if (condition) assert.deepEqual(condition.slice(1).filter((_, i) => i !== 2).map(Number), [first - 1, first - 1, first, first, first]);
    return [0, 1, 2, 3].every(month => {
      const amounts = [37, 59, 87], order = 45;
      const actual = condition ? amounts.reduce((sum, amount, index) => {
        const ago = index + 1;
        const accepted = condition[3] === '=' ? ago === month : condition[3] === '＜' ? ago < month : ago <= month;
        return sum + (accepted ? amount : 0);
      }, 0) : candidate.startsWith('合計') ? amounts.reduce((sum, x) => sum + x, 0) : amounts[0];
      return actual + (candidate.includes('＋R') ? order : 0) === monthTotal(amounts, month);
    });
  });
  unique(fields.h, candidate => [[0, 0, 0], [0, 1, 0], [3, 2, 5], [4, 3, 5], [6, 1, 5], [2, 2, 7]].every(([balance, order, cap]) => {
    const code = normalized(candidate);
    const compare = code.includes('＋R') ? balance + order : balance;
    const over = code.includes('≧') ? compare >= cap : compare > cap;
    const failed = code.includes('論理和') ? over || cap === 0 : code.includes('論理積') ? over && cap === 0 : over;
    return !failed === allowed(balance, order, cap);
  }));
}

const methods = [seatOracle, voucherOracle, javaOracle, assemblyOracle, spreadsheetOracle];
for (const [q, definition] of definitions.entries()) {
  for (let input = 0; input < 4; input++) test(`2011特別午後 問${q + 9} 入力${input} の全選択肢と欄を独立検算`, () => {
    assert.equal(definition.source, '2011h23tokubetsu-fe-pm-' + (q + 9));
    const body = definition.build([input]);
    const fields = getAnswers(body);
    assert.equal(Object.keys(fields).length, official[q].length);
    assert.equal(definition.sourceAnswer, official[q]);
    if (input === 0) assert.equal(body.answerParts!.map(({ id }) => kana[fields[id.slice(5)].answer]).join(''), official[q]);
    methods[q](body, fields, input);
  });
}

test('五問の印刷頁・解答群・入力域・選択肢の変化', () => {
  const pages = drafts.flatMap(draft => Object.keys(draft.originalPageAlt()).map(Number));
  assert.deepEqual(pages, Array.from({ length: 30 }, (_, i) => 40 + i));
  for (const draft of drafts) {
    const keys = Array.from({ length: 4 }, (_, i) => {
      const body = draft.definition.build([i]);
      return body.answerParts!.map(({ id }) => {
        const { options, answer } = getAnswers(body)[id.slice(5)];
        return options[answer].map(itemText).join();
      }).join('\n');
    });
    assert.ok(new Set(keys).size > 1, draft.definition.source);
    for (const invalid of [[], [0, 1], [-1], [4], [1.5]]) assert.throws(() => draft.definition.build(invalid), /範囲外/);
  }
  const c = drafts[0].originalPageAlt(), cobol = drafts[1].originalPageAlt(), sheet = drafts[4].originalPageAlt();
  assert.match(c[42], /void check_seats\(char class, int num, SEAT \*hall\[ROWNUM\],\n {17}POSITION \*pos\)/);
  assert.match(c[43], /a，bに関する解答群\nア cnt = 0/);
  assert.ok(c[43].indexOf('c，dに関する解答群') < c[43].indexOf('設問2'));
  assert.match(cobol[47], /22 {9}READ HOLDER AT END {5}SET EOF TO TRUE\n23 {21}NOT AT END PERFORM SUM-PROC/);
  assert.match(sheet[68], /条件付合計（N\$2～P\$2，'≦M3'，N3～P3）/);
});

test('22図表・88表示状態の描画と読み上げを確認する', () => {
  assert.equal(figures.length, 22);
  assert.deepEqual(figures.map(f => f.profile), renderers.map(r => r.profile));
  const esc = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[ch]!);
  for (let i = 0; i < 4; i++) for (const [index, figure] of figures.entries()) {
    const html = renderToStaticMarkup(createElement(renderers[index].component, { values: [i], caption: '図表照合' }));
    const alt = esc(figure.alt([i]));
    assert.ok(html.includes(figure.profile));
    assert.ok(!/NaN|Infinity|<img/.test(html));
    if (figure.panel([i]).kind === 'bitmaps' || figure.panel([i]).kind === 'seats') {
      const label = /aria-labelledby="([^"]+)"/.exec(html);
      const description = /aria-describedby="([^"]+)"/.exec(html);
      assert.ok(label && description);
      assert.ok(html.includes(`<title id="${label[1]}">図表照合</title>`));
      assert.ok(html.includes(`<desc id="${description[1]}">${alt}</desc>`));
      if (figure.profile.includes('-rotation-choice-')) assert.ok(!html.includes('tabindex'));
      if (figure.profile.endsWith('-partial-example')) {
        assert.match(html, /stroke="var\(--visual-2011-special-bitmap-boundary\)"/);
        assert.ok(html.includes('>+15</text>'));
      }
    } else {
      assert.match(html, /<table /);
      assert.ok(html.includes(`aria-description="${alt}"`));
      assert.ok(html.includes('class="diagram-scroll"'));
      if (figure.profile.endsWith('-management-worksheet')) assert.match(html, /colSpan="3"/);
      if (figure.profile.endsWith('-program-change-end')) assert.match(html, /<pre style="[^"]+"><code>[\s\S]*GRAPH-PROC SECTION/);
    }
  }
});
