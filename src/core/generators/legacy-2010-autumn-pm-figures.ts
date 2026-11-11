import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2010AutumnPm0104Figures } from './legacy-2010-autumn-pm-01-04-figures';
import { legacy2010AutumnPm0508Figures } from './legacy-2010-autumn-pm-05-08-figures';
import { legacy2010AutumnPm0913Figures } from './legacy-2010-autumn-pm-09-13-figures';

export const legacy2010AutumnPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2010AutumnPm0104Figures,
  ...legacy2010AutumnPm0508Figures,
  ...legacy2010AutumnPm0913Figures,
];
