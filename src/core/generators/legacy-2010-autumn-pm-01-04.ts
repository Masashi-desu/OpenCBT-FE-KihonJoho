import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { legacy2010AutumnPm1Definition } from './legacy-2010-autumn-pm-1';
import { legacy2010AutumnPm2Definition } from './legacy-2010-autumn-pm-2';
import { legacy2010AutumnPm3Definition } from './legacy-2010-autumn-pm-3';
import { legacy2010AutumnPm4Definition } from './legacy-2010-autumn-pm-4';

export const legacy2010AutumnPm01To04Definitions: readonly AfternoonBookletDefinition[] = [
  legacy2010AutumnPm1Definition, legacy2010AutumnPm2Definition,
  legacy2010AutumnPm3Definition, legacy2010AutumnPm4Definition,
];
