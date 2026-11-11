import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { autumn2015Pm09To13Specs as specs } from '../../../scripts/legacy-2015-autumn-pm-09-13-specs';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { autumn2015Pm9Examples } from '../../../src/core/generators/legacy-2015-autumn-pm-9';
import { autumn2015Pm10Examples, autumn2015Pm10Survey } from '../../../src/core/generators/legacy-2015-autumn-pm-10';
import { autumn2015Pm11Condition } from '../../../src/core/generators/legacy-2015-autumn-pm-11';
import { autumn2015Pm12Condition } from '../../../src/core/generators/legacy-2015-autumn-pm-12';
import { autumn2015Pm13Model, autumn2015Pm13Panel } from '../../../src/core/generators/legacy-2015-autumn-pm-13';
import { legacy2015AutumnPm0913Figures } from '../../../src/core/generators/legacy-2015-autumn-pm-09-13-figures';
import { legacy2015AutumnPm0913FigureRenderers } from '../../../src/ui/Legacy2015AutumnPm0913Figures';
import {
  accessOutput, cSource, cobolHistogramChoice, codeParts, compileC, fill, groupedRatings, insertBits, javaRun,
  macroMinCondition, macroReduction, readCLog, runCasl, stockOracle, temporary, traceCobolGroups,
} from '../../fixtures/legacy-2015-autumn-pm-09-13-reference';
import review from '../../fixtures/legacy-2015-autumn-pm-09-13-review.json';

const body = (q: number, i = 0) => specs[q - 9].definition.build([i]);
const textOf = (block: GeneratedBody['prompt'][number]) => {
  if ('text' in block) return block.text;
  if (block.type === 'diagram') return block.alt;
  return '';
};
const choices = (item: GeneratedBody, n: number) => item.answerParts![n].choiceIds.map(id =>
  item.choices[Number(id.replace('choice-value-', '')) - 1].map(textOf).join('\n'));
const correctIndex = (item: GeneratedBody, n: number) => {
  const answer = item.partAnswers![n];
  assert.equal(answer.kind, 'choice');
  return item.answerParts![n].choiceIds.indexOf(answer.choiceId);
};
const correct = (item: GeneratedBody) => item.answerParts!.map((_, n) => choices(item, n)[correctIndex(item, n)]);
const count = (q: number) => specs[q - 9].definition.fields[0].maximum + 1;
function mutations(item: GeneratedBody, fields: number[], accepts: (answers: string[]) => boolean) {
  const selected = correct(item);
  for (const field of fields) {
    for (const candidate of choices(item, field)) {
      const answers = selected.map((answer, index) => field === index ? candidate : answer);
      assert.equal(accepts(answers), candidate === selected[field], JSON.stringify({ field, candidate }));
    }
  }
}

test('2015秋 午後問9〜13の31頁・34欄・44条件・言語別資料を照合する', () => {
  const assets = [
    [], [], [], [73, 74, 75, 76, 77, 78], [3, 4, 79, 80, 81, 82, 83, 84],
  ].map(pages => pages.map(page => 'asset-ipa-2015h27a-fe-pm-p' + String(page).padStart(3, '0') + (page === 75 ? '-casl-excerpt' : '')));
  let conditions = 0;
  for (const [i, spec] of specs.entries()) {
    const audited = review.questions[i];
    const q = spec.number;
    assert.equal(q, audited.number);
    assert.deepEqual(spec.pages, audited.pages);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), audited.pages);
    assert.equal(createHash('sha256').update(JSON.stringify(spec.originalPageAlt)).digest('hex'), audited.originalPageAltSHA256);
    assert(spec.pages.every(page => spec.originalPageAlt[page].length > 100 && spec.originalPageAlt[page].length <= 2000));
    assert.equal(spec.original.partAnswers!.map((_, index) => 'アイウエオカキク'[correctIndex(spec.original, index)]).join(''), audited.key);
    assert.equal(count(q), audited.finiteConditions);
    assert.equal(spec.definition.answerVariation, [9, 11, 13].includes(q) ? 'fixed' : undefined);
    const visible = new Set<string>();
    for (let k = 0; k < count(q); k++) {
      const item = body(q, k);
      visible.add(item.prompt.map(textOf).join('\n'));
      assert.deepEqual(item.answerParts!.map(part => part.choiceIds.length), audited.bankSizes);
      for (const [field, size] of audited.bankSizes.entries()) assert.equal(new Set(choices(item, field)).size, size);
      assert.deepEqual(item.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])) ?? [], assets[i]);
      assert.deepEqual(spec.definition.fixedReferenceAssetIds ?? [], assets[i]);
      conditions++;
    }
    assert.equal(visible.size, count(q));
    for (const invalid of [[], [count(q)], [-1], [0.5], Array(1), [0, 1]]) assert.throws(() => spec.definition.build(invalid));
  }
  assert.equal(conditions, 44);
  assert.equal(specs[2].editorialContextTitles?.length, 1);
  assert.match(body(11).contexts![0].title, /編集資料/);
});

test('2015秋 問9の全条件・全選択肢を独立状態機械と表示Cコードで検算する', () => temporary('s3-006-c-', folder => {
  const original = body(9);
  const selected = correct(original);
  const inputs = Array.from({ length: count(9) }, (_, index) => {
    const { normal, missing } = autumn2015Pm9Examples(index);
    for (const row of [...normal.input, ...missing.input]) assert.equal(row.join('').length, 32);
    assert.deepEqual(normal.output, accessOutput(normal.input, false).output);
    assert.deepEqual(missing.output, accessOutput(missing.input, true).output);
    return [...normal.input, ...missing.input].sort(([a, dateA, timeA], [b, dateB, timeB]) =>
      (a + dateA + timeA).localeCompare(b + dateB + timeB));
  });
  assert.equal(compileC(folder, cSource(original, selected, false)), true);
  for (let i = 0; i < count(9); i++) {
    const rows = autumn2015Pm9Examples(i).normal.input;
    assert.equal(readCLog(folder, rows), accessOutput(rows, false).stdout);
  }
  mutations(original, [0, 1, 2, 3, 4, 5, 6], answers => {
    if (!compileC(folder, cSource(original, answers, true))) return false;
    return [...inputs, []].every(records => readCLog(folder, records) === accessOutput(records, true).stdout);
  });
}));

test('2015秋 問10の数値編集・集計・整列・改行と全選択肢を独立照合する', () => {
  for (let k = 0; k < count(10); k++) {
    const item = body(10, k), { starUnit, rowLimit, responses } = autumn2015Pm10Survey(k);
    const { histogram, totals } = autumn2015Pm10Examples(k);
    assert.match(codeParts(item, 'cobol')[1], new RegExp('BY ' + starUnit + ' GIVING'));
    const change = item.prompt.find(block => block.type === 'diagram' && block.caption.startsWith('表1'));
    assert(change?.type === 'diagram');
    assert.match(change.alt, new RegExp('OCCURS ' + rowLimit));
    for (const [itemNumber, { rows }] of histogram.entries()) {
      assert.equal(rows.reduce((sum, { count }) => sum + count, 0), 1000);
      for (const { rating, count, stars } of rows) {
        assert.equal(stars, Math.trunc(count / starUnit));
        if (k > 0) assert.equal(count, responses.reduce((sum, { marks }) => sum + Number(marks[itemNumber] === rating), 0));
      }
    }
    for (const row of totals) if ('ids' in row) assert.ok(row.ids.length <= rowLimit);
    const reversed = responses.slice().reverse();
    const expected = groupedRatings(reversed, rowLimit);
    for (const field of [0, 1, 2, 3]) {
      assert.deepEqual(choices(item, field).filter(candidate => cobolHistogramChoice(field, candidate)), [correct(item)[field]]);
    }
    mutations(item, [4, 5, 6], answers => {
      const result = traceCobolGroups(reversed, answers[4], answers[5], answers[6], rowLimit);
      return JSON.stringify(result) === JSON.stringify(expected);
    });
    if (k > 0) {
      const lastGroup = expected.map(row => row.score !== null).lastIndexOf(true);
      assert.deepEqual(totals, [...expected.slice(0, 10), { omitted: '（中略）' }, ...expected.slice(lastGroup)]);
    }
  }
});

test('2015秋 問11のJava 8互換コードと全選択肢をFIFO/LRUと複製の独立参照で検算する', () => temporary('s3-006-java-', folder => {
  for (let k = 0; k < count(11); k++) {
    const item = body(11, k), { blockCount, blockSize, capacity } = autumn2015Pm11Condition(k);
    const [ , device, , cache ] = codeParts(item, 'java');
    assert.match(device, new RegExp('new byte\\[' + blockCount + '\\]\\[' + blockSize + '\\]'));
    assert.match(cache, new RegExp('CACHE_SIZE = ' + capacity));
    assert(javaRun(folder, item, correct(item), blockCount, blockSize, capacity));
  }
  const item = body(11);
  mutations(item, [0, 1, 2, 3, 4, 5, 6], answers => javaRun(folder, item, answers, 100, 512, 20));
}));

test('2015秋 問12のCASL II全条件・全選択肢をビット文字列の分割と独立照合する', () => {
  const signatures = new Set<string>();
  const values = [0xef18, 0x7a09, 0x315c, 0x9002];
  for (let k = 0; k < count(12); k++) {
    const item = body(12, k), { a, b, n } = autumn2015Pm12Condition(k);
    const [first, second] = codeParts(item, 'casl2');
    const selected = correct(item);
    const program = fill(first, selected) + '\n' + fill(second, selected);
    const original = runCasl(program, 'BITINS', a, [b], n);
    assert.deepEqual(original.output, insertBits([b], a, n));
    const [gr4, gr5] = original.beforeOr[0];
    for (const [field, target] of [[2, gr4], [3, gr5]]) {
      const matching = choices(item, field).filter(candidate => Number.parseInt(candidate.replaceAll(' ', ''), 2) === target);
      assert.deepEqual(matching, [selected[field]]);
    }
    signatures.add(String(gr4) + ':' + gr5);
    for (let length = 1; length <= values.length; length++) {
      const words = values.slice(0, length);
      for (let offset = 0; offset <= 16 * length; offset++) {
        assert.deepEqual(runCasl(program, 'BITINSL', a, words, offset).output, insertBits(words, a, offset));
      }
    }
    assert.match(item.prompt.map(textOf).join('\n'), new RegExp('nが' + n + 'で'));
  }
  assert.equal(signatures.size, count(12));
  const item = body(12), [first, second] = codeParts(item, 'casl2');
  mutations(item, [0, 1, 4, 5], answers => {
    const program = fill(first, answers) + '\n' + fill(second, answers);
    try {
      return [0, 1, 9, 10, 15, 16, 17, 21, 32, 47, 64].every(n =>
        JSON.stringify(runCasl(program, 'BITINSL', 0x5e96, values, n).output) === JSON.stringify(insertBits(values, 0x5e96, n)));
    } catch { return false; }
  });
});

test('2015秋 問13の表・複写式・マクロの全条件と全選択肢を検算する', () => {
  for (let k = 0; k < count(13); k++) {
    const item = body(13, k);
    const { products, sets, lines, subtotal, discount, total, amounts } = autumn2015Pm13Model(k);
    const independent = stockOracle(lines, sets);
    assert.deepEqual(amounts, independent.amounts);
    assert.equal(subtotal, lines.reduce((sum, line) => sum + products.find(product => product.id === line.product)!.unitPrice * line.quantity, 0));
    assert.equal(discount, independent.amounts.reduce((sum, amount, i) => sum + sets[i].discount * amount, 0));
    assert.equal(total, subtotal + discount);
    const table = autumn2015Pm13Panel('invoice-sheet', k);
    assert.equal(table.kind, 'worksheet');
    assert.deepEqual(table.sheet.rows.slice(0, 3).map(row => Number(row[5].replaceAll(',', ''))), [subtotal, discount, total]);
    const range = (reference: string) => {
      const match = /^価格表!([A-D])\$2:([A-D])\$51$/.exec(reference);
      assert(match);
      return [match[1], match[2]];
    };
    const productRows = products.map(product => [product.id, product.name, product.code, product.unitPrice]);
    const correctChoices = correct(item);
    const matches = [
      (choice: string) => {
        const [reference, col] = choice.split(', ');
        const [start, end] = range(reference).map(letter => 'ABCD'.indexOf(letter));
        return products.every(product => {
          const result = productRows.find(row => row[start] === product.name);
          const position = start + Number(col) - 1;
          return position <= end && result?.[position] === product.unitPrice;
        });
      },
      (choice: string) => {
        const match = /^セット値引き表!([AI])(\$?)3$/.exec(choice);
        assert(match);
        return sets.every((set, i) => {
          const target = match[2] ? 0 : i;
          const value = match[1] === 'I' ? sets[target].discount : target + 1;
          return value === set.discount;
        });
      },
      (choice: string) => products.every(product =>
        productRows.find(row => row['ABCD'.indexOf(range(choice)[0])] === product.code)?.[0] === product.id),
      (choice: string) => products.every((product, i) => productRows[i]['ABCD'.indexOf(range(choice)[0])] === product.id),
      (choice: string) => {
        const col = /^相対\(価格表!([ABC])2, I, 0\)$/.exec(choice);
        const fixed = /^価格表!([ABC])2$/.exec(choice);
        assert(col || fixed);
        return products.every((product, i) => productRows[fixed ? 0 : i]['ABC'.indexOf((col ?? fixed)![1])] === product.name);
      },
      (choice: string) => [0, 1, 2, 5].every(current => [0, 1, 2, 5].every(value =>
        (macroMinCondition(choice, value, current) ? value : current) === Math.min(value, current))),
      (choice: string) => [[4, 2, 2], [6, 1, 3], [7, 3, 1]].every(([quantity, required, setCount]) =>
        macroReduction(choice, quantity, required, setCount) === quantity - Array(setCount).fill(required).reduce((sum, item) => sum + item, 0)),
    ];
    for (const [field, match] of matches.entries()) {
      assert.deepEqual(choices(item, field).filter(match), [correctChoices[field]]);
    }
    if (k === 0) {
      assert.deepEqual([subtotal, discount, total], [249710, -15500, 234210]);
      assert.deepEqual(amounts, [2, 0, 0, 0, 0, 0, 1, 1, 0, 0]);
    }
  }
});

test('2015秋 問9〜13の全図プロファイルを表示し、表計算のM列まで保持する', () => {
  assert.equal(legacy2015AutumnPm0913Figures.length, 18);
  for (const [index, figure] of legacy2015AutumnPm0913Figures.entries()) {
    const renderer = legacy2015AutumnPm0913FigureRenderers[index];
    assert.equal(renderer.profile, figure.profile);
    for (const sample of new Set([0, figure.domain[0][1]])) {
      const values = [sample];
      figure.validate(values);
      const question = Number(figure.profile.match(/-pm-(\d+)-/)![1]);
      const block = body(question, sample).prompt.find(block => block.type === 'diagram' &&
        block.scene.kind === 'source_figure' && block.scene.profile === figure.profile);
      assert(block?.type === 'diagram');
      assert.equal(figure.alt(values), block.alt);
      const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
      assert.match(markup, /<figcaption>/);
      if (figure.profile.endsWith('set-sheet')) {
        assert.match(markup, /data-sheet-columns="13"/);
        assert.match(markup, />M<\/th>/);
        assert.match(markup, /rowSpan="2"/i);
      }
    }
  }
});
