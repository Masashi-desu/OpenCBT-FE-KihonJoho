import assert from 'node:assert/strict';

export type InventoryExclusion = { reason: string; sourceId: string; checkedOn: string };
export type InventoryExtensions = { version: number; collections: { collectionId: string; excluded: (InventoryExclusion & { number: number })[] }[] };

export function inventoryCollectionIdentity(id: string) {
  const match = /^(20\d{2})(h\d{2}|r\d{2})([hat])-fe-(am|pm)$/.exec(id);
  assert(match, 'source inventory: explicit historical collection identity');
  const year = Number(match[1]), era = year === 2019 && match[3] !== 'h' ? 'r01' : 'h' + String(year - 1988).padStart(2, '0');
  assert(year >= 2004 && year <= 2019 && match[2] === era, 'source inventory: known year/era scope; earlier acquisition boundaries remain separate');
  return { scope: `${year}-${({ h: 'spring', a: 'autumn', t: 'special' } as Record<string, string>)[match[3]]}-${match[4]}`, count: match[4] === 'am' ? 80 : 13 };
}

/** Extends obligations independently of the released catalogue. An exclusion
 * is retained as an obligation and never silently removed from the source list. */
export function inventoryExtensionRecords(input: InventoryExtensions, retainedIds: readonly string[]) {
  assert.deepEqual(Object.keys(input).sort(), ['collections', 'version']);
  assert.equal(input.version, 1); assert(Array.isArray(input.collections));
  const sources: string[] = [], exclusions: Record<string, InventoryExclusion> = {}, seen = new Set(retainedIds), collections = new Set<string>();
  for (const collection of input.collections) {
    assert.deepEqual(Object.keys(collection).sort(), ['collectionId', 'excluded']);
    const { count } = inventoryCollectionIdentity(collection.collectionId);
    assert(!collections.has(collection.collectionId), 'duplicate source collection'); collections.add(collection.collectionId);
    const ids = Array.from({ length: count }, (_, i) => collection.collectionId + '-' + (i + 1));
    assert(ids.every(id => !seen.has(id)), 'new source declaration cannot replace retained obligations');
    ids.forEach(id => seen.add(id)); sources.push(...ids);
    assert(Array.isArray(collection.excluded));
    let previous = 0;
    for (const exclusion of collection.excluded) {
      assert.deepEqual(Object.keys(exclusion).sort(), ['checkedOn', 'number', 'reason', 'sourceId']);
      assert(Number.isSafeInteger(exclusion.number) && exclusion.number > previous && exclusion.number <= count, 'unique ordered official exclusion number');
      assert(typeof exclusion.reason === 'string' && exclusion.reason.trim().length > 10, 'explicit material exclusion reason');
      assert(typeof exclusion.sourceId === 'string' && exclusion.sourceId.startsWith('source-ipa-' + collection.collectionId + '-'), 'exclusion source belongs to the collection');
      assert(/^\d{4}-\d{2}-\d{2}$/.test(exclusion.checkedOn), 'exclusion review date');
      assert.equal(new Date(exclusion.checkedOn + 'T00:00:00Z').toISOString().slice(0, 10), exclusion.checkedOn, 'valid calendar review date');
      const { number, ...value } = exclusion;
      exclusions[collection.collectionId + '-' + number] = value; previous = number;
    }
  }
  return { sources, exclusions };
}
