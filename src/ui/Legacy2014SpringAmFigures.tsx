import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { spring2014CommonFigure } from '../core/generators/legacy-2014-spring-am-common';
import { Legacy2014SpringAmCommonGates } from './Legacy2014SpringAmCommonGates';
import { legacy2014SpringAm0126Renderers } from './Legacy2014SpringAm0126Figures';
import { legacy2014SpringAm27To53Renderers } from './Legacy2014SpringAm2753Figures';
import { legacy2014SpringAm5480Renderers } from './Legacy2014SpringAm5480Figures';

export const spring2014AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: spring2014CommonFigure.profile, component: ({ caption }) => <Legacy2014SpringAmCommonGates caption={caption} /> },
  ...legacy2014SpringAm0126Renderers,
  ...legacy2014SpringAm27To53Renderers,
  ...legacy2014SpringAm5480Renderers,
];
