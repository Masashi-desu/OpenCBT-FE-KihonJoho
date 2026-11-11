import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2010AutumnPm01To04Definitions } from './legacy-2010-autumn-pm-01-04';
import { legacy2010AutumnPm05To08Definitions } from './legacy-2010-autumn-pm-05-08';
import { legacy2010AutumnPm09To13Definitions } from './legacy-2010-autumn-pm-09-13';

export const legacy2010AutumnAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2010AutumnPm01To04Definitions,
  ...legacy2010AutumnPm05To08Definitions,
  ...legacy2010AutumnPm09To13Definitions,
];
