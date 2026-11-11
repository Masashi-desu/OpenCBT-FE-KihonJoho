import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { autumn2012Pm09To13Specs as specs } from '../scripts/legacy-2012-autumn-pm-09-13-specs';
import { legacy2012AutumnPm0913Figures as figures } from '../src/core/generators/legacy-2012-autumn-pm-09-13-figures';
import { legacy2012AutumnPm0913FigureRenderers as renderers } from '../src/ui/Legacy2012AutumnPm0913Figures';
import type { GeneratedBody } from '../src/core/generators/definition';
import type { Block } from '../src/core/types';

const marks = 'アイウエオカキクケコ';
const rows = [
  { pages: [44, 49], slots: 'abcdef', keys: 'エエイキエイ', sizes: [6, 4, 6, 9, 5, 6] },
  { pages: [50, 56], slots: 'abcdefg', keys: 'ウイカウエアウ', sizes: [4, 5, 6, 6, 5, 5, 5] },
  { pages: [57, 63], slots: 'abcdef2', keys: 'エアウカカアキ', sizes: [4, 6, 6, 6, 6, 6, 7] },
  { pages: [64, 67], slots: 'abc23de', keys: 'イカエウアオエ', sizes: [6, 6, 6, 6, 6, 6, 6] },
  { pages: [68, 76], slots: 'abcdefgh', keys: 'オキアカカアオウ', sizes: [8, 8, 8, 8, 8, 8, 10, 6] },
];
function bodies(number: number) {
  const definition = specs[number - 9].definition;
  return [0, 1, 2, 3].map(index => definition.build([index]));
}
function blocks<K extends Block['type']>(body: GeneratedBody, kind: K): Extract<Block, { type: K }>[] {
  return body.prompt.filter((block): block is Extract<Block, { type: K }> => block.type === kind);
}
function panel(body: GeneratedBody, suffix: string) {
  const block = blocks(body, 'diagram').find(item => item.scene.kind === 'source_figure' && item.scene.profile.endsWith('-' + suffix));
  assert(block?.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const fixture = figures.find(item => item.profile === profile);
  assert(fixture);
  return fixture.panel(values);
}
function listing(body: GeneratedBody, lang: string) {
  return blocks(body, 'code').filter(block => block.language === lang).map(block => block.text);
}
function prose(body: GeneratedBody) {
  return blocks(body, 'paragraph').map(block => block.text).join('\n');
}
const numbered = (source: string) => source.replace(/^ *\d+ /gm, '');
function part(body: GeneratedBody, name: string) {
  return body.answerParts!.find(item => item.id === 'part-' + name)!;
}
function key(body: GeneratedBody, name: string) {
  const answer = body.partAnswers!.find(item => item.kind === 'choice' && item.partId === 'part-' + name);
  assert(answer?.kind === 'choice');
  return part(body, name).choiceIds.indexOf(answer.choiceId);
}
function options(body: GeneratedBody, name: string) {
  return part(body, name).choiceIds.map(id => {
    const match = /choice-value-(\d+)/.exec(id);
    assert(match);
    const option = body.choices[Number(match[1]) - 1];
    assert(option.length === 1 && (option[0].type === 'paragraph' || option[0].type === 'code'));
    return option[0].text;
  });
}
const correct = (body: GeneratedBody, name: string) => options(body, name)[key(body, name)];
function compareAll(body: GeneratedBody, name: string, valid: (value: string, index: number) => boolean) {
  assert.deepEqual(options(body, name).flatMap((option, i) => valid(option, i) ? [i] : []), [key(body, name)], 'slot ' + name);
}
function temporary(run: (dir: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'opencbt-2012-pm-language-'));
  try { run(directory); } finally { rmSync(directory, { recursive: true, force: true }); }
}
function fill(source: string, selected: Record<string, string>) {
  return source.replace(/\[([a-z][12]?)\]/g, (literal, name) => selected[name] ?? literal);
}

test('2012秋午後の言語5問で公式冊子のページ・35欄・解答群の順序と生成入力を維持する', () => {
  const distinctAnswers = [1, 4, 2, 4, 4];
  for (const [index, spec] of specs.entries()) {
    const row = rows[index];
    assert.equal(spec.number, index + 9);
    assert.equal(spec.definition.source, '2012h24a-fe-pm-' + spec.number);
    assert.equal(spec.definition.sourceAnswer, row.keys);
    assert.deepEqual(spec.pages, Array.from({ length: row.pages[1] - row.pages[0] + 1 }, (_, i) => row.pages[0] + i));
    assert.equal([...row.slots].map(slot => marks[key(spec.original, slot)]).join(''), row.keys);
    const variants = bodies(spec.number);
    assert.equal(new Set(variants.map(body => JSON.stringify(body.prompt))).size, 4);
    const signatures = new Set(variants.map(body => JSON.stringify([...row.slots].map(slot => correct(body, slot)))));
    assert.equal(signatures.size, distinctAnswers[index], 'Q' + spec.number + 'の正答の組み合わせ');
    assert.equal(spec.definition.answerVariation, signatures.size === 1 ? 'fixed' : undefined);
    for (const body of variants) {
      assert.equal(body.answerParts!.map(answer => answer.id.slice(5)).join(''), row.slots);
      assert.deepEqual(body.answerParts!.map(answer => answer.choiceIds.length), row.sizes);
      for (const name of row.slots) assert.equal(new Set(options(body, name)).size, part(body, name).choiceIds.length);
    }
    for (const value of [[], [-1], [.5], [4], [1, 2]])
      assert.throws(() => spec.definition.build(value), { code: 'PARAMETER_CONSTRAINT' });
  }
  assert.deepEqual(specs[2].editorialContextTitles, ['Java APIの参照（独自編集）']);
  assert.equal(specs[2].original.contexts![0].title, specs[2].editorialContextTitles![0]);
  assert.deepEqual(specs[3].definition.fixedReferenceAssetIds!.map(id => id.slice(-4)), ['p079', 'p080', 'erpt', 'p082', 'p083', 'p084']);
  assert(specs[3].definition.fixedReferenceAssetIds!.includes('asset-ipa-2012h24a-fe-pm-p081-casl-excerpt'));
  assert.deepEqual(specs[4].original.contexts!.map(context => context.blocks.length), [6, 2]);
});

test('問9のC11を桁・NULL終端・末尾・前後賞の境界で実行し、全解答候補を検査する', () => {
  for (const body of bodies(9)) temporary(directory => {
    const source = numbered(listing(body, 'c').find(code => code.includes('#include <stdlib.h>'))!);
    const digits = Number(/#define LOT_DNUM (\d+)/.exec(source)![1]);
    const prizeTable = blocks(body, 'table')[0];
    const tiers = prizeTable.rows.map(row => row[1].replace(/^下\d+桁　/, '').split('，'));
    const first = panel(body, '9-program-changes-first'), second = panel(body, '9-program-changes-second');
    assert(first.kind === 'program-changes' && second.kind === 'program-changes');
    const p = source.split('\n');
    const lineIndex = (name: string) => p.findIndex(line => line.includes(name));
    p.splice(lineIndex('void check_winning_lot(char *[]'), 2, first.rows[0][1]);
    p.splice(lineIndex('void check_winning_lot(char *lots[]'), 3, first.rows[1][1]);
    p.splice(lineIndex('int i, j, k;') + 1, 0, first.rows[2][1]);
    p.splice(lineIndex('winner[i] = 0;') + 1, 0, first.rows[3][1]);
    p.splice(lineIndex('lots[j] != NULL; j++) {') + 1, 0, first.rows[4][1], second.rows[0][1]);
    p.splice(lineIndex('winner[i] += check_lot') + 1, 0, second.rows[1][1]);
    const chosen = Object.fromEntries('abcde'.split('').map(name => [name, correct(body, name)]));
    const f = (option: string) => Object.fromEntries(Array.from(option.matchAll(/(f[12])：('[019]')/g), ([, name, value]) => [name, value]));
    Object.assign(chosen, f(correct(body, 'f')));
    const limit = 10 ** digits;
    const width = (value: number) => String((value + limit) % limit).padStart(digits, '0');
    const tickets = [...new Set(['0'.repeat(digits), '9'.repeat(digits), width(1), width(100), width(101), width(99),
      ...tiers.flatMap(tier => tier.flatMap(value => [width(Number(value) - 1), width(Number(value)), width(Number(value) + 1)]))])];
    // Deliberately make the first prize asymmetric: symmetric exact/neighbor
    // samples can make a faulty no-carry branch look equivalent after aggregation.
    tickets.push(...Array<string>(3).fill(width(Number(tiers[0][0]) - 1)));
    // Add enough distinct prizes to force a counterexample to fixed loop bounds.
    tiers[1] = [...new Set([...tiers[1], ...Array.from({ length: digits + 2 }, (_, i) => width(100 + i))])];
    const expected = tiers.map(tier => [
      tickets.reduce((total, ticket) => total + tier.filter(win => ticket.endsWith(win)).length, 0),
      tickets.reduce((total, ticket) => total + tier.filter(win => win.length === digits &&
        (width(Number(ticket) - 1) === win || width(Number(ticket) + 1) === win)).length, 0),
    ]);
    const quoted = (items: readonly string[]) => items.map(item => JSON.stringify(item)).join(',');
    const harness = '#include <stdio.h>\nint main(void) {\n'
      + tiers.map((tier, i) => 'char *t' + i + '[] = {' + quoted(tier) + ',NULL};').join('\n')
      + '\nchar **tiers[] = {t0,t1,t2,t3,t4,t5};\n'
      + 'char *tickets[] = {' + quoted(tickets) + ',NULL};\n'
      + 'int wins[6], special[6];\ncheck_winning_lot(tickets,tiers,wins,special);\n'
      + 'for(int i=0;i<6;i++) printf("%d %d\\n",wins[i],special[i]);\nreturn 0;\n}\n';
    const file = join(directory, 'lot.c'), executable = join(directory, 'lot');
    const execute = (values: Record<string, string>) => {
      writeFileSync(file, fill(p.join('\n'), values) + '\n' + harness);
      const build = spawnSync('cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', '-fsanitize=address,undefined', ...(process.platform === 'linux' ? ['-fno-pie', '-no-pie'] : []), '-o', executable, file]);
      if (build.status !== 0) return undefined;
      const run = spawnSync(executable, [], { encoding: 'utf8', timeout: 3000 });
      if (run.status !== 0) return undefined;
      return run.stdout.trim().split('\n').map(line => line.split(' ').map(Number));
    };
    assert.deepEqual(execute(chosen), expected);
    for (const name of 'abcdef') compareAll(body, name, option => {
      const alternate = name === 'f' ? f(option) : { [name]: option };
      if (name === 'f' && Object.keys(alternate).length !== 2) return false;
      return JSON.stringify(execute({ ...chosen, ...alternate })) === JSON.stringify(expected);
    });
    assert.match(prose(body), new RegExp(digits + '桁'));
    assert(body.explanation.includes('0'.repeat(digits)) && body.explanation.includes('9'.repeat(digits)));
    assert(listing(body, 'c').includes('unsigned int strlen(const char *s);'));
    assert.match(body.explanation, /標準Cの <string.h> では size_t/);
    assert.match(body.explanation, /長さの比較結果は同じ/);
  });
});

test('問10の索引集計と整列集計を独立した月次請求と照合する', () => {
  for (const body of bodies(10)) {
    const tariff = blocks(body, 'table')[0];
    const amount = (value: string) => Number(value.replace(/[,円]/g, ''));
    const base = tariff.rows.map(row => amount(row[2])), extra = tariff.rows.map(row => amount(row[3]));
    const [initial, indexProgram] = listing(body, 'cobol');
    const sorted = panel(body, '10-program-changes-second');
    assert(sorted.kind === 'program-changes');
    const threshold = Number(/W-MIN > (\d+) THEN/.exec(indexProgram)![1]);
    assert.match(prose(body), new RegExp('1か月に' + threshold / 60 + '時間'));
    assert.match(initial, new RegExp('PIC X\\(16\\) VALUE "' + base.join('') + '"'));
    assert(sorted.rows[0][1].includes('TMP-MIN - ' + threshold + ' + 59'));
    const sample = [[4, 200], [2, 1], [4, threshold - 79], [5, 65], [2, threshold],
      [8, threshold], [9, threshold + 59], [9, 2], [11, threshold - 121]] as const;
    const members = [1, 2, 3, 4, 5, 8, 9, 11, 12];
    const byType = (id: number) => (id - 1) % 4;
    const due = (id: number, minutes: number) =>
      base[byType(id)] + Math.ceil(Math.max(0, minutes - threshold) / 60) * extra[byType(id)];
    const expected = members.map(id => due(id, sample.filter(([name]) => name === id).reduce((n, [, value]) => n + value, 0)));
    const independentGroups = new Map<number, number[]>();
    for (const [member, minutes] of [...sample].sort(([a], [b]) => a - b)) {
      const group = independentGroups.get(member) ?? [];
      group.push(minutes);
      independentGroups.set(member, group);
    }
    let final = 0;
    const merged: number[] = [];
    for (const [member, group] of independentGroups) {
      while (members[final] < member) merged.push(base[byType(members[final++])]);
      assert.equal(members[final++], member);
      const seconds = 60 * group.reduce((n, minutes) => n + minutes, 0);
      let paidHours = 0;
      for (let credited = threshold * 60; credited < seconds; credited += 3600) paidHours++;
      merged.push(base[byType(member)] + paidHours * extra[byType(member)]);
    }
    while (final < members.length) merged.push(base[byType(members[final++])]);
    assert.deepEqual(merged, expected);
    compareAll(body, 'a', option => option.slice(1, -1).match(/.{3}/g)!.map(Number).every((fee, i) => fee === extra[i]));
    compareAll(body, 'b', option => /^MKBILL-PROC\.$/m.test(numbered(indexProgram)) && option === 'MKBILL-PROC');
    compareAll(body, 'c', option => [0, 95, 410].every(stale => {
      const minutes = 172;
      const result = option === 'MOVE T-MIN TO W-MIN' ? minutes : option === 'ADD T-MIN TO W-MIN' ? stale + minutes :
        option.startsWith('COMPUTE W-MIN') ? Math.floor((minutes + 59) / 60 + 1) : stale;
      return result === minutes;
    }));
    compareAll(body, 'd', option => [1, 2, 3].every(hours => {
      const charge = option.startsWith('ADD EXT') ? base[0] + extra[0] :
        option.startsWith('COMPUTE B-CHG') ? base[0] + extra[0] * hours :
        option.startsWith('MOVE EXT') ? extra[0] : base[0];
      return charge === base[0] + extra[0] * hours;
    }));
    compareAll(body, 'e', option => option === 'RELEASE W-REC' && sorted.rows[0][1].includes('MOVE T-MIN TO W-MIN.\n    [e].'));
    compareAll(body, 'f', option => [0, 125, 750].every(initialValue => {
      const increment = 33;
      return (option.startsWith('ADD W-MIN') ? initialValue + increment : option.startsWith('MOVE ZERO') ? 0 : initialValue) === initialValue + increment;
    }));
    compareAll(body, 'g', option => [false, true].every(same => [threshold - 121, threshold, threshold + 1].every(minutes => {
      const over = minutes > threshold;
      const predicted = option.includes(' OR ') ? same || over :
        option.includes(' AND ') ? same && over : option.includes('M-NO') ? same : over;
      return predicted === (same && over);
    })));
    assert(body.explanation.includes(threshold + '分'));
  }
});

test('問11のJavaを実コンパイルし、スレッド名とキャンセル通知を生成順・待機境界から照合する', () => {
  for (const body of bodies(11)) temporary(directory => {
    const [action, timerFirst, timerLast, main, overload] = listing(body, 'java');
    const executions = panel(body, '11-original-output');
    const modified = panel(body, '11-modified-output');
    assert(executions.kind === 'output' && modified.kind === 'output');
    const pairs = [...main.matchAll(/(long|short)Timer = Timer.createTimer\("[^"]+", \[e\], (\d+)\);/g)];
    assert.equal(pairs.length, 2);
    const creation = new Map(pairs.map(([, name, delay], index) => [name, { index, delay: Number(delay) }]));
    const slow = creation.get('long')!, fast = creation.get('short')!;
    assert(slow.delay > fast.delay && fast.delay > 0);
    const alarm = 'Timer-' + fast.index, cancel = 'Timer-' + slow.index;
    compareAll(body, '2', option => option === 'g1：' + alarm + '　g2：' + cancel);
    for (const drawing of [executions, modified]) {
      const times = [...drawing.text.matchAll(/(\d\d):(\d\d):(\d\d) JST/g)]
        .map(match => Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]));
      assert.deepEqual(times, [times[0], times[0], times[0] + fast.delay, times[0] + fast.delay]);
    }
    compareAll(body, 'a', option => [1234567, 1234568, 1234569].every(now => {
      const end = 1234568;
      const difference = option.includes('endAt +') ? end + now : end - now;
      return (option.includes('>') ? difference > 0 : difference < 0) === (now < end);
    }));
    compareAll(body, 'b', option => {
      // A canceled sleep has just raised InterruptedException; the break must
      // reach the terminal notification without another sleep or a direct return.
      const after = option === 'break' ? ['onCancel', 'return'] :
        option === 'return' ? ['return'] : option.includes('false') ? ['sleep', 'onAlarm'] : ['sleep'];
      return after.join(',') === 'onCancel,return';
    });
    const selected = Object.fromEntries('abcdef'.split('').map(name => [name, correct(body, name)]));
    const actionPath = join(directory, 'TimerAction.java');
    const timerPath = join(directory, 'Timer.java');
    const testPath = join(directory, 'TimerTest.java');
    writeFileSync(actionPath, action);
    writeFileSync(timerPath, fill(timerFirst + '\n' + timerLast, selected));
    const source = (values: Record<string, string>) => fill(main
      .replace('    public void onStart(', overload + '\n    public void onStart(')
      .replace('log("onAlarm", timer, instant)', 'log("onAlarm", instant)')
      .replace('log("onCancel", timer, instant)', 'log("onCancel", instant)'), values);
    const compile = (values: Record<string, string>) => {
      writeFileSync(testPath, source(values));
      return spawnSync('javac', ['--release', '8', '-d', directory, actionPath, timerPath, testPath], { encoding: 'utf8', timeout: 5000 });
    };
    for (const name of 'cde') compareAll(body, name, option =>
      compile({ ...selected, [name]: option }).status === 0);
    assert.equal(compile(selected).status, 0);
    // A fixed UTC+09:00 zone gives Date.toString the same suffix with each JDK locale provider.
    const run = () => execFileSync('java', ['-Duser.timezone=GMT+09:00', '-Duser.language=en', '-cp', directory, 'TimerTest'],
      { encoding: 'utf8', timeout: 9000 }).trim().split('\n');
    const result = run();
    assert.equal(result.length, 4);
    assert.deepEqual(result.slice(0, 2).map(row => row.split(':')[0]).sort(), ['long timer', 'short timer']);
    assert(result[2].startsWith(alarm + ': onAlarm') && result[3].startsWith(cancel + ': onCancel'));
    for (const row of result) {
      assert.match(row, / at \w{3} \w{3} \d\d \d\d:\d\d:\d\d GMT\+09:00 \d{4}$/);
    }
    assert(body.explanation.includes(alarm) && body.explanation.includes(cancel));
    compareAll(body, 'f', option => {
      if (option.startsWith('onCancel')) return false; // Direct call runs on the caller and leaves the long worker alive.
      const target = option.split('.')[0];
      return target === 'longTimer'; // "timer" aliases shortTimer inside the condition.
    });
    // A direct callback can print a cancellation line but cannot stop the long worker.
    if (fast.delay === 1) {
      assert.equal(compile({ ...selected, f: 'onCancel(longTimer, instant)' }).status, 0);
      const wrong = run();
      assert(wrong.some(row => row.startsWith(alarm + ': onCancel')));
      assert(wrong.some(row => row.startsWith(cancel + ': onAlarm')));
    }
  });
});

type Instruction = { scope: string; opcode: string; operands: string[] };
type CaslRun = { value: number; directCalls: number; recursion: number; recursiveCalls: number };
function casl(source: string, entry: string, degree: number, x: number): CaslRun | undefined {
  const names = new Map<string, number>(), program: Instruction[] = [];
  const supported = new Set(['START', 'RPUSH', 'RPOP', 'LD', 'LAD', 'ADDL', 'CALL', 'RET', 'END', 'JZE', 'JNZ', 'JMI', 'JOV',
    'JPL', 'JUMP', 'AND', 'OR', 'SLL', 'SRL', 'SRA', 'POP', 'PUSH']);
  let scope = '';
  for (const line of numbered(source).split('\n')) {
    const code = line.split(';')[0].trim();
    if (!code) continue;
    const words = code.split(/\s+/);
    if (!supported.has(words[0])) {
      const name = words.shift()!;
      if (words[0] === 'START') {
        scope = name;
        names.set(name, program.length);
      } else {
        names.set(scope + ':' + name, program.length);
      }
    }
    const opcode = words.shift();
    if (!opcode || !supported.has(opcode)) return undefined;
    program.push({ scope, opcode, operands: words.join('').split(',').filter(Boolean) });
  }
  const saved = [degree, x, 31, 43, 57, 61, 78];
  const gr = [0, ...saved], stack = [-1];
  const reg = (token: string) => Number(token.slice(2));
  const value = (token: string) => token.startsWith('GR') ? gr[reg(token)] :
    token.startsWith('=#') ? Number.parseInt(token.slice(2), 16) : Number(token.replace(/^=/, ''));
  let pc = names.get(entry)!, flags = 0, overflow = false, directCalls = 0, recursion = 0, recursiveCalls = 0;
  const recursiveProgram = entry === 'POLY2';
  const set = (index: number, n: number) => { gr[index] = n & 65535; flags = gr[index]; };
  for (let step = 0; step < 3600; step++) {
    if (pc === -1) return stack.length === 0 && saved.every((n, i) => n === gr[i + 1])
      ? { value: gr[0], directCalls, recursion, recursiveCalls } : undefined;
    if (!program[pc]) return undefined;
    if (pc === names.get('POLY2:RSUB')) recursion++;
    const { scope, opcode, operands: [a, b, c] } = program[pc++];
    const location = (label: string) => names.get(scope + ':' + label) ?? names.get(label)!;
    const index = a?.startsWith('GR') ? reg(a) : -1;
    switch (opcode) {
      case 'START': break;
      case 'RPUSH': stack.push(...gr.slice(1)); break;
      case 'RPOP': for (let i = 7; i >= 1; i--) gr[i] = stack.pop()!; break;
      case 'LD': set(index, value(b)); overflow = false; break;
      case 'LAD': gr[index] = (value(b) + (c ? value(c) : 0)) & 65535; break;
      case 'ADDL': { const sum = gr[index] + value(b); overflow = sum > 65535; set(index, sum); break; }
      case 'AND': set(index, gr[index] & value(b)); overflow = false; break;
      case 'OR': set(index, gr[index] | value(b)); overflow = false; break;
      case 'SLL': { const result = gr[index] * 2 ** value(b); overflow = result > 65535; set(index, result); break; }
      case 'SRL': { overflow = Boolean(gr[index] & 1); set(index, gr[index] >>> value(b)); break; }
      case 'SRA': { const n = gr[index] << 16 >> 16; overflow = Boolean(n & 1); set(index, n >> value(b)); break; }
      case 'CALL':
        if (a === 'MULT') {
          if (recursiveProgram) recursiveCalls++; else directCalls++;
        }
        stack.push(pc);
        pc = location(a);
        break;
      case 'RET': pc = stack.pop()!; break;
      case 'PUSH': stack.push((value(a) + (b ? value(b) : 0)) & 65535); break;
      case 'POP': gr[index] = stack.pop()!; break;
      case 'JUMP': pc = location(a); break;
      case 'JZE': if (flags === 0) pc = location(a); break;
      case 'JNZ': if (flags !== 0) pc = location(a); break;
      case 'JMI': if (flags >= 32768) pc = location(a); break;
      case 'JPL': if (flags !== 0 && flags < 32768) pc = location(a); break;
      case 'JOV': if (overflow) pc = location(a); break;
      case 'END': return undefined;
    }
  }
  return undefined;
}

test('問12の三つのCASL命令列を多項式の閉じた和・呼出し数・全選択肢と照合する', () => {
  const referenceCases = [[1, 0], [1, 1], [1, 2], [1, 65534], [2, 0], [2, 2], [3, 3], [4, 2], [5, 1], [5, 7]];
  for (const body of bodies(12)) {
    const source = listing(body, 'casl2').join('\n');
    const degree = Number(/プログラム1の POLY を使用して F\(x，(\d+)\)/.exec(prose(body))![1]);
    const chosen = Object.fromEntries('abc3'.split('').map(name => [name, correct(body, name)]));
    const program = (options: Record<string, string>) => fill(source, options).replace('[　]', options['3']);
    const independent = (x: number, n: number) => [...Array(n + 1).keys()].reduce((sum, i) => sum + x ** i, 0);
    const matches = (entry: 'POLY' | 'POLY2', values: Record<string, string>) => referenceCases.every(([n, x]) =>
      casl(program(values), entry, n, x)?.value === independent(x, n));
    for (const name of 'abc3') compareAll(body, name, option =>
      matches(name === '3' ? 'POLY2' : 'POLY', { ...chosen, [name]: option }));
    assert(matches('POLY2', chosen));
    const direct = casl(program(chosen), 'POLY', degree, 2)!;
    const nested = casl(program(chosen), 'POLY2', degree, 2)!;
    assert.equal(direct.value, nested.value);
    compareAll(body, '2', option => Number(option) === direct.directCalls);
    compareAll(body, 'd', option => Number(option) === nested.recursion);
    compareAll(body, 'e', option => Number(option) === nested.recursiveCalls);
    assert(body.explanation.includes(direct.directCalls + '回') && body.explanation.includes(nested.recursion + '回'));
  }
});

type SchoolPoint = readonly [number, number];
type StudentCount = { x: number; y: number; id: number; current: number; count: number; permitted: boolean };
function toIntegerPoint(point: SchoolPoint) {
  return point.map(value => Math.round(value * 1000)) as [number, number];
}
function distance2(left: SchoolPoint, right: SchoolPoint) {
  const [x, y] = toIntegerPoint(left), [otherX, otherY] = toIntegerPoint(right);
  return (x - otherX) ** 2 + (y - otherY) ** 2;
}
function center({ x, y }: StudentCount): SchoolPoint { return [x + .5, y + .5]; }
function outcome(rows: readonly StudentCount[], old: SchoolPoint[], point: SchoolPoint) {
  const attendees = [0, 0, 0, 0];
  const assignment = rows.map(row => {
    const next = distance2(center(row), point) < distance2(center(row), old[row.current]) ? 3 : row.current;
    attendees[next] += row.count;
    return next;
  });
  return { assignment, attendees };
}
function compareDistanceFormula(body: GeneratedBody, actual: (column: number, row: number) => number) {
  const reference = (text: string, column: number, row: number, onPupilSheet: boolean) => {
    const match = /^(\$?)([A-G])(\$?)(\d+)$/.exec(text);
    assert(match);
    const [, lockColumn, letter, lockRow, baseRow] = match;
    const col = letter.charCodeAt(0) - 65 + (lockColumn ? 0 : column);
    const r = Number(baseRow) + (lockRow ? 0 : row);
    // Synthetic coordinates and irrelevant cells distinguish even coincident
    // references that happen to produce the same number in B12.
    if (onPupilSheet) return r * 3 + col * 5 + .5;
    return r * 11 + col * 2 + .125;
  };
  compareAll(body, 'c', option => {
    const refs = [...option.matchAll(/(?:児童数分布表!)?(\$?[A-G]\$?\d+)/g)]
      .map(match => match[1]);
    assert.equal(refs.length, 4);
    return [0, 1, 2, 3].every(col => [0, 1, 2, 12, 69].every(row => {
      const dx = reference(refs[0], col, row, true) - reference(refs[1], col, row, false);
      const dy = reference(refs[2], col, row, true) - reference(refs[3], col, row, false);
      const answer = option.startsWith('平方根(') ? Math.sqrt(dx * dx + dy * dy) : (Math.sqrt(dx) + Math.sqrt(dy)) ** 2;
      return Math.abs(answer - actual(col, row)) < 1e-10;
    }));
  });
}

test('問13の表計算全解答群と、70メッシュの制約付き探索を整数距離・分数順序で照合する', () => {
  const visibleOptions = [
    { feasible: 5, point: [9, 0], counts: [737, 749, 499, 968] },
    { feasible: 4, point: [9, 7], counts: [710, 635, 489, 1093] },
    { feasible: 3, point: [9, 7], counts: [715, 562, 526, 1254] },
  ];
  for (const [index, body] of bodies(13).entries()) {
    const distribution = panel(body, '13-pupil-distribution'), sheet = panel(body, '13-school-placement');
    const map = panel(body, '13-city-mesh');
    assert(distribution.kind === 'sheet' && sheet.kind === 'sheet' && map.kind === 'mesh');
    const base = Number(/メッシュのIDを x＋(\d+)y/.exec(prose(body))![1]);
    const grid = new Set(map.points.map(({ x, y }) => x + ',' + y));
    assert.equal(grid.size, 70);
    const data: StudentCount[] = [];
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) if (grid.has(x + ',' + y)) {
      assert(map.points.some(point => point.x === x && point.y === y && point.id === base * y + x));
      data.push({ x, y, id: base * y + x, current: (7 * x + 13 * y + index) % 3,
        count: (11 * x + 17 * y + 13 * index) % 52 + 17, permitted: (3 * x + 5 * y + index) % 5 !== 1 });
    }
    for (const slot of ['a', 'b']) compareAll(body, slot, (option) => data.every(({ x, y, id }) => {
      let val: number;
      if (option.startsWith('A2/')) val = id / base + .5;
      else if (option.startsWith('剰余(10,')) val = 10 % id / 10 + .5;
      else if (option.startsWith('剰余(' + base + ',')) val = base % id + .5;
      else if (option.startsWith('剰余(A2,10)')) val = id % 10 / 10 + .5;
      else if (option.startsWith('剰余(A2,' + base + ')')) val = id % base + .5;
      else if (option.startsWith('整数部((A2+0.5)')) val = Math.trunc((id + .5) / base);
      else if (option.endsWith(')+0.5')) val = Math.trunc(id / base) + .5;
      else val = Math.trunc(id / base + .5);
      return val === (slot === 'a' ? x + .5 : y + .5);
    }));
    compareDistanceFormula(body, (column, row) => Math.hypot(
      (row + 2) * 3 + 5 + .5 - (22 + (column + 1) * 2 + .125),
      (row + 2) * 3 + 10 + .5 - (33 + (column + 1) * 2 + .125),
    ));
    // Existing attendance is sometimes not the nearest. Exact distance ties
    // retain the current school. The lookup-position and moving HLOOKUP
    // alternatives cannot produce current distances across the row range.
    const choiceStates = [
      { distances: [2, 6, 9], current: 1, candidate: 5, copiedRow: 1 },
      { distances: [5, 9, 12], current: 0, candidate: 5, copiedRow: 0 },
      { distances: [2, 4, 8], current: 2, candidate: 3, copiedRow: 0 },
      { distances: [4, 10, 12], current: 1, candidate: 1, copiedRow: 2 },
    ];
    compareAll(body, 'd', option => choiceStates.every(state => {
      const { distances, current, candidate, copiedRow } = state;
      let value: number | undefined;
      if (option.includes('最小(')) value = Math.min(...distances);
      else if (option.includes('照合一致(')) value = current + 1;
      else if (option.includes('照合検索(')) value = distances[current];
      else value = copiedRow ? undefined : distances[current];
      if (value === undefined) return false;
      const transfer = option.endsWith(',F12,E$1)') ? value > candidate : value <= candidate;
      return transfer === (distances[current] > candidate);
    }));
    const referenceTable = [
      { current: 'A', next: 'E', id: 8, count: 17 }, { current: 'B', next: 'B', id: 101, count: 23 },
      { current: 'A', next: 'A', id: 102, count: 67 }, { current: 'C', next: 'E', id: 203, count: 30 },
    ];
    compareAll(body, 'e', option => ['A', 'B', 'C', 'E'].every(school => {
      const col = option.includes('$F12') ? 'current' : 'next';
      const equals = option.includes('＝B1');
      const field = option.includes('!$A2') ? 'id' : 'count';
      const total = referenceTable.filter(row => (row[col] === school) === equals).reduce((sum, row) => sum + row[field], 0);
      return total === referenceTable.filter(row => row.next === school).reduce((sum, row) => sum + row.count, 0);
    }));
    const bool = [false, true];
    compareAll(body, 'f', option => bool.every(permitted => bool.every(within => bool.every(distinct => {
      const tests = [option.includes('＝‘*’') ? permitted : !permitted, within, option.includes('否定(') ? !distinct : distinct];
      return (option.startsWith('論理積(') ? tests.every(Boolean) : tests.some(Boolean)) === (permitted && within && distinct);
    }))));
    compareAll(body, 'g', option => bool.every(valid => [-1, 0, 1].every(difference => {
      const better = option.includes('＞') ? difference > 0 : difference < 0;
      const constraints = option.includes('= null') ? valid : !valid;
      const outcome = option.startsWith('論理積') ? better && constraints : option.startsWith('論理和') ? better || constraints : better;
      return outcome === (valid && difference > 0);
    })));
    compareAll(body, 'h', option => [[.55, .7, .9, .62], [.95, .9, .7, .55], [.8, .53, .6, .78]].every(values => {
      const existing = values.slice(0, 3), fresh = values[3];
      const result = option.includes('最大(最小') ? Math.max(Math.min(...existing), fresh) :
        option.includes('最大(B7～D7)') ? Math.max(...existing) : option.includes('最大(B7～E7)') ? Math.max(...values) :
        option.includes('最小(B7～D7)') ? Math.min(...existing) : option.includes('最小(B7～E7)') ? Math.min(...values) : fresh;
      return result === Math.min(...values);
    }));
    assert.deepEqual(sheet.rows[0], ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G']);
    const position = (column: number): SchoolPoint => [Number(sheet.rows[2][column]), Number(sheet.rows[3][column])];
    const existing = [2, 3, 4].map(position), sample = position(5);
    const capacities = sheet.rows[6].slice(2, 6).map(Number);
    if (!index) {
      assert.deepEqual(distribution.rows[2], ['2', '8', '8.5', '0.5', '17', '*']);
      assert.deepEqual(sheet.rows[5].slice(2, 6), ['753', '986', '506', '1096']);
      assert.deepEqual(sheet.rows[7].slice(2, 6), ['0.628', '1.038', '0.843', '1.096']);
      assert.deepEqual(sheet.rows[12], ['12', '8', '7.583', '6.324', '5.611', '5.742', 'B小学校', '新設小学校']);
      assert.deepEqual(sheet.rows.at(-1), ['81', '909', '3.616', '8.236', '10.213', '5.701', 'A小学校', 'A小学校']);
      continue;
    }
    for (const row of distribution.rows.slice(2).filter(row => row[0] !== '⋮')) {
      const input = data[Number(row[0]) - 2];
      assert.deepEqual(row.slice(1), [String(input.id), (input.x + .5).toFixed(1), (input.y + .5).toFixed(1),
        String(input.count), input.permitted ? '*' : '']);
    }
    assert.deepEqual(sheet.rows[5].slice(2, 6).map(Number), outcome(data, existing, sample).attendees);
    const occupied = existing.map(([x, y]) => Math.floor(x) + ',' + Math.floor(y));
    const ratioOrder = ([count1, cap1]: number[], [count2, cap2]: number[]) => count1 * cap2 - count2 * cap1;
    const feasible = data.filter(row => row.permitted && !occupied.includes(row.x + ',' + row.y)).flatMap(row => {
      const attendees = outcome(data, existing, center(row)).attendees;
      const counts = attendees.map((count, i) => [count, capacities[i]]);
      if (counts.some(([count, cap]) => count > cap)) return [];
      return [{ point: [row.x, row.y], counts: attendees, minRatio: [...counts].sort(ratioOrder)[0] }];
    });
    assert(feasible.every(candidate => candidate.minRatio[0] > 0));
    const best = [...feasible].sort((a, b) => ratioOrder(b.minRatio, a.minRatio))[0];
    assert.deepEqual({ feasible: feasible.length, point: best.point, counts: best.counts }, visibleOptions[index - 1]);
    assert(body.explanation.includes(base + 'で割った余り'));
  }
});

test('問9〜13の登録14種を全条件で静的描画し、論理図・各レコード・G列を保持する', () => {
  assert.equal(figures.length, 14);
  assert.deepEqual(renderers.map(item => item.profile), figures.map(item => item.profile));
  for (const [i, item] of figures.entries()) for (let condition = 0; condition < 4; condition++) {
    const values = [condition];
    item.validate(values);
    assert(item.alt(values).length > 5);
    const html = renderToStaticMarkup(createElement(renderers[i].component, { values, caption: '参照図' }));
    assert(html.includes('class="diagram-scroll"') && html.includes('tabindex="0"'));
    assert(html.includes('aria-description=') && html.includes('参照図'));
    assert(!html.includes('NaN') && !html.includes('undefined'));
    if (item.profile.endsWith('winner-pointers')) {
      assert.equal((html.match(/data-lottery-tier=/g) ?? []).length, 3);
      assert.equal((html.match(/>NULL</g) ?? []).length, 3);
    }
    if (item.profile.endsWith('school-placement')) {
      assert(html.includes('>G</th>') && html.includes('>81</th>') && html.includes('>新通学小学校</td>'));
    }
  }
});
