#!/usr/bin/env node
// Fetch build-time fonts once. Only verified bytes are stored or rendered.
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const brandDir = fileURLToPath(new URL("./brand/", import.meta.url));
export const defaultCacheDir = path.resolve(process.env.OPENCBT_FONT_CACHE ?? fileURLToPath(new URL("../.cache/brand-fonts/", import.meta.url)));
export const fontSources = [
  JSON.parse(fs.readFileSync(path.join(brandDir, "geometry.json"), "utf8")).font,
  JSON.parse(fs.readFileSync(path.join(brandDir, "NotoSansJP-source.json"), "utf8")),
];
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function fontCachePath(source, cacheDir = defaultCacheDir) {
  if (path.basename(source.file) !== source.file || !/^[a-f0-9]{64}$/.test(source.sha256)) throw Error("フォントのファイル名・SHA-256が不正です。");
  return path.join(cacheDir, `${source.sha256}-${source.file}`);
}

/** Read prepared fonts synchronously so the vector renderers remain local and deterministic. */
export function readFontBytes(file, { cacheDir = defaultCacheDir } = {}) {
  if (path.basename(file) !== file) throw Error("フォントにはファイル名を指定してください。");
  const source = fontSources.find((s) => s.file === file);
  if (!source) return fs.readFileSync(path.join(brandDir, file));
  const target = fontCachePath(source, cacheDir);
  if (!fs.existsSync(target)) throw Error(`フォント ${file} のキャッシュがありません。npm run fonts:prepare を実行してください。`);
  const bytes = fs.readFileSync(target);
  if (sha256(bytes) !== source.sha256) throw Error(`フォント ${file} のhashが一致しません。npm run fonts:prepare で再取得してください。`);
  return bytes;
}

/** A valid cache also works offline; failed downloads never replace cached files. */
export async function ensureFontFile(source, { cacheDir = defaultCacheDir, fetcher = fetch, timeoutMs = 30_000 } = {}) {
  const target = fontCachePath(source, cacheDir);
  if (fs.existsSync(target) && sha256(fs.readFileSync(target)) === source.sha256) return { path: target, downloaded: false };
  const url = new URL(source.cdnUrl);
  if (url.protocol !== "https:" || url.username || url.password) throw Error("フォント取得先は認証情報のないHTTPS URLを指定してください。");
  let bytes;
  try {
    const response = await fetcher(url.href, { signal: AbortSignal.timeout(timeoutMs), redirect: "error" });
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (sha256(bytes) !== source.sha256) throw Error("SHA-256が出典記録と一致しません");
  } catch (error) {
    throw Error(`フォント ${source.file} をCDNから取得できませんでした: ${error.message}。有効なキャッシュがない初回生成にはネットワーク接続が必要です。`);
  }
  fs.mkdirSync(cacheDir, { recursive: true });
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, bytes, { flag: "wx" });
    fs.renameSync(temporary, target);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
  return { path: target, downloaded: true };
}

export async function prepareBrandFonts(files = fontSources.map((s) => s.file), options) {
  const names = new Set(files);
  return Promise.all(fontSources.filter((s) => names.has(s.file)).map(async (source) => {
    const result = await ensureFontFile(source, options);
    if (result.downloaded) console.log(`CDN取得: ${source.family} → フォントキャッシュ`);
    return result;
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await prepareBrandFonts();
    console.log(`生成用フォント ${result.length}件を準備（新規取得 ${result.filter((r) => r.downloaded).length}件）。キャッシュ: ${defaultCacheDir}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
