import { legacy2004AutumnAm2753FigureRenderers } from './Legacy2004AutumnAm2753Figures';
import { legacy2004AutumnAm0126FigureRenderers } from './Legacy2004AutumnAm0126Figures';
import { legacy2004AutumnAm5480FigureRenderers } from './Legacy2004AutumnAm5480Figures';

export const autumn2004AmFigureRenderers = [
  ...legacy2004AutumnAm0126FigureRenderers,
  ...legacy2004AutumnAm2753FigureRenderers,
  ...legacy2004AutumnAm5480FigureRenderers,
];
