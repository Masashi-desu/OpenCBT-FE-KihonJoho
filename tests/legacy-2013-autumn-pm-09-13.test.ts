import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { gradeAnswer, validateAnswerDefinition } from '../src/core/answers';
import type { Block, Question } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { autumn2013Pm09To13Specs as specs } from '../scripts/legacy-2013-autumn-pm-09-13-specs';
import { legacy2013AutumnPm0913Figures as figures } from '../src/core/generators/legacy-2013-autumn-pm-09-13-figures';
import { legacy2013AutumnPm0913FigureRenderers as renderers } from '../src/ui/Legacy2013AutumnPm0913Figures';
import { groupingSheet } from '../src/core/generators/legacy-2013-autumn-pm-13-sheet';
import { compileComet } from './fixtures/legacy-2013-autumn-pm-09-13-comet';

const marks = 'アイウエオカキクケコ';
const cases = (number: number) => Array.from({ length: 4 }, (_, index) => specs[number - 9].definition.build([index]));
const codeBlocks = (body: GeneratedBody, language: string) => body.prompt
  .filter((block): block is Extract<Block, { type: 'code' }> => block.type === 'code' && block.language === language)
  .map(block => block.text);
const prose = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const textBlock = (block: Block) => {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
function part(body: GeneratedBody, id: string) {
  const result = body.answerParts!.find(part => part.id === 'part-' + id);
  assert(result, id);
  return result;
}
function options(body: GeneratedBody, id: string) {
  return part(body, id).choiceIds.map(choice => textBlock(body.choices[Number(choice.split('-').at(-1)) - 1][0]));
}
function actual(body: GeneratedBody, id: string): string {
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === 'part-' + id);
  assert(answer?.kind === 'choice');
  return textBlock(body.choices[Number(answer.choiceId.split('-').at(-1)) - 1][0]);
}
function compareAll(body: GeneratedBody, id: string, predicate: (choice: string) => boolean) {
  const matches = options(body, id).filter(predicate);
  assert.deepEqual(matches, [actual(body, id)], '解答欄 ' + id);
}
function temp<T>(run: (dir: string) => T) {
  const dir = mkdtempSync(join(tmpdir(), 'opencbt-2013-pm-'));
  try { return run(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}
function issue(body: GeneratedBody): Question {
  const question = { id: 'test-q', choices: body.choices.map((blocks, index) => ({ id: 'choice-value-' + (index + 1), content: { blocks } })),
    answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers } } as Question;
  validateAnswerDefinition(question);
  return question;
}

test('2013秋 午後問9〜13の公式35欄、原頁、共有群、順序と20条件を照合する', () => {
  const expected = [
    { pages: [45, 46, 47, 48, 49], slots: 'abcdefg', keys: 'クアイエアエイ', sizes: [8, 8, 3, 6, 4, 4, 4], shared: ['ab'] },
    { pages: [50, 51, 52, 53, 54], slots: 'abcdefg', keys: 'アクイエアオカ', sizes: [8, 8, 8, 5, 7, 7, 7], shared: ['abc', 'efg'] },
    { pages: [55, 56, 57, 58, 59], slots: 'abcde2f', keys: 'イエエウイウエ', sizes: [4, 4, 4, 6, 6, 5, 4], shared: ['de'] },
    { pages: [60, 61, 62, 63, 64], slots: 'abcdefg', keys: 'イカアイウアキ', sizes: [4, 6, 6, 7, 7, 7, 7], shared: ['bc', 'de', 'fg'] },
    { pages: [65, 66, 67, 68, 69, 70], slots: 'abcdefg', keys: 'クイアイカキイ', sizes: [8, 4, 7, 6, 8, 8, 8], shared: ['eg'] },
  ];
  for (const [index, spec] of specs.entries()) {
    const row = expected[index], bodies = cases(index + 9);
    assert.deepEqual(spec.pages, row.pages);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), row.pages);
    for (const alt of Object.values(spec.originalPageAlt)) assert(alt.length > 100);
    for (const body of bodies) {
      issue(body);
      assert.equal(body.answerParts!.map(part => part.id.slice(5)).join(''), row.slots);
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), row.sizes);
      for (const shared of row.shared) assert([...shared].every(id =>
        JSON.stringify(part(body, id).choiceIds) === JSON.stringify(part(body, shared[0]).choiceIds)));
    }
    const original = spec.original;
    const keys = original.answerParts!.map(answerPart => {
      const answer = original.partAnswers!.find(answer => answer.kind === 'unordered'
        ? answer.partIds.includes(answerPart.id) : answer.partId === answerPart.id);
      assert(answer && answer.kind !== 'no_correct_answer');
      const choice = answer.kind === 'choice' ? answer.choiceId : answer.choiceIds[answer.partIds.indexOf(answerPart.id)];
      return marks[answerPart.choiceIds.indexOf(choice)];
    }).join('');
    assert.equal(keys, row.keys);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    for (const invalid of [[], [-1], [4], [.2], [1, 2]]) assert.throws(() => spec.definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
});

test('2013秋 午後問9のCを各条件で実行し、実際の全比較候補と不正入力の境界を照合する', () => {
  for (const body of cases(9)) temp(dir => {
    const [source] = codeBlocks(body, 'c');
    const size = Number(/wpos < (\d+)/.exec(source)?.[1]);
    const text = prose(body);
    const [, left, right] = /word1の内容を“([^”]+)”，word2の内容を“([^”]+)”/.exec(text)!;
    const words = [.../4個の単語(“[^。]+)を相互/.exec(text)![1].matchAll(/“([^”]+)”/g)].map(match => match[1]);
    assert.equal(words.length, 4);
    const endLetter = 'a'.repeat(size - 1) + 'b';
    const earlierMark = 'a'.repeat(size - 1) + '-';
    const pairs = [[left, right], ...words.flatMap(a => words.map(b => [a, b])),
      ['', '-Ab'], [endLetter + '.XYZ', earlierMark + '.XYZ'], ['-Ab', 'Ab']];
    const literals = pairs.map(pair => '    {' + pair.map(value => JSON.stringify(value)).join(', ') + '}').join(',\n');
    const harness = source + '\n' + `#include <stdio.h>
int main(void) {
  char *words[][2] = {
` + literals + `
  };
  for (size_t i = 0; i < sizeof(words) / sizeof(words[0]); i++) {
    char a[64], b[64], ax[64], bx[64];
    diccnv(words[i][0], a, ax);
    diccnv(words[i][1], b, bx);
    int rc = diccmp(words[i][0], words[i][1]);
    printf("%s|%s|%s|%s|%d\\n", a, ax, b, bx, (rc > 0) - (rc < 0));
  }
  return 0;
}`;
    const file = join(dir, 'diccmp.c'), executable = join(dir, 'diccmp');
    writeFileSync(file, harness);
    execFileSync('cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', '-o', executable, file]);
    const result = execFileSync(executable, [], { encoding: 'utf8' }).trimEnd().split('\n').map(line => line.split('|'));
    assert.equal(result.length, pairs.length);
    const [, a, , b, sign] = result[0];
    compareAll(body, 'a', option => option === a);
    compareAll(body, 'b', option => option === b);
    compareAll(body, 'c', option => option === ({ '-1': '負の値', '0': '0', '1': '正の値' }[sign]));
    compareAll(body, 'd', option => {
      const order = [...option.matchAll(/“([^”]+)”/g)].map(match => words.indexOf(match[1]));
      return new Set(order).size === 4 && order.slice(1).every((current, i) => result[1 + order[i] * 4 + current][4] === '-1');
    });
    assert.deepEqual(result.at(-3), ['', '', 'ab', '40', '-1']);
    assert.deepEqual(result.at(-2)?.slice(0, 4), [endLetter, '0'.repeat(size - 1) + '2', 'a'.repeat(size - 1), '0'.repeat(size - 2) + '1']);
    assert.deepEqual(result.at(-1), ['ab', '40', 'ab', '40', '0']);
    compareAll(body, 'e', option => option.includes('空文字列として扱い') && result.at(-3)![0] === '');
    compareAll(body, 'f', option => option.includes(size + '文字目が英字で' + (size + 1) + '文字目'));
    compareAll(body, 'g', option => option === 'その文字を無視する' && result.at(-1)![4] === '0');
    assert(!source.includes('\0'), 'C終端リテラルは実NULではない');
  });
});

function reservationCandidate(opening: number, source: string[], requested: number, time: number, rooms: number[][]) {
  let first = 0, cursor = 1, slot = 0, check = false, keep = 0, reservation = 72, backup = [] as number[];
  const result = [] as number[], draft = rooms.map(room => room.slice());
  const execute = (instruction: string) => {
    const subtract = /^COMPUTE TIME-START = PRM-TIME - (\d+)$/.exec(instruction);
    if (subtract) { first = time - Number(subtract[1]); return; }
    switch (instruction) {
      case 'MOVE BKUP-AREA TO RSV-COURT(COURT-CNT)': draft[cursor - 1] = backup.slice(); break;
      case 'MOVE COURT-CNT TO KEEP-COURT': keep = cursor; break;
      case 'MOVE PRM-TIME TO TIME-CNT': slot = time; break;
      case 'MOVE RSV-RNO(COURT-CNT TIME-CNT) TO PRM-RNO': reservation = draft[cursor - 1]?.[slot - 1]; break;
      case 'MOVE TIME-CNT TO COURT-CNT': cursor = slot; break;
      case 'SET CHK-NG TO TRUE': check = false; break;
      case 'SET CHK-OK TO TRUE': check = true; break;
      default: throw Error('未対応COBOL命令');
    }
  };
  execute(source[0]);
  let steps = 0;
  for (; cursor <= 4 && requested !== keep; cursor++) {
    if (++steps > 12 || cursor < 1) return undefined;
    execute(source[1]);
    if (!draft[cursor - 1]?.length) return undefined;
    backup = draft[cursor - 1].slice();
    for (slot = first; check && slot < first + 2; slot++) {
      if (slot < 1 || slot > 9) return undefined;
      if (draft[cursor - 1][slot - 1] === 0) draft[cursor - 1][slot - 1] = reservation;
      else { check = false; execute(source[2]); }
    }
    if (check) result[keep++] = cursor;
  }
  const reject: Record<string, boolean> = {
    'CHK-NG': !check, 'CHK-OK': check, 'KEEP-COURT NOT = ZERO': keep !== 0,
    'PRM-NUM NOT = KEEP-COURT': requested !== keep, 'PRM-NUM = KEEP-COURT': requested === keep,
  };
  if (reject[source[3]]) return { result: [] as number[], rooms };
  return { result, rooms: draft };
}

test('2013秋 午後問10のCOBOL全候補を4面の空き・衝突・部分復元の参照解と照合する', () => {
  for (const body of cases(10)) {
    const [file, program] = codeBlocks(body, 'cobol');
    assert.match(file, /RSV-RNO\s+PIC 9\(6\) OCCURS 9/);
    assert.match(program, /55\s+UNTIL COURT-CNT > 4 OR PRM-NUM = KEEP-COURT/);
    assert.match(program, /57\s+MOVE RSV-COURT\(COURT-CNT\) TO BKUP-AREA/);
    assert.match(program, /59\s+UNTIL CHK-NG OR TIME-CNT >= TIME-END/);
    assert.match(program, /44\s+IF RSV-OK THEN\n45\s+REWRITE RSV-REC/);
    const [, rawOpening, rawClosing] = /時間帯は(\d+)時から(\d+)時まで/.exec(prose(body))!;
    const opening = Number(rawOpening);
    assert.equal(Number(rawClosing) - opening, 9);
    const expectedCommands = ['COMPUTE TIME-START = PRM-TIME - ' + (opening - 1),
      'SET CHK-OK TO TRUE', 'MOVE BKUP-AREA TO RSV-COURT(COURT-CNT)', 'PRM-NUM NOT = KEEP-COURT'];
    const idOrder = 'abcd';
    for (const [at, id] of [...idOrder].entries()) compareAll(body, id, choice => {
      const commands = expectedCommands.slice();
      commands[at] = choice;
      for (const first of [0, 4, 7]) for (let mask = 0; mask < 256; mask++) {
        const rooms = Array.from({ length: 4 }, (_, room) => Array.from({ length: 9 }, (_, slot) =>
          slot === first || slot === first + 1 ? (mask >> (room * 2 + slot - first) & 1) * 51 : 0));
        for (const requested of [1, 2, 3, 4]) {
          const free = rooms.flatMap((slots, room) => slots.slice(first, first + 2).every(value => value === 0) ? [room + 1] : []);
          const selected = free.length >= requested ? free.slice(0, requested) : [];
          const expectedRooms = rooms.map((slots, room) => slots.map((value, slot) =>
            selected.includes(room + 1) && slot >= first && slot < first + 2 ? 72 : value));
          const result = reservationCandidate(opening, commands, requested, opening + first, rooms);
          if (JSON.stringify(result) !== JSON.stringify({ result: selected, rooms: expectedRooms })) return false;
        }
      }
      return true;
    });
  }
});

test('2013秋 午後問10の順不同3欄は全組合せの意味と全6順列・誤答・重複の採点が一致する', () => {
  for (const body of cases(10)) {
    const fence = body.prompt.find(block => block.type === 'diagram' &&
      block.scene.kind === 'source_figure' && block.scene.profile.endsWith('-fence-layout'));
    assert(fence?.type === 'diagram');
    const [, leftA, leftB, rightA, rightB] = /左の上から(\d)、(\d)番コート。フェンスの右の上から(\d)、(\d)番コート。/.exec(fence.alt)!;
    const left = [Number(leftA), Number(leftB)], right = [Number(rightA), Number(rightB)];
    const group = body.partAnswers!.find(answer => answer.kind === 'unordered');
    assert(group?.kind === 'unordered');
    assert.deepEqual(group.partIds, ['part-e', 'part-f', 'part-g']);
    const fields = part(body, 'e').choiceIds, candidates = options(body, 'e');
    const trueIn = (text: string, selected: number[], next: boolean) => {
      const courtNo = [...text.matchAll(/COURT-NO\(([12])\) = (\d) OR (\d)/g)].map(
        ([, slot, one, two]) => [Number(one), Number(two)].includes(selected[Number(slot) - 1]));
      if (courtNo.length === 1) return courtNo[0];
      if (courtNo.length === 2) return courtNo[0] && courtNo[1];
      if (courtNo.length === 4) return courtNo[0] && courtNo[1] || courtNo[2] && courtNo[3];
      if (text === 'PRM-NUM = 2') return selected.length === 2;
      if (text === 'NEXT-OFF') return !next;
      if (text === 'NEXT-ON') return next;
      if (text === 'RSV-OK') return true;
      assert.equal(text, '(COURT-CNT = 3 OR 4)');
      return [3, 4].includes(selected.at(-1)! + 1);
    };
    const compatible: string[][] = [];
    for (let a = 0; a < 7; a++) for (let b = a + 1; b < 7; b++) for (let c = b + 1; c < 7; c++) {
      const trio = [a, b, c], valid = [false, true].every(next => Array.from({ length: 15 }, (_, i) => i + 1).every(mask => {
        const selected = [1, 2, 3, 4].filter((_, bit) => mask & (1 << bit));
        const expected = next && selected.length === 2 && selected.some(n => left.includes(n)) && selected.some(n => right.includes(n));
        return trio.every(i => trueIn(candidates[i], selected, next)) === expected;
      }));
      if (valid) compatible.push(trio.map(i => fields[i]));
    }
    assert.deepEqual(compatible, [group.choiceIds]);
    const question = issue(body);
    const standard = Object.fromEntries(body.partAnswers!.flatMap(answer => answer.kind === 'choice' ? [[answer.partId, answer.choiceId]] : []));
    const [a, b, c] = compatible[0];
    const resultOf = (trio: string[]) => gradeAnswer(question, {
      selectedPartChoices: { ...standard, ...Object.fromEntries(trio.map((id, i) => [group.partIds[i], id])) },
    });
    for (const order of [[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]])
      assert.equal(resultOf(order).outcome, 'correct');
    assert.equal(resultOf([a, a, c]).outcome, 'incorrect');
    assert.equal(resultOf([a, b, fields[1]]).outcome, 'incorrect');
    assert.equal(resultOf([a, b]).outcome, 'unanswered');
  }
});

function pathsOracle(source: string) {
  const calls = [...source.matchAll(/(?:root|usr)\.add\("([^"]*)"\)/g)].map(match => match[0]);
  type Node = { parent: Node | null; name: string; children: Map<string, Node> };
  const root: Node = { parent: null, name: '', children: new Map() };
  let count = 1, usr: Node | undefined, rejected = false;
  for (const call of calls) {
    const [, start, path] = /^(\w+)\.add\("([^"]*)"\)$/.exec(call)!;
    if (path === '' || path[0] === '/') { rejected = true; break; }
    let cursor = start === 'root' ? root : usr!;
    for (const name of path.split('/').filter(Boolean)) {
      const existing = cursor.children.get(name);
      if (existing) { cursor = existing; continue; }
      const child: Node = { parent: cursor, name, children: new Map() };
      cursor.children.set(name, child);
      cursor = child;
      count++;
    }
    if (!usr) usr = cursor;
  }
  assert(rejected);
  const names = [...root.children.keys()], matches: Node[] = [];
  for (const node of root.children.values()) {
    const queue = [node];
    while (queue.length) {
      const current = queue.shift()!;
      if (current.name === 'local') matches.push(current);
      queue.push(...current.children.values());
    }
  }
  const pathOf = (node: Node) => {
    const components = [node.name];
    for (let parent = node.parent; parent?.parent; parent = parent.parent) components.unshift(parent.name);
    return '/' + components.join('/');
  };
  return { count, original: [...names, ...matches.map(node => pathOf(node) + '/'), 'IllegalArgument'],
    modified: [...names, ...matches.map(node => pathOf(node) + (node.children.size > 0 ? '/' : '')), 'IllegalArgument'] };
}

test('2013秋 午後問11のJavaの全候補を検査し、全条件で図2・3の出力を実行して照合する', () => {
  for (const body of cases(11)) temp(dir => {
    const [start, middle, end, tester, modified] = codeBlocks(body, 'java');
    const independent = pathsOracle(tester);
    compareAll(body, 'a', option => /^"", null$/.test(option));
    const boolean = (operator: string, left: boolean, right: boolean) => operator === '&&' ? left && right : left || right;
    compareAll(body, 'b', option => {
      const [, startsNegated, operator, emptyNegated] = /^(!?)path\.startsWith\("\/"\) (&&|\|\|) (!?)""\.equals\(path\)$/.exec(option)!;
      return ['', '/x', 'p', 'x//y/'].every(path =>
        boolean(operator, path.startsWith('/') !== Boolean(startsNegated), (path === '') !== Boolean(emptyNegated)) === (path === '' || path.startsWith('/')));
    });
    compareAll(body, 'c', option => {
      const [, operator, rhs] = /^parent (==|!=) (null|"")$/.exec(option)!;
      return rhs === 'null' && [true, false].every(isRoot => (operator === '==' ? isRoot : !isRoot) === isRoot);
    });
    const types: Record<string, string> = { child: 'later', name: 'String', node: 'match', null: 'null', parent: 'other', root: 'undefined' };
    compareAll(body, 'd', option => types[option] === 'match');
    compareAll(body, 'e', option => types[option] === 'String');
    compareAll(body, '2', option => Number(option) === independent.count);
    compareAll(body, 'f', option => [false, true].every(empty => {
      const result = option === 'children.isEmpty()' ? empty : option === '!children.isEmpty()' ? !empty : option === 'children != null';
      return result === empty;
    }));
    const classCode = [start, middle, end].join('\n').replace(/［([a-e])］/g, (_, id: string) => actual(body, id));
    const patch = modified.replace('［f］', actual(body, 'f'));
    writeFileSync(join(dir, 'DirectoryNodeTester.java'), tester);
    for (const [i, expected] of [independent.original, independent.modified].entries()) {
      const code = i === 0 ? classCode : classCode.replace('        return parent.path() + name + "/";', patch + '\n        return parent.path() + name + "/";');
      writeFileSync(join(dir, 'DirectoryNode.java'), code);
      execFileSync('javac', ['--release', '8', '-Xlint:-options', 'DirectoryNode.java', 'DirectoryNodeTester.java'], { cwd: dir });
      const result = execFileSync('java', ['-cp', dir, 'DirectoryNodeTester'], { cwd: dir, encoding: 'utf8' }).trimEnd().split('\n');
      assert.deepEqual(result, expected);
      const profile = body.prompt.find(block => block.type === 'diagram' &&
        block.scene.kind === 'source_figure' && block.scene.profile.endsWith(i === 0 ? '-execution-output' : '-leaf-output'));
      assert(profile?.type === 'diagram');
      assert.equal(profile.alt, result.join('\n'));
    }
    assert.match(body.explanation, new RegExp(independent.count + '個'));
  });
});

const clockText = (seconds: number) => String(Math.floor(seconds / 60)).padStart(2, '0') + String(seconds % 60).padStart(2, '0');
function clockMemory(text: string, address: number): [number, number][] {
  return [...text].map((char, i) => [address + i, char.charCodeAt(0)]);
}

test('2013秋 午後問12の実命令から全選択肢を判別し、全6000秒を往復する', () => {
  const known: Record<string, string> = {
    a: 'JNZ  CONT', b: 'GR5', c: 'GR0', f: 'ADDA GR4,GR0', g: 'SRL  GR4,2',
  };
  for (const [index, body] of cases(12).entries()) {
    const listings = codeBlocks(body, 'casl2');
    assert.equal(listings.length, 3);
    const seconds = Number(/秒が10進数で(\d+)である/.exec(prose(body))?.[1]);
    const machineFor = (replace: Record<string, string>) => compileComet(listings.map(program =>
      program.replace(/［([a-z])］/g, (_, id: string) => replace[id] ?? known[id])));
    const run = machineFor({});
    const inputRegisters = [0, 100, 17, 18, 19, 20, 21, 22];
    const callEncode = (machine: typeof run, value: number) => machine('TOSEC', inputRegisters, new Map(clockMemory(clockText(value), 100)));
    const callDecode = (machine: typeof run, value: number) => machine('TOTIME', [value, ...inputRegisters.slice(1)], new Map());
    const outputText = (state: ReturnType<typeof run>) => Array.from({ length: 4 }, (_, i) => {
      const word = state.memory.get(100 + i);
      if (word === undefined) throw Error('時刻の出力未設定');
      return String.fromCharCode(word);
    }).join('');
    const avgInputs = [[15, 60, 120, 480], [3600, 3599, 3600, 3601], [0, 1, 2, 3], [5999, 5998, 5997, 5996]];
    const average = (machine: typeof run, values: number[]) => {
      const initial = new Map<number, number>();
      values.forEach((value, i) => {
        const addr = 200 + 17 * i;
        initial.set(100 + i, addr);
        for (const [cell, word] of clockMemory(clockText(value), addr)) initial.set(cell, word);
      });
      return machine('AVERAGE', inputRegisters, initial);
    };
    const verify = (probe: () => boolean) => {
      try { return probe(); } catch { return false; }
    };
    compareAll(body, 'a', option => verify(() => [0, 1, 29, 59, 600, 3587, 5999]
      .every(value => callEncode(machineFor({ a: option }), value).registers[0] === value)));
    for (const id of ['b', 'c']) compareAll(body, id, option => verify(() => [0, 1, 29, 59, 600, 3587, 5999]
      .every(value => outputText(callDecode(machineFor({ [id]: option }), value)) === clockText(value))));
    for (const id of ['f', 'g']) compareAll(body, id, option => verify(() => avgInputs.every(values => {
      const expected = Math.floor(values.reduce((total, value) => total + value, 0) / 4);
      return String.fromCharCode(...average(machineFor({ [id]: option }), values).output) === clockText(expected);
    })));
    const expectedCount = callDecode(run, seconds).counts.get('TOTIME:10');
    compareAll(body, 'e', option => Number(option) === expectedCount);
    compareAll(body, 'd', option => Number(option) === callEncode(run, seconds).counts.get('TOSEC:19'));
    assert.deepEqual(options(body, 'e').map(Number), options(body, 'e').map(Number).slice().sort((a, b) => a - b));
    assert.match(body.explanation, new RegExp('＝' + expectedCount + '回'));
    // The four authored conditions use the same instruction bodies. Exhaust
    // the physical domain once, including both conversion boundaries.
    if (index === 0) for (let value = 0; value < 6000; value++) {
      const encoded = callEncode(run, value), decoded = callDecode(run, value);
      assert.equal(encoded.registers[0], value);
      assert.equal(encoded.counts.get('TOSEC:19'), 6);
      assert.deepEqual(encoded.registers.slice(1), inputRegisters.slice(1));
      assert.equal(outputText(decoded), clockText(value));
      assert.deepEqual(decoded.registers.slice(1), inputRegisters.slice(1));
    }
  }
});

function argumentList(expression: string) {
  const match = /^([^()]+)\((.*)\)$/.exec(expression);
  assert(match, expression);
  const args: string[] = [];
  let depth = 0, start = 0;
  for (const [i, char] of [...match[2]].entries()) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) { args.push(match[2].slice(start, i).trim()); start = i + 1; }
  }
  args.push(match[2].slice(start).trim());
  return { name: match[1], args };
}
function spreadsheetReference(expression: string, row: number, col: number) {
  const [, colFixed, letter, rowFixed, number] = /^(\$?)([A-Z])(\$?)(\d+)$/.exec(expression)!;
  return [Number(number) + (rowFixed ? 0 : row), letter.charCodeAt(0) - 65 + (colFixed ? 0 : col)];
}

test('2013秋 午後問13は表示するセル・順位・同率規則と数式・マクロ全候補を照合する', () => {
  for (const [index, body] of cases(13).entries()) {
    const { assigned, capacity, matrix, leaders, students, lastRow, fullRow, recommendationRow } = groupingSheet(index);
    assert.equal(matrix.length, students);
    assert.equal(students, leaders.length * capacity);
    const ids = Array.from({ length: students }, (_, i) => i + 1);
    const groupMembers = leaders.map((_, i) => ids.filter(student => assigned.get(student) === i + 1));
    assert(groupMembers.every(group => group.length <= capacity));
    const pairs: { student: number; group: number; weight: number }[] = [];
    ids.forEach(student => leaders.forEach((leader, i) => {
      if (!assigned.has(student) && groupMembers[i].length < capacity)
        pairs.push({ student, group: i + 1, weight: matrix[leader - 1][student - 1] });
    }));
    pairs.sort((a, b) => b.weight - a.weight || a.student - b.student || a.group - b.group);
    const result = pairs[0];
    const groupRows = figures.find(figure => figure.profile.endsWith('-grouping-sheet'))!.panel([index]);
    const matrixRows = figures.find(figure => figure.profile.endsWith('-similarity-sheet'))!.panel([index]);
    assert(groupRows.kind === 'tables' && matrixRows.kind === 'tables');
    assert.deepEqual(groupRows.tables[0].rows.at(-1)?.slice(2, 6).map(cell => typeof cell === 'string' ? cell : cell.text),
      ['受講者番号', String(result.student), 'の学生をグループ', String(result.group)]);
    const solution = ids.map(student => pairs.find(item => item.student === student) ?? { student, group: 1, weight: -1 });
    const rank = solution.map(item => solution.filter(other => other.weight > item.weight).length + 1);
    const toThousandths = (text: string) => Number(text) <= 0 ? Number(text) : Math.round(Number(text) * 1000);
    for (const row of groupRows.tables[0].rows) {
      const [rawRow, rawStudent] = row;
      if (typeof rawRow !== 'string' || typeof rawStudent !== 'string' || !/^\d+$/.test(rawStudent) || Number(rawRow) < 3 || Number(rawRow) > lastRow) continue;
      const student = Number(rawStudent);
      const visible = row.slice(10).map(cell => String(cell));
      const scores = leaders.map((leader, i) => assigned.has(student) || groupMembers[i].length === capacity ? -1 : matrix[student - 1][leader - 1]);
      assert.deepEqual(visible.slice(0, 6).map(toThousandths), [...scores, solution[student - 1].weight]);
      assert.deepEqual(visible.slice(6).map(Number), [rank[student - 1], solution[student - 1].group]);
    }
    for (let i = 0; i < students; i++) {
      assert.equal(matrix[i][i], 0);
      for (let j = 0; j < students; j++) assert.equal(matrix[i][j], matrix[j][i]);
    }
    if (index === 0) {
      assert.deepEqual(result, { student: 18, group: 1, weight: 250 });
      assert.deepEqual([rank[2], rank[3], rank[0]], [13, 8, 16]);
      assert.deepEqual(matrixRows.tables[0].rows[3], ['3', '1', '佐藤一郎', '0', '0.117', '0.133', '0.111', '…', '0.052', '0.136']);
    } else {
      assert(pairs.filter(pair => pair.weight === result.weight).length >= 4);
    }
    compareAll(body, 'a', option => {
      const [, logic, row, group] = /^(論理和|論理積)\(\$H3＝([01]), C\$(\d+＝[01])\)$/.exec(option)!;
      assert.equal(Number(group.split('＝')[0]), fullRow);
      return [0, 1].every(studentFlag => [0, 1].every(groupFlag => {
        const a = studentFlag === Number(row), b = groupFlag === Number(group.at(-1));
        return (logic === '論理和' ? a || b : a && b) === Boolean(studentFlag || groupFlag);
      }));
    });
    compareAll(body, 'b', option => {
      const [student, leader] = option.split(', ');
      return [0, 1, students - 1].every(offset => leaders.every((_, group) =>
        JSON.stringify(spreadsheetReference(student, offset, group)) === JSON.stringify([offset + 3, 0]) &&
        JSON.stringify(spreadsheetReference(leader, offset, group)) === JSON.stringify([2, group + 2])));
    });
    const sheetFor = (actual: boolean) => {
      const chosen = actual ? result.student : students - 4;
      const group = actual ? result.group : 5;
      const worksheet: Record<string, number[]> = {
        A: ids, H: ids.map(student => assigned.has(student) ? 1 : 0),
        P: actual ? rank : ids.map(student => student === chosen ? 1 : 2),
        O: actual ? solution.map(item => item.weight) : ids.map(student => student === chosen ? 123 : -1),
        Q: actual ? solution.map(item => item.group) : ids.map(student => student === chosen ? 5 : 1),
      };
      return { worksheet, chosen, group };
    };
    for (const id of ['c', 'd']) compareAll(body, id, option => [true, false].every(actual => {
      const { worksheet, chosen, group } = sheetFor(actual);
      const range = (ref: string) => {
        const match = /^([AHOPQ])3〜\1(\d+)$/.exec(ref);
        if (!match) return [0, 1, 0, 0, 0];
        assert.equal(Number(match[2]), lastRow);
        return worksheet[match[1]];
      };
      const resolve = (expr: string): number => {
        if (expr === 'C' + recommendationRow) return chosen;
        if (/^\d+$/.test(expr)) return Number(expr);
        if (expr.startsWith('整数(')) return 1 + Math.floor(worksheet.H.filter(Boolean).length / capacity);
        if (expr.endsWith('＋1')) return 2;
        const { name, args } = argumentList(expr);
        if (name === '照合一致') return range(args[1]).indexOf(resolve(args[0])) + 1;
        if (name === '照合検索') return range(args[2])[range(args[1]).indexOf(resolve(args[0]))];
        if (name === '表引き') return range(args[0])[resolve(args[1]) - 1];
        if (name === '条件付個数') {
          const filter = args[1] === '＝1' ? (value: number) => value === 1
            : args[1] === '＝−1' ? (value: number) => value === -1 : (value: number) => value !== -1;
          return range(args[0]).filter(filter).length;
        }
        throw Error(expr);
      };
      return resolve(option) === (id === 'c' ? chosen : group);
    }));
    for (const id of ['e', 'g']) compareAll(body, id, option => {
      const destination = option.split(' ← ')[0];
      const location = (expr: string, i: number, student: number, group: number): [number, number] => {
        const { name, args: [base, row, col] } = argumentList(expr);
        assert.equal(name, '相対');
        assert.equal(base, 'B2');
        const evaluate = (item: string): number => {
          if (item === 'I') return i;
          if (item === 'C' + recommendationRow) return student;
          if (item === 'G' + recommendationRow) return group;
          if (/^\d+$/.test(item)) return Number(item);
          const [r, c] = location(item, i, student, group);
          return r === 2 ? leaders[c - 3] ?? 0 : r === recommendationRow ? (c === 3 ? student : c === 7 ? group : 0) : 0;
        };
        return [2 + evaluate(row), 2 + evaluate(col)];
      };
      return leaders.every((leader, groupIndex) => {
        const i = groupIndex + 1, student = ids[students - 5 - groupIndex], group = (i % 5) + 1;
        const [row, col] = location(destination, i, student, group);
        return row === 2 + (id === 'e' ? leader : student) && col === 2 + (id === 'e' ? i : group);
      });
    });
    const loopCounts = [5, 25, students, students * 4, students * 5, students + 5, students - 5, students / 5];
    compareAll(body, 'f', option => loopCounts[options(body, 'f').indexOf(option)] === students - 5);
    const [macro] = codeBlocks(body, 'pseudocode');
    assert.match(macro, /\n■ I：1, I ≦ NumGroups, 1\n    ■ J：1, J ≦ NumUsers, 1\n        ・相対\(B2, J, I\) ← 0\n    ■\n    ・［e］\n■\n■ I：1, I ≦ ［f］, 1\n    ・［g］\n■$/);
    assert.match(body.explanation, new RegExp('受講者番号' + result.student + '、グループ' + result.group));
  }
});

test('2013秋 午後問9〜13の管理図は全入力で可読な表示と出典範囲を保持する', () => {
  assert.deepEqual(renderers.map(renderer => renderer.profile), figures.map(figure => figure.profile));
  const seen = new Set<string>();
  for (const spec of specs) for (const [i, body] of cases(spec.number).entries()) {
    const assetIds = body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])) ?? [];
    assert.deepEqual(assetIds, spec.definition.fixedReferenceAssetIds ?? []);
    assert(!assetIds.some(id => /p07[12]$/.test(id)));
    for (const block of body.prompt) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene;
      const registered = figures.find(item => item.profile === profile), renderer = renderers.find(item => item.profile === profile);
      assert(registered && renderer);
      assert.deepEqual(values, [i]);
      assert.equal(registered.alt(values), block.alt);
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
      assert.match(html, /class="diagram-scroll" role="group" tabindex="0"/);
      assert(html.includes('var(--image-scale, 1)'));
      assert(html.includes('var(--diagram-ink)'));
      assert(html.includes('aria-description=') && html.includes('<figcaption>'));
      assert(!/NaN|undefined|Infinity/.test(html));
      if (profile.endsWith('-grouping-sheet')) assert.match(html, /scope="col"[^>]*>Q<\/th>/);
      if (profile.endsWith('-fence-layout')) assert.equal((html.match(/data-court=/g) ?? []).length, 4);
      if (profile.endsWith('-directory-tree')) assert.equal((html.match(/data-directory-edge=/g) ?? []).length, 7);
      if (profile.endsWith('-invalid-input')) {
        assert.equal((html.match(/class="omitted-cell"/g) ?? []).length, 2);
        assert.match(html, /rowSpan="2"[^>]*>②<\/td>/);
      }
      if (profile.endsWith('-program-changes')) assert.match(html, /ELSE\n    IF ［e］ AND\n       ［f］ AND\n       ［g］ THEN/);
      seen.add(profile + ':' + i);
    }
  }
  assert.equal(seen.size, figures.length * 4);
});
