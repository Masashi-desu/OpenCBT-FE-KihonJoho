import test from 'node:test'; import assert from 'node:assert/strict';
import { legacy2019AutumnAfternoonDefinitions as defs } from '../src/core/generators/legacy-2019-autumn-afternoon';
// Fixed reviewed booklet ledger, not calculated from generator fields.
const counts = [3, 1125, 27, 96, 111, 120, 100, 12, 192, 40, 24, 32, 40], fields = [4, 5, 5, 5, 6, 6, 5, 9, 6, 6, 6, 8, 6];
test('2019autumn all13 definitions retain the reviewed1922input domain and77field structure with required common', () => {
  assert.equal(defs.length, 13); let count = 0;
  for (let i = 0; i < 13; i++) {
    const d = defs[i]; assert.equal(d.source, `2019r01a-fe-pm-${i + 1}`);
    const values = d.fields.reduce<number[][]>((rows, f) => rows.flatMap(row => Array.from({ length: f.maximum - f.minimum + 1 }, (_, offset) => [...row, f.minimum + offset])), [[]]);
    assert.equal(values.length, counts[i]);
    for (const v of values) { const b = d.build(v); assert.equal(b.answerParts!.length, fields[i]); if ([1, 7, 12].includes(i)) { assert(b.contexts?.[0].blocks.some(block => block.type === 'image' && block.assetId === 'asset-ipa-2019r01a-fe-pm-p3')); assert(b.contexts?.[0].blocks.some(block => block.type === 'image' && block.assetId === 'asset-ipa-2019r01a-fe-pm-p4')); } count++; }
  }
  assert.equal(count, 1922); assert.equal(fields.reduce((a, b) => a + b), 77);
});
