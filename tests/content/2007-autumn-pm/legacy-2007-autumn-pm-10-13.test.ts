import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { autumn2007PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2007-autumn-pm-10-13';
import { q11Modification } from '../../../src/core/generators/legacy-2007-autumn-pm-11';
import { q12Output } from '../../../src/core/generators/legacy-2007-autumn-pm-12';
import { q13Matrix } from '../../../src/core/generators/legacy-2007-autumn-pm-13';

const numbers = (text: string) => Number(text.replace(/[,#]/g, ''));
const textOptions = (body: GeneratedBody) => Object.fromEntries(body.answerParts!.map(part => [part.id.slice(5), part.choiceIds.map(id => {
  const block = body.choices[Number(id.split('-').at(-1)) - 1][0];
  assert(block.type === 'code' || block.type === 'paragraph');
  return block.text;
})]));
const correct = (body: GeneratedBody) => Object.fromEntries(body.answerParts!.map(part => {
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' ? answer.partId === part.id
    : answer.kind === 'unordered' && answer.partIds.includes(part.id));
  assert(answer?.kind === 'choice' || answer?.kind === 'unordered');
  const choice = answer.kind === 'choice' ? answer.choiceId : answer.choiceIds[answer.partIds.indexOf(part.id)];
  return [part.id.slice(5), part.choiceIds.indexOf(choice)];
}));
const textCode = (body: GeneratedBody, language: string) => body.prompt.flatMap(block =>
  block.type === 'code' && block.language === language ? [block.text] : []);
const renderedText = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const bodyTable = (body: GeneratedBody, caption: RegExp) => {
  const result = body.prompt.find(block => block.type === 'table' && caption.test(block.caption));
  assert(result?.type === 'table');
  return result;
};
function checkSlots(body: GeneratedBody, oracle: Record<string, string | string[]>) {
  const banks = textOptions(body);
  const expected = correct(body);
  assert.deepEqual(Object.keys(banks), Object.keys(oracle));
  for (const [id, bank] of Object.entries(banks)) {
    assert.equal(new Set(bank).size, bank.length);
    const valid = [oracle[id]].flat();
    assert.deepEqual(bank.filter(option => valid.includes(option)).sort(), [...valid].sort(), id);
    assert(valid.includes(bank[expected[id]]), id);
    if (valid.length === 1) assert.deepEqual(bank.map(option => option === valid[0]), bank.map((_, i) => i === expected[id]));
  }
}
const run = (command: string, args: string[], cwd: string, timeout = 8000) =>
  spawnSync(command, args, { cwd, encoding: 'utf8', timeout, maxBuffer: 2 * 1024 * 1024 });
function withTemp(prefix: string, work: (folder: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try { work(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}

const keys = ['エエイアイオ', 'イイウアオイウ', 'イイアイウキ', 'ウオイウアアイエ'];
const fieldCounts = [[5, 5, 5, 5, 6, 6], [4, 5, 5, 5, 5, 4, 4], [4, 4, 4, 4, 8, 8], [6, 6, 4, 4, 4, 4, 4, 4]];
test('問10〜13の公式正答・原形式・順不同の採点単位・4条件を保持する', () => {
  assert.deepEqual(drafts.map(draft => draft.number), [10, 11, 12, 13]);
  for (const [i, draft] of drafts.entries()) {
    const source = draft.original();
    const base = draft.definition.build([0]);
    assert.equal(Object.values(correct(source)).map(index => 'アイウエオカキク'[index]).join(''), keys[i]);
    assert.equal(Object.values(correct(base)).map(index => 'アイウエオカキク'[index]).join(''), keys[i]);
    const group = source.partAnswers!.find(part => part.kind === 'unordered');
    if (i === 1 || i === 2) {
      assert(group?.kind === 'unordered');
      assert.equal(group.presentation, i === 2 ? 'checklist' : undefined);
      assert.equal(group.partIds.length, 2);
      assert.equal(source.answerParts!.length - Number(group.presentation === 'checklist'), i === 1 ? 7 : 5);
    } else assert.equal(group, undefined);
    const corpus = [0, 1, 2, 3].map(index => draft.definition.build([index]));
    assert.equal(new Set(corpus.map(body => JSON.stringify(body.prompt))).size, 4);
    for (const body of corpus) {
      assert.deepEqual(Object.values(textOptions(body)).map(bank => bank.length), fieldCounts[i]);
      assert.deepEqual(body.prompt.map(block => block.type), base.prompt.map(block => block.type));
      assert(body.explanation.length > 150);
    }
    for (const invalid of [[], [0, 1], [-1], [4], [0.5], [NaN], Array<number>(1)])
      assert.throws(() => draft.definition.build(invalid), /範囲外/);
  }
});

function delivery(body: GeneratedBody, folder: string) {
  const [source] = textCode(body, 'c');
  const list = (name: string) => new RegExp(name + '\\[\\w+\\]\\s*= \\{([^}]+)\\}').exec(source)![1].split(', ').map(Number);
  const value = (name: string) => Number(new RegExp(name + ' = (\\d+)').exec(source)![1]);
  const small = list('Weight_tbl1'), normal = list('Weight_tbl2'), sizes = list('Size_tbl');
  const prices = list('Price_tbl'), weights = list('Mag_tbl');
  const unit = value('Unit_price'), base = value('Base_price'), extension = value('Ext_price');
  const min = value('Min_size'), max = value('Max_size'), last = value('Max_weight');
  const classes = [-2, -1, 3, 1, 2];
  const expected = (weight: number, size: number, distance: number) => {
    const matrix = [weight > last, weight > normal[3] && size > sizes[2], weight > normal[3],
      weight <= small[2] && size >= min && size <= max, true];
    const kind = classes[matrix.indexOf(true)];
    const bucket = (bounds: number[], x: number) => bounds.reduce((passed, max) => passed + Number(x > max), 0);
    const amount = kind === 3 ? [base, base + extension, base + extension * 2][distance] * weights[bucket(sizes, size)]
      : kind === 1 ? prices[bucket(small, weight)] : kind === 2 ? normal[bucket(normal, weight)] * unit : 0;
    return [kind, amount];
  };
  const measures = [...renderedText(body).matchAll(/重量([\d,]+)グラム，大きさ(\d+)cmの配送物/g)].map(([, w, s]) => [numbers(w), numbers(s)]);
  assert.equal(measures.length, 5);
  const picked = measures.map(([w, s]) => expected(w, s, 1));
  const heavyMiddle = expected(normal[3] + 1, sizes[1], 1)[1];
  const money = (value: number) => value.toLocaleString('en-US');
  checkSlots(body, { a: money(heavyMiddle), b: String(picked[0][0]), c: String(picked[1][0]), d: String(picked[2][0]),
    e: money(picked[3][1]), f: money(picked[4][1]) });
  const displayed = bodyTable(body, /配送料金/).rows;
  assert.deepEqual(displayed.map(row => row.slice(1)), [
    [money(expected(normal[3] + 1, sizes[0], 0)[1]), '非表示', money(expected(normal[3] + 1, sizes[0], 2)[1])],
    ['非表示', '［a］', '非表示'],
    [money(expected(last, sizes[2], 0)[1]), '非表示', money(expected(last, sizes[2], 2)[1])],
  ]);
  const probes = [...measures.map(([w, s]) => [w, s, 1]), ...[...small, ...normal, last].flatMap(w =>
    [w - 1, w, w + 1].flatMap(ww => [...sizes, min, max].flatMap(s =>
      [s - 1, s, s + 1].flatMap(ss => [0, 1, 2].map(distance => [ww, ss, distance])))))];
  const harness = `\n#include <stdio.h>
int main(void) {
  int w, s, d, category, fee;
  while(scanf("%d %d %d", &w, &s, &d) == 3) {
    calc_carriage(w, s, d, &category, &fee);
    printf("%d %d\\n", category, fee);
  }
}`;
  writeFileSync(join(folder, 'program.c'), source + harness);
  const compiled = run('cc', ['-std=c11', '-Werror', '-O0', 'program.c', '-o', 'program'], folder);
  assert.equal(compiled.status, 0, compiled.stderr);
  const result = spawnSync('./program', [], { cwd: folder, encoding: 'utf8', input: probes.map(row => row.join(' ')).join('\n'), timeout: 3000 });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split('\n'), probes.map(([w, s, d]) => expected(w, s, d).join(' ')));
}
test('問10の配送料金を境界前後のC11実行・独立条件表・全候補で検証する', () => {
  withTemp('fe-2007-pm-10-', folder => {
    for (let i = 0; i < 4; i++) delivery(drafts[0].definition.build([i]), folder);
  });
});

function filterWords(body: GeneratedBody, folder: string, index: number) {
  const [left, right, evaluator, starts, tester, duplicate] = textCode(body, 'java');
  assert.match(right, /^ {16}\/\/ /);
  assert.match(tester, /\n {29}\(target, new StringStartsEvaluator/);
  const table = bodyTable(body, /抽出する例/);
  const match = tester.match(/Arrays\.asList\(([^)]+)\)/)!;
  const words = match[1].split(',').map(value => JSON.parse(value.trim()) as string);
  const prefix: string = JSON.parse(tester.match(/new StringStartsEvaluator\(("[^"]+")\)/)![1]);
  const independentPrefix = (word: string) => word.substring(0, prefix.length) === prefix;
  const expected = words.filter(independentPrefix);
  assert.equal(q12Output.panel([index]).text, expected.join('\n'));
  assert.equal(table.rows[0][2], expected.map(word => '"' + word + '"').join(', '));
  const min = Number(duplicate.match(/j = i \+ (\d+)/)![1]);
  const repeated = (word: string) => {
    const firstOccurrence = new Map<string, number>();
    for (const [i, character] of [...word].entries()) {
      if (!firstOccurrence.has(character)) firstOccurrence.set(character, i);
      if (i - firstOccurrence.get(character)! >= min) return true;
    }
    return false;
  };
  const raw = textOptions(body), selected = correct(body);
  assert.deepEqual(raw.x, raw.y);
  const qualifying = raw.x.filter(value => repeated(JSON.parse(value)));
  checkSlots(body, { a: '&&', b: 'found', c: 'false', d: 'element', x: qualifying, y: qualifying });
  assert.deepEqual([raw.x[selected.x], raw.y[selected.y]].sort(), qualifying.sort());
  const harness = `import java.util.*;
public class Probe {
    public static void main(String[] args) {
        Extraction<String> e = new Extraction<String>(Arrays.asList("", null, "${prefix}One", "nothing", "${prefix}Two"), new StringStartsEvaluator("${prefix}"));
        Iterator<String> a = e.iterator(), b = e.iterator();
        if (!a.hasNext() || !a.hasNext() || !a.next().equals("${prefix}One")) throw new AssertionError("cache");
        if (!b.next().equals("${prefix}One") || !a.next().equals("${prefix}Two") || a.hasNext() || a.hasNext()) throw new AssertionError("advance");
        try { a.next(); throw new AssertionError("exhaustion"); } catch (NoSuchElementException expected) { }
        try { b.remove(); throw new AssertionError("remove support"); } catch (UnsupportedOperationException expected) { }
        AnEvaluator condition = new AnEvaluator();
        for (String value : new String[]{${raw.x.join(', ')}}) System.out.println(condition.evaluate(value));
    }
}`;
  const truth = raw.x.map(value => String(repeated(JSON.parse(value)))).join('\n') + '\n';
  const solve = (answers: Record<string, string>) => {
    const files: Record<string, string> = {
      Extraction: (left + '\n' + right).replace(/［([abcd])］/g, (_, id: string) => answers[id]),
      Evaluator: evaluator, StringStartsEvaluator: starts, ExtractionTester: tester, AnEvaluator: duplicate, Probe: harness,
    };
    for (const [name, contents] of Object.entries(files)) writeFileSync(join(folder, name + '.java'), contents);
    const compilation = run('javac', ['--release', '8', ...Object.keys(files).map(name => name + '.java')], folder);
    assert(!compilation.error, compilation.error?.message);
    if (compilation.status !== 0) return false;
    const check = run('java', ['ExtractionTester'], folder, 2500), checks = run('java', ['Probe'], folder, 2500);
    return check.status === 0 && checks.status === 0 && check.stdout === expected.join('\n') + '\n' && checks.stdout === truth;
  };
  const solution = Object.fromEntries('abcd'.split('').map(id => [id, raw[id][selected[id]]]));
  assert(solve(solution));
  for (const id of 'abcd') for (const candidate of raw[id]) {
    if (candidate !== solution[id]) assert(!solve({ ...solution, [id]: candidate }), id + ': ' + candidate);
  }
}
test('問12の反復子と全候補はJava実行・文字の初出位置・例外契約で検証する', () => {
  withTemp('fe-2007-pm-12-', folder => {
    for (let i = 0; i < 4; i++) {
      const sandbox = join(folder, String(i));
      mkdirSync(sandbox);
      filterWords(drafts[2].definition.build([i]), sandbox, i);
    }
  });
});

type Entry = { id: string; name: string; amount: number; date: string };
type Report = [string, number | null, number | null, number | null, string];
function reconcile(body: GeneratedBody, index: number) {
  const [first, second, call] = textCode(body, 'cobol');
  assert.match(first, /36 +SORT SORT-F ASCENDING KEY ［a］\n37 +USING  BANK-F\n38 +OUTPUT PROCEDURE MATCH-PROC/);
  assert.match(second, /45.*HIGH-VALUE AND\n46.*HIGH-VALUE/);
  assert.match(second, /61 +IF BANK-AMOUNT - ACCOUNT-AMOUNT = 0 THEN/);
  const callName = /CALL "([^"]+)"/.exec(call)![1];
  const changes = q11Modification.panel([index]).rows;
  assert(changes[1][1].includes('CALL "' + callName + '" USING ACCOUNT-AMOUNT'));
  const [same, different, notPaid, noBill] = bodyTable(body, /^入金確認結果$/).rows.map(([message]) => message);
  assert(second.includes('MOVE "' + same + '" TO P-MESSAGE'));
  const feeRule = /請求額が([\d,]+)円以上の取引で，その手数料を(\d+)円/.exec(renderedText(body));
  const threshold = feeRule ? numbers(feeRule[1]) : 50_000;
  const fee = feeRule ? numbers(feeRule[2]) : 440;
  const entry = (id: string, amount: number, day: number, name: string): Entry => ({
    id, amount, name, date: '200709' + String(day).padStart(2, '0'),
  });
  const bills = [entry('000002', threshold + 1500, 10, 'Beta'), entry('000004', threshold - 1, 3, 'Alpha'),
    entry('000005', threshold, 8, 'Omega'), entry('000007', threshold + 200, 15, 'Gamma')];
  const transfers = [entry('000004', threshold - 1, 1, 'Delta'), entry('000001', 440, 2, 'Nu'), entry('000003', 200, 3, 'Xi'),
    entry('000005', threshold - fee, 4, 'Theta'), entry('000006', 100, 10, 'Ada'), entry('000007', threshold + 130, 15, 'Mu')];
  const scenarios = [[bills, transfers], [[], transfers], [bills, []], [[], []]] as const;
  const provider = (amount: number) => amount >= threshold ? fee : 0;
  const reference = (accounts: readonly Entry[], deposits: readonly Entry[], withFee: boolean) => {
    const joined = new Map<string, { account: number | null; received: number | null }>();
    for (const account of accounts) joined.set(account.id, { account: account.amount, received: null });
    for (const deposit of deposits) {
      const branch = joined.get(deposit.id);
      if (branch) branch.received = deposit.amount;
      else joined.set(deposit.id, { account: null, received: deposit.amount });
    }
    return [...joined].sort(([a], [b]) => a.localeCompare(b)).map(([id, { account, received }]): Report => {
      const charge = !withFee || account === null ? 0 : provider(account);
      const due = account === null ? null : account - charge;
      const gap = due === null || received === null ? null : received - due;
      return [id, due, received, gap, due === null ? noBill : received === null ? notPaid : gap === 0 ? same : different];
    });
  };
  function stepThrough(accounts: readonly Entry[], deposits: readonly Entry[], selected: Record<string, string>, insertions: number[]) {
    const key = { 'BANK-AMOUNT': 'amount', 'BANK-BILL-CD': 'id', 'BANK-CUSTOMER-NM': 'name', 'BANK-DATE': 'date' }[selected.a] as keyof Entry;
    const ordered = [...deposits].sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'en', { numeric: true }));
    let ai = 0, bi = 0;
    let outstanding = accounts[0]?.amount;
    const rows: Report[] = [];
    const advanceBill = () => { ai++; outstanding = accounts[ai]?.amount; };
    const advanceTransfer = () => { bi++; };
    const applyFee = () => { if (outstanding !== undefined) outstanding -= provider(outstanding); };
    const perform = (source: string) => {
      if (source === 'PERFORM READ-ACCOUNT') advanceBill();
      if (source === 'PERFORM RETURN-BANK') advanceTransfer();
    };
    const message = (source: string) => /MOVE "([^"]+)"/.exec(source)?.[1] ?? '';
    while (ai < accounts.length || bi < ordered.length) {
      if (rows.length > accounts.length + deposits.length) return null;
      if (insertions.includes(47)) applyFee();
      const bill = accounts[ai], transfer = ordered[bi];
      const billKey = bill?.id ?? '~', bankKey = transfer?.id ?? '~';
      if (bankKey > billKey) {
        if (insertions.includes(49)) applyFee();
        const report: Report = [billKey, outstanding ?? null, null, null, message(selected.b)];
        perform(selected.b);
        rows.push(report);
        advanceBill();
      } else if (bankKey === billKey) {
        assert(outstanding !== undefined && transfer);
        if (insertions.includes(56)) applyFee();
        const amount = transfer.amount - outstanding!;
        const status = amount === 0 ? same : message(selected.c);
        if (amount !== 0) perform(selected.c);
        rows.push([billKey, outstanding ?? null, transfer.amount, amount, status]);
        advanceBill();
        advanceTransfer();
      } else {
        if (insertions.includes(70)) applyFee();
        const report: Report = [bankKey, null, transfer!.amount, null, message(selected.d)];
        perform(selected.d);
        rows.push(report);
        perform(selected.e);
      }
    }
    return rows;
  }
  const banks = textOptions(body), selected = correct(body);
  const record = Object.fromEntries('abcde'.split('').map(field => [field, banks[field][selected[field]]]));
  const passes = (answers: Record<string, string>, spots: number[]) => scenarios.every(([bills, payments]) =>
    JSON.stringify(stepThrough(bills, payments, answers, spots)) === JSON.stringify(reference(bills, payments, spots.length > 0)));
  assert(passes(record, []));
  for (const field of 'abcde') {
    const choices = banks[field].filter(option => passes({ ...record, [field]: option }, []));
    assert.deepEqual(choices, [record[field]], field);
  }
  const location = (text: string) => Number(/行番号(\d+)と/.exec(text)![1]);
  const correctPair = [banks.f[selected.f], banks.g[selected.g]].map(location).sort();
  assert.deepEqual(banks.f, banks.g);
  assert.deepEqual(banks.f.flatMap((first, i) => banks.g.slice(i + 1).map(second => [location(first), location(second)]))
    .filter(pair => passes(record, pair)), [correctPair]);
  assert(passes(record, [...correctPair].reverse()));
  assert.deepEqual(correctPair, [49, 56]);
}
test('問11の全空欄・全挿入位置を独立突合せと昇順マージの実行で検証する', () => {
  for (let i = 0; i < 4; i++) reconcile(drafts[1].definition.build([i]), i);
});

function registers(rows: number[][]) {
  const scan = (entries: number[]) => entries.length === 16 && entries.every(entry => entry === 1);
  const completeRows = rows.flatMap((row, index) => scan(row) ? [index] : []);
  const columns = Array.from({ length: 16 }, (_, position) => rows.map(row => row[position]));
  const completeColumns = columns.flatMap((column, index) => scan(column) ? [index] : []);
  const left = scan(rows.map((row, i) => row[15 - i]));
  const right = scan(rows.map((row, i) => row[i]));
  const mask = Number('0b' + columns.map(scan).map(Number).join(''));
  return { values: [completeRows.length, left ? 0x8000 : 0, Number(right), mask],
    count: completeRows.length + completeColumns.length + Number(left) + Number(right),
    shading: rows.map((row, i) => row.map((_, j) => completeRows.includes(i) || completeColumns.includes(j) ||
      left && i + j === 15 || right && i === j)) };
}
function emulateCasl(sources: string[], replacements: Record<string, string>, rows: number[][]) {
  const program = sources.join('\n').split('\n').map(line => line.replace(/^\s*\d+ /, '').split(';')[0].replace(/［([abgh])］/g, (_, id: string) => replacements[id]).trimEnd());
  const labels = new Map<string, number>();
  const known = new Set('START RPUSH LD AND CPL ADDA SUBA SLL SRL LAD CALL RPOP RET JMI JNZ JPL JZE JUMP JOV END'.split(' '));
  const instructions = program.map((line, i) => {
    const words = line.trim().split(/\s+/);
    if (!known.has(words[0])) labels.set(words.shift()!, i);
    return { operation: words[0], args: (words[1] ?? '').split(',') };
  });
  const memory = rows.map(row => parseInt(row.join(''), 2));
  let valuesBeforeCall: number[] | undefined;
  const r = [0, 0, 0, 0, 0, 0, 0, 0];
  let sign = false, zero = false, overflow = false, pc = 0, resume = -1;
  const integer = (s: string) => s.startsWith('=#') ? parseInt(s.slice(2), 16) : Number(s.replace(/^=/, ''));
  const ri = (s: string) => Number(s.slice(-1));
  const value = (s: string) => /^GR/.test(s) ? r[ri(s)] : integer(s);
  const set = (position: number, value: number, carry = false) => {
    r[position] = value & 0xffff;
    zero = r[position] === 0;
    sign = r[position] >= 0x8000;
    overflow = carry;
  };
  for (let step = 0; step < 500; step++) {
    const instruction = instructions[pc++];
    if (!instruction) break;
    const { operation, args } = instruction;
    const [destination, operand] = args;
    const reg = ri(destination);
    const jump = (condition: boolean) => { if (condition) pc = labels.get(destination)!; };
    switch (operation) {
      case 'START': case 'RPUSH': case 'RPOP': break;
      case 'LD': {
        const input = args.length === 3 ? memory[integer(operand) + r[ri(args[2])]] : value(operand);
        if (input === undefined) return null;
        set(reg, input);
        break;
      }
      case 'AND': set(reg, r[reg] & value(operand)); break;
      case 'CPL': zero = r[reg] === value(operand); sign = r[reg] < value(operand); overflow = false; break;
      case 'ADDA': set(reg, r[reg] + value(operand)); break;
      case 'SUBA': set(reg, r[reg] - value(operand)); break;
      case 'SLL': set(reg, r[reg] << integer(operand), ((r[reg] >> (16 - integer(operand))) & 1) === 1); break;
      case 'SRL': set(reg, r[reg] >>> integer(operand), ((r[reg] >>> (integer(operand) - 1)) & 1) === 1); break;
      case 'LAD': r[reg] = (r[ri(args[2])] + integer(operand)) & 0xffff; break;
      case 'JMI': jump(sign); break;
      case 'JNZ': jump(!zero); break;
      case 'JPL': jump(!sign && !zero); break;
      case 'JZE': jump(zero); break;
      case 'JUMP': jump(true); break;
      case 'JOV': jump(overflow); break;
      case 'CALL': valuesBeforeCall = [r[0], r[2], r[3], r[4]]; resume = pc; jump(true); break;
      case 'RET':
        if (resume === -1) return { values: valuesBeforeCall, count: r[0] };
        pc = resume;
        resume = -1;
        break;
      default: return null;
    }
  }
  return null;
}
test('問13は各条件、256ビットの網掛け、全命令候補を独立した命令実行と数え上げで検証する', () => {
  for (let i = 0; i < 4; i++) {
    const body = drafts[3].definition.build([i]);
    const { rows, shades } = q13Matrix.panel([i]);
    const sources = textCode(body, 'casl2');
    const reference = registers(rows);
    assert.deepEqual(shades, reference.shading);
    assert.match(renderedText(body), new RegExp('本数は' + reference.count + 'である'));
    assert.match(sources[0], /^ 1  BTEST  START\n 2 +RPUSH/m);
    const selected = correct(body), banks = textOptions(body);
    const chosen = Object.fromEntries([...'abgh'].map(key => [key, banks[key][selected[key]]]));
    const formatted = reference.values.map(value => '#' + value.toString(16).toUpperCase().padStart(4, '0'));
    checkSlots(body, { a: 'JNZ    NWORD', b: 'JZE    CHECK', c: formatted[0], d: formatted[1], e: formatted[2],
      f: formatted[3], g: 'JNZ    LOOP2', h: 'SRL    GR2,15' });
    const extra = [
      Array.from({ length: 16 }, () => Array<number>(16).fill(0)),
      Array.from({ length: 16 }, () => Array<number>(16).fill(1)),
      Array.from({ length: 16 }, () => Array.from({ length: 16 }, (_, j) => Number(j === 1))),
      Array.from({ length: 16 }, (_, row) => Array.from({ length: 16 }, (_, j) => Number(j === 15 - row))),
    ];
    const probes = [rows, ...extra];
    const verifies = (options: Record<string, string>) => probes.every(bits => {
      const expected = registers(bits);
      const result = emulateCasl(sources, options, bits);
      return result?.count === expected.count && JSON.stringify(result.values) === JSON.stringify(expected.values);
    });
    assert(verifies(chosen));
    for (const id of 'abgh') for (const value of banks[id]) if (value !== chosen[id])
      assert(!verifies({ ...chosen, [id]: value }), id + ' ' + value);
  }
});
