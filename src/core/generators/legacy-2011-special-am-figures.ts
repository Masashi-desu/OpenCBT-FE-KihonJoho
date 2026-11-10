import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { special2011CommonFigure } from './legacy-2011-special-am-common';
import { legacy2011SpecialAm0126Figures } from './legacy-2011-special-am-01-26-figures';
import { legacy2011SpecialAm2753Figures } from './legacy-2011-special-am-27-53-figures';
import { legacy2011SpecialAm5480Figures } from './legacy-2011-special-am-54-80-figures';

export const special2011AmFigures: readonly BookletFigureDefinition[] = [
  special2011CommonFigure,
  ...legacy2011SpecialAm0126Figures,
  ...legacy2011SpecialAm2753Figures,
  ...legacy2011SpecialAm5480Figures,
];
