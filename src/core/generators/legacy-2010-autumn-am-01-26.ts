import { calculation2010AutumnAm0126 } from './legacy-2010-autumn-am-01-26-calculation';
import { knowledge2010AutumnAm0126 } from './legacy-2010-autumn-am-01-26-knowledge';

const number = (source: string) => Number(source.slice(source.lastIndexOf('-') + 1));
export const legacy2010AutumnAm01To26Definitions = [...calculation2010AutumnAm0126, ...knowledge2010AutumnAm0126]
  .sort((a, b) => number(a.source) - number(b.source));
