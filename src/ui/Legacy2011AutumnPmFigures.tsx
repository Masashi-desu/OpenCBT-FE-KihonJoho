import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2011AutumnPm0104FigureRenderers } from './Legacy2011AutumnPm0104Figures';
import { legacy2011AutumnPm0508FigureRenderers } from './Legacy2011AutumnPm0508Figures';
import { legacy2011AutumnPm0913FigureRenderers } from './Legacy2011AutumnPm0913Figures';

export const legacy2011AutumnPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2011AutumnPm0104FigureRenderers,
  ...legacy2011AutumnPm0508FigureRenderers,
  ...legacy2011AutumnPm0913FigureRenderers,
];
