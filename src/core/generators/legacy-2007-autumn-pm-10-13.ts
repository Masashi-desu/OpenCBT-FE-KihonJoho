import { q10 } from './legacy-2007-autumn-pm-10';
import { q11 } from './legacy-2007-autumn-pm-11';
import { q12 } from './legacy-2007-autumn-pm-12';
import { q13 } from './legacy-2007-autumn-pm-13';

export const autumn2007PmLanguageDrafts = [q10, q11, q12, q13].map((draft, i) => ({ number: 10 + i, ...draft }));
export const legacy2007AutumnPm10To13Definitions = autumn2007PmLanguageDrafts.map(draft => draft.definition);
