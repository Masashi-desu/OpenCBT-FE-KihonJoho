import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2012CommonFigure } from './legacy-2012-autumn-am-common';
import { legacy2012AutumnAm0126Figures } from './legacy-2012-autumn-am-01-26-figures';
import { legacy2012AutumnAm2753Figures } from './legacy-2012-autumn-am-27-53-figures';
import { legacy2012AutumnAm5480Figures } from './legacy-2012-autumn-am-54-80-figures';

export const autumn2012AmFigures: readonly BookletFigureDefinition[] = [
  autumn2012CommonFigure,
  ...legacy2012AutumnAm0126Figures,
  ...legacy2012AutumnAm2753Figures,
  ...legacy2012AutumnAm5480Figures,
];
