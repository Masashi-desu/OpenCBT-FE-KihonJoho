import { legacy2005SpringPm0105FigureRenderers } from './Legacy2005SpringPm0105Figures';
import { legacy2005SpringPm0609FigureRenderers } from './Legacy2005SpringPm0609Figures';
import { legacy2005SpringPm1013FigureRenderers } from './Legacy2005SpringPm1013Figures';

export const spring2005PmFigureRenderers = [
  ...legacy2005SpringPm0105FigureRenderers,
  ...legacy2005SpringPm0609FigureRenderers,
  ...legacy2005SpringPm1013FigureRenderers,
];
