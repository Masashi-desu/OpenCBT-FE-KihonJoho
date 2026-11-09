import assert from "node:assert/strict";
import test from "node:test";
import { withUiBrowser } from "./helpers/ui-browser";

test("search shows the question first and keeps only common notation in an accessible disclosure", { timeout: 90_000 }, async () => {
  await withUiBrowser(async (page, url) => {
    const open = async (id: string, filters = "") => {
      await page.goto(url + "#/search/question/" + id + filters);
      const material = page.locator(".search-question-material");
      await material.waitFor();
      return material;
    };
    const counts = () => page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("opencbt-fe-kihonjoho-v2");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        return await Promise.all(["sessions", "results", "generatedInstances", "bookmarks"].map(name =>
          new Promise<number>((resolve, reject) => {
            const request = db.transaction(name).objectStore(name).count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          })));
      } finally {
        db.close();
      }
    });

    const material = await open("question-ipa-2016h28a-fe-am-21", "?type=detail");
    const saved = await counts();
    const details = material.locator("details.search-question-prerequisites");
    const summary = details.locator("summary");
    const pages = details.locator("section");
    assert.equal(await summary.innerText(), "前提・表記ルール");
    assert.deepEqual(await pages.evaluateAll(nodes => nodes.map(node => node.getAttribute("aria-label"))),
      ["問題文中で共通に使用される表記ルール（p.2）", "問題文中で共通に使用される表記ルール（p.3）"]);
    assert.equal(await pages.first().isVisible(), false);
    assert(await material.evaluate(node => {
      const image = node.querySelector("img"), disclosure = node.querySelector(".search-question-prerequisites");
      return !!image && !!disclosure && !disclosure.contains(image) &&
        Boolean(image.compareDocumentPosition(disclosure) & Node.DOCUMENT_POSITION_FOLLOWING);
    }));
    assert(await page.locator(".search-question .question-footer .question-footer-credits").isVisible());
    await summary.press("Enter");
    assert(await pages.first().isVisible());
    assert.equal(await details.locator("img").count(), 2);
    await page.setViewportSize({ width: 320, height: 700 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await summary.press("Space");
    assert.equal(await pages.first().isVisible(), false);
    assert.equal(await page.getByRole("button", { name: "正答・解説を表示" }).isVisible(), true);
    await page.getByRole("button", { name: "正答・解説を表示" }).click();
    assert.match(await page.locator("#search-explanation h2").innerText(), /正答：ウ/);

    const caseMaterial = await open("question-ipa-2016h28a-fe-pm-1");
    assert.equal(await caseMaterial.locator(".search-question-prerequisites").count(), 0);
    assert(await caseMaterial.getByRole("region", { name: "原資料を読む際の補足" }).isVisible());
    const withoutContexts = await open("question-ipa-2026-a-1");
    assert.equal(await withoutContexts.locator(".search-question-prerequisites").count(), 0);

    await page.goto(url + "#/search?type=detail");
    const query = page.getByRole("searchbox", { name: "キーワード" });
    await query.fill("7セグメントLED 小数点");
    await query.press("Enter");
    await page.locator(".search-result").filter({ hasText: /2016年度 秋期.*問21/ })
      .getByRole("button", { name: "対応する問題を見る" }).click();
    await page.getByRole("button", { name: "詳細解説を見る" }).click();
    await page.locator(".detail-frame.ready").waitFor();
    await page.getByRole("button", { name: "通常解説へ戻る" }).click();
    await page.locator(".search-question-prerequisites summary").waitFor();
    assert.deepEqual(await counts(), saved);
  });
});
