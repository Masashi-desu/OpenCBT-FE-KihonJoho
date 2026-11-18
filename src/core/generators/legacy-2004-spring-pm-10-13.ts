import { q11 } from './legacy-2004-spring-pm-11';
import { q12 } from './legacy-2004-spring-pm-12';

export const spring2004PmLanguageDrafts = [
  { number: 11, ...q11 },
  { number: 12, ...q12 },
];
export const legacy2004SpringPm10To13Definitions = spring2004PmLanguageDrafts.map(row => row.definition);
