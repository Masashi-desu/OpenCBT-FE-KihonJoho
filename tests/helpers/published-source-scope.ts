import assert from 'node:assert/strict';
import {sourceScope, sourceExclusions} from '../../scripts/source-inventory';
import extensionDeclarations from '../../scripts/source-inventory-extensions.json';
import type {InventoryExtensions}from'../../scripts/source-inventory-extension-contract';
import type {Asset, Bundle} from '../../src/core/types';

// The independent inventory fixes the obligations. Never infer these expected
// counts from a catalog, search result, coverage result or the observed fixture.
const extensionCollectionIds = (extensionDeclarations as InventoryExtensions).collections.map(c => c.collectionId);
const belongsToExtension = (sourceId: string) => extensionCollectionIds.some(id => sourceId.startsWith(id + '-'));
const eligibleSourceIds = sourceScope.filter(id => !Object.hasOwn(sourceExclusions, id));
const afternoonCount = eligibleSourceIds.filter(id => /-fe-pm-\d+$/.test(id)).length;
const subjectPoolCounts = {
  A: eligibleSourceIds.filter(id => /-(?:a|fe-am)-\d+$/.test(id)).length,
  B: eligibleSourceIds.filter(id => /-b-\d+$/.test(id)).length,
};
assert.equal(new Set(sourceScope).size, sourceScope.length, 'independent source obligations are unique');
assert(Object.keys(sourceExclusions).every(id => sourceScope.includes(id)), 'every held number remains a declared obligation');
assert.equal(subjectPoolCounts.A + subjectPoolCounts.B + afternoonCount, eligibleSourceIds.length,
  'every eligible source belongs to a subject pool or an explicit afternoon booklet');

export const publishedSourceScope = {
  declaredCount: sourceScope.length,
  excludedCount: Object.keys(sourceExclusions).length,
  originalCount: eligibleSourceIds.length,
  questionCount: eligibleSourceIds.length * 2,
  morningCount: eligibleSourceIds.filter(id => /-fe-am-\d+$/.test(id)).length,
  afternoonCount,
  subjectPoolCounts,
  eligibleSourceIds,
  originalIds: eligibleSourceIds.map(id => 'question-ipa-' + id).sort(),
  extensionCollectionIds,
  retainedExclusionIds: Object.keys(sourceExclusions).filter(id => !belongsToExtension(id)),
} as const;

export function assertPublishedSourceScope(bundle: Bundle): void {
  const originals = bundle.questions.filter(q => q.origin.kind === 'official_reprint');
  assert.deepEqual(originals.map(q => q.id).sort(), publishedSourceScope.originalIds,
    'every independently declared eligible original is present exactly once');
  assert.equal(bundle.questions.length, publishedSourceScope.questionCount,
    'one original and one generated base for every eligible source');
  assert.equal(bundle.templates.length, publishedSourceScope.originalCount,
    'one generation template for every eligible source');
}

// Fixed regression counts for the already-released material cohort remain
// meaningful when a new independently declared booklet adds its own assets.
// Its exact material obligations are checked in that booklet's content tests.
export function isDeclaredExtensionAsset(asset: Pick<Asset, 'id'>): boolean {
  return extensionCollectionIds.some(id => asset.id.startsWith('asset-ipa-' + id + '-'));
}
