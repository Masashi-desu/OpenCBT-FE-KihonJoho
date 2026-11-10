import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createServer, type ViteDevServer } from "vite";
import { chromium, type Browser, type Page } from "playwright";
let server: ViteDevServer, browser: Browser, origin: string;
let cacheDir: string | undefined;
before(async () => {
  fs.mkdirSync("output/recovery", { recursive: true });
  // A fresh optimizer cache belongs to this server, never another test process
  // or the user's development server.
  cacheDir = fs.mkdtempSync(path.resolve("output", "recovery-vite-"));
  server = await createServer({
    cacheDir,
    // Review artifacts can contain unrelated HTML from other build snapshots.
    optimizeDeps: { entries: ["index.html"] },
    server: { host: "127.0.0.1", port: 0, strictPort: true, hmr: false },
    logLevel: "error",
  });
  await new Promise<void>((resolve, reject) => {
    server.httpServer!.once("error", reject);
    server.httpServer!.listen(0, "127.0.0.1", () => { server.httpServer!.off("error", reject); resolve(); });
  });
  const address = server.httpServer!.address(); assert(address && typeof address !== "string");
  origin = `http://127.0.0.1:${address.port}/`; browser = await chromium.launch({ headless: true });
});
after(async () => {
  try { await browser?.close(); }
  finally {
    try { await server?.close(); }
    finally { if (cacheDir) fs.rmSync(cacheDir, { recursive: true, force: true }); }
  }
});
// Each assertion waits for the application's own ready or recovery state.
const documentNavigation = { waitUntil: "commit" } as const;
const applicationWait = { timeout: 60000 };
const ready = async (p: Page) => {
  await p.getByRole("button", { name: "開始前の説明へ", exact: true }).and(p.locator(":enabled")).waitFor(applicationWait);
};
const warning = async (p: Page) => {
  await p.getByText("保存機能を利用できません", { exact: true }).waitFor(applicationWait);
  assert.equal(await p.locator(".error-banner").count(), 0);
  assert.equal(await p.getByRole("button", { name: "開始前の説明へ", exact: true }).isDisabled(), true);
};
async function searchQuestion(p: Page) {
  await p.getByRole("button", { name: "検索", exact: true }).click();
  await p.getByRole("searchbox", { name: "キーワード" }).fill("D/A");
  await p.getByRole("search").getByRole("button", { name: "検索", exact: true }).click();
  await p.locator('a[href^="#/search/question/question-ipa-2017h29h-fe-am-20"]').click();
  await p.getByRole("button", { name: "正答・解説を表示", exact: true }).waitFor();
}
async function raw(p: Page, store: string, value?: object) {
  return p.evaluate(async ({ store, value }) => {
    const request = indexedDB.open("opencbt-fe-kihonjoho-v2");
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try {
      const tx = db.transaction(store, value ? "readwrite" : "readonly");
      const req = value ? tx.objectStore(store).put(value) : tx.objectStore(store).get("broken");
      return await new Promise<any>((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
    } finally { db.close(); }
  }, { store, value });
}
async function fault(p: Page, mode: string) {
  await p.addInitScript(mode => {
    const w = window as any, db = window.indexedDB, fetchOriginal = window.fetch.bind(window);
    w.__storageCalls = 0;
    if (mode === "deny" || mode === "stall") Object.defineProperty(window, "indexedDB", { get() {
      w.__storageCalls++;
      if (sessionStorage.getItem("recovery-fault") !== "on") return db;
      if (mode === "deny") throw new DOMException("Storage access denied", "SecurityError");
      return { open() { return {}; } };
    } });
    if (mode === "read") { const getAll = IDBObjectStore.prototype.getAll; IDBObjectStore.prototype.getAll = function(this: IDBObjectStore, ...args: any[]) { return sessionStorage.getItem("recovery-fault") === "on" ? {} : getAll.apply(this, args as any); } as any; }
    if (mode === "cursor" || mode === "cursor-pending" || mode === "gc-cursor") {
      const openCursor = IDBIndex.prototype.openKeyCursor;
      IDBIndex.prototype.openKeyCursor = function(this: IDBIndex, ...args: any[]) {
        if (sessionStorage.getItem("recovery-fault") === "on" && (mode !== "gc-cursor" || this.name === "sessionId")) {
          w.__cursorStopped = true;
          return {};
        }
        return openCursor.apply(this, args as any);
      } as any;
    }
    if (mode === "bookmark-read") {
      const getAll = IDBObjectStore.prototype.getAll;
      IDBObjectStore.prototype.getAll = function(this: IDBObjectStore, ...args: any[]) {
        if (sessionStorage.getItem("recovery-fault") === "on" && this.name === "bookmarks" && this.transaction.mode === "readwrite") {
          w.__bookmarkReadStopped = true;
          return {};
        }
        return getAll.apply(this, args as any);
      } as any;
    }
    if (mode === "commit" || mode === "cursor-pending") {
      const complete = Object.getOwnPropertyDescriptor(IDBTransaction.prototype, "oncomplete")!;
      Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
        configurable: true, get(this: IDBTransaction) { return complete.get?.call(this); },
        set(this: IDBTransaction, handler: any) {
          if (sessionStorage.getItem("recovery-fault") === "on" && this.mode === "readwrite") {
            this.addEventListener("complete", () => { w.__nativeCommitDone = true; }, { once: true });
          } else complete.set?.call(this, handler);
        },
      });
    }
    if (mode === "quota") {
      const transaction = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = function (this: IDBDatabase, ...args: any[]) {
        if (sessionStorage.getItem("recovery-fault") === "on" && args[1] === "readwrite") throw new DOMException("Storage is full", "QuotaExceededError");
        return transaction.apply(this, args as any);
      } as any;
    }
    if (mode === "no-lock") Object.defineProperty(navigator, "locks", { value: undefined });
    if (mode === "lock") navigator.locks.request = (() => Promise.reject(new DOMException("Lock access denied", "SecurityError"))) as any;
    if (mode === "lock-sync") navigator.locks.request = (() => { throw new DOMException("Lock access denied", "SecurityError"); }) as any;
    if (mode === "lock-stall") navigator.locks.request = (() => { w.__hungLock = true; return new Promise(() => {}); }) as any;
    if (mode === "network") window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (sessionStorage.getItem("recovery-fault") === "on" && String(input).endsWith("/data/catalog.json")) {
        w.__hungFetch = true;
        return new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))));
      }
      return fetchOriginal(input, init);
    }) as typeof fetch;
  }, mode);
}

test("one malformed bookmark, session, legacy snapshot or withdrawal policy cannot block reloaded public browsing and is retained", async () => {
  for (const [store, row] of [
    ["bookmarks", { id: "broken", createdAt: null }],
    ["sessions", { id: "broken", session: { updatedAt: new Date().toISOString() } }],
    ["catalogSnapshots", { id: "broken", bundle: { questions: null }, assets: {} }],
    ["storagePolicy", { id: "withdrawals", refs: null }],
  ] as const) {
    const context = await browser.newContext(), p = await context.newPage();
    try {
      await p.goto(origin, documentNavigation); await ready(p); await raw(p, store, row);
      await p.reload(documentNavigation); await warning(p);
      const retained = store === "storagePolicy" ? await p.evaluate(async () => {
        const r = indexedDB.open("opencbt-fe-kihonjoho-v2"), db = await new Promise<IDBDatabase>(resolve => { r.onsuccess = () => resolve(r.result); });
        const q = db.transaction("storagePolicy").objectStore("storagePolicy").get("withdrawals");
        return await new Promise(resolve => { q.onsuccess = () => { db.close(); resolve(q.result); }; });
      }) : await raw(p, store);
      assert.deepEqual(retained, row);
      await p.getByRole("button", { name: "履歴・復習", exact: true }).click();
      await p.getByRole("heading", { name: "保存した履歴を確認できません", exact: true }).waitFor();
      await p.getByRole("button", { name: "ブックマーク", exact: true }).click();
      await p.getByRole("heading", { name: "保存したブックマークを確認できません", exact: true }).waitFor();
      await searchQuestion(p); assert.equal(await p.getByRole("button", { name: "類題を解く", exact: true }).isDisabled(), true);
      await p.getByRole("button", { name: "正答・解説を表示", exact: true }).click();
      await p.getByRole("heading", { name: "正答：ア", exact: true }).waitFor();
    } finally { await context.close(); }
  }
});

test("same-version incomplete stores and a newer database version preserve raw rows and offer usable recovery after reload", async () => {
  for (const version of [5, 99]) {
    const context = await browser.newContext(), p = await context.newPage();
    try {
      await p.route("**/recovery-seed", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>isolated seed</title>" }));
      await p.goto(origin + "recovery-seed");
      await p.evaluate(async version => {
        const r = indexedDB.open("opencbt-fe-kihonjoho-v2", version);
        r.onupgradeneeded = () => r.result.createObjectStore("evidence", { keyPath: "id" }).put({ id: "kept", answer: "original" });
        await new Promise<void>((resolve, reject) => { r.onsuccess = () => { r.result.close(); resolve(); }; r.onerror = () => reject(r.error); });
      }, version);
      await p.goto(origin, documentNavigation); await warning(p); await p.reload(documentNavigation); await warning(p);
      assert.deepEqual(await p.evaluate(async () => {
        const r = indexedDB.open("opencbt-fe-kihonjoho-v2"), db = await new Promise<IDBDatabase>(resolve => { r.onsuccess = () => resolve(r.result); });
        const q = db.transaction("evidence").objectStore("evidence").get("kept");
        return await new Promise(resolve => { q.onsuccess = () => { db.close(); resolve(q.result); }; });
      }), { id: "kept", answer: "original" });
      await searchQuestion(p);
    } finally { await context.close(); }
  }
});

test("denied storage supports explicit temporary answers, results and bookmarks without IDB calls; reload discards only temporary records", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } }), p = await context.newPage();
  try {
    await fault(p, "deny"); await p.goto(origin, documentNavigation); await ready(p);
    await p.evaluate(() => sessionStorage.setItem("recovery-fault", "on"));
    await p.reload(documentNavigation); await warning(p); await p.screenshot({ path: "output/recovery/storage-unavailable.png", fullPage: true });
    for (const width of [390, 320]) for (const theme of ["ライトモード", "ダークモード"]) {
      await p.setViewportSize({ width, height: 720 });
      await p.getByRole("button", { name: theme, exact: true }).click();
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(await p.locator(".storage-recovery button").evaluateAll(nodes => nodes.every(n => n.getBoundingClientRect().height >= 44)), true);
    }
    await p.screenshot({ path: "output/recovery/storage-unavailable-mobile.png", fullPage: true });
    await p.setViewportSize({ width: 1280, height: 900 });
    await p.getByRole("button", { name: "ライトモード", exact: true }).click();
    const calls = await p.evaluate(() => (window as any).__storageCalls);
    await p.getByRole("button", { name: "記録を保存せずに新しく練習", exact: true }).click(); await ready(p);
    await searchQuestion(p); await p.getByRole("button", { name: "類題を解く", exact: true }).click();
    await p.locator('.answer-choice').first().click();
    assert.equal(await p.locator('.answer-choice input[type="radio"]').first().isChecked(), true);
    await p.getByRole("button", { name: "ブックマークに追加", exact: true }).click();
    await p.getByRole("button", { name: "終了", exact: true }).click();
    await p.getByRole("button", { name: "終了して結果を見る", exact: true }).click();
    await p.getByRole("heading", { name: "問題ごとの結果", exact: true }).waitFor();
    await p.getByText("このタブだけの一時的な練習です", { exact: true }).waitFor();
    await p.screenshot({ path: "output/recovery/temporary-result.png", fullPage: true });
    assert.equal(await p.evaluate(() => (window as any).__storageCalls), calls);
    await p.getByRole("button", { name: "履歴・復習", exact: true }).click();
    assert.equal(await p.locator(".history-card").count(), 1);
    await p.locator(".history-card").getByRole("button", { name: "結果・復習", exact: true }).click();
    await p.getByRole("button", { name: "回答を順番に確認する", exact: true }).click();
    assert.equal(await p.locator('.answer-choice input[type="radio"]').first().isChecked(), true);
    assert.equal(await p.locator('.answer-choice input[type="radio"]').first().isDisabled(), true);
    await p.locator(".exam-brand").click();
    await p.getByRole("button", { name: "ブックマーク", exact: true }).click();
    assert.equal(await p.locator(".bookmark-card").count(), 1);
    await p.reload(documentNavigation); await warning(p); assert.equal(await p.getByText("このタブだけの一時的な練習です", { exact: true }).count(), 0);
    await p.evaluate(() => { sessionStorage.removeItem("recovery-fault"); (window as any).__documentMarker = true; });
    await p.locator('.storage-recovery').getByRole("button", { name: "再読込み", exact: true }).click();
    await p.waitForFunction(() => !(window as any).__documentMarker); await ready(p);
    await p.getByRole("button", { name: "履歴・復習", exact: true }).click(); assert.equal(await p.locator(".history-card").count(), 0);
    await p.getByRole("button", { name: "ブックマーク", exact: true }).click(); assert.equal(await p.locator(".bookmark-card").count(), 0);
    await p.screenshot({ path: "output/recovery/reloaded.png", fullPage: true });
  } finally { await context.close(); }
});

test("quota failures during startup retain the persistent database and allow temporary operation", async () => {
  const context = await browser.newContext(), p = await context.newPage();
  try {
    await fault(p, "quota"); await p.goto(origin, documentNavigation); await ready(p);
    await raw(p, "storagePolicy", { id: "broken", answer: "retained" });
    await p.evaluate(() => sessionStorage.setItem("recovery-fault", "on")); await p.reload(documentNavigation); await warning(p);
    assert.deepEqual(await raw(p, "storagePolicy"), { id: "broken", answer: "retained" });
    await p.getByRole("button", { name: "記録を保存せずに新しく練習", exact: true }).click(); await ready(p); await searchQuestion(p);
    assert.equal(await p.locator(".error-banner").count(), 0);
    assert.deepEqual(await raw(p, "storagePolicy"), { id: "broken", answer: "retained" });
  } finally { await context.close(); }
});

test("rejected lock requests are surfaced instead of being swallowed and can switch to an independent temporary practice", async () => {
  for (const mode of ["lock", "lock-sync", "lock-stall", "no-lock"]) {
  const context = await browser.newContext(), p = await context.newPage();
  try {
    await fault(p, mode); await p.goto(origin, documentNavigation); await p.clock.install();
    if (mode === "no-lock") await warning(p);
    else { await ready(p); await searchQuestion(p); await p.getByRole("button", { name: "類題を解く", exact: true }).click(); }
    if (mode === "lock-stall") { await p.waitForFunction(() => (window as any).__hungLock); await p.clock.fastForward(15001); }
    await p.getByText("保存機能を利用できません", { exact: true }).waitFor(applicationWait);
    await p.getByRole("button", { name: "記録を保存せずに新しく練習", exact: true }).click(); await ready(p);
    await searchQuestion(p); await p.getByRole("button", { name: "類題を解く", exact: true }).click();
    await p.locator('.answer-choice').first().click();
    assert.equal(await p.locator('.answer-choice input[type="radio"]').first().isChecked(), true);
    assert.equal(await p.locator(".error-banner").count(), 0);
  } finally { await context.close(); }
  }
});

const traceDeadline = (stage: string) => fs.writeFileSync(
  "output/recovery/deadline-stage.json",
  JSON.stringify({ stage, time: new Date().toISOString() }),
);

async function verifyStartupDeadline(mode: string) {
  const context = await browser.newContext(), p = await context.newPage();
  try {
    traceDeadline(mode + ": start");
    await fault(p, mode); await p.goto(origin, documentNavigation); await ready(p); await p.clock.install();
    await p.evaluate(() => sessionStorage.setItem("recovery-fault", "on")); await p.reload(documentNavigation);
    if (mode !== "network") await p.getByRole("combobox", { name: "公開問題集", exact: true }).and(p.locator(":enabled")).waitFor();
    else await p.waitForFunction(() => (window as any).__hungFetch);
    if (mode === "commit" || mode === "cursor-pending") await p.waitForFunction(() => (window as any).__nativeCommitDone);
    if (mode === "cursor" || mode === "gc-cursor") await p.waitForFunction(() => (window as any).__cursorStopped);
    else await p.clock.fastForward(mode === "stall" ? 15001 : mode === "read" || mode === "commit" || mode === "cursor-pending" ? 30001 : 20001);
    if (mode !== "network") await warning(p); else await p.locator(".error-banner").waitFor();
    traceDeadline(mode + ": rejected");
    await p.evaluate(() => { sessionStorage.removeItem("recovery-fault"); (window as any).__documentMarker = true; });
    await p.getByRole("button", { name: "再読込み", exact: true }).click();
    await p.waitForFunction(() => !(window as any).__documentMarker); await ready(p);
    assert.equal(await p.locator(".error-banner").count(), 0);
  } finally { await context.close(); }
}

test("unresponsive database requests have finite deadlines and a real reload retries", { timeout: 180000 }, async () => {
  for (const mode of ["stall", "read", "commit", "cursor", "cursor-pending", "gc-cursor"])
    await verifyStartupDeadline(mode);
});

test("unresponsive bookmark requests reject and a real reload retries", { timeout: 180000 }, async () => {
  for (const mode of ["bookmark-read", "commit"]) {
    const context = await browser.newContext(), p = await context.newPage();
    try {
      traceDeadline("bookmark-" + mode + ": start");
      await fault(p, mode); await p.goto(origin, documentNavigation); await ready(p); await p.clock.install();
      await p.evaluate(async () => {
        const storagePath = "/src/core/storage.ts", bookmarkPath = "/src/core/bookmarks.ts", catalogPath = "/src/core/catalog.ts";
        const storage = await import(storagePath), { makeBookmark } = await import(bookmarkPath), { loadCatalog } = await import(catalogPath);
        const bundle = await loadCatalog(), q = bundle.questions.find((item: any) => item.id === "question-ipa-2017h29h-fe-am-20");
        sessionStorage.setItem("recovery-fault", "on");
        (window as any).__bookmarkOutcome = "pending";
        void storage.saveBookmarks([makeBookmark(bundle, { questionId: q.id, revision: q.revision })]).then(
          () => { (window as any).__bookmarkOutcome = "success"; },
          (error: Error) => { (window as any).__bookmarkOutcome = error.message; },
        );
      });
      if (mode === "commit") {
        await p.waitForFunction(() => (window as any).__nativeCommitDone);
        await p.clock.fastForward(30001);
      } else await p.waitForFunction(() => (window as any).__bookmarkReadStopped);
      await p.waitForFunction(() => (window as any).__bookmarkOutcome !== "pending");
      assert.match(await p.evaluate(() => (window as any).__bookmarkOutcome), /ブックマーク.*再読み込み/);
      traceDeadline("bookmark-" + mode + ": rejected");
      await p.evaluate(() => sessionStorage.removeItem("recovery-fault")); await p.reload(documentNavigation); await ready(p);
      assert.equal(await p.locator(".error-banner").count(), 0);
    } finally { await context.close(); }
  }
});

test("unresponsive catalog and generator requests have finite deadlines and a real reload retries", { timeout: 180000 }, async () => {
  await verifyStartupDeadline("network");
  const context = await browser.newContext(), p = await context.newPage();
  try {
    traceDeadline("module: start");
    let stalled = false, held: import("playwright").Route | undefined;
    await p.route("**/src/core/generators/legacy-morning-registry.ts", route => {
      if (stalled) held = route; else void route.continue();
    });
    await p.goto(origin, documentNavigation); await ready(p); await p.clock.install();
    stalled = true; await p.reload(documentNavigation);
    await assert.doesNotReject(async () => {
      for (let attempt = 0; !held && attempt < 300; attempt++) await new Promise(resolve => setTimeout(resolve, 50));
      assert(held, "native module request reached the stalled transport");
    });
    await p.clock.fastForward(20001); await p.locator(".error-banner").waitFor();
    assert.match(await p.locator(".error-banner").innerText(), /生成機能.*再読み込み/);
    stalled = false; await held!.abort();
    await p.getByRole("button", { name: "再読込み", exact: true }).click(); await ready(p);
    assert.equal(await p.locator(".error-banner").count(), 0);
    traceDeadline("complete");
  } finally { await context.close(); }
});
