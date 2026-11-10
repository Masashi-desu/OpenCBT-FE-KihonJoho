import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { spring2012CommonFigure } from '../core/generators/legacy-2012-spring-am-common';
import { Legacy2012SpringAmCommonRules } from './Legacy2012SpringAmCommonRules';
import { legacy2012SpringAm0126FigureRenderers } from './Legacy2012SpringAm0126Figures';
import { legacy2012SpringAm2753FigureRenderers } from './Legacy2012SpringAm2753Figures';
import { legacy2012SpringAm5480FigureRenderers } from './Legacy2012SpringAm5480Figures';

export const spring2012AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: spring2012CommonFigure.profile, component: Legacy2012SpringAmCommonRules },
  ...legacy2012SpringAm0126FigureRenderers,
  ...legacy2012SpringAm2753FigureRenderers,
  ...legacy2012SpringAm5480FigureRenderers,
];
