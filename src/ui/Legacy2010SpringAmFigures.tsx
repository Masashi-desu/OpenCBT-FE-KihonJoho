import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { spring2010CommonFigure } from '../core/generators/legacy-2010-spring-am-common';
import { Legacy2012SpringAmCommonRules } from './Legacy2012SpringAmCommonRules';
import { legacy2010SpringAm0126FigureRenderers } from './Legacy2010SpringAm0126Figures';
import { legacy2010SpringAm2753FigureRenderers } from './Legacy2010SpringAm2753Figures';
import { legacy2010SpringAm5480FigureRenderers } from './Legacy2010SpringAm5480Figures';

export const spring2010AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: spring2010CommonFigure.profile, component: ({caption,values}) => <Legacy2012SpringAmCommonRules collection="2010h22h-fe-am" caption={caption} values={values} /> },
  ...legacy2010SpringAm0126FigureRenderers,
  ...legacy2010SpringAm2753FigureRenderers,
  ...legacy2010SpringAm5480FigureRenderers,
];
