import { q9 } from './legacy-2012-spring-pm-9';
import { q10 } from './legacy-2012-spring-pm-10';
import { q11 } from './legacy-2012-spring-pm-11';
import { q12 } from './legacy-2012-spring-pm-12';
import { q13 } from './legacy-2012-spring-pm-13';

export { spring2012PmJavaReferenceTitle } from './legacy-2012-spring-pm-11';
export { spring2012PmDigitReferenceTitle } from './legacy-2012-spring-pm-12';
export const spring2012PmLanguageDrafts = [q9, q10, q11, q12, q13];
export const legacy2012SpringPm09To13Definitions = spring2012PmLanguageDrafts.map(draft => draft.definition);
