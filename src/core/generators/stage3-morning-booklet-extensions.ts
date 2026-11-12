import type { MorningBookletExtension } from './stage3-morning-booklet-extension-contract';
import { autumn2011MorningBooklet } from './legacy-2011-autumn-am';
import { spring2012MorningBooklet } from './legacy-2012-spring-am';
import { autumn2012MorningBooklet } from './legacy-2012-autumn-am';
import { spring2013MorningBooklet } from './legacy-2013-spring-am';
import { autumn2013MorningBooklet } from './legacy-2013-autumn-am';
import { spring2014MorningBooklet } from './legacy-2014-spring-am';
import { spring2015MorningBooklet } from './legacy-2015-spring-am';
import { autumn2014MorningBooklet } from './legacy-2014-autumn-am';
import { special2011MorningBooklet } from './legacy-2011-special-am';
import { autumn2010MorningBooklet } from './legacy-2010-autumn-am';
import { spring2010MorningBooklet } from './legacy-2010-spring-am';
import { autumn2009MorningBooklet } from './legacy-2009-autumn-am';

// Append-only declarations. A registration does not grant catalog admission.
import { spring2009MorningBooklet } from './legacy-2009-spring-am';

import { autumn2008MorningBooklet } from './legacy-2008-autumn-am';

export const morningBookletExtensions: readonly MorningBookletExtension[] = [
  { scope: '2015-spring-am', booklet: spring2015MorningBooklet },
  { scope: '2014-autumn-am', booklet: autumn2014MorningBooklet },
  { scope: '2014-spring-am', booklet: spring2014MorningBooklet },
  { scope: '2013-autumn-am', booklet: autumn2013MorningBooklet },
  { scope: '2013-spring-am', booklet: spring2013MorningBooklet },
  { scope: '2012-autumn-am', booklet: autumn2012MorningBooklet },
  { scope: '2012-spring-am', booklet: spring2012MorningBooklet },
  { scope: '2011-autumn-am', booklet: autumn2011MorningBooklet },
  { scope: '2011-special-am', booklet: special2011MorningBooklet },
  { scope: '2010-autumn-am', booklet: autumn2010MorningBooklet },
  { scope: '2010-spring-am', booklet: spring2010MorningBooklet },
  { scope: '2009-autumn-am', booklet: autumn2009MorningBooklet },
  { scope: '2009-spring-am', booklet: spring2009MorningBooklet },
  { scope: '2008-autumn-am', booklet: autumn2008MorningBooklet },
];
