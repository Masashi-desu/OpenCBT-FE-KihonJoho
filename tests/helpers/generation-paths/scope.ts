import assert from "node:assert/strict";
import { scopeForQuestion, validScope } from "../../../scripts/ci/booklet-scope.mjs";
import { refKey, refOf, type Bundle } from "../../../src/core/types";
import { generationCoverage } from "../../../src/core/generation-coverage";
import { sourceCollections } from "../../../src/core/source-collections";
import { checkParameters, contractFor } from "../../../src/core/generation";
import { finiteSeedBudget, isAfternoon } from "./issuance";

type Row = ReturnType<typeof generationCoverage>["rows"][number];
export type GenerationPathKind = "pool" | "small" | "large";

/** These are real, named callbacks, never environment-filtered no-op tests. */
export function generationPathTestName(scope: string, kind: GenerationPathKind): string {
  assert(validScope(scope), `invalid booklet scope: ${scope}`);
  const labels = {
    pool: "publication pools retain every registered series",
    small: "every finite input survives issuance and history",
    large: "64 seeded larger-domain inputs survive issuance and history",
  };
  return `generation paths ${scope}: ${labels[kind]}`;
}

/** Assign every original and active linked template to exactly one physical
 * booklet. A new source cannot silently vanish from exhaustive verification. */
export function partitionBookletRows(bundle: Bundle): Map<string, Row[]> {
  const rows = generationCoverage(bundle).rows, groups = new Map<string, Row[]>(),
    originals = new Set<string>(), templates = new Set<string>();
  assert(rows.length > 0, "no published originals to verify");
  for (const row of rows) {
    const key = refKey(refOf(row.original)), scope = scopeForQuestion(row.original);
    assert(scope && validScope(scope), `${row.original.id}: source identity has no unambiguous booklet scope`);
    assert(!originals.has(key), `${key}: duplicate original in generation coverage`);
    assert.equal(row.linked.length, 1, `${key}: exactly one registered generator is required`);
    const templateKey = `${row.linked[0].id}@${row.linked[0].revision}`;
    assert(!templates.has(templateKey), `${templateKey}: generator is assigned to multiple originals`);
    originals.add(key); templates.add(templateKey);
    const owned = groups.get(scope) ?? [];
    owned.push(row); groups.set(scope, owned);
  }
  const collectionOriginals = new Set<string>(), collectionScopes = new Set<string>();
  for (const subject of ["A", "B"] as const) {
    for (const collection of sourceCollections(bundle, subject)) {
      const owned = rows.filter(row => collection.questionRefs.some(ref => refKey(ref) === refKey(refOf(row.original)))),
        scopes = new Set(owned.map(row => scopeForQuestion(row.original)));
      assert.equal(owned.length, collection.questionRefs.length, `${collection.id}: unresolved collection original`);
      assert.equal(scopes.size, 1, `${collection.id}: collection crosses booklet identities`);
      const scope = [...scopes][0]!;
      assert(!collectionScopes.has(scope), `${scope}: duplicate annual source collection`);
      collectionScopes.add(scope);
      for (const row of owned) {
        const key = refKey(refOf(row.original));
        assert(!collectionOriginals.has(key), `${key}: original belongs to multiple source collections`);
        collectionOriginals.add(key);
      }
    }
  }
  assert.deepEqual([...collectionOriginals].sort(), [...originals].sort(), "source collections and generation originals must match exactly");
  assert.deepEqual([...collectionScopes].sort(), [...groups.keys()].sort());
  return new Map([...groups].sort(([a], [b]) => a.localeCompare(b)));
}

export function bookletRows(bundle: Bundle, scope: string): Row[] {
  const rows = partitionBookletRows(bundle).get(scope);
  assert(rows && rows.length > 0, `${scope}: no published booklet rows`);
  return rows;
}

/** The two source-reviewed large finite PM domains intentionally retain BOTH
 * their exhaustive coverage and their existing64-seed route regression. */
export function bookletKinds(rows: Row[]) {
  assert(rows.length > 0, "empty booklet cannot register successful tests");
  for (const row of rows) assert(row.linked[0].parameterDomain.fields?.length, `${row.linked[0].id}: explicit parameter fields required`);
  const small = rows.filter(row => {
    const template = row.linked[0], capacity = template.parameterDomain.fields!
      .reduce((n, field) => n * (field.maximum - field.minimum + 1), 1);
    // These two exceptional finite domains are validated against their exact
    // real registry contracts by finiteSeedBudget inside the executed callback.
    return capacity <= 256 || ["template-source-2018h30a-fe-pm-13", "template-source-2019r01a-fe-pm-2"].includes(template.id);
  });
  const large = rows.filter(row => row.linked[0].parameterDomain.fields!
    .reduce((n, field) => n * (field.maximum - field.minimum + 1), 1) > 256);
  const applicable: GenerationPathKind[] = ["pool"];
  if (small.length) applicable.push("small");
  if (large.length) applicable.push("large");
  const notApplicable = (["small", "large"] as const).filter(kind => !applicable.includes(kind));
  assert.deepEqual([...new Set([...small, ...large].map(row => row.original.id))].sort(), rows.map(row => row.original.id).sort());
  return { applicable, notApplicable, small, large };
}

/** Inspectable execution domain for CI-plan/review comparison. This is not a
 * successful test result and does not authorize skipping a planned callback. */
export function generationPathInventory(bundle: Bundle) {
  return [...partitionBookletRows(bundle)].map(([scope, rows]) => {
    const kinds = bookletKinds(rows);
    return {
      scope,
      originalIds: rows.map(row => row.original.id).sort(),
      templateIds: rows.map(row => row.linked[0].id).sort(),
      smallTemplateIds: kinds.small.map(row => row.linked[0].id).sort(),
      largeTemplateIds: kinds.large.map(row => row.linked[0].id).sort(),
      applicableKinds: kinds.applicable,
      notApplicableKinds: kinds.notApplicable,
      caseNames: kinds.applicable.map(kind => generationPathTestName(scope, kind)),
    };
  });
}

/** Read-only work plan for pinning the per-booklet execution witnesses. Invoke
 * after installing the real generators. Enumerating valid inputs here is not
 * an issuance/history test and never creates a successful test receipt. */
export function generationPathWorkInventory(bundle: Bundle) {
  return [...partitionBookletRows(bundle)].map(([scope, rows]) => {
    const kinds = bookletKinds(rows);
    let finiteInputs = 0, finiteInitialDraws = 0, afternoonInputs = 0, afternoonTemplates = 0;
    for (const row of kinds.small) {
      const template = row.linked[0], contract = contractFor(template)!;
      assert(contract, template.id);
      assert.deepEqual(contract.fields, template.parameterDomain.fields);
      assert(finiteSeedBudget(template, contract, isAfternoon(row.original)) !== undefined);
      const candidates = contract.fields.reduce<number[][]>((values, field) => values.flatMap(value =>
        Array.from({ length: field.maximum - field.minimum + 1 }, (_, index) => [...value, field.minimum + index])), [[]])
        .filter(values => {
          try { checkParameters(template, values); return true; }
          catch (error) { if ((error as { code?: string }).code !== "PARAMETER_CONSTRAINT") throw error; return false; }
        });
      assert(candidates.length > 1, template.id);
      finiteInputs += candidates.length;
      finiteInitialDraws += candidates.length * (isAfternoon(row.original) ? 3 : 5);
      if (isAfternoon(row.original)) { afternoonInputs += candidates.length; afternoonTemplates++; }
    }
    const largerInputs = kinds.large.length * 64,
      largerInitialDraws = kinds.large.reduce((sum, row) => sum + 64 * (isAfternoon(row.original) ? 3 : 5), 0),
      requiredDiagnostics: Partial<Record<GenerationPathKind, string[]>> = {};
    if (kinds.small.length) {
      requiredDiagnostics.small = [`${scope}: ${kinds.small.length} domains, ${finiteInputs} valid inputs, ${finiteInitialDraws} initial draws, ${finiteInputs} draws with complete prior history; current-format domains retain all five paths.`];
      if (afternoonTemplates) requiredDiagnostics.small.push(`${scope}: old afternoon: ${afternoonTemplates} domains, all ${afternoonInputs} finite inputs, ${afternoonInputs * 3} initial draws on three applicable explicit routes, ${afternoonInputs} history draws; all75 booklet selections separately retained.`);
    }
    if (kinds.large.length) requiredDiagnostics.large = [`${scope}: ${kinds.large.length} larger domains, ${largerInputs} seeded inputs, ${largerInitialDraws} initial draws on applicable issuance paths, ${largerInputs} draws with prior history.`];
    return { scope, finiteDomains: kinds.small.length, finiteInputs, finiteInitialDraws, finiteHistoryDraws: finiteInputs,
      largerDomains: kinds.large.length, largerInputs, largerInitialDraws, largerHistoryDraws: largerInputs, requiredDiagnostics };
  });
}
