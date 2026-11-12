import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { autumn2008PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2008-autumn-pm-10-13';
import { legacy2008AutumnPm1013Figures as figures } from '../../../src/core/generators/legacy-2008-autumn-pm-10-13-figures';
import { legacy2008AutumnPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2008AutumnPm1013Figures';
import { runSummary } from '../../fixtures/legacy-2008-autumn-pm-13-oracle';

const official = ['カカエエイ', 'ウカアイエ', 'ウウイキエイ', 'ウウイアカイ'];
const slots = ['abcde', 'abcde', 'abcde2', 'abcdef'];
const optionsPerSlot = [[6, 6, 6, 5, 5], [7, 7, 7, 5, 5], [4, 4, 8, 8, 4, 4], [4, 4, 4, 4, 7, 7]];
const cases = [0, 1, 2, 3];
const kana = 'アイウエオカキク';
const partsOf = (body: GeneratedBody) => body.answerParts!;
const answersOf = (body: GeneratedBody) => body.partAnswers!;
function textOptions(body: GeneratedBody, field: string) {
  const part = partsOf(body).find(candidate => candidate.id === 'part-' + field);
  assert.ok(part);
  const texts = part.choiceIds.map(choice => {
    const block = body.choices[Number(choice.split('-').at(-1)) - 1][0];
    assert.ok(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
  const answer = answersOf(body).find(candidate => candidate.kind === 'choice' && candidate.partId === part.id);
  assert.ok(answer && answer.kind === 'choice');
  return { texts, index: part.choiceIds.indexOf(answer.choiceId) };
}
function verify(body: GeneratedBody, field: string, predicate: (text: string) => boolean) {
  const { texts, index } = textOptions(body, field);
  assert.deepEqual(texts.flatMap((text, position) => predicate(text) ? [position] : []), [index], '解答欄 ' + field);
}
function sourceFigure(body: GeneratedBody, suffix: string) {
  const block = body.prompt.find(item => item.type === 'diagram' && item.scene.kind === 'source_figure' && item.scene.profile.endsWith(suffix));
  assert.ok(block && block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(figure => figure.profile === profile);
  assert.ok(definition);
  return definition.panel(values);
}
const programs = (body: GeneratedBody, language: string) => body.prompt.flatMap(block =>
  block.type === 'code' && block.language === language ? [block.text] : []);
function table(body: GeneratedBody, prefix: string) {
  const result = body.prompt.find(block => block.type === 'table' && block.caption.startsWith(prefix));
  assert.ok(result && result.type === 'table');
  return result;
}
function lineNumbers(source: string, length: number) {
  assert.deepEqual(source.split('\n').map(line => Number(/^\s*\d+/.exec(line)?.[0])),
    Array.from({ length }, (_, i) => i + 1));
}

function cipher(body: GeneratedBody) {
  const example = sourceFigure(body, 'cipher-example');
  const rules = sourceFigure(body, 'substitution-steps');
  const next = sourceFigure(body, 'newlines-example');
  assert.ok(example.kind === 'tables' && rules.kind === 'cipher-steps' && next.kind === 'output');
  const cols = [0, 1, 2, 18, 19, 20, 21, 22];
  const coords = new Map(example.tables[1].rows.flatMap((row, r) =>
    row.slice(1).filter(symbol => symbol !== '…').map((symbol, i) => [symbol, [r, cols[i]]] as const)));
  const table = new Map([...coords].map(([symbol, [r, c]]) => [r + ':' + c, symbol]));
  const direction = [rules.rowStep, rules.columnStep];
  const wrap = (value: number, capacity: number) => value < 0 ? value + capacity : value >= capacity ? value - capacity : value;
  const transform = (plain: string) => plain.match(/.{1,2}/g)!.flatMap(([a, b = '△']) => {
    const [r, c] = coords.get(a)!;
    const [s, d] = coords.get(b)!;
    const newCol = (col: number, other: number) => r === s ? wrap(col + direction[1], 23) : other;
    const newRow = (row: number) => c === d ? wrap(row + direction[0], 4) : row;
    return [table.get(newRow(r) + ':' + newCol(c, d)), table.get(newRow(s) + ':' + newCol(d, c))];
  }).join('');
  const plain = example.tables[0].rows[0][1];
  const encoded = example.tables[0].rows[1][1];
  assert.equal(transform(plain), encoded);
  for (const [, a, b, , c, d] of example.tables[2].rows) assert.equal(transform(a + b), c + d);
  assert.equal(new Set(example.tables[2].rows.map(row => row[0])).size, 4);
  const [source, output] = next.text.split('\n\n').map(text => text.replace(/^.*?：/, '').replaceAll(/\n\s*/g, ''));
  const breaks = (text: string) => [...text.matchAll(/↓/g)].map(match => match.index);
  assert.deepEqual(breaks(output), breaks(source));
  assert.equal(source.replaceAll('↓', ''), plain);
  assert.equal(output.replaceAll('↓', ''), encoded);
  const code = programs(body, 'c').join('\n');
  lineNumbers(code, 60);
  verify(body, 'a', value => value === 'sts == EOF');
  verify(body, 'b', value => value === 'row[0] == row[1]');
  verify(body, 'c', value => value === 'col[0] == col[1]');
  verify(body, 'd', value => {
    const actual = /^ctbl\[\(row\[0\]\+(1|ROWS-1)\) % ROWS\]\[\(col\[0\]\+(1|COLS-1)\) % COLS\]$/.exec(value);
    return Boolean(actual && (actual[1] === '1' ? 1 : -1) === direction[0] && (actual[2] === '1' ? 1 : -1) === direction[1]);
  });
  verify(body, 'e', value => {
    const [, first, second] = /^行番号(\d+)と(\d+)$/.exec(value) ?? [];
    const line = (n: string) => code.split('\n')[Number(n) - 1];
    return Boolean(first && /fputc\(ch\[0\]/.test(line(first)) && /fputc\(ch\[1\]/.test(line(second)));
  });
}

function grammarCheck(text: string, open: string, close: string, and: string, or: string) {
  let i = 0;
  function item() {
    const token = text[i++];
    if (token === 'T' || token === 'F') return true;
    return token === open && expression() && text[i++] === close;
  }
  function product() {
    if (!item()) return false;
    while (text[i] === and) { i++; if (!item()) return false; }
    return true;
  }
  function expression() {
    if (!product()) return false;
    while (text[i] === or) { i++; if (!product()) return false; }
    return true;
  }
  return expression() && i === text.length;
}
function cobol(body: GeneratedBody) {
  const initial = programs(body, 'cobol').slice(1).join('\n');
  lineNumbers(initial, 70);
  const alphabet = /VALUE "([^"]{6})"/.exec(initial)?.[1];
  const limit = Number(/UNTIL EXP-L > (\d+)/.exec(initial)?.[1]);
  assert.ok(alphabet && limit >= 5);
  const [first, , open, and, or, close] = alphabet;
  assert.ok(['T', 'F'].includes(first));
  const ordered = sourceFigure(body, 'numeric-enumeration');
  assert.ok(ordered.kind === 'tables');
  const numbers = ordered.tables[0].rows.filter(row => !row.includes('⋮'));
  const expression = ordered.tables[1].rows.filter(row => !row.includes('⋮'));
  assert.deepEqual(numbers.map(row => row.map(digit => alphabet[Number(digit) - 1])), expression);
  verify(body, 'a', value => value === 'MOVE 1 TO NUM-TBL(WK-I)');
  verify(body, 'b', value => value === 'UNTIL WK-I < 1');
  verify(body, 'c', value => value === 'ADD 1 TO NUM-TBL(WK-I)');
  verify(body, 'd', value => [...value.matchAll(/"(.)"/g)].map(match => match[1]).sort().join('') === ['T', 'F', open].sort().join(''));
  verify(body, 'e', value => value === 'ADD 1 TO NEST-LEVEL');
  const modification = sourceFigure(body, 'syntax-check-modifications');
  assert.ok(modification.kind === 'tables');
  const program = modification.tables[0].rows[2][1];
  assert.match(program, /IF NEST-LEVEL < 0 THEN/);
  assert.match(program, /NEST-LEVEL NOT = 0/);
  const syntax = (text: string) => {
    let level = 0, needsValue = true;
    for (const token of text) {
      if (token === open) { if (!needsValue) return false; level++; }
      else if (token === close) { if (needsValue || --level < 0) return false; }
      else if (token === and || token === or) { if (needsValue) return false; needsValue = true; }
      else { if (!needsValue) return false; needsValue = false; }
    }
    return !needsValue && level === 0;
  };
  for (let length = 1; length <= limit; length++) {
    const digits = Array<number>(length).fill(0);
    for (let sequence = 0; sequence < 6 ** length; sequence++) {
      const expression: string = digits.map((digit): string => alphabet[digit]).join('');
      let rank = 0;
      for (const symbol of expression) rank = rank * 6 + alphabet.indexOf(symbol);
      assert.equal(rank, sequence, 'odometer emits each expression once in rank order');
      assert.equal(syntax(expression), grammarCheck(expression, open, close, and, or), expression);
      for (let pos = length - 1; pos >= 0; pos--) {
        if (++digits[pos] < 6) break;
        digits[pos] = 0;
      }
    }
  }
}

function regexMatch(body: GeneratedBody) {
  const meta = table(body, '表1 メタ文字').rows.map(([symbol]) => symbol);
  const [start, any, end] = meta;
  const regex = (pattern: string) => new RegExp([...pattern].map(token =>
    token === start ? '(?<![\\s\\S])' : token === any ? '[\\s\\S]' : token === end ? '(?![\\s\\S])' : '\\u' + token.charCodeAt(0).toString(16).padStart(4, '0')).join(''));
  for (const [pattern, hits, misses] of table(body, '表2 パターン').rows) {
    const regexForRow = regex(JSON.parse(pattern));
    for (const hit of hits.split('，')) assert.ok(regexForRow.test(JSON.parse(hit)), pattern + ' / ' + hit);
    if (misses !== 'なし') for (const miss of misses.split('，')) assert.ok(!regexForRow.test(JSON.parse(miss)), pattern + ' / ' + miss);
  }
  const output = sourceFigure(body, 'matching-output');
  const changed = sourceFigure(body, 'alpha-condition');
  assert.ok(output.kind === 'output' && changed.kind === 'output');
  for (const line of output.text.split('\n')) {
    const [, pattern, result, input] = /^("[^"]*") (matches|doesn't match) ("[^"]*")\.$/.exec(line) ?? [];
    assert.ok(pattern && result && input);
    assert.equal(regex(JSON.parse(pattern)).test(JSON.parse(input)), result === 'matches');
  }
  verify(body, 'a', value => value === 'str.charAt(index) == ch');
  verify(body, 'b', value => value === 'str.length() > index');
  verify(body, 'c', value => value === 'AnyChar()');
  verify(body, 'd', value => value === 'OneChar(c)');
  verify(body, 'e', value => value === 'pattern.matches(str)');
  const [, symbol, boundary] = /c == '(.)' && i == (0|pattern.length\(\) - 1)/.exec(changed.text) ?? [];
  const kind = boundary === '0' ? '先頭' : '末尾';
  assert.equal(symbol, boundary === '0' ? start : end);
  verify(body, '2', value => value.includes("文字'" + symbol + "'") && value.includes(kind + 'にあるときだけメタ文字') &&
    value.endsWith('それ以外のときは，通常文字として扱われる。'));
  assert.equal(programs(body, 'java').length, 7);
}

function casl(body: GeneratedBody) {
  const input = sourceFigure(body, 'three-response-words');
  assert.ok(input.kind === 'tables');
  const rows = input.tables[0].rows;
  const words = rows.map(row => parseInt(row.join(''), 2));
  const columns = Array.from({ length: 16 }, (_, column) => rows.filter(row => row[column] === '1').length);
  const expectedBars = Array.from({ length: Math.max(...columns) }, (_, row) =>
    columns.map(count => count >= Math.max(...columns) - row ? ' * ' : '   ').join(''));
  const source = programs(body, 'casl2').join('\n');
  lineNumbers(source, 60);
  const accepted = Object.fromEntries([...'abcd'].map(field => {
    const { texts, index } = textOptions(body, field);
    return [field, texts[index]];
  }));
  const run = (candidate: Record<string, string>) => runSummary(source.replace(/［([abcd])］/g, (_, field) => candidate[field]), words);
  const { counters, output, counts } = run(accepted);
  const footer = Array.from({ length: 16 }, (_, index) => String(index + 1).padStart(2, '0') + ' ').join('');
  assert.deepEqual(counters, columns);
  assert.deepEqual(output, [...expectedBars, footer]);
  for (const field of 'abcd') verify(body, field, option => {
    try {
      const alternative = run({ ...accepted, [field]: option });
      return JSON.stringify(alternative.counters) === JSON.stringify(columns) &&
        JSON.stringify(alternative.output) === JSON.stringify([...expectedBars, footer]);
    } catch {
      return false;
    }
  });
  const independentShifts = rows.reduce((count, row) => count + row.lastIndexOf('1') + 2, 0);
  const independentStores = columns.filter(value => value > 0).length;
  assert.equal(counts.get(20), independentShifts);
  assert.equal(counts.get(44), independentStores);
  verify(body, 'e', value => Number(value) === independentShifts);
  verify(body, 'f', value => Number(value) === independentStores);
}

for (const [i, draft] of drafts.entries()) {
  test('2008年秋期旧午後問' + (10 + i) + 'の原資料・全候補・独立検算', () => {
    assert.equal(draft.definition.source, '2008h20a-fe-pm-' + (10 + i));
    assert.equal(partsOf(draft.original()).map(part => part.id.slice(5)).join(''), slots[i]);
    assert.equal([...slots[i]].map(slot => kana[textOptions(draft.original(), slot).index]).join(''), official[i]);
    const fields = draft.definition.fields;
    assert.equal(fields.length, 1);
    assert.deepEqual([fields[0].minimum, fields[0].maximum], [0, 3]);
    const bodies = cases.map(value => draft.definition.build([value]));
    const baseline = bodies[0];
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    for (const body of bodies) {
      assert.deepEqual(body.prompt.map(block => block.type), baseline.prompt.map(block => block.type));
      assert.deepEqual([...slots[i]].map(slot => textOptions(body, slot).texts.length), optionsPerSlot[i]);
      assert.ok(body.explanation.length > 100);
      [cipher, cobol, regexMatch, casl][i](body);
    }
    for (const invalid of [[], [-1], [4], [1.5], [0, 1]]) assert.throws(() => draft.definition.build(invalid));
  });
}

test('2008年秋期旧午後問10〜13の図と参照資料の境界・描画契約', () => {
  assert.equal(figures.length, 14);
  assert.equal(new Set(figures.map(figure => figure.profile)).size, figures.length);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const [index, figure] of figures.entries()) {
    const { component } = renderers[index];
    for (const value of cases) {
      figure.validate([value]);
      const panel = figure.panel([value]);
      const html = renderToStaticMarkup(createElement(component, { values: [value], caption: '図の表示' }));
      assert.match(html, /tabindex="0"/);
      const escapedAlt = panel.alt.replace(/[&<>"']/g, symbol =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[symbol]!));
      if (panel.kind === 'cipher-steps') {
        assert.match(html, /<desc id=/);
        assert.ok(html.includes(escapedAlt));
        assert.equal((html.match(/marker-end=/g) ?? []).length, 7);
      } else {
        assert.ok(html.includes('aria-description="' + escapedAlt + '"'));
        assert.match(html, /<table/);
        if (figure.profile.endsWith('-modifications')) assert.match(html, /white-space:pre;text-align:start/);
      }
    }
  }
  const references = drafts.map(draft => draft.definition.fixedReferenceAssetIds ?? []);
  assert.deepEqual(references.map(values => values.length), [0, 0, 1, 6]);
  assert.match(references[2][0], /063$/);
  assert.match(references[3][2], /066-casl-excerpt$/);
  assert.ok(!JSON.stringify(references).includes('066"'));
});
