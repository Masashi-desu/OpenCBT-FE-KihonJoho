import type { Bundle } from "../src/core/types";

// Declared source scope is independent of the current catalog: removing both an
// original and its template must not make an incomplete release pass validation.
export const legacyMorningScope = ["2017h29h-fe-am", "2017h29a-fe-am", "2018h30h-fe-am", "2018h30a-fe-am", "2019h31h-fe-am", "2019r01a-fe-am"] as const;
export const sourceScope = [2023, 2024, 2025, 2026].flatMap((year) =>
  (["a", "b"] as const).flatMap((subject) =>
    Array.from(
      { length: subject === "a" ? 20 : 6 },
      (_, i) => `${year}-${subject}-${i + 1}`,
    ),
  ),
).concat(Array.from({ length: 6 }, (_, i) => `sample-2022-apr-b-${i + 1}`), Array.from({ length: 20 }, (_, i) => `sample-2022-dec-b-${i + 1}`),Array.from({length:60},(_,i)=>`sample-2022-dec-a-${i+1}`), Array.from({length:13},(_,i)=>`2017h29h-fe-pm-${i+1}`), Array.from({length:13},(_,i)=>`2017h29a-fe-pm-${i+1}`), Array.from({length:13},(_,i)=>`2018h30h-fe-pm-${i+1}`), Array.from({length:13},(_,i)=>`2018h30a-fe-pm-${i+1}`), Array.from({length:13},(_,i)=>`2019h31h-fe-pm-${i+1}`), Array.from({length:13},(_,i)=>`2019r01a-fe-pm-${i+1}`));
sourceScope.push(...legacyMorningScope.flatMap(id => Array.from({length:80}, (_, i) => `${id}-${i+1}`)));
export const sourceExclusions: Record<string, {reason:string;sourceId:string;checkedOn:string}> = {
  "2025-b-6": {
    reason: "JIS Q 27001:2023に依存する第三者部分の再配布・改変条件を未確認",
    sourceId: "source-ipa-2025-b-qs",
    checkedOn: "2026-10-07",
  },
  "2017h29h-fe-am-55": {reason:"JIS等の定義文の用途別利用条件を未確認",sourceId:"source-ipa-2017h29h-fe-am-qs",checkedOn:"2026-10-31"},
  "2017h29h-fe-am-66": {reason:"プロセスの目的説明と規格・共通フレームの具体的表現の境界を未確認",sourceId:"source-ipa-2017h29h-fe-am-qs",checkedOn:"2026-10-31"},
  "2017h29a-fe-am-55": {reason:"サービスレベル管理の要求事項に関する第三者部分の利用条件を未確認",sourceId:"source-ipa-2017h29a-fe-am-qs",checkedOn:"2026-10-31"},
  "2018h30h-fe-am-39": {reason:"JIS Q 27000:2014の定義文の用途別利用条件を未確認",sourceId:"source-ipa-2018h30h-fe-am-qs",checkedOn:"2026-10-31"},
  "2018h30h-fe-am-47": {reason:"ソフトウェア方式設計の活動説明の一次表現・版・権利帰属を未確認",sourceId:"source-ipa-2018h30h-fe-am-qs",checkedOn:"2026-10-31"},
  "2018h30h-fe-am-62": {reason:"BPRの一般概念と特定の翻訳表現の境界を未確認",sourceId:"source-ipa-2018h30h-fe-am-qs",checkedOn:"2026-10-31"},
  "2018h30a-fe-am-39": {reason:"規格に関する第三者部分の用途別利用条件を未確認",sourceId:"source-ipa-2018h30a-fe-am-qs",checkedOn:"2026-10-31"},
  "2018h30a-fe-am-65": {reason:"業務プロセス等の説明の具体的な一次表現と利用条件を未確認",sourceId:"source-ipa-2018h30a-fe-am-qs",checkedOn:"2026-10-31"},
  "2019h31h-fe-am-41": {reason:"規格の定義文に関する用途別利用条件を未確認",sourceId:"source-ipa-2019h31h-fe-am-qs",checkedOn:"2026-10-31"},
  "2019h31h-fe-am-51": {reason:"第三者のプロセス等の説明の利用条件を未確認",sourceId:"source-ipa-2019h31h-fe-am-qs",checkedOn:"2026-10-31"},
  "2019h31h-fe-am-67": {reason:"第三者のマネジメント等の説明の利用条件を未確認",sourceId:"source-ipa-2019h31h-fe-am-qs",checkedOn:"2026-10-31"},
  "2019r01a-fe-am-55": {reason:"規格の要求事項等の用途別利用条件を未確認",sourceId:"source-ipa-2019r01a-fe-am-stage1-qs",checkedOn:"2026-10-31"},
  "2019r01a-fe-am-57": {reason:"プロセス等の第三者表現の用途別利用条件を未確認",sourceId:"source-ipa-2019r01a-fe-am-stage1-qs",checkedOn:"2026-10-31"},
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
            r.locator.questionNumber === id.split("-").at(-1),
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
