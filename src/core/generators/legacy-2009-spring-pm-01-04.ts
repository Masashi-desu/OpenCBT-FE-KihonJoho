import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2009SpringPm1Definition } from './legacy-2009-spring-pm-1';
import { legacy2009SpringPm3Definition } from './legacy-2009-spring-pm-3';
import { legacy2009SpringPm4Definition } from './legacy-2009-spring-pm-4';

export const legacy2009SpringPm01To04Definitions: readonly AfternoonBookletDefinition[] = [
  legacy2009SpringPm1Definition, legacy2009SpringPm3Definition, legacy2009SpringPm4Definition,
];
