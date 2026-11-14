import { calculations2007AutumnAm0126 } from './legacy-2007-autumn-am-01-26-calculations';
import { knowledge2007AutumnAm0126 } from './legacy-2007-autumn-am-01-26-knowledge';

export const legacy2007AutumnAm01To26Definitions = [
  ...calculations2007AutumnAm0126, ...knowledge2007AutumnAm0126,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
