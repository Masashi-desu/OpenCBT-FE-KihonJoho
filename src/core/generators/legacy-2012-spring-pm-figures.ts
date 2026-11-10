import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2012SpringPm0104Figures } from './legacy-2012-spring-pm-01-04-figures';
import { legacy2012SpringPm0508Figures } from './legacy-2012-spring-pm-05-08-figures';
import { legacy2012SpringPm0913Figures } from './legacy-2012-spring-pm-09-13-figures';

export const legacy2012SpringPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2012SpringPm0104Figures,
  ...legacy2012SpringPm0508Figures,
  ...legacy2012SpringPm0913Figures,
];
