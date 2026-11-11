import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2010CommonFigure } from './legacy-2010-autumn-am-common';
import { legacy2010AutumnAm0126Figures } from './legacy-2010-autumn-am-01-26-figures';
import { legacy2010AutumnAm2753Figures } from './legacy-2010-autumn-am-27-53-figures';
import { legacy2010AutumnAm5480Figures } from './legacy-2010-autumn-am-54-80-figures';

export const autumn2010AmFigures: readonly BookletFigureDefinition[] = [
  autumn2010CommonFigure,
  ...legacy2010AutumnAm0126Figures,
  ...legacy2010AutumnAm2753Figures,
  ...legacy2010AutumnAm5480Figures,
];
