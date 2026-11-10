import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2012SpringPm0104FigureRenderers } from './Legacy2012SpringPm0104Figures';
import { legacy2012SpringPm0508FigureRenderers } from './Legacy2012SpringPm0508Figures';
import { legacy2012SpringPm0913FigureRenderers } from './Legacy2012SpringPm0913Figures';

export const legacy2012SpringPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2012SpringPm0104FigureRenderers,
  ...legacy2012SpringPm0508FigureRenderers,
  ...legacy2012SpringPm0913FigureRenderers,
];
