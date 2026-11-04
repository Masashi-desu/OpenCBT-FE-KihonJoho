import type { Run, Session, Bundle } from "./types";
import { refOf, refKey } from "./types";
import { sha256 } from "./hash";
import { prepareSnapshot, type Snapshot, type SharedBundle, type SharedAsset, type PreparedSnapshot } from "./storage-snapshot";
import { validateRun, RETENTION_MS } from "./session";
import { DataError, schema, validateBundle } from "./validation";
import { validateAssetBlob } from "./catalog";
import { refreshBookmark, type Bookmark } from "./bookmarks";
import { saveBookmarkBatch } from "./bookmark-storage";
import { STORAGE_VERSION, storageSchemaComplete, upgradeStorageSchema } from "./storage-schema";
import { TemporaryStorage } from "./temporary-storage";
let temporary: TemporaryStorage | undefined;
export function startTemporaryStorage() { temporary ??= new TemporaryStorage(); }
type Saved = {
  id: string;
  session: Session;
  exam: Run["exam"];
  set: Run["set"];
  selection: Run["selection"];
  issued: Run["issued"];
  title: string;
  result?: Run["result"];
  purged?: boolean;
  replacementFor?: string;
  replacementSessionId?: string;
};
type InlineSnapshot = { id: string; bundle: Bundle; assets: Record<string, Blob> };
const DB_NAME = "opencbt-fe-kihonjoho-v2";
const SNAPSHOT_STORES = ["catalogSnapshots", "sharedBundles", "sharedAssets"];
const RECORD_STORES = [...SNAPSHOT_STORES, "generatedInstances", "sessions", "results"];
const RUN_STORES = [...RECORD_STORES, "storagePolicy"];
const PREPARATION_MS = 15 * 60 * 1000;
const MIGRATION_BATCH = 8;
const request = <T>(req: IDBRequest<T>) =>
  new Promise<T>((res, rej) => {
    const timeout = setTimeout(() => {
      try { req.transaction?.abort(); } catch { /* The transaction may already be closed. */ }
      rej(new DataError("STORAGE", "保存データの読取り・書込みが応答しません。再読み込みしてください。"));
    }, 30000);
    req.onsuccess = () => { clearTimeout(timeout); res(req.result); };
    req.onerror = () => { clearTimeout(timeout); rej(req.error); };
  });
let opening: Promise<IDBDatabase> | undefined;
function open(): Promise<IDBDatabase> {
  if (opening) return opening;
  const attempt = new Promise<IDBDatabase>((res, rej) => {
    const req = indexedDB.open(DB_NAME, STORAGE_VERSION);
    let rejected = false;
    const timeout = setTimeout(() => {
      rejected = true;
      rej(new DataError("STORAGE", "保存領域の応答がありません。他のタブを閉じて再読み込みしてください。"));
    }, 15000);
    req.onupgradeneeded = () => {
      if (rejected) { req.transaction!.abort(); return; }
      try { upgradeStorageSchema(req.result, req.transaction!); }
      catch (error) { rejected = true; clearTimeout(timeout); req.transaction!.abort(); rej(error); }
    };
    req.onsuccess = () => {
      clearTimeout(timeout);
      if (rejected) { req.result.close(); return; }
      try {
        if (!storageSchemaComplete(req.result)) throw new DataError("STORAGE", "保存領域の形式がアプリと一致しません。アプリを更新して開き直してください。学習記録は削除していません。");
      } catch (error) {
        req.result.close();
        if (opening === attempt) opening = undefined;
        rej(error);
        return;
      }
      req.result.onclose = () => { if (opening === attempt) opening = undefined; };
      req.result.onversionchange = () => {
        req.result.close();
        if (opening === attempt) opening = undefined;
      };
      res(req.result);
    };
    req.onerror = () => { clearTimeout(timeout); rejected = true; if (opening === attempt) opening = undefined; rej(req.error); };
    req.onblocked = () => { clearTimeout(timeout); rejected = true; if (opening === attempt) opening = undefined; rej(new DataError(
      "STORAGE", "保存領域の更新が別タブにより停止しています。",
    )); };
  });
  opening = attempt;
  // Includes synchronous open() exceptions (permissions / disabled storage).
  void attempt.catch(() => { if (opening === attempt) opening = undefined; });
  return attempt;
}
const done = (tx: IDBTransaction) =>
  new Promise<void>((res, rej) => {
    const timeout = setTimeout(() => {
      try { tx.abort(); } catch { /* Completion could not be confirmed. */ }
      rej(new DataError("STORAGE", "保存処理の完了を確認できません。再読み込みしてください。"));
    }, 30000);
    tx.oncomplete = () => { clearTimeout(timeout); res(); };
    tx.onabort = () => { clearTimeout(timeout); rej(tx.error || new DataError("STORAGE", "保存が中断されました")); };
  });
async function write<T>(db: IDBDatabase, stores: string[], action: (tx: IDBTransaction) => Promise<T>) {
  const tx = db.transaction(stores, "readwrite"), complete = done(tx);
  // A request may fail before the action returns. Keep its transaction rejection
  // observed, then propagate the original error after rollback has completed.
  void complete.catch(() => {});
  try {
    const value = await Promise.race([
      action(tx),
      complete.then(() => { throw new DataError("STORAGE", "保存処理の応答を確認できません。再読み込みしてください。"); }),
    ]);
    await complete;
    return value;
  }
  catch (error) {
    try { tx.abort(); } catch { /* Already completed or aborted. */ }
    await complete.catch(() => {});
    throw error;
  }
}
const inline = (value: InlineSnapshot | Snapshot): value is InlineSnapshot => "bundle" in value;
async function assertAllowed(tx: IDBTransaction, refs: string[]) {
  const policy = await request<{ refs: string[] } | undefined>(tx.objectStore("storagePolicy").get("withdrawals"));
  if (policy?.refs.some(ref => refs.includes(ref)))
    throw new DataError("WITHDRAWN", "取り下げられた問題を含むため保存・復習できません。");
}
async function putSnapshot(tx: IDBTransaction, prepared: PreparedSnapshot, pending = false) {
  await assertAllowed(tx, prepared.shared.questionRefs);
  const bundles = tx.objectStore("sharedBundles"), assets = tx.objectStore("sharedAssets");
  if (await request(bundles.getKey(prepared.shared.id)) === undefined) bundles.add(prepared.shared);
  for (const asset of prepared.assets)
    if (await request(assets.getKey(asset.id)) === undefined) assets.add(asset);
  tx.objectStore("catalogSnapshots").put({
    ...prepared.snapshot, ...(pending ? { pendingUntil: Date.now() + PREPARATION_MS } : {}),
  });
}
async function migrateSnapshot(db: IDBDatabase, old: InlineSnapshot) {
  const prepared = await prepareSnapshot(old.id, old.bundle, old.assets);
  await write(db, [...SNAPSHOT_STORES, "storagePolicy"], async tx => {
    const snapshots = tx.objectStore("catalogSnapshots");
    // A compound index finds any modern pointer for this session without cloning
    // the legacy full bundle a second time. Current app writers only write modern
    // pointers; v3 connections have been closed by the version change.
    const modern = await request(snapshots.index("sessionBundle").getKey(
      IDBKeyRange.bound([old.id], [old.id, []]),
    ));
    if (modern === undefined && await request(snapshots.getKey(old.id)) !== undefined)
      await putSnapshot(tx, prepared);
  });
}
export async function listBookmarks(): Promise<Bookmark[]> {
  if (temporary) return temporary.listBookmarks();
  const db = await open();
  const records = await request<Bookmark[]>(db.transaction("bookmarks").objectStore("bookmarks").getAll());
  for (const record of records) {
    if (!record || typeof record.id !== "string" || typeof record.title !== "string" ||
        !["A", "B"].includes(record.subject) || typeof record.area !== "string" ||
        typeof record.createdAt !== "string" || !Number.isFinite(Date.parse(record.createdAt)) ||
        !record.questionRef || typeof record.questionRef.questionId !== "string" || !Number.isInteger(record.questionRef.revision))
      throw new DataError("STORAGE", "ブックマークの保存データを確認できません。元の記録は保持しています。");
  }
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function saveBookmark(bookmark: Bookmark) { await saveBookmarks([bookmark]); }
export async function saveBookmarks(bookmarks: readonly Bookmark[]) {
  if (temporary) return temporary.saveBookmarks(bookmarks);
  if (!bookmarks.length) return 0;
  return saveBookmarkBatch(await open(), bookmarks);
}
export async function deleteBookmark(id: string) {
  if (temporary) return temporary.deleteBookmark(id);
  await write(await open(), ["bookmarks"], async tx => { tx.objectStore("bookmarks").delete(id); });
}
export async function storeOriginalSnapshot(id: string, bundle: Bundle, assets: Record<string, Blob>) {
  if (temporary) return;
  const prepared = await prepareSnapshot(id, bundle, assets);
  await write(await open(), [...SNAPSHOT_STORES, "storagePolicy"], tx => putSnapshot(tx, prepared, true));
}
export async function saveRun(run: Run) {
  await validateRun(run);
  if (temporary) { temporary.save(run); return; }
  const prepared = await prepareSnapshot(run.session.id, run.bundle, run.assets);
  await write(await open(), RUN_STORES, async tx => {
    await assertAllowed(tx, prepared.shared.questionRefs);
    const saved: Saved = {
      id: run.session.id, session: run.session, exam: run.exam, set: run.set,
      selection: run.selection, issued: run.issued, title: run.set.title,
      ...(run.result ? { result: run.result } : {}),
      ...(run.replacementFor ? { replacementFor: run.replacementFor } : {}),
    };
    const existing = await request<Saved | undefined>(tx.objectStore("sessions").get(saved.id));
    if (existing && existing.session.revision >= run.session.revision)
      throw new DataError("CONFLICT", "別のタブで更新されました。再読込みしてください。");
    if (existing?.replacementSessionId) saved.replacementSessionId = existing.replacementSessionId;
    const snapshot = await request<Snapshot | InlineSnapshot | undefined>(tx.objectStore("catalogSnapshots").get(saved.id));
    if (!snapshot || inline(snapshot) || snapshot.bundleKey !== prepared.snapshot.bundleKey ||
        snapshot.pendingUntil !== undefined || JSON.stringify(snapshot.assetRefs) !== JSON.stringify(prepared.snapshot.assetRefs))
      await putSnapshot(tx, prepared);
    for (const i of run.instances) tx.objectStore("generatedInstances").put(i);
    tx.objectStore("sessions").put(saved);
    if (run.result) tx.objectStore("results").put(run.result);
  });
}
export async function history(): Promise<Saved[]> {
  if (temporary) return temporary.history();
  const db = await open();
  const records = await request<Saved[]>(db.transaction("sessions").objectStore("sessions").getAll());
  for (const record of records) {
    try {
      const updatedAt = record.session?.updatedAt;
      if (typeof updatedAt !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(updatedAt) || !Number.isFinite(Date.parse(updatedAt))) throw Error();
      // Legacy maintenance accepts RFC3339 offsets/fractional precision. Check
      // a metadata copy against today's UTC schema, retaining the original row.
      schema("session", { ...record.session, updatedAt: new Date(updatedAt).toISOString() });
      schema("exam", record.exam); schema("set", record.set);
      if (record.result) schema("result", record.result);
      if (record.id !== record.session.id || typeof record.title !== "string" || !record.selection ||
          !["annual", "mix", "bookmark"].includes(record.selection.kind) || !Array.isArray(record.issued)) throw Error();
      for (const question of record.issued) schema("question", question);
    } catch { throw new DataError("STORAGE", "履歴の保存データを確認できません。元の記録は保持しています。"); }
  }
  return records.sort((a, b) => b.session.updatedAt.localeCompare(a.session.updatedAt));
}
export async function linkLatestRun(previousId: string, replacementId: string) {
  if (temporary) return temporary.link(previousId, replacementId);
  await write(await open(), ["sessions"], async tx => {
    const store = tx.objectStore("sessions"), saved = await request<Saved | undefined>(store.get(previousId));
    if (saved) store.put({ ...saved, replacementSessionId: replacementId });
  });
}
export async function recentGeneration(): Promise<Run["instances"]> {
  if (temporary) return temporary.recent();
  const db = await open();
  return request(db.transaction("generatedInstances").objectStore("generatedInstances").getAll());
}
export async function loadRun(id: string): Promise<Run> {
  if (temporary) { const run = temporary.load(id); await validateRun(run); return run; }
  const db = await open(), tx = db.transaction(RUN_STORES);
  const [saved, snapshot, instances] = await Promise.all([
    request<Saved | undefined>(tx.objectStore("sessions").get(id)),
    request<InlineSnapshot | Snapshot | undefined>(tx.objectStore("catalogSnapshots").get(id)),
    request<Run["instances"]>(tx.objectStore("generatedInstances").index("sessionId").getAll(id)),
  ]);
  if (!saved || !snapshot || saved.purged) throw new DataError(
    "WITHDRAWN", "問題本文は削除されているため、再開・復習できません。",
  );
  let bundle: Bundle, assets: Record<string, Blob>;
  if (inline(snapshot)) ({ bundle, assets } = snapshot);
  else {
    const [shared, blobs] = await Promise.all([
      request<SharedBundle | undefined>(tx.objectStore("sharedBundles").get(snapshot.bundleKey)),
      Promise.all(Object.entries(snapshot.assetRefs).map(async ([assetId, key]) => {
        const value = await request<SharedAsset | undefined>(tx.objectStore("sharedAssets").get(key));
        if (!value) throw new DataError("ASSET_REF", "保存した問題画像がありません");
        return [assetId, value.blob] as const;
      })),
    ]);
    if (!shared) throw new DataError("WITHDRAWN", "保存した問題本文がありません。");
    if (await sha256(JSON.stringify(shared.bundle)) !== snapshot.bundleKey)
      throw new DataError("HASH", "保存した問題本文のハッシュが一致しません。");
    bundle = shared.bundle; assets = Object.fromEntries(blobs);
  }
  await assertAllowed(db.transaction("storagePolicy"), [...new Set(bundle.questions.flatMap(q => [refKey(refOf(q)), ...q.origin.derivedFrom.map(refKey)]))]);
  const run: Run = {
    session: saved.session, exam: saved.exam, set: saved.set, selection: saved.selection,
    issued: saved.issued, bundle, assets, instances,
    ...(saved.result ? { result: saved.result } : {}),
    ...(saved.replacementFor ? { replacementFor: saved.replacementFor } : {}),
  };
  const executableTemplates = new Set(run.instances.map(i => `${i.templateRef.id}@${i.templateRef.revision}`));
  if (run.selection.mode === "endless")
    for (const binding of run.set.generationBindings)
      executableTemplates.add(`${binding.templateRef.id}@${binding.templateRef.revision}`);
  await validateBundle(run.bundle, executableTemplates);
  await validateRun(run);
  await Promise.all([...new Set(run.issued.flatMap(q => q.assetRefs))].map(async id => {
    const a = run.bundle.assets.find(a => a.id === id);
    if (!a || !run.assets[id]) throw new DataError("ASSET_REF", "保存した問題画像がありません");
    await validateAssetBlob(a, run.assets[id]);
  }));
  if (inline(snapshot)) await migrateSnapshot(db, snapshot);
  return run;
}
async function deleteSessionRecords(tx: IDBTransaction, ids: readonly IDBValidKey[]) {
  for (const id of ids) {
    tx.objectStore("sessions").delete(id); tx.objectStore("catalogSnapshots").delete(id);
    for (const name of ["generatedInstances", "results"])
      for (const key of await request(tx.objectStore(name).index("sessionId").getAllKeys(id)))
        tx.objectStore(name).delete(key);
  }
}
async function collectShared(tx: IDBTransaction) {
  const snapshots = tx.objectStore("catalogSnapshots");
  for (const [name, index] of [["sharedBundles", "bundleKey"], ["sharedAssets", "assetKeys"]])
    for (const key of await request(tx.objectStore(name).getAllKeys()))
      if (await request(snapshots.index(index).count(key)) === 0) tx.objectStore(name).delete(key);
}
export async function deleteRuns(ids?: string[]) {
  if (temporary) return temporary.deleteRuns(ids);
  await write(await open(), RUN_STORES, async tx => {
    if (!ids) { for (const name of RECORD_STORES) tx.objectStore(name).clear(); }
    else { await deleteSessionRecords(tx, ids); await collectShared(tx); }
  });
}
async function snapshotKeys(db: IDBDatabase) {
  const tx = db.transaction("catalogSnapshots"), store = tx.objectStore("catalogSnapshots");
  const [all, referenced] = await Promise.all([
    request(store.getAllKeys()), request(store.index("bundleKey").getAllKeys()),
  ]);
  const modern = new Set(referenced);
  return all.filter(key => !modern.has(key));
}
export async function maintainStorage(bundle: Bundle, onProgress?: (completed: number, total: number) => void) {
  if (temporary) { temporary.maintain(bundle, RETENTION_MS); return; }
  for (const bookmark of await listBookmarks()) {
    try {
      const updated = refreshBookmark(bundle, bookmark);
      if (JSON.stringify(updated) !== JSON.stringify(bookmark))
        await write(await open(), ["bookmarks"], async tx => { tx.objectStore("bookmarks").put(updated); });
    } catch (e) {
      if (!(e instanceof DataError) || e.code !== "BOOKMARK_REF") throw e;
      await deleteBookmark(bookmark.id);
    }
  }
  const db = await open(), withdrawn = new Set(bundle.catalog.withdrawals.map(w => refKey(w.questionRef)));
  // Metadata-only indexed lookup, once per withdrawn identity, regardless of how
  // many sessions share the immutable bundle. No full bundle/Blob getAll here.
  await write(db, RUN_STORES, async tx => {
    const policyStore = tx.objectStore("storagePolicy");
    const prior = await request<{ refs: string[] } | undefined>(policyStore.get("withdrawals"));
    prior?.refs.forEach(ref => withdrawn.add(ref));
    policyStore.put({ id: "withdrawals", refs: [...withdrawn] });
    const expired: IDBValidKey[] = [], cutoff = Date.now() - RETENTION_MS;
    // RFC3339 permits equivalent offsets and fractional precision. Compare the
    // instant represented by each indexed key, not its lexicographic position.
    await new Promise<void>((resolve, reject) => {
      const cursor = tx.objectStore("sessions").index("updatedAt").openKeyCursor();
      cursor.onerror = () => reject(cursor.error);
      cursor.onsuccess = () => {
        const entry = cursor.result;
        if (!entry) { resolve(); return; }
        if (Date.parse(String(entry.key)) < cutoff) expired.push(entry.primaryKey);
        entry.continue();
      };
    });
    const affected = new Set<IDBValidKey>(expired);
    for (const ref of withdrawn)
      for (const key of await request(tx.objectStore("sharedBundles").index("questionRefs").getAllKeys(ref)))
        for (const id of await request(tx.objectStore("catalogSnapshots").index("bundleKey").getAllKeys(key))) affected.add(id);
    await deleteSessionRecords(tx, [...affected]);
  });
  // A legacy inline record has no withdrawal index. Every such record must be
  // checked before startup can succeed when notices exist; processing is bounded
  // to one snapshot/transaction instead of retaining all bundles in memory.
  let migrated = 0;
  const legacyKeys = await snapshotKeys(db), checking = withdrawn.size ? legacyKeys : legacyKeys.slice(0, MIGRATION_BATCH);
  if (checking.length) onProgress?.(0, checking.length);
  for (const id of checking) {
    const old = await request<InlineSnapshot | Snapshot | undefined>(db.transaction("catalogSnapshots").objectStore("catalogSnapshots").get(id));
    if (old && inline(old)) {
      if (old.bundle.questions.some(q => withdrawn.has(refKey(refOf(q))) || q.origin.derivedFrom.some(p => withdrawn.has(refKey(p)))))
        await deleteRuns([String(id)]);
      else await migrateSnapshot(db, old);
    }
    onProgress?.(++migrated, checking.length);
  }
  // Include sessions in this transaction: a save committed before it is visible,
  // and a later save cannot interleave between the liveness check and deletion.
  await write(db, RUN_STORES, async tx => {
    const ids = new Set(await request(tx.objectStore("sessions").getAllKeys()));
    const snapshots = tx.objectStore("catalogSnapshots");
    for (const id of await request(snapshots.getAllKeys())) if (!ids.has(id)) {
      const value = await request<Snapshot | InlineSnapshot>(snapshots.get(id));
      if (inline(value) || !value.pendingUntil || value.pendingUntil <= Date.now()) snapshots.delete(id);
    }
    for (const name of ["generatedInstances", "results"]) {
      // The index cursor yields session IDs and record keys without cloning the
      // generated question or result payload.
      await new Promise<void>((resolve, reject) => {
        const cursor = tx.objectStore(name).index("sessionId").openKeyCursor();
        cursor.onerror = () => reject(cursor.error);
        cursor.onsuccess = () => {
          const entry = cursor.result;
          if (!entry) { resolve(); return; }
          if (!ids.has(entry.key)) tx.objectStore(name).delete(entry.primaryKey);
          entry.continue();
        };
      });
    }
    await collectShared(tx);
  });
}
export function acquireRunLock(id: string, onConflict: () => void): () => void {
  if (temporary) return () => {};
  const controller = new AbortController();
  let release = () => {};
  if (!navigator.locks) {
    onConflict();
    return () => {};
  }
  const timeout = setTimeout(() => {
    controller.abort();
    onConflict();
  }, 15000);
  try { void navigator.locks
    .request(
      `opencbt:${id}`,
      { ifAvailable: true, signal: controller.signal },
      async (lock) => {
        clearTimeout(timeout);
        if (controller.signal.aborted) return;
        if (!lock) {
          onConflict();
          return;
        }
        await new Promise<void>((res) => {
          release = res;
        });
      },
    )
    .catch(() => { clearTimeout(timeout); if (!controller.signal.aborted) onConflict(); });
  } catch { clearTimeout(timeout); onConflict(); }
  return () => {
    clearTimeout(timeout);
    release();
    controller.abort();
  };
}
