import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2013CommonFigure } from '../core/generators/legacy-2013-autumn-am-common';
import { Legacy2013AutumnAmCommonGates } from './Legacy2013AutumnAmCommonGates';
import { legacy2013AutumnAm0126FigureRenderers } from './Legacy2013AutumnAm0126Figures';
import { legacy2013AutumnAm2753FigureRenderers } from './Legacy2013AutumnAm2753Figures';
import { legacy2013AutumnAm5480FigureRenderers } from './Legacy2013AutumnAm5480Figures';

export const autumn2013AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: autumn2013CommonFigure.profile, component: ({ caption }) => <Legacy2013AutumnAmCommonGates caption={caption} /> },
  ...legacy2013AutumnAm0126FigureRenderers,
  ...legacy2013AutumnAm2753FigureRenderers,
  ...legacy2013AutumnAm5480FigureRenderers,
];
