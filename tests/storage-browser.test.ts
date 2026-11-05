import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createServer, type ViteDevServer } from "vite";
import { chromium, type Browser, type Page } from "playwright";

let server: ViteDevServer | undefined, browser: Browser | undefined, page: Page;
let cacheDir: string | undefined;
before(async () => {
  fs.mkdirSync("output", { recursive: true });
  // Each parallel Vite optimizer owns its cache; a shared cold cache can race
  // while renaming deps_temp into deps (ENOTEMPTY on the Linux CI runner).
  cacheDir = fs.mkdtempSync(path.resolve("output", "storage-vite-"));
  server = await createServer({ cacheDir, server: { host: "127.0.0.1", port: 0, strictPort: true, hmr: false }, logLevel: "error" });
  // Vite 6 treats config port 0 as its default port; bind the HTTP server to an
  // OS-assigned port so parallel browser files never compete with each other.
  await new Promise<void>((resolve, reject) => {
    server!.httpServer!.once("error", reject);
    server!.httpServer!.listen(0, "127.0.0.1", () => { server!.httpServer!.off("error", reject); resolve(); });
  });
  const address = server.httpServer!.address(); assert(address && typeof address !== "string");
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(); // No user profile or existing session.
  page = await context.newPage();
  await page.goto(`http://127.0.0.1:${address.port}/`);
  await page.getByRole("button", { name: "開始前の説明へ", exact: true }).and(page.locator(":enabled")).waitFor();
  await page.evaluate(async () => {
    const modulePath = "/scripts/storage-browser-harness.ts", harness = await import(modulePath);
    (window as any).nativeStorageHarness = harness;
    await harness.initialize();
  });
});
after(async () => {
  try { await browser?.close(); }
  finally {
    try { await server?.close(); }
    finally { if (cacheDir) fs.rmSync(cacheDir, { recursive: true, force: true }); }
  }
});

test("native IndexedDB preserves v3 history and validates rollback, concurrent writes, expiry, blobs and withdrawal policy", async () => {
  const result = await page.evaluate(() => (window as any).nativeStorageHarness.acceptance());
  assert.equal(result.passed.length, 14);
  assert(result.passed.some((s: string) => s.includes("rollback") || s.includes("rolls back")));
  assert.equal(result.counts.bookmarks, 1);
});

test("native incomplete v4 reproduces NotFoundError then upgrades with every existing row and original/generated answer intact", async () => {
  const result = await page.evaluate(() => (window as any).nativeStorageHarness.incompleteV4Regression());
  assert.deepEqual({ reproduced: result.reproduced, version: result.version, exactRows: result.exactRows,
    originalAndGeneratedRestore: result.originalAndGeneratedRestore }, { reproduced: true, version: 5, exactRows: true, originalAndGeneratedRestore: true });
  assert.equal(result.counts.sessions, 5); assert.equal(result.counts.bookmarks, 1);
});

test("application starts and reloads with the migrated native database and exposes all saved history and bookmarks", async () => {
  const url = page.url().split("#")[0];
  await page.goto(url); await page.getByRole("button", { name: "開始前の説明へ", exact: true }).and(page.locator(":enabled")).waitFor();
  assert.equal(await page.locator(".error-banner").count(), 0);
  await page.reload(); await page.getByRole("button", { name: "開始前の説明へ", exact: true }).and(page.locator(":enabled")).waitFor();
  await page.getByRole("button", { name: "履歴・復習", exact: true }).click(); await page.locator(".history-card").first().waitFor();
  assert.equal(await page.locator(".history-card").count(), 5);
  await page.getByRole("button", { name: "ブックマーク", exact: true }).click();
  await page.getByRole("button", { name: /のブックマークを削除$/ }).waitFor();
  assert.equal(await page.getByRole("button", { name: /のブックマークを削除$/ }).count(), 1);
  assert.equal(await page.locator(".error-banner").count(), 0);
});

test("native Web Locks acquire, reject a competing session, release and reacquire without forbidden options or late lock leaks", async () => {
  const result = await page.evaluate(async () => {
    const modulePath = "/src/core/storage.ts", { acquireRunLock } = await import(modulePath);
    const id = "transaction-detail-lock-regression", name = `opencbt:${id}`;
    const probe = {
      async waitFor(predicate: () => Promise<boolean>) {
        const deadline = Date.now() + 5000;
        while (!(await predicate())) { if (Date.now() > deadline) throw Error("Native lock state did not settle"); await new Promise(r => setTimeout(r, 10)); }
      },
      async held() { return (await navigator.locks.query()).held?.some(lock => lock.name === name) ?? false; },
    };
    let conflicts = 0, secondConflicts = 0;
    const releaseFirst = acquireRunLock(id, () => conflicts++);
    const releases = [releaseFirst];
    try {
      await probe.waitFor(probe.held);
      releases.push(acquireRunLock(id, () => secondConflicts++));
      await probe.waitFor(async () => secondConflicts > 0);
      releaseFirst(); await probe.waitFor(async () => !(await probe.held()));
      const releaseThird = acquireRunLock(id, () => conflicts++); releases.push(releaseThird);
      await probe.waitFor(probe.held); releaseThird(); await probe.waitFor(async () => !(await probe.held()));
      // Unmounting before the native callback arrives must not retain a lock.
      acquireRunLock(id, () => conflicts++)();
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 5000);
      let available: boolean;
      try { available = await navigator.locks.request(name, { signal: controller.signal }, lock => !!lock); }
      finally { clearTimeout(timeout); }
      return { conflicts, secondConflicts, available };
    } finally { releases.forEach(release => release()); }
  });
  assert.deepEqual(result, { conflicts: 0, secondConflicts: 1, available: true });
});
