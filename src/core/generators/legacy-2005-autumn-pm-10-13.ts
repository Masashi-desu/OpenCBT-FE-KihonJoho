import { q11 } from './legacy-2005-autumn-pm-11';
import { q12 } from './legacy-2005-autumn-pm-12';
import { q13 } from './legacy-2005-autumn-pm-13';

export const autumn2005PmLanguageDrafts = [
  { number: 11, ...q11 },
  { number: 12, ...q12 },
  { number: 13, ...q13 },
];
export const legacy2005AutumnPm10To13Definitions = autumn2005PmLanguageDrafts.map(row => row.definition);
