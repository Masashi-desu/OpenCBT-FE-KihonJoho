import type { BookmarkAccuracy } from "../core/bookmark-accuracy";
import type { Bookmark } from "../core/bookmarks";
import { sourceQuestionYear } from "../core/source-label";
import { refKey, refOf, type Bundle } from "../core/types";

export type BookmarkSortField = "createdAt" | "accuracy" | "year";

export function sortBookmarks(
  bookmarks: readonly Bookmark[],
  field: BookmarkSortField,
  ascending: boolean,
  statistics: ReadonlyMap<string, BookmarkAccuracy>,
  bundle: Bundle | undefined,
): Bookmark[] {
  const questions = field === "year" && bundle
    ? new Map(bundle.questions.map(question => [refKey(refOf(question)), question]))
    : undefined;
  const rows = bookmarks.map(bookmark => {
    const added = Date.parse(bookmark.createdAt);
    let value: number | undefined = added;
    if (field === "accuracy") value = statistics.get(bookmark.id)?.accuracyPercent ?? undefined;
    if (field === "year") {
      const question = questions?.get(refKey(bookmark.questionRef));
      value = question && bundle ? sourceQuestionYear(question, bundle) : undefined;
    }
    return { bookmark, added, value };
  });
  return rows.sort((a, b) => {
    const byAdded = b.added - a.added;
    if (a.value === undefined || b.value === undefined)
      return Number(a.value === undefined) - Number(b.value === undefined) || byAdded;
    return (ascending ? a.value - b.value : b.value - a.value) || byAdded;
  }).map(row => row.bookmark);
}
