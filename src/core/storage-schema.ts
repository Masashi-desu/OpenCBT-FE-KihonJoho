// IndexedDB's version is separate from the question/data Schema version.
// v5 completes older v4 databases missing storagePolicy and lookup indexes.
export const STORAGE_VERSION = 5;
export const STORAGE_STORES = [
  "catalogSnapshots", "sharedBundles", "sharedAssets", "generatedInstances",
  "sessions", "results", "storagePolicy", "bookmarks",
] as const;
const indexes: readonly [string, string, string | string[], boolean?][] = [
  ["sessions", "updatedAt", "session.updatedAt"],
  ["generatedInstances", "sessionId", "sessionId"],
  ["results", "sessionId", "sessionId"],
  ["catalogSnapshots", "bundleKey", "bundleKey"],
  ["catalogSnapshots", "sessionBundle", ["id", "bundleKey"]],
  ["catalogSnapshots", "assetKeys", "assetKeys", true],
  ["sharedBundles", "questionRefs", "questionRefs", true],
];

// Only additive schema changes: existing stores, rows and indexes stay intact.
// Existing inline bundles are deliberately not read during upgrade.
export function upgradeStorageSchema(db: IDBDatabase, tx: IDBTransaction) {
  for (const name of STORAGE_STORES)
    if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
  for (const [store, name, keyPath, multiEntry = false] of indexes) {
    const target = tx.objectStore(store);
    if (!target.indexNames.contains(name)) target.createIndex(name, keyPath, { multiEntry });
  }
}

// Opening at the same version does not run onupgradeneeded. Refuse an incomplete
// schema at this boundary instead of failing later with a raw transaction error.
export function storageSchemaComplete(db: IDBDatabase): boolean {
  if (STORAGE_STORES.some(name => !db.objectStoreNames.contains(name))) return false;
  const tx = db.transaction([...STORAGE_STORES], "readonly");
  if (STORAGE_STORES.some(name => tx.objectStore(name).keyPath !== "id")) return false;
  return indexes.every(([store, name, keyPath, multiEntry = false]) => {
    const target = tx.objectStore(store);
    if (!target.indexNames.contains(name)) return false;
    const index = target.index(name);
    return JSON.stringify(index.keyPath) === JSON.stringify(keyPath) && index.multiEntry === multiEntry && !index.unique;
  });
}
