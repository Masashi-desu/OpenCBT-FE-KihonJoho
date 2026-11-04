import type { Bookmark } from "./bookmarks";
import { DataError } from "./errors";

export function saveBookmarkBatch(
  db: IDBDatabase,
  bookmarks: readonly Bookmark[],
): Promise<number> {
  if (!bookmarks.length) return Promise.resolve(0);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bookmarks", "readwrite");
    let added = 0, failure: unknown, readComplete = false;
    const timeout = setTimeout(() => {
      failure = new DataError("STORAGE", "ブックマークの保存処理が応答しません。再読み込みしてください。");
      try { tx.abort(); } catch { /* Completion could not be confirmed. */ }
      reject(failure);
    }, 30000);
    tx.oncomplete = () => {
      clearTimeout(timeout);
      if (!readComplete) reject(new DataError("STORAGE", "ブックマークの保存処理の応答を確認できません。再読み込みしてください。"));
      else resolve(added);
    };
    tx.onabort = () => {
      clearTimeout(timeout);
      reject(failure ?? tx.error ?? new DataError("STORAGE", "保存が中断されました"));
    };
    const abort = (error: unknown) => {
      failure = error;
      try {
        tx.abort();
      } catch {
        // An already aborted transaction must preserve the original failure.
        clearTimeout(timeout);
        reject(error);
      }
    };
    try {
      const store = tx.objectStore("bookmarks");
      const reading = store.getAll();
      reading.onerror = () => { failure = reading.error; };
      reading.onsuccess = () => {
        try {
          readComplete = true;
          const existing = new Set(
            (reading.result as Bookmark[]).map((bookmark) => bookmark.id),
          );
          for (const bookmark of bookmarks) {
            if (existing.has(bookmark.id)) continue;
            store.put(bookmark);
            existing.add(bookmark.id);
            added++;
          }
        } catch (error) {
          abort(error);
        }
      };
    } catch (error) {
      abort(error);
    }
  });
}
