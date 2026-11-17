import { legacy2006AutumnAm2753FigureRenderers } from './Legacy2006AutumnAm2753Figures';
import { legacy2006AutumnAm0126FigureRenderers } from './Legacy2006AutumnAm0126Figures';
import { legacy2006AutumnAm5480FigureRenderers } from './Legacy2006AutumnAm5480Figures';

export const autumn2006AmFigureRenderers = [
  ...legacy2006AutumnAm0126FigureRenderers,
  ...legacy2006AutumnAm2753FigureRenderers,
  ...legacy2006AutumnAm5480FigureRenderers,
];
