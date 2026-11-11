import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2010CommonFigure } from './legacy-2010-spring-am-common';
import { legacy2010SpringAm0126Figures } from './legacy-2010-spring-am-01-26-figures';
import { legacy2010SpringAm2753Figures } from './legacy-2010-spring-am-27-53-figures';
import { legacy2010SpringAm5480Figures } from './legacy-2010-spring-am-54-80-figures';

export const spring2010AmFigures: readonly BookletFigureDefinition[] = [
  spring2010CommonFigure,
  ...legacy2010SpringAm0126Figures,
  ...legacy2010SpringAm2753Figures,
  ...legacy2010SpringAm5480Figures,
];
