import type { Bundle, Catalog, Asset } from "./types";
import { sha256 } from "./hash";
import { DataError, schema, validateBundle } from "./validation";
export const assetBase = new URL(
  `${import.meta.env.BASE_URL}data/`,
  location.href.split("#")[0],
);
async function bytes(path: string, max: number) {
  const res = await fetch(new URL(path, assetBase), {
    cache: "no-cache",
    referrerPolicy: "no-referrer",
  });
  if (!res.ok)
    throw new DataError("NETWORK", `読込み失敗: ${path} (${res.status})`);
  const declared = Number(res.headers.get("content-length"));
  if (declared > max) throw new DataError("SIZE", path);
  const reader = res.body?.getReader();
  if (!reader) throw new DataError("NETWORK", path);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new DataError("SIZE", path);
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}
export async function loadCatalog(): Promise<Bundle> {
  const raw = await bytes("catalog.json", 1048576),
    catalog = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(raw),
    ) as Catalog;
  schema("catalog", catalog);
  const b: Bundle = {
    catalog,
    catalogHash: await sha256(raw),
    questions: [],
    sources: [],
    rights: [],
    assets: [],
    sets: [],
    exams: [],
    templates: [],
  };
  const queue = Object.entries(catalog.files).flatMap(([kind, files]) =>
    files.map((f) => ({ kind, ...f })),
  );
  let index = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (index < queue.length) {
        const f = queue[index++];
        if (!new RegExp(`^${f.kind}/[a-z0-9-]+\\.json$`).test(f.path))
          throw new DataError("PATH", f.path);
        const raw = await bytes(f.path, 2097152);
        if ((await sha256(raw)) !== f.sha256)
          throw new DataError("FILE_HASH", f.path);
        (b[f.kind as keyof Bundle] as unknown[]).push(
          JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)),
        );
      }
    }),
  );
  // Network completion order must not decide the independent-set order.
  for (const kind of ["questions", "sets", "exams", "templates"] as const)
    b[kind].sort((a, c) => a.id.localeCompare(c.id));
  // Annual originals retain the original question number, rather than lexicographic 1,10,11,2.
  b.questions.sort((a, c) => {
    const ar = a.origin.sourceRefs[0]?.locator,
      cr = c.origin.sourceRefs[0]?.locator;
    return (
      (ar?.year ?? 9999) - (cr?.year ?? 9999) ||
      a.subject.localeCompare(c.subject) ||
      Number(ar?.questionNumber ?? 0) - Number(cr?.questionNumber ?? 0) ||
      a.id.localeCompare(c.id)
    );
  });
  await validateBundle(b);
  return b;
}
export async function loadAsset(a: Asset): Promise<Blob> {
  if (!/^assets\/[a-z0-9-]+\.(png|jpg|webp)$/.test(a.path))
    throw new DataError("PATH", a.path);
  const raw = await bytes(a.path, 2097152);
  return validateAssetBlob(
    a,
    new Blob([raw as BlobPart], { type: a.mediaType }),
  );
}
export async function validateAssetBlob(a: Asset, blob: Blob): Promise<Blob> {
  if (
    !(blob instanceof Blob) ||
    blob.size > 2097152 ||
    blob.type !== a.mediaType
  )
    throw new DataError("ASSET_TYPE", a.id);
  const raw = new Uint8Array(await blob.arrayBuffer());
  if (raw.length !== a.byteLength || (await sha256(raw)) !== a.sha256)
    throw new DataError("ASSET_HASH", a.id);
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...raw.slice(start, end));
  const valid =
    a.mediaType === "image/webp"
      ? ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP"
      : a.mediaType === "image/png"
        ? raw.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
        : raw[0] === 255 && raw[1] === 216 && raw[2] === 255;
  if (!valid) throw new DataError("ASSET_TYPE", a.id);
  const bitmap = await createImageBitmap(blob);
  const dimensions = bitmap.width === a.width && bitmap.height === a.height;
  bitmap.close();
  if (!dimensions) throw new DataError("ASSET_DIMENSIONS", a.id);
  return blob;
}
