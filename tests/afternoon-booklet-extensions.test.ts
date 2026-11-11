import test from 'node:test';
import assert from 'node:assert/strict';
import { collectionForAfternoonScope, validateAfternoonBookletExtensions, additionalAfternoonDefinitions,
  type AfternoonBookletDefinition } from '../src/core/generators/afternoon-booklet-extension-contract';
import { bookletExtensions } from '../src/core/generators/afternoon-booklet-extensions';
import { scopeForQuestion } from '../scripts/ci/booklet-scope.mjs';
import { additionalBookletFigureDomains } from '../src/core/booklet-figure-extension-contract';
import { legacyAfternoonFigureDomains } from '../src/core/legacy-afternoon-figures';
import { sourceFigureDomains } from '../src/core/source-figures';

function definition(number = 1): AfternoonBookletDefinition {
  return { source: '2016h28a-fe-pm-' + number, title: 'registration contract probe',
    fields: [{ name: 'probe', minimum: 0, maximum: 1 }], reference: [0], sourceAnswer: 'ア',
    notes: 'Synthetic registration metadata only; no publication admission.',
    publicNotes: 'Synthetic user-facing modification notice, kept separate from review notes.',
    build() { throw new Error('metadata verification must not execute a generator'); } };
}

test('historical booklet identities agree with source-locator CI scopes, including the2011 special and2019 era boundary', () => {
  for (const [scope, id, year, period] of [
    ['2016-autumn-pm', '2016h28a-fe-pm', 2016, '秋期'],
    ['2011-special-pm', '2011h23tokubetsu-fe-pm', 2011, '特別'],
    ['2019-spring-pm', '2019h31h-fe-pm', 2019, '春期'],
    ['2019-autumn-pm', '2019r01a-fe-pm', 2019, '秋期'],
  ] as const) {
    assert.equal(collectionForAfternoonScope(scope), id);
    assert.equal(scopeForQuestion({ subject: 'B', origin: { sourceRefs: [{ locator: { year, period, timeSlot: '午後', questionNumber: '1' } }] } }), scope);
  }
  for (const scope of ['2016-autumn-am', '2022-april-b', '2023-autumn-pm', '2010-special-pm', '2012-special-pm', '../2016-autumn-pm', '2016-autumn-pm-extra'])
    assert.throws(() => collectionForAfternoonScope(scope), { code: 'GENERATOR_REF' });
});

test('source-owned registration permits gaps without executing bodies or claiming complete13-major publication', () => {
  const rows = [definition(1), definition(3), definition(13)], saved = structuredClone(rows.map(({ build, ...row }) => row));
  assert.deepEqual(validateAfternoonBookletExtensions([{ scope: '2016-autumn-pm', definitions: rows }]), rows);
  assert.deepEqual(rows.map(({ build, ...row }) => row), saved);
  assert.deepEqual(validateAfternoonBookletExtensions([]), []);
});

test('duplicate, reordered, malformed and cross-booklet registrations cannot replace another source', () => {
  const entry = (definitions: AfternoonBookletDefinition[]) => ({ scope: '2016-autumn-pm', definitions });
  for (const definitions of [[], [definition(1), definition(1)], [definition(2), definition(1)], [definition(0)], [definition(14)],
    [{ ...definition(), source: '2017h29h-fe-pm-1' }], [{ ...definition(), source: '2016h28a-fe-pm-01' }], [{ ...definition(), notes: '' }], [{ ...definition(), publicNotes: '' }]])
    assert.throws(() => validateAfternoonBookletExtensions([entry(definitions)]), { code: 'GENERATOR_REF' });
  assert.throws(() => validateAfternoonBookletExtensions([entry([definition()]), entry([definition(2)])]), { code: 'GENERATOR_REF' });
  assert.throws(() => validateAfternoonBookletExtensions([entry([definition()])], [definition().source]), { code: 'GENERATOR_REF' });
});

test('fixed material capabilities are scoped to the owning booklet and every actual extension is metadata-validated', () => {
  const valid = 'asset-ipa-2016h28a-fe-pm-1-errata';
  assert.equal(validateAfternoonBookletExtensions([{ scope: '2016-autumn-pm', definitions: [{ ...definition(), fixedReferenceAssetIds: [valid] }] }]).length, 1);
  for (const ids of [[valid, valid], ['asset-ipa-2017h29h-fe-pm-1-errata'], [valid + '/../x']])
    assert.throws(() => validateAfternoonBookletExtensions([{ scope: '2016-autumn-pm', definitions: [{ ...definition(), fixedReferenceAssetIds: ids }] }]), { code: 'SOURCE_MATERIAL' });
  assert.deepEqual(additionalAfternoonDefinitions, validateAfternoonBookletExtensions(bookletExtensions));
});

test('source-owned figures are registered once and never recaptured by the historical afternoon adapter', () => {
  for (const [profile, domain] of Object.entries(additionalBookletFigureDomains)) {
    assert(!Object.hasOwn(legacyAfternoonFigureDomains, profile), profile);
    assert.deepEqual(sourceFigureDomains[profile], domain, profile);
  }
});
