import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005AutumnPm0609Figures } from '../../../src/core/generators/legacy-2005-autumn-pm-06-09-figures';
import { legacy2005AutumnPm0609FigureRenderers } from '../../../src/ui/Legacy2005AutumnPm0609Figures';
import { autumn2005Pm06To09Specs } from '../../../scripts/legacy-2005-autumn-pm-06-09-specs';
import { assemble, execute, runCobolInserts, scoresFromRows, type Pupil } from '../../fixtures/legacy-2005-autumn-pm-06-09-oracle';

const [cobol, casl] = autumn2005Pm06To09Specs;
const keys = 'アイウエオカキクケコ';
const section = (body: GeneratedBody, name: string) => {
  const part = body.answerParts!.find(candidate => candidate.id === 'part-' + name)!;
  assert(part);
  const options = part.choiceIds.map(id => {
    const content = body.choices[Number(id.split('-').at(-1)) - 1];
    assert.equal(content.length, 1);
    const block = content[0];
    assert(block.type === 'code' || block.type === 'paragraph');
    return block.text;
  });
  const answer = body.partAnswers!.find(candidate => candidate.kind === 'choice' && candidate.partId === part.id)!;
  assert(answer?.kind === 'choice' && answer.choiceId);
  const index = part.choiceIds.indexOf(answer.choiceId);
  assert(index >= 0);
  return { options, correct: options[index], key: keys[index] };
};

for (const [spec, key, pages] of [[cobol, 'カエウア', [29, 30, 31]], [casl, 'イアウコイ', [37, 38, 39]]] as const) {
  test('official key and page positions for Q' + spec.number, () => {
    assert.deepEqual(spec.pages, pages);
    assert.equal([...key].map((_, index) => section(spec.original, 'abcde'[index]).key).join(''), key);
    assert.equal(spec.definition.reference.length, 1);
    assert.equal(spec.definition.reference[0], 0);
    assert.deepEqual(spec.definition.build([0]), spec.original);
  });
}

const conditions = Array.from({ length: 4 }, (_, index) => index);
for (const index of conditions) {
  test('COBOL Q7 all options and synchronized file dimensions, condition ' + index, () => {
    const body = cobol.definition.build([index]);
    const [sourceStart, sourceEnd] = body.prompt.filter(block => block.type === 'code');
    const [input, output] = body.prompt.filter(block => block.type === 'table');
    const prompts = body.prompt.filter(block => block.type === 'paragraph').map(block => block.text).join('\n');
    const maximum = Number(/各科目は(\d+)点/u.exec(prompts)?.[1]);
    const count = [5, 4, 6, 7][index];
    assert.equal(maximum, [100, 80, 120, 90][index]);
    assert.equal(input.columns.length, count + 3);
    const width = (values: string[]) => values.reduce((sum, value) => sum + parseInt(value, 10), 0);
    assert.equal(width(input.rows[0]), 24 + count * 3);
    assert.equal(width(output.rows[0]), 27);
    assert.match(sourceStart.text, new RegExp('PIC X\\(' + width(input.rows[0]) + '\\)'));
    assert.match(sourceStart.text, /PIC X\(27\)/u);
    assert.match(sourceStart.text, new RegExp('OCCURS ' + count + '\\.'));
    assert.match(sourceEnd.text, new RegExp('UNTIL K > ' + count + '\\b'));
    const table = body.prompt.find(block => block.type === 'diagram')!;
    assert(table.type === 'diagram');
    assert.match(table.alt, new RegExp('OCCURS ' + count + '\\.'));
    assert.match(table.alt, new RegExp('UNTIL K > ' + count + '\\b'));
    assert(table.alt.includes('行番号44と45の間に追加\n［c］'));
    assert(table.alt.includes('行番号46の後に追加\n［d］.'));
    assert.match(prompts, /小数第2位以下を切り捨てる/u);

    const rows: Pupil[] = [
      { id: '010100000000000000000001', scores: Array.from({ length: count }, (_, column) => 2 + column) },
      { id: '010200000000000000000002', scores: Array.from({ length: count }, (_, column) => column % 2 ? maximum - column : 0) },
      { id: '010300000000000000000003', scores: Array.from({ length: count }, (_, column) => maximum - column) },
    ];
    const [a, b, c, d] = [...'abcd'].map(name => section(body, name));
    assert.deepEqual([a, b, c, d].map(slot => slot.options.length), [6, 6, 6, 6]);
    const reference = scoresFromRows(rows);
    const solutions: string[][] = [];
    for (const eof of a.options) for (const copy of b.options)
      for (const subtotal of c.options) for (const counter of d.options) {
        const candidate = [eof, copy, subtotal, counter];
        if (isDeepStrictEqual(runCobolInserts(rows, candidate), reference)) solutions.push(candidate);
      }
    assert.deepEqual(solutions, [[a.correct, b.correct, c.correct, d.correct]]);
    assert.deepEqual(runCobolInserts(rows.slice(1, 2), solutions[0]), scoresFromRows(rows.slice(1, 2)));

    const maximumRows = Array.from({ length: 9999 }, (_, i) => ({
      id: String(i + 1).padStart(4, '0') + 'ABCDEFGHIJKLMNOPQRST',
      scores: Array.from({ length: count }, () => maximum),
    }));
    const high = runCobolInserts(maximumRows, solutions[0])!;
    assert.deepEqual(high, scoresFromRows(maximumRows));
    assert.equal(high.records[0].total, maximum * count);
    assert(high.records.every(row => row.total < 1000));
  });

  test('CASL II Q9 instruction and numeric choice uniqueness, condition ' + index, () => {
    const body = casl.definition.build([index]);
    const programs = body.prompt.filter(block => block.type === 'code').map(block => block.text);
    const excerpts = body.contexts!.flatMap(context => context.blocks.map(block => block.type === 'image' && block.assetId));
    assert.deepEqual(excerpts, [62, 63, 64, 65, 66, 67].map(page =>
      'asset-ipa-2005h17a-fe-pm-page-0' + page + (page === 64 ? '-casl-excerpt' : '')));
    const question = body.prompt.find(block => block.type === 'paragraph' && /に #[0-9A-F]{4} を格納/u.test(block.text));
    assert(question?.type === 'paragraph');
    const word = parseInt(/#([\dA-F]{4})/u.exec(question.text)![1], 16);
    assert.equal(word, [0x0555, 0x0003, 0x00b5, 0x035a][index]);
    const [a, b, c, d, e] = [...'abcde'].map(name => section(body, name));
    assert.deepEqual([a, b, c, d, e].map(slot => slot.options.length), [4, 6, 10, 10, 10]);
    const bitCount = (value: number) => [...value.toString(2)].filter(bit => bit === '1').length;
    const samples = [0, 1, 0xffff, 0x8000, 0x5555, 0x1000, 2, word];
    const viable: string[][] = [];
    for (const jump of a.options) for (const mask of b.options) {
      const p1 = assemble(programs[0], jump);
      const p2 = assemble(programs[1], jump, mask);
      if (samples.every(value => {
        const s1 = execute(p1, value), s2 = execute(p2, value);
        return s1?.count === bitCount(value) && s1.markedCount === 16 &&
          s2?.count === bitCount(value) && s2.markedCount === value.toString(2).length;
      })) viable.push([jump, mask]);
    }
    assert.deepEqual(viable, [[a.correct, b.correct]]);
    const program1 = assemble(programs[0], a.correct);
    const program2 = assemble(programs[1], a.correct, b.correct);
    const expectedDiff = execute(program1, word)!.markedCount - execute(program2, word)!.markedCount;
    assert.deepEqual(c.options.filter(option => Number(option) === expectedDiff), [c.correct]);

    const truths = new Uint8Array(65536);
    for (let value = 0; value < truths.length; value++) {
      const first = execute(program1, value)!;
      const second = execute(program2, value)!;
      assert(first.count === bitCount(value) && first.markedCount === 16);
      assert(second.count === bitCount(value) && second.markedCount === value.toString(2).length);
      truths[value] = Number(first.markedCount === second.markedCount);
    }
    const equalConditions: string[][] = [];
    for (const candidateBit of d.options) for (const candidateValue of e.options) {
      const bit = Number(candidateBit), expected = Number(candidateValue);
      if (truths.every((equal, value) => equal === Number((Math.trunc(value / 2 ** bit) % 2) === expected))) {
        equalConditions.push([candidateBit, candidateValue]);
      }
    }
    assert.deepEqual(equalConditions, [[d.correct, e.correct]]);
  });
}

test('all generated figures render their exact reviewed condition and accessible structure', () => {
  const expectedData = ['0011111101011010', '0111001010011101', '0011001101111110', '1001010100111011'];
  for (const [figureIndex, definition] of legacy2005AutumnPm0609Figures.entries()) {
    const renderer = legacy2005AutumnPm0609FigureRenderers.find(entry => entry.profile === definition.profile)!;
    assert(renderer);
    for (const index of conditions) {
      const condition = [index];
      definition.validate?.(condition);
      const caption = '原資料の図表';
      const output = renderToStaticMarkup(createElement(renderer.component, { values: condition, caption }));
      if (figureIndex === 0) {
        assert.match(output, /<th scope="col">位置<\/th>/u);
        assert.match(output, /<th scope="row">行番号46の後に追加<\/th><td><pre[^>]*>［d］\.<\/pre>/u);
      } else {
        const alt = definition.alt(condition);
        assert(alt.includes(expectedData[index]));
        const mask = figureIndex === 1 ? '1000000000000000' : '0000000000000001';
        assert(alt.includes(mask));
        const [, titleId, descId] = /aria-labelledby="([^"]+)" aria-describedby="([^"]+)"/u.exec(output)!;
        assert(output.includes('<title id="' + titleId + '">' + caption + '</title>'));
        assert(output.includes('<desc id="' + descId + '">' + alt + '</desc>'));
        const numbers = [...output.matchAll(/text-anchor="middle"><text[^>]*>(\d+)<\/text><text[^>]*>(\d)<\/text>/gu)];
        assert.equal(numbers.length, 32);
        assert.deepEqual(numbers.slice(0, 16).map(match => Number(match[1])), Array.from({ length: 16 }, (_, bit) => 15 - bit));
        assert.equal(numbers.slice(0, 16).map(match => match[2]).join(''), expectedData[index]);
        assert.equal(numbers.slice(16).map(match => match[2]).join(''), mask);
      }
    }
  }
});
