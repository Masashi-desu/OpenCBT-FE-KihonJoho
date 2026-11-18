import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005SpringPm0609Figures } from '../../../src/core/generators/legacy-2005-spring-pm-06-09-figures';
import { legacy2005SpringPm0609FigureRenderers } from '../../../src/ui/Legacy2005SpringPm0609Figures';
import { spring2005Pm06To09Specs } from '../../../scripts/legacy-2005-spring-pm-06-09-specs';
import { aggregate, assemble, compareInventory, crossTab, runCasl, writeRecordLines,
  type SurveyRecord } from '../../fixtures/legacy-2005-spring-pm-06-09-oracle';

const [cobol, casl] = spring2005Pm06To09Specs;
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

function figureAlt(body: GeneratedBody, suffix: string): string {
  const diagram = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile.endsWith(suffix));
  assert(diagram?.type === 'diagram');
  return diagram.alt;
}

for (const [spec, fields, key, pages] of [
  [cobol, 'abcs', 'ウコアオ', [27, 28, 29, 30]],
  [casl, 'abs', 'オアウ', [35, 36]],
] as const) {
  test('公式原頁・解答番号・基準条件を固定する 問' + spec.number, () => {
    assert.deepEqual(spec.pages, pages);
    assert.equal([...fields].map(field => bank(spec.original, field).key).join(''), key);
    assert.equal(bank(spec.original, 's').label, '設問2');
    assert.deepEqual(spec.definition.build([0]), spec.original);
    assert.deepEqual(spec.definition.reference, [0]);
    for (const values of [[], [0, 1], [3.5], [-1], [4], [NaN], Array(1)])
      assert.throws(() => spec.definition.build(values), { code: 'PARAMETER_CONSTRAINT' });
  });
}

for (const condition of conditions) {
  test('問7 条件' + condition + ' 全ての送り行数・命令・集計軸', () => {
    const body = cobol.definition.build([condition]);
    const [codeStart, codeEnd] = body.prompt.filter(block => block.type === 'code');
    assert.equal(codeStart.language, 'cobol');
    const n = [4, 3, 5, 6][condition];
    assert.match(codeStart.text, new RegExp('OCCURS ' + n + ' INDEXED BY X'));
    assert.match(codeStart.text, new RegExp('OCCURS ' + n + ' INDEXED BY Y'));
    assert.match(codeStart.text, new RegExp('OCCURS ' + (n + 1) + ' INDEXED BY Z'));
    assert.match(codeEnd.text, new RegExp('GOKEI TO NINZUU\\(' + (n + 1) + '\\)'));
    assert.match(codeStart.text, /PIC X\(97\)/u);
    assert.match(codeStart.text, /NINZUU +PIC ZZZ,ZZ9/u);
    const form = figureAlt(body, '7-age-form');
    const firstRow = Number(/(\d+)行目は10代/u.exec(form)![1]);
    assert.equal(firstRow, [6, 5, 7, 4][condition]);
    assert(form.includes((firstRow + 2 * (n - 1)) + '行目はその他'));
    assert(figureAlt(body, '7-purpose-form').includes('人数の印字欄は空白'));
    const rows: SurveyRecord[] = [
      [1, 2, 3, 3], [2, 3, 1, 4], [3, 1, 2, 7], [1, 3, 3, 2], [n, n, 1, 6],
      [1, 1, n, 8], [n, 2, n, 9], [2, 2, 3, 1],
    ];
    const [, first, second] = /^\s*(COMPUTE B\(.+?\))\s+← α\n\s+(= B\(.+?\) \+ 1)$/mu.exec(codeStart.text)!;
    const originalAggregation = first + ' ' + second;
    const original = aggregate(rows, n, originalAggregation);
    const originalReference = crossTab(rows, n, 0, 1);
    const lines = originalReference.map((columns, index) => ({ columns, line: firstRow + index * 2 }));
    const [a, b, c, s] = [...'abcs'].map(field => bank(body, field));
    assert.deepEqual([a, b, c, s].map(field => field.choices.length), [4, 10, 10, 6]);
    const solutions: string[][] = [];
    for (const advance of a.choices) for (const column of b.choices) for (const sum of c.choices) {
      if (isDeepStrictEqual(writeRecordLines(original, Number(advance), column, sum), lines))
        solutions.push([advance, column, sum]);
    }
    assert.deepEqual(solutions, [[a.answer, b.answer, c.answer]]);
    const purpose = crossTab(rows, n, 1, 2).map(row => row.slice(0, -1));
    assert.deepEqual(s.choices.filter(choice => isDeepStrictEqual(aggregate(rows, n, choice), purpose)), [s.answer]);
    const maximum: SurveyRecord[] = [[n, n, n, 999999]];
    const atLimit = writeRecordLines(aggregate(maximum, n, originalAggregation), Number(a.answer), b.answer, c.answer);
    assert.deepEqual(atLimit?.at(-1)?.columns, crossTab(maximum, n, 0, 1).at(-1));
    assert.equal(10 + 11 * (n + 1) <= 100, true);
  });

  test('問9 条件' + condition + ' CASL IIの全空欄、在庫量、行20を検算', () => {
    const body = casl.definition.build([condition]);
    const program = body.prompt.filter(block => block.type === 'code').map(block => block.text).join('\n');
    assert.equal(program.split('\n').length, 25);
    assert.match(program, /20  RTSET\s+LAD\s+GR4,-1,GR5/u);
    const stock = figureAlt(body, '9-stock-example');
    const [, indexText, inventory] = /^GR1は (\d+)。.*1語ずつ (.*)。$/u.exec(stock)!;
    const key = Number(indexText), cells = inventory.split('｜').map(Number);
    assert.equal(cells.length, 2 * cells[0] + 1);
    assert.equal(key, [2, 16, 6, 1][condition]);
    assert(cells.slice(3).every((number, index) => index % 2 || number > cells[index + 1]));
    const [a, b, s] = [...'abs'].map(field => bank(body, field));
    assert.deepEqual([a, b, s].map(field => field.choices.length), [5, 6, 7]);
    const groups = [
      { cells, keys: [0, 1, 2, 3, 6, 7, 8, 13, 16, 20, 25, 28, 53] },
      { cells: [0], keys: [0, 1, 32767] },
      { cells: [1, 0, 0], keys: [0, 1, 32767] },
      { cells: [5, 1, 17, 2, 48, 5, 8, 6, 59, 42, 17], keys: [0, 1, 2, 3, 5, 6, 41, 42, 43] },
    ];
    const solutions: string[][] = [];
    for (const middle of a.choices) for (const next of b.choices) {
      const candidate = assemble(program, middle, next);
      if (groups.every(group => group.keys.every(key =>
        isDeepStrictEqual(runCasl(candidate, key, group.cells), compareInventory(group.cells, key))))) solutions.push([middle, next]);
    }
    assert.deepEqual(solutions, [[a.answer, b.answer]]);
    const candidate = assemble(program, a.answer, b.answer);
    const actual = runCasl(candidate, key, cells)!;
    assert.equal(actual.rightUpdates, [2, 0, 1, 3][condition]);
    assert.deepEqual(s.choices.filter(choice => Number(choice) === actual.rightUpdates), [s.answer]);
    const references = body.contexts!.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : []));
    assert.deepEqual(references, [61, 62, 63, 64, 65, 66].map(page =>
      'asset-ipa-2005h17h-fe-pm-page-0' + page + (page === 63 ? '-casl-excerpt' : '')));
  });
}

test('問9 在庫表の先頭番地と16ビット有効範囲に近い上限を確認', () => {
  const body = casl.original;
  const program = body.prompt.filter(block => block.type === 'code').map(block => block.text).join('\n');
  const candidate = assemble(program, bank(body, 'a').answer, bank(body, 'b').answer);
  const nearFull = [32700, ...Array.from({ length: 32700 }, (_, key) => [key, key % 173]).flat()];
  assert(64 + nearFull.length - 1 < 65536);
  for (const key of [0, 1, 63, 128, 1280, 16350, 32699, 32700, 32767]) {
    assert.deepEqual(runCasl(candidate, key, nearFull, 64), compareInventory(nearFull, key));
    assert.deepEqual(runCasl(candidate, key, [1, 3, 16], 0), compareInventory([1, 3, 16], key));
  }
});

test('各図表条件のアクセシブルな構造と紙面にある値を維持する', () => {
  for (const [index, definition] of legacy2005SpringPm0609Figures.entries()) {
    const renderer = legacy2005SpringPm0609FigureRenderers.find(item => item.profile === definition.profile);
    assert(renderer);
    for (const condition of conditions) {
      const value = [condition];
      definition.validate?.(value);
      const caption = '公式資料をもとに再描画';
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption, values: value }));
      if (index < 2) {
        assert(markup.includes('<table') && markup.includes('scope="col"') && markup.includes('scope="row"'));
        if (index === 0) assert.match(markup, /zzz,zz9/u);
      } else {
        const [, title, desc] = /aria-labelledby="([^"]+)" aria-describedby="([^"]+)"/u.exec(markup)!;
        assert(markup.includes('<title id="' + title + '">' + caption + '</title>'));
        assert(markup.includes('<desc id="' + desc + '">' + definition.alt(value) + '</desc>'));
      }
    }
  }
});
