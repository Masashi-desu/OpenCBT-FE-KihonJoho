import test from 'node:test'; import assert from 'node:assert/strict';
import { legacy2019AutumnMelonDefinitions as defs, autumnMelonModel } from '../src/core/generators/legacy-2019-autumn-pm13';
import { sourceTuples, parseAssignment, reference, executeDisplayedD } from './helpers/legacy-2019-autumn-macro-oracle';
test('Q13 all40 displayed d banks exactly retain raw QS76 eight roles, including corrected ウ i/i/j', () => {
  for (let data = 0; data < 8; data++) for (let price = 0; price < 5; price++) {
    const b = defs[0].build([data, price]); const bank = b.choices.slice(18, 26).map(c => { assert(c[0].type === 'paragraph'); return parseAssignment(c[0].text); });
    assert.deepEqual(bank, sourceTuples); assert.deepEqual(bank[2], ['i', 'i', 'j']);
    assert.deepEqual(b.partAnswers![3], { kind: 'choice', partId: 'part-d', choiceId: 'choice-value-25' });
  }
});
test('Q13 actual40input×8displayed transitions have uniqueキ on whole A-F worksheet and seven wrong witnesses', () => {
  const witnesses = new Set<number>(); let transitions = 0;
  for (let data = 0; data < 8; data++) for (let price = 0; price < 5; price++) {
    const model = autumnMelonModel([data, price]), expected = reference(model.rows, model.prices[2]); assert.deepEqual(model.boxes, expected.boxes);
    const b = defs[0].build([data, price]); const matching = b.choices.slice(18, 26).flatMap((choice, i) => {
      assert(choice[0].type === 'paragraph'); const result = executeDisplayedD(model.rows, parseAssignment(choice[0].text)); transitions++;
      const matches = !result.error && JSON.stringify(result.state) === JSON.stringify(expected.state); if (!matches) witnesses.add(i); return matches ? [i] : [];
    }); assert.deepEqual(matching, [6]);
  }
  assert.equal(transitions, 320); assert.deepEqual([...witnesses].sort(), [0, 1, 2, 3, 4, 5, 7]);
});
