import { q12 } from './legacy-2005-spring-pm-12';
import { q13 } from './legacy-2005-spring-pm-13';

export const spring2005PmLanguageDrafts = [
  { number: 12, ...q12 },
  { number: 13, ...q13 },
];
export const legacy2005SpringPm10To13Definitions = spring2005PmLanguageDrafts.map(row => row.definition);
