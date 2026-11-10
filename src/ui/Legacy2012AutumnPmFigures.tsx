import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2012AutumnPm0104FigureRenderers } from './Legacy2012AutumnPm0104Figures';
import { legacy2012AutumnPm0508FigureRenderers } from './Legacy2012AutumnPm0508Figures';
import { legacy2012AutumnPm0913FigureRenderers } from './Legacy2012AutumnPm0913Figures';

export const legacy2012AutumnPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2012AutumnPm0104FigureRenderers,
  ...legacy2012AutumnPm0508FigureRenderers,
  ...legacy2012AutumnPm0913FigureRenderers,
];
