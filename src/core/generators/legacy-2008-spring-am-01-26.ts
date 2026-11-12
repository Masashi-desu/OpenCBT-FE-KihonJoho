import { calculations2008SpringAm0126 } from './legacy-2008-spring-am-01-26-calculations';
import { knowledge2008SpringAm0126 } from './legacy-2008-spring-am-01-26-knowledge';

export const legacy2008SpringAm01To26Definitions = [
  ...calculations2008SpringAm0126, ...knowledge2008SpringAm0126,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
