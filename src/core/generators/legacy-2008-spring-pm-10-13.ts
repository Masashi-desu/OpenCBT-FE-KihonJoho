import { q10 } from './legacy-2008-spring-pm-10';
import { q12 } from './legacy-2008-spring-pm-12';
import { q13 } from './legacy-2008-spring-pm-13';

export const spring2008PmLanguageDrafts = [
  { number: 10, ...q10 },
  { number: 12, ...q12 },
  { number: 13, ...q13 },
];
export const legacy2008SpringPm10To13Definitions = spring2008PmLanguageDrafts.map(draft => draft.definition);
