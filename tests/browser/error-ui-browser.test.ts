import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { chromium } from "playwright";
import { createServer } from "vite";

test("startup errors keep their message and actions visible while diagnostics wrap and copy in Chromium", { timeout: 90_000 }, async () => {
  await fs.mkdir("output", { recursive: true });
  const cacheDir = await fs.mkdtemp(path.resolve("output/error-ui-vite-"));
  try {
    const server = await createServer({ cacheDir, server: { host: "127.0.0.1", port: 0, hmr: false }, logLevel: "error" });
    try {
      const http = server.httpServer;
      assert(http);
      await new Promise<void>((resolve, reject) => {
        http.once("error", reject);
        http.listen(0, "127.0.0.1", () => { http.off("error", reject); resolve(); });
      });
      const address = http.address();
      assert(address && typeof address !== "string");
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage({ viewport: { width: 1345, height: 609 } });
        await page.route("**/data/catalog.json", route => route.fulfill({ json: { invalid: true } }));
        await page.goto("http://127.0.0.1:" + address.port + "/#/menu");
        await page.evaluate(() => {
          Object.defineProperty(navigator, "clipboard", {
            value: { async writeText(value: string) {
              document.documentElement.dataset.copiedError = value;
            } },
          });
        });
        const banner = page.locator(".error-banner");
        const message = banner.getByRole("alert");
        await message.waitFor();
        assert.match(await message.innerText(), /起動に必要なデータを確認できません。/);
        assert.equal(await banner.getByRole("button", { name: "再読込み" }).count(), 1);
        const code = banner.locator("pre");
        assert.equal(await code.isVisible(), false);
        const placement = async () => banner.evaluate(element => {
          const heading = element.querySelector(".error-banner-heading")!.getBoundingClientRect();
          const message = element.querySelector('[role="alert"]')!.getBoundingClientRect();
          const actions = element.querySelector(".inline-actions")!.getBoundingClientRect();
          return { right: heading.right === actions.right, below: actions.top >= message.bottom,
            beside: actions.top >= message.top && actions.bottom <= message.bottom && actions.left >= message.right };
        });
        assert.deepEqual(await placement(), { right: true, below: false, beside: true });
        const details = banner.getByText("エラーの詳細", { exact: true });
        await details.press("Enter");
        const diagnostic = await code.locator("code").textContent();
        assert(diagnostic?.startsWith("catalog: "));
        await banner.getByRole("button", { name: "エラーの詳細をコピー" }).click();
        assert.equal(await page.evaluate(() => document.documentElement.dataset.copiedError), diagnostic);
        await page.setViewportSize({ width: 320, height: 700 });
        assert.deepEqual(await placement(), { right: true, below: true, beside: false });
        assert(await code.evaluate(element => getComputedStyle(element).whiteSpace === "pre-wrap" &&
          element.scrollWidth === element.clientWidth && element.scrollHeight > element.clientHeight));
        await details.press("Enter");
        assert.equal(await code.isVisible(), false);
        assert(await message.isVisible());
      } finally {
        await browser.close();
      }
    } finally {
      await server.close();
    }
  } finally {
    await fs.rm(cacheDir, { recursive: true, force: true });
  }
});
