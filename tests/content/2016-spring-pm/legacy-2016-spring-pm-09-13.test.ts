import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { answerCanVary, answerSignature, bindQuestion } from '../../../src/core/generation';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { blockText } from '../../../src/core/generators/legacy-2016-autumn-pm-09-13-support';
import { spring2016Pm9Figure } from '../../../src/core/generators/legacy-2016-spring-pm-9';
import { spring2016Pm10ChangeTable } from '../../../src/core/generators/legacy-2016-spring-pm-10';
import { spring2016Pm13Sales } from '../../../src/core/generators/legacy-2016-spring-pm-13';
import { legacy2016SpringPm0913Figures } from '../../../src/core/generators/legacy-2016-spring-pm-figures-09-13';
import { legacy2016SpringPm0913FigureRenderers } from '../../../src/ui/Legacy2016SpringPm0913Figures';
import { spring2016Pm09To13Specs as specs } from '../../../scripts/legacy-2016-spring-pm-09-13-specs';
import { fixture } from '../../fixtures';
import {
  calendarBefore, caslRaceRunner, compiledCancellationCandidate, compileReservationCandidate,
  expandFractal, readCInitializer, reservationOracle, salesMacroCandidate, salesOracle, standingsOracle,
} from '../../fixtures/legacy-2016-spring-pm-09-13-oracles';

import sourceReview from '../../fixtures/legacy-2016-spring-pm-09-13-review.json';

const cases = [
  { number: 9, pages: [41, 42, 43, 44, 45], count: 8, sizes: [4, 4, 4, 7, 7, 7], key: 'ウイエイアカ', assets: [] },
  { number: 10, pages: [46, 47, 48, 49, 50], count: 12, sizes: [4, 6, 6, 4, 4, 4], key: 'ウアオアウウ', assets: [] },
  { number: 11, pages: [51, 52, 53, 54, 55, 56], count: 8, sizes: [4, 4, 4, 4, 4, 6, 6], key: 'アアアイイカエ', assets: [] },
  { number: 12, pages: [57, 58, 59, 60], count: 8, sizes: [8, 8, 3, 6, 6, 5], key: 'エウイオイア', assets: [71, 72, 73, 74, 75, 76] },
  { number: 13, pages: [61, 62, 63, 64, 65, 66, 67, 68], count: 8, sizes: [4, 4, 4, 4, 6, 6, 6], key: 'イアアエアウカ', assets: [4, 5, 77, 78, 79, 80, 81, 82] },
];
const body = (question: number, value: number) => specs[question - 9].definition.build([value]);
const visible = (item: GeneratedBody) => item.prompt.map(blockText).join('\n');
const options = (item: GeneratedBody, part: number) =>
  item.answerParts![part].choiceIds.map(id => item.choices[Number(id.replace('choice-value-', '')) - 1].map(blockText).join('\n'));
function index(item: GeneratedBody, part: number) {
  const answer = item.partAnswers![part];
  assert(answer.kind === 'choice');
  return item.answerParts![part].choiceIds.indexOf(answer.choiceId);
}
const answer = (item: GeneratedBody, part: number) => options(item, part)[index(item, part)];
const answers = (item: GeneratedBody, start: number, count: number) =>
  Array.from({length: count}, (_, i) => answer(item, start + i));
const fill = (source: string, names: string, choices: string[]) =>
  source.replace(/\[([a-g])\]/g, (text, name: string) => names.includes(name) ? choices[names.indexOf(name)] : text);
const run = (command: string, args: string[], cwd: string, timeout = 25000) => spawnSync(command, args, {
  cwd, encoding: 'utf8', timeout, maxBuffer: 800_000,
  env: {...process.env, ASAN_OPTIONS: 'detect_leaks=0', UBSAN_OPTIONS: 'halt_on_error=1'},
});
function temporary(label: string, action: (folder: string) => void) {
  const folder = mkdtempSync(join(tmpdir(), label));
  try { action(folder); } finally { rmSync(folder, {recursive: true, force: true}); }
}
function choiceMutations(selected: string[], part: number, candidates: string[], check: (values: string[]) => boolean) {
  for (const candidate of candidates) {
    const values = [...selected];
    values[part] = candidate;
    assert.equal(check(values), candidate === selected[part], JSON.stringify({part, candidate}));
  }
}
function attempt(action: () => boolean) {
  try { return action(); } catch { return false; }
}

test('2016春 午後問9–13の原28頁・原32欄・全44生成候補・言語別資料を照合する', () => {
  for (const sample of cases) {
    const spec = specs.find(value => value.number === sample.number)!;
    assert.deepEqual(spec.pages, sample.pages);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), sample.pages);
    assert(Object.values(spec.originalPageAlt).every(text => text.length > 100 && text.length <= 2000));
    const reviewed = sourceReview.questions.find(question => question.number === sample.number)!;
    assert.equal(createHash('sha256').update(JSON.stringify(spec.originalPageAlt)).digest('hex'), reviewed.originalPageAltSHA256);
    for (const premise of reviewed.premises) assert(visible(spec.original).includes(premise), premise);
    assert.equal(spec.original.partAnswers!.map((_, i) => 'アイウエオカキク'[index(spec.original, i)]).join(''), sample.key);
    assert.equal(spec.definition.fields[0].maximum + 1, sample.count);
    for (let i = 0; i < sample.count; i++) {
      const item = body(sample.number, i);
      assert.deepEqual(item.answerParts!.map(part => part.choiceIds.length), sample.sizes);
      assert(item.partAnswers!.every((_, n) => index(item, n) >= 0));
      assert(!JSON.stringify(item).includes('undefined'));
      assert.deepEqual(item.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])) ?? [],
        sample.assets.map(page => `asset-ipa-2016h28h-fe-pm-p${String(page).padStart(3, '0')}${page === 73 ? '-casl-excerpt' : ''}`));
      for (const [part, size] of sample.sizes.entries()) assert.equal(new Set(options(item, part)).size, size);
    }
    assert.equal(new Set(Array.from({length: sample.count}, (_, i) => visible(body(sample.number, i)))).size, sample.count);
    for (const invalid of [[], [sample.count], [-1], [0.5], Array(1), [0, 1]]) assert.throws(() => spec.definition.build(invalid));
  }
  assert.equal(specs[2].editorialContextTitles!.length, 1);
  assert(specs[2].original.contexts?.every(context => context.blocks.every(block => block.type !== 'image')));
});

test('2016春 問9 全8条件の図形・描画範囲・行列選択を独立した順方向の置換で照合する', () => {
  const before = expandFractal([[1, 1], [1, 0]], 2), after = expandFractal([[1, 1], [1, 0]], 3);
  for (let i = 0; i < 8; i++) {
    const item = body(9, i), result = spring2016Pm9Figure('new-pattern-result', [i]);
    assert(result.kind === 'new-pattern-result');
    const matching = options(item, 1).filter(candidate =>
      JSON.stringify(expandFractal(readCInitializer(candidate), 3)) === JSON.stringify(result.grid));
    assert.deepEqual(matching, [answer(item, 1)]);
    const shape = spring2016Pm9Figure('substitution-choice', [i]);
    assert(shape.kind === 'substitution-choice');
    assert.deepEqual(shape.before, before);
    assert.deepEqual(shape.after, after);
    const anchorRow = shape.target.row + shape.target.row, anchorColumn = shape.target.column + shape.target.column;
    assert.equal(shape.before[shape.target.row][shape.target.column], '*');
    for (const area of shape.areas) {
      const cells = Array.from({length: area.size}, (_, r) => Array.from({length: area.size}, (_, c) =>
        [r + area.row, c + area.column]));
      assert.equal(cells.length === 2 && cells[0][0][0] === anchorRow && cells[0][0][1] === anchorColumn,
        area.label === answer(item, 0));
    }
  }
});

test('2016春 問9 表示Cプログラム・全25欄別択をC11実行し、独立した置換と照合する', () => temporary('s3-004-fractal-', folder => {
  const item = body(9, 0);
  const source = item.prompt.find(block => block.type === 'code' && block.language === 'c');
  assert(source?.type === 'code');
  const correct = answers(item, 2, 4);
  const patterns = [readCInitializer(source.text), ...options(item, 1).map(readCInitializer)];
  const program = (selected: string[], pattern: number[][]) => {
    const initializer = `int pat[${pattern.length}][${pattern[0].length}] = {` +
      pattern.map(row => '{' + row.join(',') + '}').join(',') + '};';
    return fill(source.text.replace(/int pat[\s\S]*?\};/, initializer), 'abcd', selected);
  };
  const check = (selected: string[], pattern: number[][]) => {
    const expected = [0, 1, 2, 3, 0].map(depth => expandFractal(pattern, depth).join('\n') + '\nEND\n').join('');
    const harness = '\nint main(void) {\n  for (int i = 0; i <= 3; i++) { print_frac(i); puts("END"); }\n  print_frac(0); puts("END");\n  return 0;\n}\n';
    writeFileSync(join(folder, 'candidate.c'), program(selected, pattern) + harness);
    const compile = run('cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', '-fsanitize=address,undefined', '-fno-omit-frame-pointer', 'candidate.c', '-o', 'candidate'], folder);
    assert.equal(compile.status, 0, compile.stderr || compile.error?.message);
    const actual = run(join(folder, 'candidate'), [], folder, 1700);
    return actual.status === 0 && actual.stderr === '' && actual.stdout === expected;
  };
  assert(patterns.every(pattern => check(correct, pattern)));
  for (let part = 0; part < 4; part++)
    choiceMutations(correct, part, options(item, part + 2), selected =>
      (part === 1 ? [patterns[1]] : [patterns[0], patterns[1]]).every(pattern => check(selected, pattern)));
}));

test('2016春 問10 各客室状態と全候補を独立予約モデル、全保証日をGregorian暦へ照合する', () => {
  const dates = [];
  for (let year = 2016; year <= 2099; year++) for (let month = 1; month <= 12; month++) {
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= last; day++) dates.push(String(year) + String(month).padStart(2, '0') + String(day).padStart(2, '0'));
  }
  for (let i = 0; i < 12; i++) {
    const item = body(10, i), correct = answers(item, 0, 6);
    const program = item.prompt.flatMap(block => block.type === 'code' ? [block.text] : []).join('\n');
    const total = Number(/OCCURS (\d+)/.exec(program)?.[1]);
    assert(total === 6 + i % 3);
    const rooms: [number[] | null, number][] = [];
    for (let requested = 1; requested <= total; requested++) {
      rooms.push([null, requested]);
      for (let bits = 1; bits < 2 ** total; bits++) rooms.push([
        Array.from({length: total}, (_, n) => bits & (1 << n) ? 123456 + n : 0), requested,
      ]);
    }
    const verifyReservation = (selected: string[]) => attempt(() => {
      const exec = compileReservationCandidate(fill(program, 'abc', selected));
      return rooms.every(([before, requested]) =>
        JSON.stringify(exec(before, requested, 432198)) === JSON.stringify(reservationOracle(before, total, requested, 432198)));
    });
    for (let part = 0; part < 3; part++) choiceMutations(correct, part, options(item, part), verifyReservation);

    const change = spring2016Pm10ChangeTable([i]);
    const setCancel = (selected: string[]) => compiledCancellationCandidate(fill(change[3][1], 'ef', selected), change[0][1]);
    const days = [7, 5, 6, 8][Math.floor(i / 3)];
    assert(visible(item).includes(`宿泊する日の${days}日前`));
    const actualDate = setCancel(correct.slice(4));
    for (const date of dates) assert.equal(actualDate(date), calendarBefore(date, days), date);
    const witnesses = ['20160101', '20160301', '20170301', '20170501', '20990307', '20200229', '20160901'];
    for (let part = 4; part < 6; part++)
      choiceMutations(correct.slice(4), part - 4, options(item, part), selected => attempt(() =>
        witnesses.every(date => setCancel(selected)(date) === calendarBefore(date, days))));

    // Follow program flow for each insertion point, including a stale status on entry.
    const insertion = (candidate: string, hasRecord: boolean, initial: number, final: number) => {
      const line = Number(/行番号(\d+)/.exec(candidate)?.[1]);
      const visited = line === 25 || (line === 35 ? !hasRecord : hasRecord);
      return visited ? (line === 25 || line === 35 ? final : initial) === 0 : false;
    };
    for (const candidate of options(item, 3)) {
      const verify = [false, true].every(hasRecord => [0, 9].every(initial =>
        (hasRecord ? [0, 9] : [0]).every(final => insertion(candidate, hasRecord, initial, final) === (final === 0))));
      assert.equal(verify, candidate === answer(item, 3));
    }
  }
});

test('2016春 問11 全8条件と全20プログラム択をJava 8互換で実行して独立した絞込みと照合する', () => temporary('s3-004-todo-', folder => {
  const files = ['ToDo.java', 'ToDoList.java', 'Condition.java', 'ToDoListTester.java', 'Probe.java'];
  const probe = `public class Probe {
    public static void main(String[] args) {
      ToDoList xs = new ToDoList();
      ToDo x = new ToDo("A","20160420",ToDo.Priority.LOW);
      ToDo y = new ToDo("B","20160420",ToDo.Priority.LOW);
      xs.add(x); xs.add(new ToDo(x)); xs.add(y);
      if (xs.select().size() != 2) throw new AssertionError("identity");
      x.setState(ToDo.State.DONE);
      if (xs.select().get(0).getState() != ToDo.State.NOT_YET_STARTED) throw new AssertionError("copy");
      xs.update(x);
      xs.update(new ToDo("C","20160420",ToDo.Priority.HIGH));
      if (xs.select().size() != 2 || xs.select().get(0).getState() != ToDo.State.DONE) throw new AssertionError("update");
      if (xs.select(t -> true, t -> false, t -> true).size() != 0) throw new AssertionError("and");
      if (xs.select(t -> false, t -> true).size() != 0) throw new AssertionError("early failure");
      if (xs.select(t -> t.getSubject().equals("B")).size() != 1) throw new AssertionError("selection");
      boolean rejected = false;
      try { new ToDo("D","2016",ToDo.Priority.LOW); } catch (IllegalArgumentException ok) { rejected = true; }
      if (!rejected) throw new AssertionError("deadline length");
    }
  }`;
  writeFileSync(join(folder, files[4]), probe);
  function check(item: GeneratedBody, selected: string[], allInputs = false) {
    const chunks = item.prompt.flatMap(block => block.type === 'code' && block.language === 'java' ? [block.text] : []);
    assert.equal(chunks.length, 6);
    const sourceFiles = [
      fill(chunks[0] + '\n' + chunks[1], 'a', selected.slice(0, 1)),
      fill(chunks[2] + '\n' + chunks[3], 'bcde', selected.slice(1)),
      chunks[4], chunks[5],
    ];
    sourceFiles.forEach((source, i) => writeFileSync(join(folder, files[i]), source));
    const compile = run('javac', ['--release', '8', '-encoding', 'UTF-8', ...files], folder);
    if (compile.status !== 0) return false;
    const deadline = /compareTo\("(\d+)"\) < 0/.exec(chunks[5])?.[1];
    const priority = /getPriority\(\).equals\(ToDo.Priority.(\w+)\)/.exec(chunks[5])?.[1];
    assert(deadline && priority);
    const filtered = [...chunks[5].matchAll(/list\.add\(new ToDo\("([^"]+)", "(\d+)", ToDo.Priority.(\w+)\)\);/g)]
      .filter(([, , due, rank]) => Number(due.padEnd(12, '0')) < Number(deadline.padEnd(12, '0')) && rank === priority)
      .map(([, subject, due, rank]) => `主題: ${subject}, 期限: ${due}, 優先度: ${rank}`);
    assert.equal(filtered.length, 2);
    if (allInputs) {
      for (let i = 0; i < 2; i++) assert.deepEqual(options(item, i + 5).filter(option => option === filtered[i]), [answer(item, i + 5)]);
    }
    const execution = run('java', ['-cp', folder, 'ToDoListTester'], folder);
    const boundary = run('java', ['-cp', folder, 'Probe'], folder);
    return execution.status === 0 && boundary.status === 0 && execution.stderr === '' && boundary.stderr === '' &&
      execution.stdout === filtered.map(value => value + ', 状態: STARTED\n').join('');
  }
  for (let i = 0; i < 8; i++) {
    const item = body(11, i);
    assert(check(item, answers(item, 0, 5), true), `Java case ${i}`);
  }
  const item = body(11, 0), correct = answers(item, 0, 5);
  for (let part = 0; part < 5; part++)
    choiceMutations(correct, part, options(item, part), selected => check(item, selected));
}));

test('2016春 問12 実表示のCASL IIで各走査方向・順位・全分岐択と1時間未満の全秒を照合する', () => {
  const inputCases = [0, 1, 2, 3].map(kind => Array.from({length: 72}, (_, i): readonly [number, number] => {
    const team = (i * 5) % 9 + 1;
    return [team, kind === 0 ? 1720 : kind === 1 ? 1500 + i % 11 * 27 : kind === 2 ? 3599 - i % 9 * 5 : i % 8];
  }));
  for (let i = 0; i < 8; i++) {
    const item = body(12, i), selected = answers(item, 0, 6);
    const programs = item.prompt.flatMap(block => block.type === 'code' ? [block.text] : []);
    const race = (choices: string[]) => caslRaceRunner(fill(programs[0], 'ab', choices));
    const output = (choices: string[]) => caslRaceRunner(fill(programs.slice(1).join('\n'), 'de', choices));
    const ascending = /LOOP12[^\n]*\n\s*LD\s+GR4,=1\n/.test(programs[0]);
    const correctRace = race(selected.slice(0, 2));
    for (const input of inputCases) assert.deepEqual(correctRace(input).output, standingsOracle(input, ascending));
    for (let part = 0; part < 2; part++)
      choiceMutations(selected.slice(0, 2), part, options(item, part), choices => attempt(() =>
        inputCases.every(input => JSON.stringify(race(choices)(input).output) === JSON.stringify(standingsOracle(input, ascending)))));
    const tieOrder = correctRace(inputCases[0]).output.map(([team]) => team);
    const matchesTieOrder = options(item, 2).filter(candidate => {
      const direction = candidate.includes('昇順') ? 1 : candidate.includes('降順') ? -1 : 0;
      return direction !== 0 && tieOrder.slice(1).every((team, n) => (team - tieOrder[n]) * direction > 0);
    });
    assert.deepEqual(matchesTieOrder, [answer(item, 2)]);
    const render = (seconds: number, team: number) =>
      `${team} ${String(Math.floor(seconds / 60)).padStart(2, '0')}${String(seconds % 60).padStart(2, '0')}`;
    const correctOutput = output(selected.slice(3, 5));
    for (let seconds = 0; seconds < 3600; seconds++) {
      const team = seconds % 9 + 1, actual = correctOutput([], [team, seconds]), text = render(seconds, team);
      assert.deepEqual(actual.text, [text]);
      assert.equal(actual.subtracts, [...text.slice(2, 5)].reduce((sum, digit) => sum + Number(digit), 0));
      assert.deepEqual(actual.registers.slice(1, 3), [team, seconds]);
    }
    for (let part = 3; part < 5; part++)
      choiceMutations(selected.slice(3, 5), part - 3, options(item, part), choices => attempt(() =>
        [0, 5, 18, 70, 1550, 3599].every(seconds => output(choices)([], [9, seconds]).text[0] === render(seconds, 9))));
    const table = item.prompt.find(block => block.type === 'table' && block.caption === '出力されたデータ');
    assert(table?.type === 'table');
    const [, , m10, m1, s10, s1] = table.rows[0].map(Number);
    const count = correctOutput([], [7, (m10 * 10 + m1) * 60 + s10 * 10 + s1]).subtracts;
    assert.deepEqual(options(item, 5).filter(value => Number(value) === count), [answer(item, 5)]);
  }
});

test('2016春 問13 原表の参照規則と全関数候補を境界・同率・8判定コードで照合する', () => {
  const item = body(13, 0), current = 15;
  const ratios = [[50, 15, 15, 20], [15, 28, 20, 37], [15, 15, 15, 55]];
  for (const candidate of options(item, 0)) {
    const semantics = ratios.every(values => {
      const offset = candidate.endsWith('+ C5') ? current : candidate.endsWith('− C5') ? -current : 0;
      const actual = values.reduce((sum, value) => sum + (value > current || candidate.includes('≧') && value === current ? value : 0), offset);
      const descending = [...values].sort((a, b) => b - a);
      const expected = descending.slice(0, descending.indexOf(current) + 1).reduce((sum, value) => sum + value, 0);
      return actual === expected && candidate.includes('$C5:$K5');
    });
    assert.equal(semantics, candidate === answer(item, 0));
  }
  for (const candidate of options(item, 1)) {
    const semantics = [1, 69, 70, 71, 89, 90, 91, 100].every(value => {
      let category: string | undefined;
      if (candidate.includes('条件付個数')) {
        const count = candidate.includes('$B$25:$B$27') ? [0, 70, 90].filter(n => n < value).length : [70, 90, 100].filter(n => n <= value).length;
        category = 'ABC'[count - 1];
      } else if (candidate.endsWith('1), 1)') && !candidate.includes('−1')) {
        category = 'ABC'[[0, 70, 90].filter(n => n <= value).length - 1];
      }
      return category === (value <= 70 ? 'A' : value <= 90 ? 'B' : 'C');
    });
    assert.equal(semantics, candidate === answer(item, 1));
  }
  for (const candidate of options(item, 2)) {
    const semantics = [.90, 1, 1.10].every(a => [.90, 1, 1.10].every(b => {
      const comparison = candidate.includes('<') ? (v: number) => v < 1 : (v: number) => v > 1;
      const output = (candidate.includes('論理積') ? [a, b].every(comparison) : [a, b].some(comparison)) === candidate.endsWith("'N')");
      return output === (a < 1 && b < 1);
    }));
    assert.equal(semantics, candidate === answer(item, 2));
  }
  const outcomes = ['維持', '維持', '注意', '見直し', '注意', '見直し', '注意', '見直し'];
  for (const candidate of options(item, 3)) {
    const weight = Number(/C18 = 'Y', (\d)/.exec(candidate)?.[1]), row = Number(/, (\d), 0\)$/.exec(candidate)?.[1]);
    const semantics = outcomes.every((expected, code) => {
      const flags = [...code.toString(2).padStart(3, '0')].map(Number);
      const lookup = flags[0] * weight + flags[1] * 2 + flags[2];
      return (row === 5 ? outcomes[lookup] : lookup % 2 ? 'Y' : 'N') === expected;
    });
    assert.equal(semantics, candidate === answer(item, 3));
  }
});

test('2016春 問13 全例示表と原マクロ全候補を独立集計・セル配置・表示丸めへ照合する', () => {
  const codes = ['A001', 'A002', 'B101', 'B201', 'C010', 'C011', 'C012', 'D070', 'D080'];
  for (let i = 0; i < 8; i++) {
    const item = body(13, i);
    const analysis = item.prompt.find(block => block.type === 'table' && block.caption.includes('売上高分析表'));
    const sourceData = item.prompt.find(block => block.type === 'table' && block.caption.includes('販売データ'));
    const macro = item.prompt.find(block => block.type === 'code' && block.language === 'pseudocode');
    assert(analysis?.type === 'table' && sourceData?.type === 'table' && macro?.type === 'code');
    const saleYears = [2013 + i, 2014 + i, 2015 + i];
    const displayed = sourceData.rows.slice(1).filter(row => row[0] !== '⋮').map(row => ({
      year: Number(row[1]), product: row[4], price: Number(row[6].replaceAll(',', '')), quantity: Number(row[7]),
    }));
    const selected = answers(item, 4, 3);
    const amounts = i ? spring2016Pm13Sales(i) : [[], [], []];
    const fullFixture = saleYears.flatMap((year, yearIndex) => codes.flatMap((product, column) => {
      const shown = displayed.filter(row => row.year === year && row.product === product);
      const target = (amounts[yearIndex][column] ?? 35000 + yearIndex * 3 + column * 5) * 1000 + [-500, -499, 499][column % 3];
      const missing = target - shown.reduce((sum, value) => sum + value.price * value.quantity, 0);
      assert(missing > 0);
      // Independent synthetic remainder; the total straddles the half-thousand boundary.
      return [...shown, {year, product, price: missing - 500, quantity: 1}, {year, product, price: 500, quantity: 1}];
    }));
    const expected = [...salesOracle(fullFixture)];
    const verify = (choices: string[]) => attempt(() => {
      const actual = salesMacroCandidate(fill(macro.text, 'efg', choices), fullFixture, codes);
      return JSON.stringify([...actual.subtotalMap]) === JSON.stringify(expected) &&
        JSON.stringify([...actual.cellWrites]) === JSON.stringify([[3, saleYears[0]], [8, saleYears[1]], [13, saleYears[2]]]);
    });
    for (let part = 0; part < 3; part++) choiceMutations(selected, part, options(item, 4 + part), verify);
    const extracted = analysis.rows.filter(row => row[2] === '売上高');
    assert.deepEqual(extracted.map(row => Number(row[1])), saleYears);
    if (!i) {
      assert.deepEqual(extracted.map(row => row.at(-1)), ['151,847', '155,194', '159,524']);
      continue;
    }
    const totals = amounts.map(row => row.reduce((sum, value) => sum + value, 0));
    const percentages = (n: number, d: number) => (Number((BigInt(n) * 2000n + BigInt(d)) / (2n * BigInt(d))) / 10).toFixed(1) + '%';
    const management: string[][] = [];
    for (let year = 0; year < 3; year++) {
      const yearRow = 3 + year * 5;
      const row = (offset: number): string[] => analysis.rows.find(entry => Number(entry[0]) === yearRow + offset)!;
      const set = amounts[year], sorted = [...set].sort((a, b) => b - a);
      const accumulated = set.map(value => sorted.slice(0, sorted.indexOf(value) + 1).reduce((sum, other) => sum + other, 0));
      management.push(accumulated.map(value => value * 100 <= totals[year] * 70 ? 'A' : value * 100 <= totals[year] * 90 ? 'B' : 'C'));
      for (const [sheetColumn, col] of [[3, 0], [4, 1], [5, 2], [7, 7], [8, 8]]) {
        assert.equal(row(0)[sheetColumn].replaceAll(',', ''), String(set[col]));
        assert.equal(row(1)[sheetColumn], year ? percentages(set[col], amounts[year - 1][col]) : '－');
        assert.equal(row(2)[sheetColumn], percentages(set[col], totals[year]));
        assert.equal(row(3)[sheetColumn], percentages(accumulated[col], totals[year]));
        assert.equal(row(4)[sheetColumn], management[year][col]);
      }
    }
    const threshold = Number(/対前年比率が(\d+)%未満/.exec(visible(item))?.[1]);
    const decisions = analysis.rows.filter(row => ['18','19','20','21'].includes(row[0]));
    for (const [sheetColumn, col] of [[3, 0], [4, 1], [5, 2], [7, 7], [8, 8]]) {
      const declining = amounts[0][col] > amounts[1][col] && amounts[1][col] > amounts[2][col];
      const low = amounts[2][col] * 100 < amounts[1][col] * threshold;
      const categoryC = management[1][col] === 'C' && management[2][col] === 'C';
      const outcome = !declining && !low ? '維持' : categoryC ? '見直し' : '注意';
      assert.deepEqual(decisions.map(row => row[sheetColumn]), [declining ? 'Y' : 'N', low ? 'Y' : 'N', categoryC ? 'Y' : 'N', outcome]);
    }
  }
});

test('2016春 問13は式の正答を固定し、通常の生成経路で全8入力を区別する', () => {
  const review = sourceReview.questions.find(question => question.number === 13)?.answerVariation;
  assert(review);
  const bundle = fixture();
  const template = bundle.templates.find(item => item.id === 'template-source-2016h28h-fe-pm-13');
  assert(template);
  const base = bundle.questions.find(question => question.id === template.baseQuestionRef.questionId &&
    question.revision === template.baseQuestionRef.revision);
  assert(base);
  assert.equal(specs[4].definition.answerVariation, review.policy);
  assert.equal(answerCanVary(template), false);
  const inputField = template.parameterDomain.fields?.[0];
  assert(inputField);
  const {minimum, maximum} = inputField;
  const generated = Array.from({length: maximum - minimum + 1}, (_, i) =>
    bindQuestion(base, template, [minimum + i], 'worksheet-audit-' + i, '2026-11-07T00:00:00Z'));
  assert.equal(new Set(generated.map(answerSignature)).size, review.runtimeSignatures);
  assert.equal(new Set(generated.map(question => JSON.stringify(question.prompt.blocks))).size, review.distinctPrompts);
});

test('2016春 問9・10の全44図とレンダラの登録・読み上げ・可視文字・拡大を照合する', () => {
  assert.deepEqual(legacy2016SpringPm0913FigureRenderers.map(r => r.profile), legacy2016SpringPm0913Figures.map(f => f.profile));
  for (const fixture of legacy2016SpringPm0913Figures) {
    const renderer = legacy2016SpringPm0913FigureRenderers.find(value => value.profile === fixture.profile)!;
    for (let value = fixture.domain[0][0]; value <= fixture.domain[0][1]; value++) {
      const item = body(fixture.profile.includes('-9-') ? 9 : 10, value);
      const figure = item.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile === fixture.profile);
      assert(figure?.type === 'diagram');
      assert.equal(fixture.alt([value]), figure.alt);
      const html = renderToStaticMarkup(createElement(renderer.component, {values: [value], caption: figure.caption}));
      assert(html.includes('diagram-scroll') && html.includes('--image-scale') && html.includes(figure.caption));
      assert(!html.includes('undefined'));
      if (fixture.profile.endsWith('change-table')) assert(html.includes('<pre') && html.includes('DIVIDE CAN-YYYY BY 4'));
      if (fixture.profile.endsWith('substitution-choice')) assert.equal(html.match(/data-fractal-candidate/g)?.length, 4);
    }
    assert.throws(() => fixture.validate([-1]));
  }
});
