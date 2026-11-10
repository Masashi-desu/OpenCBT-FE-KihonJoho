import type { BookletFigureRendererExtension } from './booklet-figure-renderer-contract';
import { spring2012AmFigureRenderers } from './Legacy2012SpringAmFigures';
import { legacy2012AutumnPmFigureRenderers } from './Legacy2012AutumnPmFigures';
import { autumn2012AmFigureRenderers } from './Legacy2012AutumnAmFigures';
import { spring2013AmFigureRenderers } from './Legacy2013SpringAmFigures';
import { legacy2013SpringPmFigureRenderers } from './Legacy2013SpringPmFigures';
import { legacy2013AutumnPmFigureRenderers } from './Legacy2013AutumnPmFigures';
import { autumn2013AmFigureRenderers } from './Legacy2013AutumnAmFigures';
import { legacy2014SpringPmFigureRenderers } from './Legacy2014SpringPmFigures';
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
  { scope: '2014-spring-pm', renderers: legacy2014SpringPmFigureRenderers },
  { scope: '2013-autumn-am', renderers: autumn2013AmFigureRenderers },
  { scope: '2013-autumn-pm', renderers: legacy2013AutumnPmFigureRenderers },
  { scope: '2013-spring-am', renderers: spring2013AmFigureRenderers },
  { scope: '2013-spring-pm', renderers: legacy2013SpringPmFigureRenderers },
  { scope: '2012-autumn-am', renderers: autumn2012AmFigureRenderers },
  { scope: '2012-autumn-pm', renderers: legacy2012AutumnPmFigureRenderers },
  { scope: '2012-spring-am', renderers: spring2012AmFigureRenderers },
];
