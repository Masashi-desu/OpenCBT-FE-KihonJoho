import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { legacy2011SpecialPm0104Figures } from './legacy-2011-special-pm-01-04-figures';
import { legacy2011SpecialPm0508Figures } from './legacy-2011-special-pm-05-08-figures';
import { legacy2011SpecialPm0913Figures } from './legacy-2011-special-pm-09-13-figures';

export const legacy2011SpecialPmFigures: readonly BookletFigureDefinition[] = [
  ...legacy2011SpecialPm0104Figures,
  ...legacy2011SpecialPm0508Figures,
  ...legacy2011SpecialPm0913Figures,
];
