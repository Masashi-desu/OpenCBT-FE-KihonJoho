import assert from "node:assert/strict";
import type { Bundle } from "../../src/core/types";

// Frozen premise/intent/answer fixtures cover the 2022 samples and 2023–2026
// current-subject releases. Legacy PM has multiple answer fields, appendix
// sources and independent per-major oracles in legacy-2017-pm*-*.test.ts.
// Whole-distribution identity and one-to-one coverage remain checked by the
// source inventory and legacy-2017-spring-pm-booklet.test.ts; this scope is not
// a filter used by production data admission or aggregate readiness.
const currentOriginal = /^question-ipa-(?:202[3-6]-[ab]-\d+|sample-2022-(?:apr-b|dec-[ab])-\d+)$/;
export function currentSourceOriginals(bundle: Bundle) {
  const rows = bundle.questions.filter(q => q.origin.kind === "official_reprint" && currentOriginal.test(q.id));
  assert.equal(rows.length, 189, "all existing current-source originals remain present");
  assert.equal(new Set(rows.map(q => q.id)).size, 189);
  return rows;
}
export function currentSourceTemplates(bundle: Bundle) {
  const ids = new Set(currentSourceOriginals(bundle).map(q => q.id));
  const rows = bundle.templates.filter(t => {
    const base = bundle.questions.find(q => q.id === t.baseQuestionRef.questionId);
    return base?.origin.derivedFrom.some(ref => ids.has(ref.questionId));
  });
  assert.equal(rows.length, 189, "all existing current-source generators remain present");
  return rows;
}
