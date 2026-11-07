import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2015CommonFigure } from './legacy-2015-spring-am-common';
import { legacy2015SpringAm0126Figures } from './legacy-2015-spring-am-01-26-figures';
import { legacy2015SpringAm2753Figures } from './legacy-2015-spring-am-27-53-figures';
import { legacy2015SpringAm5480Figures } from './legacy-2015-spring-am-54-80-figures';

export const spring2015AmFigures: readonly BookletFigureDefinition[] = [
  spring2015CommonFigure, ...legacy2015SpringAm0126Figures, ...legacy2015SpringAm2753Figures, ...legacy2015SpringAm5480Figures,
];
