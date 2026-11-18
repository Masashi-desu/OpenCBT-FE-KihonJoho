import { legacy2005SpringAm2753FigureRenderers } from './Legacy2005SpringAm2753Figures';
import { legacy2005SpringAm0126FigureRenderers } from './Legacy2005SpringAm0126Figures';
import { legacy2005SpringAm5480FigureRenderers } from './Legacy2005SpringAm5480Figures';

export const spring2005AmFigureRenderers = [
  ...legacy2005SpringAm0126FigureRenderers,
  ...legacy2005SpringAm2753FigureRenderers,
  ...legacy2005SpringAm5480FigureRenderers,
];
