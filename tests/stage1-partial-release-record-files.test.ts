import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { readDistributionBundle, encodeRecordPacks } from "../scripts/distribution-files";
import { stage1AMCollections, stage1PartialReleaseRecordFiles, stage1PartialReleaseAssetFiles } from "../scripts/prepare-stage1-partial-release";
import { catalogKinds, catalogFileRecords } from "../src/core/catalog-files";
import { readCatalog } from "../src/core/catalog-reader";
import type { Bundle, SetRecord } from "../src/core/types";

const root = path.resolve("public/data");
const sha = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const current = readDistributionBundle(root);
type Kind = typeof catalogKinds[number];
type Node = { id: string };

// Reconstruct only a transport fixture from current admitted records. Setting
// this string is not source/material/release admission and does not reproduce
// the sealed catalog's bytes. No old question payload is duplicated in fixtures.
const approved: Bundle = { ...current, catalogHash: "6dca67a7a3ca281db9fe0baaa8470a755e9f06f4b0d0da0e4aefb86aec9787ed" };
const allNodes = new Map(catalogKinds.flatMap(kind => current[kind].map(node => [node.id, node] as const)));
const seedIds = new Set(stage1AMCollections.flatMap(c => [
  ...current.questions.filter(q => q.id.startsWith(`question-ipa-${c.id}-`) || q.id.startsWith(`question-template-source-${c.id}-`)).map(q => q.id),
  ...current.templates.filter(t => t.id.startsWith(`template-source-${c.id}-`)).map(t => t.id),
  `set-annual-${c.id}`, `exam-${c.id}-practice`, `exam-${c.id}-study`,
]));
function reachable(seeds: Iterable<string>, lookup: ReadonlyMap<string, Node>) {
  const seen = new Set<string>(), pending = [...seeds];
  const visit = (value: unknown): void => {
    if (typeof value === "string" && lookup.has(value) && !seen.has(value)) pending.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  while (pending.length) {
    const id = pending.pop()!;
    if (seen.has(id)) continue;
    const node = lookup.get(id); assert(node, id); seen.add(id); visit(node);
  }
  return seen;
}
const amClosure = reachable(seedIds, allNodes);
const newTemplateIds = new Set(current.templates.filter(t => seedIds.has(t.id)).map(t => t.id));
const currentMix = current.sets.find(s => s.id === "set-mix-a")!;
assert.equal(newTemplateIds.size, 467);
const oldBindings = currentMix.generationBindings.filter(binding => !newTemplateIds.has(binding.templateRef.id));
const oldMix: SetRecord = { ...structuredClone(currentMix), revision: currentMix.revision - 1,
  generationBindings: oldBindings, questionRefs: oldBindings.map(binding => binding.questionRef) };
const oldLookup = new Map(allNodes); oldLookup.set(oldMix.id, oldMix);
const oldRoots = (["questions", "templates", "sets", "exams"] as const)
  .flatMap(kind => current[kind].filter(node => !seedIds.has(node.id)).map(node => node.id));
const retainedClosure = reachable(oldRoots, oldLookup);
const baseline = structuredClone(current), baselineFiles = new Map<string, Uint8Array>();
baseline.catalog.revision--;
for (const kind of catalogKinds) {
  // Shared rights/sources/assets remain owned by the old cohort. Unrelated,
  // even unreferenced, old records are preserved rather than pruned globally.
  const records = current[kind].filter(node => !amClosure.has(node.id) || retainedClosure.has(node.id))
    .map(node => node.id === oldMix.id ? oldMix : node);
  (baseline[kind] as Node[]) = records;
  const packs = encodeRecordPacks(kind, records);
  baseline.catalog.files[kind] = packs.map(p => p.entry);
  for (const pack of packs) baselineFiles.set(pack.entry.path, new Uint8Array(pack.bytes));
}
const baselineCatalogBytes = Buffer.from(JSON.stringify(baseline.catalog, null, 2) + "\n");
baseline.catalogHash = sha(baselineCatalogBytes); baselineFiles.set("catalog.json", baselineCatalogBytes);
const readBaseline = (name: string) => { const bytes = baselineFiles.get(name); assert(bytes, name); return bytes; };
const sorted = (bundle: Bundle, kind: Kind) => [...bundle[kind]].sort((a, b) => a.id.localeCompare(b.id));
const transport = () => stage1PartialReleaseRecordFiles(baseline, approved, readBaseline);

test("partial-release transport appends467 families, preserves every old record and78 afternoon majors, and changes only mix-A", async () => {
  assert.equal(baseline.questions.filter(q => q.origin.kind === "official_reprint").length, 267);
  assert.equal(baseline.templates.length, 267); assert.equal(baseline.assets.length, 734);
  const before = sha(JSON.stringify({ baseline, approved })), result = transport();
  const decoded = await readCatalog(async (name, max) => {
    const bytes = result.files.get(name); assert(bytes && bytes.byteLength <= max); return bytes;
  });
  assert.equal(result.catalog.revision, baseline.catalog.revision + 1);
  assert.equal(result.catalogHash, sha(result.files.get("catalog.json")!));
  assert.equal(decoded.questions.filter(q => q.origin.kind === "official_reprint").length, 734);
  assert.equal(decoded.templates.length, 734);
  assert.deepEqual(Object.fromEntries(catalogKinds.map(kind => [kind,
    result.added[kind].filter(n => !baseline[kind].some(old => old.id === n.id)).length])),
    { questions: 934, sources: 78, rights: 51, assets: 471, sets: 6, exams: 12, templates: 467 });
  for (const kind of catalogKinds) {
    for (const old of baseline[kind]) {
      const next = decoded[kind].find(node => node.id === old.id)!; assert(next, old.id);
      if (old.id !== "set-mix-a") assert.deepEqual(next, old, `${kind}: ${old.id}`);
    }
    assert.deepEqual(sorted(decoded, kind), sorted(current, kind), `${kind} returns the current cohort without replacing old values`);
  }
  const pm = decoded.questions.filter(q => q.origin.kind === "official_reprint" && q.origin.sourceRefs.some(ref => ref.locator.timeSlot === "午後"));
  assert.equal(pm.length, 78);
  const nextMix = decoded.sets.find(s => s.id === "set-mix-a")!;
  assert.equal(nextMix.revision, oldMix.revision + 1);
  assert.deepEqual(nextMix.questionRefs.slice(0, oldMix.questionRefs.length), oldMix.questionRefs);
  assert.deepEqual(nextMix.generationBindings.slice(0, oldMix.generationBindings.length), oldMix.generationBindings);
  assert.equal(nextMix.generationBindings.length - oldMix.generationBindings.length, 467);
  assert.equal(new Set(nextMix.generationBindings.slice(oldMix.generationBindings.length).map(b => b.templateRef.id)).size, 467);
  assert.equal(result.held.length, 13);
  for (const name of result.preserved) assert.deepEqual(result.files.get(name), readBaseline(name));
  assert.equal(result.removed.length, 1);
  const mixed = baseline.catalog.files.sets.find(entry => entry.path === result.removed[0])!;
  const originalMixed = catalogFileRecords(mixed, JSON.parse(new TextDecoder().decode(readBaseline(mixed.path))));
  assert(originalMixed.length > 1, "the changed pack also owns unrelated records");
  assert.equal(sha(JSON.stringify({ baseline, approved })), before, "input values remain unchanged");
});

test("approved identity, missing eligible components, held sources and wrong annual order fail before append", () => {
  assert.throws(() => stage1PartialReleaseRecordFiles(baseline, { ...approved, catalogHash: "0".repeat(64) }, readBaseline), /AM_APPROVED_CATALOG/);
  for (const id of ["question-ipa-2018h30h-fe-am-1", "question-template-source-2018h30h-fe-am-1", "template-source-2018h30h-fe-am-1"]) {
    const changed = { ...approved, questions: approved.questions.filter(q => q.id !== id), templates: approved.templates.filter(t => t.id !== id) };
    assert.throws(() => stage1PartialReleaseRecordFiles(baseline, changed, readBaseline), /AM_MISSING_ELIGIBLE/);
  }
  for (const prefix of ["question-ipa-", "question-template-source-", "template-source-"]) {
    const id = `${prefix}2018h30h-fe-am-62`;
    const changed = prefix === "template-source-"
      ? { ...approved, templates: [...approved.templates, { ...approved.templates[0], id }] }
      : { ...approved, questions: [...approved.questions, { ...approved.questions[0], id }] };
    assert.throws(() => stage1PartialReleaseRecordFiles(baseline, changed, readBaseline), /AM_HELD_INCLUDED/);
  }
  const reversed = { ...approved, sets: approved.sets.map(s => s.id === "set-annual-2018h30h-fe-am" ? { ...s, questionRefs: [...s.questionRefs].reverse() } : s) };
  assert.throws(() => stage1PartialReleaseRecordFiles(baseline, reversed, readBaseline), /AM_ANNUAL_ORDER/);
  const missingSet = { ...approved, sets: approved.sets.filter(s => s.id !== "set-annual-2018h30h-fe-am") };
  assert.throws(() => stage1PartialReleaseRecordFiles(baseline, missingSet, readBaseline), /AM_MISSING_COLLECTION/);
  const duplicate = { ...approved, questions: [...approved.questions, approved.questions[0]] };
  assert.throws(() => stage1PartialReleaseRecordFiles(baseline, duplicate, readBaseline), /AM_DUPLICATE_ID/);
});

test("an approved candidate's stale public record and header cannot overwrite the newer baseline", () => {
  const old = baseline.questions[0];
  const olderCandidate: Bundle = { ...approved,
    catalog: { ...approved.catalog, actors: approved.catalog.actors.map((actor, index) => index === 0 ? { ...actor, name: "stale candidate author" } : actor) },
    questions: approved.questions.map(q => q.id === old.id ? { ...q, review: { ...q.review, notes: "stale candidate review" } } : q),
  };
  const result = stage1PartialReleaseRecordFiles(baseline, olderCandidate, readBaseline);
  assert.deepEqual(result.catalog.actors, baseline.catalog.actors);
  const records = result.catalog.files.questions.flatMap(entry => catalogFileRecords(entry,
    JSON.parse(new TextDecoder().decode(result.files.get(entry.path)!)))) as Bundle["questions"];
  assert.deepEqual(records.find(q => q.id === old.id), old);
});

test("existing ownership, incomplete mix appends and modified baseline pack bytes cannot be hidden by repacking", () => {
  const oldRight = baseline.rights.find(r => r.id === "rights-original")!;
  assert(oldRight);
  const collision = { ...baseline, rights: baseline.rights.map(r => r.id === oldRight.id ? { ...r, scope: r.scope + " wrong" } : r) };
  assert.throws(() => stage1PartialReleaseRecordFiles(collision, approved, readBaseline), /AM_EXISTING_COLLISION/);
  const newQuestion = approved.questions.find(q => q.id === "question-ipa-2018h30h-fe-am-1")!;
  const already = { ...baseline, questions: [...baseline.questions, newQuestion] };
  assert.throws(() => stage1PartialReleaseRecordFiles(already, approved, readBaseline), /AM_ALREADY_REGISTERED/);
  const missingBinding = { ...approved, sets: approved.sets.map(s => s.id === "set-mix-a" ? {
    ...s, generationBindings: s.generationBindings.filter(b => b.templateRef.id !== "template-source-2018h30h-fe-am-1"),
  } : s) };
  assert.throws(() => stage1PartialReleaseRecordFiles(baseline, missingBinding, readBaseline), /AM_MIX_APPEND/);
  const duplicateBinding = { ...approved, sets: approved.sets.map(s => s.id === "set-mix-a" ? {
    ...s, generationBindings: [...s.generationBindings, s.generationBindings.find(b => newTemplateIds.has(b.templateRef.id))!],
  } : s) };
  assert.throws(() => stage1PartialReleaseRecordFiles(baseline, duplicateBinding, readBaseline), /AM_MIX_APPEND/);
  const corrupt = (name: string) => { const bytes = new Uint8Array(readBaseline(name)); bytes[0] ^= 1; return bytes; };
  assert.throws(() => stage1PartialReleaseRecordFiles(baseline, approved, corrupt), /AM_BASELINE_FILE/);
});

test("the actual asset transport verifies all baseline and471 appended files and owns copied bytes", () => {
  const result = transport(), additions = result.added.assets as Bundle["assets"];
  const read = (_owner: "baseline" | "approved", name: string) => fs.readFileSync(path.join(root, name));
  const files = stage1PartialReleaseAssetFiles(baseline.assets, additions, read);
  assert.equal(files.size, new Set(current.assets.map(asset => asset.path)).size,
    "distinct asset IDs may share one byte-identical file path");
  for (const asset of current.assets) {
    const bytes = files.get(asset.path)!; assert(bytes, asset.id);
    assert.equal(sha(bytes), asset.sha256); assert.equal(bytes.byteLength, asset.byteLength);
  }
  const asset = additions[0], mutable = new Uint8Array(read("approved", asset.path));
  const isolated = stage1PartialReleaseAssetFiles([], [asset], () => mutable);
  mutable[0] ^= 1;
  assert.equal(sha(isolated.get(asset.path)!), asset.sha256, "returned bytes do not alias the reader buffer");
});

test("asset bit flips, byte-length drift, unsafe paths and path collisions are rejected without granting material permission", () => {
  const result = transport(), asset = result.added.assets[0] as Bundle["assets"][number];
  const bytes = new Uint8Array(fs.readFileSync(path.join(root, asset.path)));
  const flipped = new Uint8Array(bytes); flipped[0] ^= 1;
  assert.throws(() => stage1PartialReleaseAssetFiles([], [asset], () => flipped), /AM_ASSET_HASH/);
  assert.throws(() => stage1PartialReleaseAssetFiles([], [{ ...asset, byteLength: asset.byteLength + 1 }], () => bytes), /AM_ASSET_HASH/);
  assert.throws(() => stage1PartialReleaseAssetFiles([], [{ ...asset, path: "assets/../../outside.png" }], () => bytes), /AM_ASSET_PATH/);
  const other = new Uint8Array([1, 2, 3, 4]), collision = { ...asset, id: "asset-transport-collision", sha256: sha(other), byteLength: other.byteLength };
  assert.throws(() => stage1PartialReleaseAssetFiles([asset], [collision], owner => owner === "baseline" ? bytes : other), /AM_ASSET_PATH_COLLISION/);
  // A matching metadata digest is necessary transport integrity only. These
  // tests never convert an unchecked source/right or synthetic bytes to allowed.
});
