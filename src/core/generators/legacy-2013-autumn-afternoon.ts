import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2013AutumnPm01To04Definitions } from './legacy-2013-autumn-pm-01-04';
import { legacy2013AutumnPm05To08Definitions } from './legacy-2013-autumn-pm-05-08';
import { legacy2013AutumnPm09To13Definitions } from './legacy-2013-autumn-pm-09-13';

export const legacy2013AutumnAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2013AutumnPm01To04Definitions,
  ...legacy2013AutumnPm05To08Definitions,
  ...legacy2013AutumnPm09To13Definitions,
];
