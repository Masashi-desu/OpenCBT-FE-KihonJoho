import assert from 'node:assert/strict';
import test from 'node:test';
import { legacy2015AutumnAm40 as definition } from '../../../src/core/generators/legacy-2015-autumn-am-40';
import type { Block } from '../../../src/core/types';
import review from '../../fixtures/legacy-2015-autumn-am-40-reviewed.json';

function paragraph(blocks: Block[]) {
  const [block] = blocks;
  assert.equal(blocks.length, 1);
  assert.equal(block.type, 'paragraph');
  return block.text;
}

test('2015秋午前問40の基準は制度を説明から識別し、公式ウと四肢の役割・順序を保持する', () => {
  assert.equal(definition.source, review.source);
  assert.deepEqual(definition.reference, [0]);
  assert.equal(definition.sourceAnswer, review.officialKey);
  const base = definition.build(definition.reference);
  assert.equal(paragraph(base.prompt), 'ISMS適合性評価制度に当てはまる説明はどれか。');
  assert.deepEqual(base.choices.map(paragraph), review.choiceReview.map(choice => choice.reviewedWording));
  assert.equal('アイウエ'[base.correctIndex!], review.officialKey);
});

test('2015秋午前問40の有限4入力は本文の制度を変え、独立査読と全四肢の正誤が一致する', () => {
  const [domain] = definition.fields;
  assert.equal(definition.fields.length, 1);
  assert.deepEqual([domain.minimum, domain.maximum], [0, 3]);
  const prompts = new Set<string>();

  for (const entry of review.cases) {
    const generated = definition.build([entry.value]);
    const prompt = paragraph(generated.prompt);
    const choices = generated.choices.map(paragraph);
    assert.equal(prompt, `${entry.target}に当てはまる説明はどれか。`);
    prompts.add(prompt);
    assert.equal(new Set(choices).size, 4);

    const matches = choices.map(choice => {
      const roles = review.choiceReview.filter(role => role.roleIndicators.every(indicator => choice.includes(indicator)));
      assert.equal(roles.length, 1, choice);
      const [role] = roles;
      assert.equal(choice, role.reviewedWording);
      assert(generated.explanation.includes(`${role.label}の${role.institution}`));
      return entry.target.includes(role.institution);
    });
    assert.deepEqual(matches, entry.matches);
    assert.equal(matches.filter(Boolean).length, 1);
    assert.equal(generated.correctIndex, matches.indexOf(true));
    assert(generated.explanation.startsWith(`正解は${entry.key}。`));
    assert.deepEqual(definition.build([entry.value]), generated);
  }
  assert.equal(prompts.size, review.cases.length);
});

test('2015秋午前問40は範囲外・非整数・入力数違いの候補を拒否する', () => {
  for (const invalid of [[], [-1], [4], [0.5], [NaN], [Infinity], [0, 1]]) {
    assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
});
