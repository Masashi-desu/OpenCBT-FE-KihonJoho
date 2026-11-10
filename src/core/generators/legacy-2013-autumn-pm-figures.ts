import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2013AutumnPm0104Figures } from './legacy-2013-autumn-pm-01-04-figures';
import { legacy2013AutumnPm0508Figures } from './legacy-2013-autumn-pm-05-08-figures';
import { legacy2013AutumnPm0913Figures } from './legacy-2013-autumn-pm-09-13-figures';

export const legacy2013AutumnPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2013AutumnPm0104Figures,
  ...legacy2013AutumnPm0508Figures,
  ...legacy2013AutumnPm0913Figures,
];
