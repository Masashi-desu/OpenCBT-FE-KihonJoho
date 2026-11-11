import { q9 } from './legacy-2011-special-pm-9';
import { q10 } from './legacy-2011-special-pm-10';
import { q11 } from './legacy-2011-special-pm-11';
import { q12 } from './legacy-2011-special-pm-12';
import { q13 } from './legacy-2011-special-pm-13';

export const special2011PmLanguageDrafts = [q9, q10, q11, q12, q13];
export const legacy2011SpecialPm09To13Definitions = special2011PmLanguageDrafts.map(draft => draft.definition);
