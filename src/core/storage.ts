import type { Run, Session, Bundle } from "./types";
import { refOf, refKey } from "./types";
import { validateRun, RETENTION_MS } from "./session";
import { DataError, validateBundle } from "./validation";
import { validateAssetBlob } from "./catalog";
import { bookmarkSource, type Bookmark } from "./bookmarks";
import { saveBookmarkBatch } from "./bookmark-storage";
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
};
const request = <T>(req: IDBRequest<T>) =>
  new Promise<T>((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
let opening: Promise<IDBDatabase> | undefined;
const open = () =>
  (opening ??= new Promise((res, rej) => {
    const req = indexedDB.open("opencbt-fe-kihonjoho-v2", 3);
    req.onupgradeneeded = () => {
      for (const name of [
        "catalogSnapshots",
        "generatedInstances",
        "sessions",
        "results",
        "bookmarks",
      ])
        if (!req.result.objectStoreNames.contains(name))
          req.result.createObjectStore(name, { keyPath: "id" });
    };
    req.onsuccess = () => {
      req.result.onversionchange = () => {
        req.result.close();
        opening = undefined;
      };
      res(req.result);
    };
    req.onerror = () => rej(req.error);
    req.onblocked = () =>
      rej(
        new DataError(
          "STORAGE",
          "保存領域の更新が別タブにより停止しています。",
        ),
      );
  }));
const done = (tx: IDBTransaction) =>
  new Promise<void>((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () =>
      rej(tx.error || new DataError("STORAGE", "保存が中断されました"));
  });
export async function listBookmarks(): Promise<Bookmark[]> {
  const db = await open();
  const records = await request<Bookmark[]>(
    db.transaction("bookmarks").objectStore("bookmarks").getAll(),
  );
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function saveBookmark(bookmark: Bookmark) {
  await saveBookmarks([bookmark]);
}
export async function saveBookmarks(bookmarks: readonly Bookmark[]) {
  if (!bookmarks.length) return 0;
  return saveBookmarkBatch(await open(), bookmarks);
}
export async function deleteBookmark(id: string) {
  const db = await open(),
    tx = db.transaction("bookmarks", "readwrite"),
    complete = done(tx);
  tx.objectStore("bookmarks").delete(id);
  await complete;
}
export async function storeOriginalSnapshot(
  id: string,
  bundle: Bundle,
  assets: Record<string, Blob>,
) {
  const db = await open(),
    tx = db.transaction("catalogSnapshots", "readwrite"),
    complete = done(tx);
  tx.objectStore("catalogSnapshots").put({ id, bundle, assets });
  await complete;
}
export async function saveRun(run: Run) {
  await validateRun(run);
  const db = await open(),
    tx = db.transaction(
      ["catalogSnapshots", "generatedInstances", "sessions", "results"],
      "readwrite",
    ),
    complete = done(tx);
  const saved: Saved = {
    id: run.session.id,
    session: run.session,
    exam: run.exam,
    set: run.set,
    selection: run.selection,
    issued: run.issued,
    title: run.set.title,
    ...(run.result ? { result: run.result } : {}),
  };
  const existing = (await request(tx.objectStore("sessions").get(saved.id))) as
    | Saved
    | undefined;
  if (existing && existing.session.revision >= run.session.revision) {
    tx.abort();
    await complete.catch(() => {});
    throw new DataError(
      "CONFLICT",
      "別のタブで更新されました。再読込みしてください。",
    );
  }
  tx.objectStore("catalogSnapshots").put({
    id: run.session.id,
    bundle: run.bundle,
    assets: run.assets,
  });
  for (const i of run.instances) tx.objectStore("generatedInstances").put(i);
  tx.objectStore("sessions").put(saved);
  if (run.result) tx.objectStore("results").put(run.result);
  await complete;
}
export async function history(): Promise<Saved[]> {
  const db = await open();
  return (
    (await request(
      db.transaction("sessions").objectStore("sessions").getAll(),
    )) as Saved[]
  ).sort((a, b) => b.session.updatedAt.localeCompare(a.session.updatedAt));
}
export async function recentGeneration(): Promise<Run["instances"]> {
  const db = await open();
  return request(
    db
      .transaction("generatedInstances")
      .objectStore("generatedInstances")
      .getAll(),
  );
}
export async function loadRun(id: string): Promise<Run> {
  const db = await open(),
    tx = db.transaction([
      "sessions",
      "catalogSnapshots",
      "generatedInstances",
      "results",
    ]);
  const [saved, snapshot, all] = await Promise.all([
    request(tx.objectStore("sessions").get(id)),
    request(tx.objectStore("catalogSnapshots").get(id)),
    request(tx.objectStore("generatedInstances").getAll()),
  ]);
  if (!saved || !snapshot || saved.purged)
    throw new DataError(
      "WITHDRAWN",
      "問題本文は削除されているため、再開・復習できません。",
    );
  const run: Run = {
    session: saved.session,
    exam: saved.exam,
    set: saved.set,
    selection: saved.selection,
    issued: saved.issued,
    bundle: snapshot.bundle,
    assets: snapshot.assets,
    instances: all.filter((i) => i.sessionId === id),
    ...(saved.result ? { result: saved.result } : {}),
  };
  await validateBundle(run.bundle);
  await validateRun(run);
  await Promise.all(
    [...new Set(run.issued.flatMap((q) => q.assetRefs))].map(async (id) => {
      const a = run.bundle.assets.find((a) => a.id === id);
      if (!a || !run.assets[id])
        throw new DataError("ASSET_REF", "保存した問題画像がありません");
      await validateAssetBlob(a, run.assets[id]);
    }),
  );
  return run;
}
export async function deleteRuns(ids?: string[]) {
  const db = await open(),
    tx = db.transaction(
      ["sessions", "catalogSnapshots", "generatedInstances", "results"],
      "readwrite",
    ),
    complete = done(tx);
  if (!ids) {
    for (const name of [
      "sessions",
      "catalogSnapshots",
      "generatedInstances",
      "results",
    ])
      tx.objectStore(name).clear();
  } else {
    const instances = await request(
        tx.objectStore("generatedInstances").getAll(),
      ),
      results = await request(tx.objectStore("results").getAll());
    for (const id of ids) {
      tx.objectStore("sessions").delete(id);
      tx.objectStore("catalogSnapshots").delete(id);
    }
    for (const i of instances)
      if (ids.includes(i.sessionId))
        tx.objectStore("generatedInstances").delete(i.id);
    for (const r of results)
      if (ids.includes(r.sessionId)) tx.objectStore("results").delete(r.id);
  }
  await complete;
}
export async function maintainStorage(bundle: Bundle) {
  for (const bookmark of await listBookmarks()) {
    try {
      bookmarkSource(bundle, bookmark.questionRef);
    } catch (e) {
      if (!(e instanceof DataError) || e.code !== "BOOKMARK_REF") throw e;
      await deleteBookmark(bookmark.id);
    }
  }
  const records = await history();
  const expired = records
    .filter((r) => Date.now() - Date.parse(r.session.updatedAt) > RETENTION_MS)
    .map((r) => r.id);
  if (expired.length) await deleteRuns(expired);
  if (bundle.catalog.withdrawals.length) {
    const ids = new Set(
      bundle.catalog.withdrawals.map((w) => refKey(w.questionRef)),
    );
    // Conservative purge of every old snapshot containing affected content, including unissued originals.
    for (const r of records) {
      if (expired.includes(r.id) || r.purged) continue;
      const run = await loadRun(r.id);
      if (
        run.bundle.questions.some(
          (q) =>
            ids.has(refKey(refOf(q))) ||
            q.origin.derivedFrom.some((p) => ids.has(refKey(p))),
        )
      )
        await deleteRuns([r.id]);
    }
  }
  const ids = new Set((await history()).map((r) => r.id)),
    db = await open(),
    tx = db.transaction(
      ["catalogSnapshots", "generatedInstances", "results"],
      "readwrite",
    ),
    complete = done(tx);
  const [snapshots, instances, results] = await Promise.all(
    ["catalogSnapshots", "generatedInstances", "results"].map((name) =>
      request(tx.objectStore(name).getAll()),
    ),
  );
  for (const s of snapshots)
    if (!ids.has(s.id)) tx.objectStore("catalogSnapshots").delete(s.id);
  for (const record of instances)
    if (!ids.has(record.sessionId))
      tx.objectStore("generatedInstances").delete(record.id);
  for (const record of results)
    if (!ids.has(record.sessionId)) tx.objectStore("results").delete(record.id);
  await complete;
}
export function acquireRunLock(id: string, onConflict: () => void): () => void {
  const controller = new AbortController();
  let release = () => {};
  if (!navigator.locks) {
    onConflict();
    return () => {};
  }
  void navigator.locks
    .request(
      `opencbt:${id}`,
      { ifAvailable: true, signal: controller.signal },
      async (lock) => {
        if (!lock) {
          onConflict();
          return;
        }
        await new Promise<void>((res) => {
          release = res;
        });
      },
    )
    .catch(() => {});
  return () => {
    release();
    controller.abort();
  };
}
