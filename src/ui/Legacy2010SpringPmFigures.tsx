import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2010SpringPm0104FigureRenderers } from './Legacy2010SpringPm0104Figures';
import { legacy2010SpringPm0508FigureRenderers } from './Legacy2010SpringPm0508Figures';
import { legacy2010SpringPm0913FigureRenderers } from './Legacy2010SpringPm0913Figures';

export const legacy2010SpringPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2010SpringPm0104FigureRenderers,
  ...legacy2010SpringPm0508FigureRenderers,
  ...legacy2010SpringPm0913FigureRenderers,
];
