import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2010SpringPm0104Figures } from './legacy-2010-spring-pm-01-04-figures';
import { legacy2010SpringPm0508Figures } from './legacy-2010-spring-pm-05-08-figures';
import { legacy2010SpringPm0913Figures } from './legacy-2010-spring-pm-09-13-figures';

export const legacy2010SpringPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2010SpringPm0104Figures,
  ...legacy2010SpringPm0508Figures,
  ...legacy2010SpringPm0913Figures,
];
