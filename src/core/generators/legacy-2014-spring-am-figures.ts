import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2014CommonFigure } from './legacy-2014-spring-am-common';
import { legacy2014SpringAm0126Figures } from './legacy-2014-spring-am-01-26-figures';
import { legacy2014SpringAm27To53Figures } from './legacy-2014-spring-am-27-53-figures';
import { legacy2014SpringAm5480Figures } from './legacy-2014-spring-am-54-80-figures';

export const spring2014AmFigures: readonly BookletFigureDefinition[] = [
  spring2014CommonFigure,
  ...legacy2014SpringAm0126Figures,
  ...legacy2014SpringAm27To53Figures,
  ...legacy2014SpringAm5480Figures,
];
