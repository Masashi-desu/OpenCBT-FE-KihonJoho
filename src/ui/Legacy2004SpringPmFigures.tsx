import { legacy2004SpringPm0105FigureRenderers } from './Legacy2004SpringPm0105Figures';
import { legacy2004SpringPm0609FigureRenderers } from './Legacy2004SpringPm0609Figures';
import { legacy2004SpringPm1013FigureRenderers } from './Legacy2004SpringPm1013Figures';

export const spring2004PmFigureRenderers = [
  ...legacy2004SpringPm0105FigureRenderers,
  ...legacy2004SpringPm0609FigureRenderers,
  ...legacy2004SpringPm1013FigureRenderers,
];
