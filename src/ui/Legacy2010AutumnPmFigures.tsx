import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2010AutumnPm0104FigureRenderers } from './Legacy2010AutumnPm0104Figures';
import { legacy2010AutumnPm0508FigureRenderers } from './Legacy2010AutumnPm0508Figures';
import { legacy2010AutumnPm0913FigureRenderers } from './Legacy2010AutumnPm0913Figures';

export const legacy2010AutumnPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2010AutumnPm0104FigureRenderers,
  ...legacy2010AutumnPm0508FigureRenderers,
  ...legacy2010AutumnPm0913FigureRenderers,
];
