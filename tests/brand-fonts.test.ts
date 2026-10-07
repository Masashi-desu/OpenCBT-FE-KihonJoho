import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ensureFontFile, fontCachePath, fontSources, readFontBytes } from "../scripts/brand-fonts.mjs";

test("build fonts are fetched once and a verified cache works without a network", async () => {
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-font-cache-"));
  const source = fontSources[0], original = readFontBytes(source.file);
  let requests = 0;
  try {
    assert.throws(() => readFontBytes(source.file, { cacheDir }), /fonts:prepare/);
    const fetched = await ensureFontFile(source, { cacheDir, fetcher: async (url) => {
      requests++;
      assert.equal(url, source.cdnUrl);
      return new Response(original);
    } });
    assert.equal(fetched.downloaded, true);
    assert.deepEqual(readFontBytes(source.file, { cacheDir }), original);
    const cached = await ensureFontFile(source, { cacheDir, fetcher: async () => {
      throw Error("network is offline");
    } });
    assert.equal(cached.downloaded, false);
    assert.equal(requests, 1);
    assert.deepEqual(fs.readdirSync(cacheDir), [path.basename(fetched.path)]);
  } finally {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
});

test("corrupt or failed font downloads are rejected before writing and a valid download repairs the cache", async () => {
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-font-corrupt-"));
  const source = fontSources[0], original = readFontBytes(source.file);
  const target = fontCachePath(source, cacheDir);
  try {
    fs.writeFileSync(target, "corrupt cached font");
    assert.throws(() => readFontBytes(source.file, { cacheDir }), /hash/);
    await assert.rejects(ensureFontFile(source, { cacheDir, fetcher: async () => new Response("wrong font") }), /SHA-256/);
    await assert.rejects(ensureFontFile(source, { cacheDir, fetcher: async () => new Response(null, { status: 503 }) }), /HTTP 503/);
    await assert.rejects(ensureFontFile(source, { cacheDir, fetcher: async () => { throw Error("offline"); } }), /offline/);
    assert.equal(fs.readFileSync(target, "utf8"), "corrupt cached font");
    assert.deepEqual(fs.readdirSync(cacheDir), [path.basename(target)]);
    await ensureFontFile(source, { cacheDir, fetcher: async () => new Response(original) });
    assert.deepEqual(readFontBytes(source.file, { cacheDir }), original);
  } finally {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
});
