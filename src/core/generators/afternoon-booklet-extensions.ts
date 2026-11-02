import type { AfternoonBookletExtension } from './afternoon-booklet-extension-contract';
import { legacy2016AutumnAfternoonDefinitions } from './legacy-2016-autumn-afternoon';

// Append-only, source-owned declarations. Shared binding and validation live in
// the contract; this file cannot supply executable hooks or replace old entries.
export const bookletExtensions: readonly AfternoonBookletExtension[] = [{scope:'2016-autumn-pm',definitions:legacy2016AutumnAfternoonDefinitions}];
