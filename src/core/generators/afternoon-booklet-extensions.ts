import type { AfternoonBookletExtension } from './afternoon-booklet-extension-contract';
import { legacy2010SpringAfternoonDefinitions } from './legacy-2010-spring-afternoon';
import { legacy2010AutumnAfternoonDefinitions } from './legacy-2010-autumn-afternoon';
import { legacy2011SpecialAfternoonDefinitions } from './legacy-2011-special-afternoon';
import { legacy2011AutumnAfternoonDefinitions } from './legacy-2011-autumn-afternoon';
import { legacy2012SpringAfternoonDefinitions } from './legacy-2012-spring-afternoon';
import { legacy2012AutumnAfternoonDefinitions } from './legacy-2012-autumn-afternoon';
import { legacy2013SpringAfternoonDefinitions } from './legacy-2013-spring-afternoon';
import { legacy2013AutumnAfternoonDefinitions } from './legacy-2013-autumn-afternoon';
import { legacy2014SpringAfternoonDefinitions } from './legacy-2014-spring-afternoon';
import { legacy2016AutumnAfternoonDefinitions } from './legacy-2016-autumn-afternoon';
import { legacy2016SpringAfternoonDefinitions } from './legacy-2016-spring-afternoon';
import { legacy2015AutumnAfternoonDefinitions } from './legacy-2015-autumn-afternoon';
import { legacy2015SpringAfternoonDefinitions } from './legacy-2015-spring-afternoon';
import { legacy2014AutumnAfternoonDefinitions } from './legacy-2014-autumn-afternoon';
import { legacy2009AutumnAfternoonDefinitions } from './legacy-2009-autumn-afternoon';
import { legacy2009SpringAfternoonDefinitions } from './legacy-2009-spring-afternoon';

import { legacy2008AutumnAfternoonDefinitions } from './legacy-2008-autumn-afternoon';
import { legacy2008SpringAfternoonDefinitions } from './legacy-2008-spring-afternoon';

// Append-only, source-owned declarations. Shared binding and validation live in
// the contract; this file cannot supply executable hooks or replace old entries.
export const bookletExtensions: readonly AfternoonBookletExtension[] = [
  { scope: '2016-autumn-pm', definitions: legacy2016AutumnAfternoonDefinitions },
  { scope: '2016-spring-pm', definitions: legacy2016SpringAfternoonDefinitions },
  { scope: '2015-autumn-pm', definitions: legacy2015AutumnAfternoonDefinitions },
  { scope: '2015-spring-pm', definitions: legacy2015SpringAfternoonDefinitions },
  { scope: '2014-autumn-pm', definitions: legacy2014AutumnAfternoonDefinitions },
  { scope: '2014-spring-pm', definitions: legacy2014SpringAfternoonDefinitions },
  { scope: '2013-autumn-pm', definitions: legacy2013AutumnAfternoonDefinitions },
  { scope: '2013-spring-pm', definitions: legacy2013SpringAfternoonDefinitions },
  { scope: '2012-autumn-pm', definitions: legacy2012AutumnAfternoonDefinitions },
  { scope: '2012-spring-pm', definitions: legacy2012SpringAfternoonDefinitions },
  { scope: '2011-autumn-pm', definitions: legacy2011AutumnAfternoonDefinitions },
  { scope: '2011-special-pm', definitions: legacy2011SpecialAfternoonDefinitions },
  { scope: '2010-autumn-pm', definitions: legacy2010AutumnAfternoonDefinitions },
  { scope: '2010-spring-pm', definitions: legacy2010SpringAfternoonDefinitions },
  { scope: '2009-autumn-pm', definitions: legacy2009AutumnAfternoonDefinitions },
  { scope: '2009-spring-pm', definitions: legacy2009SpringAfternoonDefinitions },
  { scope: '2008-autumn-pm', definitions: legacy2008AutumnAfternoonDefinitions },
  { scope: '2008-spring-pm', definitions: legacy2008SpringAfternoonDefinitions },
];
