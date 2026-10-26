import type { Bundle, Ref, Result, Selection } from "./types";
import { refKey, refOf } from "./types";
import { generationCoverage } from "./generation-coverage";
import { DataError } from "./errors";
import { sourceQuestionLabel } from "./source-label";

// Store only the source reference; generated content belongs to each saved run.
export type Bookmark = {
  id: string;
  questionRef: Ref;
  title: string;
  subject: "A" | "B";
  area: string;
  createdAt: string;
};

export type BookmarkFilter = {
  subject: "all" | Bookmark["subject"];
  area: string;
};

export function filterBookmarks(bookmarks: readonly Bookmark[], filter: BookmarkFilter): Bookmark[] {
  return bookmarks.filter((bookmark) =>
    (filter.subject === "all" || bookmark.subject === filter.subject) &&
    (filter.area === "all" || bookmark.area === filter.area),
  );
}

export function bookmarkGroupSelection(bookmarks: readonly Bookmark[]): Selection {
  if (!bookmarks.length)
    throw new DataError("BOOKMARK_REF", "練習するブックマークがありません。");
  return {
    subject: bookmarks.every((bookmark) => bookmark.subject === bookmarks[0].subject)
      ? bookmarks[0].subject
      : "mixed",
    kind: "bookmark",
    mode: "endless",
    bindingMode: "generated_values",
    questionRefs: bookmarks.map((bookmark) => ({ ...bookmark.questionRef })),
  };
}

export function bookmarkSource(bundle: Bundle, ref: Ref, coverage = generationCoverage(bundle)) {
  // A bookmark identifies a source, not an immutable copy of an old question.
  // Resolve every past revision to the active source and its current template.
  const row = coverage.rows.find(
    (r) =>
      (r.original.id === ref.questionId && ref.revision > 0 && ref.revision <= r.original.revision) ||
      r.linked.some((t) => t.baseQuestionRef.questionId === ref.questionId &&
        ref.revision > 0 && ref.revision <= t.baseQuestionRef.revision),
  );
  if (
    !row || !Number.isInteger(ref.revision) ||
    row.original.lifecycle !== "active" ||
    row.original.distribution !== "included" ||
    bundle.catalog.withdrawals.some(
      (w) => refKey(w.questionRef) === refKey(refOf(row.original)),
    )
  )
    throw new DataError("BOOKMARK_REF", "この問題は現在利用できません。");
  return row.original;
}

export function refreshBookmark(bundle: Bundle, bookmark: Bookmark): Bookmark {
  const updated = makeBookmark(bundle, bookmark.questionRef, Date.parse(bookmark.createdAt));
  return { ...updated, createdAt: bookmark.createdAt };
}

export function makeBookmark(
  bundle: Bundle,
  ref: Ref,
  at = Date.now(),
): Bookmark {
  const original = bookmarkSource(bundle, ref);
  return {
    id: original.id,
    questionRef: refOf(original),
    title: sourceQuestionLabel(original),
    subject: original.subject,
    area: original.learning.area,
    createdAt: new Date(at).toISOString(),
  };
}

export type BookmarkOutcome = "unanswered" | "incorrect";

export function resultBookmarks(
  bundle: Bundle,
  run: {
    result?: Pick<Result, "entries">;
    session: { entries: readonly { questionRef: Ref }[] };
  },
  outcome: BookmarkOutcome,
  at = Date.now(),
): Bookmark[] {
  const bookmarks = new Map<string, Bookmark>();
  for (const [index, entry] of (run.result?.entries ?? []).entries()) {
    if (entry.outcome !== outcome) continue;
    try {
      // Result references identify issued instances; session references identify sources.
      const bookmark = makeBookmark(bundle, run.session.entries[index].questionRef, at);
      bookmarks.set(bookmark.id, bookmark);
    } catch (error) {
      if (!(error instanceof DataError) || error.code !== "BOOKMARK_REF")
        throw error;
    }
  }
  return [...bookmarks.values()];
}

export function bookmarkPreview(bundle: Bundle, ref: Ref): string {
  const original =
    bundle.questions.find(
      (q) =>
        q.origin.kind === "official_reprint" &&
        refKey(refOf(q)) === refKey(ref),
    ) ?? bookmarkSource(bundle, ref);
  // Official text supplements also contain choices and figure transcriptions.
  // Keep the preview to the opening prose, without choices or explanations.
  const prose = original.prompt.blocks
    .flatMap((block) =>
      block.type === "paragraph" ||
      (block.type === "code" && block.language === "text")
        ? [block.text]
        : [],
    )
    .join("\n");
  // Image-only originals keep their complete reading in the approved Asset.
  // Reuse only its opening prose; choices and figure descriptions remain in
  // the original material rather than becoming a bookmark answer hint.
  const imageBlock = original.prompt.blocks.length === 1 ? original.prompt.blocks[0] : undefined;
  const image = imageBlock?.type === "image" ? bundle.assets.find(a => a.id === imageBlock.assetId) : undefined;
  const text = (prose || image?.alt || "")
    .split(/\n\s*(?:ア\s+|〔プログラム〕)|選択肢[：:]/u)[0]
    .replace(/^[\s\S]*?問\s*[0-9０-９]+(?:\s*[。．.:：])?\s*/u, "")
    .replace(
      /([\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}])[ \t]*\r?\n\s*(?=[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}])/gu,
      "$1",
    )
    .replace(/\s+/gu, " ")
    .trim();
  // B needs the description following its standard answer instruction, too.
  const opening = original.subject === "A" ? text.split(/(?<=。)/u)[0] : text;
  const characters = Array.from(opening);
  return characters.length > 140
    ? `${characters.slice(0, 140).join("").trimEnd()}…`
    : opening;
}

export function bookmarkTemplates(bundle: Bundle, refs: readonly Ref[]) {
  const coverage = generationCoverage(bundle);
  return refs.map((ref) => bookmarkTemplate(bundle, ref, coverage));
}

export function bookmarkTemplate(bundle: Bundle, ref: Ref, coverage = generationCoverage(bundle)) {
  const original = bookmarkSource(bundle, ref, coverage),
    row = coverage.rows.find(
      (r) => refKey(refOf(r.original)) === refKey(refOf(original)),
    )!;
  if (row.linked.length !== 1)
    throw new DataError("BOOKMARK_REF", "この問題の類題を準備できません。");
  const template = row.linked[0],
    base = bundle.questions.find(
      (q) => refKey(refOf(q)) === refKey(template.baseQuestionRef),
    );
  if (
    !base ||
    base.lifecycle !== "active" ||
    base.distribution !== "included" ||
    bundle.catalog.withdrawals.some(
      (w) => refKey(w.questionRef) === refKey(refOf(base)),
    )
  )
    throw new DataError("BOOKMARK_REF", "この問題の類題は現在利用できません。");
  return { original, template, base };
}
