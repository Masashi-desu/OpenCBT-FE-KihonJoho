import { calculations2007SpringAm0126 } from './legacy-2007-spring-am-01-26-calculations';
import { knowledge2007SpringAm0126 } from './legacy-2007-spring-am-01-26-knowledge';

export const legacy2007SpringAm01To26Definitions = [
  ...calculations2007SpringAm0126, ...knowledge2007SpringAm0126,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
