import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2010SpringPm01To04Definitions } from './legacy-2010-spring-pm-01-04';
import { legacy2010SpringPm05To08Definitions } from './legacy-2010-spring-pm-05-08';
import { legacy2010SpringPm09To13Definitions } from './legacy-2010-spring-pm-09-13';

export const legacy2010SpringAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2010SpringPm01To04Definitions,
  ...legacy2010SpringPm05To08Definitions,
  ...legacy2010SpringPm09To13Definitions,
];
