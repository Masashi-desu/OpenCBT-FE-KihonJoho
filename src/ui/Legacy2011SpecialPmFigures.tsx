import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2011SpecialPm0104FigureRenderers } from './Legacy2011SpecialPm0104Figures';
import { legacy2011SpecialPm0508FigureRenderers } from './Legacy2011SpecialPm0508Figures';
import { legacy2011SpecialPm0913FigureRenderers } from './Legacy2011SpecialPm0913Figures';

export const legacy2011SpecialPmFigureRenderers: readonly BookletFigureRenderer[] = [
  ...legacy2011SpecialPm0104FigureRenderers,
  ...legacy2011SpecialPm0508FigureRenderers,
  ...legacy2011SpecialPm0913FigureRenderers,
];
