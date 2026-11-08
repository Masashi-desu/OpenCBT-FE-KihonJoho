import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2014CommonFigure } from './legacy-2014-autumn-am-common';
import { legacy2014AutumnAm0126Figures } from './legacy-2014-autumn-am-01-26-figures';
import { legacy2014AutumnAm27To53Figures } from './legacy-2014-autumn-am-27-53-figures';
import { legacy2014AutumnAm5480Figures } from './legacy-2014-autumn-am-54-80-figures';

export const autumn2014AmFigures: readonly BookletFigureDefinition[] = [
  autumn2014CommonFigure,
  ...legacy2014AutumnAm0126Figures,
  ...legacy2014AutumnAm27To53Figures,
  ...legacy2014AutumnAm5480Figures,
];
