import { q11 } from './legacy-2004-autumn-pm-11';
import { q13 } from './legacy-2004-autumn-pm-13';

export const autumn2004PmLanguageDrafts = [
  { number: 11, ...q11 },
  { number: 13, ...q13 },
];
export const legacy2004AutumnPm10To13Definitions = autumn2004PmLanguageDrafts.map(row => row.definition);
