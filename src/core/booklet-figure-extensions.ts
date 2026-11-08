import type { BookletFigureExtension } from './booklet-figure-extension-contract';
import { legacy2016AutumnPmFigures } from './generators/legacy-2016-autumn-pm-figures';
import { legacy2016SpringPmFigures } from './generators/legacy-2016-spring-pm-figures';
import { legacy2015AutumnAmFigures } from './generators/legacy-2015-autumn-am-figures';
import { legacy2015AutumnPmFigures } from './generators/legacy-2015-autumn-pm-figures';
import { spring2015AmFigures } from './generators/legacy-2015-spring-am-figures';
import { legacy2015SpringPmFigures } from './generators/legacy-2015-spring-pm-figures';
import { autumn2014AmFigures } from './generators/legacy-2014-autumn-am-figures';

// Only source-owned figure declarations belong here. Validation stays shared.
export const bookletFigureExtensions: readonly BookletFigureExtension[] = [
  { scope: '2016-autumn-pm', figures: legacy2016AutumnPmFigures },
  { scope: '2016-spring-pm', figures: legacy2016SpringPmFigures },
  { scope: '2015-autumn-am', figures: legacy2015AutumnAmFigures },
  { scope: '2015-autumn-pm', figures: legacy2015AutumnPmFigures },
  { scope: '2015-spring-am', figures: spring2015AmFigures },
  { scope: '2015-spring-pm', figures: legacy2015SpringPmFigures },
  { scope: '2014-autumn-am', figures: autumn2014AmFigures },
];
