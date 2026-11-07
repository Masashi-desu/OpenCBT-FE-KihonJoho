import type { BookletFigureRendererExtension } from './booklet-figure-renderer-contract';
import { legacy2016AutumnPmFigureRenderers } from './Legacy2016AutumnPmFigures';
import { legacy2016SpringPmFigureRenderers } from './Legacy2016SpringPmFigures';
import { legacy2015AutumnAmFigureRenderers } from './Legacy2015AutumnAmFigures';
import { legacy2015AutumnPmFigureRenderers } from './Legacy2015AutumnPmFigures';

// Statically imported application components only; problem data supplies no code.
export const bookletFigureRenderers: readonly BookletFigureRendererExtension[] = [
  { scope: '2016-autumn-pm', renderers: legacy2016AutumnPmFigureRenderers },
  { scope: '2016-spring-pm', renderers: legacy2016SpringPmFigureRenderers },
  { scope: '2015-autumn-am', renderers: legacy2015AutumnAmFigureRenderers },
  { scope: '2015-autumn-pm', renderers: legacy2015AutumnPmFigureRenderers },
];
