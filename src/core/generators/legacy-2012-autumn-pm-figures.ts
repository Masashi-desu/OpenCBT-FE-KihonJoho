import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2012AutumnPm0104Figures } from './legacy-2012-autumn-pm-01-04-figures';
import { autumn2012Pm0508Figures } from './legacy-2012-autumn-pm-05-08-figures';
import { legacy2012AutumnPm0913Figures } from './legacy-2012-autumn-pm-09-13-figures';

export const legacy2012AutumnPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2012AutumnPm0104Figures,
  ...autumn2012Pm0508Figures,
  ...legacy2012AutumnPm0913Figures,
];
