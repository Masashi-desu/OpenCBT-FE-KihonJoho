import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2012CommonFigure } from './legacy-2012-spring-am-common';
import { legacy2012SpringAm0126Figures } from './legacy-2012-spring-am-01-26-figures';
import { legacy2012SpringAm2753Figures } from './legacy-2012-spring-am-27-53-figures';
import { legacy2012SpringAm5480Figures } from './legacy-2012-spring-am-54-80-figures';

export const spring2012AmFigures: readonly BookletFigureDefinition[] = [
  spring2012CommonFigure,
  ...legacy2012SpringAm0126Figures,
  ...legacy2012SpringAm2753Figures,
  ...legacy2012SpringAm5480Figures,
];
