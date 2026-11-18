import { legacy2005AutumnAm2753FigureRenderers } from './Legacy2005AutumnAm2753Figures';
import { legacy2005AutumnAm0126FigureRenderers } from './Legacy2005AutumnAm0126Figures';
import { legacy2005AutumnAm5480FigureRenderers } from './Legacy2005AutumnAm5480Figures';

export const autumn2005AmFigureRenderers = [
  ...legacy2005AutumnAm0126FigureRenderers,
  ...legacy2005AutumnAm2753FigureRenderers,
  ...legacy2005AutumnAm5480FigureRenderers,
];
