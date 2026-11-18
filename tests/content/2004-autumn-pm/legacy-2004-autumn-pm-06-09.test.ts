import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2004AutumnPm0609Figures } from '../../../src/core/generators/legacy-2004-autumn-pm-06-09-figures';
import { legacy2004AutumnPm0609FigureRenderers } from '../../../src/ui/Legacy2004AutumnPm0609Figures';
import { autumn2004Pm06To09Specs } from '../../../scripts/legacy-2004-autumn-pm-06-09-specs';
import { printCourseRecords, referencePrint, assemble, emulate, referenceSpace } from '../../fixtures/legacy-2004-autumn-pm-06-09-oracle';

const [cobol, java, casl] = autumn2004Pm06To09Specs;
const symbols = 'アイウエオカキクケコ';
const conditions = [0, 1, 2, 3];
function bank(body: GeneratedBody, field: string) {
  const part = body.answerParts!.find(item => item.id === 'part-' + field);
  assert(part);
  const choices = part.choiceIds.map(id => {
    const [block] = body.choices[Number(id.split('-').at(-1)) - 1];
    assert(block.type === 'code' || block.type === 'paragraph');
    return block.text;
  });
  const answer = body.partAnswers!.find(item => item.kind === 'choice' && item.partId === part.id);
  assert(answer?.kind === 'choice' && answer.choiceId);
  const correct = part.choiceIds.indexOf(answer.choiceId);
  return { choices, answer: choices[correct], key: symbols[correct], label: part.label };
}

function codeFor(body: GeneratedBody, language: string): string[] {
  return body.prompt.flatMap(block => block.type === 'code' && block.language === language ? [block.text] : []);
}

for (const [spec, roles, key, pages] of [
  [cobol, 'abc', 'オオオ', [26, 27, 28]], [java, 'abcd', 'エエイエ', [29, 30, 31, 32]], [casl, 'abc', 'イウエ', [33, 34]],
] as const) {
  test('公式原頁・解答群・基準条件を固定する 問' + spec.number, () => {
    assert.deepEqual(spec.pages, pages);
    assert.equal([...roles].map(field => bank(spec.original, field).key).join(''), key);
    assert.deepEqual(spec.definition.build([0]), spec.original);
    assert.deepEqual(spec.definition.reference, [0]);
    assert.equal(spec.definition.answerVariation, 'fixed');
    for (const values of [[], [0, 1], [3.5], [-1], [4], [NaN], Array(1)])
      assert.throws(() => spec.definition.build(values), { code: 'PARAMETER_CONSTRAINT' });
  });
}

for (const condition of conditions) {
  test('問7 条件' + condition + ' 研修番号の集計と解答群を全組照合する', () => {
    const body = cobol.definition.build([condition]);
    const [storage, printing] = codeFor(body, 'cobol');
    const declaration = /KEN-W2\s+PIC\s+X\(0(\d)\) VALUE "([A-Z]+)"/.exec(storage);
    assert(declaration);
    const [, n, types] = declaration;
    const sessions = Number(/SU-WK\s+PIC\s+9\(03\) OCCURS (\d+)/.exec(storage)?.[1]);
    assert.deepEqual([types, sessions], [['ABCDEFGH', 20], ['BCDEFG', 18], ['ACDFGH', 23], ['JLMNPRST', 15]][condition]);
    assert.equal(Number(n), types.length);
    assert.match(storage, new RegExp('OCCURS ' + n + ' INDEXED BY KEN'));
    assert.match(storage, new RegExp('02  OCCURS ' + n + '\\.'));
    assert.match(printing, new RegExp('LOOP1 > ' + n + '\\n'));
    assert.match(printing, new RegExp('LOOP2 > ' + sessions + '\\n'));
    assert.match(storage, /KEN-N-M PIC  X\(01\).*\n.*KEN-K-M PIC  9\(02\)/);
    assert.match(printing, /IF \[c\] NOT = 0 THEN\n.*\n.*\n\s*MOVE \[c\] TO SU-S/);
    const printedTemplate = codeFor(body, 'text')[0];
    const header = printedTemplate.split('\n')[0];
    assert.match(storage, new RegExp('PIC  X\\(21\\) VALUE "' + header + '"'));
    assert.equal([...header].length, 21);
    const a = bank(body, 'a'), b = bank(body, 'b'), c = bank(body, 'c');
    assert.deepEqual([a.choices.length, b.choices.length, c.choices.length], [9, 6, 6]);
    const encode = (course: string, i: number) => String(i).padStart(5, '0') + course + ' '.repeat(42);
    const rows = [types.at(-1) + String(sessions).padStart(2, '0'), types[0] + '02', types[2] + '04', types[0] + '02', types[1] + '01'].map(encode);
    const expected = referencePrint(rows, types, header);
    const solutions: string[][] = [];
    for (const reset of a.choices) for (const searched of b.choices) for (const printed of c.choices) {
      if (isDeepStrictEqual(printCourseRecords(rows, types, sessions, header, reset, searched, printed), expected))
        solutions.push([reset, searched, printed]);
    }
    assert.deepEqual(solutions, [[a.answer, b.answer, c.answer]]);
    const max = Array<string>(999).fill(types.at(-1) + String(sessions).padStart(2, '0')).map(encode);
    assert.deepEqual(printCourseRecords(max, types, sessions, header, a.answer, b.answer, c.answer), referencePrint(max, types, header));
    assert.deepEqual(printCourseRecords([], types, sessions, header, a.answer, b.answer, c.answer), [header]);
    assert.match(body.explanation, new RegExp('01～' + sessions));
  });

  test('問8 条件' + condition + ' 容量、FIFO・LIFO、共通型の全肢を検算する', () => {
    const body = java.definition.build([condition]);
    const blocks = codeFor(body, 'java').filter(text => text.includes('{'));
    assert.equal(blocks.length, 5);
    const cap = Number(/new Object\[(\d+)\]/.exec(blocks[0])?.[1]);
    assert.equal(cap, [50, 8, 16, 32][condition]);
    const capacityText = body.prompt.find(block => block.type === 'paragraph' && block.text.includes('個数の上限'));
    assert(capacityText?.type === 'paragraph');
    assert.match(capacityText.text, new RegExp('個数の上限は' + cap));
    const flags = codeFor(body, 'text')[0].split('\n');
    const args = flags[0].split(' ').slice(3);
    const logLine = (values: readonly string[]) => values.map((value, i) => i + ': ' + value).join(' ');
    assert.equal(flags[1], logLine(args));
    assert.equal(flags[2], logLine(args.reduce<string[]>((all, value) => [value, ...all], [])));

    const a = bank(body, 'a'), b = bank(body, 'b'), c = bank(body, 'c'), d = bank(body, 'd');
    const positions = Array.from({ length: cap + 1 }, (_, i) => i);
    const putClauses: Record<string, (n: number) => boolean> = {
      'index < data.length': n => n < cap, 'index <= data.length': n => n <= cap,
      'index > data.length': n => n > cap, 'index >= data.length': n => n >= cap,
      'index + 1 >= data.length': n => n + 1 >= cap,
    };
    assert.deepEqual(a.choices.filter(choice => positions.every(n => putClauses[choice](n) === (n === cap))), [a.answer]);
    const sizeClauses: Record<string, (n: number) => number> = {
      'data.length': () => cap, 'data.length - 1': () => cap - 1, 'data.length - index': n => cap - n, index: n => n, 'index + 1': n => n + 1,
    };
    assert.deepEqual(b.choices.filter(choice => positions.every(n => sizeClauses[choice](n) === n)), [b.answer]);
    assert.match(blocks[1], /Object value = data\[0\];\n\s+for \(\[c\]\)/);
    assert.match(blocks[2], /data\[--index\].*\n\s+data\[index\] = null;/);
    for (const branch of c.choices) {
      const loop = /^int i = ([01]); i < index(?: - ([12]))?; i\+\+$/.exec(branch);
      assert(loop);
      const matches = positions.slice(1).every(size => {
        const expected = Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));
        const elements = [...expected, ...Array<null>(cap - size).fill(null)];
        for (let i = Number(loop[1]); i < size - Number(loop[2] ?? 0); i++) {
          if (i + 1 >= cap) return false;
          elements[i] = elements[i + 1];
        }
        elements[size - 1] = null;
        return isDeepStrictEqual(elements.slice(0, size - 1), expected.slice(1));
      });
      assert.equal(matches, branch === c.answer, branch);
    }
    const subtype: Record<string, string[]> = { FifoStore: ['FifoStore', 'Store', 'Object'], LifoStore: ['LifoStore', 'Store', 'Object'] };
    const hasMethods = ['FifoStore', 'LifoStore', 'Store'];
    assert.deepEqual(d.choices.filter(choice => hasMethods.includes(choice) &&
      ['FifoStore', 'LifoStore'].every(type => subtype[type].includes(choice))), [d.answer]);
    assert.match(blocks[3], /int size = store\.size\(\)/);
    assert.match(blocks[3], /store\.get\(\)/);
    assert.equal(args.length <= cap, true);
  });

  test('問9 条件' + condition + ' 空白圧縮の全肢、例とレジスタ復元を命令レベルで照合する', () => {
    const body = casl.definition.build([condition]);
    const program = codeFor(body, 'casl2').join('\n');
    const image = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
      block.scene.profile.endsWith('9-space-example'));
    assert(image?.type === 'diagram');
    const example = /実行前は先頭語が(\d+)で、([^。]+)。実行後は先頭語が(\d+)で、([^。]+)。/.exec(image.alt);
    assert(example);
    const decoded = (line: string) => line.split('，').map(char => char === '空白' ? ' ' : char).join('');
    const exampleInput = decoded(example[2]), exampleOutput = decoded(example[4]);
    assert.equal(exampleInput, [' I   AM A  BOY.', '  A  B   ', '        ', 'AA B  CC'][condition]);
    assert.deepEqual([Number(example[1]), Number(example[3])], [exampleInput.length, exampleOutput.length]);
    assert.equal(referenceSpace(exampleInput).output, exampleOutput);
    assert.match(casl.originalPageAlt[33], /正の文字列長/);
    const a = bank(body, 'a'), b = bank(body, 'b'), c = bank(body, 'c');
    assert.deepEqual([a.choices.length, b.choices.length, c.choices.length], [5, 6, 4]);
    let cases = [''];
    const exhaustive: string[] = [];
    for (let length = 1; length <= 6; length++) {
      cases = cases.flatMap(prefix => [' ', 'A', 'B'].map(ch => prefix + ch));
      exhaustive.push(...cases);
    }
    const samples = [exampleInput, 'ABC', ' A ', 'A   ', '  ', 'A', ...exhaustive];
    const solutions: string[][] = [];
    for (const offset of a.choices) for (const jump of b.choices) for (const flag of c.choices) {
      const parsed = assemble(program, { a: offset, b: jump, c: flag });
      if (samples.every(input => isDeepStrictEqual(emulate(parsed, input), referenceSpace(input)))) solutions.push([offset, jump, flag]);
    }
    assert.deepEqual(solutions, [[a.answer, b.answer, c.answer]]);
    const selected = assemble(program, { a: a.answer, b: b.answer, c: c.answer });
    assert.deepEqual(emulate(selected, exampleInput, 32760), referenceSpace(exampleInput));
    assert.match(body.explanation, new RegExp('実行例では' + exampleOutput.length));
    assert.deepEqual(body.contexts!.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])),
      [58, 59, 60, 61, 62, 63].map(page => 'asset-ipa-2004h16a-fe-pm-page-0' + page + (page === 60 ? '-casl-excerpt' : '')));
  });
}

test('SVGのプロファイルは一対一で全条件に見出し・代替説明を表示する', () => {
  assert.equal(legacy2004AutumnPm0609Figures.length, 3);
  assert.deepEqual(legacy2004AutumnPm0609Figures.map(figure => figure.profile), legacy2004AutumnPm0609FigureRenderers.map(renderer => renderer.profile));
  for (const [index, renderer] of legacy2004AutumnPm0609FigureRenderers.entries()) {
    const figure = legacy2004AutumnPm0609Figures[index];
    for (const condition of conditions) {
      const html = renderToStaticMarkup(createElement(renderer.component, { values: [condition], caption: '作図の表題' }));
      assert.match(html, /<title[^>]*>作図の表題<\/title>/);
      assert(html.includes(figure.alt([condition])));
      assert.match(html, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
    }
  }
});
