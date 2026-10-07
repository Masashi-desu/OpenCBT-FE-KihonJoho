export const sortedJson = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(sortedJson)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, v]) => [k, sortedJson(v)]),
        )
      : value;
export async function sha256(value: string | ArrayBuffer | Uint8Array) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(digest)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export const contentHash = (value: unknown) =>
  sha256(JSON.stringify(sortedJson(value)));
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export const randomSeed = () =>
  [...crypto.getRandomValues(new Uint8Array(16))]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
export function randomInt(max: number) {
  if (!Number.isSafeInteger(max) || max < 1)
    throw Error("Invalid random range");
  const cap = Math.floor(4294967296 / max) * max;
  let v;
  do {
    v = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (v >= cap);
  return v % max;
}
export function shuffle<T>(input: T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
