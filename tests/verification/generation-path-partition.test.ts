import test, { before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fixture, installFixtureGenerators } from "../fixtures";
import { generationCoverage } from "../../src/core/generation-coverage";
import { contractFor } from "../../src/core/generation";
import { scopeForQuestion } from "../../scripts/ci/booklet-scope.mjs";
import { generationPathInventory, generationPathWorkInventory, partitionBookletRows, bookletKinds } from "../helpers/generation-paths/scope";
import { bookletContentContractInventory } from "../helpers/booklet-content-contracts";
import { sourceCollections } from "../../src/core/source-collections";
import { afternoonPaperSelection, expectedAfternoonSelectionCount, legalAfternoonSelections, finiteSeedBudget, isAfternoon } from "../helpers/generation-paths/issuance";

before(installFixtureGenerators);

test("every distributed original and registered generator belongs to exactly one booklet execution scope", () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows, groups = partitionBookletRows(bundle),
    inventory = generationPathInventory(bundle), originals = bundle.questions.filter(q => q.origin.kind === "official_reprint");
  assert.equal(rows.length, originals.length);
  assert.equal([...groups.values()].reduce((sum, owned) => sum + owned.length, 0), rows.length);
  assert.deepEqual(inventory.flatMap(booklet => booklet.originalIds).sort(), originals.map(q => q.id).sort());
  assert.deepEqual(inventory.flatMap(booklet => booklet.templateIds).sort(), rows.map(row => row.linked[0].id).sort());
  assert.equal(new Set(inventory.flatMap(booklet => booklet.originalIds)).size, rows.length);
  assert.equal(new Set(inventory.flatMap(booklet => booklet.templateIds)).size, rows.length);
});

test("physical booklet wrappers cover exactly the real source identities, with no missing or empty successful scope", () => {
  const inventory = generationPathInventory(fixture()), expected = inventory.map(booklet => booklet.scope).sort(),
    actual = fs.readdirSync("tests/booklets", { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(actual, expected, "newly published booklets require explicit execution wrappers");
  for (const { scope, applicableKinds, notApplicableKinds, caseNames } of inventory) {
    const file = path.join("tests/booklets", scope, "random-bindings.test.ts"), source = fs.readFileSync(file, "utf8");
    assert.equal(source.split(`registerBookletGenerationTests("${scope}");`).length, 2, file);
    assert.equal((source.match(/registerBookletGenerationTests\(/g) ?? []).length, 1, file);
    assert.equal(caseNames.length, applicableKinds.length);
    assert(applicableKinds.includes("pool"));
    assert.deepEqual([...applicableKinds.filter(kind => kind !== "pool"), ...notApplicableKinds].sort(), ["large", "small"]);
    assert.equal(new Set(caseNames).size, caseNames.length);
  }
});

test("booklet finite and64-seed partitions equal the former complete-domain selection, retaining the two intentional overlaps", () => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows, groups = partitionBookletRows(bundle),
    oldSmall = rows.filter(row => finiteSeedBudget(row.linked[0], contractFor(row.linked[0])!, isAfternoon(row.original)) !== undefined),
    oldLarge = rows.filter(row => contractFor(row.linked[0])!.fields.reduce((n, field) => n * (field.maximum - field.minimum + 1), 1) > 256),
    actualSmall = [...groups.values()].flatMap(owned => bookletKinds(owned).small),
    actualLarge = [...groups.values()].flatMap(owned => bookletKinds(owned).large),
    ids = (selected: typeof rows) => selected.map(row => row.linked[0].id).sort();
  assert.deepEqual(ids(actualSmall), ids(oldSmall));
  assert.deepEqual(ids(actualLarge), ids(oldLarge));
  assert.deepEqual(ids(actualSmall.filter(row => actualLarge.includes(row))), [
    "template-source-2018h30a-fe-pm-13", "template-source-2019r01a-fe-pm-2",
  ]);
  assert.deepEqual([...new Set([...ids(actualSmall), ...ids(actualLarge)])].sort(), ids(rows));
});

test("unscoped, ambiguous, duplicate and cross-booklet source ownership cannot silently remove exhaustive work", () => {
  const original = fixture();
  const unscoped = structuredClone(original), q = unscoped.questions.find(q => q.origin.kind === "official_reprint")!;
  q.origin.sourceRefs = [];
  assert.equal(scopeForQuestion(q), null);
  assert.throws(() => partitionBookletRows(unscoped));
  const ambiguous = structuredClone(original), mixed = ambiguous.questions.find(q => q.origin.kind === "official_reprint")!;
  mixed.origin.sourceRefs.push({ ...structuredClone(mixed.origin.sourceRefs[0]), locator: {
    ...mixed.origin.sourceRefs[0].locator, year: 2030, subject: "科目" + mixed.subject,
  } });
  assert.equal(scopeForQuestion(mixed), null);
  assert.throws(() => partitionBookletRows(ambiguous));
  const duplicate = structuredClone(original);
  duplicate.questions.push(structuredClone(duplicate.questions.find(q => q.origin.kind === "official_reprint")!));
  assert.throws(() => partitionBookletRows(duplicate));
  const noGenerator = structuredClone(original); noGenerator.templates = noGenerator.templates.slice(1);
  assert.throws(() => partitionBookletRows(noGenerator));
  const extraCollection = structuredClone(original), collection = extraCollection.sets.find(set => set.id === "set-annual-2026-a")!;
  extraCollection.sets.push({ ...structuredClone(collection), id: "unreviewed-duplicate-collection" });
  assert.throws(() => partitionBookletRows(extraCollection));
});


test("the CI booklet execution manifest pins the actual source union, callback names, finite work and64-seed work", () => {
  const bundle = fixture(), inventory = generationPathInventory(bundle), work = generationPathWorkInventory(bundle),
    publicManifest = JSON.parse(fs.readFileSync("scripts/ci/public-test-manifest.json", "utf8")),
    privatePath = "scripts/ci/private-test-manifest.json",
    privateManifest = fs.existsSync(privatePath) ? JSON.parse(fs.readFileSync(privatePath, "utf8")) : { files: {}, bookletWorkOverrides: {} },
    overrides = privateManifest.bookletWorkOverrides ?? {}, entries = { ...publicManifest.files, ...privateManifest.files };
  for (const item of inventory) {
    const file = `tests/booklets/${item.scope}/random-bindings.test.ts`, entry = entries[file], actualWork = work.find(owned => owned.scope === item.scope)!;
    assert(entry, `${file}: booklet is absent from CI execution manifest`);
    const pinned = { ...entry, ...(overrides[file] ?? {}) };
    assert.deepEqual(entry.scopes, [item.scope], `${file}: manifest ownership`);
    assert.equal(entry.count, item.caseNames.length, `${file}: actual registered callback count`);
    assert.deepEqual(entry.names, item.caseNames, `${file}: executed callback identities`);
    assert.deepEqual(pinned.coverage, {
      sourceIds: item.originalIds, smallIds: item.smallTemplateIds, largeIds: item.largeTemplateIds,
      notApplicable: item.notApplicableKinds,
    }, `${file}: original/finite/seeded domains must equal the real Bundle`);
    assert.deepEqual(pinned.diagnostics, [
      ...(actualWork.requiredDiagnostics.small ?? []), ...(actualWork.requiredDiagnostics.large ?? []),
    ], `${file}: execution work counts must be pinned rather than inferred from a success log`);
  }
  const expected = inventory.map(item => `tests/booklets/${item.scope}/random-bindings.test.ts`).sort();
  assert.deepEqual(Object.keys(entries).filter(file => /^tests\/booklets\/[^/]+\/random-bindings\.test\.ts$/.test(file)).sort(), expected);
  for (const file of Object.keys(overrides)) assert(expected.includes(file), `${file}: private work override does not own a real booklet`);
});


test("per-source content-contract wrappers partition the former installed-registry callback loop exactly once", () => {
  const rows = bookletContentContractInventory(fixture()),
    publicManifest = JSON.parse(fs.readFileSync("scripts/ci/public-test-manifest.json", "utf8")),
    privatePath = "scripts/ci/private-test-manifest.json",
    privateManifest = fs.existsSync(privatePath) ? JSON.parse(fs.readFileSync(privatePath, "utf8")) : { files: {} },
    entries = { ...publicManifest.files, ...privateManifest.files }, expected: string[] = [];
  for (const row of rows) {
    const file = `tests/booklets/${row.scope}/content-contract.test.ts`;
    if (row.notApplicable) {
      assert.equal(fs.existsSync(file), false, `${row.scope}: multi-answer PM is not the former single-answer contract loop`);
      assert.equal(entries[file], undefined, `${row.scope}: no zero-case successful content wrapper`);
      continue;
    }
    expected.push(file);
    assert.equal(fs.readFileSync(file, "utf8").split(`await registerBookletContentContractTests("${row.scope}");`).length, 2);
    assert(entries[file], `${file}: content callbacks require an explicit reviewed execution manifest`);
    assert.equal(entries[file].count, row.count, file);
    assert.deepEqual(entries[file].names, row.names, file);
    assert.deepEqual(entries[file].scopes, [row.scope], file);
  }
  assert.deepEqual(Object.keys(entries).filter(file => /^tests\/booklets\/[^/]+\/content-contract\.test\.ts$/.test(file)).sort(), expected.sort());
});

test("afternoon paper selection preserves released rules and uses the original numbers when material is held", () => {
  const bundle = fixture(), beforeSecurity = new Set([
    "2009-autumn-pm", "2010-spring-pm", "2010-autumn-pm", "2011-special-pm", "2011-autumn-pm",
    "2012-spring-pm", "2012-autumn-pm", "2013-spring-pm", "2013-autumn-pm",
  ]);
  const oldAfternoon = sourceCollections(bundle, "B").filter(collection => collection.id.endsWith("-pm"));
  assert(oldAfternoon.length > 0);
  for (const collection of oldAfternoon) {
    const scope = collection.id.replace(/^set-annual-/, "");
    const all = legalAfternoonSelections(collection, bundle.questions);
    const fullCount = ["2008-autumn-pm", "2008-spring-pm"].includes(scope) ? 16 : beforeSecurity.has(scope) ? 105 : 75;
    const expected = collection.questionRefs.length === 13 ? fullCount : expectedAfternoonSelectionCount(scope);
    assert.equal(all.length, expected, scope);
    assert(all.every(selection => selection.length === 7), scope);
    assert.equal(new Set(all.map(selection => JSON.stringify(selection))).size, expected, scope);
  }

  const early = afternoonPaperSelection("2008-autumn-pm", []);
  assert.deepEqual(early, {
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    required: [1, 2, 3, 4, 5],
    general: [6, 7, 8, 9],
    choose: 1,
    languages: [10, 11, 12, 13],
    count: 16,
  });
  const earlyPartial = afternoonPaperSelection("2008-autumn-pm", [9, 13]);
  assert.deepEqual(earlyPartial.general, [6, 7, 8]);
  assert.deepEqual(earlyPartial.languages, [10, 11, 12]);
  assert.equal(earlyPartial.count, 9);
  assert.throws(() => afternoonPaperSelection("2008-autumn-pm", [3]), /cannot follow/);
  assert.throws(() => afternoonPaperSelection("2008-autumn-pm", [6, 7, 8, 9]), /cannot follow/);

  const partial = afternoonPaperSelection("2009-autumn-pm", [2]);
  assert.deepEqual(partial.numbers, [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(partial.required, [8]);
  assert.deepEqual(partial.general, [1, 3, 4, 5, 6, 7]);
  assert.deepEqual(partial.languages, [9, 10, 11, 12, 13]);
  assert.equal(partial.choose, 5);
  assert.equal(partial.count, 30);
  assert.equal(afternoonPaperSelection("2016-autumn-pm", [9]).count, 60);
  assert.throws(() => afternoonPaperSelection("2016-autumn-pm", [8]), /cannot follow/);
});
