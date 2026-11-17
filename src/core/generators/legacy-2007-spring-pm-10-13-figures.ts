import { q11Older, q11Entrants, q11Example, q11ChoiceFigures } from './legacy-2007-spring-pm-11';
import { q12Board, q12Output } from './legacy-2007-spring-pm-12';
import { q13Bitmap } from './legacy-2007-spring-pm-13';

export const legacy2007SpringPm1013Figures = [q11Older, q11Entrants, q11Example, ...q11ChoiceFigures, q12Board, q12Output, q13Bitmap] as const;
