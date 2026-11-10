import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { spring2013CommonFigure } from '../core/generators/legacy-2013-spring-am-common';
import { LegacyCommonGateTable } from './Legacy2017AutumnAmCommonRules';
import { legacy2013SpringAm0126FigureRenderers } from './Legacy2013SpringAm0126Figures';
import { legacy2013SpringAm2753FigureRenderers } from './Legacy2013SpringAm2753Figures';
import { legacy2013SpringAm5480FigureRenderers } from './Legacy2013SpringAm5480Figures';

export const spring2013AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: spring2013CommonFigure.profile, component: ({ caption }) => <LegacyCommonGateTable collection="2013h25h-fe-am" caption={caption} /> },
  ...legacy2013SpringAm0126FigureRenderers,
  ...legacy2013SpringAm2753FigureRenderers,
  ...legacy2013SpringAm5480FigureRenderers,
];
