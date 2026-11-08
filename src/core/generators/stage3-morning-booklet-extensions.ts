import type { MorningBookletExtension } from './stage3-morning-booklet-extension-contract';
import { spring2015MorningBooklet } from './legacy-2015-spring-am';
import { autumn2014MorningBooklet } from './legacy-2014-autumn-am';

// Append-only declarations. A registration does not grant catalog admission.
export const morningBookletExtensions: readonly MorningBookletExtension[] = [
  { scope: '2015-spring-am', booklet: spring2015MorningBooklet },
  { scope: '2014-autumn-am', booklet: autumn2014MorningBooklet },
];
