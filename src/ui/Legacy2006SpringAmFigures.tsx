import { legacy2006SpringAm2753FigureRenderers } from './Legacy2006SpringAm2753Figures';
import { legacy2006SpringAm0126FigureRenderers } from './Legacy2006SpringAm0126Figures';
import { legacy2006SpringAm5480FigureRenderers } from './Legacy2006SpringAm5480Figures';

export const spring2006AmFigureRenderers = [
  ...legacy2006SpringAm0126FigureRenderers,
  ...legacy2006SpringAm2753FigureRenderers,
  ...legacy2006SpringAm5480FigureRenderers,
];
