import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2011SpecialPm01To04Definitions } from './legacy-2011-special-pm-01-04';
import { legacy2011SpecialPm05To08Definitions } from './legacy-2011-special-pm-05-08';
import { legacy2011SpecialPm09To13Definitions } from './legacy-2011-special-pm-09-13';

export const legacy2011SpecialAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2011SpecialPm01To04Definitions,
  ...legacy2011SpecialPm05To08Definitions,
  ...legacy2011SpecialPm09To13Definitions,
];
