import type { Bundle, Entry, Run, Selection } from "./types";
import { DataError } from "./errors";
import { bookmarkSource } from "./bookmarks";

export const QUESTION_UPDATE_NOTICE =
  "この履歴の問題は現在の版と互換性がありません。最新版の問題で新しい学習を用意しました。以前の回答・結果は引き継ぎません。";

// Compare only the questions actually issued, not every unissued question in
// the catalog snapshot. An unrelated release does not invalidate a practice.
export function outdatedQuestionIndexes(
  saved: { session: { entries: readonly Pick<Entry, "questionRef">[] }; set?: Pick<Run["set"], "questionRefs">; selection?: Pick<Selection, "mode"> },
  latest: Bundle,
): number[] {
  const outdated = saved.session.entries.flatMap((entry, index) => {
    const current = latest.questions.find(q => q.id === entry.questionRef.questionId);
    return !current || current.revision !== entry.questionRef.revision ||
      current.lifecycle !== "active" || current.distribution !== "included"
      ? [index] : [];
  });
  if (!outdated.length && saved.selection?.mode === "endless" && saved.set &&
    outdatedQuestionIndexes({ session: { entries: saved.set.questionRefs.map(questionRef => ({ questionRef })) } }, latest).length)
    return saved.session.entries.map((_, index) => index);
  return outdated;
}

export function latestLearningSelection(
  saved: Pick<Run, "selection">,
  latest: Bundle,
): Selection {
  const selection = structuredClone(saved.selection);
  // Opening incompatible history must not start another timed exam silently.
  if (selection.mode !== "endless") selection.mode = "study";
  if (selection.bookmarkQuestionRef) {
    const source = bookmarkSource(latest, selection.bookmarkQuestionRef);
    selection.bookmarkQuestionRef = { questionId: source.id, revision: source.revision };
  }
  if (selection.questionRefs)
    selection.questionRefs = selection.questionRefs.map(ref => {
      if (selection.kind === "bookmark") {
        const source = bookmarkSource(latest, ref);
        return { questionId: source.id, revision: source.revision };
      }
      const question = latest.questions.find(q => q.id === ref.questionId);
      if (!question || question.lifecycle !== "active" || question.distribution !== "included")
        throw new DataError("QUESTION_REF", "この履歴の問題は現在利用できません。");
      return { questionId: question.id, revision: question.revision };
    });
  return selection;
}
