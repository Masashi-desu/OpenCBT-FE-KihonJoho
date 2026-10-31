import type { Question } from "./types";
import type { StudyTerm } from "./study-acronyms";
import reviewed from "./stage1-am-study-terms-reviewed.json";

const admitted = new Set(reviewed.sources);
export const stage1AmStudySources: readonly string[] = Object.freeze([
  ...reviewed.sources,
]);

function collection(year: number, period: string): string {
  if (year === 2017) return `2017h29${period === "春期" ? "h" : "a"}`;
  if (year === 2018) return `2018h30${period === "春期" ? "h" : "a"}`;
  return period === "春期" ? "2019h31h" : "2019r01a";
}

/** undefined delegates current sources to their unchanged resolver. An old
 * booklet with incomplete, conflicting or unadmitted provenance has no key. */
export function stage1AmStudySourceKeys(
  question: Question,
): string[] | undefined {
  const refs = question.origin.sourceRefs;
  const oldBooklet = /^source-ipa-20(?:16|17|18|19)[a-z0-9]*-fe-(?:am|pm)(?:-|$)/;
  if (!refs.some(({ sourceId, locator }) => oldBooklet.test(sourceId) ||
      (!!locator.timeSlot && !!locator.year && locator.year < 2020)))
    return undefined;

  const keys = new Set<string>();
  for (const { sourceId, locator: l } of refs) {
    // Common page 2 and external material citations do not identify a question.
    if (!oldBooklet.test(sourceId) || !l.questionNumber) continue;
    if (![2017, 2018, 2019].includes(l.year ?? 0) ||
        !["春期", "秋期"].includes(l.period ?? "") ||
        l.timeSlot !== "午前" || !/^\d+$/.test(l.questionNumber) ||
        (l.subject && !["午前", "旧制度・午前", "A", "科目A"].includes(l.subject)))
      return [];
    const n = Number(l.questionNumber);
    if (n < 1 || n > 80 || String(n) !== l.questionNumber) return [];
    const book = collection(l.year!, l.period!);
    const source = `${book}-fe-am-${n}`;
    const prefix = `source-ipa-${book}-fe-am`;
    if ((sourceId !== prefix && !sourceId.startsWith(`${prefix}-`)) ||
        !admitted.has(source)) return [];
    const sourceNumber = sourceId.slice(prefix.length).match(/^-(\d+)(?:-|$)/);
    if (sourceNumber && Number(sourceNumber[1]) !== n) return [];
    keys.add(source);
  }
  return keys.size === 1 ? [...keys] : [];
}

type Catalogs = {
  acronyms: readonly StudyTerm[];
  concepts: readonly StudyTerm[];
  sample2022: readonly StudyTerm[];
  extra: readonly StudyTerm[];
};

/** Data-only extraction of existing reviewed AM notes. Annual collectors,
 * afternoon producers and held-source definitions stay outside this closure. */
export function makeStage1AmStudyTerms(canonical: Catalogs): StudyTerm[] {
  const native: StudyTerm[] = reviewed.native.map((t) => ({
    ...t,
    sources: [...t.sources],
  }));
  const inherited: StudyTerm[] = [];
  for (const ref of reviewed.inherited) {
    const pool = ref.canonical === "native"
      ? native
      : canonical[ref.canonical as keyof Catalogs];
    const source = "canonicalSource" in ref ? ref.canonicalSource : undefined;
    const term = pool.find((t) => t.term === ref.term &&
      (!source || t.sources?.includes(source)));
    if (!term) throw new Error("STAGE1_AM_CANONICAL_TERM");
    inherited.push({ ...term, sources: [ref.source] });
  }
  return [...native, ...inherited];
}

export function stage1AmRelatedTerms(
  sources: readonly string[],
  terms: readonly StudyTerm[],
): string[] {
  const explicit = reviewed.related as Record<string, string[]>;
  // Declared source scopes are reviewed post-answer uses, including scans
  // whose original prose does not repeat a note's explanatory heading.
  return [
    ...sources.flatMap((s) => explicit[s] ?? []),
    ...terms.filter((t) => t.sources?.some((s) => sources.includes(s)))
      .map((t) => t.term),
  ];
}
