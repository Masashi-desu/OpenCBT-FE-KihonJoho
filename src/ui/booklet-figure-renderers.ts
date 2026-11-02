import type { BookletFigureRendererExtension } from './booklet-figure-renderer-contract';
import { legacy2016AutumnPmFigureRenderers } from './Legacy2016AutumnPmFigures';

// Statically imported application components only; problem data supplies no code.
export const bookletFigureRenderers: readonly BookletFigureRendererExtension[] = [{scope:'2016-autumn-pm',renderers:legacy2016AutumnPmFigureRenderers}];
