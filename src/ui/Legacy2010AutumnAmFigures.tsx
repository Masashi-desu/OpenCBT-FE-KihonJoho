import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2010CommonFigure } from '../core/generators/legacy-2010-autumn-am-common';
import { LegacyCommonGateTable } from './Legacy2017AutumnAmCommonRules';
import { legacy2010AutumnAm0126FigureRenderers } from './Legacy2010AutumnAm0126Figures';
import { legacy2010AutumnAm2753FigureRenderers } from './Legacy2010AutumnAm2753Figures';
import { legacy2010AutumnAm5480FigureRenderers } from './Legacy2010AutumnAm5480Figures';

export const autumn2010AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: autumn2010CommonFigure.profile, component: ({caption}) => <LegacyCommonGateTable collection="2010h22a-fe-am" caption={caption} /> },
  ...legacy2010AutumnAm0126FigureRenderers,
  ...legacy2010AutumnAm2753FigureRenderers,
  ...legacy2010AutumnAm5480FigureRenderers,
];
