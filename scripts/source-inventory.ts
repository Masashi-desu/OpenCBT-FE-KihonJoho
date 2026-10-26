import type { Bundle } from "../src/core/types";

// Declared source scope is independent of the current catalog: removing both an
// original and its template must not make an incomplete release pass validation.
export const sourceScope = [2023, 2024, 2025, 2026].flatMap((year) =>
  (["a", "b"] as const).flatMap((subject) =>
    Array.from(
      { length: subject === "a" ? 20 : 6 },
      (_, i) => `${year}-${subject}-${i + 1}`,
    ),
  ),
).concat(Array.from({ length: 6 }, (_, i) => `sample-2022-apr-b-${i + 1}`), Array.from({ length: 20 }, (_, i) => `sample-2022-dec-b-${i + 1}`),Array.from({length:60},(_,i)=>`sample-2022-dec-a-${i+1}`), Array.from({length:13},(_,i)=>`2017h29h-fe-pm-${i+1}`), Array.from({length:13},(_,i)=>`2017h29a-fe-pm-${i+1}`), Array.from({length:13},(_,i)=>`2018h30h-fe-pm-${i+1}`));
export const sourceExclusions = {
  "2025-b-6": {
    reason: "JIS Q 27001:2023に依存する第三者部分の再配布・改変条件を未確認",
    sourceId: "source-ipa-2025-b-qs",
    checkedOn: "2026-10-07",
  },
};
export function validateSourceInventory(b: Bundle) {
  const expected = sourceScope
    .filter((id) => !(id in sourceExclusions))
    .map((id) => `question-ipa-${id}`)
    .sort();
  const actual = b.questions
    .filter((q) => q.origin.kind === "official_reprint")
    .map((q) => q.id)
    .sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw Error("SOURCE_INVENTORY: declared scope differs from catalog");
  for (const [id, exclusion] of Object.entries(sourceExclusions)) {
    if (
      !b.sources.some((s) => s.id === exclusion.sourceId) ||
      b.questions.some((q) =>
        q.origin.sourceRefs.some(
          (r) =>
            r.sourceId === exclusion.sourceId &&
            r.locator.questionNumber === id.split("-")[2],
        ),
      )
    )
      throw Error(`SOURCE_EXCLUSION: ${id}`);
  }
  return {
    declared: sourceScope.length,
    included: expected.length,
    excluded: Object.keys(sourceExclusions).length,
  };
}
