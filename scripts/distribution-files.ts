import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { Bundle, Catalog, CatalogFile } from "../src/core/types";
import { CATALOG_MAX_BYTES, RECORD_FILE_MAX_BYTES, PACK_MAX_RECORDS, CATEGORY_MAX_RECORDS, catalogFileRecords, catalogKinds } from "../src/core/catalog-files";

const hash = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");
export function readDistributionBundle(root = path.resolve("public/data")): Bundle {
  const raw = fs.readFileSync(path.join(root, "catalog.json"));
  if (raw.byteLength > CATALOG_MAX_BYTES) throw Error("SIZE catalog.json");
  const catalog = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)) as Catalog;
  const bundle = { catalog, catalogHash: hash(raw), questions: [], sources: [], rights: [], assets: [], sets: [], exams: [], templates: [] } as Bundle;
  for (const [kind, files] of Object.entries(catalog.files)) {
    if (!(catalogKinds as readonly string[]).includes(kind) || !Array.isArray(files)) throw Error(`CATALOG_KIND ${kind}`);
    for (const file of files) {
      if (!new RegExp(`^${kind}/[a-z0-9-]+\\.json$`).test(file.path)) throw Error(`PATH ${file.path}`);
      const raw = fs.readFileSync(path.join(root, file.path));
      if (raw.byteLength > RECORD_FILE_MAX_BYTES) throw Error(`SIZE ${file.path}`);
      if (hash(raw) !== file.sha256) throw Error(`FILE_HASH ${file.path}`);
      const records = catalogFileRecords(file, JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)));
      const target = bundle[kind as typeof catalogKinds[number]] as unknown[];
      if (target.length + records.length > CATEGORY_MAX_RECORDS) throw Error(`RECORD_LIMIT ${kind}`);
      target.push(...records);
    }
  }
  return bundle;
}

/** Partition by both encoded bytes and records; no oversized-file exemption. */
export function encodeRecordPacks(kind: string, records: readonly unknown[]): { entry: CatalogFile; bytes: Buffer }[] {
  if (!(catalogKinds as readonly string[]).includes(kind)) throw Error("CATALOG_KIND");
  if (records.length > CATEGORY_MAX_RECORDS) throw Error("RECORD_LIMIT");
  const packs: { entry: CatalogFile; bytes: Buffer }[] = [];
  let pending: string[] = [], size = 3; // brackets and final newline
  const flush = () => {
    if (!pending.length) return;
    const bytes = Buffer.from("[" + pending.join(",") + "]\n"), digest = hash(bytes);
    packs.push({ entry: { path: `${kind}/pack-${digest}.json`, sha256: digest, recordCount: pending.length }, bytes });
    pending = []; size = 3;
  };
  for (const record of records) {
    if (!record || typeof record !== "object" || Array.isArray(record)) throw Error("RECORD_FILE");
    const text = JSON.stringify(record), bytes = Buffer.byteLength(text);
    if (bytes + 3 > RECORD_FILE_MAX_BYTES) throw Error("SIZE: one record exceeds 2 MiB");
    if (pending.length === PACK_MAX_RECORDS || size + bytes + 1 > RECORD_FILE_MAX_BYTES) flush();
    size += bytes + (pending.length ? 1 : 0); pending.push(text);
  }
  flush();
  if (packs.length > 500) throw Error("FILE_LIMIT: record sizes require more than 500 packs");
  return packs;
}

/** Repack listed data only; unrelated files are never removed. */
export function compactDistribution(root: string, threshold = 500) {
  const bundle = readDistributionBundle(root), catalog = structuredClone(bundle.catalog);
  const removed: CatalogFile[] = [];
  let changed = false;
  for (const kind of catalogKinds) {
    const records = [...bundle[kind]].sort((a, b) => a.id.localeCompare(b.id));
    if (records.length <= threshold) continue;
    const packs = encodeRecordPacks(kind, records);
    if (JSON.stringify(packs.map(p => p.entry)) === JSON.stringify(catalog.files[kind])) continue;
    removed.push(...catalog.files[kind]);
    for (const pack of packs) {
      const destination = path.join(root, pack.entry.path);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      if (fs.existsSync(destination) && hash(fs.readFileSync(destination)) !== pack.entry.sha256) throw Error("PACK_COLLISION");
      fs.writeFileSync(destination, pack.bytes);
    }
    catalog.files[kind] = packs.map(pack => pack.entry);
    changed = true;
  }
  if (!changed) return false;
  catalog.revision++;
  const temp = path.join(root, ".catalog-next.json");
  fs.writeFileSync(temp, JSON.stringify(catalog, null, 2) + "\n");
  fs.renameSync(temp, path.join(root, "catalog.json"));
  const keep = new Set(Object.values(catalog.files).flatMap(files => files.map(f => f.path)));
  for (const old of removed) {
    if (keep.has(old.path)) continue;
    const file = path.join(root, old.path);
    if (hash(fs.readFileSync(file)) !== old.sha256) throw Error(`FILE_CHANGED ${old.path}`);
    fs.unlinkSync(file);
  }
  return true;
}
