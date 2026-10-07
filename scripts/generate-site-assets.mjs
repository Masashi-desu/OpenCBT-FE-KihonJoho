#!/usr/bin/env node
// Artwork is rendered locally from pinned, cached fonts and versioned geometry.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";
import { createIconFiles, makeBrandSvg } from "./generate-brand-icons.mjs";
import { prepareBrandFonts, readFontBytes } from "./brand-fonts.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const brandDir = path.join(root, "scripts/brand");
const fonts = new Map();
const round = (n) => Number(n.toFixed(4));
const hash = (data) => createHash("sha256").update(data).digest("hex").slice(0, 12);
const escape = (s) => String(s).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]);
const startMarker = "<!-- generated:site-assets:start -->";
const endMarker = "<!-- generated:site-assets:end -->";

export function readSiteConfig(file = path.join(brandDir, "site.json")) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readFont(file) {
  if (path.basename(file) !== file) throw Error("フォントは scripts/brand 内のファイル名で指定してください。");
  if (!fonts.has(file)) {
    const bytes = readFontBytes(file);
    fonts.set(file, opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
  }
  return fonts.get(file);
}

function positive(n, label) {
  if (!Number.isFinite(n) || n <= 0) throw Error(`${label} は正の数で指定してください。`);
}

export function makeSharingCard(config = readSiteConfig()) {
  const { width, height, iconSize, gap, lineGap, safeInset, lines } = config.card;
  for (const [key, value] of Object.entries({ width, height, iconSize, gap, lineGap, safeInset })) positive(value, key);
  if (!Number.isInteger(width) || !Number.isInteger(height) || lines.length !== 3) throw Error("画像寸法は整数、テキストは3行で指定してください。");
  for (const c of Object.values(config.colors)) if (!/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(c)) throw Error("配色は #RGB 又は #RRGGBB で指定してください。");
  const paths = lines.map((line) => {
    positive(line.size, "文字サイズ");
    if (!line.text.trim() || /[\u0000-\u001f\u007f]/u.test(line.text)) throw Error("各行には改行のない文字列を指定してください。");
    const font = readFont(line.font);
    const missing = [...new Set([...line.text].filter((c) => !font.hasChar(c)))];
    if (missing.length) throw Error(`フォント ${line.font} にない文字: ${missing.join(" ")}`);
    const outline = font.getPath(line.text, 0, 0, line.size);
    const bounds = outline.getBoundingBox();
    return { d: outline.toPathData(4), bounds, width: bounds.x2 - bounds.x1, height: bounds.y2 - bounds.y1 };
  });
  const textWidth = Math.max(...paths.map((p) => p.width));
  const textHeight = paths.reduce((sum, p) => sum + p.height, 0) + lineGap * (paths.length - 1);
  const groupWidth = textWidth + gap + iconSize;
  const groupHeight = Math.max(textHeight, iconSize);
  if (groupWidth > width - 2 * safeInset || groupHeight > height - 2 * safeInset) throw Error("文字とアイコンが画像の安全余白に収まりません。文字サイズ・間隔・アイコンサイズを調整してください。");
  const x = (width - groupWidth) / 2;
  const textX = x + iconSize + gap;
  let y = (height - textHeight) / 2;
  const textRects = [];
  const text = paths.map((p, i) => {
    textRects.push({ text: lines[i].text, x: round(textX), y: round(y), width: round(p.width), height: round(p.height) });
    const result = `<g transform="translate(${round(textX - p.bounds.x1)} ${round(y - p.bounds.y1)})"><path d="${p.d}"/></g>`;
    y += p.height + lineGap;
    return result;
  }).join("\n");
  const icon = makeBrandSvg({ label: config.certification, ink: config.colors.ink });
  const bounds = new Resvg(icon, { font: { loadSystemFonts: false } }).getBBox();
  if (!bounds || !bounds.width || !bounds.height) throw Error("ブランドアイコンの輪郭を取得できません。");
  const iconBody = icon.replace(/^<svg\b[^>]*>\s*<title\b[^>]*>[\s\S]*?<\/title>\s*/, "").replace(/<\/svg>\s*$/, "");
  const iconX = x, iconY = (height - iconSize) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="share-title">\n<title id="share-title">${escape(config.imageAlt)}</title>\n<rect width="${width}" height="${height}" fill="${config.colors.background}"/>\n<g id="share-text" fill="${config.colors.ink}">\n${text}\n</g>\n<svg id="share-icon" x="${round(iconX)}" y="${round(iconY)}" width="${iconSize}" height="${iconSize}" viewBox="${[bounds.x - 1, bounds.y - 1, bounds.width + 2, bounds.height + 2].map(round).join(" ")}">\n${iconBody}</svg>\n</svg>\n`;
  return { svg, layout: { width, height, text: textRects, icon: { x: round(iconX), y: round(iconY), width: iconSize, height: iconSize }, group: { x: round(x), y: round((height - groupHeight) / 2), width: round(groupWidth), height: round(groupHeight) } } };
}

export function normalizeSiteUrl(value) {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw Error("公開URLは認証情報・クエリ・ハッシュのない http(s) URLを指定してください。");
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.href;
}

export function buildSiteAssets(config = readSiteConfig(), siteUrl = config.siteUrl) {
  const canonical = normalizeSiteUrl(siteUrl);
  const card = makeSharingCard(config);
  const files = createIconFiles({ label: config.certification, ink: config.colors.ink, background: config.colors.background, backgroundRadius: config.faviconRadius });
  const png = new Resvg(card.svg, { font: { loadSystemFonts: false } }).render().asPng();
  files.set("open-graph.svg", Buffer.from(card.svg));
  files.set("open-graph.png", png);
  const manifest = {
    id: "./", name: config.title, short_name: config.name, description: config.description,
    lang: config.locale.replace("_", "-"), start_url: "./#/menu", scope: "./", display: "standalone",
    theme_color: config.colors.background, background_color: config.colors.background, categories: ["education"],
    icons: [192, 512].map((size) => ({ src: `./app-icon-${size}.png?v=${hash(files.get(`app-icon-${size}.png`))}`, sizes: `${size}x${size}`, type: "image/png", purpose: "any" })),
  };
  files.set("site.webmanifest", Buffer.from(JSON.stringify(manifest, null, 2) + "\n"));
  const imageUrl = new URL(`open-graph.png?v=${hash(png)}`, canonical).href;
  const meta = (kind, key, value) => `<meta ${kind}="${key}" content="${escape(value)}" />`;
  const head = [
    meta("name", "description", config.description), `<link rel="canonical" href="${escape(canonical)}" />`,
    meta("property", "og:type", "website"), meta("property", "og:site_name", config.name),
    meta("property", "og:title", config.title), meta("property", "og:description", config.description),
    meta("property", "og:locale", config.locale), meta("property", "og:url", canonical),
    meta("property", "og:image", imageUrl), meta("property", "og:image:type", "image/png"),
    meta("property", "og:image:width", config.card.width), meta("property", "og:image:height", config.card.height),
    meta("property", "og:image:alt", config.imageAlt), meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", config.title), meta("name", "twitter:description", config.description),
    meta("name", "twitter:image", imageUrl), meta("name", "twitter:image:alt", config.imageAlt),
    `<link rel="icon" href="./favicon.ico?v=${hash(files.get("favicon.ico"))}" sizes="16x16 32x32 48x48" />`,
    `<link rel="icon" href="./favicon.svg?v=${hash(files.get("favicon.svg"))}" type="image/svg+xml" sizes="any" />`,
    `<link rel="apple-touch-icon" href="./apple-touch-icon.png?v=${hash(files.get("apple-touch-icon.png"))}" />`,
    `<link rel="manifest" href="./site.webmanifest" />`, meta("name", "theme-color", config.colors.background),
    `<title>${escape(config.title)}</title>`,
  ].map((line) => `    ${line}`).join("\n");
  return { files, head, layout: card.layout, canonical };
}

export function updateGeneratedHead(html, head) {
  if (html.split(startMarker).length !== 2 || html.split(endMarker).length !== 2 || html.indexOf(startMarker) >= html.indexOf(endMarker)) throw Error("index.html のメタ情報生成マーカーは開始・終了各1件をこの順に置いてください。");
  return html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), () => `${startMarker}\n${head}\n    ${endMarker}`);
}

/** @param {{config?: any, siteUrl?: string, outDir?: string, indexFile?: string|null, check?: boolean}} [options] */
export function generateSiteAssets({ config = readSiteConfig(), siteUrl = config.siteUrl, outDir = path.join(root, "public"), indexFile = path.join(root, "index.html"), check = false } = {}) {
  const result = buildSiteAssets(config, siteUrl);
  const html = indexFile ? updateGeneratedHead(fs.readFileSync(indexFile, "utf8"), result.head) : undefined;
  if (check) {
    const stale = [];
    for (const [name, data] of result.files) {
      const file = path.join(outDir, name);
      if (!fs.existsSync(file) || !fs.readFileSync(file).equals(data)) stale.push(name);
    }
    if (html !== undefined && fs.readFileSync(indexFile, "utf8") !== html) stale.push("index.html");
    if (stale.length) throw Error(`生成資産が古いか欠落しています: ${stale.join(", ")}。npm run assets:generate を実行してください。`);
  } else {
    fs.mkdirSync(outDir, { recursive: true });
    for (const [name, data] of result.files) fs.writeFileSync(path.join(outDir, name), data);
    if (html !== undefined) fs.writeFileSync(indexFile, html);
  }
  return result;
}

async function main() {
  const { values } = parseArgs({ options: { config: { type: "string" }, "site-url": { type: "string" }, "out-dir": { type: "string" }, check: { type: "boolean" }, help: { type: "boolean", short: "h" } } });
  if (values.help) {
    console.log("npm run assets:generate -- [--config file.json] [--site-url https://example.com/app/] [--out-dir directory] [--check]\n設定の正本: scripts/brand/site.json。別の出力先では index.html を更新しません。\n--site-url、SITE_URL、設定ファイルの順で公開URLを決めます。生成用フォントは初回だけCDNから取得し、固定版・hashを検査してキャッシュします。");
    return;
  }
  const config = readSiteConfig(values.config);
  await prepareBrandFonts([
    ...config.card.lines.map((line) => line.font),
    ...(config.certification !== "FE" ? ["ArchivoBlack-Regular.ttf"] : []),
  ]);
  const customOutput = values["out-dir"] !== undefined;
  const result = generateSiteAssets({ config, siteUrl: values["site-url"] ?? process.env.SITE_URL ?? config.siteUrl, outDir: customOutput ? path.resolve(values["out-dir"]) : path.join(root, "public"), indexFile: customOutput ? null : path.join(root, "index.html"), check: values.check });
  console.log(`${values.check ? "検証" : "生成"}: ${result.files.size}資産、OG ${result.layout.width}×${result.layout.height}、公開URL ${result.canonical}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
