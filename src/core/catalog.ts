import type { Bundle, Asset } from "./types";
import { sha256 } from "./hash";
import { DataError } from "./validation";
import { readCatalog } from "./catalog-reader";
import {hasAssetSignature} from "./asset-signature";
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
  return readCatalog(bytes);
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
  if (!hasAssetSignature(a,raw)) throw new DataError("ASSET_TYPE", a.id);
  const bitmap = await createImageBitmap(blob);
  const dimensions = bitmap.width === a.width && bitmap.height === a.height;
  bitmap.close();
  if (!dimensions) throw new DataError("ASSET_DIMENSIONS", a.id);
  return blob;
}
