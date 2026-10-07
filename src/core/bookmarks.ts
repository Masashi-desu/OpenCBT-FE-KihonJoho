import type { Bundle, Ref } from "./types";
import { refKey, refOf } from "./types";
import { generationCoverage } from "./generation-coverage";
import { DataError } from "./errors";

// Store only the source reference; generated content belongs to each saved run.
export type Bookmark = {
  id: string;
  questionRef: Ref;
  title: string;
  subject: "A" | "B";
  area: string;
  createdAt: string;
};
export const BOOKMARK_PRACTICE_COUNT = 1;

export function bookmarkSource(bundle: Bundle, ref: Ref) {
  const row = generationCoverage(bundle).rows.find(
    (r) =>
      refKey(refOf(r.original)) === refKey(ref) ||
      r.linked.some((t) => refKey(t.baseQuestionRef) === refKey(ref)),
  );
  if (
    !row ||
    row.original.lifecycle !== "active" ||
    row.original.distribution !== "included" ||
    bundle.catalog.withdrawals.some(
      (w) => refKey(w.questionRef) === refKey(refOf(row.original)),
    )
  )
    throw new DataError("BOOKMARK_REF", "この問題は現在利用できません。");
  return row.original;
}

export function makeBookmark(
  bundle: Bundle,
  ref: Ref,
  at = Date.now(),
): Bookmark {
  const original = bookmarkSource(bundle, ref),
    locator = original.origin.sourceRefs[0].locator;
  return {
    id: original.id,
    questionRef: refOf(original),
    title: `${locator.year}年度 科目${original.subject} 問${locator.questionNumber}`,
    subject: original.subject,
    area: original.learning.area,
    createdAt: new Date(at).toISOString(),
  };
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
  const text = original.prompt.blocks
    .flatMap((block) =>
      block.type === "paragraph" ||
      (block.type === "code" && block.language === "text")
        ? [block.text]
        : [],
    )
    .join("\n")
    .split(/\n\s*(?:ア\s+|〔プログラム〕)/u)[0]
    .replace(/^[\s\S]*?問\s*[0-9０-９]+\s*/u, "")
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

export function bookmarkTemplate(bundle: Bundle, ref: Ref) {
  const original = bookmarkSource(bundle, ref),
    row = generationCoverage(bundle).rows.find(
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
