import type { AfternoonBookletExtension } from './afternoon-booklet-extension-contract';
import { legacy2016AutumnAfternoonDefinitions } from './legacy-2016-autumn-afternoon';
import { legacy2016SpringAfternoonDefinitions } from './legacy-2016-spring-afternoon';

// Append-only, source-owned declarations. Shared binding and validation live in
// the contract; this file cannot supply executable hooks or replace old entries.
export const bookletExtensions: readonly AfternoonBookletExtension[] = [
  { scope: '2016-autumn-pm', definitions: legacy2016AutumnAfternoonDefinitions },
  { scope: '2016-spring-pm', definitions: legacy2016SpringAfternoonDefinitions },
];
