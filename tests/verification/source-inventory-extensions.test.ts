import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryCollectionIdentity, inventoryExtensionRecords, type InventoryExtensions } from '../../scripts/source-inventory-extension-contract';
import declarations from '../../scripts/source-inventory-extensions.json';
import { validateSourceInventory } from '../../scripts/source-inventory';
import { fixture } from '../fixtures';

const collectionId = '2016h28a-fe-pm';
const excluded = { number: 3, reason: 'Synthetic material-condition hold; no source text is admitted.', sourceId: 'source-ipa-' + collectionId + '-qs', checkedOn: '2026-11-02' };
const input = (): InventoryExtensions => ({ version: 1, collections: [{ collectionId, excluded: [{ ...excluded }] }] });

test('inventory extensions retain every official target independently of the eligible published subset', () => {
  const result = inventoryExtensionRecords(input(), []);
  assert.deepEqual(result.sources, Array.from({ length: 13 }, (_, i) => collectionId + '-' + (i + 1)));
  assert.deepEqual(Object.keys(result.exclusions), [collectionId + '-3']);
  assert.equal(result.exclusions[collectionId + '-3'].reason, excluded.reason);
  assert.equal(result.sources.filter(id => !result.exclusions[id]).length, 12);
  const morning = inventoryExtensionRecords({ version: 1, collections: [{ collectionId: '2016h28h-fe-am', excluded: [] }] }, []);
  assert.equal(morning.sources.length, 80);
});

test('historical inventory identities preserve era boundaries and the2011 special period', () => {
  assert.deepEqual(inventoryCollectionIdentity('2011h23t-fe-pm'), { scope: '2011-special-pm', count: 13 });
  assert.deepEqual(inventoryCollectionIdentity('2011h23tokubetsu-fe-am'), { scope: '2011-special-am', count: 80 });
  assert.deepEqual(inventoryCollectionIdentity('2011h23tokubetsu-fe-pm'), { scope: '2011-special-pm', count: 13 });
  assert.deepEqual(inventoryCollectionIdentity('2019h31h-fe-am'), { scope: '2019-spring-am', count: 80 });
  assert.deepEqual(inventoryCollectionIdentity('2019r01a-fe-pm'), { scope: '2019-autumn-pm', count: 13 });
  for (const id of ['2016h27a-fe-pm', '2012h24t-fe-am', '2012h24tokubetsu-fe-am', '2019h31a-fe-pm', '2019r01h-fe-am', '2003h15a-fe-pm', '2022r04a-fe-pm', collectionId + '-1'])
    assert.throws(() => inventoryCollectionIdentity(id));
});

test('retained obligations, duplicate collections and malformed or cross-source exclusions cannot be overwritten', () => {
  assert.throws(() => inventoryExtensionRecords(input(), [collectionId + '-1']));
  const duplicate = input(); duplicate.collections.push(structuredClone(duplicate.collections[0]));
  assert.throws(() => inventoryExtensionRecords(duplicate, []));
  const specialAliases: InventoryExtensions = { version: 1, collections:
    ['2011h23tokubetsu-fe-am', '2011h23t-fe-am'].map(collectionId => ({ collectionId, excluded: [] })) };
  assert.throws(() => inventoryExtensionRecords(specialAliases, []), /duplicate source collection/);
  for (const changes of [{ number: 0 }, { number: 14 }, { reason: '' }, { checkedOn: 'unknown' }, { checkedOn: '2026-02-31' }, { sourceId: 'source-ipa-2016h28h-fe-pm-qs' }]) {
    const invalid = input(); Object.assign(invalid.collections[0].excluded[0], changes);
    assert.throws(() => inventoryExtensionRecords(invalid, []));
  }
  const duplicateExclusion = input(); duplicateExclusion.collections[0].excluded.push(structuredClone(duplicateExclusion.collections[0].excluded[0]));
  assert.throws(() => inventoryExtensionRecords(duplicateExclusion, []));
});

test('actual distribution remains bound to all declared obligations and unavailable material holds', () => {
  const b = fixture(), result = validateSourceInventory(b);
  assert.equal(result.included, b.questions.filter(q => q.origin.kind === 'official_reprint').length);
  assert.equal(result.declared, result.included + result.excluded);
  assert.deepEqual(inventoryExtensionRecords({ version: 1, collections: [] }, []), { sources: [], exclusions: {} });
  assert.equal(declarations.version, 1);
});
