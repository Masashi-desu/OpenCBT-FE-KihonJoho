import { calculations2006AutumnAm0126 } from './legacy-2006-autumn-am-01-26-calculations';
import { knowledge2006AutumnAm0126 } from './legacy-2006-autumn-am-01-26-knowledge';

export const legacy2006AutumnAm01To26Definitions = [
  ...calculations2006AutumnAm0126, ...knowledge2006AutumnAm0126,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
