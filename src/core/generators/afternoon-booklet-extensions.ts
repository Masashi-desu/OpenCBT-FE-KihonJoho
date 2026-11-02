import type { AfternoonBookletExtension } from './afternoon-booklet-extension-contract';

// Append-only, source-owned declarations. Shared binding and validation live in
// the contract; this file cannot supply executable hooks or replace old entries.
export const bookletExtensions: readonly AfternoonBookletExtension[] = [];
