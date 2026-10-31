import type { Bundle } from "./types";
import { DataError } from "./errors";
export function generationCoverage(b: Bundle) {
  type Row = { original: Bundle["questions"][number]; templates: Bundle["templates"]; linked: Bundle["templates"] };
  type RefIndex<T> = Map<string, Map<number, T>>;
  // Nested maps keep complete references distinct, including IDs containing
  // separators. NaN never matches strict reference equality in the scan.
  const get = <T>(index: RefIndex<T>, id: string, revision: number) =>
    revision === revision ? index.get(id)?.get(revision) : undefined;
  const put = <T>(index: RefIndex<T>, id: string, revision: number, value: T) => {
    if (revision !== revision) return;
    let revisions = index.get(id);
    if (!revisions) index.set(id, revisions = new Map());
    revisions.set(revision, value);
  };
  const rows: Row[] = b.questions.filter(q => q.origin.kind === "official_reprint")
    .map(original => ({ original, templates: [], linked: [] }));
  if (!rows.length) return { rows, total: 0, covered: 0 };
  const originals: RefIndex<Row[]> = new Map(), owners: RefIndex<Set<Row>> = new Map();
  for (const row of rows) {
    const { id, revision } = row.original, sameReference = get(originals, id, revision) ?? [];
    sameReference.push(row);
    put(originals, id, revision, sameReference);
  }
  for (const question of b.questions) {
    for (const ref of question.origin.derivedFrom) {
      const matches = get(originals, ref.questionId, ref.revision);
      if (!matches) continue;
      const sameBase = get(owners, question.id, question.revision) ?? new Set<Row>();
      // Duplicate bases or derivedFrom references satisfy the old .some once.
      // Distinct original rows, including duplicate originals, remain distinct.
      for (const row of matches) sameBase.add(row);
      put(owners, question.id, question.revision, sameBase);
    }
  }
  if (!owners.size) return { rows, total: rows.length, covered: 0 };
  for (const template of b.templates) {
    const matches = get(owners, template.baseQuestionRef.questionId, template.baseQuestionRef.revision);
    if (!matches || template.lifecycle !== "active" || template.distribution !== "included") continue;
    // Walk the original template array: repeated entries are never deduplicated.
    for (const row of matches) row.templates.push(template);
  }
  const neededMixes = new Set(rows.filter(row => row.templates.length)
    .map(row => `set-mix-${row.original.subject.toLowerCase()}`));
  if (!neededMixes.size) return { rows, total: rows.length, covered: 0 };
  type Query = { matched: boolean };
  const pendingMixes = new Map<string, RefIndex<RefIndex<Query>>>();
  const rowQueries = new Map<Row, (Query | undefined)[]>();
  let pending = 0;
  for (const row of rows) {
    if (!row.templates.length) continue;
    const mixId = `set-mix-${row.original.subject.toLowerCase()}`;
    let templates = pendingMixes.get(mixId);
    if (!templates) pendingMixes.set(mixId, templates = new Map());
    rowQueries.set(row, row.templates.map(template => {
      // The scan cannot match a NaN template revision to any binding.
      if (template.revision !== template.revision) return undefined;
      const bases = get(templates, template.id, template.revision) ?? new Map<string, Map<number, Query>>();
      let query = get(bases, template.baseQuestionRef.questionId, template.baseQuestionRef.revision);
      if (!query) {
        query = { matched: false }; pending++;
        put(bases, template.baseQuestionRef.questionId, template.baseQuestionRef.revision, query);
        put(templates, template.id, template.revision, bases);
      }
      return query;
    }));
  }
  for (const set of b.sets) {
    if (!pending) break;
    const templates = pendingMixes.get(set.id);
    if (!templates) continue;
    for (const binding of set.generationBindings) {
      // Follow the original predicate's field order and ignore resolved queries.
      // Once all needed queries match, unrelated trailing data is never read.
      const templateId = binding.templateRef.id, versions = templates.get(templateId);
      if (!versions) continue;
      const templateRevision = binding.templateRef.revision, bases = versions.get(templateRevision);
      if (!bases) continue;
      const questionId = binding.questionRef.questionId, revisions = bases.get(questionId);
      if (!revisions) continue;
      const questionRevision = binding.questionRef.revision, query = revisions.get(questionRevision);
      if (!query) continue;
      query.matched = true; pending--;
      revisions.delete(questionRevision);
      if (!revisions.size) bases.delete(questionId);
      if (!bases.size) versions.delete(templateRevision);
      if (!versions.size) templates.delete(templateId);
      if (!templates.size) { pendingMixes.delete(set.id); break; }
    }
  }
  for (const row of rows) {
    const queries = rowQueries.get(row);
    if (queries) row.linked = row.templates.filter((_, i) => queries[i]?.matched);
  }
  return { rows, total: rows.length, covered: rows.filter(row => row.linked.length > 0).length };
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
