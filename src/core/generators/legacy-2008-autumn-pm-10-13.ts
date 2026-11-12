import { q10 } from './legacy-2008-autumn-pm-10';
import { q11 } from './legacy-2008-autumn-pm-11';
import { q12 } from './legacy-2008-autumn-pm-12';
import { q13 } from './legacy-2008-autumn-pm-13';

export const autumn2008PmLanguageDrafts = [q10, q11, q12, q13];
export const legacy2008AutumnPm10To13Definitions = autumn2008PmLanguageDrafts.map(draft => draft.definition);
