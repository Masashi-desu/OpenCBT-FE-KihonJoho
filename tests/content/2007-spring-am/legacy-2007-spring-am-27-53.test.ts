import assert from 'node:assert/strict';
import { test } from 'node:test';
import { legacy2007SpringAm27To53Definitions as series } from '../../../src/core/generators/legacy-2007-spring-am-27-53';
import source from '../../../src/core/generators/legacy-2007-spring-am-27-53-source.json';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { knowledgeFacts } from '../../fixtures/legacy-2007-spring-am-27-53-review';

const selection = 'アイウエ';
const officialKeys = 'イエアアウエエアエイアウイイイエウウイイエウウウエアウ';
const questionNumbers = Array.from({ length: 27 }, (_, i) => i + 27).filter(number => number !== 33);
const indices = [0, 1, 2, 3];
const questionNumber = (source: string) => Number(source.split('-').at(-1));
const definition = (number: number) => series.find(({ source }) => questionNumber(source) === number)!;
const choices = (body: GeneratedBody) => body.choices.map(parts => {
  assert.equal(parts.length, 1);
  const [choice] = parts;
  assert(choice.type === 'paragraph');
  return choice.text;
});
const stem = (body: GeneratedBody) => {
  const [block] = body.prompt;
  assert(block.type === 'paragraph');
  return block.text;
};
const answer = (body: GeneratedBody) => choices(body)[body.correctIndex!];

test('公式問27〜53のキー、選択肢、収録26問と問33保留を原資料と照合する', () => {
  assert.deepEqual(series.map(rule => questionNumber(rule.source)), questionNumbers);
  assert.deepEqual(Object.keys(source).map(Number), questionNumbers);
  assert.equal(officialKeys.at(33 - 27), 'エ');
  assert.equal(definition(33), undefined);
  for (const number of questionNumbers) {
    const rule = definition(number);
    const original = source[String(number) as keyof typeof source];
    assert.equal(rule.source, '2007h19h-fe-am-' + number);
    assert.equal(rule.sourceAnswer, officialKeys[number - 27]);
    const base = rule.build(rule.reference);
    assert.equal(stem(base), original.prompt);
    assert.deepEqual(choices(base), original.choices);
    assert.equal(selection[base.correctIndex!], rule.sourceAnswer);
  }
});

test('全26系列が各4条件で元の構造・4択と再現性を維持する', () => {
  for (const { build, source, fields, reference } of series) {
    assert.deepEqual(reference, [0]);
    assert.deepEqual(fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    for (const bad of [[], [-1], [4], [0, 1], [NaN], [0.5], Array<number>(1), Object.assign([0], { more: 1 })])
      assert.throws(() => build(bad), { code: 'PARAMETER_CONSTRAINT' });
    const prompts = new Set(), answers = new Set();
    const blockTypes = build([0]).prompt.map(item => item.type);
    for (const index of indices) {
      const body = build([index]);
      assert.deepEqual(body, build([index]));
      assert.deepEqual(body.prompt.map(item => item.type), blockTypes, source);
      assert.equal(choices(body).length, 4);
      assert.equal(new Set(choices(body)).size, 4);
      assert.ok(body.explanation.length >= 20, source + ':' + index);
      prompts.add(JSON.stringify(body.prompt));
      answers.add(answer(body));
    }
    assert.equal(prompts.size, 4, source);
    assert.equal(answers.size, questionNumber(source) === 30 ? 3 : 4, source);
  }
});

test('知識23系列の各条件・4択・正答の一意性を独立した査読事実と照合する', () => {
  const calculations = [30, 47, 53];
  assert.deepEqual(Object.keys(knowledgeFacts).map(Number), questionNumbers.filter(number => !calculations.includes(number)));
  for (const [number, fact] of Object.entries(knowledgeFacts)) {
    assert(fact.rationale.length >= 20);
    for (const index of indices) {
      const body = definition(Number(number)).build([index]);
      const candidates = choices(body);
      assert.match(stem(body), fact.query[index], number + ':' + index);
      const roles = fact.choices[index];
      const winner = selection.indexOf(fact.trueChoice[index]);
      assert.equal(roles.length, 4);
      for (const [i, text] of candidates.entries()) {
        assert.match(text, roles[i], number + ':' + index + ':' + i);
        assert.equal(roles[winner].test(text), i === winner, number + ':' + index + ':' + i);
      }
      assert.equal(body.correctIndex, winner, number + ':' + index);
    }
  }
});

test('問30は500セルの独立実行で各読込み時の置き場が一意、表の値と空き区画が一致する', () => {
  const expected = [[110,20,50], [200], [150,20], [40,10,70]];
  const labels = ['A', 'B', 'C', 'D', 'E'];
  for (const index of indices) {
    const body = definition(30).build([index]);
    assert.match(stem(body), /500kバイトで初期状態では何もロード.*空き領域の先頭からロード/);
    const table = body.prompt.find(block => block.type === 'table');
    assert(table?.type === 'table');
    assert.deepEqual(table.columns, ['モジュール', '大きさ（kバイト）']);
    assert.deepEqual(table.rows.map(row => row[0]), labels);
    const operations = body.prompt[2];
    assert(operations.type === 'paragraph');
    assert.deepEqual(operations.text.split(' → '), ['Aのロード','Bのロード','Cのロード','Bの解放','Dのロード','Aの解放','Eのロード']);
    const memory = Array<string>(500).fill('.');
    function areas(): { start: number; length: number }[] {
      return [...memory.join('').matchAll(/\.+/g)].map(match => ({ start: match.index!, length: match[0].length }));
    }
    for (const action of operations.text.split(' → ')) {
      const id = action[0], length: number = Number(table.rows[labels.indexOf(id)][1]);
      if (action.endsWith('ロード')) {
        const fitting = areas().filter(area => area.length >= length);
        assert.equal(fitting.length, 1);
        memory.fill(id, fitting[0].start, fitting[0].start + length);
        assert.match(body.explanation, new RegExp(id + 'は' + fitting[0].start + ' kバイト位置'));
      } else {
        let released = 0;
        memory.forEach((allocated, at) => { if (allocated === id) { memory[at] = '.'; released++; } });
        assert.equal(released, length);
      }
    }
    const lengths = areas().map(area => area.length);
    assert.deepEqual(lengths, expected[index]);
    assert.deepEqual(choices(body), [...choices(body)].sort((left, right) => Number(left) - Number(right)));
    assert.deepEqual(choices(body).filter(value => Number(value) === lengths.length), [answer(body)]);
    assert(body.explanation.includes(lengths.join('，') + ' kバイト'));
  }
});

test('問33の原問は独立と相関の二つの母集団で異なる提示択が成立する', () => {
  const candidates = [0.72, 0.92, 0.93, 0.95];
  const closest = (value: number) => candidates.map((item, i) => [Math.abs(value - item), i] as const)
    .sort(([left], [right]) => left - right)[0][1];
  const devices = [
    // Independent cohorts: the lower 10%, 20%, 10%, 20% give each device's downtime.
    Array.from({ length: 10000 }, (_, i) => [i % 10 > 0, Math.floor(i / 10) % 10 > 1,
      Math.floor(i / 100) % 10 > 0, Math.floor(i / 1000) % 10 > 1]),
    // A and C always agree, B and D always agree; the two pairs remain independent.
    Array.from({ length: 10000 }, (_, i) => [i % 10 > 0, Math.floor(i / 10) % 10 > 1,
      i % 10 > 0, Math.floor(i / 10) % 10 > 1]),
  ];
  for (const states of devices) assert.deepEqual([0,1,2,3].map(i => states.filter(row => row[i]).length), [9000,8000,9000,8000]);
  const availability = devices.map(rows => rows.filter(([a,b,c,d]) => (a || c) && (b || d)).length / rows.length);
  assert.deepEqual(availability, [0.9504, 0.72]);
  assert.deepEqual(availability.map(closest), [3, 0]);
  assert.equal(definition(33), undefined);
});

test('問47は積を整数演算で再計算し、検査文字の4択と余り10のXとを確認する', () => {
  const inputs = ['2131', '1253', '1354', '1324'];
  for (const index of indices) {
    const body = definition(47).build([index]);
    const input = stem(body).match(/4けたの数値データ“([0-9]+)”/)![1];
    assert.equal(input, inputs[index]);
    const paragraphs = body.prompt.slice(2).map(block => { assert(block.type === 'paragraph'); return block.text; });
    assert.equal(paragraphs.length, 4);
    assert.match(paragraphs[0], /係数4，3，2，1/);
    assert.match(paragraphs[1], /積の和/);
    assert.match(paragraphs[2], /11で割って余り/);
    assert.match(paragraphs[3], /10のときは，“X”/);
    const weight = input.split('').reverse().flatMap((digit, offset) => Array<number>(offset + 1).fill(Number(digit)));
    const total = weight.reduce((carry, item) => carry + item, 0);
    const remaining = total - Math.floor(total / 11) * 11;
    const symbol = '0123456789X'[remaining];
    assert.equal(answer(body), symbol);
    assert.equal(choices(body).filter(choice => choice === symbol).length, 1);
    assert(body.explanation.includes('＝' + total));
    assert(body.explanation.includes('検査文字は' + symbol));
  }
});

test('問53をIPv4の先頭ビット接頭辞の独立判定と比較し、全4クラスを検査する', () => {
  const prefixes = [/^0/, /^10/, /^110/, /^1110/];
  for (const index of indices) {
    const body = definition(53).build([index]);
    const address = stem(body).match(/IPアドレス(\d+\.\d+\.\d+\.\d+)/)![1];
    const chunks = address.split('.').map(Number);
    assert(chunks.every(value => value >= 0 && value <= 255));
    const first = chunks[0].toString(2).padStart(8, '0');
    assert.deepEqual(choices(body), ['クラスA', 'クラスB', 'クラスC', 'クラスD']);
    const matches = prefixes.flatMap((prefix, i) => prefix.test(first) ? [i] : []);
    assert.deepEqual(matches, [body.correctIndex]);
    assert(body.explanation.includes(first));
  }
});
