import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { spring2015CommonFigure } from '../core/generators/legacy-2015-spring-am-common';
import { LegacyCommonGateTable } from './Legacy2017AutumnAmCommonRules';
import { legacy2015SpringAm0126Renderers } from './Legacy2015SpringAm0126Figures';
import { legacy2015SpringAm2753Renderers } from './Legacy2015SpringAm2753Figures';
import { legacy2015SpringAm5480Renderers } from './Legacy2015SpringAm5480Figures';

export const spring2015AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: spring2015CommonFigure.profile, component: ({ caption }) => <LegacyCommonGateTable collection="2015h27h-fe-am" caption={caption} /> },
  ...legacy2015SpringAm0126Renderers, ...legacy2015SpringAm2753Renderers, ...legacy2015SpringAm5480Renderers,
];
