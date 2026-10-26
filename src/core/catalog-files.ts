import type { CatalogFile } from "./types";
import { DataError } from "./errors";

export const CATALOG_MAX_BYTES = 1048576;
export const RECORD_FILE_MAX_BYTES = 2097152;
export const PACK_MAX_RECORDS = 64;
export const CATEGORY_MAX_RECORDS = 500 * PACK_MAX_RECORDS;
export const catalogKinds = ["questions", "sources", "rights", "assets", "sets", "exams", "templates"] as const;

/** A pack is data, never executable content. Its entire byte stream is hashed. */
export function catalogFileRecords(file: CatalogFile, value: unknown): unknown[] {
  if (file.recordCount === undefined) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new DataError("RECORD_FILE", file.path);
    return [value];
  }
  if (!Number.isInteger(file.recordCount) || file.recordCount < 1 || file.recordCount > PACK_MAX_RECORDS ||
    !Array.isArray(value) || value.length !== file.recordCount ||
    value.some(record => !record || typeof record !== "object" || Array.isArray(record)))
    throw new DataError("RECORD_PACK", file.path);
  return value;
}
