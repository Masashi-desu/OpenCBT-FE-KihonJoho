import { q11Bill, q11Table, q11Formats, q11Change } from './legacy-2006-autumn-pm-11';
import { q12Output, q12Changes } from './legacy-2006-autumn-pm-12';
import { q13Replacement, q13Rotation } from './legacy-2006-autumn-pm-13';

export const legacy2006AutumnPm1013Figures = [
  q11Bill,q11Table,...q11Formats,q11Change,q12Output,q12Changes,q13Replacement,q13Rotation,
] as const;
