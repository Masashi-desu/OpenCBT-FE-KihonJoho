import { legacy2004SpringAm2753FigureRenderers } from './Legacy2004SpringAm2753Figures';
import { legacy2004SpringAm0126FigureRenderers } from './Legacy2004SpringAm0126Figures';
import { legacy2004SpringAm5480FigureRenderers } from './Legacy2004SpringAm5480Figures';

export const spring2004AmFigureRenderers = [
  ...legacy2004SpringAm0126FigureRenderers,
  ...legacy2004SpringAm2753FigureRenderers,
  ...legacy2004SpringAm5480FigureRenderers,
];
