import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { createServer } from "vite";

export async function withUiBrowser(check: (page: Page, url: string) => Promise<void>) {
  await fs.mkdir("output", { recursive: true });
  const cacheDir = await fs.mkdtemp(path.resolve("output/ui-browser-vite-"));
  try {
    const server = await createServer({ cacheDir, server: { host: "127.0.0.1", port: 0, hmr: false }, logLevel: "error" });
    try {
      const http = server.httpServer;
      assert(http);
      // Bind directly so parallel tests get distinct OS-assigned ports.
      await new Promise<void>((resolve, reject) => {
        http.once("error", reject);
        http.listen(0, "127.0.0.1", () => { http.off("error", reject); resolve(); });
      });
      const address = http.address();
      assert(address && typeof address !== "string");
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage({ viewport: { width: 1345, height: 609 } });
        await check(page, "http://127.0.0.1:" + address.port + "/");
      } finally {
        await browser.close();
      }
    } finally {
      await server.close();
    }
  } finally {
    await fs.rm(cacheDir, { recursive: true, force: true });
  }
}
