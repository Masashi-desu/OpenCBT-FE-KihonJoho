import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2013SpringPm0104Figures } from './legacy-2013-spring-pm-01-04-figures';
import { legacy2013SpringPm0508Figures } from './legacy-2013-spring-pm-05-08-figures';
import { legacy2013SpringPm0913Figures } from './legacy-2013-spring-pm-09-13-figures';

export const legacy2013SpringPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2013SpringPm0104Figures,
  ...legacy2013SpringPm0508Figures,
  ...legacy2013SpringPm0913Figures,
];
