import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import {
  buildSiteAssets, generateSiteAssets, makeSharingCard, normalizeSiteUrl,
  readSiteConfig, updateGeneratedHead,
} from "../scripts/generate-site-assets.mjs";

test("the rendered OpenGraph artwork is centered with the required three lines and intact icon", () => {
  const card = makeSharingCard();
  assert.deepEqual(card.layout.text.map((r: {text: string}) => r.text), ["OpenCBT FE", "基本情報技術者試験", "模擬試験"]);
  assert(!/<text\b|<image\b|font-family=|href=/u.test(card.svg));
  const rendered = new Resvg(card.svg, { font: { loadSystemFonts: false } }).render();
  assert.equal(rendered.width, 1200);
  assert.equal(rendered.height, 630);
  const pixels = rendered.pixels;
  let left = 1200, top = 630, right = 0, bottom = 0;
  for (let y = 0; y < 630; y++) for (let x = 0; x < 1200; x++) {
    if (pixels[(y * 1200 + x) * 4] < 64) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  assert(Math.abs((left + right) / 2 - 600) <= 1);
  assert(Math.abs((top + bottom) / 2 - 315) <= 1);
  assert(left >= 64 && right < 1136 && top >= 64 && bottom < 566);
  for (const line of card.layout.text) assert(card.layout.icon.x + card.layout.icon.width < line.x);
  // The selected mark has a round top-left corner; a tight/incorrect crop must not square it off.
  const x = Math.floor(card.layout.icon.x + 4), y = Math.floor(card.layout.icon.y + 9);
  assert.equal(pixels[(y * 1200 + x) * 4], 255);
});

test("metadata and manifest use the correct subdirectory and the rendered image dimensions", () => {
  const result = buildSiteAssets(readSiteConfig(), "https://example.com/qualifications/fe");
  assert.equal(result.canonical, "https://example.com/qualifications/fe/");
  assert.match(result.head, /property="og:image" content="https:\/\/example\.com\/qualifications\/fe\/open-graph\.png\?v=[a-f0-9]{12}"/);
  assert.match(result.head, /property="og:image:width" content="1200"/);
  assert.match(result.head, /property="og:image:height" content="630"/);
  assert.match(result.head, /name="twitter:card" content="summary_large_image"/);
  const png = result.files.get("open-graph.png")!;
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  const manifest = JSON.parse(result.files.get("site.webmanifest")!.toString());
  assert.equal(manifest.start_url, "./#/menu");
  assert.equal(manifest.scope, "./");
  for (const icon of manifest.icons) {
    const filename = icon.src.split("?")[0].slice(2);
    assert(result.files.has(filename));
    assert.equal(new URL(icon.src, "https://example.com/qualifications/fe/site.webmanifest").pathname, `/qualifications/fe/${filename}`);
  }
  assert.throws(() => normalizeSiteUrl("javascript:alert(1)"));
  assert.throws(() => normalizeSiteUrl("https://user:password@example.com/"));
  assert.throws(() => normalizeSiteUrl("https://example.com/#/menu"));
});

test("generated head preserves CSP and application code, escaping literal replacement characters", () => {
  const config = readSiteConfig();
  config.title = 'OpenCBT "<& $&';
  const { head } = buildSiteAssets(config);
  const prefix = '<meta http-equiv="Content-Security-Policy" content="default-src self"/>\n';
  const suffix = '\n<script type="module" src="/src/main.tsx"></script>';
  const html = prefix + '<!-- generated:site-assets:start -->old<!-- generated:site-assets:end -->' + suffix;
  const updated = updateGeneratedHead(html, head);
  assert(updated.startsWith(prefix) && updated.endsWith(suffix));
  assert(updated.includes("OpenCBT &quot;&lt;&amp; $&"));
  assert.equal(updated.match(/property="og:image"/g)!.length, 1);
  assert.equal(updateGeneratedHead(updated, head), updated);
  assert.throws(() => updateGeneratedHead("no markers", head));
  const reversed = '<!-- generated:site-assets:end -->old<!-- generated:site-assets:start -->';
  assert.throws(() => updateGeneratedHead(reversed, head), /マーカー/);
  assert.throws(() => updateGeneratedHead(html + '<!-- generated:site-assets:start -->', head), /マーカー/);
});

test("read-only asset checks detect missing and stale output without changing it", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-site-assets-"));
  try {
    generateSiteAssets({ outDir: directory, indexFile: null });
    generateSiteAssets({ outDir: directory, indexFile: null, check: true });
    const image = path.join(directory, "open-graph.png");
    fs.writeFileSync(image, "stale image");
    assert.throws(() => generateSiteAssets({ outDir: directory, indexFile: null, check: true }), /open-graph.png/);
    assert.equal(fs.readFileSync(image, "utf8"), "stale image");
    fs.rmSync(image);
    assert.throws(() => generateSiteAssets({ outDir: directory, indexFile: null, check: true }), /open-graph.png/);
    const config = readSiteConfig();
    config.card.lines[1].size = 400;
    assert.throws(() => generateSiteAssets({ config, outDir: directory, indexFile: null }), /安全余白/);
    assert(!fs.existsSync(image));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
