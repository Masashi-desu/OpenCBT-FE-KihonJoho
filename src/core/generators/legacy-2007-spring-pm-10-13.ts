import { q11 } from './legacy-2007-spring-pm-11';
import { q12 } from './legacy-2007-spring-pm-12';
import { q13 } from './legacy-2007-spring-pm-13';

export const spring2007PmLanguageDrafts = [
  { number: 11, ...q11 },
  { number: 12, ...q12 },
  { number: 13, ...q13 },
];

export const legacy2007SpringPm10To13Definitions = spring2007PmLanguageDrafts.map(row => row.definition);
