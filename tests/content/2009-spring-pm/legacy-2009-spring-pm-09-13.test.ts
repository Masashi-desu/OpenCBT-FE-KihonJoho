import assert from 'node:assert/strict';
import { posix } from 'node:path';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2009PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2009-spring-pm-09-13';
import { legacy2009SpringPm0913Figures as figures } from '../../../src/core/generators/legacy-2009-spring-pm-09-13-figures';
import { legacy2009SpringPm0913FigureRenderers as renderers } from '../../../src/ui/Legacy2009SpringPm0913Figures';
import { verifyProduct } from '../../fixtures/legacy-2009-spring-pm-12-oracle';

const inputs = [0, 1, 2, 3];
const official = ['カオアオオイア', 'アウカウアイイ', 'アウウエウオ', 'ウウエオカ', 'エイエカアイア'];
const optionSizes = [[6, 6, 4, 5, 6, 6, 6], [4, 4, 6, 6, 6, 5, 4], [4, 4, 4, 6, 5, 5], [6, 6, 6, 6, 6], [6, 6, 4, 6, 6, 4, 6]];
const assetReferences = [
  [], [], ['asset-ipa-2009h21h-fe-pm-p058'],
  ['asset-ipa-2009h21h-fe-pm-p059', 'asset-ipa-2009h21h-fe-pm-p060', 'asset-ipa-2009h21h-fe-pm-p061-casl-excerpt',
    'asset-ipa-2009h21h-fe-pm-p062', 'asset-ipa-2009h21h-fe-pm-p063', 'asset-ipa-2009h21h-fe-pm-p064'],
  ['asset-ipa-2009h21h-fe-pm-p065', 'asset-ipa-2009h21h-fe-pm-p066', 'asset-ipa-2009h21h-fe-pm-p067'],
];
const kana = 'アイウエオカ';
const words = (text: string) => text.trim().replaceAll(/\s+/g, ' ');
const count = (value: string) => Number(value.replaceAll(',', ''));

function texts(body: GeneratedBody, field: string) {
  const part = body.answerParts!.find(item => item.id === 'part-' + field);
  assert.ok(part);
  return part.choiceIds.map(id => {
    const block = body.choices[Number(id.split('-').at(-1)) - 1][0];
    assert.ok(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
}
function verify(body: GeneratedBody, field: string, predicate: (text: string) => boolean) {
  const options = texts(body, field);
  const matches = options.flatMap((text, index) => predicate(text) ? [index] : []);
  assert.equal(matches.length, 1, field + 'の解答候補が一意');
  const part = body.answerParts!.find(item => item.id === 'part-' + field);
  assert.ok(part);
  const answer = body.partAnswers!.find(item => item.kind === 'choice' && item.partId === part.id);
  assert.ok(answer && answer.kind === 'choice');
  assert.equal(answer.choiceId, part.choiceIds[matches[0]], field + 'の正答');
  return kana[matches[0]];
}
function chosen(body: GeneratedBody, field: string) {
  const part = body.answerParts!.find(item => item.id === 'part-' + field);
  const answer = body.partAnswers!.find(item => item.kind === 'choice' && item.partId === part?.id);
  assert.ok(part && answer && answer.kind === 'choice');
  return texts(body, field)[part.choiceIds.indexOf(answer.choiceId)];
}
function sourceFigure(body: GeneratedBody, suffix: string) {
  const block = body.prompt.find(item => item.type === 'diagram' && item.scene.kind === 'source_figure' && item.scene.profile.endsWith(suffix));
  assert.ok(block && block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(figure => figure.profile === profile);
  assert.ok(definition);
  return definition.panel(values);
}
function nativeTable(body: GeneratedBody, caption: string) {
  const block = body.prompt.find(item => item.type === 'table' && item.caption === caption);
  assert.ok(block && block.type === 'table');
  return block.rows;
}
function codeBlocks(body: GeneratedBody, language: string) {
  return body.prompt.filter((block): block is Extract<Block, { type: 'code' }> => block.type === 'code' && block.language === language)
    .map(block => block.text);
}
function verifyPath(body: GeneratedBody) {
  verify(body, 'a', text => words(text) === 'strcpy(result, path)');
  verify(body, 'b', text => words(text) === 'strcpy(result, base)');
  // Pointer subtraction is only defined within the same array. pp is in path,
  // so subtracting it measures the consumed input instead of the base prefix.
  verify(body, 'c', text => text === 'bp - base');
  verify(body, 'd', text => text === 'result + length');
  const resolve = (path: string, base: string) => {
    if (path.startsWith('/')) return path;
    if (path === '.' || path === './') return base;
    const absolute = posix.resolve(base, path);
    return absolute !== '/' && path.endsWith('/') ? absolute + '/' : absolute;
  };
  for (const [path, base, result] of nativeTable(body, '表1 変換例')) assert.equal(resolve(path, base), result);
  for (const [path, base, field] of nativeTable(body, '表2 引数列'))
    verify(body, field[1], text => text === resolve(path, base));
  const tree = sourceFigure(body, 'directory-tree');
  assert.equal(tree.kind, 'tree');
  assert.equal(tree.nodes.length, 11);
  assert.deepEqual(tree.nodes.map(node => node.parent), [undefined, 0, 0, 1, 1, 1, 3, 3, 3, 5, 9]);
  assert.equal(tree.nodes.filter(node => node.kind === 'file').length, 4);
}
function verifySales(body: GeneratedBody) {
  const report = sourceFigure(body, 'cumulative-sales-report');
  const layout = sourceFigure(body, 'sales-record-layout');
  assert.equal(report.kind, 'output');
  assert.equal(layout.kind, 'tables');
  const width = Number.parseInt(layout.tables[0].rows[0][0], 10);
  const descending = body.prompt.some(block => block.type === 'paragraph' && block.text.includes('多い順に整列'));
  const amounts = report.text.split('\n').slice(1, -1).map(row => {
    const [, name, amount, percentage] = /^(\S+)\s+([\d,]+)\s+(\d+\.\d)/.exec(row) ?? [];
    const graphic = row.slice(35);
    assert.ok(name && amount && percentage && graphic);
    return { name, amount: count(amount), percentage: Number(percentage), graphic };
  });
  const total = amounts.reduce((sum, row) => sum + BigInt(row.amount), 0n);
  assert.equal(count(report.text.split('\n').at(-1)!.trim().split(/\s+/)[1]), Number(total));
  for (const [index, entry] of amounts.entries()) {
    const before = amounts.slice(0, index + 1).reduce((sum, row) => sum + BigInt(row.amount), 0n);
    assert.equal(entry.percentage, Number(before * 1000n / total) / 10);
    const stars = BigInt(Math.floor(entry.percentage));
    assert.equal(entry.graphic, '*'.repeat(Number(stars < 5n ? stars : 5n)) + ' … ' + '*'.repeat(Number(stars > 68n ? stars - 68n : 0n)));
    if (index > 0) assert.ok(descending ? amounts[index - 1].amount > entry.amount : amounts[index - 1].amount < entry.amount);
  }
  const unsorted = amounts.flatMap((row, index) => [[row.name, index + 1], [row.name, row.amount - index - 1]] as const);
  const sampleRecords = [...unsorted.filter((_, i) => i % 2 === 0), ...unsorted.filter((_, i) => i % 2 === 1)];
  verify(body, 'a', option => {
    if (!/ KEY SORT-(CD|SALES)$/.test(option)) return false;
    const ordering = option.startsWith('ASCENDING') ? 1 : -1;
    const sorted = [...sampleRecords].sort((a, b) => ordering *
      (option.endsWith('CD') ? a[0].localeCompare(b[0]) : a[1] - b[1]));
    return sorted.every((row, i) => i % 2 === 0 || row[0] === sorted[i - 1][0]);
  });
  verify(body, 'b', option => option === (descending ? 'DESCENDING' : 'ASCENDING') + ' KEY SORT-SALES');
  const expected = { c: [29, 31, 7], d: [29, 31, 18], e: [36, 31, 11] };
  for (const [field, expectedState] of Object.entries(expected)) verify(body, field, option => {
    const [, operator, destination] = /^(ADD|MOVE) TEMP-SALES TO (GROSS-SUM|INTERIM-SUM|SORT-SALES)$/.exec(words(option)) ?? [];
    if (!operator) return false;
    const state = [29, 31, 11];
    const address = ['GROSS-SUM', 'INTERIM-SUM', 'SORT-SALES'].indexOf(destination);
    state[address] = operator === 'MOVE' ? 7 : state[address] + 7;
    return state.every((value, i) => value === expectedState[i]);
  });
  verify(body, 'f', option => {
    const [, codeWidth, elements, index] = /^S-CD PIC X\((\d+)\)(?: OCCURS (\d+))?(?: INDEXED BY (.+))?$/.exec(words(option)) ?? [];
    return Number(codeWidth) === width && Number(elements) === 3 && index === undefined;
  });
  verify(body, 'g', option => {
    const [, after, before] = /^行番号(\d+)と(\d+)の間$/.exec(option) ?? [];
    return Number(after) >= 51 && Number(before) <= 52;
  });
  const code = codeBlocks(body, 'cobol');
  assert.deepEqual(code.flatMap(chunk => chunk.split('\n').map(line => Number(line.trim().split(' ')[0]))),
    Array.from({ length: 110 }, (_, i) => i + 1));
}
function verifyGap(body: GeneratedBody) {
  const preview = sourceFigure(body, 'gap-buffer'), inserted = sourceFigure(body, 'gap-insertion'), deleted = sourceFigure(body, 'gap-deletion');
  assert.equal(preview.kind, 'gap'); assert.equal(inserted.kind, 'gap'); assert.equal(deleted.kind, 'gap');
  const text = (row: { before: string; after: string }) => row.before + row.after;
  assert.equal(text(preview.rows[0]), text(preview.rows[1]));
  assert.equal(text(inserted.rows[0]), text(inserted.rows[1]));
  assert.equal(text(deleted.rows[0]), text(deleted.rows[1]));
  assert.equal(text(inserted.rows[2]), text(deleted.rows[0]));
  const at = inserted.rows[1].before.length, dropped = deleted.rows[2].before.length;
  assert.equal(text(inserted.rows[2]).slice(0, at) + text(inserted.rows[2]).slice(at + 1), text(inserted.rows[0]));
  assert.equal(text(deleted.rows[0]).slice(0, dropped) + text(deleted.rows[0]).slice(dropped + 1), text(deleted.rows[2]));
  verify(body, 'a', option => {
    const startingGap = 6;
    const endingGap = option.endsWith('--') ? startingGap - 1 : option.endsWith('++') ? startingGap + 1 : startingGap;
    return option === 'gapSize--' && endingGap === startingGap - 1;
  });
  verify(body, 'b', option => {
    const offsets: Record<string, number> = { 'buffer.length': 16, gapOffset: 4, gapSize: 6, 'length()': 10 };
    return 8 + offsets[option] === 14;
  });
  verify(body, 'c', option => {
    const offsets: Record<string, number> = { 'buffer.length': 22, 'buffer.length - gapOffset': 17, 'buffer.length - gapSize': 16, 'buffer.length - INITIAL_GAP_SIZE': -106 };
    return offsets[option] === 16;
  });
  verify(body, 'd', option => /^GapBuffer$/.test(option));
  const left = body.prompt.some(block => block.type === 'paragraph' && block.text.includes('カーソルの直前の1文字を削除'));
  const advance = !body.prompt.some(block => block.type === 'paragraph' && block.text.includes('挿入した文字の直前'));
  const parse = (option: string, cursor: number) => {
    const change = option.includes('++') ? 1 : option.includes('--') ? -1 : 0;
    return [option.startsWith('cursor') ? cursor : cursor + change, cursor + change];
  };
  verify(body, 'e', option => parse(option, 3).every(value => value === (left ? 2 : 3)));
  verify(body, 'f', option => {
    const [argument, cursor] = parse(option, 3);
    return argument === 3 && cursor === (advance ? 4 : 3);
  });
  const java = codeBlocks(body, 'java');
  assert.match(java.join('\n'), /System\.arraycopy\(initialText\.toCharArray\(\), 0,\n {25}buffer/);
  assert.match(java[2], new RegExp(left ? 'cursor > 0' : 'cursor < buf.length'));
}
function verifyCasl(body: GeneratedBody) {
  const source = codeBlocks(body, 'casl2');
  assert.equal(source.length, 2);
  const base = Object.fromEntries([...'abcde'].map(field => [field, chosen(body, field)]));
  for (const field of 'abcde') verify(body, field, option => verifyProduct(source, { ...base, [field]: option }));
}
function verifySpreadsheet(body: GeneratedBody) {
  const sales = sourceFigure(body, 'monthly-sales-worksheet');
  const plan = sourceFigure(body, 'monthly-production-worksheet');
  assert.equal(sales.kind, 'tables'); assert.equal(plan.kind, 'tables');
  const [, company] = sales.tables;
  assert.equal(company, undefined);
  const [header, ...raw] = sales.tables[0].rows;
  const [labels, demand, stock, carried, made, early, actual] = plan.tables[0].rows;
  const selected = demand[1], capacity = count(demand[2]);
  const productColumn = header.indexOf('商品名');
  const monthColumns = header.map((text, i) => /月計画量/.test(text) ? i : -1).filter(i => i >= 0);
  const allDemand = monthColumns.map(column => raw.filter(row => row[productColumn] === selected)
    .reduce((sum, row) => sum + count(row[column]), 0));
  const premise = body.prompt.find(block => block.type === 'paragraph' && block.text.includes('余裕を加えた数量'));
  assert.ok(premise?.type === 'paragraph');
  const percent = Number(premise.text.match(/(\d+)％の余裕/)?.[1]);
  const range = (text: string, shift: number) => {
    const match = /^(\$?)([A-Z])2〜(\$?)([A-Z])10$/.exec(text);
    if (!match) return [NaN, NaN];
    return [match[2].charCodeAt(0) - 64 + (match[1] ? 0 : shift), match[4].charCodeAt(0) - 64 + (match[3] ? 0 : shift)];
  };
  verify(body, 'a', text => monthColumns.every((_, shift) => range(text, shift).every(column => column === productColumn)));
  verify(body, 'b', text => monthColumns.every((column, shift) => range(text, shift).every(value => value === column)));
  verify(body, 'c', text => {
    const [, inside, outside] = /^切上げ\(E2(?: \* (\d+(?:\.\d+)?))?\)(?: \* (\d+(?:\.\d+)?))?$/.exec(text) ?? [];
    if (!inside && !outside) return false;
    const rational = (factor: string) => {
      const [whole, fraction = ''] = factor.split('.');
      return [BigInt(whole + fraction), 10n ** BigInt(fraction.length)] as const;
    };
    const [inNumerator, inDenominator] = rational(inside ?? '1');
    const [outNumerator, outDenominator] = rational(outside ?? '1');
    return [7, 19, ...allDemand].every(value => {
      const rounded = (BigInt(value) * inNumerator + inDenominator - 1n) / inDenominator;
      const required = (BigInt(value) * BigInt(100 + percent) + 99n) / 100n;
      return rounded * outNumerator === required * outDenominator;
    });
  });
  const example = { D3: 120, D4: 44, D5: 76, E2: 100 };
  const formula = (text: string, values: Record<string, number>) => {
    const parts = text.split(/\s+/);
    let result = values[parts[0]];
    for (let i = 1; i < parts.length; i += 2) result += (parts[i] === '+' ? 1 : -1) * values[parts[i + 1]];
    return result;
  };
  const comparison = (text: string, values: Record<string, number>) => {
    const [, left, operator, right] = /^(.*) (≦|≧|<|>) (.*)$/.exec(text) ?? [];
    if (!operator) return false;
    const resolve = (item: string) => /^\d+$/.test(item) ? Number(item) : formula(item, values);
    const a = resolve(left), b = resolve(right);
    return ({ '≦': a <= b, '≧': a >= b, '<': a < b, '>': a > b })[operator];
  };
  verify(body, 'd', text => formula(text, example) === 20);
  verify(body, 'e', text => [[31, 27], [9, 11], [12, 12]].every(([a, b]) => comparison(text, { D3: a, D4: b }) === (a <= b)));
  verify(body, 'f', text => formula(text, { I5: 22, J6: 19, I7: 23 }) === 18);
  verify(body, 'g', text => [[11, 7, 17], [11, 7, 18], [1, 3, 5], [0, 7, 6], [6, 0, 5]]
    .every(([a, b, limit]) => comparison(text, { I5: a, J6: b, $B2: limit }) === (a + b <= limit)));
  assert.deepEqual(demand.slice(5).map(count), allDemand);
  const stockGoals = allDemand.map(value => Number((BigInt(value) * BigInt(100 + percent) + 99n) / 100n));
  assert.deepEqual(stock.slice(4, 10).map(count), stockGoals);
  // Independent stock simulation: after sales, only add units until stock goal
  // has been met. Reserve as much as possible in the month of each requirement.
  let balance = 0;
  const required: number[] = [];
  for (let month = 0; month < 6; month++) {
    if (month > 0) balance -= allDemand[month - 1];
    assert.equal(count(carried[month + 4]), balance);
    const before = balance;
    while (balance < stockGoals[month]) balance++;
    required.push(balance - before);
  }
  assert.deepEqual(made.slice(4, 10).map(count), required);
  const available = Array<number>(6).fill(capacity);
  const moved = Array<number>(7).fill(0);
  for (let deadline = 5; deadline >= 0; deadline--) {
    for (let unit = 0; unit < required[deadline]; unit++) {
      let slot = deadline;
      while (slot >= 0 && available[slot] === 0) moved[slot--]++;
      assert.ok(slot >= 0, '生産計画の全必要量が期間内に収まる');
      available[slot]--;
    }
  }
  assert.deepEqual(actual.slice(4, 10).map(count), available.map(left => capacity - left));
  assert.deepEqual(early.slice(4).map(count), moved);
  assert.deepEqual(labels.slice(4), ['3月', '4月', '5月', '6月', '7月', '8月', '9月']);
  assert.equal(plan.tables[0].shaded!.length, 16);
}

const oracles = [verifyPath, verifySales, verifyGap, verifyCasl, verifySpreadsheet];
for (const [major, { definition, original, originalPageAlt }] of drafts.entries()) {
  test('2009年度春期旧午後問' + (major + 9) + 'の公式正答・全入力・全候補を検算する', () => {
    assert.equal(definition.source, '2009h21h-fe-pm-' + (major + 9));
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fixedReferenceAssetIds ?? [], assetReferences[major]);
    const basis = definition.build([0]);
    if (major === 3) {
      const disjoint = ' 被乗数，乗数及び積の格納領域は互いに重ならないものとする。';
      const normalized = basis.prompt.map(block => block.type === 'paragraph' ? { ...block, text: block.text.replace(disjoint, '') } : block);
      assert.deepEqual(original(), { ...basis, prompt: normalized });
      for (const input of inputs) assert.ok(definition.build([input]).prompt.some(block => block.type === 'paragraph' && block.text.endsWith(disjoint)));
    } else assert.deepEqual(original(), basis);
    assert.equal(Object.keys(originalPageAlt()).length, [5, 5, 6, 4, 4][major]);
    const optionLetters = (body: GeneratedBody) => [...official[major]].map((_, i) => {
      const field = 'abcdefg'[i];
      const options = texts(body, field);
      assert.equal(options.length, optionSizes[major][i]);
      assert.equal(options.length, new Set(options).size);
      return kana[options.indexOf(chosen(body, field))];
    }).join('');
    assert.equal(optionLetters(original()), official[major]);
    const stems = new Set(), answers = new Set();
    for (const index of inputs) {
      const body = definition.build([index]);
      assert.equal(body.answerParts!.length, official[major].length);
      assert.equal(body.partAnswers!.length, official[major].length);
      assert.deepEqual(body.prompt.map(block => block.type), original().prompt.map(block => block.type));
      stems.add(JSON.stringify(body.prompt));
      answers.add([...official[major]].map((_, i) => chosen(body, 'abcdefg'[i])).join('|'));
      oracles[major](body);
    }
    assert.equal(stems.size, 4);
    assert.ok(answers.size > 1);
    for (const values of [[], [-1], [4], [0, 1], [0.5], [NaN]]) assert.throws(() => definition.build(values));
  });
}

test('管理図は構造・入力・読み上げの対応を維持する', () => {
  assert.equal(figures.length, 10);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const figure of figures) for (const index of inputs) {
    const renderer = renderers.find(renderer => renderer.profile === figure.profile)!;
    const panel = figure.panel([index]);
    const markup = renderToStaticMarkup(createElement(renderer.component, { values: [index], caption: '図表' }));
    assert.match(markup, /role="group".*aria-description=/);
    assert.match(markup, /tabindex="0"/);
    assert.ok(figure.alt([index]).length > 15);
    if (panel.kind === 'tree') assert.equal((markup.match(/<ellipse/g) ?? []).length, 8);
    if (panel.kind === 'gap') assert.match(markup, /<svg.*<rect/);
    if (panel.kind === 'tables') assert.match(markup, /<table.*scope="col"/);
    if (panel.kind === 'output') assert.match(markup, /<pre.*<code>/);
  }
});
