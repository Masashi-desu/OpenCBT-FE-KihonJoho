// Native IndexedDB acceptance harness. Run only in an isolated browser profile.
// This module is never imported by the production app.
import * as storage from "../src/core/storage";
import { loadCatalog, loadAsset } from "../src/core/catalog";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun, appendRunQuestion } from "../src/core/session";
import { selectQuestions } from "../src/core/selection";
import { makeBookmark } from "../src/core/bookmarks";
import { refKey, refOf } from "../src/core/types";
import { sha256, sortedJson } from "../src/core/hash";
import type { Attribution, Bundle, Run } from "../src/core/types";
import { prepareSnapshot } from "../src/core/storage-snapshot";

const DB = "opencbt-fe-kihonjoho-v2";
const check = (ok: unknown, message: string) => { if (!ok) throw Error(message); };
const req = <T>(r: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
});
const done = (tx: IDBTransaction) => new Promise<void>((resolve, reject) => {
  tx.oncomplete = () => resolve(); tx.onabort = () => reject(tx.error ?? Error("aborted")); tx.onerror = () => reject(tx.error);
});
const connect = () => req(indexedDB.open(DB));
async function raw<T>(names: string[], action: (tx: IDBTransaction) => Promise<T>, mode: IDBTransactionMode = "readonly") {
  const db = await connect(), tx = db.transaction(names, mode), complete = done(tx);
  try { const value = await action(tx); await complete; return value; } finally { db.close(); }
}
const reset = () => req(indexedDB.deleteDatabase(DB));
let generated: Run, original: Run;
const originalCollectionId = "set-sample-2022-dec-a";

async function prepareRuns(bundle: Bundle) {
  const question = bundle.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-1")!;
  const readyGenerated = startRun(await prepareRun(bundle, {
    subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: refOf(question),
  }, {}));
  // Use the complete source collection and all its referenced image assets.
  const selection = { subject: "A", kind: "annual", mode: "study", year: 2022,
    sourceCollectionId: originalCollectionId, size: "public", bindingMode: "original_data" } as const;
  const selected = selectQuestions(bundle, selection);
  const assetIds = [...new Set(selected.questions.flatMap(q => q.assetRefs))];
  const assets = Object.fromEntries(await Promise.all(assetIds.map(async id => {
    const asset = bundle.assets.find(a => a.id === id)!; return [id, await loadAsset(asset)];
  })));
  const readyOriginal = startRun(await prepareRun(bundle, selection, assets, Date.now(), undefined, selected));
  return {
    generated: finishRun(updateAnswer(readyGenerated, readyGenerated.issued[0].choices[0].id), "completed"),
    original: finishRun(updateAnswer(readyOriginal, question.choices[0].id), "completed"),
  };
}

export async function initialize() {
  const bundle = await loadCatalog();
  ({ generated, original } = await prepareRuns(bundle));
  await validateRun(generated); await validateRun(original);
  return { questions: bundle.questions.length, templates: bundle.templates.length,
    bundleBytes: new TextEncoder().encode(JSON.stringify(bundle)).length,
    originalAssets: Object.values(original.assets).map(b => ({ size: b.size, type: b.type })) };
}

async function migrationFixture(bundle: Bundle): Promise<Bundle> {
  // Version 3 duplicated an inline catalog for every session. The last v3
  // release had 206 question records and about 2.7 MB of catalog data. Use a
  // complete, current 60-question collection to exercise the historical shape
  // without multiplying each newly published booklet into the v3 fixture.
  const annual = bundle.sets.find(set => set.id === originalCollectionId)!;
  const originalRefs = new Set(annual.questionRefs.map(refKey));
  const questions = bundle.questions.filter(q => originalRefs.has(refKey(refOf(q))) ||
    q.origin.derivedFrom.some(ref => originalRefs.has(refKey(ref))));
  const refs = new Set(questions.map(q => refKey(refOf(q))));
  const mix = bundle.sets.find(set => set.id === "set-mix-a")!;
  const sets = [annual, { ...mix, questionRefs: mix.questionRefs.filter(ref => refs.has(refKey(ref))),
    generationBindings: mix.generationBindings.filter(binding => refs.has(refKey(binding.questionRef))) }];
  const examRefs = new Set(sets.flatMap(set => set.examConfigRefs.map(ref => `${ref.id}@${ref.revision}`)));
  const exams = bundle.exams.filter(exam => examRefs.has(`${exam.id}@${exam.revision}`));
  const templates = bundle.templates.filter(template => refs.has(refKey(template.baseQuestionRef)));
  const assetIds = new Set(questions.flatMap(q => q.assetRefs));
  const assets = bundle.assets.filter(asset => assetIds.has(asset.id));
  const sourceIds = new Set(questions.flatMap(q => q.origin.sourceRefs.map(ref => ref.sourceId)));
  const attributions: Attribution[] = [...assets, ...templates].map(record => record.attribution);
  for (const q of questions) {
    attributions.push(q.correctAnswer.attribution);
    for (const content of [q.prompt, q.explanation, ...q.choices.map(c => c.content), ...q.contexts.map(c => c.content)]) {
      attributions.push(content.attribution);
      for (const block of content.blocks) if (block.type === "diagram") attributions.push(block.attribution);
    }
  }
  for (const attribution of attributions) for (const ref of attribution.sourceRefs) sourceIds.add(ref.sourceId);
  const rightsIds = new Set(attributions.flatMap(attribution => attribution.rightsRefs));
  const rightsById = new Map(bundle.rights.map(right => [right.id, right]));
  for (const id of rightsIds) {
    const right = rightsById.get(id)!;
    for (const ref of right.thirdParty.rightsRefs) rightsIds.add(ref);
    for (const ref of right.evidence) sourceIds.add(ref.sourceId);
  }
  const rights = bundle.rights.filter(right => rightsIds.has(right.id));
  const sources = bundle.sources.filter(source => sourceIds.has(source.id));
  const records = { sources, rights, assets, questions, sets, exams, templates };
  const files = Object.fromEntries(await Promise.all(Object.entries(records).map(async ([kind, rows]) => [kind,
    await Promise.all(rows.map(async record => ({ path: `${kind}/${record.id}.json`, sha256: await sha256(JSON.stringify(record)) }))),
  ])));
  const catalog = { ...bundle.catalog, id: "catalog-fe-storage-fixture", revision: 1, files,
    withdrawals: bundle.catalog.withdrawals.filter(notice => !notice.replacement || refs.has(refKey(notice.replacement))) };
  return { catalog, catalogHash: await sha256(JSON.stringify(catalog)), ...records };
}
function copy(source: Run, number: number): Run {
  const run = structuredClone(source), id = `session-storage-${number}`;
  run.session.id = id;
  for (const [index, instance] of run.instances.entries()) {
    instance.sessionId = id; instance.id = `instance-storage-${number}-${index}`;
    run.session.entries[index].generatedInstanceId = instance.id;
    if (run.result) run.result.entries[index].generatedInstanceId = instance.id;
  }
  if (run.result) { run.result.id = `result-${id}`; run.result.sessionId = id; }
  return run;
}
const record = (run: Run) => ({ id: run.session.id, session: run.session, exam: run.exam, set: run.set,
  selection: run.selection, issued: run.issued, title: run.set.title, ...(run.result ? { result: run.result } : {}) });
async function seedV3(runs: Iterable<Run>) {
  await reset();
  const opening = indexedDB.open(DB, 3);
  opening.onupgradeneeded = () => { for (const name of ["catalogSnapshots", "generatedInstances", "sessions", "results", "bookmarks"])
    opening.result.createObjectStore(name, { keyPath: "id" }); };
  const db = await req(opening);
  const begin = performance.now();
  try {
    // Small transactions avoid constructing one enormous structured-clone queue.
    for (const run of runs) {
      const tx = db.transaction(["catalogSnapshots", "generatedInstances", "sessions", "results"], "readwrite"), complete = done(tx);
      tx.objectStore("catalogSnapshots").put({ id: run.session.id, bundle: run.bundle, assets: run.assets });
      tx.objectStore("sessions").put(record(run));
      for (const instance of run.instances) tx.objectStore("generatedInstances").put(instance);
      if (run.result) tx.objectStore("results").put(run.result);
      await complete;
    }
  } finally { db.close(); }
  return performance.now() - begin;
}
async function counts() {
  const db = await connect(), names = [...db.objectStoreNames], tx = db.transaction(names);
  const values = await Promise.all(names.map(async name => [name, await req(tx.objectStore(name).count())])); db.close();
  return Object.fromEntries(values);
}
// Reproduce the actual seven-store v4 seen in the IAB, including the missing
// policy store and the absent sessions.updatedAt / snapshots.sessionBundle.
// Run only against this harness's isolated origin and disposable test records.
export async function incompleteV4Regression() {
  await reset();
  const opening = indexedDB.open(DB, 4);
  opening.onupgradeneeded = () => {
    const db = opening.result;
    for (const name of ["bookmarks", "catalogSnapshots", "generatedInstances", "results", "sessions", "sharedAssets", "sharedBundles"])
      db.createObjectStore(name, { keyPath: "id" });
    const tx = opening.transaction!;
    for (const [store, name, multiEntry] of [["catalogSnapshots", "bundleKey", false], ["catalogSnapshots", "assetKeys", true],
      ["generatedInstances", "sessionId", false], ["results", "sessionId", false], ["sharedBundles", "questionRefs", true]] as const)
      tx.objectStore(store).createIndex(name, name, { multiEntry });
  };
  const old = await req(opening), names = [...old.objectStoreNames];
  check(old.version === 4 && !old.objectStoreNames.contains("storagePolicy"), "observed old schema");
  let reproduced = false;
  try { old.transaction([...names, "storagePolicy"]); } catch (error) { reproduced = (error as DOMException).name === "NotFoundError"; }
  check(reproduced, "old v4 reproduces the reported missing-store transaction error");
  const runs = [0, 1, 2, 3, 4].map(i => copy(i === 0 ? original : generated, 20000 + i));
  for (const run of runs) {
    const prepared = await prepareSnapshot(run.session.id, run.bundle, run.assets);
    const tx = old.transaction(names, "readwrite"), complete = done(tx);
    tx.objectStore("catalogSnapshots").put(prepared.snapshot);
    tx.objectStore("sharedBundles").put(prepared.shared);
    for (const asset of prepared.assets) tx.objectStore("sharedAssets").put(asset);
    tx.objectStore("sessions").put(record(run));
    for (const instance of run.instances) tx.objectStore("generatedInstances").put(instance);
    if (run.result) tx.objectStore("results").put(run.result);
    await complete;
  }
  const bookmark = makeBookmark(runs[0].bundle, refOf(runs[0].bundle.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-1")!));
  const tx = old.transaction("bookmarks", "readwrite"), complete = done(tx); tx.objectStore("bookmarks").put(bookmark); await complete;
  old.close();
  const allRows = () => raw(names, async tx => Object.fromEntries(await Promise.all(names.map(async name => [name, await req(tx.objectStore(name).getAll())]))));
  const before = JSON.stringify(sortedJson(await allRows()));
  check((await storage.history()).length === 5, "old v4 opens through the repaired v5 upgrade");
  const current = await connect();
  check(current.version === 5 && current.objectStoreNames.contains("storagePolicy"), "version and missing store upgraded");
  const schema = current.transaction(names);
  check(schema.objectStore("sessions").indexNames.contains("updatedAt") && schema.objectStore("catalogSnapshots").indexNames.contains("sessionBundle"), "both missing indexes upgraded");
  current.close();
  check(JSON.stringify(sortedJson(await allRows())) === before, "upgrade preserved every existing row");
  check(JSON.stringify(await storage.listBookmarks()) === JSON.stringify([bookmark]), "existing bookmark unchanged");
  for (const run of runs) check(fingerprint(await storage.loadRun(run.session.id)) === fingerprint(run), "exact restore of original/generated saved history");
  await storage.maintainStorage(runs[0].bundle);
  check((await storage.history()).length === 5 && (await storage.listBookmarks()).length === 1, "startup maintenance preserves all five runs and bookmark");
  return { reproduced, version: 5, exactRows: true, originalAndGeneratedRestore: true, counts: await counts() };
}
async function rejects(action: () => Promise<unknown>, code?: string) {
  let failure: any; try { await action(); } catch (error) { failure = error; }
  check(failure && (!code || failure.code === code), `expected rejection ${code ?? ""}: ${failure}`);
}
const fingerprint = (run: Run) => JSON.stringify(sortedJson({ ...run, instances: [...run.instances].sort((a,b) => a.entryIndex-b.entryIndex), assets: Object.keys(run.assets).sort() }));
async function acceptanceChecks(passed: string[]) {
  const fixture = await migrationFixture(original.bundle);
  const legacy = await prepareRuns(fixture);
  const first = copy(legacy.generated, 1), second = copy(legacy.original, 2);
  // Several question assets refer to the same physical source page. Verify
  // actual content/MIME deduplication rather than assuming unique asset IDs.
  const uniqueAssets = async (run: Run) => new Set(await Promise.all(Object.values(run.assets).map(async blob =>
    blob.type + ":" + Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer())),
      byte => byte.toString(16).padStart(2, "0")).join("")))).size;
  await seedV3([first]);
  const blocker = await connect(); blocker.onversionchange = () => {};
  await rejects(() => storage.history(), "STORAGE");
  blocker.close();
  check((await storage.history()).length === 1, "blocked open retries successfully");
  await Promise.race([reset(), new Promise((_, reject) => setTimeout(() => reject(Error("leaked blocked-open connection")), 2000))]);
  passed.push("blocked upgrade rejection closes its eventual connection, retry and versionchange release DB");
  await seedV3([first, second]);
  const savedFingerprint = [fingerprint(first), fingerprint(second)];
  check(fingerprint(await storage.loadRun(first.session.id)) === savedFingerprint[0], "generated v3 exact restore");
  check(fingerprint(await storage.loadRun(second.session.id)) === savedFingerprint[1], "original v3 exact restore");
  let size = await counts(); check(size.sharedBundles === 1 && size.sharedAssets === await uniqueAssets(second), "shared bundle/assets after v3 migration");
  passed.push("v3 migration preserves issued questions, parameters, choices, hashes, times, answers and result");
  const inline = await raw(["catalogSnapshots"], tx => req(tx.objectStore("catalogSnapshots").get(first.session.id)));
  check(!inline.bundle && inline.bundleKey, "v3 pointer committed");

  await seedV3([first, second]);
  const progress: number[][] = [];
  // Startup checks the current withdrawal notices while restoring historical rows.
  await storage.maintainStorage(original.bundle, (completed, total) => progress.push([completed, total]));
  check(JSON.stringify(progress) === JSON.stringify([[0, 2], [1, 2], [2, 2]]), "finite migration progress is accurate");
  check(fingerprint(await storage.loadRun(second.session.id)) === savedFingerprint[1], "progress migration preserves original");
  passed.push("finite migration reports exact initial/per-record/final progress without altering history");

  await seedV3((function* () { for (let i = 30; i < 39; i++) yield copy(legacy.generated, i); })());
  const withoutNotices = structuredClone(first.bundle); withoutNotices.catalog.withdrawals = [];
  const bounded: number[][] = [];
  await storage.maintainStorage(withoutNotices, (completed, total) => bounded.push([completed, total]));
  const pendingInline = await raw(["catalogSnapshots"], tx => req(tx.objectStore("catalogSnapshots").get("session-storage-38")));
  check(pendingInline.bundle && bounded.at(-1)?.[0] === 8 && bounded.at(-1)?.[1] === 8, "no-notice proactive migration is bounded to eight");
  await storage.loadRun("session-storage-38");
  passed.push("without withdrawal notices, proactive migration is bounded and the remaining record loads on demand");

  await seedV3([second]);
  const put = IDBObjectStore.prototype.put;
  let injected = false;
  IDBObjectStore.prototype.put = function(value: any, key?: IDBValidKey) {
    const result = key === undefined ? put.call(this, value) : put.call(this, value, key);
    if (this.name === "catalogSnapshots" && value.bundleKey && !injected) { injected = true; this.transaction.abort(); }
    return result;
  };
  try { await rejects(() => storage.loadRun(second.session.id)); } finally { IDBObjectStore.prototype.put = put; }
  const preserved = await raw(["catalogSnapshots"], tx => req(tx.objectStore("catalogSnapshots").get(second.session.id)));
  check(preserved.bundle && fingerprint(await storage.loadRun(second.session.id)) === savedFingerprint[1], "aborted v3 migration preserved old snapshot and retries");
  passed.push("native transaction abort rolls back bundle, Blob and pointer migration; retry restores exact record");

  await storage.deleteRuns();
  const a = copy(original, 3), b = copy(original, 4);
  await storage.saveRun(a); await storage.saveRun(b);
  size = await counts(); check(size.sharedBundles === 1 && size.sharedAssets === await uniqueAssets(a), "multiple original sessions share blobs");
  await storage.deleteRuns([a.session.id]);
  check(fingerprint(await storage.loadRun(b.session.id)) === fingerprint(b), "one deletion retains shared assets");
  await storage.saveBookmark(makeBookmark(b.bundle, refOf(b.bundle.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-1")!)));
  await storage.deleteRuns(); size = await counts();
  check(size.sharedAssets === 0 && size.sharedBundles === 0 && size.bookmarks === 1, "all history deletion keeps bookmarks");
  passed.push("shared original Blob liveness, one/all history deletion and bookmark independence");

  const c = copy(original, 5); await storage.storeOriginalSnapshot(c.session.id, c.bundle, c.assets);
  await storage.maintainStorage(c.bundle);
  check((await counts()).catalogSnapshots === 1, "pending preparation pin survives concurrent maintenance");
  const now = Date.now; Date.now = () => now() + 16 * 60 * 1000;
  try { await storage.maintainStorage(c.bundle); } finally { Date.now = now; }
  check((await counts()).catalogSnapshots === 0, "failed preparation pin expires");
  await storage.saveRun(c);
  check(fingerprint(await storage.loadRun(c.session.id)) === fingerprint(c), "save after pin expiry recreates full refs");
  passed.push("pre-binding pin, failed preparation orphan collection and save retry after lease expiry");

  const update = structuredClone(c); update.session.revision++; if (update.result) update.result.sessionRevision = update.session.revision;
  const parallel = await Promise.allSettled([storage.saveRun(update), storage.saveRun(structuredClone(update))]);
  check(parallel.filter(r => r.status === "fulfilled").length === 1 &&
    parallel.some(r => r.status === "rejected" && r.reason.code === "CONFLICT"), "revision conflict is atomic");
  for (let i = 10; i < 20; i++) {
    const run = copy(original, i);
    await Promise.all([storage.saveRun(run), storage.maintainStorage(run.bundle)]);
    check(fingerprint(await storage.loadRun(run.session.id)) === fingerprint(run), "concurrent GC preserves saving run " + i);
    await Promise.all([storage.deleteRuns([run.session.id]), storage.maintainStorage(run.bundle)]);
  }
  passed.push("concurrent same-revision conflict and overlapping save/delete/maintenance preserve live refs");

  const failed = copy(original, 21), protoPut = IDBObjectStore.prototype.put;
  let failureInjected = false;
  IDBObjectStore.prototype.put = function(value: any, key?: IDBValidKey) {
    const result = key === undefined ? protoPut.call(this, value) : protoPut.call(this, value, key);
    if (this.name === "sessions" && !failureInjected) { failureInjected = true; this.transaction.abort(); }
    return result;
  };
  const beforeFailure = await counts();
  try { await rejects(() => storage.saveRun(failed)); } finally { IDBObjectStore.prototype.put = protoPut; }
  check(JSON.stringify(await counts()) === JSON.stringify(beforeFailure), "failed save does not leak any store entry");
  await storage.saveRun(failed);
  passed.push("failed save is atomic across session, result, instance, bundle, Blob and pointer; retry succeeds");

  const expired = copy(generated, 22), oldTime = new Date(now() - 181 * 86400000).toISOString();
  // Native historical row, keeping all other saved fields untouched.
  await storage.saveRun(expired);
  await raw(["sessions"], async tx => { const r = await req(tx.objectStore("sessions").get(expired.session.id)); r.session.updatedAt = oldTime; tx.objectStore("sessions").put(r); }, "readwrite");
  await storage.maintainStorage(expired.bundle);
  await rejects(() => storage.loadRun(expired.session.id), "WITHDRAWN");
  check((await storage.listBookmarks()).length === 1, "expiry preserves bookmark");
  passed.push("180-day cleanup removes corresponding result/instance/pointer and preserves bookmarks");

  const fixedNow = Math.floor(now() / 1000) * 1000 + 500, cutoff = fixedNow - 180 * 86400000;
  const iso = (value: number) => new Date(value).toISOString();
  const offset = (value: number) => iso(value + 9 * 3600000).slice(0, -1) + "+09:00";
  const dates: [string, boolean][] = [
    [iso(cutoff), true], [iso(cutoff - 1), false], [iso(cutoff + 1), true],
    [offset(cutoff), true], [offset(cutoff - 1), false],
    [iso(cutoff).replace(".500Z", ".5Z"), true], [iso(cutoff).replace(".500Z", ".500000Z"), true],
  ];
  for (let index = 0; index < dates.length; index++) {
    const [updatedAt] = dates[index], run = copy(generated, 100 + index), instant = Date.parse(updatedAt);
    for (const key of ["createdAt", "updatedAt", "startedAt", "endedAt"] as const)
      if (run.session[key]) run.session[key] = iso(instant);
    run.session.updatedAt = iso(instant); run.session.expiresAt = iso(instant + 180 * 86400000);
    for (const instance of run.instances) instance.createdAt = iso(instant);
    if (run.result) run.result.generatedAt = iso(instant);
    await storage.saveRun(run);
    // Normal input accepts UTC Z only. Raw legacy rows additionally exercise
    // offset maintenance without claiming offsets are accepted by session schema.
    await raw(["sessions"], async tx => {
      const store = tx.objectStore("sessions"), saved = await req(store.get(run.session.id));
      saved.session.updatedAt = updatedAt; store.put(saved);
    }, "readwrite");
  }
  Date.now = () => fixedNow;
  try { await storage.maintainStorage(generated.bundle); } finally { Date.now = now; }
  const surviving = await storage.history();
  for (let index = 0; index < dates.length; index++) {
    const row = surviving.find(r => r.id === `session-storage-${100 + index}`);
    check(Boolean(row) === dates[index][1], "180-day offset/fraction boundary " + index);
    if (row) check(row.session.updatedAt === dates[index][0], "date representation was normalized");
  }
  passed.push("180-day instant boundary exactly and +/-1ms, equivalent offsets and short/long fractional seconds preserve original dates");

  const getAll = IDBObjectStore.prototype.getAll;
  IDBObjectStore.prototype.getAll = function(...args: any[]) {
    check(!["catalogSnapshots", "sharedBundles", "sharedAssets", "generatedInstances", "results", "sessions"].includes(this.name), "payload getAll " + this.name);
    return getAll.apply(this, args as any);
  };
  try { await storage.maintainStorage(failed.bundle); await storage.loadRun(failed.session.id); }
  finally { IDBObjectStore.prototype.getAll = getAll; }
  passed.push("maintenance and single-session restoration avoid full snapshot/Blob/instance/result/session payload getAll");

  const retired = copy(generated, 23);
  const unused = retired.bundle.templates.find(t => !retired.instances.some(i => i.templateRef.id === t.id))!;
  unused.generatorRef.version = "9.9.9";
  await storage.saveRun(retired);
  check(fingerprint(await storage.loadRun(retired.session.id)) === fingerprint(retired), "unissued retired generator need not execute");
  passed.push("restoration validates only executable templates and preserves an unissued retired contract");

  const withdrawn = structuredClone(failed.bundle), target = withdrawn.questions.find(q => !failed.issued.some(i => i.id === q.id))!;
  withdrawn.catalog.withdrawals.push({ ...withdrawn.catalog.withdrawals[0], questionRef: refOf(target) });
  await storage.maintainStorage(withdrawn);
  size = await counts(); check(size.sessions === 0 && size.catalogSnapshots === 0 && size.generatedInstances === 0 && size.results === 0 && size.sharedBundles === 0 && size.sharedAssets === 0, "unissued withdrawal removes all affected shared payloads");
  await rejects(() => storage.saveRun(failed), "WITHDRAWN");
  check((await storage.listBookmarks()).length === 1, "unrelated bookmark remains after withdrawal");
  passed.push("unissued original and derived withdrawal purge with persisted policy prevents stale save resurrection");
  return { passed, counts: await counts(), migrationFixture: {
    originals: legacy.original.issued.length,
    questionRecords: fixture.questions.length,
    catalogBytes: new TextEncoder().encode(JSON.stringify(fixture)).length,
  } };
}

export async function acceptance() {
  const passed: string[] = [];
  try {
    return await acceptanceChecks(passed);
  } catch (error) {
    throw new Error(`Native storage acceptance failed after ${passed.length} of 14 checks. Last completed: ${passed.at(-1) ?? "none"}. ${String(error)}`, { cause: error });
  }
}
export async function scale(count: number, legacy = false, withAssets = false) {
  const template = withAssets ? original : generated;
  const begin = performance.now();
  if (legacy) await seedV3((function* () { for (let i = 0; i < count; i++) yield copy(template, 10000 + i); })());
  else { await reset(); for (let i = 0; i < count; i++) await storage.saveRun(copy(template, 10000 + i)); }
  const saveMs = performance.now() - begin;
  const beforeUsage = (await navigator.storage.estimate()).usage;
  const maintenanceStart = performance.now(); await storage.maintainStorage(template.bundle);
  const maintenanceMs = performance.now() - maintenanceStart;
  const loadStart = performance.now(), restored = await storage.loadRun(`session-storage-${10000 + count - 1}`);
  const restoreMs = performance.now() - loadStart;
  check(fingerprint(restored) === fingerprint(copy(template, 10000 + count - 1)), "scale exact restore");
  const repeatStart = performance.now(); await storage.maintainStorage(template.bundle);
  return { count, legacy, withAssets, saveMs, beforeUsage, usage: (await navigator.storage.estimate()).usage,
    maintenanceMs, repeatMaintenanceMs: performance.now() - repeatStart, restoreMs, counts: await counts(),
    sessionId: restored.session.id };
}

export async function wideScale(count: number, originals = false) {
  const bundle = generated.bundle;
  let run: Run;
  if (originals) {
    const selection = { subject: "A", kind: "annual", mode: "study", year: 2022,
      sourceCollectionId: "set-sample-2022-dec-a", size: "public", bindingMode: "original_data" } as const;
    const selected = selectQuestions(bundle, selection);
    const assetIds = [...new Set(selected.questions.flatMap(q => q.assetRefs))];
    const assets = Object.fromEntries(await Promise.all(assetIds.map(async id => [id, await loadAsset(bundle.assets.find(a => a.id === id)!)])));
    run = finishRun(startRun(await prepareRun(bundle, selection, assets)), "completed");
  } else {
    run = startRun(await prepareRun(bundle, {
      subject: "A", kind: "mix", mode: "endless", bindingMode: "generated_values",
    }, {}));
    while (run.issued.length < 80) run = await appendRunQuestion(run);
    run = finishRun(run, "completed");
  }
  const savedTemplate = originals ? original : generated;
  if (originals) original = run; else generated = run;
  try { return { ...(await scale(count, false, originals)), questionsPerSession: run.issued.length }; }
  finally { if (originals) original = savedTemplate; else generated = savedTemplate; }
}

export async function seedLegacy(count: number, assets = false) {
  const template = assets ? original : generated;
  const saveMs = await seedV3((function* () { for (let i = 0; i < count; i++) yield copy(template, 10000 + i); })());
  return { count, assets, saveMs, usage: (await navigator.storage.estimate()).usage, counts: await counts() };
}
