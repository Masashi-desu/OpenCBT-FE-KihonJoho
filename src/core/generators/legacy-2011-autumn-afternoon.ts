import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2011AutumnPm01To04Definitions } from './legacy-2011-autumn-pm-01-04';
import { legacy2011AutumnPm05To08Definitions } from './legacy-2011-autumn-pm-05-08';
import { legacy2011AutumnPm09To13Definitions } from './legacy-2011-autumn-pm-09-13';

export const legacy2011AutumnAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2011AutumnPm01To04Definitions,
  ...legacy2011AutumnPm05To08Definitions,
  ...legacy2011AutumnPm09To13Definitions,
];
