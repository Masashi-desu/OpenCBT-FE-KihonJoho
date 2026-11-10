import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2013CommonFigure } from './legacy-2013-spring-am-common';
import { legacy2013SpringAm0126Figures } from './legacy-2013-spring-am-01-26-figures';
import { legacy2013SpringAm2753Figures } from './legacy-2013-spring-am-27-53-figures';
import { legacy2013SpringAm5480Figures } from './legacy-2013-spring-am-54-80-figures';

export const spring2013AmFigures: readonly BookletFigureDefinition[] = [
  spring2013CommonFigure,
  ...legacy2013SpringAm0126Figures,
  ...legacy2013SpringAm2753Figures,
  ...legacy2013SpringAm5480Figures,
];
