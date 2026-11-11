import test from "node:test";
import assert from "node:assert/strict";
import { STORAGE_VERSION, STORAGE_STORES, upgradeStorageSchema, storageSchemaComplete } from "../../src/core/storage-schema";

function model() {
  const stores = new Map<string, any>(), changes: string[] = [];
  const names = (values: () => string[]) => ({ contains: (name: string) => values().includes(name) });
  const db: any = {
    objectStoreNames: names(() => [...stores.keys()]),
    createObjectStore(name: string, options: any) {
      assert(!stores.has(name)); changes.push("store:" + name);
      const indexes = new Map<string, any>(), rows = new Map<string, unknown>();
      const store = { keyPath: options.keyPath, indexes, rows,
        indexNames: names(() => [...indexes.keys()]),
        index: (name: string) => indexes.get(name),
        createIndex(name: string, keyPath: any, options: any) {
          assert(!indexes.has(name)); changes.push("index:" + name);
          indexes.set(name, { keyPath, multiEntry: options.multiEntry ?? false, unique: options.unique ?? false });
        },
      };
      stores.set(name, store); return store;
    },
    transaction() { return tx; },
  };
  const tx: any = { objectStore(name: string) { assert(stores.has(name)); return stores.get(name); } };
  return { db: db as IDBDatabase, tx: tx as IDBTransaction, stores, changes };
}

test("storage upgrades past the affected v4 and creates every required store and exact index", () => {
  assert(STORAGE_VERSION > 4);
  const m = model(); upgradeStorageSchema(m.db, m.tx);
  assert.deepEqual([...m.stores.keys()].sort(), [...STORAGE_STORES].sort());
  assert.deepEqual([...m.stores].flatMap(([store, s]) => [...s.indexes].map(([name, value]: any) => [store, name, value.keyPath, value.multiEntry])), [
    ["catalogSnapshots", "bundleKey", "bundleKey", false],
    ["catalogSnapshots", "sessionBundle", ["id", "bundleKey"], false],
    ["catalogSnapshots", "assetKeys", "assetKeys", true],
    ["sharedBundles", "questionRefs", "questionRefs", true],
    ["generatedInstances", "sessionId", "sessionId", false],
    ["sessions", "updatedAt", "session.updatedAt", false],
    ["results", "sessionId", "sessionId", false],
  ]);
  assert(storageSchemaComplete(m.db));
});

test("the observed seven-store v4 gains only storagePolicy and two indexes while all existing rows survive", () => {
  const m = model(); upgradeStorageSchema(m.db, m.tx);
  m.stores.delete("storagePolicy"); m.stores.get("sessions").indexes.delete("updatedAt"); m.stores.get("catalogSnapshots").indexes.delete("sessionBundle");
  for (const [name, store] of m.stores) store.rows.set("saved", { name, answer: "kept", at: "2026-11-04T00:00:00Z" });
  const before = new Map([...m.stores].map(([name, store]) => [name, { store, rows: structuredClone([...store.rows]) }]));
  assert(!storageSchemaComplete(m.db)); m.changes.length = 0;
  upgradeStorageSchema(m.db, m.tx);
  assert.deepEqual(m.changes, ["store:storagePolicy", "index:updatedAt", "index:sessionBundle"]);
  for (const [name, saved] of before) { assert.equal(m.stores.get(name), saved.store); assert.deepEqual([...saved.store.rows], saved.rows); }
  assert(storageSchemaComplete(m.db)); m.changes.length = 0;
  upgradeStorageSchema(m.db, m.tx); assert.deepEqual(m.changes, [], "reopening is idempotent");
});

test("schema validation rejects missing stores or indexes and incompatible definitions without modifying records", () => {
  for (const defect of [
    (m: ReturnType<typeof model>) => m.stores.delete("bookmarks"),
    (m: ReturnType<typeof model>) => m.stores.get("sessions").indexes.delete("updatedAt"),
    (m: ReturnType<typeof model>) => { m.stores.get("sessions").keyPath = "wrong"; },
    (m: ReturnType<typeof model>) => { m.stores.get("sessions").indexes.get("updatedAt").keyPath = "updatedAt"; },
    (m: ReturnType<typeof model>) => { m.stores.get("catalogSnapshots").indexes.get("assetKeys").multiEntry = false; },
    (m: ReturnType<typeof model>) => { m.stores.get("results").indexes.get("sessionId").unique = true; },
  ]) {
    const m = model(); upgradeStorageSchema(m.db, m.tx); defect(m); m.changes.length = 0;
    assert.equal(storageSchemaComplete(m.db), false); assert.deepEqual(m.changes, []);
  }
});
