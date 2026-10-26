// Native IndexedDB acceptance harness. Run only in an isolated browser profile.
// This module is never imported by the production app.
import * as storage from "../src/core/storage";
import { loadCatalog, loadAsset } from "../src/core/catalog";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun, appendRunQuestion } from "../src/core/session";
import { selectQuestions } from "../src/core/selection";
import { makeBookmark } from "../src/core/bookmarks";
import { refOf } from "../src/core/types";
import { sortedJson } from "../src/core/hash";
import type { Run } from "../src/core/types";

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
export async function initialize() {
  const bundle = await loadCatalog();
  const question = bundle.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-1")!;
  const readyGenerated = startRun(await prepareRun(bundle, {
    subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: refOf(question),
  }, {}));
  generated = finishRun(updateAnswer(readyGenerated, readyGenerated.issued[0].choices[0].id), "completed");
  // Use the complete public collection and all its referenced image assets.
  // Its explicit collection ID must agree with the saved issuance references.
  const selection = { subject: "A", kind: "annual", mode: "study", year: 2022,
    sourceCollectionId: "set-sample-2022-dec-a", size: "public", bindingMode: "original_data" } as const;
  const selected = selectQuestions(bundle, selection);
  const assetIds = [...new Set(selected.questions.flatMap(q => q.assetRefs))];
  const assets = Object.fromEntries(await Promise.all(assetIds.map(async id => {
    const asset = bundle.assets.find(a => a.id === id)!; return [id, await loadAsset(asset)];
  })));
  original = finishRun(updateAnswer(startRun(await prepareRun(bundle, selection, assets, Date.now(), undefined, selected)), question.choices[0].id), "completed");
  await validateRun(generated); await validateRun(original);
  return { questions: bundle.questions.length, templates: bundle.templates.length,
    bundleBytes: new TextEncoder().encode(JSON.stringify(bundle)).length,
    originalAssets: Object.values(assets).map(b => ({ size: b.size, type: b.type })) };
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
async function rejects(action: () => Promise<unknown>, code?: string) {
  let failure: any; try { await action(); } catch (error) { failure = error; }
  check(failure && (!code || failure.code === code), `expected rejection ${code ?? ""}: ${failure}`);
}
const fingerprint = (run: Run) => JSON.stringify(sortedJson({ ...run, instances: [...run.instances].sort((a,b) => a.entryIndex-b.entryIndex), assets: Object.keys(run.assets).sort() }));
export async function acceptance() {
  const passed: string[] = [];
  const first = copy(generated, 1), second = copy(original, 2);
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
  await storage.maintainStorage(first.bundle, (completed, total) => progress.push([completed, total]));
  check(JSON.stringify(progress) === JSON.stringify([[0, 2], [1, 2], [2, 2]]), "finite migration progress is accurate");
  check(fingerprint(await storage.loadRun(second.session.id)) === savedFingerprint[1], "progress migration preserves original");
  passed.push("finite migration reports exact initial/per-record/final progress without altering history");

  await seedV3((function* () { for (let i = 30; i < 39; i++) yield copy(generated, i); })());
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
  return { passed, counts: await counts() };
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
