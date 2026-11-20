import assert from 'node:assert/strict';
import test from 'node:test';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { autumn2007Pm1 } from '../../../src/core/generators/legacy-2007-autumn-pm-1';

const bits = new DataView(new ArrayBuffer(4));
const encode = (number: number) => {
  bits.setFloat32(0, number);
  return bits.getUint32(0).toString(2).padStart(32, '0');
};
function decode(s: string) {
  bits.setUint32(0, Number.parseInt(s, 2));
  return bits.getFloat32(0);
}
function binary32(columns: string[]) {
  assert.equal(columns.length, 3);
  assert.match(columns[0], /^[01]$/);
  assert.match(columns[1], /^[01]{8}$/);
  assert.match(columns[2], /^[01]{5}…0$/);
  return columns[0] + columns[1] + columns[2].slice(0, 5).padEnd(23, '0');
}
function group(body: GeneratedBody, i: number) {
  const part = body.answerParts?.[i], answer = body.partAnswers?.[i];
  assert(part && answer?.kind === 'choice' && answer.partId === part.id);
  const options = part.choiceIds.map(id => {
    const [block] = body.choices[Number(id.split('-').at(-1)) - 1];
    if (block.type === 'table') return binary32(block.rows[0]);
    assert(block.type === 'paragraph');
    return block.text;
  });
  assert.equal(new Set(options).size, options.length);
  return { options, answer: part.choiceIds.indexOf(answer.choiceId) };
}

test('問1は原の六択・四択・四つの解答欄を保持し、全条件をFloat32の実際のビット表現で検算する', () => {
  const original = autumn2007Pm1.build([0]);
  assert.equal([0, 1, 2, 3].map(i => 'アイウエオカ'[group(original, i).answer]).join(''), 'イウオウ');
  assert.deepEqual(group(original, 0).options, ['0', '1', '01111110', '01111111', '10000000', '11000000']);
  const signed = [-0.75, 0.625, -1.375, 0.3125];
  const addends = [[2.5, 10], [1.5, 5], [0.3125, 3], [7, 16]];
  for (let i = 0; i < 4; i++) {
    const body = autumn2007Pm1.build([i]);
    const reference = body.contexts?.[0].blocks[0];
    assert(reference?.type === 'table');
    assert.deepEqual(reference.rows.map(row => [row[1], Number(row[2])]),
      [['31', 1], ['30〜23', 8], ['22〜0', 23]]);
    const input = encode(signed[i]);
    const numbers = body.prompt.filter(block => block.type === 'table' && /^加える数/.test(block.caption));
    assert.deepEqual(numbers.map(block => {
      assert(block.type === 'table');
      return decode(binary32(block.rows[0]));
    }), addends[i]);
    const expected = [input[0], input.slice(1, 9), input.slice(9, 17), encode(addends[i][0] + addends[i][1])];
    for (const [index, value] of expected.entries()) {
      const { options, answer } = group(body, index);
      assert.equal(options.length, index === 3 ? 4 : 6);
      assert.deepEqual(options.flatMap((option, slot) => option === value ? [slot] : []), [answer]);
    }
    assert.match(body.explanation, /127/);
  }
  for (const invalid of [[], [-1], [4], [0.5], [0,1]]) assert.throws(() => autumn2007Pm1.build(invalid));
});
