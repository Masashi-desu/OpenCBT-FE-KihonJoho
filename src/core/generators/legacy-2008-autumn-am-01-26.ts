import { calculations2008AutumnAm0126 } from './legacy-2008-autumn-am-01-26-calculations';
import { knowledge2008AutumnAm0126 } from './legacy-2008-autumn-am-01-26-knowledge';

export const legacy2008AutumnAm01To26Definitions = [
  ...calculations2008AutumnAm0126, ...knowledge2008AutumnAm0126,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
