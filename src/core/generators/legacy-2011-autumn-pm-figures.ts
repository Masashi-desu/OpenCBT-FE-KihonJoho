import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2011AutumnPm0104Figures } from './legacy-2011-autumn-pm-01-04-figures';
import { legacy2011AutumnPm0508Figures } from './legacy-2011-autumn-pm-05-08-figures';
import { legacy2011AutumnPm0913Figures } from './legacy-2011-autumn-pm-09-13-figures';

export const legacy2011AutumnPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2011AutumnPm0104Figures,
  ...legacy2011AutumnPm0508Figures,
  ...legacy2011AutumnPm0913Figures,
];
