import type { Bundle, Catalog } from "./types";
import { sha256 } from "./hash";
import { DataError, schema, validateBundle } from "./validation";
import { CATALOG_MAX_BYTES, RECORD_FILE_MAX_BYTES, CATEGORY_MAX_RECORDS, catalogFileRecords, catalogKinds } from "./catalog-files";

/** Shared browser protocol, injectable transport for isolated integrity/load tests. */
export async function readCatalog(
  read: (path: string, maximumBytes: number) => Promise<Uint8Array>,
  validate: (bundle: Bundle) => Promise<void> = validateBundle,
): Promise<Bundle> {
  const raw = await read("catalog.json", CATALOG_MAX_BYTES);
  if (raw.byteLength > CATALOG_MAX_BYTES) throw new DataError("SIZE", "catalog.json");
  const decode = (bytes: Uint8Array) => JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  const catalog = decode(raw) as Catalog;
  schema("catalog", catalog);
  const bundle: Bundle = { catalog, catalogHash: await sha256(raw), questions: [], sources: [], rights: [], assets: [], sets: [], exams: [], templates: [] };
  const queue = Object.entries(catalog.files).flatMap(([kind, files]) => files.map(file => ({ kind, ...file })));
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(8, queue.length) }, async () => {
    while (next < queue.length) {
      const file = queue[next++];
      if (!new RegExp(`^${file.kind}/[a-z0-9-]+\\.json$`).test(file.path))
        throw new DataError("PATH", file.path);
      const bytes = await read(file.path, RECORD_FILE_MAX_BYTES);
      if (bytes.byteLength > RECORD_FILE_MAX_BYTES) throw new DataError("SIZE", file.path);
      if (await sha256(bytes) !== file.sha256) throw new DataError("FILE_HASH", file.path);
      const records = catalogFileRecords(file, decode(bytes));
      const target = bundle[file.kind as typeof catalogKinds[number]];
      if (target.length + records.length > CATEGORY_MAX_RECORDS) throw new DataError("RECORD_LIMIT", file.kind);
      (target as unknown[]).push(...records);
    }
  }));
  // Transport completion order must never change issuance or reference order.
  for (const kind of catalogKinds) bundle[kind].sort((a, b) => a.id.localeCompare(b.id));
  bundle.questions.sort((a, b) => {
    const ar = a.origin.sourceRefs[0]?.locator, br = b.origin.sourceRefs[0]?.locator;
    return (ar?.year ?? 9999) - (br?.year ?? 9999) || a.subject.localeCompare(b.subject) ||
      Number(ar?.questionNumber ?? 0) - Number(br?.questionNumber ?? 0) || a.id.localeCompare(b.id);
  });
  await validate(bundle);
  return bundle;
}
