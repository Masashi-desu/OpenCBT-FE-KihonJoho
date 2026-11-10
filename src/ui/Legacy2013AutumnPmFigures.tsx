import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2013AutumnPm0104FigureRenderers } from './Legacy2013AutumnPm0104Figures';
import { legacy2013AutumnPm0508FigureRenderers } from './Legacy2013AutumnPm0508Figures';
import { legacy2013AutumnPm0913FigureRenderers } from './Legacy2013AutumnPm0913Figures';

export const legacy2013AutumnPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2013AutumnPm0104FigureRenderers,
  ...legacy2013AutumnPm0508FigureRenderers,
  ...legacy2013AutumnPm0913FigureRenderers,
];
