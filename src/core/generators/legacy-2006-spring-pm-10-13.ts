import { q10 } from './legacy-2006-spring-pm-10';
import { q11 } from './legacy-2006-spring-pm-11';
import { q12 } from './legacy-2006-spring-pm-12';
import { q13 } from './legacy-2006-spring-pm-13';

export const spring2006PmLanguageDrafts = [
  { number: 10, ...q10 },
  { number: 11, ...q11 },
  { number: 12, ...q12 },
  { number: 13, ...q13 },
];
export const legacy2006SpringPm10To13Definitions = spring2006PmLanguageDrafts.map(row => row.definition);
