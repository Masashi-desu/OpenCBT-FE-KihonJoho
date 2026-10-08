import test from "node:test";
import assert from "node:assert/strict";
import type { Bookmark } from "../src/core/bookmarks";
import { saveBookmarkBatch } from "../src/core/bookmark-storage";

test("bookmark batches preserve atomicity when storage requests fail", async () => {
  const records = new Map<string, Bookmark>();
  const failure = new DOMException("Storage failure", "QuotaExceededError");
  let failWrite: number | undefined, failRead = false, failAsyncWrite = false, aborts = 0;
  // Model the IndexedDB boundary: writes commit at the end of the turn,
  // while abort discards them. Browser verification also uses native IndexedDB.
  const db = {
    transaction() {
      const pending: Bookmark[] = [];
      let aborted = false, writes = 0;
      const tx = {
        error: null,
        oncomplete: undefined as (() => void) | undefined,
        onerror: undefined as (() => void) | undefined,
        onabort: undefined as (() => void) | undefined,
        abort() {
          if (aborted) throw new DOMException("Already aborted", "InvalidStateError");
          aborted = true;
          aborts++;
          queueMicrotask(() => tx.onabort?.());
        },
        objectStore() {
          return {
            getAll() {
              const request = {
                result: [] as Bookmark[],
                error: failure,
                onsuccess: undefined as (() => void) | undefined,
                onerror: undefined as (() => void) | undefined,
              };
              queueMicrotask(() => {
                if (failRead) {
                  tx.abort();
                  request.onerror?.();
                } else {
                  request.result = [...records.values()];
                  request.onsuccess?.();
                }
              });
              return request;
            },
            put(bookmark: Bookmark) {
              if (++writes === failWrite) throw failure;
              pending.push(structuredClone(bookmark));
              if (failAsyncWrite && writes === 2)
                queueMicrotask(() => tx.abort());
            },
          };
        },
      };
      setImmediate(() => {
        if (aborted) return;
        for (const bookmark of pending) records.set(bookmark.id, bookmark);
        tx.oncomplete?.();
      });
      return tx;
    },
  };
  const database = db as unknown as IDBDatabase;
  const candidates: Bookmark[] = [1, 2].map((n) => ({
    id: `bookmark-${n}`,
    questionRef: { questionId: `question-${n}`, revision: 1 },
    title: `問題${n}`,
    subject: "A",
    area: "technology",
    createdAt: "2026-10-08T00:00:00.000Z",
  }));

  failWrite = 2;
  await assert.rejects(saveBookmarkBatch(database, candidates), (error) => error === failure);
  assert.equal(aborts, 1);
  assert.equal(records.size, 0, "a synchronous failure must not leave earlier writes");

  failWrite = undefined;
  failRead = true;
  await assert.rejects(saveBookmarkBatch(database, candidates), (error) => error === failure);
  assert.equal(records.size, 0);

  failRead = false;
  failAsyncWrite = true;
  await assert.rejects(saveBookmarkBatch(database, candidates), /保存が中断されました/);
  assert.equal(records.size, 0);

  failAsyncWrite = false;
  assert.equal(await saveBookmarkBatch(database, candidates), 2);
  assert.deepEqual([...records.values()], candidates);
  assert.equal(await saveBookmarkBatch(database,
    [...candidates, ...candidates].map((bookmark) => ({ ...bookmark, createdAt: "later" })),
  ), 0);
  assert.deepEqual([...records.values()], candidates, "existing timestamps must survive a retry");
});
