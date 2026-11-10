import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { gradeAnswer, validateAnswerDefinition } from '../src/core/answers';
import type { Block, Question } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { spring2013Pm09To13Specs as specs } from '../scripts/legacy-2013-spring-pm-09-13-specs';
import { legacy2013SpringPm0913Figures as figures } from '../src/core/generators/legacy-2013-spring-pm-09-13-figures';
import { legacy2013SpringPm0913FigureRenderers as renderers } from '../src/ui/Legacy2013SpringPm0913Figures';
import { productionSheet } from '../src/core/generators/legacy-2013-spring-pm-13-sheet';
import { compileBreps } from './fixtures/legacy-2013-spring-pm-09-13-comet';

const marks = 'アイウエオカキク';
const cases = (number: number) => Array.from({ length: 4 }, (_, i) => specs[number - 9].definition.build([i]));
const blocks = <T extends Block['type']>(body: GeneratedBody, type: T) =>
  body.prompt.filter((block): block is Extract<Block, { type: T }> => block.type === type);
const listing = (body: GeneratedBody, language: string) =>
  blocks(body, 'code').filter(block => block.language === language).map(block => block.text);
const prose = (body: GeneratedBody) => blocks(body, 'paragraph').map(block => block.text).join('\n');
const numbered = (source: string) => source.replace(/^\s*\d+  /gm, '');
const choiceText = (body: GeneratedBody, id: string) => {
  const block = body.choices[Number(id.slice('choice-value-'.length)) - 1][0];
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
function part(body: GeneratedBody, id: string) {
  const value = body.answerParts!.find(part => part.id === 'part-' + id);
  assert(value, id);
  return value;
}
function choices(body: GeneratedBody, id: string) {
  return part(body, id).choiceIds.map(choice => choiceText(body, choice));
}
function correctId(body: GeneratedBody, id: string) {
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === 'part-' + id);
  assert(answer?.kind === 'choice');
  return answer.choiceId;
}
const correct = (body: GeneratedBody, id: string) => choiceText(body, correctId(body, id));
function compareAll(body: GeneratedBody, id: string, predicate: (choice: string) => boolean) {
  assert.deepEqual(choices(body, id).filter(predicate), [correct(body, id)], '解答欄 ' + id);
}
function temp<T>(run: (dir: string) => T) {
  const dir = mkdtempSync(join(tmpdir(), 'opencbt-2013-spring-pm-'));
  try { return run(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('2013春 午後問9〜13の公式33欄、原頁、共有群、順序と20条件を照合する', () => {
  const expected = [
    { pages: [44, 45, 46, 47], slots: 'abcdef', keys: 'イエエウアウ', sizes: [8, 8, 4, 3, 6, 6], shared: ['ab'] },
    { pages: [48, 49, 50, 51, 52], slots: 'abc2de', keys: 'イエアイイウ', sizes: [4, 5, 5, 4, 4, 4], shared: ['bc'] },
    { pages: [53, 54, 55, 56, 57], slots: '1abcdef', keys: 'ウイウイウアイ', sizes: [4, 4, 4, 4, 4, 4, 4], shared: [] },
    { pages: [58, 59, 60, 61], slots: 'abcd3ef', keys: 'エウイウアカイ', sizes: [6, 5, 8, 8, 6, 6, 6], shared: ['cd'] },
    { pages: [62, 63, 64, 65, 66, 67, 68, 69, 70], slots: 'abcdefg', keys: 'オエイオカエイ', sizes: [6, 6, 6, 8, 8, 8, 7], shared: ['df'] },
  ];
  for (const [index, spec] of specs.entries()) {
    const row = expected[index], bodies = cases(index + 9);
    assert.deepEqual(spec.pages, row.pages);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), row.pages);
    for (const alt of Object.values(spec.originalPageAlt)) assert(alt.length > 100);
    for (const body of bodies) {
      const question = {
        id: 'test-question',
        choices: body.choices.map((choice, index) => ({ id: 'choice-value-' + (index + 1), content: { blocks: choice } })),
        answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers },
      } as Question;
      validateAnswerDefinition(question);
      const supplied = Object.fromEntries(body.answerParts!.map(answerPart => [answerPart.id, correctId(body, answerPart.id.slice(5))]));
      assert.equal(gradeAnswer(question, { selectedPartChoices: supplied }).outcome, 'correct');
      for (const answerPart of body.answerParts!) {
        const wrong = answerPart.choiceIds.find(id => id !== supplied[answerPart.id]);
        assert(wrong);
        assert.equal(gradeAnswer(question, { selectedPartChoices: { ...supplied, [answerPart.id]: wrong } }).outcome, 'incorrect');
      }
      assert.equal(body.answerParts!.map(answerPart => answerPart.id.slice(5)).join(''), row.slots);
      assert.deepEqual(body.answerParts!.map(answerPart => answerPart.choiceIds.length), row.sizes);
      for (const shared of row.shared) for (const id of shared)
        assert.deepEqual(part(body, id).choiceIds, part(body, shared[0]).choiceIds);
    }
    assert.equal(spec.original.answerParts!.map(answerPart =>
      marks[answerPart.choiceIds.indexOf(correctId(spec.original, answerPart.id.slice(5)))]).join(''), row.keys);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    for (const invalid of [[], [-1], [4], [.2], [1, 2]])
      assert.throws(() => spec.definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
  assert.deepEqual(specs[2].original.contexts!.map(context => context.title), ['Java APIの参照（独自編集）']);
  assert.equal(specs[3].definition.fixedReferenceAssetIds!.length, 6);
  assert(specs[3].definition.fixedReferenceAssetIds!.some(id => id.endsWith('-p075-casl-excerpt')));
  assert.equal(specs[4].definition.fixedReferenceAssetIds!.length, 8);
  assert.deepEqual(specs[4].original.contexts!.map(context => context.blocks.length), [6, 2]);
  assert.deepEqual(specs[4].definition.fixedReferenceAssetIds!.slice(-2).map(id => id.slice(-4)), ['p003', 'p004']);
});

test('2013春 午後問9のC11を全契約・チャンネル境界で実行し、昇順の課金と全解答群を照合する', () => {
  for (const body of cases(9)) temp(dir => {
    const [first, second] = listing(body, 'c').map(numbered);
    const [basicTable, internetTable] = blocks(body, 'table');
    const money = (amount: string) => Number(amount.replace(/[円,]/g, ''));
    const basic = [0, ...basicTable.rows.map(row => money(row[1]))];
    const internet = internetTable.rows.map(row => [0, ...row.slice(1).map(money)]);
    const tariffs = [...first.matchAll(/\{(\d+, \d+, \d+, \d+)\}/g)].map(match => match[1].split(', ').map(Number));
    assert.equal(tariffs.length, 3);
    const television = (plan: number, count: number) => basic[plan] + (plan === 0 ? 0 :
      Array.from({ length: count }, (_, i) => tariffs[plan][i < 2 ? 0 : i < 5 ? 1 : i < 9 ? 2 : 3]).reduce((a, b) => a + b, 0));
    const [, planText, countText] = /calc_service_fee\(([12]), (\d+), 0\)を実行/.exec(prose(body))!;
    const plan = Number(planText), count = Number(countText);
    const partFee = (floor: number, ceiling: number) =>
      Array.from({ length: count }, (_, i) => i + 1).filter(channel => channel >= floor && channel <= ceiling).length;
    compareAll(body, 'a', option => Number(option) === partFee(6, 9));
    compareAll(body, 'b', option => Number(option) === partFee(3, 5));
    compareAll(body, 'c', option => Number(option) === television(plan, count));
    const [left, right] = [television(1, count), television(2, count)];
    compareAll(body, 'd', option => left === right ? option.includes('等しい') : option.startsWith('プラン' + (left > right ? 1 : 2)));
    const eParts = (option: string) => [...option.matchAll(/：([012])/g)].map(match => Number(match[1]));
    const costs = (optionE: string, optionF: string) => {
      const [none, slow] = eParts(optionE);
      const [, comparator, namedPlan] = /^(==|!=) ([012])$/.exec(optionF)!;
      return internet.every((row, plan) => row.every((fee, network) => {
        const selected = (comparator === '==') === (plan === Number(namedPlan));
        const branch = network === none ? 0 : network === slow ? (plan ? 1 : 2) : selected ? 3 : 4;
        const charges = [0, internet[1][1], internet[0][1], internet[2][2], internet[0][2]];
        return fee === charges[branch];
      }));
    };
    compareAll(body, 'e', option => costs(option, correct(body, 'f')));
    compareAll(body, 'f', option => costs(correct(body, 'e'), option));
    const [e1, e2] = eParts(correct(body, 'e'));
    const source = first + '\n' + second.replace('[e1]', String(e1)).replace('[e2]', String(e2)).replace('[f]', correct(body, 'f'));
    const file = join(dir, 'fee.c'), executable = join(dir, 'fee');
    writeFileSync(file, source + '\n#include <stdio.h>\nint main(void) {\n'
      + '  for (int p=0; p<=2; p++) for (int c=0; c<=15; c++) for (int n=0; n<=2; n++) {\n'
      + '    if (p==0 && c!=0) continue;\n    printf("%d %d %d %d\\n",p,c,n,calc_service_fee(p,c,n));\n  }\n  return 0;\n}\n');
    execFileSync('cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', '-o', executable, file]);
    const output = execFileSync(executable, [], { encoding: 'utf8' }).trim().split('\n');
    assert.equal(output.length, 99);
    for (const line of output) {
      const [p, c, n, total] = line.split(' ').map(Number);
      assert.equal(total, television(p, c) + internet[p][n]);
    }
  });
});

const bills = [100, 50, 10, 5, 1];
function minPieces(amount: number) {
  const results: number[] = [0];
  for (let value = 1; value <= amount; value++)
    results.push(1 + Math.min(...bills.filter(bill => bill <= value).map(bill => results[value - bill])));
  return results[amount];
}

function coinProgram(amount: number, accept: string, advance: string) {
  let bill = 0, remaining = amount;
  const count = [0, 0, 0, 0, 0];
  for (let steps = 0; remaining !== 0; steps++) {
    if (steps > 80 || bill >= bills.length || remaining < 0) return undefined;
    let statement = advance;
    if (remaining >= bills[bill]) {
      count[bill]++;
      statement = accept;
    }
    if (statement === 'ADD 1 TO CNT') bill++;
    else if (statement === 'ADD CNT TO P-CUR(CNT)') count[bill] += bill + 1;
    else if (statement === 'MOVE CUR-KIND(CNT) TO P-CUR(CNT)') count[bill] = (100 * bills[bill]) % 100;
    else if (statement === 'SUBTRACT CUR-KIND(CNT) FROM W-PAY') remaining -= bills[bill];
    else if (statement === 'SUBTRACT P-CUR(CNT) FROM W-PAY') remaining -= count[bill] / 100;
    else assert.fail(statement);
  }
  return count;
}

test('2013春 午後問10のCOBOL各分岐と全候補を、暦・最少貨幣数・ファイル出力順で独立に検算する', () => {
  for (const [index, body] of cases(10).entries()) {
    const source = listing(body, 'cobol').join('\n');
    const [[, yy, mo, dd]] = [...prose(body).matchAll(/記念日である(\d{4})年(\d{1,2})月(\d{1,2})日/g)];
    const [year, month, day] = [yy, mo, dd].map(Number);
    const maxAges = [...source.matchAll(/UPTO-\d+ +VALUE \d+ THRU (\d+)/g)].map(match => Number(match[1]));
    const baseGroups = choices(body, '2').map(group => group.split('\n').map(row => row.split(',').map(Number)));
    const route = (role: number, entered: number) => {
      const startYear = Math.floor(entered / 10000);
      const anniversary = new Date(Date.UTC(year, Math.floor(entered / 100) % 100 - 1, entered % 100));
      const age = year - startYear - Number(anniversary.getTime() > Date.UTC(year, month - 1, day));
      return 2 * maxAges.findIndex(max => age <= max) + role;
    };
    compareAll(body, '2', option => new Set(option.split('\n').map(line => {
      const [, role, entered] = line.split(',').map(Number);
      return route(role, entered);
    })).size === 6);
    const payrollRows = baseGroups.find(group => new Set(group.map(([, role, entered]) => route(role, entered))).size === 6)!;
    const cutoff = month * 100 + day;
    const expectedTest = [[cutoff - 1, 1, false], [cutoff, 20, false], [cutoff + 1, 1, true]] as const;
    compareAll(body, 'a', option => expectedTest.every(([entered, years, expected]) => {
      const [, variable, op, constant] = /^(E-MMDD|W-YEAR) (<|>|>=) (\d+)$/.exec(option)!;
      const value = variable === 'E-MMDD' ? entered : years;
      const limit = Number(constant);
      return (op === '<' ? value < limit : op === '>' ? value > limit : value >= limit) === expected;
    }));
    const validCoinProgram = (accept: string, advance: string) => [0, 1, 5, 6, 10, 11, 15, 41, 55, 95, 100, 108, 499].every(amount => {
      const result = coinProgram(amount, accept, advance);
      return result && result.reduce((sum, count, i) => sum + count * bills[i], 0) === amount &&
        result.reduce((sum, count) => sum + count, 0) === minPieces(amount);
    });
    compareAll(body, 'b', option => validCoinProgram(option, correct(body, 'c')));
    compareAll(body, 'c', option => validCoinProgram(correct(body, 'b'), option));
    const lineNumbers = /^(\s*\d+) {2}/gm;
    assert.deepEqual([...source.matchAll(lineNumbers)].map(match => Number(match[1])), Array.from({ length: 77 }, (_, i) => i + 1));
    const close = Number(/^(\s*\d+) +CLOSE EMP-F PAY-F/m.exec(source)![1]);
    const stop = Number(/^(\s*\d+) +STOP RUN/m.exec(source)![1]);
    compareAll(body, 'd', option => option === '行番号' + close + 'と' + stop + 'の間に追加');
    const rates = [...source.matchAll(/MOVE 0\.(\d+) TO PAY-RATE/g)].map(match => Number(match[1]));
    const payroll = payrollRows.map(([, role, entered, base]) => {
      const rule = route(role, entered), rate = [0, 1, 1, 2, 2, 3][rule];
      const amount = Number((BigInt(base) * BigInt(rates[rate])) / 10000n);
      const count = coinProgram(amount, correct(body, 'b'), correct(body, 'c'))!;
      assert.equal(count.reduce((sum, quantity, i) => sum + quantity * bills[i], 0), amount);
      assert.equal(count.reduce((sum, quantity) => sum + quantity, 0), minPieces(amount));
      return { count, amount };
    });
    const totals = bills.map((_, bill) => payroll.reduce((sum, item) => sum + item.count[bill], 0));
    compareAll(body, 'e', option => bills.every((bill, i) => {
      const contribution = option.split(' TO ')[0].slice(4);
      return payroll.reduce((sum, item) => sum + (contribution === '1' ? 1 : contribution === 'CUR-KIND(CNT)' ? bill * 100 :
        contribution === 'P-CUR(CNT)' ? item.count[i] : item.amount * 100), 0) === totals[i];
    }));
    const [display] = listing(body, 'text');
    const displayTotals = display.split('\n').map(row => Number(row.split(':')[1]));
    assert.deepEqual(displayTotals, index === 0 ? [1415, 267, 2189, 311, 2052] : totals);
  }
});

test('2013春 午後問11のJavaを全条件で実行し、横線の独立交換・例外優先順位と全候補を照合する', () => {
  for (const body of cases(11)) temp(dir => {
    const [start, end, tester] = listing(body, 'java');
    const filled = start + '\n' + end;
    const bars = [...tester.matchAll(/addHorizontalLine\((\d+), (\d+), (\d+\.\d+)\)/g)].map(match => match.slice(1).map(Number));
    const occupied = new Set<string>();
    const validBars = bars.filter(([left, right, height]) => {
      const endpoints = [left + ':' + height, right + ':' + height];
      if (left === right || endpoints.some(key => occupied.has(key))) return false;
      for (const key of endpoints) occupied.add(key);
      return true;
    });
    const permutation = [0, 1, 2, 3];
    for (const [left, right] of validBars.sort((a, b) => b[2] - a[2])) [permutation[left], permutation[right]] = [permutation[right], permutation[left]];
    const expected = [0, 1, 2, 3].map(start => start + ' -> ' + permutation.indexOf(start)).join('\n');
    assert.equal(listing(body, 'text')[0], expected);
    const [, bottomText] = /horizontalLines\.put\(([\d.]+), null\)/.exec(end)!;
    const [, topText] = /double y = ([\d.]+);/.exec(end)!;
    const [bottom, top] = [bottomText, topText].map(Number);
    const mid = (bottom + top) / 2;
    const guardTest = (value: string, y: number) => {
      const [, left, min, join, right, max] = /y (<=|>) ([\d.]+) (&&|\|\|) y (>=|<) ([\d.]+)/.exec(value)!;
      const first = left === '<=' ? y <= Number(min) : y > Number(min);
      const second = right === '>=' ? y >= Number(max) : y < Number(max);
      return join === '&&' ? first && second : first || second;
    };
    compareAll(body, 'f', option => [bottom - 1, bottom, mid, top, top + 1].every(y => guardTest(option, y) === (y <= bottom || y >= top)));
    compareAll(body, '1', option => option.includes('縦軸座標とその横線に接続するもう1本の縦線のマップ') &&
      end.includes('SortedMap<Double, VerticalLine>') && end.includes('horizontalLines.put(y, opposite)'));
    const file = join(dir, 'GhostLeg.java'), testerFile = join(dir, 'GhostLegTester.java'), probeFile = join(dir, 'GhostLegProbe.java');
    writeFileSync(testerFile, tester);
    const compiler = (...files: string[]) => spawnSync('javac', ['--release', '8', '-d', dir, ...files], { encoding: 'utf8' });
    const fill = (changedId?: string, candidate?: string, guard?: string) => {
      let text = filled;
      for (const id of 'abcd') text = text.replace('[' + id + ']', id === changedId ? candidate! : correct(body, id));
      if (guard) text = text.replace('// 設問3（' + guard + '）', 'if (' + correct(body, 'f') + ') throw new IllegalArgumentException();');
      return text;
    };
    for (const id of 'abcd') compareAll(body, id, candidate => {
      writeFileSync(file, fill(id, candidate));
      const compile = compiler(file, testerFile);
      assert(!compile.error, String(compile.error));
      if (compile.status !== 0) return false;
      const result = spawnSync('java', ['-cp', dir, 'GhostLegTester'], { encoding: 'utf8', timeout: 4000 });
      return result.status === 0 && result.stdout.trimEnd() === expected;
    });
    writeFileSync(probeFile, [
      'public class GhostLegProbe {',
      '  public static void main(String[] args) {',
      '    GhostLeg leg = new GhostLeg(4);',
      '    try { leg.addHorizontalLine(-1, 4, ' + bottomText + '); } catch (RuntimeException e) { System.out.println(e.getClass().getSimpleName()); }',
      '    try { leg.addHorizontalLine(1, 4, ' + topText + '); } catch (RuntimeException e) { System.out.println(e.getClass().getSimpleName()); }',
      '    try { leg.addHorizontalLine(0, 0, ' + topText + '); } catch (RuntimeException e) { System.out.println(e.getClass().getSimpleName()); }',
      '    try { leg.addHorizontalLine(-1, 1, ' + mid + '); } catch (RuntimeException e) { System.out.println(e.getClass().getSimpleName()); }',
      '    leg.addHorizontalLine(0, 1, ' + mid + ');',
      '    leg.addHorizontalLine(1, 2, ' + mid + ');',
      '    System.out.println(leg.trace(0) + " " + leg.trace(1) + " " + leg.trace(2));',
      '  }',
      '}',
    ].join('\n'));
    compareAll(body, 'e', candidate => {
      writeFileSync(file, fill(undefined, undefined, candidate));
      const compiled = compiler(file, probeFile);
      assert.equal(compiled.status, 0, compiled.stderr);
      const output = execFileSync('java', ['-cp', dir, 'GhostLegProbe'], { encoding: 'utf8', timeout: 4000 }).trimEnd();
      return output === ['IllegalArgumentException', 'IllegalArgumentException', 'IllegalArgumentException', 'IndexOutOfBoundsException', '1 0 2'].join('\n');
    });
  });
});

test('2013春 午後問12のCASL IIを全位置と幅で実行し、ビット列の切り貼りと全解答群を照合する', () => {
  for (const body of cases(12)) {
    const [first, alternative, extended] = listing(body, 'casl2');
    const complete = (id?: string, candidate?: string) => {
      const key = (name: string) => id === name ? candidate! : correct(body, name);
      let source = first.replace('[a]', key('a')).replaceAll('[b]', key('b'));
      if (id === '3') source = source.split('\n').map((row, i) =>
        i === 15 ? alternative.split('\n')[0].replace('[　]', key('3')) : i === 16 ? alternative.split('\n')[1] : row).join('\n');
      return compileBreps([source, extended.replace('[e]', key('e')).replace('[f]', key('f'))]);
    };
    const binary = (value: number) => value.toString(2).padStart(16, '0');
    const hex = (value: number) => '#' + value.toString(16).toUpperCase().padStart(4, '0');
    const registers = (p: number, q: number, beta: number) => [beta, 200, p, q, 0x32, 0x46, 0xab, 0xde];
    const independent = (words: number[], p: number, q: number, beta: number) => {
      const original = words.map(binary).join('');
      const changed = original.slice(0, p) + binary(beta).slice(0, q) + original.slice(p + q);
      return changed.match(/.{16}/g)!.map((part, i) => [200 + i, parseInt(part, 2)]);
    };
    const canRun = (run: ReturnType<typeof complete>, name: string, values: number[], words: number[]) => {
      try {
        const output = run(name, values, words);
        return JSON.stringify(output.memory) === JSON.stringify(independent(words, values[2], values[3], values[0])) &&
          JSON.stringify(output.registers) === JSON.stringify(values);
      } catch { return false; }
    };
    const run = complete();
    for (let p = 0; p < 16; p++) for (let q = 1; q <= 16; q++) {
      for (const sample of [0, 0x8000, 0x55aa, 0xffff]) {
        const beta = Math.floor(sample / 2 ** (16 - q)) * 2 ** (16 - q);
        assert(canRun(run, 'BREP', registers(p, q, beta), [0x96ca, 0x75be]), 'p=' + p + ', q=' + q + ', β=' + beta);
      }
    }
    for (let p = 0; p < 48; p++) for (let q = 1; q <= 16; q++) {
      const beta = Math.floor(0x5ad3 / 2 ** (16 - q)) * 2 ** (16 - q);
      assert(canRun(run, 'XBREP', registers(p, q, beta), [0x96ca, 0x75be, 0x12f4, 0x3271]));
    }
    const probes = [[0, 1, 0x0000], [0, 16, 0xf6aa], [5, 3, 0x2000], [12, 10, 0xd6c0], [15, 2, 0xc000]];
    for (const id of ['a', 'b', '3']) compareAll(body, id, option => {
      const candidate = complete(id, option);
      return probes.every(([p, q, beta]) => [0x0000, 0x5555, 0xffff].every(alpha =>
        canRun(candidate, 'BREP', registers(p, q, beta), [alpha, 0x9ca6])));
    });
    for (const id of ['e', 'f']) compareAll(body, id, option => {
      const candidate = complete(id, option);
      return [2, 8, 18, 25, 47].every(p => canRun(candidate, 'XBREP',
        registers(p, 5, 0xf800), [0x96ca, 0x75be, 0x12f4, 0x3271]));
    });
    const [trace] = listing(body, 'text');
    const [, pText, qText, betaText] = /p（GR2）：(\d+)\nq（GR3）：(\d+)\nβ（GR0）：#([\dA-F]+)/.exec(trace)!;
    const [p, q] = [pText, qText].map(Number), beta = parseInt(betaText, 16);
    const boundary = run('BREP', registers(p, q, beta), [0xaaaa, 0x0000]).states.get('BREP:14')!;
    assert.deepEqual([boundary[4], boundary[6]], [parseInt('0'.repeat(p) + binary(beta).slice(0, 16 - p), 2),
      parseInt(('0'.repeat(p) + '1'.repeat(q) + '0'.repeat(16)).slice(0, 16), 2)]);
    compareAll(body, 'c', option => option === hex(boundary[4]));
    compareAll(body, 'd', option => option === hex(boundary[6]));
  }
});

function orderSum(option: string, rows: (number | string)[][], day: number, product: string) {
  const [, condition, criterion, sum] = /条件付合計\(受注一覧!\$([C-F])\$2～\$[C-F]\$101, =(.+), 受注一覧!\$([C-F])\$2～\$[C-F]\$101\)/.exec(option)!;
  const position = (column: string) => column.charCodeAt(0) - 67;
  const target = criterion === 'B$3' ? product : criterion === '$A6' ? day :
    criterion === '結合($A6, B$3)' ? day + product : product + day;
  return rows.filter(row => row[position(condition)] === target).reduce((total, row) => {
    const value = row[position(sum)];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

function deliveredLot(option: string, needed: number) {
  const [comparison, truthy, falsy] = option.split(/, (?=[^)]*(?:\(|$))/);
  const branch = (comparison.includes('<') ? needed > 0 : needed <= 0) ? truthy : falsy;
  if (branch === '0') return 0;
  const multiplier = Number(/\* (\d+)$/.exec(branch)?.[1] ?? 10);
  const fraction = needed / multiplier;
  return (branch.startsWith('整数部') ? Math.trunc(fraction) : Math.sign(fraction) * Math.ceil(Math.abs(fraction))) * multiplier;
}

function stockBoolean(option: string, shortage: number, daily: number[], average: number) {
  const [, logic, shortageOp, stockOp, rate] = /^(論理積|論理和)\(E23 (>|=) 0, 条件付個数\(E6～E19, ([<>]) B21 \* ([\d.]+)\) = 0\)$/.exec(option)!;
  const countMatches = shortageOp === '=' ? shortage === 0 : shortage > 0;
  const limit = average * Number(rate);
  const stockMatches = daily.every(amount => stockOp === '<' ? amount >= limit : amount <= limit);
  return logic === '論理積' ? countMatches && stockMatches : countMatches || stockMatches;
}

function macroGuard(option: string, i: number, success: boolean, stopped: boolean, base: number, maximum: number) {
  if (option.startsWith('論理')) {
    const readsRightCell = option.includes('相対(A24, 0, i * 4)');
    const found = readsRightCell ? success : false;
    const requiredFlag = option.endsWith('= 1)');
    return option.startsWith('論理積') ? !found && stopped === requiredFlag : !found || stopped === requiredFlag;
  }
  const value = option.startsWith('相対(A22, 0, i * 4)') ? base : i === 2 ? base + 4 : 0;
  const max = option.endsWith('I1, i, 0)') ? maximum : 0;
  return option.includes(' < ') ? value < max : value > max;
}

test('2013春 午後問13の表計算全候補と図表を、累積需給の下限・絶対相対参照・論理表で照合する', () => {
  for (const [index, body] of cases(13).entries()) {
    const { setup, dates, orders, external, assemblyOrders, assembly, plans, minimalBases, demand, demandTotals } = productionSheet(index);
    const serial = (date: string) => Math.trunc(Date.parse(date + 'T00:00:00Z') / 86400000) + 1;
    const orderRows = orders.map(([, , , product, amount, due, work]) => {
      assert.equal(work, serial(due) + product);
      return [product, Number(amount), serial(due), work];
    });
    const otherRows: (number | string)[][] = [
      ['PA1', 11, 19, '19PA1'], ['PA2', 23, 19, '19PA2'], ['PA1', 41, 19, '19PA1'], ['PA1', 13, 20, '20PA1'],
    ];
    compareAll(body, 'a', option => orderSum(option, otherRows, 19, 'PA1') === 52 &&
      orderRows.every(([product, quantity, due]) => orderSum(option, orderRows, Number(due), String(product)) === quantity));
    const lot = Number(/AS1は，(\d+)個単位で生産する/.exec(prose(body))![1]);
    const baseLot = Number(/PA1，PA2，PA3は，(\d+)個単位で生産する/.exec(prose(body))![1]);
    const reserve = Number(/納品数平均の(\d+)％/.exec(prose(body))![1]);
    const aligned = (required: number, unit: number) => {
      let total = 0;
      while (total < required) total += unit;
      return total;
    };
    compareAll(body, 'b', option => Array.from({ length: lot * 2 + 6 }, (_, i) => i - 4).every(needed =>
      deliveredLot(option, needed) === aligned(needed, lot)));
    compareAll(body, 'c', option => [0, 2].every(shortage => [[0], [reserve], [reserve + 1], [reserve - 1, reserve + 1]].every(daily =>
      stockBoolean(option, shortage, daily, 100) === (shortage === 0 && Math.min(...daily) >= reserve))));
    compareAll(body, 'd', option => [true, false].every(success => [true, false].every(stopped =>
      [1, 2, 3].every(i => macroGuard(option, i, success, stopped, 140, 180) === (!success && !stopped)))));
    compareAll(body, 'e', option => {
      const [, target, source, increment] = /^(相対\(A22, 0, i \* 4\)) ← (相対\(A22, 0, i \* 4\)) \+ (\d+)$/.exec(option) ?? [];
      return target !== undefined && target === source && Number(increment) === baseLot;
    });
    compareAll(body, 'f', option => [1, 2, 3].every(i => [110, 120, 130].every(base =>
      macroGuard(option, i, false, false, base, 120) === (base > 120))));
    compareAll(body, 'g', option => {
      const productionHeaders = ['日付', 'PA1', '', '', '', 'PA2', '', '', '', 'PA3', '', '', ''];
      return ['PA1', 'PA2', 'PA3'].every((product, i) => {
        const first = productionHeaders.indexOf(product);
        let result: number | string | undefined;
        if (option.startsWith('照合一致')) {
          if (option.includes('!$A$3～$M$3')) result = first + 1;
          if (option.includes('!$B$3～$J$3')) result = first + 3;
          if (option.includes('!$A$1～$A$4')) result = (i + 2) * 4;
        } else if (option.includes('!$B$3～$J$3')) {
          result = option.startsWith('照合検索') ? productionHeaders[i + 1] : product;
        } else if (option.includes('!$A6～$M6')) result = plans[i].days[0].delivery;
        else if (option.includes('!$A$3～$M$19')) result = setup.carry[i];
        return result === 4 + 4 * i;
      });
    });

    const cumulative = (items: number[], end: number) => items.slice(0, end).reduce((a, b) => a + b, 0);
    const assemblyProduced = dates.map((_, day) => {
      const totalByNext = aligned(cumulative(assemblyOrders, day + 2) - setup.carry[3], lot);
      const totalByToday = aligned(cumulative(assemblyOrders, day + 1) - setup.carry[3], lot);
      const value = totalByNext - totalByToday;
      assert(value <= setup.cap[3]);
      assert.deepEqual(assembly[day], { output: value, delivery: assemblyOrders[day],
        stock: setup.carry[3] + totalByNext - cumulative(assemblyOrders, day + 1) });
      return value;
    });
    const minimumFromCumulative = setup.base.map((base, product) => {
      const shipments = dates.map((_, day) => external[product][day] + assemblyProduced[day] * setup.ratio[product]);
      const extra = dates.map((_, day) => (assemblyProduced[day + 1] ?? 0) * setup.ratio[product]);
      const periodTotal = cumulative(shipments, dates.length);
      const minimumInventory = Math.ceil(periodTotal * reserve / 1400);
      let requiredBase = 0;
      for (const [day, actual] of plans[product].days.entries()) {
        const paidThroughDay = cumulative(shipments, day + 1) - setup.carry[product];
        const supplyBefore = cumulative(extra, day);
        const supplyAfter = cumulative(extra, day + 1);
        const remainingBefore = supplyBefore - paidThroughDay;
        const remainingAfter = supplyAfter - paidThroughDay;
        const expected = { delivery: shipments[day], delivered: day * base + remainingBefore,
          output: base + extra[day], stock: (day + 1) * base + remainingAfter };
        assert.deepEqual(actual, expected);
        requiredBase = Math.max(requiredBase, day > 0 ? Math.ceil(-remainingBefore / day) : remainingBefore >= 0 ? 0 : Infinity,
          Math.ceil((minimumInventory - remainingAfter) / (day + 1)));
      }
      assert.equal(plans[product].total, periodTotal);
      assert.equal(plans[product].shortages, plans[product].days.filter(day => day.delivered < 0).length);
      assert.equal(plans[product].valid, plans[product].shortages === 0 && plans[product].days.every(day => day.stock >= minimumInventory));
      const minimum = aligned(requiredBase, baseLot);
      assert(minimum + Math.max(...extra) <= setup.cap[product]);
      return minimum;
    });
    assert.deepEqual(minimalBases, minimumFromCumulative);
    const weekParts = Array<number>(4).fill(0);
    for (const [i, row] of demand.entries()) {
      const day = Math.floor(i / 3), product = i % 3;
      const output = minimumFromCumulative[product] + assemblyProduced[day + 1] * setup.ratio[product];
      assert.equal(row.output, output);
      for (const [part, ratio] of setup.bom[product].entries()) {
        assert.equal(row.parts[part], output * ratio);
        weekParts[part] += output * ratio;
      }
    }
    assert.deepEqual(demandTotals, weekParts);
    if (index === 0) {
      assert.deepEqual(minimalBases, [340, 180, 230]);
      assert.deepEqual(weekParts, [4300, 13960, 3400, 5490]);
      assert.deepEqual(plans.map(plan => plan.total), [5030, 3400, 3615]);
      assert.deepEqual(plans.map(plan => plan.valid), [true, false, false]);
      assert.deepEqual(plans.map(plan => plan.shortages), [0, 0, 2]);
      assert.deepEqual(assemblyProduced, [0, 40, 0, 0, 60, 0, 40, 80, 0, 0, 0, 0, 80, 0]);
    }
  }
});

test('2013春 午後問9〜13の図表を静的に描画し、セル・図・alt・原紙の対応を確認する', () => {
  const ids = new Set<string>();
  for (const body of [10, 11, 12, 13].flatMap(cases)) for (const item of blocks(body, 'diagram')) {
    assert(item.scene?.kind === 'source_figure');
    const { profile, values } = item.scene;
    const definition = figures.find(figure => figure.profile === profile);
    const renderer = renderers.find(renderer => renderer.profile === profile);
    assert(definition && renderer);
    definition.validate(values);
    assert.equal(definition.alt(values), item.alt);
    ids.add(profile);
    const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: item.caption }));
    assert.match(html, /class="diagram-scroll" role="group" tabindex="0"/);
    assert(html.includes(item.caption));
    const panel = definition.panel(values);
    if (panel.kind === 'code-table') {
      assert.equal((html.match(/<pre/g) ?? []).length, 3);
      assert.match(html, /CUR-TBL-X REDEFINES CUR-VALUE/);
      assert.match(html, /\n   DISPLAY CUR-KIND-X/);
    } else if (panel.kind === 'sheet') {
      assert.match(html, /<table/);
      assert.equal((html.match(/<tr>/g) ?? []).length, panel.rows.length);
      const expectedColumns = panel.rows[0].length;
      const spans = Array<number>(expectedColumns).fill(0);
      for (const row of panel.rows) {
        let cursor = 0;
        for (const cell of row) {
          while (spans[cursor] > 0) cursor++;
          const columns = typeof cell === 'string' ? 1 : cell.cols;
          const rows = typeof cell === 'string' ? 1 : cell.rows ?? 1;
          assert(columns > 0 && cursor + columns <= expectedColumns);
          for (let c = cursor; c < cursor + columns; c++) {
            assert.equal(spans[c], 0);
            spans[c] = rows;
          }
          cursor += columns;
        }
        assert(spans.every(rows => rows > 0));
        for (let c = 0; c < spans.length; c++) spans[c]--;
      }
    } else {
      assert.match(html, /<svg.*role="img".*<title.*<desc/);
      if (panel.kind === 'ladder') {
        assert.equal((html.match(/<line/g) ?? []).length, panel.size + panel.rungs.length);
        assert.match(html, /<polyline/);
      } else assert.match(html, /ビット列 β/);
    }
  }
  assert.equal(ids.size, 7);
  assert.match(specs[0].originalPageAlt[45], /3,000円｜6,000円/);
  assert.match(specs[1].originalPageAlt[51], /000006,1,19970901,223000/);
  assert.match(specs[2].originalPageAlt[55], /horizontalLines.headMap\(y\).lastKey\(\)/);
  assert.match(specs[3].originalPageAlt[61], /0≦p＜16×（n−1），1≦q≦16/);
  assert.match(specs[4].originalPageAlt[64], /2013-04-11.*−?40|2013-04-11.*-40/);
  assert.match(specs[4].originalPageAlt[69], /4,300｜13,960｜3,400｜5,490/);
});
