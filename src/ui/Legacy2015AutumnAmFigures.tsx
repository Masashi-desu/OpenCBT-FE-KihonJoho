import { autumn2015CommonProfile } from '../core/generators/legacy-2015-autumn-am-common';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2015AutumnAm0126FigureRenderers } from './Legacy2015AutumnAm0126Figures';
import { legacy2015AutumnAm2753FigureRenderers } from './Legacy2015AutumnAm2753Figures';
import { LegacyCommonGateTable } from './Legacy2017AutumnAmCommonRules';

export const legacy2015AutumnAmFigureRenderers: readonly BookletFigureRenderer[] = [
  {
    profile: autumn2015CommonProfile,
    component: ({ caption }) => <LegacyCommonGateTable collection="2015h27a-fe-am" caption={caption} />,
  },
  ...legacy2015AutumnAm0126FigureRenderers,
  ...legacy2015AutumnAm2753FigureRenderers,
];
