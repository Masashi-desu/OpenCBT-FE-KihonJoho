import type { BookletFigureExtension } from './booklet-figure-extension-contract';
import { legacy2016AutumnPmFigures } from './generators/legacy-2016-autumn-pm-figures';
import { legacy2016SpringPmFigures } from './generators/legacy-2016-spring-pm-figures';

// Only source-owned figure declarations belong here. Validation stays shared.
export const bookletFigureExtensions: readonly BookletFigureExtension[] = [
  { scope: '2016-autumn-pm', figures: legacy2016AutumnPmFigures },
  { scope: '2016-spring-pm', figures: legacy2016SpringPmFigures },
];
