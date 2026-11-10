import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2012AutumnPm01To04Definitions } from './legacy-2012-autumn-pm-01-04';
import { legacy2012AutumnPm05To08Definitions } from './legacy-2012-autumn-pm-05-08';
import { legacy2012AutumnPm09To13Definitions } from './legacy-2012-autumn-pm-09-13';

export const legacy2012AutumnAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2012AutumnPm01To04Definitions,
  ...legacy2012AutumnPm05To08Definitions,
  ...legacy2012AutumnPm09To13Definitions,
];
