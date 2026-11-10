import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2012SpringPm01To04Definitions } from './legacy-2012-spring-pm-01-04';
import { legacy2012SpringPm05To08Definitions } from './legacy-2012-spring-pm-05-08';
import { legacy2012SpringPm09To13Definitions } from './legacy-2012-spring-pm-09-13';

export const legacy2012SpringAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2012SpringPm01To04Definitions,
  ...legacy2012SpringPm05To08Definitions,
  ...legacy2012SpringPm09To13Definitions,
];
