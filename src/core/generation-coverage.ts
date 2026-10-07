import type { Bundle } from "./types";
import { DataError } from "./errors";
export function generationCoverage(b: Bundle) {
  const official = b.questions.filter(
      (q) => q.origin.kind === "official_reprint",
    ),
    rows = official.map((original) => {
      const bases = b.questions.filter((q) =>
        q.origin.derivedFrom.some(
          (r) =>
            r.questionId === original.id && r.revision === original.revision,
        ),
      );
      const templates = b.templates.filter(
        (t) =>
          bases.some(
            (q) =>
              q.id === t.baseQuestionRef.questionId &&
              q.revision === t.baseQuestionRef.revision,
          ) &&
          t.lifecycle === "active" &&
          t.distribution === "included",
      );
      const linked = templates.filter((t) =>
        b.sets.some(
          (s) =>
            s.id === `set-mix-${original.subject.toLowerCase()}` &&
            s.generationBindings.some(
              (g) =>
                g.templateRef.id === t.id &&
                g.templateRef.revision === t.revision &&
                g.questionRef.questionId === t.baseQuestionRef.questionId &&
                g.questionRef.revision === t.baseQuestionRef.revision,
            ),
        ),
      );
      return { original, templates, linked };
    });
  return {
    rows,
    total: official.length,
    covered: rows.filter((r) => r.linked.length > 0).length,
  };
}
export function validateGenerationCoverage(b: Bundle) {
  if (b.catalog.generationCoverage !== "complete") return;
  const c = generationCoverage(b);
  if (
    c.rows.some((r) => r.templates.length !== 1 || r.linked.length !== 1) ||
    c.covered !== c.total
  )
    throw new DataError(
      "GENERATION_COVERAGE",
      "公式問題と生成定義・ミックス枠が一対一で対応していません",
    );
}
