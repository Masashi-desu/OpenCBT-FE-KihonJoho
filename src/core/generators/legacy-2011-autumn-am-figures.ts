import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2011CommonFigure } from './legacy-2011-autumn-am-common';
import { legacy2011AutumnAm0126Figures } from './legacy-2011-autumn-am-01-26-figures';
import { legacy2011AutumnAm2753Figures } from './legacy-2011-autumn-am-27-53-figures';
import { legacy2011AutumnAm5480Figures } from './legacy-2011-autumn-am-54-80-figures';

export const autumn2011AmFigures: readonly BookletFigureDefinition[] = [
  autumn2011CommonFigure,
  ...legacy2011AutumnAm0126Figures,
  ...legacy2011AutumnAm2753Figures,
  ...legacy2011AutumnAm5480Figures,
];
