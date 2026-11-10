import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { special2011CommonFigure } from '../core/generators/legacy-2011-special-am-common';
import { LegacyCommonGateTable } from './Legacy2017AutumnAmCommonRules';
import { legacy2011SpecialAm0126FigureRenderers } from './Legacy2011SpecialAm0126Figures';
import { legacy2011SpecialAm2753FigureRenderers } from './Legacy2011SpecialAm2753Figures';
import { legacy2011SpecialAm5480FigureRenderers } from './Legacy2011SpecialAm5480Figures';

export const special2011AmFigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: special2011CommonFigure.profile, component: ({caption}) => <LegacyCommonGateTable collection="2011h23tokubetsu-fe-am" caption={caption} /> },
  ...legacy2011SpecialAm0126FigureRenderers,
  ...legacy2011SpecialAm2753FigureRenderers,
  ...legacy2011SpecialAm5480FigureRenderers,
];
