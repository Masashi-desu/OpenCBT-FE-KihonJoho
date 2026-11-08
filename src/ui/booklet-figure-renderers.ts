import type { BookletFigureRendererExtension } from './booklet-figure-renderer-contract';
import { spring2014AmFigureRenderers } from './Legacy2014SpringAmFigures';
import { legacy2016AutumnPmFigureRenderers } from './Legacy2016AutumnPmFigures';
import { legacy2016SpringPmFigureRenderers } from './Legacy2016SpringPmFigures';
import { legacy2015AutumnAmFigureRenderers } from './Legacy2015AutumnAmFigures';
import { legacy2015AutumnPmFigureRenderers } from './Legacy2015AutumnPmFigures';
import { spring2015AmFigureRenderers } from './Legacy2015SpringAmFigures';
import { legacy2015SpringPmFigureRenderers } from './Legacy2015SpringPmFigures';
import { autumn2014AmFigureRenderers } from './Legacy2014AutumnAmFigures';
import { legacy2014AutumnPmFigureRenderers } from './Legacy2014AutumnPmFigures';

// Statically imported application components only; problem data supplies no code.
export const bookletFigureRenderers: readonly BookletFigureRendererExtension[] = [
  { scope: '2016-autumn-pm', renderers: legacy2016AutumnPmFigureRenderers },
  { scope: '2016-spring-pm', renderers: legacy2016SpringPmFigureRenderers },
  { scope: '2015-autumn-am', renderers: legacy2015AutumnAmFigureRenderers },
  { scope: '2015-autumn-pm', renderers: legacy2015AutumnPmFigureRenderers },
  { scope: '2015-spring-am', renderers: spring2015AmFigureRenderers },
  { scope: '2015-spring-pm', renderers: legacy2015SpringPmFigureRenderers },
  { scope: '2014-autumn-am', renderers: autumn2014AmFigureRenderers },
  { scope: '2014-autumn-pm', renderers: legacy2014AutumnPmFigureRenderers },
  { scope: '2014-spring-am', renderers: spring2014AmFigureRenderers },
];
