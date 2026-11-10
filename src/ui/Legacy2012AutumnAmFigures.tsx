import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2012CommonFigure } from '../core/generators/legacy-2012-autumn-am-common';
import { LegacyCommonGateTable } from './Legacy2017AutumnAmCommonRules';
import { legacy2012AutumnAm0126FigureRenderers } from './Legacy2012AutumnAm0126Figures';
import { legacy2012AutumnAm2753FigureRenderers } from './Legacy2012AutumnAm2753Figures';
import { legacy2012AutumnAm5480FigureRenderers } from './Legacy2012AutumnAm5480Figures';

export const autumn2012AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: autumn2012CommonFigure.profile, component: ({ caption }) => <LegacyCommonGateTable collection="2012h24a-fe-am" caption={caption} /> },
  ...legacy2012AutumnAm0126FigureRenderers,
  ...legacy2012AutumnAm2753FigureRenderers,
  ...legacy2012AutumnAm5480FigureRenderers,
];
