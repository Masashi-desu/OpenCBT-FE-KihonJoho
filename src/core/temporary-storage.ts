import type { Bundle, Run } from "./types";
import type { Bookmark } from "./bookmarks";
import { DataError } from "./errors";
import { refreshBookmark } from "./bookmarks";

// Explicitly selected, per-tab storage. Never reads or modifies IndexedDB.
export class TemporaryStorage {
  private runs = new Map<string, Run>();
  private bookmarks = new Map<string, Bookmark>();
  private replacements = new Map<string, string>();
  save(run: Run) {
    const previous = this.runs.get(run.session.id);
    if (previous && previous.session.revision >= run.session.revision)
      throw new DataError("CONFLICT", "新しい解答が既に記録されています。");
    this.runs.set(run.session.id, structuredClone(run));
  }
  load(id: string) {
    const run = this.runs.get(id);
    if (!run) throw new DataError("STORAGE", "このタブの一時記録がありません。新しい練習を選んでください。");
    return structuredClone(run);
  }
  history() {
    return [...this.runs.values()].map(run => {
      const { session, exam, set, selection, issued, result, replacementFor } = run;
      return structuredClone({ id: session.id, session, exam, set, selection, issued, title: set.title,
        ...(result ? { result } : {}), ...(replacementFor ? { replacementFor } : {}),
        ...(this.replacements.has(session.id) ? { replacementSessionId: this.replacements.get(session.id) } : {}) });
    }).sort((a, b) => b.session.updatedAt.localeCompare(a.session.updatedAt));
  }
  recent() { return structuredClone([...this.runs.values()].flatMap(run => run.instances)); }
  listBookmarks() { return structuredClone([...this.bookmarks.values()]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  saveBookmarks(bookmarks: readonly Bookmark[]) {
    let count = 0;
    for (const bookmark of structuredClone(bookmarks)) {
      if (this.bookmarks.has(bookmark.id)) continue;
      count++;
      this.bookmarks.set(bookmark.id, bookmark);
    }
    return count;
  }
  deleteBookmark(id: string) { this.bookmarks.delete(id); }
  deleteRuns(ids?: string[]) {
    for (const id of ids ?? this.runs.keys()) { this.runs.delete(id); this.replacements.delete(id); }
  }
  link(previous: string, replacement: string) { if (this.runs.has(previous)) this.replacements.set(previous, replacement); }
  maintain(bundle: Bundle, retention: number) {
    for (const [id, bookmark] of this.bookmarks) {
      try { this.bookmarks.set(id, refreshBookmark(bundle, bookmark)); }
      catch (error) { if (error instanceof DataError && error.code === "BOOKMARK_REF") this.bookmarks.delete(id); else throw error; }
    }
    const withdrawn = new Set(bundle.catalog.withdrawals.map(w => `${w.questionRef.questionId}@${w.questionRef.revision}`));
    for (const [id, run] of this.runs)
      if (Date.parse(run.session.updatedAt) < Date.now() - retention || run.bundle.questions.some(q =>
        withdrawn.has(`${q.id}@${q.revision}`) || q.origin.derivedFrom.some(ref => withdrawn.has(`${ref.questionId}@${ref.revision}`)))) this.deleteRuns([id]);
  }
}
