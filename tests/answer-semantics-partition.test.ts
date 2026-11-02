import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fixture } from './fixtures';
import { effectivePublicDefinitions } from '../src/core/generators/effective-public';
import { answerSemanticsInventory } from './helpers/current-answer-semantics';

test('canonical semantic oracles partition every applicable source into one named booklet test', () => {
  const inventory = answerSemanticsInventory(fixture()), ids = inventory.flatMap(row => row.sourceIds);
  assert.deepEqual([...ids].sort(), effectivePublicDefinitions.map(d => d.source).sort());
  assert.equal(new Set(ids).size, ids.length);
  for (const row of inventory) {
    assert(row.sourceIds.length > 0);
    assert.equal(row.names.length, row.sourceIds.length);
    assert.equal(new Set(row.names).size, row.names.length);
  }
  const actual = fs.readdirSync('tests/booklets').filter(scope => fs.existsSync(path.join('tests/booklets', scope, 'answer-semantics.test.ts'))).sort();
  assert.deepEqual(actual, inventory.map(row => row.scope).sort());
  for (const row of inventory) {
    const source = fs.readFileSync(path.join('tests/booklets', row.scope, 'answer-semantics.test.ts'), 'utf8');
    assert.equal(source.split(`registerBookletAnswerSemantics("${row.scope}");`).length, 2);
    assert.equal((source.match(/registerBookletAnswerSemantics\(/g) ?? []).length, 1);
  }
});

test('a missing or ambiguous distributed semantic source cannot become an empty successful test', () => {
  const missing = fixture(), first = effectivePublicDefinitions[0];
  missing.templates = missing.templates.filter(t => t.generatorRef.id !== 'generator-source-' + first.source);
  assert.throws(() => answerSemanticsInventory(missing));
  const ambiguous = fixture(), template = ambiguous.templates.find(t => t.generatorRef.id === 'generator-source-' + first.source)!;
  const base = ambiguous.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
  base.origin.sourceRefs = [];
  assert.throws(() => answerSemanticsInventory(ambiguous));
});
