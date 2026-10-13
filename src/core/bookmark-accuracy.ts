import type { Bundle, Result, Session } from "./types";
import type { Bookmark } from "./bookmarks";
import { generationCoverage } from "./generation-coverage";

export const BOOKMARK_ANSWER_LIMIT = 20;

export type BookmarkAccuracy = {
  answered: number;
  correct: number;
  accuracyPercent: number | null;
};

export type BookmarkHistory = {
  session: Pick<Session, "id" | "status" | "entries">;
  result?: Pick<Result, "generatedAt" | "validity" | "entries">;
  purged?: boolean;
};

export function bookmarkAccuracy(
  bundle: Bundle,
  bookmarks: readonly Bookmark[],
  history: readonly BookmarkHistory[],
): Map<string, BookmarkAccuracy> {
  const statistics = new Map<string, BookmarkAccuracy>(
    bookmarks.map((bookmark) => [
      bookmark.id,
      { answered: 0, correct: 0, accuracyPercent: null },
    ]),
  );
  if (!statistics.size) return statistics;

  const sources = new Map<string, string>();
  for (const row of generationCoverage(bundle).rows) {
    if (!statistics.has(row.original.id)) continue;
    sources.set(row.original.id, row.original.id);
    for (const template of row.linked)
      sources.set(template.baseQuestionRef.questionId, row.original.id);
  }
  // Question IDs identify the source across published revisions. Result refs
  // identify issued instances, so use the corresponding session source refs.
  const completed = history.filter(
    (record) =>
      !record.purged &&
      ["completed", "expired"].includes(record.session.status) &&
      record.result?.validity === "valid",
  ).sort(
    (a, b) =>
      Date.parse(b.result!.generatedAt) - Date.parse(a.result!.generatedAt) ||
      b.session.id.localeCompare(a.session.id),
  );
  for (const record of completed) {
    const entries = record.result!.entries;
    // Answers within one run share its finish time; later questions come first.
    for (let index = entries.length - 1; index >= 0; index--) {
      const outcome = entries[index].outcome;
      if (outcome !== "correct" && outcome !== "incorrect") continue;
      const entry = record.session.entries[index];
      const source = entry && sources.get(entry.questionRef.questionId);
      const stats = source && statistics.get(source);
      if (!stats || stats.answered >= BOOKMARK_ANSWER_LIMIT) continue;
      stats.answered++;
      if (outcome === "correct") stats.correct++;
    }
  }
  for (const stats of statistics.values())
    if (stats.answered)
      stats.accuracyPercent = Math.round(stats.correct / stats.answered * 1000) / 10;
  return statistics;
}
