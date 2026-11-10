import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2013CommonFigure } from './legacy-2013-autumn-am-common';
import { legacy2013AutumnAm0126Figures } from './legacy-2013-autumn-am-01-26-figures';
import { legacy2013AutumnAm2753Figures } from './legacy-2013-autumn-am-27-53-figures';
import { legacy2013AutumnAm5480Figures } from './legacy-2013-autumn-am-54-80-figures';

export const autumn2013AmFigures: readonly BookletFigureDefinition[] = [
  autumn2013CommonFigure,
  ...legacy2013AutumnAm0126Figures,
  ...legacy2013AutumnAm2753Figures,
  ...legacy2013AutumnAm5480Figures,
];
