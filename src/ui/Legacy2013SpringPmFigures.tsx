import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2013SpringPm0104FigureRenderers } from './Legacy2013SpringPm0104Figures';
import { legacy2013SpringPm0508FigureRenderers } from './Legacy2013SpringPm0508Figures';
import { legacy2013SpringPm0913FigureRenderers } from './Legacy2013SpringPm0913Figures';

export const legacy2013SpringPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2013SpringPm0104FigureRenderers,
  ...legacy2013SpringPm0508FigureRenderers,
  ...legacy2013SpringPm0913FigureRenderers,
];
