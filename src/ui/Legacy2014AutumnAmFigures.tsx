import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2014CommonFigure } from '../core/generators/legacy-2014-autumn-am-common';
import { Legacy2014AutumnAmCommonGates } from './Legacy2014AutumnAmCommonGates';
import { legacy2014AutumnAm0126Renderers } from './Legacy2014AutumnAm0126Figures';
import { legacy2014AutumnAm27To53Renderers } from './Legacy2014AutumnAm2753Figures';
import { legacy2014AutumnAm5480Renderers } from './Legacy2014AutumnAm5480Figures';

export const autumn2014AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: autumn2014CommonFigure.profile, component: ({ caption }) => <Legacy2014AutumnAmCommonGates caption={caption} /> },
  ...legacy2014AutumnAm0126Renderers,
  ...legacy2014AutumnAm27To53Renderers,
  ...legacy2014AutumnAm5480Renderers,
];
