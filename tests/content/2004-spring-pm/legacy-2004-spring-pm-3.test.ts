import assert from 'node:assert/strict';
import test from 'node:test';
import { readDistributionBundle } from '../../../scripts/distribution-files';
import { bindQuestion } from '../../../src/core/generation';
import { labels } from '../../../src/core/types';
import { huffmanMaterial } from '../../../src/core/generators/legacy-2004-spring-pm-3-model';
import { huffmanTraceColumns } from '../../../src/core/generators/legacy-2004-spring-pm-3-figures';

const id = '2004h16h-fe-pm-3';
const booklet = readDistributionBundle();
const original = booklet.questions.find(question => question.id === 'question-ipa-' + id)!;
const base = booklet.questions.find(question => question.id === 'question-template-source-' + id)!;
const template = booklet.templates.find(item => item.id === 'template-source-' + id)!;
const publishedSymbols = [...'△さてっくこがせたとどまんうごそでにはばひもやよれをあいおかきしちぬのぽり'];
const publishedCounts = [12, 11, 6, 5, 4, 4, ...Array(7).fill(3), ...Array(13).fill(2), ...Array(11).fill(1)];
const publishedCodes = ('100 010 1010 0010 0000 11101 10110 00111 00110 01101 01100 01111 01110 00010 101111 101110 ' +
  '110101 110100 110111 110110 110001 110000 110011 110010 111101 111100 000110 0001111 0001110 1110001 1110000 ' +
  '1110011 1110010 1111101 1111100 1111111 1111110').split(' ');

function referenceCost(frequencies: readonly number[]) {
  const weights = [...frequencies];
  let result = 0;
  while (weights.length > 1) {
    const first = Math.min(...weights);
    weights.splice(weights.indexOf(first), 1);
    const second = Math.min(...weights);
    weights.splice(weights.indexOf(second), 1);
    result += first + second;
    weights.push(first + second);
  }
  return result;
}

function countSymbols(text: string) {
  const counts = new Map<string, number>();
  for (const symbol of text) counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
  return counts;
}

test('S3-052 問3 keeps the five official marks and replaces only the unapplied third-party input', () => {
  assert(original.origin.isModified && original.origin.changes.some(change => change.kind === 'diagram' && !change.affectsAnswer));
  assert.deepEqual(original.origin.sourceRefs.map(ref => ref.locator.page), [10, 11, 12, 13, 14]);
  assert.deepEqual(original.answerParts!.map(part => part.choiceIds.length), [9, 8, 5, 5, 8]);
  assert.deepEqual(original.answerParts![2].choiceIds, original.answerParts![3].choiceIds);
  assert.deepEqual(original.correctAnswer.parts!.map((answer, index) => {
    assert(answer.kind === 'choice');
    return labels[original.answerParts![index].choiceIds.indexOf(answer.choiceId)];
  }), ['イ', 'キ', 'イ', 'エ', 'エ']);
  const assets = original.assetRefs.map(ref => booklet.assets.find(asset => asset.id === ref)!);
  assert.match(assets[0].path, /page-010-reviewed.webp$/);
  assert.deepEqual(assets[0].attribution.rightsRefs, ['rights-ipa-' + id, 'rights-original']);
  assert.deepEqual(assets.map(asset => asset.attribution.origin), ['adapted', 'official', 'official', 'official', 'official']);
  assert.equal(assets[0].alt.includes('独立編集した例'), true);
  const text = huffmanMaterial(0).text;
  const reference = countSymbols(text);
  assert.equal(text.length, 100);
  assert.deepEqual(publishedSymbols.map(symbol => reference.get(symbol)), publishedCounts);
  assert.equal(referenceCost(publishedCounts), 484);
  assert.equal(484 * 100 / 1600, 30.25);
});

test('S3-052 問3 independently checks every assigned code, answer bank and merge figure for all four bindings', () => {
  const referenceAnswers = [[32, 57, 484], [33, 58, 485], [31, 56, 481], [32, 56, 483]];
  const referenceBanks = [
    ['1', '6', '7', '16', '20', '33', '37', '47', '100'],
    ['2.3', '6.0', '6.3', '16.2', '16.7', '37.0', '37.5', '43.2'],
    ['25', '32', '43', '57', '100'],
    ['25', '32', '43', '57', '100'],
    ['3.0', '7.0', '18.8', '30.3', '43.8', '50.0', '80.7', '85.7'],
  ];
  assert(template.parameterDomain.fields);
  const totalCases = template.parameterDomain.fields[0].maximum + 1;
  assert.equal(totalCases, referenceAnswers.length);
  for (let index = 0; index < totalCases; index++) {
    const question = bindQuestion(base, template, [index], 'huffman-' + index, '2026-11-21T00:00:00Z');
    const blocks = question.prompt.blocks;
    const frequencies = blocks.filter(block => block.type === 'table' && block.caption.startsWith('図2'));
    const codeTables = blocks.filter(block => block.type === 'table' && block.caption.startsWith('図4'));
    assert.equal(frequencies.length, 4);
    assert.equal(codeTables.length, 4);
    const symbols = frequencies.flatMap(block => block.type === 'table' ? block.columns.slice(1) : []);
    const counts = frequencies.flatMap(block => block.type === 'table' ? block.rows[0].slice(1).map(Number) : []);
    assert.equal(symbols.length, 37);
    assert.equal(new Set(symbols).size, 37);
    assert.equal(counts.reduce((sum, n) => sum + n, 0), 100);
    assert(counts.every(n => n > 0));
    for (let n = 1; n < counts.length; n++) {
      if (counts[n - 1] === counts[n]) assert(symbols[n - 1].codePointAt(0)! < symbols[n].codePointAt(0)!);
      else assert(counts[n - 1] > counts[n]);
    }
    const column = (n: number) => codeTables.flatMap(block => block.type === 'table' ? block.rows[n].slice(1) : []);
    assert.deepEqual(codeTables.flatMap(block => block.type === 'table' ? block.columns.slice(1) : []), symbols);
    assert.deepEqual(column(0).map(Number), counts);
    const codes = column(1);
    assert.equal(codes.length, 37);
    assert(codes.every(code => /^[01]+$/.test(code)));
    assert(codes.every((code, origin) => codes.every((other, target) => origin === target || !other.startsWith(code))));
    assert.deepEqual(column(2).map(Number), codes.map(code => code.length));
    const weighted = counts.map((count, position) => count * codes[position].length);
    assert.deepEqual(column(3).map(Number), weighted);
    assert.deepEqual(column(4).map(Number), weighted.map((_, position) => weighted.slice(0, position + 1).reduce((sum, n) => sum + n, 0)));
    const cost = referenceCost(counts);
    const [c, d, oracleCost] = referenceAnswers[index];
    assert.equal(oracleCost, cost);
    assert.equal(column(4).at(-1), String(cost));
    const diagram = blocks.find(block => block.type === 'diagram');
    assert(diagram?.type === 'diagram' && diagram.scene.kind === 'source_figure');
    assert.deepEqual(diagram.scene.values, [index]);
    const { columns } = huffmanTraceColumns(index);
    assert.deepEqual(columns[6], ['…', '①', '…']);
    assert.deepEqual(columns[7], ['…', '②']);
    assert.equal(Number(columns[8][0]), d);
    const expected = ['6', '37.5', String(c), String(d), (Math.round(5 * cost / 8) / 10).toFixed(1)];
    const displayed = Object.fromEntries(question.choices.map(choice => {
      const block = choice.content.blocks[0];
      assert.equal(block.type, 'paragraph');
      return [choice.id, block.type === 'paragraph' ? block.text : ''];
    }));
    assert.deepEqual(question.correctAnswer.parts?.map(answer => {
      assert(answer.kind === 'choice');
      return displayed[answer.choiceId];
    }), expected);
    for (const [partIndex, part] of question.answerParts!.entries()) {
      const bank = part.choiceIds.map(choice => displayed[choice]);
      assert.equal(bank.length, referenceBanks[partIndex].length);
      assert.equal(bank.filter(choice => choice === expected[partIndex]).length, 1);
      assert.deepEqual(bank.map(Number), bank.map(Number).sort((left, right) => left - right));
      if (index === 0) assert.deepEqual(bank, referenceBanks[partIndex]);
    }
    if (index === 0) {
      assert.deepEqual(symbols, publishedSymbols);
      assert.deepEqual(counts, publishedCounts);
      assert.deepEqual(codes, publishedCodes);
    }
  }
});
