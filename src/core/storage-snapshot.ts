import type { Bundle } from "./types";
import { refKey, refOf } from "./types";
import { sha256 } from "./hash";

export type Snapshot = {
  id: string;
  bundleKey: string;
  assetRefs: Record<string, string>;
  assetKeys: string[];
  // A snapshot is saved before binding. Maintenance must not collect an active
  // preparation merely because its session has not been committed yet.
  pendingUntil?: number;
};
export type SharedBundle = { id: string; bundle: Bundle; questionRefs: string[] };
export type SharedAsset = { id: string; blob: Blob };
export type PreparedSnapshot = { snapshot: Snapshot; shared: SharedBundle; assets: SharedAsset[] };
const blobHashes = new WeakMap<Blob, Promise<string>>();
export async function prepareSnapshot(id: string, bundle: Bundle, assets: Record<string, Blob>): Promise<PreparedSnapshot> {
  // JSON byte identity is sufficient for deduplication; semantic equality with a
  // different property order may occupy a second entry, never reuse wrong data.
  const bundleKey = await sha256(JSON.stringify(bundle));
  const storedAssets = await Promise.all(Object.entries(assets).map(async ([assetId, blob]) => {
    let hash = blobHashes.get(blob);
    if (!hash) { hash = blob.arrayBuffer().then(sha256); blobHashes.set(blob, hash); }
    // MIME type is part of Blob identity and must also survive restoration.
    return { assetId, id: `${await hash}:${blob.type}`, blob };
  }));
  const assetRefs = Object.fromEntries(storedAssets.map(a => [a.assetId, a.id]));
  return {
    snapshot: { id, bundleKey, assetRefs, assetKeys: [...new Set(Object.values(assetRefs))] },
    shared: { id: bundleKey, bundle, questionRefs: [...new Set(bundle.questions.flatMap(q =>
      [refKey(refOf(q)), ...q.origin.derivedFrom.map(refKey)]))] },
    assets: storedAssets.map(({ id, blob }) => ({ id, blob })),
  };
}
