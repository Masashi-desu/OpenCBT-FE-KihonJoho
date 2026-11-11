import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import schema from '../../../docs/public/schemas/common.schema.json';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block } from '../../../src/core/types';
import { spring2012PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2012-spring-pm-09-13';
import { legacy2012SpringPm0913Figures as figures } from '../../../src/core/generators/legacy-2012-spring-pm-09-13-figures';
import { bookExamples, historyByReader, loanEntries, readerProfile } from '../../../src/core/generators/legacy-2012-spring-pm-13-data';
import { legacy2012SpringPm0913FigureRenderers as renderers } from '../../../src/ui/Legacy2012SpringPm0913Figures';

const answerKeys = [
  ['エイアウアオ', 'エイアウアオ', 'エイアウアオ', 'エイアウアオ'],
  ['ウエキクウイオ', 'ウエキクウイオ', 'ウエキクウイオ', 'ウエキクウイオ'],
  ['エエウエキウ', 'エエウエキウ', 'エエウエキウ', 'エエウエキウ'],
  ['ケアエエオウ', 'ケアエアオウ', 'ケアエイオウ', 'ケアエオオウ'],
  ['オウウキアカアキ', 'オウウキアカアキ', 'オウウキアカアキ', 'オウウキアカアキ'],
];
// Keep all four conditions' reviewed option groups and order bound to the independent checks below.
const reviewedBanks = [
  ["7e9c7a8ae840e444136a1604bf09db64a56571d5de3ee266116d9b34d66d2bc8","7e9c7a8ae840e444136a1604bf09db64a56571d5de3ee266116d9b34d66d2bc8","7e9c7a8ae840e444136a1604bf09db64a56571d5de3ee266116d9b34d66d2bc8","7e9c7a8ae840e444136a1604bf09db64a56571d5de3ee266116d9b34d66d2bc8"],
  ["3cba3ece5a9b4d2f3f5a572b9a6e700891de664f2cb484198c962b083615343e","cab33f03a51db82b48f28979811aa4b2fc4298722a9ac9b78fe619ec4006d115","c7ce39543f03791d3eceb6b91bcdf3df42e7eeb4f56005ac1bfce131c2b9679c","29258dedc47b9f36ee8c1ba500c8638b34d8df849da5d9d281a6d74ead449f03"],
  ["f7974b30fa004890a0f0edabe6a646949c66c53703cfb8c8c9a8c28c54d07c63","f7974b30fa004890a0f0edabe6a646949c66c53703cfb8c8c9a8c28c54d07c63","f7974b30fa004890a0f0edabe6a646949c66c53703cfb8c8c9a8c28c54d07c63","f7974b30fa004890a0f0edabe6a646949c66c53703cfb8c8c9a8c28c54d07c63"],
  ["29c8cc2abe87344034350c423d2627b8ea75a439ed9a85c34610696e734bc6b3","29c8cc2abe87344034350c423d2627b8ea75a439ed9a85c34610696e734bc6b3","29c8cc2abe87344034350c423d2627b8ea75a439ed9a85c34610696e734bc6b3","29c8cc2abe87344034350c423d2627b8ea75a439ed9a85c34610696e734bc6b3"],
  ["04003f02ed7ef568f044201e5632a346099fd772db4100860f326c4c99936e29","04003f02ed7ef568f044201e5632a346099fd772db4100860f326c4c99936e29","04003f02ed7ef568f044201e5632a346099fd772db4100860f326c4c99936e29","04003f02ed7ef568f044201e5632a346099fd772db4100860f326c4c99936e29"],
];
const kana = 'アイウエオカキクケ';
const cases = (number: number) => [0, 1, 2, 3].map(i => drafts[number - 9].definition.build([i]));

function text(blocks: Block[]) {
  return blocks.map(block => 'text' in block ? block.text : '').join('\n');
}
function snippet(body: GeneratedBody, id: string, selected?: string) {
  const partId = 'part-' + id;
  const part = body.answerParts!.find(part => part.id === partId)!;
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === partId);
  const key = selected ?? (answer?.kind === 'choice' ? answer.choiceId : '');
  assert(part.choiceIds.includes(key));
  return text(body.choices[Number(key.split('-').at(-1)) - 1]);
}
function allSnippets(body: GeneratedBody, id: string) {
  return body.answerParts!.find(part => part.id === 'part-' + id)!.choiceIds.map(choice => snippet(body, id, choice));
}
function codeBlocks(body: GeneratedBody, language: string) {
  return body.prompt.flatMap(block => block.type === 'code' && block.language === language ? [block.text] : []);
}
function bind(program: string, body: GeneratedBody) {
  return program.replace(/［([a-z])］/g, (_, id: string) => snippet(body, id));
}
function figurePanel(suffix: string, index: number) {
  const matches = figures.filter(figure => figure.profile.endsWith('-' + suffix));
  assert.equal(matches.length, 1);
  return matches[0].panel([index]);
}
function grids(suffix: string, index: number) {
  const panel = figurePanel(suffix, index);
  assert.equal(panel.kind, 'grids');
  return panel.tables;
}
function output(suffix: string, index: number) {
  const panel = figurePanel(suffix, index);
  assert.equal(panel.kind, 'output');
  return panel.text;
}
function escape(text: string) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
}
function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 15_000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}
function temporary<T>(call: (directory: string) => T) {
  const directory = mkdtempSync(join(tmpdir(), 'opencbt-2012-spring-pm-'));
  try { return call(directory); } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('2012春午後問9〜13は原31頁、公式33欄と20条件を保持する', () => {
  const pageRanges = [[40, 46], [47, 53], [54, 58], [59, 62], [63, 70]];
  const widths = [[4, 5, 6, 6, 5, 6], [4, 8, 8, 8, 4, 5, 5], [4, 4, 4, 7, 7, 5], [9, 9, 9, 5, 6, 6], [8, 6, 6, 8, 8, 8, 8, 8]];
  const seenProfiles = new Set<string>();
  const allowedCodeLanguages = schema.$defs.block.oneOf.find(block => block.properties?.type?.const === 'code')
    ?.properties?.language?.enum;
  assert(allowedCodeLanguages);
  drafts.forEach((draft, n) => {
    const { definition } = draft;
    assert.equal(definition.source, '2012h24h-fe-pm-' + (n + 9));
    const alt = draft.originalPageAlt();
    const [start, end] = pageRanges[n];
    assert.deepEqual(Object.keys(alt).map(Number), Array.from({ length: end - start + 1 }, (_, i) => start + i));
    assert(Object.values(alt).every(value => value.length > 100));
    assert.deepEqual(definition.reference, [0]);
    for (const invalid of [[], [-1], [1.5], [4], [0, 0]]) assert.throws(() => definition.build(invalid));
    const changed = new Set<string>();
    cases(n + 9).forEach((body, i) => {
      const referenceAssets = (body.contexts ?? []).flatMap(context => context.blocks.flatMap(block =>
        block.type === 'image' ? [block.assetId] : []));
      assert.deepEqual(referenceAssets, definition.fixedReferenceAssetIds ?? []);
      const blocks = [...body.prompt, ...body.choices.flat(), ...(body.contexts ?? []).flatMap(context => context.blocks)];
      for (const block of blocks) if (block.type === 'code')
        assert(allowedCodeLanguages.includes(block.language), definition.source + ': ' + block.language);
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), widths[n]);
      const banks = body.answerParts!.map(part => part.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1]));
      assert.equal(createHash('sha256').update(JSON.stringify(banks)).digest('hex'), reviewedBanks[n][i]);
      const answer = new Map<string, string>();
      body.partAnswers!.forEach(part => {
        if (part.kind === 'choice') answer.set(part.partId, part.choiceId);
        else {
          assert.equal(part.kind, 'unordered');
          assert.deepEqual(part.partIds, ['part-b', 'part-c', 'part-d']);
          part.partIds.forEach((id, k) => answer.set(id, part.choiceIds[k]));
        }
      });
      assert.equal(answer.size, widths[n].length);
      assert.equal(body.answerParts!.map(part => kana[part.choiceIds.indexOf(answer.get(part.id)!)]).join(''), answerKeys[n][i]);
      body.answerParts!.forEach(part => assert.equal(new Set(part.choiceIds.map(choice => snippet(body, part.id.slice(5), choice))).size, part.choiceIds.length));
      changed.add(JSON.stringify(body.prompt));
      assert(body.explanation.length > 100);
      for (const block of body.prompt) {
        if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
        const { profile, values } = block.scene;
        const figure = figures.find(figure => figure.profile === profile)!;
        const renderer = renderers.find(renderer => renderer.profile === profile)!;
        seenProfiles.add(profile);
        assert(figure && renderer);
        assert.deepEqual(values, [i]);
        assert.equal(block.alt, figure.alt(values));
        const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
        assert(markup.includes('data-figure-profile="' + profile + '"'));
        assert(markup.includes('aria-description="' + escape(block.alt) + '"'));
        assert.match(markup, /class="diagram-scroll" tabindex="0"/);
        const panel = figure.panel(values);
        if (panel.kind === 'digits') {
          assert.match(markup, /<desc id="[^"]+">/);
          assert.equal((markup.match(/data-digit-row=/g) ?? []).length, panel.inputs.length + 1);
        } else if (panel.kind === 'grids') {
          assert.equal((markup.match(/<table /g) ?? []).length, panel.tables.length);
          assert(panel.tables.every(table => table.rows.every(row => row.length === table.headers.length)));
        } else assert(markup.includes(escape(panel.text)));
      }
    });
    assert.equal(changed.size, 4);
  });
  assert.equal(seenProfiles.size, 16);
  assert.deepEqual([...seenProfiles].sort(), figures.map(figure => figure.profile).sort());
});

function bruteIntervals(busy: readonly (readonly boolean[])[], need: number, count: number) {
  const length = busy[0].length;
  const free = (n: number) => busy.slice(0, count).every(row => !row[n]);
  return Array.from({ length }, (_, i) => i).flatMap(start => {
    if (!free(start) || start > 0 && free(start - 1)) return [];
    const firstBlocked = Array.from({ length: length - start }, (_, i) => start + i).find(n => !free(n)) ?? length;
    return firstBlocked - start >= need ? [[start, firstBlocked - start]] : [];
  });
}
function bestPrefix(busy: readonly (readonly boolean[])[], need: number, mandatory: number) {
  for (let count = busy.length; count >= mandatory; count--) {
    const possible = bruteIntervals(busy, need, count);
    if (possible.length) return possible;
  }
  return [];
}

test('問9の全時間帯を独立に列挙し、可能ならCの実コードと照合する', t => {
  const compiler = ['clang', 'cc'].find(command => spawnSync(command, ['--version']).status === 0);
  if (compiler) t.diagnostic('C compiler: ' + compiler);
  const positions = [[[0, 3], [11, 2], [16, 3]], [[0, 3]], [[0, 3], [16, 2]], [[11, 4], [16, 3]]];
  cases(9).forEach((body, i) => {
    const [first, second] = grids('employee-schedules', i);
    const busy = first.rows.slice(1).map((row, r) => [...row.slice(1, -1), ...second.rows[r + 1].slice(1, -1)].map(mark => mark === '×'));
    const need = Number(text(body.prompt).match(/slot_num = (\d+)/)?.[1]);
    const expected = bruteIntervals(busy, need, busy.length);
    assert.deepEqual(expected, positions[i]);
    assert.deepEqual(grids('free-slots', i)[0].rows.map(row => row.slice(1).map(Number)), expected);
    assert.deepEqual([...('abcdef')].map(id => snippet(body, id)),
      ['time_tbl[0][i]', 'i - cnt', 'cnt = 0', 'cnt >= slot_num', 'j = 1; j < must_num', 'wk_free[1][0].s_start == -1']);
    if (!compiler) return;
    const [, part1, tail1, part2, tail2] = codeBlocks(body, 'c');
    const main = bind(part1 + '\n' + tail1 + '\n' + part2.slice(part2.indexOf('void maxmem_free_slot(int num')) + '\n' + tail2, body);
    const native = temporary(dir => {
      const rows = busy.map(row => '{' + row.map(Number).join(',') + '}').join(',\n');
      const source = `#include <stdio.h>
${main}
static void result(SLOT *items) {
    for (int j = 0; items[j].s_start != -1; j++) printf("%d:%d ", items[j].s_start, items[j].s_num);
    printf("\\n");
}
int main(void) {
    int entries[5][NUM_DAY] = {${rows}};
    int *refs[] = { entries[0], entries[1], entries[2], entries[3], entries[4] };
    SLOT items[NUM_DAY + 1];
    allmem_free_slot(5, refs, ${need}, items);
    result(items);
    maxmem_free_slot(5, 2, refs, ${need}, items);
    result(items);
    for (int j = 0; j < NUM_DAY; j++) entries[4][j] = 1;
    maxmem_free_slot(5, 2, refs, ${need}, items);
    result(items);
    return 0;
}`;
      writeFileSync(join(dir, 'meeting.c'), source);
      run(compiler, ['-std=c11', '-Wall', '-Wextra', '-Werror', 'meeting.c', '-o', 'meeting'], dir);
      return run(join(dir, 'meeting'), [], dir).split('\n').slice(0, 3).map(line => line.trim());
    });
    const blocked = busy.map((row, r) => r === 4 ? row.map(() => true) : row);
    assert.deepEqual(native, [expected, bestPrefix(busy, need, 2), bestPrefix(blocked, need, 2)].map(windows => windows.map(w => w.join(':')).join(' ')));
  });
});

test('問10は年齢層別の時間窓と施設別集計を独立モデルで再計算する', () => {
  cases(10).forEach((body, i) => {
    const opening = [10, 9, 8, 11][i];
    assert.match(text(body.prompt), new RegExp(opening + '時に開園'));
    const hourly = output('guest-output', i);
    assert(hourly.includes(String(opening).padStart(2, '0') + ':00-59'));
    assert(hourly.includes((opening + 9) + ':00-59'));
    if (i === 0) {
      assert(hourly.includes('10:00-59 @@@**++==-'));
      assert(hourly.includes('11:00-59 @@@@***++==-'));
      assert(hourly.includes('19:00-59 *+++='));
    }
    assert(output('facility-output', i).includes('RECREATIONAL FACILITIES'));
    const guests = [
      { enter: opening, exit: opening + 1, age: 1, count: 102 },
      { enter: opening + 1, exit: opening + 4, age: 2, count: 250 },
      { enter: opening + 3, exit: opening + 9, age: 1, count: 71 },
      { enter: opening + 9, exit: opening + 9, age: 4, count: 131 },
    ];
    const expected = Array.from({ length: 10 }, (_, k) => Array.from({ length: 5 }, (_, age) =>
      guests.filter(guest => guest.enter <= opening + k && guest.exit >= opening + k && guest.age === age + 1)
        .reduce((count, guest) => count + guest.count, 0)));
    const events = guests.flatMap(g => [[g.enter, 1, g.age, g.count], [g.exit, 2, g.age, g.count]]).sort((a, b) => a[0] - b[0]);
    const active = Array(5).fill(0) as number[], actual = Array.from({ length: 10 }, () => [...active]);
    let current = opening, total = 0;
    for (const [hour, code, age, count] of events) {
      for (; current < hour; current++) actual[current - opening + 1] = [...active];
      if (code === 1) {
        actual[current - opening][age - 1] += count;
        active[age - 1] += count;
        total += count;
      } else active[age - 1] -= count;
    }
    assert.deepEqual(actual, expected);
    assert.equal(total, 554);
    assert.equal(snippet(body, 'a'), `MOVE STAY-GUEST TO PRT-TIME(CR-HH - ${opening - 2})`);
    const group = body.partAnswers!.find(answer => answer.kind === 'unordered')!;
    assert(group.kind === 'unordered');
    assert.deepEqual(group.choiceIds.map((choice, index) => snippet(body, 'bcd'[index], choice)).sort(),
      [`PRT-AGE(CR-HH - ${opening - 1}, G-AGE)`, 'STAY-CNT(G-AGE)', 'TOTAL-GUEST'].sort());
    assert.equal(snippet(body, 'e'), 'ADD MARK-CNT TO MARK-POS');
    assert.equal(snippet(body, 'f'), 'ADD 1 TO FAC-CNT(E-CODE - 2)');
    assert.equal(snippet(body, 'g'), 'VARYING FAC-NO FROM 3 BY 1 UNTIL FAC-NO > 8');
    const visits = [120, 99, 310, 0, 85, 101];
    assert.deepEqual(visits.map((n, j) => [j + 3, Math.floor(n / 100)]).filter(([, count]) => count > 0), [[3, 1], [5, 3], [8, 1]]);
    assert.equal(expected[1].map((count, age) => ['@', '*', '+', '=', '-'][age].repeat(Math.floor(count / 100))).join(''), '@**');
  });
});

test('問11の更新・削除・例外・同点順を独立に追跡し、可能ならJavaで実行する', t => {
  const hasJdk = spawnSync('javac', ['-version']).status === 0 && spawnSync('java', ['-version']).status === 0;
  if (hasJdk) t.diagnostic('Java compiler: javac');
  cases(11).forEach((body, i) => {
    const java = codeBlocks(body, 'java');
    const [manager, imports, code1, code2, tester] = java.slice(4);
    assert(manager.includes('public class ScoreManager'));
    assert(tester.includes('public class ScoreManagerTester'));
    const subject = tester.match(/new ScoreManager\("([^"]+)"\)/)?.[1];
    assert(subject);
    const operations = [...tester.matchAll(/sm\.(put|remove)\((?:"(FE\d+)"|null)(?:, (\d+|null))?\);/g)];
    const active: { id: string; score: number }[] = [];
    for (const [, operation, id, score] of operations) {
      if (operation === 'put' && (id === undefined || score === 'null')) break;
      const previous = active.findIndex(entry => entry.id === id);
      if (previous >= 0) active.splice(previous, 1);
      if (operation === 'put') active.push({ id, score: Number(score) });
    }
    const byScore = (natural: boolean) => [...active].sort((a, b) => b.score - a.score || (natural ? a.id.localeCompare(b.id) : 0));
    const print = (natural: boolean) => [subject + 'の成績', ...byScore(natural).map(entry => ' ' + entry.id + ' : ' + entry.score + '点'), 'null'].join('\n');
    assert.equal(output('score-output', i), print(false));
    assert.notEqual(print(true), print(false));
    assert.deepEqual(['a', 'b', 'c', 'd', 'e', '2'].map(id => snippet(body, id)),
      ['String, Integer', 'key == null || value == null', 'keys == null', 'map.remove', 'reverseMap.remove', 'ListをSetに変更し，ArrayListをTreeSetに変更する。']);
    if (!hasJdk) return;
    temporary(dir => {
      const source = bind([imports, code1, code2].join('\n'), body);
      writeFileSync(join(dir, 'ScoreManager.java'), bind(manager, body));
      writeFileSync(join(dir, 'ScoreManagerTester.java'), tester);
      const exercise = (map: string) => {
        writeFileSync(join(dir, 'ValueSortedMap.java'), map);
        run('javac', ['-encoding', 'UTF-8', 'ScoreManager.java', 'ValueSortedMap.java', 'ScoreManagerTester.java'], dir);
        return run('java', ['ScoreManagerTester'], dir).trimEnd();
      };
      assert.equal(exercise(source), print(false));
      const changed = source.replace('import java.util.List;', 'import java.util.Set;\nimport java.util.TreeSet;')
        .replaceAll(/\bList<K>/g, 'Set<K>').replaceAll('new ArrayList<K>()', 'new TreeSet<K>()');
      assert.equal(exercise(changed), print(true));
    });
  });
});

function digitMachine(first: string, second: string) {
  const [larger, smaller] = first.length >= second.length ? [first, second] : [second, first];
  let carry = 0, count = 0;
  const stack = [0];
  for (let n = 1; n <= larger.length; n++) {
    const code = larger.charCodeAt(larger.length - n);
    const term = n > smaller.length ? 0 : (smaller.charCodeAt(smaller.length - n) & 0x000f);
    let word = code + term + carry;
    carry = Number(word > '9'.charCodeAt(0));
    if (carry) { word -= 10; count++; }
    stack.push(word);
  }
  if (carry) stack.push('1'.charCodeAt(0));
  let result = '';
  for (let word = stack.pop(); word; word = stack.pop()) result += String.fromCharCode(word);
  return { result, count };
}
test('問12は数字文字とレジスタを独立に追跡し、桁上げと総和を検算する', () => {
  cases(12).forEach((body, i) => {
    const pair = figurePanel('digit-addition', i);
    const sum = figurePanel('digit-summation', i);
    assert(pair.kind === 'digits' && sum.kind === 'digits');
    assert.equal(pair.output, String(BigInt(pair.inputs[0]) + BigInt(pair.inputs[1])));
    assert.equal(digitMachine(pair.inputs[0], pair.inputs[1]).result, pair.output);
    assert.equal(digitMachine(pair.inputs[1], pair.inputs[0]).result, pair.output);
    assert.equal(Number(snippet(body, 'd')), digitMachine(pair.inputs[0], pair.inputs[1]).count);
    assert.equal(sum.output, String(sum.inputs.reduce((current, value) => current + BigInt(value), 0n)));
    const buffers = [sum.inputs[0], ''];
    let active = 0;
    for (const input of sum.inputs.slice(1)) {
      buffers[1 - active] = digitMachine(buffers[active], input).result;
      active = 1 - active;
    }
    assert.equal(buffers[active], sum.output);
    assert.deepEqual(['a', 'b', 'c', 'e', 'f'].map(id => snippet(body, id).replace(/\s+/g, ' ')),
      ['SUBA GR6,=10', 'SUBA GR4,=1', 'SUBA GR5,=1', 'LD GR4,GR0', 'LAD GR3,BUF3']);
    const programs = codeBlocks(body, 'casl2');
    assert.equal(programs.length, 2);
    assert.match(programs[0], /25  CARRY +LD +GR0,=1/);
    const instructionChoices = body.choices.flat().filter(block => block.type === 'code');
    assert.equal(instructionChoices.length, 15);
    assert(instructionChoices.every(block => block.language === 'casl2'));
  });
  assert.deepEqual(digitMachine('9'.repeat(255), '1'), { result: '1' + '0'.repeat(255), count: 255 });
});

function calendarOffset(text: string, n: number) {
  const time = Date.parse('20' + text + 'T00:00:00Z') + 86400000 * n;
  return new Date(time).toISOString().slice(2, 10);
}
test('問13の返却期限・貸出可否・類似度・推薦度を入力から再計算する', () => {
  cases(13).forEach((body, i) => {
    const books = grids('books-sheet', i)[0].rows;
    const users = grids('users-sheet', i)[0].rows;
    const history = grids('history-sheet', i)[0].rows;
    const { today, policies, selected } = bookExamples[i];
    const loans = loanEntries(i), currentDate = books[0][9];
    assert.equal(currentDate, '11-06-' + today);
    if (i === 0) {
      assert.deepEqual(books[5].slice(3, 7), ['37', '11-06-13', '11-06-20', '0']);
      assert.deepEqual(users.slice(1, 5).map(row => row.slice(4, 6)), [['4', '*'], ['8', ''], ['10', ''], ['17', '*']]);
      assert.deepEqual(history.slice(1, 5).map(row => row.at(-1)), ['0.63', '0', '0', '0.56']);
    }
    for (const [, id, , reader, loanDay, due, late] of books.slice(1, 9)) {
      if (!/^\d+$/.test(id)) continue;
      if (!reader) { assert.equal(due + late, ''); continue; }
      assert.equal(due, calendarOffset(loanDay, policies[readerProfile(Number(reader))][1]));
      assert.equal(Number(late), Math.max(0, (Date.parse('20' + currentDate) - Date.parse('20' + due)) / 86400000));
    }
    for (const [, id, , , remaining, overdue] of users.slice(1, 5)) {
      const [limit, days] = policies[readerProfile(Number(id))];
      const userLoans = [...loans.values()].filter(loan => loan.reader === Number(id));
      assert.equal(Number(remaining), limit - userLoans.length);
      assert.equal(overdue, userLoans.some(loan => -loan.day > days) ? '*' : '');
    }
    const records = historyByReader(i), current = records[selected - 1];
    const similarities = records.map((reader, j) => {
      if (j === selected - 1) return 0;
      let common = 0;
      for (let book = 1; book <= 200; book++) if (reader.has(book) && current.has(book)) common++;
      return common / 200;
    });
    const row = history.find(row => row[0] === '202')!;
    assert.deepEqual([2, 3, 4, 5, 7, 8, 9].map(col => Number(row[col])), [1, 2, 3, 4, 48, 49, 50].map(id => similarities[id - 1]));
    for (const id of [1, 2, 3, 4, 200]) {
      const visible = history.find(row => row[1] === String(id))!;
      const expected = current.has(id) || loans.has(id) ? 0 :
        records.reduce((sum, reader, j) => sum + (reader.has(id) ? similarities[j] : 0), 0);
      assert(Math.abs(Number(visible[10]) - expected) < 1e-10);
    }
    const [allowed] = allSnippets(body, 'e');
    assert.equal(snippet(body, 'e'), allowed);
    for (const hasLoan of [false, true]) for (const hasRoom of [false, true]) for (const late of [false, true]) {
      const need = !hasLoan && hasRoom && !late;
      const evaluations = allSnippets(body, 'e').map((candidate, index) =>
        candidate.includes('論理積') && (index < 4 ? !hasLoan : hasLoan) &&
        (index % 4 < 2 ? hasRoom : !hasRoom) && (index % 2 === 0 ? !late : late));
      assert.equal(evaluations[0], need);
      assert.equal(evaluations.filter(Boolean).length, 1);
      const recommend = allSnippets(body, 'g').map((candidate, index) => {
        const matchRead = index % 4 < 2 ? !late : late;
        const matchLoan = index % 2 === 0 ? !hasLoan : hasLoan;
        return candidate.startsWith('論理積') ? matchRead && matchLoan : matchRead || matchLoan;
      });
      assert.equal(recommend[0], !late && !hasLoan);
    }
    assert.match(snippet(body, 'a'), /C2, 利用者情報!A\$2〜C\$51, 3, 0/);
    assert.equal(snippet(body, 'b'), 'IF(E2 ≧ I$1, 0, I$1 − E2)');
    assert.match(snippet(body, 'c'), /G\$2〜I\$5, 2, 0\) − 条件付個数/);
    assert.match(snippet(body, 'd'), /条件付合計.*= A2.*＞ 0/);
    assert.equal(snippet(body, 'f'), '相対(A1, K, B204) * 相対(A1, K, J)');
    assert.equal(snippet(body, 'h'), '相対(A1, K, J) * 相対(A1, 201, J)');
  });
});
