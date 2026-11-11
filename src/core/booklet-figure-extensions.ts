import type { BookletFigureExtension } from './booklet-figure-extension-contract';
import { legacy2011SpecialPmFigures } from './generators/legacy-2011-special-pm-figures';
import { legacy2011AutumnPmFigures } from './generators/legacy-2011-autumn-pm-figures';
import { autumn2011AmFigures } from './generators/legacy-2011-autumn-am-figures';
import { legacy2012SpringPmFigures } from './generators/legacy-2012-spring-pm-figures';
import { spring2012AmFigures } from './generators/legacy-2012-spring-am-figures';
import { legacy2012AutumnPmFigures } from './generators/legacy-2012-autumn-pm-figures';
import { autumn2012AmFigures } from './generators/legacy-2012-autumn-am-figures';
import { spring2013AmFigures } from './generators/legacy-2013-spring-am-figures';
import { legacy2013SpringPmFigures } from './generators/legacy-2013-spring-pm-figures';
import { legacy2013AutumnPmFigures } from './generators/legacy-2013-autumn-pm-figures';
import { autumn2013AmFigures } from './generators/legacy-2013-autumn-am-figures';
import { legacy2014SpringPmFigures } from './generators/legacy-2014-spring-pm-figures';
import { spring2014AmFigures } from './generators/legacy-2014-spring-am-figures';
import { legacy2016AutumnPmFigures } from './generators/legacy-2016-autumn-pm-figures';
import { legacy2016SpringPmFigures } from './generators/legacy-2016-spring-pm-figures';
import { legacy2015AutumnAmFigures } from './generators/legacy-2015-autumn-am-figures';
import { legacy2015AutumnPmFigures } from './generators/legacy-2015-autumn-pm-figures';
import { spring2015AmFigures } from './generators/legacy-2015-spring-am-figures';
import { legacy2015SpringPmFigures } from './generators/legacy-2015-spring-pm-figures';
import { autumn2014AmFigures } from './generators/legacy-2014-autumn-am-figures';
import { legacy2014AutumnPmFigures } from './generators/legacy-2014-autumn-pm-figures';
import { special2011AmFigures } from './generators/legacy-2011-special-am-figures';
import { autumn2010AmFigures } from './generators/legacy-2010-autumn-am-figures';

// Only source-owned figure declarations belong here. Validation stays shared.
export const bookletFigureExtensions: readonly BookletFigureExtension[] = [
  { scope: '2016-autumn-pm', figures: legacy2016AutumnPmFigures },
  { scope: '2016-spring-pm', figures: legacy2016SpringPmFigures },
  { scope: '2015-autumn-am', figures: legacy2015AutumnAmFigures },
  { scope: '2015-autumn-pm', figures: legacy2015AutumnPmFigures },
  { scope: '2015-spring-am', figures: spring2015AmFigures },
  { scope: '2015-spring-pm', figures: legacy2015SpringPmFigures },
  { scope: '2014-autumn-am', figures: autumn2014AmFigures },
  { scope: '2014-autumn-pm', figures: legacy2014AutumnPmFigures },
  { scope: '2014-spring-am', figures: spring2014AmFigures },
  { scope: '2014-spring-pm', figures: legacy2014SpringPmFigures },
  { scope: '2013-autumn-am', figures: autumn2013AmFigures },
  { scope: '2013-autumn-pm', figures: legacy2013AutumnPmFigures },
  { scope: '2013-spring-am', figures: spring2013AmFigures },
  { scope: '2013-spring-pm', figures: legacy2013SpringPmFigures },
  { scope: '2012-autumn-am', figures: autumn2012AmFigures },
  { scope: '2012-autumn-pm', figures: legacy2012AutumnPmFigures },
  { scope: '2012-spring-am', figures: spring2012AmFigures },
  { scope: '2012-spring-pm', figures: legacy2012SpringPmFigures },
  { scope: '2011-autumn-am', figures: autumn2011AmFigures },
  { scope: '2011-autumn-pm', figures: legacy2011AutumnPmFigures },
  { scope: '2011-special-am', figures: special2011AmFigures },
  { scope: '2011-special-pm', figures: legacy2011SpecialPmFigures },
  { scope: '2010-autumn-am', figures: autumn2010AmFigures },
];
