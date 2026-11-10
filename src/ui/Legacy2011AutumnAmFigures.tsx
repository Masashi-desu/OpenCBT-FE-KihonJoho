import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2011CommonFigure } from '../core/generators/legacy-2011-autumn-am-common';
import { Legacy2011AutumnAmCommonGates } from './Legacy2011AutumnAmCommonGates';
import { legacy2011AutumnAm0126FigureRenderers } from './Legacy2011AutumnAm0126Figures';
import { legacy2011AutumnAm2753FigureRenderers } from './Legacy2011AutumnAm2753Figures';
import { legacy2011AutumnAm5480FigureRenderers } from './Legacy2011AutumnAm5480Figures';

export const autumn2011AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: autumn2011CommonFigure.profile, component: Legacy2011AutumnAmCommonGates },
  ...legacy2011AutumnAm0126FigureRenderers,
  ...legacy2011AutumnAm2753FigureRenderers,
  ...legacy2011AutumnAm5480FigureRenderers,
];
