import type { Bookmark } from "./bookmarks";
import { DataError } from "./errors";

export function saveBookmarkBatch(
  db: IDBDatabase,
  bookmarks: readonly Bookmark[],
): Promise<number> {
  if (!bookmarks.length) return Promise.resolve(0);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bookmarks", "readwrite");
    let added = 0, failure: unknown;
    tx.oncomplete = () => resolve(added);
    tx.onabort = () => reject(
      failure ?? tx.error ?? new DataError("STORAGE", "保存が中断されました"),
    );
    const abort = (error: unknown) => {
      failure = error;
      try {
        tx.abort();
      } catch {
        // An already aborted transaction must preserve the original failure.
        reject(error);
      }
    };
    try {
      const store = tx.objectStore("bookmarks");
      const reading = store.getAll();
      reading.onerror = () => { failure = reading.error; };
      reading.onsuccess = () => {
        try {
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
