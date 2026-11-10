import { q9 } from './legacy-2012-autumn-pm-9';
import { q10 } from './legacy-2012-autumn-pm-10';
import { q11 } from './legacy-2012-autumn-pm-11';
import { q12 } from './legacy-2012-autumn-pm-12';
import { q13 } from './legacy-2012-autumn-pm-13';

export { autumn2012PmJavaReferenceTitle } from './legacy-2012-autumn-pm-11';
export const autumn2012PmLanguageDrafts = [q9, q10, q11, q12, q13];
export const legacy2012AutumnPm09To13Definitions = autumn2012PmLanguageDrafts.map(draft => draft.definition);
